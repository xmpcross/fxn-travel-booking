'use client'

import {
  ArrowRightIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  CursorArrowRaysIcon,
  PaintBrushIcon,
  RectangleGroupIcon,
  SparklesIcon,
  Squares2X2Icon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { FormEvent, useState } from 'react'

type LeadForm = {
  firstName: string
  surname: string
  company: string
  website: string
  email: string
  phone: string
  country: string
  industry: string
  interested: boolean
  message: string
}

const INITIAL_FORM: LeadForm = {
  firstName: '',
  surname: '',
  company: '',
  website: '',
  email: '',
  phone: '',
  country: '',
  industry: '',
  interested: true,
  message: '',
}

const PRODUCTS = [
  {
    icon: Squares2X2Icon,
    title: 'Native placements',
    body: "Show up right in travellers' search results. Formats for every vertical — airline ancillaries, destination spotlights, hotel chains — with pricing integrations through our partner API.",
  },
  {
    icon: RectangleGroupIcon,
    title: 'Display ads',
    body: 'Be front and centre while travellers search, compare, and book. Advanced targeting by route, cabin class, party size, and destination keeps your brand top of mind at the moment that matters.',
  },
  {
    icon: CursorArrowRaysIcon,
    title: 'Audience extension',
    body: "Retarget NXT.DEALS's qualified travel audience wherever they roam online. Our first-party booking and search data lets you serve fresh, relevant content beyond our site.",
  },
  {
    icon: PaintBrushIcon,
    title: 'Content & creative solutions',
    body: "Ditch the ordinary. Our editorial and design team turns brand messages into stories travellers will actually stop scrolling for — videos, guides, sponsored itineraries, the lot.",
  },
]

const PILLARS = [
  {
    icon: UserGroupIcon,
    title: 'Qualified audience & insights',
    body: 'Reach travellers actively planning trips — searching dates, comparing fares, deciding between destinations. We surface the audience-level insights so you can target exactly who you want to hear your message.',
  },
  {
    icon: ChartBarIcon,
    title: 'Tailored strategies',
    body: 'No off-the-shelf media plans. We build ultra-personalised campaigns spanning a full spectrum of metrics — reach, frequency, qualified leads, completed bookings — measured against your specific goals.',
  },
  {
    icon: SparklesIcon,
    title: 'Bespoke content creation',
    body: 'Make things travellers care about. Our in-house creators design and produce campaigns that support your key brand objectives while genuinely earning the attention of our audience.',
  },
]

export default function AdvertisePage() {
  const [form, setForm] = useState<LeadForm>(INITIAL_FORM)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function update<K extends keyof LeadForm>(key: K, value: LeadForm[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function isValid() {
    return (
      form.firstName.trim() !== '' &&
      form.surname.trim() !== '' &&
      form.company.trim() !== '' &&
      form.website.trim() !== '' &&
      /.+@.+\..+/.test(form.email.trim())
    )
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    if (!isValid()) {
      setError('Please fill in every required field — and use a valid email address.')
      return
    }
    setSubmitting(true)
    // No backend endpoint yet — simulate a submit + thank-you. Swap for a
    // real POST when the CRM / lead intake is wired up.
    await new Promise((r) => setTimeout(r, 600))
    setSubmitting(false)
    setSubmitted(true)
    setForm(INITIAL_FORM)
  }

  return (
    <main className="bg-neutral-50 pb-16 dark:bg-neutral-950">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-white dark:from-orange-950/30 dark:via-neutral-950 dark:to-neutral-950">
        <div className="container py-16 lg:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
              Advertise with NXT.DEALS
            </p>
            <h1 className="mt-4 text-[2.25rem] font-bold tracking-tight text-neutral-900 sm:text-5xl dark:text-neutral-100">
              Making great trips happen.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base text-neutral-600 sm:text-lg dark:text-neutral-400">
              NXT.DEALS is where travellers find better trips — and where smart brands bring
              campaigns to life with bold creative, solid strategy, and insights that reach a
              ready-to-book audience.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a
                href="#contact"
                className="inline-flex items-center gap-1.5 rounded-full bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-600"
              >
                Talk to us
                <ArrowRightIcon className="size-4" />
              </a>
              <a
                href="#products"
                className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-6 py-2.5 text-sm font-semibold text-neutral-700 hover:border-orange-400 hover:text-orange-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
              >
                See our solutions
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="container mt-16 lg:mt-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            We work with the best.
          </h2>
          <p className="mt-4 text-base text-neutral-600 dark:text-neutral-400">
            Travellers (and brands) trust us. We work with industry-leading airlines, hotel
            groups, destination marketing organisations, and financial-services partners to build
            innovative solutions that stay ahead of trends. Our partners come back because we
            deliver exceptional value while giving travellers experiences worth the trip.
          </p>
        </div>
      </section>

      {/* Campaign results */}
      <section className="container mt-16 lg:mt-20">
        <div className="grid gap-10 rounded-3xl bg-white p-8 shadow-sm lg:grid-cols-2 lg:p-12 dark:bg-neutral-900">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
              Performance
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              Campaigns that drive results.
            </h2>
            <p className="mt-5 text-base text-neutral-600 dark:text-neutral-400">
              We help brands reach new heights through strategic, creative campaigns. From
              helping destinations reach new audiences to working with consumer brands to
              re-engage their base, we build meaningful, insight-led platforms that tell great
              stories — and deliver great results.
            </p>
            <a
              href="#contact"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-orange-600 hover:underline dark:text-orange-400"
            >
              View success stories
              <ArrowRightIcon className="size-4" />
            </a>
          </div>
          <dl className="grid grid-cols-2 gap-6 self-center">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Monthly travellers
              </dt>
              <dd className="mt-1 text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                10M+
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Markets covered
              </dt>
              <dd className="mt-1 text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                40+
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Airline partners
              </dt>
              <dd className="mt-1 text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                800+
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Avg. campaign CTR uplift
              </dt>
              <dd className="mt-1 text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                2.4×
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Products */}
      <section id="products" className="container mt-16 lg:mt-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            A full spectrum of solutions.
          </h2>
          <p className="mt-4 text-base text-neutral-600 dark:text-neutral-400">
            Whether you're an airline appealing to leisure travellers, a destination partner
            looking to attract visitors, or a financial institution with a great loyalty
            programme — we have a product that fits your campaign.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-5xl gap-5 sm:grid-cols-2">
          {PRODUCTS.map((p) => (
            <div
              key={p.title}
              className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="inline-flex size-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-300">
                <p.icon className="size-5" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-neutral-900 dark:text-neutral-100">
                {p.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                {p.body}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <a
            href="#contact"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-600 hover:underline dark:text-orange-400"
          >
            Learn more about ad products
            <ArrowRightIcon className="size-4" />
          </a>
        </div>
      </section>

      {/* Value pillars */}
      <section className="container mt-16 lg:mt-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Why team up with us.
          </h2>
          <p className="mt-4 text-base text-neutral-600 dark:text-neutral-400">
            Reach travellers who are ready to book. NXT.DEALS combines smart insights, digital
            know-how, and stand-out creative to help your brand convert at every step of the
            travel funnel.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-5xl gap-5 sm:grid-cols-3">
          {PILLARS.map((p) => (
            <div
              key={p.title}
              className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="inline-flex size-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-300">
                <p.icon className="size-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-neutral-900 dark:text-neutral-100">
                {p.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact form */}
      <section id="contact" className="container mt-16 lg:mt-20">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-sm dark:bg-neutral-900 sm:p-10">
          <div className="text-center">
            <div className="inline-flex size-10 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-300">
              <ChatBubbleLeftRightIcon className="size-5" />
            </div>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              Like what you see? Let&apos;s chat.
            </h2>
            <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
              Drop your details and a campaign-strategist will get back to you within two
              business days.
            </p>
          </div>

          {submitted ? (
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
              <CheckCircleIcon className="mt-0.5 size-5 shrink-0 text-emerald-500" />
              <div>
                <p className="font-semibold">Thanks — request received.</p>
                <p className="mt-1">
                  We&apos;ll be in touch at the email you provided within two business days.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-3 text-sm font-semibold text-emerald-700 hover:underline dark:text-emerald-200"
                >
                  Submit another enquiry →
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="First name"
                  required
                  value={form.firstName}
                  onChange={(v) => update('firstName', v)}
                />
                <Field
                  label="Surname"
                  required
                  value={form.surname}
                  onChange={(v) => update('surname', v)}
                />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Company"
                  required
                  value={form.company}
                  onChange={(v) => update('company', v)}
                />
                <Field
                  label="Company website"
                  required
                  value={form.website}
                  onChange={(v) => update('website', v)}
                />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Official email address"
                  type="email"
                  required
                  value={form.email}
                  onChange={(v) => update('email', v)}
                />
                <Field
                  label="Phone"
                  value={form.phone}
                  onChange={(v) => update('phone', v)}
                />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Country"
                  value={form.country}
                  onChange={(v) => update('country', v)}
                />
                <Field
                  label="Industry"
                  value={form.industry}
                  onChange={(v) => update('industry', v)}
                  placeholder="Airline, hotel, DMO, agency…"
                />
              </div>

              <label className="flex cursor-pointer items-start gap-2.5 text-sm text-neutral-700 dark:text-neutral-300">
                <input
                  type="checkbox"
                  checked={form.interested}
                  onChange={(e) => update('interested', e.target.checked)}
                  className="mt-0.5 size-4 rounded border-neutral-300 text-orange-500 focus:ring-orange-500 dark:border-neutral-600 dark:bg-neutral-800"
                />
                <span>I am interested in advertising on NXT.DEALS</span>
              </label>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  How can we help you?
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) => update('message', e.target.value)}
                  rows={5}
                  placeholder="Tell us about your campaign goals, target audience, and timing."
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
                />
              </div>

              {error ? (
                <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
              ) : null}

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {submitting ? 'Sending…' : 'Submit enquiry'}
                {submitting ? null : <ArrowRightIcon className="size-4" />}
              </button>
              <p className="text-xs text-neutral-500">
                By submitting this form, you agree to be contacted by the NXT.DEALS partnerships
                team about your enquiry.
              </p>
            </form>
          )}
        </div>

        <p className="mx-auto mt-6 max-w-3xl text-center text-xs text-neutral-500">
          NXT.DEALS is a trading name of FXN Holdings Limited.{' '}
          <Link href="/privacy" className="underline hover:text-orange-600">
            Privacy
          </Link>{' '}
          ·{' '}
          <Link href="/terms" className="underline hover:text-orange-600">
            Terms
          </Link>
        </p>
      </section>

    </main>
  )
}

function Field({
  label,
  type = 'text',
  value,
  required,
  placeholder,
  onChange,
}: {
  label: string
  type?: string
  value: string
  required?: boolean
  placeholder?: string
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
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
      />
    </div>
  )
}
