'use client'

import { useInteractOutside } from '@/hooks/useInteractOutside'
import { Divider } from '@/shared/divider'
import T from '@/utils/getT'
import * as Headless from '@headlessui/react'
import { MapPinIcon } from '@heroicons/react/24/outline'
import { Airplane01Icon, Building01Icon, Location01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import clsx from 'clsx'
import _ from 'lodash'
import { FC, useCallback, useEffect, useRef, useState } from 'react'
import { ClearDataButton } from './ClearDataButton'

type Place = {
  id: string
  type: 'airport' | 'city'
  name: string
  iata_code: string
  city_name?: string
  iata_country_code?: string
}

const styles = {
  button: {
    base: 'relative z-10 shrink-0 w-full cursor-pointer flex items-center gap-x-3 focus:outline-hidden text-start',
    focused: 'rounded-full bg-transparent focus-visible:outline-hidden dark:bg-white/5 custom-shadow-1',
    default: 'px-7 py-4 xl:px-8 xl:py-6',
    small: 'py-3 px-7 xl:px-8',
  },
  input: {
    base: 'block w-full truncate border-none bg-transparent p-0 font-semibold placeholder-neutral-800 focus:placeholder-neutral-300 focus:ring-0 focus:outline-hidden dark:placeholder-neutral-200',
    default: 'text-base xl:text-lg',
    small: 'text-base',
  },
  panel: {
    base: 'absolute start-0 top-full z-40 mt-3 hidden-scrollbar max-h-96 overflow-y-auto rounded-3xl bg-white py-3 shadow-xl transition duration-150 data-closed:translate-y-1 data-closed:opacity-0 dark:bg-neutral-800',
    default: 'w-lg sm:py-6',
    small: 'w-md sm:py-5',
  },
}

interface Props {
  inputName: string
  placeholder?: string
  description?: string
  className?: string
  fieldStyle: 'default' | 'small'
}

function placeLabel(p: Place): string {
  if (p.type === 'city') {
    return `${p.name} (${p.iata_code})`
  }
  const city = p.city_name ? `${p.city_name} ` : ''
  return `${city}${p.name} (${p.iata_code})`
}

export const AirportAutocompleteField: FC<Props> = ({
  inputName,
  placeholder = T['HeroSearchForm']['Location'],
  description = T['HeroSearchForm']['Where are you going?'],
  className = 'flex-1',
  fieldStyle = 'default',
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [showPopover, setShowPopover] = useState(false)
  const [selected, setSelected] = useState<Place | null>(null)
  const [query, setQuery] = useState('')
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(false)

  const closePopover = useCallback(() => setShowPopover(false), [])
  useInteractOutside(containerRef, closePopover)

  useEffect(() => {
    const t = setTimeout(() => {
      if (showPopover && inputRef.current) inputRef.current.focus()
    }, 200)
    return () => clearTimeout(t)
  }, [showPopover])

  const fetchSuggestions = useCallback(
    _.debounce(async (q: string) => {
      if (!q || q.trim().length < 2) {
        setPlaces([])
        return
      }
      setLoading(true)
      try {
        const r = await fetch(`/api/places/suggestions?q=${encodeURIComponent(q.trim())}`)
        if (!r.ok) {
          setPlaces([])
          return
        }
        const json = (await r.json()) as { data?: Place[] }
        setPlaces(json.data ?? [])
      } catch {
        setPlaces([])
      } finally {
        setLoading(false)
      }
    }, 250),
    []
  )

  useEffect(() => () => fetchSuggestions.cancel(), [fetchSuggestions])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setQuery(v)
    setShowPopover(true)
    if (selected) setSelected(null)
    fetchSuggestions(v)
  }

  // Hidden form value: prefer the picked place's IATA code; fall back to whatever the user typed (uppercased).
  const formValue = selected?.iata_code ?? query.trim().toUpperCase()

  return (
    <div
      className={`group relative z-10 flex ${className}`}
      ref={containerRef}
      {...(showPopover && { 'data-open': 'true' })}
    >
      <Headless.Combobox
        value={selected}
        onChange={(value: Place | null) => {
          setSelected(value)
          if (value) {
            setQuery(placeLabel(value))
            setShowPopover(false)
            setTimeout(() => inputRef.current?.blur(), 50)
          }
        }}
      >
        <div
          onMouseDown={() => setShowPopover(true)}
          onTouchStart={() => setShowPopover(true)}
          className={clsx(styles.button.base, styles.button[fieldStyle], showPopover && styles.button.focused)}
        >
          {fieldStyle === 'default' && (
            <MapPinIcon className="size-5 text-neutral-300 lg:size-7 dark:text-neutral-400" />
          )}

          <div className="grow">
            <Headless.ComboboxInput
              ref={inputRef}
              aria-label="Search for an airport or city"
              className={clsx(styles.input.base, styles.input[fieldStyle])}
              placeholder={placeholder}
              autoComplete="off"
              displayValue={(item: Place | null) => (item ? placeLabel(item) : query)}
              onChange={handleInputChange}
            />
            <div className="mt-0.5 text-start text-sm font-light text-neutral-400">
              <span className="line-clamp-1">{description}</span>
            </div>

            <ClearDataButton
              className={clsx(!selected && !query && 'sr-only')}
              onClick={() => {
                setSelected(null)
                setQuery('')
                setPlaces([])
                setShowPopover(false)
                inputRef.current?.focus()
              }}
            />
          </div>
        </div>

        {/* Hidden input — this is what the form actually submits. */}
        <input type="hidden" name={inputName} value={formValue} />

        <Headless.Transition show={showPopover} unmount={false}>
          <div className={clsx(styles.panel.base, styles.panel[fieldStyle])}>
            {loading && (
              <p className="px-4 py-2 text-xs/6 font-normal text-neutral-500 sm:px-8 dark:text-neutral-400">
                Searching…
              </p>
            )}
            {!loading && query.trim().length >= 2 && places.length === 0 && (
              <p className="px-4 py-2 text-xs/6 font-normal text-neutral-500 sm:px-8 dark:text-neutral-400">
                No matches. Type a city name (e.g. London) or an IATA code (e.g. LHR).
              </p>
            )}
            {!loading && query.trim().length < 2 && (
              <p className="mt-2 mb-3 px-4 text-xs/6 font-normal text-neutral-600 sm:mt-0 sm:px-8 dark:text-neutral-400">
                Start typing a city or airport name.
              </p>
            )}
            {places.length > 0 && <Divider className="opacity-50" />}
            <Headless.ComboboxOptions static unmount={false}>
              {places.map((p) => (
                <Headless.ComboboxOption
                  key={p.id}
                  value={p}
                  className="flex items-center gap-3 p-4 data-focus:bg-neutral-100 sm:gap-4.5 sm:px-8 dark:data-focus:bg-neutral-700"
                >
                  <HugeiconsIcon
                    icon={p.type === 'city' ? Building01Icon : p.type === 'airport' ? Airplane01Icon : Location01Icon}
                    className="size-4 text-neutral-400 sm:size-6 dark:text-neutral-500"
                  />
                  <span className="block font-medium text-neutral-700 dark:text-neutral-200">{placeLabel(p)}</span>
                </Headless.ComboboxOption>
              ))}
            </Headless.ComboboxOptions>
          </div>
        </Headless.Transition>
      </Headless.Combobox>
    </div>
  )
}
