import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") ?? "all";
    const page   = parseInt(searchParams.get("page") ?? "1");
    const limit  = parseInt(searchParams.get("limit") ?? "50");
    const offset = (page - 1) * limit;

    const supabase = createAdminClient();

    let query = supabase
      .from("reviews")
      .select(`
        id, reviewer_name, rating, title, body, project_type,
        is_verified, is_flagged, flag_reason, is_published, admin_note,
        created_at,
        contractors(id, company_name)
      `, { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (filter === "flagged")   query = query.eq("is_flagged", true);
    if (filter === "published") query = query.eq("is_published", true).eq("is_flagged", false);
    if (filter === "removed")   query = query.eq("is_published", false);

    const { data, count, error } = await query;
    if (error) throw error;

    return NextResponse.json({ reviews: data ?? [], total: count ?? 0 });
  } catch (err) {
    console.error("[admin/reviews GET]", err);
    return NextResponse.json({ error: "Failed to load reviews" }, { status: 500 });
  }
}
