import { NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const EDITABLE_KEYS = [
  "maintenance_mode",
  "signup_enabled",
  "contractor_signup_enabled",
  "first_month_price_cents",
  "monthly_price_cents",
  "grace_period_days",
  "deactivation_days",
];

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("platform_settings")
      .select("key, value, updated_at")
      .in("key", EDITABLE_KEYS);

    if (error) throw error;

    const settings: Record<string, string> = {};
    (data ?? []).forEach((row: { key: string; value: string }) => { settings[row.key] = row.value; });

    return NextResponse.json({ settings });
  } catch (err) {
    console.error("[admin/settings GET]", err);
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const userClient = await createClient();
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const supabase = createAdminClient();

    const updates = Object.entries(body)
      .filter(([key]) => EDITABLE_KEYS.includes(key))
      .map(([key, value]) => ({
        key,
        value: String(value),
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      }));

    if (updates.length === 0) {
      return NextResponse.json({ error: "No valid settings to update" }, { status: 400 });
    }

    const { error } = await supabase.from("platform_settings").upsert(updates);
    if (error) throw error;

    await supabase.from("audit_logs").insert({
      admin_id: user.id,
      action: "settings_updated",
      entity_type: "platform_settings",
      entity_id: "platform",
      details: body,
    });

    return NextResponse.json({ ok: true, updated: updates.length });
  } catch (err) {
    console.error("[admin/settings PATCH]", err);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
