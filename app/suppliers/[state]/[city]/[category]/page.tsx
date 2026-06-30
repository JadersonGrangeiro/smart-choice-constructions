import Link from "next/link";
import { US_STATES } from "@/lib/data";
import { SUPPLIER_CATEGORIES } from "@/lib/supplier-data";
import { getStateBySlug, cityToSlug, slugToCity } from "@/lib/locations";
import { createAdminClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export async function generateStaticParams() {
  const TOP_STATES = ["TX","CA","FL","NY","IL"];
  const TOP_CATS = SUPPLIER_CATEGORIES.slice(0, 8).map(c => c.id);
  const params: { state: string; city: string; category: string }[] = [];
  US_STATES.filter(s => TOP_STATES.includes(s.code)).forEach(s => {
    s.cities.slice(0, 3).forEach(city => {
      TOP_CATS.forEach(cat => params.push({ state: s.slug, city: cityToSlug(city), category: cat }));
    });
  });
  return params;
}

export async function generateMetadata({ params }: { params: Promise<{ state: string; city: string; category: string }> }): Promise<Metadata> {
  const { state, city, category } = await params;
  const st = getStateBySlug(state);
  const cat = SUPPLIER_CATEGORIES.find(c => c.id === category);
  const cityName = slugToCity(city);
  if (!st || !cat) return {};
  return {
    title: `${cat.name} in ${cityName}, ${st.name}`,
    description: `Find local ${cat.name.toLowerCase()} in ${cityName}, ${st.name}. ${cat.description}`,
  };
}

function Stars({ rating }: { rating: number }) {
  return <span style={{ color: "#f59e0b" }}>{"★".repeat(Math.round(rating))}{"☆".repeat(5 - Math.round(rating))}</span>;
}

export default async function SupplierCityCatPage({ params }: { params: Promise<{ state: string; city: string; category: string }> }) {
  const { state, city, category } = await params;
  const st = getStateBySlug(state);
  const cat = SUPPLIER_CATEGORIES.find(c => c.id === category);
  if (!st || !cat) notFound();
  const cityName = slugToCity(city);
  const supabase = createAdminClient();
  const { data: suppliers } = await supabase
    .from("suppliers")
    .select("id, company_name, category, city, state_code, description, phone, logo_url, rating, review_count")
    .eq("state_code", st.code)
    .eq("category", cat.id)
    .eq("is_active", true)
    .order("is_featured", { ascending: false })
    .order("rating", { ascending: false })
    .limit(30);
  const related = SUPPLIER_CATEGORIES.filter(c => c.id !== category && c.group === cat.group).slice(0, 6);

  return (
    <div style={{ paddingTop: "76px" }}>
      <div style={{ background: "linear-gradient(155deg, #0d1f40, var(--navy))", padding: "4rem 0 3rem" }}>
        <div className="container">
          <nav aria-label="Breadcrumb" style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", fontSize: "0.875rem", color: "rgba(255,255,255,0.45)", flexWrap: "wrap" }}>
            <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>Home</Link>
            <span>/</span>
            <Link href="/suppliers" style={{ color: "inherit", textDecoration: "none" }}>Local Suppliers</Link>
            <span>/</span>
            <Link href={`/suppliers/${state}/${city}`} style={{ color: "inherit", textDecoration: "none" }}>{cityName}</Link>
            <span>/</span>
            <span style={{ color: "rgba(255,255,255,0.85)" }}>{cat.name}</span>
          </nav>
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", marginBottom: "1rem" }}>
            <span style={{ fontSize: "3rem" }}>{cat.icon}</span>
            <h1 style={{ fontSize: "clamp(1.75rem,4vw,2.5rem)", fontWeight: 900, color: "white", letterSpacing: "-0.03em" }}>
              {cat.name} in {cityName}, {st.name}
            </h1>
          </div>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "1.0625rem", maxWidth: "560px", marginBottom: "1.75rem", lineHeight: 1.75 }}>
            {cat.description} Find local suppliers serving {cityName} and the surrounding area.
          </p>
          <Link href={`/find-suppliers?category=${category}&city=${encodeURIComponent(cityName)}&state=${st.code}`} className="btn-white" style={{ padding: "0.875rem 1.75rem" }}>
            Browse All {cat.name}
          </Link>
        </div>
      </div>

      <div className="container" style={{ padding: "3rem 1.5rem" }}>
        {suppliers && suppliers.length > 0 ? (
          <section style={{ marginBottom: "3rem" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--navy)", marginBottom: "1.5rem" }}>
              {cat.name} Near {cityName}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {suppliers.map(s => (
                <div key={s.id} className="card" style={{ padding: "1.5rem" }}>
                  <div className="search-card-layout">
                    <div style={{ width: "56px", height: "56px", background: `${cat.color}18`, borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", flexShrink: 0 }}>
                      {s.logo_url ? <img src={s.logo_url} alt="" style={{ width: "44px", height: "44px", objectFit: "contain", borderRadius: "8px" }} /> : cat.icon}
                    </div>
                    <div className="search-card-body">
                      <h3 style={{ fontWeight: 700, color: "var(--navy)", fontSize: "1rem", marginBottom: "0.25rem" }}>{s.company_name}</h3>
                      <div style={{ fontSize: "0.8125rem", color: "var(--gray-500)", marginBottom: "0.625rem" }}>{s.city}, {s.state_code}</div>
                      {s.description && <p style={{ color: "var(--gray-600)", fontSize: "0.875rem", lineHeight: 1.65, marginBottom: "0.75rem" }}>{s.description.slice(0, 180)}{s.description.length > 180 ? "…" : ""}</p>}
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <Stars rating={s.rating ?? 0} />
                        <span style={{ fontSize: "0.8125rem", color: "var(--gray-400)" }}>({s.review_count ?? 0})</span>
                      </div>
                    </div>
                    <div className="search-card-actions">
                      <Link href={`/suppliers/profile/${s.id}`} className="btn-red" style={{ padding: "0.625rem 1.25rem", fontSize: "0.875rem" }}>View Profile</Link>
                      {s.phone && <a href={`tel:${s.phone}`} className="btn-secondary" style={{ padding: "0.625rem 1.25rem", fontSize: "0.875rem" }}>Call</a>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <div className="card" style={{ padding: "3rem", textAlign: "center", marginBottom: "3rem" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>{cat.icon}</div>
            <h3 style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "0.75rem" }}>No {cat.name.toLowerCase()} listed yet in {cityName}</h3>
            <p style={{ color: "var(--gray-500)", marginBottom: "1.5rem" }}>We're growing our network. Browse statewide options or check related categories.</p>
            <Link href={`/suppliers/${state}`} className="btn-red">Browse {st.name} Suppliers</Link>
          </div>
        )}

        {/* Related categories */}
        {related.length > 0 && (
          <section>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--navy)", marginBottom: "1.25rem" }}>Related Categories in {cityName}</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
              {related.map(r => (
                <Link key={r.id} href={`/suppliers/${state}/${city}/${r.id}`}
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem 1.125rem", background: "white", border: "1.5px solid var(--gray-150)", borderRadius: "999px", textDecoration: "none", color: "var(--gray-600)", fontSize: "0.875rem", fontWeight: 500, transition: "all 0.15s" }}
                  className="rel-pill">
                  {r.icon} {r.name}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
      <style>{`.rel-pill:hover { border-color: var(--navy) !important; color: var(--navy) !important; }`}</style>
    </div>
  );
}
