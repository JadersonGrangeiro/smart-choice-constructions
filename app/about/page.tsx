"use client";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { COMPANY } from "@/lib/data";

export default function AboutPage() {
  const { t } = useI18n();
  const a = t.pages.about;

  return (
    <div style={{ paddingTop: "76px" }}>
      <div style={{ background: "linear-gradient(155deg, var(--navy-dark), var(--navy))", padding: "5rem 0 4rem", textAlign: "center" }}>
        <div className="container">
          <span className="badge badge-white" style={{ marginBottom: "1.5rem" }}>{a.badge}</span>
          <h1 className="heading-xl" style={{ color: "white", marginBottom: "1.25rem" }}>{a.title}</h1>
          <p className="text-lg" style={{ color: "rgba(255,255,255,0.7)", maxWidth: "620px", margin: "0 auto" }}>{a.subtitle}</p>
        </div>
      </div>

      {/* Stats */}
      <section style={{ background: "white", padding: "4rem 0" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: "2rem", textAlign: "center" }}>
            {t.stats.map((stat, i) => (
              <div key={i}>
                <div className="stat-number" style={{ color: "var(--navy)" }}>{stat.value}</div>
                <div style={{ color: "var(--gray-500)", marginTop: "0.5rem", fontWeight: 500 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section style={{ background: "var(--gray-50)", padding: "5rem 0" }}>
        <div className="container-narrow">
          <h2 className="heading-md" style={{ color: "var(--navy)", marginBottom: "2rem" }}>Our Story</h2>
          {a.story.map((para, i) => (
            <p key={i} style={{ color: "var(--gray-600)", lineHeight: 1.85, fontSize: "1.0625rem", marginBottom: "1.5rem" }}>{para}</p>
          ))}
        </div>
      </section>

      {/* Values */}
      <section style={{ background: "white", padding: "5rem 0" }}>
        <div className="container">
          <h2 className="heading-md" style={{ color: "var(--navy)", textAlign: "center", marginBottom: "3rem" }}>Our Core Values</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: "1.5rem" }}>
            {a.values.map((v, i) => (
              <div key={i} className="card" style={{ padding: "2rem", textAlign: "center" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>{v.icon}</div>
                <h3 style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "0.75rem" }}>{v.title}</h3>
                <p style={{ color: "var(--gray-500)", lineHeight: 1.7, fontSize: "0.9375rem" }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: "var(--navy)", padding: "4rem 0", textAlign: "center" }}>
        <div className="container">
          <p className="slogan" style={{ color: "rgba(255,255,255,0.5)", marginBottom: "1rem", fontSize: "1.0625rem" }}>Simple, Clear, Complete.</p>
          <h2 className="heading-md" style={{ color: "white", marginBottom: "1rem" }}>Join the Smart Choice Network</h2>
          <p style={{ color: "rgba(255,255,255,0.65)", marginBottom: "2rem" }}>Whether you're a homeowner or a professional, we're built for you.</p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/find-contractors" className="btn-white">Find a Contractor</Link>
            <Link href="/join" className="btn-red">Join as Contractor</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
