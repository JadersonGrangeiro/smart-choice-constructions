"use client";
import { useState } from "react";
import Link from "next/link";
import { PENDING_CONTRACTORS, ACTIVE_CONTRACTORS } from "@/lib/admin/mock-data";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    active:    { bg: "rgba(22,163,74,0.1)",  color: "#16a34a",        label: "Active" },
    past_due:  { bg: "rgba(245,158,11,0.1)", color: "#d97706",        label: "Past Due" },
    suspended: { bg: "rgba(199,25,26,0.1)",  color: "var(--red)",     label: "Suspended" },
    canceled:  { bg: "var(--gray-100)",       color: "var(--gray-500)",label: "Canceled" },
    pending:   { bg: "rgba(99,102,241,0.1)", color: "#6366f1",        label: "Pending" },
  };
  const s = map[status] ?? map.pending;
  return <span style={{ background: s.bg, color: s.color, padding: "0.2rem 0.625rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700 }}>{s.label}</span>;
}

export default function ContractorsAdminPage() {
  const [tab, setTab] = useState<"pending"|"active"|"suspended">("pending");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmAction, setConfirmAction] = useState<{ type: string; ids: string[] } | null>(null);

  const activeFiltered = ACTIVE_CONTRACTORS.filter(c =>
    search === "" ||
    c.company.toLowerCase().includes(search.toLowerCase()) ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase())
  );

  const suspended = ACTIVE_CONTRACTORS.filter(c => c.status === "suspended" || c.status === "past_due");

  const toggleSelect = (id: string) => {
    const n = new Set(selected);
    n.has(id) ? n.delete(id) : n.add(id);
    setSelected(n);
  };

  const bulkAction = (type: string) => {
    if (selected.size === 0) return;
    setConfirmAction({ type, ids: [...selected] });
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.625rem", fontWeight: 800, color: "var(--navy)", marginBottom: "0.25rem" }}>Contractors</h1>
          <p style={{ color: "var(--gray-500)", fontSize: "0.875rem" }}>Manage registrations, profiles, and account status</p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          {selected.size > 0 && (
            <>
              <button onClick={() => bulkAction("approve")} style={{ padding: "0.625rem 1.125rem", background: "rgba(22,163,74,0.1)", color: "#16a34a", border: "1px solid rgba(22,163,74,0.25)", borderRadius: "var(--radius)", fontWeight: 700, fontSize: "0.875rem", cursor: "pointer", fontFamily: "inherit" }}>
                ✓ Approve {selected.size}
              </button>
              <button onClick={() => bulkAction("reject")} style={{ padding: "0.625rem 1.125rem", background: "rgba(199,25,26,0.08)", color: "var(--red)", border: "1px solid rgba(199,25,26,0.2)", borderRadius: "var(--radius)", fontWeight: 700, fontSize: "0.875rem", cursor: "pointer", fontFamily: "inherit" }}>
                ✕ Reject {selected.size}
              </button>
            </>
          )}
          <button className="btn-secondary" style={{ padding: "0.625rem 1.125rem", fontSize: "0.875rem" }}>Export CSV</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0", marginBottom: "1.5rem", background: "white", borderRadius: "var(--radius)", border: "1px solid var(--gray-150)", overflow: "hidden" }}>
        {[
          { key: "pending",   label: "Pending Review",  count: PENDING_CONTRACTORS.length },
          { key: "active",    label: "Active",          count: ACTIVE_CONTRACTORS.filter(c => c.status === "active").length },
          { key: "suspended", label: "Issues",          count: suspended.length },
        ].map(t => (
          <button key={t.key} onClick={() => { setTab(t.key as any); setSelected(new Set()); }} style={{
            flex: 1, padding: "0.875rem 1.25rem", background: tab === t.key ? "var(--navy)" : "transparent",
            color: tab === t.key ? "white" : "var(--gray-600)",
            border: "none", cursor: "pointer", fontFamily: "inherit",
            fontWeight: tab === t.key ? 700 : 500, fontSize: "0.9rem",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
            transition: "all 0.2s",
          }}>
            {t.label}
            <span style={{ background: tab === t.key ? "rgba(255,255,255,0.2)" : "var(--gray-100)", color: tab === t.key ? "white" : "var(--gray-500)", borderRadius: "999px", padding: "0 7px", fontSize: "0.75rem", fontWeight: 800 }}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      {(tab === "active" || tab === "suspended") && (
        <div style={{ position: "relative", marginBottom: "1.25rem" }}>
          <div style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          </div>
          <input placeholder="Search by company, name, or category..." value={search} onChange={e => setSearch(e.target.value)} className="form-input" style={{ paddingLeft: "2.75rem" }} />
        </div>
      )}

      {/* Pending tab */}
      {tab === "pending" && (
        <div className="card" style={{ overflow: "hidden" }}>
          <div style={{ padding: "1rem 1.5rem", background: "rgba(99,102,241,0.04)", borderBottom: "1px solid var(--gray-100)", fontSize: "0.875rem", color: "#6366f1", fontWeight: 600 }}>
            {PENDING_CONTRACTORS.length} contractors awaiting review — newest first
          </div>
          {PENDING_CONTRACTORS.map((c, i) => (
            <div key={c.id} style={{ display: "grid", gridTemplateColumns: "auto auto 1fr auto auto", gap: "1rem", padding: "1.25rem 1.5rem", borderBottom: i < PENDING_CONTRACTORS.length - 1 ? "1px solid var(--gray-50)" : "none", alignItems: "center" }}>
              {/* Checkbox */}
              <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggleSelect(c.id)} style={{ width: "16px", height: "16px", accentColor: "var(--navy)" }} />
              {/* Avatar */}
              <div style={{ width: "42px", height: "42px", background: "var(--navy)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, flexShrink: 0 }}>
                {c.name.charAt(0)}
              </div>
              {/* Info */}
              <div>
                <div style={{ fontWeight: 700, color: "var(--navy)", fontSize: "0.9375rem" }}>{c.company}</div>
                <div style={{ fontSize: "0.8125rem", color: "var(--gray-400)", marginTop: "1px" }}>
                  {c.name} · {c.category} · {c.location}
                </div>
                <div style={{ display: "flex", gap: "0.625rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
                  {[
                    { ok: c.hasLicense,   label: "License" },
                    { ok: c.hasInsurance, label: "Insurance" },
                    { ok: c.photoCount >= 5, label: `${c.photoCount} Photos` },
                  ].map(item => (
                    <span key={item.label} style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem", fontWeight: 600, color: item.ok ? "#16a34a" : "#d97706" }}>
                      {item.ok ? "✓" : "⚠"} {item.label}
                    </span>
                  ))}
                </div>
              </div>
              {/* Submitted */}
              <div style={{ textAlign: "right", fontSize: "0.8125rem", color: "var(--gray-400)" }}>
                {c.submittedAt}
              </div>
              {/* Actions */}
              <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                <button style={{ padding: "0.5rem 1rem", background: "rgba(22,163,74,0.1)", color: "#16a34a", border: "1px solid rgba(22,163,74,0.25)", borderRadius: "var(--radius-sm)", fontWeight: 700, fontSize: "0.8125rem", cursor: "pointer", fontFamily: "inherit" }}>
                  ✓ Approve
                </button>
                <button style={{ padding: "0.5rem 1rem", background: "rgba(199,25,26,0.06)", color: "var(--red)", border: "1px solid rgba(199,25,26,0.18)", borderRadius: "var(--radius-sm)", fontWeight: 700, fontSize: "0.8125rem", cursor: "pointer", fontFamily: "inherit" }}>
                  ✕ Reject
                </button>
                <Link href={`/contractors/${c.id}`} style={{ padding: "0.5rem 1rem", background: "var(--gray-100)", color: "var(--gray-600)", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 600, fontSize: "0.8125rem", cursor: "pointer", fontFamily: "inherit", textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Active tab */}
      {tab === "active" && (
        <div className="card" style={{ overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--gray-50)", borderBottom: "1px solid var(--gray-150)" }}>
                {["Company","Category","Location","Rating","Status","Next Bill","MRR","Actions"].map(h => (
                  <th key={h} style={{ padding: "0.875rem 1.25rem", textAlign: "left", fontSize: "0.8125rem", fontWeight: 700, color: "var(--gray-500)", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activeFiltered.map((c, i) => (
                <tr key={c.id} style={{ borderBottom: i < activeFiltered.length - 1 ? "1px solid var(--gray-50)" : "none" }}>
                  <td style={{ padding: "1rem 1.25rem" }}>
                    <div style={{ fontWeight: 700, color: "var(--navy)", fontSize: "0.875rem" }}>{c.company}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--gray-400)" }}>{c.name}</div>
                  </td>
                  <td style={{ padding: "1rem 1.25rem", fontSize: "0.875rem", color: "var(--gray-600)" }}>{c.category}</td>
                  <td style={{ padding: "1rem 1.25rem", fontSize: "0.875rem", color: "var(--gray-600)" }}>{c.location}</td>
                  <td style={{ padding: "1rem 1.25rem" }}>
                    <span style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--navy)" }}>⭐ {c.rating}</span>
                    <span style={{ fontSize: "0.75rem", color: "var(--gray-400)", marginLeft: "4px" }}>({c.reviews})</span>
                  </td>
                  <td style={{ padding: "1rem 1.25rem" }}><StatusBadge status={c.status} /></td>
                  <td style={{ padding: "1rem 1.25rem", fontSize: "0.875rem", color: "var(--gray-600)" }}>{c.billingDate}</td>
                  <td style={{ padding: "1rem 1.25rem", fontWeight: 700, fontSize: "0.875rem", color: "var(--navy)" }}>${c.mrr.toFixed(2)}</td>
                  <td style={{ padding: "1rem 1.25rem" }}>
                    <div style={{ display: "flex", gap: "0.375rem" }}>
                      <Link href={`/contractors/${c.id}`} style={{ padding: "0.375rem 0.75rem", background: "var(--gray-100)", color: "var(--gray-700)", borderRadius: "var(--radius-xs)", fontSize: "0.75rem", fontWeight: 600, textDecoration: "none" }}>
                        View
                      </Link>
                      {c.status === "suspended" && (
                        <button style={{ padding: "0.375rem 0.75rem", background: "rgba(22,163,74,0.1)", color: "#16a34a", border: "none", borderRadius: "var(--radius-xs)", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                          Restore
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Suspended / Issues tab */}
      {tab === "suspended" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {suspended.length === 0 ? (
            <div className="card" style={{ padding: "3rem", textAlign: "center", color: "var(--gray-400)" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>✅</div>
              <div style={{ fontWeight: 600, color: "var(--gray-600)" }}>No billing issues</div>
            </div>
          ) : suspended.map(c => (
            <div key={c.id} className="card" style={{ padding: "1.5rem", borderLeft: `4px solid ${c.status === "suspended" ? "var(--red)" : "#d97706"}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.375rem" }}>
                    <span style={{ fontWeight: 700, color: "var(--navy)", fontSize: "1rem" }}>{c.company}</span>
                    <StatusBadge status={c.status} />
                  </div>
                  <div style={{ fontSize: "0.875rem", color: "var(--gray-500)" }}>
                    {c.name} · {c.category} · {c.location} · Next bill: {c.billingDate}
                  </div>
                  <div style={{ marginTop: "0.75rem", fontSize: "0.875rem", color: c.status === "suspended" ? "var(--red)" : "#d97706", fontWeight: 600 }}>
                    {c.status === "suspended"
                      ? "⚠ Profile hidden — payment overdue past grace period"
                      : "⚠ Payment failed — within grace period (profile still visible)"}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <button style={{ padding: "0.625rem 1.125rem", background: "rgba(22,163,74,0.1)", color: "#16a34a", border: "1px solid rgba(22,163,74,0.25)", borderRadius: "var(--radius)", fontWeight: 700, fontSize: "0.875rem", cursor: "pointer", fontFamily: "inherit" }}>
                    Restore Access
                  </button>
                  <button style={{ padding: "0.625rem 1.125rem", background: "rgba(199,25,26,0.06)", color: "var(--red)", border: "1px solid rgba(199,25,26,0.18)", borderRadius: "var(--radius)", fontWeight: 700, fontSize: "0.875rem", cursor: "pointer", fontFamily: "inherit" }}>
                    Cancel Account
                  </button>
                  <button style={{ padding: "0.625rem 1.125rem", background: "var(--navy)", color: "white", border: "none", borderRadius: "var(--radius)", fontWeight: 700, fontSize: "0.875rem", cursor: "pointer", fontFamily: "inherit" }}>
                    Send Email
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirm modal */}
      {confirmAction && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
          <div style={{ background: "white", borderRadius: "var(--radius-xl)", padding: "2rem", maxWidth: "420px", width: "100%" }}>
            <h3 style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "0.75rem" }}>
              {confirmAction.type === "approve" ? "Approve" : "Reject"} {confirmAction.ids.length} contractor{confirmAction.ids.length > 1 ? "s" : ""}?
            </h3>
            <p style={{ color: "var(--gray-500)", marginBottom: "1.5rem", lineHeight: 1.65 }}>
              {confirmAction.type === "approve"
                ? "Selected profiles will go live immediately and contractors will receive a welcome email."
                : "Selected applications will be rejected. Contractors will be notified by email."}
            </p>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button className="btn-secondary" onClick={() => setConfirmAction(null)} style={{ flex: 1 }}>Cancel</button>
              <button onClick={() => { setSelected(new Set()); setConfirmAction(null); }}
                style={{ flex: 2, padding: "0.875rem", background: confirmAction.type === "approve" ? "#16a34a" : "var(--red)", color: "white", border: "none", borderRadius: "var(--radius)", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                Confirm {confirmAction.type === "approve" ? "Approve" : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
