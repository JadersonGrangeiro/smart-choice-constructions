import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendNewReviewEmail } from "@/lib/resend/emails";
import { rateLimit, getIp } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const contractorId = searchParams.get("contractor_id");

  if (!contractorId) {
    return NextResponse.json({ error: "contractor_id required" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("id, reviewer_name, rating, title, body, project_type, is_verified, created_at")
    .eq("contractor_id", contractorId)
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ reviews: data ?? [] });
}

export async function POST(request: Request) {
  const rl = rateLimit(getIp(request), 10, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many requests. Please wait a minute." }, {
      status: 429, headers: { "Retry-After": String(rl.retryAfter) },
    });
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await request.json();
    const { contractor_id, rating, title, body: reviewBody, reviewer_name, project_type } = body;

    if (!contractor_id || !rating || !reviewBody || !reviewer_name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be 1-5" }, { status: 400 });
    }

    const adminSupabase = createAdminClient();

    const { data, error } = await adminSupabase
      .from("reviews")
      .insert({
        contractor_id,
        homeowner_id: user?.id ?? null,
        reviewer_name,
        rating,
        title: title || null,
        body: reviewBody,
        project_type: project_type || null,
        is_verified: !!user,
        is_published: true,
      })
      .select("id")
      .single();

    if (error) throw error;

    // Refresh contractor ranking score
    await adminSupabase.rpc("compute_ranking_score", { p_contractor_id: contractor_id });

    // Notify contractor of new review (fire-and-forget)
    void (async () => {
      try {
        const { data: contractor } = await adminSupabase
          .from("contractors")
          .select("email, owner_first_name")
          .eq("id", contractor_id)
          .single();
        if (contractor) {
          await sendNewReviewEmail({
            to:             contractor.email,
            contractorName: contractor.owner_first_name,
            reviewerName:   reviewer_name,
            rating,
            reviewBody,
          });
        }
      } catch { /* ignore email errors */ }
    })();

    return NextResponse.json({ review: data }, { status: 201 });
  } catch (error) {
    console.error("[reviews POST]", error);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
