"use client";
import { useState, useEffect, useCallback } from "react";

interface AuditLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
  profiles: { full_name: string | null; email: string; role: string } | null;
}

const ACTION_COLORS: Record<string, { bg: string; color: string }> = {
  contractor_approve:  { bg: "rgba(22,163,74,0.1)",  color: "#16a34a" },
  contractor_reject:   { bg: "rgba(199,25,26,0.08)", color: "var(--red)" },
  contractor_suspend:  { bg: "rgba(245,158,11,0.1)", color: "#d97706" },
  contractor_unsuspend:{ bg: "rgba(22,163,74,0.1)",  color: "#16a34a" },
  review_publish:      { bg: "rgba(22,163,74,0.1)",  color: "#16a34a" },
  review_flag:         { bg: "rgba(245,158,11,0.1)", color: "#d97706" },
  review_remove:       { bg: "rgba(199,25,26,0.08)", color: "var(--red)" },
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

export default function AuditLogsPage() {
  const [logs,    setLogs]    = useState<AuditLog[]>([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [debounce, setDebounce] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebounce(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const sp = new URLSearchParams({ limit: "100" });
      if (entityFilter !== "all") sp.set("entity_type", entityFilter);
      if (debounce) sp.set("q", debounce);
      const res  = await fetch(`/api/admin/audit-logs?${sp}`);
      const json = await res.json();
      setLogs(json.logs ?? []);
      setTotal(json.total ?? 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [entityFilter, debounce]);

  useEffect(() => { load(); }, [load]);

  const entityTypes = ["contractor", "review", "subscription", "settings"];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.625rem", fontWeight: 800, color: "var(--navy)", marginBottom: "0.25rem" }}>Audit Logs</h1>
          <p style={{ color: "var(--gray-500)", fontSize: "0.875rem" }}>Complete history of all admin actions on the platform.</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
        <select className="form-select" value={entityFilter} onChange={e => setEntityFilter(e.target.value)}>
          <option value="all">All Types</option>
          {entityTypes.map(t => (
            <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
          ))}
        </select>
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          </div>
          <input placeholder="Search actions, entities…" value={search} onChange={e => setSearch(e.target.value)} className="form-input" style={{ paddingLeft: "2.75rem" }} />
        </div>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--gray-400)" }}>Loading audit logs…</div>
        ) : logs.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--gray-400)" }}>No audit logs found.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "700px" }}>
              <thead>
                <tr style={{ background: "var(--gray-50)", borderBottom: "1px solid var(--gray-150)" }}>
                  {["Timestamp","Admin","Action","Entity","Details"].map(h => (
                    <th key={h} style={{ padding: "0.875rem 1rem", textAlign: "left", fontSize: "0.8125rem", fontWeight: 700, color: "var(--gray-500)", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map((log, i) => {
                  const ac = ACTION_COLORS[log.action] ?? { bg: "var(--gray-100)", color: "var(--gray-600)" };
                  return (
                    <tr key={log.id} style={{ borderBottom: i < logs.length - 1 ? "1px solid var(--gray-50)" : "none" }}>
                      <td style={{ padding: "0.875rem 1rem", whiteSpace: "nowrap" }}>
                        <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--navy)" }}>{fmtDate(log.created_at)}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--gray-400)" }}>{fmtTime(log.created_at)}</div>
                      </td>
                      <td style={{ padding: "0.875rem 1rem", whiteSpace: "nowrap" }}>
                        <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--navy)" }}>
                          {log.profiles?.full_name ?? log.profiles?.email ?? "System"}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--gray-400)" }}>{log.profiles?.role ?? ""}</div>
                      </td>
                      <td style={{ padding: "0.875rem 1rem", whiteSpace: "nowrap" }}>
                        <span style={{ background: ac.bg, color: ac.color, padding: "0.25rem 0.625rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700 }}>
                          {log.action.replace(/_/g, " ").toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: "0.875rem 1rem", whiteSpace: "nowrap" }}>
                        <div style={{ fontSize: "0.875rem", color: "var(--navy)", fontWeight: 500, textTransform: "capitalize" }}>{log.entity_type}</div>
                        {log.entity_id && <code style={{ fontSize: "0.7rem", color: "var(--gray-400)" }}>{log.entity_id.slice(0, 8)}…</code>}
                      </td>
                      <td style={{ padding: "0.875rem 1rem", maxWidth: "320px" }}>
                        {log.details && Object.keys(log.details).length > 0 ? (
                          <p style={{ fontSize: "0.8125rem", color: "var(--gray-600)", lineHeight: 1.55, margin: 0 }}>
                            {Object.entries(log.details)
                              .filter(([, v]) => v != null && v !== "")
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(" · ")}
                          </p>
                        ) : (
                          <span style={{ color: "var(--gray-300)", fontSize: "0.8125rem" }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {!loading && (
        <p style={{ fontSize: "0.8125rem", color: "var(--gray-400)", marginTop: "0.875rem" }}>
          Showing {logs.length} of {total} total log entries · Logs retained for 365 days
        </p>
      )}
    </div>
  );
}
