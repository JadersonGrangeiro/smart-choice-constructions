"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_GROUPS = [
  {
    label: "Operations",
    items: [
      { href: "/admin",               icon: "📊", label: "Dashboard" },
      { href: "/admin/contractors",   icon: "👷", label: "Contractors" },
      { href: "/admin/suppliers",     icon: "🏢", label: "Suppliers" },
      { href: "/admin/documents",     icon: "📎", label: "Documents" },
      { href: "/admin/subscriptions", icon: "💳", label: "Subscriptions" },
      { href: "/admin/users",         icon: "👤", label: "Homeowners" },
      { href: "/admin/reviews",       icon: "⭐", label: "Reviews" },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/banners",         icon: "🖼️", label: "Banners" },
      { href: "/admin/testimonials",    icon: "💬", label: "Testimonials" },
      { href: "/admin/pages",           icon: "📄", label: "Pages" },
      { href: "/admin/content",         icon: "📝", label: "Blog & FAQ" },
      { href: "/admin/categories",      icon: "🔧", label: "Categories" },
      { href: "/admin/locations",       icon: "📍", label: "Locations" },
    ],
  },
  {
    label: "Marketing",
    items: [
      { href: "/admin/campaigns",       icon: "🎯", label: "Campaigns" },
      { href: "/admin/coupons",         icon: "🎟️", label: "Coupons" },
      { href: "/admin/notifications",   icon: "🔔", label: "Notifications" },
      { href: "/admin/email-templates", icon: "📧", label: "Email Templates" },
    ],
  },
  {
    label: "Analytics",
    items: [
      { href: "/admin/reports",         icon: "📈", label: "Reports" },
      { href: "/admin/exports",         icon: "⬇️", label: "Exports" },
      { href: "/admin/audit-logs",      icon: "📋", label: "Audit Logs" },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/admin/settings",        icon: "⚙️", label: "Settings" },
      { href: "/admin/feature-flags",   icon: "🚩", label: "Feature Flags" },
      { href: "/admin/permissions",     icon: "🔐", label: "Permissions" },
      { href: "/admin/admins",          icon: "👑", label: "Admin Accounts" },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();

  return (
    <div style={{ paddingTop: "76px", display: "flex", minHeight: "100vh", background: "var(--gray-50)" }}>
      {/* Sidebar */}
      <aside style={{
        width: "220px", background: "#0d1f40", flexShrink: 0,
        position: "sticky", top: "76px", height: "calc(100vh - 76px)",
        overflowY: "auto", display: "flex", flexDirection: "column",
      }}>
        <div style={{ padding: "1.125rem 1rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: "0.5625rem", fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "0.2rem" }}>Admin Panel</div>
          <div style={{ fontWeight: 800, color: "white", fontSize: "0.9375rem", letterSpacing: "-0.01em" }}>Smart Choice</div>
        </div>

        <nav style={{ padding: "0.625rem 0.5rem", flex: 1 }}>
          {NAV_GROUPS.map(group => (
            <div key={group.label} style={{ marginBottom: "0.375rem" }}>
              <div style={{ fontSize: "0.5625rem", fontWeight: 700, color: "rgba(255,255,255,0.22)", letterSpacing: "0.12em", textTransform: "uppercase", padding: "0.5rem 0.625rem 0.25rem" }}>
                {group.label}
              </div>
              {group.items.map(item => {
                const active = path === item.href || (item.href !== "/admin" && path.startsWith(item.href));
                return (
                  <Link key={item.href} href={item.href} style={{
                    display: "flex", alignItems: "center", gap: "0.5rem",
                    padding: "0.5rem 0.625rem", borderRadius: "var(--radius-sm)",
                    marginBottom: "1px", textDecoration: "none", fontSize: "0.8125rem",
                    fontWeight: active ? 700 : 400,
                    background: active ? "rgba(255,255,255,0.1)" : "transparent",
                    color: active ? "white" : "rgba(255,255,255,0.5)",
                    borderLeft: `3px solid ${active ? "var(--red)" : "transparent"}`,
                    transition: "all 0.15s",
                  }}>
                    <span style={{ fontSize: "0.9375rem" }}>{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div style={{ padding: "0.75rem 0.5rem", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 0.625rem", textDecoration: "none", fontSize: "0.8125rem", color: "rgba(255,255,255,0.3)", transition: "color 0.15s" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back to site
          </Link>
          <form action="/api/auth/signout" method="post">
            <button type="submit" style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 0.625rem", background: "none", border: "none", cursor: "pointer", fontSize: "0.8125rem", color: "rgba(255,255,255,0.3)", width: "100%", fontFamily: "inherit", textAlign: "left" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <main style={{ flex: 1, minWidth: 0, padding: "2rem 2.5rem" }}>
        {children}
      </main>
    </div>
  );
}
