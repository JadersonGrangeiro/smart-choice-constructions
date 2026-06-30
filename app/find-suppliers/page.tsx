"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SUPPLIER_CATEGORIES } from "@/lib/supplier-data";

interface Supplier {
  id: string;
  company_name: string;
  category: string;
  sub_category: string | null;
  description: string | null;
  city: string | null;
  state_code: string | null;
  website: string | null;
  phone: string | null;
  logo_url: string | null;
  is_featured: boolean;
}

function FindSuppliersContent() {
  const params        = useSearchParams();
  const [category,   setCategory]   = useState(params.get("category") ?? "all");
  const [sort,       setSort]       = useState("name");
  const [suppliers,  setSuppliers]  = useState<Supplier[]>([]);
  const [loading,    setLoading]    = useState(true);

  const stateParam = params.get("state") ?? "";
  const cityParam  = params.get("city")  ?? "";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const sp = new URLSearchParams({ limit: "100" });
      if (category !== "all") {
        const cat = SUPPLIER_CATEGORIES.find(c => c.id === category);
        if (cat) sp.set("category", cat.name);
      }
      if (stateParam) sp.set("state", stateParam);
      if (cityParam)  sp.set("city",  cityParam);

      const res  = await fetch(`/api/suppliers?${sp}`);
      const json = await res.json();
      let data: Supplier[] = json.suppliers ?? [];

      if (sort === "featured") data = [...data].sort((a, b) => Number(b.is_featured) - Number(a.is_featured));
      else data = [...data].sort((a, b) => a.company_name.localeCompare(b.company_name));

      setSuppliers(data);
    } catch {
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  }, [category, sort, stateParam, cityParam]);

  useEffect(() => { load(); }, [load]);

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
        <div className="grid-sidebar-outer" style={{ gridTemplateColumns: "240px 1fr" }}>
          {/* Filters */}
          <div className="hide-mobile">
            <div className="card" style={{ padding: "1.5rem" }}>
              <h3 style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "1.25rem", fontSize: "1rem" }}>Category</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                <button onClick={() => setCategory("all")} style={{
                  textAlign: "left", padding: "0.5rem 0.75rem", border: "none", borderRadius: "var(--radius-sm)",
                  background: category === "all" ? "var(--navy)" : "transparent",
                  color: category === "all" ? "white" : "var(--gray-700)",
                  cursor: "pointer", fontFamily: "inherit", fontSize: "0.875rem", fontWeight: category === "all" ? 700 : 400,
                }}>
                  All Categories
                </button>
                {SUPPLIER_CATEGORIES.map(cat => (
                  <button key={cat.id} onClick={() => setCategory(cat.id)} style={{
                    textAlign: "left", padding: "0.5rem 0.75rem", border: "none", borderRadius: "var(--radius-sm)",
                    background: category === cat.id ? "var(--navy)" : "transparent",
                    color: category === cat.id ? "white" : "var(--gray-700)",
                    cursor: "pointer", fontFamily: "inherit", fontSize: "0.875rem",
                    fontWeight: category === cat.id ? 700 : 400,
                    display: "flex", alignItems: "center", gap: "0.5rem",
                  }}>
                    <span>{cat.icon}</span> {cat.name}
                  </button>
                ))}
              </div>

              <div style={{ marginTop: "1.5rem", paddingTop: "1.25rem", borderTop: "1px solid var(--gray-100)" }}>
                <h3 style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "0.875rem", fontSize: "1rem" }}>Sort By</h3>
                {[["name","Name (A–Z)"],["featured","Featured First"]].map(([v,l]) => (
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
                {loading ? "Loading…" : <><span style={{ color: "var(--red)" }}>{suppliers.length}</span> supplier{suppliers.length !== 1 ? "s" : ""} found</>}
              </div>
            </div>

            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {[1,2,3].map(i => (
                  <div key={i} className="card" style={{ padding: "1.5rem", height: "120px", background: "var(--gray-100)", animation: "pulse 1.5s infinite" }} />
                ))}
              </div>
            ) : suppliers.length === 0 ? (
              <div className="card" style={{ padding: "3rem", textAlign: "center" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔍</div>
                <h3 style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "0.75rem" }}>No suppliers found</h3>
                <p style={{ color: "var(--gray-500)", marginBottom: "1.5rem" }}>Try a different category or browse all suppliers.</p>
                <button onClick={() => setCategory("all")} className="btn-primary">View All Suppliers</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {suppliers.map(s => {
                  const cat      = SUPPLIER_CATEGORIES.find(c => c.name === s.category);
                  const location = [s.city, s.state_code].filter(Boolean).join(", ");
                  return (
                    <div key={s.id} className="card" style={{ padding: "1.5rem" }}>
                      <div className="search-card-layout">
                        <div style={{ width: "56px", height: "56px", background: `${cat?.color ?? "var(--navy)"}18`, borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", flexShrink: 0 }}>
                          {cat?.icon ?? "🏢"}
                        </div>
                        <div className="search-card-body">
                          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", flexWrap: "wrap", marginBottom: "0.375rem" }}>
                            <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "var(--navy)" }}>{s.company_name}</h3>
                            {s.is_featured && <span className="badge badge-red" style={{ fontSize: "0.7rem" }}>Featured</span>}
                          </div>
                          <div style={{ fontSize: "0.875rem", color: "var(--gray-500)", marginBottom: "0.625rem" }}>
                            {cat?.name ?? s.category}{location ? ` · ${location}` : ""}
                            {s.sub_category ? ` · ${s.sub_category}` : ""}
                          </div>
                          {s.description && (
                            <p style={{ color: "var(--gray-600)", fontSize: "0.875rem", lineHeight: 1.65 }}>
                              {s.description.length > 160 ? s.description.slice(0, 160) + "…" : s.description}
                            </p>
                          )}
                        </div>
                        <div className="search-card-actions">
                          <Link href={`/suppliers/profile/${s.id}`} className="btn-red" style={{ padding: "0.625rem 1.25rem", fontSize: "0.875rem" }}>View Profile</Link>
                          {s.phone && (
                            <a href={`tel:${s.phone}`} className="btn-secondary" style={{ padding: "0.625rem 1.25rem", fontSize: "0.875rem" }}>Call</a>
                          )}
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
