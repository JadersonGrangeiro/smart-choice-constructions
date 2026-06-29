"use client";
import { useState } from "react";

interface Banner {
  id: string; title: string; subtitle: string; ctaLabel: string; ctaHref: string;
  placement: "homepage_hero" | "find_contractors" | "suppliers" | "pricing" | "global_bar";
  bgColor: string; active: boolean; startDate: string; endDate: string | null; priority: number;
}

const MOCK_BANNERS: Banner[] = [
  { id: "b1", title: "First Month Only $29.90",     subtitle: "Join Smart Choice today and get your first month at 40% off.",           ctaLabel: "Join Now",        ctaHref: "/join",            placement: "homepage_hero",    bgColor: "#162E5E", active: true,  startDate: "Jun 1, 2025",  endDate: null,            priority: 1 },
  { id: "b2", title: "New: Local Suppliers Now Live",subtitle: "Find building materials, equipment rental, and design pros near you.",   ctaLabel: "Browse Suppliers",ctaHref: "/suppliers",       placement: "global_bar",      bgColor: "#C7191A", active: true,  startDate: "Jun 28, 2025", endDate: "Jul 31, 2025",  priority: 1 },
  { id: "b3", title: "Summer Special — 25% Off",    subtitle: "Use code SUMMER25 at checkout. Limited to first 50 signups.",            ctaLabel: "Get Started",     ctaHref: "/join",            placement: "find_contractors", bgColor: "#0369a1", active: false, startDate: "Jul 1, 2025",  endDate: "Jul 31, 2025",  priority: 2 },
  { id: "b4", title: "Are You a Supplier?",          subtitle: "Get your business listed on Smart Choice and reach local contractors.",   ctaLabel: "List Your Business",ctaHref:"/join-supplier",  placement: "suppliers",        bgColor: "#047857", active: true,  startDate: "Jun 1, 2025",  endDate: null,            priority: 1 },
];

const PLACEMENTS: Record<Banner["placement"], string> = {
  homepage_hero:    "Homepage Hero",
  find_contractors: "Find Contractors Page",
  suppliers:        "Suppliers Page",
  pricing:          "Pricing Page",
  global_bar:       "Global Announcement Bar",
};

