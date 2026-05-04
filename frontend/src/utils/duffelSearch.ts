import type { TFlightListing } from '@/data/listings'

type DuffelSegment = {
  departing_at: string
  arriving_at: string
  origin: { iata_code: string; city_name?: string; name?: string }
  destination: { iata_code: string; city_name?: string; name?: string }
  operating_carrier?: { name?: string; logo_symbol_url?: string; iata_code?: string }
  marketing_carrier?: { name?: string; logo_symbol_url?: string; iata_code?: string }
}

type DuffelSlice = {
  duration?: string
  segments: DuffelSegment[]
}

type DuffelOffer = {
  id: string
  total_amount: string
  total_currency: string
  slices: DuffelSlice[]
}

const PLACEHOLDER_LOGO =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#e5e7eb"/></svg>'
  )

// Accepts Duffel's `Offer` shape (from @duffel/api/types) directly. We declare
// our own minimal type so this util doesn't pull in @duffel/api just for typing.
export function offerToListing(offer: DuffelOffer): TFlightListing {
  const slice = offer.slices[0]
  const segments = slice?.segments ?? []
  const firstSeg = segments[0]
  const lastSeg = segments[segments.length - 1]
  const stopCount = Math.max(0, segments.length - 1)

  const carrier = firstSeg?.operating_carrier ?? firstSeg?.marketing_carrier

  return {
    id: offer.id,
    name: `${firstSeg?.origin.iata_code ?? ''} - ${lastSeg?.destination.iata_code ?? ''}`,
    departure: formatPlace(firstSeg?.origin),
    arrival: formatPlace(lastSeg?.destination),
    departureTime: firstSeg?.departing_at ?? '',
    arrivalTime: lastSeg?.arriving_at ?? '',
    duration: formatIsoDuration(slice?.duration),
    stopNumber: stopCount,
    stopAirport: stopCount > 0 ? segments[0]?.destination.iata_code ?? '' : '',
    layover: stopCount > 0 ? '—' : '',
    href: `/checkout/flight?offerId=${offer.id}`,
    price: formatPrice(offer.total_amount, offer.total_currency),
    airlines: {
      logo: carrier?.logo_symbol_url || PLACEHOLDER_LOGO,
      name: carrier?.name ?? 'Airline',
    },
  }
}

function formatPlace(place?: { iata_code: string; city_name?: string; name?: string }): string {
  if (!place) return ''
  const label = place.city_name || place.name || place.iata_code
  return `${label} (${place.iata_code})`
}

function formatIsoDuration(iso?: string): string {
  if (!iso) return '—'
  const m = iso.match(/^PT(?:(\d+)H)?(?:(\d+)M)?/)
  if (!m) return iso
  const h = m[1] ? `${m[1]}h` : ''
  const min = m[2] ? `${m[2]}m` : ''
  return [h, min].filter(Boolean).join(' ') || '—'
}

function formatPrice(amount: string, currency: string): string {
  const n = Number(amount)
  if (!Number.isFinite(n)) return `${currency} ${amount}`
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(n)
  } catch {
    return `${currency} ${amount}`
  }
}
