"use client";
import { ADMIN_STATS, REVENUE_MONTHLY, TOP_CATEGORIES } from "@/lib/admin/mock-data";
import { US_STATES } from "@/lib/data";

function Bar({ pct, color = "var(--navy)" }: { pct: number; color?: string }) {
  return (
    <div style={{ flex: 1, height: "10px", background: "var(--gray-100)", borderRadius: "999px", overflow: "hidden" }}>
      <div style={{ height: "100%", background: color, borderRadius: "999px", width: `${Math.max(pct, 2)}%`, transition: "width 0.5s ease" }} />
    </div>
  );
}

const TOP_STATES_DATA = [
  { state: "Texas",       contractors: 48, leads: 412, revenue: 2_395.20 },
  { state: "California",  contractors: 41, leads: 378, revenue: 2_045.90 },
  { state: "Florida",     contractors: 37, leads: 301, revenue: 1_846.30 },
  { state: "New York",    contractors: 29, leads: 267, revenue: 1_447.10 },
  { state: "Illinois",    contractors: 24, leads: 198, revenue: 1_197.60 },
  { state: "Georgia",     contractors: 19, leads: 154, revenue: 948.10 },
  { state: "Washington",  contractors: 17, leads: 143, revenue: 848.30 },
  { state: "Colorado",    contractors: 15, leads: 127, revenue: 748.50 },
];

