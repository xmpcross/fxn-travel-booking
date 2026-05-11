import { ArrowRightIcon, ChevronLeftIcon } from '@heroicons/react/24/outline'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { POPULAR_DESTINATIONS } from '@/data/popularDestinations'
import { findAirlineByCode } from '@/lib/duffel'

export const revalidate = 86_400

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>
}): Promise<Metadata> {
  const { code } = await params
  const airline = await findAirlineByCode(code).catch(() => null)
  if (!airline) return { title: 'Airline destinations' }
  return {
    title: `${airline.name} destinations`,
    description: `Search flights with ${airline.name} to every popular destination NXT.DEALS covers.`,
  }
}

function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default async function AirlineDestinationsPage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params
  const airline = await findAirlineByCode(code)
  if (!airline) notFound()
  const iata = airline.iata_code

  // Default outbound 30 days out, return 7 days later.
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dep = new Date(today)
  dep.setDate(today.getDate() + 30)
  const ret = new Date(today)
  ret.setDate(today.getDate() + 37)
  const dates = { departureDate: isoDate(dep), returnDate: isoDate(ret) }

  const buildHref = (destIata: string) => {
    const qs = new URLSearchParams({
      destination: destIata,
      departureDate: dates.departureDate,
      returnDate: dates.returnDate,
      adults: '1',
      cabinClass: 'economy',
    })
    if (iata) qs.set('airline', iata)
    return `/flight-search?${qs.toString()}`
  }

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
          </Link>{' '}
          ·{' '}
          <Link
            href={`/airlines/${encodeURIComponent(iata ?? airline.id)}`}
            className="hover:text-orange-600"
          >
            {airline.name}
          </Link>{' '}
          · Destinations
        </nav>

        <header className="flex flex-wrap items-center gap-4">
          {airline.logo_lockup_url || airline.logo_symbol_url ? (
            <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-white p-2 ring-1 ring-neutral-200 dark:bg-neutral-900 dark:ring-neutral-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={airline.logo_lockup_url ?? airline.logo_symbol_url ?? ''}
                alt=""
                className="max-h-full max-w-full object-contain"
              />
            </div>
          ) : null}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
              {airline.name}
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              Destinations
            </h1>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              Browse every destination NXT.DEALS surfaces, with each search
              pre-filtered to {airline.name}. Clicking a card runs a real flight
              search — if no offers are returned, this airline doesn&apos;t fly
              that route on your dates.
            </p>
          </div>
        </header>

        <section className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {POPULAR_DESTINATIONS.map((d) => (
            <Link
              key={d.iata}
              href={buildHref(d.iata)}
              className="group relative overflow-hidden rounded-[4px] bg-neutral-200 dark:bg-neutral-800"
            >
              <div className="aspect-[4/3]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={d.imageUrl}
                  alt={d.name}
                  loading="lazy"
                  className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3 text-white">
                  <div className="min-w-0">
                    <div className="truncate text-base font-bold drop-shadow-sm">
                      {d.name}
                    </div>
                    <div className="text-[10px] uppercase tracking-wider opacity-90">
                      {d.country}
                    </div>
                  </div>
                  <ArrowRightIcon className="size-4 shrink-0 opacity-90 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            </Link>
          ))}
        </section>

        <div className="mt-8">
          <Link
            href={`/airlines/${encodeURIComponent(iata ?? airline.id)}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 hover:border-orange-400 hover:text-orange-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
          >
            <ChevronLeftIcon className="size-4" />
            Back to {airline.name}
          </Link>
        </div>
      </div>
    </main>
  )
}
