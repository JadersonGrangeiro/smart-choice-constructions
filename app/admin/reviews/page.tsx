"use client";
import { useState, useEffect, useCallback } from "react";

interface Review {
  id: string;
  reviewer_name: string;
  rating: number;
  title: string | null;
  body: string;
  project_type: string | null;
  is_flagged: boolean;
  flag_reason: string | null;
  is_published: boolean;
  admin_note: string | null;
  created_at: string;
  contractors: { id: string; company_name: string } | null;
}

type Filter = "flagged" | "published" | "removed" | "all";

function Stars({ rating }: { rating: number }) {
  return (
    <div style={{ display: "flex", gap: "1px" }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= rating ? "#f59e0b" : "var(--gray-200)", fontSize: "0.875rem" }}>★</span>
      ))}
    </div>
  );
}

function statusStyle(r: Review) {
  if (r.is_flagged)   return { bg: "rgba(245,158,11,0.1)", color: "#d97706",        label: "Flagged" };
  if (!r.is_published) return { bg: "var(--gray-100)",       color: "var(--gray-500)", label: "Removed" };
  return                      { bg: "rgba(22,163,74,0.1)",  color: "#16a34a",        label: "Published" };
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function ReviewsAdminPage() {
  const [filter,  setFilter]  = useState<Filter>("flagged");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [toast,   setToast]   = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/admin/reviews?filter=${filter}&limit=100`);
      const json = await res.json();
      setReviews(json.reviews ?? []);
      setTotal(json.total ?? 0);
    } catch {
      showToast("Failed to load reviews", "err");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const patchReview = async (id: string, action: "publish" | "flag" | "remove", flagReason?: string) => {
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, flag_reason: flagReason }),
      });
      if (!res.ok) throw new Error();
      showToast(`Review ${action}ed`);
      load();
    } catch {
      showToast("Action failed", "err");
    }
  };

  const counts = {
    flagged:   reviews.filter(r => r.is_flagged).length,
    published: reviews.filter(r => r.is_published && !r.is_flagged).length,
    removed:   reviews.filter(r => !r.is_published).length,
  };

  return (
    <div>
      {toast && (
        <div style={{ position: "fixed", top: "1.5rem", right: "1.5rem", zIndex: 999, background: toast.type === "ok" ? "#16a34a" : "var(--red)", color: "white", padding: "0.875rem 1.5rem", borderRadius: "var(--radius)", fontWeight: 600, fontSize: "0.9rem", boxShadow: "var(--shadow-lg)" }}>
          {toast.msg}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.625rem", fontWeight: 800, color: "var(--navy)", marginBottom: "0.25rem" }}>Reviews</h1>
          <p style={{ color: "var(--gray-500)", fontSize: "0.875rem" }}>
            {loading ? "Loading…" : `${total} reviews · ${counts.flagged} flagged · ${counts.published} published · ${counts.removed} removed`}
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {(["flagged","all","published","removed"] as Filter[]).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "0.375rem 0.875rem", borderRadius: "999px",
            background: filter === f ? "var(--navy)" : "white",
            color: filter === f ? "white" : "var(--gray-600)",
            border: `1.5px solid ${filter === f ? "var(--navy)" : "var(--gray-200)"}`,
            fontWeight: 600, fontSize: "0.8125rem", cursor: "pointer", fontFamily: "inherit",
          }}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card" style={{ padding: "3rem", textAlign: "center", color: "var(--gray-400)" }}>Loading reviews…</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {reviews.map(r => {
            const st = statusStyle(r);
            const borderColor = r.is_flagged ? "#d97706" : !r.is_published ? "var(--gray-200)" : "rgba(22,163,74,0.3)";
            return (
              <div key={r.id} className="card" style={{ padding: "1.5rem", borderLeft: `4px solid ${borderColor}` }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 700, color: "var(--navy)" }}>{r.reviewer_name}</span>
                      <Stars rating={r.rating} />
                      <span style={{ background: st.bg, color: st.color, padding: "0.2rem 0.625rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700 }}>{st.label}</span>
                    </div>
                    <div style={{ fontSize: "0.875rem", color: "var(--gray-500)", marginBottom: "0.75rem" }}>
                      {r.project_type && <>{r.project_type} · </>}
                      {r.contractors && <strong style={{ color: "var(--navy)" }}>{r.contractors.company_name}</strong>}
                      {" · "}{fmt(r.created_at)}
                    </div>
                    {r.title && <div style={{ fontWeight: 600, color: "var(--navy)", marginBottom: "0.375rem" }}>{r.title}</div>}
                    <p style={{ color: "var(--gray-700)", lineHeight: 1.65, fontSize: "0.9375rem", marginBottom: r.flag_reason ? "0.75rem" : 0 }}>{r.body}</p>
                    {r.flag_reason && (
                      <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "var(--radius-sm)", padding: "0.5rem 0.875rem", fontSize: "0.8125rem", color: "#92400e", marginTop: "0.75rem" }}>
                        <strong>Flag reason:</strong> {r.flag_reason}
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0, flexWrap: "wrap" }}>
                    {(r.is_flagged || !r.is_published) && (
                      <button onClick={() => patchReview(r.id, "publish")}
                        style={{ padding: "0.5rem 1rem", background: "rgba(22,163,74,0.1)", color: "#16a34a", border: "1px solid rgba(22,163,74,0.2)", borderRadius: "var(--radius-sm)", fontWeight: 700, fontSize: "0.8125rem", cursor: "pointer", fontFamily: "inherit" }}>
                        ✓ Publish
                      </button>
                    )}
                    {r.is_published && !r.is_flagged && (
                      <button onClick={() => patchReview(r.id, "flag", "Admin review")}
                        style={{ padding: "0.5rem 1rem", background: "rgba(245,158,11,0.1)", color: "#d97706", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "var(--radius-sm)", fontWeight: 700, fontSize: "0.8125rem", cursor: "pointer", fontFamily: "inherit" }}>
                        🚩 Flag
                      </button>
                    )}
                    {r.is_published && (
                      <button onClick={() => patchReview(r.id, "remove")}
                        style={{ padding: "0.5rem 1rem", background: "rgba(200,16,46,0.06)", color: "var(--red)", border: "1px solid rgba(200,16,46,0.15)", borderRadius: "var(--radius-sm)", fontWeight: 700, fontSize: "0.8125rem", cursor: "pointer", fontFamily: "inherit" }}>
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {reviews.length === 0 && (
            <div className="card" style={{ padding: "3rem", textAlign: "center" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>✅</div>
              <div style={{ fontWeight: 600, color: "var(--gray-600)" }}>No {filter !== "all" ? filter : ""} reviews</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
