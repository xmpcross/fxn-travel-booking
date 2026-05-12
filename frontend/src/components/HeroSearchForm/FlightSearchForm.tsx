'use client'

import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import { ArrowsRightLeftIcon, ChevronDownIcon, UserIcon } from '@heroicons/react/24/outline'
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
  /**
   * Visual treatment.
   * - `hero` (default): full card with mode-icon row, used on landing pages.
   * - `compact`: results-page treatment — trip-type tabs at top, no mode
   *    icons, no surrounding card background.
   */
  variant?: 'hero' | 'compact'
}

const inputClass =
  'w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100'

const labelClass = 'mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300'

const CABIN_LABELS: Record<CabinClass, string> = {
  economy: 'Economy',
  premium_economy: 'Premium economy',
  business: 'Business',
  first: 'First',
}

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

export const FlightSearchForm: FC<Props> = ({ className, openInNewTab = true, initial, onSwitchToStays, variant = 'hero' }) => {
  const isCompact = variant === 'compact'
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
        'w-full',
        !isCompact && 'rounded-2xl bg-neutral-50 p-6 sm:p-8 dark:bg-neutral-900',
        className
      )}
    >
      {isCompact ? (
        // Results-page header: trip-type tabs with blue underline on active.
        // No mode-icon row, no surrounding card — matches the Expedia
        // "search box at top of results" treatment.
        <div className="mb-4 flex items-center gap-6 border-b border-neutral-200 dark:border-neutral-800">
          {(
            [
              { id: 'return' as const, label: 'Return', disabled: false },
              { id: 'oneway' as const, label: 'One-way', disabled: false },
              { id: 'multicity' as const, label: 'Multi-city', disabled: true },
            ]
          ).map((tab) => {
            const active = !tab.disabled && tripType === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                disabled={tab.disabled}
                onClick={() => {
                  if (tab.disabled) return
                  if (tab.id === 'return' || tab.id === 'oneway') setTripType(tab.id)
                }}
                className={clsx(
                  'px-1 py-3 text-sm font-semibold transition-colors',
                  active && 'border-b-2 border-blue-600 text-neutral-900 dark:text-neutral-100',
                  !active && !tab.disabled && 'cursor-pointer text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200',
                  tab.disabled && 'cursor-not-allowed text-neutral-400 dark:text-neutral-600'
                )}
                title={tab.disabled ? 'Multi-city is coming soon' : undefined}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Trip-type dropdown on the left (replaces the Flights mode icon). */}
          <Popover className="relative">
            <PopoverButton className="inline-flex cursor-pointer items-center gap-1.5 text-base font-semibold text-neutral-900 hover:text-orange-600 focus:outline-none dark:text-neutral-100 dark:hover:text-orange-400">
              {tripType === 'return' ? 'Return' : 'One-way'}
              <ChevronDownIcon className="size-4" aria-hidden="true" />
            </PopoverButton>
            <PopoverPanel
              anchor={{ to: 'bottom start', gap: 8 }}
              className="z-50 w-40 rounded-lg border border-neutral-200 bg-white p-1 shadow-xl dark:border-neutral-700 dark:bg-neutral-900"
            >
              {({ close }) => (
                <>
                  {(['return', 'oneway'] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setTripType(opt)
                        close()
                      }}
                      className={clsx(
                        'block w-full cursor-pointer rounded-md px-3 py-2 text-left text-sm transition-colors',
                        tripType === opt
                          ? 'bg-orange-50 font-semibold text-orange-700 dark:bg-orange-950/40 dark:text-orange-300'
                          : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
                      )}
                    >
                      {opt === 'return' ? 'Return' : 'One-way'}
                    </button>
                  ))}
                </>
              )}
            </PopoverPanel>
          </Popover>

          {/* Stays toggle on the right (only when a switch handler is provided). */}
          {onSwitchToStays ? (
            <button
              type="button"
              aria-label="Switch to Stays"
              onClick={onSwitchToStays}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-neutral-300 text-neutral-500 hover:border-orange-500 hover:text-orange-500 dark:border-neutral-700"
            >
              <BedroomIcon className="size-5" />
            </button>
          ) : null}
        </div>
      )}

      {/* Field grid — 10 cols on lg: From/To gets 5 (half the row), Dates
          and Travellers each get 2, Search gets 1 (intentionally compact). */}
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-10">
        {/* From + To live in a single grid cell that spans 2 columns so we
            can collapse the gap between them and float a Swap button at
            their boundary. */}
        <div className="relative grid grid-cols-2 gap-3 sm:col-span-2 lg:col-span-5">
          <SimpleAirportInput
            /* Re-mount once when geolocation resolves so the dynamic
               placeholder actually replaces the initial "Perth (PER)" hint,
               and once per Swap so the new defaultValue takes effect. */
            key={`from-${swapCount}-${originPlaceholder}`}
            inputName="flying-from-location"
            label="Leaving from"
            placeholder={originPlaceholder}
            defaultValue={fromDefault}
          />
          <SimpleAirportInput
            key={`to-${swapCount}`}
            inputName="flying-to-location"
            label="Going to"
            placeholder="Going to"
            defaultValue={toDefault}
          />
          <button
            type="button"
            onClick={handleSwap}
            aria-label="Swap From and To"
            // Vertically centred on the new pill field (which no longer has
            // an external label above the input).
            className="absolute left-1/2 top-1/2 z-10 inline-flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 shadow-sm transition-colors hover:border-orange-400 hover:text-orange-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
          >
            <ArrowsRightLeftIcon className="size-4" />
          </button>
        </div>

        <div className="lg:col-span-2">
          <DateRangePopover
            tripType={tripType}
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
                Travellers, Cabin class
              </span>
              <span className="block truncate text-base font-semibold text-neutral-900 dark:text-neutral-100">
                {adults + children + infants}{' '}
                {adults + children + infants === 1 ? 'traveller' : 'travellers'}
                , {CABIN_LABELS[cabin]}
              </span>
            </div>
          </PopoverButton>
          <PopoverPanel
            anchor={{ to: 'bottom start', gap: 8 }}
            className="z-50 w-80 rounded-lg border border-neutral-200 bg-white p-4 shadow-xl dark:border-neutral-700 dark:bg-neutral-900"
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
            <div className="mt-3 border-t border-neutral-200 pt-3 dark:border-neutral-700">
              <div className="mb-2 text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                Cabin
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(CABIN_LABELS) as CabinClass[]).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setCabin(opt)}
                    className={clsx(
                      'cursor-pointer rounded-md border px-3 py-2 text-left text-sm transition-colors',
                      cabin === opt
                        ? 'border-orange-500 bg-orange-50 font-semibold text-orange-700 dark:bg-orange-950/40 dark:text-orange-300'
                        : 'border-neutral-200 text-neutral-700 hover:border-neutral-300 dark:border-neutral-700 dark:text-neutral-300'
                    )}
                  >
                    {CABIN_LABELS[opt]}
                  </button>
                ))}
              </div>
            </div>
          </PopoverPanel>
        </Popover>

        {/* Search button — full-height pill that matches the neighbouring
            field cards (no external label spacer, since the new pills carry
            their labels inside). */}
        <button
          type="submit"
          className="inline-flex h-10 w-full items-center justify-center self-center rounded-full bg-blue-600 px-5 text-sm font-semibold !text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Search
        </button>
      </div>
    </Form>
  )
}