export default function ReportsAdminPage() {
  const s = ADMIN_STATS;
  const maxLeads = Math.max(...TOP_CATEGORIES.map(c => c.leads));
  const maxStateLeads = Math.max(...TOP_STATES_DATA.map(s => s.leads));

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.625rem", fontWeight: 800, color: "var(--navy)", marginBottom: "0.25rem" }}>Reports & Analytics</h1>
          <p style={{ color: "var(--gray-500)", fontSize: "0.875rem" }}>Platform performance metrics and growth trends</p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          {["Last 7 days","Last 30 days","Last 3 months","Year to date"].map(p => (
            <button key={p} style={{ padding: "0.5rem 0.875rem", borderRadius: "999px", background: p === "Last 30 days" ? "var(--navy)" : "white", color: p === "Last 30 days" ? "white" : "var(--gray-600)", border: "1.5px solid var(--gray-200)", fontWeight: 600, fontSize: "0.8125rem", cursor: "pointer", fontFamily: "inherit" }}>
              {p}
            </button>
          ))}
          <button className="btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}>Export</button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(190px,1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { label: "Total Searches",      value: "36,204", delta: "+12.4%", up: true },
          { label: "Quote Requests",       value: s.homeowners.quoteRequests.toLocaleString(), delta: "+8.7%", up: true },
          { label: "Projects Completed",   value: s.homeowners.projectsCompleted.toLocaleString(), delta: "+15.2%", up: true },
          { label: "Avg Time to Match",    value: "3.2 min", delta: "-18%", up: true },
          { label: "Contractor Retention", value: "92.4%", delta: "+1.1%", up: true },
          { label: "Homeowner Return Rate",value: "67.8%", delta: "+4.3%", up: true },
        ].map(kpi => (
          <div key={kpi.label} className="card" style={{ padding: "1.25rem" }}>
            <div style={{ fontSize: "1.625rem", fontWeight: 800, color: "var(--navy)", letterSpacing: "-0.02em", marginBottom: "0.25rem" }}>{kpi.value}</div>
            <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--gray-600)", marginBottom: "0.25rem" }}>{kpi.label}</div>
            <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: kpi.up ? "#16a34a" : "var(--red)" }}>{kpi.delta} vs last period</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
        {/* Revenue trend */}
        <div className="card" style={{ padding: "1.75rem" }}>
          <h2 style={{ fontWeight: 700, color: "var(--navy)", fontSize: "1.0625rem", marginBottom: "1.5rem" }}>Revenue Trend</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            {REVENUE_MONTHLY.map((m, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "32px 1fr 90px 60px", gap: "0.75rem", alignItems: "center" }}>
                <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--gray-500)" }}>{m.month}</span>
                <Bar pct={(m.revenue / 15000) * 100} color={i === REVENUE_MONTHLY.length - 1 ? "var(--navy)" : "var(--gray-200)"} />
                <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--navy)", textAlign: "right" }}>
                  ${m.revenue.toLocaleString()}
                </span>
                <span style={{ fontSize: "0.75rem", color: "var(--gray-400)", textAlign: "right" }}>
                  {m.contractors} pros
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top categories */}
        <div className="card" style={{ padding: "1.75rem" }}>
          <h2 style={{ fontWeight: 700, color: "var(--navy)", fontSize: "1.0625rem", marginBottom: "1.5rem" }}>Performance by Category</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {TOP_CATEGORIES.map((cat, i) => (
              <div key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "0.875rem" }}>
                  <span style={{ fontWeight: 600, color: "var(--navy)" }}>{cat.category}</span>
                  <span style={{ color: "var(--gray-400)" }}>{cat.leads} leads · {cat.conversionPct}% conv.</span>
                </div>
                <Bar pct={(cat.leads / maxLeads) * 100} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top states */}
      <div className="card" style={{ padding: "1.75rem", marginBottom: "1.5rem" }}>
        <h2 style={{ fontWeight: 700, color: "var(--navy)", fontSize: "1.0625rem", marginBottom: "1.5rem" }}>Performance by State</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--gray-100)" }}>
              {["State","Contractors","Lead Volume","Monthly Revenue","Lead Distribution"].map(h => (
                <th key={h} style={{ padding: "0.625rem 0", textAlign: "left", fontSize: "0.8125rem", fontWeight: 700, color: "var(--gray-500)", paddingBottom: "0.875rem" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TOP_STATES_DATA.map((row, i) => (
              <tr key={i} style={{ borderBottom: i < TOP_STATES_DATA.length - 1 ? "1px solid var(--gray-50)" : "none" }}>
                <td style={{ padding: "0.875rem 0", fontWeight: 600, color: "var(--navy)", fontSize: "0.875rem" }}>{row.state}</td>
                <td style={{ padding: "0.875rem 0", color: "var(--gray-600)", fontSize: "0.875rem" }}>{row.contractors}</td>
                <td style={{ padding: "0.875rem 0", color: "var(--gray-600)", fontSize: "0.875rem" }}>{row.leads}</td>
                <td style={{ padding: "0.875rem 0", fontWeight: 700, color: "var(--navy)", fontSize: "0.875rem" }}>${row.revenue.toLocaleString()}</td>
                <td style={{ padding: "0.875rem 0", minWidth: "140px" }}>
                  <Bar pct={(row.leads / maxStateLeads) * 100} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Platform health */}
      <div className="card" style={{ padding: "1.75rem" }}>
        <h2 style={{ fontWeight: 700, color: "var(--navy)", fontSize: "1.0625rem", marginBottom: "1.5rem" }}>Platform Health</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: "1rem" }}>
          {[
            { label: "Uptime (30 days)",      value: "99.97%",  status: "good" },
            { label: "Avg Page Load",          value: "1.2s",    status: "good" },
            { label: "Lighthouse Score",       value: "96/100",  status: "good" },
            { label: "Search Latency (p95)",   value: "89ms",    status: "good" },
            { label: "Failed Webhooks (30d)",  value: "0",       status: "good" },
            { label: "Stripe API Errors",      value: "2",       status: "warn" },
          ].map(item => (
            <div key={item.label} style={{ padding: "1rem", background: item.status === "good" ? "rgba(22,163,74,0.04)" : "rgba(245,158,11,0.06)", border: `1.5px solid ${item.status === "good" ? "rgba(22,163,74,0.15)" : "rgba(245,158,11,0.25)"}`, borderRadius: "var(--radius)" }}>
              <div style={{ fontSize: "1.375rem", fontWeight: 800, color: item.status === "good" ? "#16a34a" : "#d97706", marginBottom: "0.25rem" }}>{item.value}</div>
              <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--gray-600)" }}>{item.label}</div>
              <div style={{ fontSize: "0.75rem", color: item.status === "good" ? "#16a34a" : "#d97706", marginTop: "0.2rem", fontWeight: 600 }}>
                {item.status === "good" ? "✓ Healthy" : "⚠ Monitor"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
