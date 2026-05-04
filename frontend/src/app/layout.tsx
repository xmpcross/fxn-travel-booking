import '@/styles/tailwind.css'
import '@/styles/duffel.css'
import { Metadata } from 'next'
import { Inter } from 'next/font/google'
import 'rc-slider/assets/index.css'
import 'react-datepicker/dist/react-datepicker.css'
import ThemeProvider from './theme-provider'

// next/font self-hosts: woff2 files are downloaded at build time and served from
// /_next/static/media at runtime. No Google CDN call from the browser.
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    template: '%s — originfacts travel',
    default: 'originfacts travel — find a flight',
  },
  description: 'Search and book flights worldwide.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} font-sans`}>
      <body className="bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
