"use client";
import { useState } from "react";

const MOCK_TESTIMONIALS = [
  { id: "t1", name: "Jennifer M.",  city: "Austin, TX",      role: "Homeowner",          rating: 5, text: "Found an amazing contractor for our kitchen remodel in less than 24 hours. The platform made it so easy to compare reviews and get quotes.", project: "Kitchen Remodel",   photo: null, active: true,  featured: true,  date: "Jun 20, 2025" },
  { id: "t2", name: "Carlos R.",    city: "Dallas, TX",       role: "Homeowner",          rating: 5, text: "Three quotes from licensed contractors within a day. Ended up saving over $4,000 compared to the first company I called on my own.", project: "Bathroom Renovation",photo: null, active: true,  featured: true,  date: "Jun 15, 2025" },
  { id: "t3", name: "Thomas R.",    city: "Austin, TX",       role: "Contractor",         rating: 5, text: "I've been on the platform for 6 months and my pipeline has never been this full. The quality of leads is significantly better than Angi.", project: null,                 photo: null, active: true,  featured: false, date: "Jun 10, 2025" },
  { id: "t4", name: "Sarah K.",     city: "Chicago, IL",      role: "Homeowner",          rating: 5, text: "The verified credentials feature gave me confidence I was hiring someone legitimate. The whole process was transparent.", project: "Electrical Panel Upgrade",photo: null, active: true, featured: false, date: "Jun 5, 2025" },
  { id: "t5", name: "Maria G.",     city: "Miami, FL",        role: "Homeowner",          rating: 4, text: "Good experience overall. Would have liked more contractors in my area but the ones I found were excellent.", project: "HVAC Replacement",  photo: null, active: false, featured: false, date: "May 28, 2025" },
];

function Stars({ rating }: { rating: number }) {
  return <span style={{ color: "#f59e0b" }}>{"★".repeat(rating)}{"☆".repeat(5 - rating)}</span>;
}

export default function TestimonialsAdminPage() {
  const [items, setItems] = useState(MOCK_TESTIMONIALS);
  const [showNew, setShowNew] = useState(false);
  const [newT, setNewT] = useState({ name: "", city: "", role: "Homeowner", rating: 5, text: "", project: "" });
  const [filter, setFilter] = useState<"all"|"featured"|"active"|"inactive">("all");

  const filtered = items.filter(t =>
    filter === "all"      ? true :
    filter === "featured" ? t.featured :
    filter === "active"   ? t.active && !t.featured :
    !t.active
  );

  const toggleActive   = (id: string) => setItems(p => p.map(t => t.id === id ? { ...t, active: !t.active } : t));
  const toggleFeatured = (id: string) => setItems(p => p.map(t => t.id === id ? { ...t, featured: !t.featured } : t));

  return (
    <div>
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
        {(["all","featured","active","inactive"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "0.375rem 0.875rem", borderRadius: "999px",
            background: filter === f ? "var(--navy)" : "white",
            color: filter === f ? "white" : "var(--gray-600)",
            border: `1.5px solid ${filter === f ? "var(--navy)" : "var(--gray-200)"}`,
            fontWeight: 600, fontSize: "0.8125rem", cursor: "pointer", fontFamily: "inherit", textTransform: "capitalize",
          }}>
            {f} ({filter === f || f === "all" ? items.filter(t => f === "all" ? true : f === "featured" ? t.featured : f === "active" ? t.active : !t.active).length : items.filter(t => f === "featured" ? t.featured : f === "active" ? t.active : !t.active).length})
          </button>
        ))}
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
            <button className="btn-red" onClick={() => {
              if (!newT.name || !newT.text) return;
              setItems(p => [...p, { ...newT, id: `t${Date.now()}`, photo: null, active: true, featured: false, date: new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) }]);
              setShowNew(false);
            }}>Save</button>
            <button className="btn-secondary" onClick={() => setShowNew(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
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
                <div style={{ fontSize: "0.75rem", color: "var(--gray-400)", marginTop: "0.5rem" }}>Added {t.date}</div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0, flexWrap: "wrap" }}>
                <button onClick={() => toggleFeatured(t.id)} style={{ padding: "0.375rem 0.75rem", border: "none", borderRadius: "999px", cursor: "pointer", fontFamily: "inherit", fontSize: "0.75rem", fontWeight: 700, background: t.featured ? "rgba(199,25,26,0.1)" : "var(--gray-100)", color: t.featured ? "var(--red)" : "var(--gray-500)" }}>
                  {t.featured ? "★ Featured" : "Feature"}
                </button>
                <button onClick={() => toggleActive(t.id)} style={{ padding: "0.375rem 0.75rem", border: "none", borderRadius: "999px", cursor: "pointer", fontFamily: "inherit", fontSize: "0.75rem", fontWeight: 700, background: t.active ? "rgba(22,163,74,0.1)" : "var(--gray-100)", color: t.active ? "#16a34a" : "var(--gray-400)" }}>
                  {t.active ? "Active" : "Hidden"}
                </button>
                <button onClick={() => setItems(p => p.filter(x => x.id !== t.id))} style={{ padding: "0.375rem 0.75rem", background: "rgba(199,25,26,0.06)", color: "var(--red)", border: "1px solid rgba(199,25,26,0.15)", borderRadius: "var(--radius-xs)", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
