"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type AvailStatus = "available" | "busy" | "on_vacation" | "not_accepting";

const AVAIL_MAP: Record<AvailStatus, { label: string; color: string; bg: string; dot: string }> = {
  available:      { label: "Available",              color: "#16a34a", bg: "rgba(22,163,74,0.1)",   dot: "#16a34a" },
  busy:           { label: "Busy",                   color: "#d97706", bg: "rgba(245,158,11,0.1)",  dot: "#d97706" },
  on_vacation:    { label: "On Vacation",            color: "#6366f1", bg: "rgba(99,102,241,0.1)",  dot: "#6366f1" },
  not_accepting:  { label: "Not Accepting Projects", color: "var(--gray-500)", bg: "var(--gray-100)", dot: "var(--gray-400)" },
};

interface QuoteLead {
  id: string;
  service_type: string;
  description: string | null;
  budget_range: string | null;
  contact_name: string;
  contact_email: string | null;
  contact_phone: string | null;
  city: string | null;
  state_code: string | null;
  zip_code: string | null;
  status: string;
  created_at: string;
}

interface Review {
  id: string;
  rating: number;
  reviewer_name: string;
  title: string | null;
  body: string;
  project_type: string | null;
  contractor_reply: string | null;
  contractor_reply_at: string | null;
  created_at: string;
}

interface DashboardData {
  contractor: {
    id: string;
    company_name: string;
    owner_first_name: string;
    status: string;
    profile_visible: boolean;
    category: string;
    state_code: string;
    city: string;
    ranking_score: number;
    avatar_url: string | null;
    is_licensed: boolean;
    is_insured: boolean;
    is_background_checked: boolean;
    description: string | null;
    website: string | null;
    facebook_url: string | null;
    instagram_url: string | null;
    linkedin_url: string | null;
    phone: string | null;
    open_time: string | null;
    close_time: string | null;
    working_days: string[];
    has_emergency: boolean;
    service_radius: string;
    additional_states: string[];
    additional_cities: string | null;
    years_experience: number;
    availability_status: AvailStatus;
    contractor_subscriptions: Array<{
      status: string;
      current_period_end: string | null;
      cancel_at_period_end: boolean;
      failed_payment_count: number;
    }>;
    contractor_photos: Array<{ id: string; public_url: string; sort_order: number }>;
  };
  stats: {
    quote_requests: number;
    total_reviews: number;
    avg_rating: number | null;
    profile_views: number;
    ranking_score: number;
  };
  recent_quotes:  QuoteLead[];
  recent_reviews: Review[];
  payments: Array<{
    id: string;
    event_type: string;
    amount_cents: number | null;
    status: string | null;
    created_at: string;
    failure_reason: string | null;
  }>;
}

function StatusChip({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    active:           { bg: "rgba(22,163,74,0.1)",  color: "#16a34a", label: "Active" },
    pending_approval: { bg: "rgba(99,102,241,0.1)", color: "#6366f1", label: "Under Review" },
    pending_payment:  { bg: "rgba(245,158,11,0.1)", color: "#d97706", label: "Payment Pending" },
    suspended:        { bg: "rgba(199,25,26,0.1)",  color: "var(--red)", label: "Suspended" },
    canceled:         { bg: "var(--gray-100)",      color: "var(--gray-500)", label: "Canceled" },
    rejected:         { bg: "rgba(239,68,68,0.1)",  color: "#dc2626", label: "Rejected" },
  };
  const s = map[status] ?? map.pending_approval;
  return (
    <span style={{ background: s.bg, color: s.color, padding: "0.3rem 0.875rem", borderRadius: "999px", fontSize: "0.875rem", fontWeight: 700 }}>
      {s.label}
    </span>
  );
}

const DOC_TYPES = [
  { value: "license",           label: "Contractor License" },
  { value: "insurance",         label: "Insurance Certificate" },
  { value: "background_check",  label: "Background Check" },
  { value: "certification",     label: "Trade Certification" },
  { value: "other",             label: "Other Document" },
];

interface ContractorDoc {
  id: string; doc_type: string; file_name: string;
  status: string; notes?: string; created_at: string;
}

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

function LeadStatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; bg: string }> = {
    pending:   { color: "#d97706", bg: "rgba(245,158,11,0.1)" },
    viewed:    { color: "#6366f1", bg: "rgba(99,102,241,0.1)" },
    responded: { color: "#16a34a", bg: "rgba(22,163,74,0.1)" },
    completed: { color: "#0369a1", bg: "rgba(3,105,161,0.1)" },
    declined:  { color: "var(--gray-500)", bg: "var(--gray-100)" },
  };
  const s = map[status] ?? map.pending;
  return (
    <span style={{ background: s.bg, color: s.color, padding: "0.15rem 0.625rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700, textTransform: "capitalize" }}>
      {status}
    </span>
  );
}

export default function ContractorDashboard() {
  const [data, setData]           = useState<DashboardData | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [portalLoading, setPortalLoading] = useState(false);
  const [docs, setDocs]           = useState<ContractorDoc[]>([]);
  const [docType, setDocType]     = useState("license");
  const [uploading, setUploading] = useState(false);
  const [docMsg, setDocMsg]       = useState("");

  // Availability
  const [avail, setAvail]               = useState<AvailStatus>("available");
  const [availSaving, setAvailSaving]   = useState(false);

  // Profile editing
  const [editOpen, setEditOpen]         = useState(false);
  const [profileForm, setProfileForm]   = useState({
    description: "", website: "", facebook_url: "", instagram_url: "", linkedin_url: "",
    phone: "", open_time: "08:00", close_time: "17:00",
    working_days: [] as string[], has_emergency: false,
    service_radius: "25", additional_cities: "", years_experience: 0,
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg]       = useState("");

  // Avatar upload
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarMsg, setAvatarMsg]             = useState("");
  const [currentAvatar, setCurrentAvatar]     = useState<string | null>(null);

  // Lead detail modal
  const [selectedLead, setSelectedLead] = useState<QuoteLead | null>(null);

  // Review replies
  const [replyOpen,  setReplyOpen]  = useState<Record<string, boolean>>({});
  const [replyText,  setReplyText]  = useState<Record<string, string>>({});
  const [replySaving, setReplySaving] = useState<Record<string, boolean>>({});
  const [replyMsg,   setReplyMsg]   = useState<Record<string, string>>({});
  const [reviews,    setReviews]    = useState<Review[]>([]);

  useEffect(() => {
    fetch("/api/dashboard/contractor")
      .then(r => r.json())
      .then(d => {
        if (d.error) { setError(d.error); return; }
        setData(d);
        const c = d.contractor;
        setAvail((c.availability_status ?? "available") as AvailStatus);
        setCurrentAvatar(c.avatar_url ?? null);
        setProfileForm({
          description:      c.description ?? "",
          website:          c.website ?? "",
          facebook_url:     c.facebook_url ?? "",
          instagram_url:    c.instagram_url ?? "",
          linkedin_url:     c.linkedin_url ?? "",
          phone:            c.phone ?? "",
          open_time:        c.open_time ?? "08:00",
          close_time:       c.close_time ?? "17:00",
          working_days:     c.working_days ?? [],
          has_emergency:    c.has_emergency ?? false,
          service_radius:   c.service_radius ?? "25",
          additional_cities: c.additional_cities ?? "",
          years_experience: c.years_experience ?? 0,
        });
        const rv = d.recent_reviews ?? [];
        setReviews(rv);
        const initialText: Record<string, string> = {};
        rv.forEach((r: Review) => { initialText[r.id] = r.contractor_reply ?? ""; });
        setReplyText(initialText);
      })
      .catch(() => setError("Failed to load dashboard"))
      .finally(() => setLoading(false));
    fetch("/api/dashboard/contractor/documents")
      .then(r => r.ok ? r.json() : { documents: [] })
      .then(d => setDocs(d.documents ?? []))
      .catch(() => {});
  }, []);

  async function saveAvailability(status: AvailStatus) {
    setAvail(status);
    setAvailSaving(true);
    await fetch("/api/dashboard/contractor", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ availability_status: status }),
    });
    setAvailSaving(false);
  }

  async function saveProfile() {
    setProfileSaving(true);
    setProfileMsg("");
    const res = await fetch("/api/dashboard/contractor", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profileForm),
    });
    if (res.ok) {
      setProfileMsg("Profile updated successfully.");
      setData(prev => prev ? { ...prev, contractor: { ...prev.contractor, ...profileForm } } : prev);
      setEditOpen(false);
    } else {
      const d = await res.json();
      setProfileMsg(d.error ?? "Failed to save.");
    }
    setProfileSaving(false);
    setTimeout(() => setProfileMsg(""), 4000);
  }

  async function uploadAvatar(file: File) {
    setAvatarUploading(true);
    setAvatarMsg("");
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "contractor-avatars");
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const d = await res.json();
    if (!res.ok || !d.url) { setAvatarMsg(d.error ?? "Upload failed."); setAvatarUploading(false); return; }

    const patchRes = await fetch("/api/dashboard/contractor/avatar", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatar_url: d.url }),
    });
    if (patchRes.ok) {
      setCurrentAvatar(d.url);
      setAvatarMsg("Profile photo updated!");
    } else {
      setAvatarMsg("Photo uploaded but profile not updated. Please try again.");
    }
    setAvatarUploading(false);
    setTimeout(() => setAvatarMsg(""), 4000);
  }

  async function uploadDoc(file: File) {
    setUploading(true); setDocMsg("");
    const fd = new FormData();
    fd.append("file", file);
    fd.append("doc_type", docType);
    const res = await fetch("/api/dashboard/contractor/documents", { method: "POST", body: fd });
    const d = await res.json();
    if (res.ok) {
      setDocs(prev => [d.document, ...prev]);
      setDocMsg("Document uploaded. Our team will review it within 1 business day.");
    } else {
      setDocMsg(d.error ?? "Upload failed.");
    }
    setUploading(false);
  }

  async function deleteDoc(id: string) {
    if (!confirm("Remove this document?")) return;
    await fetch(`/api/dashboard/contractor/documents?id=${id}`, { method: "DELETE" });
    setDocs(prev => prev.filter(d => d.id !== id));
  }

  async function saveReply(reviewId: string) {
    setReplySaving(p => ({ ...p, [reviewId]: true }));
    setReplyMsg(p => ({ ...p, [reviewId]: "" }));
    const res = await fetch("/api/dashboard/contractor/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ review_id: reviewId, reply: replyText[reviewId] ?? "" }),
    });
    if (res.ok) {
      const txt = replyText[reviewId]?.trim() ?? "";
      setReviews(prev => prev.map(r => r.id === reviewId
        ? { ...r, contractor_reply: txt || null, contractor_reply_at: txt ? new Date().toISOString() : null }
        : r
      ));
      setReplyOpen(p => ({ ...p, [reviewId]: false }));
      setReplyMsg(p => ({ ...p, [reviewId]: txt ? "Reply saved." : "Reply removed." }));
    } else {
      const d = await res.json();
      setReplyMsg(p => ({ ...p, [reviewId]: d.error ?? "Failed to save reply." }));
    }
    setReplySaving(p => ({ ...p, [reviewId]: false }));
    setTimeout(() => setReplyMsg(p => ({ ...p, [reviewId]: "" })), 4000);
  }

  async function openLeadDetail(lead: QuoteLead) {
    setSelectedLead(lead);
    if (lead.status === "pending") {
      await fetch("/api/dashboard/contractor/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quote_id: lead.id, status: "viewed" }),
      }).catch(() => {});
      setData(prev => {
        if (!prev) return prev;
        return { ...prev, recent_quotes: prev.recent_quotes.map(q => q.id === lead.id ? { ...q, status: "viewed" } : q) };
      });
    }
  }

  const openBillingPortal = async () => {
    setPortalLoading(true);
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const d   = await res.json();
    if (d.url) window.location.href = d.url;
    else { alert("Failed to open billing portal."); setPortalLoading(false); }
  };

  if (loading) {
    return (
      <div style={{ paddingTop: "76px", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⏳</div>
          <p style={{ color: "var(--gray-500)" }}>Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ paddingTop: "76px", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⚠️</div>
          <p style={{ color: "var(--red)", marginBottom: "1rem" }}>{error || "Dashboard unavailable"}</p>
          <Link href="/login" className="btn-red" style={{ padding: "0.75rem 2rem" }}>Sign In Again</Link>
        </div>
      </div>
    );
  }

  const { contractor, stats, recent_quotes } = data;
  const sub = contractor.contractor_subscriptions[0];
  const initials = contractor.company_name.slice(0, 2).toUpperCase();

  return (
    <div style={{ paddingTop: "76px", minHeight: "100vh", background: "var(--gray-50)" }}>

      {/* Lead detail modal */}
      {selectedLead && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
          onClick={e => { if (e.target === e.currentTarget) setSelectedLead(null); }}
        >
          <div style={{ background: "white", borderRadius: "var(--radius-xl)", padding: "2rem", maxWidth: "560px", width: "100%", maxHeight: "90vh", overflow: "auto", boxShadow: "var(--shadow-xl)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
              <div>
                <h2 style={{ fontWeight: 700, color: "var(--navy)", fontSize: "1.25rem", marginBottom: "0.375rem" }}>{selectedLead.service_type}</h2>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <LeadStatusBadge status={selectedLead.status} />
                  <span style={{ fontSize: "0.8125rem", color: "var(--gray-400)" }}>{new Date(selectedLead.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <button onClick={() => setSelectedLead(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.5rem", color: "var(--gray-400)", padding: "0", lineHeight: 1 }}>×</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {/* Contact info */}
              <div style={{ background: "var(--gray-50)", borderRadius: "var(--radius)", padding: "1.25rem" }}>
                <div style={{ fontWeight: 700, color: "var(--navy)", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.875rem" }}>Contact Info</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span style={{ fontSize: "1rem" }}>👤</span>
                    <span style={{ fontWeight: 600, color: "var(--gray-800)" }}>{selectedLead.contact_name}</span>
                  </div>
                  {selectedLead.contact_phone && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <span style={{ fontSize: "1rem" }}>📞</span>
                      <a href={`tel:${selectedLead.contact_phone}`} style={{ color: "var(--navy)", fontWeight: 600, textDecoration: "none" }}>{selectedLead.contact_phone}</a>
                    </div>
                  )}
                  {selectedLead.contact_email && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <span style={{ fontSize: "1rem" }}>✉️</span>
                      <a href={`mailto:${selectedLead.contact_email}`} style={{ color: "var(--navy)", fontWeight: 600, textDecoration: "none", wordBreak: "break-all" }}>{selectedLead.contact_email}</a>
                    </div>
                  )}
                  {(selectedLead.city || selectedLead.state_code) && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <span style={{ fontSize: "1rem" }}>📍</span>
                      <span style={{ color: "var(--gray-600)" }}>
                        {[selectedLead.city, selectedLead.state_code, selectedLead.zip_code].filter(Boolean).join(", ")}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Project details */}
              {(selectedLead.description || selectedLead.budget_range) && (
                <div style={{ background: "var(--gray-50)", borderRadius: "var(--radius)", padding: "1.25rem" }}>
                  <div style={{ fontWeight: 700, color: "var(--navy)", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.875rem" }}>Project Details</div>
                  {selectedLead.budget_range && (
                    <div style={{ display: "flex", gap: "0.75rem", marginBottom: "0.75rem" }}>
                      <span style={{ fontWeight: 600, color: "var(--gray-600)", minWidth: "80px" }}>Budget:</span>
                      <span style={{ color: "var(--gray-800)", fontWeight: 600 }}>{selectedLead.budget_range}</span>
                    </div>
                  )}
                  {selectedLead.description && (
                    <div>
                      <div style={{ fontWeight: 600, color: "var(--gray-600)", marginBottom: "0.375rem" }}>Description:</div>
                      <p style={{ color: "var(--gray-700)", lineHeight: 1.7, margin: 0, fontSize: "0.9375rem" }}>{selectedLead.description}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                {selectedLead.contact_phone && (
                  <a href={`tel:${selectedLead.contact_phone}`} className="btn-red" style={{ flex: 1, textAlign: "center", padding: "0.75rem", fontSize: "0.9375rem", textDecoration: "none" }}>
                    📞 Call Now
                  </a>
                )}
                {selectedLead.contact_email && (
                  <a href={`mailto:${selectedLead.contact_email}?subject=Re: ${encodeURIComponent(selectedLead.service_type)} Quote Request`} className="btn-secondary" style={{ flex: 1, textAlign: "center", padding: "0.75rem", fontSize: "0.9375rem", textDecoration: "none" }}>
                    ✉️ Send Email
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container" style={{ maxWidth: "1100px", padding: "2.5rem 1.5rem" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
            {/* Avatar */}
            <div style={{ position: "relative" }}>
              <div style={{
                width: "64px", height: "64px", borderRadius: "50%", flexShrink: 0,
                background: currentAvatar ? "transparent" : "var(--navy)",
                backgroundImage: currentAvatar ? `url(${currentAvatar})` : "none",
                backgroundSize: "cover", backgroundPosition: "center",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "white", fontWeight: 800, fontSize: "1.25rem",
                border: "3px solid white", boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              }}>
                {!currentAvatar && initials}
              </div>
              <label title="Change profile photo" style={{
                position: "absolute", bottom: -2, right: -2,
                width: "22px", height: "22px", borderRadius: "50%",
                background: "var(--navy)", color: "white",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: avatarUploading ? "not-allowed" : "pointer",
                fontSize: "0.625rem", border: "2px solid white",
              }}>
                {avatarUploading ? "…" : "✏️"}
                <input type="file" accept="image/*" style={{ display: "none" }} disabled={avatarUploading}
                  onChange={e => { const f = e.target.files?.[0]; if (f) uploadAvatar(f); e.target.value = ""; }} />
              </label>
            </div>
            <div>
              <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--navy)", marginBottom: "0.5rem" }}>
                Welcome, {contractor.owner_first_name}
              </h1>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                <StatusChip status={contractor.status} />
                {contractor.profile_visible && (
                  <span style={{ fontSize: "0.8125rem", color: "#16a34a", fontWeight: 600 }}>● Profile is live</span>
                )}
              </div>
              {avatarMsg && <div style={{ fontSize: "0.8125rem", color: avatarMsg.includes("!") ? "#16a34a" : "var(--red)", marginTop: "0.375rem" }}>{avatarMsg}</div>}
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <Link href="/dashboard/messages" className="btn-secondary" style={{ padding: "0.625rem 1.25rem", fontSize: "0.875rem" }}>
              💬 Messages
            </Link>
            {contractor.status === "active" && (
              <Link href={`/contractors/${contractor.id}`} className="btn-secondary" style={{ padding: "0.625rem 1.25rem", fontSize: "0.875rem" }}>
                View Public Profile →
              </Link>
            )}
            {sub && (
              <button onClick={openBillingPortal} disabled={portalLoading} className="btn-red" style={{ padding: "0.625rem 1.25rem", fontSize: "0.875rem", opacity: portalLoading ? 0.7 : 1 }}>
                {portalLoading ? "Opening…" : "Manage Subscription"}
              </button>
            )}
          </div>
        </div>

        {/* Status notices */}
        {contractor.status === "pending_approval" && (
          <div style={{ background: "rgba(99,102,241,0.08)", border: "1.5px solid rgba(99,102,241,0.25)", borderRadius: "var(--radius)", padding: "1.25rem 1.5rem", marginBottom: "1.5rem" }}>
            <div style={{ fontWeight: 700, color: "#6366f1", marginBottom: "0.375rem" }}>Profile under review</div>
            <p style={{ color: "var(--gray-600)", fontSize: "0.9375rem", lineHeight: 1.65, margin: 0 }}>
              Your profile is being reviewed by our team — typically less than 24 hours. We'll email you once it's approved.
            </p>
          </div>
        )}

        {sub?.status === "past_due" && (
          <div style={{ background: "rgba(245,158,11,0.08)", border: "1.5px solid rgba(245,158,11,0.3)", borderRadius: "var(--radius)", padding: "1.25rem 1.5rem", marginBottom: "1.5rem" }}>
            <div style={{ fontWeight: 700, color: "#d97706", marginBottom: "0.375rem" }}>Payment past due</div>
            <p style={{ color: "var(--gray-600)", fontSize: "0.9375rem", margin: "0 0 0.75rem" }}>
              Your payment has failed {sub.failed_payment_count} time(s). Update your payment method to keep your profile active.
            </p>
            <button onClick={openBillingPortal} style={{ padding: "0.5rem 1.25rem", background: "#d97706", color: "white", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", fontSize: "0.875rem" }}>
              Update Payment Method
            </button>
          </div>
        )}

        {/* Availability + Profile quick actions */}
        {contractor.status === "active" && (
          <div className="card" style={{ padding: "1.25rem 1.5rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5rem" }}>
                  Availability {availSaving && <span style={{ fontWeight: 400, fontSize: "0.7rem" }}>saving…</span>}
                </div>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  {(Object.entries(AVAIL_MAP) as [AvailStatus, typeof AVAIL_MAP[AvailStatus]][]).map(([key, val]) => (
                    <button key={key} onClick={() => saveAvailability(key)}
                      style={{
                        padding: "0.375rem 0.875rem", borderRadius: "999px", fontSize: "0.8125rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", border: "1.5px solid",
                        background: avail === key ? val.bg : "white",
                        color: avail === key ? val.color : "var(--gray-500)",
                        borderColor: avail === key ? val.color : "var(--gray-200)",
                      }}>
                      <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", background: val.dot, marginRight: "0.375rem", verticalAlign: "middle" }} />
                      {val.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button onClick={() => setEditOpen(o => !o)} className="btn-secondary" style={{ padding: "0.625rem 1.25rem", fontSize: "0.875rem" }}>
              {editOpen ? "Close Editor" : "✏️ Edit Profile"}
            </button>
          </div>
        )}

        {/* Profile editor */}
        {editOpen && (
          <div className="card" style={{ padding: "2rem", marginBottom: "1.5rem" }}>
            <h2 style={{ fontWeight: 700, color: "var(--navy)", fontSize: "1.0625rem", marginBottom: "1.75rem" }}>Edit Profile</h2>
            {profileMsg && (
              <div style={{ padding: "0.75rem 1rem", marginBottom: "1.25rem", borderRadius: "var(--radius-sm)", fontSize: "0.875rem", background: profileMsg.includes("Failed") ? "rgba(199,25,26,0.08)" : "rgba(22,163,74,0.08)", color: profileMsg.includes("Failed") ? "var(--red)" : "#16a34a", border: `1px solid ${profileMsg.includes("Failed") ? "rgba(199,25,26,0.2)" : "rgba(22,163,74,0.2)"}` }}>
                {profileMsg}
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
              <div style={{ gridColumn: "1/-1" }}>
                <label className="form-label">Business Description</label>
                <textarea className="form-input" rows={4} style={{ resize: "vertical" }}
                  value={profileForm.description}
                  onChange={e => setProfileForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Describe your services, experience, and what makes your business stand out…" />
              </div>
              <div>
                <label className="form-label">Phone Number</label>
                <input className="form-input" value={profileForm.phone}
                  onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                  placeholder="+1 (555) 000-0000" />
              </div>
              <div>
                <label className="form-label">Website</label>
                <input className="form-input" value={profileForm.website}
                  onChange={e => setProfileForm(p => ({ ...p, website: e.target.value }))}
                  placeholder="https://yourwebsite.com" />
              </div>
              <div>
                <label className="form-label">Facebook URL</label>
                <input className="form-input" value={profileForm.facebook_url}
                  onChange={e => setProfileForm(p => ({ ...p, facebook_url: e.target.value }))}
                  placeholder="https://facebook.com/yourbusiness" />
              </div>
              <div>
                <label className="form-label">Instagram URL</label>
                <input className="form-input" value={profileForm.instagram_url}
                  onChange={e => setProfileForm(p => ({ ...p, instagram_url: e.target.value }))}
                  placeholder="https://instagram.com/yourhandle" />
              </div>
              <div>
                <label className="form-label">Years of Experience</label>
                <input className="form-input" type="number" min="0" max="100"
                  value={profileForm.years_experience}
                  onChange={e => setProfileForm(p => ({ ...p, years_experience: parseInt(e.target.value) || 0 }))} />
              </div>
              <div>
                <label className="form-label">Service Radius (miles)</label>
                <select className="form-select" value={profileForm.service_radius}
                  onChange={e => setProfileForm(p => ({ ...p, service_radius: e.target.value }))}>
                  {["10","25","50","100","Statewide","National"].map(r => <option key={r} value={r}>{r} {parseInt(r) ? "miles" : ""}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Business Hours</label>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <input className="form-input" type="time" value={profileForm.open_time}
                    onChange={e => setProfileForm(p => ({ ...p, open_time: e.target.value }))}
                    style={{ flex: 1 }} />
                  <span style={{ color: "var(--gray-400)" }}>to</span>
                  <input className="form-input" type="time" value={profileForm.close_time}
                    onChange={e => setProfileForm(p => ({ ...p, close_time: e.target.value }))}
                    style={{ flex: 1 }} />
                </div>
              </div>
              <div style={{ gridColumn: "1/-1" }}>
                <label className="form-label">Working Days</label>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  {DAYS.map(d => (
                    <label key={d} style={{ display: "flex", alignItems: "center", gap: "0.375rem", padding: "0.375rem 0.75rem", border: "1.5px solid", borderRadius: "var(--radius-sm)", cursor: "pointer", fontSize: "0.875rem", fontWeight: 500,
                      borderColor: profileForm.working_days.includes(d) ? "var(--navy)" : "var(--gray-200)",
                      background:  profileForm.working_days.includes(d) ? "rgba(22,46,94,0.06)" : "white",
                      color:       profileForm.working_days.includes(d) ? "var(--navy)" : "var(--gray-500)" }}>
                      <input type="checkbox" style={{ display: "none" }}
                        checked={profileForm.working_days.includes(d)}
                        onChange={e => setProfileForm(p => ({
                          ...p, working_days: e.target.checked
                            ? [...p.working_days, d]
                            : p.working_days.filter(x => x !== d),
                        }))} />
                      {d.slice(0, 3)}
                    </label>
                  ))}
                </div>
              </div>
              <div style={{ gridColumn: "1/-1", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <input type="checkbox" id="emergency"
                  checked={profileForm.has_emergency}
                  onChange={e => setProfileForm(p => ({ ...p, has_emergency: e.target.checked }))} />
                <label htmlFor="emergency" style={{ fontWeight: 600, color: "var(--gray-700)", fontSize: "0.9375rem", cursor: "pointer" }}>
                  Available for emergency / after-hours calls
                </label>
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.75rem", paddingTop: "1.5rem", borderTop: "1px solid var(--gray-100)" }}>
              <button onClick={saveProfile} disabled={profileSaving} className="btn-red" style={{ padding: "0.875rem 2rem", opacity: profileSaving ? 0.7 : 1 }}>
                {profileSaving ? "Saving…" : "Save Changes"}
              </button>
              <button onClick={() => setEditOpen(false)} className="btn-secondary" style={{ padding: "0.875rem 1.5rem" }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(170px,1fr))", gap: "1rem", marginBottom: "2rem" }}>
          {[
            { icon: "📨", label: "Quote Requests", value: stats.quote_requests.toString() },
            { icon: "⭐", label: "Avg Rating",      value: stats.avg_rating ? stats.avg_rating.toFixed(1) : "—" },
            { icon: "💬", label: "Total Reviews",   value: stats.total_reviews.toString() },
            { icon: "📊", label: "Ranking Score",   value: stats.ranking_score.toFixed(0) + "/100" },
          ].map(stat => (
            <div key={stat.label} className="card" style={{ padding: "1.25rem" }}>
              <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{stat.icon}</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--navy)", marginBottom: "0.25rem" }}>{stat.value}</div>
              <div style={{ fontSize: "0.8125rem", color: "var(--gray-500)", fontWeight: 600 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
          {/* Recent leads — clickable */}
          <div className="card" style={{ padding: "1.75rem" }}>
            <h2 style={{ fontWeight: 700, color: "var(--navy)", fontSize: "1rem", marginBottom: "1.25rem" }}>
              Recent Quote Requests
              <span style={{ fontWeight: 400, color: "var(--gray-400)", fontSize: "0.8125rem", marginLeft: "0.5rem" }}>Click to view details</span>
            </h2>
            {recent_quotes.length === 0 ? (
              <p style={{ color: "var(--gray-400)", fontSize: "0.9rem", textAlign: "center", padding: "2rem 0" }}>
                No leads yet. Keep your profile complete to rank higher.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {recent_quotes.map(q => (
                  <button key={q.id} onClick={() => openLeadDetail(q)}
                    style={{ width: "100%", textAlign: "left", padding: "0.875rem 1rem", background: "var(--gray-50)", borderRadius: "var(--radius-sm)", border: "1px solid var(--gray-100)", cursor: "pointer", transition: "border-color 0.15s, background 0.15s", fontFamily: "inherit" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--navy)"; (e.currentTarget as HTMLButtonElement).style.background = "rgba(22,46,94,0.03)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--gray-100)"; (e.currentTarget as HTMLButtonElement).style.background = "var(--gray-50)"; }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                      <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--navy)" }}>{q.service_type}</div>
                      <LeadStatusBadge status={q.status} />
                    </div>
                    <div style={{ fontSize: "0.8125rem", color: "var(--gray-500)", marginTop: "0.25rem" }}>
                      {q.contact_name} · {[q.city, q.state_code].filter(Boolean).join(", ")}
                    </div>
                    {q.budget_range && (
                      <div style={{ fontSize: "0.75rem", color: "var(--gray-400)", marginTop: "0.125rem" }}>Budget: {q.budget_range}</div>
                    )}
                    <div style={{ fontSize: "0.75rem", color: "var(--gray-400)", marginTop: "0.125rem" }}>
                      {new Date(q.created_at).toLocaleDateString()}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reviews with reply */}
          <div className="card" style={{ padding: "1.75rem" }}>
            <h2 style={{ fontWeight: 700, color: "var(--navy)", fontSize: "1rem", marginBottom: "1.25rem" }}>Recent Reviews</h2>
            {reviews.length === 0 ? (
              <p style={{ color: "var(--gray-400)", fontSize: "0.9rem", textAlign: "center", padding: "2rem 0" }}>No reviews yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {reviews.map(r => (
                  <div key={r.id} style={{ padding: "0.875rem", background: "var(--gray-50)", borderRadius: "var(--radius-sm)", border: "1px solid var(--gray-100)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.375rem", flexWrap: "wrap" }}>
                      <div style={{ display: "flex", gap: "1px" }}>
                        {[1,2,3,4,5].map(i => <span key={i} style={{ color: i <= r.rating ? "#f59e0b" : "var(--gray-200)", fontSize: "0.875rem" }}>★</span>)}
                      </div>
                      <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--navy)" }}>{r.reviewer_name}</span>
                      {r.project_type && <span style={{ fontSize: "0.75rem", color: "var(--gray-400)" }}>{r.project_type}</span>}
                    </div>
                    {r.title && <div style={{ fontWeight: 600, color: "var(--navy)", fontSize: "0.875rem", marginBottom: "0.25rem" }}>{r.title}</div>}
                    <p style={{ fontSize: "0.875rem", color: "var(--gray-600)", lineHeight: 1.55, margin: 0 }}>
                      {r.body.length > 120 ? r.body.slice(0, 117) + "…" : r.body}
                    </p>

                    {/* Existing reply */}
                    {r.contractor_reply && !replyOpen[r.id] && (
                      <div style={{ marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid var(--gray-150)" }}>
                        <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.375rem" }}>Your Reply</div>
                        <p style={{ fontSize: "0.8125rem", color: "var(--gray-600)", lineHeight: 1.55, margin: 0 }}>{r.contractor_reply}</p>
                      </div>
                    )}

                    {/* Reply editor */}
                    {replyOpen[r.id] ? (
                      <div style={{ marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid var(--gray-150)" }}>
                        <textarea
                          rows={3}
                          value={replyText[r.id] ?? ""}
                          onChange={e => setReplyText(p => ({ ...p, [r.id]: e.target.value }))}
                          placeholder="Write a professional response to this review…"
                          style={{ width: "100%", padding: "0.625rem 0.75rem", border: "1.5px solid var(--gray-200)", borderRadius: "var(--radius-sm)", fontFamily: "inherit", fontSize: "0.8125rem", resize: "vertical", boxSizing: "border-box" }}
                        />
                        {replyMsg[r.id] && <div style={{ fontSize: "0.75rem", color: replyMsg[r.id].includes("Failed") ? "var(--red)" : "#16a34a", marginTop: "0.25rem" }}>{replyMsg[r.id]}</div>}
                        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                          <button onClick={() => saveReply(r.id)} disabled={replySaving[r.id]}
                            style={{ padding: "0.375rem 0.875rem", background: "var(--navy)", color: "white", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", fontSize: "0.8125rem", opacity: replySaving[r.id] ? 0.7 : 1 }}>
                            {replySaving[r.id] ? "Saving…" : "Save Reply"}
                          </button>
                          <button onClick={() => setReplyOpen(p => ({ ...p, [r.id]: false }))}
                            style={{ padding: "0.375rem 0.75rem", background: "none", border: "1.5px solid var(--gray-200)", borderRadius: "var(--radius-sm)", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", fontSize: "0.8125rem", color: "var(--gray-600)" }}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ marginTop: "0.625rem" }}>
                        {replyMsg[r.id] && <div style={{ fontSize: "0.75rem", color: replyMsg[r.id].includes("Failed") ? "var(--red)" : "#16a34a", marginBottom: "0.375rem" }}>{replyMsg[r.id]}</div>}
                        <button onClick={() => { setReplyOpen(p => ({ ...p, [r.id]: true })); setReplyText(p => ({ ...p, [r.id]: r.contractor_reply ?? "" })); }}
                          style={{ padding: "0.25rem 0.75rem", background: "none", border: "1.5px solid var(--gray-200)", borderRadius: "var(--radius-sm)", cursor: "pointer", fontFamily: "inherit", fontSize: "0.75rem", color: "var(--gray-500)", fontWeight: 600 }}>
                          {r.contractor_reply ? "✏️ Edit Reply" : "💬 Reply to Review"}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Documents */}
        <div className="card" style={{ padding: "1.75rem", marginTop: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
            <div>
              <h2 style={{ fontWeight: 700, color: "var(--navy)", fontSize: "1rem", marginBottom: "0.25rem" }}>Documents</h2>
              <p style={{ fontSize: "0.8125rem", color: "var(--gray-500)", margin: 0 }}>
                Upload your license, insurance, and certifications. Documents are reviewed and shown as verified badges on your profile.
              </p>
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
              <select
                value={docType}
                onChange={e => setDocType(e.target.value)}
                style={{ padding: "0.5rem 0.75rem", border: "1.5px solid var(--gray-200)", borderRadius: "var(--radius-sm)", fontFamily: "inherit", fontSize: "0.875rem", color: "var(--gray-700)" }}>
                {DOC_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <label style={{
                background: uploading ? "var(--gray-300)" : "var(--navy)", color: "white",
                border: "none", borderRadius: "var(--radius-sm)", padding: "0.5rem 1.125rem",
                fontWeight: 600, fontSize: "0.875rem", cursor: uploading ? "not-allowed" : "pointer",
                whiteSpace: "nowrap",
              }}>
                {uploading ? "Uploading…" : "Upload File"}
                <input type="file" style={{ display: "none" }}
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  disabled={uploading}
                  onChange={e => { const f = e.target.files?.[0]; if (f) uploadDoc(f); e.target.value = ""; }}
                />
              </label>
            </label>
          </div>

          {docMsg && (
            <div style={{ padding: "0.75rem 1rem", marginBottom: "1rem", borderRadius: "var(--radius-sm)", fontSize: "0.875rem",
              background: docMsg.includes("failed") || docMsg.includes("error") ? "rgba(199,25,26,0.08)" : "rgba(22,163,74,0.08)",
              color: docMsg.includes("failed") || docMsg.includes("error") ? "var(--red)" : "#16a34a",
              border: `1px solid ${docMsg.includes("failed") || docMsg.includes("error") ? "rgba(199,25,26,0.2)" : "rgba(22,163,74,0.2)"}`,
            }}>{docMsg}</div>
          )}

          {docs.length === 0 ? (
            <p style={{ color: "var(--gray-400)", fontSize: "0.875rem", textAlign: "center", padding: "2rem 0" }}>
              No documents uploaded yet. Upload your license and insurance to earn verified badges.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              {docs.map(doc => {
                const label = DOC_TYPES.find(t => t.value === doc.doc_type)?.label ?? doc.doc_type;
                const statusColor: Record<string, string> = { pending: "#d97706", approved: "#16a34a", rejected: "var(--red)" };
                return (
                  <div key={doc.id} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.75rem 1rem", background: "var(--gray-50)", border: "1px solid var(--gray-150)", borderRadius: "var(--radius-sm)", flexWrap: "wrap" }}>
                    <div style={{ fontSize: "1.25rem" }}>
                      {doc.doc_type === "license" ? "📜" : doc.doc_type === "insurance" ? "🛡️" : doc.doc_type === "background_check" ? "🔍" : "📄"}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--navy)" }}>{label}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--gray-400)" }}>{doc.file_name} · {new Date(doc.created_at).toLocaleDateString()}</div>
                    </div>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: statusColor[doc.status] ?? "var(--gray-500)", textTransform: "capitalize", background: "white", border: `1px solid currentColor`, padding: "0.2rem 0.625rem", borderRadius: "999px" }}>
                      {doc.status}
                    </span>
                    {doc.notes && <div style={{ fontSize: "0.75rem", color: "var(--gray-500)", width: "100%", paddingLeft: "2.25rem" }}>{doc.notes}</div>}
                    <button onClick={() => deleteDoc(doc.id)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gray-400)", fontSize: "1.125rem", padding: "0 0.25rem", lineHeight: 1 }}>×</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Subscription block */}
        {sub && (
          <div className="card" style={{ padding: "1.75rem", marginTop: "1.5rem" }}>
            <h2 style={{ fontWeight: 700, color: "var(--navy)", fontSize: "1rem", marginBottom: "1.25rem" }}>Subscription</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: "1rem" }}>
              {[
                ["Status",     sub.status.replace("_", " ")],
                ["Renews",     sub.current_period_end ? new Date(sub.current_period_end).toLocaleDateString() : "—"],
                ["Auto-renew", sub.cancel_at_period_end ? "Off (cancels at period end)" : "On"],
              ].map(([l, v]) => (
                <div key={l}>
                  <div style={{ fontSize: "0.75rem", color: "var(--gray-400)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>{l}</div>
                  <div style={{ fontWeight: 700, color: "var(--navy)" }}>{v}</div>
                </div>
              ))}
            </div>
            <button onClick={openBillingPortal} disabled={portalLoading} style={{ marginTop: "1.25rem", padding: "0.625rem 1.25rem", background: "var(--navy)", color: "white", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", fontSize: "0.875rem" }}>
              Manage Billing →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
