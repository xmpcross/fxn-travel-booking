'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

import { FlightSearchForm } from '@/components/HeroSearchForm/FlightSearchForm'

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
    <main className="bg-neutral-50 pb-16 dark:bg-neutral-950">
      <div className="container py-6">
        <div className="rounded-2xl bg-white p-2 shadow-sm dark:bg-neutral-900">
          <FlightSearchForm
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
              tripType: params.get('returnDate') ? 'return' : 'oneway',
            }}
          />
        </div>
      </div>
    </main>
  )
}
