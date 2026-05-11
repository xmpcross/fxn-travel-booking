'use client'

import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

const FAQS: { question: string; answer: string }[] = [
  {
    question: 'How do I find travel deals on NXT.Deals?',
    answer:
      'Use the flight search to compare fares across hundreds of airlines in seconds. Filter by stops, cabin class and times to surface the best value for your trip.',
  },
  {
    question: 'What makes NXT.Deals a great travel app?',
    answer:
      'NXT.Deals pulls live inventory from a global airline network, shows transparent pricing with no hidden fees, and lets you book your itinerary in just a few clicks.',
  },
  {
    question: 'How can I use NXT.Deals to manage my travel bookings?',
    answer:
      'Sign in to your account to view itineraries, add extras like baggage or seat selection, request changes, and download e-tickets — all from a single dashboard.',
  },
  {
    question: 'What are NXT.Deals Price Alerts?',
    answer:
      'Price Alerts let you track a specific route so we can notify you when fares drop or rise. Set the route and travel dates once, and we will email you when prices change.',
  },
]

export function FaqSection() {
  return (
    <section>
      <h2 className="text-2xl font-bold text-neutral-900 sm:text-3xl dark:text-neutral-100">
        Frequently asked questions !
      </h2>

      <div className="mt-6 grid grid-cols-1 gap-x-12 sm:grid-cols-2">
        {FAQS.map((faq) => (
          <Disclosure key={faq.question}>
            {({ open }) => (
              <div className="border-b border-neutral-200 dark:border-neutral-800">
                <DisclosureButton className="flex w-full items-center justify-between py-5 text-left">
                  <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    {faq.question}
                  </span>
                  <ChevronDownIcon
                    className={`size-5 shrink-0 text-neutral-500 transition-transform ${
                      open ? 'rotate-180' : ''
                    }`}
                    strokeWidth={2}
                  />
                </DisclosureButton>
                <DisclosurePanel className="pb-5 text-sm text-neutral-600 dark:text-neutral-400">
                  {faq.answer}
                </DisclosurePanel>
              </div>
            )}
          </Disclosure>
        ))}
      </div>
    </section>
  )
}
