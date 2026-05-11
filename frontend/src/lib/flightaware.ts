// FlightAware AeroAPI client. Server-side only — the FLIGHTAWARE_API_KEY
// env var is never exposed to the browser.
//
// AeroAPI is metered per request (~$0.002–0.01 each, varies by endpoint).
// Every helper below uses Next.js fetch caching so the same query within
// the revalidate window does NOT re-bill. Keep `revalidate` generous
// (≥ 1 hour) for anything called from a public page.

const AEROAPI_BASE = 'https://aeroapi.flightaware.com/aeroapi'

function getApiKey(): string {
  const key = process.env.FLIGHTAWARE_API_KEY
  if (!key) {
    throw new Error('Missing FLIGHTAWARE_API_KEY in environment configuration.')
  }
  return key
}

type FetchOpts = {
  /** Seconds to cache the response. Defaults to 1 hour. */
  revalidate?: number
}

async function aeroApi<T>(path: string, opts: FetchOpts = {}): Promise<T> {
  const revalidate = opts.revalidate ?? 3600
  const r = await fetch(`${AEROAPI_BASE}${path}`, {
    headers: {
      'x-apikey': getApiKey(),
      Accept: 'application/json',
    },
    next: { revalidate, tags: ['flightaware'] },
  })
  if (!r.ok) {
    const text = await r.text().catch(() => '')
    throw new Error(`AeroAPI ${path} failed: ${r.status} ${text.slice(0, 200)}`)
  }
  return (await r.json()) as T
}

// --- Airline reference data ----------------------------------------------

export type FlightAwareAirline = {
  id: string // ICAO code
  name: string
  shortname?: string
  callsign?: string
  country?: string
  location?: string
  phone?: string
  url?: string
  iata?: string
  wiki_url?: string
}

/**
 * Fetch reference data for an airline by IATA or ICAO code. Cached for 24h
 * (this rarely changes).
 *
 * AeroAPI cost: 1 call per cache window. Cheap.
 */
export async function getAirline(code: string): Promise<FlightAwareAirline> {
  return aeroApi<FlightAwareAirline>(`/airlines/${encodeURIComponent(code.toUpperCase())}`, {
    revalidate: 86_400,
  })
}

// --- Airline flights (live + recent operations) --------------------------

export type AeroFlight = {
  ident?: string
  ident_iata?: string
  ident_icao?: string
  fa_flight_id?: string
  operator?: string
  operator_iata?: string
  scheduled_off?: string | null // ISO timestamp
  scheduled_on?: string | null
  estimated_off?: string | null
  estimated_on?: string | null
  actual_off?: string | null
  actual_on?: string | null
  origin?: { code?: string; code_iata?: string; name?: string; city?: string }
  destination?: { code?: string; code_iata?: string; name?: string; city?: string }
  status?: string
  aircraft_type?: string
}

export type AirlineFlightsResponse = {
  flights?: AeroFlight[]
  num_pages?: number
  links?: { next?: string }
}

/**
 * Recent flights operated by an airline. Heavy endpoint — cache aggressively.
 *
 * AeroAPI cost: 1 call per cache window, returns up to 15 flights by default.
 */
export async function getRecentAirlineFlights(
  code: string,
  opts: { limit?: number } = {},
): Promise<AirlineFlightsResponse> {
  const params = new URLSearchParams()
  if (opts.limit) params.set('max_pages', '1')
  const qs = params.toString()
  return aeroApi<AirlineFlightsResponse>(
    `/operators/${encodeURIComponent(code.toUpperCase())}/flights${qs ? `?${qs}` : ''}`,
    { revalidate: 3600 },
  )
}
