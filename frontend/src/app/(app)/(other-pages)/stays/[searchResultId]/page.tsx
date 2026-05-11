'use client'

import { useCurrency } from '@/contexts/CurrencyContext'
import {
  BuildingOffice2Icon,
  ChevronRightIcon,
  ClockIcon,
  CreditCardIcon,
  MapPinIcon,
  Squares2X2Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolid } from '@heroicons/react/24/solid'
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useMemo, useState } from 'react'

type Photo = { url?: string }

type RateCondition = { title?: string; description?: string }

type Rate = {
  id: string
  name?: string | null
  description?: string | null
  total_amount?: string
  total_currency?: string
  base_amount?: string
  tax_amount?: string
  fee_amount?: string
  due_at_accommodation_amount?: string
  due_at_accommodation_currency?: string
  board_type?: string
  payment_type?: string
  quantity_available?: number
  cancellation_timeline?: Array<{ before?: string; refund_amount?: string; currency?: string }>
  conditions?: RateCondition[]
  available_payment_methods?: string[]
  source?: string
}

type Room = {
  name?: string
  beds?: Array<{ type?: string; count?: number }>
  photos?: Photo[]
  rates?: Rate[]
}

type Accommodation = {
  name?: string
  description?: string
  rating?: number | string | null
  review_score?: number | string | null
  review_count?: number | string | null
  photos?: Photo[]
  amenities?: Array<{ type?: string; description?: string }>
  rooms?: Room[]
  location?: {
    address?: {
      city_name?: string
      country_code?: string
      line_one?: string
      region?: string
      postal_code?: string
    }
  }
}

type StayDetails = {
  id?: string
  check_in_date?: string
  check_out_date?: string
  cheapest_rate_total_amount?: string
  cheapest_rate_currency?: string
  accommodation?: Accommodation
}

const STORAGE_KEY = 'selected-stay-result'

const BOARD_LABEL: Record<string, string> = {
  room_only: 'Room only',
  breakfast: 'Breakfast included',
  half_board: 'Half board',
  full_board: 'Full board',
  all_inclusive: 'All-inclusive',
}

function formatBoard(b?: string) {
  if (!b) return 'Room only'
  return BOARD_LABEL[b] ?? b.replaceAll('_', ' ')
}

function formatBeds(beds?: Array<{ type?: string; count?: number }>) {
  if (!beds || beds.length === 0) return ''
  return beds
    .map((b) => {
      const c = b.count ?? 1
      const name = (b.type ?? 'bed').replaceAll('_', ' ')
      return `${c} ${name}${c > 1 ? 's' : ''}`
    })
    .join(', ')
}

