import type { Metadata } from 'next'

import { AirlinesDirectory } from '@/components/AirlinesDirectory'
import { listAllAirlines } from '@/lib/duffel'

export const revalidate = 86_400

export const metadata: Metadata = {
  title: 'Airlines',
  description:
    'Browse every airline available through NXT.DEALS flight search. View conditions of carriage and find flights by carrier.',
}

export default async function AirlinesPage() {
  const airlines = await listAllAirlines()
  return <AirlinesDirectory airlines={airlines} />
}
