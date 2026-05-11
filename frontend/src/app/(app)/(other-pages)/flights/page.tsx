"use client";

import BgGlassmorphism from "@/components/BgGlassmorphism";
import HeroSectionWithSearchForm1 from "@/components/hero-sections/HeroSectionWithSearchForm1";
import { FlightSearchForm } from "@/components/HeroSearchForm/FlightSearchForm";
import { FlightDestinationsSection } from "@/components/FlightDestinationsSection";
import { TravelProsSection } from "@/components/TravelProsSection";
import heroImageFlights from "@/images/hero-right-flight.png";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

type CabinClass = "economy" | "premium_economy" | "business" | "first";
const VALID_CABINS: CabinClass[] = ["economy", "premium_economy", "business", "first"];

export default function FlightsPage() {
  return (
    <Suspense
      fallback={
        <main className="container py-6">
          <div className="rounded-2xl border border-neutral-200 p-8 text-sm text-neutral-500 dark:border-neutral-800">
            Loading…
          </div>
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

  return (
    <main className="relative overflow-hidden">
      <BgGlassmorphism />
      <div className="relative container mb-24 flex flex-col gap-y-24 lg:mb-28 lg:gap-y-32">
        <HeroSectionWithSearchForm1
          heading="Find your next flight"
          image={heroImageFlights}
          imageAlt="Travel by air"
          description={
            <p className="max-w-xl text-base text-neutral-500 sm:text-xl dark:text-neutral-400">
              Search hundreds of airlines and book your tickets in minutes.
            </p>
          }
          searchForm={
            <div className="hero-search-form">
              <FlightSearchForm
                formStyle="default"
                className="shadow-md"
                openInNewTab={false}
                onSwitchToStays={() => router.push("/stays")}
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
          }
        />

        <TravelProsSection />

        <FlightDestinationsSection />
      </div>
    </main>
  );
}