export default function BannersAdminPage() {
  const [banners, setBanners] = useState(MOCK_BANNERS);
  const [showNew, setShowNew] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [newB, setNewB] = useState<Partial<Banner>>({ placement: "homepage_hero", bgColor: "#162E5E", active: true, priority: 1 });

  const toggle = (id: string) => setBanners(p => p.map(b => b.id === id ? { ...b, active: !b.active } : b));

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.625rem", fontWeight: 800, color: "var(--navy)", marginBottom: "0.25rem" }}>Banners</h1>
          <p style={{ color: "var(--gray-500)", fontSize: "0.875rem" }}>
            {banners.filter(b => b.active).length} active · {banners.length} total · Manage promotional banners across the platform.
          </p>
        </div>
        <button className="btn-red" onClick={() => setShowNew(true)} style={{ padding: "0.75rem 1.5rem" }}>+ New Banner</button>
      </div>

      {showNew && (
        <div className="card" style={{ padding: "1.75rem", marginBottom: "1.5rem", border: "2px solid var(--navy)" }}>
          <h3 style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "1.25rem" }}>New Banner</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div><label className="form-label">Title *</label><input className="form-input" placeholder="Banner headline" value={newB.title ?? ""} onChange={e => setNewB(p => ({ ...p, title: e.target.value }))} /></div>
            <div><label className="form-label">Subtitle</label><input className="form-input" placeholder="Supporting text" value={newB.subtitle ?? ""} onChange={e => setNewB(p => ({ ...p, subtitle: e.target.value }))} /></div>
            <div><label className="form-label">CTA Label</label><input className="form-input" placeholder="e.g. Learn More" value={newB.ctaLabel ?? ""} onChange={e => setNewB(p => ({ ...p, ctaLabel: e.target.value }))} /></div>
            <div><label className="form-label">CTA URL</label><input className="form-input" placeholder="/page" value={newB.ctaHref ?? ""} onChange={e => setNewB(p => ({ ...p, ctaHref: e.target.value }))} /></div>
            <div>
              <label className="form-label">Placement</label>
              <select className="form-select" value={newB.placement} onChange={e => setNewB(p => ({ ...p, placement: e.target.value as Banner["placement"] }))}>
                {Object.entries(PLACEMENTS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div><label className="form-label">Background Color</label><div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}><input type="color" value={newB.bgColor ?? "#162E5E"} onChange={e => setNewB(p => ({ ...p, bgColor: e.target.value }))} style={{ width: "48px", height: "42px", padding: "2px", border: "1px solid var(--gray-200)", borderRadius: "6px" }} /><input className="form-input" value={newB.bgColor ?? ""} onChange={e => setNewB(p => ({ ...p, bgColor: e.target.value }))} style={{ fontFamily: "monospace" }} /></div></div>
            <div><label className="form-label">Start Date</label><input className="form-input" type="date" onChange={e => setNewB(p => ({ ...p, startDate: e.target.value }))} /></div>
            <div><label className="form-label">End Date <span style={{ fontWeight: 400, color: "var(--gray-400)" }}>(leave blank for no expiry)</span></label><input className="form-input" type="date" onChange={e => setNewB(p => ({ ...p, endDate: e.target.value || null }))} /></div>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem" }}>
            <button className="btn-red" onClick={() => {
              if (!newB.title) return;
              setBanners(p => [...p, { ...newB as Banner, id: `b${Date.now()}` }]);
              setShowNew(false); setNewB({ placement: "homepage_hero", bgColor: "#162E5E", active: true, priority: 1 });
            }}>Save Banner</button>
            <button className="btn-secondary" onClick={() => setShowNew(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Preview + list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {banners.map(b => (
          <div key={b.id} className="card" style={{ overflow: "hidden" }}>
            {/* Preview */}
            <div style={{ background: b.bgColor, padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, color: "white", fontSize: "1.0625rem" }}>{b.title}</div>
                {b.subtitle && <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.875rem", marginTop: "0.25rem" }}>{b.subtitle}</div>}
              </div>
              {b.ctaLabel && <div style={{ background: "white", color: b.bgColor, padding: "0.5rem 1.25rem", borderRadius: "var(--radius-sm)", fontWeight: 700, fontSize: "0.875rem", flexShrink: 0 }}>{b.ctaLabel}</div>}
            </div>
            {/* Controls */}
            <div style={{ padding: "1rem 1.5rem", display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
              <span style={{ background: "rgba(22,46,94,0.08)", color: "var(--navy)", padding: "0.2rem 0.625rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700 }}>
                {PLACEMENTS[b.placement]}
              </span>
              <span style={{ fontSize: "0.8125rem", color: "var(--gray-400)" }}>
                {b.startDate}{b.endDate ? ` → ${b.endDate}` : " (no expiry)"}
              </span>
              <div style={{ marginLeft: "auto", display: "flex", gap: "0.5rem" }}>
                <button onClick={() => toggle(b.id)} style={{
                  padding: "0.375rem 0.75rem", border: "none", borderRadius: "999px", cursor: "pointer", fontFamily: "inherit", fontSize: "0.75rem", fontWeight: 700,
                  background: b.active ? "rgba(22,163,74,0.1)" : "var(--gray-100)",
                  color: b.active ? "#16a34a" : "var(--gray-400)",
                }}>{b.active ? "Active" : "Inactive"}</button>
                <button style={{ padding: "0.375rem 0.75rem", background: "var(--gray-100)", border: "none", borderRadius: "var(--radius-xs)", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", color: "var(--gray-700)" }}>Edit</button>
                <button onClick={() => setBanners(p => p.filter(x => x.id !== b.id))} style={{ padding: "0.375rem 0.75rem", background: "rgba(199,25,26,0.06)", color: "var(--red)", border: "1px solid rgba(199,25,26,0.15)", borderRadius: "var(--radius-xs)", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
