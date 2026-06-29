import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Careers at Smart Choice Constructions",
  description: "Join the Smart Choice Constructions team and help connect American homeowners with trusted contractors.",
};

const OPENINGS = [
  { title: "Senior Full-Stack Engineer",       dept: "Engineering",  type: "Full-time · Remote",  desc: "Build and scale the platform connecting homeowners with contractors across all 50 states." },
  { title: "Product Designer (UX/UI)",          dept: "Design",       type: "Full-time · Remote",  desc: "Shape the experience for homeowners discovering contractors and professionals building their business." },
  { title: "Contractor Success Manager",        dept: "Operations",   type: "Full-time · Remote",  desc: "Onboard and support contractors, helping them maximize their presence and results on the platform." },
  { title: "SEO & Content Strategist",          dept: "Marketing",    type: "Full-time · Remote",  desc: "Own organic growth across 50+ states and 60+ service categories. Build the content engine." },
  { title: "Customer Support Specialist",       dept: "Support",      type: "Part-time · Remote",  desc: "Be the first point of contact for homeowners and contractors with questions or issues." },
];

export default function CareersPage() {
  return (
    <div style={{ paddingTop: "76px" }}>
      <div style={{ background: "linear-gradient(155deg, var(--navy-dark), var(--navy))", padding: "5rem 0 4rem", textAlign: "center" }}>
        <div className="container">
          <span className="badge badge-white" style={{ marginBottom: "1.5rem" }}>We're Hiring</span>
          <h1 className="heading-xl" style={{ color: "white", marginBottom: "1.25rem" }}>
            Build the Future of Home Services
          </h1>
          <p className="text-lg" style={{ color: "rgba(255,255,255,0.7)", maxWidth: "560px", margin: "0 auto" }}>
            We're a small team with big ambitions. Join us and help make it easier for every American homeowner to find the right professional.
          </p>
        </div>
      </div>

      <section style={{ padding: "5rem 0", background: "white" }}>
        <div className="container" style={{ maxWidth: "800px" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <h2 className="heading-md" style={{ color: "var(--navy)", marginBottom: "1rem" }}>Open Positions</h2>
            <p style={{ color: "var(--gray-500)", fontSize: "1.0625rem" }}>All roles are fully remote. We're building something worth working on.</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {OPENINGS.map((job, i) => (
              <div key={i} className="card" style={{ padding: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1.5rem", flexWrap: "wrap" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
                    <h3 style={{ fontWeight: 700, color: "var(--navy)", fontSize: "1.0625rem" }}>{job.title}</h3>
                    <span className="badge badge-blue" style={{ fontSize: "0.75rem" }}>{job.dept}</span>
                  </div>
                  <div style={{ fontSize: "0.875rem", color: "var(--red)", fontWeight: 600, marginBottom: "0.75rem" }}>{job.type}</div>
                  <p style={{ color: "var(--gray-500)", fontSize: "0.9375rem", lineHeight: 1.65 }}>{job.desc}</p>
                </div>
                <a
                  href={`mailto:hello@smartchoiceconstructions.com?subject=Application: ${encodeURIComponent(job.title)}`}
                  className="btn-red"
                  style={{ padding: "0.75rem 1.5rem", fontSize: "0.875rem", flexShrink: 0 }}
                >
                  Apply Now
                </a>
              </div>
            ))}
          </div>

          <div style={{ marginTop: "3rem", background: "var(--gray-50)", borderRadius: "var(--radius-xl)", padding: "2.5rem", textAlign: "center" }}>
            <h3 style={{ fontWeight: 700, color: "var(--navy)", fontSize: "1.25rem", marginBottom: "0.75rem" }}>Don't see your role?</h3>
            <p style={{ color: "var(--gray-500)", marginBottom: "1.5rem" }}>
              We're always open to hearing from talented people. Send us a note and tell us how you'd contribute.
            </p>
            <a href="mailto:hello@smartchoiceconstructions.com?subject=General Application" className="btn-primary">
              Get in Touch
            </a>
          </div>
        </div>
      </section>

      <section style={{ background: "var(--navy)", padding: "4rem 0" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "2rem", textAlign: "center" }}>
            {[
              { icon: "🌎", label: "Fully Remote",         sub: "Work from anywhere in the US" },
              { icon: "🏥", label: "Health Benefits",       sub: "Medical, dental, and vision" },
              { icon: "📈", label: "Equity",                sub: "Meaningful ownership stake" },
              { icon: "🎓", label: "Learning Budget",       sub: "$1,500/year for growth" },
            ].map((b, i) => (
              <div key={i}>
                <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>{b.icon}</div>
                <div style={{ fontWeight: 700, color: "white", marginBottom: "0.375rem" }}>{b.label}</div>
                <div style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.55)" }}>{b.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
