/**
 * Smart Choice Constructions — Badge & Credential System
 *
 * Architecture:
 * - Badges are NEVER assigned automatically
 * - Every badge requires submitted documentation AND admin approval
 * - Some badges (Top Rated, Fast Response) use platform-tracked metrics
 * - Expired documents automatically remove the corresponding badge
 *
 * In production: badge status is stored in the database per contractor
 * and recalculated on the fly. See docs/BADGES.md for full spec.
 */

export type BadgeId =
  | "identity_verified"
  | "business_verified"
  | "license_verified"
  | "insured"
  | "background_verified"
  | "top_rated"
  | "fast_response"
  | "featured"
  | "established";

export interface Badge {
  id:          BadgeId;
  label:       string;
  labelEs:     string;
  description: string;
  descEs:      string;
  icon:        string;
  color:       string;
  bgColor:     string;
  /** How this badge is earned */
  requirement: string;
  /** Whether it can expire */
  expires:     boolean;
  /** Admin must manually approve */
  adminApproval: boolean;
}

export const BADGES: Record<BadgeId, Badge> = {
  identity_verified: {
    id:          "identity_verified",
    label:       "Identity Verified",
    labelEs:     "Identidad Verificada",
    description: "Government-issued ID has been submitted and reviewed.",
    descEs:      "Se ha enviado y revisado una identificación emitida por el gobierno.",
    icon:        "✦",
    color:       "#1a56db",
    bgColor:     "rgba(26,86,219,0.08)",
    requirement: "Government-issued photo ID submitted and approved by admin",
    expires:     false,
    adminApproval: true,
  },
  business_verified: {
    id:          "business_verified",
    label:       "Business Verified",
    labelEs:     "Empresa Verificada",
    description: "Business registration documents have been submitted and reviewed.",
    descEs:      "Los documentos de registro de empresa han sido enviados y revisados.",
    icon:        "🏢",
    color:       "#0891b2",
    bgColor:     "rgba(8,145,178,0.08)",
    requirement: "EIN, LLC/Corp registration, or business license submitted and approved",
    expires:     false,
    adminApproval: true,
  },
  license_verified: {
    id:          "license_verified",
    label:       "License Verified",
    labelEs:     "Licencia Verificada",
    description: "A state contractor license has been submitted and reviewed.",
    descEs:      "Se ha enviado y revisado una licencia de contratista estatal.",
    icon:        "📋",
    color:       "#047857",
    bgColor:     "rgba(4,120,87,0.08)",
    requirement: "Valid state contractor license submitted, approved, and not expired",
    expires:     true,
    adminApproval: true,
  },
  insured: {
    id:          "insured",
    label:       "Insured",
    labelEs:     "Asegurado",
    description: "A Certificate of Insurance (COI) has been submitted and reviewed.",
    descEs:      "Se ha enviado y revisado un Certificado de Seguro (COI).",
    icon:        "🛡️",
    color:       "#6d28d9",
    bgColor:     "rgba(109,40,217,0.08)",
    requirement: "Valid COI showing general liability coverage submitted and not expired",
    expires:     true,
    adminApproval: true,
  },
  background_verified: {
    id:          "background_verified",
    label:       "Background Verified",
    labelEs:     "Antecedentes Verificados",
    description: "A recent background check report has been submitted and reviewed.",
    descEs:      "Se ha enviado y revisado un informe reciente de verificación de antecedentes.",
    icon:        "🔍",
    color:       "#b45309",
    bgColor:     "rgba(180,83,9,0.08)",
    requirement: "Background check report (within 12 months) submitted and approved",
    expires:     true,
    adminApproval: true,
  },
  top_rated: {
    id:          "top_rated",
    label:       "Top Rated",
    labelEs:     "Mejor Valorado",
    description: "Maintains an average rating of 4.8 or higher with at least 20 reviews.",
    descEs:      "Mantiene una valoración promedio de 4.8 o más con al menos 20 reseñas.",
    icon:        "⭐",
    color:       "#d97706",
    bgColor:     "rgba(217,119,6,0.08)",
    requirement: "Rating ≥ 4.8 AND review count ≥ 20 (recalculated weekly)",
    expires:     false,
    adminApproval: false, // automatic based on metrics
  },
  fast_response: {
    id:          "fast_response",
    label:       "Fast Response",
    labelEs:     "Respuesta Rápida",
    description: "Typically responds to inquiries within 2 hours.",
    descEs:      "Generalmente responde a las consultas en menos de 2 horas.",
    icon:        "⚡",
    color:       "#0891b2",
    bgColor:     "rgba(8,145,178,0.08)",
    requirement: "Average response time ≤ 2 hours over last 30 days (minimum 5 inquiries)",
    expires:     false,
    adminApproval: false, // automatic based on platform data
  },
  featured: {
    id:          "featured",
    label:       "Featured",
    labelEs:     "Destacado",
    description: "Selected by Smart Choice Constructions as a featured professional.",
    descEs:      "Seleccionado por Smart Choice Constructions como profesional destacado.",
    icon:        "✦",
    color:       "#162E5E",
    bgColor:     "rgba(22,46,94,0.08)",
    requirement: "Manually assigned by admin — exceptional profile, reviews, and service",
    expires:     false,
    adminApproval: true,
  },
  established: {
    id:          "established",
    label:       "Established Pro",
    labelEs:     "Profesional Establecido",
    description: "Has been an active member of Smart Choice for over 12 months.",
    descEs:      "Ha sido miembro activo de Smart Choice durante más de 12 meses.",
    icon:        "🏅",
    color:       "#374151",
    bgColor:     "rgba(55,65,81,0.08)",
    requirement: "Active subscription for 12+ consecutive months",
    expires:     false,
    adminApproval: false, // automatic based on tenure
  },
};

