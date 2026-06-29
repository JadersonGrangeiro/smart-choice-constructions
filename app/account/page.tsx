"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Tab = "overview" | "favorites" | "history" | "reviews" | "settings";

interface Profile {
  full_name: string;
  email: string;
  phone?: string;
  city?: string;
  state_code?: string;
  created_at: string;
}

interface Favorite {
  id: string;
  contractors: {
    id: string;
    company_name: string;
    owner_first_name: string;
    owner_last_name: string;
    category: string;
    city: string;
    state_code: string;
    ranking_score: number;
  };
}

interface QuoteRequest {
  id: string;
  service_type: string;
  status: string;
  created_at: string;
  city?: string;
  state_code?: string;
  contractors: { id: string; company_name: string } | null;
}

interface Review {
  id: string;
  rating: number;
  body: string;
  project_type?: string;
  created_at: string;
  contractors: { id: string; company_name: string } | null;
}

const STATUS_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: "Pending",          color: "#6366f1", bg: "rgba(99,102,241,0.08)" },
  viewed:    { label: "Viewed",           color: "#0891b2", bg: "rgba(8,145,178,0.08)" },
  responded: { label: "Responded",        color: "#d97706", bg: "rgba(245,158,11,0.08)" },
  completed: { label: "Completed",        color: "#16a34a", bg: "rgba(22,163,74,0.08)" },
  declined:  { label: "Declined",         color: "var(--gray-500)", bg: "var(--gray-100)" },
};

function Stars({ rating }: { rating: number }) {
  return (
    <div style={{ display: "flex", gap: "1px" }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= rating ? "#f59e0b" : "var(--gray-200)", fontSize: "1rem" }}>★</span>
      ))}
    </div>
  );
}

