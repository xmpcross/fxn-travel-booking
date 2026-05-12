'use client'

import { ChevronLeftIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useMemo, useState } from 'react'

import type { MapPin } from './MapView'

// Defer Leaflet to the client only — it touches `window` at import time.
const MapView = dynamic(() => import('./MapView'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[calc(100vh-200px)] min-h-[500px] w-full items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-50 text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900">
      Loading map…
    </div>
  ),
})

// Mirrors the StayResult shape used on /stay-search — we only consume the
// fields the map needs.
type StayResult = {
  id?: string
  search_result_id?: string
  cheapest_rate_total_amount?: string
  cheapest_rate_currency?: string
  accommodation?: {
    id?: string
    name?: string
    review_score?: number | null
    photos?: Array<{ url?: string }>
    location?: {
      geographic_coordinates?: { latitude?: number; longitude?: number }
    }
  }
}

function nightsBetween(checkIn?: string | null, checkOut?: string | null): number {
  if (!checkIn || !checkOut) return 1
  const a = new Date(`${checkIn}T00:00:00Z`).getTime()
  const b = new Date(`${checkOut}T00:00:00Z`).getTime()
  if (Number.isNaN(a) || Number.isNaN(b)) return 1
  const diff = Math.round((b - a) / 86_400_000)
  return diff > 0 ? diff : 1
}

export default function StayMapPage() {
  return (
    <Suspense fallback={null}>
      <StayMapContent />
    </Suspense>
  )
}

function StayMapContent() {
  const searchParams = useSearchParams()
  const params = searchParams ?? new URLSearchParams()
  const destinationQuery = params.get('destinationQuery') ?? ''
  const checkInDate = params.get('checkInDate')
  const checkOutDate = params.get('checkOutDate')
  const rooms = Number(params.get('rooms') ?? '1')
  const guests = Number(params.get('guests') ?? '2')
  const nights = nightsBetween(checkInDate, checkOutDate)

  const [results, setResults] = useState<StayResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  const pins = useMemo<MapPin[]>(() => {
    return results
      .map((r) => {
        const coords = r.accommodation?.location?.geographic_coordinates
        const lat = coords?.latitude
        const lng = coords?.longitude
        if (lat == null || lng == null) return null
        const totalAmount = Number(r.cheapest_rate_total_amount ?? 0)
        return {
          id: r.id ?? r.search_result_id ?? `${lat},${lng}`,
          searchResultId: r.search_result_id ?? r.id ?? '',
          name: r.accommodation?.name ?? 'Stay',
          latitude: lat,
          longitude: lng,
          totalAmount,
          perNight: totalAmount / nights,
          currency: r.cheapest_rate_currency ?? '',
          reviewScore:
            r.accommodation?.review_score == null
              ? null
              : Number(r.accommodation.review_score),
          photoUrl: r.accommodation?.photos?.[0]?.url ?? null,
        } satisfies MapPin
      })
      .filter((p): p is MapPin => p !== null)
  }, [results, nights])

  const backHref = `/stay-search?${searchParams?.toString() ?? ''}`

  return (
    <main className="bg-neutral-50 pb-16 dark:bg-neutral-950">
      <div className="container py-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 hover:border-orange-400 hover:text-orange-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
          >
            <ChevronLeftIcon className="size-4" />
            Back to list
          </Link>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            {loading
              ? 'Loading stays…'
              : error
                ? `Error: ${error}`
                : `${pins.length} of ${results.length} properties have map coordinates`}
          </div>
        </div>

        <MapView
          pins={pins}
          destinationLabel={destinationQuery}
          centerHint={null}
        />
      </div>
    </main>
  )
}
