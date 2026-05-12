'use client'

import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import { UserIcon } from '@heroicons/react/24/outline'
import { AirplaneTakeOffIcon } from '@/components/icons/AirplaneTakeOffIcon'
import { BedroomIcon } from '@/components/icons/BedroomIcon'
import clsx from 'clsx'
import { useRouter } from 'next/navigation'
import { FC, useEffect, useState } from 'react'
import { DateRangePopover } from './ui/DateRangePopover'
import { StayDestinationInput } from './ui/StayDestinationInput'

export interface StaySearchFormInitial {
  destinationQuery?: string
  checkInDate?: string // YYYY-MM-DD
  checkOutDate?: string
  rooms?: number
  guests?: number
}

interface Props {
  className?: string
  formStyle?: 'default' | 'small'
  openInNewTab?: boolean
  initial?: StaySearchFormInitial
  onSwitchToFlights?: () => void
  /**
   * Visual treatment.
   * - `hero` (default): full card with mode-icon row.
   * - `compact`: results-page treatment — no surrounding card, no mode icons.
   */
  variant?: 'hero' | 'compact'
}

const inputClass =
  'w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100'

const labelClass = 'mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300'

const CountRow: FC<{
  label: string
  hint?: string
  value: number
  onChange: (n: number) => void
  min: number
  max?: number
}> = ({ label, hint, value, onChange, min, max }) => {
  const atMax = typeof max === 'number' && value >= max
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <div className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">{label}</div>
        {hint ? <div className="text-xs text-neutral-500">{hint}</div> : null}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(value - 1)}
          disabled={value <= min}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 text-lg disabled:cursor-not-allowed disabled:opacity-40 hover:border-orange-500 hover:text-orange-500"
          aria-label={`Decrease ${label.toLowerCase()}`}
        >
          −
        </button>
        <span className="min-w-6 text-center text-sm font-semibold tabular-nums">{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          disabled={atMax}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 text-lg disabled:cursor-not-allowed disabled:opacity-40 hover:border-orange-500 hover:text-orange-500"
          aria-label={`Increase ${label.toLowerCase()}`}
        >
          +
        </button>
      </div>
    </div>
  )
}