export default function AccountPage() {
  const [tab, setTab]           = useState<Tab>("overview");
  const [profile, setProfile]   = useState<Profile | null>(null);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [quotes, setQuotes]     = useState<QuoteRequest[]>([]);
  const [reviews, setReviews]   = useState<Review[]>([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saveMsg, setSaveMsg]   = useState("");
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const [profileRes, favRes, quoteRes, reviewRes] = await Promise.all([
        supabase.from("profiles").select("full_name,email,phone,city,state_code,created_at").eq("id", user.id).single(),
        supabase.from("favorites").select("id,contractors(id,company_name,owner_first_name,owner_last_name,category,city,state_code,ranking_score)").eq("homeowner_id", user.id),
        supabase.from("quote_requests").select("id,service_type,status,created_at,city,state_code,contractors(id,company_name)").eq("homeowner_id", user.id).order("created_at", { ascending: false }),
        supabase.from("reviews").select("id,rating,body,project_type,created_at,contractors(id,company_name)").eq("homeowner_id", user.id).order("created_at", { ascending: false }),
      ]);

      if (profileRes.data) {
        setProfile(profileRes.data);
        setEditName(profileRes.data.full_name ?? "");
        setEditPhone(profileRes.data.phone ?? "");
      }
      setFavorites((favRes.data as unknown as Favorite[]) ?? []);
      setQuotes((quoteRes.data as unknown as QuoteRequest[]) ?? []);
      setReviews((reviewRes.data as unknown as Review[]) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  async function handleRemoveFavorite(favId: string, contractorId: string) {
    setFavorites(prev => prev.filter(f => f.id !== favId));
    await supabase.from("favorites").delete().eq("id", favId);
  }

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveMsg("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("profiles").update({ full_name: editName, phone: editPhone }).eq("id", user.id);
    setProfile(prev => prev ? { ...prev, full_name: editName, phone: editPhone } : prev);
    setSaveMsg("Changes saved!");
    setSaving(false);
    setTimeout(() => setSaveMsg(""), 3000);
  }

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "overview",  label: "Overview",  icon: "🏠" },
    { key: "favorites", label: "Saved",     icon: "❤️" },
    { key: "history",   label: "History",   icon: "📋" },
    { key: "reviews",   label: "Reviews",   icon: "⭐" },
    { key: "settings",  label: "Settings",  icon: "⚙️" },
  ];

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "";
  const location = [profile?.city, profile?.state_code].filter(Boolean).join(", ");

  if (loading) {
    return (
      <div style={{ paddingTop: "76px", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", color: "var(--gray-400)" }}>
          <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⏳</div>
          Loading your account...
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ paddingTop: "76px", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ marginBottom: "1rem", color: "var(--gray-500)" }}>Please sign in to view your account.</p>
          <Link href="/login" className="btn-red">Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: "76px", minHeight: "100vh", background: "var(--gray-50)" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(155deg, #0d1f40, var(--navy))", padding: "2.5rem 0" }}>
        <div className="container">
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", marginBottom: "1.75rem" }}>
            <div style={{ width: "56px", height: "56px", background: "rgba(255,255,255,0.12)", border: "2px solid rgba(255,255,255,0.2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 900, fontSize: "1.5rem" }}>
              {(profile.full_name ?? profile.email).charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 style={{ color: "white", fontWeight: 800, fontSize: "1.375rem" }}>{profile.full_name || "My Account"}</h1>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.875rem" }}>
                {location ? `${location} · ` : ""}Member since {memberSince}
              </p>
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
              { icon: "❤️", label: "Saved Contractors", value: favorites.length,  tab: "favorites" as Tab },
              { icon: "📋", label: "Quote Requests",    value: quotes.length,     tab: "history"   as Tab },
              { icon: "⭐", label: "Reviews Written",   value: reviews.length,    tab: "reviews"   as Tab },
            ].map(card => (
              <button key={card.label} onClick={() => setTab(card.tab)} className="card" style={{ padding: "1.5rem", textAlign: "left", cursor: "pointer", border: "none", fontFamily: "inherit", background: "white" }}>
                <div style={{ fontSize: "1.75rem", marginBottom: "0.75rem" }}>{card.icon}</div>
                <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--navy)", letterSpacing: "-0.03em" }}>{card.value}</div>
                <div style={{ fontSize: "0.9375rem", color: "var(--gray-500)", fontWeight: 500 }}>{card.label}</div>
              </button>
            ))}

            {quotes.length > 0 && (
              <div className="card" style={{ padding: "1.75rem", gridColumn: "1/-1" }}>
                <h2 style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "1.25rem", fontSize: "1.0625rem" }}>Recent Activity</h2>
                {quotes.slice(0, 3).map((item, i) => {
                  const st = STATUS_STYLE[item.status] ?? STATUS_STYLE.pending;
                  return (
                    <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.875rem 0", borderBottom: i < Math.min(quotes.length, 3) - 1 ? "1px solid var(--gray-100)" : "none" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: "var(--navy)", fontSize: "0.9375rem" }}>{item.contractors?.company_name ?? "Unknown"}</div>
                        <div style={{ fontSize: "0.8125rem", color: "var(--gray-400)" }}>
                          {item.service_type} · {new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </div>
                      </div>
                      <span style={{ background: st.bg, color: st.color, padding: "0.25rem 0.75rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700, whiteSpace: "nowrap" }}>{st.label}</span>
                    </div>
                  );
                })}
              </div>
            )}

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
              Saved Contractors <span style={{ color: "var(--red)" }}>({favorites.length})</span>
            </h2>
            {favorites.length === 0 ? (
              <div className="card" style={{ padding: "3rem", textAlign: "center" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>❤️</div>
                <h3 style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "0.75rem" }}>No saved contractors yet</h3>
                <p style={{ color: "var(--gray-500)", marginBottom: "1.5rem" }}>Click the heart icon on any contractor profile to save them here.</p>
                <Link href="/find-contractors" className="btn-red">Browse Contractors</Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {favorites.map(fav => {
                  const c = fav.contractors;
                  return (
                    <div key={fav.id} className="card" style={{ padding: "1.5rem", display: "flex", alignItems: "center", gap: "1.25rem" }}>
                      <div style={{ width: "52px", height: "52px", background: "var(--navy)", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 900, fontSize: "1.25rem", flexShrink: 0 }}>
                        {c.company_name.charAt(0)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: "var(--navy)", fontSize: "1rem", marginBottom: "0.25rem" }}>{c.company_name}</div>
                        <div style={{ fontSize: "0.875rem", color: "var(--gray-500)" }}>{c.category} · {c.city}, {c.state_code}</div>
                      </div>
                      <div style={{ display: "flex", gap: "0.625rem", flexShrink: 0 }}>
                        <Link href={`/contractors/${c.id}`} className="btn-red" style={{ padding: "0.625rem 1.25rem", fontSize: "0.875rem" }}>View Profile</Link>
                        <button onClick={() => handleRemoveFavorite(fav.id, c.id)}
                          style={{ padding: "0.625rem", background: "rgba(199,25,26,0.08)", color: "var(--red)", border: "1px solid rgba(199,25,26,0.15)", borderRadius: "var(--radius-sm)", cursor: "pointer", fontSize: "1rem" }}
                          aria-label="Remove from favorites">❤️</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── HISTORY ── */}
        {tab === "history" && (
          <div>
            <h2 style={{ fontWeight: 700, color: "var(--navy)", fontSize: "1.25rem", marginBottom: "1.5rem" }}>Quote History</h2>
            {quotes.length === 0 ? (
              <div className="card" style={{ padding: "3rem", textAlign: "center" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📋</div>
                <h3 style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "0.75rem" }}>No quote requests yet</h3>
                <p style={{ color: "var(--gray-500)", marginBottom: "1.5rem" }}>Request quotes from local contractors to get started.</p>
                <Link href="/find-contractors" className="btn-red">Find Contractors</Link>
              </div>
            ) : (
              <div className="card" style={{ overflow: "hidden" }}>
                {quotes.map((item, i) => {
                  const st = STATUS_STYLE[item.status] ?? STATUS_STYLE.pending;
                  return (
                    <div key={item.id} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: "1rem", padding: "1.25rem 1.5rem", borderBottom: i < quotes.length - 1 ? "1px solid var(--gray-50)" : "none", alignItems: "center" }}>
                      <div>
                        <div style={{ fontWeight: 700, color: "var(--navy)", fontSize: "0.9375rem", marginBottom: "0.25rem" }}>{item.contractors?.company_name ?? "Unknown"}</div>
                        <div style={{ fontSize: "0.875rem", color: "var(--gray-500)" }}>{item.service_type}</div>
                        <div style={{ fontSize: "0.8125rem", color: "var(--gray-400)", marginTop: "0.25rem" }}>
                          {new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          {item.city ? ` · ${item.city}, ${item.state_code}` : ""}
                        </div>
                      </div>
                      <span style={{ background: st.bg, color: st.color, padding: "0.25rem 0.75rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700, whiteSpace: "nowrap" }}>{st.label}</span>
                      {item.contractors?.id && (
                        <Link href={`/contractors/${item.contractors.id}`} className="btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.8125rem" }}>View Profile</Link>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── REVIEWS ── */}
        {tab === "reviews" && (
          <div>
            <h2 style={{ fontWeight: 700, color: "var(--navy)", fontSize: "1.25rem", marginBottom: "1.5rem" }}>
              Reviews You've Written <span style={{ color: "var(--red)" }}>({reviews.length})</span>
            </h2>
            {reviews.length === 0 ? (
              <div className="card" style={{ padding: "3rem", textAlign: "center" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⭐</div>
                <h3 style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "0.75rem" }}>No reviews yet</h3>
                <p style={{ color: "var(--gray-500)" }}>After working with a contractor, leave a review to help other homeowners.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {reviews.map(r => (
                  <div key={r.id} className="card" style={{ padding: "1.75rem" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", marginBottom: "0.875rem", flexWrap: "wrap" }}>
                      <div>
                        <div style={{ fontWeight: 700, color: "var(--navy)", fontSize: "1rem" }}>{r.contractors?.company_name}</div>
                        <div style={{ fontSize: "0.875rem", color: "var(--gray-400)" }}>
                          {r.project_type ? `${r.project_type} · ` : ""}
                          {new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <Stars rating={r.rating} />
                        {r.contractors?.id && (
                          <Link href={`/contractors/${r.contractors.id}`} style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--navy)", textDecoration: "none" }}>View profile →</Link>
                        )}
                      </div>
                    </div>
                    <p style={{ color: "var(--gray-600)", lineHeight: 1.75, fontSize: "0.9375rem" }}>{r.body}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── SETTINGS ── */}
        {tab === "settings" && (
          <form onSubmit={handleSaveSettings} className="card" style={{ padding: "2rem", maxWidth: "640px" }}>
            <h2 style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "2rem", fontSize: "1.25rem" }}>Account Settings</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--gray-700)", marginBottom: "0.5rem" }}>Full Name</label>
                <input type="text" className="form-input" value={editName} onChange={e => setEditName(e.target.value)} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--gray-700)", marginBottom: "0.5rem" }}>Email</label>
                <input type="email" className="form-input" value={profile.email} disabled style={{ opacity: 0.6, cursor: "not-allowed" }} />
                <p style={{ fontSize: "0.8125rem", color: "var(--gray-400)", marginTop: "0.375rem" }}>Email cannot be changed here. Contact support if needed.</p>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--gray-700)", marginBottom: "0.5rem" }}>Phone</label>
                <input type="tel" className="form-input" value={editPhone} onChange={e => setEditPhone(e.target.value)} />
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: "1.75rem", paddingTop: "1.5rem", borderTop: "1px solid var(--gray-100)" }}>
              <button type="submit" className="btn-red" style={{ padding: "0.875rem 2rem" }} disabled={saving}>
                {saving ? "Saving…" : "Save Changes"}
              </button>
              {saveMsg && <span style={{ color: "#16a34a", fontWeight: 600, fontSize: "0.9rem" }}>{saveMsg}</span>}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
