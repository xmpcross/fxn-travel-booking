'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

type Rates = Record<string, number>

interface CurrencyContextValue {
  /** ISO 4217 code the user wants prices displayed in. */
  currency: string
  setCurrency: (code: string) => void
  /** Map of currency → units per 1 USD (rates are USD-based). */
  rates: Rates
  ready: boolean
  /**
   * Convert `amount` (in `fromCurrency`) into the user's selected currency
   * and return a formatted string. If rates aren't loaded yet OR a code is
   * unknown, falls back to the source currency so nothing renders blank.
   */
  format: (amount: number | string | undefined | null, fromCurrency?: string | null) => string
}

const STORAGE_KEY = 'nxt.deals.currency'
const RATES_CACHE_KEY = 'nxt.deals.fx_rates'
const RATES_TTL_MS = 24 * 60 * 60 * 1000 // 24h

export const SUPPORTED_CURRENCIES: Array<{ code: string; name: string; symbol: string }> = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'GBP', name: 'Pound Sterling', symbol: '£' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿' },
]

const CurrencyContext = createContext<CurrencyContextValue | null>(null)

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<string>('USD')
  const [rates, setRates] = useState<Rates>({})
  const [ready, setReady] = useState(false)

  // Restore the user's previously-chosen currency.
  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
    if (stored) setCurrencyState(stored)
  }, [])

  // Load FX rates (cached 24h in localStorage so we don't hammer the FX API).
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const raw = localStorage.getItem(RATES_CACHE_KEY)
        if (raw) {
          const cached = JSON.parse(raw) as { fetchedAt: number; rates: Rates }
          if (cached?.rates && Date.now() - cached.fetchedAt < RATES_TTL_MS) {
            if (!cancelled) {
              setRates(cached.rates)
              setReady(true)
            }
            return
          }
        }

        // open.er-api.com is free and key-less; rates are USD-based.
        const r = await fetch('https://open.er-api.com/v6/latest/USD')
        if (!r.ok) throw new Error('FX rate fetch failed')
        const data = (await r.json()) as { result?: string; rates?: Rates }
        if (data.result === 'success' && data.rates && !cancelled) {
          setRates(data.rates)
          localStorage.setItem(
            RATES_CACHE_KEY,
            JSON.stringify({ fetchedAt: Date.now(), rates: data.rates })
          )
        }
      } catch {
        // Silently leave rates empty — format() falls back to the source currency.
      } finally {
        if (!cancelled) setReady(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const setCurrency = useCallback((code: string) => {
    setCurrencyState(code)
    try {
      localStorage.setItem(STORAGE_KEY, code)
    } catch {
      // Storage unavailable — keep the in-memory choice anyway.
    }
  }, [])

  const format = useCallback<CurrencyContextValue['format']>(
    (amount, fromCurrency) => {
      const n = typeof amount === 'string' ? Number(amount) : amount
      if (n === null || n === undefined || !Number.isFinite(n)) return ''

      const from = (fromCurrency || '').toUpperCase()
      const to = currency.toUpperCase()

      // No conversion needed or rates unavailable — render the source.
      let converted = n
      const haveFromRate = from && rates[from]
      const haveToRate = rates[to]
      if (from && from !== to && haveFromRate && haveToRate) {
        const usd = n / rates[from]
        converted = usd * rates[to]
      }

      // JPY has no decimals; everything else uses 2.
      const displayCode = from && from !== to && haveFromRate && haveToRate ? to : from || to
      const fractionDigits = displayCode === 'JPY' ? 0 : 2

      try {
        return new Intl.NumberFormat('en-GB', {
          style: 'currency',
          currency: displayCode,
          minimumFractionDigits: fractionDigits,
          maximumFractionDigits: fractionDigits,
        }).format(converted)
      } catch {
        return `${displayCode} ${converted.toFixed(fractionDigits)}`
      }
    },
    [currency, rates]
  )

  const value = useMemo<CurrencyContextValue>(
    () => ({ currency, setCurrency, rates, ready, format }),
    [currency, setCurrency, rates, ready, format]
  )

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext)
  if (!ctx) {
    // No provider — return a noop that still renders prices in the source
    // currency so individual pages don't crash if they're rendered standalone.
    return {
      currency: 'USD',
      setCurrency: () => {},
      rates: {},
      ready: false,
      format: (amount, fromCurrency) => {
        const n = typeof amount === 'string' ? Number(amount) : amount
        if (n === null || n === undefined || !Number.isFinite(n)) return ''
        return `${(fromCurrency || 'USD').toUpperCase()} ${n.toFixed(2)}`
      },
    }
  }
  return ctx
}
