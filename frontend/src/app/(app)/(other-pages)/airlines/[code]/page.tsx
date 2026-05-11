import { ArrowTopRightOnSquareIcon, StarIcon } from '@heroicons/react/24/outline'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { RoutesFromYourCity } from '@/components/RoutesFromYourCity'
import { getAirlineSupplement } from '@/data/airlineSupplement'
import { findAirlineByCode, listAllAirlines, type Airline } from '@/lib/duffel'

const ALLIANCE_SITES: Record<string, string> = {
  'Star Alliance': 'https://www.staralliance.com/',
  oneworld: 'https://www.oneworld.com/',
  SkyTeam: 'https://www.skyteam.com/',
}


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
  // Walk Duffel's full airline list once (cached 24h) so partner / subsidiary
  // logos can be looked up by IATA without re-fetching the API per ref.
  const allAirlines = await listAllAirlines()
  const byIata = new Map<string, Airline>()
  for (const a of allAirlines) {
    if (a.iata_code) byIata.set(a.iata_code.toUpperCase(), a)
  }
  const upper = code.toUpperCase()
  const airline =
    byIata.get(upper) ?? allAirlines.find((a) => a.id === code) ?? null
  if (!airline) notFound()

  const lockup = airline.logo_lockup_url
  const symbol = airline.logo_symbol_url
  const cocUrl = airline.conditions_of_carriage_url
  const iata = airline.iata_code
  const supplement = getAirlineSupplement(iata)

  // Pre-fill a flight search where the user just needs to pick origin /
  // destination — the airline name is pinned via the URL.
  const findFlightsHref = new URLSearchParams()
  findFlightsHref.set('adults', '1')
  findFlightsHref.set('cabinClass', 'economy')
  findFlightsHref.set('tripType', 'return')
  if (iata) findFlightsHref.set('airline', iata)
  const flightSearchHref = `/flight-search?${findFlightsHref.toString()}`

  return (
    <main className="airline-detail bg-neutral-50 pb-16 dark:bg-neutral-950">
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
            <div className="flex size-56 shrink-0 items-center justify-center rounded-xl bg-neutral-50 p-3 dark:bg-neutral-950">
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
                className="inline-flex items-center justify-center rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold !text-[#ffffff] shadow-sm hover:bg-orange-600"
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

        {/* Overview — longer-form copy about the airline */}
        {supplement?.overview?.length ? (
          <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 sm:p-6">
            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              Overview
            </h2>
            <div className="mt-4 space-y-4">
              {supplement.overview.map((para, i) => (
                <p
                  key={i}
                  className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300"
                >
                  {para}
                </p>
              ))}
            </div>
          </section>
        ) : null}

        {/* About + supplement */}
        <section className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              About this airline
            </h2>
            {supplement ? (
              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                {supplement.alliance ? (
                  <>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Alliance
                    </dt>
                    <dd className="font-medium text-neutral-900 dark:text-neutral-100">
                      {ALLIANCE_SITES[supplement.alliance] ? (
                        <a
                          href={ALLIANCE_SITES[supplement.alliance]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {supplement.alliance}
                        </a>
                      ) : (
                        supplement.alliance
                      )}
                    </dd>
                  </>
                ) : null}
                {supplement.founded ? (
                  <>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Founded
                    </dt>
                    <dd className="font-medium text-neutral-900 dark:text-neutral-100">
                      {supplement.founded}
                    </dd>
                  </>
                ) : null}
                {supplement.country ? (
                  <>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Country
                    </dt>
                    <dd className="font-medium text-neutral-900 dark:text-neutral-100">
                      {supplement.country}
                    </dd>
                  </>
                ) : null}
                {supplement.headquarters ? (
                  <>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Headquarters
                    </dt>
                    <dd className="font-medium text-neutral-900 dark:text-neutral-100">
                      {supplement.headquarters}
                    </dd>
                  </>
                ) : null}
                {supplement.icao ? (
                  <>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      ICAO code
                    </dt>
                    <dd className="font-mono font-medium text-neutral-900 dark:text-neutral-100">
                      {supplement.icao}
                    </dd>
                  </>
                ) : null}
                {supplement.callsign ? (
                  <>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Callsign
                    </dt>
                    <dd className="font-medium text-neutral-900 dark:text-neutral-100">
                      {supplement.callsign}
                    </dd>
                  </>
                ) : null}
                {supplement.website ? (
                  <>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Website
                    </dt>
                    <dd className="truncate text-neutral-900 dark:text-neutral-100">
                      <a
                        href={`https://${supplement.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-orange-600 hover:underline dark:text-orange-400"
                      >
                        {supplement.website}
                      </a>
                    </dd>
                  </>
                ) : null}
                {supplement.phone ? (
                  <>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Phone
                    </dt>
                    <dd className="text-neutral-900 dark:text-neutral-100">
                      <a
                        href={`tel:${supplement.phone.replace(/\s+/g, '')}`}
                        className="font-medium text-orange-600 hover:underline dark:text-orange-400"
                      >
                        {supplement.phone}
                      </a>
                    </dd>
                  </>
                ) : null}
                {supplement.hubs && supplement.hubs.length > 0 ? (
                  <>
                    <dt className="col-span-2 mt-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Primary hubs
                    </dt>
                    <dd className="col-span-2 flex flex-wrap gap-2">
                      {supplement.hubs.map((h) => (
                        <span
                          key={h.iata}
                          className="inline-flex items-center gap-1.5 rounded-md bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                        >
                          {h.name}{' '}
                          <span className="font-mono text-[10px] text-neutral-500">{h.iata}</span>
                        </span>
                      ))}
                    </dd>
                  </>
                ) : null}
              </dl>
            ) : (
              <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
                {airline.name} is one of hundreds of airlines we surface fares from via the Duffel
                travel platform. Detailed fleet, hub, and on-time data isn&apos;t published through
                this feed.
              </p>
            )}
            {cocUrl ? (
              <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-400">
                Booking is governed by {airline.name}&apos;s conditions of carriage, linked above.
                Read these before purchasing — they cover refunds, changes, baggage allowance, and
                dispute resolution.
              </p>
            ) : (
              <p className="mt-4 text-sm text-neutral-500">
                Conditions of carriage for this airline are not listed in our directory yet. Check
                the carrier&apos;s own website before booking.
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
              className="mt-4 inline-flex items-center justify-center rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold !text-[#ffffff] shadow-sm hover:bg-orange-600"
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

        {/* Extended supplement: only renders when we have curated data */}
        {supplement &&
        (supplement.loyaltyProgramme ||
          supplement.cabinClasses?.length ||
          supplement.fleetSize ||
          supplement.fleetTypes?.length ||
          supplement.partners?.length ||
          supplement.subsidiaries?.length) ? (
          <section className="mt-4 grid gap-4 lg:grid-cols-3">
            {supplement.loyaltyProgramme || supplement.cabinClasses?.length ? (
              <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
                <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  Loyalty &amp; cabins
                </h2>
                {supplement.loyaltyProgramme ? (
                  <div className="mt-3">
                    <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Frequent-flyer programme
                    </div>
                    <div className="mt-1 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {supplement.loyaltyProgrammeUrl ? (
                        <a
                          href={supplement.loyaltyProgrammeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {supplement.loyaltyProgramme}
                        </a>
                      ) : (
                        supplement.loyaltyProgramme
                      )}
                    </div>
                    {supplement.loyaltyProgrammeUrl ? (
                      <a
                        href={supplement.loyaltyProgrammeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-xs font-semibold hover:underline"
                      >
                        Sign up / manage account →
                      </a>
                    ) : null}
                  </div>
                ) : null}
                {supplement.cabinClasses?.length ? (
                  <div className="mt-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Cabin classes
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {supplement.cabinClasses.map((c) => (
                        <span
                          key={c}
                          className="inline-flex items-center rounded-md bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700 dark:bg-orange-950/40 dark:text-orange-300"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            {supplement.fleetSize || supplement.fleetTypes?.length ? (
              <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
                <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  Fleet
                </h2>
                {supplement.fleetSize ? (
                  <div className="mt-3">
                    <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Approximate size
                    </div>
                    <div className="mt-1 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {supplement.fleetSize.toLocaleString()} aircraft
                    </div>
                  </div>
                ) : null}
                {supplement.fleetTypes?.length ? (
                  <div className="mt-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Aircraft types
                    </div>
                    <ul className="mt-2 space-y-1 text-sm text-neutral-700 dark:text-neutral-300">
                      {supplement.fleetTypes.map((t) => (
                        <li key={t}>• {t}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : null}

            {supplement.partners?.length || supplement.subsidiaries?.length ? (
              <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
                <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  Partners &amp; subsidiaries
                </h2>
                {supplement.partners?.length ? (
                  <div className="mt-3">
                    <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Codeshare partners
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-3">
                      {supplement.partners.map((p) => {
                        const partner = byIata.get(p.toUpperCase())
                        const logo =
                          partner?.logo_lockup_url ?? partner?.logo_symbol_url ?? null
                        const name = partner?.name ?? p
                        return (
                          <Link
                            key={p}
                            href={`/airlines/${encodeURIComponent(p)}`}
                            title={name}
                            className="group flex h-14 items-center justify-center gap-2 rounded-md border border-neutral-200 bg-white px-3 py-2 hover:border-orange-400 dark:border-neutral-700 dark:bg-neutral-900"
                          >
                            {logo ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={logo}
                                alt={name}
                                className="max-h-10 max-w-32 object-contain"
                                loading="lazy"
                              />
                            ) : (
                              <span className="font-mono text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                                {p}
                              </span>
                            )}
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                ) : null}
                {supplement.subsidiaries?.length ? (
                  <div className="mt-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Subsidiaries
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-3">
                      {supplement.subsidiaries.map((s) => {
                        const sub = s.iata ? byIata.get(s.iata.toUpperCase()) : null
                        const logo =
                          sub?.logo_lockup_url ?? sub?.logo_symbol_url ?? null
                        if (s.iata) {
                          return (
                            <Link
                              key={`${s.name}-${s.iata}`}
                              href={`/airlines/${encodeURIComponent(s.iata)}`}
                              title={s.name}
                              className="group flex h-14 items-center justify-center gap-2 rounded-md border border-neutral-200 bg-white px-3 py-2 hover:border-orange-400 dark:border-neutral-700 dark:bg-neutral-900"
                            >
                              {logo ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={logo}
                                  alt={s.name}
                                  className="max-h-10 max-w-32 object-contain"
                                  loading="lazy"
                                />
                              ) : (
                                <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                                  {s.name}
                                </span>
                              )}
                            </Link>
                          )
                        }
                        return (
                          <span
                            key={s.name}
                            className="flex h-12 items-center rounded-md border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
                          >
                            {s.name}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </section>
        ) : null}

        {/* Reviews + baggage row */}
        {supplement?.review || supplement?.baggagePolicy ? (
          <section className="mt-4 grid gap-4 lg:grid-cols-3">
            {supplement.review ? (
              <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
                <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  Customer rating
                </h2>
                <div className="mt-3 flex items-baseline gap-3">
                  <div className="text-3xl font-bold text-[#0046be] dark:text-[#3382ff]">
                    {supplement.review.score.toFixed(1)}
                  </div>
                  <div className="text-xs text-neutral-500">/ 10</div>
                  <StarIcon className="ml-1 size-4 text-[#ffce00]" />
                </div>
                {supplement.review.count != null ? (
                  <p className="mt-1 text-xs text-neutral-500">
                    {supplement.review.count.toLocaleString()} reviews
                    {supplement.review.source ? ` · ${supplement.review.source}` : ''}
                  </p>
                ) : null}
              </div>
            ) : null}

            {supplement.baggagePolicy ? (
              <div className="rounded-2xl border border-neutral-200 bg-white p-5 lg:col-span-2 dark:border-neutral-800 dark:bg-neutral-900">
                <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  Baggage policy at a glance
                </h2>
                <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                  {supplement.baggagePolicy.cabin ? (
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                        Cabin baggage
                      </dt>
                      <dd className="mt-1 text-neutral-700 dark:text-neutral-300">
                        {supplement.baggagePolicy.cabin}
                      </dd>
                    </div>
                  ) : null}
                  {supplement.baggagePolicy.checked ? (
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                        Checked baggage
                      </dt>
                      <dd className="mt-1 text-neutral-700 dark:text-neutral-300">
                        {supplement.baggagePolicy.checked}
                      </dd>
                    </div>
                  ) : null}
                  {supplement.baggagePolicy.cabinDimensions ? (
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                        Cabin dimensions
                      </dt>
                      <dd className="mt-1 text-neutral-700 dark:text-neutral-300">
                        {supplement.baggagePolicy.cabinDimensions}
                      </dd>
                    </div>
                  ) : null}
                  {supplement.baggagePolicy.extraBagFee ? (
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                        Extra bag fee
                      </dt>
                      <dd className="mt-1 text-neutral-700 dark:text-neutral-300">
                        {supplement.baggagePolicy.extraBagFee}
                      </dd>
                    </div>
                  ) : null}
                </dl>
                {cocUrl ? (
                  <p className="mt-3 text-xs text-neutral-500">
                    Always check the airline&apos;s official{' '}
                    <a
                      href={cocUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-600 hover:underline dark:text-orange-400"
                    >
                      conditions of carriage
                    </a>{' '}
                    before booking — fares and routes can change these rules.
                  </p>
                ) : null}
              </div>
            ) : null}
          </section>
        ) : null}

        {/* Routes from your detected city + recently booked */}
        <section className="mt-4 grid gap-4 lg:grid-cols-2">
          <RoutesFromYourCity
            airlineIata={iata}
            airlineName={airline.name}
          />

          {supplement?.sampleBookings?.length ? (
            <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
              <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                Recently booked with {airline.name}
              </h2>
              <p className="mt-1 text-xs text-neutral-500">
                Illustrative — real booking activity will replace these once
                the database integration is live.
              </p>
              <ul className="mt-3 space-y-2">
                {supplement.sampleBookings.map((b, idx) => (
                  <li
                    key={`${b.origin}-${b.destination}-${idx}`}
                    className="flex items-center justify-between rounded-md border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-700"
                  >
                    <span className="text-neutral-700 dark:text-neutral-300">
                      <span className="font-mono text-xs text-neutral-500">
                        {b.origin}
                      </span>{' '}
                      <span className="text-neutral-400">→</span>{' '}
                      <span className="font-mono text-xs text-neutral-500">
                        {b.destination}
                      </span>
                    </span>
                    <span className="text-xs text-neutral-500">{b.when}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>

        {/* Browse this airline's flights across all our popular destinations */}
        <section className="mt-4">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  {airline.name} across our destinations
                </h2>
                <p className="mt-1 text-xs text-neutral-500">
                  Browse every popular destination filtered to {airline.name}.
                </p>
              </div>
              {iata ? (
                <Link
                  href={`/airlines/${encodeURIComponent(iata)}/destinations`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 hover:border-orange-400 hover:text-orange-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
                >
                  See all destinations
                  <ArrowTopRightOnSquareIcon className="size-4" />
                </Link>
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
