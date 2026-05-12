// Transactional email via Resend.
// Setup: set RESEND_API_KEY in env (resend.com -> API keys). For verified
// domains also set RESEND_FROM_EMAIL=bookings@yourdomain. Without a verified
// domain, Resend only accepts `onboarding@resend.dev` as the from address.

import { Resend } from 'resend'

const DEFAULT_FROM = 'NXT.DEALS <onboarding@resend.dev>'

let cachedClient: Resend | null = null

function getResendClient(): Resend | null {
  if (cachedClient) return cachedClient
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  cachedClient = new Resend(key)
  return cachedClient
}

function getFromAddress(): string {
  return process.env.RESEND_FROM_EMAIL || DEFAULT_FROM
}

export type FlightBookingEmailInput = {
  toEmail: string
  passengerName: string
  bookingReference: string | null
  duffelOrderId: string
  totalAmount: string | null
  currency: string | null
  origin?: string
  destination?: string
  departureDate?: string
  returnDate?: string
}

export type StayBookingEmailInput = {
  toEmail: string
  guestName: string
  bookingReference: string | null
  duffelOrderId: string
  totalAmount: string | null
  currency: string | null
  accommodationName?: string
  checkInDate?: string
  checkOutDate?: string
}

function formatMoney(amount: string | null, currency: string | null): string {
  if (!amount) return ''
  if (!currency) return amount
  try {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(Number(amount))
  } catch {
    return `${currency} ${amount}`
  }
}

function htmlShell(title: string, bodyHtml: string): string {
  return `<!doctype html>
<html><head><meta charset="utf-8" /><title>${title}</title></head>
<body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#171717;background:#fafafa;padding:24px;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;border:1px solid #e5e5e5;">
    <div style="font-weight:700;font-size:18px;color:#ea580c;letter-spacing:0.04em;text-transform:uppercase;">NXT.DEALS</div>
    ${bodyHtml}
    <hr style="border:0;border-top:1px solid #e5e5e5;margin:24px 0;" />
    <p style="font-size:12px;color:#737373;">NXT.DEALS, a trading name of FXN Holdings Limited.</p>
  </div>
</body></html>`
}

export async function sendFlightBookingConfirmation(input: FlightBookingEmailInput): Promise<void> {
  const client = getResendClient()
  if (!client) {
    console.warn('Resend not configured (no RESEND_API_KEY); skipping flight booking email.')
    return
  }

  const refLine = input.bookingReference
    ? `<strong>Booking reference:</strong> ${input.bookingReference}<br />`
    : ''
  const routeLine =
    input.origin && input.destination
      ? `<strong>Route:</strong> ${input.origin} → ${input.destination}<br />`
      : ''
  const dateLine = input.departureDate
    ? `<strong>Departure:</strong> ${input.departureDate}${input.returnDate ? ` · <strong>Return:</strong> ${input.returnDate}` : ''}<br />`
    : ''
  const total = formatMoney(input.totalAmount, input.currency)

  const body = `
    <h1 style="font-size:24px;margin:16px 0 8px;">Your flight booking is confirmed</h1>
    <p style="color:#525252;margin:0 0 16px;">Hi ${input.passengerName || 'traveller'} — thanks for booking with us. Here are your details:</p>
    <div style="background:#fafafa;border-radius:8px;padding:16px;font-size:14px;line-height:1.6;">
      ${refLine}
      ${routeLine}
      ${dateLine}
      ${total ? `<strong>Total:</strong> ${total}<br />` : ''}
      <strong>Duffel order ID:</strong> <span style="font-family:monospace;font-size:12px;">${input.duffelOrderId}</span>
    </div>
    <p style="margin-top:16px;color:#525252;font-size:14px;">Your e-ticket will follow from the airline. Bring photo ID and arrive at the airport at least 2 hours before departure for international flights.</p>
  `

  try {
    await client.emails.send({
      from: getFromAddress(),
      to: input.toEmail,
      subject: input.bookingReference
        ? `Flight booking confirmed · ${input.bookingReference}`
        : 'Flight booking confirmed',
      html: htmlShell('Flight booking confirmed', body),
    })
  } catch (err) {
    console.error('Resend flight email failed:', err)
  }
}

export async function sendStayBookingConfirmation(input: StayBookingEmailInput): Promise<void> {
  const client = getResendClient()
  if (!client) {
    console.warn('Resend not configured (no RESEND_API_KEY); skipping stay booking email.')
    return
  }

  const refLine = input.bookingReference
    ? `<strong>Booking reference:</strong> ${input.bookingReference}<br />`
    : ''
  const propLine = input.accommodationName
    ? `<strong>Property:</strong> ${input.accommodationName}<br />`
    : ''
  const datesLine =
    input.checkInDate && input.checkOutDate
      ? `<strong>Check-in:</strong> ${input.checkInDate} · <strong>Check-out:</strong> ${input.checkOutDate}<br />`
      : ''
  const total = formatMoney(input.totalAmount, input.currency)

  const body = `
    <h1 style="font-size:24px;margin:16px 0 8px;">Your stay is booked</h1>
    <p style="color:#525252;margin:0 0 16px;">Hi ${input.guestName || 'traveller'} — your stay is confirmed. Here are the details:</p>
    <div style="background:#fafafa;border-radius:8px;padding:16px;font-size:14px;line-height:1.6;">
      ${refLine}
      ${propLine}
      ${datesLine}
      ${total ? `<strong>Total:</strong> ${total}<br />` : ''}
      <strong>Duffel order ID:</strong> <span style="font-family:monospace;font-size:12px;">${input.duffelOrderId}</span>
    </div>
    <p style="margin-top:16px;color:#525252;font-size:14px;">Bring photo ID at check-in. The property may pre-authorise a card on file for incidentals.</p>
  `

  try {
    await client.emails.send({
      from: getFromAddress(),
      to: input.toEmail,
      subject: input.bookingReference
        ? `Stay booked · ${input.bookingReference}`
        : 'Stay booked',
      html: htmlShell('Stay booked', body),
    })
  } catch (err) {
    console.error('Resend stay email failed:', err)
  }
}
