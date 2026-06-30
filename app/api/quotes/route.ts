import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendQuoteNotificationEmail } from "@/lib/resend/emails";
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
    const {
      contractor_id, service_type, description, budget_range,
      city, state_code, zip_code,
      contact_name, contact_email, contact_phone,
    } = body;

    if (!service_type || !contact_name || !contact_email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const userSupabase = await createClient();
    const { data: { user } } = await userSupabase.auth.getUser();

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("quote_requests")
      .insert({
        contractor_id,
        homeowner_id: user?.id ?? null,
        service_type,
        description:   description || null,
        budget_range:  budget_range || null,
        city:          city || null,
        state_code:    state_code || null,
        zip_code:      zip_code || null,
        contact_name,
        contact_email,
        contact_phone: contact_phone || null,
        status:        "pending",
      })
      .select("id")
      .single();

    if (error) throw error;

    // Notify the contractor
    const { data: contractor } = await supabase
      .from("contractors")
      .select("email, owner_first_name, company_name")
      .eq("id", contractor_id)
      .single();

    if (contractor) {
      sendQuoteNotificationEmail({
        to:           contractor.email,
        contractorName: contractor.owner_first_name,
        serviceName:  service_type,
        clientName:   contact_name,
      }).catch(console.error);
    }

    return NextResponse.json({ quote_request_id: data.id }, { status: 201 });
  } catch (error) {
    console.error("[quotes POST]", error);
    return NextResponse.json({ error: "Failed to submit quote request" }, { status: 500 });
  }
}
