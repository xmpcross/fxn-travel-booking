'use client'

import { useEffect } from 'react'

export default function StaysError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Surface to the browser console too so it's grep-able.
    console.error('[/stays error]', error)
  }, [error])

  return (
    <main className="container py-12">
      <div className="rounded-2xl border border-rose-300 bg-rose-50 p-6 text-sm text-rose-900 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
        <h1 className="text-base font-bold">Something went wrong on /stays</h1>
        <p className="mt-2 font-mono text-xs">
          <strong>Name:</strong> {error.name}
        </p>
        <p className="mt-1 font-mono text-xs">
          <strong>Message:</strong> {error.message}
        </p>
        {error.digest ? (
          <p className="mt-1 font-mono text-xs">
            <strong>Digest:</strong> {error.digest}
          </p>
        ) : null}
        {error.stack ? (
          <pre className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap rounded bg-rose-100 p-3 font-mono text-[11px] leading-snug text-rose-900 dark:bg-rose-950/60 dark:text-rose-100">
            {error.stack}
          </pre>
        ) : null}
        <button
          type="button"
          onClick={reset}
          className="mt-4 rounded-md bg-rose-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-rose-700"
        >
          Try again
        </button>
      </div>
    </main>
  )
}
