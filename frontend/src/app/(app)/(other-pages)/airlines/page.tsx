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
  // Restrict the directory to the hand-curated top carriers (the ones we
  // have supplementary alliance/hub/founded data for). Anyone visiting an
  // un-supplemented airline directly via /airlines/{code} still works.
  const airlines = all.filter((a) => hasSupplement(a.iata_code))
  return <AirlinesDirectory airlines={airlines} />
}
