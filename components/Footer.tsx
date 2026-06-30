"use client";
import Link from "next/link";
import { useState } from "react";
import { COMPANY, CATEGORIES, US_STATES } from "@/lib/data";
import { SUPPLIER_CATEGORIES } from "@/lib/supplier-data";
import { useI18n } from "@/lib/i18n/context";

export default function Footer() {
  const { t } = useI18n();
  const topCats = CATEGORIES.slice(0, 8);
  const topStates = US_STATES.slice(0, 8);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  function handleNewsletter(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail("");
  }

  return (
    <footer>
      {/* Flag accent: Navy | Red | White */}
      <div style={{ height: "4px", background: "linear-gradient(90deg, #162E5E 0%, #162E5E 60%, #C7191A 60%, #C7191A 80%, #fff 80%)" }} />

      <div style={{ padding: "4rem 0 0" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "minmax(200px,1.6fr) repeat(4,1fr)", gap: "2rem", paddingBottom: "3rem", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>

            {/* Brand */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "1.25rem" }}>
                <svg width="36" height="30" viewBox="0 0 120 90" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <polyline points="10,72 60,18 88,51" stroke="white" strokeWidth="8" strokeLinejoin="round" strokeLinecap="round" fill="none"/>
                  <rect x="74" y="28" width="11" height="22" rx="1.5" fill="white"/>
                  <line x1="88" y1="51" x2="116" y2="51" stroke="white" strokeWidth="8" strokeLinecap="round"/>
                  <rect x="43" y="42" width="8" height="8" rx="1" fill="#C7191A"/>
                  <rect x="53" y="42" width="8" height="8" rx="1" fill="#C7191A"/>
                  <rect x="43" y="52" width="8" height="8" rx="1" fill="#C7191A"/>
                  <rect x="53" y="52" width="8" height="8" rx="1" fill="#C7191A"/>
                </svg>
                <div>
                  <div style={{ fontWeight: 900, fontSize: "0.9375rem", color: "white", letterSpacing: "0.01em", textTransform: "uppercase", lineHeight: 1.05 }}>Smart Choice</div>
                  <div style={{ fontWeight: 700, fontSize: "0.5625rem", color: "rgba(255,255,255,0.55)", letterSpacing: "0.18em", textTransform: "uppercase" }}>Constructions</div>
                </div>
              </div>
              <p className="slogan" style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.875rem", marginBottom: "1.25rem" }}>
                Simple, Clear, Complete.
              </p>
              <p style={{ fontSize: "0.875rem", color: "var(--gray-400)", lineHeight: 1.75, marginBottom: "1.5rem", maxWidth: "240px" }}>
                America's most trusted platform connecting homeowners with verified local contractors.
              </p>
              {/* Social */}
              <div style={{ display: "flex", gap: "0.625rem" }}>
                {[
                  { label: "f",  title: "Facebook",    href: COMPANY.social.facebook },
                  { label: "ig", title: "Instagram",   href: COMPANY.social.instagram },
                  { label: "X",  title: "X / Twitter", href: COMPANY.social.twitter },
                  { label: "in", title: "LinkedIn",    href: COMPANY.social.linkedin },
                ].map(s => (
                  <a key={s.label} href={s.href} title={s.title} target="_blank" rel="noopener noreferrer"
                    style={{ width: "34px", height: "34px", background: "rgba(255,255,255,0.08)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.65)", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", textDecoration: "none", transition: "background 0.15s, color 0.15s" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.18)"; (e.currentTarget as HTMLAnchorElement).style.color = "white"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.08)"; (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.65)"; }}
                  >{s.label}</a>
                ))}
              </div>
              {/* Pricing card */}
              <div style={{ marginTop: "1.75rem", padding: "1rem", background: "rgba(199,25,26,0.12)", borderRadius: "var(--radius)", border: "1px solid rgba(199,25,26,0.2)" }}>
                <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", marginBottom: "0.25rem" }}>First month only</div>
                <div style={{ fontWeight: 800, color: "white", fontSize: "1.375rem" }}>$29.90</div>
                <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)" }}>then $49.90/month</div>
                <Link href="/join" className="btn-red" style={{ marginTop: "0.75rem", display: "block", textAlign: "center", fontSize: "0.8125rem", padding: "0.5rem 1rem" }}>
                  Join Now
                </Link>
              </div>
            </div>

            {/* Services */}
            <div>
              <div className="footer-heading">{t.footer.popularServices}</div>
              {topCats.map(cat => (
                <Link key={cat.id} href={`/services/${cat.id}`} className="footer-link">{cat.name}</Link>
              ))}
              <Link href="/services" className="footer-link" style={{ color: "#60a5fa", fontWeight: 600, marginTop: "0.5rem" }}>
                View all 60+ →
              </Link>
            </div>

            {/* States */}
            <div>
              <div className="footer-heading">{t.footer.topStates}</div>
              {topStates.map(state => (
                <Link key={state.code} href={`/locations/${state.slug}`} className="footer-link">{state.name}</Link>
              ))}
              <Link href="/locations" className="footer-link" style={{ color: "#60a5fa", fontWeight: 600, marginTop: "0.5rem" }}>
                {t.footer.allStates}
              </Link>
            </div>

            {/* Local Suppliers */}
            <div>
              <div className="footer-heading">Local Suppliers</div>
              {SUPPLIER_CATEGORIES.slice(0, 6).map(cat => (
                <Link key={cat.id} href={`/suppliers/categories/${cat.id}`} className="footer-link">
                  {cat.name}
                </Link>
              ))}
              <Link href="/suppliers" className="footer-link" style={{ color: "#60a5fa", fontWeight: 600, marginTop: "0.5rem" }}>
                All Categories →
              </Link>
            </div>

            {/* Company */}
            <div>
              <div className="footer-heading">{t.footer.company}</div>
              {t.footer.companyLinks.map(item => (
                <Link key={item.href} href={item.href} className="footer-link">{item.label}</Link>
              ))}
              <div className="footer-heading" style={{ marginTop: "1.5rem" }}>{t.footer.forContractors}</div>
              {t.footer.contractorLinks.map(item => (
                <Link key={item.href} href={item.href} className="footer-link">{item.label}</Link>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div style={{ padding: "2rem 0", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1.5rem" }}>
              <div>
                <div style={{ fontWeight: 700, color: "white", fontSize: "1rem", marginBottom: "0.25rem" }}>{t.footer.newsletter}</div>
                <div style={{ fontSize: "0.875rem", color: "var(--gray-400)" }}>{t.footer.newsletterSub}</div>
              </div>
              {subscribed ? (
                <div style={{ color: "#4ade80", fontWeight: 600, fontSize: "0.9375rem" }}>
                  ✓ You're subscribed! Thank you.
                </div>
              ) : (
                <form onSubmit={handleNewsletter} style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                  <input
                    type="email" required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder={t.footer.emailPlaceholder}
                    style={{
                      background: "rgba(255,255,255,0.07)", border: "1.5px solid rgba(255,255,255,0.1)",
                      borderRadius: "var(--radius)", padding: "0.75rem 1.125rem",
                      color: "white", fontSize: "0.9375rem", fontFamily: "inherit", outline: "none", minWidth: "240px",
                    }}
                  />
                  <button type="submit" className="btn-red" style={{ padding: "0.75rem 1.5rem" }}>{t.footer.subscribe}</button>
                </form>
              )}
            </div>
          </div>

          {/* Bottom */}
          <div style={{ padding: "1.5rem 0", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
            <div style={{ fontSize: "0.8125rem", color: "var(--gray-500)" }}>
              © {new Date().getFullYear()} {t.footer.copyright}
            </div>
            <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap" }}>
              {t.footer.legalLinks.map(item => (
                <Link key={item.href} href={item.href} className="footer-link" style={{ fontSize: "0.8125rem" }}>{item.label}</Link>
              ))}
            </div>
            <div style={{ fontSize: "0.8125rem", color: "var(--gray-500)" }}>
              ✉ <a href={`mailto:${COMPANY.email}`} style={{ color: "var(--gray-500)", textDecoration: "none" }}>{COMPANY.email}</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
