import { NextRequest, NextResponse } from "next/server";
import { quoteStayRate } from "@/lib/duffel";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { rateId?: string };

    if (!body.rateId || typeof body.rateId !== "string") {
      return NextResponse.json(
        { error: "Quote payload must include the selected rateId." },
        { status: 400 }
      );
    }

    const quote = await quoteStayRate(body.rateId);
    return NextResponse.json({ quote });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to quote stay rate" },
      { status: 400 }
    );
  }
}
