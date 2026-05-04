"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Offer } from "@duffel/api/types";
import { SELECTION_STORAGE_KEY, type StoredFlightSelection } from "./shared";

interface Props {
  offer: Offer;
}

export default function HydrateAndContinue({ offer }: Props) {
  const router = useRouter();
  const ran = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    try {
      // offer_request_id is on the Duffel response but not in the public SDK type.
      const offerWithRequest = offer as unknown as { offer_request_id?: string };
      const selection: StoredFlightSelection = {
        offer,
        offerRequestId: offerWithRequest.offer_request_id ?? undefined,
      };
      window.sessionStorage.setItem(
        SELECTION_STORAGE_KEY,
        JSON.stringify(selection)
      );
      router.replace("/checkout/flight/travellers");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to start checkout for this offer."
      );
    }
  }, [offer, router]);

  return (
    <main className="page">
      <section className="results-page">
        <div className="results-page-inner">
          <div className="status-card">
            {error ? error : "Loading flight details…"}
          </div>
        </div>
      </section>
    </main>
  );
}
