import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createAdminClient();
    const now      = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const firstOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();

    // Run all queries in parallel
    const [
      { count: totalContractors },
      { count: activeContractors },
      { count: pendingContractors },
      { count: suspendedContractors },
      { count: canceledContractors },
      { count: newThisMonth },
      { count: totalHomeowners },
      { count: newHomeownersThisMonth },
      { data: reviewStats },
      { data: revenueThis },
      { data: revenueLast },
    ] = await Promise.all([
      supabase.from("contractors").select("*", { count: "exact", head: true }),
      supabase.from("contractors").select("*", { count: "exact", head: true }).eq("status", "active"),
      supabase.from("contractors").select("*", { count: "exact", head: true }).in("status", ["pending_approval"]),
      supabase.from("contractors").select("*", { count: "exact", head: true }).eq("status", "suspended"),
      supabase.from("contractors").select("*", { count: "exact", head: true }).eq("status", "canceled"),
      supabase.from("contractors").select("*", { count: "exact", head: true }).gte("created_at", firstOfMonth),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "customer"),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "customer").gte("created_at", firstOfMonth),
      supabase.from("reviews").select("rating").eq("is_published", true),
      supabase.from("payment_events").select("amount_cents").eq("status", "succeeded").gte("created_at", firstOfMonth),
      supabase.from("payment_events").select("amount_cents").eq("status", "succeeded").gte("created_at", firstOfLastMonth).lt("created_at", firstOfMonth),
    ]);

    const avgRating = reviewStats && reviewStats.length > 0
      ? reviewStats.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviewStats.length
      : 0;

    const mrrCents   = revenueThis?.reduce((s: number, p: { amount_cents: number }) => s + (p.amount_cents ?? 0), 0) ?? 0;
    const lastMrCents = revenueLast?.reduce((s: number, p: { amount_cents: number }) => s + (p.amount_cents ?? 0), 0) ?? 0;
    const mrr        = mrrCents / 100;
    const lastMr     = lastMrCents / 100;
    const growthPct  = lastMr > 0 ? ((mrr - lastMr) / lastMr) * 100 : 0;

    return NextResponse.json({
      contractors: {
        total:          totalContractors ?? 0,
        active:         activeContractors ?? 0,
        pending:        pendingContractors ?? 0,
        suspended:      suspendedContractors ?? 0,
        canceled:       canceledContractors ?? 0,
        new_this_month: newThisMonth ?? 0,
      },
      revenue: {
        mrr:         mrr,
        arr:         mrr * 12,
        this_month:  mrr,
        last_month:  lastMr,
        growth_pct:  parseFloat(growthPct.toFixed(2)),
      },
      homeowners: {
        total:          totalHomeowners ?? 0,
        new_this_month: newHomeownersThisMonth ?? 0,
      },
      platform: {
        avg_rating:            parseFloat(avgRating.toFixed(2)),
        reviews_total:         reviewStats?.length ?? 0,
        quote_requests_total:  0,
      },
    });
  } catch (error) {
    console.error("[admin/stats]", error);
    return NextResponse.json({ error: "Failed to load stats" }, { status: 500 });
  }
}
