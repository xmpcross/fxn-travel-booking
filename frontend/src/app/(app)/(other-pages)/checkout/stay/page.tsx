"use client";

import { DuffelCardForm, useDuffelCardFormActions } from "@duffel/components";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type StoredStaySelection = {
  result?: {
    id?: string;
    cheapest_rate_total_amount?: string;
    cheapest_rate_currency?: string;
    accommodation?: {
      name?: string;
      rating?: number | string | null;
      location?: {
        address?: { city_name?: string; country_code?: string };
      };
    };
  };
  rateId?: string;
  search?: {
    destinationQuery?: string | null;
    checkInDate?: string | null;
    checkOutDate?: string | null;
    rooms?: string | null;
    guests?: string | null;
  };
};

type StayQuote = {
  id?: string;
  total_amount?: string;
  total_currency?: string;
  expires_at?: string;
  cancellation_timeline?: Array<{ before?: string; refund_amount?: string }>;
  base_amount?: string;
  tax_amount?: string;
  due_at_accommodation_amount?: string;
};

type GuestForm = {
  givenName: string;
  familyName: string;
  email: string;
  phoneNumber: string;
  specialRequests: string;
};

const SELECTION_KEY = "selected-stay-result";
const CONFIRMATION_KEY = "stay-confirmation";

const initialGuestForm: GuestForm = {
  givenName: "",
  familyName: "",
  email: "",
  phoneNumber: "",
  specialRequests: ""
};

