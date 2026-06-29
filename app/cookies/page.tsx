import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "How Smart Choice Constructions uses cookies and similar tracking technologies.",
};

const SECTIONS = [
  {
    title: "What Are Cookies",
    body: "Cookies are small text files stored on your device when you visit a website. They allow the site to remember your actions and preferences over time, so you don't have to re-enter information every time you return.",
  },
  {
    title: "Cookies We Use",
    body: "We use three categories of cookies. Essential cookies keep the platform functioning — they handle your session, remember your language preference, and maintain security. Analytics cookies (Google Analytics) help us understand how visitors interact with the platform so we can improve it. Preference cookies remember your choices, such as your selected language (English or Spanish).",
  },
  {
    title: "Cookies We Do Not Use",
    body: "Smart Choice Constructions does not use advertising or tracking cookies. We do not share your browsing behavior with advertisers, data brokers, or any third parties for marketing purposes.",
  },
  {
    title: "Third-Party Cookies",
    body: "Google Analytics may set cookies to help us understand usage patterns. These cookies collect anonymous, aggregated data only. They are subject to Google's own privacy policy. Stripe, our payment processor, may set cookies during the checkout flow for fraud prevention and security purposes.",
  },
  {
    title: "Managing Cookies",
    body: "You can control or disable cookies through your browser settings. Most browsers allow you to block all cookies, accept only certain types, or delete cookies after each session. Disabling essential cookies may prevent parts of the platform from working correctly. Disabling analytics cookies has no effect on your experience.",
  },
  {
    title: "Your Consent",
    body: "By using Smart Choice Constructions, you consent to our use of cookies as described in this policy. If you do not agree, you may adjust your browser settings or discontinue using the platform.",
  },
  {
    title: "Changes to This Policy",
    body: "We may update this Cookie Policy periodically. When we do, we will revise the date at the top of this page. Continued use of the platform after changes constitutes acceptance of the updated policy.",
  },
  {
    title: "Contact",
    body: "Questions about our use of cookies? Email us at jadersoneua@gmail.com.",
  },
];

export default function CookiesPage() {
  return (
    <div style={{ paddingTop: "76px" }}>
      <div style={{ background: "var(--navy)", padding: "4rem 0 3rem" }}>
        <div className="container">
          <nav aria-label="Breadcrumb" style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", fontSize: "0.875rem", color: "rgba(255,255,255,0.5)" }}>
            <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>Home</Link>
            <span>/</span>
            <span style={{ color: "rgba(255,255,255,0.85)" }}>Cookie Policy</span>
          </nav>
          <h1 className="heading-lg" style={{ color: "white" }}>Cookie Policy</h1>
          <p style={{ color: "rgba(255,255,255,0.55)", marginTop: "0.75rem" }}>Last updated: June 1, 2025</p>
        </div>
      </div>

      <div className="container-narrow" style={{ padding: "3.5rem 1.5rem" }}>
        <div style={{ background: "rgba(22,46,94,0.05)", border: "1px solid rgba(22,46,94,0.12)", borderRadius: "var(--radius)", padding: "1.25rem 1.5rem", marginBottom: "2.5rem" }}>
          <p style={{ color: "var(--gray-600)", fontSize: "0.9375rem", lineHeight: 1.75 }}>
            <strong style={{ color: "var(--navy)" }}>Short version:</strong> We use essential cookies to run the platform, analytics cookies to improve it, and preference cookies to remember your language. We do not use advertising or tracking cookies.
          </p>
        </div>

        {SECTIONS.map((s, i) => (
          <div key={i} style={{ marginBottom: "2.5rem" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--navy)", marginBottom: "1rem" }}>{s.title}</h2>
            <p style={{ color: "var(--gray-600)", lineHeight: 1.85 }}>{s.body}</p>
          </div>
        ))}

        <div style={{ borderTop: "1px solid var(--gray-100)", paddingTop: "2rem", display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
          <Link href="/privacy" style={{ color: "var(--navy)", fontWeight: 600, textDecoration: "none", fontSize: "0.9375rem" }}>Privacy Policy →</Link>
          <Link href="/terms"   style={{ color: "var(--navy)", fontWeight: 600, textDecoration: "none", fontSize: "0.9375rem" }}>Terms of Service →</Link>
          <Link href="/contact" style={{ color: "var(--navy)", fontWeight: 600, textDecoration: "none", fontSize: "0.9375rem" }}>Contact Us →</Link>
        </div>
      </div>
    </div>
  );
}
