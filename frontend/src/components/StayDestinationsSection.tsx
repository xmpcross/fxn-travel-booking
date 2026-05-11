'use client'

import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

const CITIES: string[] = [
  'Sydney',
  'Melbourne',
  'Brisbane',
  'Singapore',
  'Perth',
  'Adelaide',
  'New York',
  'London',
  'Canberra',
  'Tokyo',
  'Paris',
  'Amsterdam',
  'Surfers Paradise',
  'Honolulu',
  'Hobart',
  'Cairns',
  'Auckland',
  'Rome',
  'Los Angeles',
  'Las Vegas',
  'Vancouver',
  'Bangkok',
  'Bali',
  'Fiji',
  'Dubai',
  'Kuala Lumpur',
  'Hong Kong',
]

const NEIGHBOURHOOD_TIPS: Record<string, string[]> = {
  Sydney: ['CBD', 'Bondi Beach', 'Manly', 'Surry Hills'],
  Melbourne: ['CBD', 'Southbank', 'St Kilda', 'Fitzroy'],
  London: ['West End', 'Shoreditch', 'Kensington', 'Camden'],
  Paris: ['Le Marais', 'Saint-Germain', 'Montmartre', 'Latin Quarter'],
  'New York': ['Manhattan', 'Brooklyn', 'Times Square', 'SoHo'],
  Tokyo: ['Shinjuku', 'Shibuya', 'Ginza', 'Asakusa'],
  Bangkok: ['Sukhumvit', 'Silom', 'Old City', 'Riverside'],
  Singapore: ['Marina Bay', 'Orchard', 'Chinatown', 'Sentosa'],
  Dubai: ['Downtown', 'Marina', 'Palm Jumeirah', 'Deira'],
  Bali: ['Seminyak', 'Ubud', 'Canggu', 'Kuta'],
  Auckland: ['CBD', 'Ponsonby', 'Viaduct', 'Parnell'],
  'Los Angeles': ['Downtown', 'Hollywood', 'Santa Monica', 'Beverly Hills'],
}

export function StayDestinationsSection() {
  return (
    <section>
      <h2 className="text-2xl font-bold text-neutral-900 sm:text-3xl dark:text-neutral-100">
        Search for places to stay by destination
      </h2>
      <p className="mt-1 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
        Find Accommodation
      </p>
      <p className="mt-4 max-w-4xl text-sm text-neutral-600 dark:text-neutral-400">
        Browse hotels and short stays across popular destinations worldwide. Pick a city below to see
        live prices, reviews and availability for your dates.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-x-12 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
        {CITIES.map((city, idx) => {
          const tips = NEIGHBOURHOOD_TIPS[city] ?? []
          return (
            <Disclosure key={`${city}-${idx}`}>
              {({ open }) => (
                <div className="border-b border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-center justify-between py-4">
                    <a
                      href={`/stays?destinationQuery=${encodeURIComponent(city)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-sm font-semibold text-neutral-900 hover:text-orange-600 dark:text-neutral-100 dark:hover:text-orange-400"
                    >
                      {city} hotels
                    </a>
                    {tips.length > 0 && (
                      <DisclosureButton
                        className="rounded-full p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-orange-500 dark:hover:bg-neutral-800"
                        aria-label={`Show popular areas in ${city}`}
                      >
                        <ChevronDownIcon
                          className={`size-4 transition-transform ${open ? 'rotate-180' : ''}`}
                          strokeWidth={2}
                        />
                      </DisclosureButton>
                    )}
                  </div>
                  {tips.length > 0 && (
                    <DisclosurePanel as="ul" className="space-y-1 pb-4">
                      {tips.map((area) => (
                        <li key={area}>
                          <a
                            href={`/stays?destinationQuery=${encodeURIComponent(`${area}, ${city}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block py-1 text-sm text-neutral-600 hover:text-orange-600 dark:text-neutral-400 dark:hover:text-orange-400"
                          >
                            {area}, {city}
                          </a>
                        </li>
                      ))}
                    </DisclosurePanel>
                  )}
                </div>
              )}
            </Disclosure>
          )
        })}
      </div>
    </section>
  )
}
