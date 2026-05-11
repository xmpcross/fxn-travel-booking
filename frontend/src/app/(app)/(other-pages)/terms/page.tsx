import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description:
    'The terms that govern your use of NXT.DEALS and any bookings you make through us.',
}

const LAST_UPDATED = '11 May 2026'

const SECTIONS = [
  { id: 'about', title: '1. About these Terms' },
  { id: 'our-role', title: '2. Our role as intermediary' },
  { id: 'eligibility', title: '3. Eligibility and accounts' },
  { id: 'searches-bookings', title: '4. Searches, offers, and bookings' },
  { id: 'price-payment', title: '5. Price and payment' },
  { id: 'duffel', title: '6. Inventory and payments via Duffel' },
  { id: 'supplier-terms', title: '7. Airline and accommodation terms' },
  { id: 'changes-cancellations', title: '8. Changes, cancellations, and refunds' },
  { id: 'travel-docs', title: '9. Travel documents and your responsibilities' },
  { id: 'insurance', title: '10. Travel insurance' },
  { id: 'acceptable-use', title: '11. Acceptable use of the site' },
  { id: 'ip', title: '12. Intellectual property' },
  { id: 'third-parties', title: '13. Third-party links and content' },
  { id: 'disclaimers', title: '14. Disclaimers' },
  { id: 'liability', title: '15. Limitation of liability' },
  { id: 'indemnity', title: '16. Indemnity' },
  { id: 'force-majeure', title: '17. Force majeure' },
  { id: 'changes-to-terms', title: '18. Changes to these Terms' },
  { id: 'law', title: '19. Governing law and jurisdiction' },
  { id: 'contact', title: '20. Contact' },
]

