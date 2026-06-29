"use client";
import { useState, useEffect, useCallback } from "react";

interface Banner {
  id: string; title: string; subtitle: string; ctaLabel: string; ctaHref: string;
  placement: "homepage_hero" | "find_contractors" | "suppliers" | "pricing" | "global_bar";
  bgColor: string; active: boolean; startDate: string; endDate: string | null; priority: number;
}

const PLACEMENTS: Record<Banner["placement"], string> = {
  homepage_hero:    "Homepage Hero",
  find_contractors: "Find Contractors Page",
  suppliers:        "Suppliers Page",
  pricing:          "Pricing Page",
  global_bar:       "Global Announcement Bar",
};

function Toast({ msg, type }: { msg: string; type: "success" | "error" }) {
  return (
    <div style={{ position: "fixed", bottom: "1.5rem", right: "1.5rem", zIndex: 1000, background: type === "success" ? "#16a34a" : "var(--red)", color: "white", padding: "0.875rem 1.5rem", borderRadius: "var(--radius)", fontWeight: 600, fontSize: "0.9rem", boxShadow: "var(--shadow-lg)" }}>
      {msg}
    </div>
  );
}

export default function BannersAdminPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [newB, setNewB] = useState<Partial<Banner>>({ placement: "homepage_hero", bgColor: "#162E5E", active: true, priority: 1 });
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/banners");
      const json = await res.json();
      setBanners(json.banners ?? []);
    } catch {
      showToast("Failed to load banners", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async (updated: Banner[]) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/banners", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ banners: updated }),
      });
      if (!res.ok) throw new Error();
      setBanners(updated);
      showToast("Banners saved");
    } catch {
      showToast("Failed to save banners", "error");
    } finally {
      setSaving(false);
    }
  };

  const toggle = (id: string) => {
    const updated = banners.map(b => b.id === id ? { ...b, active: !b.active } : b);
    save(updated);
  };

  const remove = (id: string) => {
    if (!confirm("Delete this banner?")) return;
    save(banners.filter(b => b.id !== id));
  };

  const addNew = () => {
    if (!newB.title) return;
    const updated = [...banners, { ...newB as Banner, id: `b${Date.now()}` }];
    save(updated);
    setShowNew(false);
    setNewB({ placement: "homepage_hero", bgColor: "#162E5E", active: true, priority: 1 });
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "300px", color: "var(--gray-400)", flexDirection: "column", gap: "1rem" }}>
      <div style={{ width: "32px", height: "32px", border: "3px solid var(--gray-200)", borderTopColor: "var(--navy)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      Loading banners...
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div>
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.625rem", fontWeight: 800, color: "var(--navy)", marginBottom: "0.25rem" }}>Banners</h1>
          <p style={{ color: "var(--gray-500)", fontSize: "0.875rem" }}>
            {banners.filter(b => b.active).length} active · {banners.length} total
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
            <div>
              <label className="form-label">Background Color</label>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <input type="color" value={newB.bgColor ?? "#162E5E"} onChange={e => setNewB(p => ({ ...p, bgColor: e.target.value }))} style={{ width: "48px", height: "42px", padding: "2px", border: "1px solid var(--gray-200)", borderRadius: "6px" }} />
                <input className="form-input" value={newB.bgColor ?? ""} onChange={e => setNewB(p => ({ ...p, bgColor: e.target.value }))} style={{ fontFamily: "monospace" }} />
              </div>
            </div>
            <div><label className="form-label">Start Date</label><input className="form-input" type="date" onChange={e => setNewB(p => ({ ...p, startDate: e.target.value }))} /></div>
            <div><label className="form-label">End Date <span style={{ fontWeight: 400, color: "var(--gray-400)" }}>(leave blank for no expiry)</span></label><input className="form-input" type="date" onChange={e => setNewB(p => ({ ...p, endDate: e.target.value || null }))} /></div>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem" }}>
            <button className="btn-red" onClick={addNew} disabled={saving || !newB.title}>
              {saving ? "Saving..." : "Save Banner"}
            </button>
            <button className="btn-secondary" onClick={() => setShowNew(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {banners.length === 0 && (
          <div className="card" style={{ padding: "3rem", textAlign: "center", color: "var(--gray-400)" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>📢</div>
            No banners yet — create one above.
          </div>
        )}
        {banners.map(b => (
          <div key={b.id} className="card" style={{ overflow: "hidden" }}>
            <div style={{ background: b.bgColor, padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, color: "white", fontSize: "1.0625rem" }}>{b.title}</div>
                {b.subtitle && <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.875rem", marginTop: "0.25rem" }}>{b.subtitle}</div>}
              </div>
              {b.ctaLabel && <div style={{ background: "white", color: b.bgColor, padding: "0.5rem 1.25rem", borderRadius: "var(--radius-sm)", fontWeight: 700, fontSize: "0.875rem", flexShrink: 0 }}>{b.ctaLabel}</div>}
            </div>
            <div style={{ padding: "1rem 1.5rem", display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
              <span style={{ background: "rgba(22,46,94,0.08)", color: "var(--navy)", padding: "0.2rem 0.625rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700 }}>
                {PLACEMENTS[b.placement]}
              </span>
              <span style={{ fontSize: "0.8125rem", color: "var(--gray-400)" }}>
                {b.startDate}{b.endDate ? ` → ${b.endDate}` : " (no expiry)"}
              </span>
              <div style={{ marginLeft: "auto", display: "flex", gap: "0.5rem" }}>
                <button onClick={() => toggle(b.id)} disabled={saving} style={{
                  padding: "0.375rem 0.75rem", border: "none", borderRadius: "999px", cursor: "pointer", fontFamily: "inherit", fontSize: "0.75rem", fontWeight: 700,
                  background: b.active ? "rgba(22,163,74,0.1)" : "var(--gray-100)",
                  color: b.active ? "#16a34a" : "var(--gray-400)",
                }}>{b.active ? "Active" : "Inactive"}</button>
                <button onClick={() => remove(b.id)} style={{ padding: "0.375rem 0.75rem", background: "rgba(199,25,26,0.06)", color: "var(--red)", border: "1px solid rgba(199,25,26,0.15)", borderRadius: "var(--radius-xs)", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
