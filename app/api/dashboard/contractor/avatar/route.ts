import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { avatar_url } = await request.json();
    if (!avatar_url || typeof avatar_url !== "string") {
      return NextResponse.json({ error: "avatar_url is required" }, { status: 400 });
    }

    const admin = createAdminClient();

    const { data: contractor } = await admin
      .from("contractors")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!contractor) return NextResponse.json({ error: "Contractor not found" }, { status: 404 });

    const { error } = await admin
      .from("contractors")
      .update({ avatar_url, updated_at: new Date().toISOString() })
      .eq("id", contractor.id);

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contractor/avatar PATCH]", err);
    return NextResponse.json({ error: "Failed to update avatar" }, { status: 500 });
  }
}