export default function TermsPage() {
  return (
    <main className="container py-12 lg:py-16">
      <header className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">Legal</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl dark:text-neutral-100">
          Terms &amp; Conditions
        </h1>
        <p className="mt-3 text-sm text-neutral-500">Last updated: {LAST_UPDATED}</p>
        <p className="mt-6 text-lg text-neutral-600 dark:text-neutral-400">
          These Terms &amp; Conditions (&quot;Terms&quot;) govern your use of the NXT.DEALS website
          and any bookings you make through it. Please read them carefully — by using the site or
          completing a booking, you agree to be bound by them.
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
          <section id="about">
            <h2>1. About these Terms</h2>
            <p>
              NXT.DEALS (&quot;NXT.DEALS&quot;, &quot;we&quot;, &quot;us&quot;) is operated by{' '}
              <strong>[Operating Entity Legal Name]</strong>, a company registered in{' '}
              <strong>[Country]</strong> (company number <strong>[Number]</strong>), with its
              registered office at <strong>[Registered Address]</strong>. References to
              &quot;you&quot; mean any visitor to the site or person who makes (or is named on) a
              booking through us.
            </p>
            <p>
              These Terms apply alongside our{' '}
              <a href="/privacy">Privacy Policy</a> and any specific terms that appear in the
              booking flow (for example, the fare conditions or rate rules for an individual
              flight or stay).
            </p>
          </section>

          <section id="our-role">
            <h2>2. Our role as intermediary</h2>
            <p>
              NXT.DEALS is a travel comparison and booking platform. We do not operate flights,
              hotels, or other travel services ourselves. When you book through us, your contract
              for the travel itself is with the relevant <strong>supplier</strong> — the airline,
              accommodation provider, or other service provider whose offer you have selected.
            </p>
            <p>
              We act as an intermediary that facilitates the search and booking process and
              transmits your booking instructions to the supplier through our travel infrastructure
              partner Duffel (see Section 6). Suppliers&apos; own terms of carriage or terms of
              supply govern the actual travel service, including liability for delays,
              cancellations, lost baggage, room conditions, and similar matters.
            </p>
          </section>

          <section id="eligibility">
            <h2>3. Eligibility and accounts</h2>
            <p>
              You must be at least 18 years old and legally capable of entering into a binding
              contract to make a booking through NXT.DEALS. By making a booking on behalf of other
              travellers, you confirm that you have their authority to provide their personal data
              and to accept these Terms and the supplier&apos;s terms on their behalf.
            </p>
            <p>
              If we offer accounts, you are responsible for keeping your login credentials
              confidential and for all activity carried out under your account.
            </p>
          </section>

          <section id="searches-bookings">
            <h2>4. Searches, offers, and bookings</h2>
            <p>
              Prices, availability, and offer details displayed during a search are live quotes
              from suppliers and can change between the time you see them and the time you submit
              a booking. Until your booking is confirmed by the supplier, the offer is not
              guaranteed.
            </p>
            <p>
              When you submit a booking, we transmit your instructions to the supplier. A booking
              is only formed once the supplier has confirmed it and we have sent you a written
              confirmation. If the supplier rejects the booking — for example, because availability
              or price has changed — we will tell you and refund any amount taken in respect of
              that unfulfilled booking.
            </p>
          </section>

          <section id="price-payment">
            <h2>5. Price and payment</h2>
            <p>
              The price shown at the point of booking is the total amount payable in the displayed
              currency, including applicable taxes and mandatory fees, unless explicitly stated
              otherwise. Optional extras (such as additional baggage, seats, board upgrades, or
              ancillary services) are priced separately.
            </p>
            <p>
              Payment is taken at the time of booking by card via our payment processor. We do not
              store full card numbers on our own systems. If your card issuer declines the charge,
              the booking will not be completed.
            </p>
          </section>

          <section id="duffel">
            <h2>6. Inventory and payments via Duffel</h2>
            <p>
              Flight and accommodation inventory, booking management, and payment processing are
              provided through the Duffel platform, operated by Duffel Technology Limited (company
              number 11188295), 3rd Floor, 100 Clifton Street, London, EC2A 4TP, United Kingdom.
              When you make a booking, your traveller and payment details are transmitted to
              Duffel and on to the relevant supplier so the booking can be completed.
            </p>
            <p>
              Card payments are processed via Duffel Payments, which uses Stripe as the underlying
              payment processor. By making a booking you also agree to the applicable payment
              processor terms presented at checkout.
            </p>
            <p>
              Duffel&apos;s own website terms and privacy policy are available at{' '}
              <a href="https://duffel.com/terms" target="_blank" rel="noreferrer noopener">
                duffel.com/terms
              </a>{' '}
              and{' '}
              <a href="https://duffel.com/privacy-policy" target="_blank" rel="noreferrer noopener">
                duffel.com/privacy-policy
              </a>
              .
            </p>
          </section>

          <section id="supplier-terms">
            <h2>7. Airline and accommodation terms</h2>
            <p>
              Each booking is subject to the supplier&apos;s own terms and conditions, including:
            </p>
            <ul>
              <li>Conditions of carriage for flights (including fare rules and baggage policy).</li>
              <li>Rate rules and house policies for accommodation (including check-in age, deposit, cancellation window).</li>
              <li>
                Conditions for any ancillary services purchased (seats, bags, meals, transfers,
                etc.).
              </li>
            </ul>
            <p>
              These supplier terms are presented or referenced during the booking flow and take
              precedence over any general descriptions on our site. You should read them before
              completing a booking.
            </p>
          </section>

          <section id="changes-cancellations">
            <h2>8. Changes, cancellations, and refunds</h2>
            <p>
              Whether and on what terms a booking can be changed, cancelled, or refunded is set by
              the relevant supplier and stated in the fare rules / rate rules of your booking.
              Some fares and rates are non-refundable or non-changeable. We have no discretion to
              vary supplier policies.
            </p>
            <p>
              Where a change or cancellation is permitted, we will pass your request to the
              supplier. Supplier-imposed fees and any difference in fare or rate may apply.
              Refunds, where due, are processed by the supplier and returned to you via our
              payment processor — timing depends on the supplier and your card issuer.
            </p>
            <p>
              If a supplier cancels your booking (for example, a flight cancellation by the
              airline), the supplier&apos;s rules and applicable passenger-rights laws (such as UK
              Regulation (EC) 261/2004 or EU Regulation 261/2004 for eligible flights) determine
              your entitlement to a refund, rerouting, or compensation. We will help you with
              passing on the claim where reasonably possible.
            </p>
          </section>

          <section id="travel-docs">
            <h2>9. Travel documents and your responsibilities</h2>
            <p>You are responsible for:</p>
            <ul>
              <li>
                Ensuring that the names you provide at booking match the photo ID / passport each
                traveller will use for travel.
              </li>
              <li>
                Holding valid travel documents (passport, visas, transit permits, health
                certificates) for every leg of the journey, including connections.
              </li>
              <li>Arriving at the airport / accommodation in time and complying with check-in deadlines.</li>
              <li>Complying with the supplier&apos;s rules on baggage, conduct, and identification.</li>
            </ul>
            <p>
              We provide general guidance only and cannot accept responsibility for losses caused
              by travel documents, visas, or entry requirements that are not in order at the time
              of travel.
            </p>
          </section>

          <section id="insurance">
            <h2>10. Travel insurance</h2>
            <p>
              Travel insurance is strongly recommended. It is your responsibility to arrange
              appropriate insurance covering cancellation, medical costs, baggage, and other
              travel-related risks.
            </p>
          </section>

          <section id="acceptable-use">
            <h2>11. Acceptable use of the site</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Use the site for any unlawful, fraudulent, or harmful purpose.</li>
              <li>
                Scrape, mirror, or otherwise automatically extract content, prices, or inventory
                from the site without our prior written consent.
              </li>
              <li>
                Introduce viruses, worms, or other malicious code, or attempt to gain unauthorised
                access to any part of the site or its infrastructure.
              </li>
              <li>Interfere with other users&apos; use of the site or with the underlying networks.</li>
              <li>Make speculative, false, or duplicate bookings.</li>
              <li>Reverse-engineer, decompile, or attempt to derive source code of the site or its APIs.</li>
            </ul>
            <p>We may suspend or terminate access to the site if these rules are breached.</p>
          </section>

          <section id="ip">
            <h2>12. Intellectual property</h2>
            <p>
              All content on the site — including text, graphics, logos, icons, images, software,
              and the overall design — is owned by us or our licensors and is protected by
              copyright, trade-mark, database, and other intellectual property laws. You may view
              and use the site for the personal, non-commercial purpose of researching and booking
              travel. Any other use requires our prior written consent.
            </p>
          </section>

          <section id="third-parties">
            <h2>13. Third-party links and content</h2>
            <p>
              The site may contain links to third-party websites and content that we do not
              control. We are not responsible for the availability, content, or practices of those
              third parties.
            </p>
          </section>

          <section id="disclaimers">
            <h2>14. Disclaimers</h2>
            <p>
              The site and its content are provided on an &quot;as is&quot; and &quot;as
              available&quot; basis. We make no warranty that the site will be uninterrupted or
              error-free, or that supplier-provided information (such as schedules, descriptions,
              and photographs) is complete, current, or accurate. Nothing in these Terms excludes
              or limits any liability that cannot lawfully be excluded or limited.
            </p>
          </section>

          <section id="liability">
            <h2>15. Limitation of liability</h2>
            <p>
              Subject to the preceding paragraph, our total liability to you in connection with
              any booking or use of the site is limited to the total amount paid by you for the
              affected booking. We are not liable for indirect or consequential losses, including
              loss of profits, loss of business, loss of opportunity, or any travel-related losses
              that are caused by acts or omissions of suppliers, third parties, or events outside
              our reasonable control.
            </p>
            <p>
              The supplier is responsible for the performance of the travel service itself.
              Liability for delays, cancellations, baggage, injury, accommodation condition, and
              similar matters is governed by the supplier&apos;s terms and applicable international
              conventions (for example, the Montreal Convention for international air carriage).
            </p>
          </section>

          <section id="indemnity">
            <h2>16. Indemnity</h2>
            <p>
              You agree to indemnify and hold us harmless from any claim, loss, or expense
              (including reasonable legal costs) arising from your breach of these Terms, your
              breach of any supplier&apos;s terms, or your unlawful or negligent use of the site.
            </p>
          </section>

          <section id="force-majeure">
            <h2>17. Force majeure</h2>
            <p>
              We are not liable for any failure or delay in performing our obligations under these
              Terms caused by events beyond our reasonable control, including but not limited to
              acts of God, war, terrorism, civil unrest, strikes, pandemics, natural disasters,
              government action, supplier failure, or failure of public or private networks.
            </p>
          </section>

          <section id="changes-to-terms">
            <h2>18. Changes to these Terms</h2>
            <p>
              We may update these Terms from time to time. The &quot;Last updated&quot; date at
              the top shows when they were most recently revised. The version in force at the time
              of your booking applies to that booking.
            </p>
          </section>

          <section id="law">
            <h2>19. Governing law and jurisdiction</h2>
            <p>
              These Terms and any dispute arising out of or in connection with them or the
              services provided through the site are governed by the laws of{' '}
              <strong>[Governing Law Jurisdiction]</strong>. The courts of{' '}
              <strong>[Jurisdiction]</strong> have exclusive jurisdiction, except that consumers
              resident in the EU / EEA may also bring proceedings in the courts of their country
              of residence to the extent required by mandatory local law.
            </p>
          </section>

          <section id="contact">
            <h2>20. Contact</h2>
            <p>
              Questions about these Terms can be sent to:
              <br />
              <strong>[Operating Entity Legal Name]</strong>
              <br />
              <strong>[Registered Address]</strong>
              <br />
              Email: <a href="mailto:legal@nxt.deals">legal@nxt.deals</a>
            </p>
          </section>
        </article>
      </div>
    </main>
  )
}
