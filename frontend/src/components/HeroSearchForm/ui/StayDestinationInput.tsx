'use client'

import _ from 'lodash'
import { MapPinIcon, XMarkIcon } from '@heroicons/react/24/outline'
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

// The Duffel Stays search endpoint geocodes a free-text "destinationQuery"
// via Nominatim, which resolves city/area names well but not bare IATA codes.
// So on selection we submit the city/place name, not the IATA code.
const submittedValueFor = (p: Place): string => p.city_name || p.name

export const StayDestinationInput: FC<Props> = ({
  inputName,
  label,
  placeholder = '',
  defaultValue = '',
}) => {
  const [displayValue, setDisplayValue] = useState(defaultValue)
  const [submitValue, setSubmitValue] = useState(defaultValue)
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

  // If an IATA-style default comes in (e.g. from IP geolocation),
  // resolve it to a city name once so the user sees "Bangkok (BKK)".
  useEffect(() => {
    if (!defaultValue || hasSelection) return
    if (defaultValue.length < 2) return
    let cancelled = false
    ;(async () => {
      try {
        const r = await fetch(`/api/places/suggestions?q=${encodeURIComponent(defaultValue)}`)
        if (!r.ok) return
        const json = (await r.json()) as { data?: Place[] }
        const match =
          json.data?.find((p) => p.iata_code.toUpperCase() === defaultValue.toUpperCase()) ??
          json.data?.[0]
        if (match && !cancelled) {
          setDisplayValue(formatPlace(match))
          setSubmitValue(submittedValueFor(match))
          setHasSelection(true)
        }
      } catch {
        // Network/parse error — leave the typed display in place.
      }
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValue])

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value
    setDisplayValue(next)
    setSubmitValue(next)
    setHasSelection(false)
    setOpen(true)
    fetchPlaces(next)
  }

  const select = (p: Place) => {
    setDisplayValue(formatPlace(p))
    setSubmitValue(submittedValueFor(p))
    setHasSelection(true)
    setOpen(false)
    setPlaces([])
  }

  const clear = () => {
    setDisplayValue('')
    setSubmitValue('')
    setHasSelection(false)
    setPlaces([])
    setOpen(false)
    inputRef.current?.focus()
  }

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative flex items-center gap-3 rounded-lg border border-neutral-300 bg-white px-4 py-2 focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500 dark:border-neutral-600 dark:bg-neutral-800">
        <MapPinIcon className="size-5 shrink-0 text-neutral-500 dark:text-neutral-400" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          {/* Reserve vertical space for the label row even when empty so the
              pill height matches sibling fields (Dates / Travellers). When
              empty the label is invisible but still occupies the row. */}
          <label
            className={
              displayValue
                ? 'block text-[11px] font-medium leading-tight text-neutral-700 dark:text-neutral-300'
                : 'invisible block text-[11px] font-medium leading-tight'
            }
            aria-hidden={!displayValue}
          >
            {label}
          </label>
          <input
            ref={inputRef}
            type="text"
            value={displayValue}
            onChange={onChange}
            onFocus={() => displayValue.trim().length >= 2 && setOpen(true)}
            placeholder={displayValue ? '' : label}
            aria-label={label}
            autoComplete="off"
            spellCheck={false}
            className="w-full border-none bg-transparent p-0 pr-6 text-base font-semibold text-neutral-900 placeholder:font-normal placeholder:text-neutral-500 focus:outline-none focus:ring-0 dark:text-neutral-100 dark:placeholder:text-neutral-400"
          />
        </div>
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
      <input type="hidden" name={inputName} value={submitValue} />
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
