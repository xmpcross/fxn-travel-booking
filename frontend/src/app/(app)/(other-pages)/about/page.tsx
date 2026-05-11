import {
  ChartBarIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn more about NXT.DEALS — who we are and what we do.',
}

const VALUES = [
  {
    title: 'Transparent pricing',
    description:
      'No hidden fees, no padded markups. The price you see is the price you pay — taxes and fees included by default.',
    icon: ShieldCheckIcon,
  },
  {
    title: 'Global inventory',
    description:
      'We aggregate live availability from hundreds of airlines and accommodation partners worldwide so you can compare in one place.',
    icon: GlobeAltIcon,
  },
  {
    title: 'Smart search',
    description:
      'Filters that actually matter — price, refundability, board type, review score — designed to help you decide quickly.',
    icon: SparklesIcon,
  },
  {
    title: 'Built on data',
    description:
      'We track fare and rate movements over time, so the deals you see are the ones worth booking, not just the loudest.',
    icon: ChartBarIcon,
  },
]

export default function AboutPage() {
  return (
    <main className="container py-12 lg:py-16">
      {/* Hero */}
      <section className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">About us</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl dark:text-neutral-100">
          Helping travellers find the right trip, fast.
        </h1>
        <p className="mt-6 text-lg text-neutral-600 dark:text-neutral-400">
          NXT.DEALS is a comparison platform for flights and stays. We pull live inventory from
          hundreds of airline and accommodation partners and surface the options that genuinely fit
          your dates, budget, and preferences.
        </p>
      </section>

      {/* What we do */}
      <section className="mt-16 grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 sm:text-3xl dark:text-neutral-100">
            What we do
          </h2>
          <p className="mt-4 text-base text-neutral-600 dark:text-neutral-400">
            We connect travellers to live flight offers and hotel rates through a single search
            box. Behind the scenes, each search fans out to airline and accommodation providers in
            real time, returning fares and rates you can book on the spot.
          </p>
          <p className="mt-4 text-base text-neutral-600 dark:text-neutral-400">
            Pricing is shown the way it should be: total cost up front, all taxes and fees rolled
            in, with clear refund rules per fare. No surprises at checkout.
          </p>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 sm:text-3xl dark:text-neutral-100">
            Who we&apos;re for
          </h2>
          <p className="mt-4 text-base text-neutral-600 dark:text-neutral-400">
            Whether you&apos;re planning a last-minute weekend or a multi-stop itinerary across
            continents, NXT.DEALS is built to make comparing options painless. We&apos;re designed
            for the kind of traveller who reads fare conditions before booking — and who&apos;d
            rather spend ten extra minutes on the trip than on the booking process.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold text-neutral-900 sm:text-3xl dark:text-neutral-100">
          What we stand for
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((value) => (
            <article
              key={value.title}
              className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="inline-flex size-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400">
                <value.icon className="size-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-neutral-900 dark:text-neutral-100">
                {value.title}
              </h3>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                {value.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* By the numbers */}
      <section className="mt-16 rounded-3xl bg-neutral-50 px-6 py-12 sm:px-12 dark:bg-neutral-900">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 text-center sm:grid-cols-4">
          {[
            { label: 'Airlines', value: '400+' },
            { label: 'Hotels', value: '1M+' },
            { label: 'Destinations', value: '200+' },
            { label: 'Currencies', value: '12' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl font-bold text-neutral-900 sm:text-4xl dark:text-neutral-100">
                {stat.value}
              </div>
              <div className="mt-1 text-sm text-neutral-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Company info */}
      <section className="mt-16">
        <div className="mx-auto max-w-3xl rounded-2xl border border-neutral-200 bg-white p-6 text-sm text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400 sm:p-8">
          <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
            Operating entity
          </h2>
          <p className="mt-3">
            NXT.DEALS is a trading name of <strong>FXN Holdings Limited</strong>, a company
            registered in England and Wales.
          </p>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Company number
              </dt>
              <dd>16134139</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                VAT number
              </dt>
              <dd>GB500441452</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Registered office
              </dt>
              <dd>61 Bridge Street, Kington, HR5 3DJ, United Kingdom</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* CTA */}
      <section className="mt-16 text-center">
        <h2 className="text-2xl font-bold text-neutral-900 sm:text-3xl dark:text-neutral-100">
          Ready to find your next trip?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-base text-neutral-600 dark:text-neutral-400">
          Start with a flight or a stay — or both. Search is free, no account needed.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a
            href="/flights"
            className="rounded-full bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-600"
          >
            Search flights
          </a>
          <a
            href="/stays"
            className="rounded-full border border-neutral-300 bg-white px-6 py-2.5 text-sm font-semibold text-neutral-700 hover:border-orange-400 hover:text-orange-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
          >
            Search stays
          </a>
        </div>
      </section>
    </main>
  )
}
