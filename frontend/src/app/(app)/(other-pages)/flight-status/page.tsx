import { MagnifyingGlassIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline'
import type { Metadata } from 'next'
import Link from 'next/link'

import { FlightStatusLookup } from '@/components/FlightStatusLookup'

export const metadata: Metadata = {
  title: 'Flight status',
  description:
    'Live flight status lookup powered by FlightAware. Enter a flight number like QF1, BA15 or EK10 to see departure / arrival times and the current state.',
}

export default function FlightStatusPage() {
  return (
    <main className="bg-neutral-50 pb-16 dark:bg-neutral-950">
      <div className="container py-10 lg:py-14">
        <nav className="mb-4 text-xs text-neutral-500">
          <Link href="/" className="hover:text-orange-600">
            Home
          </Link>{' '}
          · Flight status
        </nav>

        <header>
          <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
            Live tracking
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Flight status
          </h1>
          <p className="mt-4 max-w-3xl text-sm text-neutral-600 dark:text-neutral-400">
            Enter a flight number (e.g. <span className="font-mono">QF1</span>,{' '}
            <span className="font-mono">BA15</span>,{' '}
            <span className="font-mono">EK10</span>) to see live departure and
            arrival timing, status, and route. Powered by FlightAware AeroAPI.
          </p>
        </header>

        <section className="mt-8">
          <FlightStatusLookup />
        </section>

        <section className="mt-10 rounded-2xl border border-neutral-200 bg-white p-5 text-sm text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
          <div className="flex items-start gap-3">
            <div className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-300">
              <PaperAirplaneIcon className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                How to find a flight number
              </h2>
              <p className="mt-2">
                Flight numbers combine an airline IATA (or ICAO) prefix and a
                numeric identifier — for example <span className="font-mono">QF1</span>{' '}
                is Qantas flight 1 (Sydney→London). You&apos;ll find this on your
                booking confirmation, e-ticket, or boarding pass. Codeshare
                flights may appear under both the operating and marketing
                airline&apos;s flight numbers; either will work.
              </p>
              <p className="mt-3 text-xs text-neutral-500">
                Live data does not replace your airline&apos;s official
                notifications. Always check with the carrier directly for
                gate changes and delays close to departure.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
