"use client";
import { useState, useEffect, useCallback } from "react";

type AdminRole = "admin";

interface AdminUser {
  id: string;
  full_name: string | null;
  email: string;
  role: AdminRole;
  created_at: string;
  actions: number;
}

const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
  admin: { bg: "rgba(199,25,26,0.1)", color: "var(--red)" },
};

function Toast({ msg, type }: { msg: string; type: "success" | "error" }) {
  return (
    <div style={{ position: "fixed", bottom: "1.5rem", right: "1.5rem", zIndex: 1000, background: type === "success" ? "#16a34a" : "var(--red)", color: "white", padding: "0.875rem 1.5rem", borderRadius: "var(--radius)", fontWeight: 600, fontSize: "0.9rem", boxShadow: "var(--shadow-lg)" }}>
      {msg}
    </div>
  );
}

export default function AdminsPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: "", email: "" });
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/admins");
      const json = await res.json();
      setAdmins(json.admins ?? []);
    } catch {
      showToast("Failed to load admins", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const removeAdmin = async (id: string) => {
    if (!confirm("Remove admin access from this user?")) return;
    try {
      const res = await fetch(`/api/admin/admins/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      showToast("Admin access removed");
      await load();
    } catch {
      showToast("Failed to remove admin", "error");
    }
  };

  const inviteAdmin = async () => {
    if (!newAdmin.name || !newAdmin.email) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: newAdmin.name, email: newAdmin.email, role: "admin" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      showToast(json.created ? "Invite sent — user will receive an email" : "User updated to admin");
      setShowNew(false);
      setNewAdmin({ name: "", email: "" });
      await load();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to invite admin", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "300px", color: "var(--gray-400)", flexDirection: "column", gap: "1rem" }}>
      <div style={{ width: "32px", height: "32px", border: "3px solid var(--gray-200)", borderTopColor: "var(--navy)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      Loading admins...
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div>
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.625rem", fontWeight: 800, color: "var(--navy)", marginBottom: "0.25rem" }}>Admin Accounts</h1>
          <p style={{ color: "var(--gray-500)", fontSize: "0.875rem" }}>
            {admins.length} admin{admins.length !== 1 ? "s" : ""} with platform access.
          </p>
        </div>
        <button className="btn-red" onClick={() => setShowNew(true)} style={{ padding: "0.75rem 1.5rem" }}>+ Add Admin</button>
      </div>

      {showNew && (
        <div className="card" style={{ padding: "1.75rem", marginBottom: "1.5rem", border: "2px solid var(--navy)" }}>
          <h3 style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "1.25rem" }}>New Admin Account</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div><label className="form-label">Full Name *</label><input className="form-input" value={newAdmin.name} onChange={e => setNewAdmin(p => ({ ...p, name: e.target.value }))} /></div>
            <div><label className="form-label">Email Address *</label><input className="form-input" type="email" value={newAdmin.email} onChange={e => setNewAdmin(p => ({ ...p, email: e.target.value }))} /></div>
          </div>
          <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "var(--radius-sm)", padding: "0.875rem 1rem", margin: "1rem 0" }}>
            <p style={{ fontSize: "0.875rem", color: "#92400e" }}>
              If the email already has an account, they will be upgraded to admin. If new, a Supabase invite will be sent.
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button className="btn-red" onClick={inviteAdmin} disabled={saving || !newAdmin.name || !newAdmin.email}>
              {saving ? "Sending..." : "Create Admin Account"}
            </button>
            <button className="btn-secondary" onClick={() => setShowNew(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="card" style={{ overflow: "hidden" }}>
        {admins.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--gray-400)" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>👤</div>
            No admins found — add one above.
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--gray-50)", borderBottom: "1px solid var(--gray-150)" }}>
                {["Admin","Role","Member Since","Actions Logged","Manage"].map(h => (
                  <th key={h} style={{ padding: "0.875rem 1.25rem", textAlign: "left", fontSize: "0.8125rem", fontWeight: 700, color: "var(--gray-500)", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {admins.map((a, i) => {
                const rc = ROLE_COLORS[a.role] ?? { bg: "var(--gray-100)", color: "var(--gray-600)" };
                return (
                  <tr key={a.id} style={{ borderBottom: i < admins.length - 1 ? "1px solid var(--gray-50)" : "none" }}>
                    <td style={{ padding: "1rem 1.25rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div style={{ width: "38px", height: "38px", background: "var(--navy)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, flexShrink: 0 }}>
                          {(a.full_name ?? a.email).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: "var(--navy)", fontSize: "0.9rem" }}>{a.full_name ?? "—"}</div>
                          <div style={{ fontSize: "0.8125rem", color: "var(--gray-400)" }}>{a.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "1rem 1.25rem" }}>
                      <span style={{ background: rc.bg, color: rc.color, padding: "0.25rem 0.75rem", borderRadius: "999px", fontSize: "0.8125rem", fontWeight: 700 }}>
                        Admin
                      </span>
                    </td>
                    <td style={{ padding: "1rem 1.25rem", fontSize: "0.875rem", color: "var(--gray-500)" }}>
                      {new Date(a.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td style={{ padding: "1rem 1.25rem", fontWeight: 700, color: "var(--navy)", textAlign: "center" }}>
                      {a.actions.toLocaleString()}
                    </td>
                    <td style={{ padding: "1rem 1.25rem" }}>
                      <button onClick={() => removeAdmin(a.id)}
                        style={{ padding: "0.375rem 0.625rem", background: "rgba(200,16,46,0.06)", color: "var(--red)", border: "1px solid rgba(200,16,46,0.15)", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                        Remove Access
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
