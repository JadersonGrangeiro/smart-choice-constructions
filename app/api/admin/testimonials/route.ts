import { NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const SETTING_KEY = "testimonials";

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("platform_settings")
      .select("value")
      .eq("key", SETTING_KEY)
      .single();

    if (error && error.code !== "PGRST116") throw error;

    const testimonials = data ? JSON.parse(data.value) : [];
    return NextResponse.json({ testimonials });
  } catch (err) {
    console.error("[admin/testimonials GET]", err);
    return NextResponse.json({ error: "Failed to load testimonials" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const userClient = await createClient();
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { testimonials } = body;

    if (!Array.isArray(testimonials)) {
      return NextResponse.json({ error: "testimonials must be an array" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("platform_settings")
      .upsert({
        key: SETTING_KEY,
        value: JSON.stringify(testimonials),
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;

    return NextResponse.json({ ok: true, count: testimonials.length });
  } catch (err) {
    console.error("[admin/testimonials PUT]", err);
    return NextResponse.json({ error: "Failed to save testimonials" }, { status: 500 });
  }
}
