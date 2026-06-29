"use client";
import { useState } from "react";
import Link from "next/link";
import { MOCK_CONTRACTORS, CATEGORIES } from "@/lib/data";

type Tab = "overview" | "favorites" | "history" | "reviews" | "settings";

const MOCK_ACCOUNT = {
  name:    "Jennifer Morrison",
  email:   "jennifer.m@email.com",
  zip:     "78701",
  city:    "Austin, TX",
  joined:  "June 2025",
  phone:   "+1 (512) 555-0190",
};

const FAVORITES = MOCK_CONTRACTORS.slice(0, 3);

const HISTORY = [
  { id: "h1", contractor: "ProBuild Solutions",  service: "Kitchen Remodel",    date: "Jun 25, 2025", status: "quote_requested", contractorId: "1" },
  { id: "h2", contractor: "Elite Roofing",        service: "Roof Inspection",    date: "Jun 20, 2025", status: "contacted",       contractorId: "2" },
  { id: "h3", contractor: "PowerUp Electrical",   service: "Panel Upgrade",      date: "Jun 15, 2025", status: "reviewed",        contractorId: "3" },
  { id: "h4", contractor: "BathPro Renovations",  service: "Master Bath",        date: "Jun 10, 2025", status: "completed",       contractorId: "5" },
];

const MY_REVIEWS = [
  { contractorId: "3", contractor: "PowerUp Electrical", rating: 5, date: "Jun 17, 2025", project: "Panel Upgrade",  text: "David's team was incredibly professional. Showed up on time, finished ahead of schedule, and the workmanship is excellent." },
  { contractorId: "5", contractor: "BathPro Renovations",rating: 5, date: "Jun 12, 2025", project: "Master Bath",    text: "Jennifer and her crew transformed our dated bathroom into something we're genuinely proud of. Highly recommend." },
];

const STATUS_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  quote_requested: { label: "Quote Requested", color: "#6366f1", bg: "rgba(99,102,241,0.08)" },
  contacted:       { label: "Contacted",       color: "#0891b2", bg: "rgba(8,145,178,0.08)" },
  reviewed:        { label: "Reviewed",        color: "#16a34a", bg: "rgba(22,163,74,0.08)" },
  completed:       { label: "Completed",       color: "var(--gray-500)", bg: "var(--gray-100)" },
};

function Stars({ rating }: { rating: number }) {
  return (
    <div style={{ display: "flex", gap: "1px" }}>
      {[1,2,3,4,5].map(i => <span key={i} style={{ color: i <= rating ? "#f59e0b" : "var(--gray-200)", fontSize: "1rem" }}>★</span>)}
    </div>
  );
}

