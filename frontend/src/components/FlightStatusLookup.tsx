'use client'

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { FormEvent, useState } from 'react'

type Flight = {
  ident?: string
  ident_iata?: string
  ident_icao?: string
  operator?: string
  operator_iata?: string
  status?: string
  aircraft_type?: string
  scheduled_off?: string | null
  scheduled_on?: string | null
  estimated_off?: string | null
  estimated_on?: string | null
  actual_off?: string | null
  actual_on?: string | null
  origin?: { code?: string; code_iata?: string; name?: string; city?: string }
  destination?: { code?: string; code_iata?: string; name?: string; city?: string }
}

type ApiResponse = {
  flights?: Flight[]
  error?: string
  detail?: string
}

function fmtTime(iso?: string | null): string {
  if (!iso) return '—'
  const m = iso.match(/T(\d{2}:\d{2})/)
  return m ? m[1] : iso
}

function fmtDate(iso?: string | null): string {
  if (!iso) return ''
  const m = iso.match(/^(\d{4}-\d{2}-\d{2})/)
  if (!m) return ''
  const d = new Date(`${m[1]}T00:00:00Z`)
  return d.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

export function FlightStatusLookup() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [flights, setFlights] = useState<Flight[] | null>(null)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const ident = query.trim().toUpperCase().replace(/\s+/g, '')
    if (!ident) {
      setError('Enter a flight number.')
      return
    }
    setError(null)
    setLoading(true)
    setFlights(null)
    try {
      const r = await fetch(`/api/flight-status/${encodeURIComponent(ident)}`)
      const data = (await r.json()) as ApiResponse
      if (!r.ok) {
        setError(data.error ?? `Lookup failed (${r.status}).`)
      } else {
        setFlights(data.flights ?? [])
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lookup failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Flight number — e.g. QF1, BA15, EK10"
            className="w-full rounded-full border border-neutral-200 bg-white py-3 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 dark:border-neutral-700 dark:bg-neutral-900"
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Looking up…' : 'Track flight'}
        </button>
      </form>

      {error ? (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
          {error}
        </div>
      ) : null}

      {flights && flights.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-6 text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900">
          No flights found for that flight number in the next 48 hours. Check
          spelling, or try the airline&apos;s ICAO prefix instead (e.g.{' '}
          <span className="font-mono">QFA1</span> for Qantas QF1).
        </div>
      ) : null}

      {flights && flights.length > 0 ? (
        <ul className="mt-6 space-y-4">
          {flights.map((f, idx) => (
            <li
              key={`${f.ident}-${f.scheduled_off ?? idx}`}
              className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <div className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                    {f.ident_iata ?? f.ident}
                    {f.operator_iata ? (
                      <span className="ms-2 text-sm text-neutral-500">
                        {f.operator_iata}
                      </span>
                    ) : null}
                  </div>
                  {f.aircraft_type ? (
                    <p className="text-xs text-neutral-500">
                      Aircraft: {f.aircraft_type}
                    </p>
                  ) : null}
                </div>
                {f.status ? (
                  <span className="inline-flex items-center rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700 dark:bg-orange-950/40 dark:text-orange-300">
                    {f.status}
                  </span>
                ) : null}
              </div>

              <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                <div className="text-left">
                  <div className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                    {fmtTime(f.estimated_off ?? f.actual_off ?? f.scheduled_off)}
                  </div>
                  <div className="text-xs text-neutral-500">
                    {fmtDate(f.estimated_off ?? f.scheduled_off)}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    {f.origin?.code_iata ?? f.origin?.code ?? ''}
                  </div>
                  <div className="truncate text-xs text-neutral-500">
                    {f.origin?.city ?? f.origin?.name ?? ''}
                  </div>
                </div>
                <div className="flex flex-col items-center text-xs text-neutral-400">
                  <span className="h-px w-12 bg-neutral-300 dark:bg-neutral-700" />
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                    {fmtTime(f.estimated_on ?? f.actual_on ?? f.scheduled_on)}
                  </div>
                  <div className="text-xs text-neutral-500">
                    {fmtDate(f.estimated_on ?? f.scheduled_on)}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    {f.destination?.code_iata ?? f.destination?.code ?? ''}
                  </div>
                  <div className="truncate text-xs text-neutral-500">
                    {f.destination?.city ?? f.destination?.name ?? ''}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
