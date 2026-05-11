'use client'

import { ArrowRightIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useMemo, useState } from 'react'

import { AirlineGrid } from '@/components/AirlineGrid'
import type { Airline } from '@/lib/duffel'

const PAGE_SIZE = 60
const TOP_PREVIEW = 12 // 3 rows × 4 columns

export function AirlinesDirectory({ top, all }: { top: Airline[]; all: Airline[] }) {
  const [query, setQuery] = useState('')
  const [letter, setLetter] = useState<string | null>(null)
  const [visible, setVisible] = useState(PAGE_SIZE)

  // Alphabetise both buckets up front. Duffel returns by internal id which
  // is meaningless to users.
  const topSorted = useMemo(
    () => [...top].sort((a, b) => a.name.localeCompare(b.name)),
    [top],
  )
  const allSorted = useMemo(
    () => [...all].sort((a, b) => a.name.localeCompare(b.name)),
    [all],
  )

  const matchesQuery = (a: Airline) => {
    const q = query.trim().toLowerCase()
    if (letter) {
      const first = (a.name[0] ?? '').toUpperCase()
      if (first !== letter) return false
    }
    if (!q) return true
    return (
      a.name.toLowerCase().includes(q) ||
      (a.iata_code ?? '').toLowerCase().includes(q)
    )
  }

  const topFiltered = useMemo(() => topSorted.filter(matchesQuery), [topSorted, query, letter])
  const allFiltered = useMemo(() => allSorted.filter(matchesQuery), [allSorted, query, letter])

  const letters = useMemo(() => {
    const set = new Set<string>()
    for (const a of allSorted) {
      const first = (a.name[0] ?? '').toUpperCase()
      if (first.match(/[A-Z]/)) set.add(first)
    }
    return Array.from(set).sort()
  }, [allSorted])

  const allShown = allFiltered.slice(0, visible)
  const searchActive = query.trim().length > 0 || letter !== null

  return (
    <main className="bg-neutral-50 pb-16 dark:bg-neutral-950">
      <div className="container py-6">
        <header>
          <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">Airlines</p>
          <h1 className="mt-3 text-[2rem] font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Airline directory
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-neutral-600 dark:text-neutral-400">
            {allSorted.length.toLocaleString()} airlines available through our flight search. Tap
            an airline to view its conditions of carriage and find flights operated by it.
          </p>
        </header>

        {/* Toolbar */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setVisible(PAGE_SIZE)
              }}
              placeholder="Search by name or IATA code (e.g. BA, Qantas)"
              className="w-full rounded-full border border-neutral-200 bg-white py-2.5 pl-9 pr-3 text-sm placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:border-neutral-700 dark:bg-neutral-900"
            />
          </div>
        </div>

        {/* A–Z filter */}
        <div className="mt-4 flex flex-wrap justify-center gap-1">
          <button
            type="button"
            onClick={() => {
              setLetter(null)
              setVisible(PAGE_SIZE)
            }}
            className={`rounded-md px-2 py-1 text-xs font-semibold transition-colors ${
              letter === null
                ? 'bg-orange-500 text-white'
                : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
            }`}
          >
            All
          </button>
          {letters.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => {
                setLetter(l === letter ? null : l)
                setVisible(PAGE_SIZE)
              }}
              className={`rounded-md px-2 py-1 text-xs font-semibold transition-colors ${
                letter === l
                  ? 'bg-orange-500 text-white'
                  : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Top airlines — hidden when a search/letter filter is active so the
            "all" section is the single source of results and you don't see
            an airline twice. */}
        {!searchActive && topFiltered.length > 0 ? (
          <section className="mt-10">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                Top airlines
              </h2>
              <span className="text-xs text-neutral-500">{topFiltered.length} carriers</span>
            </div>
            <AirlineGrid airlines={topFiltered.slice(0, TOP_PREVIEW)} />
            {topFiltered.length > TOP_PREVIEW ? (
              <div className="mt-4 flex justify-end">
                <Link
                  href="/airlines/top-50"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-600 hover:underline dark:text-orange-400"
                >
                  View all top airlines
                  <ArrowRightIcon className="size-4" />
                </Link>
              </div>
            ) : null}
          </section>
        ) : null}

        {/* All airlines */}
        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
              {searchActive ? 'Results' : 'All airlines'}
            </h2>
            <span className="text-xs text-neutral-500">
              {searchActive
                ? `${allFiltered.length.toLocaleString()} match`
                : `${allSorted.length.toLocaleString()} total`}
            </span>
          </div>

          {allFiltered.length === 0 ? (
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-center text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900">
              No airlines match. Try clearing the search or letter filter.
            </div>
          ) : (
            <>
              <AirlineGrid airlines={allShown} />
              {allFiltered.length > visible ? (
                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setVisible((n) => n + PAGE_SIZE)}
                    className="rounded-lg border border-neutral-300 bg-white px-5 py-2 text-sm font-semibold text-neutral-700 hover:border-orange-400 hover:text-orange-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
                  >
                    Show more ({(allFiltered.length - visible).toLocaleString()} remaining)
                  </button>
                </div>
              ) : null}
            </>
          )}
        </section>
      </div>
    </main>
  )
}

