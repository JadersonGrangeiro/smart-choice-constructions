/**
 * Stripe Webhook Handler
 * Smart Choice Constructions LLC
 *
 * Receives events from Stripe and updates subscription state in your database.
 *
 * Setup:
 * 1. In Stripe Dashboard → Webhooks → Add endpoint
 *    URL: https://yourdomain.com/api/stripe/webhook
 *    Events: select all events listed in STRIPE_CONFIG.WEBHOOK_EVENTS
 * 2. Copy the Signing Secret to STRIPE_WEBHOOK_SECRET in .env.local
 *
 * This file documents every event we handle and what action it triggers.
 */

import { STRIPE_CONFIG } from "./config";
import { mapStripeStatus, isProfileVisible } from "./subscription";

// ─── Event Handlers ────────────────────────────────────────────────────────────

/**
 * checkout.session.completed
 *
 * Fired when a contractor completes the checkout flow successfully.
 * This is the moment we:
 * 1. Create the contractor record in our database
 * 2. Link it to the Stripe customer and subscription
 * 3. Set status to "active"
 * 4. Send welcome email
 * 5. Trigger admin notification for profile review
 */
export async function handleCheckoutCompleted(session: any): Promise<void> {
  const { contractorId, companyName } = session.metadata;
  const stripeCustomerId = session.customer;
  const stripeSubId      = session.subscription;

  console.log(`[Webhook] New subscription — contractor: ${contractorId}, customer: ${stripeCustomerId}`);

  // TODO: implement with your database:
  // await db.contractorSubscriptions.create({
  //   contractorId,
  //   stripeCustomerId,
  //   stripeSubId,
  //   status: "active",
  //   createdAt: new Date(),
  // });
  // await db.contractors.update({ id: contractorId }, { status: "pending_review" });
  // await email.sendWelcome({ contractorId, companyName });
  // await email.notifyAdmin({ event: "new_contractor", contractorId });
}

/**
 * invoice.payment_succeeded
 *
 * Fired on every successful monthly renewal.
 * - Reset failedPaymentCount to 0
 * - Ensure profile status is "active"
 * - Extend currentPeriodEnd
 * - Log the payment event
 *
 * On the FIRST invoice (checkout), amount is $29.90.
 * On all subsequent invoices, amount is $49.90.
 */
export async function handlePaymentSucceeded(invoice: any): Promise<void> {
  const stripeSubId   = invoice.subscription;
  const amountCents   = invoice.amount_paid;
  const periodEnd     = new Date(invoice.lines.data[0]?.period?.end * 1000);

  console.log(`[Webhook] Payment succeeded — sub: ${stripeSubId}, amount: $${(amountCents/100).toFixed(2)}`);

  // TODO:
  // const sub = await db.contractorSubscriptions.findByStripeSubId(stripeSubId);
  // await db.contractorSubscriptions.update({ stripeSubId }, {
  //   status: "active",
  //   failedPaymentCount: 0,
  //   currentPeriodEnd: periodEnd,
  //   suspendedAt: null,
  // });
  // await db.paymentEvents.create({
  //   contractorId: sub.contractorId,
  //   stripeEventId: invoice.id,
  //   type: "payment_succeeded",
  //   amountCents,
  //   status: "succeeded",
  // });
  // if (sub.status === "suspended" || sub.status === "past_due") {
  //   // Reactivate profile after successful payment
  //   await db.contractors.update({ id: sub.contractorId }, { profileVisible: true });
  //   await email.sendPaymentConfirmed({ contractorId: sub.contractorId, amount: amountCents/100 });
  // }
}

/**
 * invoice.payment_failed
 *
 * Fired when a renewal payment fails (expired card, insufficient funds, etc.)
 *
 * Failure flow:
 * Day 0:  Payment fails → status = "past_due" → email contractor with update card link
 * Day 1:  Stripe automatically retries
 * Day 3:  Grace period expires → status = "suspended" → profile hidden from search
 * Day 7:  Stripe retries again → if succeeds → back to "active"
 * Day 30: Stripe gives up → status = "canceled" → profile deactivated
 */
