import { NextResponse } from "next/server";
import { rateLimit, getIp } from "@/lib/rate-limit";
import { getStripe } from "@/lib/stripe/client";

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

    if (!company_name?.trim() || !email?.trim() || !category || !state_code || !city?.trim() || !contact_name?.trim() || !phone?.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://smartchoiceconstructions.com";
    const stripe  = getStripe();

    const customer = await stripe.customers.create({
      email:    email.trim().toLowerCase(),
      name:     company_name.trim(),
      metadata: { type: "supplier", contact_name: contact_name.trim() },
    });

    const session = await stripe.checkout.sessions.create({
      customer:              customer.id,
      mode:                  "subscription",
      payment_method_types:  ["card"],
      line_items: [{ price: process.env.STRIPE_SUPPLIER_PRICE_FIRST_MONTH!, quantity: 1 }],
      metadata: {
        type:         "supplier",
        company_name: company_name.trim(),
        contact_name: contact_name.trim(),
        email:        email.trim().toLowerCase(),
        phone:        phone.trim(),
        category,
        state_code:   state_code.toUpperCase(),
        city:         city.trim(),
        website:      website?.trim() ?? "",
        description:  (description?.trim() ?? "").slice(0, 480),
      },
      subscription_data: {
        metadata: { type: "supplier", company_name: company_name.trim() },
      },
      success_url:  `${baseUrl}/join/supplier/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:   `${baseUrl}/join/supplier?cancelled=true`,
      allow_promotion_codes:       true,
      billing_address_collection:  "required",
    });

    return NextResponse.json({ checkoutUrl: session.url }, { status: 200 });
  } catch (err) {
    console.error("[suppliers/join POST]", err);
    return NextResponse.json({ error: "Failed to start checkout" }, { status: 500 });
  }
}
