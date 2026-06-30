import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendContactEmail } from "@/lib/resend/emails";
import { rateLimit, getIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const rl = rateLimit(getIp(request), 5, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many requests. Please wait a minute." }, {
      status: 429, headers: { "Retry-After": String(rl.retryAfter) },
    });
  }

  try {
    const body = await request.json();
    const { firstName, lastName, email, phone, userType, subject, message } = body;

    if (!firstName || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Log contact inquiry in audit_logs for admin visibility
    try {
      await supabase.from("audit_logs").insert({
        action: "contact_form_submitted",
        entity_type: "contact",
        entity_id: email,
        details: { firstName, lastName, email, phone, userType, subject, message: message.slice(0, 200) },
      });
    } catch { /* non-critical */ }

    // Send email notification to admin
    await sendContactEmail({ firstName, lastName, email, phone, userType, subject, message });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[contact POST]", error);
    return NextResponse.json({ error: "Failed to submit" }, { status: 500 });
  }
}
