// GET /api/v1/health
// Public endpoint — mobile apps call this on startup to check API availability.

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const start = Date.now();
  let dbStatus: "ok" | "error" = "ok";

  try {
    const supabase = createAdminClient();
    await supabase.from("platform_settings").select("key").eq("key", "maintenance_mode").single();
  } catch {
    dbStatus = "error";
  }

  return NextResponse.json({
    status: dbStatus === "ok" ? "ok" : "degraded",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    latencyMs: Date.now() - start,
    services: {
      api: "ok",
      database: dbStatus,
    },
  });
}
