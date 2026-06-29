/**
 * Stripe Subscription Management
 * Smart Choice Constructions LLC
 *
 * This module handles all subscription lifecycle events.
 * Install Stripe SDK: npm install stripe
 * Then uncomment the Stripe import and initialization below.
 */

// import Stripe from "stripe";
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

import { STRIPE_CONFIG } from "./config";
import type { ContractorSubscription, CheckoutSessionParams, BillingPortalParams, SubscriptionStatus } from "./types";

// ─── Checkout ─────────────────────────────────────────────────────────────────

/**
 * Creates a Stripe Checkout Session for a new contractor subscription.
 *
 * Flow:
 * 1. Contractor completes registration Step 1–5
 * 2. On Step 6 (payment), your server calls this function
 * 3. Redirect contractor to the returned `url`
 * 4. Stripe collects payment and redirects to `successUrl`
 * 5. Your webhook receives `checkout.session.completed`
 *
 * First-month pricing: Stripe "phase" billing
 * - Phase 1: one-time $29.90 charge (first month)
 * - Phase 2: automatic $49.90/month recurring
 *
 * Implementation with the Stripe SDK:
 * ```typescript
 * export async function createCheckoutSession(params: CheckoutSessionParams) {
 *   const session = await stripe.checkout.sessions.create({
 *     mode: "subscription",
 *     customer_email: params.email,
 *     metadata: {
 *       contractorId: params.contractorId,
 *       companyName:  params.companyName,
 *     },
 *     subscription_data: {
 *       metadata: { contractorId: params.contractorId },
 *       trial_period_days: 0,
 *     },
 *     line_items: [
 *       {
 *         // First month at $29.90
 *         price_data: {
 *           currency: STRIPE_CONFIG.CURRENCY,
 *           product: STRIPE_CONFIG.PRODUCTS.CONTRACTOR_SUBSCRIPTION.productId,
 *           unit_amount: STRIPE_CONFIG.FIRST_MONTH_CENTS,
 *           recurring: { interval: "month", interval_count: 1 },
 *         },
 *         quantity: 1,
 *       },
 *     ],
 *     // After first month, switch to $49.90/month
 *     // Achieved via subscription_data.phases or a webhook that updates the price
 *     success_url: params.successUrl + "?session_id={CHECKOUT_SESSION_ID}",
 *     cancel_url:  params.cancelUrl,
 *     allow_promotion_codes: true,
 *     billing_address_collection: "required",
 *   });
 *   return session;
 * }
 * ```
 */
export async function createCheckoutSession(params: CheckoutSessionParams): Promise<{ url: string }> {
  // Replace with actual Stripe call above
  console.log("[Stripe] Would create checkout session for:", params.contractorId);
  return { url: "/join/success" };
}

// ─── Billing Portal ───────────────────────────────────────────────────────────

/**
 * Generates a Stripe Billing Portal URL for a contractor to:
 * - Update payment method
 * - Download invoices
 * - Cancel subscription
 * - Reactivate subscription
 *
 * ```typescript
 * export async function createBillingPortalSession(params: BillingPortalParams) {
 *   const session = await stripe.billingPortal.sessions.create({
 *     customer:   params.stripeCustomerId,
 *     return_url: params.returnUrl,
 *   });
 *   return session.url;
 * }
 * ```
 */
export async function createBillingPortalSession(params: BillingPortalParams): Promise<string> {
  console.log("[Stripe] Would open billing portal for:", params.stripeCustomerId);
  return "/dashboard/contractor/billing";
}

// ─── Subscription State Machine ───────────────────────────────────────────────

/**
 * Determines profile visibility based on subscription status.
 * Called before serving any contractor profile page.
 */
export function isProfileVisible(status: SubscriptionStatus): boolean {
  return status === "active" || status === "trialing";
}

/**
 * Maps Stripe subscription status to our internal status.
 */
export function mapStripeStatus(stripeStatus: string, pastDueAt?: Date): SubscriptionStatus {
  switch (stripeStatus) {
    case "active":    return "active";
    case "trialing":  return "trialing";
    case "canceled":  return "canceled";
    case "paused":    return "paused";
    case "unpaid":    return "unpaid";
    case "past_due": {
      if (!pastDueAt) return "past_due";
      const daysPastDue = (Date.now() - pastDueAt.getTime()) / (1000 * 60 * 60 * 24);
      return daysPastDue > STRIPE_CONFIG.GRACE_PERIOD_DAYS ? "suspended" : "past_due";
    }
    default: return "past_due";
  }
}

/**
 * Cancels a subscription at the end of the current billing period.
 * Profile remains active until period ends.
 *
 * ```typescript
 * export async function cancelSubscription(stripeSubId: string) {
 *   return stripe.subscriptions.update(stripeSubId, {
 *     cancel_at_period_end: true,
 *   });
 * }
 * ```
 */
export async function cancelSubscription(stripeSubId: string): Promise<void> {
  console.log("[Stripe] Would cancel subscription:", stripeSubId);
}

/**
 * Immediately cancels a subscription (admin use — fraud or ToS violation).
 *
 * ```typescript
 * export async function cancelSubscriptionImmediately(stripeSubId: string) {
 *   return stripe.subscriptions.cancel(stripeSubId);
 * }
 * ```
 */
export async function cancelSubscriptionImmediately(stripeSubId: string): Promise<void> {
  console.log("[Stripe] Would immediately cancel subscription:", stripeSubId);
}

/**
 * Reactivates a canceled subscription before the period ends.
 *
 * ```typescript
 * export async function reactivateSubscription(stripeSubId: string) {
 *   return stripe.subscriptions.update(stripeSubId, {
 *     cancel_at_period_end: false,
 *   });
 * }
 * ```
 */
export async function reactivateSubscription(stripeSubId: string): Promise<void> {
  console.log("[Stripe] Would reactivate subscription:", stripeSubId);
}

/**
 * Pauses a subscription (contractor request — e.g. going on vacation).
 * Profile is hidden while paused.
 *
 * ```typescript
 * export async function pauseSubscription(stripeSubId: string) {
 *   return stripe.subscriptions.update(stripeSubId, {
 *     pause_collection: { behavior: "void" },
 *   });
 * }
 * ```
 */
export async function pauseSubscription(stripeSubId: string): Promise<void> {
  console.log("[Stripe] Would pause subscription:", stripeSubId);
}

/**
 * Resumes a paused subscription.
 *
 * ```typescript
 * export async function resumeSubscription(stripeSubId: string) {
 *   return stripe.subscriptions.update(stripeSubId, {
 *     pause_collection: "",
 *   });
 * }
 * ```
 */
export async function resumeSubscription(stripeSubId: string): Promise<void> {
  console.log("[Stripe] Would resume subscription:", stripeSubId);
}

/**
 * Retrieves all invoices for a contractor.
 *
 * ```typescript
 * export async function getInvoices(stripeCustomerId: string) {
 *   return stripe.invoices.list({
 *     customer: stripeCustomerId,
 *     limit: 24,
 *   });
 * }
 * ```
 */
export async function getInvoices(stripeCustomerId: string): Promise<any[]> {
  return [];
}
