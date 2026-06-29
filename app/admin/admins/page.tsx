"use client";
import { useState } from "react";

type AdminRole = "super_admin" | "editor" | "support" | "viewer";

interface AdminUser {
  id: string; name: string; email: string; role: AdminRole;
  status: "active" | "suspended"; lastLogin: string; createdAt: string; actions: number;
}

const ROLE_PERMISSIONS: Record<AdminRole, string[]> = {
  super_admin: ["Everything — full platform access including pricing, admins, and destructive actions"],
  editor:      ["Create/edit blog posts, FAQ, banners, testimonials, pages","View contractors and suppliers","Cannot manage billing, admins, or settings"],
  support:     ["View/manage contractors, reviews, documents","View users and subscriptions","Cannot access billing, settings, or admin management"],
  viewer:      ["Read-only access to all admin sections","Cannot create, edit, or delete anything"],
};

const ROLE_COLORS: Record<AdminRole, { bg: string; color: string }> = {
  super_admin: { bg: "rgba(199,25,26,0.1)",  color: "var(--red)" },
  editor:      { bg: "rgba(22,46,94,0.1)",  color: "var(--navy)" },
  support:     { bg: "rgba(99,102,241,0.1)", color: "#6366f1" },
  viewer:      { bg: "var(--gray-100)",       color: "var(--gray-600)" },
};

const MOCK_ADMINS: AdminUser[] = [
  { id: "a1", name: "Carlos Rodriguez",  email: "carlos@smartchoice.com",  role: "super_admin", status: "active",    lastLogin: "Jun 28, 2025 14:32", createdAt: "Jan 1, 2025",  actions: 487 },
  { id: "a2", name: "Maria Santos",      email: "maria@smartchoice.com",   role: "support",     status: "active",    lastLogin: "Jun 28, 2025 11:15", createdAt: "Mar 1, 2025",  actions: 203 },
  { id: "a3", name: "James Williams",    email: "james@smartchoice.com",   role: "editor",      status: "active",    lastLogin: "Jun 28, 2025 09:42", createdAt: "Apr 15, 2025", actions: 89  },
  { id: "a4", name: "Anna Kowalski",     email: "anna@smartchoice.com",    role: "viewer",      status: "active",    lastLogin: "Jun 25, 2025 16:00", createdAt: "Jun 1, 2025",  actions: 12  },
  { id: "a5", name: "David Thompson",    email: "david.t@smartchoice.com", role: "support",     status: "suspended", lastLogin: "May 30, 2025 10:22", createdAt: "Feb 1, 2025",  actions: 156 },
];

