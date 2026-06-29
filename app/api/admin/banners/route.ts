import { NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const SETTING_KEY = "banners";

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("platform_settings")
      .select("value")
      .eq("key", SETTING_KEY)
      .single();

    if (error && error.code !== "PGRST116") throw error;

    const banners = data ? JSON.parse(data.value) : [];
    return NextResponse.json({ banners });
  } catch (err) {
    console.error("[admin/banners GET]", err);
    return NextResponse.json({ error: "Failed to load banners" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const userClient = await createClient();
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { banners } = body;

    if (!Array.isArray(banners)) {
      return NextResponse.json({ error: "banners must be an array" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("platform_settings")
      .upsert({
        key: SETTING_KEY,
        value: JSON.stringify(banners),
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;

    return NextResponse.json({ ok: true, count: banners.length });
  } catch (err) {
    console.error("[admin/banners PUT]", err);
    return NextResponse.json({ error: "Failed to save banners" }, { status: 500 });
  }
}
