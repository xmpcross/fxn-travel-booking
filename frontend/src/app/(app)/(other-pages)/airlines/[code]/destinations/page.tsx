import { ArrowRightIcon, ChevronLeftIcon } from '@heroicons/react/24/outline'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { POPULAR_DESTINATIONS } from '@/data/popularDestinations'
import { getAirlineSupplement } from '@/data/airlineSupplement'
import { findAirlineByCode } from '@/lib/duffel'

const FALLBACK_ORIGIN = { iata: 'LHR', name: 'London Heathrow' }

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

export default async function AirlineDestinationsPage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params
  const airline = await findAirlineByCode(code)
  if (!airline) notFound()
  const iata = airline.iata_code

  // Origin defaults to the airline's primary hub so the description text
  // (and the per-route pages that tiles link to) tell a coherent story.
  // Falls back to LHR for airlines without curated supplement data.
  const supplement = getAirlineSupplement(iata)
  const origin = supplement?.hubs?.[0] ?? FALLBACK_ORIGIN

  // Link to the per-route landing page — better SEO target than going
  // straight to the live search, and the route page's CTA pushes users
  // into /flight-search with the same prefilled params anyway.
  const airlineSlug = encodeURIComponent(iata ?? airline.id)
  const buildHref = (destIata: string) =>
    `/airlines/${airlineSlug}/destinations/${encodeURIComponent(destIata)}`

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
            <div className="flex size-[7.8rem] shrink-0 items-center justify-center rounded-xl bg-white p-3 ring-1 ring-neutral-200 dark:bg-neutral-900 dark:ring-neutral-800">
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
              pre-filtered to {airline.name} from{' '}
              <span className="font-mono">{origin.iata}</span> ({origin.name}).
              Clicking a card runs a real flight search — if no offers are
              returned, this airline doesn&apos;t fly that route on your dates.
              You can change the origin on the search page.
            </p>
          </div>
        </header>

        <section className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {POPULAR_DESTINATIONS.filter((d) => d.iata !== origin.iata).map((d) => (
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
