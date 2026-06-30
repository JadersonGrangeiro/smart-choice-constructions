import Link from "next/link";

const STATE_SUPPLIER_INTROS: Record<string, string> = {
  TX: "Texas\'s massive construction market — driven by population growth, commercial development, and weather-related repairs — creates year-round demand for every type of building supply and contractor support service across Dallas, Houston, Austin, and San Antonio.",
  CA: "California\'s strict building codes, seismic requirements, energy efficiency mandates, and year-round construction activity make the quality and compliance record of local suppliers especially important for any project.",
  FL: "Florida\'s hurricane-prone climate and subtropical conditions create sustained demand for roofing supplies, impact windows, HVAC equipment, and waterproofing materials from suppliers who understand local building requirements.",
  NY: "New York\'s dense urban environment, aging building stock, and stringent code enforcement mean contractors rely on suppliers with deep product knowledge, reliable delivery logistics, and familiarity with city permitting requirements.",
  IL: "The Chicago metro\'s harsh winters, freeze-thaw cycles, and large commercial market keep Illinois suppliers busy serving contractors working on everything from historic brownstone renovations to large-scale industrial builds.",
  TX_DEFAULT: "",
};

function getStateIntro(code: string, name: string): string {
  return STATE_SUPPLIER_INTROS[code] ??
    `${name} contractors and homeowners have access to a wide range of local building supply companies, equipment rental providers, and professional services through Smart Choice. Browse by category or city to find what you need.`;
}
import { US_STATES } from "@/lib/data";
import { SUPPLIER_CATEGORIES } from "@/lib/supplier-data";
import { getStateBySlug, cityToSlug } from "@/lib/locations";
import { createAdminClient } from "@/lib/supabase/server";
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
    title: `Local Suppliers in ${st.name} | Building Materials & Services`,
    description: `Find local building material suppliers, equipment rental, architects, and construction services in ${st.name}. Browse by category or city.`,
  };
}

function Stars({ rating }: { rating: number }) {
  return <span style={{ color: "#f59e0b" }}>{"★".repeat(Math.round(rating))}{"☆".repeat(5 - Math.round(rating))}</span>;
}