export default function StayCheckoutPage() {
  const router = useRouter();
  const { ref: cardFormRef, createCardForTemporaryUse } = useDuffelCardFormActions();

  const [selection, setSelection] = useState<StoredStaySelection | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const [quote, setQuote] = useState<StayQuote | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);

  const [guestForm, setGuestForm] = useState<GuestForm>(initialGuestForm);
  const [componentClientKey, setComponentClientKey] = useState<string | null>(null);
  const [keyLoading, setKeyLoading] = useState(false);
  const [cardFormValid, setCardFormValid] = useState(false);
  const [creatingBooking, setCreatingBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const idempotencyKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem(SELECTION_KEY);
    if (raw) {
      try {
        setSelection(JSON.parse(raw) as StoredStaySelection);
      } catch {
        setSelection(null);
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!selection?.rateId) return;

    const controller = new AbortController();
    setQuoteLoading(true);
    setQuoteError(null);

    (async () => {
      try {
        const response = await fetch("/api/stays/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rateId: selection.rateId }),
          signal: controller.signal
        });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error ?? "Unable to quote this stay.");
        }
        setQuote(payload.quote ?? null);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setQuoteError(err instanceof Error ? err.message : "Unable to quote this stay.");
      } finally {
        setQuoteLoading(false);
      }
    })();

    return () => controller.abort();
  }, [selection?.rateId]);

  useEffect(() => {
    if (!quote?.id || componentClientKey || keyLoading) return;

    setKeyLoading(true);
    (async () => {
      try {
        // The key is generic for both flights and stays; we reuse the existing endpoint.
        const response = await fetch("/api/flights/component-key", { method: "POST" });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error ?? "Unable to load payment form.");
        setComponentClientKey(payload.componentClientKey);
      } catch (err) {
        setBookingError(err instanceof Error ? err.message : "Unable to load payment form.");
      } finally {
        setKeyLoading(false);
      }
    })();
  }, [quote?.id, componentClientKey, keyLoading]);

  function isGuestFormValid(form: GuestForm) {
    return (
      form.givenName.trim() !== "" &&
      form.familyName.trim() !== "" &&
      form.email.trim() !== "" &&
      form.phoneNumber.trim() !== ""
    );
  }

  async function handleBook(cardId: string) {
    if (!quote?.id) {
      setBookingError("Quote not ready yet.");
      return;
    }

    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current = crypto.randomUUID();
    }

    setCreatingBooking(true);
    setBookingError(null);

    try {
      const response = await fetch("/api/stays/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quoteId: quote.id,
          guests: [
            {
              given_name: guestForm.givenName.trim(),
              family_name: guestForm.familyName.trim()
            }
          ],
          email: guestForm.email.trim(),
          phoneNumber: guestForm.phoneNumber.trim(),
          specialRequests: guestForm.specialRequests.trim() || undefined,
          cardId,
          idempotencyKey: idempotencyKeyRef.current
        })
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Booking creation failed.");
      }

      sessionStorage.setItem(
        CONFIRMATION_KEY,
        JSON.stringify({
          bookingId: payload.bookingId,
          reference: payload.reference,
          accommodation: selection?.result?.accommodation,
          search: selection?.search,
          quote
        })
      );
      sessionStorage.removeItem(SELECTION_KEY);
      router.push("/confirmation/stay");
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : "Booking creation failed.");
      // Clear key so a deliberate retry triggers a new attempt at Duffel's side.
      idempotencyKeyRef.current = null;
    } finally {
      setCreatingBooking(false);
    }
  }

  function handleSubmit() {
    if (!isGuestFormValid(guestForm)) {
      setBookingError("Fill in all guest details before booking.");
      return;
    }
    if (!cardFormValid) {
      setBookingError("Enter valid card details before booking.");
      return;
    }
    setBookingError(null);
    createCardForTemporaryUse();
  }

  if (!hydrated) {
    return (
      <main className="page">
        <section className="results-page">
          <div className="results-page-inner">
            <div className="status-card">Loading checkout...</div>
          </div>
        </section>
      </main>
    );
  }

  if (!selection?.result || !selection.rateId) {
    return (
      <main className="page">
        <section className="results-page">
          <div className="results-page-inner">
            <div className="status-card">
              No stay selected. Go <Link href="/stays">back to results</Link> and choose a hotel.
            </div>
          </div>
        </section>
      </main>
    );
  }

  const accommodation = selection.result.accommodation;
  const cityName = accommodation?.location?.address?.city_name;
  const countryCode = accommodation?.location?.address?.country_code;
  const search = selection.search;

  const displayCurrency = quote?.total_currency ?? selection.result.cheapest_rate_currency;
  const displayAmount = quote?.total_amount ?? selection.result.cheapest_rate_total_amount;

  return (
    <main className="page">
      <section className="results-page">
        <div className="results-page-inner">
          <div className="page-head">
            <div>
              <p className="eyebrow-text">Stay checkout</p>
              <h1>Confirm your booking</h1>
            </div>
            <Link className="back-link" href="/stays">
              Back to results
            </Link>
          </div>

          <div className="checkout-grid">
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
              {quoteLoading ? <p className="muted">Getting firm price…</p> : null}
              {quoteError ? <p className="muted" style={{ color: "#b22" }}>{quoteError}</p> : null}
              {displayAmount ? (
                <div className="price">
                  {displayCurrency} {displayAmount}
                  {!quote ? <small> (estimate)</small> : null}
                </div>
              ) : null}
              {quote?.cancellation_timeline?.length ? (
                <p className="muted" style={{ marginTop: 8 }}>
                  Free cancellation until {quote.cancellation_timeline[0].before}
                </p>
              ) : null}
            </article>

            <form
              className="checkout-form"
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
            >
              <h2>Primary guest</h2>
              <div className="form-two-col">
                <Field
                  label="First name"
                  value={guestForm.givenName}
                  onChange={(v) => setGuestForm((f) => ({ ...f, givenName: v }))}
                />
                <Field
                  label="Last name"
                  value={guestForm.familyName}
                  onChange={(v) => setGuestForm((f) => ({ ...f, familyName: v }))}
                />
                <Field
                  label="Email"
                  type="email"
                  value={guestForm.email}
                  onChange={(v) => setGuestForm((f) => ({ ...f, email: v }))}
                />
                <Field
                  label="Phone"
                  value={guestForm.phoneNumber}
                  onChange={(v) => setGuestForm((f) => ({ ...f, phoneNumber: v }))}
                />
              </div>
              <Field
                label="Special requests (optional)"
                value={guestForm.specialRequests}
                onChange={(v) => setGuestForm((f) => ({ ...f, specialRequests: v }))}
              />

              <h2 style={{ marginTop: 20 }}>Payment</h2>
              {keyLoading ? <p className="muted">Preparing payment form…</p> : null}
              {componentClientKey ? (
                <DuffelCardForm
                  ref={cardFormRef}
                  clientKey={componentClientKey}
                  intent="to-create-card-for-temporary-use"
                  onValidateSuccess={() => setCardFormValid(true)}
                  onValidateFailure={() => setCardFormValid(false)}
                  onCreateCardForTemporaryUseSuccess={({ id }) => {
                    void handleBook(id);
                  }}
                  onCreateCardForTemporaryUseFailure={(err) => {
                    setBookingError(err?.message ?? "Card tokenisation failed.");
                  }}
                />
              ) : null}

              {bookingError ? (
                <div className="checkout-note" style={{ color: "#b22" }}>{bookingError}</div>
              ) : null}

              <button
                className="search-button"
                type="submit"
                disabled={!quote?.id || !componentClientKey || creatingBooking}
              >
                {creatingBooking
                  ? "Creating booking…"
                  : quote
                  ? `Book stay — ${displayCurrency} ${displayAmount}`
                  : "Book stay"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}

function Field({
  label,
  type = "text",
  value,
  onChange
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="field">
      <label>{label}</label>
      <input
        onChange={(e) => onChange(e.target.value)}
        type={type}
        value={value}
      />
    </div>
  );
}
