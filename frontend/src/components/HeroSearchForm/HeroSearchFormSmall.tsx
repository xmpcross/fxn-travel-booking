'use client'

import clsx from 'clsx'
import { FlightSearchForm } from './FlightSearchForm'

// Compact variant rendered in the sticky header after scrolling. Single-vertical
// (flights) so no tabs.
const HeroSearchFormSmall = ({ className }: { className?: string }) => {
  return (
    <div className={clsx('hero-search-form-sm', className)}>
      <FlightSearchForm formStyle="small" />
    </div>
  )
}

export default HeroSearchFormSmall
