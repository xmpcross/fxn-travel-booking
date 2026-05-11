"use client";

import { BillingAddressAutocomplete, type BillingAddressDetails } from "@/components/BillingAddressAutocomplete";
import { useCurrency } from "@/contexts/CurrencyContext";
import { DuffelCardForm, useDuffelCardFormActions } from "@duffel/components";
import { ChevronRightIcon, Squares2X2Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

type StoredStaySelection = {
  result?: {
    id?: string;
    cheapest_rate_total_amount?: string;
    cheapest_rate_currency?: string;
    accommodation?: {
      name?: string;
      rating?: number | string | null;
      photos?: Array<{ url?: string }>;
      check_in_information?: {
        check_in_after_time?: string;
        check_out_before_time?: string;
      };
      location?: {
        address?: {
          city_name?: string;
          country_code?: string;
          line_one?: string;
          region?: string;
          postal_code?: string;
        };
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

type DetailRate = {
  id: string;
  total_amount?: string;
  total_currency?: string;
  board_type?: string;
  payment_type?: string;
  cancellation_timeline?: Array<{ before?: string; refund_amount?: string; currency?: string }>;
  quantity_available?: number;
};

type DetailRoom = {
  name?: string;
  beds?: Array<{ type?: string; count?: number }>;
  photos?: Array<{ url?: string }>;
  rates?: DetailRate[];
};

type StayDetails = {
  id?: string;
  accommodation?: {
    rooms?: DetailRoom[];
    check_in_information?: {
      check_in_after_time?: string;
      check_out_before_time?: string;
    };
  };
};

const BOARD_LABEL: Record<string, string> = {
  room_only: "Room only, no meals",
  breakfast: "Breakfast included",
  half_board: "Half board",
  full_board: "Full board",
  all_inclusive: "All-inclusive"
};

function formatBoard(b?: string) {
  if (!b) return "Room only, no meals";
  return BOARD_LABEL[b] ?? b.replaceAll("_", " ");
}

function formatLongDate(s?: string | null) {
  if (!s) return "";
  const [y, m, d] = s.split("-").map(Number);
  if (!y || !m || !d) return s;
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

function formatTime(t?: string) {
  if (!t) return "";
  // Times come as "15:00" / "12:00:00" — strip seconds if present.
  const m = t.match(/^(\d{2}:\d{2})/);
  return m ? m[1] : t;
}

function nightsBetween(start?: string | null, end?: string | null): number {
  if (!start || !end) return 0;
  const [ys, ms, ds] = start.split("-").map(Number);
  const [ye, me, de] = end.split("-").map(Number);
  if (!ys || !ms || !ds || !ye || !me || !de) return 0;
  const s = Date.UTC(ys, ms - 1, ds);
  const e = Date.UTC(ye, me - 1, de);
  const diff = Math.round((e - s) / 86_400_000);
  return diff > 0 ? diff : 0;
}

type StayQuote = {
  id?: string;
  total_amount?: string;
  total_currency?: string;
  expires_at?: string;
  cancellation_timeline?: Array<{ before?: string; refund_amount?: string }>;
  base_amount?: string;
  tax_amount?: string;
  fee_amount?: string;
  due_at_accommodation_amount?: string;
  due_at_accommodation_currency?: string;
};

type GuestForm = {
  givenName: string;
  familyName: string;
  email: string;
  phoneNumber: string;
  specialRequests: string;
  billingAddress: string;
  billingAddressDetails: BillingAddressDetails | null;
};

const SELECTION_KEY = "selected-stay-result";
const CONFIRMATION_KEY = "stay-confirmation";

const initialGuestForm: GuestForm = {
  givenName: "",
  familyName: "",
  email: "",
  phoneNumber: "",
  specialRequests: "",
  billingAddress: "",
  billingAddressDetails: null
};

export default function StayCheckoutPage() {
  const router = useRouter();
  const { format } = useCurrency();
  const { ref: cardFormRef, createCardForTemporaryUse } = useDuffelCardFormActions();

  const [selection, setSelection] = useState<StoredStaySelection | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [details, setDetails] = useState<StayDetails | null>(null);

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
    const srrId = selection?.result?.id;
    if (!srrId) return;
    const controller = new AbortController();
    (async () => {
      try {
        const response = await fetch(`/api/stays/details/${encodeURIComponent(srrId)}`, {
          method: "POST",
          signal: controller.signal
        });
        const payload = await response.json();
        if (response.ok) setDetails((payload.details ?? null) as StayDetails | null);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
      }
    })();
    return () => controller.abort();
  }, [selection?.result?.id]);

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
        if (!response.ok) throw new Error(payload.error ?? "Unable to quote this stay.");
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

  // Find the selected rate (and its room) inside the fetched details for the
  // "Booking details" card. Falls back to "Room" if not yet loaded.
  const selectedRateContext = useMemo(() => {
    const rooms = details?.accommodation?.rooms ?? [];
    for (const room of rooms) {
      for (const rate of room.rates ?? []) {
        if (rate.id === selection?.rateId) return { room, rate };
      }
    }
    return { room: undefined, rate: undefined };
  }, [details, selection?.rateId]);

  const selectedRoom = selectedRateContext.room;
  const selectedRate = selectedRateContext.rate;

  function isGuestFormValid(form: GuestForm) {
    return (
      form.givenName.trim() !== "" &&
      form.familyName.trim() !== "" &&
      form.email.trim() !== "" &&
      form.phoneNumber.trim() !== "" &&
      form.billingAddress.trim() !== ""
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
      if (!response.ok) throw new Error(payload.error ?? "Booking creation failed.");
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
      idempotencyKeyRef.current = null;
    } finally {
      setCreatingBooking(false);
    }
  }

  function handleSubmit() {
    if (!isGuestFormValid(guestForm)) {
      setBookingError("Fill in all guest details before paying.");
      return;
    }
    if (!cardFormValid) {
      setBookingError("Enter valid card details before paying.");
      return;
    }
    setBookingError(null);
    createCardForTemporaryUse();
  }

  if (!hydrated) {
    return (
      <main className="container py-6">
        <div className="rounded-2xl border border-neutral-200 p-8 text-sm text-neutral-500 dark:border-neutral-800">
          Loading checkout…
        </div>
      </main>
    );
  }

  if (!selection?.result || !selection.rateId) {
    return (
      <main className="container py-6">
        <div className="rounded-2xl border border-neutral-200 p-8 text-sm text-neutral-700 dark:border-neutral-800">
          No stay selected.{" "}
          <Link href="/stays" className="text-orange-600 hover:underline">
            Back to results
          </Link>
          .
        </div>
      </main>
    );
  }

  const accommodation = selection.result.accommodation;
  const photo = accommodation?.photos?.[0]?.url;
  const stars = Number(accommodation?.rating ?? 0);
  const addr = accommodation?.location?.address;
  const addressLine = [addr?.line_one, addr?.region, addr?.postal_code].filter(Boolean).join(", ");
  const search = selection.search;
  const nights = nightsBetween(search?.checkInDate, search?.checkOutDate);
  const guests = Number(search?.guests ?? "1") || 1;
  const roomsCount = Number(search?.rooms ?? "1") || 1;

  const checkInInfo = accommodation?.check_in_information ?? details?.accommodation?.check_in_information;
  const checkInAfter = formatTime(checkInInfo?.check_in_after_time);
  const checkOutBefore = formatTime(checkInInfo?.check_out_before_time);

  const currency = quote?.total_currency ?? selection.result.cheapest_rate_currency ?? "AUD";
  const totalAmount = quote?.total_amount ?? selection.result.cheapest_rate_total_amount;
  const baseAmount = quote?.base_amount;
  const taxAmount = quote?.tax_amount;
  const feeAmount = quote?.fee_amount;
  const dueAtAccom = quote?.due_at_accommodation_amount;
  const dueAtAccomCurrency = quote?.due_at_accommodation_currency ?? currency;

  const refundable =
    selectedRate?.cancellation_timeline?.some((t) => Number(t.refund_amount ?? 0) > 0) ?? false;

  return (
    <main className="container pb-12 pt-6">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1 text-sm text-neutral-500">
        <Link href="/stays" className="hover:text-orange-600">
          Stays
        </Link>
        {selection.result.id ? (
          <>
            <ChevronRightIcon className="size-3" />
            <Link
              href={`/stays/${selection.result.id}${
                search ? `?destinationQuery=${encodeURIComponent(search.destinationQuery ?? "")}&checkInDate=${search.checkInDate ?? ""}&checkOutDate=${search.checkOutDate ?? ""}&rooms=${search.rooms ?? ""}&guests=${search.guests ?? ""}` : ""
              }`}
              className="hover:text-orange-600"
            >
              Details
            </Link>
          </>
        ) : null}
        <ChevronRightIcon className="size-3" />
        <span className="text-neutral-900 dark:text-neutral-100">Booking</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        {/* LEFT — main column */}
        <div className="space-y-8">
          {/* Booking details */}
          <section>
            <h2 className="mb-3 text-lg font-bold text-neutral-900 dark:text-neutral-100">
              Booking details
            </h2>
            <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex flex-wrap items-start gap-4">
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photo}
                    alt={accommodation?.name ?? "Hotel"}
                    className="size-20 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <div className="size-20 shrink-0 rounded-lg bg-neutral-100 dark:bg-neutral-800" />
                )}
                <div className="min-w-0 flex-1">
                  {stars > 0 && (
                    <div className="mb-0.5 flex items-center gap-0.5">
                      {Array.from({ length: Math.round(stars) }).map((_, i) => (
                        <StarSolid key={i} className="size-3.5 text-[#ffce00]" />
                      ))}
                    </div>
                  )}
                  <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                    {accommodation?.name ?? "Accommodation"}
                  </h3>
                  {addressLine && (
                    <p className="text-xs text-neutral-500">{addressLine}</p>
                  )}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-sm">
                <Pill>
                  <span className="mr-1 inline-flex size-4 items-center justify-center rounded bg-neutral-200 text-[10px] font-bold text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200">
                    {roomsCount}x
                  </span>
                  {selectedRoom?.name ?? "Room"}
                </Pill>
                <Pill>
                  <Squares2X2Icon className="mr-1.5 size-4 text-neutral-500" />
                  {formatBoard(selectedRate?.board_type)}
                </Pill>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 rounded-xl border border-neutral-200 p-4 sm:grid-cols-2 dark:border-neutral-800">
                <div>
                  <div className="text-xs uppercase text-neutral-500">Check in</div>
                  <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {formatLongDate(search?.checkInDate)}
                  </div>
                  {checkInAfter ? (
                    <div className="text-xs text-neutral-500">from {checkInAfter}</div>
                  ) : null}
                </div>
                <div className="sm:border-l sm:border-neutral-200 sm:pl-3 dark:sm:border-neutral-800">
                  <div className="text-xs uppercase text-neutral-500">Check out</div>
                  <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {formatLongDate(search?.checkOutDate)}
                  </div>
                  {checkOutBefore ? (
                    <div className="text-xs text-neutral-500">until {checkOutBefore}</div>
                  ) : null}
                </div>
              </div>
            </div>
          </section>

          {/* Guest details */}
          <section>
            <h2 className="mb-3 text-lg font-bold text-neutral-900 dark:text-neutral-100">
              Guest details
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field
                label="First name"
                required
                value={guestForm.givenName}
                onChange={(v) => setGuestForm((f) => ({ ...f, givenName: v }))}
              />
              <Field
                label="Last name"
                required
                value={guestForm.familyName}
                onChange={(v) => setGuestForm((f) => ({ ...f, familyName: v }))}
              />
            </div>
          </section>

          {/* Contact details */}
          <section>
            <h2 className="mb-3 text-lg font-bold text-neutral-900 dark:text-neutral-100">
              Contact Details
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field
                label="Email"
                type="email"
                required
                value={guestForm.email}
                onChange={(v) => setGuestForm((f) => ({ ...f, email: v }))}
              />
              <Field
                label="Phone number"
                required
                value={guestForm.phoneNumber}
                onChange={(v) => setGuestForm((f) => ({ ...f, phoneNumber: v }))}
              />
            </div>
          </section>

          {/* Billing address */}
          <section>
            <h2 className="mb-3 text-lg font-bold text-neutral-900 dark:text-neutral-100">
              Billing address
            </h2>
            <BillingAddressAutocomplete
              required
              value={guestForm.billingAddress}
              onChange={(v) =>
                setGuestForm((f) => ({ ...f, billingAddress: v, billingAddressDetails: null }))
              }
              onSelect={(details) =>
                setGuestForm((f) => ({
                  ...f,
                  billingAddress: details.formatted,
                  billingAddressDetails: details,
                }))
              }
            />
          </section>

          {/* Additional information */}
          <section>
            <h2 className="mb-3 text-lg font-bold text-neutral-900 dark:text-neutral-100">
              Additional information
            </h2>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Special requests
              </label>
              <textarea
                value={guestForm.specialRequests}
                onChange={(e) => setGuestForm((f) => ({ ...f, specialRequests: e.target.value }))}
                rows={4}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-neutral-600 dark:bg-neutral-800"
              />
              <p className="mt-1 text-xs text-neutral-500">
                This field should not be used to provide medical or otherwise sensitive information.
              </p>
            </div>
            <div className="mt-4">
              <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Loyalty account number
              </label>
              <input
                type="text"
                disabled
                placeholder="Not available"
                className="w-full cursor-not-allowed rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-400 dark:border-neutral-700 dark:bg-neutral-800"
              />
              <p className="mt-1 text-xs text-neutral-500">
                Loyalty account number cannot be applied when booking this rate.
              </p>
            </div>
          </section>

          {/* Cancellation policy */}
          <section>
            <h2 className="mb-3 text-lg font-bold text-neutral-900 dark:text-neutral-100">
              Cancellation policy
            </h2>
            <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
              {refundable && quote?.cancellation_timeline?.length ? (
                <div className="flex items-start gap-3 text-sm">
                  <span className="mt-0.5 inline-block size-2 rounded-full bg-emerald-500" />
                  <div>
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                      Refundable
                    </span>{" "}
                    <span className="text-neutral-600 dark:text-neutral-400">
                      — Free cancellation until {formatLongDate(quote.cancellation_timeline[0].before?.slice(0, 10))} (
                      {formatTime(quote.cancellation_timeline[0].before?.slice(11, 16))}).
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 text-sm">
                  <XMarkIcon className="mt-0.5 size-4 shrink-0 text-rose-500" />
                  <div>
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                      Non refundable
                    </span>{" "}
                    <span className="text-neutral-600 dark:text-neutral-400">
                      — You have chosen a non-refundable rate. If you cancel this booking, you will not
                      receive any refund.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Payment */}
          <section>
            <h2 className="mb-3 text-lg font-bold text-neutral-900 dark:text-neutral-100">Payment</h2>
            {keyLoading ? (
              <p className="text-sm text-neutral-500">Preparing payment form…</p>
            ) : null}
            {componentClientKey ? (
              <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
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
              </div>
            ) : null}
            {bookingError ? (
              <p className="mt-3 text-sm text-rose-600">{bookingError}</p>
            ) : null}
          </section>
        </div>

        {/* RIGHT — billing summary (sticky) */}
        <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          <section className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="mb-4 text-base font-bold text-neutral-900 dark:text-neutral-100">
              Billing summary
            </h2>

            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Pay now
            </div>
            <dl className="space-y-1.5 text-sm">
              {baseAmount ? (
                <Row label={`Room${roomsCount > 1 ? "s" : ""}`} value={format(baseAmount, currency)} />
              ) : null}
              {taxAmount && Number(taxAmount) > 0 ? (
                <Row label="Tax" value={format(taxAmount, currency)} />
              ) : null}
              {feeAmount && Number(feeAmount) > 0 ? (
                <Row label="Fees" value={format(feeAmount, currency)} />
              ) : null}
              {totalAmount ? (
                <div className="flex justify-between border-t border-neutral-200 pt-2 dark:border-neutral-700">
                  <dt className="font-bold text-neutral-900 dark:text-neutral-100">Total</dt>
                  <dd className="font-bold text-neutral-900 dark:text-neutral-100">
                    {format(totalAmount, currency)}
                  </dd>
                </div>
              ) : null}
              {quoteLoading ? (
                <p className="text-xs text-neutral-500">Getting firm price…</p>
              ) : null}
              {quoteError ? (
                <p className="text-xs text-rose-600">{quoteError}</p>
              ) : null}
            </dl>

            <div className="mt-3 text-xs text-neutral-500">
              Payment method: {selectedRate?.payment_type === "pay_now" ? "card" : "balance"}
            </div>

            {dueAtAccom && Number(dueAtAccom) > 0 ? (
              <>
                <div className="mt-5 mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Pay at accommodation
                </div>
                <dl className="space-y-1.5 text-sm">
                  <Row label="Accommodation fee" value={format(dueAtAccom, dueAtAccomCurrency)} />
                </dl>
              </>
            ) : (
              <>
                <div className="mt-5 mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Pay at accommodation
                </div>
                <dl className="space-y-1.5 text-sm">
                  <Row label="Accommodation fee" value={format(0, dueAtAccomCurrency)} />
                </dl>
              </>
            )}
          </section>

          <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              {totalAmount ? format(totalAmount, currency) : "—"}
            </div>
            <div className="mt-1 text-xs text-neutral-500">
              Total amount, including taxes for {guests} guest{guests === 1 ? "" : "s"} and {roomsCount}x{" "}
              {selectedRoom?.name ?? "room"}
              {nights > 0 ? ` · ${nights} night${nights === 1 ? "" : "s"}` : ""}
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!quote?.id || !componentClientKey || creatingBooking}
              className="mt-3 w-full rounded-lg bg-neutral-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              {creatingBooking ? "Creating booking…" : "Pay now"}
            </button>
          </div>

          <p className="rounded-2xl bg-neutral-50 p-4 text-xs leading-relaxed text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400">
            By paying, you confirm you agree to our Booking Terms and Conditions and the accommodation&apos;s
            conditions. To find out how we handle your personal data, please see our Privacy Policy.
          </p>
        </aside>
      </div>
    </main>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">
      {children}
    </span>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-neutral-600 dark:text-neutral-400">{label}</dt>
      <dd className="text-neutral-900 dark:text-neutral-100">{value}</dd>
    </div>
  );
}

function Field({
  label,
  type = "text",
  value,
  required,
  onChange
}: {
  label: string;
  type?: string;
  value: string;
  required?: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
        {label} {required ? <span className="text-rose-500">*</span> : null}
      </label>
      <input
        onChange={(e) => onChange(e.target.value)}
        type={type}
        value={value}
        className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
      />
    </div>
  );
}
