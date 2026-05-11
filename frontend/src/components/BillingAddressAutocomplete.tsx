'use client'

import { useMapsLibrary } from '@vis.gl/react-google-maps'
import { FC, useEffect, useRef, useState } from 'react'

export type BillingAddressDetails = {
  formatted: string
  streetNumber?: string
  street?: string
  city?: string
  region?: string
  postalCode?: string
  country?: string
  countryCode?: string
  latitude?: number
  longitude?: number
}

interface Props {
  label?: string
  required?: boolean
  value: string
  onChange: (v: string) => void
  onSelect?: (details: BillingAddressDetails) => void
  placeholder?: string
}

export const BillingAddressAutocomplete: FC<Props> = ({
  label = 'Billing address',
  required,
  value,
  onChange,
  onSelect,
  placeholder = 'Start typing your address…',
}) => {
  const places = useMapsLibrary('places')
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const serviceRef = useRef<google.maps.places.AutocompleteService | null>(null)
  const detailsServiceRef = useRef<google.maps.places.PlacesService | null>(null)
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Lazily wire up the Places services once the library is loaded. A single
  // `sessionToken` groups predictions + a final `getDetails()` call into one
  // billable Places session, which is the cheapest way to use the API.
  useEffect(() => {
    if (!places || serviceRef.current) return
    serviceRef.current = new places.AutocompleteService()
    sessionTokenRef.current = new places.AutocompleteSessionToken()
    // PlacesService requires a DOM node; an offscreen div is fine.
    const node = document.createElement('div')
    detailsServiceRef.current = new places.PlacesService(node)
  }, [places])

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  // Debounced prediction fetch as the user types.
  useEffect(() => {
    if (!places || !serviceRef.current) return
    const q = value.trim()
    if (q.length < 3) {
      setPredictions([])
      setLoading(false)
      return
    }
    setLoading(true)
    const handle = setTimeout(() => {
      serviceRef.current!.getPlacePredictions(
        {
          input: q,
          sessionToken: sessionTokenRef.current ?? undefined,
          // Bias toward street addresses, not arbitrary POIs.
          types: ['address'],
        },
        (results, status) => {
          setLoading(false)
          if (status === places.PlacesServiceStatus.OK && results) {
            setPredictions(results)
          } else {
            setPredictions([])
          }
        }
      )
    }, 220)
    return () => clearTimeout(handle)
  }, [value, places])

  function parseAddressComponents(
    components: google.maps.GeocoderAddressComponent[]
  ): Partial<BillingAddressDetails> {
    const get = (type: string, short = false) => {
      const c = components.find((x) => x.types.includes(type))
      return c ? (short ? c.short_name : c.long_name) : undefined
    }
    return {
      streetNumber: get('street_number'),
      street: get('route'),
      city: get('locality') ?? get('postal_town') ?? get('sublocality') ?? get('administrative_area_level_2'),
      region: get('administrative_area_level_1'),
      postalCode: get('postal_code'),
      country: get('country'),
      countryCode: get('country', true),
    }
  }

  function handleSelect(p: google.maps.places.AutocompletePrediction) {
    const description = p.description
    onChange(description)
    setOpen(false)
    setPredictions([])

    if (!detailsServiceRef.current || !places) {
      onSelect?.({ formatted: description })
      return
    }

    detailsServiceRef.current.getDetails(
      {
        placeId: p.place_id,
        fields: ['address_components', 'formatted_address', 'geometry'],
        sessionToken: sessionTokenRef.current ?? undefined,
      },
      (place, status) => {
        if (status !== places.PlacesServiceStatus.OK || !place) {
          onSelect?.({ formatted: description })
          return
        }
        const parts = place.address_components
          ? parseAddressComponents(place.address_components)
          : {}
        onSelect?.({
          formatted: place.formatted_address ?? description,
          ...parts,
          latitude: place.geometry?.location?.lat(),
          longitude: place.geometry?.location?.lng(),
        })
        // Once a place is picked the session is done — start a fresh one for
        // any subsequent edits.
        if (places.AutocompleteSessionToken) {
          sessionTokenRef.current = new places.AutocompleteSessionToken()
        }
      }
    )
  }

  return (
    <div ref={containerRef} className="relative">
      <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
        {label} {required ? <span className="text-rose-500">*</span> : null}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setOpen(true)
        }}
        onFocus={() => value.trim().length >= 3 && setOpen(true)}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
      />
      {!places && (
        <p className="mt-1 text-xs text-neutral-500">
          Google Maps key not configured — address suggestions disabled. Free-text entry still works.
        </p>
      )}
      {open && (loading || predictions.length > 0) && (
        <div className="absolute z-40 mt-1 max-h-72 w-full overflow-y-auto rounded-lg border border-neutral-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
          {loading && predictions.length === 0 ? (
            <p className="px-3 py-2 text-xs text-neutral-500">Searching…</p>
          ) : null}
          {predictions.map((p) => (
            <button
              key={p.place_id}
              type="button"
              onClick={() => handleSelect(p)}
              className="block w-full px-3 py-2 text-left text-sm hover:bg-neutral-50 dark:hover:bg-neutral-700"
            >
              <span className="font-medium text-neutral-900 dark:text-neutral-100">
                {p.structured_formatting?.main_text ?? p.description}
              </span>
              {p.structured_formatting?.secondary_text ? (
                <span className="ml-1.5 text-xs text-neutral-500">
                  {p.structured_formatting.secondary_text}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
