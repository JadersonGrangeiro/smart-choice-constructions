import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/client";

export const dynamic = "force-dynamic";

const SETUP_SECRET = "scc-setup-2026-supplier";

export async function POST(request: Request) {
  const url = new URL(request.url);
  const querySecret = url.searchParams.get("secret");
  let bodySecret: string | undefined;
  try {
    const body = await request.json();
    bodySecret = body?.secret;
  } catch {}
  const headerSecret = request.headers.get("x-setup-secret");

  const provided = querySecret ?? bodySecret ?? headerSecret ?? "";
  if (provided !== SETUP_SECRET) {
    return NextResponse.json({ error: "Unauthorized", got: provided.slice(0, 4) }, { status: 401 });
  }

  const stripe = getStripe();

  // Create supplier product
  const product = await stripe.products.create({
    name: "Smart Choice Supplier Directory Listing",
    description: "Monthly listing in the Smart Choice Constructions supplier directory",
    metadata: { type: "supplier_listing" },
  });

  // First month discounted price: $14.90
  const firstMonthPrice = await stripe.prices.create({
    product: product.id,
    currency: "usd",
    unit_amount: 1490,
    recurring: { interval: "month" },
    nickname: "Supplier Listing — First Month ($14.90)",
    metadata: { type: "supplier_first_month" },
  });

  // Regular monthly price: $29.90
  const monthlyPrice = await stripe.prices.create({
    product: product.id,
    currency: "usd",
    unit_amount: 2990,
    recurring: { interval: "month" },
    nickname: "Supplier Listing — Monthly ($29.90)",
    metadata: { type: "supplier_monthly" },
  });

  return NextResponse.json({
    product_id: product.id,
    STRIPE_SUPPLIER_PRICE_FIRST_MONTH: firstMonthPrice.id,
    STRIPE_SUPPLIER_PRICE_MONTHLY: monthlyPrice.id,
  });
}
