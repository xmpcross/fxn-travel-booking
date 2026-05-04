import clsx from 'clsx'
import { FlightSearchForm } from './FlightSearchForm'

// Single-vertical product (flights only). Kept as a thin wrapper so existing call
// sites (Header, home page, HeroSearchFormSmall) don't have to change.
const HeroSearchForm = ({ className }: { className?: string }) => {
  return (
    <div className={clsx('hero-search-form', className)}>
      <FlightSearchForm formStyle="default" className="shadow-md" />
    </div>
  )
}

export default HeroSearchForm
