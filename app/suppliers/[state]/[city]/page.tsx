import Link from "next/link";
import { US_STATES } from "@/lib/data";
import { SUPPLIER_CATEGORIES, MOCK_SUPPLIERS, getSuppliersByCity } from "@/lib/supplier-data";
import { getStateBySlug, cityToSlug, slugToCity } from "@/lib/locations";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export async function generateStaticParams() {
  // Top 10 states × top 5 cities for SSG; rest handled by fallback in production
  const TOP_STATES = ["TX","CA","FL","NY","IL","GA","WA","CO","AZ","NC"];
  const params: { state: string; city: string }[] = [];
  US_STATES.filter(s => TOP_STATES.includes(s.code)).forEach(s => {
    s.cities.slice(0, 5).forEach(city => {
      params.push({ state: s.slug, city: cityToSlug(city) });
    });
  });
  return params;
}

export async function generateMetadata({ params }: { params: Promise<{ state: string; city: string }> }): Promise<Metadata> {
  const { state, city } = await params;
  const st = getStateBySlug(state);
  const cityName = slugToCity(city);
  if (!st) return {};
  return {
    title: `Local Suppliers in ${cityName}, ${st.name}`,
    description: `Find building material suppliers, equipment rental, architects, and construction services in ${cityName}, ${st.name}. Free to browse.`,
  };
}

function Stars({ rating }: { rating: number }) {
  return <span style={{ color: "#f59e0b" }}>{"★".repeat(Math.round(rating))}{"☆".repeat(5 - Math.round(rating))}</span>;
}

export default async function SupplierCityPage({ params }: { params: Promise<{ state: string; city: string }> }) {
  const { state, city } = await params;
  const st = getStateBySlug(state);
  if (!st) notFound();
  const cityName = slugToCity(city);
  const citySuppliers = getSuppliersByCity(cityName, st.code);
  const allCats = SUPPLIER_CATEGORIES.slice(0, 16);
  const nearbyCities = st.cities.filter(c => cityToSlug(c) !== city).slice(0, 6);

  return (
    <div style={{ paddingTop: "76px" }}>
      <div style={{ background: "linear-gradient(155deg, #0d1f40, var(--navy))", padding: "4rem 0 3rem" }}>
        <div className="container">
          <nav aria-label="Breadcrumb" style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", fontSize: "0.875rem", color: "rgba(255,255,255,0.45)", flexWrap: "wrap" }}>
            <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>Home</Link>
            <span>/</span>
            <Link href="/suppliers" style={{ color: "inherit", textDecoration: "none" }}>Local Suppliers</Link>
            <span>/</span>
            <Link href={`/suppliers/${state}`} style={{ color: "inherit", textDecoration: "none" }}>{st.name}</Link>
            <span>/</span>
            <span style={{ color: "rgba(255,255,255,0.85)" }}>{cityName}</span>
          </nav>
          <h1 style={{ fontSize: "clamp(1.75rem,4vw,2.5rem)", fontWeight: 900, color: "white", marginBottom: "0.875rem", letterSpacing: "-0.03em" }}>
            Local Suppliers in {cityName}, {st.name}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "1.0625rem", maxWidth: "560px", marginBottom: "1.75rem", lineHeight: 1.75 }}>
            Building materials, equipment rental, design professionals, and construction services serving {cityName} and surrounding areas.
          </p>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <Link href={`/find-suppliers?city=${encodeURIComponent(cityName)}&state=${st.code}`} className="btn-white" style={{ padding: "0.875rem 1.75rem" }}>Browse All Suppliers</Link>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: "3.5rem 1.5rem" }}>
        {/* Local suppliers */}
        {citySuppliers.length > 0 && (
          <section style={{ marginBottom: "3.5rem" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--navy)", marginBottom: "1.5rem" }}>
              Suppliers Near {cityName}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {citySuppliers.map(s => {
                const cat = SUPPLIER_CATEGORIES.find(c => c.id === s.categoryId);
                return (
                  <div key={s.id} className="card" style={{ padding: "1.5rem", display: "flex", gap: "1.25rem", alignItems: "center", flexWrap: "wrap" }}>
                    <div style={{ width: "52px", height: "52px", background: `${cat?.color ?? "var(--navy)"}18`, borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", flexShrink: 0 }}>
                      {cat?.icon ?? "🏢"}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: "var(--navy)", fontSize: "1rem", marginBottom: "0.25rem" }}>{s.name}</div>
                      <div style={{ fontSize: "0.8125rem", color: "var(--gray-500)", marginBottom: "0.25rem" }}>{cat?.name}</div>
                      <div><Stars rating={s.rating} /> <span style={{ fontSize: "0.8125rem", color: "var(--gray-400)" }}>({s.reviews})</span></div>
                    </div>
                    <Link href={`/suppliers/profile/${s.id}`} className="btn-red" style={{ padding: "0.625rem 1.25rem", fontSize: "0.875rem", flexShrink: 0 }}>View</Link>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Categories grid */}
        <section style={{ marginBottom: "3.5rem" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--navy)", marginBottom: "1.5rem" }}>
            Supplier Categories in {cityName}
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: "0.75rem" }}>
            {allCats.map(cat => (
              <Link key={cat.id} href={`/suppliers/${state}/${city}/${cat.id}`}
                className="city-cat-card"
                style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem", background: "white", border: "1.5px solid var(--gray-150)", borderRadius: "var(--radius)", textDecoration: "none", color: "var(--gray-700)", fontWeight: 600, fontSize: "0.875rem", transition: "all 0.2s" }}>
                <span style={{ fontSize: "1.25rem" }}>{cat.icon}</span>
                {cat.name}
              </Link>
            ))}
          </div>
        </section>

        {/* Nearby cities */}
        {nearbyCities.length > 0 && (
          <section style={{ marginBottom: "3.5rem" }}>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--navy)", marginBottom: "1.25rem" }}>Nearby Cities</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {nearbyCities.map(c => (
                <Link key={c} href={`/suppliers/${state}/${cityToSlug(c)}`}
                  style={{ padding: "0.5rem 0.875rem", background: "white", border: "1.5px solid var(--gray-150)", borderRadius: "999px", textDecoration: "none", color: "var(--gray-600)", fontSize: "0.875rem", fontWeight: 500, transition: "all 0.15s" }}
                  className="nearby-pill">
                  🏙️ {c}
                </Link>
              ))}
              <Link href={`/suppliers/${state}`} style={{ padding: "0.5rem 0.875rem", background: "var(--navy)", borderRadius: "999px", textDecoration: "none", color: "white", fontSize: "0.875rem", fontWeight: 600 }}>
                All {st.name} →
              </Link>
            </div>
          </section>
        )}
      </div>
      <style>{`.city-cat-card:hover { border-color: var(--navy) !important; color: var(--navy) !important; } .nearby-pill:hover { border-color: var(--navy) !important; color: var(--navy) !important; }`}</style>
    </div>
  );
}
