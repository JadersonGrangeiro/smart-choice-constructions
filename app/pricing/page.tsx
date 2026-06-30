"use client";
import Link from "next/link";
import { useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import { COMPANY } from "@/lib/data";

export default function PricingPage() {
  const { t } = useI18n();
  const p = t.pages.pricing;
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div style={{ paddingTop: "76px" }}>
      {/* Hero */}
      <div style={{ background: "linear-gradient(155deg, var(--navy-dark), var(--navy))", padding: "5rem 0 4rem", textAlign: "center" }}>
        <div className="container">
          <span className="badge badge-white" style={{ marginBottom: "1.5rem" }}>{p.badge}</span>
          <h1 className="heading-xl" style={{ color: "white", marginBottom: "1.25rem" }}>{p.title}</h1>
          <p className="text-lg" style={{ color: "rgba(255,255,255,0.7)", maxWidth: "520px", margin: "0 auto" }}>{p.subtitle}</p>
        </div>
      </div>

      <section style={{ padding: "4rem 0", background: "var(--gray-50)" }}>
        <div className="container" style={{ maxWidth: "960px" }}>
          <div className="grid-2col-sidebar" style={{ gridTemplateColumns: "1.1fr 1fr", alignItems: "start" }}>
            {/* Plan card */}
            <div className="pricing-card featured">
              <div style={{ position: "absolute", top: "-14px", left: "50%", transform: "translateX(-50%)", background: "var(--red)", color: "white", padding: "0.375rem 1.25rem", borderRadius: "999px", fontSize: "0.8125rem", fontWeight: 700, whiteSpace: "nowrap" }}>
                {p.badge}
              </div>
              <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--red)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.75rem" }}>{p.planName}</div>
                {/* First month */}
                <div style={{ marginBottom: "0.25rem" }}>
                  <span style={{ fontSize: "0.875rem", color: "var(--gray-400)", fontWeight: 500 }}>{p.firstMonth} </span>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: "0.25rem", marginBottom: "0.375rem" }}>
                  <span style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--gray-400)" }}>$</span>
                  <span style={{ fontSize: "4.5rem", fontWeight: 800, color: "var(--navy)", letterSpacing: "-0.04em", lineHeight: 1 }}>29</span>
                  <span style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--navy)", alignSelf: "flex-start", marginTop: "0.75rem" }}>.90</span>
                </div>
                <div style={{ fontSize: "0.875rem", color: "var(--gray-400)" }}>{p.thenMonth}</div>
                <div style={{ fontSize: "0.8125rem", color: "var(--gray-400)", marginTop: "0.375rem" }}>{p.billedMonthly}</div>
              </div>
              <div style={{ marginBottom: "2rem" }}>
                {p.features.map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.625rem 0", borderBottom: i < p.features.length - 1 ? "1px solid var(--gray-100)" : "none" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round"><path d="M5 13l4 4L19 7"/></svg>
                    <span style={{ fontSize: "0.9375rem", color: "var(--gray-700)" }}>{f}</span>
                  </div>
                ))}
              </div>
              <Link href="/join" className="btn-red" style={{ display: "block", textAlign: "center", padding: "1rem", fontSize: "1.0625rem" }}>
                {p.startBtn}
              </Link>
              <p style={{ fontSize: "0.8125rem", color: "var(--gray-400)", textAlign: "center", marginTop: "0.875rem" }}>{p.noSetup}</p>
            </div>

            {/* Value props */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="card" style={{ padding: "1.75rem" }}>
                <h3 style={{ fontWeight: 700, color: "var(--navy)", fontSize: "1.0625rem", marginBottom: "0.875rem" }}>{p.whyTitle}</h3>
                <p style={{ color: "var(--gray-600)", lineHeight: 1.75, fontSize: "0.9375rem" }}>{p.whyDesc}</p>
              </div>
              {p.perks.map((perk, i) => (
                <div key={i} className="card" style={{ padding: "1.25rem 1.5rem", display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                  <span style={{ fontSize: "1.5rem", flexShrink: 0 }}>{perk.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "0.25rem", fontSize: "0.9375rem" }}>{perk.title}</div>
                    <div style={{ fontSize: "0.875rem", color: "var(--gray-500)", lineHeight: 1.65 }}>{perk.desc}</div>
                  </div>
                </div>
              ))}
              <div style={{ background: "var(--navy)", borderRadius: "var(--radius-lg)", padding: "1.25rem", textAlign: "center" }}>
                <div style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.8125rem", marginBottom: "0.25rem" }}>Questions? Email us</div>
                <a href={`mailto:${COMPANY.email}`} style={{ color: "white", fontWeight: 700, textDecoration: "none", fontSize: "1rem" }}>{COMPANY.email}</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: "4rem 0", background: "white" }}>
        <div className="container-narrow">
          <h2 className="heading-md" style={{ color: "var(--navy)", textAlign: "center", marginBottom: "3rem" }}>Pricing FAQ</h2>
          <div style={{ background: "var(--gray-50)", borderRadius: "var(--radius-xl)", padding: "2rem" }}>
            {t.faq.slice(2, 6).map((faq, i) => (
              <div key={i} style={{ borderBottom: i < 3 ? "1px solid var(--gray-200)" : "none" }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 0", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: "1.0625rem", fontWeight: 600, color: "var(--navy)", textAlign: "left" }}
                >
                  {faq.question}
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{ transform: openFaq === i ? "rotate(180deg)" : "none", transition: "transform 0.3s", flexShrink: 0 }}>
                    <path d="M5 7.5l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
                {openFaq === i && (
                  <div style={{ padding: "0 0 1.25rem", color: "var(--gray-600)", lineHeight: 1.75 }}>{faq.answer}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "var(--navy)", padding: "4rem 0", textAlign: "center" }}>
        <div className="container">
          <h2 className="heading-md" style={{ color: "white", marginBottom: "1rem" }}>Ready to Grow Your Business?</h2>
          <p style={{ color: "rgba(255,255,255,0.65)", marginBottom: "2rem", fontSize: "1.0625rem" }}>
            Join thousands of contractors already building their reputation on Smart Choice.
          </p>
          <Link href="/join" className="btn-white" style={{ padding: "1rem 2.5rem", fontSize: "1.0625rem" }}>
            Get Started — $29.90 First Month
          </Link>
        </div>
      </section>
    </div>
  );
}
