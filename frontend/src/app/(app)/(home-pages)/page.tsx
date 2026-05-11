import BgGlassmorphism from '@/components/BgGlassmorphism'
import { HomeHero } from '@/components/HomeHero'
import { DestinationsGrid } from '@/components/DestinationsGrid'
import { FaqSection } from '@/components/FaqSection'
import { TravelProsSection } from '@/components/TravelProsSection'
import { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Find a flight',
  description: 'Search and book flights worldwide.',
}

export default function Page() {
  return (
    <main className="relative overflow-hidden">
      <BgGlassmorphism />
      <div className="relative container mb-24 flex flex-col gap-y-24 lg:mb-28 lg:gap-y-32">
        <HomeHero />

        {/* Inspiration banner — Skyscanner-style cover with overlay text + CTA */}
        <section className="relative isolate h-[360px] sm:h-[420px] lg:h-[460px] overflow-hidden rounded-[16px]">
          <Image
            src="/images/cities/Sydney.jpg"
            alt="Sydney harbour at dusk"
            fill
            sizes="(max-width: 768px) 100vw, 1200px"
            className="object-cover"
            priority
          />
          {/* Dark gradient overlay for text legibility on the left */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/30 to-transparent" />

          <div className="relative z-10 flex h-full max-w-3xl flex-col justify-center gap-5 px-8 py-12 text-white sm:px-12 lg:px-16">
            <h2 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              Discover Sydney<br />and beyond
            </h2>
            <p className="max-w-md text-sm sm:text-base text-white/85">
              Get the tips and tricks to fly cheaper, beat the crowds and unlock unique experiences.
            </p>
            <div>
              <button
                type="button"
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-100"
              >
                Explore now
              </button>
            </div>
          </div>
        </section>

        <TravelProsSection />

        {/* Start your travel planning here — popular destinations grid */}
        <section>
          <h2 className="text-2xl font-bold text-neutral-900 sm:text-3xl dark:text-neutral-100">
            Start your travel planning here
          </h2>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            Search <span className="font-semibold text-orange-600 dark:text-orange-400">Flights</span>
          </p>

          <DestinationsGrid />
        </section>

        <FaqSection />
      </div>
    </main>
  )
}
