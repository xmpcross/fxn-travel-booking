'use client'

import { SUPPORTED_CURRENCIES, useCurrency } from '@/contexts/CurrencyContext'
import { CloseButton, Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/24/solid'
import clsx from 'clsx'

export default function CurrencyPicker({ className }: { className?: string }) {
  const { currency, setCurrency } = useCurrency()

  return (
    <Popover className={clsx('group', className)}>
      <PopoverButton className="-m-2 flex items-center gap-1 rounded-md p-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 focus:outline-hidden dark:text-neutral-200 dark:hover:bg-neutral-800">
        <span>{currency}</span>
        <ChevronDownIcon className="size-3.5 group-data-open:rotate-180" aria-hidden />
      </PopoverButton>
      <PopoverPanel
        anchor={{ to: 'bottom end', gap: 8 }}
        transition
        className="z-40 w-64 rounded-2xl bg-white p-3 shadow-lg ring-1 ring-black/5 transition duration-200 ease-in-out data-closed:translate-y-1 data-closed:opacity-0 dark:bg-neutral-900"
      >
        <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Display currency
        </p>
        <div className="max-h-72 overflow-y-auto">
          {SUPPORTED_CURRENCIES.map((c) => (
            <CloseButton
              key={c.code}
              as="button"
              type="button"
              onClick={() => setCurrency(c.code)}
              className={clsx(
                'flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors',
                c.code === currency
                  ? 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300'
                  : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
              )}
            >
              <span>
                <span className="font-semibold">{c.code}</span>
                <span className="ms-2 text-neutral-500">{c.name}</span>
              </span>
              <span className="text-neutral-400">{c.symbol}</span>
            </CloseButton>
          ))}
        </div>
      </PopoverPanel>
    </Popover>
  )
}
