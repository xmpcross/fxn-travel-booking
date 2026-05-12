'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

import BgGlassmorphism from '@/components/BgGlassmorphism'
import HeroSectionWithSearchForm1 from '@/components/hero-sections/HeroSectionWithSearchForm1'
import { StaySearchForm } from '@/components/HeroSearchForm/StaySearchForm'
import { PopularDestinations } from '@/components/PopularDestinations'
import { TravelProsSection } from '@/components/TravelProsSection'
import heroImage from '@/images/hero-right-2.png'

export default function StaysPage() {
  return (
    <Suspense
      fallback={
        <main className="container py-6">
          <div className="rounded-2xl bg-white p-2 shadow-sm dark:bg-neutral-900" />
        </main>
      }
    >
      <StaysContent />
    </Suspense>
  )
}

function StaysContent() {
  const searchParams = useSearchParams()
  const params = searchParams ?? new URLSearchParams()

  return (
    <main className="relative overflow-hidden">
      <BgGlassmorphism />
      <div className="relative container mb-16 flex flex-col gap-y-16 lg:mb-24 lg:gap-y-24">
        <HeroSectionWithSearchForm1
          heading="Find your next stay"
          image={heroImage}
          imageAlt="Hotels and accommodation"
          description={
            <p className="max-w-xl text-base text-neutral-500 sm:text-xl dark:text-neutral-400">
              Search hotels, apartments and resorts worldwide.
            </p>
          }
          searchForm={
            <div className="hero-search-form">
              <StaySearchForm
                formStyle="default"
                className="shadow-md"
                openInNewTab={false}
                initial={{
                  destinationQuery: params.get('destinationQuery') ?? undefined,
                  checkInDate: params.get('checkInDate') ?? undefined,
                  checkOutDate: params.get('checkOutDate') ?? undefined,
                  rooms: Number(params.get('rooms')) || 1,
                  guests: Number(params.get('guests')) || 2,
                }}
              />
            </div>
          }
        />

        <TravelProsSection />

        <PopularDestinations />
      </div>
    </main>
  )
}