export async function handlePaymentFailed(invoice: any): Promise<void> {
  const stripeSubId   = invoice.subscription;
  const failureReason = invoice.last_finalization_error?.message ?? "Payment declined";
  const attemptCount  = invoice.attempt_count ?? 1;

  console.log(`[Webhook] Payment failed — sub: ${stripeSubId}, attempt: ${attemptCount}, reason: ${failureReason}`);

  // TODO:
  // const sub = await db.contractorSubscriptions.findByStripeSubId(stripeSubId);
  // const now = new Date();
  // const daysPastDue = sub.lastFailedAt
  //   ? (now.getTime() - sub.lastFailedAt.getTime()) / (1000 * 60 * 60 * 24)
  //   : 0;
  // const newStatus = daysPastDue >= STRIPE_CONFIG.GRACE_PERIOD_DAYS ? "suspended" : "past_due";
  //
  // await db.contractorSubscriptions.update({ stripeSubId }, {
  //   status: newStatus,
  //   failedPaymentCount: sub.failedPaymentCount + 1,
  //   lastFailedAt: now,
  //   suspendedAt: newStatus === "suspended" ? now : sub.suspendedAt,
  // });
  //
  // if (newStatus === "suspended") {
  //   await db.contractors.update({ id: sub.contractorId }, { profileVisible: false });
  //   await email.sendProfileSuspended({ contractorId: sub.contractorId, updateCardUrl: "..." });
  // } else {
  //   await email.sendPaymentFailed({
  //     contractorId: sub.contractorId,
  //     attempt: attemptCount,
  //     updateCardUrl: "https://smartchoiceconstructions.com/dashboard/contractor/billing",
  //   });
  // }
  //
  // await db.paymentEvents.create({
  //   contractorId: sub.contractorId,
  //   type: "payment_failed",
  //   amountCents: invoice.amount_due,
  //   status: "failed",
  //   failureReason,
  // });
}

/**
 * customer.subscription.deleted
 *
 * Fired when a subscription is fully canceled (either by contractor or after
 * all Stripe payment retries are exhausted).
 * - Set status to "canceled"
 * - Hide profile from search
 * - Send cancellation confirmation
 * - Retain data for 30 days in case of reactivation
 */
export async function handleSubscriptionDeleted(subscription: any): Promise<void> {
  const stripeSubId = subscription.id;
  console.log(`[Webhook] Subscription deleted — sub: ${stripeSubId}`);

  // TODO:
  // const sub = await db.contractorSubscriptions.findByStripeSubId(stripeSubId);
  // await db.contractorSubscriptions.update({ stripeSubId }, {
  //   status: "canceled",
  //   canceledAt: new Date(),
  // });
  // await db.contractors.update({ id: sub.contractorId }, {
  //   profileVisible: false,
  //   scheduledDeletionAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  // });
  // await email.sendCancellationConfirmed({ contractorId: sub.contractorId });
}

/**
 * customer.subscription.updated
 *
 * Fired when subscription details change:
 * - Cancel at period end toggled on/off
 * - Price changed
 * - Quantity changed
 *
 * We use this to keep our DB in sync with Stripe's source of truth.
 */
export async function handleSubscriptionUpdated(subscription: any): Promise<void> {
  const stripeSubId      = subscription.id;
  const cancelAtPeriodEnd = subscription.cancel_at_period_end;
  const stripeStatus     = subscription.status;

  console.log(`[Webhook] Subscription updated — sub: ${stripeSubId}, cancel_at_period_end: ${cancelAtPeriodEnd}`);

  // TODO:
  // const status = mapStripeStatus(stripeStatus);
  // await db.contractorSubscriptions.update({ stripeSubId }, {
  //   status,
  //   cancelAtPeriodEnd,
  //   currentPeriodEnd: new Date(subscription.current_period_end * 1000),
  // });
}

// ─── Main Webhook Router ───────────────────────────────────────────────────────

/**
 * Main webhook handler — routes Stripe events to the correct handler.
 *
 * Use in your Next.js API route:
 * ```typescript
 * // app/api/stripe/webhook/route.ts
 * import Stripe from "stripe";
 * import { handleWebhook } from "@/lib/stripe/webhook";
 *
 * const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
 *
 * export async function POST(req: Request) {
 *   const body = await req.text();
 *   const sig  = req.headers.get("stripe-signature")!;
 *
 *   let event: Stripe.Event;
 *   try {
 *     event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
 *   } catch (err: any) {
 *     console.error("[Webhook] Signature verification failed:", err.message);
 *     return new Response("Webhook signature error", { status: 400 });
 *   }
 *
 *   await handleWebhook(event);
 *   return new Response("OK", { status: 200 });
 * }
 * ```
 */
export async function handleWebhook(event: { type: string; data: { object: any } }): Promise<void> {
  const obj = event.data.object;

  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(obj); break;
    case "invoice.payment_succeeded":
      await handlePaymentSucceeded(obj); break;
    case "invoice.payment_failed":
      await handlePaymentFailed(obj); break;
    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(obj); break;
    case "customer.subscription.updated":
      await handleSubscriptionUpdated(obj); break;
    default:
      console.log(`[Webhook] Unhandled event type: ${event.type}`);
  }
}
