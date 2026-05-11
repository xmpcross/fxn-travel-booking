'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

import { StaySearchForm } from '@/components/HeroSearchForm/StaySearchForm'

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
    <main className="bg-neutral-50 pb-16 dark:bg-neutral-950">
      <div className="container py-6">
        <div className="rounded-2xl bg-white p-2 shadow-sm dark:bg-neutral-900">
          <StaySearchForm
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
      </div>
    </main>
  )
}
