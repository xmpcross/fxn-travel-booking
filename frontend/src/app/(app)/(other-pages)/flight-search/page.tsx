'use client'

import {
  ChevronDownIcon,
} from '@heroicons/react/24/outline'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useMemo, useState } from 'react'
import clsx from 'clsx'

import { FlightSearchForm } from '@/components/HeroSearchForm/FlightSearchForm'
import { CHECKOUT_STORAGE_KEY } from '../checkout/flight/shared'

// --- types -----------------------------------------------------------------

type CabinClass = 'economy' | 'premium_economy' | 'business' | 'first'
const VALID_CABINS: CabinClass[] = ['economy', 'premium_economy', 'business', 'first']

type FlightOffer = {
  id: string
  total_amount?: string
  total_currency?: string
  owner?: { name?: string; iata_code?: string }
  slices?: Array<{
    duration?: string
    origin?: { iata_code?: string; city_name?: string }
    destination?: { iata_code?: string; city_name?: string }
    segments?: Array<{
      departing_at?: string
      arriving_at?: string
      duration?: string
      aircraft?: { name?: string }
      destination?: { city_name?: string; iata_code?: string }
      origin?: { city_name?: string; iata_code?: string }
      marketing_carrier?: { name?: string; logo_symbol_url?: string; iata_code?: string }
      marketing_carrier_flight_number?: string
      operating_carrier?: { name?: string; logo_symbol_url?: string; iata_code?: string }
      operating_carrier_flight_number?: string
    }>
  }>
}

type FlightSearchResponse = {
  id?: string
  clientKey?: string
  offers?: FlightOffer[]
}

type SortMode = 'best' | 'cheapest' | 'fastest'
type StopsFilter = 'any' | 'direct' | 'one_stop'
type TimeBucket = 'early' | 'morning' | 'afternoon' | 'evening'

const SORT_LABELS: Record<SortMode, string> = {
  best: 'Our picks',
  cheapest: 'Lowest price',
  fastest: 'Fastest',
}

const TIME_BUCKETS: { id: TimeBucket; label: string; range: string; from: number; to: number }[] = [
  { id: 'early', label: 'Early morning', range: '00:00–06:00', from: 0, to: 6 },
  { id: 'morning', label: 'Morning', range: '06:00–12:00', from: 6, to: 12 },
  { id: 'afternoon', label: 'Afternoon', range: '12:00–18:00', from: 12, to: 18 },
  { id: 'evening', label: 'Evening', range: '18:00–24:00', from: 18, to: 24 },
]

type NormalizedOffer = {
  id: string
  offer: FlightOffer
  amount: number
  currency: string
  airline: string
  airlineIata: string | null
  airlineLogo: string | null
  durationMinutes: number
  stops: number
  score: number
}

const STORAGE_KEY = 'selected-flight-offer'

// --- helpers ---------------------------------------------------------------

function hourFromIso(iso?: string): number {
  const m = iso?.match(/T(\d{2}):/)
  return m ? Number(m[1]) : -1
}

function inAnyBucket(hour: number, buckets: TimeBucket[]): boolean {
  if (buckets.length === 0) return true
  return buckets.some((id) => {
    const b = TIME_BUCKETS.find((tb) => tb.id === id)
    return b ? hour >= b.from && hour < b.to : false
  })
}

function parseDurationToMinutes(duration?: string) {
  if (!duration) return 0
  const hoursMatch = duration.match(/(\d+)H/)
  const minutesMatch = duration.match(/(\d+)M/)
  const hours = hoursMatch ? Number(hoursMatch[1]) : 0
  const minutes = minutesMatch ? Number(minutesMatch[1]) : 0
  return hours * 60 + minutes
}

