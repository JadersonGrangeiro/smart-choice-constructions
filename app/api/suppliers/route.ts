import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { rateLimit, getIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const rl = rateLimit(getIp(request), 60, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many requests." }, {
      status: 429, headers: { "Retry-After": String(rl.retryAfter) },
    });
  }

  try {
    const { searchParams } = new URL(request.url);
    const category   = searchParams.get("category");
    const state      = searchParams.get("state");
    const city       = searchParams.get("city");
    const featured   = searchParams.get("featured") === "true";
    const q          = searchParams.get("q");
    const limit      = parseInt(searchParams.get("limit") ?? "50");

    const supabase = createAdminClient();

    let query = supabase
      .from("suppliers")
      .select("id, company_name, category, sub_category, description, city, state_code, website, phone, logo_url, is_featured")
      .eq("status", "active")
      .order("is_featured", { ascending: false })
      .order("company_name")
      .limit(limit);

    if (category) query = query.eq("category", category);
    if (state)    query = query.eq("state_code", state.toUpperCase());
    if (city)     query = query.ilike("city", `%${city}%`);
    if (featured) query = query.eq("is_featured", true);
    if (q)        query = query.or(`company_name.ilike.%${q}%,category.ilike.%${q}%,description.ilike.%${q}%`);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ suppliers: data ?? [] });
  } catch (err) {
    console.error("[suppliers GET]", err);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
