import Stripe from "stripe";

// Singleton Stripe client — server-side only
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-05-28.basil",
      typescript: true,
    });
  }
  return _stripe;
}
