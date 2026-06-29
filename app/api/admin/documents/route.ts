import { NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const userClient = await createClient();
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") ?? "all";

    const supabase = createAdminClient();

    let query = supabase
      .from("contractor_documents")
      .select(`
        *,
        contractors (
          id,
          company_name,
          email,
          owner_first_name,
          owner_last_name
        )
      `)
      .order("created_at", { ascending: false });

    if (status !== "all") query = query.eq("status", status);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ documents: data ?? [] });
  } catch (err) {
    console.error("[admin/documents GET]", err);
    return NextResponse.json({ error: "Failed to load documents" }, { status: 500 });
  }
}
