"use client";
import { useState, useEffect, useCallback } from "react";
import { DOCUMENT_TYPES, BADGES, type DocumentType, type BadgeId } from "@/lib/badges";

type DocStatus = "pending" | "approved" | "rejected" | "expired";

interface Doc {
  id: string;
  contractor_id: string;
  doc_type: DocumentType;
  storage_path: string | null;
  public_url: string | null;
  status: DocStatus;
  admin_notes: string | null;
  created_at: string;
  expires_at: string | null;
  verified_at: string | null;
  contractors: {
    id: string;
    company_name: string;
    email: string;
    owner_first_name: string;
    owner_last_name: string;
  } | null;
}

const STATUS_STYLE: Record<DocStatus, { bg: string; color: string; label: string }> = {
  pending:  { bg: "rgba(99,102,241,0.1)",  color: "#6366f1", label: "Pending Review" },
  approved: { bg: "rgba(22,163,74,0.1)",   color: "#16a34a", label: "Approved" },
  rejected: { bg: "rgba(200,16,46,0.1)",   color: "var(--red)", label: "Rejected" },
  expired:  { bg: "rgba(245,158,11,0.1)",  color: "#d97706", label: "Expired" },
};

function Toast({ msg, type }: { msg: string; type: "success" | "error" }) {
  return (
    <div style={{ position: "fixed", bottom: "1.5rem", right: "1.5rem", zIndex: 1000, background: type === "success" ? "#16a34a" : "var(--red)", color: "white", padding: "0.875rem 1.5rem", borderRadius: "var(--radius)", fontWeight: 600, fontSize: "0.9rem", boxShadow: "var(--shadow-lg)" }}>
      {msg}
    </div>
  );
}

