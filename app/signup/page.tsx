"use client";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";

export default function SignupPage() {
  const { t } = useI18n();
  return (
    <div style={{ paddingTop: "76px", minHeight: "100vh", background: "var(--gray-50)", display: "flex", alignItems: "center" }}>
      <div className="container" style={{ maxWidth: "460px", padding: "3rem 1.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🏠</div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--navy)", marginBottom: "0.5rem" }}>Create a Homeowner Account</h1>
          <p style={{ color: "var(--gray-500)" }}>Free forever. No credit card required.</p>
        </div>
        <div className="card" style={{ padding: "2rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.125rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div><label className="form-label">First Name *</label><input placeholder="John" className="form-input" /></div>
              <div><label className="form-label">Last Name *</label><input placeholder="Smith" className="form-input" /></div>
            </div>
            <div><label className="form-label">Email Address *</label><input type="email" placeholder="john@example.com" className="form-input" /></div>
            <div><label className="form-label">Password *</label><input type="password" placeholder="Minimum 8 characters" className="form-input" /></div>
            <div><label className="form-label">ZIP Code *</label><input placeholder="48864" maxLength={5} className="form-input" /></div>
            <button className="btn-primary" style={{ padding: "1rem" }}>Create Free Account</button>
          </div>
          <p style={{ fontSize: "0.8125rem", color: "var(--gray-400)", textAlign: "center", marginTop: "1rem" }}>
            By signing up you agree to our{" "}
            <Link href="/terms" style={{ color: "var(--navy)" }}>Terms</Link> and{" "}
            <Link href="/privacy" style={{ color: "var(--navy)" }}>Privacy Policy</Link>.
          </p>
          <div style={{ textAlign: "center", marginTop: "1.25rem", fontSize: "0.9375rem", color: "var(--gray-500)" }}>
            Already have an account? <Link href="/login" style={{ color: "var(--navy)", fontWeight: 700, textDecoration: "none" }}>Sign In</Link>
          </div>
          <div style={{ textAlign: "center", marginTop: "0.75rem", fontSize: "0.875rem", color: "var(--gray-400)" }}>
            Are you a contractor? <Link href="/join" style={{ color: "var(--navy)", textDecoration: "none", fontWeight: 600 }}>Join here →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
