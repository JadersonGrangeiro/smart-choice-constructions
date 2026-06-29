import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q     = searchParams.get("q") ?? "";
    const page  = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "50");
    const offset = (page - 1) * limit;

    const supabase = createAdminClient();

    let query = supabase
      .from("profiles")
      .select(`
        id, full_name, email, phone, role, created_at,
        homeowners(city, state_code, zip_code)
      `, { count: "exact" })
      .in("role", ["customer"])
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (q) query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%`);

    const { data, count, error } = await query;
    if (error) throw error;

    // Count quote requests per user separately to avoid N+1
    const userIds = (data ?? []).map((u: any) => u.id);
    const { data: quoteCounts } = userIds.length > 0
      ? await supabase
          .from("quote_requests")
          .select("homeowner_id")
          .in("homeowner_id", userIds)
      : { data: [] };

    const countByUser: Record<string, number> = {};
    (quoteCounts ?? []).forEach((q: any) => {
      countByUser[q.homeowner_id] = (countByUser[q.homeowner_id] ?? 0) + 1;
    });

    const users = (data ?? []).map((u: any) => ({
      ...u,
      quote_count: countByUser[u.id] ?? 0,
    }));

    return NextResponse.json({ users, total: count ?? 0 });
  } catch (err) {
    console.error("[admin/users GET]", err);
    return NextResponse.json({ error: "Failed to load users" }, { status: 500 });
  }
}