export default function DocumentsAdminPage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<DocStatus | "all">("pending");
  const [reviewing, setReviewing] = useState<Doc | null>(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/documents");
      const json = await res.json();
      setDocs(json.documents ?? []);
    } catch {
      showToast("Failed to load documents", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = filter === "all" ? docs : docs.filter(d => d.status === filter);

  const updateStatus = async (id: string, status: "approved" | "rejected", adminNotes?: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/documents/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, admin_notes: adminNotes || null }),
      });
      if (!res.ok) throw new Error();
      showToast(`Document ${status}`);
      setReviewing(null);
      setNotes("");
      await load();
    } catch {
      showToast("Failed to update document", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "300px", color: "var(--gray-400)", flexDirection: "column", gap: "1rem" }}>
      <div style={{ width: "32px", height: "32px", border: "3px solid var(--gray-200)", borderTopColor: "var(--navy)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      Loading documents...
    </div>
  );

  return (
    <div>
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.625rem", fontWeight: 800, color: "var(--navy)", marginBottom: "0.25rem" }}>Verification Documents</h1>
        <p style={{ color: "var(--gray-500)", fontSize: "0.875rem" }}>Review submitted credentials and manage badge assignments.</p>
      </div>

      {/* Status summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1rem", marginBottom: "2rem" }}>
        {([["pending","Pending Review","#6366f1"], ["approved","Approved","#16a34a"], ["rejected","Rejected","var(--red)"], ["expired","Expired","#d97706"]] as const).map(([status, label, color]) => {
          const count = docs.filter(d => d.status === status).length;
          return (
            <button key={status} onClick={() => setFilter(status)}
              style={{ padding: "1.25rem", background: filter === status ? "var(--navy)" : "white", border: `1.5px solid ${filter === status ? "var(--navy)" : "var(--gray-150)"}`, borderRadius: "var(--radius)", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
              <div style={{ fontSize: "1.75rem", fontWeight: 800, color: filter === status ? "white" : color, marginBottom: "0.25rem" }}>{count}</div>
              <div style={{ fontSize: "0.875rem", fontWeight: 600, color: filter === status ? "rgba(255,255,255,0.7)" : "var(--gray-600)" }}>{label}</div>
            </button>
          );
        })}
      </div>

      {/* Filter bar */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
        {(["all","pending","approved","rejected","expired"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "0.375rem 0.875rem", borderRadius: "999px",
            background: filter === f ? "var(--navy)" : "white",
            color: filter === f ? "white" : "var(--gray-600)",
            border: `1.5px solid ${filter === f ? "var(--navy)" : "var(--gray-200)"}`,
            fontWeight: 600, fontSize: "0.8125rem", cursor: "pointer", fontFamily: "inherit", textTransform: "capitalize",
          }}>
            {f === "all" ? `All (${docs.length})` : `${f.charAt(0).toUpperCase() + f.slice(1)} (${docs.filter(d => d.status === f).length})`}
          </button>
        ))}
      </div>

      {/* Document list */}
      <div className="card" style={{ overflow: "hidden" }}>
        {filtered.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--gray-400)" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>📋</div>
            {docs.length === 0 ? "No documents submitted yet" : "No documents in this category"}
          </div>
        ) : filtered.map((doc, i) => {
          const st = STATUS_STYLE[doc.status];
          const docMeta = DOCUMENT_TYPES[doc.doc_type] ?? { label: doc.doc_type, badge: null };
          const contractorName = doc.contractors?.company_name ?? "Unknown Contractor";
          const submittedAt = new Date(doc.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

          return (
            <div key={doc.id} style={{ padding: "1.25rem 1.5rem", borderBottom: i < filtered.length - 1 ? "1px solid var(--gray-50)" : "none" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "1rem", alignItems: "flex-start" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.375rem", flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 700, color: "var(--navy)", fontSize: "0.9375rem" }}>{contractorName}</span>
                    <span style={{ background: st.bg, color: st.color, padding: "0.2rem 0.625rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700 }}>{st.label}</span>
                  </div>
                  <div style={{ fontWeight: 600, color: "var(--gray-700)", fontSize: "0.875rem", marginBottom: "0.25rem" }}>{docMeta.label}</div>
                  <div style={{ fontSize: "0.8125rem", color: "var(--gray-400)", marginBottom: "0.375rem" }}>
                    Submitted {submittedAt}
                    {doc.expires_at && <span style={{ marginLeft: "0.75rem" }}>Expires {new Date(doc.expires_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>}
                  </div>
                  {doc.admin_notes && (
                    <div style={{ marginTop: "0.625rem", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "var(--radius-sm)", padding: "0.625rem 0.875rem", fontSize: "0.8125rem", color: "#92400e" }}>
                      <strong>Admin note:</strong> {doc.admin_notes}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                  {doc.public_url && (
                    <a href={doc.public_url} target="_blank" rel="noopener noreferrer"
                      style={{ padding: "0.5rem 0.875rem", background: "var(--gray-100)", border: "none", borderRadius: "var(--radius-sm)", fontSize: "0.8125rem", fontWeight: 600, cursor: "pointer", color: "var(--gray-700)", textDecoration: "none" }}>
                      View File
                    </a>
                  )}
                  {doc.status === "pending" && (
                    <button onClick={() => { setReviewing(doc); setNotes(""); }}
                      style={{ padding: "0.5rem 1rem", background: "var(--navy)", color: "white", border: "none", borderRadius: "var(--radius-sm)", fontSize: "0.8125rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                      Review →
                    </button>
                  )}
                  {doc.status === "approved" && (
                    <button onClick={() => updateStatus(doc.id, "rejected")} disabled={saving}
                      style={{ padding: "0.5rem 0.875rem", background: "rgba(200,16,46,0.06)", color: "var(--red)", border: "1px solid rgba(200,16,46,0.15)", borderRadius: "var(--radius-sm)", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                      Revoke
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Review modal */}
      {reviewing && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
          <div style={{ background: "white", borderRadius: "var(--radius-xl)", padding: "2rem", maxWidth: "520px", width: "100%", boxShadow: "var(--shadow-xl)" }}>
            <h3 style={{ fontWeight: 700, color: "var(--navy)", fontSize: "1.125rem", marginBottom: "0.375rem" }}>Review Document</h3>
            <p style={{ color: "var(--gray-500)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
              {reviewing.contractors?.company_name} — {DOCUMENT_TYPES[reviewing.doc_type]?.label ?? reviewing.doc_type}
            </p>

            <div style={{ background: "var(--gray-50)", borderRadius: "var(--radius)", padding: "1rem", marginBottom: "1.5rem" }}>
              <div style={{ fontSize: "0.8125rem", color: "var(--gray-400)" }}>
                Submitted {new Date(reviewing.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </div>
            </div>

            {DOCUMENT_TYPES[reviewing.doc_type]?.badge && (
              <div style={{ background: "rgba(22,163,74,0.06)", border: "1px solid rgba(22,163,74,0.2)", borderRadius: "var(--radius)", padding: "0.875rem 1rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span style={{ fontSize: "1.25rem" }}>🏅</span>
                <div>
                  <div style={{ fontWeight: 700, color: "#15803d", fontSize: "0.9rem" }}>Badge awarded on approval</div>
                  <div style={{ fontSize: "0.875rem", color: "#16a34a" }}>{BADGES[DOCUMENT_TYPES[reviewing.doc_type].badge! as BadgeId]?.label}</div>
                </div>
              </div>
            )}

            <div style={{ marginBottom: "1.25rem" }}>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--gray-700)", marginBottom: "0.5rem" }}>
                Admin Notes <span style={{ color: "var(--gray-400)", fontWeight: 400 }}>(required for rejection)</span>
              </label>
              <textarea className="form-input" rows={3} value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="Optional note for contractor or internal record" style={{ resize: "vertical" }} />
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button className="btn-secondary" onClick={() => setReviewing(null)} style={{ flex: 1 }}>Cancel</button>
              <button onClick={() => updateStatus(reviewing.id, "rejected", notes)} disabled={saving || !notes.trim()}
                style={{ flex: 1, padding: "0.875rem", background: "rgba(200,16,46,0.08)", color: "var(--red)", border: "1.5px solid rgba(200,16,46,0.2)", borderRadius: "var(--radius)", fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: !notes.trim() ? 0.5 : 1 }}>
                ✕ Reject
              </button>
              <button onClick={() => updateStatus(reviewing.id, "approved", notes)} disabled={saving}
                style={{ flex: 2, padding: "0.875rem", background: "#16a34a", color: "white", border: "none", borderRadius: "var(--radius)", fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                {saving ? "Saving..." : "✓ Approve & Award Badge"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
