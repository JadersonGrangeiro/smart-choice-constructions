import Link from "next/link";
import { supplierSchema, supplierBreadcrumbSchema } from "@/lib/seo";
import { MOCK_SUPPLIERS, SUPPLIER_CATEGORIES, getRelatedSuppliers, getSupplierCategoryById } from "@/lib/supplier-data";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return MOCK_SUPPLIERS.map(s => ({ id: s.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const s = MOCK_SUPPLIERS.find(x => x.id === id);
  if (!s) return {};
  const cat = getSupplierCategoryById(s.categoryId);
  return {
    title: `${s.name} | ${cat?.name} in ${s.location}`,
    description: `${s.description.slice(0, 160)}`,
    openGraph: { title: `${s.name} — ${cat?.name}`, description: s.description.slice(0, 160) },
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

// Mock reviews for suppliers
const SUPPLIER_REVIEWS = [
  { name: "Robert C.",  role: "Licensed Contractor", rating: 5, text: "Incredibly knowledgeable staff and the pricing is competitive. Same-day delivery when I need it. My go-to for every project." },
  { name: "Maria G.",  role: "General Contractor",   rating: 5, text: "The account manager actually knows what they're talking about. Net-30 terms made cash flow much easier on a big job." },
  { name: "James W.",  role: "Homeowner",            rating: 4, text: "Helped me source everything for a kitchen renovation. Wide selection and they pulled my order before I arrived." },
];

export default async function SupplierProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = MOCK_SUPPLIERS.find(x => x.id === id);
  if (!s) notFound();
  const cat     = getSupplierCategoryById(s.categoryId);
  const related = getRelatedSuppliers(s.id, s.categoryId);
  const stateObj = { slug: s.stateCode.toLowerCase() };

  const faq = [
    { q: "Do you offer contractor accounts or trade pricing?", a: `Many suppliers offer dedicated trade pricing for licensed contractors. Contact ${s.name} directly to inquire about contractor accounts, net terms, and volume pricing.` },
    { q: "What is your delivery range?",                       a: `Delivery availability varies. Contact ${s.name} at ${s.phone} to confirm delivery to your job site.` },
    { q: "Can I view samples or products in person?",          a: `${s.name} welcomes visitors during business hours: ${s.hours}. We recommend calling ahead for showroom appointments.` },
    { q: "What brands do you carry?",                          a: `Current brands include: ${s.brands.join(", ")}. Product availability may vary — contact us for current stock.` },
  ];

  const schema     = supplierSchema(s, cat?.name ?? "");
  const breadcrumb = supplierBreadcrumbSchema(s.categoryId, cat?.name ?? "", undefined, undefined, undefined, undefined, s.name);

  return (
    <div style={{ paddingTop: "76px" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      {/* Cover */}
      <div style={{ height: "220px", background: `linear-gradient(155deg, ${cat?.color ?? "var(--navy-dark)"}, var(--navy))`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "8rem", opacity: 0.1 }}>
          {cat?.icon ?? "🏢"}
        </div>
        {/* Breadcrumb */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "1rem 0", background: "linear-gradient(transparent, rgba(0,0,0,0.4))" }}>
          <div className="container">
            <nav aria-label="Breadcrumb" style={{ display: "flex", gap: "0.5rem", fontSize: "0.8125rem", color: "rgba(255,255,255,0.55)", flexWrap: "wrap" }}>
              <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>Home</Link>
              <span>/</span>
              <Link href="/suppliers" style={{ color: "inherit", textDecoration: "none" }}>Local Suppliers</Link>
              <span>/</span>
              <Link href={`/suppliers/categories/${s.categoryId}`} style={{ color: "inherit", textDecoration: "none" }}>{cat?.name}</Link>
              <span>/</span>
              <span style={{ color: "rgba(255,255,255,0.85)" }}>{s.name}</span>
            </nav>
          </div>
        </div>
      </div>

      {/* Sticky header */}
      <div style={{ background: "white", borderBottom: "1px solid var(--gray-100)", position: "sticky", top: "72px", zIndex: 50 }}>
        <div className="container" style={{ padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
          {/* Logo avatar */}
          <div style={{ width: "72px", height: "72px", background: `${cat?.color ?? "var(--navy)"}18`, border: `2px solid ${cat?.color ?? "var(--navy)"}22`, borderRadius: "18px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", flexShrink: 0, marginTop: "-36px" }}>
            {cat?.icon ?? "🏢"}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", marginBottom: "0.375rem" }}>
              <h1 style={{ fontSize: "1.375rem", fontWeight: 900, color: "var(--navy)" }}>{s.name}</h1>
              {s.verified && <span style={{ background: "rgba(22,163,74,0.1)", color: "#16a34a", padding: "0.2rem 0.625rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700 }}>✓ Verified</span>}
              {s.featured && <span style={{ background: "rgba(199,25,26,0.08)", color: "var(--red)", padding: "0.2rem 0.625rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700 }}>Featured</span>}
            </div>
            <div style={{ fontSize: "0.9rem", color: "var(--gray-500)" }}>{cat?.name} · {s.location} · {s.yearsInBusiness} yrs in business</div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.375rem" }}>
              <Stars rating={s.rating} />
              <span style={{ fontWeight: 700, color: "var(--navy)" }}>{s.rating}</span>
              <span style={{ color: "var(--gray-400)", fontSize: "0.875rem" }}>({s.reviews} reviews)</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", flexShrink: 0 }}>
            <a href={`tel:${s.phone}`} className="btn-red" style={{ padding: "0.75rem 1.5rem" }}>📞 Call</a>
            <a href={`mailto:${s.email}`} className="btn-secondary" style={{ padding: "0.75rem 1.5rem" }}>Email</a>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: "2.5rem 1.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2.5rem" }}>
          {/* Main content */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* About */}
            <div className="card" style={{ padding: "2rem" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--navy)", marginBottom: "1rem" }}>About {s.name}</h2>
              <p style={{ color: "var(--gray-600)", lineHeight: 1.85, marginBottom: "1.5rem" }}>{s.description}</p>
              <div>
                <h3 style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "0.875rem", fontSize: "0.9375rem" }}>Products & Services</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {s.products.map(p => (
                    <span key={p} style={{ background: "rgba(22,46,94,0.07)", color: "var(--navy)", padding: "0.375rem 0.875rem", borderRadius: "999px", fontSize: "0.875rem", fontWeight: 600 }}>{p}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Brands */}
            <div className="card" style={{ padding: "2rem" }}>
              <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--navy)", marginBottom: "1.25rem" }}>Brands Carried</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: "0.625rem" }}>
                {s.brands.map(brand => (
                  <div key={brand} style={{ padding: "0.75rem", background: "var(--gray-50)", border: "1px solid var(--gray-150)", borderRadius: "var(--radius-sm)", textAlign: "center", fontSize: "0.875rem", fontWeight: 600, color: "var(--gray-700)" }}>
                    {brand}
                  </div>
                ))}
              </div>
            </div>

            {/* Photo gallery placeholder */}
            <div className="card" style={{ padding: "2rem" }}>
              <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--navy)", marginBottom: "1.25rem" }}>Gallery</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "0.625rem" }}>
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} style={{ aspectRatio: "4/3", background: `linear-gradient(135deg, ${cat?.color ?? "var(--navy-dark)"}33, ${cat?.color ?? "var(--navy)"}22)`, borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem" }}>
                    {cat?.icon ?? "🏢"}
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="card" style={{ padding: "2rem" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "1.5rem", marginBottom: "2rem", flexWrap: "wrap" }}>
                <div style={{ textAlign: "center", flexShrink: 0 }}>
                  <div style={{ fontSize: "4rem", fontWeight: 900, color: "var(--navy)", lineHeight: 1 }}>{s.rating}</div>
                  <Stars rating={Math.round(s.rating)} size={18} />
                  <div style={{ fontSize: "0.8125rem", color: "var(--gray-400)", marginTop: "0.375rem" }}>{s.reviews} reviews</div>
                </div>
                <div style={{ flex: 1, minWidth: "200px" }}>
                  {[5,4,3,2,1].map(stars => (
                    <div key={stars} style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.375rem" }}>
                      <span style={{ fontSize: "0.8125rem", color: "var(--gray-500)", width: "40px" }}>{stars} star</span>
                      <div style={{ flex: 1, height: "8px", background: "var(--gray-100)", borderRadius: "999px", overflow: "hidden" }}>
                        <div style={{ height: "100%", background: "#f59e0b", borderRadius: "999px", width: stars === 5 ? "75%" : stars === 4 ? "18%" : "7%" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {SUPPLIER_REVIEWS.map((r, i) => (
                <div key={i} style={{ paddingBottom: "1.5rem", borderBottom: i < SUPPLIER_REVIEWS.length - 1 ? "1px solid var(--gray-100)" : "none", marginBottom: i < SUPPLIER_REVIEWS.length - 1 ? "1.5rem" : 0 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div style={{ width: "40px", height: "40px", background: "var(--navy)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, flexShrink: 0 }}>
                        {r.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: "var(--navy)", fontSize: "0.9375rem" }}>{r.name}</div>
                        <div style={{ fontSize: "0.8125rem", color: "var(--gray-400)" }}>{r.role}</div>
                      </div>
                    </div>
                    <Stars rating={r.rating} />
                  </div>
                  <p style={{ color: "var(--gray-600)", lineHeight: 1.75, fontSize: "0.9375rem" }}>{r.text}</p>
                </div>
              ))}
            </div>

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

            {/* Related */}
            {related.length > 0 && (
              <div className="card" style={{ padding: "2rem" }}>
                <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--navy)", marginBottom: "1.25rem" }}>Similar {cat?.name}</h2>
                {related.map(r => (
                  <Link key={r.id} href={`/suppliers/profile/${r.id}`} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.875rem 0", borderBottom: "1px solid var(--gray-100)", textDecoration: "none", transition: "background 0.15s" }}>
                    <span style={{ fontSize: "1.5rem" }}>{cat?.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: "var(--navy)", fontSize: "0.9rem" }}>{r.name}</div>
                      <div style={{ fontSize: "0.8125rem", color: "var(--gray-400)" }}>{r.location}</div>
                    </div>
                    <span style={{ color: "#f59e0b", fontSize: "0.875rem" }}>★ {r.rating}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {/* Contact card */}
            <div className="card" style={{ padding: "1.75rem" }}>
              <h3 style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "1.25rem", fontSize: "1.0625rem" }}>Contact</h3>
              <a href={`tel:${s.phone}`} className="btn-red" style={{ display: "block", textAlign: "center", marginBottom: "0.75rem" }}>{s.phone}</a>
              <a href={`mailto:${s.email}`} className="btn-secondary" style={{ display: "block", textAlign: "center", marginBottom: "1.25rem" }}>Send Email</a>
              {s.website && (
                <a href={s.website} target="_blank" rel="noopener noreferrer" style={{ display: "block", textAlign: "center", fontSize: "0.875rem", color: "var(--navy)", textDecoration: "none", fontWeight: 600 }}>
                  🌐 Visit Website →
                </a>
              )}
            </div>

            {/* Hours & location */}
            <div className="card" style={{ padding: "1.5rem" }}>
              <h3 style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "1rem", fontSize: "1rem" }}>Location & Hours</h3>
              <div style={{ fontSize: "0.875rem", color: "var(--gray-600)", marginBottom: "0.75rem", lineHeight: 1.65 }}>
                📍 {s.address}
              </div>
              <div style={{ fontSize: "0.875rem", color: "var(--gray-600)", marginBottom: "1.25rem", lineHeight: 1.65 }}>
                🕐 {s.hours}
              </div>
              {/* Map placeholder */}
              <a href={`https://maps.google.com/?q=${encodeURIComponent(s.address)}`}
                target="_blank" rel="noopener noreferrer"
                style={{ height: "140px", background: "linear-gradient(135deg, var(--gray-100), var(--gray-50))", borderRadius: "var(--radius)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "0.5rem", cursor: "pointer", textDecoration: "none" }}>
                <span style={{ fontSize: "1.75rem" }}>🗺️</span>
                <span style={{ fontSize: "0.8125rem", color: "var(--gray-400)" }}>Open in Google Maps</span>
              </a>
            </div>

            {/* Quick facts */}
            <div className="card" style={{ padding: "1.5rem" }}>
              <h3 style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "1rem", fontSize: "1rem" }}>Quick Facts</h3>
              {[
                ["Category",        cat?.name ?? ""],
                ["Location",        s.location],
                ["In Business",     `${s.yearsInBusiness} years`],
                ["Reviews",         s.reviews.toString()],
                ["Rating",          `${s.rating} / 5.0`],
              ].map(([label, value]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "0.625rem 0", borderBottom: "1px solid var(--gray-100)", fontSize: "0.875rem" }}>
                  <span style={{ color: "var(--gray-500)" }}>{label}</span>
                  <span style={{ fontWeight: 600, color: "var(--navy)" }}>{value}</span>
                </div>
              ))}
            </div>

            {/* Social */}
            {(s.instagram || s.facebook || s.linkedin) && (
              <div className="card" style={{ padding: "1.5rem" }}>
                <h3 style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "1rem", fontSize: "1rem" }}>Follow Us</h3>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  {s.instagram && <a href={s.instagram} target="_blank" rel="noopener noreferrer" style={{ padding: "0.5rem 1rem", background: "var(--gray-100)", borderRadius: "var(--radius-sm)", fontSize: "0.8125rem", fontWeight: 600, color: "var(--gray-700)", textDecoration: "none" }}>Instagram</a>}
                  {s.facebook  && <a href={s.facebook}  target="_blank" rel="noopener noreferrer" style={{ padding: "0.5rem 1rem", background: "var(--gray-100)", borderRadius: "var(--radius-sm)", fontSize: "0.8125rem", fontWeight: 600, color: "var(--gray-700)", textDecoration: "none" }}>Facebook</a>}
                  {s.linkedin  && <a href={s.linkedin}  target="_blank" rel="noopener noreferrer" style={{ padding: "0.5rem 1rem", background: "var(--gray-100)", borderRadius: "var(--radius-sm)", fontSize: "0.8125rem", fontWeight: 600, color: "var(--gray-700)", textDecoration: "none" }}>LinkedIn</a>}
                </div>
              </div>
            )}

            {/* Disclaimer */}
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
