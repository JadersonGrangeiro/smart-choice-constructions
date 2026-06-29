"use client";
import { useState } from "react";
import { DOCUMENT_TYPES, BADGES, type DocumentType, type BadgeId } from "@/lib/badges";

type DocStatus = "pending" | "approved" | "rejected" | "expired";

interface Doc {
  id: string; contractorId: string; contractor: string; type: DocumentType;
  label: string; status: DocStatus; submittedAt: string; expiresAt: string | null;
  adminNotes: string; badgeAwarded: BadgeId | null; fileSize: string;
}

const MOCK_DOCS: Doc[] = [
  { id: "d1", contractorId: "1", contractor: "ProBuild Solutions",     type: "contractor_license",       label: "Texas General Contractor License #TX-GC-98234", status: "approved",  submittedAt: "Jun 10, 2025", expiresAt: "Jun 10, 2026", adminNotes: "", badgeAwarded: "license_verified",  fileSize: "284 KB" },
  { id: "d2", contractorId: "1", contractor: "ProBuild Solutions",     type: "certificate_of_insurance", label: "Zurich Insurance COI — $1M general liability",   status: "approved",  submittedAt: "Jun 10, 2025", expiresAt: "Dec 31, 2025", adminNotes: "", badgeAwarded: "insured",           fileSize: "512 KB" },
  { id: "d3", contractorId: "2", contractor: "Elite Roofing",          type: "contractor_license",       label: "Texas Roofing License #TX-RF-12019",             status: "approved",  submittedAt: "May 22, 2025", expiresAt: "May 22, 2026", adminNotes: "", badgeAwarded: "license_verified",  fileSize: "198 KB" },
  { id: "d4", contractorId: "5", contractor: "BathPro Renovations",    type: "government_id",            label: "Washington State Driver License",                status: "pending",   submittedAt: "Jun 27, 2025", expiresAt: null,            adminNotes: "", badgeAwarded: null,               fileSize: "1.2 MB" },
  { id: "d5", contractorId: "5", contractor: "BathPro Renovations",    type: "certificate_of_insurance", label: "Nationwide COI — general liability",             status: "pending",   submittedAt: "Jun 27, 2025", expiresAt: null,            adminNotes: "", badgeAwarded: null,               fileSize: "445 KB" },
  { id: "d6", contractorId: "4", contractor: "GreenScape Landscaping", type: "background_check",         label: "Checkr background check report",                 status: "pending",   submittedAt: "Jun 26, 2025", expiresAt: null,            adminNotes: "", badgeAwarded: null,               fileSize: "892 KB" },
  { id: "d7", contractorId: "6", contractor: "HVAC Masters LLC",       type: "contractor_license",       label: "Tennessee HVAC License #TN-HV-55291",           status: "rejected",  submittedAt: "Jun 20, 2025", expiresAt: null,            adminNotes: "License number not found in state database. Please resubmit.", badgeAwarded: null, fileSize: "317 KB" },
  { id: "d8", contractorId: "3", contractor: "PowerUp Electrical",     type: "contractor_license",       label: "Illinois Master Electrician License #IL-ME-7732",status: "expired",   submittedAt: "Jan 5, 2024",  expiresAt: "Jan 5, 2025",  adminNotes: "License expired. Badge removed automatically.", badgeAwarded: null, fileSize: "223 KB" },
];

const STATUS_STYLE: Record<DocStatus, { bg: string; color: string; label: string }> = {
  pending:  { bg: "rgba(99,102,241,0.1)",  color: "#6366f1", label: "Pending Review" },
  approved: { bg: "rgba(22,163,74,0.1)",   color: "#16a34a", label: "Approved" },
  rejected: { bg: "rgba(200,16,46,0.1)",   color: "var(--red)", label: "Rejected" },
  expired:  { bg: "rgba(245,158,11,0.1)",  color: "#d97706", label: "Expired" },
};