export default function AccountPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [favorites, setFavorites] = useState(FAVORITES.map(c => c.id));

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "overview",  label: "Overview",  icon: "🏠" },
    { key: "favorites", label: "Saved",     icon: "❤️" },
    { key: "history",   label: "History",   icon: "📋" },
    { key: "reviews",   label: "Reviews",   icon: "⭐" },
    { key: "settings",  label: "Settings",  icon: "⚙️" },
  ];

  return (
    <div style={{ paddingTop: "76px", minHeight: "100vh", background: "var(--gray-50)" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(155deg, #0d1f40, var(--navy))", padding: "2.5rem 0" }}>
        <div className="container">
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", marginBottom: "1.75rem" }}>
            <div style={{ width: "56px", height: "56px", background: "rgba(255,255,255,0.12)", border: "2px solid rgba(255,255,255,0.2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 900, fontSize: "1.5rem" }}>
              {MOCK_ACCOUNT.name.charAt(0)}
            </div>
            <div>
              <h1 style={{ color: "white", fontWeight: 800, fontSize: "1.375rem" }}>{MOCK_ACCOUNT.name}</h1>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.875rem" }}>{MOCK_ACCOUNT.city} · Member since {MOCK_ACCOUNT.joined}</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.125rem", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
            {tabs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{
                padding: "0.75rem 1.125rem", background: "none", border: "none",
                color: tab === t.key ? "white" : "rgba(255,255,255,0.5)",
                fontWeight: tab === t.key ? 700 : 400, fontSize: "0.875rem",
                cursor: "pointer", fontFamily: "inherit",
                borderBottom: `3px solid ${tab === t.key ? "var(--red)" : "transparent"}`,
                marginBottom: "-1px", display: "flex", alignItems: "center", gap: "0.5rem",
                transition: "all 0.15s",
              }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: "2rem 1.5rem" }}>

        {/* ── OVERVIEW ── */}
        {tab === "overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5rem" }}>
            {[
              { icon: "❤️", label: "Saved Contractors", value: favorites.length, tab: "favorites" as Tab },
              { icon: "📋", label: "Quote Requests",    value: HISTORY.length,   tab: "history" as Tab },
              { icon: "⭐", label: "Reviews Written",   value: MY_REVIEWS.length,tab: "reviews" as Tab },
            ].map(card => (
              <button key={card.label} onClick={() => setTab(card.tab)} className="card" style={{ padding: "1.5rem", textAlign: "left", cursor: "pointer", border: "none", fontFamily: "inherit", transition: "box-shadow 0.2s", background: "white" }}>
                <div style={{ fontSize: "1.75rem", marginBottom: "0.75rem" }}>{card.icon}</div>
                <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--navy)", letterSpacing: "-0.03em" }}>{card.value}</div>
                <div style={{ fontSize: "0.9375rem", color: "var(--gray-500)", fontWeight: 500 }}>{card.label}</div>
              </button>
            ))}

            {/* Recent activity */}
            <div className="card" style={{ padding: "1.75rem", gridColumn: "1/-1" }}>
              <h2 style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "1.25rem", fontSize: "1.0625rem" }}>Recent Activity</h2>
              {HISTORY.slice(0, 3).map(item => {
                const st = STATUS_STYLE[item.status];
                return (
                  <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.875rem 0", borderBottom: "1px solid var(--gray-100)" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: "var(--navy)", fontSize: "0.9375rem" }}>{item.contractor}</div>
                      <div style={{ fontSize: "0.8125rem", color: "var(--gray-400)" }}>{item.service} · {item.date}</div>
                    </div>
                    <span style={{ background: st.bg, color: st.color, padding: "0.25rem 0.75rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700, whiteSpace: "nowrap" }}>{st.label}</span>
                    <Link href={`/contractors/${item.contractorId}`} style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--navy)", textDecoration: "none" }}>View →</Link>
                  </div>
                );
              })}
            </div>

            {/* Find more */}
            <div style={{ background: "var(--navy)", borderRadius: "var(--radius-xl)", padding: "2rem", gridColumn: "1/-1", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <h3 style={{ fontWeight: 700, color: "white", fontSize: "1.125rem", marginBottom: "0.375rem" }}>Looking for a contractor?</h3>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9rem" }}>Browse 60+ service categories and get free quotes.</p>
              </div>
              <Link href="/find-contractors" className="btn-white" style={{ padding: "0.875rem 1.75rem", flexShrink: 0 }}>Find Contractors</Link>
            </div>
          </div>
        )}

        {/* ── FAVORITES ── */}
        {tab === "favorites" && (
          <div>
            <h2 style={{ fontWeight: 700, color: "var(--navy)", fontSize: "1.25rem", marginBottom: "1.5rem" }}>
              Saved Contractors <span style={{ color: "var(--red)" }}>({MOCK_CONTRACTORS.filter(c => favorites.includes(c.id)).length})</span>
            </h2>
            {MOCK_CONTRACTORS.filter(c => favorites.includes(c.id)).length === 0 ? (
              <div className="card" style={{ padding: "3rem", textAlign: "center" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>❤️</div>
                <h3 style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "0.75rem" }}>No saved contractors yet</h3>
                <p style={{ color: "var(--gray-500)", marginBottom: "1.5rem" }}>Click the heart icon on any contractor profile to save them here.</p>
                <Link href="/find-contractors" className="btn-red">Browse Contractors</Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {MOCK_CONTRACTORS.filter(c => favorites.includes(c.id)).map(c => (
                  <div key={c.id} className="card" style={{ padding: "1.5rem", display: "flex", alignItems: "center", gap: "1.25rem" }}>
                    <div style={{ width: "52px", height: "52px", background: "var(--navy)", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 900, fontSize: "1.25rem", flexShrink: 0 }}>
                      {c.name.charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: "var(--navy)", fontSize: "1rem", marginBottom: "0.25rem" }}>{c.company}</div>
                      <div style={{ fontSize: "0.875rem", color: "var(--gray-500)" }}>{c.category} · {c.location}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.375rem" }}>
                        {[1,2,3,4,5].map(i => <span key={i} style={{ color: i <= Math.round(c.rating) ? "#f59e0b" : "var(--gray-200)", fontSize: "0.875rem" }}>★</span>)}
                        <span style={{ fontSize: "0.8125rem", color: "var(--gray-400)" }}>({c.reviews})</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "0.625rem", flexShrink: 0 }}>
                      <Link href={`/request-quote?contractor=${c.id}`} className="btn-red" style={{ padding: "0.625rem 1.25rem", fontSize: "0.875rem" }}>
                        Get Quote
                      </Link>
                      <Link href={`/contractors/${c.id}`} className="btn-secondary" style={{ padding: "0.625rem 1.25rem", fontSize: "0.875rem" }}>
                        View
                      </Link>
                      <button onClick={() => setFavorites(prev => prev.filter(id => id !== c.id))}
                        style={{ padding: "0.625rem", background: "rgba(199,25,26,0.08)", color: "var(--red)", border: "1px solid rgba(199,25,26,0.15)", borderRadius: "var(--radius-sm)", cursor: "pointer", fontSize: "1rem" }}
                        aria-label="Remove from favorites">
                        ❤️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── HISTORY ── */}
        {tab === "history" && (
          <div>
            <h2 style={{ fontWeight: 700, color: "var(--navy)", fontSize: "1.25rem", marginBottom: "1.5rem" }}>Contact History</h2>
            <div className="card" style={{ overflow: "hidden" }}>
              {HISTORY.map((item, i) => {
                const st = STATUS_STYLE[item.status];
                return (
                  <div key={item.id} style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: "1rem", padding: "1.25rem 1.5rem", borderBottom: i < HISTORY.length - 1 ? "1px solid var(--gray-50)" : "none", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 700, color: "var(--navy)", fontSize: "0.9375rem", marginBottom: "0.25rem" }}>{item.contractor}</div>
                      <div style={{ fontSize: "0.875rem", color: "var(--gray-500)" }}>{item.service}</div>
                      <div style={{ fontSize: "0.8125rem", color: "var(--gray-400)", marginTop: "0.25rem" }}>{item.date}</div>
                    </div>
                    <span style={{ background: st.bg, color: st.color, padding: "0.25rem 0.75rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700, whiteSpace: "nowrap" }}>
                      {st.label}
                    </span>
                    <Link href={`/contractors/${item.contractorId}`} className="btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.8125rem" }}>
                      View Profile
                    </Link>
                    {item.status !== "reviewed" && item.status !== "quote_requested" && (
                      <Link href={`/contractors/${item.contractorId}#reviews`} className="btn-red" style={{ padding: "0.5rem 1rem", fontSize: "0.8125rem" }}>
                        Leave Review
                      </Link>
                    )}
                    {(item.status === "reviewed" || item.status === "quote_requested") && (
                      <div style={{ width: "100px" }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── REVIEWS ── */}
        {tab === "reviews" && (
          <div>
            <h2 style={{ fontWeight: 700, color: "var(--navy)", fontSize: "1.25rem", marginBottom: "1.5rem" }}>
              Reviews You've Written <span style={{ color: "var(--red)" }}>({MY_REVIEWS.length})</span>
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {MY_REVIEWS.map((r, i) => (
                <div key={i} className="card" style={{ padding: "1.75rem" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", marginBottom: "0.875rem", flexWrap: "wrap" }}>
                    <div>
                      <div style={{ fontWeight: 700, color: "var(--navy)", fontSize: "1rem" }}>{r.contractor}</div>
                      <div style={{ fontSize: "0.875rem", color: "var(--gray-400)" }}>{r.project} · {r.date}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <Stars rating={r.rating} />
                      <Link href={`/contractors/${r.contractorId}`} style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--navy)", textDecoration: "none" }}>View profile →</Link>
                    </div>
                  </div>
                  <p style={{ color: "var(--gray-600)", lineHeight: 1.75, fontSize: "0.9375rem" }}>{r.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SETTINGS ── */}
        {tab === "settings" && (
          <div className="card" style={{ padding: "2rem", maxWidth: "640px" }}>
            <h2 style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "2rem", fontSize: "1.25rem" }}>Account Settings</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {[
                ["Full Name",   MOCK_ACCOUNT.name,   "text"],
                ["Email",       MOCK_ACCOUNT.email,  "email"],
                ["Phone",       MOCK_ACCOUNT.phone,  "tel"],
                ["ZIP Code",    MOCK_ACCOUNT.zip,    "text"],
              ].map(([label, value, type]) => (
                <div key={label}>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--gray-700)", marginBottom: "0.5rem" }}>{label}</label>
                  <input type={type} defaultValue={value} className="form-input" />
                </div>
              ))}
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--gray-700)", marginBottom: "0.5rem" }}>Email Notifications</label>
                {[
                  "Contractor responds to my quote request",
                  "New contractors available in my area",
                  "Platform updates and announcements",
                ].map(label => (
                  <label key={label} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.5rem 0", cursor: "pointer" }}>
                    <input type="checkbox" defaultChecked style={{ accentColor: "var(--navy)", width: "16px", height: "16px" }} />
                    <span style={{ fontSize: "0.9375rem", color: "var(--gray-700)" }}>{label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: "1rem", marginTop: "1.75rem", paddingTop: "1.5rem", borderTop: "1px solid var(--gray-100)" }}>
              <button className="btn-red" style={{ padding: "0.875rem 2rem" }}>Save Changes</button>
              <button style={{ padding: "0.875rem 1.5rem", background: "rgba(199,25,26,0.06)", color: "var(--red)", border: "1.5px solid rgba(199,25,26,0.2)", borderRadius: "var(--radius)", fontWeight: 600, fontSize: "0.875rem", cursor: "pointer", fontFamily: "inherit" }}>
                Delete Account
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
