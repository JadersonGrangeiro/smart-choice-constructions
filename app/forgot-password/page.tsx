"use client";
import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");

  return (
    <div style={{ paddingTop: "76px", minHeight: "100vh", background: "var(--gray-50)", display: "flex", alignItems: "center" }}>
      <div className="container" style={{ maxWidth: "440px", padding: "3rem 1.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🔑</div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--navy)", marginBottom: "0.5rem" }}>
            {sent ? "Check your email" : "Reset your password"}
          </h1>
          <p style={{ color: "var(--gray-500)", lineHeight: 1.65 }}>
            {sent
              ? `We sent a reset link to ${email}. Check your inbox and follow the instructions.`
              : "Enter the email address on your account and we'll send you a link to reset your password."}
          </p>
        </div>

        {!sent ? (
          <div className="card" style={{ padding: "2rem" }}>
            <div style={{ marginBottom: "1.25rem" }}>
              <label className="form-label">Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="form-input"
              />
            </div>
            <button
              className="btn-red"
              style={{ width: "100%", padding: "1rem" }}
              onClick={() => email && setSent(true)}
            >
              Send Reset Link
            </button>
            <div style={{ textAlign: "center", marginTop: "1.25rem" }}>
              <Link href="/login" style={{ fontSize: "0.9rem", color: "var(--navy)", textDecoration: "none", fontWeight: 500 }}>
                ← Back to sign in
              </Link>
            </div>
          </div>
        ) : (
          <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
            <div style={{ background: "rgba(22,163,74,0.08)", border: "1px solid rgba(22,163,74,0.2)", borderRadius: "var(--radius)", padding: "1.25rem", marginBottom: "1.5rem", fontSize: "0.9375rem", color: "#15803d" }}>
              Reset link sent. It expires in 30 minutes.
            </div>
            <p style={{ fontSize: "0.875rem", color: "var(--gray-500)", marginBottom: "1.5rem", lineHeight: 1.65 }}>
              Didn't receive the email? Check your spam folder, or try a different address.
            </p>
            <button className="btn-secondary" style={{ width: "100%" }} onClick={() => setSent(false)}>
              Try a different email
            </button>
            <div style={{ marginTop: "1rem" }}>
              <Link href="/login" style={{ fontSize: "0.875rem", color: "var(--navy)", textDecoration: "none", fontWeight: 600 }}>
                Back to sign in →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
