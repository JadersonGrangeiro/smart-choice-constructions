import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Smart Choice Constructions LLC — how we collect, use, and protect your information.",
};

const SECTIONS = [
  {
    title: "1. Who We Are",
    body: "Smart Choice Constructions LLC ('Company', 'we', 'us', 'our') operates a marketplace platform at smartchoiceconstructions.com. This Privacy Policy explains how we collect, use, store, and share personal information when you use our Platform.",
  },
  {
    title: "2. Information We Collect",
    body: "We collect information you provide when registering an account, creating a contractor profile, submitting a quote request, or contacting us — including name, email address, phone number, postal address, ZIP code, business information, and project descriptions. We also collect usage data such as pages visited, search queries, device type, browser, and IP address through standard web analytics tools. Contractors who submit verification documents provide additional information including license numbers, insurance policy numbers, and identity documents.",
  },
  {
    title: "3. How We Use Your Information",
    body: "We use collected information to operate and improve the Platform, facilitate connections between Homeowners and Contractors, communicate with you about your account, send service-related notifications, process payments through our third-party payment processor (Stripe), and analyze Platform usage. We do not sell your personal information to third parties for advertising or marketing purposes.",
  },
  {
    title: "4. Sharing of Information",
    body: "When a Homeowner submits a quote request or initiates contact with a Contractor, relevant contact information is shared with that Contractor for the purpose of responding to the inquiry only. Contractors are contractually prohibited from using Homeowner information for purposes unrelated to the specific inquiry. We share information with third-party service providers who assist us in operating the Platform (such as payment processors, email service providers, and analytics providers), subject to confidentiality obligations. We may disclose information when required by law or to protect the rights and safety of users.",
  },
  {
    title: "5. Contractor Profile Information",
    body: "Information that Contractors enter into their public profiles — including company name, service descriptions, contact information, and photos — is publicly visible to all visitors of the Platform. Contractors are responsible for the accuracy of their own profile content. Submitted verification documents are reviewed internally and are not publicly displayed; only the resulting badge status is shown.",
  },
  {
    title: "6. Data Security",
    body: "We implement industry-standard security measures including TLS/SSL encryption, access controls, and regular security reviews. No method of transmission over the internet or electronic storage is completely secure. We cannot guarantee absolute security but take reasonable precautions to protect your information.",
  },
  {
    title: "7. Payment Information",
    body: "Payment processing is handled entirely by Stripe, Inc. We do not collect, store, or process credit card numbers or other payment card data. Your payment information is governed by Stripe's privacy policy. We receive only confirmation of payment status and last four digits of the card for display purposes.",
  },
  {
    title: "8. Cookies and Tracking",
    body: "We use cookies for session management, language preferences, and analytics. For full details, see our Cookie Policy. You may control cookie preferences through your browser settings.",
  },
  {
    title: "9. Your Rights",
    body: "You may request access to, correction of, or deletion of your personal information at any time by contacting us. You may opt out of marketing communications at any time. Residents of California, Virginia, Colorado, and other states with applicable data privacy laws may have additional rights under those laws. To exercise any privacy rights, contact us at the address below.",
  },
  {
    title: "10. Data Retention",
    body: "We retain account information for the duration of your account and for a reasonable period thereafter for legal, compliance, and dispute resolution purposes. Contractor profile data is retained for the duration of an active subscription and for 30 days after cancellation, after which it is deleted unless otherwise required by law.",
  },
  {
    title: "11. Children's Privacy",
    body: "The Platform is not directed to individuals under 18 years of age. We do not knowingly collect personal information from minors. If you believe a minor has submitted personal information through the Platform, please contact us immediately.",
  },
  {
    title: "12. Changes to This Policy",
    body: "We may update this Privacy Policy from time to time. Material changes will be communicated via email or prominent notice on the Platform at least 30 days before taking effect. Continued use of the Platform after the effective date constitutes acceptance.",
  },
  {
    title: "13. Contact Us",
    body: "For privacy inquiries, requests, or complaints: jadersoneua@gmail.com — Smart Choice Constructions LLC, 2222 W Grand River Ave Ste A, Okemos, MI 48864.",
  },
];

export default function PrivacyPage() {
  return (
    <div style={{ paddingTop: "76px" }}>
      <div style={{ background: "var(--navy)", padding: "4rem 0 3rem" }}>
        <div className="container">
          <nav aria-label="Breadcrumb" style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", fontSize: "0.875rem", color: "rgba(255,255,255,0.5)" }}>
            <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>Home</Link>
            <span>/</span>
            <span style={{ color: "rgba(255,255,255,0.85)" }}>Privacy Policy</span>
          </nav>
          <h1 className="heading-lg" style={{ color: "white" }}>Privacy Policy</h1>
          <p style={{ color: "rgba(255,255,255,0.55)", marginTop: "0.75rem" }}>Last updated: June 1, 2025</p>
        </div>
      </div>

      <div className="container-narrow" style={{ padding: "3.5rem 1.5rem" }}>
        {SECTIONS.map((s, i) => (
          <div key={i} style={{ marginBottom: "2.5rem" }}>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--navy)", marginBottom: "0.875rem" }}>{s.title}</h2>
            <p style={{ color: "var(--gray-600)", lineHeight: 1.85 }}>{s.body}</p>
          </div>
        ))}
        <div style={{ borderTop: "1px solid var(--gray-100)", paddingTop: "2rem", display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
          <Link href="/terms" style={{ color: "var(--navy)", fontWeight: 600, textDecoration: "none" }}>Terms of Service →</Link>
          <Link href="/cookies" style={{ color: "var(--navy)", fontWeight: 600, textDecoration: "none" }}>Cookie Policy →</Link>
        </div>
      </div>
    </div>
  );
}
