import {
  ArrowRightIcon,
  CalendarDaysIcon,
  ClockIcon,
  GlobeAltIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  ScaleIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Low fare tips',
  description:
    'Seven practical tactics for finding the cheapest flights — when to book, when to fly, which airports to use, and how to make the search engine work for you.',
}

const TIPS = [
  {
    icon: CalendarDaysIcon,
    title: 'Book ahead — but not too far ahead',
    body: (
      <>
        Last-minute fares are almost always the worst. Aim for{' '}
        <strong>21 or more days out</strong> for domestic and short-haul, and{' '}
        <strong>8 to 12 weeks out</strong> for long-haul international. Inside two weeks of
        departure, expect prices to climb day-over-day; inside seven days they can double or
        triple. Booking too far in advance (more than ~10 months) is rarely cheaper either, since
        airlines tend to price-test the schedule before optimising it closer in.
      </>
    ),
  },
  {
    icon: ClockIcon,
    title: 'Be flexible with your dates',
    body: (
      <>
        Shifting departure by a single day often shaves 10–30%. As a rough rule, midweek flights
        (<strong>Tuesday and Wednesday</strong>) tend to be the cheapest, while{' '}
        <strong>Friday and Sunday</strong> departures are the most expensive because of business
        and weekend travel. Saturday departures can be surprisingly cheap on domestic routes.
        Search across a date range whenever you can — most search engines (ours included) let you
        compare neighbouring days side-by-side.
      </>
    ),
  },
  {
    icon: SparklesIcon,
    title: 'Fly when other people don’t',
    body: (
      <>
        The cheapest seats are usually the ones nobody wants. <strong>Red-eye</strong> (overnight)
        and <strong>early-morning</strong> departures are consistently the lowest-priced on
        leisure routes. On business routes, the opposite is true — mid-day flights are softer
        because business travellers fly out early and home late. If your trip flexes, target the
        "boring" departure times to unlock lower fares without changing destination or date.
      </>
    ),
  },
  {
    icon: GlobeAltIcon,
    title: 'Avoid peak seasons',
    body: (
      <>
        School holidays, public-holiday long weekends, and the Christmas/New Year window are the
        most expensive periods of the year — domestic fares can be 50–100% higher and
        international ones 30–60% higher than shoulder-season equivalents. If you can travel in{' '}
        <strong>February–March</strong> or <strong>late October–early December</strong> (in the
        northern hemisphere) you'll find materially cheaper inventory across most destinations.
        Counter-intuitively, Christmas Day itself is often one of the quietest, cheapest flying
        days of the year.
      </>
    ),
  },
  {
    icon: ScaleIcon,
    title: 'Compare every airline — and every fare class',
    body: (
      <>
        Airlines price independently and aggressively against each other. Two carriers operating
        the same route on the same day frequently differ by 25%+ on the headline fare. Our search
        compares hundreds of airlines and travel sites in one place, so you don't need to check
        Skyscanner, Google Flights, and the airline's own site separately. Inside a single
        airline, check the fare ladders too — Economy Light is sometimes only $10 cheaper than
        Economy with a bag included, which makes the heavier fare the better deal.
      </>
    ),
  },
  {
    icon: MapPinIcon,
    title: 'Consider alternative airports',
    body: (
      <>
        Low-cost carriers often operate from <strong>secondary airports</strong> with lower
        landing fees and pass the savings on. Examples: London Luton or Stansted instead of
        Heathrow; Newark instead of JFK; Oakland or San Jose instead of San Francisco; Avalon
        instead of Melbourne Tullamarine. Even a 30-minute longer transit from the airport to
        your final destination can pay for itself in fare savings — especially on short-haul
        routes where the absolute saving is a large percentage of the ticket.
      </>
    ),
  },
  {
    icon: MagnifyingGlassIcon,
    title: 'Use the search the way it’s designed',
    body: (
      <>
        Take advantage of the filters: filter by stops, departure time bucket, airline, and
        maximum trip duration to narrow down to genuinely usable options without manually
        scrolling through hundreds of offers. If you're seeing only expensive results, widen
        date range, allow one connection, or toggle "Allow overnight stopovers" before
        compromising on destination. Save the search and check back over a few days — most
        airlines reprice inventory at least once every 24 hours, and dropping notifications when
        a fare cheapens can save you hundreds.
      </>
    ),
  },
]

