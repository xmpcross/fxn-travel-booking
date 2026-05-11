'use client'

import _ from 'lodash'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { FC, useCallback, useEffect, useRef, useState } from 'react'

type Place = {
  id: string
  type: 'airport' | 'city'
  name: string
  iata_code: string
  city_name?: string
}

interface Props {
  inputName: string
  label: string
  placeholder?: string
  defaultValue?: string
}

const formatPlace = (p: Place): string => `${p.city_name || p.name} (${p.iata_code})`

// Extract the IATA code from a "City (XXX)" display value. Falls back to the
// uppercased raw value (so a bare "PER" still submits as PER).
const extractIata = (raw: string): string => {
  const m = raw.match(/\(([A-Za-z0-9]{3})\)\s*$/)
  return m ? m[1].toUpperCase() : raw.toUpperCase()
}

export const SimpleAirportInput: FC<Props> = ({ inputName, label, placeholder = '', defaultValue = '' }) => {
  // What the user sees in the input. After selection this is "Sydney (SYD)";
  // while typing it's whatever they're typing.
  const [displayValue, setDisplayValue] = useState(defaultValue)
  // The IATA code that actually gets submitted. Mirrors the user's typing
  // (uppercased) when no selection has been made, or the selected place's code.
  const [iataValue, setIataValue] = useState(extractIata(defaultValue))
  const [places, setPlaces] = useState<Place[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [hasSelection, setHasSelection] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const fetchPlaces = useCallback(
    _.debounce(async (q: string) => {
      if (!q || q.trim().length < 2) {
        setPlaces([])
        return
      }
      setLoading(true)
      try {
        const r = await fetch(`/api/places/suggestions?q=${encodeURIComponent(q.trim())}`)
        if (r.ok) {
          const json = (await r.json()) as { data?: Place[] }
          setPlaces(json.data ?? [])
        } else {
          setPlaces([])
        }
      } catch {
        setPlaces([])
      } finally {
        setLoading(false)
      }
    }, 250),
    []
  )

  useEffect(() => () => fetchPlaces.cancel(), [fetchPlaces])

  // If geolocation resolves an initial IATA code after mount, fetch its full
  // name once so we can show "Perth (PER)" instead of just "PER".
  useEffect(() => {
    if (!defaultValue || hasSelection) return
    let cancelled = false
    ;(async () => {
      try {
        const r = await fetch(`/api/places/suggestions?q=${encodeURIComponent(defaultValue)}`)
        if (!r.ok) return
        const json = (await r.json()) as { data?: Place[] }
        const match = json.data?.find((p) => p.iata_code.toUpperCase() === defaultValue.toUpperCase())
        if (match && !cancelled) {
          setDisplayValue(formatPlace(match))
          setIataValue(match.iata_code)
          setHasSelection(true)
        }
      } catch {
        // Network/parse error — leave the IATA-only display as-is.
      }
    })()
    return () => {
      cancelled = true
    }
    // Run once when defaultValue is first available.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValue])

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value
    setDisplayValue(next)
    setIataValue(extractIata(next))
    setHasSelection(false)
    setOpen(true)
    fetchPlaces(next)
  }

  const select = (p: Place) => {
    setDisplayValue(formatPlace(p))
    setIataValue(p.iata_code)
    setHasSelection(true)
    setOpen(false)
    setPlaces([])
  }

  const clear = () => {
    setDisplayValue('')
    setIataValue('')
    setHasSelection(false)
    setPlaces([])
    setOpen(false)
    inputRef.current?.focus()
  }

  return (
    <div className="relative" ref={containerRef}>
      <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">{label}</label>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          onChange={onChange}
          onFocus={() => displayValue.trim().length >= 2 && setOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 pr-9 text-sm font-medium focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
        />
        {displayValue && (
          <button
            type="button"
            onClick={clear}
            aria-label={`Clear ${label}`}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-700 dark:hover:text-neutral-200"
          >
            <XMarkIcon className="size-4" />
          </button>
        )}
      </div>
      {/* Hidden field carries the IATA code to the form submission, so
          downstream `formData.get(inputName)` keeps returning a code. */}
      <input type="hidden" name={inputName} value={iataValue} />
      {open && (loading || places.length > 0) && (
        <div className="absolute z-30 mt-1 max-h-72 w-full min-w-72 overflow-y-auto rounded-lg border border-neutral-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
          {loading && places.length === 0 ? (
            <p className="px-3 py-2 text-xs text-neutral-500">Searching…</p>
          ) : null}
          {places.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => select(p)}
              className="flex w-full items-baseline gap-3 px-3 py-2 text-left text-sm hover:bg-neutral-50 dark:hover:bg-neutral-700"
            >
              <span className="w-10 shrink-0 font-mono text-xs text-neutral-500">{p.iata_code}</span>
              <span className="flex-1 truncate">
                {p.city_name && p.type === 'airport' ? `${p.city_name} · ` : ''}
                {p.name}
              </span>
              {p.type === 'city' && (
                <span className="shrink-0 text-xs text-neutral-400">All airports</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
