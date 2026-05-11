'use client'

import {
  ClockIcon,
  EnvelopeIcon,
  MapPinIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline'
import { FormEvent, useState } from 'react'

type ContactForm = {
  name: string
  email: string
  subject: string
  message: string
}

const INITIAL_FORM: ContactForm = {
  name: '',
  email: '',
  subject: '',
  message: '',
}

const CONTACT_DETAILS = [
  {
    label: 'Email',
    value: 'hello@nxt.deals',
    href: 'mailto:hello@nxt.deals',
    icon: EnvelopeIcon,
  },
  {
    label: 'Phone',
    value: '+61 2 0000 0000',
    href: 'tel:+61200000000',
    icon: PhoneIcon,
  },
  {
    label: 'Hours',
    value: 'Mon–Fri · 9am – 6pm GMT',
    href: null as string | null,
    icon: ClockIcon,
  },
  {
    label: 'Address',
    value: '61 Bridge Street, Kington, HR5 3DJ, United Kingdom',
    href: null as string | null,
    icon: MapPinIcon,
  },
]

export default function ContactPage() {
  const [form, setForm] = useState<ContactForm>(INITIAL_FORM)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function update<K extends keyof ContactForm>(key: K, value: ContactForm[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function isValid() {
    return (
      form.name.trim() !== '' &&
      /.+@.+\..+/.test(form.email.trim()) &&
      form.subject.trim() !== '' &&
      form.message.trim() !== ''
    )
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    if (!isValid()) {
      setError('Please fill in every field — and use a valid email address.')
      return
    }
    setSubmitting(true)
    // No backend endpoint is wired up yet — we simulate a short submit and
    // confirm to the user. Swap this for a real POST when the API is ready.
    await new Promise((r) => setTimeout(r, 500))
    setSubmitting(false)
    setSubmitted(true)
    setForm(INITIAL_FORM)
  }

  return (
    <main className="container py-12 lg:py-16">
      <section>
        <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">Contact</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl dark:text-neutral-100">
          Get in touch
        </h1>
        <p className="mt-6 text-lg text-neutral-600 dark:text-neutral-400">
          Questions about a booking, looking to partner with us, or just want to say hello? Drop us
          a message and we&apos;ll get back to you within one business day.
        </p>
      </section>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_360px] lg:gap-16">
        {/* Form */}
        <section>
          {submitted ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
              <p className="font-semibold">Thanks — message received.</p>
              <p className="mt-1">
                We&apos;ll get back to you at the email you provided within one business day.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-4 text-sm font-semibold text-emerald-700 hover:underline dark:text-emerald-200"
              >
                Send another message →
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Name"
                  required
                  value={form.name}
                  onChange={(v) => update('name', v)}
                />
                <Field
                  label="Email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(v) => update('email', v)}
                />
              </div>
              <Field
                label="Subject"
                required
                value={form.subject}
                onChange={(v) => update('subject', v)}
              />
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Message <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) => update('message', e.target.value)}
                  rows={6}
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
                />
              </div>
              {error ? <p className="text-sm text-rose-600">{error}</p> : null}
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Sending…' : 'Send message'}
              </button>
            </form>
          )}
        </section>

        {/* Contact details */}
        <aside className="space-y-4">
          <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">Other ways to reach us</h2>
          <dl className="space-y-3">
            {CONTACT_DETAILS.map((c) => (
              <div
                key={c.label}
                className="flex items-start gap-3 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400">
                  <c.icon className="size-5" />
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    {c.label}
                  </dt>
                  <dd className="text-sm text-neutral-800 dark:text-neutral-200">
                    {c.href ? (
                      <a href={c.href} className="hover:text-orange-600 hover:underline">
                        {c.value}
                      </a>
                    ) : (
                      c.value
                    )}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        </aside>
      </div>
    </main>
  )
}

function Field({
  label,
  type = 'text',
  value,
  required,
  onChange,
}: {
  label: string
  type?: string
  value: string
  required?: boolean
  onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
        {label} {required ? <span className="text-rose-500">*</span> : null}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
      />
    </div>
  )
}
