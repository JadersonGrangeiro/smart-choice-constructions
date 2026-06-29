import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendApprovalEmail, sendRejectionEmail } from "@/lib/resend/emails";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, reason } = body as { action: "approve" | "reject" | "suspend" | "unsuspend"; reason?: string };

    // Auth check (middleware already guards /api/admin/*, this is defense in depth)
    const userSupabase = await createClient();
    const { data: { user } } = await userSupabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = createAdminClient();

    // Get contractor
    const { data: contractor } = await supabase
      .from("contractors")
      .select("email, owner_first_name, company_name, status")
      .eq("id", id)
      .single();

    if (!contractor) {
      return NextResponse.json({ error: "Contractor not found" }, { status: 404 });
    }

    let update: Record<string, unknown> = { updated_at: new Date().toISOString() };

    switch (action) {
      case "approve":
        update = { ...update, status: "active", profile_visible: true, approved_at: new Date().toISOString(), rejection_reason: null };
        break;
      case "reject":
        update = { ...update, status: "rejected", profile_visible: false, rejection_reason: reason ?? null };
        break;
      case "suspend":
        update = { ...update, profile_visible: false };
        break;
      case "unsuspend":
        update = { ...update, status: "active", profile_visible: true };
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const { error } = await supabase
      .from("contractors")
      .update(update)
      .eq("id", id);

    if (error) throw error;

    // Update ranking score on approval
    if (action === "approve") {
      await supabase.rpc("compute_ranking_score", { p_contractor_id: id });
    }

    // Send email notifications
    if (action === "approve") {
      await sendApprovalEmail({
        to: contractor.email,
        firstName: contractor.owner_first_name,
        companyName: contractor.company_name,
      }).catch(console.error);
    } else if (action === "reject") {
      await sendRejectionEmail({
        to: contractor.email,
        firstName: contractor.owner_first_name,
        reason,
      }).catch(console.error);
    }

    // Audit log
    await supabase.from("audit_logs").insert({
      admin_id:    user.id,
      action:      `contractor_${action}`,
      entity_type: "contractor",
      entity_id:   id,
      details:     { reason },
    });

    return NextResponse.json({ success: true, action });
  } catch (error) {
    console.error("[admin/contractors/status]", error);
    return NextResponse.json({ error: "Failed to update contractor status" }, { status: 500 });
  }
}
