import { NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const userClient = await createClient();
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = createAdminClient();

    const [
      { count: totalContractors },
      { count: activeContractors },
      { count: totalQuotes },
      { count: totalReviews },
      { data: revenueData },
      { data: categoryData },
      { data: stateData },
    ] = await Promise.all([
      supabase.from("contractors").select("*", { count: "exact", head: true }),
      supabase.from("contractors").select("*", { count: "exact", head: true }).eq("status", "active"),
      supabase.from("quote_requests").select("*", { count: "exact", head: true }),
      supabase.from("reviews").select("*", { count: "exact", head: true }),
      // Monthly revenue from payment_events (last 6 months)
      supabase
        .from("payment_events")
        .select("amount_cents, created_at")
        .eq("status", "succeeded")
        .gte("created_at", new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString())
        .order("created_at", { ascending: true }),
      // Contractors by category
      supabase
        .from("contractors")
        .select("category")
        .eq("status", "active"),
      // Contractors by state
      supabase
        .from("contractors")
        .select("state_code")
        .eq("status", "active"),
    ]);

    // Aggregate monthly revenue
    const monthlyRevenue: Record<string, { revenue: number; contractors: number }> = {};
    (revenueData ?? []).forEach((ev: { amount_cents: number | null; created_at: string }) => {
      const month = new Date(ev.created_at).toLocaleString("en-US", { month: "short", year: "2-digit" });
      if (!monthlyRevenue[month]) monthlyRevenue[month] = { revenue: 0, contractors: 0 };
      monthlyRevenue[month].revenue += (ev.amount_cents ?? 0) / 100;
    });

    const revenueMonthly = Object.entries(monthlyRevenue).map(([month, v]) => ({
      month,
      revenue: Math.round(v.revenue * 100) / 100,
    }));

    // Category breakdown
    const categoryCount: Record<string, number> = {};
    (categoryData ?? []).forEach((c: { category: string | null }) => {
      if (c.category) categoryCount[c.category] = (categoryCount[c.category] ?? 0) + 1;
    });
    const topCategories = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([category, contractors]) => ({ category, contractors, leads: 0, conversionPct: 0 }));

    // State breakdown
    const stateCount: Record<string, number> = {};
    (stateData ?? []).forEach((c: { state_code: string | null }) => {
      if (c.state_code) stateCount[c.state_code] = (stateCount[c.state_code] ?? 0) + 1;
    });
    const topStates = Object.entries(stateCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([state, contractors]) => ({ state, contractors, leads: 0, revenue: 0 }));

    return NextResponse.json({
      summary: {
        totalContractors: totalContractors ?? 0,
        activeContractors: activeContractors ?? 0,
        totalQuotes: totalQuotes ?? 0,
        totalReviews: totalReviews ?? 0,
      },
      revenueMonthly,
      topCategories,
      topStates,
    });
  } catch (err) {
    console.error("[admin/reports GET]", err);
    return NextResponse.json({ error: "Failed to load reports" }, { status: 500 });
  }
}
