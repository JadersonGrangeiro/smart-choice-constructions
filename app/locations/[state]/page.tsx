import Link from "next/link";
import { US_STATES, CATEGORIES } from "@/lib/data";
import { getStateBySlug, cityToSlug } from "@/lib/locations";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return US_STATES.map(s => ({ state: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ state: string }> }): Promise<Metadata> {
  const { state } = await params;
  const st = getStateBySlug(state);
  if (!st) return {};
  return {
    title: `Contractors in ${st.name} — Local Professionals Near You`,
    description: `Browse local construction professionals in ${st.name}. Find contractors for roofing, electrical, HVAC, remodeling, and 60+ other services. Free for homeowners.`,
    openGraph: {
      title: `${st.name} Contractors | Smart Choice Constructions`,
      description: `Find local contractors serving every city in ${st.name}.`,
    },
  };
}

// State-specific intro text — avoids duplicate content across all state pages
const STATE_INTROS: Record<string, string> = {
  TX: "Texas homeowners deal with a unique combination of extreme heat, severe storms, and rapid urban growth — which means demand for skilled contractors is consistently high across Dallas, Houston, Austin, and San Antonio.",
  CA: "California's diverse climate zones — from coastal fog to desert heat — plus strict building codes and seismic requirements make hiring the right local contractor especially important.",
  FL: "Florida's subtropical climate, hurricane risk, and year-round high humidity create constant demand for roofing, HVAC, waterproofing, and storm-damage specialists.",
  NY: "New York's aging housing stock and extreme seasonal weather keep contractors busy year-round, from Manhattan brownstones to Long Island suburbs.",
  IL: "Chicago and the wider Illinois market demand contractors experienced with harsh winters, freeze-thaw cycles, and the specific challenges of both dense urban renovation and suburban new construction.",
  TX_DEFAULT: "",
};

const getStateIntro = (code: string, name: string): string =>
  STATE_INTROS[code] ??
  `${name} homeowners have access to a wide range of local construction professionals through Smart Choice. Browse by city or service category to find the right contractor for your project.`;

