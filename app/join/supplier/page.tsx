"use client";
import { useState } from "react";
import Link from "next/link";
import { US_STATES, COMPANY, } from "@/lib/data";
import { SUPPLIER_CATEGORIES } from "@/lib/supplier-data";

interface FormData {
  companyName:  string;
  contactName:  string;
  email:        string;
  phone:        string;
  category:     string;
  state:        string;
  city:         string;
  website:      string;
  description:  string;
}

const INIT: FormData = {
  companyName: "", contactName: "", email: "", phone: "",
  category: "", state: "", city: "", website: "", description: "",
};

export default function SupplierJoinPage() {
  const [form, setForm]         = useState<FormData>(INIT);
  const [errors, setErrors]     = useState<Partial<FormData>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const set = (k: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  function validate(): boolean {
    const e: Partial<FormData> = {};
    if (!form.companyName.trim()) e.companyName = "Company name is required";
    if (!form.contactName.trim()) e.contactName = "Contact name is required";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Valid email is required";
    if (!form.phone.trim()) e.phone = "Phone is required";
    if (!form.category) e.category = "Category is required";
    if (!form.state)    e.state    = "State is required";
    if (!form.city.trim()) e.city  = "City is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setServerError("");

    try {
      const res = await fetch("/api/suppliers/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: form.companyName,
          contact_name: form.contactName,
          email:        form.email,
          phone:        form.phone,
          category:     form.category,
          state_code:   form.state,
          city:         form.city,
          website:      form.website || null,
          description:  form.description || null,
        }),
      });
      const d = await res.json();
      if (!res.ok) { setServerError(d.error ?? "Submission failed. Please try again."); return; }
      window.location.href = d.checkoutUrl;
    } catch {
      setServerError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const field = (k: keyof FormData, label: string, placeholder: string, type = "text") => (
    <div>
      <label style={{ display: "block", fontWeight: 600, color: "var(--gray-700)", marginBottom: "0.375rem", fontSize: "0.9375rem" }}>{label}</label>
      <input
        type={type}
        value={form[k] as string}
        onChange={set(k)}
        placeholder={placeholder}
        style={{
          width: "100%", padding: "0.75rem 1rem", border: `1.5px solid ${errors[k] ? "var(--red)" : "var(--gray-200)"}`,
          borderRadius: "var(--radius-sm)", fontFamily: "inherit", fontSize: "0.9375rem", color: "var(--gray-800)", outline: "none", boxSizing: "border-box",
        }}
      />
      {errors[k] && <p style={{ color: "var(--red)", fontSize: "0.8125rem", marginTop: "0.25rem" }}>{errors[k]}</p>}
    </div>
  );

  return (
    <div style={{ paddingTop: "76px", minHeight: "100vh", background: "var(--gray-50)" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(155deg, #0a1829 0%, var(--navy) 100%)", padding: "3.5rem 0 4rem", textAlign: "center" }}>
        <div className="container">
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "999px", padding: "0.375rem 1rem", marginBottom: "1.5rem" }}>
            <span style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>$14.90 First Month — Then $29.90/month</span>
          </div>
          <h1 style={{ fontWeight: 800, color: "white", fontSize: "clamp(1.75rem,4vw,2.75rem)", marginBottom: "0.875rem" }}>
            Join the Smart Choice Supplier Directory
          </h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "1.0625rem", maxWidth: "520px", margin: "0 auto" }}>
            Get discovered by contractors who need your products and services. Start for just $14.90 your first month.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="container" style={{ maxWidth: "680px", padding: "3rem 1.5rem" }}>
        <div className="card" style={{ padding: "2.5rem" }}>
          <h2 style={{ fontWeight: 700, color: "var(--navy)", fontSize: "1.25rem", marginBottom: "2rem" }}>Tell Us About Your Business</h2>

          {serverError && (
            <div style={{ background: "rgba(199,25,26,0.08)", border: "1.5px solid rgba(199,25,26,0.25)", borderRadius: "var(--radius-sm)", padding: "0.875rem 1.125rem", marginBottom: "1.5rem", color: "var(--red)", fontSize: "0.9375rem" }}>
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>
              {field("companyName", "Company Name *", "ABC Supply Co.")}
              {field("contactName", "Contact Name *", "Your full name")}
              {field("email", "Business Email *", "contact@yourbusiness.com", "email")}
              {field("phone", "Phone Number *", "(555) 000-0000", "tel")}
            </div>

            {/* Category */}
            <div style={{ marginBottom: "1.25rem" }}>
              <label style={{ display: "block", fontWeight: 600, color: "var(--gray-700)", marginBottom: "0.375rem", fontSize: "0.9375rem" }}>Supply Category *</label>
              <select
                value={form.category}
                onChange={set("category")}
                style={{ width: "100%", padding: "0.75rem 1rem", border: `1.5px solid ${errors.category ? "var(--red)" : "var(--gray-200)"}`, borderRadius: "var(--radius-sm)", fontFamily: "inherit", fontSize: "0.9375rem", color: form.category ? "var(--gray-800)" : "var(--gray-400)", background: "white" }}
              >
                <option value="">Select a category…</option>
                {SUPPLIER_CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </select>
              {errors.category && <p style={{ color: "var(--red)", fontSize: "0.8125rem", marginTop: "0.25rem" }}>{errors.category}</p>}
            </div>

            {/* Location */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>
              <div>
                <label style={{ display: "block", fontWeight: 600, color: "var(--gray-700)", marginBottom: "0.375rem", fontSize: "0.9375rem" }}>State *</label>
                <select
                  value={form.state}
                  onChange={set("state")}
                  style={{ width: "100%", padding: "0.75rem 1rem", border: `1.5px solid ${errors.state ? "var(--red)" : "var(--gray-200)"}`, borderRadius: "var(--radius-sm)", fontFamily: "inherit", fontSize: "0.9375rem", color: form.state ? "var(--gray-800)" : "var(--gray-400)", background: "white" }}
                >
                  <option value="">Select state…</option>
                  {US_STATES.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
                </select>
                {errors.state && <p style={{ color: "var(--red)", fontSize: "0.8125rem", marginTop: "0.25rem" }}>{errors.state}</p>}
              </div>
              {field("city", "City *", "Your city")}
            </div>

            {/* Optional fields */}
            {field("website", "Website (optional)", "https://yourwebsite.com", "url")}

            <div style={{ marginTop: "1.25rem" }}>
              <label style={{ display: "block", fontWeight: 600, color: "var(--gray-700)", marginBottom: "0.375rem", fontSize: "0.9375rem" }}>Business Description (optional)</label>
              <textarea
                value={form.description}
                onChange={set("description")}
                rows={4}
                placeholder="Tell contractors what you offer, your service area, minimum orders, and what makes you stand out…"
                style={{ width: "100%", padding: "0.75rem 1rem", border: "1.5px solid var(--gray-200)", borderRadius: "var(--radius-sm)", fontFamily: "inherit", fontSize: "0.9375rem", color: "var(--gray-800)", resize: "vertical", boxSizing: "border-box" }}
              />
            </div>

            <div style={{ marginTop: "1.5rem", padding: "1rem", background: "var(--gray-50)", borderRadius: "var(--radius-sm)", border: "1px solid var(--gray-150)", fontSize: "0.875rem", color: "var(--gray-500)", lineHeight: 1.65 }}>
              By submitting, you agree to our{" "}
              <Link href="/terms" style={{ color: "var(--navy)", fontWeight: 600 }}>Terms of Service</Link>{" "}
              and{" "}
              <Link href="/privacy" style={{ color: "var(--navy)", fontWeight: 600 }}>Privacy Policy</Link>.
              Your listing will be reviewed and published within 1–2 business days. You will be redirected to our secure payment page.
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-red"
              style={{ width: "100%", marginTop: "1.5rem", padding: "1rem", fontSize: "1rem", opacity: submitting ? 0.7 : 1, cursor: submitting ? "not-allowed" : "pointer" }}
            >
              {submitting ? "Redirecting to payment…" : "Continue to Payment — $14.90 →"}
            </button>

            <p style={{ textAlign: "center", marginTop: "1rem", fontSize: "0.875rem", color: "var(--gray-500)" }}>
              Already listed?{" "}
              <Link href="/login" style={{ color: "var(--navy)", fontWeight: 600 }}>Sign in to your account</Link>
            </p>
          </form>
        </div>

        {/* Why join */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginTop: "2rem" }}>
          {[
            { icon: "💰", title: "$14.90 First Month", desc: "Then $29.90/month, cancel anytime" },
            { icon: "🔍", title: "Get Discovered", desc: "Contractors actively searching" },
            { icon: "📞", title: "Direct Contact", desc: "Leads contact you directly" },
          ].map(i => (
            <div key={i.title} className="card" style={{ padding: "1.25rem", textAlign: "center" }}>
              <div style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>{i.icon}</div>
              <div style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "0.25rem", fontSize: "0.9375rem" }}>{i.title}</div>
              <div style={{ fontSize: "0.8125rem", color: "var(--gray-500)" }}>{i.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
