import { NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const ALLOWED = ["contractors", "suppliers", "homeowners", "subscriptions", "payments", "reviews", "leads", "audit_logs"];

function toCSV(rows: Record<string, unknown>[]): string {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };
  return [
    headers.join(","),
    ...rows.map(r => headers.map(h => escape(r[h])).join(",")),
  ].join("\n");
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ dataset: string }> }
) {
  try {
    const userClient = await createClient();
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { dataset } = await params;
    if (!ALLOWED.includes(dataset)) {
      return NextResponse.json({ error: "Invalid dataset" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const fmt = searchParams.get("format") ?? "csv";

    const supabase = createAdminClient();
    let rows: Record<string, unknown>[] = [];

    if (dataset === "contractors") {
      const { data } = await supabase
        .from("contractors")
        .select("id,company_name,owner_first_name,owner_last_name,email,phone,category,city,state_code,status,rating,total_reviews,created_at,profile_visible")
        .order("created_at", { ascending: false });
      rows = (data ?? []) as Record<string, unknown>[];
    } else if (dataset === "suppliers") {
      const { data } = await supabase
        .from("suppliers")
        .select("id,company_name,category,city,state_code,phone,email,status,created_at")
        .order("created_at", { ascending: false });
      rows = (data ?? []) as Record<string, unknown>[];
    } else if (dataset === "homeowners") {
      const { data } = await supabase
        .from("profiles")
        .select("id,full_name,email,phone,role,created_at")
        .eq("role", "customer")
        .order("created_at", { ascending: false });
      rows = (data ?? []) as Record<string, unknown>[];
    } else if (dataset === "subscriptions") {
      const { data } = await supabase
        .from("subscriptions")
        .select("id,contractor_id,status,plan,amount_cents,current_period_start,current_period_end,stripe_subscription_id,created_at")
        .order("created_at", { ascending: false });
      rows = (data ?? []) as Record<string, unknown>[];
    } else if (dataset === "payments") {
      const { data } = await supabase
        .from("payment_events")
        .select("id,contractor_id,event_type,amount_cents,invoice_id,created_at")
        .order("created_at", { ascending: false });
      rows = (data ?? []) as Record<string, unknown>[];
    } else if (dataset === "reviews") {
      const { data } = await supabase
        .from("reviews")
        .select("id,contractor_id,rating,project_type,review_text,status,created_at")
        .order("created_at", { ascending: false });
      rows = (data ?? []) as Record<string, unknown>[];
    } else if (dataset === "leads") {
      const { data } = await supabase
        .from("quote_requests")
        .select("id,contractor_id,homeowner_id,service_type,description,budget_range,city,state_code,contact_name,contact_email,status,created_at")
        .order("created_at", { ascending: false });
      rows = (data ?? []) as Record<string, unknown>[];
    } else if (dataset === "audit_logs") {
      const { data } = await supabase
        .from("audit_logs")
        .select("id,admin_id,action,entity_type,entity_id,created_at")
        .order("created_at", { ascending: false })
        .limit(5000);
      rows = (data ?? []) as Record<string, unknown>[];
    }

    if (fmt === "json") {
      return new Response(JSON.stringify(rows, null, 2), {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="${dataset}_${new Date().toISOString().split("T")[0]}.json"`,
        },
      });
    }

    const csv = toCSV(rows);
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${dataset}_${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (err) {
    console.error("[export GET]", err);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
