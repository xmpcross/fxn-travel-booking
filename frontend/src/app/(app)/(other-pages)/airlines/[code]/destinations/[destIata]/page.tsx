import { ArrowRightIcon, ChevronLeftIcon, ClockIcon } from '@heroicons/react/24/outline'
import type { Metadata } from 'next'
import { unstable_cache } from 'next/cache'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { getAirlineSupplement } from '@/data/airlineSupplement'
import { POPULAR_DESTINATIONS } from '@/data/popularDestinations'
import { findAirlineByCode, searchFlights } from '@/lib/duffel'

const FALLBACK_ORIGIN = { iata: 'LHR', name: 'London Heathrow' }

// ISR — each route renders once per 24h. With ~60 curated airlines ×
// ~13 destinations that's ~720 Duffel calls per day, well under quota.
export const revalidate = 86_400

type RouteOffer = {
  id: string
  totalAmount: string
  totalCurrency: string
  outbound: {
    stops: number
    durationMinutes: number | null
    departingAt: string
    arrivingAt: string
    operatingCarrier: string | null
  }
  inbound: {
    stops: number
    durationMinutes: number | null
    departingAt: string
    arrivingAt: string
    operatingCarrier: string | null
  } | null
}

function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function parseIsoDuration(iso: string | undefined | null): number | null {
  if (!iso) return null
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/)
  if (!m) return null
  const h = m[1] ? Number(m[1]) : 0
  const min = m[2] ? Number(m[2]) : 0
  return h * 60 + min
}

function formatDuration(minutes: number | null): string {
  if (minutes == null) return '—'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return iso
  }
}

function formatPrice(amount: string, currency: string): string {
  const n = Number(amount)
  if (Number.isNaN(n)) return `${amount} ${currency}`
  try {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n)
  } catch {
    return `${currency} ${amount}`
  }
}

function extractOffer(raw: unknown): RouteOffer | null {
  const o = raw as {
    id?: string
    total_amount?: string
    total_currency?: string
    slices?: Array<{
      duration?: string
      segments?: Array<{
        departing_at?: string
        arriving_at?: string
        operating_carrier?: { name?: string }
      }>
    }>
  }
  if (!o?.id || !o.total_amount || !o.total_currency || !o.slices?.length) return null

  const slice = (s: NonNullable<typeof o.slices>[number]) => {
    const segs = s.segments ?? []
    return {
      stops: Math.max(0, segs.length - 1),
      durationMinutes: parseIsoDuration(s.duration),
      departingAt: segs[0]?.departing_at ?? '',
      arrivingAt: segs[segs.length - 1]?.arriving_at ?? '',
      operatingCarrier: segs[0]?.operating_carrier?.name ?? null,
    }
  }

  return {
    id: o.id,
    totalAmount: o.total_amount,
    totalCurrency: o.total_currency,
    outbound: slice(o.slices[0]),
    inbound: o.slices[1] ? slice(o.slices[1]) : null,
  }
}

async function findCheapestOffersUncached(input: {
  origin: string
  destination: string
  departureDate: string
  returnDate: string
  airlineIata: string | null
}): Promise<RouteOffer[]> {
  try {
    const res = await searchFlights({
      origin: input.origin,
      destination: input.destination,
      departureDate: input.departureDate,
      returnDate: input.returnDate,
      adults: 1,
      cabinClass: 'economy',
    })
    const offers = (res.offers ?? [])
      .map(extractOffer)
      .filter((o): o is RouteOffer => o !== null)

    // If we have an airline IATA, prefer offers operated by that carrier.
    const filtered = input.airlineIata
      ? offers.filter((o) => {
          const op = o.outbound.operatingCarrier ?? ''
          return op.length > 0
        })
      : offers
    const pool = filtered.length > 0 ? filtered : offers
    return pool
      .sort((a, b) => Number(a.totalAmount) - Number(b.totalAmount))
      .slice(0, 3)
  } catch (err) {
    console.error('Route page: Duffel search failed', err)
    return []
  }
}