/**
 * Document types that contractors can submit
 */
export type DocumentType =
  | "government_id"
  | "business_registration"
  | "contractor_license"
  | "certificate_of_insurance"
  | "background_check"
  | "certification"
  | "other";

export interface ContractorDocument {
  id:           string;
  contractorId: string;
  type:         DocumentType;
  label:        string;       // e.g. "Texas Contractor License #TX-123456"
  status:       "pending" | "approved" | "rejected" | "expired";
  submittedAt:  Date;
  reviewedAt:   Date | null;
  expiresAt:    Date | null;
  adminNotes:   string | null;
  badgeAwarded: BadgeId | null;
}

/** Document type metadata */
export const DOCUMENT_TYPES: Record<DocumentType, { label: string; badge: BadgeId | null; acceptedFormats: string }> = {
  government_id:            { label: "Government-Issued ID",         badge: "identity_verified",   acceptedFormats: "PDF, JPG, PNG — max 10MB" },
  business_registration:    { label: "Business Registration",        badge: "business_verified",    acceptedFormats: "PDF — max 10MB" },
  contractor_license:       { label: "Contractor License",           badge: "license_verified",     acceptedFormats: "PDF, JPG, PNG — max 10MB" },
  certificate_of_insurance: { label: "Certificate of Insurance",     badge: "insured",              acceptedFormats: "PDF — max 10MB" },
  background_check:         { label: "Background Check Report",      badge: "background_verified",  acceptedFormats: "PDF — max 10MB" },
  certification:            { label: "Trade Certification / Permit", badge: null,                   acceptedFormats: "PDF, JPG, PNG — max 10MB" },
  other:                    { label: "Other Document",               badge: null,                   acceptedFormats: "PDF, JPG, PNG — max 10MB" },
};

/**
 * Returns the badges a contractor qualifies for based on their data.
 * In production this runs server-side with real DB data.
 */
export function getEarnedBadges(contractor: {
  documents: { type: DocumentType; status: string; expiresAt: Date | null }[];
  rating:    number;
  reviewCount: number;
  avgResponseHours: number;
  membershipMonths: number;
  isFeatured: boolean;
}): BadgeId[] {
  const badges: BadgeId[] = [];

  const hasApproved = (type: DocumentType) =>
    contractor.documents.some(
      d => d.type === type &&
           d.status === "approved" &&
           (d.expiresAt === null || d.expiresAt > new Date())
    );

  if (hasApproved("government_id"))            badges.push("identity_verified");
  if (hasApproved("business_registration"))    badges.push("business_verified");
  if (hasApproved("contractor_license"))       badges.push("license_verified");
  if (hasApproved("certificate_of_insurance")) badges.push("insured");
  if (hasApproved("background_check"))         badges.push("background_verified");

  if (contractor.rating >= 4.8 && contractor.reviewCount >= 20) badges.push("top_rated");
  if (contractor.avgResponseHours <= 2)                          badges.push("fast_response");
  if (contractor.membershipMonths >= 12)                         badges.push("established");
  if (contractor.isFeatured)                                     badges.push("featured");

  return badges;
}

/**
 * Mock badge data for demonstration — in production comes from DB
 */
export const MOCK_CONTRACTOR_BADGES: Record<string, BadgeId[]> = {
  "1": ["identity_verified", "license_verified", "insured", "top_rated", "established", "featured"],
  "2": ["identity_verified", "license_verified", "insured", "top_rated"],
  "3": ["identity_verified", "business_verified", "license_verified", "insured", "background_verified", "top_rated", "fast_response", "established"],
  "4": ["identity_verified", "insured"],
  "5": ["identity_verified", "license_verified", "top_rated", "fast_response"],
  "6": ["identity_verified", "license_verified", "insured", "top_rated", "fast_response"],
};
