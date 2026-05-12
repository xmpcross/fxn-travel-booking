import { NextRequest, NextResponse } from 'next/server'

// Don't cache — each visitor should see their own resolved city.
export const dynamic = 'force-dynamic'
export const revalidate = 0

type GeoCity = { city: string | null; country: string | null }

// Crude in-memory cache so repeated visits from the same IP within the
// process lifetime don't re-hit the upstream geo API.
const cache = new Map<string, { value: GeoCity; expiresAt: number }>()
const CACHE_TTL_MS = 6 * 60 * 60 * 1000 // 6h

function getClientIp(request: NextRequest): string | null {
  const xff = request.headers.get('x-forwarded-for')
  if (xff) {
    // The leftmost IP in X-Forwarded-For is the original client.
    const first = xff.split(',')[0]?.trim()
    if (first) return first
  }
  return request.headers.get('x-real-ip')?.trim() || null
}

function isPrivateOrLocal(ip: string | null): boolean {
  if (!ip) return true
  if (ip === '127.0.0.1' || ip === '::1') return true
  // Private ranges per RFC 1918 + link-local. Keep this conservative —
  // false-negatives just hit the upstream API instead of being skipped.
  if (ip.startsWith('10.')) return true
  if (ip.startsWith('192.168.')) return true
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(ip)) return true
  if (ip.startsWith('169.254.')) return true
  return false
}

export async function GET(request: NextRequest) {
  const ip = getClientIp(request)
  const cacheKey = ip || '__unknown__'
  const now = Date.now()
  const cached = cache.get(cacheKey)
  if (cached && cached.expiresAt > now) {
    return NextResponse.json(cached.value)
  }

  // For private/loopback IPs (typically only in local dev), ask the upstream
  // API to geocode the server's own egress IP by hitting /json/ without a
  // specific IP. In production behind nginx, X-Forwarded-For carries the
  // real client IP and we look that up explicitly.
  const usePrivateFallback = isPrivateOrLocal(ip)
  const url = usePrivateFallback ? 'https://ipapi.co/json/' : `https://ipapi.co/${ip}/json/`

  let value: GeoCity = { city: null, country: null }
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'fxn-travel-booking/1.0' },
      // Don't hold the response open if upstream is slow — geo prefill is a
      // nice-to-have, not a blocker for rendering the form.
      signal: AbortSignal.timeout(2500),
    })
    if (res.ok) {
      const data = (await res.json()) as { city?: string; country_name?: string }
      value = { city: data.city ?? null, country: data.country_name ?? null }
    }
  } catch {
    // Upstream timeout / network error — return null and let the client
    // fall back to an empty field.
  }

  cache.set(cacheKey, { value, expiresAt: now + CACHE_TTL_MS })
  return NextResponse.json(value)
}
