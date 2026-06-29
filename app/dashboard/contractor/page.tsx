"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface DashboardData {
  contractor: {
    id: string;
    company_name: string;
    owner_first_name: string;
    status: string;
    profile_visible: boolean;
    category: string;
    state_code: string;
    city: string;
    ranking_score: number;
    is_licensed: boolean;
    is_insured: boolean;
    is_background_checked: boolean;
    contractor_subscriptions: Array<{
      status: string;
      current_period_end: string | null;
      cancel_at_period_end: boolean;
      failed_payment_count: number;
    }>;
    contractor_photos: Array<{ id: string; public_url: string; sort_order: number }>;
  };
  stats: {
    quote_requests: number;
    total_reviews: number;
    avg_rating: number | null;
    profile_views: number;
    ranking_score: number;
  };
  recent_quotes: Array<{
    id: string;
    service_type: string;
    contact_name: string;
    city: string | null;
    state_code: string | null;
    status: string;
    created_at: string;
  }>;
  recent_reviews: Array<{
    id: string;
    rating: number;
    reviewer_name: string;
    body: string;
    created_at: string;
  }>;
  payments: Array<{
    id: string;
    event_type: string;
    amount_cents: number | null;
    status: string | null;
    created_at: string;
    failure_reason: string | null;
  }>;
}

function StatusChip({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    active:           { bg: "rgba(22,163,74,0.1)",  color: "#16a34a", label: "Active" },
    pending_approval: { bg: "rgba(99,102,241,0.1)", color: "#6366f1", label: "Under Review" },
    pending_payment:  { bg: "rgba(245,158,11,0.1)", color: "#d97706", label: "Payment Pending" },
    suspended:        { bg: "rgba(199,25,26,0.1)",  color: "var(--red)", label: "Suspended" },
    canceled:         { bg: "var(--gray-100)",      color: "var(--gray-500)", label: "Canceled" },
    rejected:         { bg: "rgba(239,68,68,0.1)",  color: "#dc2626", label: "Rejected" },
  };
  const s = map[status] ?? map.pending_approval;
  return (
    <span style={{ background: s.bg, color: s.color, padding: "0.3rem 0.875rem", borderRadius: "999px", fontSize: "0.875rem", fontWeight: 700 }}>
      {s.label}
    </span>
  );
}

