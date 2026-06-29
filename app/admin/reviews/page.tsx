"use client";
import { useState } from "react";

interface Review {
  id: string; contractor: string; contractorId: string; reviewer: string;
  rating: number; project: string; text: string; date: string;
  status: "published" | "flagged" | "removed"; flagReason?: string;
}

const MOCK_REVIEWS: Review[] = [
  { id: "r1", contractorId: "1", contractor: "ProBuild Solutions",    reviewer: "Michael T.", rating: 5, project: "Kitchen Remodel",    date: "Jun 25, 2025", status: "published", text: "Outstanding work from start to finish. Professional crew, clean site, and the project came in under budget." },
  { id: "r2", contractorId: "2", contractor: "Elite Roofing",         reviewer: "Sarah K.",   rating: 5, project: "Roof Replacement",   date: "Jun 23, 2025", status: "published", text: "Elite Roofing did an exceptional job replacing our entire roof. Fast, clean, and professional." },
  { id: "r3", contractorId: "1", contractor: "ProBuild Solutions",    reviewer: "Mike T.",    rating: 1, project: "Bathroom Remodel",   date: "Jun 27, 2025", status: "flagged",   flagReason: "Low rating — verify authenticity", text: "Contractor never showed up on agreed start date. No communication for three days." },
  { id: "r4", contractorId: "3", contractor: "PowerUp Electrical",    reviewer: "Carlos R.",  rating: 2, project: "Panel Upgrade",      date: "Jun 25, 2025", status: "flagged",   flagReason: "Contractor dispute", text: "Work was ok but took twice as long as quoted. Overcharged for materials." },
  { id: "r5", contractorId: "6", contractor: "HVAC Masters LLC",      reviewer: "Jennifer W.",rating: 1, project: "AC Installation",    date: "Jun 20, 2025", status: "flagged",   flagReason: "Low rating", text: "AC stopped working two weeks after installation. Can't get a callback." },
  { id: "r6", contractorId: "4", contractor: "GreenScape Landscaping",reviewer: "David L.",   rating: 4, project: "Backyard Redesign", date: "Jun 18, 2025", status: "published", text: "Great work on our backyard. Communication was excellent and the finished result looks amazing." },
  { id: "r7", contractorId: "5", contractor: "BathPro Renovations",   reviewer: "Ana M.",     rating: 5, project: "Master Bath",       date: "Jun 15, 2025", status: "removed",   flagReason: "Duplicate review", text: "Absolutely love our new bathroom! BathPro transformed a dated space into something beautiful." },
];

function Stars({ rating }: { rating: number }) {
  return (
    <div style={{ display: "flex", gap: "1px" }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= rating ? "#f59e0b" : "var(--gray-200)", fontSize: "0.875rem" }}>★</span>
      ))}
    </div>
  );
}

const STATUS_STYLE = {
  published: { bg: "rgba(22,163,74,0.1)",  color: "#16a34a", label: "Published" },
  flagged:   { bg: "rgba(245,158,11,0.1)", color: "#d97706", label: "Flagged" },
  removed:   { bg: "var(--gray-100)",       color: "var(--gray-500)", label: "Removed" },
};

export default function ReviewsAdminPage() {
  const [reviews, setReviews] = useState(MOCK_REVIEWS);
  const [filter, setFilter] = useState<"all"|"published"|"flagged"|"removed">("flagged");

  const update = (id: string, status: Review["status"]) =>
    setReviews(prev => prev.map(r => r.id === id ? { ...r, status } : r));

  const filtered = filter === "all" ? reviews : reviews.filter(r => r.status === filter);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.625rem", fontWeight: 800, color: "var(--navy)", marginBottom: "0.25rem" }}>Reviews</h1>
          <p style={{ color: "var(--gray-500)", fontSize: "0.875rem" }}>
            {reviews.filter(r => r.status === "flagged").length} flagged · {reviews.filter(r => r.status === "published").length} published · {reviews.filter(r => r.status === "removed").length} removed
          </p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {(["all","flagged","published","removed"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "0.375rem 0.875rem", borderRadius: "999px",
            background: filter === f ? "var(--navy)" : "white",
            color: filter === f ? "white" : "var(--gray-600)",
            border: `1.5px solid ${filter === f ? "var(--navy)" : "var(--gray-200)"}`,
            fontWeight: 600, fontSize: "0.8125rem", cursor: "pointer", fontFamily: "inherit",
          }}>
            {f.charAt(0).toUpperCase() + f.slice(1)} ({reviews.filter(r => f === "all" || r.status === f).length})
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {filtered.map(r => {
          const st = STATUS_STYLE[r.status];
          return (
            <div key={r.id} className="card" style={{ padding: "1.5rem", borderLeft: `4px solid ${r.status === "flagged" ? "#d97706" : r.status === "removed" ? "var(--gray-200)" : "rgba(22,163,74,0.3)"}` }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 700, color: "var(--navy)" }}>{r.reviewer}</span>
                    <Stars rating={r.rating} />
                    <span style={{ background: st.bg, color: st.color, padding: "0.2rem 0.625rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700 }}>{st.label}</span>
                  </div>
                  <div style={{ fontSize: "0.875rem", color: "var(--gray-500)", marginBottom: "0.75rem" }}>
                    {r.project} · <strong style={{ color: "var(--navy)" }}>{r.contractor}</strong> · {r.date}
                  </div>
                  <p style={{ color: "var(--gray-700)", lineHeight: 1.65, fontSize: "0.9375rem", marginBottom: "0.75rem" }}>{r.text}</p>
                  {r.flagReason && (
                    <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "var(--radius-sm)", padding: "0.5rem 0.875rem", fontSize: "0.8125rem", color: "#92400e" }}>
                      <strong>Flag reason:</strong> {r.flagReason}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0, flexWrap: "wrap" }}>
                  {r.status !== "published" && (
                    <button onClick={() => update(r.id, "published")}
                      style={{ padding: "0.5rem 1rem", background: "rgba(22,163,74,0.1)", color: "#16a34a", border: "1px solid rgba(22,163,74,0.2)", borderRadius: "var(--radius-sm)", fontWeight: 700, fontSize: "0.8125rem", cursor: "pointer", fontFamily: "inherit" }}>
                      ✓ Publish
                    </button>
                  )}
                  {r.status === "published" && (
                    <button onClick={() => update(r.id, "flagged")}
                      style={{ padding: "0.5rem 1rem", background: "rgba(245,158,11,0.1)", color: "#d97706", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "var(--radius-sm)", fontWeight: 700, fontSize: "0.8125rem", cursor: "pointer", fontFamily: "inherit" }}>
                      🚩 Flag
                    </button>
                  )}
                  {r.status !== "removed" && (
                    <button onClick={() => update(r.id, "removed")}
                      style={{ padding: "0.5rem 1rem", background: "rgba(200,16,46,0.06)", color: "var(--red)", border: "1px solid rgba(200,16,46,0.15)", borderRadius: "var(--radius-sm)", fontWeight: 700, fontSize: "0.8125rem", cursor: "pointer", fontFamily: "inherit" }}>
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="card" style={{ padding: "3rem", textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>✅</div>
            <div style={{ fontWeight: 600, color: "var(--gray-600)" }}>No {filter !== "all" ? filter : ""} reviews</div>
          </div>
        )}
      </div>
    </div>
  );
}
