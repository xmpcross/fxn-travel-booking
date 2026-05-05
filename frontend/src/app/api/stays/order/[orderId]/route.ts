import { NextRequest, NextResponse } from "next/server";
import { getStayBooking } from "@/lib/duffel";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await context.params;

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId in URL." }, { status: 400 });
    }

    const booking = await getStayBooking(orderId);
    return NextResponse.json({ booking });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load stay booking" },
      { status: 400 }
    );
  }
}
