import Link from "next/link";
import { US_STATES, CATEGORIES, FAQ_ITEMS } from "@/lib/data";
import { getStateBySlug, cityToSlug, slugToCity } from "@/lib/locations";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export async function generateStaticParams() {
  const params: { state: string; city: string; service: string }[] = [];
  // Priority states get full coverage; others get top 3 cities × top 8 categories
  const PRIORITY_STATE_CODES = ["TX","CA","FL","NY","IL","GA","WA","CO","AZ","NC"];
  const TOP_CAT_COUNT = 18;
  US_STATES.forEach(s => {
    const isPriority = PRIORITY_STATE_CODES.includes(s.code);
    const cityLimit  = isPriority ? 6 : 2;
    s.cities.slice(0, cityLimit).forEach(city => {
      CATEGORIES.slice(0, TOP_CAT_COUNT).forEach(cat => {
        params.push({ state: s.slug, city: cityToSlug(city), service: cat.id });
      });
    });
  });
  return params;
}

export async function generateMetadata({ params }: { params: Promise<{ state: string; city: string; service: string }> }): Promise<Metadata> {
  const { state, city, service } = await params;
  const st = getStateBySlug(state);
  const cat = CATEGORIES.find(c => c.id === service);
  const cityName = slugToCity(city);
  if (!st || !cat) return {};
  return {
    title: `${cat.name} Contractors in ${cityName}, ${st.name}`,
    description: `Find licensed, verified ${cat.name.toLowerCase()} contractors in ${cityName}, ${st.name}. Local professionals, free quotes, no commitment.`,
    openGraph: { title: `${cat.name} in ${cityName}, ${st.name} | Smart Choice Constructions` },
  };
}

