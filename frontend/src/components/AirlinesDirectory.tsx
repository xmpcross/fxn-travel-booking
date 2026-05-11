'use client'

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useMemo, useState } from 'react'

import type { Airline } from '@/lib/duffel'

const PAGE_SIZE = 60

export function AirlinesDirectory({ airlines }: { airlines: Airline[] }) {
  const [query, setQuery] = useState('')
  const [letter, setLetter] = useState<string | null>(null)
  const [logosOnly, setLogosOnly] = useState(true)
  const [visible, setVisible] = useState(PAGE_SIZE)

  // Sort once, alphabetical by name. Duffel returns by id which is meaningless.
  const sorted = useMemo(
    () => [...airlines].sort((a, b) => a.name.localeCompare(b.name)),
    [airlines],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return sorted.filter((a) => {
      if (logosOnly && !a.logo_lockup_url && !a.logo_symbol_url) return false
      if (letter) {
        const first = (a.name[0] ?? '').toUpperCase()
        if (first !== letter) return false
      }
      if (!q) return true
      return (
        a.name.toLowerCase().includes(q) ||
        (a.iata_code ?? '').toLowerCase().includes(q)
      )
    })
  }, [sorted, query, letter, logosOnly])

  const letters = useMemo(() => {
    const set = new Set<string>()
    for (const a of sorted) {
      if (logosOnly && !a.logo_lockup_url && !a.logo_symbol_url) continue
      const first = (a.name[0] ?? '').toUpperCase()
      if (first.match(/[A-Z]/)) set.add(first)
    }
    return Array.from(set).sort()
  }, [sorted, logosOnly])

  const shown = filtered.slice(0, visible)

  return (
    <main className="bg-neutral-50 pb-16 dark:bg-neutral-950">
      <div className="container py-6">
        <header className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">Airlines</p>
          <h1 className="mt-3 text-[2rem] font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Airline directory
          </h1>
          <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
            Browse the {sorted.length.toLocaleString()} airlines available through our flight
            search. Tap an airline to view its conditions of carriage and find flights operated by
            it.
          </p>
        </header>

        {/* Toolbar */}
        <div className="mx-auto mt-8 flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-center">
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
          <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
            <input
              type="checkbox"
              checked={logosOnly}
              onChange={(e) => {
                setLogosOnly(e.target.checked)
                setVisible(PAGE_SIZE)
              }}
              className="size-4 rounded border-neutral-300 text-orange-500 focus:ring-orange-500 dark:border-neutral-600 dark:bg-neutral-800"
            />
            <span>Only airlines with logos</span>
          </label>
        </div>

        {/* A–Z filter */}
        <div className="mx-auto mt-4 flex max-w-4xl flex-wrap justify-center gap-1">
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

        <p className="mt-6 text-center text-sm text-neutral-500">
          Showing {Math.min(shown.length, filtered.length).toLocaleString()} of{' '}
          {filtered.length.toLocaleString()}
        </p>

        {/* Grid */}
        <div className="mx-auto mt-4 grid max-w-6xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((a) => {
            const slug = a.iata_code ?? a.id
            const logo = a.logo_lockup_url ?? a.logo_symbol_url
            return (
              <Link
                key={a.id}
                href={`/airlines/${encodeURIComponent(slug)}`}
                className="group flex items-center gap-3 rounded-[4px] border border-neutral-200 bg-white p-3 transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-neutral-50 dark:bg-neutral-800">
                  {logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={logo}
                      alt=""
                      className="max-h-9 max-w-10 object-contain"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-xs font-bold text-neutral-400">
                      {(a.iata_code ?? '??').slice(0, 2)}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-neutral-900 group-hover:text-orange-600 dark:text-neutral-100 dark:group-hover:text-orange-400">
                    {a.name}
                  </div>
                  {a.iata_code ? (
                    <div className="text-xs text-neutral-500">
                      IATA <span className="font-mono">{a.iata_code}</span>
                    </div>
                  ) : null}
                </div>
              </Link>
            )
          })}
        </div>

        {filtered.length === 0 ? (
          <div className="mx-auto mt-8 max-w-md rounded-2xl border border-neutral-200 bg-white p-6 text-center text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900">
            No airlines match. Try clearing the search or letter filter.
          </div>
        ) : null}

        {filtered.length > visible ? (
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={() => setVisible((n) => n + PAGE_SIZE)}
              className="rounded-lg border border-neutral-300 bg-white px-5 py-2 text-sm font-semibold text-neutral-700 hover:border-orange-400 hover:text-orange-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
            >
              Show more ({(filtered.length - visible).toLocaleString()} remaining)
            </button>
          </div>
        ) : null}
      </div>
    </main>
  )
}
