"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { FlightSearchForm } from "@/components/HeroSearchForm/FlightSearchForm";
import { CHECKOUT_STORAGE_KEY } from "../checkout/flight/shared";

type CabinClass = "economy" | "premium_economy" | "business" | "first";
const VALID_CABINS: CabinClass[] = ["economy", "premium_economy", "business", "first"];

type FlightOffer = {
  id: string;
  total_amount?: string;
  total_currency?: string;
  owner?: { name?: string; iata_code?: string };
  slices?: Array<{
    duration?: string;
    origin?: { iata_code?: string; city_name?: string };
    destination?: { iata_code?: string; city_name?: string };
    segments?: Array<{
      departing_at?: string;
      arriving_at?: string;
      duration?: string;
      aircraft?: { name?: string };
      destination?: { city_name?: string; iata_code?: string };
      origin?: { city_name?: string; iata_code?: string };
      marketing_carrier?: { name?: string; logo_symbol_url?: string; iata_code?: string };
      marketing_carrier_flight_number?: string;
      operating_carrier?: { name?: string; logo_symbol_url?: string; iata_code?: string };
      operating_carrier_flight_number?: string;
    }>;
  }>;
};

type FlightSearchResponse = {
  id?: string;
  clientKey?: string;
  offers?: FlightOffer[];
};

type SortMode = "best" | "cheapest" | "fastest";
type StopsFilter = "any" | "direct" | "one_stop";
type TimeBucket = "early" | "morning" | "afternoon" | "evening";

const TIME_BUCKETS: { id: TimeBucket; label: string; range: string; from: number; to: number }[] = [
  { id: "early", label: "Early morning", range: "00:00–06:00", from: 0, to: 6 },
  { id: "morning", label: "Morning", range: "06:00–12:00", from: 6, to: 12 },
  { id: "afternoon", label: "Afternoon", range: "12:00–18:00", from: 12, to: 18 },
  { id: "evening", label: "Evening", range: "18:00–24:00", from: 18, to: 24 },
];

function hourFromIso(iso?: string): number {
  // Parses HH from "YYYY-MM-DDTHH:MM:..." without going through Date (avoids TZ shifts).
  const m = iso?.match(/T(\d{2}):/);
  return m ? Number(m[1]) : -1;
}

function inAnyBucket(hour: number, buckets: TimeBucket[]): boolean {
  if (buckets.length === 0) return true;
  return buckets.some((id) => {
    const b = TIME_BUCKETS.find((tb) => tb.id === id);
    return b ? hour >= b.from && hour < b.to : false;
  });
}

type NormalizedOffer = {
  id: string;
  offer: FlightOffer;
  amount: number;
  currency: string;
  airline: string;
  durationMinutes: number;
  stops: number;
  routeLabel: string;
  departureLabel: string;
  arrivalLabel: string;
  departureDateLabel: string;
  arrivalDateLabel: string;
  originCity: string;
  destinationCity: string;
  nextDayArrival: boolean;
  flightNumber: string;
  operatingAirline: string;
  aircraftName: string;
  segmentDurationLabel: string;
  amenities: Array<{ label: string; value: string }>;
  score: number;
};

const STORAGE_KEY = "selected-flight-offer";

export default function FlightsPage() {
  return (
    <Suspense
      fallback={
        <main className="page">
          <section className="results-page">
            <div className="results-page-inner">
              <div className="status-card">Loading flight search...</div>
            </div>
          </section>
        </main>
      }
    >
      <FlightsPageContent />
    </Suspense>
  );
}

