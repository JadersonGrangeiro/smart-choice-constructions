// GET  /api/v1/me  — current authenticated user profile
// PUT  /api/v1/me  — update name, phone, avatar_url
//
// Mobile apps call GET /api/v1/me after login to hydrate local state.
// Accepts: Authorization: Bearer <supabase_access_token>

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (!user || error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, full_name, email, phone, avatar_url, created_at, updated_at")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  // Attach role-specific data
  let roleData: Record<string, unknown> = {};

  if (profile.role === "contractor") {
    const { data: contractor } = await supabase
      .from("contractors")
      .select("id, company_name, status, profile_visible, ranking_score, city, state_code")
      .eq("id", user.id)
      .single();
    if (contractor) roleData = { contractor };
  }

  if (profile.role === "customer") {
    const { data: homeowner } = await supabase
      .from("homeowners")
      .select("zip_code, city, state_code")
      .eq("id", user.id)
      .single();
    if (homeowner) roleData = { homeowner };
  }

  return NextResponse.json({ profile: { ...profile, ...roleData } });
}

export async function PUT(request: Request) {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (!user || error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const allowed = ["full_name", "phone", "avatar_url"] as const;
  const updates: Partial<Record<typeof allowed[number], string>> = {};

  for (const key of allowed) {
    if (key in body && typeof body[key] === "string") {
      updates[key] = body[key];
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ updated: true });
}