export default function DocumentsAdminPage() {
  const [docs, setDocs] = useState(MOCK_DOCS);
  const [filter, setFilter] = useState<DocStatus | "all">("pending");
  const [reviewing, setReviewing] = useState<Doc | null>(null);
  const [notes, setNotes] = useState("");

  const filtered = filter === "all" ? docs : docs.filter(d => d.status === filter);
  const pending = docs.filter(d => d.status === "pending").length;

  const approve = (id: string) => {
    setDocs(prev => prev.map(d => d.id === id ? {
      ...d,
      status: "approved" as DocStatus,
      badgeAwarded: DOCUMENT_TYPES[d.type].badge,
      adminNotes: notes || d.adminNotes,
    } : d));
    setReviewing(null);
    setNotes("");
  };

  const reject = (id: string) => {
    setDocs(prev => prev.map(d => d.id === id ? {
      ...d,
      status: "rejected" as DocStatus,
      badgeAwarded: null,
      adminNotes: notes,
    } : d));
    setReviewing(null);
    setNotes("");
  };

  return (
    <div>
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
              style={{
                padding: "1.25rem", background: filter === status ? "var(--navy)" : "white",
                border: `1.5px solid ${filter === status ? "var(--navy)" : "var(--gray-150)"}`,
                borderRadius: "var(--radius)", cursor: "pointer", fontFamily: "inherit", textAlign: "left",
              }}>
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
            fontWeight: 600, fontSize: "0.8125rem", cursor: "pointer", fontFamily: "inherit",
            textTransform: "capitalize",
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
            No documents in this category
          </div>
        ) : filtered.map((doc, i) => {
          const st = STATUS_STYLE[doc.status];
          const docMeta = DOCUMENT_TYPES[doc.type];
          return (
            <div key={doc.id} style={{ padding: "1.25rem 1.5rem", borderBottom: i < filtered.length - 1 ? "1px solid var(--gray-50)" : "none" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "1rem", alignItems: "flex-start" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.375rem", flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 700, color: "var(--navy)", fontSize: "0.9375rem" }}>{doc.contractor}</span>
                    <span style={{ background: st.bg, color: st.color, padding: "0.2rem 0.625rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700 }}>{st.label}</span>
                    {doc.badgeAwarded && (
                      <span style={{ background: "rgba(22,163,74,0.08)", color: "#16a34a", padding: "0.2rem 0.625rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700, border: "1px solid rgba(22,163,74,0.2)" }}>
                        🏅 Badge: {BADGES[doc.badgeAwarded].label}
                      </span>
                    )}
                  </div>
                  <div style={{ fontWeight: 600, color: "var(--gray-700)", fontSize: "0.875rem", marginBottom: "0.25rem" }}>{docMeta.label}</div>
                  <div style={{ fontSize: "0.8125rem", color: "var(--gray-400)", marginBottom: "0.375rem" }}>{doc.label}</div>
                  <div style={{ fontSize: "0.8125rem", color: "var(--gray-400)" }}>
                    Submitted {doc.submittedAt} · {doc.fileSize}
                    {doc.expiresAt && <span style={{ marginLeft: "0.75rem" }}>Expires {doc.expiresAt}</span>}
                  </div>
                  {doc.adminNotes && (
                    <div style={{ marginTop: "0.625rem", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "var(--radius-sm)", padding: "0.625rem 0.875rem", fontSize: "0.8125rem", color: "#92400e" }}>
                      <strong>Admin note:</strong> {doc.adminNotes}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                  <button style={{ padding: "0.5rem 0.875rem", background: "var(--gray-100)", border: "none", borderRadius: "var(--radius-sm)", fontSize: "0.8125rem", fontWeight: 600, cursor: "pointer", color: "var(--gray-700)", fontFamily: "inherit" }}>
                    View File
                  </button>
                  {doc.status === "pending" && (
                    <button onClick={() => { setReviewing(doc); setNotes(""); }}
                      style={{ padding: "0.5rem 1rem", background: "var(--navy)", color: "white", border: "none", borderRadius: "var(--radius-sm)", fontSize: "0.8125rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                      Review →
                    </button>
                  )}
                  {doc.status === "approved" && (
                    <button onClick={() => reject(doc.id)}
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
            <h3 style={{ fontWeight: 700, color: "var(--navy)", fontSize: "1.125rem", marginBottom: "0.375rem" }}>
              Review Document
            </h3>
            <p style={{ color: "var(--gray-500)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
              {reviewing.contractor} — {DOCUMENT_TYPES[reviewing.type].label}
            </p>

            {/* Doc info */}
            <div style={{ background: "var(--gray-50)", borderRadius: "var(--radius)", padding: "1rem", marginBottom: "1.5rem" }}>
              <div style={{ fontWeight: 600, color: "var(--navy)", marginBottom: "0.375rem", fontSize: "0.9375rem" }}>{reviewing.label}</div>
              <div style={{ fontSize: "0.8125rem", color: "var(--gray-400)" }}>Submitted {reviewing.submittedAt} · {reviewing.fileSize}</div>
            </div>

            {/* Badge that will be awarded */}
            {DOCUMENT_TYPES[reviewing.type].badge && (
              <div style={{ background: "rgba(22,163,74,0.06)", border: "1px solid rgba(22,163,74,0.2)", borderRadius: "var(--radius)", padding: "0.875rem 1rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span style={{ fontSize: "1.25rem" }}>🏅</span>
                <div>
                  <div style={{ fontWeight: 700, color: "#15803d", fontSize: "0.9rem" }}>Badge to award on approval</div>
                  <div style={{ fontSize: "0.875rem", color: "#16a34a" }}>{BADGES[DOCUMENT_TYPES[reviewing.type].badge!].label}</div>
                </div>
              </div>
            )}

            <div style={{ marginBottom: "1.25rem" }}>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--gray-700)", marginBottom: "0.5rem" }}>
                Admin Notes <span style={{ color: "var(--gray-400)", fontWeight: 400 }}>(required for rejection)</span>
              </label>
              <textarea className="form-input" rows={3} value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="Optional: note for the contractor or internal record" style={{ resize: "vertical" }} />
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button className="btn-secondary" onClick={() => setReviewing(null)} style={{ flex: 1 }}>Cancel</button>
              <button onClick={() => reject(reviewing.id)}
                style={{ flex: 1, padding: "0.875rem", background: "rgba(200,16,46,0.08)", color: "var(--red)", border: "1.5px solid rgba(200,16,46,0.2)", borderRadius: "var(--radius)", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                ✕ Reject
              </button>
              <button onClick={() => approve(reviewing.id)}
                style={{ flex: 2, padding: "0.875rem", background: "#16a34a", color: "white", border: "none", borderRadius: "var(--radius)", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                ✓ Approve & Award Badge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
