"use client";
import Link from "next/link";
import { CATEGORIES } from "@/lib/data";
import { useI18n } from "@/lib/i18n/context";

export default function ServicesPage() {
  const { t } = useI18n();
  return (
    <div style={{ paddingTop: "76px" }}>
      <div style={{ background: "var(--navy)", padding: "4rem 0 3rem" }}>
        <div className="container">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem", fontSize: "0.875rem", color: "rgba(255,255,255,0.5)" }}>
            <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>Home</Link>
            <span>/</span>
            <span style={{ color: "rgba(255,255,255,0.8)" }}>Services</span>
          </div>
          <h1 className="heading-lg" style={{ color: "white", marginBottom: "1rem" }}>All Home Services</h1>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "1.0625rem", maxWidth: "480px" }}>
            60+ service categories. Verified professionals for every home project.
          </p>
        </div>
      </div>
      <div className="container" style={{ padding: "3rem 1.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(175px,1fr))", gap: "1rem" }}>
          {CATEGORIES.map((cat, i) => (
            <Link key={cat.id} href={`/services/${cat.id}`} className="category-card" style={{ animationDelay: `${i * 15}ms` }}>
              <div className="category-icon" style={{ background: `${cat.color}18` }}>
                <span style={{ fontSize: "1.75rem" }}>{cat.icon}</span>
              </div>
              <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--navy)", lineHeight: 1.3 }}>{cat.name}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
