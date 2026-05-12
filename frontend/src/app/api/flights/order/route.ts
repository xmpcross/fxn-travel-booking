import { Prisma } from "../../../../../generated/prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { createFlightOrder, getFlightOffer } from "@/lib/duffel";
import { sendFlightBookingConfirmation } from "@/lib/email";
import { logError } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

type OrderPassenger = {
  id?: string;
  given_name?: string;
  family_name?: string;
  born_on?: string;
  email?: string;
  phone_number?: string;
  title?: string;
  gender?: string;
  type?: string;
  loyalty_programme_accounts?: Array<{
    airline_iata_code?: string;
    account_number?: string;
  }>;
  identity_documents?: Array<{
    type?: string;
    unique_identifier?: string;
    issuing_country_code?: string;
    expires_on?: string;
  }>;
};

function safeDate(s?: string | null): Date | null {
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (error && typeof error === "object") {
    const candidate = error as {
      errors?: Array<{ message?: string; title?: string; code?: string }>;
      meta?: { message?: string };
      response?: { data?: { errors?: Array<{ message?: string; title?: string; code?: string }> } };
    };

    const nestedErrors =
      candidate.errors ??
      candidate.response?.data?.errors ??
      [];

    if (nestedErrors.length > 0) {
      return nestedErrors
        .map((item) => item.message ?? item.title ?? item.code)
        .filter(Boolean)
        .join(", ");
    }

    if (candidate.meta?.message) {
      return candidate.meta.message;
    }
  }

  return "Unable to create flight order";
}

export async function POST(request: NextRequest) {
  let body: {
    selected_offers?: string[];
    passengers?: Array<{ id?: string } & Record<string, unknown>>;
    type?: string;
    [key: string]: unknown;
  } = {};
  try {
    body = (await request.json()) as typeof body;

    if (!Array.isArray(body.selected_offers) || body.selected_offers.length !== 1) {
      return NextResponse.json({ error: "Order payload must include exactly one selected offer." }, { status: 400 });
    }

    if (!Array.isArray(body.passengers) || body.passengers.length === 0) {
      return NextResponse.json({ error: "Order payload must include at least one passenger." }, { status: 400 });
    }

    let normalizedPayload = body;

    if (body.passengers.some((passenger) => !passenger.id)) {
      const offer = await getFlightOffer(body.selected_offers[0]);
      normalizedPayload = {
        ...body,
        passengers: body.passengers.map((passenger, index) => ({
          ...passenger,
          id: passenger.id ?? offer.passengers?.[index]?.id
        }))
      };
    }

    if (!normalizedPayload.passengers || normalizedPayload.passengers.some((passenger) => !passenger.id)) {
      return NextResponse.json(
        { error: "Each passenger needs a Duffel passenger id before the order can be created." },
        { status: 400 }
      );
    }

    const order = (await createFlightOrder(normalizedPayload as never)) as {
      id?: string;
      booking_reference?: string;
      total_amount?: string;
      total_currency?: string;
      passengers?: Array<{ id?: string }>;
    } | null;

    // Persist to our own Booking + BookingPassenger tables. Persistence
    // failure must NOT fail the request — Duffel has already created the
    // order and (if instant payment) charged the customer. Returning 500
    // would mislead the caller. Log and continue; the booking can be
    // reconciled from the Duffel API later.
    if (order?.id) {
      try {
        const passengersIn = (normalizedPayload.passengers ?? []) as OrderPassenger[];
        await prisma.booking.create({
          data: {
            type: "flight",
            status: "confirmed",
            duffelOrderId: order.id,
            bookingReference: order.booking_reference ?? null,
            currency: order.total_currency ?? null,
            totalAmount: order.total_amount
              ? new Prisma.Decimal(order.total_amount)
              : null,
            providerName: "duffel",
            offerId: body.selected_offers?.[0] ?? null,
            bookedAt: new Date(),
            metadata: {
              orderType: body.type ?? null,
              duffelOrder: order,
              submittedPayload: {
                selected_offers: body.selected_offers,
                passengers: passengersIn,
              },
            } as unknown as Prisma.InputJsonValue,
            passengers: {
              create: passengersIn.map((p) => ({
                duffelPassengerId: p.id ?? null,
                type: p.type ?? null,
                title: p.title ?? null,
                gender: p.gender ?? null,
                givenName: p.given_name ?? "",
                familyName: p.family_name ?? "",
                bornOn: safeDate(p.born_on),
                email: p.email ?? null,
                phoneNumber: p.phone_number ?? null,
                loyaltyAirlineCode:
                  p.loyalty_programme_accounts?.[0]?.airline_iata_code ?? null,
                loyaltyAccountNumber:
                  p.loyalty_programme_accounts?.[0]?.account_number ?? null,
                identityDocumentType:
                  p.identity_documents?.[0]?.type ?? null,
                identityDocumentNumber:
                  p.identity_documents?.[0]?.unique_identifier ?? null,
                issuingCountryCode:
                  p.identity_documents?.[0]?.issuing_country_code ?? null,
                expiresOn: safeDate(p.identity_documents?.[0]?.expires_on),
              })),
            },
          },
        });
      } catch (persistError) {
        // High-priority log line — Duffel charged the customer but our DB
        // doesn't know about it. Surfaces a reconciliation task.
        logError("flight.order.persist_failed", persistError, {
          duffelOrderId: order.id,
          bookingReference: order.booking_reference ?? null,
          totalAmount: order.total_amount ?? null,
          currency: order.total_currency ?? null,
        });
      }

      // Confirmation email — fire-and-forget. Resend may not be configured
      // (no API key) in which case email.ts logs and returns. We don't
      // await it strictly, but we do attach a .catch to swallow any
      // unhandled rejection.
      const lead = (normalizedPayload.passengers ?? [])[0] as
        | { given_name?: string; family_name?: string; email?: string }
        | undefined;
      if (lead?.email) {
        const firstSlice = (order as { slices?: Array<{ origin?: { iata_code?: string }; destination?: { iata_code?: string }; segments?: Array<{ departing_at?: string }> }> }).slices?.[0];
        const lastSlice = (order as { slices?: Array<{ segments?: Array<{ departing_at?: string }> }> }).slices?.slice(-1)[0];
        const departureDate = firstSlice?.segments?.[0]?.departing_at?.slice(0, 10);
        const returnDate =
          (order as { slices?: unknown[] }).slices && (order as { slices?: unknown[] }).slices!.length > 1
            ? lastSlice?.segments?.[0]?.departing_at?.slice(0, 10)
            : undefined;
        sendFlightBookingConfirmation({
          toEmail: lead.email,
          passengerName: `${lead.given_name ?? ""} ${lead.family_name ?? ""}`.trim(),
          bookingReference: order.booking_reference ?? null,
          duffelOrderId: order.id,
          totalAmount: order.total_amount ?? null,
          currency: order.total_currency ?? null,
          origin: firstSlice?.origin?.iata_code,
          destination: firstSlice?.destination?.iata_code,
          departureDate,
          returnDate,
        }).catch((err) =>
          console.error("Flight confirmation email failed:", err)
        );
      }
    }

    return NextResponse.json({
      orderId: order?.id ?? null,
      bookingReference: order?.booking_reference ?? null
    });
  } catch (error) {
    const message = getErrorMessage(error);
    logError("flight.order.create_failed", error, {
      orderType: body?.type ?? null,
      offerId: body?.selected_offers?.[0] ?? null,
      passengerCount: body?.passengers?.length ?? null,
    });
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
