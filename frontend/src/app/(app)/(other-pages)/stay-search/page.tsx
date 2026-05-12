'use client'

import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  HeartIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolid, StarIcon as StarSolid } from '@heroicons/react/24/solid'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useMemo, useState } from 'react'

import { AdPlaceholder } from '@/components/AdPlaceholder'
import { StaySearchForm } from '@/components/HeroSearchForm/StaySearchForm'
import { useCurrency } from '@/contexts/CurrencyContext'

// --- types -----------------------------------------------------------------

type Photo = { url?: string }

type Amenity = { description?: string; type?: string }

type Address = {
  line_one?: string
  city_name?: string
  postal_code?: string
  region?: string | null
  country_code?: string
}

type Accommodation = {
  id?: string
  name?: string
  description?: string
  rating?: number | null
  review_score?: number | null
  review_count?: number | null
  brand?: { name?: string; id?: string } | string | null
  chain?: { name?: string; id?: string } | string | null
  photos?: Photo[]
  amenities?: Amenity[]
  location?: {
    address?: Address
    city_name?: string
    country_code?: string
  }
}

type StayResult = {
  id?: string
  search_result_id?: string
  cheapest_rate_total_amount?: string
  cheapest_rate_currency?: string
  check_in_date?: string
  check_out_date?: string
  accommodation?: Accommodation
}

// --- amenity filter config -------------------------------------------------

// Human-readable labels for every Duffel amenity `type` we know about.
// Anything not in this map is ignored so we don't render raw enum strings.
const AMENITY_LABELS: Record<string, string> = {
  wifi: 'Wi-Fi',
  parking: 'Car park',
  pool: 'Swimming pool',
  gym: 'Gym / Fitness centre',
  spa: 'Spa',
  restaurant: 'Restaurant',
  business_centre: 'Business facilities',
  '24_hour_front_desk': '24-hour front desk',
  laundry: 'Laundry service',
  lounge: 'Lounge',
  room_service: 'Room service',
  concierge: 'Concierge',
  childcare_service: 'Childcare service',
  cash_machine: 'ATM / Cash machine',
  accessibility_mobility: 'Mobility accessibility',
  accessibility_hearing: 'Hearing accessibility',
  adult_only: 'Adults only',
  bar: 'Bar',
  breakfast: 'Breakfast available',
  pet_friendly: 'Pet friendly',
  airport_shuttle: 'Airport shuttle',
  air_conditioning: 'Air conditioning',
  kitchen: 'Kitchen',
  meeting_rooms: 'Meeting rooms',
  parking_free: 'Free parking',
  smoke_free: 'Smoke-free property',
}

type SortMode = 'picks' | 'cheapest' | 'rated' | 'reviewed'

const SORT_LABELS: Record<SortMode, string> = {
  picks: 'Our picks',
  cheapest: 'Lowest price',
  rated: 'Highest star rating',
  reviewed: 'Best reviewed',
}

// --- helpers ---------------------------------------------------------------

function nightsBetween(checkIn?: string | null, checkOut?: string | null): number {
  if (!checkIn || !checkOut) return 1
  const a = new Date(`${checkIn}T00:00:00Z`).getTime()
  const b = new Date(`${checkOut}T00:00:00Z`).getTime()
  if (Number.isNaN(a) || Number.isNaN(b)) return 1
  const diff = Math.round((b - a) / 86_400_000)
  return diff > 0 ? diff : 1
}

function reviewDescriptor(score?: number | null): string {
  if (score == null) return ''
  if (score >= 9) return 'Exceptional'
  if (score >= 8) return 'Excellent'
  if (score >= 7) return 'Very good'
  if (score >= 6) return 'Good'
  return 'OK'
}

function formatPrice(amount: string | number | undefined, currency?: string): string {
  if (amount == null || amount === '') return ''
  const n = typeof amount === 'string' ? Number(amount) : amount
  if (Number.isNaN(n)) return ''
  // Use plain digits — Intl with random currency codes adds clutter (e.g. "GB£").
  const rounded = n >= 100 ? Math.round(n) : Math.round(n * 100) / 100
  return `${currency ?? ''} ${rounded.toLocaleString()}`.trim()
}

function hasAmenity(acc: Accommodation | undefined, key: string): boolean {
  return (acc?.amenities ?? []).some((a) => a.type === key)
}

// --- page ------------------------------------------------------------------

