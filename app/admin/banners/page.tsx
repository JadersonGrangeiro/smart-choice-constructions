"use client";
import { useState, useEffect, useCallback } from "react";

interface Banner {
  id: string; title: string; subtitle: string; ctaLabel: string; ctaHref: string;
  placement: "homepage_hero" | "find_contractors" | "suppliers" | "pricing" | "global_bar";
  bgColor: string; active: boolean; startDate: string; endDate: string | null; priority: number;
  imageUrl?: string; textColor?: string;
}

const PLACEMENTS: Record<Banner["placement"], string> = {
  homepage_hero:    "Homepage Hero",
  find_contractors: "Find Contractors Page",
  suppliers:        "Suppliers Page",
  pricing:          "Pricing Page",
  global_bar:       "Global Announcement Bar",
};

const EMPTY: Partial<Banner> = { placement: "homepage_hero", bgColor: "#162E5E", textColor: "#ffffff", active: true, priority: 1, ctaLabel: "", ctaHref: "", subtitle: "", imageUrl: "" };

function Toast({ msg, type }: { msg: string; type: "success" | "error" }) {
  return (
    <div style={{ position:"fixed", bottom:"1.5rem", right:"1.5rem", zIndex:1000, background: type==="success"?"#16a34a":"var(--red)", color:"white", padding:"0.875rem 1.5rem", borderRadius:"var(--radius)", fontWeight:600, fontSize:"0.9rem", boxShadow:"var(--shadow-lg)" }}>
      {msg}
    </div>
  );
}

