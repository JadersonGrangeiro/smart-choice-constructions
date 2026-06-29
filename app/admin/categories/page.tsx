"use client";
import { useState } from "react";
import { CATEGORIES } from "@/lib/data";

export default function CategoriesAdminPage() {
  const [cats, setCats] = useState(CATEGORIES.map((c, i) => ({ ...c, active: true, order: i + 1, listings: Math.floor(Math.random() * 45) + 3 })));
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newCat, setNewCat] = useState({ name: "", icon: "🔧", id: "" });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = cats.filter(c =>
    search === "" || c.name.toLowerCase().includes(search.toLowerCase()) || c.id.includes(search.toLowerCase())
  );

  const toggle = (id: string) => setCats(prev => prev.map(c => c.id === id ? { ...c, active: !c.active } : c));

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.625rem", fontWeight: 800, color: "var(--navy)", marginBottom: "0.25rem" }}>Service Categories</h1>
          <p style={{ color: "var(--gray-500)", fontSize: "0.875rem" }}>{cats.filter(c => c.active).length} active · {cats.filter(c => !c.active).length} hidden</p>
        </div>
        <button className="btn-red" onClick={() => setShowNew(true)} style={{ padding: "0.75rem 1.5rem" }}>
          + Add Category
        </button>
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: "1.25rem" }}>
        <div style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        </div>
        <input placeholder="Search categories..." value={search} onChange={e => setSearch(e.target.value)} className="form-input" style={{ paddingLeft: "2.75rem" }} />
      </div>

      {/* New category form */}
      {showNew && (
        <div className="card" style={{ padding: "1.5rem", marginBottom: "1.25rem", border: "2px solid var(--navy)" }}>
          <h3 style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "1.25rem" }}>Add New Category</h3>
          <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 1fr", gap: "1rem", alignItems: "flex-end" }}>
            <div>
              <label className="form-label">Icon</label>
              <input className="form-input" value={newCat.icon} onChange={e => setNewCat(p => ({ ...p, icon: e.target.value }))} style={{ textAlign: "center", fontSize: "1.5rem" }} />
            </div>
            <div>
              <label className="form-label">Name *</label>
              <input className="form-input" placeholder="e.g. Solar Panel Installation" value={newCat.name}
                onChange={e => setNewCat(p => ({ ...p, name: e.target.value, id: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-") }))} />
            </div>
            <div>
              <label className="form-label">URL Slug *</label>
              <input className="form-input" value={newCat.id} onChange={e => setNewCat(p => ({ ...p, id: e.target.value }))} style={{ fontFamily: "monospace" }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
            <button className="btn-red" onClick={() => {
              if (!newCat.name || !newCat.id) return;
              setCats(prev => [...prev, { ...newCat, color: "#162E5E", active: true, order: prev.length + 1, listings: 0 }]);
              setNewCat({ name: "", icon: "🔧", id: "" });
              setShowNew(false);
            }}>Save Category</button>
            <button className="btn-secondary" onClick={() => setShowNew(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--gray-50)", borderBottom: "1px solid var(--gray-150)" }}>
              {["#","Icon","Name","Slug","Listings","Status","Actions"].map(h => (
                <th key={h} style={{ padding: "0.875rem 1.25rem", textAlign: "left", fontSize: "0.8125rem", fontWeight: 700, color: "var(--gray-500)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((cat, i) => (
              <tr key={cat.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--gray-50)" : "none" }}>
                <td style={{ padding: "0.875rem 1.25rem", color: "var(--gray-400)", fontSize: "0.875rem", width: "40px" }}>{cat.order}</td>
                <td style={{ padding: "0.875rem 1.25rem", fontSize: "1.5rem" }}>{cat.icon}</td>
                <td style={{ padding: "0.875rem 1.25rem" }}>
                  {editing === cat.id ? (
                    <input className="form-input" defaultValue={cat.name} style={{ fontSize: "0.875rem" }}
                      onBlur={e => { setCats(p => p.map(c => c.id === cat.id ? { ...c, name: e.target.value } : c)); setEditing(null); }}
                      autoFocus />
                  ) : (
                    <span style={{ fontWeight: 600, color: "var(--navy)", fontSize: "0.9375rem" }}>{cat.name}</span>
                  )}
                </td>
                <td style={{ padding: "0.875rem 1.25rem" }}>
                  <code style={{ background: "var(--gray-100)", padding: "2px 8px", borderRadius: "4px", fontSize: "0.8125rem", color: "var(--gray-600)" }}>{cat.id}</code>
                </td>
                <td style={{ padding: "0.875rem 1.25rem", fontSize: "0.875rem", color: "var(--gray-600)" }}>{cat.listings}</td>
                <td style={{ padding: "0.875rem 1.25rem" }}>
                  <button onClick={() => toggle(cat.id)} style={{
                    padding: "0.25rem 0.75rem", borderRadius: "999px", border: "none", cursor: "pointer",
                    fontFamily: "inherit", fontSize: "0.75rem", fontWeight: 700,
                    background: cat.active ? "rgba(22,163,74,0.1)" : "var(--gray-100)",
                    color: cat.active ? "#16a34a" : "var(--gray-400)",
                  }}>
                    {cat.active ? "Active" : "Hidden"}
                  </button>
                </td>
                <td style={{ padding: "0.875rem 1.25rem" }}>
                  <div style={{ display: "flex", gap: "0.375rem" }}>
                    <button onClick={() => setEditing(cat.id)} style={{ padding: "0.375rem 0.75rem", background: "var(--gray-100)", border: "none", borderRadius: "var(--radius-xs)", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", color: "var(--gray-700)", fontFamily: "inherit" }}>
                      Edit
                    </button>
                    <button onClick={() => setDeleteConfirm(cat.id)} style={{ padding: "0.375rem 0.75rem", background: "rgba(200,16,46,0.06)", color: "var(--red)", border: "1px solid rgba(200,16,46,0.15)", borderRadius: "var(--radius-xs)", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: "0.8125rem", color: "var(--gray-400)", marginTop: "0.875rem" }}>
        Tip: Hiding a category removes it from search filters and the homepage grid but preserves all existing contractor listings.
      </p>

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
          <div style={{ background: "white", borderRadius: "var(--radius-xl)", padding: "2rem", maxWidth: "400px", width: "100%" }}>
            <h3 style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "0.75rem" }}>Delete category?</h3>
            <p style={{ color: "var(--gray-500)", marginBottom: "1.5rem", lineHeight: 1.65 }}>
              Deleting <strong>{cats.find(c => c.id === deleteConfirm)?.name}</strong> removes it from all search filters and location pages. Contractor profiles with this category will show an uncategorized status until reassigned.
            </p>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button className="btn-secondary" onClick={() => setDeleteConfirm(null)} style={{ flex: 1 }}>Cancel</button>
              <button onClick={() => { setCats(p => p.filter(c => c.id !== deleteConfirm)); setDeleteConfirm(null); }}
                style={{ flex: 2, padding: "0.875rem", background: "var(--red)", color: "white", border: "none", borderRadius: "var(--radius)", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                Delete Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