export default function AdminsPage() {
  const [admins, setAdmins] = useState(MOCK_ADMINS);
  const [showNew, setShowNew] = useState(false);
  const [showPerms, setShowPerms] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: "", email: "", role: "support" as AdminRole });

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.625rem", fontWeight: 800, color: "var(--navy)", marginBottom: "0.25rem" }}>Admin Accounts</h1>
          <p style={{ color: "var(--gray-500)", fontSize: "0.875rem" }}>
            {admins.filter(a => a.status === "active").length} active admins · Manage access and roles.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button className="btn-secondary" onClick={() => setShowPerms(!showPerms)} style={{ padding: "0.625rem 1.25rem", fontSize: "0.875rem" }}>
            Role Permissions
          </button>
          <button className="btn-red" onClick={() => setShowNew(true)} style={{ padding: "0.75rem 1.5rem" }}>+ Add Admin</button>
        </div>
      </div>

      {/* Role permissions reference */}
      {showPerms && (
        <div className="card" style={{ padding: "1.75rem", marginBottom: "1.5rem" }}>
          <h3 style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "1.25rem" }}>Role Permission Matrix</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: "1.25rem" }}>
            {(Object.entries(ROLE_PERMISSIONS) as [AdminRole, string[]][]).map(([role, perms]) => {
              const rc = ROLE_COLORS[role];
              return (
                <div key={role} style={{ border: "1.5px solid var(--gray-150)", borderRadius: "var(--radius)", padding: "1.25rem" }}>
                  <div style={{ display: "inline-flex", background: rc.bg, color: rc.color, padding: "0.25rem 0.75rem", borderRadius: "999px", fontSize: "0.8125rem", fontWeight: 700, marginBottom: "0.875rem" }}>
                    {role.replace(/_/g," ").replace(/\b\w/g,l=>l.toUpperCase())}
                  </div>
                  {perms.map((p,i) => (
                    <div key={i} style={{ fontSize: "0.8125rem", color: "var(--gray-600)", lineHeight: 1.6, padding: "0.25rem 0", borderBottom: i < perms.length-1 ? "1px solid var(--gray-100)" : "none" }}>
                      {p}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showNew && (
        <div className="card" style={{ padding: "1.75rem", marginBottom: "1.5rem", border: "2px solid var(--navy)" }}>
          <h3 style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "1.25rem" }}>New Admin Account</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
            <div><label className="form-label">Full Name *</label><input className="form-input" value={newAdmin.name} onChange={e => setNewAdmin(p => ({ ...p, name: e.target.value }))} /></div>
            <div><label className="form-label">Email Address *</label><input className="form-input" type="email" value={newAdmin.email} onChange={e => setNewAdmin(p => ({ ...p, email: e.target.value }))} /></div>
            <div>
              <label className="form-label">Role</label>
              <select className="form-select" value={newAdmin.role} onChange={e => setNewAdmin(p => ({ ...p, role: e.target.value as AdminRole }))}>
                <option value="super_admin">Super Admin</option>
                <option value="editor">Editor</option>
                <option value="support">Support</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
          </div>
          <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "var(--radius-sm)", padding: "0.875rem 1rem", margin: "1rem 0" }}>
            <p style={{ fontSize: "0.875rem", color: "#92400e" }}>
              A temporary password will be emailed to the new admin. They will be required to change it on first login.
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button className="btn-red" onClick={() => {
              if (!newAdmin.name || !newAdmin.email) return;
              setAdmins(p => [...p, { ...newAdmin, id: `a${Date.now()}`, status: "active", lastLogin: "Never", createdAt: "Today", actions: 0 }]);
              setShowNew(false);
            }}>Create Admin Account</button>
            <button className="btn-secondary" onClick={() => setShowNew(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="card" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--gray-50)", borderBottom: "1px solid var(--gray-150)" }}>
              {["Admin","Role","Status","Last Login","Actions","Manage"].map(h => (
                <th key={h} style={{ padding: "0.875rem 1.25rem", textAlign: "left", fontSize: "0.8125rem", fontWeight: 700, color: "var(--gray-500)", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {admins.map((a, i) => {
              const rc = ROLE_COLORS[a.role];
              return (
                <tr key={a.id} style={{ borderBottom: i < admins.length - 1 ? "1px solid var(--gray-50)" : "none" }}>
                  <td style={{ padding: "1rem 1.25rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div style={{ width: "38px", height: "38px", background: "var(--navy)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, flexShrink: 0 }}>{a.name.charAt(0)}</div>
                      <div>
                        <div style={{ fontWeight: 700, color: "var(--navy)", fontSize: "0.9rem" }}>{a.name}</div>
                        <div style={{ fontSize: "0.8125rem", color: "var(--gray-400)" }}>{a.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "1rem 1.25rem" }}>
                    <span style={{ background: rc.bg, color: rc.color, padding: "0.25rem 0.75rem", borderRadius: "999px", fontSize: "0.8125rem", fontWeight: 700 }}>
                      {a.role.replace(/_/g," ").replace(/\b\w/g,l=>l.toUpperCase())}
                    </span>
                  </td>
                  <td style={{ padding: "1rem 1.25rem" }}>
                    <span style={{ background: a.status === "active" ? "rgba(22,163,74,0.1)" : "var(--gray-100)", color: a.status === "active" ? "#16a34a" : "var(--gray-500)", padding: "0.25rem 0.625rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700 }}>
                      {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                    </span>
                  </td>
                  <td style={{ padding: "1rem 1.25rem", fontSize: "0.875rem", color: "var(--gray-500)" }}>{a.lastLogin}</td>
                  <td style={{ padding: "1rem 1.25rem", fontWeight: 700, color: "var(--navy)", textAlign: "center" }}>{a.actions.toLocaleString()}</td>
                  <td style={{ padding: "1rem 1.25rem" }}>
                    <div style={{ display: "flex", gap: "0.375rem" }}>
                      {a.id !== "a1" && (
                        <>
                          <button style={{ padding: "0.375rem 0.625rem", background: "var(--gray-100)", border: "none", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", color: "var(--gray-700)", fontFamily: "inherit" }}>Edit</button>
                          <button onClick={() => setAdmins(p => p.map(x => x.id === a.id ? { ...x, status: x.status === "active" ? "suspended" : "active" } : x))}
                            style={{ padding: "0.375rem 0.625rem", background: a.status === "active" ? "rgba(245,158,11,0.1)" : "rgba(22,163,74,0.1)", color: a.status === "active" ? "#d97706" : "#16a34a", border: "none", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                            {a.status === "active" ? "Suspend" : "Restore"}
                          </button>
                        </>
                      )}
                      {a.id === "a1" && <span style={{ fontSize: "0.75rem", color: "var(--gray-400)", padding: "0.375rem 0.625rem" }}>You (owner)</span>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
