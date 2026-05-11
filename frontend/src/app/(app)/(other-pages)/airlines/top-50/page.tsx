import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import type { Metadata } from 'next'
import Link from 'next/link'

import { AirlineGrid } from '@/components/AirlineGrid'
import { hasSupplement } from '@/data/airlineSupplement'
import { listAllAirlines } from '@/lib/duffel'

export const revalidate = 86_400

export const metadata: Metadata = {
  title: 'Top 50 Airlines',
  description:
    'The top global airlines — alliance carriers and major commercial operators — bookable through NXT.DEALS.',
}

export default async function Top50AirlinesPage() {
  const all = await listAllAirlines()
  const top = all
    .filter((a) => hasSupplement(a.iata_code))
    .sort((a, b) => a.name.localeCompare(b.name))

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
          · Top 50
        </nav>

        <header>
          <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">Airlines</p>
          <h1 className="mt-3 text-[2rem] font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Top 50 Airlines
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-neutral-600 dark:text-neutral-400">
            The {top.length} major commercial carriers we curate — Star Alliance, oneworld,
            SkyTeam, and the biggest unaffiliated names. Tap any airline for alliance, hubs,
            conditions of carriage, and a pre-filtered flight search.
          </p>
        </header>

        <section className="mt-10">
          <AirlineGrid airlines={top} />
        </section>

        <div className="mt-10 flex justify-center">
          <Link
            href="/airlines"
            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-5 py-2 text-sm font-semibold text-neutral-700 hover:border-orange-400 hover:text-orange-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
          >
            <ArrowLeftIcon className="size-4" />
            Back to all airlines
          </Link>
        </div>
      </div>
    </main>
  )
}
