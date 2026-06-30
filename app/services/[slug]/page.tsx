import Link from "next/link";
import { CATEGORIES, US_STATES } from "@/lib/data";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return CATEGORIES.map(cat => ({ slug: cat.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const cat = CATEGORIES.find(c => c.id === slug);
  if (!cat) return {};
  return {
    title: `${cat.name} Contractors Near You`,
    description: `Find verified, licensed ${cat.name.toLowerCase()} contractors in your area. Get free quotes from credential-verified professionals.`,
  };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cat = CATEGORIES.find(c => c.id === slug);
  if (!cat) notFound();

  const topStates = US_STATES.slice(0, 12);
  const relatedCats = CATEGORIES.filter(c => c.id !== slug).slice(0, 6);

  return (
    <div style={{ paddingTop: "72px" }}>
      <div style={{ background: `linear-gradient(160deg, var(--navy-dark), var(--blue))`, padding: "4rem 0 3rem" }}>
        <div className="container">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem", fontSize: "0.875rem", color: "rgba(255,255,255,0.5)" }}>
            <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>Home</Link>
            <span>/</span>
            <Link href="/services" style={{ color: "inherit", textDecoration: "none" }}>Services</Link>
            <span>/</span>
            <span style={{ color: "rgba(255,255,255,0.8)" }}>{cat.name}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "1.5rem" }}>
            <div style={{ width: "72px", height: "72px", background: "rgba(255,255,255,0.12)", borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.5rem", flexShrink: 0 }}>{cat.icon}</div>
            <div>
              <h1 className="heading-lg" style={{ color: "white", marginBottom: "0.5rem" }}>{cat.name} Contractors</h1>
              <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "1.0625rem" }}>Verified, licensed, and insured {cat.name.toLowerCase()} professionals near you</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <Link href={`/request-quote?service=${cat.id}`} className="btn-primary">Get Free Quotes</Link>
            <Link href={`/find-contractors?category=${cat.id}`} className="btn-outline-white">Browse Contractors</Link>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: "3rem 1.5rem" }}>
        <div className="grid-2col-sidebar grid-2col-sidebar-lg" style={{ gridTemplateColumns: "2fr 1fr" }}>
          <div>
            <div className="card" style={{ padding: "2rem", marginBottom: "2rem" }}>
              <h2 style={{ fontSize: "1.375rem", fontWeight: 700, color: "var(--navy)", marginBottom: "1rem" }}>About {cat.name} Services</h2>
              <p style={{ color: "var(--gray-600)", lineHeight: 1.75, marginBottom: "1rem" }}>
                Finding a reliable {cat.name.toLowerCase()} contractor doesn't have to be stressful. Smart Choice Construction connects you with verified local professionals who have been local and professional, with reviews from real homeowners in your community.
              </p>
              <p style={{ color: "var(--gray-600)", lineHeight: 1.75 }}>
                Whether you need a quick repair, routine maintenance, or a complete renovation, our network of {cat.name.toLowerCase()} specialists is ready to provide accurate estimates and quality work. All professionals listed on Smart Choice carry appropriate licenses and insurance coverage.
              </p>
            </div>

            <div className="card" style={{ padding: "2rem", marginBottom: "2rem" }}>
              <h2 style={{ fontSize: "1.375rem", fontWeight: 700, color: "var(--navy)", marginBottom: "1.5rem" }}>Why Hire a Professional {cat.name} Contractor?</h2>
              {[
                { title: "Safety & Code Compliance", desc: `Professional ${cat.name.toLowerCase()} work meets local building codes and safety standards.` },
                { title: "Quality Craftsmanship", desc: `Licensed contractors bring years of training and experience, ensuring your project is done right.` },
                { title: "Time & Cost Savings", desc: `Avoid costly mistakes and project delays by working with an experienced professional.` },
                { title: "Warranty Protection", desc: `Most licensed contractors offer warranties on their work for your long-term peace of mind.` },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: "1rem", paddingBottom: "1rem", marginBottom: "1rem", borderBottom: i < 3 ? "1px solid var(--gray-100)" : "none" }}>
                  <div style={{ width: "10px", height: "10px", background: "var(--blue-accent)", borderRadius: "50%", flexShrink: 0, marginTop: "6px" }} />
                  <div>
                    <div style={{ fontWeight: 600, color: "var(--navy)", marginBottom: "0.25rem" }}>{item.title}</div>
                    <div style={{ color: "var(--gray-500)", fontSize: "0.9375rem", lineHeight: 1.65 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="card" style={{ padding: "2rem" }}>
              <h2 style={{ fontSize: "1.375rem", fontWeight: 700, color: "var(--navy)", marginBottom: "1.25rem" }}>{cat.name} Contractors by State</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "0.5rem" }}>
                {topStates.map(state => (
                  <Link key={state.code} href={`/locations/${state.name.toLowerCase().replace(/\s+/g,"-")}/${slug}`}
                    className="state-svc-link"
                    style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem 0.875rem", background: "var(--gray-50)", borderRadius: "var(--radius-sm)", textDecoration: "none", color: "var(--gray-700)", fontSize: "0.875rem", fontWeight: 500, border: "1px solid var(--gray-100)", transition: "all 0.2s ease" }}
                  >
                    <span style={{ background: "var(--navy)", color: "white", borderRadius: "3px", padding: "1px 4px", fontSize: "0.6875rem", fontWeight: 700 }}>{state.code}</span>
                    {state.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="card" style={{ padding: "1.75rem", marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--navy)", marginBottom: "1.25rem" }}>Get Free {cat.name} Quotes</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                <input placeholder="Your ZIP Code" className="form-input" />
                <textarea placeholder="Describe your project..." className="form-input" rows={3} style={{ resize: "vertical" }} />
                <Link href={`/request-quote?service=${cat.id}`} className="btn-primary" style={{ textAlign: "center" }}>Get Free Quotes</Link>
              </div>
              <p style={{ fontSize: "0.8125rem", color: "var(--gray-400)", textAlign: "center", marginTop: "0.75rem" }}>100% free · No commitment required</p>
            </div>

            <div className="card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
              {[
                { icon: "🛡️", label: "Credential Badges",   sub: "Displayed when submitted" },
                { icon: "📋", label: "Licensed & Insured", sub: "State licenses confirmed" },
                { icon: "⭐", label: "Top Rated", sub: "4.8/5 avg rating" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.75rem 0", borderBottom: i < 2 ? "1px solid var(--gray-100)" : "none" }}>
                  <span style={{ fontSize: "1.5rem" }}>{item.icon}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.9375rem", color: "var(--navy)" }}>{item.label}</div>
                    <div style={{ fontSize: "0.8125rem", color: "var(--gray-400)" }}>{item.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="card" style={{ padding: "1.5rem" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--navy)", marginBottom: "1rem" }}>Related Services</h3>
              {relatedCats.map(rc => (
                <Link key={rc.id} href={`/services/${rc.id}`}
                  className="rel-svc-link"
                  style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.625rem 0.75rem", borderRadius: "var(--radius-sm)", textDecoration: "none", color: "var(--gray-700)", fontSize: "0.9375rem", transition: "background 0.15s" }}
                >
                  <span>{rc.icon}</span> {rc.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .state-svc-link:hover { background: white !important; border-color: var(--blue-accent) !important; color: var(--blue-accent) !important; }
        .rel-svc-link:hover { background: var(--gray-50) !important; }
      `}</style>
    </div>
  );
}
