/**
 * Smart Choice Constructions — Contractor Ranking Algorithm
 * Version 1.0
 *
 * ════════════════════════════════════════════════════════════════
 * OVERVIEW
 * ════════════════════════════════════════════════════════════════
 *
 * The ranking algorithm produces a score from 0 to 100 for each
 * contractor. This score determines their position in search results
 * for a given query, weighted against geographic relevance.
 *
 * The algorithm is designed to:
 *   1. Reward genuine quality signals (reviews, ratings)
 *   2. Reward completeness (homeowners get better info)
 *   3. Reward verified credentials (platform trust)
 *   4. Penalize inactivity and incomplete profiles
 *   5. Remain resistant to gaming (no single factor dominates)
 *
 * ════════════════════════════════════════════════════════════════
 * SCORE BREAKDOWN (total: 100 points)
 * ════════════════════════════════════════════════════════════════
 *
 * ┌─────────────────────────────────┬────────┬────────────────────────┐
 * │ Factor                          │ Points │ Notes                  │
 * ├─────────────────────────────────┼────────┼────────────────────────┤
 * │ Profile completeness            │   25   │ See breakdown below    │
 * │ Review quality (rating + count) │   25   │ Logarithmic scaling    │
 * │ Credentials verified            │   20   │ Per-badge points       │
 * │ Response time                   │   10   │ Inverse of avg hours   │
 * │ Subscription & tenure           │    8   │ Active + duration      │
 * │ Recency (last activity)         │    7   │ Penalises stale profiles│
 * │ Photo quality (count)           │    5   │ Capped at 20 photos    │
 * └─────────────────────────────────┴────────┴────────────────────────┘
 *
 * ════════════════════════════════════════════════════════════════
 * PROFILE COMPLETENESS (25 pts)
 * ════════════════════════════════════════════════════════════════
 *   Company name        +3
 *   Description ≥80ch   +4
 *   Phone number        +3
 *   Service categories  +3
 *   Service area set    +3
 *   Business hours set  +2
 *   Website URL         +2
 *   Social media (any)  +1
 *   Years of experience +2
 *   Emergency service   +2
 *
 * ════════════════════════════════════════════════════════════════
 * REVIEW QUALITY (25 pts)
 * ════════════════════════════════════════════════════════════════
 *   Rating component  = (rating - 1) / 4 × 15   (0–15 pts)
 *     – Uses (rating - 1) / 4 so 5★ → 15pts, 1★ → 0pts
 *   Count component   = min(ln(count + 1) / ln(21), 1) × 10 (0–10 pts)
 *     – Logarithmic so first reviews matter most
 *     – 20+ reviews reaches maximum (10 pts)
 *     – 0 reviews → 0 pts, 5 reviews → ~6.5 pts
 *
 * ════════════════════════════════════════════════════════════════
 * CREDENTIALS (20 pts)
 * ════════════════════════════════════════════════════════════════
 *   identity_verified   +4
 *   business_verified   +3
 *   license_verified    +5
 *   insured             +4
 *   background_verified +4
 *   (badges must be active — expired docs do not count)
 *
 * ════════════════════════════════════════════════════════════════
 * RESPONSE TIME (10 pts)
 * ════════════════════════════════════════════════════════════════
 *   < 30 min  → 10 pts
 *   < 1 hour  → 8 pts
 *   < 2 hours → 6 pts
 *   < 4 hours → 4 pts
 *   < 8 hours → 2 pts
 *   ≥ 8 hours → 0 pts
 *   No data   → 0 pts (new contractors start at 0)
 *
 * ════════════════════════════════════════════════════════════════
 * SUBSCRIPTION & TENURE (8 pts)
 * ════════════════════════════════════════════════════════════════
 *   Active subscription +5
 *   3–11 months active  +1
 *   12–23 months active +2
 *   24+ months active   +3
 *   (past_due → +2 only during grace period)
 *   (suspended / canceled → 0 and hidden from results)
 *
 * ════════════════════════════════════════════════════════════════
 * RECENCY (7 pts)
 * ════════════════════════════════════════════════════════════════
 *   Updated within 7 days   → 7 pts
 *   Updated within 30 days  → 5 pts
 *   Updated within 90 days  → 3 pts
 *   Updated within 180 days → 1 pt
 *   Not updated > 180 days  → 0 pts
 *
 * ════════════════════════════════════════════════════════════════
 * PHOTOS (5 pts)
 * ════════════════════════════════════════════════════════════════
 *   1–4 photos  → 1 pt
 *   5–9 photos  → 3 pts
 *   10–19 photos → 4 pts
 *   20+ photos  → 5 pts
 *
 * ════════════════════════════════════════════════════════════════
 * GEOGRAPHIC BOOST (applied after base score)
 * ════════════════════════════════════════════════════════════════
 *   When a homeowner searches with a specific ZIP or city, contractors
 *   whose primary city matches receive a 1.15× multiplier on their
 *   base score. Contractors serving the ZIP via service radius receive
 *   a 1.0× multiplier (no boost, but not penalized).
 *
 *   This prevents distant contractors from outranking local specialists
 *   purely on score, while still allowing high-quality distant
 *   contractors to appear lower in results.
 *
 * ════════════════════════════════════════════════════════════════
 * FEATURED BOOST
 * ════════════════════════════════════════════════════════════════
 *   Contractors with the 'featured' badge receive a 1.25× multiplier,
 *   capped at 100. Featured badges are manually assigned by admins for
 *   exceptional profiles and are not purchasable.
 *
 * ════════════════════════════════════════════════════════════════
 * WHAT THE ALGORITHM DOES NOT CONSIDER
 * ════════════════════════════════════════════════════════════════
 *   - Subscription price tier (one flat price for all)
 *   - Paid placement or promoted listings
 *   - Advertiser relationships
 *   - Profile views or click-through rate
 *   - Number of quote requests received
 *
 * ════════════════════════════════════════════════════════════════
 * RECALCULATION SCHEDULE
 * ════════════════════════════════════════════════════════════════
 *   Scores recalculate every 24 hours via a scheduled job.
 *   Immediate recalculation is triggered by:
 *   - A new review being published
 *   - A document being approved or revoked
 *   - A profile being updated by the contractor
 *   - Subscription status change
 */

