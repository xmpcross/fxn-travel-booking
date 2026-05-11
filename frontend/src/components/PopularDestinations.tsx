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

  // Don't suggest flights from origin → origin. Trim to 6 so the grid
  // resolves cleanly: row 1 = 3 small + London (wide); row 2 = Singapore
  // (wide) + KL (small) + CTA (wide).
  const tiles = POPULAR_DESTINATIONS.filter((d) => d.iata !== origin.iata).slice(0, 6)
  // Cards listed here get lg:col-span-2 — they read as the visual anchor of
  // each row. Matches the Kiwi reference's London/Singapore treatment.
  const WIDE_IATAS = new Set(['LON', 'SIN'])

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

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {tiles.map((d) => (
          <Link
            key={d.iata}
            href={buildHref(d.iata)}
            className={`group relative aspect-[4/3] overflow-hidden rounded-[4px] bg-neutral-200 dark:bg-neutral-800 ${
              WIDE_IATAS.has(d.iata) ? 'lg:col-span-2 lg:aspect-[8/3]' : ''
            }`}
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

        {/* "Want to fly for even less?" CTA card — wide on lg, image left /
            text right, matches the Kiwi reference. */}
        <Link
          href="/flight-search"
          className="group flex aspect-[4/3] overflow-hidden rounded-[4px] border border-neutral-200 bg-white hover:border-orange-400 hover:shadow-sm lg:col-span-2 lg:aspect-[8/3] dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div className="hidden h-full w-1/2 shrink-0 items-end justify-center bg-gradient-to-br from-amber-100 via-orange-100 to-rose-100 sm:flex dark:from-amber-950/40 dark:via-orange-950/40 dark:to-rose-950/40">
            <svg
              className="size-28 -translate-y-2 text-orange-500"
              viewBox="0 0 64 64"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              aria-hidden
            >
              {/* Two travellers + suitcase silhouettes */}
              <circle cx="22" cy="18" r="5" />
              <path d="M16 32c0-4 2.7-7 6-7s6 3 6 7v22" strokeLinecap="round" />
              <path d="M14 54h16" strokeLinecap="round" />
              <circle cx="42" cy="18" r="5" />
              <path d="M36 32c0-4 2.7-7 6-7s6 3 6 7v22" strokeLinecap="round" />
              <path d="M34 54h16" strokeLinecap="round" />
              <rect x="8" y="38" width="10" height="16" rx="1.5" />
              <path d="M11 38v-3h4v3" strokeLinecap="round" />
              <rect x="46" y="38" width="10" height="16" rx="1.5" />
              <path d="M49 38v-3h4v3" strokeLinecap="round" />
            </svg>
          </div>
          <div className="flex flex-1 flex-col justify-between p-5">
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                Want to fly for even less?
              </h3>
              <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400">
                Search our best deals, price drops, and travel hacks.
              </p>
            </div>
            <span className="mt-3 inline-flex w-fit items-center gap-1 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-800 group-hover:border-orange-400 group-hover:text-orange-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200">
              Explore deals
            </span>
          </div>
        </Link>
      </div>
    </section>
  )
}
