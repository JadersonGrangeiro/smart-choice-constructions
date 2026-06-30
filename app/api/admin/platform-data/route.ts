import { NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const ALLOWED_KEYS = [
  "feature_flags",
  "campaigns",
  "coupons",
  "notifications",
  "email_templates",
  "blog_posts",
  "faq_items",
  "categories_override",
  "crm_contacts",
  "crm_interactions",
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");
    if (!key || !ALLOWED_KEYS.includes(key)) {
      return NextResponse.json({ error: "Invalid key" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("platform_settings")
      .select("value")
      .eq("key", key)
      .single();

    if (error && error.code !== "PGRST116") throw error;

    const value = data?.value ? JSON.parse(data.value) : null;
    return NextResponse.json({ key, value });
  } catch (err) {
    console.error("[platform-data GET]", err);
    return NextResponse.json({ error: "Failed to load" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const userClient = await createClient();
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { key, value } = body;

    if (!key || !ALLOWED_KEYS.includes(key)) {
      return NextResponse.json({ error: "Invalid key" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase.from("platform_settings").upsert({
      key,
      value: JSON.stringify(value),
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    });

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[platform-data PUT]", err);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
