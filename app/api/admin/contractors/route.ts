import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") ?? "pending_approval";
    const page   = parseInt(searchParams.get("page") ?? "1");
    const limit  = parseInt(searchParams.get("limit") ?? "20");
    const offset = (page - 1) * limit;

    const supabase = createAdminClient();

    let query = supabase
      .from("contractors")
      .select(`
        id, company_name, owner_first_name, owner_last_name,
        email, phone, category, state_code, city, status,
        profile_visible, license_number, insurance_number,
        is_licensed, is_insured, years_experience,
        ranking_score, created_at, approved_at,
        contractor_subscriptions(status, current_period_end, failed_payment_count),
        contractor_photos(id)
      `, { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status !== "all") {
      query = query.eq("status", status);
    }

    const { data, count, error } = await query;

    if (error) throw error;

    return NextResponse.json({ contractors: data ?? [], total: count ?? 0, page, limit });
  } catch (error) {
    console.error("[admin/contractors GET]", error);
    return NextResponse.json({ error: "Failed to load contractors" }, { status: 500 });
  }
}
