import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How NXT.DEALS collects, uses, and protects your personal data when you search and book travel.',
}

const LAST_UPDATED = '11 May 2026'

const SECTIONS = [
  { id: 'who-we-are', title: '1. Who we are' },
  { id: 'data-we-collect', title: '2. The data we collect' },
  { id: 'how-we-use-it', title: '3. How we use your data' },
  { id: 'lawful-basis', title: '4. Lawful basis for processing' },
  { id: 'sharing', title: '5. Who we share your data with' },
  { id: 'duffel', title: '6. Bookings powered by Duffel' },
  { id: 'transfers', title: '7. International transfers' },
  { id: 'retention', title: '8. Data retention' },
  { id: 'your-rights', title: '9. Your rights' },
  { id: 'cookies', title: '10. Cookies and tracking' },
  { id: 'security', title: '11. Security' },
  { id: 'children', title: '12. Children' },
  { id: 'changes', title: '13. Changes to this policy' },
  { id: 'contact', title: '14. How to contact us' },
]

export default function PrivacyPolicyPage() {
  return (
    <main className="container py-12 lg:py-16">
      <header className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">Legal</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl dark:text-neutral-100">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-neutral-500">Last updated: {LAST_UPDATED}</p>
        <p className="mt-6 text-lg text-neutral-600 dark:text-neutral-400">
          This Privacy Policy explains how NXT.DEALS (&quot;we&quot;, &quot;us&quot;) collects, uses,
          shares, and protects your personal data when you visit our website, search for travel
          options, and book flights or accommodation through us.
        </p>
      </header>

      <div className="mx-auto mt-12 grid max-w-6xl gap-12 lg:grid-cols-[16rem_1fr]">
        {/* TOC */}
        <aside className="hidden lg:block">
          <nav className="sticky top-24 text-sm">
            <p className="mb-3 font-semibold text-neutral-900 dark:text-neutral-100">Contents</p>
            <ul className="space-y-2">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="text-neutral-600 hover:text-orange-600 dark:text-neutral-400"
                  >
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Body */}
        <article className="prose prose-neutral max-w-none dark:prose-invert prose-headings:scroll-mt-24 prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4">
          <section id="who-we-are">
            <h2>1. Who we are</h2>
            <p>
              NXT.DEALS is a travel comparison and booking platform operated by{' '}
              <strong>[Operating Entity Legal Name]</strong>, a company registered in{' '}
              <strong>[Country]</strong> (company number <strong>[Number]</strong>), with its
              registered office at <strong>[Registered Address]</strong>. For the purposes of UK
              GDPR and the EU GDPR, we are the data controller of the personal data we collect
              about you through this website.
            </p>
            <p>
              You can reach our privacy team at{' '}
              <a href="mailto:privacy@nxt.deals">privacy@nxt.deals</a>.
            </p>
          </section>

          <section id="data-we-collect">
            <h2>2. The data we collect</h2>
            <p>We collect the following categories of personal data:</p>
            <ul>
              <li>
                <strong>Identity data</strong> — full name, date of birth, gender, nationality, and
                passport / ID document details where required by an airline or accommodation
                supplier.
              </li>
              <li>
                <strong>Contact data</strong> — email address, phone number, and billing address.
              </li>
              <li>
                <strong>Booking data</strong> — search queries (origin / destination, dates,
                passenger numbers), the offers you view, the bookings you make, ancillaries (bags,
                seats, meals), special assistance requests, loyalty programme numbers, and
                associated traveller details you provide for everyone on the booking.
              </li>
              <li>
                <strong>Payment data</strong> — card details and billing information. Card numbers
                are collected and tokenised by our payment processor; we do not store full card
                numbers on our own systems.
              </li>
              <li>
                <strong>Technical data</strong> — IP address, device type, browser, operating
                system, language preference, and referring URL.
              </li>
              <li>
                <strong>Usage data</strong> — pages visited, features used, search history, and
                interactions with the site.
              </li>
              <li>
                <strong>Communications</strong> — the content of messages you send us via email or
                our contact forms.
              </li>
            </ul>
            <p>
              We do not knowingly collect special category data (health, religion, etc.) unless you
              voluntarily provide it as part of a special assistance request, in which case we
              process it only to fulfil that request and pass it to the relevant supplier.
            </p>
          </section>

          <section id="how-we-use-it">
            <h2>3. How we use your data</h2>
            <p>We use your personal data to:</p>
            <ul>
              <li>Process your travel search, present results, and complete bookings.</li>
              <li>
                Pass passenger and payment information to airlines, accommodation providers, and
                their technology partners so the travel can be delivered.
              </li>
              <li>Send booking confirmations, e-tickets, vouchers, and itinerary updates.</li>
              <li>Handle changes, cancellations, refunds, and customer support enquiries.</li>
              <li>
                Detect and prevent fraud, comply with anti-money-laundering rules, and meet legal
                and regulatory obligations.
              </li>
              <li>
                Improve the website and our services through aggregated analytics and product
                research.
              </li>
              <li>
                Send marketing communications, where you have consented or where we have a
                legitimate interest and you have not opted out.
              </li>
            </ul>
          </section>

          <section id="lawful-basis">
            <h2>4. Lawful basis for processing</h2>
            <p>We rely on the following lawful bases under UK / EU GDPR:</p>
            <ul>
              <li>
                <strong>Performance of a contract</strong> — to provide the booking service you
                have requested.
              </li>
              <li>
                <strong>Legitimate interests</strong> — to operate, secure and improve the site,
                prevent fraud, and (where permitted) market our services to existing customers.
              </li>
              <li>
                <strong>Legal obligation</strong> — to comply with tax, accounting, anti-fraud, and
                aviation security requirements.
              </li>
              <li>
                <strong>Consent</strong> — for non-essential cookies and for direct marketing where
                consent is required.
              </li>
            </ul>
          </section>

          <section id="sharing">
            <h2>5. Who we share your data with</h2>
            <p>We share personal data with:</p>
            <ul>
              <li>
                <strong>Airlines and accommodation suppliers</strong> who will actually provide the
                travel services you book. They process your data as independent controllers under
                their own privacy policies.
              </li>
              <li>
                <strong>Duffel Technology Limited</strong> — our travel infrastructure partner who
                routes searches and bookings to suppliers (see Section 6).
              </li>
              <li>
                <strong>Payment processors</strong> — including Duffel Payments and its underlying
                processor Stripe, who handle card authorisation, settlement, and fraud screening.
              </li>
              <li>
                <strong>IT, hosting, analytics, and email delivery providers</strong> acting as our
                processors under contractual safeguards.
              </li>
              <li>
                <strong>Professional advisers</strong> such as lawyers, auditors, and insurers,
                where reasonably required.
              </li>
              <li>
                <strong>Government and regulatory authorities</strong>, including customs,
                immigration, and tax authorities, where required by law (for example, Advance
                Passenger Information).
              </li>
            </ul>
            <p>We do not sell your personal data.</p>
          </section>

          <section id="duffel">
            <h2>6. Bookings powered by Duffel</h2>
            <p>
              Flight and accommodation searches and bookings made through NXT.DEALS are delivered
              via the Duffel platform, operated by Duffel Technology Limited (company number
              11188295), 3rd Floor, 100 Clifton Street, London, EC2A 4TP, United Kingdom. When you
              search or book, the data needed to complete the transaction — including passenger
              details, contact details, payment details, and ancillary selections — is transmitted
              to Duffel and on to the relevant airline or accommodation supplier.
            </p>
            <p>
              Duffel acts as our processor for the technical delivery of the service and, in some
              cases, as an independent controller (for example, when providing payment processing,
              fraud screening, or its own travel agency services). Duffel&apos;s own privacy
              practices are described at{' '}
              <a href="https://duffel.com/privacy-policy" target="_blank" rel="noreferrer noopener">
                duffel.com/privacy-policy
              </a>
              .
            </p>
            <p>
              The travel itself is provided directly by the airline or accommodation supplier under
              their own terms and conditions of carriage / supply. Those suppliers are independent
              controllers of the data they receive and you should consult their privacy notices
              for details of how they handle it.
            </p>
          </section>

          <section id="transfers">
            <h2>7. International transfers</h2>
            <p>
              Because travel is international, your personal data will often be transferred outside
              your country of residence — for example, to an airline based in another country, to a
              hotel at your destination, or to a supplier&apos;s reservation system. Where we
              transfer personal data outside the UK or EEA, we rely on either an adequacy decision
              by the UK / European Commission, or standard contractual clauses with appropriate
              supplementary safeguards.
            </p>
          </section>

          <section id="retention">
            <h2>8. Data retention</h2>
            <p>
              We retain personal data only for as long as we need it for the purposes set out in
              this policy, including to meet legal, accounting, tax, and dispute-resolution
              requirements. Booking records are typically retained for at least six years after the
              date of travel for tax and accounting purposes. Search and analytics data is retained
              in aggregated or pseudonymised form for shorter periods.
            </p>
          </section>

          <section id="your-rights">
            <h2>9. Your rights</h2>
            <p>Subject to the conditions in applicable data protection law, you have the right to:</p>
            <ul>
              <li>Access the personal data we hold about you.</li>
              <li>Rectify inaccurate or incomplete data.</li>
              <li>Erase your data (the &quot;right to be forgotten&quot;).</li>
              <li>Restrict or object to processing.</li>
              <li>Request portability of your data in a structured, machine-readable format.</li>
              <li>Withdraw consent at any time where processing is based on consent.</li>
              <li>
                Lodge a complaint with a supervisory authority — in the UK, the Information
                Commissioner&apos;s Office at{' '}
                <a href="https://ico.org.uk" target="_blank" rel="noreferrer noopener">
                  ico.org.uk
                </a>
                .
              </li>
            </ul>
            <p>
              To exercise any of these rights, email{' '}
              <a href="mailto:privacy@nxt.deals">privacy@nxt.deals</a>. We respond to verified
              requests within one month.
            </p>
          </section>

          <section id="cookies">
            <h2>10. Cookies and tracking</h2>
            <p>
              We use cookies and similar technologies to make the site work, remember your search
              preferences, measure usage, and (with your consent) deliver relevant marketing. You
              can manage non-essential cookies through your browser settings or via our cookie
              banner. Disabling certain cookies may affect site functionality, such as remembering
              search filters or staying logged in.
            </p>
          </section>

          <section id="security">
            <h2>11. Security</h2>
            <p>
              We use technical and organisational measures designed to protect your personal data,
              including encryption in transit (TLS), access controls, and tokenisation of card
              details by our payment processor. No system is perfectly secure, however, and we
              cannot guarantee absolute security.
            </p>
          </section>

          <section id="children">
            <h2>12. Children</h2>
            <p>
              NXT.DEALS is not directed at children under 16. We do not knowingly collect personal
              data directly from children. Bookings that include child or infant passengers are
              made by an adult, who is responsible for providing the relevant traveller details on
              their behalf.
            </p>
          </section>

          <section id="changes">
            <h2>13. Changes to this policy</h2>
            <p>
              We may update this Privacy Policy from time to time. The &quot;Last updated&quot;
              date at the top of this page shows when it was most recently revised. Material
              changes will be notified through the site or by email where appropriate.
            </p>
          </section>

          <section id="contact">
            <h2>14. How to contact us</h2>
            <p>
              For any privacy-related question or to exercise your rights, please contact:
              <br />
              <strong>[Operating Entity Legal Name]</strong>
              <br />
              <strong>[Registered Address]</strong>
              <br />
              Email: <a href="mailto:privacy@nxt.deals">privacy@nxt.deals</a>
            </p>
          </section>
        </article>
      </div>
    </main>
  )
}
