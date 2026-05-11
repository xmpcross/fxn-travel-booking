import '@/styles/tailwind.css'
import '@/styles/duffel.css'
import { Metadata } from 'next'
import { Inter, Outfit, Urbanist } from 'next/font/google'
import 'rc-slider/assets/index.css'
import 'react-datepicker/dist/react-datepicker.css'
import ThemeProvider from './theme-provider'

// Inter is the default UI typeface (used by headings, buttons, controls,
// labels). next/font self-hosts: woff2 files are downloaded at build time
// and served from /_next/static/media at runtime. No Google CDN runtime
// call from the browser.
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-inter',
})

// Outfit is used by body copy and paragraph text only, at weight 300.
// Exposed as --font-outfit so the @layer base rule in tailwind.css can
// pin body / p to it independently of the rest of the UI.
const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  weight: ['300'],
  variable: '--font-outfit',
})

// Urbanist is the heading typeface — applied to h1..h3 only via the
// @layer base rule in tailwind.css. h4..h6 keep the default Inter family.
const urbanist = Urbanist({
  subsets: ['latin'],
  display: 'swap',
  weight: ['700'],
  variable: '--font-urbanist',
})

export const metadata: Metadata = {
  title: {
    template: '%s — NXT.Deals',
    default: 'NXT.Deals — find your next flight or stay',
  },
  description: 'Search and book flights worldwide.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} ${urbanist.variable} font-sans`}>
      <body className="bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
