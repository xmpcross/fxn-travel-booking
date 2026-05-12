import type { MetadataRoute } from 'next'

import { getSupplementedIataCodes } from '@/data/airlineSupplement'
import { POPULAR_DESTINATIONS } from '@/data/popularDestinations'

const BASE_URL = 'https://travel.originfacts.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const entries: MetadataRoute.Sitemap = []

  // Static landing pages
  const staticPaths: Array<[string, number, MetadataRoute.Sitemap[number]['changeFrequency']]> = [
    ['/', 1.0, 'daily'],
    ['/flights', 0.9, 'daily'],
    ['/stays', 0.7, 'weekly'],
    ['/airlines', 0.8, 'weekly'],
    ['/airlines/top-50', 0.7, 'weekly'],
    ['/low-fare-tips', 0.5, 'monthly'],
    ['/flight-status', 0.5, 'weekly'],
    ['/how-we-work', 0.4, 'monthly'],
    ['/about', 0.3, 'monthly'],
    ['/contact', 0.3, 'monthly'],
    ['/advertise', 0.3, 'monthly'],
    ['/terms', 0.2, 'yearly'],
    ['/privacy', 0.2, 'yearly'],
  ]
  for (const [path, priority, changeFrequency] of staticPaths) {
    entries.push({ url: `${BASE_URL}${path}`, lastModified: now, changeFrequency, priority })
  }

  // Airline directory entries — only for airlines we have curated supplement
  // data for. The other ~700 Duffel airlines render a thin page that's not
  // worth indexing yet.
  const airlineIatas = getSupplementedIataCodes()
  for (const iata of airlineIatas) {
    const slug = encodeURIComponent(iata)
    entries.push({
      url: `${BASE_URL}/airlines/${slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    })
    entries.push({
      url: `${BASE_URL}/airlines/${slug}/destinations`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.6,
    })
  }

  // Airline × destination route pages — the bulk of the sitemap.
  // ~60 supplemented airlines × ~50 popular destinations ≈ 3,000 URLs.
  for (const iata of airlineIatas) {
    const slug = encodeURIComponent(iata)
    for (const dest of POPULAR_DESTINATIONS) {
      entries.push({
        url: `${BASE_URL}/airlines/${slug}/destinations/${encodeURIComponent(dest.iata)}`,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 0.6,
      })
    }
  }

  return entries
}
