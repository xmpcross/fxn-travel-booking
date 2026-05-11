import { randomUUID } from "node:crypto";
import { Duffel } from "@duffel/api";
import type { CreateOrder } from "@duffel/api/types";

type CabinClass = "economy" | "premium_economy" | "business" | "first";
const DUFFEL_API_BASE_URL = "https://api.duffel.com";

type FlightSearchInput = {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  children?: number;
  infants?: number;
  cabinClass?: string;
};

type StaySearchInput = {
  destinationQuery?: string;
  latitude?: number;
  longitude?: number;
  radiusKm: number;
  checkInDate: string;
  checkOutDate: string;
  rooms: number;
  guests: number;
};

type ResolvedCoordinates = {
  latitude: number;
  longitude: number;
  label: string;
};

function getAccessToken() {
  const accessToken = process.env.DUFFEL_ACCESS_TOKEN;

  if (!accessToken) {
    throw new Error("Missing DUFFEL_ACCESS_TOKEN in environment configuration.");
  }

  return accessToken;
}

function getDuffelClient() {
  return new Duffel({
    token: getAccessToken(),
    apiVersion: "v2"
  });
}

export async function searchFlights(input: FlightSearchInput) {
  const duffel = getDuffelClient();
  // Duffel SDK shape: adults are { type: 'adult' }, non-adults are identified by `age`.
  // We pick representative ages for child (8) and infant (1).
  const passengers = [
    ...Array.from({ length: Math.max(1, input.adults) }, () => ({ type: "adult" as const })),
    ...Array.from({ length: input.children ?? 0 }, () => ({ age: 8 })),
    ...Array.from({ length: input.infants ?? 0 }, () => ({ age: 1 })),
  ];

  const slices = [
    {
      origin: input.origin,
      destination: input.destination,
      departure_date: input.departureDate
    }
  ];

  if (input.returnDate) {
    slices.push({
      origin: input.destination,
      destination: input.origin,
      departure_date: input.returnDate
    });
  }

  const offerRequest = await duffel.offerRequests.create({
    slices,
    passengers,
    cabin_class: (input.cabinClass ?? "economy") as CabinClass
  });

  const offerRequestData = offerRequest.data as {
    id: string;
    offers?: unknown[];
    client_key?: string;
  };

  return {
    id: offerRequestData.id,
    clientKey: offerRequestData.client_key,
    offers: offerRequestData.offers ?? []
  };
}

export async function getFlightAncillariesContext(offerId: string) {
  const duffel = getDuffelClient();
  const [offerResponse, seatMapsResponse] = await Promise.all([
    duffel.offers.get(offerId, { return_available_services: true }),
    duffel.seatMaps.get({ offer_id: offerId })
  ]);

  return {
    offer: offerResponse.data,
    seatMaps: seatMapsResponse.data ?? []
  };
}

export async function getFlightOffer(offerId: string) {
  const duffel = getDuffelClient();
  const offerResponse = await duffel.offers.get(offerId);
  return offerResponse.data;
}

export async function createComponentClientKey() {
  const response = await fetch(`${DUFFEL_API_BASE_URL}/identity/component_client_keys`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
      "Duffel-Version": "v2",
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({}),
    cache: "no-store"
  });

  const payload = (await response.json()) as {
    data?: { component_client_key?: string };
    errors?: Array<{ message?: string; title?: string }>;
  };

  if (!response.ok || !payload.data?.component_client_key) {
    const message = payload.errors?.map((item) => item.message ?? item.title).filter(Boolean).join(", ");
    throw new Error(message || "Unable to create Duffel component client key.");
  }

  return payload.data.component_client_key;
}

export async function createFlightOrder(orderPayload: CreateOrder) {
  const duffel = getDuffelClient();
  const orderResponse = await duffel.orders.create(orderPayload);
  return orderResponse.data;
}

export async function getFlightOrder(orderId: string) {
  const duffel = getDuffelClient();
  const orderResponse = await duffel.orders.get(orderId);
  return orderResponse.data;
}

