/**
 * Stripe Billing Types for Smart Choice Constructions
 */

export type SubscriptionStatus =
  | "trialing"       // Free trial (not used currently)
  | "active"         // Paid and in good standing
  | "past_due"       // Payment failed — within grace period, profile still visible
  | "suspended"      // Grace period expired — profile hidden from search
  | "canceled"       // Contractor canceled — profile deactivated
  | "unpaid"         // Multiple failures — requires manual intervention
  | "paused";        // Contractor paused subscription manually

export interface ContractorSubscription {
  contractorId:       string;
  stripeCustomerId:   string;
  stripeSubId:        string;
  stripePriceId:      string;
  status:             SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd:   Date;
  cancelAtPeriodEnd:  boolean;
  trialEnd:           Date | null;
  failedPaymentCount: number;
  lastFailedAt:       Date | null;
  suspendedAt:        Date | null;
  canceledAt:         Date | null;
  createdAt:          Date;
  updatedAt:          Date;
}

export interface PaymentEvent {
  id:             string;
  contractorId:   string;
  stripeEventId:  string;
  type:           string;
  amountCents:    number;
  currency:       string;
  status:         "succeeded" | "failed" | "pending";
  failureReason:  string | null;
  invoiceId:      string | null;
  createdAt:      Date;
}

export interface CheckoutSessionParams {
  contractorId:   string;
  email:          string;
  companyName:    string;
  successUrl:     string;
  cancelUrl:      string;
}

export interface BillingPortalParams {
  stripeCustomerId: string;
  returnUrl:        string;
}
