import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/server";
import { SUPPLIER_CATEGORIES, getSupplierCategoryById } from "@/lib/supplier-data";

export const dynamic = "force-dynamic";

async function getSupplier(id: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("suppliers")
    .select("*")
    .eq("id", id)
    .eq("status", "active")
    .single();
  if (error || !data) return null;
  return data;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const s = await getSupplier(id);
  if (!s) return {};
  const cat = SUPPLIER_CATEGORIES.find(c => c.id === s.category || c.name === s.category);
  return {
    title: `${s.company_name} | ${cat?.name ?? s.category} Supplier`,
    description: s.description?.slice(0, 160) ?? `${s.company_name} is a local ${s.category} supplier serving ${s.city ?? ""}, ${s.state_code ?? ""}.`,
  };
}

function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div style={{ display: "flex", gap: "2px" }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i <= Math.round(rating) ? "#f59e0b" : "#e2e8f0"}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </div>
  );
}

export default async function SupplierProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = await getSupplier(id);
  if (!s) notFound();

  const cat = SUPPLIER_CATEGORIES.find(c => c.id === s.category || c.name === s.category);
  const products: string[] = s.products ?? [];
  const brands: string[] = s.brands ?? [];
  const rating = s.rating ?? 0;
  const reviewCount = s.review_count ?? 0;
  const yearsInBusiness = s.years_in_business ?? 0;
  const location = [s.city, s.state_code].filter(Boolean).join(", ");

  const faq = [
    { q: "Do you offer contractor accounts or trade pricing?", a: `Many suppliers offer dedicated trade pricing for licensed contractors. Contact ${s.company_name} directly to inquire about contractor accounts, net terms, and volume pricing.` },
    { q: "What is your delivery range?", a: `Delivery availability varies. Contact ${s.company_name}${s.phone ? ` at ${s.phone}` : ""} to confirm delivery to your job site.` },
    { q: "Can I view products in person?", a: `${s.company_name} welcomes visitors${s.hours ? ` during business hours: ${s.hours}` : ""}. We recommend calling ahead for showroom appointments.` },
    ...(brands.length > 0 ? [{ q: "What brands do you carry?", a: `Current brands include: ${brands.join(", ")}. Product availability may vary — contact us for current stock.` }] : []),
  ];

  return (
    <div style={{ paddingTop: "76px" }}>
      {/* Cover */}
      <div style={{ height: "220px", background: `linear-gradient(155deg, ${cat?.color ?? "var(--navy-dark)"}, var(--navy))`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "8rem", opacity: 0.1 }}>
          {cat?.icon ?? "🏢"}
        </div>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "1rem 0", background: "linear-gradient(transparent, rgba(0,0,0,0.4))" }}>
          <div className="container">
            <nav aria-label="Breadcrumb" style={{ display: "flex", gap: "0.5rem", fontSize: "0.8125rem", color: "rgba(255,255,255,0.55)", flexWrap: "wrap" }}>
              <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>Home</Link>
              <span>/</span>
              <Link href="/suppliers" style={{ color: "inherit", textDecoration: "none" }}>Local Suppliers</Link>
              <span>/</span>
              {cat && <><Link href={`/suppliers/categories/${cat.id}`} style={{ color: "inherit", textDecoration: "none" }}>{cat.name}</Link><span>/</span></>}
              <span style={{ color: "rgba(255,255,255,0.85)" }}>{s.company_name}</span>
            </nav>
          </div>
        </div>
      </div>

      {/* Sticky header */}
      <div style={{ background: "white", borderBottom: "1px solid var(--gray-100)", position: "sticky", top: "72px", zIndex: 50 }}>
        <div className="container" style={{ padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
          <div style={{ width: "72px", height: "72px", background: `${cat?.color ?? "var(--navy)"}18`, border: `2px solid ${cat?.color ?? "var(--navy)"}22`, borderRadius: "18px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", flexShrink: 0, marginTop: "-36px" }}>
            {s.logo_url ? <img src={s.logo_url} alt={s.company_name} style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "16px" }} /> : (cat?.icon ?? "🏢")}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", marginBottom: "0.375rem" }}>
              <h1 style={{ fontSize: "1.375rem", fontWeight: 900, color: "var(--navy)" }}>{s.company_name}</h1>
              {s.verified && <span style={{ background: "rgba(22,163,74,0.1)", color: "#16a34a", padding: "0.2rem 0.625rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700 }}>✓ Verified</span>}
              {s.is_featured && <span style={{ background: "rgba(199,25,26,0.08)", color: "var(--red)", padding: "0.2rem 0.625rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700 }}>Featured</span>}
            </div>
            <div style={{ fontSize: "0.9rem", color: "var(--gray-500)" }}>
              {cat?.name ?? s.category}{location ? ` · ${location}` : ""}{yearsInBusiness > 0 ? ` · ${yearsInBusiness} yrs in business` : ""}
            </div>
            {rating > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.375rem" }}>
                <Stars rating={rating} />
                <span style={{ fontWeight: 700, color: "var(--navy)" }}>{rating}</span>
                <span style={{ color: "var(--gray-400)", fontSize: "0.875rem" }}>({reviewCount} reviews)</span>
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: "0.75rem", flexShrink: 0 }}>
            {s.phone && <a href={`tel:${s.phone}`} className="btn-red" style={{ padding: "0.75rem 1.5rem" }}>📞 Call</a>}
            {s.email && <a href={`mailto:${s.email}`} className="btn-secondary" style={{ padding: "0.75rem 1.5rem" }}>Email</a>}
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: "2.5rem 1.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2.5rem" }}>
          {/* Main content */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* About */}
            <div className="card" style={{ padding: "2rem" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--navy)", marginBottom: "1rem" }}>About {s.company_name}</h2>
              <p style={{ color: "var(--gray-600)", lineHeight: 1.85, marginBottom: products.length > 0 ? "1.5rem" : 0 }}>
                {s.description ?? `${s.company_name} is a local ${cat?.name ?? s.category} supplier${location ? ` serving ${location}` : ""}.`}
              </p>
              {products.length > 0 && (
                <div>
                  <h3 style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "0.875rem", fontSize: "0.9375rem" }}>Products & Services</h3>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {products.map(p => (
                      <span key={p} style={{ background: "rgba(22,46,94,0.07)", color: "var(--navy)", padding: "0.375rem 0.875rem", borderRadius: "999px", fontSize: "0.875rem", fontWeight: 600 }}>{p}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Brands */}
            {brands.length > 0 && (
              <div className="card" style={{ padding: "2rem" }}>
                <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--navy)", marginBottom: "1.25rem" }}>Brands Carried</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: "0.625rem" }}>
                  {brands.map(brand => (
                    <div key={brand} style={{ padding: "0.75rem", background: "var(--gray-50)", border: "1px solid var(--gray-150)", borderRadius: "var(--radius-sm)", textAlign: "center", fontSize: "0.875rem", fontWeight: 600, color: "var(--gray-700)" }}>
                      {brand}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FAQ */}
            <div className="card" style={{ padding: "2rem" }}>
              <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--navy)", marginBottom: "1.5rem" }}>Frequently Asked Questions</h2>
              {faq.map((item, i) => (
                <div key={i} style={{ paddingBottom: i < faq.length - 1 ? "1.25rem" : 0, marginBottom: i < faq.length - 1 ? "1.25rem" : 0, borderBottom: i < faq.length - 1 ? "1px solid var(--gray-100)" : "none" }}>
                  <h3 style={{ fontWeight: 700, color: "var(--navy)", fontSize: "0.9375rem", marginBottom: "0.5rem" }}>{item.q}</h3>
                  <p style={{ color: "var(--gray-600)", lineHeight: 1.7, fontSize: "0.9375rem" }}>{item.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {/* Contact card */}
            <div className="card" style={{ padding: "1.75rem" }}>
              <h3 style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "1.25rem", fontSize: "1.0625rem" }}>Contact</h3>
              {s.phone && <a href={`tel:${s.phone}`} className="btn-red" style={{ display: "block", textAlign: "center", marginBottom: "0.75rem" }}>{s.phone}</a>}
              {s.email && <a href={`mailto:${s.email}`} className="btn-secondary" style={{ display: "block", textAlign: "center", marginBottom: "1.25rem" }}>Send Email</a>}
              {s.website && (
                <a href={s.website} target="_blank" rel="noopener noreferrer" style={{ display: "block", textAlign: "center", fontSize: "0.875rem", color: "var(--navy)", textDecoration: "none", fontWeight: 600 }}>
                  🌐 Visit Website →
                </a>
              )}
            </div>

            {/* Location & Hours */}
            {(s.address || s.hours) && (
              <div className="card" style={{ padding: "1.5rem" }}>
                <h3 style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "1rem", fontSize: "1rem" }}>Location & Hours</h3>
                {s.address && (
                  <div style={{ fontSize: "0.875rem", color: "var(--gray-600)", marginBottom: "0.75rem", lineHeight: 1.65 }}>
                    📍 {s.address}
                  </div>
                )}
                {s.hours && (
                  <div style={{ fontSize: "0.875rem", color: "var(--gray-600)", marginBottom: s.address ? "1.25rem" : 0, lineHeight: 1.65 }}>
                    🕐 {s.hours}
                  </div>
                )}
                {s.address && (
                  <a href={`https://maps.google.com/?q=${encodeURIComponent(s.address)}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{ height: "140px", background: "linear-gradient(135deg, var(--gray-100), var(--gray-50))", borderRadius: "var(--radius)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "0.5rem", cursor: "pointer", textDecoration: "none" }}>
                    <span style={{ fontSize: "1.75rem" }}>🗺️</span>
                    <span style={{ fontSize: "0.8125rem", color: "var(--gray-400)" }}>Open in Google Maps</span>
                  </a>
                )}
              </div>
            )}

            {/* Quick facts */}
            <div className="card" style={{ padding: "1.5rem" }}>
              <h3 style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "1rem", fontSize: "1rem" }}>Quick Facts</h3>
              {[
                cat?.name && ["Category", cat.name],
                location && ["Location", location],
                yearsInBusiness > 0 && ["In Business", `${yearsInBusiness} years`],
                reviewCount > 0 && ["Reviews", reviewCount.toString()],
                rating > 0 && ["Rating", `${rating} / 5.0`],
              ].filter(Boolean).map((row) => {
                const [label, value] = row as [string, string];
                return (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "0.625rem 0", borderBottom: "1px solid var(--gray-100)", fontSize: "0.875rem" }}>
                    <span style={{ color: "var(--gray-500)" }}>{label}</span>
                    <span style={{ fontWeight: 600, color: "var(--navy)" }}>{value}</span>
                  </div>
                );
              })}
            </div>

            {/* Social */}
            {(s.instagram_url || s.facebook_url || s.linkedin_url) && (
              <div className="card" style={{ padding: "1.5rem" }}>
                <h3 style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "1rem", fontSize: "1rem" }}>Follow Us</h3>
                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                  {s.instagram_url && <a href={s.instagram_url} target="_blank" rel="noopener noreferrer" style={{ padding: "0.5rem 1rem", background: "var(--gray-100)", borderRadius: "var(--radius-sm)", fontSize: "0.8125rem", fontWeight: 600, color: "var(--gray-700)", textDecoration: "none" }}>Instagram</a>}
                  {s.facebook_url  && <a href={s.facebook_url}  target="_blank" rel="noopener noreferrer" style={{ padding: "0.5rem 1rem", background: "var(--gray-100)", borderRadius: "var(--radius-sm)", fontSize: "0.8125rem", fontWeight: 600, color: "var(--gray-700)", textDecoration: "none" }}>Facebook</a>}
                  {s.linkedin_url  && <a href={s.linkedin_url}  target="_blank" rel="noopener noreferrer" style={{ padding: "0.5rem 1rem", background: "var(--gray-100)", borderRadius: "var(--radius-sm)", fontSize: "0.8125rem", fontWeight: 600, color: "var(--gray-700)", textDecoration: "none" }}>LinkedIn</a>}
                </div>
              </div>
            )}

            <div style={{ background: "var(--gray-50)", borderRadius: "var(--radius)", padding: "1.125rem", border: "1px solid var(--gray-150)" }}>
              <p style={{ fontSize: "0.8125rem", color: "var(--gray-400)", lineHeight: 1.65 }}>
                Smart Choice Constructions lists local suppliers as a resource for homeowners and contractors. We do not guarantee product availability, pricing, or service quality. <Link href="/terms" style={{ color: "var(--navy)", textDecoration: "none" }}>Terms</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
