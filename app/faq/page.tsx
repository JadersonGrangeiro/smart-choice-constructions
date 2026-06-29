"use client";
import { useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { COMPANY } from "@/lib/data";

export default function FAQPage() {
  const { t } = useI18n();
  const p = t.pages.faqPage;
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState<number | null>(null);

  const filtered = t.faq.filter(f =>
    f.question.toLowerCase().includes(search.toLowerCase()) ||
    f.answer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ paddingTop: "76px" }}>
      <div style={{ background: "var(--navy)", padding: "4rem 0 3rem", textAlign: "center" }}>
        <div className="container">
          <h1 className="heading-lg" style={{ color: "white", marginBottom: "1rem" }}>{p.title}</h1>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "1.0625rem", marginBottom: "2rem" }}>{p.subtitle}</p>
          <div style={{ maxWidth: "480px", margin: "0 auto", position: "relative" }}>
            <div style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)", pointerEvents: "none" }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            </div>
            <input placeholder={p.searchPlaceholder} value={search} onChange={e => setSearch(e.target.value)}
              className="form-input" style={{ paddingLeft: "2.75rem" }} />
          </div>
        </div>
      </div>

      <div className="container-narrow" style={{ padding: "3rem 1.5rem" }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--gray-400)" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔍</div>
            <div style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--gray-600)", marginBottom: "0.5rem" }}>{p.noResults}</div>
            <div>{p.tryAgain}</div>
          </div>
        ) : (
          <div style={{ background: "white", borderRadius: "var(--radius-xl)", padding: "2rem", boxShadow: "var(--shadow-sm)", border: "1px solid var(--gray-100)" }}>
            {filtered.map((faq, i) => (
              <div key={i} className="accordion-item">
                <button className="accordion-trigger" onClick={() => setOpen(open === i ? null : i)}>
                  {faq.question}
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{ transform: open === i ? "rotate(180deg)" : "none", transition: "transform 0.3s", flexShrink: 0 }}>
                    <path d="M5 7.5l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
                <div className={`accordion-content ${open === i ? "open" : ""}`}>
                  <div className="accordion-body">{faq.answer}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ background: "var(--navy)", borderRadius: "var(--radius-xl)", padding: "2.5rem", textAlign: "center", marginTop: "3rem" }}>
          <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>💬</div>
          <h3 style={{ fontWeight: 700, color: "white", fontSize: "1.25rem", marginBottom: "0.75rem" }}>{p.stillHaveQ}</h3>
          <p style={{ color: "rgba(255,255,255,0.65)", marginBottom: "1.5rem" }}>{p.supportText}</p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/contact" className="btn-white" style={{ padding: "0.75rem 1.75rem" }}>{p.contactBtn}</Link>
            <a href={`mailto:${COMPANY.email}`} className="btn-outline-white" style={{ padding: "0.75rem 1.75rem" }}>{COMPANY.email}</a>
          </div>
        </div>
      </div>
    </div>
  );
}
