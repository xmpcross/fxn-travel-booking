'use client'

import HeroSectionWithSearchForm1 from '@/components/hero-sections/HeroSectionWithSearchForm1'
import { FlightSearchForm } from '@/components/HeroSearchForm/FlightSearchForm'
import { StaySearchForm } from '@/components/HeroSearchForm/StaySearchForm'
import heroImageFlights from '@/images/hero-right-flight.png'
import heroImageStays from '@/images/hero-right.png'
import { useState } from 'react'

type Mode = 'flights' | 'stays'

const COPY: Record<Mode, { heading: string; description: string; image: typeof heroImageFlights }> = {
  flights: {
    heading: 'Find your next flight',
    description: 'Search hundreds of airlines and book your tickets in minutes.',
    image: heroImageFlights,
  },
  stays: {
    heading: 'Find your next stay',
    description: 'Search thousands of hotels and book your room in minutes.',
    image: heroImageStays,
  },
}

export function HomeHero() {
  const [mode, setMode] = useState<Mode>('flights')
  const copy = COPY[mode]

  const searchForm =
    mode === 'flights' ? (
      <div className="hero-search-form">
        <FlightSearchForm
          formStyle="default"
          className="shadow-md"
          onSwitchToStays={() => setMode('stays')}
        />
      </div>
    ) : (
      <div className="hero-search-form">
        <StaySearchForm
          formStyle="default"
          className="shadow-md"
          onSwitchToFlights={() => setMode('flights')}
        />
      </div>
    )

  return (
    <HeroSectionWithSearchForm1
      heading={copy.heading}
      image={copy.image}
      imageAlt={mode === 'flights' ? 'Travel by air' : 'Hotels and stays'}
      searchForm={searchForm}
      description={
        <p className="max-w-xl text-base text-neutral-500 sm:text-xl dark:text-neutral-400">
          {copy.description}
        </p>
      }
    />
  )
}
