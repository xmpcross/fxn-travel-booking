import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Checkout + confirmation are user-private and shouldn't be in
        // the index. flight-search is parameter-heavy and creates
        // near-infinite URLs Google would waste crawl budget on.
        disallow: ['/checkout/', '/confirmation/', '/flight-search'],
      },
    ],
    sitemap: 'https://travel.originfacts.com/sitemap.xml',
  }
}