import type { BadgeId } from "./badges";

export interface RankingInput {
  // Profile
  hasCompanyName:     boolean;
  descriptionLength:  number;
  hasPhone:           boolean;
  serviceCount:       number;
  hasServiceArea:     boolean;
  hasHours:           boolean;
  hasWebsite:         boolean;
  hasSocial:          boolean;
  yearsExp:           number;
  hasEmergency:       boolean;
  photoCount:         number;

  // Reviews
  rating:             number;   // 1.0 – 5.0
  reviewCount:        number;

  // Credentials
  activeBadges:       BadgeId[];

  // Responsiveness
  avgResponseHours:   number | null;

  // Subscription
  subscriptionStatus: "active" | "past_due" | "suspended" | "canceled";
  membershipMonths:   number;

  // Recency
  daysSinceLastUpdate: number;

  // Boosts
  isFeatured:         boolean;
  isLocalMatch:       boolean;
}

export interface RankingScore {
  total:           number;       // 0–100 (before boosts can slightly exceed 100)
  breakdown: {
    completeness:  number;       // 0–25
    reviews:       number;       // 0–25
    credentials:   number;       // 0–20
    responseTime:  number;       // 0–10
    subscription:  number;       // 0–8
    recency:       number;       // 0–7
    photos:        number;       // 0–5
  };
  percentile:      number;       // 0–100 (rank among all active contractors)
  label:           string;       // "Excellent" | "Strong" | "Good" | "Building" | "Incomplete"
  topSuggestion:   string | null; // The single most impactful improvement
}

const CREDENTIAL_POINTS: Partial<Record<BadgeId, number>> = {
  identity_verified:   4,
  business_verified:   3,
  license_verified:    5,
  insured:             4,
  background_verified: 4,
};

