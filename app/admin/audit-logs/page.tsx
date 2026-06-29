"use client";
import { useState } from "react";

type ActionType = "contractor" | "supplier" | "user" | "document" | "billing" | "content" | "settings" | "admin";

interface AuditLog {
  id: string; timestamp: string; admin: string; adminRole: string;
  action: string; entity: string; entityId: string; details: string;
  type: ActionType; ip: string;
}

const MOCK_LOGS: AuditLog[] = [
  { id: "l1",  timestamp: "Jun 28, 2025 14:32:07", admin: "Carlos Admin",  adminRole: "super_admin", action: "APPROVED",        entity: "Contractor",  entityId: "c_512", details: "Approved registration for BathPro Renovations. License #WA-CC-88234 verified.", type: "contractor", ip: "192.168.1.10" },
  { id: "l2",  timestamp: "Jun 28, 2025 14:18:41", admin: "Carlos Admin",  adminRole: "super_admin", action: "BADGE_AWARDED",    entity: "Document",    entityId: "d_290", details: "Approved License document for PowerUp Electrical. Badge 'license_verified' awarded.", type: "document",   ip: "192.168.1.10" },
  { id: "l3",  timestamp: "Jun 28, 2025 13:55:22", admin: "Maria Support", adminRole: "support",     action: "REVIEW_REMOVED",  entity: "Review",      entityId: "r_77",  details: "Removed review r_77 from ProBuild Solutions. Reason: Duplicate review from same user.", type: "content",    ip: "10.0.0.42" },
  { id: "l4",  timestamp: "Jun 28, 2025 12:44:15", admin: "Carlos Admin",  adminRole: "super_admin", action: "COUPON_CREATED",  entity: "Coupon",      entityId: "c_031", details: "Created coupon LAUNCH50: 50% off first month, max 100 uses, expires Aug 31 2025.", type: "billing",    ip: "192.168.1.10" },
  { id: "l5",  timestamp: "Jun 28, 2025 11:30:08", admin: "Maria Support", adminRole: "support",     action: "SUSPENDED",       entity: "Contractor",  entityId: "c_089", details: "Suspended HVAC Masters LLC. Reason: Multiple unresolved complaints and payment past due.", type: "contractor", ip: "10.0.0.42" },
  { id: "l6",  timestamp: "Jun 28, 2025 10:15:33", admin: "Carlos Admin",  adminRole: "super_admin", action: "SETTINGS_UPDATED",entity: "Settings",    entityId: "global", details: "Updated SMTP configuration. Changed from SendGrid to Postmark.", type: "settings",   ip: "192.168.1.10" },
  { id: "l7",  timestamp: "Jun 28, 2025 09:42:19", admin: "James Editor",  adminRole: "editor",      action: "BLOG_PUBLISHED",  entity: "Blog Post",   entityId: "blog_44", details: "Published '5 Questions to Ask Before Hiring a Roofing Contractor'.", type: "content",    ip: "172.16.0.5" },
  { id: "l8",  timestamp: "Jun 27, 2025 17:08:55", admin: "Carlos Admin",  adminRole: "super_admin", action: "ADMIN_CREATED",   entity: "Admin User",  entityId: "adm_3", details: "Created new admin account for James Editor (editor role).", type: "admin",      ip: "192.168.1.10" },
  { id: "l9",  timestamp: "Jun 27, 2025 15:22:40", admin: "Maria Support", adminRole: "support",     action: "REFUND_ISSUED",   entity: "Subscription",entityId: "sub_178", details: "Issued $49.90 refund for sub_178 (ProBuild Solutions). Reason: Accidental double charge.", type: "billing",    ip: "10.0.0.42" },
  { id: "l10", timestamp: "Jun 27, 2025 14:05:11", admin: "Carlos Admin",  adminRole: "super_admin", action: "SUPPLIER_ADDED",  entity: "Supplier",    entityId: "s_011", details: "Added Texas Building Supply Co. as a verified supplier in the Building Materials category.", type: "supplier",   ip: "192.168.1.10" },
  { id: "l11", timestamp: "Jun 27, 2025 11:30:00", admin: "James Editor",  adminRole: "editor",      action: "BANNER_CREATED",  entity: "Banner",      entityId: "b_02", details: "Created 'New: Local Suppliers Now Live' announcement bar banner. Placement: global_bar.", type: "content",    ip: "172.16.0.5" },
  { id: "l12", timestamp: "Jun 26, 2025 16:20:44", admin: "Carlos Admin",  adminRole: "super_admin", action: "PRICE_UPDATED",   entity: "Settings",    entityId: "pricing", details: "Monthly renewal price confirmed at $49.90. No change from previous.", type: "settings",   ip: "192.168.1.10" },
];

