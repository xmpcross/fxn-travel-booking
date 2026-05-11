import {
  ArrowRightIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
  LifebuoyIcon,
  MagnifyingGlassIcon,
  ScaleIcon,
  ShieldCheckIcon,
  Squares2X2Icon,
  StarIcon,
} from '@heroicons/react/24/outline'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'How we work',
  description:
    'How NXT.DEALS compares prices across hundreds of travel sites, ranks results, gathers reviews, and partners with airlines and hotels worldwide.',
}

export default function HowWeWorkPage() {
  return (
    <main className="bg-neutral-50 pb-16 dark:bg-neutral-950">
      <div className="container py-10 lg:py-14">
        <nav className="mb-4 text-xs text-neutral-500">
          <Link href="/" className="hover:text-orange-600">
            Home
          </Link>{' '}
          · How we work
        </nav>

        {/* Hero */}
        <header>
          <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
            Inside NXT.DEALS
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            How we work
          </h1>
          <p className="mt-4 max-w-3xl text-base text-neutral-600 dark:text-neutral-400">
            A simple search on NXT.DEALS scans prices on hundreds of travel sites in seconds.
            Whether you&apos;re looking for flights, stays, car hire, or experiences, we gather
            deals from across the web and put them in one place — so you can compare and pick
            without juggling a dozen browser tabs.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/flight-search"
              className="inline-flex items-center gap-1.5 rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-600"
            >
              Try a search
              <ArrowRightIcon className="size-4" />
            </Link>
            <Link
              href="/advertise"
              className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-700 hover:border-orange-400 hover:text-orange-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
            >
              Partner with us
            </Link>
          </div>
        </header>

        {/* Intro / who we are not */}
        <section className="mt-12">
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900 sm:p-8">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              What we are — and what we&apos;re not
            </h2>
            <div className="mt-4 grid gap-6 lg:grid-cols-2">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  NXT.DEALS is a meta-search and booking platform. We show you live prices from a
                  large network of airlines, hotel providers, OTAs, and aggregators. Providers
                  pay us when a user clicks through or completes a booking, and we offset
                  operating costs with travel-related advertising placements. We do not charge
                  travellers a markup for the service.
                </p>
              </div>
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  For most bookings we are <strong>not the merchant of record</strong>. Your
                  contract for the travel is with the airline or accommodation supplier whose
                  offer you select. We facilitate the search, comparison, and transfer of
                  booking instructions — see our{' '}
                  <Link href="/terms" className="text-orange-600 hover:underline">
                    Terms &amp; Conditions
                  </Link>{' '}
                  for the full picture.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How we recommend & list results */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            How we recommend and list results
          </h2>
          <p className="mt-3 max-w-3xl text-sm text-neutral-600 dark:text-neutral-400">
            Our recommender systems weigh a mix of factors — your location, the parameters of
            your search, live price, supplier popularity, and historical click-through behaviour
            — to surface results that are most likely to be useful. Sponsored placements and
            cost-per-click partnerships influence some lists but never our underlying price data.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <RankCard
              icon={Squares2X2Icon}
              title="Flights"
              recommended="Balances price and convenience: total trip time, number of stops, departure / arrival windows, and supplier ratings. Within a tie, click-through history and partner relationships break the tie."
              cheapest="Pure price-sorted list. The main provider button is the cheapest available; alternative providers for the same offer are listed below it."
            />
            <RankCard
              icon={Squares2X2Icon}
              title="Stays"
              recommended="Ranks by a combination of price, guest review score, popularity (click volume on similar searches), and revenue potential. The cheapest offer for a property is highlighted in blue when it isn't already on the main button."
              cheapest="Lowest-price sort across the matched inventory."
            />
            <RankCard
              icon={Squares2X2Icon}
              title="Cars"
              recommended="Prioritises price, revenue potential, click popularity, and the most-booked car class for the pickup location. Review scores are surfaced where the supplier provides them."
              cheapest="Lowest total price for the rental period."
            />
            <RankCard
              icon={Squares2X2Icon}
              title="Flight + Stay packages"
              recommended="Default sort weighs combined package price, hotel guest ratings, popularity, and partner revenue potential. The aim is the best-value combined trip, not just the cheapest fare."
              cheapest="Lowest combined price."
            />
          </div>
        </section>

        {/* How we get prices */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            How we get our prices
          </h2>
          <div className="mt-4 grid gap-5 lg:grid-cols-3">
            <InfoBlock
              icon={MagnifyingGlassIcon}
              title="Live scans of 700+ sites"
              body="When you submit a search, we fire requests to a wide network of supplier and aggregator APIs in parallel. Most responses arrive within a few seconds — heavier multi-city searches take a little longer."
            />
            <InfoBlock
              icon={ClockIcon}
              title="Caching where it makes sense"
              body="Popular routes and stay searches are partially cached so the first results render fast. Anything you're about to actually book is re-priced from the supplier on selection."
            />
            <InfoBlock
              icon={ScaleIcon}
              title="Honest about gaps"
              body="Occasionally a price changes between the search result and the supplier's checkout, or an inventory item sells out mid-search. Some suppliers we don't list — usually because of technical limitations, contractual restrictions, or recurring customer-satisfaction issues."
            />
          </div>
        </section>

        {/* Reviews & moderation */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            How we get reviews and moderate content
          </h2>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
              <div className="inline-flex size-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-300">
                <StarIcon className="size-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-neutral-900 dark:text-neutral-100">
                Where reviews come from
              </h3>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                We surface reviews from third-party travel sites alongside our own — collected
                directly from customers after a confirmed booking for flights and cars, and from
                a mix of customers and partner platforms for stays. Reviewers must hold an
                account and have a verified reservation. We normalise all incoming ratings to a
                1–10 scale.
              </p>
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
              <div className="inline-flex size-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-300">
                <ShieldCheckIcon className="size-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-neutral-900 dark:text-neutral-100">
                Moderation & retention
              </h3>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                Reviews pass through an automated profanity filter and are screened for
                references to illegal activity, personal information, hate speech, spam, and
                off-topic content. Reviews older than three years are retired automatically, as
                are reviews of properties that have undergone an ownership change or major
                renovation. EU users have an appeal mechanism under Regulation (EU) 2022/2065.
              </p>
            </div>
          </div>
        </section>

        {/* Partners */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            How we work with partner companies
          </h2>
          <p className="mt-3 max-w-3xl text-sm text-neutral-600 dark:text-neutral-400">
            We hold contractual relationships with hundreds of airlines, hotel groups, OTAs, and
            aggregators across the regions we serve. Live inventory is delivered through{' '}
            <strong>Duffel Technology Limited</strong> as our flight and accommodation
            infrastructure partner. Want to feature your inventory or run a campaign with us?
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/airlines"
              className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-5 py-2 text-sm font-semibold text-neutral-700 hover:border-orange-400 hover:text-orange-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
            >
              <GlobeAltIcon className="size-4" />
              See airline partners
            </Link>
            <Link
              href="/advertise"
              className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-5 py-2 text-sm font-semibold text-neutral-700 hover:border-orange-400 hover:text-orange-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
            >
              <ChartBarIcon className="size-4" />
              Advertise with us
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-5 py-2 text-sm font-semibold text-neutral-700 hover:border-orange-400 hover:text-orange-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
            >
              <ChatBubbleLeftRightIcon className="size-4" />
              Get in touch
            </Link>
          </div>
        </section>

        {/* By the numbers */}
        <section className="mt-12 rounded-3xl bg-white p-6 shadow-sm dark:bg-neutral-900 sm:p-10">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            By the numbers
          </h2>
          <p className="mt-2 max-w-3xl text-sm text-neutral-600 dark:text-neutral-400">
            Indicative scale of the inventory and audience we operate against — figures refresh
            periodically as new partners onboard.
          </p>
          <dl className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-4">
            <Stat label="Sites scanned" value="700+" icon={MagnifyingGlassIcon} />
            <Stat label="Airline partners" value="800+" icon={GlobeAltIcon} />
            <Stat label="Markets served" value="40+" icon={Squares2X2Icon} />
            <Stat label="Avg. result latency" value="3–5s" icon={ClockIcon} />
          </dl>
        </section>

        {/* Closing CTA */}
        <section className="mt-12 rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900 sm:p-8">
          <div className="grid items-center gap-4 sm:grid-cols-[1fr_auto]">
            <div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                Need a deeper look?
              </h2>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                For questions on a specific search result, payment, refunds, or anything else,
                drop us a line — we read every message.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-600"
              >
                <LifebuoyIcon className="size-4" />
                Contact us
              </Link>
              <Link
                href="/low-fare-tips"
                className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-700 hover:border-orange-400 hover:text-orange-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
              >
                <CurrencyDollarIcon className="size-4" />
                Low fare tips
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

function RankCard({
  icon: Icon,
  title,
  recommended,
  cheapest,
}: {
  icon: typeof Squares2X2Icon
  title: string
  recommended: string
  cheapest: string
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center gap-3">
        <div className="inline-flex size-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-300">
          <Icon className="size-5" />
        </div>
        <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">{title}</h3>
      </div>
      <dl className="mt-4 space-y-3 text-sm">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Recommended sort
          </dt>
          <dd className="mt-1 text-neutral-700 dark:text-neutral-300">{recommended}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Cheapest / lowest price
          </dt>
          <dd className="mt-1 text-neutral-700 dark:text-neutral-300">{cheapest}</dd>
        </div>
      </dl>
    </div>
  )
}

function InfoBlock({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof MagnifyingGlassIcon
  title: string
  body: string
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="inline-flex size-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-300">
        <Icon className="size-5" />
      </div>
      <h3 className="mt-4 text-base font-bold text-neutral-900 dark:text-neutral-100">{title}</h3>
      <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{body}</p>
    </div>
  )
}

function Stat({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon: typeof MagnifyingGlassIcon
}) {
  return (
    <div>
      <div className="inline-flex size-9 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-300">
        <Icon className="size-4" />
      </div>
      <dt className="mt-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
        {label}
      </dt>
      <dd className="mt-1 text-2xl font-bold text-neutral-900 dark:text-neutral-100">{value}</dd>
    </div>
  )
}
