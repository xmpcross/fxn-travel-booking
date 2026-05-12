import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Lookup a booking by reference + email. The email check is what stops
// anyone from enumerating bookings by guessing references — both must
// match. We compare email case-insensitively against either the lead
// passenger row (flights) or the booking metadata's stored email
// (stays).
export async function POST(request: NextRequest) {
  let body: { reference?: string; email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const reference = (body.reference ?? "").trim().toUpperCase();
  const email = (body.email ?? "").trim().toLowerCase();
  if (!reference || !email) {
    return NextResponse.json(
      { error: "Both booking reference and email are required." },
      { status: 400 },
    );
  }

  // Pull all candidate bookings (multiple bookings can share a reference
  // across providers/airlines), then match the email in-memory. We don't
  // case-insensitive-query in SQL because the email is in two places
  // (passenger row and metadata JSON).
  const candidates = await prisma.booking.findMany({
    where: { bookingReference: reference },
    include: { passengers: { take: 5 } },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const matched = candidates.find((b) => {
    const passengerEmails = b.passengers.map((p) =>
      (p.email ?? "").toLowerCase(),
    );
    const metaEmail =
      (b.metadata && typeof b.metadata === "object" && "email" in b.metadata
        ? String((b.metadata as { email?: string }).email ?? "")
        : ""
      ).toLowerCase();
    return passengerEmails.includes(email) || metaEmail === email;
  });

  if (!matched) {
    // Deliberately vague — don't reveal whether the reference exists.
    return NextResponse.json(
      { error: "No booking found matching that reference + email." },
      { status: 404 },
    );
  }

  return NextResponse.json({
    booking: {
      id: matched.id,
      type: matched.type,
      status: matched.status,
      reference: matched.bookingReference,
      duffelOrderId: matched.duffelOrderId,
      totalAmount: matched.totalAmount ? String(matched.totalAmount) : null,
      currency: matched.currency,
      bookedAt: matched.bookedAt,
      passengers: matched.passengers.map((p) => ({
        givenName: p.givenName,
        familyName: p.familyName,
        type: p.type,
        email: p.email,
      })),
    },
  });
}
