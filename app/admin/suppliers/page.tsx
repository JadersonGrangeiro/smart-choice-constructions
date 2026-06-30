"use client";
import { useState, useEffect, useCallback } from "react";
import { SUPPLIER_CATEGORIES } from "@/lib/supplier-data";

interface Supplier {
  id: string;
  company_name: string;
  category: string;
  sub_category: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  description: string | null;
  state_code: string | null;
  city: string | null;
  address: string | null;
  logo_url: string | null;
  is_featured: boolean;
  status: string;
  created_at: string;
}

const EMPTY_FORM = {
  company_name: "", category: "", sub_category: "", email: "",
  phone: "", website: "", description: "", state_code: "", city: "",
  address: "", logo_url: "", is_featured: false,
};

function categoryIcon(cat: string) {
  return SUPPLIER_CATEGORIES.find(c => c.name === cat || c.id === cat)?.icon ?? "🏢";
}

/* ── Edit Supplier Modal ─────────────────────────────────────────── */
function EditSupplierModal({ supplier, onClose, onSaved }: { supplier: Supplier; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    company_name: supplier.company_name ?? "",
    category:     supplier.category ?? "",
    sub_category: supplier.sub_category ?? "",
    email:        supplier.email ?? "",
    phone:        supplier.phone ?? "",
    website:      supplier.website ?? "",
    description:  supplier.description ?? "",
    state_code:   supplier.state_code ?? "",
    city:         supplier.city ?? "",
    address:      supplier.address ?? "",
    logo_url:     supplier.logo_url ?? "",
    is_featured:  supplier.is_featured,
  });
  const [saving, setSaving]           = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [toast, setToast]             = useState<{ msg: string; ok: boolean } | null>(null);

  const showMsg = (msg: string, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3000); };

  const handleLogoUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) { showMsg("Somente imagens são permitidas", false); return; }
    setUploadingLogo(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("bucket", "supplier-logos");
      fd.append("folder", supplier.id);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error((await res.json()).error ?? "Upload falhou");
      const { url } = await res.json();
      setForm(p => ({ ...p, logo_url: url }));
      showMsg("Logo enviado com sucesso!");
    } catch (e: unknown) {
      showMsg(e instanceof Error ? e.message : "Falha no upload", false);
    } finally { setUploadingLogo(false); }
  };

  const handleSave = async () => {
    if (!form.company_name.trim() || !form.category) { showMsg("Nome e categoria são obrigatórios", false); return; }
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/suppliers/${supplier.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      showMsg("Salvo com sucesso!");
      setTimeout(() => { onSaved(); onClose(); }, 800);
    } catch { showMsg("Falha ao salvar", false); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
      <div style={{ background: "white", borderRadius: "var(--radius-xl)", padding: "2rem", width: "100%", maxWidth: "640px", maxHeight: "92vh", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <h3 style={{ fontWeight: 800, color: "var(--navy)", fontSize: "1.25rem" }}>Editar Supplier</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.5rem", color: "var(--gray-400)", lineHeight: 1 }}>×</button>
        </div>

        {/* Logo upload */}
        <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", marginBottom: "1.25rem", padding: "1rem", background: "var(--gray-50)", borderRadius: "var(--radius)", border: "1px solid var(--gray-150)" }}>
          {/* Preview */}
          <div style={{ width: "80px", height: "80px", borderRadius: "var(--radius)", border: "2px dashed var(--gray-200)", overflow: "hidden", background: "white", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.25rem", position: "relative" }}>
            {form.logo_url
              ? <img src={form.logo_url} alt="logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
              : <span>{categoryIcon(form.category) || "🏢"}</span>}
            {uploadingLogo && (
              <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.8)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: "20px", height: "20px", border: "3px solid var(--gray-200)", borderTopColor: "var(--navy)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              </div>
            )}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: "var(--navy)", fontSize: "0.875rem", marginBottom: "0.625rem" }}>Logo da Empresa</div>

            {/* File upload button */}
            <label style={{ display: "inline-block", cursor: "pointer", marginBottom: "0.625rem" }}>
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                disabled={uploadingLogo}
                onChange={e => { const f = e.target.files?.[0]; if (f) handleLogoUpload(f); e.target.value = ""; }}
              />
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", padding: "0.5rem 1rem", background: "var(--navy)", color: "white", borderRadius: "var(--radius-sm)", fontWeight: 700, fontSize: "0.8125rem", opacity: uploadingLogo ? 0.6 : 1 }}>
                📤 {uploadingLogo ? "Enviando…" : "Upload do Computador"}
              </span>
            </label>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <div style={{ flex: 1, height: "1px", background: "var(--gray-200)" }} />
              <span style={{ fontSize: "0.7rem", color: "var(--gray-400)", fontWeight: 600 }}>ou URL</span>
              <div style={{ flex: 1, height: "1px", background: "var(--gray-200)" }} />
            </div>

            <input
              className="form-input"
              placeholder="https://exemplo.com/logo.png"
              value={form.logo_url}
              onChange={e => setForm(p => ({ ...p, logo_url: e.target.value }))}
              style={{ fontSize: "0.8125rem" }}
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div style={{ gridColumn: "1/-1" }}>
            <label className="form-label">Nome da Empresa *</label>
            <input className="form-input" value={form.company_name} onChange={e => setForm(p => ({ ...p, company_name: e.target.value }))} />
          </div>
          <div>
            <label className="form-label">Categoria *</label>
            <select className="form-select" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
              <option value="">Selecionar…</option>
              {SUPPLIER_CATEGORIES.map(c => <option key={c.id} value={c.name}>{c.icon} {c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Sub-Categoria</label>
            <input className="form-input" value={form.sub_category} onChange={e => setForm(p => ({ ...p, sub_category: e.target.value }))} />
          </div>
          <div>
            <label className="form-label">Email</label>
            <input className="form-input" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
          </div>
          <div>
            <label className="form-label">Telefone</label>
            <input className="form-input" type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
          </div>
          <div>
            <label className="form-label">Website</label>
            <input className="form-input" type="url" placeholder="https://" value={form.website} onChange={e => setForm(p => ({ ...p, website: e.target.value }))} />
          </div>
          <div>
            <label className="form-label">Cidade</label>
            <input className="form-input" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} />
          </div>
          <div>
            <label className="form-label">Estado</label>
            <input className="form-input" placeholder="TX" maxLength={2} value={form.state_code} onChange={e => setForm(p => ({ ...p, state_code: e.target.value.toUpperCase() }))} />
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <label className="form-label">Endereço</label>
            <input className="form-input" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <label className="form-label">Descrição</label>
            <textarea className="form-input" rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} style={{ resize: "vertical" }} />
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontWeight: 600, fontSize: "0.9rem", color: "var(--gray-700)" }}>
              <input type="checkbox" checked={form.is_featured} onChange={e => setForm(p => ({ ...p, is_featured: e.target.checked }))} style={{ accentColor: "var(--navy)", width: "16px", height: "16px" }} />
              Destacado na homepage (⭐ Featured)
            </label>
          </div>
        </div>

        {toast && (
          <div style={{ marginTop: "1rem", padding: "0.75rem 1rem", background: toast.ok ? "rgba(22,163,74,0.1)" : "rgba(199,25,26,0.1)", color: toast.ok ? "#16a34a" : "var(--red)", borderRadius: "var(--radius-sm)", fontWeight: 600, fontSize: "0.875rem" }}>
            {toast.msg}
          </div>
        )}

        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
          <button className="btn-red" onClick={handleSave} disabled={saving} style={{ flex: 2 }}>
            {saving ? "Salvando…" : "Salvar Alterações"}
          </button>
          <button className="btn-secondary" onClick={onClose} style={{ flex: 1 }}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

export default function SuppliersAdminPage() {
  const [tab,      setTab]      = useState<"active"|"suspended">("active");
  const [search,   setSearch]   = useState("");
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [total,    setTotal]    = useState(0);
  const [loading,  setLoading]  = useState(true);
  const [toast,    setToast]    = useState<{ msg: string; type: "ok"|"err" } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [saving,   setSaving]   = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Supplier | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const showToast = (msg: string, type: "ok"|"err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const sp = new URLSearchParams({ status: tab, limit: "100" });
      if (search) sp.set("q", search);
      const res  = await fetch(`/api/admin/suppliers?${sp}`);
      const json = await res.json();
      setSuppliers(json.suppliers ?? []);
      setTotal(json.total ?? 0);
    } catch {
      showToast("Failed to load suppliers", "err");
    } finally {
      setLoading(false);
    }
  }, [tab, search]);

  useEffect(() => {
    const t = setTimeout(() => load(), search ? 350 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

  const handleCreate = async () => {
    if (!form.company_name.trim() || !form.category) {
      showToast("Company name and category are required", "err"); return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      showToast("Supplier added successfully");
      setShowForm(false);
      setForm(EMPTY_FORM);
      load();
    } catch (e: any) {
      showToast(e.message ?? "Failed to add supplier", "err");
    } finally {
      setSaving(false);
    }
  };

  const patchStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/admin/suppliers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      showToast(`Supplier ${status === "active" ? "restored" : "suspended"}`);
      load();
    } catch { showToast("Action failed", "err"); }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/admin/suppliers/${id}`, { method: "DELETE" });
      showToast("Supplier deleted");
      setDeleteConfirm(null);
      load();
    } catch { showToast("Delete failed", "err"); }
  };

  return (
    <div>
      {editingSupplier && (
        <EditSupplierModal
          supplier={editingSupplier}
          onClose={() => setEditingSupplier(null)}
          onSaved={() => { setEditingSupplier(null); load(); }}
        />
      )}

      {toast && (
        <div style={{ position: "fixed", top: "1.5rem", right: "1.5rem", zIndex: 999, background: toast.type === "ok" ? "#16a34a" : "var(--red)", color: "white", padding: "0.875rem 1.5rem", borderRadius: "var(--radius)", fontWeight: 600, boxShadow: "var(--shadow-lg)" }}>
          {toast.msg}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.625rem", fontWeight: 800, color: "var(--navy)", marginBottom: "0.25rem" }}>Local Suppliers</h1>
          <p style={{ color: "var(--gray-500)", fontSize: "0.875rem" }}>
            {loading ? "Loading…" : `${total} ${tab} supplier${total !== 1 ? "s" : ""}`}
          </p>
        </div>
        <button className="btn-red" style={{ padding: "0.625rem 1.5rem", fontSize: "0.875rem" }} onClick={() => setShowForm(true)}>
          + Add Supplier
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0", marginBottom: "1.5rem", background: "white", borderRadius: "var(--radius)", border: "1px solid var(--gray-150)", overflow: "hidden" }}>
        {([["active","Active"],["suspended","Suspended"]] as const).map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            flex: 1, padding: "0.875rem",
            background: tab === k ? "var(--navy)" : "transparent",
            color: tab === k ? "white" : "var(--gray-600)",
            border: "none", cursor: "pointer", fontFamily: "inherit",
            fontWeight: tab === k ? 700 : 500, fontSize: "0.9rem",
          }}>
            {l}
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: "1.25rem" }}>
        <div style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        </div>
        <input placeholder="Search by name, category, or city…" value={search} onChange={e => setSearch(e.target.value)} className="form-input" style={{ paddingLeft: "2.75rem" }} />
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--gray-400)" }}>Loading…</div>
        ) : suppliers.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--gray-400)" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🏢</div>
            <div style={{ fontWeight: 600, color: "var(--gray-600)", marginBottom: "0.5rem" }}>No {tab} suppliers yet</div>
            <p style={{ fontSize: "0.875rem" }}>Click "+ Add Supplier" to add the first one.</p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--gray-50)", borderBottom: "1px solid var(--gray-150)" }}>
                {["Name","Category","Location","Featured","Actions"].map(h => (
                  <th key={h} style={{ padding: "0.875rem 1.25rem", textAlign: "left", fontSize: "0.8125rem", fontWeight: 700, color: "var(--gray-500)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s, i) => (
                <tr key={s.id} style={{ borderBottom: i < suppliers.length - 1 ? "1px solid var(--gray-50)" : "none" }}>
                  <td style={{ padding: "1rem 1.25rem" }}>
                    <div style={{ fontWeight: 700, color: "var(--navy)", fontSize: "0.875rem" }}>{s.company_name}</div>
                    {s.email && <div style={{ fontSize: "0.75rem", color: "var(--gray-400)" }}>{s.email}</div>}
                  </td>
                  <td style={{ padding: "1rem 1.25rem", fontSize: "0.875rem", color: "var(--gray-600)" }}>
                    {categoryIcon(s.category)} {s.category}
                    {s.sub_category && <div style={{ fontSize: "0.75rem", color: "var(--gray-400)" }}>{s.sub_category}</div>}
                  </td>
                  <td style={{ padding: "1rem 1.25rem", fontSize: "0.875rem", color: "var(--gray-600)" }}>
                    {[s.city, s.state_code].filter(Boolean).join(", ") || "—"}
                  </td>
                  <td style={{ padding: "1rem 1.25rem", textAlign: "center" }}>
                    {s.is_featured
                      ? <span style={{ color: "#f59e0b", fontWeight: 700, fontSize: "0.875rem" }}>⭐ Yes</span>
                      : <span style={{ color: "var(--gray-300)", fontSize: "0.875rem" }}>—</span>}
                  </td>
                  <td style={{ padding: "1rem 1.25rem" }}>
                    <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap" }}>
                      <button onClick={() => setEditingSupplier(s)}
                        style={{ padding: "0.375rem 0.625rem", background: "white", color: "var(--navy)", border: "1px solid var(--gray-200)", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                        Edit
                      </button>
                      {s.status === "active" ? (
                        <button onClick={() => patchStatus(s.id, "suspended")}
                          style={{ padding: "0.375rem 0.625rem", background: "rgba(245,158,11,0.1)", color: "#d97706", border: "none", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                          Suspend
                        </button>
                      ) : (
                        <button onClick={() => patchStatus(s.id, "active")}
                          style={{ padding: "0.375rem 0.625rem", background: "rgba(22,163,74,0.1)", color: "#16a34a", border: "none", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                          Restore
                        </button>
                      )}
                      <button
                        onClick={() => fetch(`/api/admin/suppliers/${s.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ is_featured: !s.is_featured }) }).then(() => { showToast(s.is_featured ? "Removed from featured" : "Marked as featured"); load(); })}
                        style={{ padding: "0.375rem 0.625rem", background: "var(--gray-100)", color: "var(--gray-700)", border: "none", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                        {s.is_featured ? "Unfeature" : "Feature"}
                      </button>
                      <button onClick={() => setDeleteConfirm(s)}
                        style={{ padding: "0.375rem 0.625rem", background: "rgba(199,25,26,0.06)", color: "var(--red)", border: "1px solid rgba(199,25,26,0.15)", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Supplier Modal */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem", overflowY: "auto" }}>
          <div style={{ background: "white", borderRadius: "var(--radius-xl)", padding: "2rem", maxWidth: "580px", width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
            <h3 style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "1.5rem", fontSize: "1.25rem" }}>Add New Supplier</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              {[
                { label: "Company Name *", key: "company_name", full: true },
                { label: "Category *", key: "category", type: "select" },
                { label: "Sub-Category", key: "sub_category" },
                { label: "Email", key: "email", type: "email" },
                { label: "Phone", key: "phone" },
                { label: "Website", key: "website" },
                { label: "City", key: "city" },
                { label: "State Code", key: "state_code", placeholder: "TX" },
              ].map(f => (
                <div key={f.key} style={{ gridColumn: f.full ? "1 / -1" : "auto" }}>
                  <label className="form-label">{f.label}</label>
                  {f.type === "select" ? (
                    <select className="form-select" value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}>
                      <option value="">Select category…</option>
                      {SUPPLIER_CATEGORIES.map(c => <option key={c.id} value={c.name}>{c.icon} {c.name}</option>)}
                    </select>
                  ) : (
                    <input
                      className="form-input"
                      type={f.type ?? "text"}
                      placeholder={f.placeholder ?? ""}
                      value={(form as any)[f.key]}
                      onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    />
                  )}
                </div>
              ))}
              <div style={{ gridColumn: "1 / -1" }}>
                <label className="form-label">Description</label>
                <textarea className="form-input" rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} style={{ resize: "vertical" }} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.625rem", cursor: "pointer" }}>
                  <input type="checkbox" checked={form.is_featured} onChange={e => setForm(p => ({ ...p, is_featured: e.target.checked }))} style={{ accentColor: "var(--navy)", width: "16px", height: "16px" }} />
                  <span style={{ fontSize: "0.9375rem", color: "var(--gray-700)", fontWeight: 500 }}>Mark as featured (shown on homepage)</span>
                </label>
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
              <button className="btn-secondary" onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }} style={{ flex: 1 }}>Cancel</button>
              <button onClick={handleCreate} disabled={saving}
                style={{ flex: 2, padding: "0.875rem", background: "var(--red)", color: "white", border: "none", borderRadius: "var(--radius)", fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: saving ? 0.7 : 1 }}>
                {saving ? "Saving…" : "Add Supplier"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 600, display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
          <div style={{ background: "white", borderRadius: "var(--radius-xl)", padding: "2rem", maxWidth: "400px", width: "100%" }}>
            <h3 style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "0.75rem" }}>Delete supplier?</h3>
            <p style={{ color: "var(--gray-500)", marginBottom: "1.5rem", lineHeight: 1.65 }}>
              This will permanently remove <strong>{deleteConfirm.company_name}</strong> from the platform.
            </p>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button className="btn-secondary" onClick={() => setDeleteConfirm(null)} style={{ flex: 1 }}>Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm.id)}
                style={{ flex: 2, padding: "0.875rem", background: "var(--red)", color: "white", border: "none", borderRadius: "var(--radius)", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
