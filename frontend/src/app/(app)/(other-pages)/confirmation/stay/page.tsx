"use client";

import { useCurrency } from "@/contexts/CurrencyContext";
import Link from "next/link";
import { useEffect, useState } from "react";

type StoredConfirmation = {
  bookingId?: string | null;
  reference?: string | null;
  accommodation?: {
    name?: string;
    rating?: number | string | null;
    location?: { address?: { city_name?: string; country_code?: string } };
  };
  search?: {
    checkInDate?: string | null;
    checkOutDate?: string | null;
    rooms?: string | null;
    guests?: string | null;
  };
  quote?: {
    total_amount?: string;
    total_currency?: string;
    cancellation_timeline?: Array<{ before?: string; refund_amount?: string }>;
  };
};

const CONFIRMATION_KEY = "stay-confirmation";

export default function StayConfirmationPage() {
  const { format } = useCurrency();
  const [confirmation, setConfirmation] = useState<StoredConfirmation | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem(CONFIRMATION_KEY);
    if (raw) {
      try {
        setConfirmation(JSON.parse(raw) as StoredConfirmation);
      } catch {
        setConfirmation(null);
      }
    }
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return (
      <main className="page">
        <section className="results-page">
          <div className="results-page-inner">
            <div className="status-card">Loading confirmation...</div>
          </div>
        </section>
      </main>
    );
  }

  if (!confirmation?.bookingId) {
    return (
      <main className="page">
        <section className="results-page">
          <div className="results-page-inner">
            <div className="status-card">
              No stay booking found. <Link href="/">Back to search</Link>.
            </div>
          </div>
        </section>
      </main>
    );
  }

  const accommodation = confirmation.accommodation;
  const search = confirmation.search;
  const quote = confirmation.quote;
  const cityName = accommodation?.location?.address?.city_name;
  const countryCode = accommodation?.location?.address?.country_code;

  return (
    <main className="page">
      <section className="results-page">
        <div className="results-page-inner">
          <div className="page-head">
            <div>
              <p className="eyebrow-text">Booking confirmed</p>
              <h1>Your stay is booked</h1>
              {confirmation.reference ? (
                <p className="muted">Reference: <strong>{confirmation.reference}</strong></p>
              ) : null}
              <p className="muted">Booking id: <code>{confirmation.bookingId}</code></p>
            </div>
            <Link className="back-link" href="/">
              Back to home
            </Link>
          </div>

          <article className="selection-card">
            <h2>{accommodation?.name ?? "Accommodation"}</h2>
            <p className="muted">
              {cityName ?? "Location"}
              {countryCode ? ` | ${countryCode}` : ""}
              {accommodation?.rating ? ` | ${accommodation.rating} stars` : ""}
            </p>
            {search?.checkInDate && search?.checkOutDate ? (
              <p className="muted">
                {search.checkInDate} → {search.checkOutDate}
                {search.guests ? ` · ${search.guests} guests` : ""}
                {search.rooms ? `, ${search.rooms} rooms` : ""}
              </p>
            ) : null}
            {quote?.total_amount ? (
              <div className="price">{format(quote.total_amount, quote.total_currency)}</div>
            ) : null}
            {quote?.cancellation_timeline?.length ? (
              <p className="muted" style={{ marginTop: 8 }}>
                Free cancellation until {quote.cancellation_timeline[0].before}
              </p>
            ) : null}
          </article>
        </div>
      </section>
    </main>
  );
}
