import { NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userClient = await createClient();
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { url, caption } = await req.json();
    if (!url) return NextResponse.json({ error: "URL required" }, { status: 400 });

    const supabase = createAdminClient();

    const { data: existing } = await supabase
      .from("contractor_photos")
      .select("sort_order")
      .eq("contractor_id", id)
      .order("sort_order", { ascending: false })
      .limit(1);

    const nextOrder = (existing?.[0]?.sort_order ?? -1) + 1;

    const { data, error } = await supabase
      .from("contractor_photos")
      .insert({ contractor_id: id, storage_path: url, public_url: url, caption: caption ?? null, sort_order: nextOrder })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ photo: data });
  } catch (err) {
    console.error("[admin/contractors/:id/photos POST]", err);
    return NextResponse.json({ error: "Failed to add photo" }, { status: 500 });
  }
}
