"use client";
import { useState } from "react";
import Link from "next/link";
import { COMPANY, CONTRACTOR_EXTENDED } from "@/lib/data";
import { BADGES, MOCK_CONTRACTOR_BADGES, DOCUMENT_TYPES, type BadgeId, type DocumentType } from "@/lib/badges";
import { DEMO_RANKING, calculateRankingScore } from "@/lib/ranking";
import { BadgeChip } from "@/components/BadgeDisplay";

// ─── Mock data (replace with real API calls in production) ─────────────────
const CONTRACTOR = {
  id: "1", company: "ProBuild Solutions", name: "Thomas Rivera",
  email: "thomas@probuildsolutions.com", phone: "+1 (512) 555-0147",
  location: "Austin, TX", category: "General Contractor",
  profileComplete: 82, profileVisible: true, memberSince: "January 2025",
  website: "", description: "Full-service construction specializing in residential remodels, additions, and new builds.",
  photoCount: 6, subscriptionStatus: "active" as const,
};

const METRICS = {
  profileViews:      { value: 247,  delta: "+18%",  up: true,  label: "Profile Views",       icon: "👁️",  sub: "Last 30 days" },
  phoneClicks:       { value: 34,   delta: "+22%",  up: true,  label: "Phone Clicks",         icon: "📞",  sub: "Last 30 days" },
  websiteClicks:     { value: 12,   delta: "-5%",   up: false, label: "Website Clicks",       icon: "🌐",  sub: "Last 30 days" },
  quoteClicks:       { value: 18,   delta: "+31%",  up: true,  label: "Quote Requests",       icon: "📩",  sub: "Last 30 days" },
  favorites:         { value: 9,    delta: "+3",    up: true,  label: "Saved by Homeowners",  icon: "❤️",  sub: "Total" },
  searchPosition:    { value: "4.2",delta: "-0.8",  up: true,  label: "Avg Search Position",  icon: "🔍",  sub: "Lower is better" },
  avgRating:         { value: 4.9,  delta: "",      up: true,  label: "Average Rating",       icon: "⭐",  sub: "47 reviews" },
  responseRate:      { value: "94%",delta: "+2%",   up: true,  label: "Response Rate",        icon: "⚡",  sub: "Last 30 days" },
};

const MONTHLY_VIEWS = [
  { month: "Jan", views: 98 },  { month: "Feb", views: 134 }, { month: "Mar", views: 156 },
  { month: "Apr", views: 189 }, { month: "May", views: 211 }, { month: "Jun", views: 247 },
];

const LEADS = [
  { id: "1", name: "Jennifer M.", service: "Kitchen Remodel",    location: "Austin, TX",      date: "Today, 9:42 AM",  status: "new",       budget: "$15,000–$25,000" },
  { id: "2", name: "Carlos R.",   service: "Bathroom Addition",   location: "Round Rock, TX",  date: "Today, 8:15 AM",  status: "new",       budget: "$8,000–$12,000" },
  { id: "3", name: "Sarah K.",    service: "Home Addition",       location: "Cedar Park, TX",  date: "Yesterday",       status: "responded", budget: "$40,000–$60,000" },
  { id: "4", name: "David L.",    service: "Deck Construction",   location: "Austin, TX",      date: "June 25",         status: "responded", budget: "$6,000–$9,000" },
  { id: "5", name: "Maria T.",    service: "Full Remodel",        location: "Pflugerville, TX",date: "June 24",         status: "closed",    budget: "$30,000–$50,000" },
];

const INVOICES = [
  { id: "inv_001", date: "June 1, 2025",  amount: 49.90, status: "paid" },
  { id: "inv_002", date: "May 1, 2025",   amount: 49.90, status: "paid" },
  { id: "inv_003", date: "April 1, 2025", amount: 49.90, status: "paid" },
  { id: "inv_004", date: "March 1, 2025", amount: 49.90, status: "paid" },
  { id: "inv_005", date: "Feb 1, 2025",   amount: 49.90, status: "paid" },
  { id: "inv_006", date: "Jan 1, 2025",   amount: 29.90, status: "paid" },
];

const DOCS = [
  { type: "contractor_license" as DocumentType,       label: "Texas GC License #TX-GC-98234",            status: "approved",  submittedAt: "Jun 10, 2025", expiresAt: "Jun 10, 2026" },
  { type: "certificate_of_insurance" as DocumentType, label: "Zurich Insurance COI — $1M liability",      status: "approved",  submittedAt: "Jun 10, 2025", expiresAt: "Dec 31, 2025" },
  { type: "government_id" as DocumentType,            label: "Texas Driver License",                      status: "pending",   submittedAt: "Jun 27, 2025", expiresAt: null },
  { type: "background_check" as DocumentType,         label: "Checkr background report",                 status: "not_submitted", submittedAt: null, expiresAt: null },
  { type: "business_registration" as DocumentType,    label: "LLC Registration",                         status: "not_submitted", submittedAt: null, expiresAt: null },
];

