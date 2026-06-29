import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for Smart Choice Constructions LLC — the marketplace connecting homeowners with local construction professionals.",
};

const SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    body: "By accessing or using Smart Choice Constructions (the 'Platform'), you agree to these Terms of Service. If you do not agree to any part of these terms, do not use the Platform.",
  },
  {
    title: "2. Nature of the Platform",
    body: "Smart Choice Constructions LLC ('Company', 'we', 'us') operates a marketplace that allows construction professionals ('Contractors') to list their services and allows property owners ('Homeowners') to browse and contact those Contractors. The Company does not perform construction services, does not employ Contractors, does not supervise Contractors, does not verify the quality of work performed, and is not a party to any agreement between Homeowners and Contractors. The Company is a marketplace only.",
  },
  {
    title: "3. No Guarantee of Contractor Quality",
    body: "The Company does not guarantee, warrant, or represent the competency, quality, safety, legality, or suitability of any Contractor listed on the Platform. Contractors are independent third parties. The Company does not conduct background checks, license verifications, insurance verifications, or reference checks on all Contractors as a condition of listing. Where a Contractor has voluntarily submitted documentation and that documentation has been reviewed, a badge may be displayed — but the presence or absence of any badge does not constitute a guarantee or warranty of any kind.",
  },
  {
    title: "4. Credential Verification Limitations",
    body: "Some Contractors may display badges indicating that certain documents (such as licenses or insurance certificates) have been submitted and reviewed. These badges reflect only that a document was received and appeared valid at the time of review. The Company does not continuously monitor credential status. Licenses may expire, insurance may lapse, and credentials may be revoked after review. Homeowners are solely responsible for independently verifying any Contractor's credentials, licensing, insurance, and references before entering any agreement or allowing work to begin.",
  },
  {
    title: "5. No Guarantee of Availability, Pricing, or Timeline",
    body: "The Company does not guarantee the availability of any Contractor, the accuracy of any pricing estimate, or the completion timeline for any project. Any information provided by Contractors through their profiles is self-reported and has not been independently verified by the Company.",
  },
  {
    title: "6. Homeowner Responsibilities",
    body: "Homeowners are solely responsible for: (a) independently verifying all Contractor credentials before hiring; (b) entering into written agreements directly with Contractors; (c) obtaining necessary permits; (d) confirming insurance coverage; and (e) making payment arrangements directly with Contractors. The Company is not responsible for any work performed, not performed, or defectively performed by any Contractor.",
  },
  {
    title: "7. Contractor Responsibilities",
    body: "Contractors are responsible for maintaining accurate profile information, holding all required licenses and insurance for their jurisdiction and trade, complying with applicable laws, and providing services directly to Homeowners. Contractors must not misrepresent their credentials, experience, or capabilities. Contractors bear sole responsibility for work performed.",
  },
  {
    title: "8. Contractor Subscriptions",
    body: "Contractors subscribe monthly. The first month is $29.90. Subsequent months are $49.90/month. Subscriptions renew automatically until cancelled. Cancellations take effect at the end of the current billing period. No refunds are issued for partial months. The Company reserves the right to suspend or remove Contractor profiles for violation of these Terms.",
  },
  {
    title: "9. Prohibited Conduct",
    body: "Users may not: (a) post false or misleading information; (b) harass or threaten other users; (c) use the Platform for unlawful purposes; (d) attempt to circumvent the Platform to avoid subscription fees; (e) scrape or copy content; or (f) impersonate any person or entity. Violations may result in immediate account termination.",
  },
  {
    title: "10. Limitation of Liability",
    body: "TO THE MAXIMUM EXTENT PERMITTED BY LAW, SMART CHOICE CONSTRUCTIONS LLC AND ITS OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM: (A) ANY CONTRACTOR'S WORK OR FAILURE TO WORK; (B) ANY DISPUTE BETWEEN A HOMEOWNER AND A CONTRACTOR; (C) RELIANCE ON ANY PROFILE INFORMATION; (D) PLATFORM INTERRUPTIONS; OR (E) ANY OTHER MATTER RELATED TO THE PLATFORM, REGARDLESS OF THE THEORY OF LIABILITY. THE COMPANY'S TOTAL LIABILITY SHALL NOT EXCEED THE GREATER OF $100 OR THE AMOUNT PAID BY THE APPLICABLE USER IN THE 12 MONTHS PRECEDING THE CLAIM.",
  },
  {
    title: "11. Indemnification",
    body: "You agree to indemnify, defend, and hold harmless Smart Choice Constructions LLC and its affiliates, officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including attorneys' fees) arising from your use of the Platform, your violation of these Terms, or your interaction with any other user.",
  },
  {
    title: "12. Disclaimer of Warranties",
    body: "THE PLATFORM IS PROVIDED 'AS IS' AND 'AS AVAILABLE' WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT. THE COMPANY DOES NOT WARRANT THAT THE PLATFORM WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.",
  },
  {
    title: "13. Governing Law and Disputes",
    body: "These Terms are governed by the laws of the State of Michigan, without regard to conflict of law principles. Any disputes shall be resolved exclusively in the state or federal courts located in Ingham County, Michigan. By using the Platform, you consent to personal jurisdiction in those courts.",
  },
  {
    title: "14. Changes to These Terms",
    body: "The Company reserves the right to modify these Terms at any time. Material changes will be communicated via email or prominent notice on the Platform. Continued use after changes constitutes acceptance of the updated Terms.",
  },
  {
    title: "15. Contact",
    body: "Questions about these Terms may be directed to: jadersoneua@gmail.com — Smart Choice Constructions LLC, 2222 W Grand River Ave Ste A, Okemos, MI 48864.",
  },
];

