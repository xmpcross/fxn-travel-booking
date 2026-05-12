'use client'

import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import { ArrowRightIcon, CalendarDaysIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { FC } from 'react'
import DatePicker from 'react-datepicker'

interface Props {
  tripType: 'return' | 'oneway'
  startDate: Date | null
  endDate: Date | null
  onChange: (range: { start: Date | null; end: Date | null }) => void
}

function formatShort(d: Date | null): string {
  if (!d) return ''
  return d.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

function formatTrigger(start: Date | null, end: Date | null, tripType: 'return' | 'oneway'): string {
  if (!start) return ''
  if (tripType === 'oneway') return formatShort(start)
  if (!end) return formatShort(start)
  return `${formatShort(start)} - ${formatShort(end)}`
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

  const triggerValue = formatTrigger(startDate, endDate, tripType)

  return (
    <Popover className="relative">
      <PopoverButton
        type="button"
        className="group relative flex w-full items-center gap-3 rounded-lg border border-neutral-300 bg-white px-4 py-2 text-left transition-colors hover:border-neutral-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-neutral-600 dark:bg-neutral-800 dark:hover:border-neutral-500"
      >
        <CalendarDaysIcon className="size-5 shrink-0 text-neutral-500 dark:text-neutral-400" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <span className="block text-[11px] font-medium leading-tight text-neutral-700 dark:text-neutral-300">
            Dates
          </span>
          <span
            className={clsx(
              'block truncate text-base',
              triggerValue
                ? 'font-semibold text-neutral-900 dark:text-neutral-100'
                : 'text-neutral-500 dark:text-neutral-400'
            )}
          >
            {triggerValue || 'Select dates'}
          </span>
        </div>
      </PopoverButton>

      <PopoverPanel
        anchor={{ to: 'bottom start', gap: 8 }}
        className="z-50 origin-top-left rounded-xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-700 dark:bg-neutral-900"
      >
        {({ close }) => (
          <div className="flex w-[min(90vw,46rem)] flex-col">
            {/* Range summary header */}
            <div className="flex items-center gap-3 border-b border-neutral-200 px-6 py-4 dark:border-neutral-700">
              <span
                className={clsx(
                  'pb-0.5 text-base font-bold',
                  startDate
                    ? 'border-b-2 border-blue-600 text-neutral-900 dark:text-neutral-100'
                    : 'text-neutral-400'
                )}
              >
                {startDate ? formatShort(startDate) : 'Select departure'}
              </span>
              {tripType === 'return' && (
                <>
                  <ArrowRightIcon className="size-4 text-neutral-400" aria-hidden="true" />
                  <span
                    className={clsx(
                      'pb-0.5 text-base font-bold',
                      endDate ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-400'
                    )}
                  >
                    {endDate ? formatShort(endDate) : 'Select return'}
                  </span>
                </>
              )}
            </div>

            {/* Calendar */}
            <div className="px-4 py-4">
              {tripType === 'return' ? (
                <DatePicker
                  selected={startDate ?? undefined}
                  startDate={startDate ?? undefined}
                  endDate={endDate ?? undefined}
                  onChange={handleChange}
                  selectsRange
                  monthsShown={2}
                  minDate={today}
                  calendarStartDay={1}
                  inline
                />
              ) : (
                <DatePicker
                  selected={startDate ?? undefined}
                  onChange={handleChange}
                  monthsShown={2}
                  minDate={today}
                  calendarStartDay={1}
                  inline
                />
              )}
            </div>

            {/* Done */}
            <div className="flex items-center justify-end border-t border-neutral-200 px-4 py-3 dark:border-neutral-700">
              <button
                type="button"
                onClick={() => close()}
                className="rounded-full bg-blue-600 px-6 py-2 text-sm font-semibold !text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </PopoverPanel>
    </Popover>
  )
}
