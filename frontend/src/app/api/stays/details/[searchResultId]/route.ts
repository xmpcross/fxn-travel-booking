import { NextRequest, NextResponse } from "next/server";
import { fetchStayDetails } from "@/lib/duffel";

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ searchResultId: string }> }
) {
  try {
    const { searchResultId } = await context.params;
    const details = await fetchStayDetails(searchResultId);
    return NextResponse.json({ details });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to fetch stay details" },
      { status: 400 }
    );
  }
}