function BannerModal({ banner, onClose, onSave, saving }: {
  banner: Partial<Banner>; onClose: () => void;
  onSave: (b: Partial<Banner>) => void; saving: boolean;
}) {
  const [form, setForm] = useState<Partial<Banner>>(banner);
  const [uploadingImg, setUploadingImg] = useState(false);
  const set = (k: keyof Banner, v: unknown) => setForm(p => ({ ...p, [k]: v }));

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setUploadingImg(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("bucket", "banner-images");
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error();
      const { url } = await res.json();
      set("imageUrl", url);
    } catch { /* silently ignore — user can still paste URL */ }
    finally { setUploadingImg(false); }
  };

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", zIndex:500, display:"flex", alignItems:"center", justifyContent:"center", padding:"1.5rem", overflowY:"auto" }}>
      <div style={{ background:"white", borderRadius:"var(--radius-xl)", padding:"2rem", width:"100%", maxWidth:"680px", boxShadow:"var(--shadow-xl)", maxHeight:"90vh", overflowY:"auto" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.75rem" }}>
          <h2 style={{ fontWeight:800, color:"var(--navy)", fontSize:"1.1875rem" }}>
            {form.id ? "Edit Banner" : "New Banner"}
          </h2>
          <button onClick={onClose} style={{ background:"none", border:"none", fontSize:"1.5rem", cursor:"pointer", color:"var(--gray-400)" }}>×</button>
        </div>

        {/* Live preview */}
        <div style={{ background: form.bgColor ?? "#162E5E", borderRadius:"var(--radius)", padding:"1.25rem 1.5rem", marginBottom:"1.75rem", display:"flex", alignItems:"center", gap:"1rem", flexWrap:"wrap" }}>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:800, color: form.textColor ?? "#fff", fontSize:"1.0625rem" }}>{form.title || "Banner title here"}</div>
            {form.subtitle && <div style={{ color: form.textColor ? form.textColor+"bb" : "rgba(255,255,255,0.75)", fontSize:"0.875rem", marginTop:"0.25rem" }}>{form.subtitle}</div>}
          </div>
          {form.ctaLabel && (
            <div style={{ background:"white", color: form.bgColor ?? "#162E5E", padding:"0.5rem 1.25rem", borderRadius:"var(--radius-sm)", fontWeight:700, fontSize:"0.875rem", flexShrink:0 }}>
              {form.ctaLabel}
            </div>
          )}
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
          <div style={{ gridColumn:"1/-1" }}>
            <label className="form-label">Title *</label>
            <input className="form-input" placeholder="Banner headline" value={form.title??""} onChange={e=>set("title",e.target.value)} />
          </div>
          <div style={{ gridColumn:"1/-1" }}>
            <label className="form-label">Subtitle</label>
            <input className="form-input" placeholder="Supporting text (optional)" value={form.subtitle??""} onChange={e=>set("subtitle",e.target.value)} />
          </div>
          <div>
            <label className="form-label">CTA Button Label</label>
            <input className="form-input" placeholder="e.g. Learn More" value={form.ctaLabel??""} onChange={e=>set("ctaLabel",e.target.value)} />
          </div>
          <div>
            <label className="form-label">CTA URL</label>
            <input className="form-input" placeholder="/page or https://..." value={form.ctaHref??""} onChange={e=>set("ctaHref",e.target.value)} />
          </div>
          <div>
            <label className="form-label">Placement</label>
            <select className="form-select" value={form.placement} onChange={e=>set("placement",e.target.value as Banner["placement"])}>
              {Object.entries(PLACEMENTS).map(([k,v])=><option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Priority (1=highest)</label>
            <input className="form-input" type="number" min={1} max={10} value={form.priority??1} onChange={e=>set("priority",+e.target.value)} />
          </div>
          <div>
            <label className="form-label">Background Color</label>
            <div style={{ display:"flex", gap:"0.5rem", alignItems:"center" }}>
              <input type="color" value={form.bgColor??"#162E5E"} onChange={e=>set("bgColor",e.target.value)} style={{ width:"48px", height:"42px", padding:"2px", border:"1px solid var(--gray-200)", borderRadius:"6px", cursor:"pointer" }} />
              <input className="form-input" value={form.bgColor??""} onChange={e=>set("bgColor",e.target.value)} style={{ fontFamily:"monospace" }} />
            </div>
          </div>
          <div>
            <label className="form-label">Text Color</label>
            <div style={{ display:"flex", gap:"0.5rem", alignItems:"center" }}>
              <input type="color" value={form.textColor??"#ffffff"} onChange={e=>set("textColor",e.target.value)} style={{ width:"48px", height:"42px", padding:"2px", border:"1px solid var(--gray-200)", borderRadius:"6px", cursor:"pointer" }} />
              <input className="form-input" value={form.textColor??""} onChange={e=>set("textColor",e.target.value)} style={{ fontFamily:"monospace" }} />
            </div>
          </div>
          <div style={{ gridColumn:"1/-1" }}>
            <label className="form-label">Imagem de Fundo <span style={{ fontWeight:400, color:"var(--gray-400)" }}>(opcional)</span></label>
            <div style={{ display:"flex", gap:"0.625rem", alignItems:"center", marginBottom:"0.5rem" }}>
              <label style={{ cursor:"pointer", flexShrink:0 }}>
                <input type="file" accept="image/*" style={{ display:"none" }} disabled={uploadingImg}
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); e.target.value=""; }} />
                <span style={{ display:"inline-flex", alignItems:"center", gap:"0.375rem", padding:"0.5rem 0.875rem", background:"var(--navy)", color:"white", borderRadius:"var(--radius-sm)", fontWeight:700, fontSize:"0.8125rem", opacity: uploadingImg ? 0.6 : 1, whiteSpace:"nowrap" }}>
                  📤 {uploadingImg ? "Enviando…" : "Upload"}
                </span>
              </label>
              <input className="form-input" placeholder="ou cole uma URL: https://..." value={form.imageUrl??""} onChange={e=>set("imageUrl",e.target.value)} />
            </div>
            {form.imageUrl && (
              <div style={{ height:"60px", borderRadius:"var(--radius-sm)", overflow:"hidden", border:"1px solid var(--gray-200)", backgroundImage:`url(${form.imageUrl})`, backgroundSize:"cover", backgroundPosition:"center" }} />
            )}
          </div>
          <div>
            <label className="form-label">Start Date</label>
            <input className="form-input" type="date" value={form.startDate??""} onChange={e=>set("startDate",e.target.value)} />
          </div>
          <div>
            <label className="form-label">End Date <span style={{ fontWeight:400, color:"var(--gray-400)" }}>(blank = no expiry)</span></label>
            <input className="form-input" type="date" value={form.endDate??""} onChange={e=>set("endDate",e.target.value||null)} />
          </div>
          <div style={{ gridColumn:"1/-1", display:"flex", alignItems:"center", gap:"0.75rem", padding:"0.875rem 1rem", background:"var(--gray-50)", borderRadius:"var(--radius)", border:"1px solid var(--gray-150)" }}>
            <input type="checkbox" id="active-chk" checked={form.active??true} onChange={e=>set("active",e.target.checked)} style={{ width:"18px", height:"18px", cursor:"pointer" }} />
            <label htmlFor="active-chk" style={{ fontWeight:600, color:"var(--navy)", cursor:"pointer", fontSize:"0.9375rem" }}>Active (visible on site)</label>
          </div>
        </div>

        <div style={{ display:"flex", gap:"0.75rem", marginTop:"1.75rem" }}>
          <button className="btn-red" onClick={()=>onSave(form)} disabled={saving||!form.title} style={{ padding:"0.875rem 1.75rem" }}>
            {saving ? "Saving…" : "Save Banner"}
          </button>
          <button className="btn-secondary" onClick={onClose} style={{ padding:"0.875rem 1.5rem" }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default function BannersAdminPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [modalBanner, setModalBanner] = useState<Partial<Banner> | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success"|"error" } | null>(null);

  const showToast = (msg: string, type: "success"|"error" = "success") => {
    setToast({ msg, type });
    setTimeout(()=>setToast(null), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/admin/banners");
      const json = await res.json();
      setBanners(json.banners ?? []);
    } catch { showToast("Failed to load banners", "error"); }
    finally  { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const persist = async (updated: Banner[]) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/banners", {
        method:"PUT", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ banners: updated }),
      });
      if (!res.ok) throw new Error();
      setBanners(updated);
      showToast("Banners saved ✓");
    } catch { showToast("Failed to save", "error"); }
    finally  { setSaving(false); }
  };

  const handleSave = async (form: Partial<Banner>) => {
    const entry: Banner = {
      id:        form.id ?? `b${Date.now()}`,
      title:     form.title ?? "",
      subtitle:  form.subtitle ?? "",
      ctaLabel:  form.ctaLabel ?? "",
      ctaHref:   form.ctaHref ?? "",
      placement: form.placement ?? "homepage_hero",
      bgColor:   form.bgColor ?? "#162E5E",
      textColor: form.textColor ?? "#ffffff",
      imageUrl:  form.imageUrl ?? "",
      active:    form.active ?? true,
      startDate: form.startDate ?? "",
      endDate:   form.endDate ?? null,
      priority:  form.priority ?? 1,
    };
    const updated = form.id
      ? banners.map(b => b.id === form.id ? entry : b)
      : [...banners, entry];
    await persist(updated);
    setModalBanner(null);
  };

  const toggle = (id: string) => {
    const updated = banners.map(b => b.id===id ? { ...b, active:!b.active } : b);
    persist(updated);
  };

  const remove = (id: string) => {
    if (!confirm("Delete this banner?")) return;
    persist(banners.filter(b => b.id !== id));
  };

  const duplicate = (b: Banner) => {
    const copy = { ...b, id: `b${Date.now()}`, title: b.title+" (copy)", active: false };
    persist([...banners, copy]);
  };

  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"300px", color:"var(--gray-400)", flexDirection:"column", gap:"1rem" }}>
      <div style={{ width:"32px", height:"32px", border:"3px solid var(--gray-200)", borderTopColor:"var(--navy)", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      Loading banners…
    </div>
  );

  return (
    <div>
      {toast && <Toast msg={toast.msg} type={toast.type} />}
      {modalBanner && (
        <BannerModal
          banner={modalBanner}
          onClose={()=>setModalBanner(null)}
          onSave={handleSave}
          saving={saving}
        />
      )}

      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"2rem", flexWrap:"wrap", gap:"1rem" }}>
        <div>
          <h1 style={{ fontSize:"1.625rem", fontWeight:800, color:"var(--navy)", marginBottom:"0.25rem" }}>Banners</h1>
          <p style={{ color:"var(--gray-500)", fontSize:"0.875rem" }}>
            {banners.filter(b=>b.active).length} active · {banners.length} total
          </p>
        </div>
        <button className="btn-red" onClick={()=>setModalBanner({...EMPTY})} style={{ padding:"0.75rem 1.5rem" }}>
          + New Banner
        </button>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
        {banners.length===0 && (
          <div className="card" style={{ padding:"3rem", textAlign:"center", color:"var(--gray-400)" }}>
            <div style={{ fontSize:"2.5rem", marginBottom:"0.75rem" }}>📢</div>
            <div style={{ fontWeight:600, marginBottom:"0.375rem" }}>No banners yet</div>
            <div style={{ fontSize:"0.875rem" }}>Click &quot;+ New Banner&quot; to create one.</div>
          </div>
        )}
        {banners.map(b => (
          <div key={b.id} className="card" style={{ overflow:"hidden" }}>
            {/* Preview */}
            <div style={{ background: b.imageUrl ? `url(${b.imageUrl}) center/cover` : b.bgColor, padding:"1.25rem 1.5rem", display:"flex", alignItems:"center", gap:"1rem", flexWrap:"wrap", position:"relative" }}>
              {b.imageUrl && <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.45)" }} />}
              <div style={{ flex:1, position:"relative", zIndex:1 }}>
                <div style={{ fontWeight:800, color: b.textColor??"white", fontSize:"1.0625rem" }}>{b.title}</div>
                {b.subtitle && <div style={{ color: b.textColor ? b.textColor+"bb" : "rgba(255,255,255,0.7)", fontSize:"0.875rem", marginTop:"0.25rem" }}>{b.subtitle}</div>}
              </div>
              {b.ctaLabel && (
                <div style={{ background:"white", color:b.bgColor, padding:"0.5rem 1.25rem", borderRadius:"var(--radius-sm)", fontWeight:700, fontSize:"0.875rem", flexShrink:0, position:"relative", zIndex:1 }}>
                  {b.ctaLabel}
                </div>
              )}
            </div>

            {/* Controls */}
            <div style={{ padding:"0.875rem 1.25rem", display:"flex", alignItems:"center", gap:"0.75rem", flexWrap:"wrap", background:"var(--gray-50)", borderTop:"1px solid var(--gray-100)" }}>
              <span style={{ background:"rgba(22,46,94,0.08)", color:"var(--navy)", padding:"0.2rem 0.625rem", borderRadius:"999px", fontSize:"0.75rem", fontWeight:700 }}>
                {PLACEMENTS[b.placement]}
              </span>
              <span style={{ fontSize:"0.8125rem", color:"var(--gray-400)" }}>
                Priority {b.priority} · {b.startDate||"no start"}{b.endDate ? ` → ${b.endDate}` : " (no expiry)"}
              </span>

              <div style={{ marginLeft:"auto", display:"flex", gap:"0.5rem", flexWrap:"wrap" }}>
                <button onClick={()=>toggle(b.id)} disabled={saving} style={{ padding:"0.375rem 0.75rem", border:"none", borderRadius:"999px", cursor:"pointer", fontFamily:"inherit", fontSize:"0.75rem", fontWeight:700, background: b.active?"rgba(22,163,74,0.1)":"var(--gray-100)", color: b.active?"#16a34a":"var(--gray-400)" }}>
                  {b.active ? "● Active" : "○ Inactive"}
                </button>
                <button onClick={()=>setModalBanner({...b})} style={{ padding:"0.375rem 0.75rem", background:"var(--navy)", color:"white", border:"none", borderRadius:"var(--radius-xs)", fontSize:"0.75rem", fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
                  Edit
                </button>
                <button onClick={()=>duplicate(b)} style={{ padding:"0.375rem 0.75rem", background:"rgba(22,46,94,0.08)", color:"var(--navy)", border:"none", borderRadius:"var(--radius-xs)", fontSize:"0.75rem", fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
                  Duplicate
                </button>
                <button onClick={()=>remove(b.id)} style={{ padding:"0.375rem 0.75rem", background:"rgba(199,25,26,0.08)", color:"var(--red)", border:"1px solid rgba(199,25,26,0.15)", borderRadius:"var(--radius-xs)", fontSize:"0.75rem", fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
