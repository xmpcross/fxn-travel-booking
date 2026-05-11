import Link from 'next/link'

import type { Airline } from '@/lib/duffel'

export function AirlineGrid({ airlines }: { airlines: Airline[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {airlines.map((a) => {
        const slug = a.iata_code ?? a.id
        const logo = a.logo_lockup_url ?? a.logo_symbol_url
        return (
          <Link
            key={a.id}
            href={`/airlines/${encodeURIComponent(slug)}`}
            className="group flex items-center gap-3 rounded-[4px] border border-neutral-200 bg-white p-3 transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div className="flex size-16 shrink-0 items-center justify-center rounded-md bg-neutral-50 p-1.5 dark:bg-neutral-800">
              {logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logo}
                  alt=""
                  className="max-h-14 max-w-14 object-contain"
                  loading="lazy"
                />
              ) : (
                <span className="text-sm font-bold text-neutral-400">
                  {(a.iata_code ?? '??').slice(0, 2)}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-neutral-900 group-hover:text-orange-600 dark:text-neutral-100 dark:group-hover:text-orange-400">
                {a.name}
              </div>
              {a.iata_code ? (
                <div className="text-xs text-neutral-500">
                  IATA <span className="font-mono">{a.iata_code}</span>
                </div>
              ) : null}
            </div>
          </Link>
        )
      })}
    </div>
  )
}
