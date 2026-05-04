import Link from "next/link";
import { getFlightOffer } from "@/lib/duffel";
import HydrateAndContinue from "./HydrateAndContinue";

interface PageProps {
  searchParams: Promise<{ offerId?: string | string[] }>;
}

export default async function FlightCheckoutIndexPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const rawOfferId = params.offerId;
  const offerId = Array.isArray(rawOfferId) ? rawOfferId[0] : rawOfferId;

  if (offerId) {
    try {
      const offer = await getFlightOffer(offerId);
      return <HydrateAndContinue offer={offer} />;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to load this offer.";
      return (
        <main className="page">
          <section className="results-page">
            <div className="results-page-inner">
              <div className="status-card">
                <p>{message}</p>
                <p style={{ marginTop: "0.5rem", opacity: 0.7 }}>
                  The offer may have expired — please run a new search.
                </p>
                <div className="payload-actions">
                  <Link className="search-button" href="/">
                    New search
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </main>
      );
    }
  }

  return (
    <main className="page">
      <section className="results-page">
        <div className="results-page-inner">
          <div className="status-card">
            Continue flight checkout from the traveller step.
            <div className="payload-actions">
              <Link className="search-button" href="/checkout/flight/travellers">
                Open traveller details
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
