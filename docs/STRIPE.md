# Stripe Integration Guide
## Smart Choice Constructions LLC

---

## Overview

Smart Choice Constructions uses Stripe Billing for contractor subscriptions.
Pricing structure:
- **First month:** $29.90 (introductory)
- **All subsequent months:** $49.90/month auto-renewal
- **No commissions, no per-lead fees**

---

## 1. Initial Stripe Setup

### 1.1 Create Products in Stripe Dashboard

Go to [dashboard.stripe.com/products](https://dashboard.stripe.com/products) → **Add product**

**Product: Smart Choice Professional Plan**
- Name: `Smart Choice Constructions — Professional Plan`
- Description: `Monthly subscription for contractors. First month $29.90, then $49.90/month.`

**Create two prices for this product:**

| Price | Amount | Type | Interval |
|-------|--------|------|----------|
| First Month | $29.90 | One-time → switch to recurring | Month |
| Monthly Renewal | $49.90 | Recurring | Month |

Copy the `prod_XXX` and `price_XXX` IDs into `lib/stripe/config.ts`.

### 1.2 Environment Variables

Create `.env.local` at the project root:

```bash
# Stripe Keys (get from Dashboard → Developers → API keys)
STRIPE_SECRET_KEY=sk_live_...               # Never expose publicly
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_... # Safe for browser

# Webhook signing secret (get after creating webhook endpoint)
STRIPE_WEBHOOK_SECRET=whsec_...

# Your domain
NEXT_PUBLIC_BASE_URL=https://smartchoiceconstructions.com
```

### 1.3 Install Stripe SDK

```bash
npm install stripe @stripe/stripe-js
```

---

## 2. Checkout Flow

### How it works

1. Contractor completes registration steps 1–5
2. On step 6 (payment), frontend calls `/api/stripe/checkout` (POST)
3. Server creates a Stripe Checkout Session
4. Contractor is redirected to Stripe-hosted payment page
5. Stripe collects card details (PCI compliant — we never touch card data)
6. On success, Stripe redirects to `/join/success?session_id=...`
7. Stripe fires `checkout.session.completed` webhook
8. Webhook handler activates the contractor profile

### API Route: POST /api/stripe/checkout

```typescript
// app/api/stripe/checkout/route.ts
import Stripe from "stripe";
import { STRIPE_CONFIG } from "@/lib/stripe/config";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const { contractorId, email, companyName } = await req.json();
  const base = process.env.NEXT_PUBLIC_BASE_URL!;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: email,
    metadata: { contractorId, companyName },
    subscription_data: {
      metadata: { contractorId },
      // First month at $29.90
      trial_end: "now",
    },
    line_items: [{
      price: STRIPE_CONFIG.PRODUCTS.CONTRACTOR_SUBSCRIPTION.firstMonthPrice,
      quantity: 1,
    }],
    success_url: `${base}/join/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:  `${base}/join?step=6`,
    allow_promotion_codes: true,
    billing_address_collection: "required",
    phone_number_collection: { enabled: true },
  });

  return Response.json({ url: session.url });
}
```

### First Month → Renewal Price Switch

After the first successful payment, switch the subscription to the $49.90 price.
Do this in the `invoice.payment_succeeded` webhook on the first invoice:

```typescript
// In handlePaymentSucceeded, check if it's the first invoice
if (invoice.billing_reason === "subscription_create") {
  // Switch to recurring $49.90 price for all future invoices
  await stripe.subscriptions.update(invoice.subscription, {
    items: [{
      id: invoice.lines.data[0].subscription_item,
      price: STRIPE_CONFIG.PRODUCTS.CONTRACTOR_SUBSCRIPTION.monthlyPrice,
    }],
    proration_behavior: "none",
  });
}
```

---

## 3. Webhook Setup

### 3.1 Create Webhook Endpoint in Stripe

Dashboard → Developers → Webhooks → **Add endpoint**

- **URL:** `https://smartchoiceconstructions.com/api/stripe/webhook`
- **Events to listen for:**
  - `checkout.session.completed`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`
  - `customer.subscription.deleted`
  - `customer.subscription.updated`
  - `customer.subscription.paused`

Copy the **Signing Secret** to `STRIPE_WEBHOOK_SECRET`.

### 3.2 Webhook API Route

```typescript
// app/api/stripe/webhook/route.ts
import Stripe from "stripe";
import { handleWebhook } from "@/lib/stripe/webhook";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const body = await req.text();
  const sig  = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body, sig, process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("[Webhook] Signature error:", err.message);
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    await handleWebhook(event);
    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("[Webhook] Handler error:", err);
    // Return 200 to prevent Stripe retrying — log to Sentry instead
    return new Response("Handler error", { status: 200 });
  }
}

