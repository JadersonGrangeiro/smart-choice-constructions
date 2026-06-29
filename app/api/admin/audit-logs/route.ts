import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const entity_type = searchParams.get("entity_type");
    const q     = searchParams.get("q") ?? "";
    const page  = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "100");
    const offset = (page - 1) * limit;

    const supabase = createAdminClient();

    let query = supabase
      .from("audit_logs")
      .select(`
        id, action, entity_type, entity_id, details, ip_address, created_at,
        profiles(full_name, email, role)
      `, { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (entity_type) query = query.eq("entity_type", entity_type);
    if (q) query = query.or(`action.ilike.%${q}%,entity_type.ilike.%${q}%,entity_id.ilike.%${q}%`);

    const { data, count, error } = await query;
    if (error) throw error;

    return NextResponse.json({ logs: data ?? [], total: count ?? 0 });
  } catch (err) {
    console.error("[admin/audit-logs GET]", err);
    return NextResponse.json({ error: "Failed to load audit logs" }, { status: 500 });
  }
}
