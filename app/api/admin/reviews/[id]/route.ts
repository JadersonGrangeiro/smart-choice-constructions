import { NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { action, flag_reason, admin_note } = await request.json() as {
      action: "publish" | "flag" | "remove";
      flag_reason?: string;
      admin_note?: string;
    };

    const userClient = await createClient();
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = createAdminClient();

    const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (action === "publish") { update.is_published = true;  update.is_flagged = false; }
    if (action === "flag")    { update.is_flagged   = true;  update.flag_reason = flag_reason ?? null; }
    if (action === "remove")  { update.is_published = false; }
    if (admin_note !== undefined) update.admin_note = admin_note;

    const { error } = await supabase.from("reviews").update(update).eq("id", id);
    if (error) throw error;

    await supabase.from("audit_logs").insert({
      admin_id: user.id,
      action: `review_${action}`,
      entity_type: "review",
      entity_id: id,
      details: { flag_reason, admin_note },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/reviews PATCH]", err);
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
  }
}