// Required: disable Next.js body parser for webhook
export const config = { api: { bodyParser: false } };
```

---

## 4. Subscription Lifecycle

```
New Contractor
     │
     ▼
[checkout.session.completed]
     │ status = "active"
     ▼
[Monthly renewal — invoice.payment_succeeded]
     │ status = "active" (stay)
     │
     ├─ Payment fails ──► [invoice.payment_failed]
     │                         │ status = "past_due"
     │                         │ Grace period: 3 days
     │                         │ Profile: STILL VISIBLE
     │                         │
     │                    Day 3+ fails
     │                         │ status = "suspended"
     │                         │ Profile: HIDDEN from search
     │                         │
     │                    Payment recovers ──► status = "active"
     │                    Profile restored
     │
     ├─ Contractor cancels ──► cancel_at_period_end = true
     │                         Profile stays until period ends
     │                         [customer.subscription.deleted]
     │                         status = "canceled"
     │                         Profile: HIDDEN
     │
     └─ All Stripe retries fail ──► status = "canceled"
                                    Profile: HIDDEN
```

---

## 5. Managing Payments (Admin)

### Manually cancel a subscription (fraud / ToS violation)

```typescript
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Immediate cancellation — no refund
await stripe.subscriptions.cancel(stripeSubId);
```

### Issue a refund

```typescript
await stripe.refunds.create({
  payment_intent: paymentIntentId,
  reason: "requested_by_customer", // or "fraudulent"
});
```

### Find a contractor's subscription

```typescript
const subscriptions = await stripe.subscriptions.list({
  customer: stripeCustomerId,
  status: "all",
  limit: 10,
});
```

### Update payment method for a contractor

Use the Billing Portal — never store or handle card data yourself:

```typescript
const session = await stripe.billingPortal.sessions.create({
  customer:   stripeCustomerId,
  return_url: "https://smartchoiceconstructions.com/dashboard/contractor/billing",
});
// Redirect contractor to session.url
```

---

## 6. Failed Payment Email Flow

When a payment fails, send these emails:

| Day | Action |
|-----|--------|
| Day 0 | Email: "Payment failed — update your card" with Billing Portal link |
| Day 1 | Stripe retries automatically |
| Day 3 | Grace period ends — profile suspended. Email: "Your profile is hidden" |
| Day 7 | Stripe retries again |
| Day 14 | Final retry |
| Day 30 | Stripe cancels subscription. Email: "Your account has been deactivated" |

---

## 7. Profile Visibility Logic

```typescript
// Check before serving any contractor profile or search result
import { isProfileVisible } from "@/lib/stripe/subscription";

const subscription = await db.contractorSubscriptions.findByContractorId(id);
if (!isProfileVisible(subscription.status)) {
  // For public pages: redirect to 404 or show "profile unavailable"
  // For search results: exclude from query with WHERE status = 'active'
  return notFound();
}
```

---

## 8. Discount Codes

Stripe Promotion Codes can be enabled in Checkout Sessions (`allow_promotion_codes: true`).
Create codes in Dashboard → Coupons → Create coupon.

Examples:
- `LAUNCH50` — 50% off first month ($14.95)
- `FREEMONTH` — 100% off first month
- `PARTNER10` — 10% off recurring

---

## 9. Testing

Use Stripe's test card numbers:
- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- **Insufficient funds:** `4000 0000 0000 9995`
- **Requires authentication:** `4000 0025 0000 3155`

Use test API keys (`sk_test_...`) during development.

Test webhooks locally with Stripe CLI:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
stripe trigger invoice.payment_failed
```