export default async function CityServicePage({ params }: { params: Promise<{ state: string; city: string; service: string }> }) {
  const { state, city, service } = await params;
  const st = getStateBySlug(state);
  const cat = CATEGORIES.find(c => c.id === service);
  if (!st || !cat) notFound();
  const cityName = slugToCity(city);
  const relatedCats = CATEGORIES.filter(c => c.id !== service).slice(0, 6);

  return (
    <div style={{ paddingTop: "76px" }}>
      {/* Hero */}
      <div style={{ background: "linear-gradient(155deg, var(--navy-dark), var(--navy))", padding: "4rem 0 3rem" }}>
        <div className="container">
          <nav aria-label="Breadcrumb" style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem", fontSize: "0.875rem", color: "rgba(255,255,255,0.5)", flexWrap: "wrap" }}>
            <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>Home</Link>
            <span>/</span>
            <Link href={`/locations/${state}/${city}`} style={{ color: "inherit", textDecoration: "none" }}>{cityName}</Link>
            <span>/</span>
            <span style={{ color: "rgba(255,255,255,0.85)" }}>{cat.name}</span>
          </nav>
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", marginBottom: "1rem" }}>
            <span style={{ fontSize: "3rem" }}>{cat.icon}</span>
            <h1 className="heading-lg" style={{ color: "white" }}>
              {cat.name} Contractors in {cityName}, {st.name}
            </h1>
          </div>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "1.0625rem", maxWidth: "560px", marginBottom: "1.75rem" }}>
            Verified, licensed, and insured {cat.name.toLowerCase()} professionals serving {cityName} and nearby areas.
          </p>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <Link href={`/request-quote?service=${service}&city=${cityName}&state=${st.code}`} className="btn-white" style={{ padding: "0.875rem 1.75rem" }}>
              Get Free Quotes
            </Link>
            <Link href={`/find-contractors?q=${cat.name}&state=${st.code}`} className="btn-outline-white" style={{ padding: "0.875rem 1.75rem" }}>
              Browse Contractors
            </Link>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: "3rem 1.5rem" }}>
        <div className="grid-2col-sidebar grid-2col-sidebar-lg" style={{ gridTemplateColumns: "2fr 1fr" }}>
          <div>
            {/* About */}
            <div className="card" style={{ padding: "2rem", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--navy)", marginBottom: "1rem" }}>
                {cat.name} Services in {cityName}
              </h2>
              <p style={{ color: "var(--gray-600)", lineHeight: 1.85, marginBottom: "1rem" }}>
                Smart Choice connects {cityName} homeowners with the most trusted {cat.name.toLowerCase()} contractors in the area. Every professional in our network is local and professional before they appear on our platform.
              </p>
              <p style={{ color: "var(--gray-600)", lineHeight: 1.85 }}>
                Whether you need emergency {cat.name.toLowerCase()} service or are planning a project weeks in advance, we match you with qualified professionals who serve {cityName} and surrounding areas.
              </p>
            </div>

            {/* Why choose */}
            <div className="card" style={{ padding: "2rem", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--navy)", marginBottom: "1.25rem" }}>
                Why Hire a Professional {cat.name} Contractor?
              </h2>
              {[
                { title: "Safety and Code Compliance",  desc: `Professional ${cat.name.toLowerCase()} work meets local building codes and safety standards, protecting you from liability and insurance issues.` },
                { title: "Quality That Lasts",          desc: `Licensed contractors bring years of hands-on training, ensuring your project is done right the first time.` },
                { title: "Saves Time and Money",        desc: `A qualified professional avoids the costly mistakes and rework that come from DIY attempts or hiring unlicensed workers.` },
                { title: "Warranty on Workmanship",     desc: `Most licensed contractors stand behind their work with a warranty, giving you long-term peace of mind.` },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: "1rem", paddingBottom: "1rem", marginBottom: "1rem", borderBottom: i < 3 ? "1px solid var(--gray-100)" : "none" }}>
                  <div style={{ width: "8px", height: "8px", background: "var(--navy)", borderRadius: "50%", flexShrink: 0, marginTop: "7px" }} />
                  <div>
                    <div style={{ fontWeight: 600, color: "var(--navy)", marginBottom: "0.25rem" }}>{item.title}</div>
                    <div style={{ color: "var(--gray-500)", fontSize: "0.9375rem", lineHeight: 1.65 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Related */}
            <div className="card" style={{ padding: "2rem" }}>
              <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--navy)", marginBottom: "1rem" }}>
                Related Services in {cityName}
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                {relatedCats.map(rc => (
                  <Link key={rc.id} href={`/locations/${state}/${city}/${rc.id}`}
                    className="rel-link"
                    style={{ display: "flex", alignItems: "center", gap: "0.625rem", padding: "0.75rem", border: "1.5px solid var(--gray-150)", borderRadius: "var(--radius-sm)", textDecoration: "none", color: "var(--gray-700)", fontSize: "0.875rem", fontWeight: 500, transition: "all 0.2s" }}
                  >
                    <span>{rc.icon}</span> {rc.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {/* Quote form */}
            <div className="card" style={{ padding: "1.75rem" }}>
              <h3 style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "1.25rem", fontSize: "1.0625rem" }}>
                Get Free {cat.name} Quotes
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                <input placeholder="Your ZIP Code" className="form-input" defaultValue="" />
                <textarea placeholder="Describe your project briefly..." className="form-input" rows={3} style={{ resize: "vertical" }} />
                <Link href={`/request-quote?service=${service}&city=${cityName}&state=${st.code}`} className="btn-red" style={{ textAlign: "center" }}>
                  Get Free Quotes
                </Link>
              </div>
              <p style={{ fontSize: "0.8125rem", color: "var(--gray-400)", textAlign: "center", marginTop: "0.875rem" }}>
                Free · No commitment · No spam
              </p>
            </div>

            {/* Trust */}
            <div className="card" style={{ padding: "1.5rem" }}>
              {[
                { icon: "🛡️", label: "Credential Badges",    sub: "Displayed when submitted" },
                { icon: "📋", label: "Licensed & Insured",   sub: "State licenses confirmed" },
                { icon: "⭐", label: "4.8 Average Rating",    sub: "From 2.4M+ projects" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.875rem", padding: "0.75rem 0", borderBottom: i < 2 ? "1px solid var(--gray-100)" : "none" }}>
                  <span style={{ fontSize: "1.375rem" }}>{item.icon}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.9375rem", color: "var(--navy)" }}>{item.label}</div>
                    <div style={{ fontSize: "0.8125rem", color: "var(--gray-400)" }}>{item.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Other cities */}
            <div className="card" style={{ padding: "1.5rem" }}>
              <h3 style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "1rem", fontSize: "1rem" }}>
                {cat.name} in Other {st.name} Cities
              </h3>
              {st.cities.filter(c => cityToSlug(c) !== city).slice(0, 5).map(c => (
                <Link key={c} href={`/locations/${state}/${cityToSlug(c)}/${service}`}
                  className="other-city-link"
                  style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 0", borderBottom: "1px solid var(--gray-100)", textDecoration: "none", color: "var(--gray-700)", fontSize: "0.9rem", transition: "color 0.15s" }}
                >
                  <span>🏙️</span> {cat.name} in {c}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .rel-link:hover        { border-color: var(--navy) !important; color: var(--navy) !important; background: var(--gray-50) !important; }
        .other-city-link:hover { color: var(--navy) !important; }
      `}</style>
    </div>
  );
}
