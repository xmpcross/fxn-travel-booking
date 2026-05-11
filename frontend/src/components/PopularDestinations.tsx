'use client'

import { ChevronRightIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

import { useCurrency } from '@/contexts/CurrencyContext'
import { POPULAR_DESTINATIONS } from '@/data/popularDestinations'

const DEFAULT_ORIGIN = { city: 'Perth', iata: 'PER' }

function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function PopularDestinations() {
  const { format } = useCurrency()
  // Detect the visitor's nearest city + IATA so the heading reads
  // "Popular destinations from {their city}". Falls back to Perth/PER
  // (matches the rest of the site's default-origin behaviour).
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
        // silent — keep default
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  // Default outbound/return dates so the tile link lands on a working search.
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
    return `/flight-search?${qs.toString()}`
  }

  // Don't suggest flights from origin → origin.
  const tiles = POPULAR_DESTINATIONS.filter((d) => d.iata !== origin.iata).slice(0, 7)

  return (
    <section className="mt-10">
      <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
        Popular destinations from {origin.city} {origin.iata}
      </h2>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
        These alluring destinations from{' '}
        <span className="text-[#0046be] dark:text-[#3382ff]">
          {origin.city} {origin.iata}
        </span>{' '}
        are picked just for you.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((d) => (
          <Link
            key={d.iata}
            href={buildHref(d.iata)}
            className="group relative aspect-[4/3] overflow-hidden rounded-[4px] bg-neutral-200 dark:bg-neutral-800"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={d.imageUrl}
              alt={d.name}
              loading="lazy"
              className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-4 text-white">
              <div className="min-w-0">
                <div className="truncate text-lg font-bold drop-shadow-sm">{d.name}</div>
                <div className="text-xs opacity-90">
                  Tickets from <span className="font-semibold">{format(d.priceUsd, 'USD')}</span>
                </div>
              </div>
              <ChevronRightIcon className="size-5 shrink-0 opacity-90 transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>
        ))}

        {/* "Want to fly for even less?" CTA card */}
        <Link
          href="/flight-search"
          className="group flex aspect-[4/3] flex-col justify-between rounded-[4px] border border-neutral-200 bg-white p-5 hover:border-orange-400 hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div className="flex h-2/3 items-center justify-center text-orange-500">
            <svg
              className="size-16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6h16.5M3.75 12h16.5m-16.5 6h10.5M19 18l3 3m-3 0l3-3"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              Want to fly for even less?
            </h3>
            <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
              Search our best deals, price drops, and travel hacks.
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-orange-600 group-hover:underline dark:text-orange-400">
              Explore deals
              <ChevronRightIcon className="size-4" />
            </span>
          </div>
        </Link>
      </div>
    </section>
  )
}
