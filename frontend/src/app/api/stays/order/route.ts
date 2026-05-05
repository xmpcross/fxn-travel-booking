import { Prisma } from "../../../../../generated/prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { createStayBooking, type StayBookingGuest } from "@/lib/duffel";
import { prisma } from "@/lib/prisma";

type CreateStayOrderBody = {
  quoteId?: string;
  guests?: StayBookingGuest[];
  email?: string;
  phoneNumber?: string;
  cardId?: string;
  specialRequests?: string;
  loyaltyAccountNumber?: string;
  idempotencyKey?: string;
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message;

  if (error && typeof error === "object") {
    const candidate = error as {
      errors?: Array<{ message?: string; title?: string; code?: string }>;
      meta?: { message?: string };
      response?: { data?: { errors?: Array<{ message?: string; title?: string; code?: string }> } };
    };

    const nestedErrors = candidate.errors ?? candidate.response?.data?.errors ?? [];

    if (nestedErrors.length > 0) {
      return nestedErrors
        .map((item) => item.message ?? item.title ?? item.code)
        .filter(Boolean)
        .join(", ");
    }

    if (candidate.meta?.message) return candidate.meta.message;
  }

  return "Unable to create stay booking";
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateStayOrderBody;

    if (!body.quoteId || typeof body.quoteId !== "string") {
      return NextResponse.json(
        { error: "Booking payload must include a quoteId from /api/stays/quote." },
        { status: 400 }
      );
    }

    if (!Array.isArray(body.guests) || body.guests.length === 0) {
      return NextResponse.json(
        { error: "Booking payload must include at least one guest." },
        { status: 400 }
      );
    }

    const missingGuestField = body.guests.find(
      (g) => !g?.given_name?.trim() || !g?.family_name?.trim()
    );
    if (missingGuestField) {
      return NextResponse.json(
        { error: "Each guest needs a given_name and family_name." },
        { status: 400 }
      );
    }

    if (!body.email?.trim() || !body.phoneNumber?.trim()) {
      return NextResponse.json(
        { error: "Booking payload must include email and phoneNumber." },
        { status: 400 }
      );
    }

    const booking = await createStayBooking(
      {
        quote_id: body.quoteId,
        guests: body.guests,
        email: body.email,
        phone_number: body.phoneNumber,
        accommodation_special_requests: body.specialRequests,
        loyalty_programme_account_number: body.loyaltyAccountNumber,
        payment: body.cardId ? { card_id: body.cardId } : undefined
      },
      body.idempotencyKey
    );

    const bookingRecord = booking as
      | {
          id?: string;
          reference?: string;
          total_amount?: string;
          total_currency?: string;
        }
      | null;

    // Persist to our own Booking table. Failure here must NOT fail the
    // request — Duffel has already taken payment + confirmed the booking,
    // so a 500 to the user would be misleading. We log and move on; the
    // booking is recoverable via the duffelOrderId later.
    if (bookingRecord?.id) {
      try {
        await prisma.booking.create({
          data: {
            type: "stay",
            status: "confirmed",
            duffelOrderId: bookingRecord.id,
            bookingReference: bookingRecord.reference ?? null,
            currency: bookingRecord.total_currency ?? null,
            totalAmount: bookingRecord.total_amount
              ? new Prisma.Decimal(bookingRecord.total_amount)
              : null,
            providerName: "duffel",
            offerId: body.quoteId,
            bookedAt: new Date(),
            metadata: {
              guests: body.guests,
              email: body.email,
              phoneNumber: body.phoneNumber,
              specialRequests: body.specialRequests ?? null,
              duffelBooking: bookingRecord
            } as unknown as Prisma.InputJsonValue
          }
        });
      } catch (persistError) {
        console.error(
          "Stay booking succeeded at Duffel but Prisma persistence failed:",
          { duffelOrderId: bookingRecord.id, error: persistError }
        );
      }
    }

    return NextResponse.json({
      bookingId: bookingRecord?.id ?? null,
      reference: bookingRecord?.reference ?? null
    });
  } catch (error) {
    const message = getErrorMessage(error);
    console.error("Stay booking creation failed:", error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
