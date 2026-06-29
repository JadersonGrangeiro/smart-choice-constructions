import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you're looking for doesn't exist. Browse our services or find a contractor.",
};

export default function NotFound() {
  return (
    <div style={{ paddingTop: "76px", minHeight: "100vh", background: "var(--gray-50)", display: "flex", alignItems: "center" }}>
      <div className="container" style={{ maxWidth: "600px", textAlign: "center", padding: "4rem 1.5rem" }}>
        {/* Logo mark */}
        <svg width="72" height="60" viewBox="0 0 120 90" fill="none" style={{ margin: "0 auto 2rem", display: "block" }}>
          <polyline points="10,72 60,18 88,51" stroke="var(--navy)" strokeWidth="8" strokeLinejoin="round" strokeLinecap="round" fill="none"/>
          <rect x="74" y="28" width="11" height="22" rx="1.5" fill="var(--navy)"/>
          <line x1="88" y1="51" x2="116" y2="51" stroke="var(--navy)" strokeWidth="8" strokeLinecap="round"/>
          <rect x="43" y="42" width="8" height="8" rx="1" fill="#C7191A"/>
          <rect x="53" y="42" width="8" height="8" rx="1" fill="#C7191A"/>
          <rect x="43" y="52" width="8" height="8" rx="1" fill="#C7191A"/>
          <rect x="53" y="52" width="8" height="8" rx="1" fill="#C7191A"/>
        </svg>

        <div style={{ fontSize: "5rem", fontWeight: 900, color: "var(--gray-150)", letterSpacing: "-0.05em", lineHeight: 1, marginBottom: "0.5rem" }}>
          404
        </div>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--navy)", marginBottom: "1rem" }}>
          Page Not Found
        </h1>
        <p style={{ color: "var(--gray-500)", fontSize: "1.0625rem", lineHeight: 1.75, marginBottom: "2.5rem" }}>
          The page you're looking for doesn't exist or may have moved. Try searching for a contractor or browse our service categories.
        </p>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "3rem" }}>
          <Link href="/" className="btn-red" style={{ padding: "0.875rem 2rem" }}>
            Back to Home
          </Link>
          <Link href="/find-contractors" className="btn-secondary" style={{ padding: "0.875rem 2rem" }}>
            Find a Contractor
          </Link>
        </div>

        {/* Quick links */}
        <div style={{ borderTop: "1px solid var(--gray-150)", paddingTop: "2rem" }}>
          <p style={{ fontSize: "0.875rem", color: "var(--gray-400)", marginBottom: "1rem" }}>
            Popular pages
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            {[
              { label: "Services",         href: "/services" },
              { label: "Locations",        href: "/locations" },
              { label: "Pricing",          href: "/pricing" },
              { label: "How It Works",     href: "/how-it-works" },
              { label: "FAQ",              href: "/faq" },
            ].map(item => (
              <Link key={item.href} href={item.href}
                style={{ fontSize: "0.875rem", color: "var(--navy)", fontWeight: 600, textDecoration: "none", padding: "0.375rem 0.875rem", borderRadius: "999px", background: "white", border: "1.5px solid var(--gray-200)", transition: "all 0.15s" }}
                className="not-found-link">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <style>{`.not-found-link:hover { border-color: var(--navy) !important; background: var(--navy) !important; color: white !important; }`}</style>
    </div>
  );
}
