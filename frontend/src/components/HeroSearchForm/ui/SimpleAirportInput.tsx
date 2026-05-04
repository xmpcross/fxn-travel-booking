'use client'

import _ from 'lodash'
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

export const SimpleAirportInput: FC<Props> = ({ inputName, label, placeholder = '', defaultValue = '' }) => {
  const [value, setValue] = useState(defaultValue)
  const [places, setPlaces] = useState<Place[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

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

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value.toUpperCase()
    setValue(next)
    setOpen(true)
    fetchPlaces(next)
  }

  const select = (p: Place) => {
    setValue(p.iata_code)
    setOpen(false)
    setPlaces([])
  }

  return (
    <div className="relative" ref={containerRef}>
      <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">{label}</label>
      <input
        type="text"
        name={inputName}
        value={value}
        onChange={onChange}
        onFocus={() => value.trim().length >= 2 && setOpen(true)}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm font-medium uppercase tracking-wide focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
      />
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
