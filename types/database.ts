export type UserRole = "customer" | "contractor" | "admin" | "supplier";
export type ContractorStatus = "pending_payment" | "pending_approval" | "active" | "suspended" | "canceled" | "rejected";
export type SubscriptionStatus = "trialing" | "active" | "past_due" | "canceled" | "unpaid" | "paused" | "incomplete";
export type DocType = "license" | "insurance" | "background_check" | "certification" | "other";
export type QuoteStatus = "pending" | "viewed" | "responded" | "completed" | "declined";

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string | null;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Contractor {
  id: string;
  user_id: string | null;
  company_name: string;
  owner_first_name: string;
  owner_last_name: string;
  email: string;
  phone: string | null;
  category: string;
  state_code: string;
  city: string;
  zip_code: string | null;
  service_radius: string;
  additional_states: string[];
  additional_cities: string | null;
  description: string | null;
  website: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  linkedin_url: string | null;
  working_days: string[];
  open_time: string;
  close_time: string;
  has_emergency: boolean;
  license_number: string | null;
  insurance_number: string | null;
  years_experience: number;
  is_licensed: boolean;
  is_insured: boolean;
  is_background_checked: boolean;
  status: ContractorStatus;
  profile_visible: boolean;
  rejection_reason: string | null;
  stripe_customer_id: string | null;
  ranking_score: number;
  response_time_hours: number | null;
  avatar_url: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  avg_rating?: number;
  review_count?: number;
  photos?: ContractorPhoto[];
  subscription?: ContractorSubscription;
}

export interface ContractorPhoto {
  id: string;
  contractor_id: string;
  storage_path: string;
  public_url: string;
  caption: string | null;
  sort_order: number;
  created_at: string;
}

export interface ContractorDocument {
  id: string;
  contractor_id: string;
  doc_type: DocType;
  storage_path: string;
  file_name: string;
  verified: boolean;
  verified_at: string | null;
  verified_by: string | null;
  created_at: string;
}

export interface ContractorSubscription {
  id: string;
  contractor_id: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  stripe_price_id: string;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  trial_end: string | null;
  failed_payment_count: number;
  last_failed_at: string | null;
  suspended_at: string | null;
  canceled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentEvent {
  id: string;
  contractor_id: string | null;
  stripe_event_id: string;
  event_type: string;
  amount_cents: number | null;
  currency: string;
  status: string | null;
  failure_reason: string | null;
  invoice_id: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  contractor_id: string;
  homeowner_id: string | null;
  reviewer_name: string;
  rating: number;
  title: string | null;
  body: string;
  project_type: string | null;
  is_verified: boolean;
  is_flagged: boolean;
  flag_reason: string | null;
  is_published: boolean;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuoteRequest {
  id: string;
  homeowner_id: string | null;
  contractor_id: string;
  service_type: string;
  description: string | null;
  budget_range: string | null;
  city: string | null;
  state_code: string | null;
  zip_code: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  status: QuoteStatus;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  admin_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

// Admin Stats shape
export interface AdminStats {
  contractors: {
    total: number;
    active: number;
    pending: number;
    suspended: number;
    canceled: number;
    new_this_month: number;
  };
  revenue: {
    mrr: number;
    arr: number;
    this_month: number;
    last_month: number;
    growth_pct: number;
  };
  homeowners: {
    total: number;
    new_this_month: number;
  };
  platform: {
    avg_rating: number;
    reviews_total: number;
    quote_requests_total: number;
  };
}
