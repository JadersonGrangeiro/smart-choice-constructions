import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/server";
import { sendWelcomeEmail, sendPaymentFailedEmail, sendSubscriptionCanceledEmail } from "@/lib/resend/emails";

export const dynamic = "force-dynamic";

// Stripe requires the raw body for signature verification
export async function POST(request: Request) {
  const body      = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  const stripe  = getStripe();
  const supabase = createAdminClient();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("[webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  // Deduplicate events
  const { data: existing } = await supabase
    .from("payment_events")
    .select("id")
    .eq("stripe_event_id", event.id)
    .single();

  if (existing) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      // ── Checkout completed → activate subscription ──────────────────────────
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const contractorId = session.metadata?.contractor_id;

        if (!contractorId || session.mode !== "subscription") break;

        const subscriptionId = session.subscription as string;
        const subscription   = await stripe.subscriptions.retrieve(subscriptionId);

        // Create subscription record
        await supabase.from("contractor_subscriptions").upsert({
          contractor_id:          contractorId,
          stripe_subscription_id: subscriptionId,
          stripe_customer_id:     session.customer as string,
          stripe_price_id:        subscription.items.data[0].price.id,
          status:                 "active",
          current_period_start:   new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end:     new Date(subscription.current_period_end   * 1000).toISOString(),
          cancel_at_period_end:   subscription.cancel_at_period_end,
          updated_at:             new Date().toISOString(),
        }, { onConflict: "contractor_id" });

        // Move contractor to pending_approval (admin must approve before going live)
        await supabase
          .from("contractors")
          .update({ status: "pending_approval" })
          .eq("id", contractorId);

        // Get contractor email for welcome email
        const { data: contractor } = await supabase
          .from("contractors")
          .select("email, company_name, owner_first_name")
          .eq("id", contractorId)
          .single();

        if (contractor) {
          await sendWelcomeEmail({
            to: contractor.email,
            firstName: contractor.owner_first_name,
            companyName: contractor.company_name,
          });
        }

        // Log payment event
        await supabase.from("payment_events").insert({
          contractor_id:  contractorId,
          stripe_event_id: event.id,
          event_type:      event.type,
          amount_cents:    session.amount_total,
          currency:        session.currency ?? "usd",
          status:          "succeeded",
          raw_payload:     event.data.object as Record<string, unknown>,
        });
        break;
      }

      // ── Invoice paid → renew subscription ──────────────────────────────────
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.billing_reason === "subscription_create") break; // handled above

        const subscription = invoice.subscription
          ? await stripe.subscriptions.retrieve(invoice.subscription as string)
          : null;
        const contractorId  = subscription?.metadata?.contractor_id;

        if (!contractorId) break;

        await supabase
          .from("contractor_subscriptions")
          .update({
            status:               "active",
            current_period_start: subscription ? new Date(subscription.current_period_start * 1000).toISOString() : undefined,
            current_period_end:   subscription ? new Date(subscription.current_period_end   * 1000).toISOString() : undefined,
            failed_payment_count: 0,
            last_failed_at:       null,
            suspended_at:         null,
            updated_at:           new Date().toISOString(),
          })
          .eq("contractor_id", contractorId);

        // Restore visibility if suspended for payment
        await supabase
          .from("contractors")
          .update({ status: "active", profile_visible: true })
          .eq("id", contractorId)
          .eq("status", "suspended");

        await supabase.from("payment_events").insert({
          contractor_id:  contractorId,
          stripe_event_id: event.id,
          event_type:      event.type,
          amount_cents:    invoice.amount_paid,
          currency:        invoice.currency,
          status:          "succeeded",
          invoice_id:      invoice.id,
        });
        break;
      }

      // ── Invoice payment failed → grace period / suspension ─────────────────
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscription = invoice.subscription
          ? await stripe.subscriptions.retrieve(invoice.subscription as string)
          : null;
        const contractorId  = subscription?.metadata?.contractor_id;

        if (!contractorId) break;

        const { data: subRecord } = await supabase
          .from("contractor_subscriptions")
          .select("failed_payment_count")
          .eq("contractor_id", contractorId)
          .single();

        const failCount = (subRecord?.failed_payment_count ?? 0) + 1;
        const now = new Date().toISOString();

        await supabase
          .from("contractor_subscriptions")
          .update({
            status:               "past_due",
            failed_payment_count: failCount,
            last_failed_at:       now,
            updated_at:           now,
          })
          .eq("contractor_id", contractorId);

        // After grace period (3 failures) → suspend profile
        if (failCount >= 3) {
          await supabase
            .from("contractor_subscriptions")
            .update({ status: "past_due", suspended_at: now, updated_at: now })
            .eq("contractor_id", contractorId);

          await supabase
            .from("contractors")
            .update({ profile_visible: false })
            .eq("id", contractorId);
        }

        // Get contractor email
        const { data: contractor } = await supabase
          .from("contractors")
          .select("email, owner_first_name, company_name")
          .eq("id", contractorId)
          .single();

        if (contractor) {
          await sendPaymentFailedEmail({
            to: contractor.email,
            firstName: contractor.owner_first_name,
            failCount,
          });
        }

        await supabase.from("payment_events").insert({
          contractor_id:  contractorId,
          stripe_event_id: event.id,
          event_type:      event.type,
          amount_cents:    invoice.amount_due,
          currency:        invoice.currency,
          status:          "failed",
          failure_reason:  invoice.last_finalization_error?.message ?? null,
          invoice_id:      invoice.id,
        });
        break;
      }

      // ── Subscription canceled ──────────────────────────────────────────────
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const contractorId = subscription.metadata?.contractor_id;

        if (!contractorId) break;

        await supabase
          .from("contractor_subscriptions")
          .update({
            status:       "canceled",
            canceled_at:  new Date().toISOString(),
            updated_at:   new Date().toISOString(),
          })
          .eq("contractor_id", contractorId);

        await supabase
          .from("contractors")
          .update({ status: "canceled", profile_visible: false })
          .eq("id", contractorId);

        const { data: contractor } = await supabase
          .from("contractors")
          .select("email, owner_first_name")
          .eq("id", contractorId)
          .single();

        if (contractor) {
          await sendSubscriptionCanceledEmail({
            to: contractor.email,
            firstName: contractor.owner_first_name,
          });
        }

        await supabase.from("payment_events").insert({
          contractor_id:  contractorId,
          stripe_event_id: event.id,
          event_type:      event.type,
          status:          "canceled",
        });
        break;
      }

      // ── Subscription updated (e.g. cancel_at_period_end toggled) ──────────
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const contractorId = subscription.metadata?.contractor_id;

        if (!contractorId) break;

        await supabase
          .from("contractor_subscriptions")
          .update({
            status:               subscription.status,
            cancel_at_period_end: subscription.cancel_at_period_end,
            current_period_end:   new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at:           new Date().toISOString(),
          })
          .eq("contractor_id", contractorId);
        break;
      }
    }
  } catch (err) {
    console.error(`[webhook] Error processing ${event.type}:`, err);
    return NextResponse.json({ error: "Webhook handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