function formatDuration(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${hours}h ${minutes}m`
}

function calculateBestScore(amount: number, durationMinutes: number, stops: number) {
  const priceScore = Math.max(0, 1000 - amount)
  const durationScore = Math.max(0, 1000 - durationMinutes)
  const stopPenalty = stops * 120
  return Math.round(priceScore * 0.55 + durationScore * 0.45 - stopPenalty)
}

function normalizeOffer(offer: FlightOffer): NormalizedOffer | null {
  const firstSlice = offer.slices?.[0]
  if (!firstSlice) return null
  const firstSegment = firstSlice.segments?.[0]
  const amount = Number(offer.total_amount ?? '0')
  const durationMinutes = parseDurationToMinutes(firstSlice.duration)
  const stops = Math.max((firstSlice.segments?.length ?? 1) - 1, 0)
  const airline =
    offer.owner?.name ??
    offer.owner?.iata_code ??
    firstSegment?.operating_carrier?.name ??
    'Airline'
  const airlineIata =
    offer.owner?.iata_code ??
    firstSegment?.marketing_carrier?.iata_code ??
    firstSegment?.operating_carrier?.iata_code ??
    null
  const airlineLogo =
    firstSegment?.marketing_carrier?.logo_symbol_url ??
    firstSegment?.operating_carrier?.logo_symbol_url ??
    null

  return {
    id: offer.id,
    offer,
    amount,
    currency: offer.total_currency ?? '',
    airline,
    airlineIata,
    airlineLogo,
    durationMinutes,
    stops,
    score: calculateBestScore(amount, durationMinutes, stops),
  }
}

// --- page ------------------------------------------------------------------

export default function FlightsPage() {
  return (
    <Suspense
      fallback={
        <main className="container py-12">
          <div className="rounded-2xl border border-neutral-200 p-8 text-sm text-neutral-500 dark:border-neutral-800">
            Loading flights…
          </div>
        </main>
      }
    >
      <FlightsContent />
    </Suspense>
  )
}

function FlightsContent() {
  const searchParams = useSearchParams()
  const params = searchParams ?? new URLSearchParams()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<FlightSearchResponse | null>(null)
  const [staleFareNotice, setStaleFareNotice] = useState<string | null>(null)

  const [sortMode, setSortMode] = useState<SortMode>('best')
  // Seed from ?airline=XX,YY in the URL so deep-links from the
  // /airlines/[code] page land already-filtered. Comparison is by IATA code,
  // case-insensitive.
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>(() => {
    const raw = (searchParams?.get('airline') ?? '').trim()
    if (!raw) return []
    return raw
      .split(',')
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean)
  })
  const [stopsFilter, setStopsFilter] = useState<StopsFilter>('any')
  const [maxPrice, setMaxPrice] = useState<number | null>(null)
  const [departBuckets, setDepartBuckets] = useState<TimeBucket[]>([])
  const [arriveBuckets, setArriveBuckets] = useState<TimeBucket[]>([])
  const [maxDurationMin, setMaxDurationMin] = useState<number | null>(null)
  const [visibleCount, setVisibleCount] = useState(10)

  // One-time pickup of any stale-fare notice surfaced from checkout.
  useEffect(() => {
    const n = sessionStorage.getItem('flight-search-error')
    if (n) {
      setStaleFareNotice('That fare or its linked extras expired. Choose a fresh flight to continue.')
      sessionStorage.removeItem('flight-search-error')
    }
  }, [])

  // Auto-fill missing origin / departureDate from geo + sensible defaults.
  useEffect(() => {
    const origin = params.get('origin')
    const departureDate = params.get('departureDate')
    if (origin && departureDate) return

    let cancelled = false
    ;(async () => {
      let nextOrigin = origin
      if (!nextOrigin) {
        try {
          const ipRes = await fetch('https://ipapi.co/json/')
          if (ipRes.ok) {
            const ipData = (await ipRes.json()) as { city?: string }
            if (ipData.city) {
              const placesRes = await fetch(
                `/api/places/suggestions?q=${encodeURIComponent(ipData.city)}`,
              )
              if (placesRes.ok) {
                const placesData = (await placesRes.json()) as {
                  data?: Array<{ iata_code: string }>
                }
                nextOrigin = placesData.data?.[0]?.iata_code ?? null
              }
            }
          }
        } catch {
          /* silent */
        }
      }

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const fmt = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

      let nextDep = departureDate
      let nextRet = params.get('returnDate')
      if (!nextDep) {
        const d = new Date(today)
        d.setDate(today.getDate() + 30)
        nextDep = fmt(d)
        if (!nextRet) {
          const r = new Date(today)
          r.setDate(today.getDate() + 37)
          nextRet = fmt(r)
        }
      }

      if (cancelled) return
      if (nextOrigin && nextDep) {
        const next = new URLSearchParams(params.toString())
        next.set('origin', nextOrigin)
        next.set('departureDate', nextDep)
        if (nextRet) next.set('returnDate', nextRet)
        router.replace(`/flights?${next.toString()}`)
      } else {
        setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [params, router])

  // Run the search once URL has all required params.
  useEffect(() => {
    if (!params.get('origin') || !params.get('departureDate')) return
    const controller = new AbortController()
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const r = await fetch('/api/flights/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            origin: params.get('origin'),
            destination: params.get('destination'),
            departureDate: params.get('departureDate'),
            returnDate: params.get('returnDate'),
            adults: Number(params.get('adults') ?? '1'),
            children: Number(params.get('children') ?? '0') || undefined,
            infants: Number(params.get('infants') ?? '0') || undefined,
            cabinClass: params.get('cabinClass') ?? 'economy',
          }),
          signal: controller.signal,
        })
        const payload = await r.json()
        if (!r.ok) throw new Error(payload.error ?? 'Flight search failed')
        setResult(payload)
      } catch (e) {
        if ((e as Error).name === 'AbortError') return
        setError(e instanceof Error ? e.message : 'Flight search failed')
      } finally {
        setLoading(false)
      }
    })()
    return () => controller.abort()
  }, [searchParams])

  // --- derived data --------------------------------------------------------

  const normalizedOffers = useMemo(
    () => (result?.offers ?? []).map(normalizeOffer).filter((o): o is NormalizedOffer => o !== null),
    [result],
  )

  // Group offers by airline IATA so each filter row has a stable id, a
  // friendly name, a logo, and a count. Sorted alphabetically by name.
  const airlineOptions = useMemo(() => {
    const byIata = new Map<
      string,
      { iata: string; name: string; logo: string | null; count: number }
    >()
    for (const o of normalizedOffers) {
      const key = (o.airlineIata ?? o.airline).toUpperCase()
      const existing = byIata.get(key)
      if (existing) {
        existing.count += 1
        if (!existing.logo && o.airlineLogo) existing.logo = o.airlineLogo
      } else {
        byIata.set(key, {
          iata: key,
          name: o.airline,
          logo: o.airlineLogo,
          count: 1,
        })
      }
    }
    return Array.from(byIata.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [normalizedOffers])

  const highestPrice = useMemo(
    () =>
      normalizedOffers.length === 0
        ? 0
        : Math.ceil(Math.max(...normalizedOffers.map((o) => o.amount))),
    [normalizedOffers],
  )
  const highestDuration = useMemo(
    () =>
      normalizedOffers.length === 0 ? 0 : Math.max(...normalizedOffers.map((o) => o.durationMinutes)),
    [normalizedOffers],
  )

  // Initialise slider maxes once results arrive.
  useEffect(() => {
    if (highestPrice > 0 && maxPrice === null) setMaxPrice(highestPrice)
  }, [highestPrice, maxPrice])
  useEffect(() => {
    if (highestDuration > 0 && maxDurationMin === null) setMaxDurationMin(highestDuration)
  }, [highestDuration, maxDurationMin])

  // Reset pagination when filters change.
  useEffect(() => {
    setVisibleCount(10)
  }, [selectedAirlines, sortMode, stopsFilter, maxPrice, departBuckets, arriveBuckets, maxDurationMin])

  const filteredOffers = useMemo(() => {
    const activeMaxPrice = maxPrice ?? highestPrice
    const activeMaxDuration = maxDurationMin ?? highestDuration

    const filtered = normalizedOffers.filter((offer) => {
      const offerKey = (offer.airlineIata ?? offer.airline).toUpperCase()
      const airlineMatch =
        selectedAirlines.length === 0 || selectedAirlines.includes(offerKey)
      const priceMatch = offer.amount <= activeMaxPrice
      const durationMatch = offer.durationMinutes <= activeMaxDuration
      const stopsMatch =
        stopsFilter === 'any' ||
        (stopsFilter === 'direct' && offer.stops === 0) ||
        (stopsFilter === 'one_stop' && offer.stops <= 1)

      const firstSlice = offer.offer.slices?.[0]
      const segs = firstSlice?.segments ?? []
      const depHour = hourFromIso(segs[0]?.departing_at)
      const arrHour = hourFromIso(segs[segs.length - 1]?.arriving_at)
      const departTimeMatch = depHour < 0 || inAnyBucket(depHour, departBuckets)
      const arriveTimeMatch = arrHour < 0 || inAnyBucket(arrHour, arriveBuckets)

      return airlineMatch && priceMatch && durationMatch && stopsMatch && departTimeMatch && arriveTimeMatch
    })

    const sorted = [...filtered]
    if (sortMode === 'cheapest') sorted.sort((a, b) => a.amount - b.amount)
    else if (sortMode === 'fastest') sorted.sort((a, b) => a.durationMinutes - b.durationMinutes)
    else sorted.sort((a, b) => b.score - a.score)
    return sorted
  }, [
    highestPrice,
    maxPrice,
    highestDuration,
    maxDurationMin,
    normalizedOffers,
    selectedAirlines,
    sortMode,
    stopsFilter,
    departBuckets,
    arriveBuckets,
  ])

  const currency = normalizedOffers[0]?.currency ?? ''
  const originLabel = params.get('origin') ?? ''
  const destinationLabel = params.get('destination') ?? ''

  function handleSelect(offer: FlightOffer) {
    const payload = {
      offer,
      offerRequestId: result?.id,
      clientKey: result?.clientKey,
      search: {
        origin: params.get('origin'),
        destination: params.get('destination'),
        departureDate: params.get('departureDate'),
        returnDate: params.get('returnDate'),
        adults: params.get('adults'),
        cabinClass: params.get('cabinClass'),
      },
    }
    sessionStorage.removeItem(CHECKOUT_STORAGE_KEY)
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    router.push('/checkout/flight/travellers')
  }

  function toggleAirline(iata: string) {
    const key = iata.toUpperCase()
    setSelectedAirlines((cur) => {
      const next = cur.includes(key) ? cur.filter((a) => a !== key) : [...cur, key]
      // Mirror selection back to the URL so refresh + share + back/forward
      // preserve the filter.
      const nextParams = new URLSearchParams(searchParams?.toString() ?? '')
      if (next.length === 0) nextParams.delete('airline')
      else nextParams.set('airline', next.join(','))
      router.replace(`/flight-search?${nextParams.toString()}`, { scroll: false })
      return next
    })
  }

  function toggleBucket(
    setter: React.Dispatch<React.SetStateAction<TimeBucket[]>>,
    id: TimeBucket,
  ) {
    setter((cur) => (cur.includes(id) ? cur.filter((b) => b !== id) : [...cur, id]))
  }

  return (
    <main className="bg-neutral-50 pb-16 dark:bg-neutral-950">
      <div className="container py-6">
        <nav className="mb-4 text-xs text-neutral-500">
          <a href="/" className="hover:text-orange-600">
            Home
          </a>{' '}
          ·{' '}
          <a href="/flights" className="hover:text-orange-600">
            Flights
          </a>
          {originLabel && destinationLabel ? (
            <>
              {' '}
              · {originLabel} → {destinationLabel}
            </>
          ) : null}
        </nav>

        {/* Embedded search form */}
        <div className="mb-6 rounded-2xl bg-white p-2 shadow-sm dark:bg-neutral-900">
          <FlightSearchForm
            openInNewTab={false}
            initial={{
              origin: params.get('origin') ?? undefined,
              destination: params.get('destination') ?? undefined,
              departureDate: params.get('departureDate') ?? undefined,
              returnDate: params.get('returnDate') ?? undefined,
              adults: Number(params.get('adults')) || 1,
              children: Number(params.get('children')) || 0,
              infants: Number(params.get('infants')) || 0,
              cabinClass: VALID_CABINS.includes(params.get('cabinClass') as CabinClass)
                ? (params.get('cabinClass') as CabinClass)
                : 'economy',
              tripType: params.get('returnDate') ? 'return' : 'oneway',
            }}
          />
        </div>

        {staleFareNotice ? (
          <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
            {staleFareNotice}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Sidebar */}
          <aside className="space-y-5">
            <SidebarSection title="Stops">
              <PillGroup
                value={stopsFilter}
                onChange={setStopsFilter}
                options={[
                  { value: 'any', label: 'Any' },
                  { value: 'direct', label: 'Direct' },
                  { value: 'one_stop', label: '1 stop' },
                ]}
              />
            </SidebarSection>

            {highestPrice > 0 ? (
              <SidebarSection title="Max price">
                <input
                  type="range"
                  min={0}
                  max={highestPrice || 1}
                  value={maxPrice ?? highestPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-orange-500"
                />
                <p className="mt-1 text-xs text-neutral-500">
                  Up to {currency} {(maxPrice ?? highestPrice).toLocaleString()}
                </p>
              </SidebarSection>
            ) : null}

            {highestDuration > 0 ? (
              <SidebarSection title="Max flight duration">
                <input
                  type="range"
                  min={Math.max(60, Math.floor(highestDuration / 4))}
                  max={highestDuration}
                  step={15}
                  value={maxDurationMin ?? highestDuration}
                  onChange={(e) => setMaxDurationMin(Number(e.target.value))}
                  className="w-full accent-orange-500"
                />
                <p className="mt-1 text-xs text-neutral-500">
                  Up to {Math.floor((maxDurationMin ?? highestDuration) / 60)}h{' '}
                  {(maxDurationMin ?? highestDuration) % 60}m
                </p>
              </SidebarSection>
            ) : null}

            <SidebarSection title="Departure time">
              {TIME_BUCKETS.map((b) => (
                <CheckboxRow
                  key={`dep-${b.id}`}
                  label={`${b.label} (${b.range})`}
                  checked={departBuckets.includes(b.id)}
                  onChange={() => toggleBucket(setDepartBuckets, b.id)}
                />
              ))}
            </SidebarSection>

            <SidebarSection title="Arrival time">
              {TIME_BUCKETS.map((b) => (
                <CheckboxRow
                  key={`arr-${b.id}`}
                  label={`${b.label} (${b.range})`}
                  checked={arriveBuckets.includes(b.id)}
                  onChange={() => toggleBucket(setArriveBuckets, b.id)}
                />
              ))}
            </SidebarSection>

            {airlineOptions.length > 0 ? (
              <SidebarSection title="Airlines">
                {selectedAirlines.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAirlines([])
                      const nextParams = new URLSearchParams(searchParams?.toString() ?? '')
                      nextParams.delete('airline')
                      router.replace(`/flight-search?${nextParams.toString()}`, { scroll: false })
                    }}
                    className="-mt-1 mb-1 text-xs font-semibold text-orange-600 hover:underline"
                  >
                    Clear ({selectedAirlines.length})
                  </button>
                ) : null}
                {airlineOptions.map((a) => (
                  <label
                    key={a.iata}
                    className="flex cursor-pointer items-center gap-2.5 py-1 text-sm text-neutral-700 dark:text-neutral-300"
                  >
                    <input
                      type="checkbox"
                      checked={selectedAirlines.includes(a.iata)}
                      onChange={() => toggleAirline(a.iata)}
                      className="size-4 rounded border-neutral-300 text-orange-500 focus:ring-orange-500 dark:border-neutral-600 dark:bg-neutral-800"
                    />
                    {a.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={a.logo}
                        alt=""
                        className="size-5 shrink-0 rounded-sm bg-white object-contain p-0.5 ring-1 ring-neutral-200 dark:ring-neutral-700"
                      />
                    ) : (
                      <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-sm bg-neutral-100 text-[10px] font-bold text-neutral-500 dark:bg-neutral-800">
                        {a.iata.slice(0, 2)}
                      </span>
                    )}
                    <span className="flex-1 truncate">{a.name}</span>
                    <span className="text-xs text-neutral-500">{a.count}</span>
                  </label>
                ))}
              </SidebarSection>
            ) : null}
          </aside>

          {/* Main */}
          <section>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                {loading
                  ? 'Searching flights…'
                  : `${filteredOffers.length.toLocaleString()} flight${
                      filteredOffers.length === 1 ? '' : 's'
                    } ${
                      originLabel && destinationLabel
                        ? `${originLabel} → ${destinationLabel}`
                        : 'found'
                    }`}
              </h1>
              <SortDropdown value={sortMode} onChange={setSortMode} />
            </div>

            <div className="mb-4 flex justify-end">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                <svg className="size-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Prices include taxes &amp; fees
              </span>
            </div>

            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
                {error}
              </div>
            ) : filteredOffers.length === 0 ? (
              <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900">
                No flights match your filters. Try widening price, stops, duration, or airline
                selection.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOffers.slice(0, visibleCount).map((item) => (
                  <FlightResultCard
                    key={item.id}
                    item={item}
                    onSelect={() => handleSelect(item.offer)}
                  />
                ))}
                {filteredOffers.length > visibleCount ? (
                  <div className="flex justify-center pt-2">
                    <button
                      type="button"
                      onClick={() => setVisibleCount((n) => n + 10)}
                      className="rounded-lg border border-neutral-300 bg-white px-5 py-2 text-sm font-semibold text-neutral-700 hover:border-orange-400 hover:text-orange-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
                    >
                      Show more flights ({filteredOffers.length - visibleCount} remaining)
                    </button>
                  </div>
                ) : null}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}

// --- subcomponents ---------------------------------------------------------

function SidebarSection({
  title,
  children,
}: {
  title?: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      {title ? (
        <h3 className="mb-3 text-sm font-bold text-neutral-900 dark:text-neutral-100">{title}</h3>
      ) : null}
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function PillGroup<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string }[]
}) {
  return (
    <div className="flex rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={clsx(
            'flex-1 rounded-md px-2 py-1.5 text-xs font-semibold transition-colors',
            o.value === value
              ? 'bg-white text-orange-600 shadow-sm dark:bg-neutral-900'
              : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

function CheckboxRow({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (c: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 py-1 text-sm text-neutral-700 dark:text-neutral-300">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 rounded border-neutral-300 text-orange-500 focus:ring-orange-500 dark:border-neutral-600 dark:bg-neutral-800"
      />
      <span>{label}</span>
    </label>
  )
}

function SortDropdown({
  value,
  onChange,
}: {
  value: SortMode
  onChange: (v: SortMode) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((x) => !x)}
        onBlur={() => setTimeout(() => setOpen(false), 100)}
        className="inline-flex w-full items-center justify-between gap-2 rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-800 hover:border-neutral-400 sm:w-72 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
      >
        <span>
          Sort by: <span className="font-semibold">{SORT_LABELS[value]}</span>
        </span>
        <ChevronDownIcon className="size-4 text-neutral-500" />
      </button>
      {open ? (
        <div className="absolute right-0 z-20 mt-1 w-full rounded-lg border border-neutral-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
          {(Object.keys(SORT_LABELS) as SortMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
                onChange(m)
                setOpen(false)
              }}
              className={clsx(
                'block w-full px-4 py-2 text-left text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800',
                m === value
                  ? 'font-semibold text-orange-600'
                  : 'text-neutral-700 dark:text-neutral-300',
              )}
            >
              {SORT_LABELS[m]}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function FlightResultCard({
  item,
  onSelect,
}: {
  item: NormalizedOffer
  onSelect: () => void
}) {
  const slices = item.offer.slices ?? []
  return (
    <article className="grid overflow-hidden rounded-[4px] border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md lg:grid-cols-[1fr_220px] dark:border-neutral-800 dark:bg-neutral-900">
      <div className="space-y-4 p-4 sm:p-5">
        {slices.map((slice, sliceIndex) => (
          <FlightLeg key={`${item.id}-${sliceIndex}`} slice={slice} />
        ))}
      </div>
      <div className="flex flex-col justify-between gap-3 border-t border-neutral-100 bg-neutral-50/50 p-4 sm:p-5 lg:border-l lg:border-t-0 dark:border-neutral-800 dark:bg-neutral-900/40">
        <div className="text-right">
          <span className="text-xs text-neutral-500">from</span>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
            {item.currency} {Math.round(item.amount).toLocaleString()}
          </div>
          <p className="text-xs text-neutral-500">per person, incl. taxes &amp; fees</p>
        </div>
        <button
          type="button"
          onClick={onSelect}
          className="inline-flex w-full items-center justify-center rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-600"
        >
          Select
        </button>
      </div>
    </article>
  )
}

function FlightLeg({
  slice,
}: {
  slice: NonNullable<FlightOffer['slices']>[number]
}) {
  const segs = slice.segments ?? []
  const firstSeg = segs[0]
  const lastSeg = segs[segs.length - 1]
  const stops = Math.max(0, segs.length - 1)
  const marketingCarrier = firstSeg?.marketing_carrier
  const operatingCarrier = firstSeg?.operating_carrier
  const carrier = marketingCarrier ?? operatingCarrier
  const showOperatedBy =
    !!operatingCarrier?.name &&
    !!marketingCarrier?.name &&
    operatingCarrier.name !== marketingCarrier.name
  const depTime = firstSeg?.departing_at?.match(/T(\d{2}:\d{2})/)?.[1] ?? ''
  const arrTime = lastSeg?.arriving_at?.match(/T(\d{2}:\d{2})/)?.[1] ?? ''
  const depDate = firstSeg?.departing_at?.match(/^(\d{4}-\d{2}-\d{2})/)?.[1]
  const arrDate = lastSeg?.arriving_at?.match(/^(\d{4}-\d{2}-\d{2})/)?.[1]
  const nextDay = depDate && arrDate ? depDate !== arrDate : false
  const sliceDur = parseDurationToMinutes(slice.duration)
  const originIata = slice.origin?.iata_code ?? firstSeg?.origin?.iata_code ?? ''
  const destinationIata = slice.destination?.iata_code ?? lastSeg?.destination?.iata_code ?? ''

  return (
    <div className="grid items-center gap-4 sm:grid-cols-[170px_1fr]">
      <div className="flex items-center gap-3">
        {carrier?.logo_symbol_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={carrier.logo_symbol_url}
            alt=""
            className="size-10 shrink-0 rounded-full bg-white object-contain p-1 ring-1 ring-neutral-200 dark:ring-neutral-700"
          />
        ) : (
          <div className="size-10 shrink-0 rounded-full bg-neutral-200 dark:bg-neutral-700" />
        )}
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            {carrier?.name ?? 'Airline'}
          </div>
          {showOperatedBy ? (
            <div className="truncate text-xs text-neutral-500">
              Operated by {operatingCarrier?.name}
            </div>
          ) : null}
        </div>
      </div>
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
        <div className="text-left">
          <strong className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
            {depTime || '--:--'}
          </strong>
          <div className="text-xs text-neutral-500">{originIata}</div>
        </div>
        <div className="flex flex-col items-center text-center">
          <span className="text-xs text-neutral-500">{formatDuration(sliceDur)}</span>
          <span className="my-1 block h-px w-full bg-neutral-300 dark:bg-neutral-700" />
          <span className="text-xs text-neutral-500">
            {stops === 0 ? 'Direct' : `${stops} stop${stops > 1 ? 's' : ''}`}
          </span>
        </div>
        <div className="text-right">
          <strong className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
            {arrTime || '--:--'}
            {nextDay ? <span className="ml-1 text-xs text-orange-500">+1</span> : null}
          </strong>
          <div className="text-xs text-neutral-500">{destinationIata}</div>
        </div>
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="grid animate-pulse overflow-hidden rounded-[4px] border border-neutral-200 bg-white shadow-sm lg:grid-cols-[1fr_220px] dark:border-neutral-800 dark:bg-neutral-900">
      <div className="space-y-3 p-5">
        <div className="h-4 w-1/3 rounded bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-4 w-2/3 rounded bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-3 w-1/2 rounded bg-neutral-200 dark:bg-neutral-800" />
      </div>
      <div className="space-y-3 border-l border-neutral-100 p-5 dark:border-neutral-800">
        <div className="h-6 w-2/3 rounded bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-8 w-full rounded bg-neutral-200 dark:bg-neutral-800" />
      </div>
    </div>
  )
}
