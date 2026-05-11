'use client'

import BgGlassmorphism from '@/components/BgGlassmorphism'
import HeroSectionWithSearchForm1 from '@/components/hero-sections/HeroSectionWithSearchForm1'
import { StaySearchForm } from '@/components/HeroSearchForm/StaySearchForm'
import { StayDestinationsSection } from '@/components/StayDestinationsSection'
import { TravelProsSection } from '@/components/TravelProsSection'
import heroImageStays from '@/images/hero-right.png'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

export default function StaysPage() {
  return (
    <Suspense
      fallback={
        <main className="container py-6">
          <div className="rounded-2xl border border-neutral-200 p-8 text-sm text-neutral-500 dark:border-neutral-800">
            Loading…
          </div>
        </main>
      }
    >
      <StaysPageContent />
    </Suspense>
  )
}

function StaysPageContent() {
  const searchParams = useSearchParams()
  const params = searchParams ?? new URLSearchParams()
  const router = useRouter()

  return (
    <main className="relative overflow-hidden">
      <BgGlassmorphism />
      <div className="relative container mb-24 flex flex-col gap-y-24 lg:mb-28 lg:gap-y-32">
        <HeroSectionWithSearchForm1
          heading="Find your next stay"
          image={heroImageStays}
          imageAlt="Hotels and stays"
          description={
            <p className="max-w-xl text-base text-neutral-500 sm:text-xl dark:text-neutral-400">
              Search thousands of hotels and book your room in minutes.
            </p>
          }
          searchForm={
            <div className="hero-search-form">
              <StaySearchForm
                formStyle="default"
                className="shadow-md"
                openInNewTab={false}
                onSwitchToFlights={() => router.push('/flights')}
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

        <StayDestinationsSection />
      </div>
    </main>
  )
}
