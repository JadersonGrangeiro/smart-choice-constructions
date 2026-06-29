"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { CATEGORIES } from "@/lib/data";
import { SUPPLIER_CATEGORIES, SUPPLIER_CATEGORY_GROUPS } from "@/lib/supplier-data";
import { useI18n } from "@/lib/i18n/context";
import LangSwitcher from "./LangSwitcher";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function Header() {
  const [scrolled,      setScrolled]      = useState(false);
  const [mobileOpen,    setMobileOpen]    = useState(false);
  const [servicesOpen,  setServicesOpen]  = useState(false);
  const [suppliersOpen, setSuppliersOpen] = useState(false);
  const [user, setUser]                  = useState<User | null>(null);
  const [userRole, setUserRole]          = useState<string | null>(null);
  const { t } = useI18n();
  const svcTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const supTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Auth state
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      setUserRole(data.user?.user_metadata?.role ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      setUserRole(session?.user?.user_metadata?.role ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const openMenu  = (setter: (v:boolean)=>void, timer: React.MutableRefObject<ReturnType<typeof setTimeout>|null>) =>
    () => { if (timer.current) clearTimeout(timer.current); setter(true); };
  const closeMenu = (setter: (v:boolean)=>void, timer: React.MutableRefObject<ReturnType<typeof setTimeout>|null>) =>
    () => { timer.current = setTimeout(() => setter(false), 120); };

  const headerBg     = scrolled ? "rgba(255,255,255,0.98)" : "rgba(11,24,57,0.45)";
  const headerBlur   = "blur(14px)";
  const headerShadow = scrolled ? "0 1px 0 rgba(0,0,0,0.07)" : "none";
  const textColor    = scrolled ? "var(--navy)" : "white";
  const subColor     = scrolled ? "var(--gray-600)" : "rgba(255,255,255,0.85)";

  const topCats     = CATEGORIES.slice(0, 12);
  const supGroups   = Object.entries(SUPPLIER_CATEGORY_GROUPS) as [string, string][];

  return (
    <>
      <header role="banner" style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: headerBg, backdropFilter: headerBlur, WebkitBackdropFilter: headerBlur,
        boxShadow: headerShadow, transition: "background 0.35s ease, box-shadow 0.35s ease",
      }}>
        <div className="container" style={{ display: "flex", alignItems: "center", height: "72px", gap: "1rem" }}>
          {/* Logo */}
          <Link href="/" aria-label="Smart Choice Constructions — Home"
            style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.75rem", flexShrink: 0 }}>
            <Image src={scrolled ? "/logo-icon.svg" : "/logo-icon-white.svg"} alt="" width={48} height={27} priority style={{ width: "48px", height: "auto" }} />
            <div>
              <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 900, fontSize: "0.9375rem", color: textColor, lineHeight: 1.05, letterSpacing: "0.02em", textTransform: "uppercase", transition: "color 0.3s" }}>
                Smart Choice
              </div>
              <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: "0.5625rem", color: scrolled ? "var(--gray-500)" : "rgba(255,255,255,0.65)", letterSpacing: "0.2em", textTransform: "uppercase", transition: "color 0.3s" }}>
                Constructions
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav role="navigation" aria-label="Main navigation"
            style={{ display: "flex", alignItems: "center", gap: "0.125rem", flex: 1 }}
            className="hide-mobile">

            {/* Services mega-menu */}
            <div style={{ position: "relative" }}
              onMouseEnter={openMenu(setServicesOpen, svcTimer)}
              onMouseLeave={closeMenu(setServicesOpen, svcTimer)}>
              <button aria-haspopup="true" aria-expanded={servicesOpen} style={{
                display: "flex", alignItems: "center", gap: "0.375rem",
                padding: "0.5rem 0.75rem", background: "none", border: "none",
                fontSize: "0.9rem", fontWeight: 500, cursor: "pointer", color: subColor,
                fontFamily: "inherit", borderRadius: "var(--radius-sm)", transition: "color 0.2s",
              }}>
                {t.nav.services}
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none" style={{ transform: servicesOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
                  <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
              {servicesOpen && (
                <>
                  <div style={{ position: "absolute", top: "100%", left: 0, right: 0, height: "12px", zIndex: 201 }} />
                  <div role="menu" onMouseEnter={openMenu(setServicesOpen, svcTimer)} onMouseLeave={closeMenu(setServicesOpen, svcTimer)}
                    style={{ position: "absolute", top: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)", background: "white", borderRadius: "var(--radius-lg)", boxShadow: "0 20px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.08)", border: "1px solid var(--gray-100)", padding: "1rem", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "0.2rem", width: "480px", zIndex: 200, animation: "fadeInDown 0.15s ease" }}>
                    {topCats.map(cat => (
                      <Link key={cat.id} href={`/services/${cat.id}`} role="menuitem" onClick={() => setServicesOpen(false)}
                        className="mega-menu-item"
                        style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 0.625rem", borderRadius: "var(--radius-sm)", textDecoration: "none", color: "var(--gray-700)", fontSize: "0.8125rem", fontWeight: 500, transition: "all 0.15s" }}>
                        <span style={{ fontSize: "1rem" }}>{cat.icon}</span>{cat.name}
                      </Link>
                    ))}
                    <Link href="/services" onClick={() => setServicesOpen(false)}
                      style={{ gridColumn: "1/-1", display: "flex", alignItems: "center", justifyContent: "center", padding: "0.625rem", marginTop: "0.5rem", background: "var(--gray-50)", borderRadius: "var(--radius-sm)", textDecoration: "none", color: "var(--navy)", fontSize: "0.8125rem", fontWeight: 700, border: "1px solid var(--gray-200)" }}>
                      {t.nav.viewAllServices} →
                    </Link>
                  </div>
                </>
              )}
            </div>

            {/* Local Suppliers mega-menu */}
            <div style={{ position: "relative" }}
              onMouseEnter={openMenu(setSuppliersOpen, supTimer)}
              onMouseLeave={closeMenu(setSuppliersOpen, supTimer)}>
              <button aria-haspopup="true" aria-expanded={suppliersOpen} style={{
                display: "flex", alignItems: "center", gap: "0.375rem",
                padding: "0.5rem 0.75rem", background: "none", border: "none",
                fontSize: "0.9rem", fontWeight: 500, cursor: "pointer", color: subColor,
                fontFamily: "inherit", borderRadius: "var(--radius-sm)", transition: "color 0.2s",
              }}>
                Local Suppliers
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none" style={{ transform: suppliersOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
                  <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
              {suppliersOpen && (
                <>
                  <div style={{ position: "absolute", top: "100%", left: 0, right: 0, height: "12px", zIndex: 201 }} />
                  <div role="menu" onMouseEnter={openMenu(setSuppliersOpen, supTimer)} onMouseLeave={closeMenu(setSuppliersOpen, supTimer)}
                    style={{ position: "absolute", top: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)", background: "white", borderRadius: "var(--radius-lg)", boxShadow: "0 20px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.08)", border: "1px solid var(--gray-100)", padding: "1.25rem", width: "560px", zIndex: 200, animation: "fadeInDown 0.15s ease" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "0.875rem" }}>
                      {supGroups.map(([key, label]) => {
                        const cats = SUPPLIER_CATEGORIES.filter(c => c.group === key).slice(0, 4);
                        return (
                          <div key={key}>
                            <div style={{ fontSize: "0.6875rem", fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>{label}</div>
                            {cats.map(cat => (
                              <Link key={cat.id} href={`/suppliers/categories/${cat.id}`} role="menuitem" onClick={() => setSuppliersOpen(false)}
                                className="mega-menu-item"
                                style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.4rem 0.5rem", borderRadius: "var(--radius-sm)", textDecoration: "none", color: "var(--gray-700)", fontSize: "0.8125rem", fontWeight: 500, transition: "all 0.15s" }}>
                                <span>{cat.icon}</span>{cat.name}
                              </Link>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ borderTop: "1px solid var(--gray-100)", paddingTop: "0.875rem", display: "flex", gap: "0.5rem" }}>
                      <Link href="/suppliers" onClick={() => setSuppliersOpen(false)}
                        style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "0.625rem", background: "var(--gray-50)", borderRadius: "var(--radius-sm)", textDecoration: "none", color: "var(--navy)", fontSize: "0.8125rem", fontWeight: 700, border: "1px solid var(--gray-200)" }}>
                        All Supplier Categories →
                      </Link>
                      <Link href="/find-suppliers" onClick={() => setSuppliersOpen(false)}
                        style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "0.625rem", background: "var(--navy)", borderRadius: "var(--radius-sm)", textDecoration: "none", color: "white", fontSize: "0.8125rem", fontWeight: 700 }}>
                        Find Near Me →
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>

            {[
              { label: t.nav.findContractors, href: "/find-contractors" },
              { label: t.nav.locations,       href: "/locations" },
              { label: t.nav.blog,            href: "/blog" },
              { label: t.nav.pricing,         href: "/pricing" },
            ].map(item => (
              <Link key={item.href} href={item.href} className="nav-link-hover"
                style={{ padding: "0.5rem 0.75rem", fontSize: "0.9rem", fontWeight: 500, color: subColor, textDecoration: "none", borderRadius: "var(--radius-sm)", transition: "color 0.2s" }}>
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right CTAs */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginLeft: "auto" }} className="hide-mobile">
            <LangSwitcher scrolled={scrolled} />
            {user ? (
              <>
                <Link
                  href={userRole === "admin" ? "/admin" : userRole === "contractor" ? "/dashboard/contractor" : "/account"}
                  style={{ fontSize: "0.875rem", fontWeight: 600, color: subColor, textDecoration: "none", padding: "0.5rem 0.75rem" }}
                >
                  {userRole === "admin" ? "Admin Panel" : userRole === "contractor" ? "My Dashboard" : "My Account"}
                </Link>
                <form action="/api/auth/signout" method="post">
                  <button type="submit" style={{ fontSize: "0.875rem", fontWeight: 600, color: subColor, background: "none", border: "none", cursor: "pointer", padding: "0.5rem 0.75rem", fontFamily: "inherit" }}>
                    Sign Out
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" style={{ fontSize: "0.875rem", fontWeight: 600, color: subColor, textDecoration: "none", padding: "0.5rem 0.75rem", transition: "color 0.2s" }}>
                  {t.nav.signIn}
                </Link>
                <Link href="/join" className="btn-red" style={{ padding: "0.625rem 1.25rem", fontSize: "0.875rem" }}>
                  {t.nav.joinContractor}
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMobileOpen(!mobileOpen)} aria-label={mobileOpen ? "Close menu" : "Open menu"} aria-expanded={mobileOpen}
            className="show-mobile-only"
            style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", padding: "0.5rem", color: scrolled ? "var(--navy)" : "white", minHeight: "44px", display: "flex", alignItems: "center" }}>
            {mobileOpen
              ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
              : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
            }
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <div role="dialog" aria-modal="true" aria-label="Mobile navigation"
          style={{ position: "fixed", inset: 0, background: "white", zIndex: 999, overflowY: "auto", paddingTop: "76px" }}>
          <div style={{ padding: "1rem 1.5rem 3rem" }}>
            <div style={{ marginBottom: "1.25rem" }}><LangSwitcher scrolled={true} /></div>
            {[
              { label: t.nav.home,            href: "/" },
              { label: t.nav.services,        href: "/services" },
              { label: "Local Suppliers",      href: "/suppliers" },
              { label: t.nav.findContractors, href: "/find-contractors" },
              { label: "Find Suppliers",       href: "/find-suppliers" },
              { label: t.nav.locations,       href: "/locations" },
              { label: t.nav.blog,            href: "/blog" },
              { label: t.nav.pricing,         href: "/pricing" },
              { label: t.nav.about,           href: "/about" },
              { label: t.nav.contact,         href: "/contact" },
              { label: "FAQ",                 href: "/faq" },
            ].map(item => (
              <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                style={{ display: "block", fontSize: "1.0625rem", fontWeight: 600, color: "var(--gray-800)", textDecoration: "none", padding: "0.875rem 0", borderBottom: "1px solid var(--gray-100)", transition: "color 0.15s" }}>
                {item.label}
              </Link>
            ))}
            <div style={{ marginTop: "1.75rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <Link href="/login" className="btn-secondary" style={{ textAlign: "center" }} onClick={() => setMobileOpen(false)}>{t.nav.signIn}</Link>
              <Link href="/join" className="btn-red" style={{ textAlign: "center" }} onClick={() => setMobileOpen(false)}>{t.nav.joinContractor}</Link>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .mega-menu-item:hover { background: var(--gray-50) !important; color: var(--navy) !important; }
        .nav-link-hover:hover { color: white !important; }
        @keyframes fadeInDown { from { opacity:0; transform:translateX(-50%) translateY(-6px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
      `}</style>
    </>
  );
}
