import { NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userClient = await createClient();
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    if (id === user.id) return NextResponse.json({ error: "Cannot modify your own account" }, { status: 403 });

    const body = await request.json();
    const { role, full_name } = body;

    const supabase = createAdminClient();

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (role) updates.role = role;
    if (full_name) updates.full_name = full_name;

    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    await supabase.from("audit_logs").insert({
      admin_id: user.id,
      action: "admin_updated",
      entity_type: "profile",
      entity_id: id,
      details: updates,
    });

    return NextResponse.json({ admin: data });
  } catch (err) {
    console.error("[admin/admins PATCH]", err);
    return NextResponse.json({ error: "Failed to update admin" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userClient = await createClient();
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    if (id === user.id) return NextResponse.json({ error: "Cannot remove yourself" }, { status: 403 });

    const supabase = createAdminClient();

    // Downgrade to customer instead of deleting the account
    const { error } = await supabase
      .from("profiles")
      .update({ role: "customer", updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;

    await supabase.from("audit_logs").insert({
      admin_id: user.id,
      action: "admin_removed",
      entity_type: "profile",
      entity_id: id,
      details: {},
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/admins DELETE]", err);
    return NextResponse.json({ error: "Failed to remove admin" }, { status: 500 });
  }
}
