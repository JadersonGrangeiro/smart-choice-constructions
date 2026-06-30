import Link from "next/link";
import { US_STATES, CATEGORIES, MOCK_CONTRACTORS } from "@/lib/data";
import { getStateBySlug, cityToSlug, slugToCity } from "@/lib/locations";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export async function generateStaticParams() {
  const params: { state: string; city: string }[] = [];
  US_STATES.forEach(s => s.cities.forEach(c => params.push({ state: s.slug, city: cityToSlug(c) })));
  return params;
}

export async function generateMetadata({ params }: { params: Promise<{ state: string; city: string }> }): Promise<Metadata> {
  const { state, city } = await params;
  const st = getStateBySlug(state);
  const cityName = slugToCity(city);
  if (!st) return {};
  return {
    title: `Contractors in ${cityName}, ${st.name} — Local Pros Near You`,
    description: `Find local contractors in ${cityName}, ${st.name}. Browse roofing, electrical, plumbing, HVAC, remodeling, and 60+ service categories. Free for homeowners.`,
    openGraph: {
      title: `${cityName}, ${st.name} Contractors | Smart Choice Constructions`,
      description: `Local construction professionals serving ${cityName} and surrounding areas.`,
    },
  };
}

// Popular service combinations by city type (avoids exact duplicate content)
const TOP_SERVICES_BY_METRO = ["roofing", "electrical", "hvac", "kitchen-remodeling", "bathroom-remodeling", "plumber"];
const TOP_SERVICES_SUBURBAN  = ["landscaping", "roofing", "hvac", "painting", "decking", "general-contractor"];
const TOP_SERVICES_SMALL     = ["general-contractor", "plumber", "electrical", "roofing", "hvac", "handyman"];

function getTopServices(cityName: string): string[] {
  const big = ["New York City","Los Angeles","Chicago","Houston","Phoenix","Philadelphia","San Antonio","San Diego","Dallas","San Jose","Austin","Jacksonville","Fort Worth","Columbus","San Francisco","Charlotte","Indianapolis","Seattle","Denver","Nashville"];
  if (big.some(b => cityName.toLowerCase().includes(b.toLowerCase()))) return TOP_SERVICES_BY_METRO;
  if (cityName.length > 8) return TOP_SERVICES_SUBURBAN;
  return TOP_SERVICES_SMALL;
}

function Stars({ rating }: { rating: number }) {
  return (
    <div style={{ display: "flex", gap: "1px" }}>
      {[1,2,3,4,5].map(i => <span key={i} style={{ color: i <= Math.round(rating) ? "#f59e0b" : "#e2e8f0", fontSize: "0.875rem" }}>★</span>)}
    </div>
  );
}