type Tab = "overview" | "metrics" | "leads" | "documents" | "billing" | "profile";

const STATUS_COLORS = {
  new:       { bg: "rgba(199,25,26,0.08)",  color: "var(--red)",   label: "New" },
  responded: { bg: "rgba(22,46,94,0.08)",  color: "var(--navy)", label: "Responded" },
  closed:    { bg: "var(--gray-100)",        color: "var(--gray-500)", label: "Closed" },
};

// ─── Sub-components ────────────────────────────────────────────────────────

function MetricCard({ metric }: { metric: { value: number | string; delta: string; up: boolean; label: string; icon: string; sub: string } }) {
  return (
    <div className="card" style={{ padding: "1.25rem" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "0.875rem" }}>
        <span style={{ fontSize: "1.375rem" }}>{metric.icon}</span>
        {metric.delta && (
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: metric.up ? "#16a34a" : "var(--red)", background: metric.up ? "rgba(22,163,74,0.08)" : "rgba(199,25,26,0.08)", padding: "0.2rem 0.5rem", borderRadius: "999px" }}>
            {metric.up ? "↑" : "↓"} {metric.delta.replace(/[+-]/g, "")}
          </span>
        )}
      </div>
      <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--navy)", letterSpacing: "-0.03em", marginBottom: "0.25rem" }}>{metric.value}</div>
      <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--gray-600)" }}>{metric.label}</div>
      <div style={{ fontSize: "0.75rem", color: "var(--gray-400)", marginTop: "0.125rem" }}>{metric.sub}</div>
    </div>
  );
}

