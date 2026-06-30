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
    const category    = searchParams.get("category");
    const state       = searchParams.get("state");
    const city        = searchParams.get("city");
    const zip         = searchParams.get("zip");
    const minRating   = parseFloat(searchParams.get("minRating") ?? "0");
    const licensed    = searchParams.get("licensed") === "true";
    const insured     = searchParams.get("insured") === "true";
    const emergency   = searchParams.get("emergency") === "true";
    const q           = searchParams.get("q");
    const sort        = searchParams.get("sort") ?? "ranking";
    const page        = parseInt(searchParams.get("page") ?? "1");
    const limit       = parseInt(searchParams.get("limit") ?? "20");
    const offset      = (page - 1) * limit;

    const supabase = createAdminClient();

    let query = supabase
      .from("contractors")
      .select(`
        id, company_name, owner_first_name, owner_last_name,
        category, state_code, city, zip_code,
        description, website, avatar_url,
        license_number, insurance_number,
        is_licensed, is_insured, is_background_checked,
        years_experience, has_emergency,
        service_radius, additional_states,
        ranking_score, response_time_hours,
        working_days, open_time, close_time,
        created_at,
        contractor_photos(public_url, sort_order),
        reviews(rating)
      `, { count: "exact" })
      .eq("profile_visible", true)
      .eq("status", "active");

    if (category) query = query.eq("category", category);
    if (state)    query = query.or(`state_code.eq.${state.toUpperCase()},additional_states.cs.{${state.toUpperCase()}}`);
    if (city)     query = query.ilike("city", `%${city}%`);
    if (licensed) query = query.eq("is_licensed", true);
    if (insured)  query = query.eq("is_insured", true);
    if (emergency)query = query.eq("has_emergency", true);

    if (q) {
      query = query.or(`company_name.ilike.%${q}%,category.ilike.%${q}%,city.ilike.%${q}%`);
    }

    // Sorting
    switch (sort) {
      case "rating":
        query = query.order("ranking_score", { ascending: false });
        break;
      case "newest":
        query = query.order("created_at", { ascending: false });
        break;
      case "experience":
        query = query.order("years_experience", { ascending: false });
        break;
      default:
        query = query.order("ranking_score", { ascending: false });
    }

    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) throw error;

    // Compute avg_rating from joined reviews
    const contractors = (data ?? []).map((c: {
      reviews?: { rating: number }[];
      [key: string]: unknown;
    }) => {
      const reviews = c.reviews as { rating: number }[] ?? [];
      const avg_rating = reviews.length > 0
        ? reviews.reduce((s: number, r: { rating: number }) => s + r.rating, 0) / reviews.length
        : null;
      return { ...c, avg_rating: avg_rating ? parseFloat(avg_rating.toFixed(1)) : null, review_count: reviews.length };
    });

    return NextResponse.json({
      contractors,
      total: count ?? 0,
      page,
      limit,
    });
  } catch (error) {
    console.error("[contractors/search]", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
