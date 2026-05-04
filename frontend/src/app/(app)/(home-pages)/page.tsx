import BgGlassmorphism from '@/components/BgGlassmorphism'
import HeroSectionWithSearchForm1 from '@/components/hero-sections/HeroSectionWithSearchForm1'
import HeroSearchForm from '@/components/HeroSearchForm/HeroSearchForm'
import heroImage from '@/images/hero-right.png'
import { DestinationsGrid } from '@/components/DestinationsGrid'
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
        <HeroSectionWithSearchForm1
          heading="Find your next flight"
          image={heroImage}
          imageAlt="hero"
          searchForm={<HeroSearchForm />}
          description={
            <p className="max-w-xl text-base text-neutral-500 sm:text-xl dark:text-neutral-400">
              Search hundreds of airlines and book your tickets in minutes.
            </p>
          }
        />

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

        {/* For travel pros — 4 feature cards */}
        <section>
          <h2 className="mb-6 text-2xl font-bold text-neutral-900 sm:text-3xl dark:text-neutral-100">
            For travel pros
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: 'Plan with AI',
                description: 'Get travel questions answered',
                image: '/images/plan-with-ai.svg',
                bg: 'from-amber-100 to-orange-200 dark:from-amber-900/40 dark:to-orange-900/40',
              },
              {
                title: 'Best Time to Travel',
                description: 'Know when to save',
                image: '/images/best-time.svg',
                bg: 'from-sky-100 to-blue-200 dark:from-sky-900/40 dark:to-blue-900/40',
              },
              {
                title: 'Explore',
                description: 'See destinations on your budget',
                image: '/images/explore.svg',
                bg: 'from-emerald-100 to-teal-200 dark:from-emerald-900/40 dark:to-teal-900/40',
              },
              {
                title: 'Trips',
                description: 'Keep all your plans in one place',
                image: '/images/trips.svg',
                bg: 'from-rose-100 to-pink-200 dark:from-rose-900/40 dark:to-pink-900/40',
              },
            ].map((card) => (
              <article
                key={card.title}
                className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-neutral-200 transition-shadow hover:shadow-md dark:bg-neutral-900 dark:ring-neutral-800"
              >
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                    {card.title}
                  </h3>
                  <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                    {card.description}
                  </p>
                </div>
                <div
                  className={`flex h-40 items-center justify-center rounded-xl bg-gradient-to-br ${card.bg}`}
                >
                  <Image
                    src={card.image}
                    alt=""
                    width={240}
                    height={160}
                    className="h-full w-auto object-contain p-3"
                  />
                </div>
              </article>
            ))}
          </div>
        </section>

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
      </div>
    </main>
  )
}