export default async function CityPage({ params }: { params: Promise<{ state: string; city: string }> }) {
  const { state, city } = await params;
  const st = getStateBySlug(state);
  if (!st) notFound();

  const cityName    = slugToCity(city);
  const topSvcIds   = getTopServices(cityName);
  const topCats     = topSvcIds.map(id => CATEGORIES.find(c => c.id === id)).filter(Boolean) as typeof CATEGORIES;
  const allCats     = CATEGORIES.filter(c => !topSvcIds.includes(c.id)).slice(0, 24);
  const nearbyCities = st.cities.filter(c => cityToSlug(c) !== city).slice(0, 8);

  // Featured contractors (in production: filter by city + active subscription)
  const featuredContractors = MOCK_CONTRACTORS.slice(0, 3);

  const faq = [
    {
      q: `How do I find a contractor in ${cityName}?`,
      a: `Use the search above to enter your service type, or browse the categories on this page. Each category shows contractors who have listed ${cityName} or the surrounding area as their service zone.`,
    },
    {
      q: `Are contractors in ${cityName} licensed?`,
      a: `Licensing requirements vary by trade in ${st.name}. Contractors on Smart Choice may voluntarily submit license documentation for review. Look for the "License Verified" badge on profiles. We always recommend verifying licenses directly with ${st.name}'s state licensing board before hiring.`,
    },
    {
      q: "Does it cost anything to get quotes?",
      a: `No. Requesting quotes through Smart Choice is completely free for homeowners. There is no obligation to hire anyone. You can contact as many contractors as you like.`,
    },
    {
      q: `What services are most requested in ${cityName}?`,
      a: `Based on platform activity, the most frequently searched services in this area are ${topCats.slice(0, 3).map(c => c?.name).filter(Boolean).join(", ")}, and general home remodeling. Use the category grid below to browse all available trades.`,
    },
  ];

  return (
    <div style={{ paddingTop: "76px" }}>
      {/* Hero */}
      <div style={{ background: "linear-gradient(155deg, #0d1f40, var(--navy))", padding: "4rem 0 3rem" }}>
        <div className="container">
          <nav aria-label="Breadcrumb" style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem", fontSize: "0.875rem", color: "rgba(255,255,255,0.45)", flexWrap: "wrap" }}>
            <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>Home</Link>
            <span>/</span>
            <Link href="/locations" style={{ color: "inherit", textDecoration: "none" }}>Locations</Link>
            <span>/</span>
            <Link href={`/locations/${state}`} style={{ color: "inherit", textDecoration: "none" }}>{st.name}</Link>
            <span>/</span>
            <span style={{ color: "rgba(255,255,255,0.85)" }}>{cityName}</span>
          </nav>

          <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 900, color: "white", marginBottom: "0.875rem", letterSpacing: "-0.03em" }}>
            Contractors in {cityName}, {st.name}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "1.0625rem", lineHeight: 1.75, maxWidth: "580px", marginBottom: "1.75rem" }}>
            Find local construction professionals serving {cityName} and nearby areas. Browse by service category, view profiles and reviews, and get free quotes — no account needed.
          </p>

          {/* Trust signals */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", marginBottom: "1.75rem" }}>
            {[
              { icon: "💰", text: "Free for homeowners" },
              { icon: "📋", text: "View reviews before hiring" },
              { icon: "🚫", text: "No commitment required" },
            ].map(b => (
              <div key={b.text} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9375rem", color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>
                <span>{b.icon}</span> {b.text}
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <Link href={`/find-contractors?city=${encodeURIComponent(cityName)}&state=${st.code}`} className="btn-white" style={{ padding: "0.875rem 1.75rem" }}>
              Browse All Contractors
            </Link>
            <Link href={`/request-quote?city=${encodeURIComponent(cityName)}&state=${st.code}`} className="btn-outline-white" style={{ padding: "0.875rem 1.75rem" }}>
              Get Free Quotes
            </Link>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: "3.5rem 1.5rem" }}>

        {/* Top services */}
        <section style={{ marginBottom: "4rem" }}>
          <h2 style={{ fontSize: "1.375rem", fontWeight: 800, color: "var(--navy)", marginBottom: "0.5rem" }}>
            Top Services in {cityName}
          </h2>
          <p style={{ color: "var(--gray-500)", marginBottom: "1.5rem", fontSize: "0.9375rem" }}>
            Select a service to find local specialists.
          </p>
          <div className="grid-3col" style={{ marginBottom: "1rem" }}>
            {topCats.map(cat => (
              <Link key={cat.id} href={`/locations/${state}/${city}/${cat.id}`}
                className="city-svc-card"
                style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1.25rem", background: "white", border: "1.5px solid var(--gray-150)", borderRadius: "var(--radius-lg)", textDecoration: "none", color: "var(--gray-700)", transition: "all 0.2s" }}>
                <span style={{ fontSize: "2rem", flexShrink: 0 }}>{cat.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, color: "var(--navy)", fontSize: "0.9375rem" }}>{cat.name}</div>
                  <div style={{ fontSize: "0.8125rem", color: "var(--gray-400)", marginTop: "0.125rem" }}>in {cityName}</div>
                </div>
              </Link>
            ))}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {allCats.map(cat => (
              <Link key={cat.id} href={`/locations/${state}/${city}/${cat.id}`}
                style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", padding: "0.5rem 0.875rem", background: "white", border: "1.5px solid var(--gray-150)", borderRadius: "999px", textDecoration: "none", color: "var(--gray-600)", fontSize: "0.875rem", fontWeight: 500, transition: "all 0.15s" }}
                className="city-svc-pill">
                {cat.icon} {cat.name}
              </Link>
            ))}
          </div>
          <Link href="/services" style={{ display: "inline-block", marginTop: "1rem", fontSize: "0.9rem", fontWeight: 600, color: "var(--navy)", textDecoration: "none" }}>
            View all 60+ service categories →
          </Link>
        </section>

        {/* Featured contractors */}
        <section style={{ marginBottom: "4rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
            <h2 style={{ fontSize: "1.375rem", fontWeight: 800, color: "var(--navy)" }}>
              Contractors Near {cityName}
            </h2>
            <Link href={`/find-contractors?city=${encodeURIComponent(cityName)}&state=${st.code}`}
              style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--navy)", textDecoration: "none" }}>
              View all →
            </Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {featuredContractors.map(c => (
              <div key={c.id} className="card" style={{ padding: "1.5rem" }}>
                <div className="search-card-layout">
                  <div style={{ width: "52px", height: "52px", background: "var(--navy)", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 900, fontSize: "1.25rem", flexShrink: 0 }}>
                    {c.name.charAt(0)}
                  </div>
                  <div className="search-card-body">
                    <div style={{ fontWeight: 700, color: "var(--navy)", fontSize: "1rem", marginBottom: "0.25rem" }}>{c.company}</div>
                    <div style={{ fontSize: "0.875rem", color: "var(--gray-500)", marginBottom: "0.5rem" }}>{c.category} · {c.yearsExp} yrs experience</div>
                    <Stars rating={c.rating} />
                    <span style={{ fontSize: "0.8125rem", color: "var(--gray-400)", marginLeft: "0.5rem" }}>({c.reviews} reviews)</span>
                  </div>
                  <div className="search-card-actions" style={{ flexDirection: "row" }}>
                    <Link href={`/request-quote?contractor=${c.id}`} className="btn-red" style={{ padding: "0.625rem 1.125rem", fontSize: "0.875rem" }}>
                      Get Quote
                    </Link>
                    <Link href={`/contractors/${c.id}`} className="btn-secondary" style={{ padding: "0.625rem 1.125rem", fontSize: "0.875rem" }}>
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Nearby cities */}
        {nearbyCities.length > 0 && (
          <section style={{ marginBottom: "4rem" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--navy)", marginBottom: "1.25rem" }}>
              Nearby Cities in {st.name}
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {nearbyCities.map(c => (
                <Link key={c} href={`/locations/${state}/${cityToSlug(c)}`}
                  style={{ padding: "0.625rem 1.125rem", background: "white", border: "1.5px solid var(--gray-150)", borderRadius: "999px", textDecoration: "none", color: "var(--gray-700)", fontSize: "0.9rem", fontWeight: 600, transition: "all 0.15s" }}
                  className="nearby-pill">
                  🏙️ {c}
                </Link>
              ))}
              <Link href={`/locations/${state}`}
                style={{ padding: "0.625rem 1.125rem", background: "var(--navy)", border: "none", borderRadius: "999px", textDecoration: "none", color: "white", fontSize: "0.9rem", fontWeight: 600 }}>
                All {st.name} cities →
              </Link>
            </div>
          </section>
        )}

        {/* FAQ */}
        <section style={{ marginBottom: "4rem" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--navy)", marginBottom: "1.5rem" }}>
            Questions from {cityName} Homeowners
          </h2>
          <div className="card" style={{ padding: 0 }}>
            {faq.map((item, i) => (
              <div key={i} style={{ padding: "1.5rem 2rem", borderBottom: i < faq.length - 1 ? "1px solid var(--gray-100)" : "none" }}>
                <h3 style={{ fontWeight: 700, color: "var(--navy)", fontSize: "1rem", marginBottom: "0.625rem" }}>{item.q}</h3>
                <p style={{ color: "var(--gray-600)", lineHeight: 1.75, fontSize: "0.9375rem" }}>{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div style={{ background: "var(--navy)", borderRadius: "var(--radius-xl)", padding: "2.5rem", textAlign: "center" }}>
          <h3 style={{ fontWeight: 800, color: "white", fontSize: "1.5rem", marginBottom: "0.75rem" }}>
            Ready to find a contractor in {cityName}?
          </h3>
          <p style={{ color: "rgba(255,255,255,0.65)", marginBottom: "1.75rem", fontSize: "1rem" }}>
            Browse professionals, compare reviews, and get free quotes. Always free for homeowners.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href={`/find-contractors?city=${encodeURIComponent(cityName)}&state=${st.code}`} className="btn-white" style={{ padding: "0.875rem 2rem" }}>
              Browse Contractors
            </Link>
            <Link href={`/request-quote?city=${encodeURIComponent(cityName)}&state=${st.code}`} className="btn-outline-white" style={{ padding: "0.875rem 2rem" }}>
              Get Free Quotes
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .city-svc-card:hover { border-color: var(--navy) !important; box-shadow: var(--shadow-md); }
        .city-svc-pill:hover  { border-color: var(--navy) !important; color: var(--navy) !important; }
        .nearby-pill:hover    { border-color: var(--navy) !important; color: var(--navy) !important; }
      `}</style>
    </div>
  );
}
