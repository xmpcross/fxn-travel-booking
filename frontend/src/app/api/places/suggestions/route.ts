import { NextRequest, NextResponse } from "next/server";

const DUFFEL_API_BASE_URL = "https://api.duffel.com";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (query.length < 2) {
    return NextResponse.json({ data: [] });
  }

  const token = process.env.DUFFEL_ACCESS_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "Missing DUFFEL_ACCESS_TOKEN" },
      { status: 500 }
    );
  }

  const upstreamUrl = new URL(`${DUFFEL_API_BASE_URL}/places/suggestions`);
  upstreamUrl.searchParams.set("query", query);

  const upstream = await fetch(upstreamUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Duffel-Version": "v2",
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!upstream.ok) {
    const text = await upstream.text();
    return NextResponse.json(
      { error: text || "Upstream error" },
      { status: upstream.status }
    );
  }

  const payload = await upstream.json();
  return NextResponse.json(payload, {
    headers: { "Cache-Control": "private, max-age=300" },
  });
}
