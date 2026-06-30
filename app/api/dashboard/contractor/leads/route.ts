import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { quote_id, status } = await request.json();
    if (!quote_id || !status) return NextResponse.json({ error: "quote_id and status required" }, { status: 400 });

    const VALID = ["pending","viewed","responded","completed","declined"];
    if (!VALID.includes(status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });

    const admin = createAdminClient();

    const { data: contractor } = await admin
      .from("contractors")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!contractor) return NextResponse.json({ error: "Contractor not found" }, { status: 404 });

    const { error } = await admin
      .from("quote_requests")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", quote_id)
      .eq("contractor_id", contractor.id);

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contractor/leads PATCH]", err);
    return NextResponse.json({ error: "Failed to update lead" }, { status: 500 });
  }
}