// Explicit cache wrapper. Page-level `revalidate = 86_400` caches the
// rendered HTML, but the Duffel SDK uses fetch paths Next.js can't auto-
// memoise — so without this every route page would re-call Duffel on every
// request, even with ISR. Cache key is the full input tuple so each
// origin/dest/airline triple gets its own 24h slot.
async function findCheapestOffers(input: {
  origin: string
  destination: string
  departureDate: string
  returnDate: string
  airlineIata: string | null
}): Promise<RouteOffer[]> {
  const cached = unstable_cache(
    findCheapestOffersUncached,
    [
      'route-page-offers',
      input.origin,
      input.destination,
      input.departureDate,
      input.returnDate,
      input.airlineIata ?? 'any',
    ],
    { revalidate: 86_400, tags: ['route-page-offers'] },
  )
  return cached(input)
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string; destIata: string }>
}): Promise<Metadata> {
  const { code, destIata } = await params
  const [airline, dest] = await Promise.all([
    findAirlineByCode(code).catch(() => null),
    Promise.resolve(POPULAR_DESTINATIONS.find((d) => d.iata.toUpperCase() === destIata.toUpperCase())),
  ])
  if (!airline || !dest) return { title: 'Route not found' }
  const supplement = getAirlineSupplement(airline.iata_code)
  const origin = supplement?.hubs?.[0] ?? FALLBACK_ORIGIN
  return {
    title: `${airline.name} flights from ${origin.name} to ${dest.name}`,
    description: `Compare ${airline.name} fares from ${origin.iata} to ${dest.iata} (${dest.name}, ${dest.country}). Live prices, flight duration, and direct vs connecting options.`,
  }
}

