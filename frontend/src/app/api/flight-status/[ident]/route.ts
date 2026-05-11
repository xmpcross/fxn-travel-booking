import { NextRequest, NextResponse } from 'next/server'

// Proxy to FlightAware AeroAPI so the API key (FLIGHTAWARE_API_KEY) stays on
// the server. Client component fetches this route, not aeroapi.flightaware.com
// directly. Cached via Next.js fetch revalidate for 5 minutes — live flight
// status doesn't change second-by-second, and AeroAPI is metered.

const AEROAPI_BASE = 'https://aeroapi.flightaware.com/aeroapi'

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ ident: string }> },
) {
  try {
    const { ident } = await context.params
    const key = process.env.FLIGHTAWARE_API_KEY
    if (!key) {
      return NextResponse.json(
        { error: 'FlightAware API key not configured on the server.' },
        { status: 500 },
      )
    }

    const cleaned = ident.trim().toUpperCase()
    if (!/^[A-Z0-9]{2,7}\d{1,5}$/.test(cleaned)) {
      return NextResponse.json(
        { error: 'Invalid flight number format. Try something like QF1 or BA15.' },
        { status: 400 },
      )
    }

    const r = await fetch(
      `${AEROAPI_BASE}/flights/${encodeURIComponent(cleaned)}?max_pages=1`,
      {
        headers: {
          'x-apikey': key,
          Accept: 'application/json',
        },
        next: { revalidate: 300 },
      },
    )

    if (!r.ok) {
      const body = await r.text().catch(() => '')
      return NextResponse.json(
        { error: `FlightAware returned ${r.status}`, detail: body.slice(0, 500) },
        { status: r.status },
      )
    }

    const data = await r.json()
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Flight status lookup failed.' },
      { status: 500 },
    )
  }
}
