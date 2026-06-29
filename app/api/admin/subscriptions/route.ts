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
      .from("contractor_subscriptions")
      .select(`
        id, stripe_subscription_id, stripe_price_id, status,
        current_period_start, current_period_end,
        cancel_at_period_end, failed_payment_count,
        suspended_at, canceled_at, created_at,
        contractors(id, company_name, owner_first_name, owner_last_name, category, city, state_code, email)
      `, { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (filter !== "all") query = query.eq("status", filter);

    const { data, count, error } = await query;
    if (error) throw error;

    const MONTHLY_PRICE = 49.90;
    const subs = (data ?? []) as any[];

    const stats = {
      mrr:     subs.filter(s => s.status === "active").length * MONTHLY_PRICE,
      active:  subs.filter(s => s.status === "active").length,
      past_due:subs.filter(s => s.status === "past_due").length,
      canceled:subs.filter(s => s.status === "canceled").length,
      total:   count ?? 0,
    };

    return NextResponse.json({ subscriptions: subs, stats, total: count ?? 0 });
  } catch (err) {
    console.error("[admin/subscriptions GET]", err);
    return NextResponse.json({ error: "Failed to load subscriptions" }, { status: 500 });
  }
}
