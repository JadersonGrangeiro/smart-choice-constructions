"use client";
import { useI18n } from "@/lib/i18n/context";
import { COMPANY } from "@/lib/data";

export default function ContactPage() {
  const { t } = useI18n();
  const c = t.pages.contact;

  return (
    <div style={{ paddingTop: "76px" }}>
      <div style={{ background: "var(--navy)", padding: "4rem 0 3rem" }}>
        <div className="container">
          <h1 className="heading-lg" style={{ color: "white", marginBottom: "1rem" }}>{c.title}</h1>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "1.0625rem" }}>{c.subtitle}</p>
        </div>
      </div>

      <div className="container" style={{ padding: "3rem 1.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "3rem" }}>
          <div className="card" style={{ padding: "2.5rem" }}>
            <h2 style={{ fontSize: "1.375rem", fontWeight: 700, color: "var(--navy)", marginBottom: "2rem" }}>{c.formTitle}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div><label className="form-label">{c.firstName} *</label><input placeholder="John" className="form-input" /></div>
                <div><label className="form-label">{c.lastName} *</label><input placeholder="Smith" className="form-input" /></div>
              </div>
              <div><label className="form-label">{c.email} *</label><input type="email" placeholder="john@example.com" className="form-input" /></div>
              <div><label className="form-label">{c.phone}</label><input type="tel" placeholder="+1 (555) 000-0000" className="form-input" /></div>
              <div>
                <label className="form-label">{c.iAmA}</label>
                <select className="form-select">
                  {c.typeOptions.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">{c.subject}</label>
                <select className="form-select">
                  {c.subjectOptions.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div><label className="form-label">{c.message} *</label><textarea className="form-input" rows={5} style={{ resize: "vertical" }} /></div>
              <button className="btn-red" style={{ alignSelf: "flex-start", padding: "0.875rem 2.5rem" }}>{c.sendBtn}</button>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {[
              { icon: "✉️", label: c.email, value: COMPANY.email, href: `mailto:${COMPANY.email}` },
              { icon: "📍", label: c.address_label, value: COMPANY.address, href: "#" },
            ].map(item => (
              <div key={item.label} className="card" style={{ padding: "1.5rem" }}>
                <div style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>{item.icon}</div>
                <div style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "0.375rem" }}>{item.label}</div>
                <a href={item.href} style={{ color: "var(--navy)", textDecoration: "none", fontSize: "0.9375rem" }}>{item.value}</a>
              </div>
            ))}
            <div className="card" style={{ padding: "1.5rem" }}>
              <div style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "1rem" }}>Business Hours</div>
              {c.hours.map(([day, hrs]) => (
                <div key={day} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid var(--gray-100)", fontSize: "0.875rem" }}>
                  <span style={{ color: "var(--gray-500)" }}>{day}</span>
                  <span style={{ fontWeight: 600, color: "var(--navy)" }}>{hrs}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
