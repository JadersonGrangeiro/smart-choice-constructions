import { NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const userClient = await createClient();
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, role, created_at, updated_at")
      .in("role", ["admin"])
      .order("created_at", { ascending: true });

    if (error) throw error;

    // Count audit log actions per admin
    const adminIds = (data ?? []).map((a: { id: string }) => a.id);
    const { data: auditData } = await supabase
      .from("audit_logs")
      .select("admin_id")
      .in("admin_id", adminIds);

    const actionCounts: Record<string, number> = {};
    (auditData ?? []).forEach((log: { admin_id: string | null }) => {
      if (log.admin_id) actionCounts[log.admin_id] = (actionCounts[log.admin_id] ?? 0) + 1;
    });

    const admins = (data ?? []).map((a: { id: string; full_name: string | null; email: string; role: string; created_at: string; updated_at: string }) => ({
      ...a,
      actions: actionCounts[a.id] ?? 0,
      status: "active",
    }));

    return NextResponse.json({ admins });
  } catch (err) {
    console.error("[admin/admins GET]", err);
    return NextResponse.json({ error: "Failed to load admins" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userClient = await createClient();
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { email, full_name, role } = body;

    if (!email || !full_name || !role) {
      return NextResponse.json({ error: "email, full_name and role are required" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Check if user already exists
    const { data: existing } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("email", email)
      .single();

    if (existing) {
      // Update role if user already exists
      const { data, error } = await supabase
        .from("profiles")
        .update({ role, full_name, updated_at: new Date().toISOString() })
        .eq("id", existing.id)
        .select()
        .single();

      if (error) throw error;

      await supabase.from("audit_logs").insert({
        admin_id: user.id,
        action: "admin_role_updated",
        entity_type: "profile",
        entity_id: existing.id,
        details: { email, role, previous_role: existing.role },
      });

      return NextResponse.json({ admin: data, created: false });
    }

    // Invite new user via Supabase Admin Auth
    const { data: invited, error: inviteErr } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: { full_name, role },
    });

    if (inviteErr) throw inviteErr;

    // Profile is created by trigger, but update role immediately
    await supabase
      .from("profiles")
      .update({ role, full_name })
      .eq("email", email);

    await supabase.from("audit_logs").insert({
      admin_id: user.id,
      action: "admin_invited",
      entity_type: "profile",
      entity_id: invited.user?.id ?? "",
      details: { email, role },
    });

    return NextResponse.json({ admin: { email, full_name, role }, created: true });
  } catch (err) {
    console.error("[admin/admins POST]", err);
    return NextResponse.json({ error: "Failed to create admin" }, { status: 500 });
  }
}
