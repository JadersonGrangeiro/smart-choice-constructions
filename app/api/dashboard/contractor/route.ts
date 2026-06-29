import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = createAdminClient();

    // Get contractor record
    const { data: contractor, error: contractorError } = await admin
      .from("contractors")
      .select(`
        id, company_name, owner_first_name, status, profile_visible,
        category, state_code, city, ranking_score, avatar_url,
        is_licensed, is_insured, is_background_checked,
        contractor_subscriptions(status, current_period_end, cancel_at_period_end, failed_payment_count),
        contractor_photos(id, public_url, sort_order)
      `)
      .eq("user_id", user.id)
      .single();

    if (contractorError || !contractor) {
      return NextResponse.json({ error: "Contractor profile not found" }, { status: 404 });
    }

    // Get quote requests
    const { data: quotes, count: quoteCount } = await admin
      .from("quote_requests")
      .select("id, service_type, contact_name, city, state_code, status, created_at", { count: "exact" })
      .eq("contractor_id", contractor.id)
      .order("created_at", { ascending: false })
      .limit(10);

    // Get reviews
    const { data: reviews, count: reviewCount } = await admin
      .from("reviews")
      .select("id, rating, reviewer_name, body, created_at", { count: "exact" })
      .eq("contractor_id", contractor.id)
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(5);

    const avgRating = reviews && reviews.length > 0
      ? reviews.reduce((s: number, r: { rating: number }) => s + r.rating, 0) / reviews.length
      : null;

    // Recent payment events
    const { data: payments } = await admin
      .from("payment_events")
      .select("id, event_type, amount_cents, status, created_at, failure_reason")
      .eq("contractor_id", contractor.id)
      .order("created_at", { ascending: false })
      .limit(10);

    return NextResponse.json({
      contractor,
      stats: {
        quote_requests:    quoteCount ?? 0,
        total_reviews:     reviewCount ?? 0,
        avg_rating:        avgRating ? parseFloat(avgRating.toFixed(1)) : null,
        profile_views:     0, // TODO: implement view tracking
        ranking_score:     contractor.ranking_score,
      },
      recent_quotes:  quotes ?? [],
      recent_reviews: reviews ?? [],
      payments:       payments ?? [],
    });
  } catch (error) {
    console.error("[dashboard/contractor]", error);
    return NextResponse.json({ error: "Failed to load dashboard" }, { status: 500 });
  }
}