function formatDateRange(start?: string, end?: string) {
  if (!start || !end) return ''
  const fmt = (s: string) => {
    const [y, m, d] = s.split('-').map(Number)
    if (!y || !m || !d) return s
    return new Date(y, m - 1, d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  }
  return `${fmt(start)} – ${fmt(end)}`
}

export default function StayDetailPage() {
  return (
    <Suspense
      fallback={
        <main className="container py-6">
          <div className="rounded-2xl border border-neutral-200 p-8 text-sm text-neutral-500 dark:border-neutral-800">
            Loading stay details…
          </div>
        </main>
      }
    >
      <StayDetailContent />
    </Suspense>
  )
}

function StayDetailContent() {
  const params = useParams<{ searchResultId: string }>()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { format } = useCurrency()
  const srrId = params.searchResultId

  const [details, setDetails] = useState<StayDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRateId, setSelectedRateId] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const r = await fetch(`/api/stays/details/${encodeURIComponent(srrId)}`, {
          method: 'POST',
          signal: controller.signal,
        })
        const payload = (await r.json()) as { details?: StayDetails; error?: string }
        if (!r.ok) throw new Error(payload.error ?? 'Could not load stay details.')
        setDetails(payload.details ?? null)
      } catch (e) {
        if ((e as Error).name === 'AbortError') return
        setError(e instanceof Error ? e.message : 'Could not load stay details.')
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => controller.abort()
  }, [srrId])

  const allRates = useMemo(() => {
    const rooms = details?.accommodation?.rooms ?? []
    return rooms.flatMap((r) => r.rates ?? [])
  }, [details])

  // Pre-select the cheapest rate so the bottom CTA shows a price even before
  // the user clicks anything.
  useEffect(() => {
    if (selectedRateId || allRates.length === 0) return
    const cheapest = allRates
      .slice()
      .sort((a, b) => Number(a.total_amount ?? Infinity) - Number(b.total_amount ?? Infinity))[0]
    setSelectedRateId(cheapest?.id ?? null)
  }, [allRates, selectedRateId])

  const selectedRate = useMemo(
    () => allRates.find((r) => r.id === selectedRateId) ?? null,
    [allRates, selectedRateId]
  )

  function goToCheckout() {
    if (!selectedRate || !details) return
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        result: {
          id: details.id,
          cheapest_rate_total_amount: details.cheapest_rate_total_amount,
          cheapest_rate_currency: details.cheapest_rate_currency,
          accommodation: details.accommodation,
        },
        rateId: selectedRate.id,
        search: {
          destinationQuery: searchParams?.get('destinationQuery') ?? null,
          checkInDate: searchParams?.get('checkInDate') ?? null,
          checkOutDate: searchParams?.get('checkOutDate') ?? null,
          rooms: searchParams?.get('rooms') ?? null,
          guests: searchParams?.get('guests') ?? null,
        },
      })
    )
    router.push('/checkout/stay')
  }

  // Build a query string to keep all filter context when linking back to /stays
  const backToResultsHref = useMemo(() => {
    const qs = searchParams?.toString() ?? ''
    return qs ? `/stays?${qs}` : '/stays'
  }, [searchParams])

  if (loading) {
    return (
      <main className="container py-6">
        <div className="space-y-4">
          <div className="h-6 w-48 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
          <div className="h-72 animate-pulse rounded-2xl bg-neutral-100 dark:bg-neutral-800" />
          <div className="h-44 animate-pulse rounded-2xl bg-neutral-100 dark:bg-neutral-800" />
        </div>
      </main>
    )
  }

  if (error || !details?.accommodation) {
    return (
      <main className="container py-6">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950">
          {error ?? 'No stay data available.'}
        </div>
        <Link href={backToResultsHref} className="mt-4 inline-block text-sm text-orange-600 hover:underline">
          ← Back to results
        </Link>
      </main>
    )
  }

  const acc = details.accommodation
  const photos = acc.photos ?? []
  const main = photos[0]?.url
  const side = photos.slice(1, 3)
  const stars = Number(acc.rating ?? 0)
  const reviewScore = Number(acc.review_score ?? 0)
  const reviewCount = Number(acc.review_count ?? 0)
  const addr = acc.location?.address
  const addressLine = [addr?.line_one, addr?.city_name, addr?.postal_code, addr?.country_code]
    .filter(Boolean)
    .join(', ')
  const rooms = acc.rooms ?? []
  const nights = nightsBetween(details.check_in_date, details.check_out_date)

  return (
    <main className="container pb-32 pt-6">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1 text-sm text-neutral-500">
        <Link href={backToResultsHref} className="hover:text-orange-600">
          Stays
        </Link>
        <ChevronRightIcon className="size-3" />
        <Link href={backToResultsHref} className="hover:text-orange-600">
          Results
        </Link>
        <ChevronRightIcon className="size-3" />
        <span className="text-neutral-900 dark:text-neutral-100">Details</span>
      </nav>

      {/* Header */}
      <div className="mb-4">
        {stars > 0 && (
          <div className="mb-1 flex items-center gap-0.5">
            {Array.from({ length: Math.round(stars) }).map((_, i) => (
              <StarSolid key={i} className="size-4 text-orange-500" />
            ))}
          </div>
        )}
        <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl dark:text-neutral-100">
          {acc.name}
        </h1>
        {addressLine && (
          <p className="mt-1 flex items-start gap-1.5 text-sm text-neutral-500">
            <MapPinIcon className="mt-0.5 size-4 shrink-0 text-orange-500" />
            <span>{addressLine}</span>
          </p>
        )}
      </div>

      {/* Gallery */}
      {main && (
        <div className="mb-6 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_280px] sm:grid-rows-2 sm:h-[360px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={main}
            alt={acc.name ?? 'Hotel'}
            className="row-span-2 h-full w-full rounded-2xl object-cover"
          />
          {side[0]?.url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={side[0].url} alt="" className="hidden h-full w-full rounded-2xl object-cover sm:block" />
          )}
          {side[1]?.url ? (
            <div className="relative hidden sm:block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={side[1].url} alt="" className="h-full w-full rounded-2xl object-cover" />
              {photos.length > 3 && (
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40 text-sm font-semibold text-white">
                  +{photos.length - 3} photos
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          {/* About */}
          {acc.description && (
            <section className="mb-8">
              <h2 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                About this stay
              </h2>
              <DescriptionBlock text={acc.description} />
            </section>
          )}

          {/* Key amenities */}
          {acc.amenities && acc.amenities.length > 0 && (
            <section className="mb-8">
              <h2 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Key amenities
              </h2>
              <ul className="grid grid-cols-1 gap-2 text-sm text-neutral-700 sm:grid-cols-2 lg:grid-cols-3 dark:text-neutral-300">
                {acc.amenities.slice(0, 12).map((a, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1.5 inline-block size-1.5 rounded-full bg-orange-500" />
                    {a.description}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Rooms */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-neutral-900 dark:text-neutral-100">Rooms</h2>
            <div className="space-y-6">
              {rooms.length === 0 ? (
                <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900">
                  No rooms available for these dates.
                </div>
              ) : (
                rooms.map((room, idx) => (
                  <RoomBlock
                    key={idx}
                    room={room}
                    nights={nights}
                    selectedRateId={selectedRateId}
                    onSelectRate={setSelectedRateId}
                    fallbackPhotos={photos}
                    fallbackOffset={idx}
                  />
                ))
              )}
            </div>
          </section>
        </div>

        {/* Right column — review/price summary */}
        <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          {reviewScore > 0 && (
            <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  Guest reviews
                </span>
                <span className="rounded-md bg-orange-500 px-2 py-0.5 text-sm font-bold text-white">
                  {reviewScore.toFixed(1)}
                </span>
              </div>
              {reviewCount > 0 && (
                <div className="mt-1 text-xs text-neutral-500">
                  {reviewCount.toLocaleString()} reviews
                </div>
              )}
            </div>
          )}

          <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="text-xs text-neutral-500">{formatDateRange(details.check_in_date, details.check_out_date)}</div>
            <div className="text-xs text-neutral-500">
              {searchParams?.get('rooms') ?? '1'} room · {searchParams?.get('guests') ?? '2'} guests
            </div>
            <div className="mt-3 text-xs text-neutral-500">From</div>
            <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {format(details.cheapest_rate_total_amount ?? 0, details.cheapest_rate_currency)}
            </div>
            <div className="text-[11px] text-neutral-500">incl. taxes &amp; fees</div>
          </div>
        </aside>
      </div>

      {/* Sticky bottom checkout bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-neutral-200 bg-white/95 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/95">
        <div className="container flex flex-wrap items-center justify-between gap-3 py-3">
          <div>
            {selectedRate ? (
              <>
                <div className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  {format(selectedRate.total_amount, selectedRate.total_currency)}
                </div>
                <div className="text-xs text-neutral-500">
                  Total · {formatBoard(selectedRate.board_type)}
                </div>
              </>
            ) : (
              <div className="text-sm text-neutral-500">Select a rate to continue</div>
            )}
          </div>
          <button
            type="button"
            onClick={goToCheckout}
            disabled={!selectedRate}
            className="rounded-lg bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Go to checkout
          </button>
        </div>
      </div>
    </main>
  )
}

function DescriptionBlock({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false)
  const isLong = text.length > 400
  const shown = expanded || !isLong ? text : text.slice(0, 400).trimEnd() + '…'
  return (
    <div className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
      <p className="whitespace-pre-line">{shown}</p>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 text-sm font-semibold text-orange-600 hover:underline"
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  )
}

function RoomBlock({
  room,
  nights,
  selectedRateId,
  onSelectRate,
  fallbackPhotos,
  fallbackOffset,
}: {
  room: Room
  nights: number
  selectedRateId: string | null
  onSelectRate: (id: string) => void
  fallbackPhotos: Photo[]
  fallbackOffset: number
}) {
  const { format } = useCurrency()
  const roomPhotos = room.photos ?? []
  const rates = room.rates ?? []
  // Duffel often returns rooms[].photos as []. Fall back to the accommodation
  // photo pool so each room block isn't a "No photos" placeholder; offset by
  // the room index so adjacent rooms don't show the same image.
  const photos: Photo[] =
    roomPhotos.length > 0
      ? roomPhotos
      : fallbackPhotos.length > 0
        ? (() => {
            const total = fallbackPhotos.length
            const start = (fallbackOffset * 5) % total
            const cycled: Photo[] = []
            for (let i = 0; i < Math.min(5, total); i++) {
              cycled.push(fallbackPhotos[(start + i) % total])
            }
            return cycled
          })()
        : []
  const mainPhoto = photos[0]?.url
  const sidePhotos = photos.slice(1, 5)
  const cheapest = rates
    .slice()
    .sort((a, b) => Number(a.total_amount ?? Infinity) - Number(b.total_amount ?? Infinity))[0]
  const minPrice = cheapest?.total_amount
  const currency = cheapest?.total_currency

  // Aggregate distinct condition titles across all rates so we can show a
  // single "Hotel policies" expander per room instead of duplicating them.
  const aggregateConditions: RateCondition[] = useMemo(() => {
    const seen = new Map<string, string>()
    for (const rate of rates) {
      for (const c of rate.conditions ?? []) {
        const title = (c.title ?? '').trim()
        if (!title || seen.has(title)) continue
        seen.set(title, c.description ?? '')
      }
    }
    return Array.from(seen.entries()).map(([title, description]) => ({ title, description }))
  }, [rates])

  return (
    <article className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="grid grid-cols-1 sm:grid-cols-[280px_1fr]">
        {/* Photo column */}
        <div className="bg-neutral-50 p-3 dark:bg-neutral-950">
          {mainPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={mainPhoto}
              alt={room.name ?? 'Room'}
              className="h-44 w-full rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-44 w-full items-center justify-center rounded-lg bg-neutral-100 text-xs text-neutral-400 dark:bg-neutral-800">
              No photos
            </div>
          )}
          {sidePhotos.length > 0 && (
            <div className="mt-2 grid grid-cols-4 gap-1.5">
              {sidePhotos.map((p, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={p.url}
                  alt=""
                  className="aspect-square w-full rounded-md object-cover"
                />
              ))}
            </div>
          )}
        </div>

        {/* Details + rates column */}
        <div className="flex flex-col gap-3 p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                {room.name ?? 'Room'}
              </h3>
              {room.beds && room.beds.length > 0 && (
                <div className="mt-0.5 text-xs text-neutral-500">{formatBeds(room.beds)}</div>
              )}
            </div>
            {minPrice ? (
              <div className="text-right">
                <div className="text-xs text-neutral-500">from</div>
                <div className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  {format(minPrice, currency)}
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-1.5 text-xs">
            {photos.length > 0 && (
              <Chip>📷 {photos.length} photo{photos.length === 1 ? '' : 's'}</Chip>
            )}
            {rates.length > 0 && (
              <Chip>{rates.length} rate option{rates.length === 1 ? '' : 's'}</Chip>
            )}
            {cheapest?.payment_type === 'pay_now' && <Chip>Pay now available</Chip>}
            {(cheapest?.cancellation_timeline?.length ?? 0) > 0 && <Chip>Refundable options</Chip>}
          </div>

          <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 xl:grid-cols-3">
            {rates.map((rate) => (
              <RateCard
                key={rate.id}
                rate={rate}
                nights={nights}
                selected={rate.id === selectedRateId}
                onSelect={() => onSelectRate(rate.id)}
              />
            ))}
          </div>

          {aggregateConditions.length > 0 && (
            <details className="mt-1 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs dark:border-neutral-800 dark:bg-neutral-950">
              <summary className="cursor-pointer font-semibold text-neutral-700 dark:text-neutral-300">
                Room policies &amp; conditions ({aggregateConditions.length})
              </summary>
              <ul className="mt-2 space-y-2 text-neutral-600 dark:text-neutral-400">
                {aggregateConditions.map((c, i) => (
                  <li key={i}>
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">{c.title}</span>
                    {c.description ? <span> — {c.description}</span> : null}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      </div>
    </article>
  )
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
      {children}
    </span>
  )
}

function RateCard({
  rate,
  nights,
  selected,
  onSelect,
}: {
  rate: Rate
  nights: number
  selected: boolean
  onSelect: () => void
}) {
  const { format } = useCurrency()
  const total = Number(rate.total_amount ?? 0)
  const currency = rate.total_currency ?? ''
  const refundable =
    rate.cancellation_timeline?.some((t) => Number(t.refund_amount ?? 0) > 0) ?? false
  const freeCancelBy = rate.cancellation_timeline?.find(
    (t) => Number(t.refund_amount ?? 0) >= total
  )?.before
  const fullyRefundable = !!freeCancelBy

  const mealLabel =
    rate.board_type === 'breakfast'
      ? 'Breakfast included'
      : rate.board_type === 'half_board'
        ? 'Half board'
        : rate.board_type === 'full_board'
          ? 'Full board'
          : rate.board_type === 'all_inclusive'
            ? 'All-inclusive'
            : 'Room only, no meals'

  // Title matches the Duffel UI: refundability + " with breakfast" when a meal is included.
  const titlePieces: string[] = []
  titlePieces.push(fullyRefundable ? 'Fully refundable' : 'Non-refundable')
  if (rate.board_type === 'breakfast') titlePieces.push('with breakfast')
  else if (rate.board_type === 'half_board') titlePieces.push('with half board')
  else if (rate.board_type === 'full_board') titlePieces.push('with full board')
  else if (rate.board_type === 'all_inclusive') titlePieces.push('all-inclusive')
  const title = titlePieces.join(' ')

  const paymentMethod = (rate.available_payment_methods ?? [])[0]
  const paymentLabel =
    paymentMethod === 'balance'
      ? 'Pay now with Duffel Balance'
      : paymentMethod === 'card'
        ? 'Pay now by card'
        : rate.payment_type === 'pay_now'
          ? 'Pay now'
          : 'Pay at the property'

  const sourceLabel = rate.source
    ? `Sourced from ${rate.source.charAt(0).toUpperCase() + rate.source.slice(1)}`
    : null

  const perNight = nights > 0 ? total / nights : null

  return (
    <button
      type="button"
      onClick={onSelect}
      className={
        selected
          ? 'group relative flex w-full flex-col gap-3 rounded-xl border-2 border-orange-500 bg-orange-50/40 p-4 text-left ring-1 ring-orange-500 dark:bg-orange-950/30'
          : 'group relative flex w-full flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4 text-left transition-colors hover:border-orange-400 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800'
      }
    >
      <div className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{title}</div>

      <ul className="space-y-1.5 text-xs text-neutral-700 dark:text-neutral-300">
        <li className="flex items-center gap-2">
          <Squares2X2Icon className="size-3.5 shrink-0 text-neutral-500" />
          <span>{mealLabel}</span>
        </li>
        {fullyRefundable && freeCancelBy ? (
          <li className="flex items-center gap-2">
            <ClockIcon className="size-3.5 shrink-0 text-neutral-500" />
            <span>
              Free cancellation until{' '}
              {new Date(freeCancelBy).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </li>
        ) : (
          <li className="flex items-center gap-2">
            <XMarkIcon className="size-3.5 shrink-0 text-neutral-500" />
            <span>{refundable ? 'Partial refund only' : 'Non-refundable'}</span>
          </li>
        )}
        <li className="flex items-center gap-2">
          <CreditCardIcon className="size-3.5 shrink-0 text-neutral-500" />
          <span>{paymentLabel}</span>
        </li>
        {sourceLabel && (
          <li className="flex items-center gap-2">
            <BuildingOffice2Icon className="size-3.5 shrink-0 text-neutral-500" />
            <span>{sourceLabel}</span>
          </li>
        )}
      </ul>

      <div className="mt-auto pt-2">
        {rate.quantity_available && rate.quantity_available > 0 ? (
          <div className="text-xs text-neutral-500">
            At least {rate.quantity_available} room{rate.quantity_available === 1 ? '' : 's'} available
          </div>
        ) : null}
        {nights > 0 ? (
          <div className="text-xs text-neutral-500">
            {format(total, currency)} for {nights} night{nights === 1 ? '' : 's'}
          </div>
        ) : null}
        <div className="mt-1 flex items-end justify-between gap-2">
          <div>
            {perNight !== null ? (
              <>
                <span className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  {format(perNight, currency)}
                </span>
                <span className="text-xs text-neutral-500">/night</span>
              </>
            ) : (
              <span className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                {format(total, currency)}
              </span>
            )}
          </div>
          <span
            className={
              selected
                ? 'grid size-5 shrink-0 place-items-center rounded-full bg-orange-500 text-[11px] text-white'
                : 'size-5 shrink-0 rounded-full border border-neutral-300 dark:border-neutral-600'
            }
            aria-hidden
          >
            {selected ? '✓' : ''}
          </span>
        </div>
      </div>
    </button>
  )
}

function nightsBetween(start?: string, end?: string): number {
  if (!start || !end) return 0
  const [ys, ms, ds] = start.split('-').map(Number)
  const [ye, me, de] = end.split('-').map(Number)
  if (!ys || !ms || !ds || !ye || !me || !de) return 0
  const s = Date.UTC(ys, ms - 1, ds)
  const e = Date.UTC(ye, me - 1, de)
  const diff = Math.round((e - s) / 86_400_000)
  return diff > 0 ? diff : 0
}