const ACTION_COLORS: Record<string, { bg: string; color: string }> = {
  APPROVED:        { bg: "rgba(22,163,74,0.1)",  color: "#16a34a" },
  BADGE_AWARDED:   { bg: "rgba(22,163,74,0.1)",  color: "#16a34a" },
  SUSPENDED:       { bg: "rgba(245,158,11,0.1)", color: "#d97706" },
  REVIEW_REMOVED:  { bg: "rgba(199,25,26,0.08)", color: "var(--red)" },
  SETTINGS_UPDATED:{ bg: "rgba(99,102,241,0.1)", color: "#6366f1" },
  BLOG_PUBLISHED:  { bg: "rgba(22,46,94,0.08)",  color: "var(--navy)" },
  ADMIN_CREATED:   { bg: "rgba(99,102,241,0.1)", color: "#6366f1" },
  REFUND_ISSUED:   { bg: "rgba(245,158,11,0.1)", color: "#d97706" },
  COUPON_CREATED:  { bg: "rgba(22,46,94,0.08)",  color: "var(--navy)" },
  SUPPLIER_ADDED:  { bg: "rgba(22,163,74,0.1)",  color: "#16a34a" },
  BANNER_CREATED:  { bg: "rgba(22,46,94,0.08)",  color: "var(--navy)" },
  PRICE_UPDATED:   { bg: "rgba(99,102,241,0.1)", color: "#6366f1" },
};

export default function AuditLogsPage() {
  const [typeFilter, setTypeFilter] = useState<ActionType | "all">("all");
  const [adminFilter, setAdminFilter] = useState("all");
  const [search, setSearch] = useState("");

  const admins = [...new Set(MOCK_LOGS.map(l => l.admin))];
  const filtered = MOCK_LOGS.filter(l =>
    (typeFilter === "all" || l.type === typeFilter) &&
    (adminFilter === "all" || l.admin === adminFilter) &&
    (search === "" || l.details.toLowerCase().includes(search.toLowerCase()) || l.action.toLowerCase().includes(search.toLowerCase()) || l.entity.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.625rem", fontWeight: 800, color: "var(--navy)", marginBottom: "0.25rem" }}>Audit Logs</h1>
          <p style={{ color: "var(--gray-500)", fontSize: "0.875rem" }}>Complete history of all admin actions on the platform.</p>
        </div>
        <button className="btn-secondary" style={{ padding: "0.625rem 1.25rem", fontSize: "0.875rem" }}>Export CSV</button>
      </div>

      {/* Filters */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr", gap: "1rem", marginBottom: "1.5rem" }}>
        <select className="form-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value as ActionType | "all")}>
          <option value="all">All Types</option>
          {(["contractor","supplier","user","document","billing","content","settings","admin"] as ActionType[]).map(t => (
            <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
          ))}
        </select>
        <select className="form-select" value={adminFilter} onChange={e => setAdminFilter(e.target.value)}>
          <option value="all">All Admins</option>
          {admins.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          </div>
          <input placeholder="Search actions, entities, details…" value={search} onChange={e => setSearch(e.target.value)} className="form-input" style={{ paddingLeft: "2.75rem" }} />
        </div>
      </div>

      {/* Logs table */}
      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "700px" }}>
            <thead>
              <tr style={{ background: "var(--gray-50)", borderBottom: "1px solid var(--gray-150)" }}>
                {["Timestamp","Admin","Action","Entity","Details","IP"].map(h => (
                  <th key={h} style={{ padding: "0.875rem 1rem", textAlign: "left", fontSize: "0.8125rem", fontWeight: 700, color: "var(--gray-500)", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((log, i) => {
                const ac = ACTION_COLORS[log.action] ?? { bg: "var(--gray-100)", color: "var(--gray-600)" };
                return (
                  <tr key={log.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--gray-50)" : "none" }}>
                    <td style={{ padding: "0.875rem 1rem", whiteSpace: "nowrap" }}>
                      <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--navy)" }}>{log.timestamp.split(" ")[0]} {log.timestamp.split(" ")[1]}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--gray-400)" }}>{log.timestamp.split(" ")[2]}</div>
                    </td>
                    <td style={{ padding: "0.875rem 1rem", whiteSpace: "nowrap" }}>
                      <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--navy)" }}>{log.admin}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--gray-400)" }}>{log.adminRole}</div>
                    </td>
                    <td style={{ padding: "0.875rem 1rem", whiteSpace: "nowrap" }}>
                      <span style={{ background: ac.bg, color: ac.color, padding: "0.25rem 0.625rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700 }}>
                        {log.action.replace(/_/g," ")}
                      </span>
                    </td>
                    <td style={{ padding: "0.875rem 1rem", whiteSpace: "nowrap" }}>
                      <div style={{ fontSize: "0.875rem", color: "var(--navy)", fontWeight: 500 }}>{log.entity}</div>
                      <code style={{ fontSize: "0.7rem", color: "var(--gray-400)" }}>{log.entityId}</code>
                    </td>
                    <td style={{ padding: "0.875rem 1rem", maxWidth: "320px" }}>
                      <p style={{ fontSize: "0.8125rem", color: "var(--gray-600)", lineHeight: 1.55, margin: 0 }}>{log.details}</p>
                    </td>
                    <td style={{ padding: "0.875rem 1rem", whiteSpace: "nowrap" }}>
                      <code style={{ fontSize: "0.75rem", color: "var(--gray-400)" }}>{log.ip}</code>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--gray-400)" }}>No logs match your filters</div>
        )}
      </div>
      <p style={{ fontSize: "0.8125rem", color: "var(--gray-400)", marginTop: "0.875rem" }}>
        Showing {filtered.length} of {MOCK_LOGS.length} total log entries · Logs are retained for 365 days
      </p>
    </div>
  );
}
