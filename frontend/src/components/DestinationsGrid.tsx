'use client'

import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

const CITIES: { name: string; iata: string }[] = [
  { name: 'Melbourne', iata: 'MEL' },
  { name: 'London', iata: 'LON' },
  { name: 'Perth', iata: 'PER' },
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
]

const POPULAR_ORIGINS: { name: string; iata: string }[] = [
  { name: 'Sydney', iata: 'SYD' },
  { name: 'Melbourne', iata: 'MEL' },
  { name: 'Brisbane', iata: 'BNE' },
  { name: 'Perth', iata: 'PER' },
  { name: 'Singapore', iata: 'SIN' },
]

export function DestinationsGrid() {
  return (
    <div className="mt-6 grid grid-cols-1 gap-x-12 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
      {CITIES.map((city) => {
        const origins = POPULAR_ORIGINS.filter((o) => o.iata !== city.iata).slice(0, 4)
        return (
          <Disclosure key={city.iata}>
            {({ open }) => (
              <div className="border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center justify-between py-4">
                  <a
                    href={`/flights?destination=${city.iata}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <div className="text-sm font-bold text-neutral-900 hover:text-orange-600 dark:text-neutral-100 dark:hover:text-orange-400">
                      {city.name}
                    </div>
                    <div className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-orange-600 dark:text-orange-400">
                      Flights
                    </div>
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
                        href={`/flights?origin=${o.iata}&destination=${city.iata}`}
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
  )
}