export async function searchStays(input: StaySearchInput) {
  const coordinates = await resolveStayCoordinates(input);
  const guests = Array.from({ length: input.guests }, () => ({ type: "adult" as const }));

  const response = await fetch(`${DUFFEL_API_BASE_URL}/stays/search`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
      "Duffel-Version": "v2",
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({
      data: {
        rooms: input.rooms,
        check_in_date: input.checkInDate,
        check_out_date: input.checkOutDate,
        guests,
        location: {
          radius: input.radiusKm,
          geographic_coordinates: {
            latitude: coordinates.latitude,
            longitude: coordinates.longitude
          }
        }
      }
    }),
    cache: "no-store"
  });

  const responseText = await response.text();
  let payload: unknown = null;

  try {
    payload = JSON.parse(responseText);
  } catch {
    payload = null;
  }

  if (!response.ok) {
    if (payload && typeof payload === "object" && "errors" in payload) {
      const errors = (payload as { errors?: Array<{ message?: string; title?: string }> }).errors ?? [];
      const message = errors.map((item) => item.message ?? item.title).filter(Boolean).join(", ");
      throw new Error(message || `Duffel stays search failed with status ${response.status}`);
    }

    throw new Error(responseText || `Duffel stays search failed with status ${response.status}`);
  }

  if (payload && typeof payload === "object" && "data" in payload) {
    const data = (payload as { data?: unknown }).data;

    if (Array.isArray(data)) {
      return data;
    }

    if (data && typeof data === "object" && "results" in data) {
      return (data as { results?: unknown[] }).results ?? [];
    }
  }

  return [];
}

// Duffel's /stays/search response includes only `cheapest_rate_total_amount` —
// it does NOT include the rate `id` required by /stays/quotes. The actual
// rates (with IDs) live behind a separate endpoint: POST
// /stays/search_results/{id}/actions/fetch_all_rates.

// Full envelope: { accommodation: { rooms: [{ name, beds, photos, rates: [...] }] }, cheapest_rate_*, ... }
export async function fetchStayDetails(searchResultId: string) {
  const response = await fetch(
    `${DUFFEL_API_BASE_URL}/stays/search_results/${encodeURIComponent(searchResultId)}/actions/fetch_all_rates`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
        "Duffel-Version": "v2",
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({}),
      cache: "no-store"
    }
  );

  const responseText = await response.text();
  let parsed: unknown = null;
  try {
    parsed = JSON.parse(responseText);
  } catch {
    parsed = null;
  }

  if (!response.ok) {
    if (parsed && typeof parsed === "object" && "errors" in parsed) {
      const errors = (parsed as { errors?: Array<{ message?: string; title?: string }> }).errors ?? [];
      const message = errors.map((item) => item.message ?? item.title).filter(Boolean).join(", ");
      throw new Error(message || `Duffel fetch_all_rates failed with status ${response.status}`);
    }
    throw new Error(responseText || `Duffel fetch_all_rates failed with status ${response.status}`);
  }

  if (parsed && typeof parsed === "object" && "data" in parsed) {
    return (parsed as { data: unknown }).data;
  }
  return null;
}

export async function fetchStayRates(searchResultId: string) {
  const response = await fetch(
    `${DUFFEL_API_BASE_URL}/stays/search_results/${encodeURIComponent(searchResultId)}/actions/fetch_all_rates`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
        "Duffel-Version": "v2",
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      // Endpoint accepts no body; some Duffel actions still require an empty
      // JSON object so the server picks up Content-Type correctly.
      body: JSON.stringify({}),
      cache: "no-store"
    }
  );

  const responseText = await response.text();
  let parsed: unknown = null;
  try {
    parsed = JSON.parse(responseText);
  } catch {
    parsed = null;
  }

  if (!response.ok) {
    if (parsed && typeof parsed === "object" && "errors" in parsed) {
      const errors = (parsed as { errors?: Array<{ message?: string; title?: string }> }).errors ?? [];
      const message = errors.map((item) => item.message ?? item.title).filter(Boolean).join(", ");
      throw new Error(message || `Duffel fetch_all_rates failed with status ${response.status}`);
    }
    throw new Error(responseText || `Duffel fetch_all_rates failed with status ${response.status}`);
  }

  if (parsed && typeof parsed === "object" && "data" in parsed) {
    const data = (parsed as { data?: unknown }).data;
    // Duffel sometimes returns the full search-result envelope here; the rates
    // live at .accommodation.rooms[].rates[] OR at .rates[] depending on version.
    // Probe both shapes and flatten to a single rates array.
    if (Array.isArray(data)) {
      return data as Array<{ id: string; total_amount?: string; total_currency?: string }>;
    }
    if (data && typeof data === "object") {
      const obj = data as Record<string, unknown>;
      if (Array.isArray(obj.rates)) return obj.rates as Array<{ id: string; total_amount?: string; total_currency?: string }>;
      const acc = obj.accommodation as Record<string, unknown> | undefined;
      const rooms = acc?.rooms as Array<Record<string, unknown>> | undefined;
      if (Array.isArray(rooms)) {
        return rooms.flatMap((r) => (Array.isArray(r.rates) ? (r.rates as Array<{ id: string; total_amount?: string; total_currency?: string }>) : []));
      }
    }
  }

  return [] as Array<{ id: string; total_amount?: string; total_currency?: string }>;
}

