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

// Duffel sometimes returns codeshare ghosts where `name` starts with
// "Undefined as <Other Airline>" — pure data noise to a human visitor.
// Filter them out before rendering.
function isRenderable(a: { name: string }): boolean {
  return !a.name.toLowerCase().startsWith('undefined as')
}

export default async function AirlinesPage() {
  const all = (await listAllAirlines()).filter(isRenderable)
  const top = all.filter((a) => hasSupplement(a.iata_code))
  return <AirlinesDirectory top={top} all={all} />
}
