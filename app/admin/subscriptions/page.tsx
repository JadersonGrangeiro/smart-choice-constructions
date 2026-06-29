"use client";
import { useState, useEffect } from "react";

interface Subscription {
  id: string;
  status: string;
  current_period_end: string | null;
  failed_payment_count: number;
  created_at: string;
  stripe_price_id: string;
  contractors: {
    id: string;
    company_name: string;
    owner_first_name: string;
    owner_last_name: string;
    category: string;
    city: string;
    state_code: string;
    email: string;
  } | null;
}

interface Stats {
  mrr: number;
  active: number;
  past_due: number;
  canceled: number;
  total: number;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    active:     { bg: "rgba(22,163,74,0.1)",  color: "#16a34a",        label: "Active" },
    past_due:   { bg: "rgba(245,158,11,0.1)", color: "#d97706",        label: "Past Due" },
    unpaid:     { bg: "rgba(245,158,11,0.1)", color: "#d97706",        label: "Unpaid" },
    canceled:   { bg: "var(--gray-100)",       color: "var(--gray-500)", label: "Canceled" },
    incomplete: { bg: "rgba(99,102,241,0.1)", color: "#6366f1",        label: "Incomplete" },
    trialing:   { bg: "rgba(22,163,74,0.08)", color: "#16a34a",        label: "Trialing" },
    paused:     { bg: "var(--gray-100)",       color: "var(--gray-500)", label: "Paused" },
  };
  const s = map[status] ?? map.canceled;
  return <span style={{ background: s.bg, color: s.color, padding: "0.2rem 0.625rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700 }}>{s.label}</span>;
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const MONTHLY_PRICE = 49.90;

export default function SubscriptionsAdminPage() {
  const [filter, setFilter] = useState("all");
  const [subs,   setSubs]   = useState<Subscription[]>([]);
  const [stats,  setStats]  = useState<Stats>({ mrr: 0, active: 0, past_due: 0, canceled: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res  = await fetch(`/api/admin/subscriptions?filter=${filter}&limit=100`);
        const json = await res.json();
        setSubs(json.subscriptions ?? []);
        setStats(json.stats ?? { mrr: 0, active: 0, past_due: 0, canceled: 0, total: 0 });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [filter]);

  const arr = stats.mrr * 12;

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.625rem", fontWeight: 800, color: "var(--navy)", marginBottom: "0.25rem" }}>Subscriptions & Revenue</h1>
        <p style={{ color: "var(--gray-500)", fontSize: "0.875rem" }}>Monitor billing, payments, and revenue metrics</p>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { label: "Monthly Revenue",    value: loading ? "…" : `$${stats.mrr.toLocaleString("en-US",{minimumFractionDigits:2})}`,  sub: "MRR",          color: "var(--navy)" },
          { label: "Annual Run Rate",    value: loading ? "…" : `$${Math.round(arr/1000)}K`,                                          sub: "ARR",          color: "var(--navy)" },
          { label: "Active Subscribers", value: loading ? "…" : stats.active.toString(),                                              sub: "paying now" },
          { label: "Past Due",           value: loading ? "…" : stats.past_due.toString(),                                            sub: "payment failed", color: "#d97706" },
          { label: "Canceled",           value: loading ? "…" : stats.canceled.toString(),                                            sub: "this period" },
          { label: "Total Subscribers",  value: loading ? "…" : stats.total.toString(),                                               sub: "all time" },
        ].map(k => (
          <div key={k.label} className="card" style={{ padding: "1.25rem" }}>
            <div style={{ fontSize: "1.625rem", fontWeight: 800, color: k.color ?? "var(--navy)", letterSpacing: "-0.02em", marginBottom: "0.25rem" }}>{k.value}</div>
            <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--gray-600)" }}>{k.label}</div>
            <div style={{ fontSize: "0.8125rem", color: "var(--gray-400)" }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Subscription status breakdown */}
      {!loading && stats.total > 0 && (
        <div className="card" style={{ padding: "1.75rem", marginBottom: "1.5rem" }}>
          <h2 style={{ fontWeight: 700, color: "var(--navy)", fontSize: "1.0625rem", marginBottom: "1.5rem" }}>Subscription Status</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {[
              { label: "Active",   count: stats.active,   color: "#16a34a" },
              { label: "Past Due", count: stats.past_due, color: "#f59e0b" },
              { label: "Canceled", count: stats.canceled, color: "var(--gray-400)" },
            ].map(row => {
              const pct = stats.total > 0 ? Math.round((row.count / stats.total) * 100) : 0;
              return (
                <div key={row.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--gray-700)" }}>{row.label}</span>
                    <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--navy)" }}>{row.count} ({pct}%)</span>
                  </div>
                  <div style={{ height: "8px", background: "var(--gray-100)", borderRadius: "999px", overflow: "hidden" }}>
                    <div style={{ height: "100%", background: row.color, borderRadius: "999px", width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Subscriber list */}
      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ padding: "1rem 1.5rem", display: "flex", gap: "0.5rem", borderBottom: "1px solid var(--gray-100)", flexWrap: "wrap", alignItems: "center" }}>
          {["all","active","past_due","canceled"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: "0.375rem 0.875rem", borderRadius: "999px",
              background: filter === f ? "var(--navy)" : "white",
              color: filter === f ? "white" : "var(--gray-600)",
              border: `1.5px solid ${filter === f ? "var(--navy)" : "var(--gray-200)"}`,
              fontWeight: 600, fontSize: "0.8125rem", cursor: "pointer", fontFamily: "inherit", textTransform: "capitalize",
            }}>
              {f === "all" ? "All" : f.replace("_", " ")}
            </button>
          ))}
          <span style={{ fontSize: "0.875rem", color: "var(--gray-400)", marginLeft: "auto" }}>
            {loading ? "…" : `${subs.length} result${subs.length !== 1 ? "s" : ""}`}
          </span>
        </div>

        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--gray-400)" }}>Loading…</div>
        ) : subs.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--gray-400)" }}>No subscriptions found.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--gray-50)", borderBottom: "1px solid var(--gray-150)" }}>
                {["Contractor","Plan","Status","MRR","Next Billing","Failed","Created"].map(h => (
                  <th key={h} style={{ padding: "0.875rem 1.25rem", textAlign: "left", fontSize: "0.8125rem", fontWeight: 700, color: "var(--gray-500)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {subs.map((s, i) => (
                <tr key={s.id} style={{ borderBottom: i < subs.length - 1 ? "1px solid var(--gray-50)" : "none" }}>
                  <td style={{ padding: "1rem 1.25rem" }}>
                    <div style={{ fontWeight: 700, color: "var(--navy)", fontSize: "0.875rem" }}>{s.contractors?.company_name ?? "—"}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--gray-400)" }}>
                      {s.contractors ? `${s.contractors.owner_first_name} ${s.contractors.owner_last_name}` : ""}
                    </div>
                  </td>
                  <td style={{ padding: "1rem 1.25rem", fontSize: "0.875rem", color: "var(--gray-600)" }}>Professional</td>
                  <td style={{ padding: "1rem 1.25rem" }}><StatusBadge status={s.status} /></td>
                  <td style={{ padding: "1rem 1.25rem", fontWeight: 700, color: "var(--navy)", fontSize: "0.875rem" }}>
                    {s.status === "active" ? `$${MONTHLY_PRICE.toFixed(2)}` : "—"}
                  </td>
                  <td style={{ padding: "1rem 1.25rem", fontSize: "0.875rem", color: "var(--gray-600)" }}>
                    {s.current_period_end ? fmt(s.current_period_end) : "—"}
                  </td>
                  <td style={{ padding: "1rem 1.25rem", textAlign: "center" }}>
                    {s.failed_payment_count > 0 ? (
                      <span style={{ fontWeight: 700, color: "#d97706" }}>{s.failed_payment_count}</span>
                    ) : (
                      <span style={{ color: "var(--gray-300)" }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: "1rem 1.25rem", fontSize: "0.8125rem", color: "var(--gray-500)" }}>
                    {fmt(s.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
