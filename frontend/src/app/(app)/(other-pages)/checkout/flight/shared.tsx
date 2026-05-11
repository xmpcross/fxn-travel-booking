"use client";

import {
  ChevronDownIcon,
  ClockIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  PaperAirplaneIcon,
  WifiIcon,
} from "@heroicons/react/24/outline";
import { BedroomIcon } from "@/components/icons/BedroomIcon";
import { useCurrency } from "@/contexts/CurrencyContext";
import type { CreateOrder, Offer, PassengerIdentityDocumentType, SeatMap } from "@duffel/api/types";
import Link from "next/link";
import { useState } from "react";

export const SELECTION_STORAGE_KEY = "selected-flight-offer";
export const CHECKOUT_STORAGE_KEY = "flight-checkout-state";

export type StoredFlightSelection = {
  offer?: Offer;
  offerRequestId?: string;
  clientKey?: string;
  search?: {
    adults?: string | null;
  };
};

export type AncillariesContext = {
  offer: Offer;
  seatMaps: SeatMap[];
};

export type PassengerForm = {
  id: string;
  type?: string | null;
  title: "mr" | "ms" | "mrs" | "miss";
  gender: "m" | "f";
  given_name: string;
  family_name: string;
  born_on: string;
  email: string;
  phone_number: string;
  identity_document: {
    type: PassengerIdentityDocumentType | "";
    unique_identifier: string;
    issuing_country_code: string;
    expires_on: string;
  };
  loyalty_programme_account: {
    account_number: string;
    airline_iata_code: string;
  };
};

export type PassengerFieldKey =
  | "title"
  | "gender"
  | "given_name"
  | "family_name"
  | "born_on"
  | "email"
  | "phone_number"
  | "identity_document.type"
  | "identity_document.unique_identifier"
  | "identity_document.issuing_country_code"
  | "identity_document.expires_on"
  | "loyalty_programme_account.account_number"
  | "loyalty_programme_account.airline_iata_code";

export type PassengerValidationError = {
  message: string;
  fieldKey?: PassengerFieldKey;
  passengerIndex?: number;
};

export type CheckoutState = {
  passengers?: PassengerForm[];
  ancillariesContext?: AncillariesContext | null;
  orderPayload?: CreateOrder | null;
  payloadMetadata?: Record<string, unknown> | null;
};

function isPassengerIdentityDocumentType(value: unknown): value is PassengerIdentityDocumentType {
  return value === "passport" || value === "tax_id";
}

function normalizePassengerForm(rawPassenger: unknown, index: number, selection?: StoredFlightSelection | null): PassengerForm {
  const passenger = (rawPassenger ?? {}) as Partial<PassengerForm> & {
    identity_document?: Partial<PassengerForm["identity_document"]>;
    loyalty_programme_account?: Partial<PassengerForm["loyalty_programme_account"]>;
  };
  const initialDocumentType = selection?.offer?.allowed_passenger_identity_document_types?.[0];
  const fallbackDocumentType =
    initialDocumentType === "passport" || initialDocumentType === "tax_id" ? initialDocumentType : "";

  return {
    id: typeof passenger.id === "string" && passenger.id ? passenger.id : `pas_local_${index + 1}`,
    type: typeof passenger.type === "string" && passenger.type ? passenger.type : "adult",
    title:
      passenger.title === "mr" || passenger.title === "ms" || passenger.title === "mrs" || passenger.title === "miss"
        ? passenger.title
        : "mr",
    gender: passenger.gender === "f" ? "f" : "m",
    given_name: typeof passenger.given_name === "string" ? passenger.given_name : "",
    family_name: typeof passenger.family_name === "string" ? passenger.family_name : "",
    born_on: typeof passenger.born_on === "string" ? passenger.born_on : "",
    email: typeof passenger.email === "string" ? passenger.email : "",
    phone_number: typeof passenger.phone_number === "string" ? passenger.phone_number : "",
    identity_document: {
      type: isPassengerIdentityDocumentType(passenger.identity_document?.type)
        ? passenger.identity_document.type
        : fallbackDocumentType,
      unique_identifier:
        typeof passenger.identity_document?.unique_identifier === "string"
          ? passenger.identity_document.unique_identifier
          : "",
      issuing_country_code:
        typeof passenger.identity_document?.issuing_country_code === "string"
          ? passenger.identity_document.issuing_country_code
          : "",
      expires_on: typeof passenger.identity_document?.expires_on === "string" ? passenger.identity_document.expires_on : ""
    },
    loyalty_programme_account: {
      account_number:
        typeof passenger.loyalty_programme_account?.account_number === "string"
          ? passenger.loyalty_programme_account.account_number
          : "",
      airline_iata_code:
        typeof passenger.loyalty_programme_account?.airline_iata_code === "string"
          ? passenger.loyalty_programme_account.airline_iata_code
          : selection?.offer?.owner?.iata_code ?? ""
    }
  };
}

