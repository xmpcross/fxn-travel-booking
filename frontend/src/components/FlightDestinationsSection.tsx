'use client'

import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { useEffect, useMemo, useState } from 'react'

const DEFAULT_ORIGIN_IATA = 'PER'

function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const CITIES: { name: string; iata: string }[] = [
  { name: 'Melbourne', iata: 'MEL' },
  { name: 'London', iata: 'LON' },
  { name: 'Seoul, South Korea', iata: 'SEL' },
  { name: 'Los Angeles', iata: 'LAX' },
  { name: 'Auckland', iata: 'AKL' },
  { name: 'Cairns', iata: 'CNS' },
  { name: 'Paris', iata: 'PAR' },
  { name: 'New York', iata: 'NYC' },
  { name: 'Sydney', iata: 'SYD' },
  { name: 'Adelaide', iata: 'ADL' },
  { name: 'Brisbane', iata: 'BNE' },
  { name: 'Singapore', iata: 'SIN' },
  { name: 'Berlin', iata: 'BER' },
  { name: 'Bangkok', iata: 'BKK' },
  { name: 'Vancouver', iata: 'YVR' },
  { name: 'Tokyo', iata: 'TYO' },
  { name: 'Kuala Lumpur', iata: 'KUL' },
  { name: 'Dubai', iata: 'DXB' },
  { name: 'Hyderabad', iata: 'HYD' },
  { name: 'India', iata: 'BOM' },
  { name: 'Australia', iata: 'SYD' },
  { name: 'New Zealand', iata: 'AKL' },
  { name: 'Fiji', iata: 'NAN' },
  { name: 'Denpasar', iata: 'DPS' },
  { name: 'New Delhi', iata: 'DEL' },
  { name: 'Kathmandu', iata: 'KTM' },
  { name: 'Manila', iata: 'MNL' },
  { name: 'Ho Chi Minh City', iata: 'SGN' },
]

const POPULAR_ORIGINS: { name: string; iata: string }[] = [
  { name: 'Sydney', iata: 'SYD' },
  { name: 'Melbourne', iata: 'MEL' },
  { name: 'Brisbane', iata: 'BNE' },
  { name: 'Perth', iata: 'PER' },
  { name: 'Singapore', iata: 'SIN' },
]

export function FlightDestinationsSection() {
  // Detect the visitor's nearest IATA so destination-tile links carry an
  // origin pre-set. Falls back to PER if the geo lookup fails (matches the
  // From-field placeholder default).
  const [detectedOrigin, setDetectedOrigin] = useState<string>(DEFAULT_ORIGIN_IATA)
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
          data?: Array<{ iata_code: string }>
        }
        const iata = placesData.data?.[0]?.iata_code
        if (iata && !cancelled) setDetectedOrigin(iata)
      } catch {
        // Silent — keep the PER default.
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  // Default return-trip dates: depart today+30, return today+37.
  const defaultDates = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dep = new Date(today)
    dep.setDate(today.getDate() + 30)
    const ret = new Date(today)
    ret.setDate(today.getDate() + 37)
    return { departureDate: isoDate(dep), returnDate: isoDate(ret) }
  }, [])

  const buildFlightHref = (originIata: string, destinationIata: string) => {
    const qs = new URLSearchParams({
      origin: originIata,
      destination: destinationIata,
      departureDate: defaultDates.departureDate,
      returnDate: defaultDates.returnDate,
      adults: '1',
      cabinClass: 'economy',
    })
    return `/flights?${qs.toString()}`
  }

  return (
    <section>
      <h2 className="text-2xl font-bold text-neutral-900 sm:text-3xl dark:text-neutral-100">
        Search cheap flights by destination
      </h2>
      <p className="mt-1 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
        Find Cheap Flights
      </p>
      <p className="mt-4 max-w-4xl text-sm text-neutral-600 dark:text-neutral-400">
        Compare deals from hundreds of airline sites in one place. Whether you&apos;re booking a
        last-minute getaway or planning ahead, browse popular destinations below to surface the best
        fares for your next trip.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-x-12 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
        {CITIES.map((city, idx) => {
          const origins = POPULAR_ORIGINS.filter((o) => o.iata !== city.iata).slice(0, 4)
          return (
            <Disclosure key={`${city.iata}-${idx}`}>
              {({ open }) => (
                <div className="border-b border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-center justify-between py-4">
                    <a
                      href={buildFlightHref(detectedOrigin, city.iata)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-sm font-semibold text-neutral-900 hover:text-orange-600 dark:text-neutral-100 dark:hover:text-orange-400"
                    >
                      {city.name} flights
                    </a>
                    <DisclosureButton
                      className="rounded-full p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-orange-500 dark:hover:bg-neutral-800"
                      aria-label={`Show popular routes to ${city.name}`}
                    >
                      <ChevronDownIcon
                        className={`size-4 transition-transform ${open ? 'rotate-180' : ''}`}
                        strokeWidth={2}
                      />
                    </DisclosureButton>
                  </div>
                  <DisclosurePanel as="ul" className="space-y-1 pb-4">
                    {origins.map((o) => (
                      <li key={o.iata}>
                        <a
                          href={buildFlightHref(o.iata, city.iata)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block py-1 text-sm text-neutral-600 hover:text-orange-600 dark:text-neutral-400 dark:hover:text-orange-400"
                        >
                          From {o.name} → {city.name}{' '}
                          <span className="font-mono text-xs text-neutral-400">
                            {o.iata}–{city.iata}
                          </span>
                        </a>
                      </li>
                    ))}
                  </DisclosurePanel>
                </div>
              )}
            </Disclosure>
          )
        })}
      </div>
    </section>
  )
}
