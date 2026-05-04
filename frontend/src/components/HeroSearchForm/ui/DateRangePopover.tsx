'use client'

import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import clsx from 'clsx'
import { FC } from 'react'
import DatePicker from 'react-datepicker'

interface Props {
  tripType: 'return' | 'oneway'
  startDate: Date | null
  endDate: Date | null
  onChange: (range: { start: Date | null; end: Date | null }) => void
}

const labelClass = 'mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300'
const triggerClass =
  'w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-left text-sm text-neutral-900 hover:border-neutral-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100'

function formatDate(d: Date | null): string {
  if (!d) return ''
  return d.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export const DateRangePopover: FC<Props> = ({ tripType, startDate, endDate, onChange }) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // react-datepicker calls onChange with [start, end] in range mode, or a single Date in single-date mode.
  const handleChange = (value: unknown) => {
    if (Array.isArray(value)) {
      onChange({ start: (value[0] as Date | null) ?? null, end: (value[1] as Date | null) ?? null })
    } else {
      onChange({ start: (value as Date | null) ?? null, end: null })
    }
  }

  return (
    <Popover className={clsx('relative col-span-1', tripType === 'return' && 'sm:col-span-2 lg:col-span-2')}>
      {/* Triggers — both open the same popover */}
      <div className={clsx('grid gap-3', tripType === 'return' ? 'grid-cols-2' : 'grid-cols-1')}>
        <div>
          <label className={labelClass}>Departure</label>
          <PopoverButton className={triggerClass} type="button">
            {startDate ? (
              formatDate(startDate)
            ) : (
              <span className="text-neutral-400">Select date</span>
            )}
          </PopoverButton>
        </div>
        {tripType === 'return' && (
          <div>
            <label className={labelClass}>Return</label>
            <PopoverButton className={triggerClass} type="button">
              {endDate ? (
                formatDate(endDate)
              ) : (
                <span className="text-neutral-400">Select date</span>
              )}
            </PopoverButton>
          </div>
        )}
      </div>

      <PopoverPanel
        anchor={{ to: 'bottom start', gap: 8 }}
        className="z-50 origin-top-left rounded-lg border border-neutral-200 bg-white p-4 shadow-xl dark:border-neutral-700 dark:bg-neutral-900"
      >
        {tripType === 'return' ? (
          <DatePicker
            selected={startDate ?? undefined}
            startDate={startDate ?? undefined}
            endDate={endDate ?? undefined}
            onChange={handleChange}
            selectsRange
            monthsShown={2}
            minDate={today}
            inline
          />
        ) : (
          <DatePicker
            selected={startDate ?? undefined}
            onChange={handleChange}
            monthsShown={2}
            minDate={today}
            inline
          />
        )}
      </PopoverPanel>
    </Popover>
  )
}