function normalizeCheckoutState(rawState: CheckoutState, selection?: StoredFlightSelection | null): CheckoutState {
  return {
    ...rawState,
    passengers: Array.isArray(rawState.passengers)
      ? rawState.passengers.map((passenger, index) => normalizePassengerForm(passenger, index, selection))
      : undefined
  };
}

export function loadSelection() {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.sessionStorage.getItem(SELECTION_STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  return JSON.parse(rawValue) as StoredFlightSelection;
}

export function loadCheckoutState() {
  if (typeof window === "undefined") {
    return {};
  }

  const selection = loadSelection();
  const rawValue = window.sessionStorage.getItem(CHECKOUT_STORAGE_KEY);

  if (!rawValue) {
    return {};
  }

  return normalizeCheckoutState(JSON.parse(rawValue) as CheckoutState, selection);
}

export function saveCheckoutState(nextState: CheckoutState) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(nextState));
}

export function clearCheckoutState() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(CHECKOUT_STORAGE_KEY);
}

export function mergeCheckoutState(partialState: CheckoutState) {
  const currentState = loadCheckoutState();
  const nextState = { ...currentState, ...partialState };
  saveCheckoutState(nextState);
  return nextState;
}

export function isStaleDuffelReferenceError(message: string) {
  const normalizedMessage = message.toLowerCase();

  // Catches Duffel's various phrasings for "this offer/offer-request can't be
  // used anymore" — added phrases came from real 400/404 responses we observed.
  // Better to be over-eager here: a false positive just means we recommend a
  // re-search, which is harmless. Network timeouts (handled below) are also
  // surfaced as stale because by the time you retry, your offer may well be expired.
  return (
    normalizedMessage.includes("no longer available") ||
    normalizedMessage.includes("linked record") ||
    normalizedMessage.includes("were not found in your account") ||
    normalizedMessage.includes("fare has expired") ||
    normalizedMessage.includes("offer has expired") ||
    normalizedMessage.includes("offer is no longer") ||
    normalizedMessage.includes("could not find offer") ||
    normalizedMessage.includes("offer_request not found") ||
    normalizedMessage.includes("offer not found") ||
    normalizedMessage.includes("request timed out") ||
    normalizedMessage.includes("aborted") ||
    /\bexpired\b/.test(normalizedMessage)
  );
}

/**
 * Run a fetch with an abort timeout. Throws AbortError after `timeoutMs`.
 * Lets the catch handler treat the timeout as a stale-reference (since by the
 * time you retry, the offer is usually toast anyway).
 */
export async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit = {}, timeoutMs = 15000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export function getInitialPassengers(selection: StoredFlightSelection | null): PassengerForm[] {
  const offerPassengers = selection?.offer?.passengers ?? [];
  const passengerCount = Number(selection?.search?.adults ?? offerPassengers.length ?? 1);
  const initialDocumentType = selection?.offer?.allowed_passenger_identity_document_types?.[0];

  return Array.from({ length: Math.max(passengerCount, 1) }, (_, index) => {
    const offerPassenger = offerPassengers[index];

    return {
      id: offerPassenger?.id ?? `pas_local_${index + 1}`,
      type: offerPassenger?.type ?? "adult",
      title: "mr" as const,
      gender: "m" as const,
      given_name: "",
      family_name: "",
      born_on: "",
      email: "",
      phone_number: "",
      identity_document: {
        type: initialDocumentType === "passport" || initialDocumentType === "tax_id" ? initialDocumentType : "",
        unique_identifier: "",
        issuing_country_code: "",
        expires_on: ""
      },
      loyalty_programme_account: {
        account_number: "",
        airline_iata_code: selection?.offer?.owner?.iata_code ?? ""
      }
    };
  });
}

