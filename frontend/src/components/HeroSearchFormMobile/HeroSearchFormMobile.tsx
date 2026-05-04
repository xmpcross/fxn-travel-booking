'use client'

import { ButtonCircle } from '@/shared/Button'
import { FlightSearchForm } from '@/components/HeroSearchForm/FlightSearchForm'
import { CloseButton, Dialog, DialogPanel } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/solid'
import { Search01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import clsx from 'clsx'
import { useState } from 'react'

const HeroSearchFormMobile = ({ className }: { className?: string }) => {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <div className={clsx(className, 'relative z-10 w-full max-w-lg')}>
      {/* Mobile trigger button (visible in the sticky header on phones). */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative flex w-full items-center rounded-full border border-neutral-200 px-4 py-2 pe-11 shadow-sm dark:border-neutral-600"
      >
        <HugeiconsIcon icon={Search01Icon} size={20} color="currentColor" strokeWidth={1.5} />
        <div className="ms-3 flex-1 overflow-hidden text-start">
          <span className="block text-sm font-medium">Where to?</span>
          <span className="mt-0.5 block text-xs font-light text-neutral-500 dark:text-neutral-400">
            <span className="line-clamp-1">Anywhere · Any week · Add travellers</span>
          </span>
        </div>
      </button>

      <Dialog as="div" className="relative z-max" onClose={close} open={open}>
        <div className="fixed inset-0 overflow-y-auto bg-neutral-50 dark:bg-neutral-900">
          <DialogPanel
            transition
            className="relative min-h-full p-4 transition data-closed:translate-y-12 data-closed:opacity-0 sm:p-6"
          >
            {/* Close button, top right */}
            <div className="absolute end-3 top-3 z-10">
              <CloseButton color="light" as={ButtonCircle} className="size-8!">
                <XMarkIcon className="size-4!" />
              </CloseButton>
            </div>

            <h2 className="mt-2 mb-4 text-base font-semibold text-neutral-900 dark:text-neutral-100">
              Find a flight
            </h2>

            {/* Reuse the desktop form — collapses to a single column on small viewports.
                On mobile we navigate in-place rather than open a new tab. */}
            <FlightSearchForm openInNewTab={false} />
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  )
}

export default HeroSearchFormMobile
