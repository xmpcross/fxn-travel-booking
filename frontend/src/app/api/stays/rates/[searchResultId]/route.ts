import { NextRequest, NextResponse } from "next/server";
import { fetchStayRates } from "@/lib/duffel";

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ searchResultId: string }> }
) {
  try {
    const { searchResultId } = await context.params;
    const rates = await fetchStayRates(searchResultId);
    return NextResponse.json({ rates });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to fetch rates" },
      { status: 400 }
    );
  }
}
