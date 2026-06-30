"use client";
import React from "react";

type Role = "homeowner" | "contractor" | "supplier" | "editor" | "support" | "super_admin";
type Permission = { action: string; homeowner: boolean; contractor: boolean; supplier: boolean; editor: boolean; support: boolean; super_admin: boolean; };

const PERMISSIONS: { category: string; items: Permission[] }[] = [
  {
    category: "Platform Access",
    items: [
      { action: "Browse contractors & profiles",      homeowner: true,  contractor: true,  supplier: true,  editor: true,  support: true,  super_admin: true  },
      { action: "Browse supplier listings",           homeowner: true,  contractor: true,  supplier: true,  editor: true,  support: true,  super_admin: true  },
      { action: "Request quotes",                     homeowner: true,  contractor: false, supplier: false, editor: false, support: false, super_admin: false },
      { action: "Access admin panel",                 homeowner: false, contractor: false, supplier: false, editor: true,  support: true,  super_admin: true  },
    ],
  },
  {
    category: "Contractor Actions",
    items: [
      { action: "Create/edit contractor profile",     homeowner: false, contractor: true,  supplier: false, editor: false, support: true,  super_admin: true  },
      { action: "Upload verification documents",      homeowner: false, contractor: true,  supplier: false, editor: false, support: false, super_admin: true  },
      { action: "View leads & leads dashboard",       homeowner: false, contractor: true,  supplier: false, editor: false, support: true,  super_admin: true  },
      { action: "Manage subscription & billing",      homeowner: false, contractor: true,  supplier: false, editor: false, support: true,  super_admin: true  },
    ],
  },
  {
    category: "Supplier Actions",
    items: [
      { action: "Create/edit supplier profile",       homeowner: false, contractor: false, supplier: true,  editor: false, support: true,  super_admin: true  },
      { action: "Link to contractor profiles",        homeowner: false, contractor: true,  supplier: false, editor: false, support: false, super_admin: true  },
    ],
  },
  {
    category: "Admin — Content",
    items: [
      { action: "Manage blog posts & FAQ",            homeowner: false, contractor: false, supplier: false, editor: true,  support: false, super_admin: true  },
      { action: "Manage banners & testimonials",      homeowner: false, contractor: false, supplier: false, editor: true,  support: false, super_admin: true  },
      { action: "Manage static pages",               homeowner: false, contractor: false, supplier: false, editor: true,  support: false, super_admin: true  },
    ],
  },
  {
    category: "Admin — Operations",
    items: [
      { action: "Approve/reject contractors",         homeowner: false, contractor: false, supplier: false, editor: false, support: true,  super_admin: true  },
      { action: "Approve/reject documents",           homeowner: false, contractor: false, supplier: false, editor: false, support: true,  super_admin: true  },
      { action: "Manage reviews",                     homeowner: false, contractor: false, supplier: false, editor: false, support: true,  super_admin: true  },
      { action: "Manage notifications & campaigns",   homeowner: false, contractor: false, supplier: false, editor: false, support: true,  super_admin: true  },
    ],
  },
  {
    category: "Admin — Finance",
    items: [
      { action: "View subscription & payment data",   homeowner: false, contractor: false, supplier: false, editor: false, support: true,  super_admin: true  },
      { action: "Issue refunds",                      homeowner: false, contractor: false, supplier: false, editor: false, support: false, super_admin: true  },
      { action: "Manage coupons",                     homeowner: false, contractor: false, supplier: false, editor: false, support: false, super_admin: true  },
      { action: "Change subscription pricing",        homeowner: false, contractor: false, supplier: false, editor: false, support: false, super_admin: true  },
    ],
  },
  {
    category: "Admin — System",
    items: [
      { action: "Manage admin accounts",              homeowner: false, contractor: false, supplier: false, editor: false, support: false, super_admin: true  },
      { action: "Manage feature flags",               homeowner: false, contractor: false, supplier: false, editor: false, support: false, super_admin: true  },
      { action: "Change platform settings",           homeowner: false, contractor: false, supplier: false, editor: false, support: false, super_admin: true  },
      { action: "View & export audit logs",           homeowner: false, contractor: false, supplier: false, editor: false, support: false, super_admin: true  },
      { action: "Export all data",                    homeowner: false, contractor: false, supplier: false, editor: false, support: false, super_admin: true  },
    ],
  },
];

const ROLE_LABELS: Record<Role, string> = {
  homeowner:   "Home-\nowner",
  contractor:  "Contractor",
  supplier:    "Supplier",
  editor:      "Editor",
  support:     "Support",
  super_admin: "Super\nAdmin",
};

const ROLE_COLORS: Record<Role, string> = {
  homeowner:   "var(--gray-500)",
  contractor:  "var(--navy)",
  supplier:    "#047857",
  editor:      "#6366f1",
  support:     "#0891b2",
  super_admin: "var(--red)",
};

export default function PermissionsPage() {
  const roles: Role[] = ["homeowner","contractor","supplier","editor","support","super_admin"];

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.625rem", fontWeight: 800, color: "var(--navy)", marginBottom: "0.25rem" }}>Role Permissions</h1>
        <p style={{ color: "var(--gray-500)", fontSize: "0.875rem" }}>
          Read-only matrix showing what each role can do across the platform. To change roles, manage individual users in <a href="/admin/admins" style={{ color: "var(--navy)", fontWeight: 600 }}>Admin Accounts</a>.
        </p>
      </div>

      <div className="card" style={{ overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "700px" }}>
          <thead>
            <tr style={{ background: "var(--gray-50)", borderBottom: "2px solid var(--gray-150)" }}>
              <th style={{ padding: "1rem 1.25rem", textAlign: "left", fontSize: "0.8125rem", fontWeight: 700, color: "var(--gray-500)", width: "280px" }}>Action</th>
              {roles.map(role => (
                <th key={role} style={{ padding: "1rem 0.75rem", textAlign: "center", fontSize: "0.75rem", fontWeight: 700, color: ROLE_COLORS[role], width: "88px" }}>
                  {ROLE_LABELS[role].split("\n").map((line, i) => <div key={i}>{line}</div>)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERMISSIONS.map((group, gi) => (
              <React.Fragment key={`g${gi}`}>
                <tr style={{ background: "rgba(22,46,94,0.03)" }}>
                  <td colSpan={roles.length + 1} style={{ padding: "0.625rem 1.25rem", fontSize: "0.75rem", fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    {group.category}
                  </td>
                </tr>
                {group.items.map((perm, pi) => (
                  <tr key={`${gi}-${pi}`} style={{ borderBottom: "1px solid var(--gray-50)" }}>
                    <td style={{ padding: "0.75rem 1.25rem", fontSize: "0.875rem", color: "var(--gray-700)" }}>{perm.action}</td>
                    {roles.map(role => (
                      <td key={role} style={{ padding: "0.75rem", textAlign: "center" }}>
                        {perm[role]
                          ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round"><path d="M5 13l4 4L19 7"/></svg>
                          : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gray-200)" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                        }
                      </td>
                    ))}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: "1.5rem", background: "rgba(22,46,94,0.04)", borderRadius: "var(--radius)", padding: "1.25rem 1.5rem", border: "1px solid rgba(22,46,94,0.1)" }}>
        <p style={{ fontSize: "0.875rem", color: "var(--gray-600)", lineHeight: 1.65 }}>
          This matrix reflects the current permission design. In production, permissions are enforced server-side via middleware and cannot be bypassed from the frontend. Super Admin is the only role that can create or modify other admin accounts, change pricing, issue refunds, or access system settings.
        </p>
      </div>
    </div>
  );
}
