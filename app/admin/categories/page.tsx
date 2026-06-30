"use client";
import { useState, useEffect, useCallback } from "react";
import { CATEGORIES } from "@/lib/data";

interface Category {
  id: string; name: string; icon: string; color: string;
  description?: string; order: number; active: boolean;
  listings?: number; source?: "static" | "dynamic";
}

const EMPTY: Partial<Category> = { icon: "🔧", color: "#162E5E", active: true, order: 99 };

function Toast({ msg }: { msg: string }) {
  return (
    <div style={{ position:"fixed", bottom:"1.5rem", right:"1.5rem", zIndex:9999, background:"var(--navy)", color:"white", padding:"0.875rem 1.5rem", borderRadius:"var(--radius)", fontWeight:600, fontSize:"0.9rem", boxShadow:"var(--shadow-lg)" }}>{msg}</div>
  );
}

export default function CategoriesAdminPage() {
  const [cats, setCats]     = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm]     = useState<Partial<Category>>(EMPTY);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast]   = useState<string | null>(null);

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(null), 3000); };

  const staticCats: Category[] = CATEGORIES.map((c, i) => ({
    id: c.id, name: c.name, icon: c.icon, color: c.color,
    order: i, active: true, source: "static" as const, listings: 0,
  }));

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/platform-data?key=categories_override");
      const json = await res.json();
      const overrides: Category[] = (json.value ?? []).map((c: Category) => ({ ...c, source: "dynamic" as const }));
      const overrideMap = new Map(overrides.map(c => [c.id, c]));
      const merged = staticCats.map(c => overrideMap.get(c.id) ?? c);
      const newCats = overrides.filter(c => !staticCats.some(s => s.id === c.id));
      merged.sort((a, b) => a.order - b.order);
      setCats([...merged, ...newCats]);
    } finally { setLoading(false); }
  }, []); // eslint-disable-line

  useEffect(() => { load(); }, [load]);

  const persist = async (updated: Category[]) => {
    await fetch("/api/admin/platform-data", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "categories_override", value: updated }),
    });
  };

  const save = async () => {
    if (!form.name || !form.icon) { showToast("Name and icon required"); return; }
    setSaving(true);
    try {
      const res0 = await fetch("/api/admin/platform-data?key=categories_override");
      const j0 = await res0.json();
      const existing: Category[] = j0.value ?? [];
      const slug = form.id ?? form.name!.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      const entry: Category = {
        id: slug, name: form.name!, icon: form.icon!, color: form.color ?? "#162E5E",
        description: form.description, order: form.order ?? 99,
        active: form.active ?? true, source: "dynamic",
      };
      const updated = editing
        ? existing.map(c => c.id === editing.id ? entry : c)
        : [...existing, entry];
      await persist(updated);
      showToast(editing ? "Category updated!" : "Category created!");
      setShowModal(false); setEditing(null); setForm(EMPTY);
      load();
    } catch { showToast("Save failed"); }
    finally { setSaving(false); }
  };

  const toggle = async (cat: Category) => {
    const res0 = await fetch("/api/admin/platform-data?key=categories_override");
    const j0 = await res0.json();
    const existing: Category[] = j0.value ?? [];
    const entry: Category = { ...cat, active: !cat.active, source: "dynamic" };
    const updated = existing.some(c => c.id === cat.id)
      ? existing.map(c => c.id === cat.id ? entry : c)
      : [...existing, entry];
    await persist(updated);
    showToast(cat.active ? "Category hidden" : "Category visible");
    load();
  };

  const deleteCategory = async (id: string) => {
    const res0 = await fetch("/api/admin/platform-data?key=categories_override");
    const j0 = await res0.json();
    const existing: Category[] = j0.value ?? [];
    await persist(existing.filter(c => c.id !== id));
    showToast("Category deleted");
    setDeleteConfirm(null);
    load();
  };

  const openEdit = (cat: Category) => { setForm({ ...cat }); setEditing(cat); setShowModal(true); };
  const openNew  = () => { setForm({ ...EMPTY, order: cats.length + 1 }); setEditing(null); setShowModal(true); };

  const filtered = cats.filter(c =>
    search === "" || c.name.toLowerCase().includes(search.toLowerCase()) || c.id.includes(search.toLowerCase())
  );

  return (
    <div>
      {toast && <Toast msg={toast} />}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.625rem", fontWeight: 800, color: "var(--navy)", marginBottom: "0.25rem" }}>Service Categories</h1>
          <p style={{ color: "var(--gray-500)", fontSize: "0.875rem" }}>
            {loading ? "Loading…" : `${cats.filter(c => c.active).length} active · ${cats.filter(c => !c.active).length} hidden`}
          </p>
        </div>
        <button className="btn-red" onClick={openNew} style={{ padding: "0.75rem 1.5rem" }}>+ Add Category</button>
      </div>

      <div style={{ position: "relative", marginBottom: "1.25rem" }}>
        <div style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        </div>
        <input placeholder="Search categories..." value={search} onChange={e => setSearch(e.target.value)} className="form-input" style={{ paddingLeft: "2.75rem" }} />
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--gray-50)", borderBottom: "1px solid var(--gray-150)" }}>
              {["#","Icon","Name","Slug","Status","Source","Actions"].map(h => (
                <th key={h} style={{ padding: "0.875rem 1rem", textAlign: "left", fontSize: "0.8125rem", fontWeight: 700, color: "var(--gray-500)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: "2rem", textAlign: "center", color: "var(--gray-400)" }}>Loading…</td></tr>
            ) : filtered.map((cat, i) => (
              <tr key={cat.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--gray-50)" : "none", opacity: cat.active ? 1 : 0.5 }}>
                <td style={{ padding: "0.875rem 1rem", color: "var(--gray-400)", fontSize: "0.875rem", width: "40px" }}>{cat.order}</td>
                <td style={{ padding: "0.875rem 1rem", fontSize: "1.5rem" }}>{cat.icon}</td>
                <td style={{ padding: "0.875rem 1rem", fontWeight: 600, color: "var(--navy)", fontSize: "0.9375rem" }}>{cat.name}</td>
                <td style={{ padding: "0.875rem 1rem" }}>
                  <code style={{ background: "var(--gray-100)", padding: "2px 8px", borderRadius: "4px", fontSize: "0.8125rem", color: "var(--gray-600)" }}>{cat.id}</code>
                </td>
                <td style={{ padding: "0.875rem 1rem" }}>
                  <button onClick={() => toggle(cat)} style={{
                    padding: "0.25rem 0.75rem", borderRadius: "999px", border: "none", cursor: "pointer",
                    fontFamily: "inherit", fontSize: "0.75rem", fontWeight: 700,
                    background: cat.active ? "rgba(22,163,74,0.1)" : "var(--gray-100)",
                    color: cat.active ? "#16a34a" : "var(--gray-400)",
                  }}>{cat.active ? "Active" : "Hidden"}</button>
                </td>
                <td style={{ padding: "0.875rem 1rem" }}>
                  <span style={{ fontSize: "0.7rem", color: "var(--gray-400)", background: "var(--gray-50)", padding: "1px 6px", borderRadius: "4px" }}>
                    {cat.source === "dynamic" ? "custom" : "static"}
                  </span>
                </td>
                <td style={{ padding: "0.875rem 1rem" }}>
                  <div style={{ display: "flex", gap: "0.375rem" }}>
                    <button onClick={() => openEdit(cat)} style={{ padding: "0.375rem 0.625rem", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", color: "#6366f1", fontFamily: "inherit" }}>Edit</button>
                    {cat.source === "dynamic" && (
                      <button onClick={() => setDeleteConfirm(cat.id)} style={{ padding: "0.375rem 0.625rem", background: "rgba(199,25,26,0.06)", color: "var(--red)", border: "1px solid rgba(199,25,26,0.15)", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Delete</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ fontSize: "0.8125rem", color: "var(--gray-400)", marginTop: "0.875rem" }}>
        Hiding a category removes it from search filters and the homepage grid but preserves all contractor listings.
        Static categories (from code) can be hidden but not deleted. Custom categories can be fully deleted.
      </p>

      {/* Edit/Create modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}
          onClick={e => { if (e.target === e.currentTarget) { setShowModal(false); setEditing(null); } }}>
          <div style={{ background: "white", borderRadius: "var(--radius-xl)", padding: "2rem", width: "100%", maxWidth: "560px", boxShadow: "var(--shadow-xl)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
              <h2 style={{ fontWeight: 800, color: "var(--navy)", fontSize: "1.25rem" }}>{editing ? `Edit: ${editing.name}` : "New Category"}</h2>
              <button onClick={() => { setShowModal(false); setEditing(null); }} style={{ background: "none", border: "none", fontSize: "1.375rem", cursor: "pointer", color: "var(--gray-400)", lineHeight: 1 }}>×</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              {[
                { label: "Name *", el: <input className="form-input" value={form.name ?? ""} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Solar Panel Installation" style={{ width: "100%" }} />, span: true },
                { label: "Icon (emoji) *", el: <input className="form-input" value={form.icon ?? ""} onChange={e => setForm(p => ({ ...p, icon: e.target.value }))} placeholder="☀️" style={{ fontSize: "1.25rem", width: "100%" }} /> },
                { label: "Color", el: <input className="form-input" type="color" value={form.color ?? "#162E5E"} onChange={e => setForm(p => ({ ...p, color: e.target.value }))} style={{ height: "42px", padding: "4px 8px", width: "100%" }} /> },
                { label: "Order (lower = first)", el: <input className="form-input" type="number" value={form.order ?? 99} onChange={e => setForm(p => ({ ...p, order: +e.target.value }))} style={{ width: "100%" }} /> },
                { label: "Description", el: <input className="form-input" value={form.description ?? ""} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Brief description" style={{ width: "100%" }} />, span: true },
              ].map(({ label, el, span }) => (
                <div key={label} style={{ gridColumn: span ? "1/-1" : undefined }}>
                  <label style={{ display: "block", fontWeight: 700, color: "var(--gray-700)", fontSize: "0.8125rem", marginBottom: "0.375rem" }}>{label}</label>
                  {el}
                </div>
              ))}
              <div style={{ gridColumn: "1/-1" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                  <input type="checkbox" checked={form.active ?? true} onChange={e => setForm(p => ({ ...p, active: e.target.checked }))} />
                  <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>Active (visible on site)</span>
                </label>
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem", justifyContent: "flex-end" }}>
              <button onClick={() => { setShowModal(false); setEditing(null); }} className="btn-secondary" style={{ padding: "0.75rem 1.5rem" }}>Cancel</button>
              <button onClick={save} disabled={saving} className="btn-red" style={{ padding: "0.75rem 1.75rem" }}>{saving ? "Saving…" : "Save"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
          <div style={{ background: "white", borderRadius: "var(--radius-xl)", padding: "2rem", maxWidth: "400px", width: "100%" }}>
            <h3 style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "0.75rem" }}>Delete category?</h3>
            <p style={{ color: "var(--gray-500)", marginBottom: "1.5rem", lineHeight: 1.65 }}>
              Deleting <strong>{cats.find(c => c.id === deleteConfirm)?.name}</strong> removes it from all search filters and location pages.
            </p>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button className="btn-secondary" onClick={() => setDeleteConfirm(null)} style={{ flex: 1 }}>Cancel</button>
              <button onClick={() => deleteCategory(deleteConfirm)} style={{ flex: 2, padding: "0.875rem", background: "var(--red)", color: "white", border: "none", borderRadius: "var(--radius)", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