function RankingWidget({ score }: { score: typeof DEMO_RANKING }) {
  const maxes = { completeness: 25, reviews: 25, credentials: 20, responseTime: 10, subscription: 8, recency: 7, photos: 5 };
  const labels: Record<string, string> = { completeness: "Profile", reviews: "Reviews", credentials: "Credentials", responseTime: "Response", subscription: "Subscription", recency: "Activity", photos: "Photos" };
  const colors: Record<string, string> = { completeness: "#162E5E", reviews: "#f59e0b", credentials: "#047857", responseTime: "#0891b2", subscription: "#6366f1", recency: "#d97706", photos: "#C7191A" };

  return (
    <div className="card" style={{ padding: "1.75rem" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.5rem", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <h3 style={{ fontWeight: 700, color: "var(--navy)", fontSize: "1.0625rem", marginBottom: "0.25rem" }}>Ranking Score</h3>
          <p style={{ fontSize: "0.8125rem", color: "var(--gray-400)" }}>Determines your position in search results</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "3rem", fontWeight: 900, color: "var(--navy)", letterSpacing: "-0.04em", lineHeight: 1 }}>{score.total}</div>
          <div style={{ fontSize: "0.875rem", fontWeight: 700, color: score.total >= 80 ? "#16a34a" : score.total >= 60 ? "#0891b2" : "#d97706" }}>{score.label}</div>
          <div style={{ fontSize: "0.8125rem", color: "var(--gray-400)" }}>Top {100 - score.percentile}% of contractors</div>
        </div>
      </div>

      {/* Score bar */}
      <div style={{ height: "8px", background: "var(--gray-100)", borderRadius: "999px", overflow: "hidden", marginBottom: "1.5rem" }}>
        <div style={{ height: "100%", background: `linear-gradient(90deg, var(--navy), var(--red))`, borderRadius: "999px", width: `${score.total}%`, transition: "width 0.6s ease" }} />
      </div>

      {/* Breakdown */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem", marginBottom: "1.25rem" }}>
        {Object.entries(score.breakdown).map(([key, val]) => {
          const max = maxes[key as keyof typeof maxes];
          return (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span style={{ width: "90px", fontSize: "0.8125rem", color: "var(--gray-500)", flexShrink: 0 }}>{labels[key]}</span>
              <div style={{ flex: 1, height: "6px", background: "var(--gray-100)", borderRadius: "999px", overflow: "hidden" }}>
                <div style={{ height: "100%", background: colors[key], borderRadius: "999px", width: `${(val / max) * 100}%` }} />
              </div>
              <span style={{ width: "44px", textAlign: "right", fontSize: "0.8125rem", fontWeight: 700, color: "var(--navy)", flexShrink: 0 }}>{typeof val === "number" ? val.toFixed(val % 1 === 0 ? 0 : 1) : val}/{max}</span>
            </div>
          );
        })}
      </div>

      {/* Top suggestion */}
      {score.topSuggestion && (
        <div style={{ background: "rgba(22,46,94,0.05)", border: "1px solid rgba(22,46,94,0.12)", borderRadius: "var(--radius)", padding: "0.875rem 1rem", display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
          <span style={{ fontSize: "1.125rem", flexShrink: 0 }}>💡</span>
          <div>
            <div style={{ fontWeight: 700, color: "var(--navy)", fontSize: "0.8125rem", marginBottom: "0.25rem" }}>Top improvement</div>
            <div style={{ fontSize: "0.8125rem", color: "var(--gray-600)", lineHeight: 1.55 }}>{score.topSuggestion}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function ChecklistWidget({ pct }: { pct: number }) {
  const items = [
    { done: true,  label: "Account created",                pts: 3 },
    { done: true,  label: "Business details added",          pts: 4 },
    { done: true,  label: "Description ≥ 80 characters",     pts: 4 },
    { done: true,  label: "Phone number set",                pts: 3 },
    { done: true,  label: "Service categories selected",     pts: 3 },
    { done: true,  label: "Service area defined",            pts: 3 },
    { done: true,  label: "Business hours set",              pts: 2 },
    { done: true,  label: "5+ portfolio photos",             pts: 3 },
    { done: false, label: "Upload contractor license",       pts: 5, cta: "documents" },
    { done: false, label: "Upload Certificate of Insurance", pts: 4, cta: "documents" },
    { done: false, label: "Add your website URL",            pts: 2, cta: "profile" },
    { done: false, label: "Connect social media",            pts: 1, cta: "profile" },
    { done: false, label: "Enable emergency service",        pts: 2, cta: "profile" },
  ];
  const done   = items.filter(i => i.done).length;
  const ptsEarned = items.filter(i => i.done).reduce((s, i) => s + i.pts, 0);
  const ptsTotal  = items.reduce((s, i) => s + i.pts, 0);

  return (
    <div className="card" style={{ padding: "1.75rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
        <h3 style={{ fontWeight: 700, color: "var(--navy)", fontSize: "1.0625rem" }}>Profile Checklist</h3>
        <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--navy)" }}>{done}/{items.length}</span>
      </div>
      <div style={{ height: "6px", background: "var(--gray-100)", borderRadius: "999px", overflow: "hidden", marginBottom: "1.25rem" }}>
        <div style={{ height: "100%", background: "linear-gradient(90deg, #16a34a, #22c55e)", borderRadius: "999px", width: `${pct}%` }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: item.done ? "#16a34a" : "var(--gray-100)", border: `1.5px solid ${item.done ? "#16a34a" : "var(--gray-300)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {item.done && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><path d="M5 13l4 4L19 7"/></svg>}
            </div>
            <span style={{ flex: 1, fontSize: "0.875rem", color: item.done ? "var(--gray-400)" : "var(--gray-700)", textDecoration: item.done ? "line-through" : "none" }}>
              {item.label}
            </span>
            <span style={{ fontSize: "0.75rem", color: item.done ? "#16a34a" : "var(--gray-400)", fontWeight: 600 }}>+{item.pts}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--gray-100)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "0.875rem", color: "var(--gray-500)" }}>Points earned</span>
        <span style={{ fontWeight: 800, color: "var(--navy)", fontSize: "1rem" }}>{ptsEarned}/{ptsTotal} pts</span>
      </div>
    </div>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────

export default function ContractorDashboard() {
  const [tab, setTab] = useState<Tab>("overview");
  const [docsUploading, setDocsUploading] = useState<Record<string, boolean>>({});
  const earnedBadges = MOCK_CONTRACTOR_BADGES[CONTRACTOR.id] ?? [];
  const score = DEMO_RANKING;

  const tabs: { key: Tab; label: string; icon: string; badge?: number }[] = [
    { key: "overview",   label: "Overview",    icon: "📊" },
    { key: "metrics",    label: "Metrics",     icon: "📈" },
    { key: "leads",      label: "Leads",       icon: "📩", badge: LEADS.filter(l => l.status === "new").length },
    { key: "documents",  label: "Documents",   icon: "📎", badge: DOCS.filter(d => d.status === "pending").length },
    { key: "billing",    label: "Billing",     icon: "💳" },
    { key: "profile",    label: "Edit Profile",icon: "✏️" },
  ];

  return (
    <div style={{ paddingTop: "76px", minHeight: "100vh", background: "var(--gray-50)" }}>
      {/* Dashboard header */}
      <div style={{ background: "linear-gradient(155deg, #0d1f40, var(--navy))", padding: "2rem 0" }}>
        <div className="container">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ width: "52px", height: "52px", background: "rgba(255,255,255,0.12)", border: "2px solid rgba(255,255,255,0.2)", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 900, fontSize: "1.375rem" }}>
                {CONTRACTOR.name.charAt(0)}
              </div>
              <div>
                <div style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.8125rem", marginBottom: "0.2rem" }}>Contractor Dashboard</div>
                <h1 style={{ color: "white", fontWeight: 800, fontSize: "1.375rem", marginBottom: "0.2rem" }}>{CONTRACTOR.company}</h1>
                <div style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.8125rem" }}>{CONTRACTOR.category} · {CONTRACTOR.location}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
              {/* Ranking score pill */}
              <div style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "var(--radius)", padding: "0.625rem 1rem", textAlign: "center" }}>
                <div style={{ fontSize: "1.375rem", fontWeight: 900, color: "white", lineHeight: 1 }}>{score.total}</div>
                <div style={{ fontSize: "0.6875rem", color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Score</div>
              </div>
              {/* Profile status */}
              <div style={{ background: CONTRACTOR.profileVisible ? "rgba(74,222,128,0.15)" : "rgba(199,25,26,0.2)", border: `1px solid ${CONTRACTOR.profileVisible ? "rgba(74,222,128,0.3)" : "rgba(199,25,26,0.4)"}`, borderRadius: "999px", padding: "0.5rem 1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: CONTRACTOR.profileVisible ? "#4ade80" : "var(--red)" }} />
                <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "white" }}>{CONTRACTOR.profileVisible ? "Profile Live" : "Hidden"}</span>
              </div>
              <Link href={`/contractors/${CONTRACTOR.id}`} className="btn-white" style={{ padding: "0.625rem 1.125rem", fontSize: "0.875rem" }}>
                View Profile
              </Link>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: "0.125rem", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
            {tabs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{
                padding: "0.75rem 1.125rem", background: "none", border: "none",
                color: tab === t.key ? "white" : "rgba(255,255,255,0.5)",
                fontWeight: tab === t.key ? 700 : 400, fontSize: "0.875rem",
                cursor: "pointer", fontFamily: "inherit",
                borderBottom: `3px solid ${tab === t.key ? "var(--red)" : "transparent"}`,
                marginBottom: "-1px", display: "flex", alignItems: "center", gap: "0.5rem",
                transition: "all 0.15s", whiteSpace: "nowrap",
              }}>
                <span>{t.icon}</span> {t.label}
                {t.badge !== undefined && t.badge > 0 && (
                  <span style={{ background: "var(--red)", color: "white", borderRadius: "999px", padding: "1px 7px", fontSize: "0.7rem", fontWeight: 800 }}>{t.badge}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: "2rem 1.5rem" }}>

        {/* ── OVERVIEW ── */}
        {tab === "overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            {/* Left column */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {/* Quick stats */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                {[METRICS.profileViews, METRICS.phoneClicks, METRICS.quoteClicks, METRICS.avgRating].map(m => (
                  <MetricCard key={m.label} metric={m} />
                ))}
              </div>
              {/* Badges */}
              {earnedBadges.length > 0 && (
                <div className="card" style={{ padding: "1.5rem" }}>
                  <h3 style={{ fontWeight: 700, color: "var(--navy)", fontSize: "1.0625rem", marginBottom: "1rem" }}>Your Credentials</h3>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {earnedBadges.map(id => <BadgeChip key={id} badgeId={id} size="sm" />)}
                  </div>
                  <button onClick={() => setTab("documents")} style={{ marginTop: "0.875rem", display: "block", fontSize: "0.8125rem", color: "var(--navy)", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>
                    Manage documents →
                  </button>
                </div>
              )}
              {/* Recent leads */}
              <div className="card" style={{ padding: "1.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                  <h3 style={{ fontWeight: 700, color: "var(--navy)", fontSize: "1.0625rem" }}>Recent Leads</h3>
                  <button onClick={() => setTab("leads")} style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--navy)", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
                    View all →
                  </button>
                </div>
                {LEADS.slice(0, 3).map(lead => {
                  const s = STATUS_COLORS[lead.status as keyof typeof STATUS_COLORS];
                  return (
                    <div key={lead.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 0", borderBottom: "1px solid var(--gray-100)", gap: "0.5rem" }}>
                      <div>
                        <div style={{ fontWeight: 600, color: "var(--navy)", fontSize: "0.9rem" }}>{lead.name} — {lead.service}</div>
                        <div style={{ fontSize: "0.8125rem", color: "var(--gray-400)" }}>{lead.location} · {lead.date}</div>
                      </div>
                      <span style={{ background: s.bg, color: s.color, padding: "0.2rem 0.625rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700, flexShrink: 0 }}>{s.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Right column */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <RankingWidget score={score} />
              <ChecklistWidget pct={CONTRACTOR.profileComplete} />
            </div>
          </div>
        )}

        {/* ── METRICS ── */}
        {tab === "metrics" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: "1rem" }}>
              {Object.values(METRICS).map(m => <MetricCard key={m.label} metric={m} />)}
            </div>

            {/* Views trend */}
            <div className="card" style={{ padding: "1.75rem" }}>
              <h3 style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "0.375rem", fontSize: "1.0625rem" }}>Profile View Trend</h3>
              <p style={{ color: "var(--gray-400)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>Monthly profile views over the last 6 months</p>
              <div style={{ display: "flex", alignItems: "flex-end", gap: "1rem", height: "120px" }}>
                {MONTHLY_VIEWS.map((m, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--gray-500)", fontWeight: 600 }}>{m.views}</span>
                    <div style={{
                      width: "100%",
                      height: `${(m.views / 250) * 90}px`,
                      background: i === MONTHLY_VIEWS.length - 1 ? "var(--navy)" : "var(--gray-200)",
                      borderRadius: "4px 4px 0 0",
                      transition: "height 0.4s ease",
                    }} />
                    <span style={{ fontSize: "0.75rem", color: "var(--gray-400)" }}>{m.month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Traffic sources */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
              <div className="card" style={{ padding: "1.75rem" }}>
                <h3 style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "1.25rem", fontSize: "1.0625rem" }}>Traffic Sources</h3>
                {[
                  { source: "Search results",     pct: 64, visits: 158 },
                  { source: "Direct profile link",pct: 22, visits: 55 },
                  { source: "Category page",      pct: 9,  visits: 22 },
                  { source: "Shared link",        pct: 5,  visits: 12 },
                ].map(row => (
                  <div key={row.source} style={{ marginBottom: "0.875rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", marginBottom: "0.375rem" }}>
                      <span style={{ color: "var(--gray-700)", fontWeight: 500 }}>{row.source}</span>
                      <span style={{ color: "var(--navy)", fontWeight: 700 }}>{row.pct}%</span>
                    </div>
                    <div style={{ height: "6px", background: "var(--gray-100)", borderRadius: "999px", overflow: "hidden" }}>
                      <div style={{ height: "100%", background: "var(--navy)", borderRadius: "999px", width: `${row.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="card" style={{ padding: "1.75rem" }}>
                <h3 style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "1.25rem", fontSize: "1.0625rem" }}>Visitor Cities</h3>
                {[
                  { city: "Austin, TX",      pct: 71, visits: 175 },
                  { city: "Round Rock, TX",  pct: 12, visits: 30 },
                  { city: "Cedar Park, TX",  pct: 9,  visits: 22 },
                  { city: "Pflugerville, TX",pct: 8,  visits: 20 },
                ].map(row => (
                  <div key={row.city} style={{ display: "flex", alignItems: "center", gap: "0.875rem", marginBottom: "0.875rem" }}>
                    <span style={{ width: "130px", fontSize: "0.875rem", color: "var(--gray-700)", flexShrink: 0 }}>{row.city}</span>
                    <div style={{ flex: 1, height: "6px", background: "var(--gray-100)", borderRadius: "999px", overflow: "hidden" }}>
                      <div style={{ height: "100%", background: "var(--red)", borderRadius: "999px", width: `${row.pct}%` }} />
                    </div>
                    <span style={{ fontSize: "0.75rem", color: "var(--gray-400)", width: "30px", textAlign: "right" }}>{row.visits}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly performance report */}
            <div className="card" style={{ padding: "1.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
                <h3 style={{ fontWeight: 700, color: "var(--navy)", fontSize: "1.0625rem" }}>Monthly Performance Report</h3>
                <button style={{ padding: "0.375rem 0.875rem", background: "var(--navy)", color: "white", border: "none", borderRadius: "var(--radius-sm)", fontSize: "0.8125rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                  Export PDF
                </button>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid var(--gray-150)" }}>
                      {["Month","Views","Leads","Rank Score","Subscription"].map(h => (
                        <th key={h} style={{ padding: "0.625rem 0.875rem", textAlign: "left", fontWeight: 700, color: "var(--gray-500)", fontSize: "0.8125rem" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(CONTRACTOR_EXTENDED["1"]?.monthlyStats ?? []).map((row, i, arr) => {
                      const prev = arr[i-1];
                      const viewDelta = prev ? ((row.profileViews - prev.profileViews) / prev.profileViews * 100).toFixed(0) : null;
                      return (
                        <tr key={i} style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--gray-50)" : "none", background: i === arr.length - 1 ? "rgba(22,46,94,0.03)" : "transparent" }}>
                          <td style={{ padding: "0.75rem 0.875rem", fontWeight: i === arr.length - 1 ? 700 : 400, color: "var(--navy)" }}>{row.month}</td>
                          <td style={{ padding: "0.75rem 0.875rem", color: "var(--navy)", fontWeight: 600 }}>
                            {row.profileViews}
                            {viewDelta && <span style={{ fontSize: "0.75rem", color: Number(viewDelta) > 0 ? "#16a34a" : "var(--red)", marginLeft: "0.375rem" }}>{Number(viewDelta) > 0 ? "↑" : "↓"}{Math.abs(Number(viewDelta))}%</span>}
                          </td>
                          <td style={{ padding: "0.75rem 0.875rem", color: "var(--navy)", fontWeight: 600 }}>{row.leads}</td>
                          <td style={{ padding: "0.75rem 0.875rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                              <div style={{ width: "60px", height: "6px", background: "var(--gray-100)", borderRadius: "999px", overflow: "hidden" }}>
                                <div style={{ height: "100%", background: "var(--navy)", width: `${row.rankScore}%`, borderRadius: "999px" }} />
                              </div>
                              <span style={{ fontWeight: 700, color: "var(--navy)", fontSize: "0.8125rem" }}>{row.rankScore}</span>
                            </div>
                          </td>
                          <td style={{ padding: "0.75rem 0.875rem", color: "#16a34a", fontWeight: 600 }}>${row.revenue.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Comparison to similar contractors */}
            <div className="card" style={{ padding: "1.75rem" }}>
              <h3 style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "0.375rem", fontSize: "1.0625rem" }}>How You Compare</h3>
              <p style={{ color: "var(--gray-400)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>vs. General Contractors in Austin, TX (average)</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1.25rem" }}>
                {[
                  { label: "Profile Views",  yours: 247, avg: 142, unit: "/mo" },
                  { label: "Rating",         yours: 4.9, avg: 4.3, unit: "★" },
                  { label: "Response Time",  yours: 0.4, avg: 3.2, unit: "hr" },
                  { label: "Review Count",   yours: 47,  avg: 18,  unit: "" },
                ].map(row => (
                  <div key={row.label} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "0.75rem", color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.75rem" }}>{row.label}</div>
                    <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-end", justifyContent: "center" }}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--navy)" }}>{row.yours}{row.unit}</div>
                        <div style={{ fontSize: "0.6875rem", color: "var(--navy)", fontWeight: 600, marginTop: "0.125rem" }}>You</div>
                      </div>
                      <div style={{ height: "2rem", width: "1px", background: "var(--gray-200)" }} />
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--gray-400)" }}>{row.avg}{row.unit}</div>
                        <div style={{ fontSize: "0.6875rem", color: "var(--gray-400)", marginTop: "0.125rem" }}>Avg</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── LEADS ── */}
        {tab === "leads" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--navy)" }}>All Leads</h2>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {["All","New","Responded","Closed"].map(f => (
                  <button key={f} style={{ padding: "0.375rem 0.875rem", borderRadius: "999px", border: "1.5px solid var(--gray-200)", background: "white", color: "var(--gray-600)", fontWeight: 500, fontSize: "0.875rem", cursor: "pointer", fontFamily: "inherit" }}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className="card" style={{ overflow: "hidden" }}>
              {LEADS.map((lead, i) => {
                const s = STATUS_COLORS[lead.status as keyof typeof STATUS_COLORS];
                return (
                  <div key={lead.id} style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: "1rem", padding: "1.25rem 1.5rem", borderBottom: i < LEADS.length - 1 ? "1px solid var(--gray-50)" : "none", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 700, color: "var(--navy)", fontSize: "0.9375rem", marginBottom: "0.25rem" }}>{lead.name}</div>
                      <div style={{ fontSize: "0.875rem", color: "var(--gray-500)" }}>{lead.service} · {lead.location} · {lead.budget}</div>
                      <div style={{ fontSize: "0.8125rem", color: "var(--gray-400)", marginTop: "0.25rem" }}>{lead.date}</div>
                    </div>
                    <span style={{ background: s.bg, color: s.color, padding: "0.25rem 0.75rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700, whiteSpace: "nowrap" }}>{s.label}</span>
                    <button style={{ padding: "0.5rem 1rem", background: lead.status === "new" ? "var(--navy)" : "var(--gray-100)", color: lead.status === "new" ? "white" : "var(--gray-600)", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 600, fontSize: "0.875rem", cursor: "pointer", fontFamily: "inherit" }}>
                      {lead.status === "new" ? "Respond" : "View"}
                    </button>
                    <button style={{ padding: "0.5rem 1rem", background: "var(--gray-100)", color: "var(--gray-500)", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 500, fontSize: "0.875rem", cursor: "pointer", fontFamily: "inherit" }}>
                      Archive
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── DOCUMENTS ── */}
        {tab === "documents" && (
          <div>
            <div style={{ marginBottom: "2rem" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--navy)", marginBottom: "0.375rem" }}>Verification Documents</h2>
              <p style={{ color: "var(--gray-500)", fontSize: "0.9rem", lineHeight: 1.65 }}>
                Submit documents to earn credential badges on your public profile. All documents are reviewed by our team before badges are awarded. You are notified by email on approval or rejection.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {DOCS.map((doc, i) => {
                const meta = DOCUMENT_TYPES[doc.type];
                const badge = meta.badge ? BADGES[meta.badge] : null;
                const statStyle = ({
                  approved:      { bg: "rgba(22,163,74,0.08)",  color: "#16a34a", label: "Approved" },
                  pending:       { bg: "rgba(99,102,241,0.08)", color: "#6366f1", label: "Under Review" },
                  rejected:      { bg: "rgba(199,25,26,0.08)",  color: "var(--red)", label: "Rejected" },
                  not_submitted: { bg: "var(--gray-100)",        color: "var(--gray-500)", label: "Not Submitted" },
                  expired:       { bg: "rgba(245,158,11,0.1)",  color: "#d97706", label: "Expired" },
                } as Record<string, { bg: string; color: string; label: string }>)[doc.status]
                  ?? { bg: "var(--gray-100)", color: "var(--gray-500)", label: "Unknown" };

                return (
                  <div key={i} className="card" style={{ padding: "1.5rem", display: "flex", alignItems: "flex-start", gap: "1.25rem" }}>
                    {/* Badge preview */}
                    <div style={{ width: "48px", height: "48px", background: badge ? badge.bgColor : "var(--gray-100)", border: `1.5px solid ${badge ? badge.color + "33" : "var(--gray-200)"}`, borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.375rem", flexShrink: 0 }}>
                      {badge ? badge.icon : "📄"}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.375rem", flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 700, color: "var(--navy)", fontSize: "0.9375rem" }}>{meta.label}</span>
                        <span style={{ background: statStyle.bg, color: statStyle.color, padding: "0.2rem 0.625rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700 }}>
                          {statStyle.label}
                        </span>
                        {badge && doc.status === "approved" && (
                          <BadgeChip badgeId={meta.badge!} size="sm" />
                        )}
                      </div>
                      {doc.status !== "not_submitted" && (
                        <div style={{ fontSize: "0.875rem", color: "var(--gray-600)", marginBottom: "0.25rem" }}>{doc.label}</div>
                      )}
                      <div style={{ fontSize: "0.8125rem", color: "var(--gray-400)" }}>
                        {doc.status === "not_submitted" && (
                          <span>Submitting this document earns the <strong style={{ color: badge?.color ?? "var(--navy)" }}>{badge?.label ?? ""}</strong> badge.</span>
                        )}
                        {doc.submittedAt && <span>Submitted {doc.submittedAt}</span>}
                        {doc.expiresAt && <span style={{ marginLeft: "0.75rem" }}>Expires {doc.expiresAt}</span>}
                        <span style={{ marginLeft: doc.submittedAt ? "0.75rem" : "0" }}>Accepted: {meta.acceptedFormats}</span>
                      </div>
                    </div>
                    <div style={{ flexShrink: 0 }}>
                      {doc.status === "not_submitted" ? (
                        <label style={{ display: "flex" }}>
                          <span className="btn-red" style={{ padding: "0.625rem 1.125rem", fontSize: "0.875rem", cursor: "pointer" }}>
                            {docsUploading[doc.type] ? "Uploading…" : "Upload"}
                          </span>
                          <input type="file" style={{ display: "none" }} accept=".pdf,.jpg,.jpeg,.png"
                            onChange={() => { setDocsUploading(p => ({ ...p, [doc.type]: true })); setTimeout(() => setDocsUploading(p => ({ ...p, [doc.type]: false })), 2000); }} />
                        </label>
                      ) : doc.status === "approved" ? (
                        <button style={{ padding: "0.625rem 1.125rem", background: "var(--gray-100)", border: "none", borderRadius: "var(--radius)", fontSize: "0.8125rem", fontWeight: 600, cursor: "pointer", color: "var(--gray-700)", fontFamily: "inherit" }}>
                          Replace
                        </button>
                      ) : (
                        <label style={{ display: "flex" }}>
                          <span className="btn-secondary" style={{ padding: "0.625rem 1.125rem", fontSize: "0.875rem", cursor: "pointer" }}>
                            Resubmit
                          </span>
                          <input type="file" style={{ display: "none" }} accept=".pdf,.jpg,.jpeg,.png" />
                        </label>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: "1.5rem", background: "var(--gray-50)", border: "1px solid var(--gray-150)", borderRadius: "var(--radius)", padding: "1.25rem 1.5rem" }}>
              <p style={{ fontSize: "0.875rem", color: "var(--gray-500)", lineHeight: 1.65 }}>
                Documents are stored securely and are only used for verification purposes. They are never publicly displayed. Verification typically takes 1–2 business days.
              </p>
            </div>
          </div>
        )}

        {/* ── BILLING ── */}
        {tab === "billing" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            <div className="card" style={{ padding: "1.75rem" }}>
              <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--navy)", marginBottom: "1.5rem" }}>Current Subscription</h2>
              <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "1.5rem" }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#22c55e" }} />
                <span style={{ fontWeight: 700, color: "var(--navy)", fontSize: "1.0625rem" }}>Active</span>
              </div>
              {[
                ["Plan",           "Professional"],
                ["Monthly Amount", `$${COMPANY.pricing.monthly.toFixed(2)}`],
                ["Next Billing",   "July 28, 2025"],
                ["Payment Method", "Visa ending 4242"],
                ["Member Since",   CONTRACTOR.memberSince],
              ].map(([label, val]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "0.625rem 0", borderBottom: "1px solid var(--gray-100)", fontSize: "0.9rem" }}>
                  <span style={{ color: "var(--gray-500)" }}>{label}</span>
                  <span style={{ fontWeight: 600, color: "var(--navy)" }}>{val}</span>
                </div>
              ))}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1.5rem" }}>
                <button className="btn-secondary" style={{ width: "100%" }}>Update Payment Method</button>
                <button style={{ width: "100%", padding: "0.75rem", background: "rgba(199,25,26,0.06)", color: "var(--red)", border: "1.5px solid rgba(199,25,26,0.2)", borderRadius: "var(--radius)", fontWeight: 600, fontSize: "0.875rem", cursor: "pointer", fontFamily: "inherit" }}>
                  Cancel Subscription
                </button>
              </div>
              <p style={{ fontSize: "0.8125rem", color: "var(--gray-400)", marginTop: "0.875rem", textAlign: "center" }}>
                Cancellation takes effect at end of billing period. Profile stays live until then.
              </p>
            </div>
            <div className="card" style={{ padding: "1.75rem" }}>
              <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--navy)", marginBottom: "1.5rem" }}>Payment History</h2>
              {INVOICES.map((inv, i) => (
                <div key={inv.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.875rem 0", borderBottom: i < INVOICES.length - 1 ? "1px solid var(--gray-100)" : "none" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--navy)" }}>{inv.date}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--gray-400)" }}>{inv.id}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
                    <span style={{ fontWeight: 700, color: "var(--navy)" }}>${inv.amount.toFixed(2)}</span>
                    <span style={{ background: "rgba(22,163,74,0.1)", color: "#16a34a", padding: "0.2rem 0.625rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700 }}>Paid</span>
                    <button style={{ padding: "0.3rem 0.625rem", background: "var(--gray-100)", border: "none", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", color: "var(--gray-600)", fontFamily: "inherit" }}>PDF</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PROFILE ── */}
        {tab === "profile" && (
          <div className="card" style={{ padding: "2rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--navy)" }}>Edit Your Profile</h2>
              <Link href={`/contractors/${CONTRACTOR.id}`} style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--navy)", textDecoration: "none" }}>
                Preview public profile →
              </Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
              {[
                ["Company Name",     CONTRACTOR.company],
                ["Your Name",        CONTRACTOR.name],
                ["Email",            CONTRACTOR.email],
                ["Phone",            CONTRACTOR.phone],
                ["Primary Category", CONTRACTOR.category],
                ["Location",         CONTRACTOR.location],
                ["Website",          CONTRACTOR.website || ""],
              ].map(([label, value]) => (
                <div key={label}>
                  <label style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--gray-700)", display: "block", marginBottom: "0.5rem" }}>{label}</label>
                  <input defaultValue={value} className="form-input" />
                </div>
              ))}
              <div>
                <label style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--gray-700)", display: "block", marginBottom: "0.5rem" }}>Years of Experience</label>
                <input type="number" defaultValue="18" className="form-input" min="0" max="60" />
              </div>
              <div style={{ gridColumn: "1/-1" }}>
                <label style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--gray-700)", display: "block", marginBottom: "0.5rem" }}>Business Description</label>
                <textarea className="form-input" rows={4} defaultValue={CONTRACTOR.description} style={{ resize: "vertical" }} />
              </div>
              <div style={{ gridColumn: "1/-1" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer" }}>
                  <input type="checkbox" style={{ width: "18px", height: "18px", accentColor: "var(--navy)" }} />
                  <div>
                    <div style={{ fontWeight: 600, color: "var(--navy)" }}>Offer Emergency / Same-Day Service</div>
                    <div style={{ fontSize: "0.875rem", color: "var(--gray-500)" }}>Appears in emergency service filter and receives +2 ranking points.</div>
                  </div>
                </label>
              </div>
            </div>
            <div style={{ display: "flex", gap: "1rem", marginTop: "1.75rem" }}>
              <button className="btn-red" style={{ padding: "0.875rem 2rem" }}>Save Changes</button>
              <button className="btn-secondary">Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
