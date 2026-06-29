"use client";
import { useState } from "react";
import Link from "next/link";
import { CATEGORIES, US_STATES } from "@/lib/data";
import { useI18n } from "@/lib/i18n/context";

interface FormData {
  category: string; description: string; timeline: string; budget: string;
  state: string; city: string; zip: string; address: string;
  firstName: string; lastName: string; email: string; phone: string; bestTime: string;
}

const INITIAL: FormData = {
  category: "", description: "", timeline: "As soon as possible", budget: "Not sure yet",
  state: "", city: "", zip: "", address: "",
  firstName: "", lastName: "", email: "", phone: "", bestTime: "Anytime",
};

export default function RequestQuotePage() {
  const { t } = useI18n();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(INITIAL);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  async function handleSubmit() {
    if (!form.firstName || !form.email || !form.phone) {
      setError("Please fill in your name, email, and phone number.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_type: form.category || "General Contractor",
          description: `${form.description}\n\nTimeline: ${form.timeline}\nBudget: ${form.budget}`,
          budget_range: form.budget,
          city: form.city,
          state_code: form.state,
          zip_code: form.zip,
          contact_name: `${form.firstName} ${form.lastName}`.trim(),
          contact_email: form.email,
          contact_phone: form.phone,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div style={{ paddingTop: "76px", minHeight: "100vh", background: "var(--gray-50)", display: "flex", alignItems: "center" }}>
        <div className="container" style={{ textAlign: "center", maxWidth: "560px", padding: "4rem 1.5rem" }}>
          <div style={{ width: "80px", height: "80px", background: "rgba(22,163,74,0.1)", border: "2px solid rgba(22,163,74,0.3)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem", fontSize: "2.5rem" }}>✅</div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--navy)", marginBottom: "1rem" }}>Request Submitted!</h1>
          <p style={{ color: "var(--gray-600)", lineHeight: 1.75, marginBottom: "2rem", fontSize: "1.0625rem" }}>
            We've received your project request and are matching you with verified contractors in your area. You'll hear back within minutes.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/find-contractors" className="btn-primary">Browse More Contractors</Link>
            <Link href="/" className="btn-secondary">Back to Home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: "76px", minHeight: "100vh", background: "var(--gray-50)" }}>
      <div style={{ background: "var(--navy)", padding: "3.5rem 0 3rem", textAlign: "center" }}>
        <div className="container">
          <h1 className="heading-lg" style={{ color: "white", marginBottom: "0.75rem" }}>Get Free Contractor Quotes</h1>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "1.0625rem" }}>Describe your project and we'll match you with verified pros in minutes.</p>
          <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginTop: "1.5rem" }}>
            {[["Project","1"],["Location","2"],["Contact","3"]].map(([label, s]) => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: parseInt(s) <= step ? "var(--red)" : "rgba(255,255,255,0.15)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8125rem", fontWeight: 700 }}>
                  {parseInt(s) < step ? "✓" : s}
                </div>
                <span style={{ color: parseInt(s) <= step ? "white" : "rgba(255,255,255,0.4)", fontSize: "0.8125rem" }}>{label}</span>
                {s !== "3" && <div style={{ width: "24px", height: "1px", background: "rgba(255,255,255,0.15)" }} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: "3rem 1.5rem", maxWidth: "600px" }}>
        {step === 1 && (
          <div className="card" style={{ padding: "2.5rem" }}>
            <h2 style={{ fontWeight: 700, fontSize: "1.375rem", color: "var(--navy)", marginBottom: "2rem" }}>Tell Us About Your Project</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div>
                <label className="form-label">Service Category *</label>
                <select className="form-select" value={form.category} onChange={set("category")}>
                  <option value="">Select the service you need</option>
                  {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Project Description *</label>
                <textarea placeholder="Describe your project in detail — size, scope, materials, and preferred timeline..." className="form-input" rows={5} style={{ resize: "vertical" }} value={form.description} onChange={set("description")} />
              </div>
              <div>
                <label className="form-label">When Do You Need This Done?</label>
                <select className="form-select" value={form.timeline} onChange={set("timeline")}>
                  {["As soon as possible","Within 1 week","Within 1 month","Within 3 months","Planning ahead"].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Estimated Budget</label>
                <select className="form-select" value={form.budget} onChange={set("budget")}>
                  {["Under $1,000","$1,000 – $5,000","$5,000 – $15,000","$15,000 – $50,000","$50,000+","Not sure yet"].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
            <button className="btn-red" onClick={() => setStep(2)} style={{ width: "100%", marginTop: "2rem", padding: "1rem" }}>
              Continue →
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="card" style={{ padding: "2.5rem" }}>
            <h2 style={{ fontWeight: 700, fontSize: "1.375rem", color: "var(--navy)", marginBottom: "2rem" }}>Where Is the Project?</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div>
                <label className="form-label">State *</label>
                <select className="form-select" value={form.state} onChange={set("state")}>
                  <option value="">Select your state</option>
                  {US_STATES.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
                </select>
              </div>
              <div><label className="form-label">City *</label><input placeholder="City" className="form-input" value={form.city} onChange={set("city")} /></div>
              <div><label className="form-label">ZIP Code *</label><input placeholder="12345" className="form-input" maxLength={5} value={form.zip} onChange={set("zip")} /></div>
              <div><label className="form-label">Street Address (optional)</label><input placeholder="Street address" className="form-input" value={form.address} onChange={set("address")} /></div>
            </div>
            <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
              <button className="btn-secondary" onClick={() => setStep(1)} style={{ flex: 1 }}>← Back</button>
              <button className="btn-red" onClick={() => setStep(3)} style={{ flex: 2 }}>Continue →</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="card" style={{ padding: "2.5rem" }}>
            <h2 style={{ fontWeight: 700, fontSize: "1.375rem", color: "var(--navy)", marginBottom: "2rem" }}>Your Contact Information</h2>
            {error && (
              <div style={{ background: "rgba(199,25,26,0.08)", border: "1px solid rgba(199,25,26,0.2)", borderRadius: "var(--radius-sm)", padding: "0.75rem 1rem", marginBottom: "1.25rem", fontSize: "0.875rem", color: "var(--red)" }}>
                {error}
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div><label className="form-label">First Name *</label><input placeholder="John" className="form-input" value={form.firstName} onChange={set("firstName")} /></div>
                <div><label className="form-label">Last Name *</label><input placeholder="Smith" className="form-input" value={form.lastName} onChange={set("lastName")} /></div>
              </div>
              <div><label className="form-label">Email Address *</label><input type="email" placeholder="john@example.com" className="form-input" value={form.email} onChange={set("email")} /></div>
              <div><label className="form-label">Phone Number *</label><input type="tel" placeholder="+1 (555) 000-0000" className="form-input" value={form.phone} onChange={set("phone")} /></div>
              <div>
                <label className="form-label">Best Time to Reach You</label>
                <select className="form-select" value={form.bestTime} onChange={set("bestTime")}>
                  {["Morning (8am–12pm)","Afternoon (12pm–5pm)","Evening (5pm–8pm)","Anytime"].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div style={{ background: "var(--gray-50)", borderRadius: "var(--radius)", padding: "1rem", fontSize: "0.8125rem", color: "var(--gray-500)" }}>
                🔒 Your information is shared only with contractors you choose to connect with.
              </div>
            </div>
            <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
              <button className="btn-secondary" onClick={() => setStep(2)} style={{ flex: 1 }}>← Back</button>
              <button className="btn-red" onClick={handleSubmit} disabled={loading} style={{ flex: 2, padding: "1rem", opacity: loading ? 0.7 : 1 }}>
                {loading ? "Submitting..." : "Submit Request — Free"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
