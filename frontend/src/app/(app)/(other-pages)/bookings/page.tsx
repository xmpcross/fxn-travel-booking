'use client'

import { useState } from 'react'

type BookingResult = {
  id: string
  type: 'flight' | 'stay'
  status: string
  reference: string | null
  duffelOrderId: string | null
  totalAmount: string | null
  currency: string | null
  bookedAt: string | null
  passengers: Array<{
    givenName: string
    familyName: string
    type: string | null
    email: string | null
  }>
}

function formatMoney(amount: string | null, currency: string | null): string {
  if (!amount) return '—'
  if (!currency) return amount
  try {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(Number(amount))
  } catch {
    return `${currency} ${amount}`
  }
}

export default function BookingsLookupPage() {
  const [reference, setReference] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [booking, setBooking] = useState<BookingResult | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setBooking(null)
    try {
      const res = await fetch('/api/bookings/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference, email }),
      })
      const data = (await res.json()) as { booking?: BookingResult; error?: string }
      if (!res.ok) {
        setError(data.error ?? 'Lookup failed')
      } else if (data.booking) {
        setBooking(data.booking)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lookup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="bg-neutral-50 pb-16 dark:bg-neutral-950">
      <div className="container max-w-2xl py-10">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          Find my booking
        </h1>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          Enter your booking reference and the email you used at checkout.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Booking reference
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g. ABC123"
              autoComplete="off"
              spellCheck={false}
              required
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm font-mono uppercase tracking-wide focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Looking up…' : 'Find booking'}
          </button>
        </form>

        {error ? (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
            {error}
          </div>
        ) : null}

        {booking ? (
          <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                {booking.type === 'flight' ? 'Flight' : 'Stay'} booking
              </h2>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${
                  booking.status === 'confirmed'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                    : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                }`}
              >
                {booking.status}
              </span>
            </div>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Reference
                </dt>
                <dd className="mt-0.5 font-mono font-semibold text-neutral-900 dark:text-neutral-100">
                  {booking.reference ?? '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Total
                </dt>
                <dd className="mt-0.5 font-semibold text-neutral-900 dark:text-neutral-100">
                  {formatMoney(booking.totalAmount, booking.currency)}
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Duffel order
                </dt>
                <dd className="mt-0.5 break-all font-mono text-xs text-neutral-700 dark:text-neutral-300">
                  {booking.duffelOrderId ?? '—'}
                </dd>
              </div>
              {booking.passengers.length > 0 ? (
                <div className="col-span-2">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Passengers
                  </dt>
                  <dd className="mt-2 space-y-1.5">
                    {booking.passengers.map((p, i) => (
                      <div key={i} className="text-sm text-neutral-800 dark:text-neutral-200">
                        {p.givenName} {p.familyName}
                        {p.type ? ` · ${p.type}` : ''}
                        {p.email ? ` · ${p.email}` : ''}
                      </div>
                    ))}
                  </dd>
                </div>
              ) : null}
            </dl>
            <p className="mt-4 text-xs text-neutral-500">
              Need to make changes? Contact support and reference this booking ID.
            </p>
          </div>
        ) : null}
      </div>
    </main>
  )
}