export default function ContractorDashboard() {
  const [data, setData]           = useState<DashboardData | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard/contractor")
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error);
        else setData(d);
      })
      .catch(() => setError("Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  const openBillingPortal = async () => {
    setPortalLoading(true);
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const d   = await res.json();
    if (d.url) window.location.href = d.url;
    else { alert("Failed to open billing portal."); setPortalLoading(false); }
  };

  if (loading) {
    return (
      <div style={{ paddingTop: "76px", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⏳</div>
          <p style={{ color: "var(--gray-500)" }}>Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ paddingTop: "76px", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⚠️</div>
          <p style={{ color: "var(--red)", marginBottom: "1rem" }}>{error || "Dashboard unavailable"}</p>
          <Link href="/login" className="btn-red" style={{ padding: "0.75rem 2rem" }}>Sign In Again</Link>
        </div>
      </div>
    );
  }

  const { contractor, stats, recent_quotes, recent_reviews } = data;
  const sub = contractor.contractor_subscriptions[0];

  return (
    <div style={{ paddingTop: "76px", minHeight: "100vh", background: "var(--gray-50)" }}>
      <div className="container" style={{ maxWidth: "1100px", padding: "2.5rem 1.5rem" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--navy)", marginBottom: "0.5rem" }}>
              Welcome, {contractor.owner_first_name}
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
              <StatusChip status={contractor.status} />
              {contractor.profile_visible && (
                <span style={{ fontSize: "0.8125rem", color: "#16a34a", fontWeight: 600 }}>● Profile is live</span>
              )}
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <Link href="/dashboard/messages" className="btn-secondary" style={{ padding: "0.625rem 1.25rem", fontSize: "0.875rem" }}>
              💬 Messages
            </Link>
            {contractor.status === "active" && (
              <Link href={`/contractors/${contractor.id}`} className="btn-secondary" style={{ padding: "0.625rem 1.25rem", fontSize: "0.875rem" }}>
                View Public Profile →
              </Link>
            )}
            {sub && (
              <button onClick={openBillingPortal} disabled={portalLoading} className="btn-red" style={{ padding: "0.625rem 1.25rem", fontSize: "0.875rem", opacity: portalLoading ? 0.7 : 1 }}>
                {portalLoading ? "Opening…" : "Manage Subscription"}
              </button>
            )}
          </div>
        </div>

        {/* Status notices */}
        {contractor.status === "pending_approval" && (
          <div style={{ background: "rgba(99,102,241,0.08)", border: "1.5px solid rgba(99,102,241,0.25)", borderRadius: "var(--radius)", padding: "1.25rem 1.5rem", marginBottom: "1.5rem" }}>
            <div style={{ fontWeight: 700, color: "#6366f1", marginBottom: "0.375rem" }}>Profile under review</div>
            <p style={{ color: "var(--gray-600)", fontSize: "0.9375rem", lineHeight: 1.65, margin: 0 }}>
              Your profile is being reviewed by our team — typically less than 24 hours. We'll email you once it's approved.
            </p>
          </div>
        )}

        {sub?.status === "past_due" && (
          <div style={{ background: "rgba(245,158,11,0.08)", border: "1.5px solid rgba(245,158,11,0.3)", borderRadius: "var(--radius)", padding: "1.25rem 1.5rem", marginBottom: "1.5rem" }}>
            <div style={{ fontWeight: 700, color: "#d97706", marginBottom: "0.375rem" }}>Payment past due</div>
            <p style={{ color: "var(--gray-600)", fontSize: "0.9375rem", margin: "0 0 0.75rem" }}>
              Your payment has failed {sub.failed_payment_count} time(s). Update your payment method to keep your profile active.
            </p>
            <button onClick={openBillingPortal} style={{ padding: "0.5rem 1.25rem", background: "#d97706", color: "white", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", fontSize: "0.875rem" }}>
              Update Payment Method
            </button>
          </div>
        )}

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(170px,1fr))", gap: "1rem", marginBottom: "2rem" }}>
          {[
            { icon: "📨", label: "Quote Requests", value: stats.quote_requests.toString() },
            { icon: "⭐", label: "Avg Rating",      value: stats.avg_rating ? stats.avg_rating.toFixed(1) : "—" },
            { icon: "💬", label: "Total Reviews",   value: stats.total_reviews.toString() },
            { icon: "📊", label: "Ranking Score",   value: stats.ranking_score.toFixed(0) + "/100" },
          ].map(stat => (
            <div key={stat.label} className="card" style={{ padding: "1.25rem" }}>
              <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{stat.icon}</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--navy)", marginBottom: "0.25rem" }}>{stat.value}</div>
              <div style={{ fontSize: "0.8125rem", color: "var(--gray-500)", fontWeight: 600 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
          {/* Recent leads */}
          <div className="card" style={{ padding: "1.75rem" }}>
            <h2 style={{ fontWeight: 700, color: "var(--navy)", fontSize: "1rem", marginBottom: "1.25rem" }}>Recent Quote Requests</h2>
            {recent_quotes.length === 0 ? (
              <p style={{ color: "var(--gray-400)", fontSize: "0.9rem", textAlign: "center", padding: "2rem 0" }}>
                No leads yet. Keep your profile complete to rank higher.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {recent_quotes.map(q => (
                  <div key={q.id} style={{ padding: "0.75rem", background: "var(--gray-50)", borderRadius: "var(--radius-sm)", border: "1px solid var(--gray-100)" }}>
                    <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--navy)" }}>{q.service_type}</div>
                    <div style={{ fontSize: "0.8125rem", color: "var(--gray-500)", marginTop: "0.125rem" }}>
                      {q.contact_name} · {q.city}, {q.state_code}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--gray-400)", marginTop: "0.25rem" }}>
                      {new Date(q.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent reviews */}
          <div className="card" style={{ padding: "1.75rem" }}>
            <h2 style={{ fontWeight: 700, color: "var(--navy)", fontSize: "1rem", marginBottom: "1.25rem" }}>Recent Reviews</h2>
            {recent_reviews.length === 0 ? (
              <p style={{ color: "var(--gray-400)", fontSize: "0.9rem", textAlign: "center", padding: "2rem 0" }}>No reviews yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                {recent_reviews.map(r => (
                  <div key={r.id} style={{ padding: "0.875rem", background: "var(--gray-50)", borderRadius: "var(--radius-sm)", border: "1px solid var(--gray-100)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.375rem" }}>
                      <div style={{ display: "flex", gap: "1px" }}>
                        {[1,2,3,4,5].map(i => <span key={i} style={{ color: i <= r.rating ? "#f59e0b" : "var(--gray-200)", fontSize: "0.875rem" }}>★</span>)}
                      </div>
                      <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--navy)" }}>{r.reviewer_name}</span>
                    </div>
                    <p style={{ fontSize: "0.875rem", color: "var(--gray-600)", lineHeight: 1.55, margin: 0 }}>
                      {r.body.length > 100 ? r.body.slice(0, 100) + "…" : r.body}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Subscription block */}
        {sub && (
          <div className="card" style={{ padding: "1.75rem", marginTop: "1.5rem" }}>
            <h2 style={{ fontWeight: 700, color: "var(--navy)", fontSize: "1rem", marginBottom: "1.25rem" }}>Subscription</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: "1rem" }}>
              {[
                ["Status",     sub.status.replace("_", " ")],
                ["Renews",     sub.current_period_end ? new Date(sub.current_period_end).toLocaleDateString() : "—"],
                ["Auto-renew", sub.cancel_at_period_end ? "Off (cancels at period end)" : "On"],
              ].map(([l, v]) => (
                <div key={l}>
                  <div style={{ fontSize: "0.75rem", color: "var(--gray-400)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>{l}</div>
                  <div style={{ fontWeight: 700, color: "var(--navy)" }}>{v}</div>
                </div>
              ))}
            </div>
            <button onClick={openBillingPortal} disabled={portalLoading} style={{ marginTop: "1.25rem", padding: "0.625rem 1.25rem", background: "var(--navy)", color: "white", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", fontSize: "0.875rem" }}>
              Manage Billing →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
