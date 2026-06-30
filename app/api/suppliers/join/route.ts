import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { rateLimit, getIp } from "@/lib/rate-limit";
import { sendSupplierApplicationEmail } from "@/lib/resend/emails";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const rl = rateLimit(getIp(request), 3, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many requests. Please wait." }, {
      status: 429, headers: { "Retry-After": String(rl.retryAfter) },
    });
  }

  try {
    const body = await request.json();
    const { company_name, contact_name, email, phone, category, state_code, city, website, description } = body;

    if (!company_name?.trim() || !email?.trim() || !category || !state_code || !city?.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const admin = createAdminClient();

    const { error } = await admin.from("suppliers").insert({
      company_name: company_name.trim(),
      category,
      email:        email.trim().toLowerCase(),
      phone:        phone?.trim() || null,
      website:      website?.trim() || null,
      description:  description?.trim() || null,
      state_code:   state_code.toUpperCase(),
      city:         city.trim(),
      status:       "pending",
    });

    if (error) throw error;

    // Send confirmation to applicant (fire-and-forget)
    const catLabel = category.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
    sendSupplierApplicationEmail({
      to:          email.trim().toLowerCase(),
      companyName: company_name.trim(),
      contactName: contact_name?.trim() ?? company_name.trim(),
      category:    catLabel,
    }).catch(console.error);

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("[suppliers/join POST]", err);
    return NextResponse.json({ error: "Failed to submit application" }, { status: 500 });
  }
}
