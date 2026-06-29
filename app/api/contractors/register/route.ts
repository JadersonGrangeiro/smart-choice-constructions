import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/client";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      firstName, lastName, email, phone, password,
      company, category, state, city, years,
      license, insurance, description, website,
      facebook, instagram, linkedin,
      workingDays, openTime, closeTime, emergency,
      serviceRadius, additionalStates, additionalCities,
    } = body;

    // Validate required fields
    if (!email || !password || !company || !category || !state || !city) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const stripe = getStripe();

    // 1. Create Supabase auth user with contractor role
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role: "contractor",
        full_name: `${firstName} ${lastName}`,
      },
    });

    if (authError) {
      if (authError.message.includes("already registered")) {
        return NextResponse.json(
          { error: "An account with this email already exists." },
          { status: 409 }
        );
      }
      throw authError;
    }

    const userId = authData.user.id;

    // Update profile role explicitly (trigger sets default, but ensure contractor)
    await supabase
      .from("profiles")
      .update({ role: "contractor", phone, full_name: `${firstName} ${lastName}` })
      .eq("id", userId);

    // 2. Create Stripe customer
    const customer = await stripe.customers.create({
      email,
      name: `${firstName} ${lastName}`,
      metadata: { company_name: company, user_id: userId },
    });

    // 3. Create contractor record in DB (status = pending_payment)
    const { data: contractor, error: contractorError } = await supabase
      .from("contractors")
      .insert({
        user_id: userId,
        company_name: company,
        owner_first_name: firstName,
        owner_last_name: lastName,
        email,
        phone,
        category,
        state_code: state,
        city,
        years_experience: parseInt(years) || 0,
        license_number: license || null,
        insurance_number: insurance || null,
        description: description || null,
        website: website || null,
        facebook_url: facebook || null,
        instagram_url: instagram || null,
        linkedin_url: linkedin || null,
        working_days: workingDays || [],
        open_time: openTime || "08:00",
        close_time: closeTime || "17:00",
        has_emergency: emergency || false,
        service_radius: serviceRadius || "25",
        additional_states: additionalStates || [],
        additional_cities: additionalCities || null,
        stripe_customer_id: customer.id,
        status: "pending_payment",
        profile_visible: false,
      })
      .select("id")
      .single();

    if (contractorError) throw contractorError;

    // 4. Create Stripe Checkout session
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_FIRST_MONTH!,
          quantity: 1,
        },
      ],
      metadata: {
        contractor_id: contractor.id,
        user_id: userId,
      },
      success_url: `${baseUrl}/join/success?session_id={CHECKOUT_SESSION_ID}&contractor_id=${contractor.id}`,
      cancel_url: `${baseUrl}/join?step=6&cancelled=true`,
      subscription_data: {
        metadata: {
          contractor_id: contractor.id,
          user_id: userId,
        },
      },
      allow_promotion_codes: true,
      billing_address_collection: "required",
    });

    return NextResponse.json({ checkoutUrl: session.url });
  } catch (error: unknown) {
    console.error("[register]", error);
    const message = error instanceof Error ? error.message : "Registration failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