const fromIso = (s?: string): Date | null => {
  if (!s) return null
  const [y, m, d] = s.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

const toIso = (d: Date | null): string =>
  d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` : ''

export const StaySearchForm: FC<Props> = ({
  className,
  openInNewTab = true,
  initial,
  onSwitchToFlights,
  variant = 'hero',
}) => {
  const isCompact = variant === 'compact'
  const router = useRouter()

  const [rooms, setRooms] = useState(Math.max(1, initial?.rooms ?? 1))
  const [guests, setGuests] = useState(Math.max(1, initial?.guests ?? 2))
  const [startDate, setStartDate] = useState<Date | null>(fromIso(initial?.checkInDate))
  const [endDate, setEndDate] = useState<Date | null>(fromIso(initial?.checkOutDate))
  // Initial value for the destination field: prefer the prop, then async-resolved IP city.
  const [destinationDefault, setDestinationDefault] = useState<string | undefined>(
    initial?.destinationQuery
  )

  // Detect visitor's city via the server-side /api/geo/city endpoint, which
  // reads X-Forwarded-For + caches lookups + dodges the CORS/rate-limit issues
  // of calling ipapi.co directly from the browser.
  useEffect(() => {
    if (initial?.destinationQuery) return
    let cancelled = false
    ;(async () => {
      try {
        const r = await fetch('/api/geo/city')
        if (!r.ok) return
        const data = (await r.json()) as { city?: string | null }
        if (data.city && !cancelled) setDestinationDefault(data.city)
      } catch {
        // Network error — silently leave the field empty.
      }
    })()
    return () => {
      cancelled = true
    }
  }, [initial?.destinationQuery])

  // Default to a 3-night stay starting 30 days out.
  useEffect(() => {
    if (initial?.checkInDate || startDate) return
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const checkIn = new Date(today)
    checkIn.setDate(today.getDate() + 30)
    setStartDate(checkIn)
    if (!initial?.checkOutDate && !endDate) {
      const checkOut = new Date(today)
      checkOut.setDate(today.getDate() + 33)
      setEndDate(checkOut)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const destination = ((formData.get('destination') as string | null) ?? '').trim()
    const checkInDate = toIso(startDate)
    const checkOutDate = toIso(endDate)

    if (!destination) return

    const params = new URLSearchParams()
    params.set('destinationQuery', destination)
    if (checkInDate) params.set('checkInDate', checkInDate)
    if (checkOutDate) params.set('checkOutDate', checkOutDate)
    params.set('rooms', String(Math.max(1, rooms)))
    params.set('guests', String(Math.max(1, guests)))

    const url = `/stay-search?${params.toString()}`
    if (openInNewTab) {
      window.open(url, '_blank', 'noopener,noreferrer')
    } else {
      router.push(url)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={clsx(
        'w-full',
        !isCompact && 'rounded-2xl bg-neutral-50 p-6 sm:p-8 dark:bg-neutral-900',
        className
      )}
    >
      {!isCompact && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {onSwitchToFlights ? (
              <button
                type="button"
                aria-label="Flights"
                onClick={onSwitchToFlights}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-neutral-300 text-neutral-500 hover:border-orange-500 hover:text-orange-500 dark:border-neutral-700"
              >
                <AirplaneTakeOffIcon className="size-5" />
              </button>
            ) : null}
            <button
              type="button"
              aria-pressed="true"
              aria-label="Stays"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-white shadow-sm"
            >
              <BedroomIcon className="size-5" />
            </button>
          </div>
        </div>
      )}

      {/* Field grid — 8 cols on lg: destination=3, dates=2, travellers=2,
          search=1. Mirrors the FlightSearchForm pill layout. */}
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-8">
        <div className="sm:col-span-2 lg:col-span-3">
          <StayDestinationInput
            /* Re-mount once when geolocation resolves so defaultValue is honoured. */
            key={`destination-${destinationDefault ?? 'pending'}`}
            inputName="destination"
            label="Where to?"
            placeholder="Sydney, Paris, Tokyo…"
            defaultValue={destinationDefault}
          />
        </div>

        <div className="lg:col-span-2">
          <DateRangePopover
            tripType="return"
            startDate={startDate}
            endDate={endDate}
            onChange={({ start, end }) => {
              setStartDate(start)
              setEndDate(end)
            }}
          />
        </div>

        <Popover className="relative lg:col-span-2">
          <PopoverButton
            type="button"
            className="group relative flex w-full items-center gap-3 rounded-lg border border-neutral-300 bg-white px-4 py-2 text-left transition-colors hover:border-neutral-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-neutral-600 dark:bg-neutral-800 dark:hover:border-neutral-500"
          >
            <UserIcon className="size-5 shrink-0 text-neutral-500 dark:text-neutral-400" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <span className="block truncate text-[11px] font-medium leading-tight text-neutral-700 dark:text-neutral-300">
                Travellers
              </span>
              <span className="block truncate text-base font-semibold text-neutral-900 dark:text-neutral-100">
                {guests} {guests === 1 ? 'traveller' : 'travellers'}, {rooms}{' '}
                {rooms === 1 ? 'room' : 'rooms'}
              </span>
            </div>
          </PopoverButton>
          <PopoverPanel
            anchor={{ to: 'bottom start', gap: 8 }}
            className="z-50 w-80 rounded-lg border border-neutral-200 bg-white p-4 shadow-xl dark:border-neutral-700 dark:bg-neutral-900"
          >
            <CountRow
              label="Rooms"
              value={rooms}
              onChange={(n) => setRooms(Math.max(1, Math.min(8, n)))}
              min={1}
              max={8}
            />
            <CountRow
              label="Guests"
              hint="adults + children"
              value={guests}
              onChange={(n) => setGuests(Math.max(1, Math.min(16, n)))}
              min={1}
              max={16}
            />
          </PopoverPanel>
        </Popover>

        <button
          type="submit"
          className="inline-flex h-10 w-full items-center justify-center self-center rounded-full bg-blue-600 px-5 text-sm font-semibold !text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Search
        </button>
      </div>
    </form>
  )
}
