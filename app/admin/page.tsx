"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { AdminStats } from "@/types/database";

// ── Sub-components ────────────────────────────────────────────────────────────

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
    active:           { bg: "rgba(22,163,74,0.1)",  color: "#16a34a", label: "Active" },
    past_due:         { bg: "rgba(245,158,11,0.1)", color: "#d97706", label: "Past Due" },
    suspended:        { bg: "rgba(199,25,26,0.1)",  color: "var(--red)", label: "Suspended" },
    canceled:         { bg: "var(--gray-100)",      color: "var(--gray-500)", label: "Canceled" },
    pending_approval: { bg: "rgba(99,102,241,0.1)", color: "#6366f1", label: "Pending" },
    succeeded:        { bg: "rgba(22,163,74,0.1)",  color: "#16a34a", label: "Paid" },
    failed:           { bg: "rgba(199,25,26,0.1)",  color: "var(--red)", label: "Failed" },
    rejected:         { bg: "var(--gray-100)",      color: "var(--gray-500)", label: "Rejected" },
  };
  const s = map[status] ?? map.pending_approval;
  return (
    <span style={{ background: s.bg, color: s.color, padding: "0.2rem 0.625rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700 }}>
      {s.label}
    </span>
  );
}

interface PendingContractor {
  id: string;
  company_name: string;
  owner_first_name: string;
  owner_last_name: string;
  category: string;
  city: string;
  state_code: string;
  is_licensed: boolean;
  is_insured: boolean;
  created_at: string;
  contractor_photos: { id: string }[];
}

interface PaymentRow {
  id: string;
  contractor_id: string;
  event_type: string;
  amount_cents: number;
  status: string;
  created_at: string;
  contractors?: { company_name: string };
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [stats, setStats]           = useState<AdminStats | null>(null);
  const [pending, setPending]       = useState<PendingContractor[]>([]);
  const [payments, setPayments]     = useState<PaymentRow[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<string | null>(null);
  const [toast, setToast]           = useState("");

  const loadData = useCallback(async () => {
    setLoadingStats(true);
    try {
      const [statsRes, contractorsRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/contractors?status=pending_approval&limit=6"),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (contractorsRes.ok) {
        const d = await contractorsRes.json();
        setPending(d.contractors ?? []);
      }
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleAction = async (contractorId: string, action: "approve" | "reject") => {
    setActionLoading(contractorId);
    setConfirmAction(null);
    try {
      const res = await fetch(`/api/admin/contractors/${contractorId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        setToast(action === "approve" ? "Contractor approved and profile is now live." : "Application rejected.");
        setPending(prev => prev.filter(c => c.id !== contractorId));
        // Refresh stats
        const statsRes = await fetch("/api/admin/stats");
        if (statsRes.ok) setStats(await statsRes.json());
      }
    } catch {
      setToast("Action failed. Please try again.");
    }
    setActionLoading(null);
    setTimeout(() => setToast(""), 4000);
  };

  const s = stats;

  return (
    <div>
      {/* Toast notification */}
      {toast && (
        <div style={{ position: "fixed", bottom: "2rem", right: "2rem", background: "var(--navy)", color: "white", padding: "0.875rem 1.5rem", borderRadius: "var(--radius)", fontWeight: 600, fontSize: "0.9375rem", boxShadow: "var(--shadow-xl)", zIndex: 1000 }}>
          {toast}
        </div>
      )}

      {/* Page header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.625rem", fontWeight: 800, color: "var(--navy)", marginBottom: "0.25rem" }}>Dashboard</h1>
          <p style={{ color: "var(--gray-500)", fontSize: "0.875rem" }}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            <span style={{ marginLeft: "0.75rem", fontSize: "0.75rem", background: "rgba(22,163,74,0.1)", color: "#16a34a", padding: "2px 8px", borderRadius: "999px", fontWeight: 600 }}>
              LIVE DATA
            </span>
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button onClick={loadData} className="btn-secondary" style={{ padding: "0.625rem 1.125rem", fontSize: "0.875rem" }}>
            ↻ Refresh
          </button>
          <Link href="/admin/contractors" className="btn-red" style={{ padding: "0.625rem 1.125rem", fontSize: "0.875rem" }}>
            Review Pending ({s?.contractors.pending ?? "…"})
          </Link>
        </div>
      </div>

      {/* KPI row */}
      {loadingStats ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: "1rem", marginBottom: "2rem" }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card" style={{ padding: "1.5rem", opacity: 0.4, minHeight: "120px", background: "var(--gray-100)" }} />
          ))}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: "1rem", marginBottom: "2rem" }}>
          <KpiCard
            icon="💰" label="Monthly Revenue"
            value={s ? `$${s.revenue.mrr.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "$0.00"}
            sub={s ? `ARR $${Math.round(s.revenue.arr / 1000)}K` : ""}
            trend={s?.revenue.growth_pct ? { pct: s.revenue.growth_pct, up: s.revenue.growth_pct > 0 } : undefined}
            color="var(--navy)"
          />
          <KpiCard
            icon="👷" label="Active Contractors"
            value={s?.contractors.active.toString() ?? "0"}
            sub={s ? `+${s.contractors.new_this_month} this month` : ""}
          />
          <KpiCard
            icon="⏳" label="Pending Review"
            value={s?.contractors.pending.toString() ?? "0"}
            sub="Awaiting approval" color="#6366f1"
          />
          <KpiCard
            icon="⚠️" label="Suspended"
            value={s?.contractors.suspended.toString() ?? "0"}
            sub="Payment issues" color="var(--red)"
          />
          <KpiCard
            icon="🏠" label="Homeowners"
            value={s?.homeowners.total.toLocaleString() ?? "0"}
            sub={s ? `+${s.homeowners.new_this_month} this month` : ""}
          />
          <KpiCard
            icon="⭐" label="Avg Rating"
            value={s?.platform.avg_rating.toFixed(2) ?? "0.00"}
            sub={s ? `${s.platform.reviews_total.toLocaleString()} reviews` : ""}
          />
        </div>
      )}

      {/* Pending approvals */}
      <div className="card" style={{ padding: "1.75rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
          <h2 style={{ fontWeight: 700, color: "var(--navy)", fontSize: "1.0625rem" }}>
            Pending Approvals
            {pending.length > 0 && (
              <span style={{ marginLeft: "0.5rem", background: "var(--red)", color: "white", borderRadius: "999px", padding: "1px 8px", fontSize: "0.75rem", fontWeight: 800 }}>
                {pending.length}
              </span>
            )}
          </h2>
          <Link href="/admin/contractors?tab=pending" style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--navy)", textDecoration: "none" }}>
            View all →
          </Link>
        </div>

        {pending.length === 0 && !loadingStats && (
          <div style={{ textAlign: "center", padding: "2rem", color: "var(--gray-400)", fontSize: "0.9375rem" }}>
            No pending applications — all caught up!
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {pending.map(c => (
            <div key={c.id} style={{ display: "flex", alignItems: "center", gap: "0.875rem", padding: "0.875rem", background: "var(--gray-50)", borderRadius: "var(--radius-sm)", border: "1px solid var(--gray-100)" }}>
              <div style={{ width: "38px", height: "38px", background: "var(--navy)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: "0.9375rem", flexShrink: 0 }}>
                {c.owner_first_name.charAt(0)}{c.owner_last_name.charAt(0)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, color: "var(--navy)", fontSize: "0.875rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {c.company_name}
                </div>
                <div style={{ fontSize: "0.8125rem", color: "var(--gray-400)" }}>
                  {c.category} · {c.city}, {c.state_code}
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.375rem", flexShrink: 0, alignItems: "center" }}>
                {c.is_licensed   && <span title="License uploaded" style={{ fontSize: "0.875rem" }}>📋</span>}
                {c.is_insured    && <span title="Insurance uploaded" style={{ fontSize: "0.875rem" }}>🛡️</span>}
                {c.contractor_photos.length > 0 && <span title={`${c.contractor_photos.length} photos`} style={{ fontSize: "0.875rem" }}>📸</span>}
                <button
                  onClick={() => setConfirmAction(`approve:${c.id}`)}
                  disabled={actionLoading === c.id}
                  style={{ padding: "0.3rem 0.625rem", background: "rgba(22,163,74,0.12)", color: "#16a34a", border: "1px solid rgba(22,163,74,0.25)", borderRadius: "var(--radius-xs)", fontWeight: 700, fontSize: "0.75rem", cursor: "pointer", fontFamily: "inherit" }}
                >
                  ✓
                </button>
                <button
                  onClick={() => setConfirmAction(`reject:${c.id}`)}
                  disabled={actionLoading === c.id}
                  style={{ padding: "0.3rem 0.625rem", background: "rgba(199,25,26,0.08)", color: "var(--red)", border: "1px solid rgba(199,25,26,0.2)", borderRadius: "var(--radius-xs)", fontWeight: 700, fontSize: "0.75rem", cursor: "pointer", fontFamily: "inherit" }}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue summary */}
      {s && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
          {[
            ["MRR",      `$${s.revenue.mrr.toLocaleString("en-US", { minimumFractionDigits: 2 })}`],
            ["ARR",      `$${Math.round(s.revenue.arr / 1000)}K`],
            ["Growth",   `${s.revenue.growth_pct > 0 ? "↑" : "↓"} ${Math.abs(s.revenue.growth_pct).toFixed(1)}%`],
          ].map(([l, v]) => (
            <div key={l} className="card" style={{ padding: "1.25rem", textAlign: "center" }}>
              <div style={{ fontSize: "0.8125rem", color: "var(--gray-400)", marginBottom: "0.375rem", fontWeight: 600 }}>{l}</div>
              <div style={{ fontWeight: 800, color: "var(--navy)", fontSize: "1.5rem" }}>{v}</div>
            </div>
          ))}
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
                : "The contractor will be notified and can reapply with updated information."}
            </p>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button className="btn-secondary" onClick={() => setConfirmAction(null)} style={{ flex: 1 }}>Cancel</button>
              <button
                onClick={() => {
                  const [action, id] = confirmAction.split(":");
                  handleAction(id, action as "approve" | "reject");
                }}
                style={{ flex: 2, padding: "0.75rem", borderRadius: "var(--radius)", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: "0.9375rem", background: confirmAction.startsWith("approve") ? "#16a34a" : "var(--red)", color: "white" }}
              >
                {confirmAction.startsWith("approve") ? "✓ Approve & Go Live" : "✕ Reject Application"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
