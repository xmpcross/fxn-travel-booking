import type { Metadata } from 'next'

import { AirlinesDirectory } from '@/components/AirlinesDirectory'
import { hasSupplement } from '@/data/airlineSupplement'
import { listAllAirlines } from '@/lib/duffel'

export const revalidate = 86_400

export const metadata: Metadata = {
  title: 'Airlines',
  description:
    'Top airlines available through NXT.DEALS flight search. View alliance membership, hubs, conditions of carriage, and find flights by carrier.',
}

export default async function AirlinesPage() {
  const all = await listAllAirlines()
  const top = all.filter((a) => hasSupplement(a.iata_code))
  return <AirlinesDirectory top={top} all={all} />
}
