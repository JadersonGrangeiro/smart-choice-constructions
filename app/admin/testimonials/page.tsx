"use client";
import { useState, useEffect, useCallback } from "react";

interface Testimonial {
  id: string; name: string; city: string; role: string; rating: number;
  text: string; project: string | null; active: boolean; featured: boolean; date: string;
}

function Stars({ rating }: { rating: number }) {
  return <span style={{ color: "#f59e0b" }}>{"★".repeat(rating)}{"☆".repeat(5 - rating)}</span>;
}

function Toast({ msg, type }: { msg: string; type: "success" | "error" }) {
  return (
    <div style={{ position: "fixed", bottom: "1.5rem", right: "1.5rem", zIndex: 1000, background: type === "success" ? "#16a34a" : "var(--red)", color: "white", padding: "0.875rem 1.5rem", borderRadius: "var(--radius)", fontWeight: 600, fontSize: "0.9rem", boxShadow: "var(--shadow-lg)" }}>
      {msg}
    </div>
  );
}

export default function TestimonialsAdminPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [filter, setFilter] = useState<"all"|"featured"|"active"|"inactive">("all");
  const [newT, setNewT] = useState({ name: "", city: "", role: "Homeowner", rating: 5, text: "", project: "" });
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/testimonials");
      const json = await res.json();
      setItems(json.testimonials ?? []);
    } catch {
      showToast("Failed to load testimonials", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const persist = async (updated: Testimonial[]) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/testimonials", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testimonials: updated }),
      });
      if (!res.ok) throw new Error();
      setItems(updated);
      showToast("Testimonials saved");
    } catch {
      showToast("Failed to save testimonials", "error");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive   = (id: string) => persist(items.map(t => t.id === id ? { ...t, active: !t.active } : t));
  const toggleFeatured = (id: string) => persist(items.map(t => t.id === id ? { ...t, featured: !t.featured } : t));
  const remove         = (id: string) => { if (confirm("Delete testimonial?")) persist(items.filter(t => t.id !== id)); };

  const addNew = () => {
    if (!newT.name || !newT.text) return;
    const updated = [...items, {
      ...newT, id: `t${Date.now()}`,
      project: newT.project || null,
      active: true, featured: false,
      date: new Date().toISOString().split("T")[0],
    }];
    persist(updated);
    setShowNew(false);
    setNewT({ name: "", city: "", role: "Homeowner", rating: 5, text: "", project: "" });
  };

  const filtered = items.filter(t =>
    filter === "all"      ? true :
    filter === "featured" ? t.featured :
    filter === "active"   ? t.active && !t.featured :
    !t.active
  );

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "300px", color: "var(--gray-400)", flexDirection: "column", gap: "1rem" }}>
      <div style={{ width: "32px", height: "32px", border: "3px solid var(--gray-200)", borderTopColor: "var(--navy)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      Loading testimonials...
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div>
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.625rem", fontWeight: 800, color: "var(--navy)", marginBottom: "0.25rem" }}>Testimonials</h1>
          <p style={{ color: "var(--gray-500)", fontSize: "0.875rem" }}>
            {items.filter(t => t.featured).length} featured on homepage · {items.filter(t => t.active).length} active total
          </p>
        </div>
        <button className="btn-red" onClick={() => setShowNew(true)} style={{ padding: "0.75rem 1.5rem" }}>+ Add Testimonial</button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {(["all","featured","active","inactive"] as const).map(f => {
          const count = f === "all" ? items.length : f === "featured" ? items.filter(t => t.featured).length : f === "active" ? items.filter(t => t.active && !t.featured).length : items.filter(t => !t.active).length;
          return (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: "0.375rem 0.875rem", borderRadius: "999px",
              background: filter === f ? "var(--navy)" : "white",
              color: filter === f ? "white" : "var(--gray-600)",
              border: `1.5px solid ${filter === f ? "var(--navy)" : "var(--gray-200)"}`,
              fontWeight: 600, fontSize: "0.8125rem", cursor: "pointer", fontFamily: "inherit", textTransform: "capitalize",
            }}>
              {f} ({count})
            </button>
          );
        })}
      </div>

      {showNew && (
        <div className="card" style={{ padding: "1.75rem", marginBottom: "1.5rem", border: "2px solid var(--navy)" }}>
          <h3 style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "1.25rem" }}>New Testimonial</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
            <div><label className="form-label">Full Name *</label><input className="form-input" value={newT.name} onChange={e => setNewT(p => ({ ...p, name: e.target.value }))} /></div>
            <div><label className="form-label">City, State</label><input className="form-input" placeholder="Austin, TX" value={newT.city} onChange={e => setNewT(p => ({ ...p, city: e.target.value }))} /></div>
            <div>
              <label className="form-label">Role</label>
              <select className="form-select" value={newT.role} onChange={e => setNewT(p => ({ ...p, role: e.target.value }))}>
                <option>Homeowner</option><option>Contractor</option><option>Supplier</option>
              </select>
            </div>
            <div><label className="form-label">Project (optional)</label><input className="form-input" placeholder="Kitchen Remodel" value={newT.project} onChange={e => setNewT(p => ({ ...p, project: e.target.value }))} /></div>
            <div>
              <label className="form-label">Rating</label>
              <select className="form-select" value={newT.rating} onChange={e => setNewT(p => ({ ...p, rating: Number(e.target.value) }))}>
                {[5,4,3].map(n => <option key={n} value={n}>{n} stars</option>)}
              </select>
            </div>
            <div style={{ gridColumn: "1/-1" }}><label className="form-label">Testimonial Text *</label><textarea className="form-input" rows={3} value={newT.text} onChange={e => setNewT(p => ({ ...p, text: e.target.value }))} style={{ resize: "vertical" }} /></div>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem" }}>
            <button className="btn-red" onClick={addNew} disabled={saving || !newT.name || !newT.text}>
              {saving ? "Saving..." : "Save"}
            </button>
            <button className="btn-secondary" onClick={() => setShowNew(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {filtered.length === 0 && (
          <div className="card" style={{ padding: "3rem", textAlign: "center", color: "var(--gray-400)" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>💬</div>
            {items.length === 0 ? "No testimonials yet — add one above." : "No testimonials in this filter."}
          </div>
        )}
        {filtered.map(t => (
          <div key={t.id} className="card" style={{ padding: "1.5rem", borderLeft: `4px solid ${t.featured ? "var(--red)" : t.active ? "rgba(22,163,74,0.3)" : "var(--gray-200)"}` }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
              <div style={{ width: "44px", height: "44px", background: "var(--navy)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, flexShrink: 0 }}>
                {t.name.charAt(0)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.375rem", flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 700, color: "var(--navy)" }}>{t.name}</span>
                  <span style={{ fontSize: "0.8125rem", color: "var(--gray-400)" }}>{t.city} · {t.role}</span>
                  <Stars rating={t.rating} />
                  {t.featured && <span style={{ background: "rgba(199,25,26,0.08)", color: "var(--red)", padding: "0.15rem 0.5rem", borderRadius: "999px", fontSize: "0.7rem", fontWeight: 700 }}>Homepage Featured</span>}
                </div>
                {t.project && <div style={{ fontSize: "0.8125rem", color: "var(--gray-400)", marginBottom: "0.5rem" }}>Project: {t.project}</div>}
                <p style={{ color: "var(--gray-700)", lineHeight: 1.7, fontSize: "0.9375rem" }}>{t.text}</p>
                <div style={{ fontSize: "0.75rem", color: "var(--gray-400)", marginTop: "0.5rem" }}>{t.date}</div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0, flexWrap: "wrap" }}>
                <button onClick={() => toggleFeatured(t.id)} disabled={saving} style={{ padding: "0.375rem 0.75rem", border: "none", borderRadius: "999px", cursor: "pointer", fontFamily: "inherit", fontSize: "0.75rem", fontWeight: 700, background: t.featured ? "rgba(199,25,26,0.1)" : "var(--gray-100)", color: t.featured ? "var(--red)" : "var(--gray-500)" }}>
                  {t.featured ? "★ Featured" : "Feature"}
                </button>
                <button onClick={() => toggleActive(t.id)} disabled={saving} style={{ padding: "0.375rem 0.75rem", border: "none", borderRadius: "999px", cursor: "pointer", fontFamily: "inherit", fontSize: "0.75rem", fontWeight: 700, background: t.active ? "rgba(22,163,74,0.1)" : "var(--gray-100)", color: t.active ? "#16a34a" : "var(--gray-400)" }}>
                  {t.active ? "Active" : "Hidden"}
                </button>
                <button onClick={() => remove(t.id)} style={{ padding: "0.375rem 0.75rem", background: "rgba(199,25,26,0.06)", color: "var(--red)", border: "1px solid rgba(199,25,26,0.15)", borderRadius: "var(--radius-xs)", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
