"use client";
import { useState } from "react";
import Link from "next/link";
import {
  ADMIN_STATS, PENDING_CONTRACTORS, RECENT_PAYMENTS,
  REVENUE_MONTHLY, FLAGGED_REVIEWS, TOP_CATEGORIES
} from "@/lib/admin/mock-data";
import { COMPANY } from "@/lib/data";

function KpiCard({ icon, label, value, sub, trend, color = "var(--navy)" }:
  { icon: string; label: string; value: string; sub?: string; trend?: { pct: number; up: boolean }; color?: string }) {
  return (
    <div className="card" style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1rem" }}>
        <div style={{ width: "40px", height: "40px", background: `${color}12`, borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem" }}>
          {icon}
        </div>
        {trend && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.8125rem", fontWeight: 600, color: trend.up ? "#16a34a" : "var(--red)" }}>
            {trend.up ? "↑" : "↓"} {Math.abs(trend.pct)}%
          </div>
        )}
      </div>
      <div style={{ fontSize: "1.875rem", fontWeight: 800, color, letterSpacing: "-0.03em", lineHeight: 1, marginBottom: "0.375rem" }}>{value}</div>
      <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--gray-600)" }}>{label}</div>
      {sub && <div style={{ fontSize: "0.8125rem", color: "var(--gray-400)", marginTop: "0.25rem" }}>{sub}</div>}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    active:    { bg: "rgba(22,163,74,0.1)",   color: "#16a34a", label: "Active" },
    past_due:  { bg: "rgba(245,158,11,0.1)",  color: "#d97706", label: "Past Due" },
    suspended: { bg: "rgba(199,25,26,0.1)",   color: "var(--red)", label: "Suspended" },
    canceled:  { bg: "var(--gray-100)",        color: "var(--gray-500)", label: "Canceled" },
    pending:   { bg: "rgba(99,102,241,0.1)",  color: "#6366f1", label: "Pending" },
    succeeded: { bg: "rgba(22,163,74,0.1)",   color: "#16a34a", label: "Paid" },
    failed:    { bg: "rgba(199,25,26,0.1)",   color: "var(--red)", label: "Failed" },
  };
  const s = map[status] ?? map.pending;
  return (
    <span style={{ background: s.bg, color: s.color, padding: "0.2rem 0.625rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700 }}>
      {s.label}
    </span>
  );
}

function MiniBarChart({ data }: { data: typeof REVENUE_MONTHLY }) {
  const max = Math.max(...data.map(d => d.revenue));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", height: "80px" }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
          <div style={{
            width: "100%", background: i === data.length - 1 ? "var(--navy)" : "var(--gray-150)",
            borderRadius: "3px 3px 0 0", height: `${(d.revenue / max) * 70}px`,
            transition: "height 0.4s ease",
          }} />
          <span style={{ fontSize: "0.6rem", color: "var(--gray-400)", fontWeight: 600 }}>{d.month}</span>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const [confirmAction, setConfirmAction] = useState<string | null>(null);

  const s = ADMIN_STATS;
  const newContractors = PENDING_CONTRACTORS.length;

  return (
    <div>
      {/* Page header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.625rem", fontWeight: 800, color: "var(--navy)", marginBottom: "0.25rem" }}>Dashboard</h1>
          <p style={{ color: "var(--gray-500)", fontSize: "0.875rem" }}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button className="btn-secondary" style={{ padding: "0.625rem 1.125rem", fontSize: "0.875rem" }}>
            Export CSV
          </button>
          <Link href="/admin/contractors" className="btn-red" style={{ padding: "0.625rem 1.125rem", fontSize: "0.875rem" }}>
            Review Pending ({newContractors})
          </Link>
        </div>
      </div>

      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: "1rem", marginBottom: "2rem" }}>
        <KpiCard icon="💰" label="Monthly Revenue"    value={`$${s.revenue.mrr.toLocaleString("en-US",{minimumFractionDigits:2})}`} sub={`ARR $${Math.round(s.revenue.arr/1000)}K`} trend={{ pct: s.revenue.growthPct, up: true }} color="var(--navy)" />
        <KpiCard icon="👷" label="Active Contractors" value={s.contractors.active.toString()} sub={`+${s.contractors.newThisMonth} this month`} trend={{ pct: 9.1, up: true }} />
        <KpiCard icon="⏳" label="Pending Review"     value={s.contractors.pending.toString()} sub="Awaiting approval" color="#6366f1" />
        <KpiCard icon="⚠️" label="Suspended"         value={s.contractors.suspended.toString()} sub="Payment issues" color="var(--red)" />
        <KpiCard icon="🏠" label="Homeowners"         value={s.homeowners.total.toLocaleString()} sub={`+${s.homeowners.newThisMonth} this month`} trend={{ pct: 8.2, up: true }} />
        <KpiCard icon="⭐" label="Avg Rating"         value={s.platform.avgRating.toString()} sub={`${s.platform.reviewsTotal.toLocaleString()} reviews`} trend={{ pct: 0.4, up: true }} />
      </div>

      {/* Row: Revenue chart + Pending approvals */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
        {/* Revenue chart */}
        <div className="card" style={{ padding: "1.75rem" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.5rem" }}>
            <div>
              <h2 style={{ fontWeight: 700, color: "var(--navy)", fontSize: "1.0625rem", marginBottom: "0.25rem" }}>Monthly Revenue</h2>
              <div style={{ fontSize: "0.8125rem", color: "var(--gray-400)" }}>Last 7 months</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "1.375rem", fontWeight: 800, color: "var(--navy)" }}>
                ${s.revenue.mrr.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: "0.8125rem", color: "#16a34a", fontWeight: 600 }}>↑ {s.revenue.growthPct}% vs last month</div>
            </div>
          </div>
          <MiniBarChart data={REVENUE_MONTHLY} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginTop: "1.25rem", paddingTop: "1.25rem", borderTop: "1px solid var(--gray-100)" }}>
            {[
              ["MRR",      `$${s.revenue.mrr.toLocaleString("en-US",{minimumFractionDigits:2})}`],
              ["ARR",      `$${Math.round(s.revenue.arr/1000)}K`],
              ["Avg/Pro",  `$${s.revenue.avgRevenuePerContractor.toFixed(2)}`],
            ].map(([l,v]) => (
              <div key={l} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "0.8125rem", color: "var(--gray-400)", marginBottom: "0.25rem" }}>{l}</div>
                <div style={{ fontWeight: 700, color: "var(--navy)", fontSize: "0.9375rem" }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending approvals */}
        <div className="card" style={{ padding: "1.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
            <h2 style={{ fontWeight: 700, color: "var(--navy)", fontSize: "1.0625rem" }}>
              Pending Approvals
              <span style={{ marginLeft: "0.5rem", background: "var(--red)", color: "white", borderRadius: "999px", padding: "1px 8px", fontSize: "0.75rem", fontWeight: 800 }}>
                {PENDING_CONTRACTORS.length}
              </span>
            </h2>
            <Link href="/admin/contractors" style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--navy)", textDecoration: "none" }}>
              View all →
            </Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {PENDING_CONTRACTORS.slice(0, 4).map(c => (
              <div key={c.id} style={{ display: "flex", alignItems: "center", gap: "0.875rem", padding: "0.875rem", background: "var(--gray-50)", borderRadius: "var(--radius-sm)", border: "1px solid var(--gray-100)" }}>
                <div style={{ width: "38px", height: "38px", background: "var(--navy)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: "0.9375rem", flexShrink: 0 }}>
                  {c.name.charAt(0)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, color: "var(--navy)", fontSize: "0.875rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.company}</div>
                  <div style={{ fontSize: "0.8125rem", color: "var(--gray-400)" }}>{c.category} · {c.location}</div>
                </div>
                <div style={{ display: "flex", gap: "0.375rem", flexShrink: 0 }}>
                  <div style={{ display: "flex", gap: "0.25rem" }}>
                    {c.hasLicense  && <span title="License" style={{ fontSize: "0.875rem" }}>📋</span>}
                    {c.hasInsurance&& <span title="Insurance" style={{ fontSize: "0.875rem" }}>🛡️</span>}
                    {c.photoCount > 0 && <span title={`${c.photoCount} photos`} style={{ fontSize: "0.875rem" }}>📸</span>}
                  </div>
                  <button onClick={() => setConfirmAction(`approve:${c.id}`)} style={{ padding: "0.3rem 0.625rem", background: "rgba(22,163,74,0.12)", color: "#16a34a", border: "1px solid rgba(22,163,74,0.25)", borderRadius: "var(--radius-xs)", fontWeight: 700, fontSize: "0.75rem", cursor: "pointer", fontFamily: "inherit" }}>
                    ✓
                  </button>
                  <button onClick={() => setConfirmAction(`reject:${c.id}`)} style={{ padding: "0.3rem 0.625rem", background: "rgba(199,25,26,0.08)", color: "var(--red)", border: "1px solid rgba(199,25,26,0.2)", borderRadius: "var(--radius-xs)", fontWeight: 700, fontSize: "0.75rem", cursor: "pointer", fontFamily: "inherit" }}>
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row: Recent payments + Top categories */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
        {/* Recent payments */}
        <div className="card" style={{ padding: "1.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
            <h2 style={{ fontWeight: 700, color: "var(--navy)", fontSize: "1.0625rem" }}>Recent Payments</h2>
            <Link href="/admin/subscriptions" style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--navy)", textDecoration: "none" }}>View all →</Link>
          </div>
          <div>
            {RECENT_PAYMENTS.map((p, i) => (
              <div key={p.id} style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: "1rem", padding: "0.75rem 0", borderBottom: i < RECENT_PAYMENTS.length - 1 ? "1px solid var(--gray-50)" : "none", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--navy)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.contractor}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--gray-400)" }}>{p.date} · {p.method}</div>
                </div>
                <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--navy)" }}>${p.amount.toFixed(2)}</span>
                <StatusBadge status={p.status} />
                {p.status === "failed" && (
                  <button style={{ padding: "0.25rem 0.625rem", background: "var(--red)", color: "white", border: "none", borderRadius: "var(--radius-xs)", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                    Retry
                  </button>
                )}
                {p.status !== "failed" && <div style={{ width: "40px" }} />}
              </div>
            ))}
          </div>
        </div>

        {/* Top categories */}
        <div className="card" style={{ padding: "1.75rem" }}>
          <h2 style={{ fontWeight: 700, color: "var(--navy)", fontSize: "1.0625rem", marginBottom: "1.25rem" }}>Top Categories</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {TOP_CATEGORIES.slice(0, 6).map((cat, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
                <div style={{ width: "22px", height: "22px", background: "var(--navy)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "0.6875rem", fontWeight: 800, flexShrink: 0 }}>{i+1}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                    <span style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--navy)" }}>{cat.category}</span>
                    <span style={{ fontSize: "0.75rem", color: "var(--gray-400)" }}>{cat.contractors} pros</span>
                  </div>
                  <div style={{ height: "5px", background: "var(--gray-100)", borderRadius: "999px", overflow: "hidden" }}>
                    <div style={{ height: "100%", background: "var(--navy)", borderRadius: "999px", width: `${(cat.leads / 312) * 100}%` }} />
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--gray-400)", marginTop: "0.2rem" }}>{cat.leads} leads · {cat.conversionPct}% conversion</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Flagged reviews */}
      {FLAGGED_REVIEWS.length > 0 && (
        <div className="card" style={{ padding: "1.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
            <h2 style={{ fontWeight: 700, color: "var(--navy)", fontSize: "1.0625rem" }}>
              Flagged Reviews
              <span style={{ marginLeft: "0.5rem", background: "rgba(245,158,11,0.15)", color: "#d97706", borderRadius: "999px", padding: "1px 8px", fontSize: "0.75rem", fontWeight: 800 }}>
                {FLAGGED_REVIEWS.length} need review
              </span>
            </h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            {FLAGGED_REVIEWS.map(r => (
              <div key={r.id} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "1rem", padding: "1rem", background: "rgba(245,158,11,0.04)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: "var(--radius)", alignItems: "center" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.375rem" }}>
                    <span style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--navy)" }}>{r.contractor}</span>
                    <span style={{ fontSize: "0.75rem", color: "var(--gray-400)" }}>reviewed by {r.reviewer}</span>
                    <div style={{ display: "flex", gap: "1px" }}>
                      {[1,2,3,4,5].map(i => <span key={i} style={{ color: i <= r.rating ? "#f59e0b" : "var(--gray-200)", fontSize: "0.875rem" }}>★</span>)}
                    </div>
                    <span className="badge badge-gold" style={{ fontSize: "0.7rem" }}>{r.reason}</span>
                  </div>
                  <p style={{ fontSize: "0.875rem", color: "var(--gray-600)", lineHeight: 1.6 }}>{r.text}</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flexShrink: 0 }}>
                  <button style={{ padding: "0.375rem 0.875rem", background: "rgba(22,163,74,0.1)", color: "#16a34a", border: "1px solid rgba(22,163,74,0.2)", borderRadius: "var(--radius-xs)", fontWeight: 700, fontSize: "0.8125rem", cursor: "pointer", fontFamily: "inherit" }}>
                    Keep
                  </button>
                  <button style={{ padding: "0.375rem 0.875rem", background: "rgba(199,25,26,0.08)", color: "var(--red)", border: "1px solid rgba(199,25,26,0.2)", borderRadius: "var(--radius-xs)", fontWeight: 700, fontSize: "0.8125rem", cursor: "pointer", fontFamily: "inherit" }}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirm modal */}
      {confirmAction && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
          <div style={{ background: "white", borderRadius: "var(--radius-xl)", padding: "2rem", maxWidth: "420px", width: "100%", boxShadow: "var(--shadow-xl)" }}>
            <h3 style={{ fontWeight: 700, color: "var(--navy)", fontSize: "1.125rem", marginBottom: "0.75rem" }}>
              {confirmAction.startsWith("approve") ? "Approve Contractor?" : "Reject Application?"}
            </h3>
            <p style={{ color: "var(--gray-500)", fontSize: "0.9375rem", lineHeight: 1.65, marginBottom: "1.5rem" }}>
              {confirmAction.startsWith("approve")
                ? "This contractor's profile will go live immediately and they will receive a welcome email."
                : "The contractor will be notified with the reason for rejection and can reapply."}
            </p>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button className="btn-secondary" onClick={() => setConfirmAction(null)} style={{ flex: 1 }}>Cancel</button>
              <button
                className={confirmAction.startsWith("approve") ? "btn-red" : "btn-secondary"}
                onClick={() => setConfirmAction(null)}
                style={{ flex: 2, background: confirmAction.startsWith("approve") ? "#16a34a" : "var(--red)", color: "white", border: "none" }}
              >
                {confirmAction.startsWith("approve") ? "✓ Approve" : "✕ Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
