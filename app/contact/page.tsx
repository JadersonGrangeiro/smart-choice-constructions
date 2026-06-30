"use client";
import { useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import { COMPANY } from "@/lib/data";

export default function ContactPage() {
  const { t } = useI18n();
  const c = t.pages.contact;

  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", userType: c.typeOptions[0] ?? "", subject: c.subjectOptions[0] ?? "", message: "" });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.firstName || !form.email || !form.message) { setError("Please fill in all required fields."); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error("Failed");
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again or email us directly.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ paddingTop: "76px" }}>
      <div style={{ background: "var(--navy)", padding: "4rem 0 3rem" }}>
        <div className="container">
          <h1 className="heading-lg" style={{ color: "white", marginBottom: "1rem" }}>{c.title}</h1>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "1.0625rem" }}>{c.subtitle}</p>
        </div>
      </div>

      <div className="container" style={{ padding: "3rem 1.5rem" }}>
        <div className="grid-2col-sidebar grid-2col-sidebar-lg" style={{ gridTemplateColumns: "2fr 1fr" }}>
          <div className="card" style={{ padding: "2.5rem" }}>
            <h2 style={{ fontSize: "1.375rem", fontWeight: 700, color: "var(--navy)", marginBottom: "2rem" }}>{c.formTitle}</h2>

            {submitted ? (
              <div style={{ textAlign: "center", padding: "2rem 0" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</div>
                <h3 style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "0.75rem" }}>Message Sent!</h3>
                <p style={{ color: "var(--gray-500)", lineHeight: 1.75 }}>
                  Thanks for reaching out, {form.firstName}! We'll get back to you within 1 business day. Check your inbox for a confirmation email.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {error && (
                  <div style={{ background: "rgba(199,25,26,0.08)", border: "1px solid rgba(199,25,26,0.2)", borderRadius: "var(--radius-sm)", padding: "0.75rem 1rem", fontSize: "0.875rem", color: "var(--red)" }}>
                    {error}
                  </div>
                )}
                <div className="grid-2col">
                  <div>
                    <label className="form-label">{c.firstName} *</label>
                    <input placeholder="John" className="form-input" value={form.firstName} onChange={set("firstName")} required />
                  </div>
                  <div>
                    <label className="form-label">{c.lastName} *</label>
                    <input placeholder="Smith" className="form-input" value={form.lastName} onChange={set("lastName")} />
                  </div>
                </div>
                <div>
                  <label className="form-label">{c.email} *</label>
                  <input type="email" placeholder="john@example.com" className="form-input" value={form.email} onChange={set("email")} required />
                </div>
                <div>
                  <label className="form-label">{c.phone}</label>
                  <input type="tel" placeholder="+1 (555) 000-0000" className="form-input" value={form.phone} onChange={set("phone")} />
                </div>
                <div>
                  <label className="form-label">{c.iAmA}</label>
                  <select className="form-select" value={form.userType} onChange={set("userType")}>
                    {c.typeOptions.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">{c.subject}</label>
                  <select className="form-select" value={form.subject} onChange={set("subject")}>
                    {c.subjectOptions.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">{c.message} *</label>
                  <textarea className="form-input" rows={5} style={{ resize: "vertical" }} value={form.message} onChange={set("message")} required />
                </div>
                <button className="btn-red" type="submit" disabled={loading} style={{ alignSelf: "flex-start", padding: "0.875rem 2.5rem", opacity: loading ? 0.7 : 1 }}>
                  {loading ? "Sending..." : c.sendBtn}
                </button>
              </form>
            )}
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
