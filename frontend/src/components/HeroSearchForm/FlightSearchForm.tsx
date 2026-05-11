'use client'

import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import { ArrowsRightLeftIcon } from '@heroicons/react/24/outline'
import { AirplaneTakeOffIcon } from '@/components/icons/AirplaneTakeOffIcon'
import { BedroomIcon } from '@/components/icons/BedroomIcon'
import clsx from 'clsx'
import Form from 'next/form'
import { useRouter } from 'next/navigation'
import { FC, useEffect, useState } from 'react'
import { DateRangePopover } from './ui/DateRangePopover'
import { SimpleAirportInput } from './ui/SimpleAirportInput'

type CabinClass = 'economy' | 'premium_economy' | 'business' | 'first'

export interface FlightSearchFormInitial {
  origin?: string
  destination?: string
  departureDate?: string // YYYY-MM-DD
  returnDate?: string
  adults?: number
  children?: number
  infants?: number
  cabinClass?: CabinClass
  tripType?: 'return' | 'oneway'
}

interface Props {
  className?: string
  /** Accepted for backward-compat with existing callers; visual style is fixed in the new design. */
  formStyle?: 'default' | 'small'
  /** When true (default), submit opens results in a new tab. When false, navigates in-place. */
  openInNewTab?: boolean
  /** Pre-populate fields (e.g. from current search params on the results page). */
  initial?: FlightSearchFormInitial
  /** Called when the user clicks the Stays tab to switch verticals. */
  onSwitchToStays?: () => void
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

export const FlightSearchForm: FC<Props> = ({ className, openInNewTab = true, initial, onSwitchToStays }) => {
  const router = useRouter()

  const [tripType, setTripType] = useState<'return' | 'oneway'>(
    initial?.tripType ?? (initial?.returnDate ? 'return' : initial?.departureDate ? 'oneway' : 'return')
  )
  const [adults, setAdults] = useState(Math.max(1, initial?.adults ?? 1))
  const [children, setChildren] = useState(Math.max(0, initial?.children ?? 0))
  const [infants, setInfants] = useState(Math.max(0, initial?.infants ?? 0))
  const [cabin, setCabin] = useState<CabinClass>(initial?.cabinClass ?? 'economy')
  const [startDate, setStartDate] = useState<Date | null>(fromIso(initial?.departureDate))
  const [endDate, setEndDate] = useState<Date | null>(fromIso(initial?.returnDate))

  // Sensible defaults: depart 30 days out, return 37 days (1 week trip).
  // Computed client-side via useEffect so SSR/CSR don't disagree on "today".
  useEffect(() => {
    if (initial?.departureDate || startDate) return
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const departure = new Date(today)
    departure.setDate(today.getDate() + 30)
    setStartDate(departure)
    if (!initial?.returnDate && !endDate) {
      const ret = new Date(today)
      ret.setDate(today.getDate() + 37)
      setEndDate(ret)
    }
    // Run once on mount; deps intentionally omitted.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  // Placeholder shown in the From field when it's empty — defaults to "Perth
  // (PER)" and is replaced once geolocation resolves to the visitor's nearest
  // city + IATA (e.g. "Bangkok (BKK)").
  const [originPlaceholder, setOriginPlaceholder] = useState<string>('Perth (PER)')

  // From/To defaults are tracked here so the Swap button can flip them
  // by remounting the two SimpleAirportInputs with new defaultValues.
  const [fromDefault, setFromDefault] = useState<string | undefined>(initial?.origin)
  const [toDefault, setToDefault] = useState<string | undefined>(initial?.destination)
  const [swapCount, setSwapCount] = useState(0)

  const handleSwap = () => {
    // Read whatever the user has actually typed (the form is uncontrolled),
    // fall back to the tracked defaults if the inputs aren't in the DOM yet.
    const fromInput = document.querySelector<HTMLInputElement>(
      'input[name="flying-from-location"]',
    )
    const toInput = document.querySelector<HTMLInputElement>(
      'input[name="flying-to-location"]',
    )
    const currentFrom = (fromInput?.value ?? fromDefault ?? '').trim()
    const currentTo = (toInput?.value ?? toDefault ?? '').trim()
    setFromDefault(currentTo)
    setToDefault(currentFrom)
    setSwapCount((n) => n + 1)
  }

  // Detect visitor's nearest IATA from IP-based geolocation, when the form
  // is rendered without an explicit origin (i.e. on the home page).
  useEffect(() => {
    if (initial?.origin) return // URL takes precedence
    let cancelled = false
    ;(async () => {
      try {
        const ipRes = await fetch('https://ipapi.co/json/')
        if (!ipRes.ok) return
        const ipData = (await ipRes.json()) as { city?: string; country_code?: string }
        const city = ipData.city
        if (!city || cancelled) return

        const placesRes = await fetch(`/api/places/suggestions?q=${encodeURIComponent(city)}`)
        if (!placesRes.ok) return
        const placesData = (await placesRes.json()) as {
          data?: Array<{ iata_code: string; city_name?: string; name?: string }>
        }
        const top = placesData.data?.[0]
        const iata = top?.iata_code
        const placeName = top?.city_name ?? city
        if (iata && !cancelled) {
          const formatted = `${placeName} (${iata})`
          setOriginPlaceholder(formatted)
          // Also pre-fill the From field's defaultValue. SimpleAirportInput
          // extracts the IATA from "City (XXX)" so submission still posts
          // just the code.
          setFromDefault(formatted)
          // Remount via swapCount so the new defaultValue takes effect.
          setSwapCount((n) => n + 1)
        }
      } catch {
        // Network/CORS issues — silently leave the default placeholder.
      }
    })()
    return () => {
      cancelled = true
    }
  }, [initial?.origin])

  const toIso = (d: Date | null): string =>
    d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` : ''

  const handleSubmit = (formData: FormData) => {
    const get = (k: string) => ((formData.get(k) as string | null) ?? '').trim()
    const origin = get('flying-from-location').toUpperCase()
    const destination = get('flying-to-location').toUpperCase()
    const departureDate = toIso(startDate)
    const returnDate = toIso(endDate)

    const params = new URLSearchParams()
    if (origin) params.set('origin', origin)
    if (destination) params.set('destination', destination)
    if (departureDate) params.set('departureDate', departureDate)
    if (tripType === 'return' && returnDate) params.set('returnDate', returnDate)
    params.set('adults', String(Math.max(1, adults)))
    if (children > 0) params.set('children', String(children))
    if (infants > 0) params.set('infants', String(infants))
    params.set('cabinClass', cabin)

    const url = `/flight-search?${params.toString()}`
    if (openInNewTab) {
      // Browsers allow this because submit is a direct user gesture.
      window.open(url, '_blank', 'noopener,noreferrer')
    } else {
      router.push(url)
    }
  }

  return (
    <Form
      action={handleSubmit}
      className={clsx(
        'w-full rounded-2xl bg-[#f7f7f7] p-6 sm:p-8 dark:bg-neutral-900',
        className
      )}
    >
      {/* Top: mode icons + meta line */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-pressed="true"
            aria-label="Flights"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-white shadow-sm"
          >
            <AirplaneTakeOffIcon className="size-5" />
          </button>
          {onSwitchToStays ? (
            <button
              type="button"
              aria-label="Stays"
              onClick={onSwitchToStays}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-neutral-300 text-neutral-500 hover:border-orange-500 hover:text-orange-500 dark:border-neutral-700"
            >
              <BedroomIcon className="size-5" />
            </button>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Prominent trip-type segmented control */}
          <div
            role="radiogroup"
            aria-label="Trip type"
            className="inline-flex rounded-full border border-neutral-300 bg-white p-1 dark:border-neutral-600 dark:bg-neutral-800"
          >
            <button
              type="button"
              role="radio"
              aria-checked={tripType === 'return'}
              onClick={() => setTripType('return')}
              className={clsx(
                'cursor-pointer rounded-full px-4 py-1.5 text-sm font-semibold transition-colors',
                tripType === 'return'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-neutral-700 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-100'
              )}
            >
              Return
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={tripType === 'oneway'}
              onClick={() => setTripType('oneway')}
              className={clsx(
                'cursor-pointer rounded-full px-4 py-1.5 text-sm font-semibold transition-colors',
                tripType === 'oneway'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-neutral-700 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-100'
              )}
            >
              One-way
            </button>
          </div>

        </div>
      </div>

      {/* Field grid */}
      <div
        className={clsx(
          'mt-5 grid gap-3 sm:grid-cols-2',
          tripType === 'return' ? 'lg:grid-cols-6' : 'lg:grid-cols-5'
        )}
      >
        {/* From + To live in a single grid cell that spans 2 columns so we
            can collapse the gap between them and float a Swap button at
            their boundary. */}
        <div className="relative grid grid-cols-2 gap-3 sm:col-span-2 lg:col-span-2">
          <SimpleAirportInput
            /* Re-mount once when geolocation resolves so the dynamic
               placeholder actually replaces the initial "Perth (PER)" hint,
               and once per Swap so the new defaultValue takes effect. */
            key={`from-${swapCount}-${originPlaceholder}`}
            inputName="flying-from-location"
            label="From"
            placeholder={originPlaceholder}
            defaultValue={fromDefault}
          />
          <SimpleAirportInput
            key={`to-${swapCount}`}
            inputName="flying-to-location"
            label="To"
            placeholder="Singapore (SIN)"
            defaultValue={toDefault}
          />
          <button
            type="button"
            onClick={handleSwap}
            aria-label="Swap From and To"
            // bottom-anchored so the button vertically centres on the input
            // rectangles rather than on the (label + input) full container,
            // which left the icon sitting visibly above the field row.
            className="absolute bottom-1.5 left-1/2 z-10 inline-flex size-8 -translate-x-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 shadow-sm transition-colors hover:border-orange-400 hover:text-orange-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
          >
            <ArrowsRightLeftIcon className="size-4" />
          </button>
        </div>

        <DateRangePopover
          tripType={tripType}
          startDate={startDate}
          endDate={endDate}
          onChange={({ start, end }) => {
            setStartDate(start)
            setEndDate(end)
          }}
        />

        <Popover className="relative">
          <label className={labelClass}>Travellers</label>
          <PopoverButton className={clsx(inputClass, 'flex items-center justify-between cursor-pointer')} type="button">
            <span>
              {adults + children + infants}{' '}
              {adults + children + infants === 1 ? 'traveller' : 'travellers'}
            </span>
            <span className="text-neutral-400">▾</span>
          </PopoverButton>
          <PopoverPanel
            anchor={{ to: 'bottom start', gap: 8 }}
            className="z-50 w-72 rounded-lg border border-neutral-200 bg-white p-4 shadow-xl dark:border-neutral-700 dark:bg-neutral-900"
          >
            <CountRow
              label="Adults"
              hint="13+"
              value={adults}
              onChange={(n) => {
                const next = Math.max(1, Math.min(9, n))
                setAdults(next)
                // Infants can't outnumber adults (one infant per lap).
                if (infants > next) setInfants(next)
              }}
              min={1}
            />
            <CountRow
              label="Children"
              hint="2–11"
              value={children}
              onChange={(n) => setChildren(Math.max(0, Math.min(8, n)))}
              min={0}
            />
            <CountRow
              label="Infants"
              hint="under 2 · on lap"
              value={infants}
              onChange={(n) => setInfants(Math.max(0, Math.min(adults, n)))}
              min={0}
              max={adults}
            />
          </PopoverPanel>
        </Popover>

        <div>
          <label className={labelClass}>Cabin</label>
          <select
            value={cabin}
            onChange={(e) => setCabin(e.target.value as CabinClass)}
            className={inputClass}
          >
            <option value="economy">Economy</option>
            <option value="premium_economy">Premium economy</option>
            <option value="business">Business</option>
            <option value="first">First</option>
          </select>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-5 flex flex-wrap items-center justify-end gap-3">
        <button
          type="submit"
          className="rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
        >
          Search flights
        </button>
      </div>
    </Form>
  )
}
