import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  const lat = req.nextUrl.searchParams.get("lat");
  const lon = req.nextUrl.searchParams.get("lon");

  try {
    if (lat && lon) {
      const url = new URL("https://nominatim.openstreetmap.org/reverse");
      url.searchParams.set("lat", lat);
      url.searchParams.set("lon", lon);
      url.searchParams.set("format", "jsonv2");
      url.searchParams.set("addressdetails", "1");
      const res = await fetch(url.toString(), {
        headers: { "User-Agent": "MyCollegeAdmissionPath/1.0 (college planning website)" },
        cache: "no-store"
      });
      if (!res.ok) throw new Error(`Geocoder returned ${res.status}`);
      const item = await res.json();
      const zip = item.address?.postcode?.split("-")[0] ?? "";
      if (!zip) return NextResponse.json({ error: "Your browser location was found, but a ZIP code could not be resolved. Enter your ZIP manually." }, { status: 422 });
      return NextResponse.json({ label: item.display_name, zip, lat: Number(lat), lon: Number(lon) });
    }

    if (!q) return NextResponse.json({ error: "Enter a U.S. ZIP code or city/state." }, { status: 400 });
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", q);
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("countrycodes", "us");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("limit", "1");
    const res = await fetch(url.toString(), {
      headers: { "User-Agent": "MyCollegeAdmissionPath/1.0 (college planning website)" },
      cache: "no-store"
    });
    if (!res.ok) throw new Error(`Geocoder returned ${res.status}`);
    const items = await res.json();
    if (!Array.isArray(items) || !items.length) return NextResponse.json({ error: "Location not found. Try a ZIP code such as 06074." }, { status: 404 });
    const item = items[0];
    const zip = item.address?.postcode?.split("-")[0] ?? (q.match(/\b\d{5}\b/)?.[0] ?? "");
    if (!zip) return NextResponse.json({ error: "I found the location but could not resolve a ZIP code. Please enter a ZIP code." }, { status: 422 });
    return NextResponse.json({ label: item.display_name, zip, lat: Number(item.lat), lon: Number(item.lon) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Location lookup failed." }, { status: 502 });
  }
}
