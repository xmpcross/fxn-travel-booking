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
  // ------------------------------------------------------------
  // Expanded set — added 2026-05 for route-page coverage. Images
  // are placeholder picsum URLs (deterministic per IATA so each
  // tile renders a different photo). Swap to curated Unsplash
  // imagery for each city when you have time.
  // ------------------------------------------------------------
  // Asia
  { name: 'Hong Kong', iata: 'HKG', country: 'Hong Kong', imageUrl: 'https://picsum.photos/seed/HKG/800/500', priceUsd: 720 },
  { name: 'Manila', iata: 'MNL', country: 'Philippines', imageUrl: 'https://picsum.photos/seed/MNL/800/500', priceUsd: 690 },
  { name: 'Jakarta', iata: 'CGK', country: 'Indonesia', imageUrl: 'https://picsum.photos/seed/CGK/800/500', priceUsd: 595 },
  { name: 'Ho Chi Minh City', iata: 'SGN', country: 'Vietnam', imageUrl: 'https://picsum.photos/seed/SGN/800/500', priceUsd: 545 },
  { name: 'Hanoi', iata: 'HAN', country: 'Vietnam', imageUrl: 'https://picsum.photos/seed/HAN/800/500', priceUsd: 560 },
  { name: 'Beijing', iata: 'BJS', country: 'China', imageUrl: 'https://picsum.photos/seed/BJS/800/500', priceUsd: 760 },
  { name: 'Shanghai', iata: 'SHA', country: 'China', imageUrl: 'https://picsum.photos/seed/SHA/800/500', priceUsd: 740 },
  { name: 'Mumbai', iata: 'BOM', country: 'India', imageUrl: 'https://picsum.photos/seed/BOM/800/500', priceUsd: 510 },
  { name: 'Delhi', iata: 'DEL', country: 'India', imageUrl: 'https://picsum.photos/seed/DEL/800/500', priceUsd: 520 },
  { name: 'Taipei', iata: 'TPE', country: 'Taiwan', imageUrl: 'https://picsum.photos/seed/TPE/800/500', priceUsd: 715 },
  { name: 'Phuket', iata: 'HKT', country: 'Thailand', imageUrl: 'https://picsum.photos/seed/HKT/800/500', priceUsd: 480 },
  // Europe
  { name: 'Istanbul', iata: 'IST', country: 'Türkiye', imageUrl: 'https://picsum.photos/seed/IST/800/500', priceUsd: 420 },
  { name: 'Athens', iata: 'ATH', country: 'Greece', imageUrl: 'https://picsum.photos/seed/ATH/800/500', priceUsd: 380 },
  { name: 'Rome', iata: 'ROM', country: 'Italy', imageUrl: 'https://picsum.photos/seed/ROM/800/500', priceUsd: 310 },
  { name: 'Barcelona', iata: 'BCN', country: 'Spain', imageUrl: 'https://picsum.photos/seed/BCN/800/500', priceUsd: 285 },
  { name: 'Madrid', iata: 'MAD', country: 'Spain', imageUrl: 'https://picsum.photos/seed/MAD/800/500', priceUsd: 290 },
  { name: 'Berlin', iata: 'BER', country: 'Germany', imageUrl: 'https://picsum.photos/seed/BER/800/500', priceUsd: 240 },
  { name: 'Frankfurt', iata: 'FRA', country: 'Germany', imageUrl: 'https://picsum.photos/seed/FRA/800/500', priceUsd: 235 },
  { name: 'Amsterdam', iata: 'AMS', country: 'Netherlands', imageUrl: 'https://picsum.photos/seed/AMS/800/500', priceUsd: 220 },
  { name: 'Zurich', iata: 'ZRH', country: 'Switzerland', imageUrl: 'https://picsum.photos/seed/ZRH/800/500', priceUsd: 305 },
  { name: 'Copenhagen', iata: 'CPH', country: 'Denmark', imageUrl: 'https://picsum.photos/seed/CPH/800/500', priceUsd: 270 },
  { name: 'Dublin', iata: 'DUB', country: 'Ireland', imageUrl: 'https://picsum.photos/seed/DUB/800/500', priceUsd: 195 },
  { name: 'Lisbon', iata: 'LIS', country: 'Portugal', imageUrl: 'https://picsum.photos/seed/LIS/800/500', priceUsd: 260 },
  { name: 'Prague', iata: 'PRG', country: 'Czechia', imageUrl: 'https://picsum.photos/seed/PRG/800/500', priceUsd: 245 },
  { name: 'Vienna', iata: 'VIE', country: 'Austria', imageUrl: 'https://picsum.photos/seed/VIE/800/500', priceUsd: 275 },
  // Middle East / Africa
  { name: 'Doha', iata: 'DOH', country: 'Qatar', imageUrl: 'https://picsum.photos/seed/DOH/800/500', priceUsd: 710 },
  { name: 'Cape Town', iata: 'CPT', country: 'South Africa', imageUrl: 'https://picsum.photos/seed/CPT/800/500', priceUsd: 820 },
  { name: 'Johannesburg', iata: 'JNB', country: 'South Africa', imageUrl: 'https://picsum.photos/seed/JNB/800/500', priceUsd: 790 },
  { name: 'Cairo', iata: 'CAI', country: 'Egypt', imageUrl: 'https://picsum.photos/seed/CAI/800/500', priceUsd: 550 },
  // Americas
  { name: 'Toronto', iata: 'YTO', country: 'Canada', imageUrl: 'https://picsum.photos/seed/YTO/800/500', priceUsd: 660 },
  { name: 'Vancouver', iata: 'YVR', country: 'Canada', imageUrl: 'https://picsum.photos/seed/YVR/800/500', priceUsd: 745 },
  { name: 'Los Angeles', iata: 'LAX', country: 'United States', imageUrl: 'https://picsum.photos/seed/LAX/800/500', priceUsd: 720 },
  { name: 'San Francisco', iata: 'SFO', country: 'United States', imageUrl: 'https://picsum.photos/seed/SFO/800/500', priceUsd: 740 },
  { name: 'Miami', iata: 'MIA', country: 'United States', imageUrl: 'https://picsum.photos/seed/MIA/800/500', priceUsd: 690 },
  { name: 'Mexico City', iata: 'MEX', country: 'Mexico', imageUrl: 'https://picsum.photos/seed/MEX/800/500', priceUsd: 615 },
  { name: 'Rio de Janeiro', iata: 'RIO', country: 'Brazil', imageUrl: 'https://picsum.photos/seed/RIO/800/500', priceUsd: 950 },
  { name: 'São Paulo', iata: 'SAO', country: 'Brazil', imageUrl: 'https://picsum.photos/seed/SAO/800/500', priceUsd: 935 },
  // Oceania
  { name: 'Auckland', iata: 'AKL', country: 'New Zealand', imageUrl: 'https://picsum.photos/seed/AKL/800/500', priceUsd: 1180 },
]
