"use client";
import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { COMPANY } from "@/lib/data";

function SuccessContent() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");

  return (
    <div style={{ paddingTop: "76px", minHeight: "100vh", background: "var(--gray-50)", display: "flex", alignItems: "center" }}>
      <div className="container" style={{ maxWidth: "640px", padding: "4rem 1.5rem", textAlign: "center" }}>
        {/* Success icon */}
        <div style={{ width: "96px", height: "96px", background: "rgba(22,163,74,0.1)", border: "2px solid rgba(22,163,74,0.25)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 2rem", fontSize: "3rem" }}>
          🎉
        </div>

        <h1 style={{ fontSize: "2.25rem", fontWeight: 800, color: "var(--navy)", marginBottom: "1rem" }}>
          Welcome to Smart Choice!
        </h1>
        <p style={{ color: "var(--gray-600)", fontSize: "1.0625rem", lineHeight: 1.75, marginBottom: "0.75rem" }}>
          Your subscription is active and your profile is under review.
        </p>
        <p style={{ color: "var(--gray-500)", fontSize: "0.9375rem", lineHeight: 1.75, marginBottom: "2.5rem" }}>
          Our team reviews new profiles within 24 hours. You'll receive an email at the address you provided once your profile is live.
        </p>

        {/* Next steps */}
        <div style={{ background: "white", borderRadius: "var(--radius-xl)", padding: "2rem", boxShadow: "var(--shadow)", border: "1px solid var(--gray-100)", textAlign: "left", marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.0625rem", fontWeight: 700, color: "var(--navy)", marginBottom: "1.25rem" }}>What happens next?</h2>
          {[
            { icon: "📧", title: "Check your email",   desc: `We've sent a confirmation to the address you provided with your account details.` },
            { icon: "🔍", title: "Profile review",     desc: "Our team checks your profile for completeness and verifies your credentials. This takes up to 24 hours." },
            { icon: "✅", title: "Go live",             desc: "Once approved, your profile appears in search results and you start receiving leads." },
            { icon: "📈", title: "Maximize your reach", desc: "Add portfolio photos, upload your license and COI, and complete your service area to rank higher in search." },
          ].map((step, i) => (
            <div key={i} style={{ display: "flex", gap: "1rem", marginBottom: i < 3 ? "1.25rem" : 0 }}>
              <span style={{ fontSize: "1.375rem", flexShrink: 0 }}>{step.icon}</span>
              <div>
                <div style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "0.25rem" }}>{step.title}</div>
                <div style={{ fontSize: "0.875rem", color: "var(--gray-500)", lineHeight: 1.65 }}>{step.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Billing note */}
        <div style={{ background: "rgba(22,46,94,0.05)", border: "1px solid rgba(22,46,94,0.12)", borderRadius: "var(--radius)", padding: "1rem 1.25rem", marginBottom: "2rem", fontSize: "0.875rem", color: "var(--gray-600)", textAlign: "left" }}>
          <strong style={{ color: "var(--navy)" }}>Billing summary:</strong> You've been charged <strong>${COMPANY.pricing.firstMonth.toFixed(2)}</strong> for your first month.
          Starting next month, your subscription will renew automatically at <strong>${COMPANY.pricing.monthly.toFixed(2)}/month</strong>.
          You can manage billing, update your payment method, or cancel anytime from your dashboard.
        </div>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/dashboard/contractor" className="btn-red" style={{ padding: "1rem 2rem" }}>
            Go to My Dashboard
          </Link>
          <Link href="/" className="btn-secondary" style={{ padding: "1rem 2rem" }}>
            Back to Home
          </Link>
        </div>

        <p style={{ marginTop: "2rem", fontSize: "0.8125rem", color: "var(--gray-400)" }}>
          Questions? Email us at{" "}
          <a href={`mailto:${COMPANY.email}`} style={{ color: "var(--navy)", textDecoration: "none" }}>{COMPANY.email}</a>
        </p>
      </div>
    </div>
  );
}

export default function JoinSuccessPage() {
  return (
    <Suspense fallback={<div style={{ paddingTop: "76px", textAlign: "center", padding: "4rem" }}>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