export function calculateRankingScore(input: RankingInput): RankingScore {
  // ── Completeness (0–25) ──────────────────────────────────────────
  let completeness = 0;
  if (input.hasCompanyName)           completeness += 3;
  if (input.descriptionLength >= 80)  completeness += 4;
  if (input.hasPhone)                 completeness += 3;
  if (input.serviceCount > 0)         completeness += 3;
  if (input.hasServiceArea)           completeness += 3;
  if (input.hasHours)                 completeness += 2;
  if (input.hasWebsite)               completeness += 2;
  if (input.hasSocial)                completeness += 1;
  if (input.yearsExp > 0)             completeness += 2;
  if (input.hasEmergency)             completeness += 2;

  // ── Reviews (0–25) ──────────────────────────────────────────────
  const ratingComponent = input.reviewCount > 0
    ? ((input.rating - 1) / 4) * 15
    : 0;
  const countComponent = input.reviewCount > 0
    ? Math.min(Math.log(input.reviewCount + 1) / Math.log(21), 1) * 10
    : 0;
  const reviews = Math.round((ratingComponent + countComponent) * 10) / 10;

  // ── Credentials (0–20) ──────────────────────────────────────────
  let credentials = 0;
  for (const badge of input.activeBadges) {
    credentials += CREDENTIAL_POINTS[badge] ?? 0;
  }
  credentials = Math.min(credentials, 20);

  // ── Response Time (0–10) ────────────────────────────────────────
  let responseTime = 0;
  if (input.avgResponseHours !== null) {
    const h = input.avgResponseHours;
    if (h < 0.5)     responseTime = 10;
    else if (h < 1)  responseTime = 8;
    else if (h < 2)  responseTime = 6;
    else if (h < 4)  responseTime = 4;
    else if (h < 8)  responseTime = 2;
  }

  // ── Subscription & Tenure (0–8) ─────────────────────────────────
  let subscription = 0;
  if (input.subscriptionStatus === "active") {
    subscription += 5;
    if (input.membershipMonths >= 24)      subscription += 3;
    else if (input.membershipMonths >= 12) subscription += 2;
    else if (input.membershipMonths >= 3)  subscription += 1;
  } else if (input.subscriptionStatus === "past_due") {
    subscription = 2; // grace period — still partially ranked
  }

  // ── Recency (0–7) ───────────────────────────────────────────────
  let recency = 0;
  const d = input.daysSinceLastUpdate;
  if (d <= 7)       recency = 7;
  else if (d <= 30) recency = 5;
  else if (d <= 90) recency = 3;
  else if (d <= 180)recency = 1;

  // ── Photos (0–5) ────────────────────────────────────────────────
  let photos = 0;
  const p = input.photoCount;
  if (p >= 20)     photos = 5;
  else if (p >= 10)photos = 4;
  else if (p >= 5) photos = 3;
  else if (p >= 1) photos = 1;

  // ── Base total ──────────────────────────────────────────────────
  let total = completeness + reviews + credentials + responseTime + subscription + recency + photos;

  // ── Boosts ──────────────────────────────────────────────────────
  if (input.isLocalMatch) total *= 1.15;
  if (input.isFeatured)   total *= 1.25;
  total = Math.min(Math.round(total), 100);

  // ── Label ───────────────────────────────────────────────────────
  let label: RankingScore["label"];
  if (total >= 80)      label = "Excellent";
  else if (total >= 60) label = "Strong";
  else if (total >= 40) label = "Good";
  else if (total >= 20) label = "Building";
  else                  label = "Incomplete";

  // ── Top suggestion ──────────────────────────────────────────────
  let topSuggestion: string | null = null;
  if (!input.hasCompanyName || input.descriptionLength < 80 || !input.hasPhone) {
    topSuggestion = "Complete your basic profile information (name, description, phone).";
  } else if (input.photoCount < 5) {
    topSuggestion = `Add ${5 - input.photoCount} more portfolio photos to reach the 5-photo minimum.`;
  } else if (!input.activeBadges.includes("license_verified") && !input.activeBadges.includes("insured")) {
    topSuggestion = "Submit your contractor license and Certificate of Insurance for credential badges (+9 pts).";
  } else if (!input.activeBadges.includes("identity_verified")) {
    topSuggestion = "Verify your identity to unlock the Identity Verified badge (+4 pts).";
  } else if (input.reviewCount < 5) {
    topSuggestion = "Ask satisfied clients to leave a review on your profile to build your rating.";
  } else if (!input.hasWebsite) {
    topSuggestion = "Add your website URL to your profile (+2 pts).";
  }

  // ── Estimated percentile (based on score) ───────────────────────
  // In production this compares against real DB data.
  // This formula approximates a right-skewed distribution.
  const percentile = Math.round(Math.pow(total / 100, 0.7) * 100);

  return {
    total,
    breakdown: {
      completeness: Math.min(completeness, 25),
      reviews:      Math.round(reviews * 10) / 10,
      credentials:  Math.min(credentials, 20),
      responseTime,
      subscription,
      recency,
      photos,
    },
    percentile,
    label,
    topSuggestion,
  };
}

/** Mock ranking for the contractor dashboard demo */
export const DEMO_RANKING: RankingScore = calculateRankingScore({
  hasCompanyName:      true,
  descriptionLength:   340,
  hasPhone:            true,
  serviceCount:        4,
  hasServiceArea:      true,
  hasHours:            true,
  hasWebsite:          false,
  hasSocial:           false,
  yearsExp:            18,
  hasEmergency:        false,
  photoCount:          6,
  rating:              4.9,
  reviewCount:         47,
  activeBadges:        ["identity_verified", "license_verified", "insured", "top_rated", "established", "featured"],
  avgResponseHours:    0.4,
  subscriptionStatus:  "active",
  membershipMonths:    6,
  daysSinceLastUpdate: 3,
  isFeatured:          true,
  isLocalMatch:        true,
});