async function resolveStayCoordinates(input: StaySearchInput): Promise<ResolvedCoordinates> {
  if (typeof input.latitude === "number" && typeof input.longitude === "number") {
    return {
      latitude: input.latitude,
      longitude: input.longitude,
      label: "Coordinates"
    };
  }

  if (!input.destinationQuery?.trim()) {
    throw new Error("Enter a city or hotel name for the stay search.");
  }

  const geocodingUrl = new URL("https://nominatim.openstreetmap.org/search");
  geocodingUrl.searchParams.set("q", input.destinationQuery.trim());
  geocodingUrl.searchParams.set("format", "jsonv2");
  geocodingUrl.searchParams.set("limit", "1");
  geocodingUrl.searchParams.set("addressdetails", "1");

  const response = await fetch(geocodingUrl, {
    headers: {
      Accept: "application/json",
      "User-Agent": "DuffelTravelStarter/0.1"
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Unable to resolve that stay destination right now.");
  }

  const results = (await response.json()) as Array<{
    lat?: string;
    lon?: string;
    display_name?: string;
  }>;

  const firstResult = results[0];

  if (!firstResult?.lat || !firstResult?.lon) {
    throw new Error("We could not find that city or hotel. Try a broader city or area name.");
  }

  return {
    latitude: Number(firstResult.lat),
    longitude: Number(firstResult.lon),
    label: firstResult.display_name ?? input.destinationQuery
  };
}

// ---- Stays: quote + booking ----

export type StayBookingGuest = {
  given_name: string;
  family_name: string;
};

export type StayBookingInput = {
  quote_id: string;
  guests: StayBookingGuest[];
  email: string;
  phone_number: string;
  accommodation_special_requests?: string;
  payment?: { card_id: string };
  loyalty_programme_account_number?: string;
};

export async function quoteStayRate(rateId: string) {
  const duffel = getDuffelClient();
  const response = await duffel.stays.quotes.create(rateId);
  return response.data;
}

// Booking creation goes via raw fetch so we can attach an Idempotency-Key
// header — the SDK's typed .create() doesn't expose per-call request options.
// Pass the same key on retries to dedupe; pass a fresh one for new attempts.
export async function createStayBooking(payload: StayBookingInput, idempotencyKey?: string) {
  const key = idempotencyKey ?? randomUUID();

  const response = await fetch(`${DUFFEL_API_BASE_URL}/stays/bookings`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
      "Duffel-Version": "v2",
      "Content-Type": "application/json",
      Accept: "application/json",
      "Idempotency-Key": key
    },
    body: JSON.stringify({ data: payload }),
    cache: "no-store"
  });

  const responseText = await response.text();
  let parsed: unknown = null;
  try {
    parsed = JSON.parse(responseText);
  } catch {
    parsed = null;
  }

  if (!response.ok) {
    if (parsed && typeof parsed === "object" && "errors" in parsed) {
      const errors = (parsed as { errors?: Array<{ message?: string; title?: string }> }).errors ?? [];
      const message = errors.map((item) => item.message ?? item.title).filter(Boolean).join(", ");
      throw new Error(message || `Duffel stay booking failed with status ${response.status}`);
    }
    throw new Error(responseText || `Duffel stay booking failed with status ${response.status}`);
  }

  if (parsed && typeof parsed === "object" && "data" in parsed) {
    return (parsed as { data: unknown }).data;
  }

  throw new Error("Unexpected Duffel stay booking response shape.");
}

export async function getStayBooking(bookingId: string) {
  const duffel = getDuffelClient();
  const response = await duffel.stays.bookings.get(bookingId);
  return response.data;
}