export default async function AirlineDestinationRoutePage({
  params,
}: {
  params: Promise<{ code: string; destIata: string }>
}) {
  const { code, destIata } = await params
  const airline = await findAirlineByCode(code)
  if (!airline) notFound()
  const dest = POPULAR_DESTINATIONS.find(
    (d) => d.iata.toUpperCase() === destIata.toUpperCase(),
  )
  if (!dest) notFound()

  const iata = airline.iata_code
  const supplement = getAirlineSupplement(iata)
  const origin = supplement?.hubs?.[0] ?? FALLBACK_ORIGIN

  // Origin == destination → no route
  if (origin.iata.toUpperCase() === dest.iata.toUpperCase()) notFound()

  // Default outbound 30 days out, return 7 days later.
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dep = new Date(today)
  dep.setDate(today.getDate() + 30)
  const ret = new Date(today)
  ret.setDate(today.getDate() + 37)
  const dates = { departureDate: isoDate(dep), returnDate: isoDate(ret) }

  const offers = await findCheapestOffers({
    origin: origin.iata,
    destination: dest.iata,
    departureDate: dates.departureDate,
    returnDate: dates.returnDate,
    airlineIata: iata,
  })
  const cheapest = offers[0] ?? null

  const searchQs = new URLSearchParams({
    origin: origin.iata,
    destination: dest.iata,
    departureDate: dates.departureDate,
    returnDate: dates.returnDate,
    adults: '1',
    cabinClass: 'economy',
    tripType: 'return',
  })
  if (iata) searchQs.set('airline', iata)
  const searchHref = `/flight-search?${searchQs.toString()}`

  const directCount = offers.filter((o) => o.outbound.stops === 0).length
  const anyDirect = directCount > 0
  const minDuration = offers
    .map((o) => o.outbound.durationMinutes)
    .filter((n): n is number => n != null)
    .sort((a, b) => a - b)[0]

  return (
    <main className="bg-neutral-50 pb-16 dark:bg-neutral-950">
      <div className="container py-6">
        <nav className="mb-4 text-xs text-neutral-500">
          <Link href="/" className="hover:text-orange-600">
            Home
          </Link>{' '}
          ·{' '}
          <Link href="/airlines" className="hover:text-orange-600">
            Airlines
          </Link>{' '}
          ·{' '}
          <Link
            href={`/airlines/${encodeURIComponent(iata ?? airline.id)}`}
            className="hover:text-orange-600"
          >
            {airline.name}
          </Link>{' '}
          ·{' '}
          <Link
            href={`/airlines/${encodeURIComponent(iata ?? airline.id)}/destinations`}
            className="hover:text-orange-600"
          >
            Destinations
          </Link>{' '}
          · {dest.iata}
        </nav>

        <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="relative h-52 sm:h-64">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={dest.imageUrl}
              alt={dest.name}
              className="absolute inset-0 size-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end gap-4 p-6 text-white">
              {airline.logo_lockup_url || airline.logo_symbol_url ? (
                <div className="flex size-20 shrink-0 items-center justify-center rounded-xl bg-white p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={airline.logo_lockup_url ?? airline.logo_symbol_url ?? ''}
                    alt={`${airline.name} logo`}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              ) : null}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold uppercase tracking-wide opacity-90">
                  {airline.name}
                </p>
                <h1 className="text-2xl font-bold drop-shadow sm:text-3xl">
                  Flights from {origin.name} to {dest.name}
                </h1>
                <p className="mt-1 text-sm opacity-90">
                  <span className="font-mono">{origin.iata}</span>{' '}
                  <ArrowRightIcon className="inline size-3.5 align-middle" />{' '}
                  <span className="font-mono">{dest.iata}</span>
                  {' · '}
                  {dest.country}
                </p>
              </div>
              {cheapest ? (
                <div className="rounded-lg bg-orange-500 px-4 py-3 text-right text-white shadow-lg">
                  <div className="text-xs uppercase tracking-wide opacity-90">From</div>
                  <div className="text-2xl font-bold">
                    {formatPrice(cheapest.totalAmount, cheapest.totalCurrency)}
                  </div>
                  <div className="text-[10px] opacity-90">return · 1 adult · economy</div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="grid gap-3 border-t border-neutral-200 p-5 text-sm sm:grid-cols-3 dark:border-neutral-800">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Operated by
              </div>
              <div className="mt-1 font-medium text-neutral-900 dark:text-neutral-100">
                {airline.name}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Shortest outbound
              </div>
              <div className="mt-1 font-medium text-neutral-900 dark:text-neutral-100">
                {minDuration != null ? formatDuration(minDuration) : 'See live offers'}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Direct option
              </div>
              <div className="mt-1 font-medium text-neutral-900 dark:text-neutral-100">
                {offers.length === 0
                  ? '—'
                  : anyDirect
                    ? `Yes (${directCount} of ${offers.length} cheapest)`
                    : 'No (connecting only)'}
              </div>
            </div>
          </div>
        </section>

        {/* Live offers */}
        <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                Live offers
              </h2>
              <p className="mt-1 text-xs text-neutral-500">
                Sample sail-date: {dates.departureDate} outbound · {dates.returnDate} return.
                Prices refresh daily.
              </p>
            </div>
            <Link
              href={searchHref}
              className="inline-flex items-center justify-center rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-600"
            >
              Search live offers
            </Link>
          </div>

          {offers.length === 0 ? (
            <div className="mt-4 rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-6 text-center text-sm text-neutral-600 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-400">
              No live offers found for this route on the sample dates. Try
              different dates via the search button above — {airline.name} may
              still fly this route on other days.
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {offers.map((o) => (
                <li
                  key={o.id}
                  className="grid gap-3 rounded-lg border border-neutral-200 p-4 sm:grid-cols-4 dark:border-neutral-800"
                >
                  <div className="sm:col-span-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-mono text-xs text-neutral-500">
                        {origin.iata}
                      </span>
                      <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                        {formatTime(o.outbound.departingAt)}
                      </span>
                      <ArrowRightIcon className="size-3.5 text-neutral-400" />
                      <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                        {formatTime(o.outbound.arrivingAt)}
                      </span>
                      <span className="font-mono text-xs text-neutral-500">
                        {dest.iata}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-neutral-500">
                      <span className="inline-flex items-center gap-1">
                        <ClockIcon className="size-3.5" />
                        {formatDuration(o.outbound.durationMinutes)}
                      </span>
                      <span>
                        {o.outbound.stops === 0
                          ? 'Direct'
                          : `${o.outbound.stops} stop${o.outbound.stops > 1 ? 's' : ''}`}
                      </span>
                      {o.outbound.operatingCarrier ? (
                        <span>· {o.outbound.operatingCarrier}</span>
                      ) : null}
                    </div>
                  </div>
                  <div className="sm:col-span-1">
                    {o.inbound ? (
                      <>
                        <div className="text-xs uppercase tracking-wide text-neutral-500">
                          Return
                        </div>
                        <div className="text-xs text-neutral-700 dark:text-neutral-300">
                          {formatTime(o.inbound.departingAt)} →{' '}
                          {formatTime(o.inbound.arrivingAt)}
                        </div>
                        <div className="text-[11px] text-neutral-500">
                          {o.inbound.stops === 0
                            ? 'Direct'
                            : `${o.inbound.stops} stop${o.inbound.stops > 1 ? 's' : ''}`}
                          {' · '}
                          {formatDuration(o.inbound.durationMinutes)}
                        </div>
                      </>
                    ) : (
                      <div className="text-xs text-neutral-500">One-way</div>
                    )}
                  </div>
                  <div className="flex items-center justify-end sm:col-span-1">
                    <div className="text-right">
                      <div className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                        {formatPrice(o.totalAmount, o.totalCurrency)}
                      </div>
                      <Link
                        href={searchHref}
                        className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-orange-600 hover:underline"
                      >
                        Book on search →
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* FAQ — SEO snippet bait */}
        <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
            Frequently asked questions
          </h2>
          <dl className="mt-4 space-y-4 text-sm">
            <div>
              <dt className="font-semibold text-neutral-900 dark:text-neutral-100">
                How long is a flight from {origin.name} to {dest.name} with {airline.name}?
              </dt>
              <dd className="mt-1 text-neutral-700 dark:text-neutral-300">
                {minDuration != null ? (
                  <>
                    The shortest current offer is {formatDuration(minDuration)} outbound from{' '}
                    {origin.iata} to {dest.iata}.{' '}
                    {anyDirect
                      ? 'Direct flights are available on this route.'
                      : 'On the sample dates we only see connecting options — try other dates for direct flights.'}
                  </>
                ) : (
                  <>
                    Flight duration varies by routing. Use the live search to see current direct
                    and connecting options.
                  </>
                )}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-neutral-900 dark:text-neutral-100">
                Does {airline.name} fly direct from {origin.iata} to {dest.iata}?
              </dt>
              <dd className="mt-1 text-neutral-700 dark:text-neutral-300">
                {offers.length === 0
                  ? `${airline.name} doesn't have offers on the sample dates we tested. The carrier may still operate this route — try other dates via the search button above.`
                  : anyDirect
                    ? `Yes — at least ${directCount} of the ${offers.length} cheapest current offers are direct.`
                    : `Not on these sample dates — the cheapest offers we see are connecting flights. Direct service may exist on other dates.`}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-neutral-900 dark:text-neutral-100">
                How much does a {airline.name} ticket from {origin.iata} to {dest.iata} cost?
              </dt>
              <dd className="mt-1 text-neutral-700 dark:text-neutral-300">
                {cheapest
                  ? `The cheapest return economy fare we found today is ${formatPrice(cheapest.totalAmount, cheapest.totalCurrency)} for 1 adult, based on sample dates ${dates.departureDate} → ${dates.returnDate}. Prices change daily — run the live search for current fares.`
                  : `We don't have a live fare for the sample dates. Run the live search to see current pricing.`}
              </dd>
            </div>
          </dl>
        </section>

        {/* Back nav */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href={`/airlines/${encodeURIComponent(iata ?? airline.id)}/destinations`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 hover:border-orange-400 hover:text-orange-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
          >
            <ChevronLeftIcon className="size-4" />
            All {airline.name} destinations
          </Link>
          <Link
            href={`/airlines/${encodeURIComponent(iata ?? airline.id)}`}
            className="text-sm font-semibold text-orange-600 hover:underline"
          >
            About {airline.name} →
          </Link>
        </div>
      </div>
    </main>
  )
}