export function formatTime(dateTime?: string) {
  if (!dateTime) {
    return "--:--";
  }

  return new Date(dateTime).toLocaleTimeString("en-AU", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
}

export function formatDate(dateTime?: string) {
  if (!dateTime) {
    return "";
  }

  return new Date(dateTime).toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short"
  });
}

export function parseDurationToMinutes(duration?: string) {
  if (!duration) {
    return 0;
  }

  const hoursMatch = duration.match(/(\d+)H/);
  const minutesMatch = duration.match(/(\d+)M/);
  const hours = hoursMatch ? Number(hoursMatch[1]) : 0;
  const minutes = minutesMatch ? Number(minutesMatch[1]) : 0;
  return hours * 60 + minutes;
}

export function formatDuration(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

export function formatSliceStops(segmentCount: number) {
  const stops = Math.max(segmentCount - 1, 0);
  if (stops === 0) {
    return "direct";
  }
  if (stops === 1) {
    return "1 stop";
  }
  return `${stops} stops`;
}

export function getPlaceLabel(place?: { name?: string | null; iata_code?: string | null }) {
  return place?.name ?? place?.iata_code ?? "Place";
}

export function formatDocumentType(documentType: PassengerIdentityDocumentType) {
  if (documentType === "passport") {
    return "Passport";
  }

  if (documentType === "tax_id") {
    return "Tax ID";
  }

  return documentType;
}

export function getDocumentNumberLabel(documentType: PassengerIdentityDocumentType | "") {
  if (documentType === "passport") {
    return "Passport number";
  }

  if (documentType === "tax_id") {
    return "Tax ID number";
  }

  return "Document number";
}

export function validatePassengers(
  passengers: PassengerForm[],
  {
    showIdentityDocuments,
    identityDocumentsRequired
  }: {
    showIdentityDocuments: boolean;
    identityDocumentsRequired: boolean;
  }
): PassengerValidationError | null {
  if (passengers.length === 0) {
    return { message: "Add at least one passenger before continuing." };
  }

  for (const [index, passenger] of passengers.entries()) {
    if (!passenger.given_name.trim()) {
      return { message: `Complete Passenger ${index + 1}: first name.`, passengerIndex: index, fieldKey: "given_name" };
    }
    if (!passenger.family_name.trim()) {
      return { message: `Complete Passenger ${index + 1}: last name.`, passengerIndex: index, fieldKey: "family_name" };
    }
    if (!passenger.born_on) {
      return { message: `Complete Passenger ${index + 1}: date of birth.`, passengerIndex: index, fieldKey: "born_on" };
    }
    if (!passenger.email.trim()) {
      return { message: `Complete Passenger ${index + 1}: email.`, passengerIndex: index, fieldKey: "email" };
    }
    if (!passenger.phone_number.trim()) {
      return { message: `Complete Passenger ${index + 1}: phone.`, passengerIndex: index, fieldKey: "phone_number" };
    }

    if (showIdentityDocuments) {
      const hasAnyIdentityDocumentField = Boolean(
        passenger.identity_document.type ||
          passenger.identity_document.unique_identifier.trim() ||
          passenger.identity_document.issuing_country_code.trim() ||
          passenger.identity_document.expires_on
      );

      if (identityDocumentsRequired || hasAnyIdentityDocumentField) {
        if (!passenger.identity_document.type) {
          return {
            message: `Complete Passenger ${index + 1}: travel document type.`,
            passengerIndex: index,
            fieldKey: "identity_document.type"
          };
        }
        if (!passenger.identity_document.unique_identifier.trim()) {
          return {
            message: `Complete Passenger ${index + 1}: passport or document number.`,
            passengerIndex: index,
            fieldKey: "identity_document.unique_identifier"
          };
        }
        if (!passenger.identity_document.issuing_country_code.trim()) {
          return {
            message: `Complete Passenger ${index + 1}: issuing country code.`,
            passengerIndex: index,
            fieldKey: "identity_document.issuing_country_code"
          };
        }
        if (!passenger.identity_document.expires_on) {
          return {
            message: `Complete Passenger ${index + 1}: document expiry date.`,
            passengerIndex: index,
            fieldKey: "identity_document.expires_on"
          };
        }
      }
    }

    const hasAnyLoyaltyField = Boolean(
      passenger.loyalty_programme_account.account_number.trim() ||
        passenger.loyalty_programme_account.airline_iata_code.trim()
    );

    if (hasAnyLoyaltyField) {
      if (!passenger.loyalty_programme_account.account_number.trim()) {
        return {
          message: `Complete Passenger ${index + 1}: frequent flyer number.`,
          passengerIndex: index,
          fieldKey: "loyalty_programme_account.account_number"
        };
      }
      if (!passenger.loyalty_programme_account.airline_iata_code.trim()) {
        return {
          message: `Complete Passenger ${index + 1}: frequent flyer airline code.`,
          passengerIndex: index,
          fieldKey: "loyalty_programme_account.airline_iata_code"
        };
      }
    }
  }

  return null;
}

export function buildIdentityDocuments(
  passenger: PassengerForm | undefined,
  {
    showIdentityDocuments,
    identityDocumentsRequired
  }: {
    showIdentityDocuments: boolean;
    identityDocumentsRequired: boolean;
  }
) {
  if (!passenger || !showIdentityDocuments) {
    return undefined;
  }

  const { identity_document } = passenger;
  const hasCompleteIdentityDocument = Boolean(
    identity_document.type &&
      identity_document.unique_identifier.trim() &&
      identity_document.issuing_country_code.trim() &&
      identity_document.expires_on
  );

  if (!hasCompleteIdentityDocument) {
    return identityDocumentsRequired ? [] : undefined;
  }

  return [
    {
      type: identity_document.type,
      unique_identifier: identity_document.unique_identifier.trim(),
      issuing_country_code: identity_document.issuing_country_code.trim().toUpperCase(),
      expires_on: identity_document.expires_on
    }
  ];
}

export function buildLoyaltyProgrammeAccounts(passenger: PassengerForm | undefined) {
  if (!passenger) {
    return undefined;
  }

  const { loyalty_programme_account } = passenger;
  const hasCompleteLoyaltyProgrammeAccount = Boolean(
    loyalty_programme_account.account_number.trim() && loyalty_programme_account.airline_iata_code.trim()
  );

  if (!hasCompleteLoyaltyProgrammeAccount) {
    return undefined;
  }

  return [
    {
      account_number: loyalty_programme_account.account_number.trim(),
      airline_iata_code: loyalty_programme_account.airline_iata_code.trim().toUpperCase()
    }
  ];
}

export function buildBookingPayload(
  orderPayload: CreateOrder | null | undefined,
  passengers: PassengerForm[],
  requiresInstantPayment: boolean,
  showIdentityDocuments: boolean,
  identityDocumentsRequired: boolean
) {
  if (!orderPayload) {
    return null;
  }

  return {
    ...orderPayload,
    type: requiresInstantPayment ? orderPayload.type : "hold",
    passengers: orderPayload.passengers.map((payloadPassenger, index) => ({
      ...payloadPassenger,
      loyalty_programme_accounts: buildLoyaltyProgrammeAccounts(passengers[index]),
      identity_documents: buildIdentityDocuments(passengers[index], {
        showIdentityDocuments,
        identityDocumentsRequired
      })
    }))
  };
}

function placeCityName(place: { city_name?: string; name?: string | null } | undefined | null): string {
  if (!place) return "";
  // Airport places have city_name; city-typed places don't, so fall back to name.
  return (place as { city_name?: string }).city_name ?? place.name ?? "";
}

export function FlightSummary({ selection }: { selection: StoredFlightSelection }) {
  const { format } = useCurrency();
  if (!selection.offer) {
    return null;
  }

  const slices = selection.offer.slices ?? [];

  return (
    <article className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      {/* Top price summary */}
      <div className="mb-4 flex items-center justify-between border-b border-neutral-100 pb-4 dark:border-neutral-800">
        <div>
          <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
            {selection.offer.slices?.[0]?.origin?.iata_code} →{" "}
            {selection.offer.slices?.[slices.length - 1]?.destination?.iata_code}
          </h2>
          <p className="mt-0.5 text-xs text-neutral-500">
            {selection.offer.owner?.name ?? selection.offer.owner?.iata_code}
          </p>
        </div>
        <div className="text-base font-bold text-rose-600 dark:text-rose-400">
          {format(selection.offer.total_amount, selection.offer.total_currency)}
        </div>
      </div>

      <div className="space-y-4">
        {slices.map((slice, sliceIndex) => {
          const firstSegment = slice.segments?.[0];
          const lastSegment = slice.segments?.[(slice.segments?.length ?? 1) - 1];
          const nextSlice = slices[sliceIndex + 1];
          const sliceDurMins = parseDurationToMinutes(slice.duration ?? undefined);
          const nextDay = isNextDay(
            firstSegment?.departing_at,
            lastSegment?.arriving_at,
          );

          // Layover night-count to the next slice (return-trip etc.). Used to
          // suggest accommodation between legs.
          const accomNights =
            lastSegment?.arriving_at && nextSlice?.segments?.[0]?.departing_at
              ? Math.max(
                  0,
                  Math.round(
                    (new Date(nextSlice.segments[0].departing_at).getTime() -
                      new Date(lastSegment.arriving_at).getTime()) /
                      86_400_000,
                  ),
                )
              : 0;
          const accomCity = placeCityName(slice.destination);

          return (
            <div key={slice.id ?? `slice-${sliceIndex}`}>
              {/* Slice header */}
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  {getPlaceLabel(slice.origin)}{" "}
                  <span className="text-neutral-500">→</span>{" "}
                  {getPlaceLabel(slice.destination)}
                </h3>
                <span className="inline-flex items-center gap-1 text-xs text-neutral-500">
                  <ClockIcon className="size-3.5" />
                  {formatDuration(sliceDurMins)}
                </span>
              </div>

              {/* Timeline card */}
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-800">
                <SliceTimeline slice={slice} ownerLogo={selection.offer?.owner?.logo_symbol_url ?? null} ownerName={selection.offer?.owner?.name ?? null} />
              </div>

              {/* Next-day arrival warning */}
              {nextDay ? (
                <div className="mt-2 flex items-center gap-2 rounded-lg bg-orange-50 px-3 py-2 text-xs text-orange-800 dark:bg-orange-950/40 dark:text-orange-200">
                  <ExclamationCircleIcon className="size-4 shrink-0 text-orange-500" />
                  You&apos;ll arrive the next day
                </div>
              ) : null}

              {/* Accommodation CTA between legs */}
              {nextSlice && accomNights > 0 ? (
                <>
                  <div className="mt-3">
                    <Link
                      href={`/stay-search?destinationQuery=${encodeURIComponent(
                        accomCity,
                      )}`}
                      className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-700 hover:border-orange-400 hover:text-orange-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
                    >
                      <BedroomIcon className="size-4" />
                      <span className="underline">
                        Check accommodation in {accomCity}
                      </span>
                    </Link>
                  </div>
                  <p className="mt-4 text-center text-xs text-neutral-500">
                    {accomNights} night{accomNights === 1 ? "" : "s"} in {accomCity}
                  </p>
                </>
              ) : null}
            </div>
          );
        })}
      </div>

      <p className="mt-4 select-all font-mono text-[10px] text-neutral-400">
        Offer ID: {selection.offer.id}
      </p>
    </article>
  );
}

function SliceTimeline({
  slice,
  ownerLogo,
  ownerName,
}: {
  slice: NonNullable<Offer["slices"]>[number];
  ownerLogo: string | null;
  ownerName: string | null;
}) {
  const segments = slice.segments ?? [];
  if (segments.length === 0) return null;

  // Render: row(dep) → row(airline pill, expandable) per segment, with a
  // final row(arr) at the end. For multi-segment slices the structure
  // becomes dep → pill → arr-of-seg1 → layover row → dep-of-seg2 → pill → arr.
  return (
    <div className="px-4 py-3">
      {segments.map((segment, segIdx) => {
        const isLastSeg = segIdx === segments.length - 1;
        const carrier = segment.marketing_carrier ?? segment.operating_carrier;
        const carrierName = carrier?.name ?? ownerName ?? "Airline";
        const carrierLogo = carrier?.logo_symbol_url ?? ownerLogo ?? null;
        const opCarrier = segment.operating_carrier;
        const operatedDifferently =
          !!opCarrier?.name && opCarrier.name !== carrier?.name;
        const segDurMins = parseDurationToMinutes(segment.duration ?? undefined);
        const flightNumber =
          segment.marketing_carrier_flight_number ??
          segment.operating_carrier_flight_number ??
          "";

        const aircraftRaw = segment.aircraft?.name ?? "";
        const aircraft = aircraftRaw
          ? aircraftRaw
              .replace(
                /^(Boeing|Airbus|Embraer|Bombardier|McDonnell Douglas|ATR|De Havilland|Saab|Fokker)\s+/i,
                "",
              )
              .split(/[\s,/|]+/)[0]
          : null;

        return (
          <div key={segment.id}>
            {/* Departure row */}
            <TimelineRow
              left={
                <>
                  <div className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                    {formatTime(segment.departing_at)}
                  </div>
                  <div className="text-xs text-neutral-500">
                    {formatDate(segment.departing_at)}
                  </div>
                </>
              }
              connector={<TimelineDot />}
              right={
                <>
                  <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    {getPlaceLabel(segment.origin)}
                    {segment.origin?.iata_code ? (
                      <span className="ms-1 text-neutral-500">
                        · {segment.origin.iata_code}
                      </span>
                    ) : null}
                  </div>
                  {placeCityName(segment.origin) ? (
                    <div className="text-xs text-neutral-500">{placeCityName(segment.origin)}</div>
                  ) : null}
                </>
              }
            />

            {/* Airline pill row (expandable) */}
            <TimelineRow
              left={
                <div className="text-xs text-neutral-500">{formatDuration(segDurMins)}</div>
              }
              connector={<TimelinePlane />}
              right={
                <AirlinePill
                  carrierName={carrierName}
                  carrierLogo={carrierLogo}
                  operatedBy={operatedDifferently ? opCarrier?.name : null}
                  flightNumber={flightNumber}
                  aircraft={aircraft}
                />
              }
            />

            {/* Arrival row — for the last segment only. For earlier segments
                the next segment's departure row plays this role visually. */}
            {isLastSeg ? (
              <TimelineRow
                left={
                  <>
                    <div className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                      {formatTime(segment.arriving_at)}
                    </div>
                    <div className="text-xs text-neutral-500">
                      {formatDate(segment.arriving_at)}
                    </div>
                  </>
                }
                connector={<TimelineDot />}
                right={
                  <>
                    <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      {getPlaceLabel(segment.destination)}
                      {segment.destination?.iata_code ? (
                        <span className="ms-1 text-neutral-500">
                          · {segment.destination.iata_code}
                        </span>
                      ) : null}
                    </div>
                    {placeCityName(segment.destination) ? (
                      <div className="text-xs text-neutral-500">{placeCityName(segment.destination)}</div>
                    ) : null}
                  </>
                }
                noLine
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function TimelineRow({
  left,
  connector,
  right,
  noLine,
}: {
  left: React.ReactNode;
  connector: React.ReactNode;
  right: React.ReactNode;
  noLine?: boolean;
}) {
  return (
    <div className="grid grid-cols-[64px_24px_1fr] gap-x-3">
      <div className="py-1 text-right">{left}</div>
      <div className="relative flex justify-center">
        {connector}
        {!noLine ? (
          <span className="absolute left-1/2 top-7 bottom-0 -translate-x-1/2 border-l border-dashed border-neutral-300 dark:border-neutral-700" />
        ) : null}
      </div>
      <div className="py-1">{right}</div>
    </div>
  );
}

function TimelineDot() {
  return (
    <span className="relative z-10 mt-1.5 inline-block size-2.5 rounded-full bg-neutral-400" />
  );
}

function TimelinePlane() {
  return (
    <span className="relative z-10 mt-1 inline-flex size-5 items-center justify-center rounded-full bg-white text-neutral-500 dark:bg-neutral-900">
      <PaperAirplaneIcon className="size-3.5 -rotate-45" />
    </span>
  );
}

function AirlinePill({
  carrierName,
  carrierLogo,
  operatedBy,
  flightNumber,
  aircraft,
}: {
  carrierName: string;
  carrierLogo: string | null;
  operatedBy: string | null;
  flightNumber: string;
  aircraft: string | null;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((x) => !x)}
        className="inline-flex items-center gap-2 rounded-full bg-orange-50 py-1 pl-1 pr-3 text-[11px] font-semibold text-orange-700 hover:bg-orange-100 dark:bg-orange-950/40 dark:text-orange-300"
      >
        {carrierLogo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={carrierLogo} alt="" className="size-7 rounded-full bg-white" />
        ) : (
          <span className="inline-block size-7 rounded-full bg-orange-500" />
        )}
        <span>{carrierName}</span>
        <ChevronDownIcon
          className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open ? (
        <div className="mt-3 space-y-3 text-xs">
          <section>
            <p className="mb-1.5 font-semibold text-neutral-900 dark:text-neutral-100">
              Connection info
            </p>
            <DetailRow icon={<PaperAirplaneIcon className="size-3.5 -rotate-45" />} label="Airline" value={carrierName} />
            <DetailRow
              icon={<PaperAirplaneIcon className="size-3.5 -rotate-45" />}
              label="Operating airline"
              value={operatedBy ?? carrierName}
            />
            <DetailRow
              icon={<InformationCircleIcon className="size-3.5" />}
              label="Flight no"
              value={flightNumber || "—"}
            />
            {aircraft ? (
              <DetailRow
                icon={<InformationCircleIcon className="size-3.5" />}
                label="Aircraft"
                value={aircraft}
              />
            ) : null}
          </section>
          <section>
            <p className="mb-1.5 font-semibold text-neutral-900 dark:text-neutral-100">
              Seating info
            </p>
            <DetailRow label="Seat pitch" value="Check after booking" />
            <DetailRow label="Seat width" value="Check after booking" />
            <DetailRow label="Seat recline" value="Check after booking" />
            <DetailRow
              icon={<WifiIcon className="size-3.5" />}
              label="In-seat power"
              value="Varies by aircraft"
            />
            <DetailRow
              icon={<WifiIcon className="size-3.5" />}
              label="Wi-Fi on board"
              value="Check airline policy"
            />
          </section>
        </div>
      ) : null}
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between py-1 text-xs">
      <span className="inline-flex items-center gap-1.5 text-neutral-500">
        {icon ?? <span className="inline-block size-3.5" />}
        {label}
      </span>
      <span className="font-medium text-neutral-900 dark:text-neutral-100">{value}</span>
    </div>
  );
}

function isNextDay(departingAt?: string | null, arrivingAt?: string | null): boolean {
  if (!departingAt || !arrivingAt) return false;
  const dep = departingAt.match(/^(\d{4}-\d{2}-\d{2})/)?.[1];
  const arr = arrivingAt.match(/^(\d{4}-\d{2}-\d{2})/)?.[1];
  return !!dep && !!arr && dep !== arr;
}
