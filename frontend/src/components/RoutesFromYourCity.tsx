'use client'

import { ArrowRightIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

import { POPULAR_DESTINATIONS } from '@/data/popularDestinations'

const DEFAULT_ORIGIN = { city: 'Perth', iata: 'PER' }

function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/**
 * Geolocates the visitor (ipapi.co → /api/places/suggestions, both calls
 * are debounced behind a one-shot effect), then renders a list of tiles
 * for the airline's popular destinations as flights *from* the user's
 * detected city. Each tile deep-links to /flight-search with the airline
 * filter pre-applied so clicking lands on a working result set.
 *
 * If the airline has no IATA we fall back to using the airline name as
 * the filter — /flight-search reads the `airline` param regardless of
 * format and falls through if no offers match.
 */
export function RoutesFromYourCity({
  airlineIata,
  airlineName,
}: {
  airlineIata: string | null
  airlineName: string
}) {
  const [origin, setOrigin] = useState<{ city: string; iata: string }>(DEFAULT_ORIGIN)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const ipRes = await fetch('https://ipapi.co/json/')
        if (!ipRes.ok) return
        const ipData = (await ipRes.json()) as { city?: string }
        if (!ipData.city || cancelled) return
        const placesRes = await fetch(
          `/api/places/suggestions?q=${encodeURIComponent(ipData.city)}`,
        )
        if (!placesRes.ok) return
        const placesData = (await placesRes.json()) as {
          data?: Array<{ iata_code: string; city_name?: string }>
        }
        const top = placesData.data?.[0]
        if (top?.iata_code && !cancelled) {
          setOrigin({ city: top.city_name ?? ipData.city, iata: top.iata_code })
        }
      } catch {
        // silent — keep DEFAULT_ORIGIN
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const dates = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dep = new Date(today)
    dep.setDate(today.getDate() + 30)
    const ret = new Date(today)
    ret.setDate(today.getDate() + 37)
    return { departureDate: isoDate(dep), returnDate: isoDate(ret) }
  }, [])

  const buildHref = (destIata: string) => {
    const qs = new URLSearchParams({
      origin: origin.iata,
      destination: destIata,
      departureDate: dates.departureDate,
      returnDate: dates.returnDate,
      adults: '1',
      cabinClass: 'economy',
    })
    if (airlineIata) qs.set('airline', airlineIata)
    return `/flight-search?${qs.toString()}`
  }

  const routes = POPULAR_DESTINATIONS.filter((d) => d.iata !== origin.iata).slice(0, 6)

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
        Fly {airlineName} from {origin.city}
      </h2>
      <p className="mt-1 text-xs text-neutral-500">
        Search flights from <span className="font-mono">{origin.iata}</span> with{' '}
        {airlineName} pre-applied as a filter.
      </p>
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {routes.map((d) => (
          <Link
            key={d.iata}
            href={buildHref(d.iata)}
            className="group flex items-center justify-between rounded-md border border-neutral-200 px-3 py-2 text-sm hover:border-orange-400 dark:border-neutral-700"
          >
            <span className="text-neutral-700 dark:text-neutral-300">
              <span className="font-mono text-xs text-neutral-500">{origin.iata}</span>{' '}
              <span className="text-neutral-400">→</span>{' '}
              <span className="font-medium text-neutral-900 dark:text-neutral-100">
                {d.name}
              </span>
            </span>
            <ArrowRightIcon className="size-4 text-neutral-400 group-hover:text-orange-600 dark:group-hover:text-orange-400" />
          </Link>
        ))}
      </div>
    </div>
  )
}