const QUICK_RULES = [
  { label: 'Book at least', value: '3 weeks out for domestic', tone: 'orange' },
  { label: 'Or', value: '8–12 weeks out for long-haul', tone: 'orange' },
  { label: 'Cheapest days to depart', value: 'Tue, Wed, Sat', tone: 'emerald' },
  { label: 'Most expensive days', value: 'Fri, Sun', tone: 'rose' },
  { label: 'Cheapest time of day', value: 'Red-eye / early morning', tone: 'emerald' },
  { label: 'Most expensive time', value: 'Late afternoon / early evening', tone: 'rose' },
]

export default function LowFareTipsPage() {
  return (
    <main className="bg-neutral-50 pb-16 dark:bg-neutral-950">
      <div className="container py-10 lg:py-14">
        <nav className="mb-4 text-xs text-neutral-500">
          <Link href="/" className="hover:text-orange-600">
            Home
          </Link>{' '}
          · Low fare tips
        </nav>

        {/* Hero */}
        <header>
          <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
            Cheap flight guide
          </p>
          <h1 className="mt-3 text-[3rem] font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Low fare tips
          </h1>
          <p className="mt-4 text-base text-neutral-600 dark:text-neutral-400">
            Seven practical tactics our team uses to find the lowest available fare — when to
            book, when to fly, which airports to consider, and how to make the search engine work
            for you instead of against you.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/flight-search"
              className="inline-flex items-center gap-1.5 rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-600"
            >
              Start a flight search
              <ArrowRightIcon className="size-4" />
            </Link>
          </div>
        </header>

        {/* Quick rules */}
        <section className="mt-10">
          <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
            Quick rules of thumb
          </h2>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {QUICK_RULES.map((r) => (
              <div
                key={r.label}
                className="rounded-[4px] border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
                  {r.label}
                </div>
                <div
                  className={`mt-1 text-sm font-semibold ${
                    r.tone === 'emerald'
                      ? 'text-emerald-700 dark:text-emerald-300'
                      : r.tone === 'rose'
                        ? 'text-rose-700 dark:text-rose-300'
                        : 'text-orange-700 dark:text-orange-300'
                  }`}
                >
                  {r.value}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tips list */}
        <section className="mt-12">
          <ol className="space-y-8">
            {TIPS.map((tip, idx) => (
              <li
                key={tip.title}
                className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900 sm:p-7"
              >
                <div className="flex items-start gap-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-300">
                    <tip.icon className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Tip {idx + 1}
                    </div>
                    <h3 className="mt-0.5 text-lg font-bold text-neutral-900 dark:text-neutral-100">
                      {tip.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                      {tip.body}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* CTA */}
        <section className="mt-12 rounded-2xl border border-neutral-200 bg-white p-6 text-center dark:border-neutral-800 dark:bg-neutral-900 sm:p-8">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
            Ready to put these to work?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-neutral-600 dark:text-neutral-400">
            Run a search across hundreds of airlines, filter by stops and time of day, and watch
            for fare drops on your saved route. Every tactic above is built into NXT.DEALS — you
            don't need to keep multiple tabs open.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link
              href="/flight-search"
              className="inline-flex items-center gap-1.5 rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-600"
            >
              Search flights now
              <ArrowRightIcon className="size-4" />
            </Link>
            <Link
              href="/airlines/top-50"
              className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-5 py-2 text-sm font-semibold text-neutral-700 hover:border-orange-400 hover:text-orange-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
            >
              Browse airlines
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