function FlightsPageContent() {
  const searchParams = useSearchParams();
  const params = searchParams ?? new URLSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FlightSearchResponse | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>("best");
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const [stopsFilter, setStopsFilter] = useState<StopsFilter>("any");
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [expandedOfferIds, setExpandedOfferIds] = useState<string[]>([]);
  const [staleFareNotice, setStaleFareNotice] = useState<string | null>(null);
  const [departBuckets, setDepartBuckets] = useState<TimeBucket[]>([]);
  const [arriveBuckets, setArriveBuckets] = useState<TimeBucket[]>([]);
  const [maxDurationMin, setMaxDurationMin] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(10);

  useEffect(() => {
    const nextNotice = sessionStorage.getItem("flight-search-error");

    if (nextNotice) {
      setStaleFareNotice("That fare or its linked extras expired. Choose a fresh flight to continue.");
      sessionStorage.removeItem("flight-search-error");
    }
  }, []);

  // Auto-fill missing origin / dates when the user lands on /flights?destination=XXX
  // (e.g. from clicking a destination tile on the home page). Geo-detect origin
  // and default to depart=today+30, return=today+37, then router.replace so the
  // existing search effect picks up the completed URL.
  useEffect(() => {
    const origin = params.get("origin");
    const departureDate = params.get("departureDate");
    if (origin && departureDate) return;

    let cancelled = false;
    (async () => {
      let nextOrigin = origin;
      if (!nextOrigin) {
        try {
          const ipRes = await fetch("https://ipapi.co/json/");
          if (ipRes.ok) {
            const ipData = (await ipRes.json()) as { city?: string };
            if (ipData.city) {
              const placesRes = await fetch(`/api/places/suggestions?q=${encodeURIComponent(ipData.city)}`);
              if (placesRes.ok) {
                const placesData = (await placesRes.json()) as { data?: Array<{ iata_code: string }> };
                nextOrigin = placesData.data?.[0]?.iata_code ?? null;
              }
            }
          }
        } catch {
          // silent
        }
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const fmt = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

      let nextDep = departureDate;
      let nextRet = params.get("returnDate");
      if (!nextDep) {
        const d = new Date(today);
        d.setDate(today.getDate() + 30);
        nextDep = fmt(d);
        if (!nextRet) {
          const r = new Date(today);
          r.setDate(today.getDate() + 37);
          nextRet = fmt(r);
        }
      }

      if (cancelled) return;

      if (nextOrigin && nextDep) {
        const next = new URLSearchParams(params.toString());
        next.set("origin", nextOrigin);
        next.set("departureDate", nextDep);
        if (nextRet) next.set("returnDate", nextRet);
        router.replace(`/flights?${next.toString()}`);
      } else {
        // Couldn't detect origin — stop the loading state and let the form prompt the user.
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [params, router]);

  useEffect(() => {
    // Skip the search API call when required params are missing — the auto-fill
    // effect above will populate them and trigger a re-run via router.replace.
    if (!params.get("origin") || !params.get("departureDate")) {
      return;
    }

    const controller = new AbortController();

    async function runSearch() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/flights/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            origin: params.get("origin"),
            destination: params.get("destination"),
            departureDate: params.get("departureDate"),
            returnDate: params.get("returnDate"),
            adults: Number(params.get("adults") ?? "1"),
            children: Number(params.get("children") ?? "0") || undefined,
            infants: Number(params.get("infants") ?? "0") || undefined,
            cabinClass: params.get("cabinClass") ?? "economy"
          }),
          signal: controller.signal
        });

        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error ?? "Flight search failed");
        }

        setResult(payload);
      } catch (searchError) {
        if ((searchError as Error).name === "AbortError") {
          return;
        }

        setError(searchError instanceof Error ? searchError.message : "Flight search failed");
      } finally {
        setLoading(false);
      }
    }

    runSearch();

    return () => controller.abort();
  }, [searchParams]);

  const normalizedOffers = useMemo(() => {
    return (result?.offers ?? []).map(normalizeOffer).filter((item): item is NormalizedOffer => item !== null);
  }, [result]);

  const airlineOptions = useMemo(() => {
    return Array.from(new Set(normalizedOffers.map((offer) => offer.airline))).sort((a, b) => a.localeCompare(b));
  }, [normalizedOffers]);

  const highestPrice = useMemo(() => {
    if (normalizedOffers.length === 0) {
      return 0;
    }

    return Math.ceil(Math.max(...normalizedOffers.map((offer) => offer.amount)));
  }, [normalizedOffers]);

  const highestDuration = useMemo(() => {
    if (normalizedOffers.length === 0) return 0;
    return Math.max(...normalizedOffers.map((o) => o.durationMinutes));
  }, [normalizedOffers]);

  useEffect(() => {
    if (highestPrice > 0 && maxPrice === null) {
      setMaxPrice(highestPrice);
    }
  }, [highestPrice, maxPrice]);

  useEffect(() => {
    if (highestDuration > 0 && maxDurationMin === null) {
      setMaxDurationMin(highestDuration);
    }
  }, [highestDuration, maxDurationMin]);

  // Reset pagination whenever the active filter set changes — otherwise
  // toggling filters would leave a stale "loaded N of M" state.
  useEffect(() => {
    setVisibleCount(10);
  }, [
    selectedAirlines,
    sortMode,
    stopsFilter,
    maxPrice,
    departBuckets,
    arriveBuckets,
    maxDurationMin,
  ]);

  const filteredOffers = useMemo(() => {
    const activeMaxPrice = maxPrice ?? highestPrice;
    const activeMaxDuration = maxDurationMin ?? highestDuration;

    const filtered = normalizedOffers.filter((offer) => {
      const airlineMatch = selectedAirlines.length === 0 || selectedAirlines.includes(offer.airline);
      const priceMatch = offer.amount <= activeMaxPrice;
      const durationMatch = offer.durationMinutes <= activeMaxDuration;
      const stopsMatch =
        stopsFilter === "any" ||
        (stopsFilter === "direct" && offer.stops === 0) ||
        (stopsFilter === "one_stop" && offer.stops <= 1);

      // Time-of-day filters: check the FIRST segment of the FIRST slice (outbound dep)
      // and LAST segment of the FIRST slice (outbound arr).
      const firstSlice = offer.offer.slices?.[0];
      const segs = firstSlice?.segments ?? [];
      const depHour = hourFromIso(segs[0]?.departing_at);
      const arrHour = hourFromIso(segs[segs.length - 1]?.arriving_at);
      const departTimeMatch = depHour < 0 || inAnyBucket(depHour, departBuckets);
      const arriveTimeMatch = arrHour < 0 || inAnyBucket(arrHour, arriveBuckets);

      return airlineMatch && priceMatch && durationMatch && stopsMatch && departTimeMatch && arriveTimeMatch;
    });

    const sorted = [...filtered];

    if (sortMode === "cheapest") {
      sorted.sort((a, b) => a.amount - b.amount);
    } else if (sortMode === "fastest") {
      sorted.sort((a, b) => a.durationMinutes - b.durationMinutes);
    } else {
      sorted.sort((a, b) => b.score - a.score);
    }

    return sorted;
  }, [
    highestPrice,
    maxPrice,
    highestDuration,
    maxDurationMin,
    normalizedOffers,
    selectedAirlines,
    sortMode,
    stopsFilter,
    departBuckets,
    arriveBuckets,
  ]);

  function handleSelect(offer: FlightOffer) {
    const payload = {
      offer,
      offerRequestId: result?.id,
      clientKey: result?.clientKey,
      search: {
        origin: params.get("origin"),
        destination: params.get("destination"),
        departureDate: params.get("departureDate"),
        returnDate: params.get("returnDate"),
        adults: params.get("adults"),
        cabinClass: params.get("cabinClass")
      }
    };

    sessionStorage.removeItem(CHECKOUT_STORAGE_KEY);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    router.push("/checkout/flight/travellers");
  }

  function toggleAirline(airline: string) {
    setSelectedAirlines((current) =>
      current.includes(airline) ? current.filter((item) => item !== airline) : [...current, airline]
    );
  }

  function toggleExpandedOffer(offerId: string) {
    setExpandedOfferIds((current) =>
      current.includes(offerId) ? current.filter((item) => item !== offerId) : [...current, offerId]
    );
  }

  return (
    <main className="page">
      <section className="results-page">
        <div className="results-page-inner">
          <div className="results-search-wrap">
            <FlightSearchForm
              openInNewTab={false}
              initial={{
                origin: params.get("origin") ?? undefined,
                destination: params.get("destination") ?? undefined,
                departureDate: params.get("departureDate") ?? undefined,
                returnDate: params.get("returnDate") ?? undefined,
                adults: Number(params.get("adults")) || 1,
                children: Number(params.get("children")) || 0,
                infants: Number(params.get("infants")) || 0,
                cabinClass: VALID_CABINS.includes(params.get("cabinClass") as CabinClass)
                  ? (params.get("cabinClass") as CabinClass)
                  : "economy",
                tripType: params.get("returnDate") ? "return" : "oneway",
              }}
            />
          </div>

          {loading ? <div className="status-card">Loading flight offers...</div> : null}
          {error ? <div className="status-card">{error}</div> : null}
          {staleFareNotice ? <div className="status-card">{staleFareNotice}</div> : null}

          {!loading && !error ? (
            <div className="flight-results-layout">
              <aside className="filter-panel">
                <div className="filter-card">
                  <h2>Sort</h2>
                  <div className="sort-pills">
                    <button className={sortMode === "best" ? "active" : ""} onClick={() => setSortMode("best")} type="button">
                      Best
                    </button>
                    <button className={sortMode === "cheapest" ? "active" : ""} onClick={() => setSortMode("cheapest")} type="button">
                      Cheapest
                    </button>
                    <button className={sortMode === "fastest" ? "active" : ""} onClick={() => setSortMode("fastest")} type="button">
                      Fastest
                    </button>
                  </div>
                </div>

                <div className="filter-card">
                  <h2>Max price</h2>
                  <input
                    className="range-input"
                    max={highestPrice || 1}
                    min={0}
                    onChange={(event) => setMaxPrice(Number(event.target.value))}
                    type="range"
                    value={maxPrice ?? highestPrice}
                  />
                  <p className="muted">
                    Up to {(normalizedOffers[0]?.currency ?? "AUD")} {maxPrice ?? highestPrice}
                  </p>
                </div>

                <div className="filter-card">
                  <h2>Stops</h2>
                  <div className="filter-options">
                    <button className={stopsFilter === "any" ? "active" : ""} onClick={() => setStopsFilter("any")} type="button">
                      Any
                    </button>
                    <button className={stopsFilter === "direct" ? "active" : ""} onClick={() => setStopsFilter("direct")} type="button">
                      Direct
                    </button>
                    <button
                      className={stopsFilter === "one_stop" ? "active" : ""}
                      onClick={() => setStopsFilter("one_stop")}
                      type="button"
                    >
                      1 stop max
                    </button>
                  </div>
                </div>

                <div className="filter-card">
                  <h2>Departure time</h2>
                  <div className="check-list">
                    {TIME_BUCKETS.map((bucket) => (
                      <label className="check-item" key={`dep-${bucket.id}`}>
                        <input
                          type="checkbox"
                          checked={departBuckets.includes(bucket.id)}
                          onChange={() =>
                            setDepartBuckets((current) =>
                              current.includes(bucket.id)
                                ? current.filter((id) => id !== bucket.id)
                                : [...current, bucket.id]
                            )
                          }
                        />
                        <span>
                          {bucket.label} <small style={{ color: "var(--muted)" }}>({bucket.range})</small>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="filter-card">
                  <h2>Arrival time</h2>
                  <div className="check-list">
                    {TIME_BUCKETS.map((bucket) => (
                      <label className="check-item" key={`arr-${bucket.id}`}>
                        <input
                          type="checkbox"
                          checked={arriveBuckets.includes(bucket.id)}
                          onChange={() =>
                            setArriveBuckets((current) =>
                              current.includes(bucket.id)
                                ? current.filter((id) => id !== bucket.id)
                                : [...current, bucket.id]
                            )
                          }
                        />
                        <span>
                          {bucket.label} <small style={{ color: "var(--muted)" }}>({bucket.range})</small>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {highestDuration > 0 ? (
                  <div className="filter-card">
                    <h2>Max flight duration</h2>
                    <input
                      type="range"
                      min={Math.max(60, Math.floor(highestDuration / 4))}
                      max={highestDuration}
                      step={15}
                      value={maxDurationMin ?? highestDuration}
                      onChange={(e) => setMaxDurationMin(Number(e.target.value))}
                    />
                    <p className="muted">
                      Up to {Math.floor((maxDurationMin ?? highestDuration) / 60)}h{" "}
                      {(maxDurationMin ?? highestDuration) % 60}m
                    </p>
                  </div>
                ) : null}

                <div className="filter-card">
                  <h2>Airlines</h2>
                  <div className="check-list">
                    {airlineOptions.map((airline) => (
                      <label className="check-item" key={airline}>
                        <input
                          checked={selectedAirlines.includes(airline)}
                          onChange={() => toggleAirline(airline)}
                          type="checkbox"
                        />
                        <span>{airline}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </aside>

              <div className="results-stage">
                <div className="results-toolbar">
                  <div className="toolbar-chip">{filteredOffers.length} results</div>
                  <div className="toolbar-chip">
                    {selectedAirlines.length === 0 ? "All airlines" : `${selectedAirlines.length} airline filters`}
                  </div>
                  <div className="toolbar-chip">{stopsFilter === "any" ? "Any stops" : stopsFilter === "direct" ? "Direct only" : "Up to 1 stop"}</div>
                </div>

                <div className="results-listing">
                  {filteredOffers.slice(0, visibleCount).map((item) => (
                    <article className="flight-card-v2" key={item.id}>
                      <div className="flight-legs">
                        {(item.offer.slices ?? []).map((slice, sliceIndex) => {
                          const segs = slice.segments ?? [];
                          const firstSeg = segs[0];
                          const lastSeg = segs[segs.length - 1];
                          const stops = Math.max(0, segs.length - 1);
                          // Show marketing carrier (the brand) as primary; "Operated by" only when different.
                          const marketingCarrier = firstSeg?.marketing_carrier;
                          const operatingCarrier = firstSeg?.operating_carrier;
                          const carrier = marketingCarrier ?? operatingCarrier;
                          const showOperatedBy =
                            !!operatingCarrier?.name &&
                            !!marketingCarrier?.name &&
                            operatingCarrier.name !== marketingCarrier.name;
                          // Aircraft model intentionally hidden on the card — it shows on the
                          // next screen (FlightSummary on /checkout/flight/travellers).
                          const depTime = firstSeg?.departing_at?.match(/T(\d{2}:\d{2})/)?.[1] ?? "";
                          const arrTime = lastSeg?.arriving_at?.match(/T(\d{2}:\d{2})/)?.[1] ?? "";
                          const depDate = firstSeg?.departing_at?.match(/^(\d{4}-\d{2}-\d{2})/)?.[1];
                          const arrDate = lastSeg?.arriving_at?.match(/^(\d{4}-\d{2}-\d{2})/)?.[1];
                          const nextDay = depDate && arrDate ? depDate !== arrDate : false;
                          const sliceDur = parseDurationToMinutes(slice.duration);
                          return (
                            <div className="flight-leg" key={`${item.id}-${sliceIndex}`}>
                              <div className="flight-leg-airline">
                                {carrier?.logo_symbol_url ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img className="airline-logo" src={carrier.logo_symbol_url} alt="" />
                                ) : (
                                  <span className="airline-logo-fallback" />
                                )}
                                <div className="meta">
                                  <div className="name">{carrier?.name ?? "Airline"}</div>
                                  {showOperatedBy ? (
                                    <div className="operated-by">Operated by {operatingCarrier?.name}</div>
                                  ) : null}
                                </div>
                              </div>
                              <div className="flight-leg-times">
                                <div className="flight-time">
                                  <strong>{depTime}</strong>
                                  <span className="iata">{slice.origin?.iata_code ?? firstSeg?.origin?.iata_code}</span>
                                </div>
                                <div className="flight-leg-bar">
                                  <span className="duration">{formatDuration(sliceDur)}</span>
                                  <span className="leg-line" />
                                  <span className="stops">{stops === 0 ? "Direct" : `${stops} stop${stops > 1 ? "s" : ""}`}</span>
                                </div>
                                <div className="flight-time">
                                  <strong>
                                    {arrTime}
                                    {nextDay ? <span className="next-day">+1</span> : null}
                                  </strong>
                                  <span className="iata">
                                    {slice.destination?.iata_code ?? lastSeg?.destination?.iata_code}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flight-price">
                        <span className="from">from</span>
                        <strong className="amount">
                          {item.currency} {item.amount.toFixed(0)}
                        </strong>
                        <span className="per-person">Per person</span>
                        <button className="search-button" onClick={() => handleSelect(item.offer)} type="button">
                          Select
                        </button>
                      </div>
                    </article>
                  ))}

                  {filteredOffers.length === 0 ? (
                    <div className="status-card">No flights match the current filters. Try widening price, stops, or airline options.</div>
                  ) : null}

                  {filteredOffers.length > visibleCount ? (
                    <div className="load-more-wrap">
                      <button
                        type="button"
                        className="load-more-button"
                        onClick={() => setVisibleCount((n) => n + 10)}
                      >
                        Show more flights ({filteredOffers.length - visibleCount} remaining)
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>

              <aside className="ad-panel">
                <div className="ad-card">
                  <div className="ad-media">Ad Space</div>
                  <h3>Travel partner placement</h3>
                  <p className="muted">
                    Reserved for sponsored fare content, upsell banners, insurance prompts, or partner campaigns.
                  </p>
                  <button className="ad-button" type="button">
                    Placeholder CTA
                  </button>
                </div>
              </aside>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}

function normalizeOffer(offer: FlightOffer): NormalizedOffer | null {
  const firstSlice = offer.slices?.[0];
  const firstSegment = firstSlice?.segments?.[0];
  const amount = Number(offer.total_amount ?? "0");
  const durationMinutes = parseDurationToMinutes(firstSlice?.duration);
  const stops = Math.max((firstSlice?.segments?.length ?? 1) - 1, 0);
  const airline = offer.owner?.name ?? offer.owner?.iata_code ?? firstSegment?.operating_carrier?.name ?? "Airline";

  if (!firstSlice) {
    return null;
  }

  return {
    id: offer.id,
    offer,
    amount,
    currency: offer.total_currency ?? "",
    airline,
    durationMinutes,
    stops,
    routeLabel: `${firstSlice.origin?.iata_code ?? "Origin"}-${firstSlice.destination?.iata_code ?? "Destination"}`,
    departureLabel: formatTime(firstSegment?.departing_at),
    arrivalLabel: formatTime(firstSegment?.arriving_at),
    departureDateLabel: formatDate(firstSegment?.departing_at),
    arrivalDateLabel: formatDate(firstSegment?.arriving_at),
    originCity: firstSlice.origin?.city_name ?? firstSlice.origin?.iata_code ?? "Origin",
    destinationCity: firstSlice.destination?.city_name ?? firstSlice.destination?.iata_code ?? "Destination",
    nextDayArrival: isNextDayArrival(firstSegment?.departing_at, firstSegment?.arriving_at),
    flightNumber:
      firstSegment?.marketing_carrier_flight_number ??
      firstSegment?.operating_carrier_flight_number ??
      "Unavailable",
    operatingAirline:
      firstSegment?.operating_carrier?.name ??
      firstSegment?.marketing_carrier?.name ??
      airline,
    aircraftName: firstSegment?.aircraft?.name ?? "Aircraft details unavailable",
    segmentDurationLabel: formatDuration(parseDurationToMinutes(firstSegment?.duration ?? firstSlice.duration)),
    amenities: [
      { label: "Aircraft", value: firstSegment?.aircraft?.name ?? "Unavailable" },
      { label: "Cabin", value: "Included in fare" },
      { label: "Seat pitch", value: "Check after booking" },
      { label: "Seat width", value: "Check after booking" },
      { label: "Seat recline", value: "Check after booking" },
      { label: "In-seat power", value: "Varies by aircraft" },
      { label: "Wi-Fi on board", value: "Check airline policy" }
    ],
    score: calculateBestScore(amount, durationMinutes, stops)
  };
}

function calculateBestScore(amount: number, durationMinutes: number, stops: number) {
  const priceScore = Math.max(0, 1000 - amount);
  const durationScore = Math.max(0, 1000 - durationMinutes);
  const stopPenalty = stops * 120;
  return Math.round(priceScore * 0.55 + durationScore * 0.45 - stopPenalty);
}

function parseDurationToMinutes(duration?: string) {
  if (!duration) {
    return 0;
  }

  const hoursMatch = duration.match(/(\d+)H/);
  const minutesMatch = duration.match(/(\d+)M/);
  const hours = hoursMatch ? Number(hoursMatch[1]) : 0;
  const minutes = minutesMatch ? Number(minutesMatch[1]) : 0;
  return hours * 60 + minutes;
}

function formatDuration(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

function formatStops(stops: number) {
  if (stops === 0) {
    return "Direct";
  }

  if (stops === 1) {
    return "1 stop";
  }

  return `${stops} stops`;
}

function formatTime(dateTime?: string) {
  if (!dateTime) {
    return "--:--";
  }

  const date = new Date(dateTime);
  return date.toLocaleTimeString("en-AU", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
}

function formatDate(dateTime?: string) {
  if (!dateTime) {
    return "";
  }

  const date = new Date(dateTime);
  return date.toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short"
  });
}

function isNextDayArrival(departingAt?: string, arrivingAt?: string) {
  if (!departingAt || !arrivingAt) {
    return false;
  }

  const departureDate = new Date(departingAt);
  const arrivalDate = new Date(arrivingAt);

  return arrivalDate.toDateString() !== departureDate.toDateString();
}