export default function TermsPage() {
  return (
    <div style={{ paddingTop: "76px" }}>
      <div style={{ background: "var(--navy)", padding: "4rem 0 3rem" }}>
        <div className="container">
          <nav aria-label="Breadcrumb" style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", fontSize: "0.875rem", color: "rgba(255,255,255,0.5)" }}>
            <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>Home</Link>
            <span>/</span>
            <span style={{ color: "rgba(255,255,255,0.85)" }}>Terms of Service</span>
          </nav>
          <h1 className="heading-lg" style={{ color: "white" }}>Terms of Service</h1>
          <p style={{ color: "rgba(255,255,255,0.55)", marginTop: "0.75rem" }}>
            Last updated: June 1, 2025 &nbsp;·&nbsp; Effective immediately upon use of the Platform
          </p>
        </div>
      </div>

      <div className="container-narrow" style={{ padding: "3.5rem 1.5rem" }}>
        <div style={{ background: "rgba(200,16,46,0.05)", border: "1px solid rgba(200,16,46,0.15)", borderRadius: "var(--radius)", padding: "1.25rem 1.5rem", marginBottom: "2.5rem" }}>
          <p style={{ color: "var(--gray-700)", fontSize: "0.9375rem", lineHeight: 1.75 }}>
            <strong style={{ color: "var(--red)" }}>Important:</strong> Smart Choice Constructions LLC is a marketplace platform only. We do not perform construction services, employ contractors, verify the quality of work, or guarantee contractor credentials, availability, or pricing. Please read these Terms carefully before using the Platform.
          </p>
        </div>

        {SECTIONS.map((s, i) => (
          <div key={i} style={{ marginBottom: "2.5rem" }}>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--navy)", marginBottom: "0.875rem" }}>{s.title}</h2>
            <p style={{ color: "var(--gray-600)", lineHeight: 1.85 }}>{s.body}</p>
          </div>
        ))}

        <div style={{ borderTop: "1px solid var(--gray-100)", paddingTop: "2rem", display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
          <Link href="/privacy" style={{ color: "var(--navy)", fontWeight: 600, textDecoration: "none" }}>Privacy Policy →</Link>
          <Link href="/cookies" style={{ color: "var(--navy)", fontWeight: 600, textDecoration: "none" }}>Cookie Policy →</Link>
          <Link href="/contact" style={{ color: "var(--navy)", fontWeight: 600, textDecoration: "none" }}>Contact Us →</Link>
        </div>
      </div>
    </div>
  );
}
