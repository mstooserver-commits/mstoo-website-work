import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const NOMINATIM = "https://nominatim.openstreetmap.org";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query")?.trim();
  const lat = request.nextUrl.searchParams.get("lat");
  const lng = request.nextUrl.searchParams.get("lng");
  const url = query
    ? `${NOMINATIM}/search?format=jsonv2&addressdetails=1&countrycodes=in&limit=8&q=${encodeURIComponent(query)}`
    : lat && lng
      ? `${NOMINATIM}/reverse?format=jsonv2&addressdetails=1&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}`
      : "";

  if (!url) return NextResponse.json({ message: "Location query is required" }, { status: 400 });

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json", "User-Agent": "MSTOO-Web/1.0" },
      next: { revalidate: query ? 3600 : 300 },
    });
    if (!response.ok) throw new Error("Location provider unavailable");
    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ message: "Could not search locations" }, { status: 502 });
  }
}
