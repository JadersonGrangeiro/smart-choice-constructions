"use client";
import { useState } from "react";
import { ACTIVE_CONTRACTORS, RECENT_PAYMENTS, ADMIN_STATS, REVENUE_MONTHLY } from "@/lib/admin/mock-data";
import { COMPANY } from "@/lib/data";

export default function SubscriptionsAdminPage() {
  const [filter, setFilter] = useState("all");
  const s = ADMIN_STATS;

  const filtered = filter === "all" ? ACTIVE_CONTRACTORS
    : ACTIVE_CONTRACTORS.filter(c => c.status === filter);

  const statusMap: Record<string, { bg: string; color: string; label: string }> = {
    active:    { bg: "rgba(22,163,74,0.1)",  color: "#16a34a",        label: "Active" },
    past_due:  { bg: "rgba(245,158,11,0.1)", color: "#d97706",        label: "Past Due" },
    suspended: { bg: "rgba(199,25,26,0.1)",  color: "var(--red)",     label: "Suspended" },
  };

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.625rem", fontWeight: 800, color: "var(--navy)", marginBottom: "0.25rem" }}>Subscriptions & Revenue</h1>
        <p style={{ color: "var(--gray-500)", fontSize: "0.875rem" }}>Monitor billing, payments, and revenue metrics</p>
      </div>

      {/* Revenue KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { label: "Monthly Revenue",   value: `$${s.revenue.mrr.toLocaleString("en-US",{minimumFractionDigits:2})}`,  sub: "MRR",  color: "var(--navy)" },
          { label: "Annual Run Rate",   value: `$${Math.round(s.revenue.arr/1000)}K`,                                    sub: "ARR",  color: "var(--navy)" },
          { label: "Growth vs. Last Mo",value: `+${s.revenue.growthPct}%`,                                              sub: "$449 net new", color: "#16a34a" },
          { label: "Avg Revenue / Pro", value: `$${s.revenue.avgRevenuePerContractor}`,                                 sub: "per contractor" },
          { label: "Active Subscribers",value: s.contractors.active.toString(),                                          sub: `${s.contractors.suspended} suspended` },
          { label: "Churn This Month",  value: s.contractors.churnThisMonth.toString(),                                  sub: `${((s.contractors.churnThisMonth/s.contractors.total)*100).toFixed(1)}% churn rate` },
        ].map(k => (
          <div key={k.label} className="card" style={{ padding: "1.25rem" }}>
            <div style={{ fontSize: "1.625rem", fontWeight: 800, color: k.color ?? "var(--navy)", letterSpacing: "-0.02em", marginBottom: "0.25rem" }}>{k.value}</div>
            <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--gray-600)" }}>{k.label}</div>
            <div style={{ fontSize: "0.8125rem", color: "var(--gray-400)" }}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
        {/* MRR Growth */}
        <div className="card" style={{ padding: "1.75rem" }}>
          <h2 style={{ fontWeight: 700, color: "var(--navy)", fontSize: "1.0625rem", marginBottom: "1.5rem" }}>MRR Growth</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            {REVENUE_MONTHLY.map((m, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
                <span style={{ width: "32px", fontSize: "0.8125rem", fontWeight: 600, color: "var(--gray-500)" }}>{m.month}</span>
                <div style={{ flex: 1, height: "28px", background: "var(--gray-50)", borderRadius: "4px", overflow: "hidden", position: "relative" }}>
                  <div style={{
                    height: "100%", background: i === REVENUE_MONTHLY.length - 1 ? "var(--navy)" : "var(--gray-200)",
                    width: `${(m.revenue / 15000) * 100}%`, borderRadius: "4px",
                    display: "flex", alignItems: "center", paddingLeft: "8px",
                    transition: "width 0.4s ease",
                  }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: i === REVENUE_MONTHLY.length - 1 ? "white" : "var(--gray-600)", whiteSpace: "nowrap" }}>
                      ${m.revenue.toLocaleString()}
                    </span>
                  </div>
                </div>
                <span style={{ width: "30px", fontSize: "0.75rem", color: "var(--gray-400)", textAlign: "right" }}>{m.contractors}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1rem", fontSize: "0.75rem", color: "var(--gray-400)" }}>
            <span>Revenue</span>
            <span>Contractors</span>
          </div>
        </div>

        {/* Subscription status breakdown */}
        <div className="card" style={{ padding: "1.75rem" }}>
          <h2 style={{ fontWeight: 700, color: "var(--navy)", fontSize: "1.0625rem", marginBottom: "1.5rem" }}>Subscription Status</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {[
              { label: "Active",     count: s.contractors.active,    pct: Math.round(s.contractors.active/s.contractors.total*100),    color: "#16a34a" },
              { label: "Pending",    count: s.contractors.pending,   pct: Math.round(s.contractors.pending/s.contractors.total*100),   color: "#6366f1" },
              { label: "Suspended",  count: s.contractors.suspended, pct: Math.round(s.contractors.suspended/s.contractors.total*100), color: "#f59e0b" },
              { label: "Canceled",   count: s.contractors.canceled,  pct: Math.round(s.contractors.canceled/s.contractors.total*100),  color: "var(--gray-400)" },
            ].map(row => (
              <div key={row.label}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--gray-700)" }}>{row.label}</span>
                  <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--navy)" }}>{row.count} ({row.pct}%)</span>
                </div>
                <div style={{ height: "8px", background: "var(--gray-100)", borderRadius: "999px", overflow: "hidden" }}>
                  <div style={{ height: "100%", background: row.color, borderRadius: "999px", width: `${row.pct}%`, transition: "width 0.4s" }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: "1.5rem", paddingTop: "1.25rem", borderTop: "1px solid var(--gray-100)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
              <span style={{ color: "var(--gray-500)" }}>Total subscribers</span>
              <span style={{ fontWeight: 700, color: "var(--navy)" }}>{s.contractors.total}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Subscriber list */}
      <div className="card" style={{ overflow: "hidden" }}>
        {/* Filters */}
        <div style={{ padding: "1rem 1.5rem", display: "flex", gap: "0.5rem", borderBottom: "1px solid var(--gray-100)", flexWrap: "wrap" }}>
          {["all","active","past_due","suspended"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: "0.375rem 0.875rem", borderRadius: "999px",
              background: filter === f ? "var(--navy)" : "white",
              color: filter === f ? "white" : "var(--gray-600)",
              border: `1.5px solid ${filter === f ? "var(--navy)" : "var(--gray-200)"}`,
              fontWeight: 600, fontSize: "0.8125rem", cursor: "pointer", fontFamily: "inherit",
              textTransform: "capitalize", transition: "all 0.15s",
            }}>
              {f === "all" ? "All" : f.replace("_", " ")}
            </button>
          ))}
          <span style={{ fontSize: "0.875rem", color: "var(--gray-400)", alignSelf: "center", marginLeft: "auto" }}>
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--gray-50)", borderBottom: "1px solid var(--gray-150)" }}>
              {["Contractor","Plan","Status","MRR","Next Billing","Actions"].map(h => (
                <th key={h} style={{ padding: "0.875rem 1.25rem", textAlign: "left", fontSize: "0.8125rem", fontWeight: 700, color: "var(--gray-500)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => {
              const st = statusMap[c.status] ?? statusMap.active;
              return (
                <tr key={c.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--gray-50)" : "none" }}>
                  <td style={{ padding: "1rem 1.25rem" }}>
                    <div style={{ fontWeight: 700, color: "var(--navy)", fontSize: "0.875rem" }}>{c.company}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--gray-400)" }}>{c.name}</div>
                  </td>
                  <td style={{ padding: "1rem 1.25rem", fontSize: "0.875rem", color: "var(--gray-600)" }}>Professional</td>
                  <td style={{ padding: "1rem 1.25rem" }}>
                    <span style={{ background: st.bg, color: st.color, padding: "0.2rem 0.625rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700 }}>{st.label}</span>
                  </td>
                  <td style={{ padding: "1rem 1.25rem", fontWeight: 700, color: "var(--navy)", fontSize: "0.875rem" }}>
                    {c.mrr > 0 ? `$${c.mrr.toFixed(2)}` : "—"}
                  </td>
                  <td style={{ padding: "1rem 1.25rem", fontSize: "0.875rem", color: "var(--gray-600)" }}>{c.billingDate}</td>
                  <td style={{ padding: "1rem 1.25rem" }}>
                    <div style={{ display: "flex", gap: "0.375rem" }}>
                      <button style={{ padding: "0.375rem 0.75rem", background: "var(--gray-100)", color: "var(--gray-700)", border: "none", borderRadius: "var(--radius-xs)", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                        Billing Portal
                      </button>
                      {c.status !== "active" && (
                        <button style={{ padding: "0.375rem 0.75rem", background: "rgba(22,163,74,0.1)", color: "#16a34a", border: "1px solid rgba(22,163,74,0.2)", borderRadius: "var(--radius-xs)", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                          Restore
                        </button>
                      )}
                      {c.status === "active" && (
                        <button style={{ padding: "0.375rem 0.75rem", background: "rgba(199,25,26,0.06)", color: "var(--red)", border: "1px solid rgba(199,25,26,0.15)", borderRadius: "var(--radius-xs)", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
