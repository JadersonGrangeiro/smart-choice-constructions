"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface ContractorPhoto { id: string; public_url: string; caption: string; sort_order: number; }

interface ContractorDetail {
  id: string; company_name: string; owner_first_name: string; owner_last_name: string;
  email: string; phone: string; category: string; state_code: string; city: string;
  description: string; website: string; license_number: string; insurance_number: string;
  is_licensed: boolean; is_insured: boolean; years_experience: number; profile_visible: boolean;
  contractor_photos: ContractorPhoto[];
}

const US_STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontWeight: 700, color: "var(--gray-500)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.875rem", marginTop: "0.25rem" }}>{children}</div>;
}

function EditContractorModal({ id, onClose, onSaved }: { id: string; onClose: () => void; onSaved: () => void }) {
  const [data, setData]       = useState<ContractorDetail | null>(null);
  const [form, setForm]       = useState<Partial<ContractorDetail>>({});
  const [photos, setPhotos]   = useState<ContractorPhoto[]>([]);
  const [saving, setSaving]   = useState(false);
  const [photoUrl, setPhotoUrl]         = useState("");
  const [photoCaption, setPhotoCaption] = useState("");
  const [addingPhoto, setAddingPhoto]   = useState(false);
  const [dragOver, setDragOver]         = useState(false);
  const [toast, setToastLocal] = useState<{ msg: string; ok: boolean } | null>(null);

  const showMsg = (msg: string, ok = true) => { setToastLocal({ msg, ok }); setTimeout(() => setToastLocal(null), 3500); };

  const reload = () =>
    fetch(`/api/admin/contractors/${id}`)
      .then(r => r.json())
      .then(j => { setData(j.contractor); setForm(j.contractor ?? {}); setPhotos(j.contractor?.contractor_photos ?? []); });

  useEffect(() => { reload(); }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/contractors/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      showMsg("Salvo com sucesso!");
      setTimeout(() => { onSaved(); onClose(); }, 900);
    } catch { showMsg("Falha ao salvar", false); }
    finally { setSaving(false); }
  };

  const uploadAndAddPhoto = async (file: File) => {
    setAddingPhoto(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("bucket", "contractor-photos");
      fd.append("folder", id);
      const upRes = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (!upRes.ok) throw new Error((await upRes.json()).error ?? "Upload falhou");
      const { url } = await upRes.json();

      const addRes = await fetch(`/api/admin/contractors/${id}/photos`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, caption: photoCaption.trim() || null }),
      });
      if (!addRes.ok) throw new Error();
      const { photo } = await addRes.json();
      setPhotos(p => [...p, photo]);
      setPhotoCaption("");
      showMsg("Foto adicionada!");
    } catch (e: unknown) {
      showMsg(e instanceof Error ? e.message : "Falha ao adicionar foto", false);
    } finally { setAddingPhoto(false); }
  };

  const handleAddPhotoByUrl = async () => {
    if (!photoUrl.trim()) return;
    setAddingPhoto(true);
    try {
      const res = await fetch(`/api/admin/contractors/${id}/photos`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: photoUrl.trim(), caption: photoCaption.trim() || null }),
      });
      if (!res.ok) throw new Error();
      const { photo } = await res.json();
      setPhotos(p => [...p, photo]);
      setPhotoUrl(""); setPhotoCaption("");
      showMsg("Foto adicionada!");
    } catch { showMsg("Falha ao adicionar foto", false); }
    finally { setAddingPhoto(false); }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm("Remover esta foto?")) return;
    try {
      await fetch(`/api/admin/contractors/${id}/photos/${photoId}`, { method: "DELETE" });
      setPhotos(p => p.filter(x => x.id !== photoId));
      showMsg("Foto removida");
    } catch { showMsg("Falha ao remover foto", false); }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) uploadAndAddPhoto(file);
  };

  const f = <K extends keyof ContractorDetail>(key: K) => form[key] as ContractorDetail[K];
  const set = <K extends keyof ContractorDetail>(key: K, val: ContractorDetail[K]) => setForm(p => ({ ...p, [key]: val }));

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
      <div style={{ background: "white", borderRadius: "var(--radius-xl)", padding: "2rem", width: "100%", maxWidth: "700px", maxHeight: "92vh", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <h3 style={{ fontWeight: 800, color: "var(--navy)", fontSize: "1.25rem" }}>Editar Perfil do Contractor</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.5rem", color: "var(--gray-400)", lineHeight: 1 }}>×</button>
        </div>

        {!data ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--gray-400)" }}>
            <div style={{ width: "28px", height: "28px", border: "3px solid var(--gray-200)", borderTopColor: "var(--navy)", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 0.75rem" }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            Carregando…
          </div>
        ) : (
          <>
            {/* ── Business Info ── */}
            <SectionLabel>Informações do Negócio</SectionLabel>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
              <div style={{ gridColumn: "1/-1" }}>
                <label className="form-label">Nome da Empresa</label>
                <input className="form-input" value={f("company_name") ?? ""} onChange={e => set("company_name", e.target.value)} />
              </div>
              <div>
                <label className="form-label">Nome do Proprietário</label>
                <input className="form-input" value={f("owner_first_name") ?? ""} onChange={e => set("owner_first_name", e.target.value)} />
              </div>
              <div>
                <label className="form-label">Sobrenome</label>
                <input className="form-input" value={f("owner_last_name") ?? ""} onChange={e => set("owner_last_name", e.target.value)} />
              </div>
              <div>
                <label className="form-label">Telefone</label>
                <input className="form-input" type="tel" value={f("phone") ?? ""} onChange={e => set("phone", e.target.value)} />
              </div>
              <div>
                <label className="form-label">Website</label>
                <input className="form-input" type="url" placeholder="https://" value={f("website") ?? ""} onChange={e => set("website", e.target.value)} />
              </div>
              <div>
                <label className="form-label">Cidade</label>
                <input className="form-input" value={f("city") ?? ""} onChange={e => set("city", e.target.value)} />
              </div>
              <div>
                <label className="form-label">Estado</label>
                <select className="form-select" value={f("state_code") ?? ""} onChange={e => set("state_code", e.target.value)}>
                  {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Categoria</label>
                <input className="form-input" value={f("category") ?? ""} onChange={e => set("category", e.target.value)} />
              </div>
              <div>
                <label className="form-label">Anos de Experiência</label>
                <input className="form-input" type="number" min={0} max={80} value={f("years_experience") ?? 0} onChange={e => set("years_experience", Number(e.target.value))} />
              </div>
              <div style={{ gridColumn: "1/-1" }}>
                <label className="form-label">Descrição / Bio</label>
                <textarea className="form-input" rows={4} value={f("description") ?? ""} onChange={e => set("description", e.target.value)} style={{ resize: "vertical" }} />
              </div>
            </div>

            {/* ── Credentials ── */}
            <SectionLabel>Credenciais</SectionLabel>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
              <div>
                <label className="form-label">Número da Licença</label>
                <input className="form-input" value={f("license_number") ?? ""} onChange={e => set("license_number", e.target.value)} />
              </div>
              <div>
                <label className="form-label">Número do Seguro</label>
                <input className="form-input" value={f("insurance_number") ?? ""} onChange={e => set("insurance_number", e.target.value)} />
              </div>
              <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", gridColumn: "1/-1", flexWrap: "wrap" }}>
                {[
                  { key: "is_licensed" as const,     label: "Licenciado",        accent: "var(--navy)" },
                  { key: "is_insured" as const,      label: "Segurado",          accent: "var(--navy)" },
                  { key: "profile_visible" as const, label: "Perfil Visível",    accent: "#16a34a" },
                ].map(({ key, label, accent }) => (
                  <label key={key} style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontWeight: 600, fontSize: "0.9rem", color: "var(--gray-700)" }}>
                    <input type="checkbox" checked={!!f(key)} onChange={e => set(key, e.target.checked)} style={{ accentColor: accent, width: "16px", height: "16px" }} />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            {/* ── Photos ── */}
            <SectionLabel>Fotos do Perfil ({photos.length})</SectionLabel>
            <div style={{ marginBottom: "1.25rem" }}>
              {photos.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: "0.625rem", marginBottom: "1rem" }}>
                  {photos.map(ph => (
                    <div key={ph.id} style={{ position: "relative", aspectRatio: "1", background: "var(--gray-100)", borderRadius: "var(--radius-sm)", overflow: "hidden", border: "1px solid var(--gray-150)" }}>
                      {ph.public_url ? (
                        <img src={ph.public_url} alt={ph.caption || "foto"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--gray-400)", fontSize: "0.75rem" }}>Sem URL</div>
                      )}
                      <button
                        onClick={() => handleDeletePhoto(ph.id)}
                        style={{ position: "absolute", top: "4px", right: "4px", width: "22px", height: "22px", borderRadius: "50%", background: "rgba(199,25,26,0.85)", color: "white", border: "none", cursor: "pointer", fontSize: "0.75rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}
                        title="Remover foto"
                      >×</button>
                      {ph.caption && (
                        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,0.55)", color: "white", fontSize: "0.6rem", padding: "2px 4px", textAlign: "center", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{ph.caption}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Upload zone */}
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                style={{ padding: "1.25rem", background: dragOver ? "rgba(22,46,94,0.05)" : "var(--gray-50)", borderRadius: "var(--radius)", border: `2px dashed ${dragOver ? "var(--navy)" : "var(--gray-200)"}`, transition: "all 0.15s" }}
              >
                {/* File picker */}
                <div style={{ textAlign: "center", marginBottom: "1rem" }}>
                  <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📸</div>
                  <div style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "0.25rem", fontSize: "0.9rem" }}>
                    {addingPhoto ? "Enviando…" : "Arraste uma foto aqui"}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--gray-400)", marginBottom: "0.75rem" }}>ou</div>
                  <label style={{ display: "inline-block", cursor: "pointer" }}>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      disabled={addingPhoto}
                      onChange={e => { const f = e.target.files?.[0]; if (f) uploadAndAddPhoto(f); e.target.value = ""; }}
                    />
                    <span style={{ padding: "0.5rem 1.25rem", background: "var(--navy)", color: "white", borderRadius: "var(--radius-sm)", fontWeight: 700, fontSize: "0.875rem", opacity: addingPhoto ? 0.5 : 1, pointerEvents: addingPhoto ? "none" : "auto" }}>
                      {addingPhoto ? "Enviando…" : "Selecionar do Computador"}
                    </span>
                  </label>
                </div>

                {/* Legenda */}
                <input
                  className="form-input"
                  placeholder="Legenda da foto (opcional)"
                  value={photoCaption}
                  onChange={e => setPhotoCaption(e.target.value)}
                  style={{ fontSize: "0.8125rem", marginBottom: "0.75rem" }}
                />

                {/* Separator */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                  <div style={{ flex: 1, height: "1px", background: "var(--gray-200)" }} />
                  <span style={{ fontSize: "0.75rem", color: "var(--gray-400)", fontWeight: 600 }}>ou cole uma URL</span>
                  <div style={{ flex: 1, height: "1px", background: "var(--gray-200)" }} />
                </div>

                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <input
                    className="form-input"
                    placeholder="https://exemplo.com/foto.jpg"
                    value={photoUrl}
                    onChange={e => setPhotoUrl(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") handleAddPhotoByUrl(); }}
                    style={{ flex: 1, fontSize: "0.8125rem" }}
                  />
                  <button
                    onClick={handleAddPhotoByUrl}
                    disabled={addingPhoto || !photoUrl.trim()}
                    style={{ padding: "0 1rem", background: "var(--gray-600)", color: "white", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", fontSize: "0.875rem", opacity: addingPhoto || !photoUrl.trim() ? 0.5 : 1, whiteSpace: "nowrap" }}
                  >
                    + URL
                  </button>
                </div>
                {photoUrl && (
                  <div style={{ marginTop: "0.5rem", width: "64px", height: "64px", borderRadius: "var(--radius-sm)", overflow: "hidden", border: "1px solid var(--gray-200)" }}>
                    <img src={photoUrl} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  </div>
                )}
              </div>
            </div>

            {/* Toast */}
            {toast && (
              <div style={{ marginBottom: "1rem", padding: "0.75rem 1rem", background: toast.ok ? "rgba(22,163,74,0.1)" : "rgba(199,25,26,0.1)", color: toast.ok ? "#16a34a" : "var(--red)", borderRadius: "var(--radius-sm)", fontWeight: 600, fontSize: "0.875rem" }}>
                {toast.msg}
              </div>
            )}

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button className="btn-red" onClick={handleSave} disabled={saving} style={{ flex: 2 }}>
                {saving ? "Salvando…" : "Salvar Alterações"}
              </button>
              <button className="btn-secondary" onClick={onClose} style={{ flex: 1 }}>Cancelar</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

interface Contractor {
  id: string;
  company_name: string;
  owner_first_name: string;
  owner_last_name: string;
  email: string;
  category: string;
  state_code: string;
  city: string;
  status: string;
  is_licensed: boolean;
  is_insured: boolean;
  years_experience: number;
  created_at: string;
  contractor_photos: { id: string }[];
  contractor_subscriptions: { status: string; current_period_end: string | null; failed_payment_count: number }[];
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    active:           { bg: "rgba(22,163,74,0.1)",  color: "#16a34a",        label: "Active" },
    past_due:         { bg: "rgba(245,158,11,0.1)", color: "#d97706",        label: "Past Due" },
    suspended:        { bg: "rgba(199,25,26,0.1)",  color: "var(--red)",     label: "Suspended" },
    canceled:         { bg: "var(--gray-100)",       color: "var(--gray-500)",label: "Canceled" },
    rejected:         { bg: "var(--gray-100)",       color: "var(--gray-500)",label: "Rejected" },
    pending_approval: { bg: "rgba(99,102,241,0.1)", color: "#6366f1",        label: "Pending" },
    pending_payment:  { bg: "rgba(245,158,11,0.1)", color: "#d97706",        label: "Pending Payment" },
  };
  const s = map[status] ?? map.pending_approval;
  return <span style={{ background: s.bg, color: s.color, padding: "0.2rem 0.625rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700 }}>{s.label}</span>;
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function ContractorsAdminPage() {
  const [tab, setTab] = useState<"pending" | "active" | "suspended">("pending");
  const [search, setSearch] = useState("");
  const [pending,   setPending]   = useState<Contractor[]>([]);
  const [active,    setActive]    = useState<Contractor[]>([]);
  const [suspended, setSuspended] = useState<Contractor[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [selected,  setSelected]  = useState<Set<string>>(new Set());
  const [toast,     setToast]     = useState<{ msg: string; type: "ok" | "err" } | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ type: string; ids: string[]; reason?: string } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pendRes, actRes, susRes] = await Promise.all([
        fetch("/api/admin/contractors?status=pending_approval&limit=50"),
        fetch("/api/admin/contractors?status=active&limit=50"),
        fetch("/api/admin/contractors?status=suspended&limit=50"),
      ]);
      const [pendJson, actJson, susJson] = await Promise.all([pendRes.json(), actRes.json(), susRes.json()]);
      setPending(pendJson.contractors ?? []);
      setActive(actJson.contractors ?? []);
      setSuspended(susJson.contractors ?? []);
    } catch {
      showToast("Failed to load contractors", "err");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const patchStatus = async (ids: string[], action: string, reason?: string) => {
    try {
      await Promise.all(ids.map(id =>
        fetch(`/api/admin/contractors/${id}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, reason }),
        })
      ));
      showToast(`${ids.length} contractor${ids.length > 1 ? "s" : ""} ${action}d successfully`);
      setSelected(new Set());
      await load();
    } catch {
      showToast("Action failed — please try again", "err");
    }
  };

  const toggleSelect = (id: string) => {
    const n = new Set(selected);
    n.has(id) ? n.delete(id) : n.add(id);
    setSelected(n);
  };

  const activeFiltered = active.filter(c =>
    search === "" ||
    c.company_name.toLowerCase().includes(search.toLowerCase()) ||
    `${c.owner_first_name} ${c.owner_last_name}`.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {editingId && (
        <EditContractorModal id={editingId} onClose={() => setEditingId(null)} onSaved={load} />
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: "1.5rem", right: "1.5rem", zIndex: 999, background: toast.type === "ok" ? "#16a34a" : "var(--red)", color: "white", padding: "0.875rem 1.5rem", borderRadius: "var(--radius)", fontWeight: 600, fontSize: "0.9rem", boxShadow: "var(--shadow-lg)" }}>
          {toast.msg}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.625rem", fontWeight: 800, color: "var(--navy)", marginBottom: "0.25rem" }}>Contractors</h1>
          <p style={{ color: "var(--gray-500)", fontSize: "0.875rem" }}>Manage registrations, profiles, and account status</p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          {selected.size > 0 && (
            <>
              <button onClick={() => setConfirmAction({ type: "approve", ids: [...selected] })}
                style={{ padding: "0.625rem 1.125rem", background: "rgba(22,163,74,0.1)", color: "#16a34a", border: "1px solid rgba(22,163,74,0.25)", borderRadius: "var(--radius)", fontWeight: 700, fontSize: "0.875rem", cursor: "pointer", fontFamily: "inherit" }}>
                ✓ Approve {selected.size}
              </button>
              <button onClick={() => setConfirmAction({ type: "reject", ids: [...selected] })}
                style={{ padding: "0.625rem 1.125rem", background: "rgba(199,25,26,0.08)", color: "var(--red)", border: "1px solid rgba(199,25,26,0.2)", borderRadius: "var(--radius)", fontWeight: 700, fontSize: "0.875rem", cursor: "pointer", fontFamily: "inherit" }}>
                ✕ Reject {selected.size}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0", marginBottom: "1.5rem", background: "white", borderRadius: "var(--radius)", border: "1px solid var(--gray-150)", overflow: "hidden" }}>
        {[
          { key: "pending",   label: "Pending Review", count: pending.length },
          { key: "active",    label: "Active",         count: active.length },
          { key: "suspended", label: "Suspended",      count: suspended.length },
        ].map(t => (
          <button key={t.key} onClick={() => { setTab(t.key as any); setSelected(new Set()); }}
            style={{ flex: 1, padding: "0.875rem 1.25rem", background: tab === t.key ? "var(--navy)" : "transparent", color: tab === t.key ? "white" : "var(--gray-600)", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: tab === t.key ? 700 : 500, fontSize: "0.9rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", transition: "all 0.2s" }}>
            {t.label}
            <span style={{ background: tab === t.key ? "rgba(255,255,255,0.2)" : "var(--gray-100)", color: tab === t.key ? "white" : "var(--gray-500)", borderRadius: "999px", padding: "0 7px", fontSize: "0.75rem", fontWeight: 800 }}>
              {loading ? "…" : t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search (active tab) */}
      {tab === "active" && (
        <div style={{ position: "relative", marginBottom: "1.25rem" }}>
          <div style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          </div>
          <input placeholder="Search by company, name, or category…" value={search} onChange={e => setSearch(e.target.value)} className="form-input" style={{ paddingLeft: "2.75rem" }} />
        </div>
      )}

      {loading ? (
        <div className="card" style={{ padding: "3rem", textAlign: "center", color: "var(--gray-400)" }}>Loading…</div>
      ) : (
        <>
          {/* Pending tab */}
          {tab === "pending" && (
            <div className="card" style={{ overflow: "hidden" }}>
              {pending.length === 0 ? (
                <div style={{ padding: "3rem", textAlign: "center", color: "var(--gray-400)" }}>
                  <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>✅</div>
                  <div style={{ fontWeight: 600, color: "var(--gray-600)" }}>No pending applications</div>
                </div>
              ) : (
                <>
                  <div style={{ padding: "1rem 1.5rem", background: "rgba(99,102,241,0.04)", borderBottom: "1px solid var(--gray-100)", fontSize: "0.875rem", color: "#6366f1", fontWeight: 600 }}>
                    {pending.length} contractor{pending.length !== 1 ? "s" : ""} awaiting review — newest first
                  </div>
                  {pending.map((c, i) => (
                    <div key={c.id} style={{ display: "grid", gridTemplateColumns: "auto auto 1fr auto auto", gap: "1rem", padding: "1.25rem 1.5rem", borderBottom: i < pending.length - 1 ? "1px solid var(--gray-50)" : "none", alignItems: "center" }}>
                      <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggleSelect(c.id)} style={{ width: "16px", height: "16px", accentColor: "var(--navy)" }} />
                      <div style={{ width: "42px", height: "42px", background: "var(--navy)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, flexShrink: 0 }}>
                        {c.owner_first_name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: "var(--navy)", fontSize: "0.9375rem" }}>{c.company_name}</div>
                        <div style={{ fontSize: "0.8125rem", color: "var(--gray-400)", marginTop: "1px" }}>
                          {c.owner_first_name} {c.owner_last_name} · {c.category} · {c.city}, {c.state_code}
                        </div>
                        <div style={{ display: "flex", gap: "0.625rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
                          {[
                            { ok: c.is_licensed,                    label: "License" },
                            { ok: c.is_insured,                     label: "Insurance" },
                            { ok: c.contractor_photos.length >= 3,  label: `${c.contractor_photos.length} Photos` },
                          ].map(item => (
                            <span key={item.label} style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem", fontWeight: 600, color: item.ok ? "#16a34a" : "#d97706" }}>
                              {item.ok ? "✓" : "⚠"} {item.label}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div style={{ textAlign: "right", fontSize: "0.8125rem", color: "var(--gray-400)" }}>
                        {fmt(c.created_at)}
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                        <button onClick={() => setConfirmAction({ type: "approve", ids: [c.id] })}
                          style={{ padding: "0.5rem 1rem", background: "rgba(22,163,74,0.1)", color: "#16a34a", border: "1px solid rgba(22,163,74,0.25)", borderRadius: "var(--radius-sm)", fontWeight: 700, fontSize: "0.8125rem", cursor: "pointer", fontFamily: "inherit" }}>
                          ✓ Approve
                        </button>
                        <button onClick={() => setConfirmAction({ type: "reject", ids: [c.id] })}
                          style={{ padding: "0.5rem 1rem", background: "rgba(199,25,26,0.06)", color: "var(--red)", border: "1px solid rgba(199,25,26,0.18)", borderRadius: "var(--radius-sm)", fontWeight: 700, fontSize: "0.8125rem", cursor: "pointer", fontFamily: "inherit" }}>
                          ✕ Reject
                        </button>
                        <button onClick={() => setEditingId(c.id)}
                          style={{ padding: "0.5rem 1rem", background: "white", color: "var(--navy)", border: "1px solid var(--gray-200)", borderRadius: "var(--radius-sm)", fontWeight: 600, fontSize: "0.8125rem", cursor: "pointer", fontFamily: "inherit" }}>
                          Edit
                        </button>
                        <Link href={`/admin/contractors/${c.id}`} style={{ padding: "0.5rem 1rem", background: "var(--gray-100)", color: "var(--gray-600)", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 600, fontSize: "0.8125rem", cursor: "pointer", fontFamily: "inherit", textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
                          View
                        </Link>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {/* Active tab */}
          {tab === "active" && (
            <div className="card" style={{ overflow: "hidden" }}>
              {activeFiltered.length === 0 ? (
                <div style={{ padding: "3rem", textAlign: "center", color: "var(--gray-400)" }}>No active contractors found.</div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "var(--gray-50)", borderBottom: "1px solid var(--gray-150)" }}>
                      {["Company","Category","Location","Sub Status","Approved","Actions"].map(h => (
                        <th key={h} style={{ padding: "0.875rem 1.25rem", textAlign: "left", fontSize: "0.8125rem", fontWeight: 700, color: "var(--gray-500)", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {activeFiltered.map((c, i) => {
                      const sub = c.contractor_subscriptions?.[0];
                      const periodEnd = sub?.current_period_end ? fmt(sub.current_period_end) : "—";
                      return (
                        <tr key={c.id} style={{ borderBottom: i < activeFiltered.length - 1 ? "1px solid var(--gray-50)" : "none" }}>
                          <td style={{ padding: "1rem 1.25rem" }}>
                            <div style={{ fontWeight: 700, color: "var(--navy)", fontSize: "0.875rem" }}>{c.company_name}</div>
                            <div style={{ fontSize: "0.75rem", color: "var(--gray-400)" }}>{c.owner_first_name} {c.owner_last_name}</div>
                          </td>
                          <td style={{ padding: "1rem 1.25rem", fontSize: "0.875rem", color: "var(--gray-600)" }}>{c.category}</td>
                          <td style={{ padding: "1rem 1.25rem", fontSize: "0.875rem", color: "var(--gray-600)" }}>{c.city}, {c.state_code}</td>
                          <td style={{ padding: "1rem 1.25rem" }}>
                            {sub ? <StatusBadge status={sub.status} /> : <span style={{ fontSize: "0.75rem", color: "var(--gray-400)" }}>No sub</span>}
                            {sub?.current_period_end && <div style={{ fontSize: "0.7rem", color: "var(--gray-400)", marginTop: "2px" }}>renews {periodEnd}</div>}
                          </td>
                          <td style={{ padding: "1rem 1.25rem", fontSize: "0.8125rem", color: "var(--gray-500)" }}>
                            {c.created_at ? fmt(c.created_at) : "—"}
                          </td>
                          <td style={{ padding: "1rem 1.25rem" }}>
                            <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap" }}>
                              <button onClick={() => setEditingId(c.id)}
                                style={{ padding: "0.375rem 0.75rem", background: "white", color: "var(--navy)", border: "1px solid var(--gray-200)", borderRadius: "var(--radius-xs)", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                                Edit
                              </button>
                              <Link href={`/contractors/${c.id}`} style={{ padding: "0.375rem 0.75rem", background: "var(--gray-100)", color: "var(--gray-700)", borderRadius: "var(--radius-xs)", fontSize: "0.75rem", fontWeight: 600, textDecoration: "none" }}>
                                View
                              </Link>
                              <button onClick={() => setConfirmAction({ type: "suspend", ids: [c.id] })}
                                style={{ padding: "0.375rem 0.75rem", background: "rgba(199,25,26,0.06)", color: "var(--red)", border: "none", borderRadius: "var(--radius-xs)", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                                Suspend
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Suspended tab */}
          {tab === "suspended" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {suspended.length === 0 ? (
                <div className="card" style={{ padding: "3rem", textAlign: "center", color: "var(--gray-400)" }}>
                  <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>✅</div>
                  <div style={{ fontWeight: 600, color: "var(--gray-600)" }}>No suspended accounts</div>
                </div>
              ) : suspended.map(c => (
                <div key={c.id} className="card" style={{ padding: "1.5rem", borderLeft: "4px solid var(--red)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.375rem" }}>
                        <span style={{ fontWeight: 700, color: "var(--navy)", fontSize: "1rem" }}>{c.company_name}</span>
                        <StatusBadge status="suspended" />
                      </div>
                      <div style={{ fontSize: "0.875rem", color: "var(--gray-500)" }}>
                        {c.owner_first_name} {c.owner_last_name} · {c.category} · {c.city}, {c.state_code}
                      </div>
                      <div style={{ marginTop: "0.75rem", fontSize: "0.875rem", color: "var(--red)", fontWeight: 600 }}>
                        ⚠ Profile hidden — suspended due to payment failure
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "0.75rem" }}>
                      <button onClick={() => setConfirmAction({ type: "unsuspend", ids: [c.id] })}
                        style={{ padding: "0.625rem 1.125rem", background: "rgba(22,163,74,0.1)", color: "#16a34a", border: "1px solid rgba(22,163,74,0.25)", borderRadius: "var(--radius)", fontWeight: 700, fontSize: "0.875rem", cursor: "pointer", fontFamily: "inherit" }}>
                        Restore Access
                      </button>
                      <Link href={`/contractors/${c.id}`} style={{ padding: "0.625rem 1.125rem", background: "var(--gray-100)", color: "var(--gray-700)", borderRadius: "var(--radius)", fontWeight: 600, fontSize: "0.875rem", textDecoration: "none" }}>
                        View Profile
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Confirm modal */}
      {confirmAction && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
          <div style={{ background: "white", borderRadius: "var(--radius-xl)", padding: "2rem", maxWidth: "440px", width: "100%" }}>
            <h3 style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "0.75rem", textTransform: "capitalize" }}>
              {confirmAction.type} {confirmAction.ids.length} contractor{confirmAction.ids.length > 1 ? "s" : ""}?
            </h3>
            <p style={{ color: "var(--gray-500)", marginBottom: confirmAction.type === "reject" ? "1rem" : "1.5rem", lineHeight: 1.65 }}>
              {confirmAction.type === "approve" && "Profiles will go live immediately and contractors will receive a confirmation email."}
              {confirmAction.type === "reject" && "Applications will be rejected. Contractors will be notified by email."}
              {confirmAction.type === "suspend" && "Profile will be hidden from search results."}
              {confirmAction.type === "unsuspend" && "Profile will be restored and made visible in search results."}
            </p>
            {confirmAction.type === "reject" && (
              <textarea
                placeholder="Rejection reason (sent to contractor)…"
                rows={3}
                className="form-input"
                style={{ marginBottom: "1.5rem", resize: "vertical" }}
                onChange={e => setConfirmAction(a => a ? { ...a, reason: e.target.value } : null)}
              />
            )}
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button className="btn-secondary" onClick={() => setConfirmAction(null)} style={{ flex: 1 }}>Cancel</button>
              <button
                onClick={() => { patchStatus(confirmAction.ids, confirmAction.type, confirmAction.reason); setConfirmAction(null); }}
                style={{ flex: 2, padding: "0.875rem", background: ["approve","unsuspend"].includes(confirmAction.type) ? "#16a34a" : "var(--red)", color: "white", border: "none", borderRadius: "var(--radius)", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", textTransform: "capitalize" }}>
                Confirm {confirmAction.type}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
