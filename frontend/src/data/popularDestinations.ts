// Hand-curated popular destination tiles for the /flights landing page.
// Prices are illustrative "from" placeholders in USD (the user's display
// currency picker re-formats them via useCurrency().format()). Swap the
// list or wire to a real fares feed (e.g. Duffel partial offer requests
// running on a schedule) when ready.

export type PopularDestination = {
  name: string
  iata: string
  country: string
  imageUrl: string
  /** Price in USD; rendered as "Tickets from {format(priceUsd)}" */
  priceUsd: number
}

export const POPULAR_DESTINATIONS: PopularDestination[] = [
  // Ordered so the wide tiles (London on row 1, Singapore on row 2 — both
  // get lg:col-span-2 in the renderer) land in the right grid positions.
  {
    name: 'Denpasar',
    iata: 'DPS',
    country: 'Indonesia',
    imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&h=500&fit=crop&auto=format',
    priceUsd: 359,
  },
  {
    name: 'Bangkok',
    iata: 'BKK',
    country: 'Thailand',
    imageUrl: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&h=500&fit=crop&auto=format',
    priceUsd: 362,
  },
  {
    name: 'Melbourne',
    iata: 'MEL',
    country: 'Australia',
    imageUrl: 'https://images.unsplash.com/photo-1545044846-351ba102b6d5?w=800&h=500&fit=crop&auto=format',
    priceUsd: 312,
  },
  {
    name: 'London',
    iata: 'LON',
    country: 'United Kingdom',
    imageUrl: 'https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=1200&h=500&fit=crop&auto=format',
    priceUsd: 1489,
  },
  {
    name: 'Singapore',
    iata: 'SIN',
    country: 'Singapore',
    imageUrl: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1200&h=500&fit=crop&auto=format',
    priceUsd: 390,
  },
  {
    name: 'Kuala Lumpur',
    iata: 'KUL',
    country: 'Malaysia',
    imageUrl: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800&h=500&fit=crop&auto=format',
    priceUsd: 357,
  },
  {
    name: 'Sydney',
    iata: 'SYD',
    country: 'Australia',
    imageUrl: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&h=500&fit=crop&auto=format',
    priceUsd: 295,
  },
  {
    name: 'Tokyo',
    iata: 'TYO',
    country: 'Japan',
    imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=500&fit=crop&auto=format',
    priceUsd: 720,
  },
  {
    name: 'Paris',
    iata: 'PAR',
    country: 'France',
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=500&fit=crop&auto=format',
    priceUsd: 1320,
  },
  {
    name: 'New York',
    iata: 'NYC',
    country: 'United States',
    imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=500&fit=crop&auto=format',
    priceUsd: 980,
  },
  {
    name: 'Dubai',
    iata: 'DXB',
    country: 'United Arab Emirates',
    imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=500&fit=crop&auto=format',
    priceUsd: 690,
  },
  {
    name: 'Seoul',
    iata: 'SEL',
    country: 'South Korea',
    imageUrl: 'https://images.unsplash.com/photo-1546874177-9e664107314e?w=800&h=500&fit=crop&auto=format',
    priceUsd: 650,
  },
]
