import Link from "next/link";
import { SUPPLIER_CATEGORIES, SUPPLIER_CATEGORY_GROUPS } from "@/lib/supplier-data";
import { US_STATES } from "@/lib/data";
import { createAdminClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Local Suppliers | Building Materials, Equipment & Professional Services",
  description: "Find local building material suppliers, equipment rental companies, architects, designers, and construction service providers near you. Connect with trusted local businesses.",
  openGraph: {
    title: "Local Suppliers | Smart Choice Constructions",
    description: "Browse 27 categories of local suppliers — from building materials to architects and equipment rental.",
  },
};

interface DbSupplier {
  id: string;
  company_name: string;
  category: string;
  description: string | null;
  city: string | null;
  state_code: string | null;
  is_featured: boolean;
}

export default async function SuppliersPage() {
  const supabase = createAdminClient();
  const { data: featuredRaw } = await supabase
    .from("suppliers")
    .select("id, company_name, category, description, city, state_code, is_featured")
    .eq("status", "active")
    .eq("is_featured", true)
    .order("company_name")
    .limit(6);

  const featured: DbSupplier[] = featuredRaw ?? [];
  const groups = Object.entries(SUPPLIER_CATEGORY_GROUPS) as [keyof typeof SUPPLIER_CATEGORY_GROUPS, string][];

  return (
    <div style={{ paddingTop: "76px" }}>
      {/* Hero */}
      <div style={{ background: "linear-gradient(155deg, #0d1f40, var(--navy))", padding: "5rem 0 4rem" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <span style={{ display: "inline-block", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "999px", padding: "0.375rem 1.125rem", fontSize: "0.875rem", fontWeight: 600, color: "rgba(255,255,255,0.85)", marginBottom: "1.5rem" }}>
            Local Suppliers
          </span>
          <h1 style={{ fontSize: "clamp(2rem,5vw,3rem)", fontWeight: 900, color: "white", marginBottom: "1.25rem", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
            Everything Your Project Needs,<br />
            <span style={{ color: "rgba(199,25,26,0.9)" }}>All in One Place</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "1.125rem", lineHeight: 1.75, maxWidth: "600px", margin: "0 auto 2.5rem" }}>
            Browse local building material suppliers, equipment rental companies, design professionals, and construction services — connected directly to the contractors who trust them.
          </p>

          <div style={{ display: "flex", gap: "2rem", justifyContent: "center", flexWrap: "wrap" }}>
            {[
              { value: `${SUPPLIER_CATEGORIES.length}+`, label: "Supplier Categories" },
              { value: "48",                              label: "States Covered" },
              { value: "Free",                            label: "For Contractors & Homeowners" },
            ].map(s => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.75rem", fontWeight: 900, color: "white", letterSpacing: "-0.03em" }}>{s.value}</div>
                <div style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.5)", marginTop: "0.125rem" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: "4rem 1.5rem" }}>

        {/* Categories by group */}
        {groups.map(([groupKey, groupLabel]) => {
          const cats = SUPPLIER_CATEGORIES.filter(c => c.group === groupKey);
          return (
            <section key={groupKey} style={{ marginBottom: "4rem" }}>
              <h2 style={{ fontSize: "1.375rem", fontWeight: 800, color: "var(--navy)", marginBottom: "0.5rem" }}>{groupLabel}</h2>
              <p style={{ color: "var(--gray-500)", marginBottom: "1.5rem", fontSize: "0.9375rem" }}>
                {groupKey === "materials"    && "Physical products, materials, and supplies for construction and renovation projects."}
                {groupKey === "equipment"    && "Tools, machinery, and equipment available for rent or purchase."}
                {groupKey === "professional" && "Licensed professionals who support the design and management of projects."}
                {groupKey === "services"     && "Support services that complement construction and renovation work."}
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: "1rem" }}>
                {cats.map(cat => (
                  <Link key={cat.id} href={`/suppliers/categories/${cat.id}`}
                    className="supplier-cat-card"
                    style={{
                      display: "flex", alignItems: "flex-start", gap: "1rem",
                      padding: "1.25rem", background: "white",
                      border: "1.5px solid var(--gray-150)", borderRadius: "var(--radius-lg)",
                      textDecoration: "none", transition: "all 0.2s",
                    }}>
                    <span style={{ fontSize: "1.75rem", flexShrink: 0 }}>{cat.icon}</span>
                    <div>
                      <div style={{ fontWeight: 700, color: "var(--navy)", fontSize: "0.9375rem", marginBottom: "0.375rem" }}>{cat.name}</div>
                      <div style={{ fontSize: "0.8125rem", color: "var(--gray-400)", lineHeight: 1.5 }}>{cat.description.slice(0, 70)}…</div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}

        {/* Featured suppliers */}
        <section style={{ marginBottom: "4rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
            <h2 style={{ fontSize: "1.375rem", fontWeight: 800, color: "var(--navy)" }}>Featured Local Suppliers</h2>
            <Link href="/find-suppliers" style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--navy)", textDecoration: "none" }}>Browse all →</Link>
          </div>

          {featured.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center", background: "var(--gray-50)", borderRadius: "var(--radius-lg)", border: "1px dashed var(--gray-200)" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>🏢</div>
              <div style={{ fontWeight: 600, color: "var(--gray-600)", marginBottom: "0.375rem" }}>No featured suppliers yet</div>
              <p style={{ fontSize: "0.875rem", color: "var(--gray-400)" }}>Featured suppliers are added by the admin panel.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: "1.25rem" }}>
              {featured.map(supplier => {
                const cat = SUPPLIER_CATEGORIES.find(c => c.name === supplier.category);
                const location = [supplier.city, supplier.state_code].filter(Boolean).join(", ");
                return (
                  <Link key={supplier.id} href={`/suppliers/profile/${supplier.id}`}
                    className="supplier-card"
                    style={{ display: "flex", flexDirection: "column", padding: "1.5rem", background: "white", border: "1.5px solid var(--gray-150)", borderRadius: "var(--radius-lg)", textDecoration: "none", transition: "all 0.2s" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", marginBottom: "1rem" }}>
                      <div style={{ width: "50px", height: "50px", background: `${cat?.color ?? "var(--navy)"}18`, borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", flexShrink: 0 }}>
                        {cat?.icon ?? "🏢"}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: "var(--navy)", fontSize: "1rem", marginBottom: "0.2rem" }}>{supplier.company_name}</div>
                        <div style={{ fontSize: "0.8125rem", color: "var(--gray-500)" }}>
                          {cat?.name ?? supplier.category}{location ? ` · ${location}` : ""}
                        </div>
                      </div>
                      <span style={{ background: "rgba(199,25,26,0.08)", color: "var(--red)", padding: "0.2rem 0.5rem", borderRadius: "999px", fontSize: "0.6875rem", fontWeight: 700, flexShrink: 0 }}>
                        Featured
                      </span>
                    </div>
                    {supplier.description && (
                      <p style={{ color: "var(--gray-600)", fontSize: "0.875rem", lineHeight: 1.65, marginBottom: "1rem", flex: 1 }}>
                        {supplier.description.length > 120 ? supplier.description.slice(0, 120) + "…" : supplier.description}
                      </p>
                    )}
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--navy)" }}>View Profile →</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* Browse by state */}
        <section style={{ marginBottom: "4rem" }}>
          <h2 style={{ fontSize: "1.375rem", fontWeight: 800, color: "var(--navy)", marginBottom: "0.5rem" }}>Browse Suppliers by State</h2>
          <p style={{ color: "var(--gray-500)", marginBottom: "1.5rem", fontSize: "0.9375rem" }}>
            Find local suppliers and service providers in your state.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {US_STATES.slice(0, 20).map(state => (
              <Link key={state.code} href={`/suppliers/${state.slug}`}
                style={{ padding: "0.5rem 0.875rem", background: "white", border: "1.5px solid var(--gray-200)", borderRadius: "999px", textDecoration: "none", color: "var(--gray-700)", fontSize: "0.875rem", fontWeight: 500, transition: "all 0.15s" }}
                className="state-pill">
                {state.name}
              </Link>
            ))}
            <Link href="/locations" style={{ padding: "0.5rem 0.875rem", background: "var(--navy)", border: "none", borderRadius: "999px", textDecoration: "none", color: "white", fontSize: "0.875rem", fontWeight: 600 }}>
              All 50 states →
            </Link>
          </div>
        </section>

        {/* Value prop for contractors */}
        <div style={{ background: "linear-gradient(135deg, var(--navy), #1c3875)", borderRadius: "var(--radius-xl)", padding: "3rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", alignItems: "center" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,255,255,0.1)", borderRadius: "999px", padding: "0.375rem 0.875rem", marginBottom: "1.25rem" }}>
              <span style={{ fontSize: "1.125rem" }}>🔧</span>
              <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>For Contractors</span>
            </div>
            <h3 style={{ fontWeight: 800, color: "white", fontSize: "1.5rem", marginBottom: "1rem", lineHeight: 1.2 }}>
              Link Your Preferred Suppliers to Your Profile
            </h3>
            <p style={{ color: "rgba(255,255,255,0.65)", lineHeight: 1.75, marginBottom: "1.5rem" }}>
              Showcase the suppliers and brands you trust most. When homeowners view your profile, they see the professional network behind your work — building confidence before the first call.
            </p>
            <Link href="/dashboard/contractor" className="btn-white" style={{ padding: "0.875rem 1.75rem" }}>
              Add to Your Profile
            </Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {[
              { icon: "🤝", title: "Mutual referrals",      desc: "Suppliers refer homeowners to contractors in their network." },
              { icon: "⭐", title: "Verified relationships", desc: "Confirmed partnerships earn trust badges on both profiles." },
              { icon: "📍", title: "Local ecosystem",        desc: "Keep business local — support suppliers in your community." },
            ].map(item => (
              <div key={item.title} style={{ display: "flex", gap: "0.875rem", padding: "1rem", background: "rgba(255,255,255,0.06)", borderRadius: "var(--radius)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <span style={{ fontSize: "1.25rem", flexShrink: 0 }}>{item.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, color: "white", fontSize: "0.9375rem", marginBottom: "0.25rem" }}>{item.title}</div>
                  <div style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .supplier-cat-card:hover { border-color: var(--navy) !important; box-shadow: var(--shadow-md); transform: translateY(-2px); }
        .supplier-card:hover     { border-color: var(--navy) !important; box-shadow: var(--shadow-md); transform: translateY(-2px); }
        .state-pill:hover        { border-color: var(--navy) !important; color: var(--navy) !important; }
      `}</style>
    </div>
  );
}
