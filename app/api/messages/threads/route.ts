import { NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const userClient = await createClient();
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = createAdminClient();

    // Find which contractor profile this user owns (if any)
    const { data: contractor } = await supabase
      .from("contractors")
      .select("id, company_name")
      .eq("user_id", user.id)
      .single();

    let query;
    if (contractor) {
      // Contractor sees their own threads
      query = supabase
        .from("message_threads")
        .select(`
          id, last_message_at, created_at,
          homeowner:homeowner_id ( id, full_name, email ),
          messages ( id, body, is_read, sender_id, created_at )
        `)
        .eq("contractor_id", contractor.id)
        .order("last_message_at", { ascending: false });
    } else {
      // Homeowner/customer sees their own threads
      query = supabase
        .from("message_threads")
        .select(`
          id, last_message_at, created_at,
          contractor:contractor_id ( id, company_name, email ),
          messages ( id, body, is_read, sender_id, created_at )
        `)
        .eq("homeowner_id", user.id)
        .order("last_message_at", { ascending: false });
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ threads: data ?? [], role: contractor ? "contractor" : "homeowner" });
  } catch (err) {
    console.error("[messages/threads GET]", err);
    return NextResponse.json({ error: "Failed to load threads" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userClient = await createClient();
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { contractor_id } = body;
    if (!contractor_id) return NextResponse.json({ error: "contractor_id required" }, { status: 400 });

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("message_threads")
      .upsert({ homeowner_id: user.id, contractor_id }, { onConflict: "homeowner_id,contractor_id" })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ thread: data });
  } catch (err) {
    console.error("[messages/threads POST]", err);
    return NextResponse.json({ error: "Failed to create thread" }, { status: 500 });
  }
}