export default function StaysPage() {
  return (
    <Suspense
      fallback={
        <main className="container py-12">
          <div className="rounded-2xl border border-neutral-200 p-8 text-sm text-neutral-500 dark:border-neutral-800">
            Loading stays…
          </div>
        </main>
      }
    >
      <StaysContent />
    </Suspense>
  )
}

function StaysContent() {
  const searchParams = useSearchParams()
  const params = searchParams ?? new URLSearchParams()
  const { format } = useCurrency()

  const destinationQuery = params.get('destinationQuery') ?? ''
  const checkInDate = params.get('checkInDate')
  const checkOutDate = params.get('checkOutDate')
  const rooms = Number(params.get('rooms') ?? '1')
  const guests = Number(params.get('guests') ?? '2')
  const nights = nightsBetween(checkInDate, checkOutDate)

  const [results, setResults] = useState<StayResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters (client-side)
  const [textQuery, setTextQuery] = useState('')
  const [priceRange, setPriceRange] = useState<[number, number] | null>(null)
  const [starFilter, setStarFilter] = useState<Set<number>>(new Set())
  const [amenityFilter, setAmenityFilter] = useState<Set<string>>(new Set())
  const [brandFilter, setBrandFilter] = useState<Set<string>>(new Set())
  const [minReviewScore, setMinReviewScore] = useState<number | null>(null)
  const [sortBy, setSortBy] = useState<SortMode>('picks')
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)
    ;(async () => {
      try {
        const r = await fetch('/api/stays/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            destinationQuery,
            radiusKm: Number(params.get('radiusKm') ?? '10'),
            checkInDate,
            checkOutDate,
            rooms,
            guests,
          }),
          signal: controller.signal,
        })
        const payload = (await r.json()) as { results?: StayResult[]; error?: string }
        if (!r.ok) throw new Error(payload.error ?? 'Stay search failed')
        setResults(payload.results ?? [])
      } catch (e) {
        if ((e as Error).name === 'AbortError') return
        setError(e instanceof Error ? e.message : 'Stay search failed')
      } finally {
        setLoading(false)
      }
    })()
    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  // Price bounds across results (per night)
  const { perNightMin, perNightMax, currency } = useMemo(() => {
    let lo = Number.POSITIVE_INFINITY
    let hi = 0
    let cur: string | undefined
    for (const r of results) {
      const n = Number(r.cheapest_rate_total_amount ?? 0) / nights
      if (Number.isFinite(n) && n > 0) {
        if (n < lo) lo = n
        if (n > hi) hi = n
      }
      if (!cur && r.cheapest_rate_currency) cur = r.cheapest_rate_currency
    }
    if (!Number.isFinite(lo)) lo = 0
    return {
      perNightMin: Math.floor(lo),
      perNightMax: Math.ceil(hi),
      currency: cur ?? '',
    }
  }, [results, nights])

  useEffect(() => {
    if (results.length > 0 && priceRange == null && perNightMax > 0) {
      setPriceRange([perNightMin, perNightMax])
    }
  }, [results, priceRange, perNightMin, perNightMax])

  // Histogram bins — 28 equal-width buckets across the [perNightMin, perNightMax]
  // range, so the price slider can render a tiny distribution chart above the
  // handles (matches the Expedia "Total price" filter).
  const priceBuckets = useMemo(() => {
    const COUNT = 28
    if (results.length === 0 || perNightMax <= perNightMin) return [] as number[]
    const range = perNightMax - perNightMin
    const bins = new Array(COUNT).fill(0)
    for (const r of results) {
      const perNight = Number(r.cheapest_rate_total_amount ?? 0) / nights
      if (perNight <= 0) continue
      const idx = Math.min(
        COUNT - 1,
        Math.max(0, Math.floor(((perNight - perNightMin) / range) * COUNT)),
      )
      bins[idx] += 1
    }
    return bins
  }, [results, perNightMin, perNightMax, nights])

  // Amenities actually present in the current result set with how many
  // properties offer each.
  const amenityOptions = useMemo(() => {
    const counts = new Map<string, number>()
    for (const r of results) {
      const seen = new Set<string>()
      for (const a of r.accommodation?.amenities ?? []) {
        if (a.type && AMENITY_LABELS[a.type] && !seen.has(a.type)) {
          counts.set(a.type, (counts.get(a.type) ?? 0) + 1)
          seen.add(a.type)
        }
      }
    }
    return Array.from(counts.entries())
      .map(([key, count]) => ({ key, label: AMENITY_LABELS[key], count }))
      .sort((a, b) => b.count - a.count)
  }, [results])

  // Star ratings with count + cheapest-per-night so each row carries a
  // "From" price (Expedia "Property class" filter).
  const propertyClassOptions = useMemo(() => {
    const map = new Map<number, { count: number; fromPerNight: number }>()
    for (const r of results) {
      const n = Number(r.accommodation?.rating ?? 0)
      if (n <= 0) continue
      const perNight = Number(r.cheapest_rate_total_amount ?? 0) / nights
      const cur = map.get(n)
      if (cur) {
        cur.count += 1
        if (perNight > 0 && perNight < cur.fromPerNight) cur.fromPerNight = perNight
      } else {
        map.set(n, { count: 1, fromPerNight: perNight > 0 ? perNight : Infinity })
      }
    }
    return Array.from(map.entries())
      .map(([stars, v]) => ({ stars, count: v.count, fromPerNight: v.fromPerNight }))
      .sort((a, b) => b.stars - a.stars)
  }, [results, nights])

  // Brand options — Duffel returns `accommodation.brand` as either an
  // object `{name,id}` or a bare string. Normalise to a name + count map.
  const brandOptions = useMemo(() => {
    const counts = new Map<string, number>()
    for (const r of results) {
      const b = r.accommodation?.brand
      const name = typeof b === 'string' ? b : b?.name ?? null
      if (!name) continue
      counts.set(name, (counts.get(name) ?? 0) + 1)
    }
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  }, [results])

  // Guest rating tiers with count + cheapest From — mirrors Expedia.
  const guestRatingOptions = useMemo(() => {
    const tiers = [
      { id: null as number | null, label: 'Any', threshold: 0 },
      { id: 9, label: 'Wonderful 9+', threshold: 9 },
      { id: 8, label: 'Very good 8+', threshold: 8 },
      { id: 7, label: 'Good 7+', threshold: 7 },
    ]
    return tiers.map((t) => {
      let count = 0
      let fromPerNight = Infinity
      for (const r of results) {
        const score = Number(r.accommodation?.review_score ?? 0)
        if (score >= t.threshold) {
          count += 1
          const perNight = Number(r.cheapest_rate_total_amount ?? 0) / nights
          if (perNight > 0 && perNight < fromPerNight) fromPerNight = perNight
        }
      }
      return { ...t, count, fromPerNight }
    })
  }, [results, nights])

  const cityLabel = useMemo(() => {
    if (destinationQuery) return destinationQuery
    for (const r of results) {
      const c = r.accommodation?.location?.city_name ?? r.accommodation?.location?.address?.city_name
      if (c) return c
    }
    return ''
  }, [destinationQuery, results])

  // Apply filters + sort
  const filtered = useMemo(() => {
    const q = textQuery.trim().toLowerCase()
    return results
      .filter((r) => {
        const acc = r.accommodation
        if (!acc) return false
        if (q && !(acc.name ?? '').toLowerCase().includes(q)) return false
        if (starFilter.size > 0 && !starFilter.has(Number(acc.rating ?? 0))) return false
        if (amenityFilter.size > 0) {
          for (const a of amenityFilter) if (!hasAmenity(acc, a)) return false
        }
        if (brandFilter.size > 0) {
          const b = acc.brand
          const name = typeof b === 'string' ? b : b?.name ?? null
          if (!name || !brandFilter.has(name)) return false
        }
        if (minReviewScore != null && Number(acc.review_score ?? 0) < minReviewScore) return false
        if (priceRange) {
          const perNight = Number(r.cheapest_rate_total_amount ?? 0) / nights
          if (perNight < priceRange[0] || perNight > priceRange[1]) return false
        }
        return true
      })
      .sort((a, b) => {
        const pa = Number(a.cheapest_rate_total_amount ?? 0)
        const pb = Number(b.cheapest_rate_total_amount ?? 0)
        switch (sortBy) {
          case 'cheapest':
            return pa - pb
          case 'rated':
            return Number(b.accommodation?.rating ?? 0) - Number(a.accommodation?.rating ?? 0)
          case 'reviewed':
            return Number(b.accommodation?.review_score ?? 0) - Number(a.accommodation?.review_score ?? 0)
          case 'picks':
          default: {
            // Composite: review score heavy, lightly penalise price.
            const sa =
              Number(a.accommodation?.review_score ?? 0) * 10 -
              (pa / Math.max(1, perNightMax * nights)) * 4
            const sb =
              Number(b.accommodation?.review_score ?? 0) * 10 -
              (pb / Math.max(1, perNightMax * nights)) * 4
            return sb - sa
          }
        }
      })
  }, [
    results,
    textQuery,
    starFilter,
    amenityFilter,
    brandFilter,
    minReviewScore,
    priceRange,
    sortBy,
    nights,
    perNightMax,
  ])

  function toggleFavorite(id: string) {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <main className="bg-neutral-50 pb-16 dark:bg-neutral-950">
      <div className="container py-6">
        {/* Two-row grid: row 1 has the search form spanning the left two
            columns; the ad column on the right spans both rows so it sits
            beside the search form (Expedia layout). Row 2 has filters and
            results in the same left two columns. */}
        <div className="grid gap-6 lg:grid-cols-[280px_1fr_260px]">
          <div className="lg:col-span-2">
            <StaySearchForm
              openInNewTab={false}
              variant="compact"
              initial={{
                destinationQuery: searchParams?.get('destinationQuery') ?? undefined,
                checkInDate: searchParams?.get('checkInDate') ?? undefined,
                checkOutDate: searchParams?.get('checkOutDate') ?? undefined,
                rooms: Number(searchParams?.get('rooms')) || undefined,
                guests: Number(searchParams?.get('guests')) || undefined,
              }}
            />
          </div>

          {/* Ad column — placed before the sidebar/main row so the grid
              auto-flow puts filters + results into the remaining slots on
              row 2. `row-span-2` makes the ad fill both rows on the right. */}
          <div className="lg:row-span-2">
            <AdPlaceholder />
          </div>

          {/* Sidebar filters — same layout as flight-search: "Filter by"
              heading then a stack of filter sections. */}
          <aside className="space-y-6">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
              Filter by
            </h2>

            <Link
              href={`/stay-search/map?${searchParams?.toString() ?? ''}`}
              className="block"
              aria-label="Search on map"
            >
              <MapCard />
            </Link>

            <SidebarSection title="Search by property name">
              <div className="relative">
                <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={textQuery}
                  onChange={(e) => setTextQuery(e.target.value)}
                  placeholder="e.g. Marriott"
                  className="w-full rounded-full bg-neutral-100 py-2.5 pl-9 pr-3 text-sm placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-neutral-800"
                />
              </div>
            </SidebarSection>

            {priceRange && perNightMax > perNightMin ? (
              <SidebarSection title="Total price">
                <PriceSlider
                  min={perNightMin}
                  max={perNightMax}
                  value={priceRange}
                  onChange={setPriceRange}
                  currency={currency}
                  buckets={priceBuckets}
                />
              </SidebarSection>
            ) : null}

            {propertyClassOptions.length > 0 ? (
              <SidebarSection title="Property class" rightHeader="From">
                {propertyClassOptions.map((opt) => (
                  <PricedCheckboxRow
                    key={`star-${opt.stars}`}
                    label={`Property class: ${opt.stars} (${opt.count})`}
                    checked={starFilter.has(opt.stars)}
                    onChange={() =>
                      setStarFilter((cur) => {
                        const next = new Set(cur)
                        if (next.has(opt.stars)) next.delete(opt.stars)
                        else next.add(opt.stars)
                        return next
                      })
                    }
                    price={
                      Number.isFinite(opt.fromPerNight) && opt.fromPerNight > 0
                        ? format(Math.round(opt.fromPerNight), currency)
                        : ''
                    }
                  />
                ))}
              </SidebarSection>
            ) : null}

            <SidebarSection title="Guest rating" rightHeader="From">
              {guestRatingOptions.map((opt) => (
                <label
                  key={`rating-${opt.label}`}
                  className="flex cursor-pointer items-center gap-2.5 py-1 text-sm text-neutral-700 dark:text-neutral-300"
                >
                  <input
                    type="radio"
                    name="guest-rating-filter"
                    checked={minReviewScore === opt.id}
                    onChange={() => setMinReviewScore(opt.id)}
                    className="size-4 shrink-0 border-neutral-300 text-orange-500 focus:ring-orange-500 dark:border-neutral-600"
                  />
                  <span className="flex-1 truncate">
                    {opt.label}
                    {opt.id != null ? ` (${opt.count})` : ''}
                  </span>
                  <span className="shrink-0 text-xs text-neutral-700 dark:text-neutral-300">
                    {Number.isFinite(opt.fromPerNight) && opt.fromPerNight > 0
                      ? format(Math.round(opt.fromPerNight), currency)
                      : ''}
                  </span>
                </label>
              ))}
            </SidebarSection>

            {amenityOptions.length > 0 ? (
              <SidebarSection
                title={cityLabel ? `Property amenities in ${cityLabel}` : 'Property amenities'}
              >
                {amenityOptions.map((opt) => (
                  <CheckboxRow
                    key={opt.key}
                    label={`${opt.label} (${opt.count})`}
                    checked={amenityFilter.has(opt.key)}
                    onChange={(c) => toggleAmenity(setAmenityFilter, opt.key, c)}
                  />
                ))}
              </SidebarSection>
            ) : null}

            {brandOptions.length > 0 ? (
              <SidebarSection title="Property brand">
                {brandOptions.map((opt) => (
                  <CheckboxRow
                    key={opt.name}
                    label={`${opt.name} (${opt.count})`}
                    checked={brandFilter.has(opt.name)}
                    onChange={(c) => {
                      setBrandFilter((cur) => {
                        const next = new Set(cur)
                        if (c) next.add(opt.name)
                        else next.delete(opt.name)
                        return next
                      })
                    }}
                  />
                ))}
              </SidebarSection>
            ) : null}
          </aside>

          {/* Main column */}
          <section>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                {loading
                  ? 'Searching properties…'
                  : `${filtered.length.toLocaleString()} propert${
                      filtered.length === 1 ? 'y' : 'ies'
                    }${cityLabel ? ` in ${cityLabel}` : ''}`}
              </h1>
              <SortDropdown value={sortBy} onChange={setSortBy} />
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
            ) : filtered.length === 0 ? (
              <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900">
                No properties match your filters. Try widening your budget or removing a filter.
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map((r) => (
                  <ResultCard
                    key={r.id ?? r.search_result_id}
                    result={r}
                    nights={nights}
                    favorited={favorites.has(r.search_result_id ?? r.id ?? '')}
                    onFavorite={() => toggleFavorite(r.search_result_id ?? r.id ?? '')}
                    checkInDate={checkInDate}
                    checkOutDate={checkOutDate}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}

function toggleAmenity(
  setter: React.Dispatch<React.SetStateAction<Set<string>>>,
  key: string,
  checked: boolean,
) {
  setter((prev) => {
    const next = new Set(prev)
    if (checked) next.add(key)
    else next.delete(key)
    return next
  })
}

// --- sidebar components ----------------------------------------------------

function SidebarSection({
  title,
  rightHeader,
  children,
}: {
  title?: string
  /** Right-aligned column header (e.g. "From") next to the title. */
  rightHeader?: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      {title || rightHeader ? (
        <div className="mb-3 flex items-baseline justify-between">
          {title ? (
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{title}</h3>
          ) : (
            <span />
          )}
          {rightHeader ? (
            <span className="text-xs font-medium text-neutral-500">{rightHeader}</span>
          ) : null}
        </div>
      ) : null}
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function PricedCheckboxRow({
  label,
  checked,
  onChange,
  price,
}: {
  label: string
  checked: boolean
  onChange: () => void
  price: string
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 py-1 text-sm text-neutral-700 dark:text-neutral-300">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="size-4 shrink-0 rounded border-neutral-300 text-orange-500 focus:ring-orange-500 dark:border-neutral-600 dark:bg-neutral-800"
      />
      <span className="flex-1 truncate">{label}</span>
      {price ? (
        <span className="shrink-0 text-xs text-neutral-700 dark:text-neutral-300">{price}</span>
      ) : null}
    </label>
  )
}

function MapCard() {
  return (
    <div
      className="relative flex h-32 items-center justify-center overflow-hidden rounded-2xl border border-neutral-200 text-center dark:border-neutral-800"
      style={{
        backgroundImage:
          'linear-gradient(45deg, #fff6d6 25%, transparent 25%), linear-gradient(-45deg, #fff6d6 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #fff6d6 75%), linear-gradient(-45deg, transparent 75%, #fff6d6 75%)',
        backgroundSize: '40px 40px',
        backgroundPosition: '0 0, 0 20px, 20px -20px, -20px 0px',
        backgroundColor: '#f3f4f6',
      }}
    >
      <div className="absolute inset-0 bg-neutral-50/60 dark:bg-neutral-950/60" />
      <div className="relative flex flex-col items-center gap-1.5">
        <MapPinIcon className="size-7 text-rose-500" />
        <span className="text-xs font-bold tracking-wider text-neutral-700 dark:text-neutral-200">
          SEARCH ON MAP
        </span>
      </div>
    </div>
  )
}

function CheckboxRow({
  label,
  checked,
  disabled,
  onChange,
}: {
  label: string
  checked: boolean
  disabled?: boolean
  onChange: (c: boolean) => void
}) {
  return (
    <label
      className={`flex items-center gap-2.5 py-1 text-sm ${
        disabled
          ? 'cursor-not-allowed text-neutral-400 dark:text-neutral-600'
          : 'cursor-pointer text-neutral-700 dark:text-neutral-300'
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 rounded border-neutral-300 text-orange-500 focus:ring-orange-500 disabled:opacity-50 dark:border-neutral-600 dark:bg-neutral-800"
      />
      <span>{label}</span>
    </label>
  )
}

function StarFilter({
  available,
  value,
  onChange,
}: {
  available: number[]
  value: Set<number>
  onChange: (s: Set<number>) => void
}) {
  return (
    <div className="space-y-1">
      {available.map((n) => {
        const active = value.has(n)
        return (
          <button
            key={n}
            type="button"
            onClick={() => {
              const next = new Set(value)
              if (active) next.delete(n)
              else next.add(n)
              onChange(next)
            }}
            className={`flex w-full items-center gap-2.5 rounded-lg px-1.5 py-1 text-left text-sm transition-colors ${
              active
                ? 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300'
                : 'text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800'
            }`}
          >
            <span
              className={`inline-flex size-4 items-center justify-center rounded border ${
                active
                  ? 'border-orange-500 bg-orange-500'
                  : 'border-neutral-300 dark:border-neutral-600'
              }`}
            >
              {active ? (
                <svg
                  className="size-3 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden
                >
                  <path
                    fillRule="evenodd"
                    d="M16.704 5.29a1 1 0 010 1.42l-8 8a1 1 0 01-1.42 0l-4-4a1 1 0 011.42-1.42L8 12.59l7.29-7.3a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : null}
            </span>
            <span className="flex">
              {Array.from({ length: n }).map((_, i) => (
                <StarSolid key={i} className="size-4 text-[#ffce00]" />
              ))}
            </span>
          </button>
        )
      })}
    </div>
  )
}

function GuestRatingFilter({
  value,
  onChange,
}: {
  value: number | null
  onChange: (v: number | null) => void
}) {
  const options: { label: string; min: number | null }[] = [
    { label: 'Any', min: null },
    { label: '7+ Very good', min: 7 },
    { label: '8+ Excellent', min: 8 },
    { label: '9+ Exceptional', min: 9 },
  ]
  return (
    <div className="space-y-1">
      {options.map((o) => (
        <label
          key={o.label}
          className="flex cursor-pointer items-center gap-2.5 py-1 text-sm text-neutral-700 dark:text-neutral-300"
        >
          <input
            type="radio"
            name="guest-rating"
            checked={value === o.min}
            onChange={() => onChange(o.min)}
            className="size-4 border-neutral-300 text-orange-500 focus:ring-orange-500 dark:border-neutral-600 dark:bg-neutral-800"
          />
          <span>{o.label}</span>
        </label>
      ))}
    </div>
  )
}

function PriceSlider({
  min,
  max,
  value,
  onChange,
  currency,
  buckets,
}: {
  min: number
  max: number
  value: [number, number]
  onChange: (v: [number, number]) => void
  currency: string
  /** Histogram of result counts across the [min, max] range. */
  buckets: number[]
}) {
  const [lo, hi] = value
  const range = Math.max(1, max - min)
  const loPct = ((lo - min) / range) * 100
  const hiPct = ((hi - min) / range) * 100
  const maxCount = Math.max(1, ...buckets)
  const atMax = hi >= max

  return (
    <div>
      {/* Min / Max boxes */}
      <div className="grid grid-cols-2 gap-2">
        <BudgetField label="Min" value={lo} currency={currency} suffix="" />
        <BudgetField label="Max" value={hi} currency={currency} suffix={atMax ? '+' : ''} />
      </div>

      {/* Histogram — each bucket is a vertical bar; bars whose price range
          falls inside the current [lo, hi] selection are full-blue, the rest
          are dimmed. */}
      {buckets.length > 0 ? (
        <div className="mt-4 flex h-16 items-end gap-0.5 px-0.5">
          {buckets.map((count, i) => {
            const bucketLo = min + ((max - min) * i) / buckets.length
            const bucketHi = min + ((max - min) * (i + 1)) / buckets.length
            const inRange = bucketHi >= lo && bucketLo <= hi
            const h = `${(count / maxCount) * 100}%`
            return (
              <div
                key={i}
                className={`flex-1 rounded-t-sm ${inRange ? 'bg-blue-500' : 'bg-neutral-200 dark:bg-neutral-700'}`}
                style={{ height: count === 0 ? '2px' : h }}
              />
            )
          })}
        </div>
      ) : null}

      {/* Slider track + dual handles */}
      <div className="relative h-5">
        <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-neutral-200 dark:bg-neutral-700" />
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-blue-600"
          style={{ left: `${loPct}%`, right: `${100 - hiPct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={lo}
          onChange={(e) => onChange([Math.min(Number(e.target.value), hi), hi])}
          className="pointer-events-auto absolute left-0 top-1/2 h-5 w-full -translate-y-1/2 cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:shadow"
        />
        <input
          type="range"
          min={min}
          max={max}
          value={hi}
          onChange={(e) => onChange([lo, Math.max(Number(e.target.value), lo)])}
          className="pointer-events-auto absolute left-0 top-1/2 h-5 w-full -translate-y-1/2 cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:shadow"
        />
      </div>
    </div>
  )
}

function BudgetField({
  label,
  value,
  currency,
  suffix,
}: {
  label: string
  value: number
  currency: string
  suffix?: string
}) {
  const { format } = useCurrency()
  return (
    <div className="rounded-lg border border-neutral-200 px-3 py-2 dark:border-neutral-700">
      <div className="text-xs text-neutral-500">{label}</div>
      <div className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
        {format(Math.round(value), currency)}
        {suffix}
      </div>
    </div>
  )
}

// --- sort dropdown ---------------------------------------------------------

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
              className={`block w-full px-4 py-2 text-left text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 ${
                m === value ? 'font-semibold text-orange-600' : 'text-neutral-700 dark:text-neutral-300'
              }`}
            >
              {SORT_LABELS[m]}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

// --- result card -----------------------------------------------------------

function ResultCard({
  result,
  nights,
  favorited,
  onFavorite,
  checkInDate,
  checkOutDate,
}: {
  result: StayResult
  nights: number
  favorited: boolean
  onFavorite: () => void
  checkInDate: string | null
  checkOutDate: string | null
}) {
  const { format } = useCurrency()
  const acc = result.accommodation
  const photos = (acc?.photos ?? []).filter((p): p is { url: string } => Boolean(p?.url))
  const [photoIdx, setPhotoIdx] = useState(0)
  const total = photos.length

  const srrId = result.search_result_id ?? result.id ?? ''
  const detailParams = new URLSearchParams()
  if (checkInDate) detailParams.set('checkInDate', checkInDate)
  if (checkOutDate) detailParams.set('checkOutDate', checkOutDate)
  const detailHref = `/stays/${encodeURIComponent(srrId)}${
    detailParams.toString() ? `?${detailParams.toString()}` : ''
  }`

  const stars = Number(acc?.rating ?? 0)
  const reviewScore = acc?.review_score == null ? null : Number(acc.review_score)
  const reviewCount = acc?.review_count == null ? null : Number(acc.review_count)
  const totalAmount = Number(result.cheapest_rate_total_amount ?? 0)
  const perNight = totalAmount / nights
  const currency = result.cheapest_rate_currency ?? ''

  const topAmenity = acc?.amenities?.[0]?.description

  return (
    <article className="group relative grid overflow-hidden rounded-[4px] border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md lg:grid-cols-[260px_1fr_220px] dark:border-neutral-800 dark:bg-neutral-900">
      {/* Stretched link: covers the whole card so any click outside an
          interactive button navigates to the detail page. Keeps the
          DOM valid (no buttons nested inside an <a>). */}
      <Link
        href={detailHref}
        aria-label={`View ${acc?.name ?? 'stay'} details`}
        className="absolute inset-0 z-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
      />

      {/* Photo. pointer-events-none lets clicks on the photo area pass through
          to the stretched link; the interactive buttons re-enable pointer
          events on themselves. */}
      <div className="pointer-events-none relative z-10">
        {photos[photoIdx] ? (
          <img
            src={photos[photoIdx].url}
            alt={acc?.name ?? 'Hotel photo'}
            className="pointer-events-none block h-auto w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="pointer-events-none flex aspect-[4/3] w-full items-center justify-center bg-neutral-100 text-xs text-neutral-400 dark:bg-neutral-800">
            No photo
          </div>
        )}
        <button
          type="button"
          onClick={onFavorite}
          aria-label="Save"
          className="pointer-events-auto absolute right-3 top-3 z-20 inline-flex size-8 items-center justify-center rounded-full bg-white/95 text-rose-500 shadow hover:bg-white"
        >
          {favorited ? (
            <HeartSolid className="size-5" />
          ) : (
            <HeartIcon className="size-5 text-neutral-700" />
          )}
        </button>
        {total > 1 ? (
          <>
            <button
              type="button"
              onClick={() => setPhotoIdx((i) => (i - 1 + total) % total)}
              aria-label="Previous photo"
              className="pointer-events-auto absolute left-3 top-1/2 z-20 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-neutral-700 shadow hover:bg-white"
            >
              <ChevronLeftIcon className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setPhotoIdx((i) => (i + 1) % total)}
              aria-label="Next photo"
              className="pointer-events-auto absolute right-3 top-1/2 z-20 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-neutral-700 shadow hover:bg-white"
            >
              <ChevronRightIcon className="size-4" />
            </button>
            <span className="pointer-events-none absolute bottom-3 left-3 z-20 rounded-full bg-black/65 px-2 py-0.5 text-xs font-medium text-white">
              {photoIdx + 1}/{total}
            </span>
          </>
        ) : null}
      </div>

        {/* Middle */}
        <div className="flex flex-col gap-3 p-4 sm:p-5">
          <h3 className="text-base font-semibold text-neutral-900 group-hover:text-orange-600 dark:text-neutral-100 dark:group-hover:text-orange-400">
            {acc?.name ?? 'Accommodation'}
          </h3>
          {stars > 0 ? (
            <div className="flex">
              {Array.from({ length: stars }).map((_, i) => (
                <StarSolid key={i} className="size-4 text-[#ffce00]" />
              ))}
            </div>
          ) : null}
          {topAmenity ? (
            <span className="inline-flex w-fit items-center gap-1 rounded-md bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">
              {topAmenity}
            </span>
          ) : null}
        </div>

        {/* Right column: review + price */}
        <div className="flex flex-col justify-between gap-3 border-t border-neutral-100 bg-neutral-50/50 p-4 sm:p-5 lg:border-l lg:border-t-0 dark:border-neutral-800 dark:bg-neutral-900/40">
          {reviewScore != null ? (
            <div>
              <div className="flex items-baseline justify-end gap-2">
                <span className="text-xl font-bold text-sky-600 dark:text-sky-400">
                  {reviewScore.toFixed(1)}
                </span>
                <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  {reviewDescriptor(reviewScore)}
                </span>
              </div>
              {reviewCount != null ? (
                <p className="mt-0.5 text-right text-xs text-neutral-500">
                  {reviewCount.toLocaleString()} reviews
                </p>
              ) : null}
            </div>
          ) : (
            <div />
          )}
          <div className="text-right">
            <div className="text-[1.2rem] font-bold text-neutral-900 dark:text-neutral-100">
              {format(totalAmount, currency)}
            </div>
            {nights > 1 ? (
              <p className="text-[12px] text-neutral-500">
                for {nights} night{nights === 1 ? '' : 's'}
              </p>
            ) : null}
            <div className="mt-1 flex items-baseline justify-end gap-1.5">
              <span className="text-[12px] text-neutral-900 dark:text-neutral-100">
                {format(perNight, currency)}
              </span>
              <span className="text-[12px] text-neutral-500">per night</span>
            </div>
            <p className="text-[12px] text-neutral-500">includes taxes &amp; fees</p>
          </div>
        </div>
      </article>
  )
}

function SkeletonCard() {
  return (
    <div className="grid animate-pulse overflow-hidden rounded-[4px] border border-neutral-200 bg-white shadow-sm lg:grid-cols-[260px_1fr_220px] dark:border-neutral-800 dark:bg-neutral-900">
      <div className="aspect-[4/3] bg-neutral-200 lg:aspect-auto lg:max-h-[550px] dark:bg-neutral-800" />
      <div className="space-y-3 p-5">
        <div className="h-4 w-1/2 rounded bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-3 w-1/3 rounded bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-3 w-2/3 rounded bg-neutral-200 dark:bg-neutral-800" />
      </div>
      <div className="space-y-3 border-l border-neutral-100 p-5 dark:border-neutral-800">
        <div className="h-5 w-2/3 rounded bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-8 w-3/4 rounded bg-neutral-200 dark:bg-neutral-800" />
      </div>
    </div>
  )
}
