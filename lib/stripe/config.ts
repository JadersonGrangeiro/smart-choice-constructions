/**
 * Smart Choice Constructions — Stripe Billing Configuration
 *
 * SETUP INSTRUCTIONS:
 * 1. Create a Stripe account at https://stripe.com
 * 2. Get your keys from Dashboard → Developers → API keys
 * 3. Add to .env.local:
 *    STRIPE_SECRET_KEY=sk_live_...
 *    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
 *    STRIPE_WEBHOOK_SECRET=whsec_...
 * 4. Create products in Stripe Dashboard (see docs/STRIPE.md)
 */

export const STRIPE_CONFIG = {
  /** First-month introductory price in cents */
  FIRST_MONTH_CENTS: 2990,        // $29.90

  /** Standard monthly renewal price in cents */
  MONTHLY_CENTS: 4990,             // $49.90

  /** Currency */
  CURRENCY: "usd",

  /** Days before a failed payment suspends the profile */
  GRACE_PERIOD_DAYS: 3,

  /** Days before a suspended account is permanently deactivated */
  DEACTIVATION_DAYS: 30,

  /**
   * Stripe Product & Price IDs
   * Create these once in your Stripe Dashboard, then paste the IDs below.
   * Dashboard → Products → Add product
   */
  PRODUCTS: {
    CONTRACTOR_SUBSCRIPTION: {
      productId:       "prod_REPLACE_WITH_YOUR_ID",
      firstMonthPrice: "price_REPLACE_WITH_FIRST_MONTH_ID",   // $29.90 one-time
      monthlyPrice:    "price_REPLACE_WITH_MONTHLY_ID",        // $49.90/month recurring
    },
  },

  /** Stripe webhook events we handle */
  WEBHOOK_EVENTS: [
    "checkout.session.completed",
    "invoice.payment_succeeded",
    "invoice.payment_failed",
    "customer.subscription.deleted",
    "customer.subscription.updated",
    "customer.subscription.paused",
  ] as const,
} as const;

export type WebhookEvent = (typeof STRIPE_CONFIG.WEBHOOK_EVENTS)[number];
