import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { review_id, reply } = await request.json();
    if (!review_id || typeof reply !== "string") {
      return NextResponse.json({ error: "review_id and reply are required" }, { status: 400 });
    }

    const admin = createAdminClient();

    const { data: contractor } = await admin
      .from("contractors")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!contractor) return NextResponse.json({ error: "Contractor not found" }, { status: 404 });

    const { data: review } = await admin
      .from("reviews")
      .select("id")
      .eq("id", review_id)
      .eq("contractor_id", contractor.id)
      .single();

    if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });

    const { error } = await admin
      .from("reviews")
      .update({
        contractor_reply:    reply.trim() || null,
        contractor_reply_at: reply.trim() ? new Date().toISOString() : null,
      })
      .eq("id", review_id);

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contractor/reviews PATCH]", err);
    return NextResponse.json({ error: "Failed to save reply" }, { status: 500 });
  }
}
