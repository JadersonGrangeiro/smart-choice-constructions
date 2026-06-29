"use client";
import Link from "next/link";
import { useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import { COMPANY } from "@/lib/data";

export default function HowItWorksPage() {
  const { t } = useI18n();
  const p = t.pages.howItWorksPage;
  const [tab, setTab] = useState<"homeowners"|"contractors">("homeowners");

  return (
    <div style={{ paddingTop: "76px" }}>
      <div style={{ background: "linear-gradient(155deg, var(--navy-dark), var(--navy))", padding: "5rem 0 4rem", textAlign: "center" }}>
        <div className="container">
          <span className="badge badge-white" style={{ marginBottom: "1.5rem" }}>{p.badge}</span>
          <h1 className="heading-xl" style={{ color: "white", marginBottom: "1.25rem" }}>{p.title}</h1>
          <p className="text-lg" style={{ color: "rgba(255,255,255,0.7)", maxWidth: "520px", margin: "0 auto" }}>{p.subtitle}</p>
        </div>
      </div>

      <section style={{ padding: "4rem 0", background: "white" }}>
        <div className="container-narrow">
          {/* Tab switcher */}
          <div style={{ display: "flex", background: "var(--gray-100)", borderRadius: "var(--radius)", padding: "4px", marginBottom: "3rem", maxWidth: "400px", margin: "0 auto 3rem" }}>
            {(["homeowners","contractors"] as const).map(tab2 => (
              <button key={tab2} onClick={() => setTab(tab2)} style={{
                flex: 1, padding: "0.75rem", borderRadius: "calc(var(--radius) - 4px)",
                background: tab === tab2 ? "white" : "transparent",
                border: "none", cursor: "pointer", fontWeight: 700, fontFamily: "inherit",
                fontSize: "0.9375rem", color: tab === tab2 ? "var(--navy)" : "var(--gray-500)",
                boxShadow: tab === tab2 ? "var(--shadow-sm)" : "none", transition: "all 0.2s",
              }}>
                {tab2 === "homeowners" ? p.forHomeowners : p.forContractors}
              </button>
            ))}
          </div>

          {tab === "homeowners" && (
            <div>
              {t.howItWorks.map((step, i) => (
                <div key={i} style={{ display: "flex", gap: "2rem", marginBottom: "3rem", alignItems: "flex-start" }}>
                  <div className="step-number" style={{ flexShrink: 0, width: "56px", height: "56px", fontSize: "1.375rem" }}>{step.step}</div>
                  <div>
                    <h2 style={{ fontSize: "1.375rem", fontWeight: 700, color: "var(--navy)", marginBottom: "0.875rem" }}>{step.title}</h2>
                    <p style={{ color: "var(--gray-600)", lineHeight: 1.85, fontSize: "1.0625rem" }}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "contractors" && (
            <div>
              {p.contractorSteps.map((step, i) => (
                <div key={i} style={{ display: "flex", gap: "2rem", marginBottom: "3rem", alignItems: "flex-start" }}>
                  <div className="step-number" style={{ flexShrink: 0, width: "56px", height: "56px", fontSize: "1.375rem", background: "var(--red)" }}>{step.step}</div>
                  <div>
                    <h2 style={{ fontSize: "1.375rem", fontWeight: 700, color: "var(--navy)", marginBottom: "0.875rem" }}>{step.title}</h2>
                    <p style={{ color: "var(--gray-600)", lineHeight: 1.85, fontSize: "1.0625rem" }}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section style={{ background: "var(--navy)", padding: "4rem 0", textAlign: "center" }}>
        <div className="container">
          <h2 className="heading-md" style={{ color: "white", marginBottom: "1rem" }}>Ready to Get Started?</h2>
          <p style={{ color: "rgba(255,255,255,0.65)", marginBottom: "2rem" }}>Find your contractor in minutes. No cost, no commitment.</p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/request-quote" className="btn-white">Find a Contractor — Free</Link>
            <Link href="/join" className="btn-red">Join as Contractor — ${COMPANY.pricing.firstMonth.toFixed(2)} First Month</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
