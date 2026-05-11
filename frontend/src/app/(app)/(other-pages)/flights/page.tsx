'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

import BgGlassmorphism from '@/components/BgGlassmorphism'
import { FlightDestinationsSection } from '@/components/FlightDestinationsSection'
import HeroSectionWithSearchForm1 from '@/components/hero-sections/HeroSectionWithSearchForm1'
import { FlightSearchForm } from '@/components/HeroSearchForm/FlightSearchForm'
import { PopularDestinations } from '@/components/PopularDestinations'
import { TravelProsSection } from '@/components/TravelProsSection'
import heroImageFlights from '@/images/hero-right-flight.png'

type CabinClass = 'economy' | 'premium_economy' | 'business' | 'first'
const VALID_CABINS: CabinClass[] = ['economy', 'premium_economy', 'business', 'first']

export default function FlightsPage() {
  return (
    <Suspense
      fallback={
        <main className="container py-6">
          <div className="rounded-2xl bg-white p-2 shadow-sm dark:bg-neutral-900" />
        </main>
      }
    >
      <FlightsContent />
    </Suspense>
  )
}

function FlightsContent() {
  const searchParams = useSearchParams()
  const params = searchParams ?? new URLSearchParams()

  return (
    <main className="relative overflow-hidden">
      <BgGlassmorphism />
      <div className="relative container mb-16 flex flex-col gap-y-16 lg:mb-24 lg:gap-y-24">
        <HeroSectionWithSearchForm1
          heading="Find your next flight"
          image={heroImageFlights}
          imageAlt="Travel by air"
          description={
            <p className="max-w-xl text-base text-neutral-500 sm:text-xl dark:text-neutral-400">
              Search hundreds of airlines and book your tickets in minutes.
            </p>
          }
          searchForm={
            <div className="hero-search-form">
              <FlightSearchForm
                formStyle="default"
                className="shadow-md"
                openInNewTab={false}
                initial={{
                  origin: params.get('origin') ?? undefined,
                  destination: params.get('destination') ?? undefined,
                  departureDate: params.get('departureDate') ?? undefined,
                  returnDate: params.get('returnDate') ?? undefined,
                  adults: Number(params.get('adults')) || 1,
                  children: Number(params.get('children')) || 0,
                  infants: Number(params.get('infants')) || 0,
                  cabinClass: VALID_CABINS.includes(params.get('cabinClass') as CabinClass)
                    ? (params.get('cabinClass') as CabinClass)
                    : 'economy',
                  // Default to a return trip on the flights landing page; only
                  // flip to one-way if the URL explicitly says so.
                  tripType: params.get('tripType') === 'oneway' ? 'oneway' : 'return',
                }}
              />
            </div>
          }
        />

        <TravelProsSection />

        <PopularDestinations />

        <FlightDestinationsSection />
      </div>
    </main>
  )
}
