import { NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("contractors")
      .select(`
        id, company_name, owner_first_name, owner_last_name,
        email, phone, category, state_code, city, status,
        description, website, profile_visible,
        license_number, insurance_number,
        is_licensed, is_insured, years_experience,
        ranking_score, created_at, approved_at,
        contractor_photos(id, photo_url, caption, display_order),
        contractor_subscriptions(status, current_period_end)
      `)
      .eq("id", id)
      .single();

    if (error) throw error;
    return NextResponse.json({ contractor: data });
  } catch (err) {
    console.error("[admin/contractors/:id GET]", err);
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userClient = await createClient();
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const allowed = [
      "company_name", "owner_first_name", "owner_last_name",
      "phone", "category", "state_code", "city", "description", "website",
      "license_number", "insurance_number",
      "is_licensed", "is_insured", "years_experience", "profile_visible",
    ];

    const updates: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in body) updates[key] = body[key];
    }
    updates.updated_at = new Date().toISOString();

    const supabase = createAdminClient();
    const { error } = await supabase.from("contractors").update(updates).eq("id", id);
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/contractors/:id PATCH]", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userClient = await createClient();
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = createAdminClient();
    const { error } = await supabase.from("contractors").update({ status: "rejected", profile_visible: false }).eq("id", id);
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/contractors/:id DELETE]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
