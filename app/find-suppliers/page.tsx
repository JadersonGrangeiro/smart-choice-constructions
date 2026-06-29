"use client";
import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SUPPLIER_CATEGORIES, MOCK_SUPPLIERS } from "@/lib/supplier-data";

function Stars({ rating }: { rating: number }) {
  return (
    <div style={{ display: "flex", gap: "1px" }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill={i <= Math.round(rating) ? "#f59e0b" : "#e2e8f0"}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </div>
  );
}

function FindSuppliersContent() {
  const params = useSearchParams();
  const [categoryFilter, setCategoryFilter] = useState(params.get("category") ?? "all");
  const [sort, setSort] = useState("rating");
  const cityParam  = params.get("city")  ?? "";
  const stateParam = params.get("state") ?? "";

  let suppliers = [...MOCK_SUPPLIERS];
  if (categoryFilter !== "all") suppliers = suppliers.filter(s => s.categoryId === categoryFilter);
  if (stateParam) suppliers = suppliers.filter(s => s.stateCode === stateParam);
  if (sort === "rating")  suppliers.sort((a,b) => b.rating - a.rating);
  if (sort === "reviews") suppliers.sort((a,b) => b.reviews - a.reviews);

  return (
    <div style={{ paddingTop: "76px", minHeight: "100vh", background: "var(--gray-50)" }}>
      {/* Header */}
      <div style={{ background: "var(--navy)", padding: "2rem 0 2.5rem" }}>
        <div className="container">
          <h1 className="heading-md" style={{ color: "white", marginBottom: "0.5rem" }}>
            {cityParam ? `Suppliers in ${cityParam}` : stateParam ? `Suppliers in ${stateParam}` : "Find Local Suppliers"}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9375rem" }}>
            Building materials, equipment, design professionals, and construction services.
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: "2rem 1.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "2rem" }}>
          {/* Filters */}
          <div className="hide-mobile">
            <div className="card" style={{ padding: "1.5rem" }}>
              <h3 style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "1.25rem", fontSize: "1rem" }}>Category</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                <button onClick={() => setCategoryFilter("all")} style={{
                  textAlign: "left", padding: "0.5rem 0.75rem", border: "none", borderRadius: "var(--radius-sm)",
                  background: categoryFilter === "all" ? "var(--navy)" : "transparent",
                  color: categoryFilter === "all" ? "white" : "var(--gray-700)",
                  cursor: "pointer", fontFamily: "inherit", fontSize: "0.875rem", fontWeight: categoryFilter === "all" ? 700 : 400,
                }}>
                  All Categories ({MOCK_SUPPLIERS.length})
                </button>
                {SUPPLIER_CATEGORIES.filter(c => MOCK_SUPPLIERS.some(s => s.categoryId === c.id)).map(cat => {
                  const count = MOCK_SUPPLIERS.filter(s => s.categoryId === cat.id).length;
                  return (
                    <button key={cat.id} onClick={() => setCategoryFilter(cat.id)} style={{
                      textAlign: "left", padding: "0.5rem 0.75rem", border: "none", borderRadius: "var(--radius-sm)",
                      background: categoryFilter === cat.id ? "var(--navy)" : "transparent",
                      color: categoryFilter === cat.id ? "white" : "var(--gray-700)",
                      cursor: "pointer", fontFamily: "inherit", fontSize: "0.875rem",
                      fontWeight: categoryFilter === cat.id ? 700 : 400,
                      display: "flex", alignItems: "center", gap: "0.5rem",
                    }}>
                      <span>{cat.icon}</span> {cat.name} ({count})
                    </button>
                  );
                })}
              </div>

              <div style={{ marginTop: "1.5rem", paddingTop: "1.25rem", borderTop: "1px solid var(--gray-100)" }}>
                <h3 style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "0.875rem", fontSize: "1rem" }}>Sort By</h3>
                {[["rating","Highest Rated"],["reviews","Most Reviews"]].map(([v,l]) => (
                  <label key={v} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.375rem 0", cursor: "pointer", fontSize: "0.875rem", color: "var(--gray-700)" }}>
                    <input type="radio" name="sort" checked={sort === v} onChange={() => setSort(v)} style={{ accentColor: "var(--navy)" }} /> {l}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Results */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
              <div style={{ fontWeight: 600, color: "var(--navy)" }}>
                <span style={{ color: "var(--red)" }}>{suppliers.length}</span> supplier{suppliers.length !== 1 ? "s" : ""} found
              </div>
            </div>

            {suppliers.length === 0 ? (
              <div className="card" style={{ padding: "3rem", textAlign: "center" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔍</div>
                <h3 style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "0.75rem" }}>No suppliers found</h3>
                <p style={{ color: "var(--gray-500)", marginBottom: "1.5rem" }}>Try a different category or browse all suppliers.</p>
                <button onClick={() => setCategoryFilter("all")} className="btn-primary">View All Suppliers</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {suppliers.map(s => {
                  const cat = SUPPLIER_CATEGORIES.find(c => c.id === s.categoryId);
                  return (
                    <div key={s.id} className="card" style={{ padding: "1.5rem" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: "1.25rem", alignItems: "start" }}>
                        <div style={{ width: "56px", height: "56px", background: `${cat?.color ?? "var(--navy)"}18`, borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", flexShrink: 0 }}>
                          {cat?.icon ?? "🏢"}
                        </div>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", flexWrap: "wrap", marginBottom: "0.375rem" }}>
                            <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "var(--navy)" }}>{s.name}</h3>
                            {s.verified && <span className="badge badge-green" style={{ fontSize: "0.7rem" }}>✓ Verified</span>}
                            {s.featured && <span className="badge badge-red" style={{ fontSize: "0.7rem" }}>Featured</span>}
                          </div>
                          <div style={{ fontSize: "0.875rem", color: "var(--gray-500)", marginBottom: "0.5rem" }}>
                            {cat?.name} · {s.location} · {s.yearsInBusiness} yrs in business
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                            <Stars rating={s.rating} />
                            <span style={{ fontWeight: 700, color: "var(--navy)", fontSize: "0.9rem" }}>{s.rating}</span>
                            <span style={{ color: "var(--gray-400)", fontSize: "0.875rem" }}>({s.reviews} reviews)</span>
                          </div>
                          <p style={{ color: "var(--gray-600)", fontSize: "0.875rem", lineHeight: 1.65 }}>{s.description.slice(0, 160)}…</p>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem", marginTop: "0.75rem" }}>
                            {s.products.slice(0, 3).map(p => (
                              <span key={p} style={{ background: "rgba(22,46,94,0.06)", color: "var(--navy)", padding: "0.2rem 0.625rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 500 }}>{p}</span>
                            ))}
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem", flexShrink: 0 }}>
                          <Link href={`/suppliers/profile/${s.id}`} className="btn-red" style={{ padding: "0.625rem 1.25rem", fontSize: "0.875rem" }}>View Profile</Link>
                          <a href={`tel:${s.phone}`} className="btn-secondary" style={{ padding: "0.625rem 1.25rem", fontSize: "0.875rem" }}>Call</a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FindSuppliers() {
  return (
    <Suspense fallback={<div style={{ paddingTop: "76px", textAlign: "center", padding: "4rem" }}>Loading…</div>}>
      <FindSuppliersContent />
    </Suspense>
  );
}
