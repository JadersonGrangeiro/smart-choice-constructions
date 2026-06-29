"use client";
import Link from "next/link";
import { useState } from "react";
import { useI18n } from "@/lib/i18n/context";

export default function LoginPage() {
  const { t } = useI18n();
  const [tab, setTab] = useState<"homeowner"|"contractor">("homeowner");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setError("");
  };

  return (
    <div style={{ paddingTop: "76px", minHeight: "100vh", background: "var(--gray-50)", display: "flex", alignItems: "center" }}>
      <div className="container" style={{ maxWidth: "460px", padding: "3rem 1.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <svg width="48" height="40" viewBox="0 0 120 90" fill="none" style={{ margin: "0 auto 1rem", display: "block" }}>
            <polyline points="10,72 60,18 88,51" stroke="var(--navy)" strokeWidth="8" strokeLinejoin="round" strokeLinecap="round" fill="none"/>
            <rect x="74" y="28" width="11" height="22" rx="1.5" fill="var(--navy)"/>
            <line x1="88" y1="51" x2="116" y2="51" stroke="var(--navy)" strokeWidth="8" strokeLinecap="round"/>
            <rect x="43" y="42" width="8" height="8" rx="1" fill="var(--red)"/>
            <rect x="53" y="42" width="8" height="8" rx="1" fill="var(--red)"/>
            <rect x="43" y="52" width="8" height="8" rx="1" fill="var(--red)"/>
            <rect x="53" y="52" width="8" height="8" rx="1" fill="var(--red)"/>
          </svg>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--navy)", marginBottom: "0.5rem" }}>Welcome back</h1>
          <p style={{ color: "var(--gray-500)" }}>Sign in to your account</p>
        </div>

        <div style={{ display: "flex", background: "var(--gray-100)", borderRadius: "var(--radius)", padding: "4px", marginBottom: "2rem" }}>
          {(["homeowner","contractor"] as const).map(tp => (
            <button key={tp} onClick={() => setTab(tp)} style={{
              flex: 1, padding: "0.625rem", borderRadius: "calc(var(--radius) - 4px)",
              background: tab === tp ? "white" : "transparent",
              border: "none", cursor: "pointer", fontWeight: 700, fontFamily: "inherit",
              fontSize: "0.9375rem", color: tab === tp ? "var(--navy)" : "var(--gray-500)",
              boxShadow: tab === tp ? "var(--shadow-sm)" : "none", transition: "all 0.2s", textTransform: "capitalize",
            }}>
              {tp === "homeowner" ? "Homeowner" : "Contractor"}
            </button>
          ))}
        </div>

        <div className="card" style={{ padding: "2rem" }}>
          {error && (
            <div style={{ background: "rgba(199,25,26,0.08)", border: "1px solid rgba(199,25,26,0.2)", borderRadius: "var(--radius-sm)", padding: "0.75rem 1rem", marginBottom: "1.25rem", fontSize: "0.875rem", color: "var(--red)" }}>
              {error}
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.125rem" }}>
            <div>
              <label className="form-label">Email Address</label>
              <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} className="form-input" />
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
                <Link href="/forgot-password" style={{ fontSize: "0.8125rem", color: "var(--navy)", textDecoration: "none", fontWeight: 500 }}>Forgot password?</Link>
              </div>
              <input type="password" placeholder="Your password" value={password} onChange={e => setPassword(e.target.value)} className="form-input" />
            </div>
            <button className="btn-primary" onClick={handleSubmit} style={{ padding: "1rem" }}>{t.nav.signIn}</button>
          </div>
          <div style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.9375rem", color: "var(--gray-500)" }}>
            Don't have an account?{" "}
            <Link href={tab === "contractor" ? "/join" : "/signup"} style={{ color: "var(--navy)", fontWeight: 700, textDecoration: "none" }}>
              {tab === "contractor" ? "Join as Contractor" : "Sign Up Free"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
