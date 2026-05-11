import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { findAirlineByCode } from '@/lib/duffel'

export const revalidate = 86_400

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>
}): Promise<Metadata> {
  const { code } = await params
  const airline = await findAirlineByCode(code).catch(() => null)
  if (!airline) {
    return { title: 'Airline not found' }
  }
  return {
    title: `${airline.name}${airline.iata_code ? ` (${airline.iata_code})` : ''}`,
    description: `Conditions of carriage and flight search for ${airline.name}.`,
  }
}

export default async function AirlineDetailPage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params
  const airline = await findAirlineByCode(code)
  if (!airline) notFound()

  const lockup = airline.logo_lockup_url
  const symbol = airline.logo_symbol_url
  const cocUrl = airline.conditions_of_carriage_url
  const iata = airline.iata_code

  // Pre-fill a flight search where the user just needs to pick origin /
  // destination — the airline name is pinned via the URL.
  const findFlightsHref = new URLSearchParams()
  findFlightsHref.set('adults', '1')
  findFlightsHref.set('cabinClass', 'economy')
  if (iata) findFlightsHref.set('airline', iata)
  const flightSearchHref = `/flight-search?${findFlightsHref.toString()}`

  return (
    <main className="bg-neutral-50 pb-16 dark:bg-neutral-950">
      <div className="container py-6">
        <nav className="mb-4 text-xs text-neutral-500">
          <Link href="/" className="hover:text-orange-600">
            Home
          </Link>{' '}
          ·{' '}
          <Link href="/airlines" className="hover:text-orange-600">
            Airlines
          </Link>
          {iata ? ` · ${iata}` : ''}
        </nav>

        {/* Hero */}
        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:p-8">
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <div className="flex size-24 shrink-0 items-center justify-center rounded-xl bg-neutral-50 p-3 dark:bg-neutral-950">
              {lockup || symbol ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={lockup ?? symbol ?? ''}
                  alt={`${airline.name} logo`}
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <span className="text-2xl font-bold text-neutral-400">
                  {(iata ?? '??').slice(0, 2)}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                {airline.name}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-neutral-500">
                {iata ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                    IATA <span className="font-mono">{iata}</span>
                  </span>
                ) : null}
                <span className="text-xs">
                  Duffel ID: <span className="font-mono">{airline.id}</span>
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Link
                href={flightSearchHref}
                className="inline-flex items-center justify-center rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-600"
              >
                Find {airline.name.split(' ')[0]} flights
              </Link>
              {cocUrl ? (
                <a
                  href={cocUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-700 hover:border-orange-400 hover:text-orange-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
                >
                  Conditions of carriage
                  <ArrowTopRightOnSquareIcon className="size-4" />
                </a>
              ) : null}
            </div>
          </div>
        </section>

        {/* About — Duffel-derived only */}
        <section className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              About this airline
            </h2>
            <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
              {airline.name} is one of {/* count is fine-grained but stable enough not to refetch */}{' '}
              hundreds of airlines we surface fares from via the Duffel travel platform. Detailed
              fleet, hub, and on-time data isn&apos;t published by our airline partners through the
              same feed — for those you can use the airline&apos;s own site.
            </p>
            {cocUrl ? (
              <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
                Booking with {airline.name} is governed by the carrier&apos;s own conditions of
                carriage, linked above. Please read these before purchasing — they cover refunds,
                changes, baggage allowance, and dispute resolution.
              </p>
            ) : (
              <p className="mt-3 text-sm text-neutral-500">
                Conditions of carriage for this airline are not listed in our directory yet. Check
                the airline&apos;s own website before booking.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              Find flights
            </h2>
            <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
              Run a flight search and we&apos;ll surface available offers operated by{' '}
              {airline.name}. Use the airline filter on the results page to narrow to this carrier
              only.
            </p>
            <Link
              href={flightSearchHref}
              className="mt-4 inline-flex items-center justify-center rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-600"
            >
              Start a flight search
            </Link>
            <p className="mt-3 text-xs text-neutral-500">
              You can also start from{' '}
              <Link href="/" className="text-orange-600 hover:underline">
                the home page search
              </Link>{' '}
              and toggle the airline filter once results load.
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