export default async function StatePage({ params }: { params: Promise<{ state: string }> }) {
  const { state } = await params;
  const st = getStateBySlug(state);
  if (!st) notFound();

  const intro    = getStateIntro(st.code, st.name);
  const topCats  = CATEGORIES.slice(0, 8);
  const restCats = CATEGORIES.slice(8, 20);
  const bigCities   = st.cities.slice(0, 8);
  const otherCities = st.cities.slice(8, 24);

  // FAQ specific to this state
  const faq = [
    {
      q: `Do contractors in ${st.name} need to be licensed?`,
      a: `Licensing requirements vary by trade and city within ${st.name}. General contractors, electricians, plumbers, and HVAC technicians typically need state or local licenses. Smart Choice allows contractors to submit their license documentation for verification — look for the "License Verified" badge on profiles.`,
    },
    {
      q: `How do I find a contractor near me in ${st.name}?`,
      a: `Use the search bar at the top of this page to enter your ZIP code or city name. You can also browse by service category and filter by location. All searches show local professionals serving your area first.`,
    },
    {
      q: "Is Smart Choice free for homeowners?",
      a: "Yes. Homeowners can browse profiles, view reviews, and request quotes at no cost. Smart Choice is supported by contractor subscriptions — not by charging homeowners.",
    },
    {
      q: `What should I look for when hiring a contractor in ${st.name}?`,
      a: `At minimum, verify that the contractor holds a current license for your project type, carries general liability insurance, and has verifiable reviews from homeowners in your area. Our platform displays credential badges where documentation has been submitted and reviewed — but we always recommend verifying credentials independently with your state licensing board.`,
    },
  ];

  return (
    <div style={{ paddingTop: "76px" }}>
      {/* Hero */}
      <div style={{ background: "linear-gradient(155deg, #0d1f40, var(--navy))", padding: "4.5rem 0 3.5rem" }}>
        <div className="container">
          <nav aria-label="Breadcrumb" style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem", fontSize: "0.875rem", color: "rgba(255,255,255,0.45)", flexWrap: "wrap" }}>
            <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>Home</Link>
            <span>/</span>
            <Link href="/locations" style={{ color: "inherit", textDecoration: "none" }}>Locations</Link>
            <span>/</span>
            <span style={{ color: "rgba(255,255,255,0.85)" }}>{st.name}</span>
          </nav>

          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "2rem" }}>
            <div style={{ flex: 1, maxWidth: "600px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", marginBottom: "1rem" }}>
                <span style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", padding: "4px 12px", fontWeight: 900, fontSize: "1.125rem", color: "white", letterSpacing: "0.05em" }}>{st.code}</span>
                <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 900, color: "white", letterSpacing: "-0.03em" }}>
                  Contractors in {st.name}
                </h1>
              </div>
              <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "1.0625rem", lineHeight: 1.75, marginBottom: "1.75rem" }}>
                {intro}
              </p>
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <Link href={`/find-contractors?state=${st.code}`} className="btn-white" style={{ padding: "0.875rem 1.75rem" }}>
                  Browse {st.name} Contractors
                </Link>
                <Link href={`/request-quote?state=${st.code}`} className="btn-outline-white" style={{ padding: "0.875rem 1.75rem" }}>
                  Get Free Quotes
                </Link>
              </div>
            </div>

            {/* State stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", flexShrink: 0 }}>
              {[
                { label: "Cities Covered",    value: st.cities.length + "+" },
                { label: "Service Categories",value: CATEGORIES.length + "+" },
                { label: "Free for Homeowners",value: "Always" },
                { label: "Quote Requests",     value: "Free" },
              ].map(stat => (
                <div key={stat.label} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "var(--radius-lg)", padding: "1.25rem", textAlign: "center" }}>
                  <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "white", marginBottom: "0.25rem" }}>{stat.value}</div>
                  <div style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.5)" }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: "3.5rem 1.5rem" }}>

        {/* Top service categories */}
        <section style={{ marginBottom: "4rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--navy)", marginBottom: "0.5rem" }}>
            Popular Services in {st.name}
          </h2>
          <p style={{ color: "var(--gray-500)", marginBottom: "1.75rem", fontSize: "0.9375rem" }}>
            Select a category to find specialists serving your city.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: "1rem", marginBottom: "1rem" }}>
            {topCats.map(cat => (
              <Link key={cat.id} href={`/services/${cat.id}`}
                className="state-cat-card"
                style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "0.75rem", padding: "1.25rem", background: "white", border: "1.5px solid var(--gray-150)", borderRadius: "var(--radius-lg)", textDecoration: "none", color: "var(--gray-700)", transition: "all 0.2s" }}>
                <span style={{ fontSize: "2rem" }}>{cat.icon}</span>
                <span style={{ fontWeight: 700, color: "var(--navy)", fontSize: "0.9375rem" }}>{cat.name}</span>
                <span style={{ fontSize: "0.8125rem", color: "var(--gray-400)" }}>Find in {st.name} →</span>
              </Link>
            ))}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {restCats.map(cat => (
              <Link key={cat.id} href={`/services/${cat.id}`}
                style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", padding: "0.5rem 0.875rem", background: "white", border: "1.5px solid var(--gray-150)", borderRadius: "999px", textDecoration: "none", color: "var(--gray-600)", fontSize: "0.875rem", fontWeight: 500, transition: "all 0.15s" }}
                className="state-cat-pill">
                <span>{cat.icon}</span> {cat.name}
              </Link>
            ))}
          </div>
          <Link href="/services" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", marginTop: "1.25rem", fontSize: "0.9rem", fontWeight: 600, color: "var(--navy)", textDecoration: "none" }}>
            View all 60+ service categories →
          </Link>
        </section>

        {/* Cities grid */}
        <section style={{ marginBottom: "4rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--navy)", marginBottom: "0.5rem" }}>
            Cities in {st.name}
          </h2>
          <p style={{ color: "var(--gray-500)", marginBottom: "1.75rem", fontSize: "0.9375rem" }}>
            Each city page shows local contractors and popular services for that area.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: "0.75rem", marginBottom: "1.25rem" }}>
            {bigCities.map(city => (
              <Link key={city} href={`/locations/${st.slug}/${cityToSlug(city)}`}
                className="city-card"
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.875rem 1.125rem", background: "white", border: "1.5px solid var(--gray-150)", borderRadius: "var(--radius)", textDecoration: "none", color: "var(--navy)", fontWeight: 700, fontSize: "0.9375rem", transition: "all 0.2s" }}>
                <span>🏙️ {city}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
            ))}
          </div>
          {otherCities.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {otherCities.map(city => (
                <Link key={city} href={`/locations/${st.slug}/${cityToSlug(city)}`}
                  style={{ padding: "0.5rem 0.875rem", background: "white", border: "1.5px solid var(--gray-150)", borderRadius: "999px", textDecoration: "none", color: "var(--gray-600)", fontSize: "0.875rem", fontWeight: 500, transition: "all 0.15s" }}
                  className="city-pill">
                  {city}
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* FAQ */}
        <section style={{ marginBottom: "4rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--navy)", marginBottom: "0.375rem" }}>
            Frequently Asked Questions — {st.name}
          </h2>
          <p style={{ color: "var(--gray-500)", marginBottom: "1.75rem", fontSize: "0.9375rem" }}>Common questions from {st.name} homeowners.</p>
          <div className="card" style={{ padding: "0" }}>
            {faq.map((item, i) => (
              <div key={i} style={{ padding: "1.5rem 2rem", borderBottom: i < faq.length - 1 ? "1px solid var(--gray-100)" : "none" }}>
                <h3 style={{ fontWeight: 700, color: "var(--navy)", fontSize: "1rem", marginBottom: "0.75rem" }}>{item.q}</h3>
                <p style={{ color: "var(--gray-600)", lineHeight: 1.75, fontSize: "0.9375rem" }}>{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div style={{ background: "var(--navy)", borderRadius: "var(--radius-xl)", padding: "3rem", textAlign: "center" }}>
          <h3 style={{ fontWeight: 800, color: "white", fontSize: "1.75rem", marginBottom: "0.875rem" }}>
            Need a contractor in {st.name}?
          </h3>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "1.0625rem", marginBottom: "2rem", maxWidth: "480px", margin: "0 auto 2rem" }}>
            Browse professionals by city and service. Free for homeowners — no account required to get quotes.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href={`/find-contractors?state=${st.code}`} className="btn-white" style={{ padding: "0.875rem 2rem" }}>
              Find Contractors
            </Link>
            <Link href={`/request-quote?state=${st.code}`} className="btn-outline-white" style={{ padding: "0.875rem 2rem" }}>
              Get Free Quotes
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .state-cat-card:hover { border-color: var(--navy) !important; box-shadow: var(--shadow-md); transform: translateY(-2px); }
        .state-cat-pill:hover { border-color: var(--navy) !important; color: var(--navy) !important; }
        .city-card:hover  { border-color: var(--navy) !important; background: var(--gray-50) !important; }
        .city-pill:hover  { border-color: var(--navy) !important; color: var(--navy) !important; }
      `}</style>
    </div>
  );
}
