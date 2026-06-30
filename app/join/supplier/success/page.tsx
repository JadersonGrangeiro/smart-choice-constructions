"use client";
import Link from "next/link";
import { COMPANY } from "@/lib/data";

export default function SupplierSuccessPage() {
  return (
    <div style={{ paddingTop: "76px", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--gray-50)" }}>
      <div style={{ background: "white", borderRadius: "var(--radius-xl)", padding: "3rem 2.5rem", textAlign: "center", maxWidth: "520px", margin: "2rem", boxShadow: "var(--shadow-xl)" }}>
        <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>🎉</div>
        <h1 style={{ fontWeight: 800, color: "var(--navy)", fontSize: "1.75rem", marginBottom: "0.75rem" }}>
          Payment Confirmed!
        </h1>
        <p style={{ color: "var(--gray-600)", lineHeight: 1.7, marginBottom: "1.5rem" }}>
          Thank you for joining the Smart Choice Supplier Directory. Our team will review your listing and have it live within <strong>1–2 business days</strong>.
        </p>
        <div style={{ background: "var(--gray-50)", borderRadius: "var(--radius)", padding: "1.25rem", marginBottom: "2rem", textAlign: "left" }}>
          {[
            "You'll receive a confirmation email shortly",
            "Your listing goes live after our review",
            "Local contractors will be able to find and contact you directly",
          ].map(item => (
            <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", marginBottom: "0.625rem", fontSize: "0.9375rem", color: "var(--gray-700)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0, marginTop: "2px" }}><path d="M5 13l4 4L19 7"/></svg>
              {item}
            </div>
          ))}
        </div>
        <p style={{ color: "var(--gray-500)", fontSize: "0.9375rem", marginBottom: "2rem" }}>
          Questions? Email us at{" "}
          <a href={`mailto:${COMPANY.email}`} style={{ color: "var(--navy)", fontWeight: 600 }}>{COMPANY.email}</a>
        </p>
        <Link href="/" className="btn-red" style={{ display: "block", textAlign: "center", padding: "0.875rem" }}>
          Back to Home
        </Link>
      </div>
    </div>
  );
}
