'use client'

import 'leaflet/dist/leaflet.css'

import L from 'leaflet'
import { useEffect, useMemo } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'

import { useCurrency } from '@/contexts/CurrencyContext'

// Leaflet's bundled marker images break under webpack/Next because their
// URLs are resolved relative to the wrong path. Point at the unpkg CDN
// once at module load — same workaround the react-leaflet docs recommend.
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: () => string })._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

export type MapPin = {
  id: string
  searchResultId: string
  name: string
  latitude: number
  longitude: number
  totalAmount: number
  currency: string
  perNight: number
  reviewScore: number | null
  photoUrl: string | null
}

interface Props {
  pins: MapPin[]
  /** Fallback centre if we couldn't compute one from the pins. */
  centerHint?: { latitude: number; longitude: number } | null
  /** Read-only display label for the searched destination (e.g. "Bangkok"). */
  destinationLabel: string
}

function FitToPins({ pins }: { pins: MapPin[] }) {
  const map = useMap()
  useEffect(() => {
    if (pins.length === 0) return
    const bounds = L.latLngBounds(pins.map((p) => [p.latitude, p.longitude]))
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 })
  }, [pins, map])
  return null
}

export default function MapView({ pins, centerHint, destinationLabel }: Props) {
  const { format } = useCurrency()
  const initialCenter = useMemo<[number, number]>(() => {
    if (pins.length > 0) {
      return [pins[0].latitude, pins[0].longitude]
    }
    if (centerHint) return [centerHint.latitude, centerHint.longitude]
    return [13.7563, 100.5018] // Bangkok fallback
  }, [pins, centerHint])

  return (
    <div className="relative h-[calc(100vh-200px)] min-h-[500px] w-full overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800">
      <MapContainer
        center={initialCenter}
        zoom={12}
        scrollWheelZoom
        className="size-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitToPins pins={pins} />
        {pins.map((pin) => (
          <Marker key={pin.id} position={[pin.latitude, pin.longitude]}>
            <Popup>
              <div className="min-w-[200px] space-y-1">
                {pin.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={pin.photoUrl}
                    alt={pin.name}
                    className="mb-1 h-24 w-full rounded object-cover"
                    loading="lazy"
                  />
                ) : null}
                <div className="text-sm font-semibold text-neutral-900">{pin.name}</div>
                <div className="flex items-baseline justify-between gap-2 text-xs">
                  <span className="font-bold text-neutral-900">
                    {format(pin.totalAmount, pin.currency)}
                  </span>
                  <span className="text-neutral-500">
                    {format(Math.round(pin.perNight), pin.currency)} / night
                  </span>
                </div>
                {pin.reviewScore != null ? (
                  <div className="text-xs text-sky-700">
                    Guest rating {pin.reviewScore.toFixed(1)}
                  </div>
                ) : null}
                <a
                  href={`/stays/${encodeURIComponent(pin.searchResultId)}`}
                  className="mt-1 inline-block text-xs font-semibold text-blue-600 hover:underline"
                >
                  View details →
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <div className="pointer-events-none absolute right-4 top-4 z-[400] rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-neutral-700 shadow">
        {pins.length} {pins.length === 1 ? 'property' : 'properties'} on map
        {destinationLabel ? ` · ${destinationLabel}` : ''}
      </div>
    </div>
  )
}
