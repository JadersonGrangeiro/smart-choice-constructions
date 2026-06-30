"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

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
    is_licensed: boolean;
    is_insured: boolean;
    is_background_checked: boolean;
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
  recent_quotes: Array<{
    id: string;
    service_type: string;
    contact_name: string;
    city: string | null;
    state_code: string | null;
    status: string;
    created_at: string;
  }>;
  recent_reviews: Array<{
    id: string;
    rating: number;
    reviewer_name: string;
    body: string;
    created_at: string;
  }>;
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

export default function ContractorDashboard() {
  const [data, setData]           = useState<DashboardData | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [portalLoading, setPortalLoading] = useState(false);
  const [docs, setDocs]           = useState<ContractorDoc[]>([]);
  const [docType, setDocType]     = useState("license");
  const [uploading, setUploading] = useState(false);
  const [docMsg, setDocMsg]       = useState("");

  useEffect(() => {
    fetch("/api/dashboard/contractor")
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error);
        else setData(d);
      })
      .catch(() => setError("Failed to load dashboard"))
      .finally(() => setLoading(false));
    fetch("/api/dashboard/contractor/documents")
      .then(r => r.ok ? r.json() : { documents: [] })
      .then(d => setDocs(d.documents ?? []))
      .catch(() => {});
  }, []);

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

  const { contractor, stats, recent_quotes, recent_reviews } = data;
  const sub = contractor.contractor_subscriptions[0];

  return (
    <div style={{ paddingTop: "76px", minHeight: "100vh", background: "var(--gray-50)" }}>
      <div className="container" style={{ maxWidth: "1100px", padding: "2.5rem 1.5rem" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
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
          {/* Recent leads */}
          <div className="card" style={{ padding: "1.75rem" }}>
            <h2 style={{ fontWeight: 700, color: "var(--navy)", fontSize: "1rem", marginBottom: "1.25rem" }}>Recent Quote Requests</h2>
            {recent_quotes.length === 0 ? (
              <p style={{ color: "var(--gray-400)", fontSize: "0.9rem", textAlign: "center", padding: "2rem 0" }}>
                No leads yet. Keep your profile complete to rank higher.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {recent_quotes.map(q => (
                  <div key={q.id} style={{ padding: "0.75rem", background: "var(--gray-50)", borderRadius: "var(--radius-sm)", border: "1px solid var(--gray-100)" }}>
                    <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--navy)" }}>{q.service_type}</div>
                    <div style={{ fontSize: "0.8125rem", color: "var(--gray-500)", marginTop: "0.125rem" }}>
                      {q.contact_name} · {q.city}, {q.state_code}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--gray-400)", marginTop: "0.25rem" }}>
                      {new Date(q.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent reviews */}
          <div className="card" style={{ padding: "1.75rem" }}>
            <h2 style={{ fontWeight: 700, color: "var(--navy)", fontSize: "1rem", marginBottom: "1.25rem" }}>Recent Reviews</h2>
            {recent_reviews.length === 0 ? (
              <p style={{ color: "var(--gray-400)", fontSize: "0.9rem", textAlign: "center", padding: "2rem 0" }}>No reviews yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                {recent_reviews.map(r => (
                  <div key={r.id} style={{ padding: "0.875rem", background: "var(--gray-50)", borderRadius: "var(--radius-sm)", border: "1px solid var(--gray-100)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.375rem" }}>
                      <div style={{ display: "flex", gap: "1px" }}>
                        {[1,2,3,4,5].map(i => <span key={i} style={{ color: i <= r.rating ? "#f59e0b" : "var(--gray-200)", fontSize: "0.875rem" }}>★</span>)}
                      </div>
                      <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--navy)" }}>{r.reviewer_name}</span>
                    </div>
                    <p style={{ fontSize: "0.875rem", color: "var(--gray-600)", lineHeight: 1.55, margin: 0 }}>
                      {r.body.length > 100 ? r.body.slice(0, 100) + "…" : r.body}
                    </p>
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
