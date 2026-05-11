'use client'

import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

const CITIES: { name: string; country: string; iata: string }[] = [
  { name: 'Melbourne', country: 'Australia', iata: 'MEL' },
  { name: 'London', country: 'United Kingdom', iata: 'LON' },
  { name: 'Los Angeles', country: 'United States', iata: 'LAX' },
  { name: 'Perth', country: 'Australia', iata: 'PER' },
  { name: 'Auckland', country: 'New Zealand', iata: 'AKL' },
  { name: 'Cairns', country: 'Australia', iata: 'CNS' },
  { name: 'Paris', country: 'France', iata: 'PAR' },
  { name: 'New York', country: 'United States', iata: 'NYC' },
  { name: 'Sydney', country: 'Australia', iata: 'SYD' },
  { name: 'Adelaide', country: 'Australia', iata: 'ADL' },
  { name: 'Brisbane', country: 'Australia', iata: 'BNE' },
  { name: 'Singapore', country: 'Singapore', iata: 'SIN' },
  { name: 'Berlin', country: 'Germany', iata: 'BER' },
  { name: 'Dubai', country: 'United Arab Emirates', iata: 'DXB' },
  { name: 'Vancouver', country: 'Canada', iata: 'YVR' },
  { name: 'Tokyo', country: 'Japan', iata: 'TYO' },
  { name: 'Kuala Lumpur', country: 'Malaysia', iata: 'KUL' },
  { name: 'Bangkok', country: 'Thailand', iata: 'BKK' },
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
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      {city.name}, {city.country}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs font-normal uppercase tracking-wide">
                      <a
                        href={`/flights?destination=${city.iata}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                        style={{ color: '#ff6900' }}
                      >
                        Flights
                      </a>
                      <span aria-hidden className="text-neutral-300 dark:text-neutral-600">·</span>
                      <a
                        href={`/stays?destinationQuery=${encodeURIComponent(city.name)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                        style={{ color: '#ff6900' }}
                      >
                        Stays
                      </a>
                      <span aria-hidden className="text-neutral-300 dark:text-neutral-600">·</span>
                      <span style={{ color: '#ff6900' }}>Cars</span>
                    </div>
                  </div>
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