export default async function SupplierStatePage({ params }: { params: Promise<{ state: string }> }) {
  const { state } = await params;
  const st = getStateBySlug(state);
  if (!st) notFound();

  const supabase = createAdminClient();
  const { data: stateSuppliers } = await supabase
    .from("suppliers")
    .select("id, company_name, category, city, state_code, logo_url, rating, review_count, is_featured")
    .eq("state_code", st.code)
    .eq("is_active", true)
    .order("is_featured", { ascending: false })
    .order("rating", { ascending: false })
    .limit(20);

  const topCats = SUPPLIER_CATEGORIES.slice(0, 12);
  const bigCities = st.cities.slice(0, 8);

  return (
    <div style={{ paddingTop: "76px" }}>
      <div style={{ background: "linear-gradient(155deg, #0d1f40, var(--navy))", padding: "4.5rem 0 3.5rem" }}>
        <div className="container">
          <nav aria-label="Breadcrumb" style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", fontSize: "0.875rem", color: "rgba(255,255,255,0.45)", flexWrap: "wrap" }}>
            <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>Home</Link>
            <span>/</span>
            <Link href="/suppliers" style={{ color: "inherit", textDecoration: "none" }}>Local Suppliers</Link>
            <span>/</span>
            <span style={{ color: "rgba(255,255,255,0.85)" }}>{st.name}</span>
          </nav>
          <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", marginBottom: "1rem" }}>
            <span style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", padding: "4px 12px", fontWeight: 900, fontSize: "1.125rem", color: "white" }}>{st.code}</span>
            <h1 style={{ fontSize: "clamp(1.75rem,4vw,2.5rem)", fontWeight: 900, color: "white", letterSpacing: "-0.03em" }}>
              Local Suppliers in {st.name}
            </h1>
          </div>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "1.0625rem", maxWidth: "580px", marginBottom: "2rem", lineHeight: 1.75 }}>
            {getStateIntro(st.code, st.name)}
          </p>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <Link href={`/find-suppliers?state=${st.code}`} className="btn-white" style={{ padding: "0.875rem 1.75rem" }}>Browse {st.name} Suppliers</Link>
            <Link href={`/suppliers/${state}/building-materials`} className="btn-outline-white" style={{ padding: "0.875rem 1.75rem" }}>Building Materials</Link>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: "3.5rem 1.5rem" }}>
        {/* Suppliers in this state */}
        {stateSuppliers && stateSuppliers.length > 0 && (
          <section style={{ marginBottom: "4rem" }}>
            <h2 style={{ fontSize: "1.375rem", fontWeight: 800, color: "var(--navy)", marginBottom: "1.5rem" }}>
              Suppliers in {st.name}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {stateSuppliers.map(s => {
                const cat = SUPPLIER_CATEGORIES.find(c => c.id === s.category);
                return (
                  <div key={s.id} className="card" style={{ padding: "1.5rem", display: "flex", gap: "1.25rem", alignItems: "center", flexWrap: "wrap" }}>
                    <div style={{ width: "52px", height: "52px", background: `${cat?.color ?? "var(--navy)"}18`, borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", flexShrink: 0 }}>
                      {s.logo_url ? <img src={s.logo_url} alt="" style={{ width: "40px", height: "40px", objectFit: "contain", borderRadius: "8px" }} /> : (cat?.icon ?? "🏢")}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: "var(--navy)", fontSize: "1rem", marginBottom: "0.25rem" }}>{s.company_name}</div>
                      <div style={{ fontSize: "0.8125rem", color: "var(--gray-500)", marginBottom: "0.375rem" }}>{cat?.name ?? s.category} · {s.city}, {s.state_code}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                        <Stars rating={s.rating ?? 0} />
                        <span style={{ fontSize: "0.8125rem", color: "var(--gray-400)" }}>({s.review_count ?? 0})</span>
                      </div>
                    </div>
                    <Link href={`/suppliers/profile/${s.id}`} className="btn-red" style={{ padding: "0.625rem 1.25rem", fontSize: "0.875rem", flexShrink: 0 }}>
                      View Profile
                    </Link>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem" }}>
          {/* Categories */}
          <section>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--navy)", marginBottom: "1.5rem" }}>
              Supplier Categories in {st.name}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {topCats.map(cat => (
                <Link key={cat.id} href={`/suppliers/${state}/${cat.id}`}
                  className="state-cat-row"
                  style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.875rem 1.125rem", background: "white", border: "1.5px solid var(--gray-150)", borderRadius: "var(--radius)", textDecoration: "none", color: "var(--navy)", fontWeight: 600, fontSize: "0.9rem", transition: "all 0.2s" }}>
                  <span style={{ fontSize: "1.125rem" }}>{cat.icon}</span>
                  <span style={{ flex: 1 }}>{cat.name}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </Link>
              ))}
            </div>
          </section>

          {/* Cities */}
          <section>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--navy)", marginBottom: "1.5rem" }}>
              Cities in {st.name}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {bigCities.map(city => (
                <Link key={city} href={`/suppliers/${state}/${cityToSlug(city)}`}
                  className="state-city-row"
                  style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.875rem 1.125rem", background: "white", border: "1.5px solid var(--gray-150)", borderRadius: "var(--radius)", textDecoration: "none", color: "var(--navy)", fontWeight: 600, fontSize: "0.9rem", transition: "all 0.2s" }}>
                  <span>🏙️</span>
                  <span style={{ flex: 1 }}>{city}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </Link>
              ))}
            </div>
            <Link href={`/locations/${state}`} style={{ display: "inline-block", marginTop: "1rem", fontSize: "0.875rem", fontWeight: 600, color: "var(--navy)", textDecoration: "none" }}>
              View all {st.cities.length} cities →
            </Link>
          </section>
        </div>

        {/* CTA */}
        <div style={{ marginTop: "4rem", background: "var(--navy)", borderRadius: "var(--radius-xl)", padding: "2.5rem", textAlign: "center" }}>
          <h3 style={{ fontWeight: 800, color: "white", fontSize: "1.5rem", marginBottom: "0.75rem" }}>
            List Your Business in {st.name}
          </h3>
          <p style={{ color: "rgba(255,255,255,0.65)", marginBottom: "1.75rem" }}>
            Are you a supplier, distributor, or professional service provider in {st.name}? Get listed on Smart Choice.
          </p>
          <Link href="/join-supplier" className="btn-white" style={{ padding: "0.875rem 2rem" }}>
            Join as a Supplier
          </Link>
        </div>
      </div>
      <style>{`.state-cat-row:hover,.state-city-row:hover { border-color: var(--navy) !important; background: var(--gray-50) !important; }`}</style>
    </div>
  );
}
