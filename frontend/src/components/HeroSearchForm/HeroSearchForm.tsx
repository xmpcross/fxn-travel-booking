'use client'

import clsx from 'clsx'
import { useState } from 'react'
import { FlightSearchForm } from './FlightSearchForm'
import { StaySearchForm } from './StaySearchForm'

type Mode = 'flights' | 'stays'

const HeroSearchForm = ({ className }: { className?: string }) => {
  const [mode, setMode] = useState<Mode>('flights')

  return (
    <div className={clsx('hero-search-form', className)}>
      {mode === 'flights' ? (
        <FlightSearchForm
          formStyle="default"
          className="shadow-md"
          onSwitchToStays={() => setMode('stays')}
        />
      ) : (
        <StaySearchForm
          formStyle="default"
          className="shadow-md"
          onSwitchToFlights={() => setMode('flights')}
        />
      )}
    </div>
  )
}

export default HeroSearchForm
