import { NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status   = searchParams.get("status") ?? "active";
    const q        = searchParams.get("q") ?? "";
    const page     = parseInt(searchParams.get("page") ?? "1");
    const limit    = parseInt(searchParams.get("limit") ?? "100");
    const offset   = (page - 1) * limit;

    const supabase = createAdminClient();

    let query = supabase
      .from("suppliers")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status !== "all") query = query.eq("status", status);
    if (q) query = query.or(`company_name.ilike.%${q}%,category.ilike.%${q}%,city.ilike.%${q}%`);

    const { data, count, error } = await query;
    if (error) throw error;

    return NextResponse.json({ suppliers: data ?? [], total: count ?? 0 });
  } catch (err) {
    console.error("[admin/suppliers GET]", err);
    return NextResponse.json({ error: "Failed to load suppliers" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userClient = await createClient();
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { company_name, category, sub_category, email, phone, website,
            description, state_code, city, address, is_featured } = body;

    if (!company_name || !category) {
      return NextResponse.json({ error: "company_name and category are required" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("suppliers")
      .insert({
        company_name, category, sub_category: sub_category || null,
        email: email || null, phone: phone || null, website: website || null,
        description: description || null,
        state_code: state_code || null, city: city || null,
        address: address || null,
        is_featured: is_featured ?? false,
        status: "active",
      })
      .select()
      .single();

    if (error) throw error;

    await supabase.from("audit_logs").insert({
      admin_id: user.id,
      action: "supplier_create",
      entity_type: "supplier",
      entity_id: data.id,
      details: { company_name, category },
    });

    return NextResponse.json({ supplier: data });
  } catch (err) {
    console.error("[admin/suppliers POST]", err);
    return NextResponse.json({ error: "Failed to create supplier" }, { status: 500 });
  }
}
