import Link from "next/link";
import { SUPPLIER_CATEGORIES, MOCK_SUPPLIERS, getSuppliersByCategory } from "@/lib/supplier-data";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return SUPPLIER_CATEGORIES.map(c => ({ category: c.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  const cat = SUPPLIER_CATEGORIES.find(c => c.id === category);
  if (!cat) return {};
  return {
    title: `${cat.name} Near You | Local Suppliers`,
    description: `Find local ${cat.name.toLowerCase()} in your area. ${cat.description} Browse reviews, compare options, and connect directly.`,
  };
}

function Stars({ rating }: { rating: number }) {
  return <span style={{ color: "#f59e0b" }}>{"★".repeat(Math.round(rating))}{"☆".repeat(5 - Math.round(rating))}</span>;
}

export default async function SupplierCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const cat = SUPPLIER_CATEGORIES.find(c => c.id === category);
  if (!cat) notFound();
  const suppliers = getSuppliersByCategory(category);
  const related = SUPPLIER_CATEGORIES.filter(c => c.id !== category && c.group === cat.group).slice(0, 4);

  return (
    <div style={{ paddingTop: "76px" }}>
      <div style={{ background: "linear-gradient(155deg, #0d1f40, var(--navy))", padding: "4rem 0 3rem" }}>
        <div className="container">
          <nav aria-label="Breadcrumb" style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", fontSize: "0.875rem", color: "rgba(255,255,255,0.45)", flexWrap: "wrap" }}>
            <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>Home</Link>
            <span>/</span>
            <Link href="/suppliers" style={{ color: "inherit", textDecoration: "none" }}>Local Suppliers</Link>
            <span>/</span>
            <span style={{ color: "rgba(255,255,255,0.85)" }}>{cat.name}</span>
          </nav>
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", marginBottom: "1rem" }}>
            <span style={{ fontSize: "3rem" }}>{cat.icon}</span>
            <h1 style={{ fontSize: "clamp(1.75rem,4vw,2.5rem)", fontWeight: 900, color: "white", letterSpacing: "-0.03em" }}>
              {cat.name}
            </h1>
          </div>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "1.0625rem", lineHeight: 1.75, maxWidth: "600px", marginBottom: "1.75rem" }}>
            {cat.description}
          </p>
          <Link href="/find-suppliers" className="btn-white" style={{ padding: "0.875rem 1.75rem" }}>
            Find {cat.name} Near Me
          </Link>
        </div>
      </div>

      <div className="container" style={{ padding: "3rem 1.5rem" }}>
        {/* Suppliers in this category */}
        {suppliers.length > 0 ? (
          <section style={{ marginBottom: "3rem" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--navy)", marginBottom: "1.5rem" }}>
              {cat.name} on Smart Choice
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {suppliers.map(s => (
                <div key={s.id} className="card" style={{ padding: "1.5rem", display: "flex", gap: "1.25rem", alignItems: "flex-start" }}>
                  <div style={{ width: "56px", height: "56px", background: `${cat.color}18`, borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.75rem", flexShrink: 0 }}>
                    {cat.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", marginBottom: "0.375rem", flexWrap: "wrap" }}>
                      <h3 style={{ fontWeight: 700, color: "var(--navy)", fontSize: "1rem" }}>{s.name}</h3>
                      {s.featured && <span style={{ background: "rgba(199,25,26,0.08)", color: "var(--red)", padding: "0.2rem 0.5rem", borderRadius: "999px", fontSize: "0.7rem", fontWeight: 700 }}>Featured</span>}
                    </div>
                    <div style={{ fontSize: "0.8125rem", color: "var(--gray-500)", marginBottom: "0.625rem" }}>{s.location} · {s.yearsInBusiness} yrs in business</div>
                    <p style={{ color: "var(--gray-600)", fontSize: "0.9rem", lineHeight: 1.65, marginBottom: "0.875rem" }}>{s.description.slice(0, 180)}…</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
                      {s.products.slice(0, 4).map(p => (
                        <span key={p} style={{ background: "rgba(22,46,94,0.06)", color: "var(--navy)", padding: "0.2rem 0.625rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 500 }}>{p}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem", flexShrink: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", justifyContent: "flex-end" }}>
                      <Stars rating={s.rating} />
                      <span style={{ fontSize: "0.8125rem", color: "var(--gray-400)" }}>({s.reviews})</span>
                    </div>
                    <Link href={`/suppliers/profile/${s.id}`} className="btn-red" style={{ padding: "0.625rem 1.25rem", fontSize: "0.875rem", textAlign: "center" }}>
                      View Profile
                    </Link>
                    <a href={`tel:${s.phone}`} className="btn-secondary" style={{ padding: "0.625rem 1.25rem", fontSize: "0.875rem", textAlign: "center" }}>
                      Call
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <div className="card" style={{ padding: "3rem", textAlign: "center", marginBottom: "3rem" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>{cat.icon}</div>
            <h3 style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "0.75rem" }}>No listings yet</h3>
            <p style={{ color: "var(--gray-500)", marginBottom: "1.5rem" }}>
              We're growing our {cat.name.toLowerCase()} network. Check back soon or browse related categories.
            </p>
          </div>
        )}

        {/* FAQ for SEO */}
        <section style={{ marginBottom: "3rem" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--navy)", marginBottom: "1.5rem" }}>
            Frequently Asked Questions
          </h2>
          <div className="card" style={{ padding: 0 }}>
            {[
              {
                q: `How do I find ${cat.name.toLowerCase()} near me?`,
                a: `Use the search bar or browse by state and city on this page. Each listing shows the supplier\'s location, hours, brands carried, and contact information. You can also use the "Find Near Me" filter to see suppliers in your ZIP code area.`,
              },
              {
                q: `Do ${cat.name.toLowerCase()} offer contractor pricing?`,
                a: `Many suppliers offer dedicated trade pricing, net-30 terms, and pro accounts for licensed contractors. Contact each supplier directly to ask about contractor programs — requirements and discounts vary by business.`,
              },
              {
                q: `Are Smart Choice supplier listings verified?`,
                a: `Suppliers may voluntarily submit business documentation for verification. Verified suppliers display a badge on their profile. Listing information is provided by the supplier and Smart Choice does not guarantee accuracy — always confirm details directly.`,
              },
              {
                q: `Can homeowners use Smart Choice to find ${cat.name.toLowerCase()}?`,
                a: `Yes. Smart Choice is free for both homeowners and contractors to browse suppliers. You can view product listings, brands, hours, and contact information without creating an account.`,
              },
            ].map((item, i, arr) => (
              <div key={i} style={{ padding: "1.5rem 2rem", borderBottom: i < arr.length - 1 ? "1px solid var(--gray-100)" : "none" }}>
                <h3 style={{ fontWeight: 700, color: "var(--navy)", fontSize: "1rem", marginBottom: "0.625rem" }}>{item.q}</h3>
                <p style={{ color: "var(--gray-600)", lineHeight: 1.75, fontSize: "0.9375rem" }}>{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Related categories */}
        {related.length > 0 && (
          <section>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--navy)", marginBottom: "1.25rem" }}>Related Categories</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
              {related.map(r => (
                <Link key={r.id} href={`/suppliers/categories/${r.id}`}
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem 1.125rem", background: "white", border: "1.5px solid var(--gray-200)", borderRadius: "999px", textDecoration: "none", color: "var(--gray-700)", fontSize: "0.9rem", fontWeight: 500, transition: "all 0.15s" }}
                  className="related-cat-link">
                  {r.icon} {r.name}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
      <style>{`.related-cat-link:hover { border-color: var(--navy) !important; color: var(--navy) !important; }`}</style>
    </div>
  );
}
