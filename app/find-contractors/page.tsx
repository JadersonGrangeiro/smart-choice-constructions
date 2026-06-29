"use client";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CATEGORIES, MOCK_CONTRACTORS, US_STATES } from "@/lib/data";
import { useI18n } from "@/lib/i18n/context";
import SearchBar from "@/components/SearchBar";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="stars">
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill={i <= Math.round(rating) ? "#f59e0b" : "#e2e8f0"}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </div>
  );
}

function FindContractorsContent() {
  const { t } = useI18n();
  const params = useSearchParams();
  const [sort, setSort] = useState("rating");
  const [minRating, setMinRating] = useState("any");
  const [reqLicensed, setReqLicensed] = useState(true);
  const [reqInsured, setReqInsured] = useState(true);
  const [reqVerified, setReqBG] = useState(true);
  const [reqAvail, setReqAvail] = useState(false);

  const queryTerm = params.get("q") || "";
  const zipTerm = params.get("zip") || "";

  // Filter contractors based on query
  let contractors = [...MOCK_CONTRACTORS];
  if (queryTerm) {
    const q = queryTerm.toLowerCase();
    contractors = contractors.filter(c =>
      c.company.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q) ||
      c.services.some(s => s.toLowerCase().includes(q))
    );
  }
  if (sort === "rating")     contractors.sort((a, b) => b.rating - a.rating);
  if (sort === "reviews")    contractors.sort((a, b) => b.reviews - a.reviews);
  if (sort === "experience") contractors.sort((a, b) => b.yearsExp - a.yearsExp);

  return (
    <div style={{ paddingTop: "76px", minHeight: "100vh", background: "var(--gray-50)" }}>
      {/* Search header */}
      <div style={{ background: "var(--navy)", padding: "2rem 0 3rem" }}>
        <div className="container">
          <h1 className="heading-md" style={{ color: "white", marginBottom: "1.5rem" }}>
            {queryTerm ? `Results for "${queryTerm}"` : "Find Contractors Near You"}
          </h1>
          <SearchBar variant="inline" defaultCategory={queryTerm} defaultZip={zipTerm} />
        </div>
      </div>

      <div className="container" style={{ padding: "2rem 1.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: "2rem" }}>
          {/* Sidebar filters */}
          <div className="hide-mobile">
            <div className="card" style={{ padding: "1.5rem", marginBottom: "1rem" }}>
              <h3 style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "1.25rem", fontSize: "1.0625rem" }}>Filters</h3>

              <div style={{ marginBottom: "1.5rem" }}>
                <label className="form-label">Sort By</label>
                <select className="form-select" value={sort} onChange={e => setSort(e.target.value)}>
                  <option value="rating">Highest Rated</option>
                  <option value="reviews">Most Reviews</option>
                  <option value="experience">Most Experience</option>
                </select>
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label className="form-label">Minimum Rating</label>
                {[["any","Any"],["4","4.0+"],["4.5","4.5+"],["4.8","4.8+"]].map(([v,l]) => (
                  <label key={v} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.375rem 0", cursor: "pointer", fontSize: "0.9375rem", color: "var(--gray-700)" }}>
                    <input type="radio" name="minRating" checked={minRating === v} onChange={() => setMinRating(v)} /> {l}
                  </label>
                ))}
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label className="form-label">Requirements</label>
                {[
                  ["Licensed",           reqLicensed, setReqLicensed],
                  ["Insured",            reqInsured,  setReqInsured],
                  ["Credential Verified", reqVerified,       setReqBG],
                  ["Available Now",      reqAvail,    setReqAvail],
                ].map(([label, val, setter]: any) => (
                  <label key={label} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.375rem 0", cursor: "pointer", fontSize: "0.9375rem", color: "var(--gray-700)" }}>
                    <input type="checkbox" checked={val} onChange={e => setter(e.target.checked)} /> {label}
                  </label>
                ))}
              </div>

              <div>
                <label className="form-label">Category</label>
                <select className="form-select" onChange={e => { if (e.target.value) window.location.href = `/find-contractors?q=${e.target.value}`; }}>
                  <option value="">All Categories</option>
                  {CATEGORIES.map(c => <option key={c.id} value={c.name}>{c.icon} {c.name}</option>)}
                </select>
              </div>
            </div>

            <Link href="/request-quote" className="btn-red" style={{ display: "block", textAlign: "center" }}>
              Post a Project
            </Link>
          </div>

          {/* Results */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
              <div style={{ fontWeight: 600, color: "var(--navy)" }}>
                <span style={{ color: "var(--red)" }}>{contractors.length}</span> contractor{contractors.length !== 1 ? "s" : ""} found
                {queryTerm && <span style={{ color: "var(--gray-400)", fontWeight: 400 }}> for "{queryTerm}"</span>}
                {zipTerm && <span style={{ color: "var(--gray-400)", fontWeight: 400 }}> near {zipTerm}</span>}
              </div>
              <div className="show-mobile-only">
                <select className="form-select" value={sort} onChange={e => setSort(e.target.value)} style={{ fontSize: "0.875rem" }}>
                  <option value="rating">Highest Rated</option>
                  <option value="reviews">Most Reviews</option>
                  <option value="experience">Most Experience</option>
                </select>
              </div>
            </div>

            {contractors.length === 0 ? (
              <div className="card" style={{ padding: "3rem", textAlign: "center" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔍</div>
                <h3 style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "0.75rem" }}>No contractors found</h3>
                <p style={{ color: "var(--gray-500)", marginBottom: "1.5rem" }}>Try a different search term or browse by category.</p>
                <Link href="/services" className="btn-primary">Browse All Categories</Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {contractors.map(c => (
                  <div key={c.id} className="card" style={{ padding: "1.5rem" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: "1.25rem", alignItems: "start" }}>
                      <div style={{ width: "58px", height: "58px", background: "var(--navy)", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: "1.375rem", flexShrink: 0 }}>
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.375rem" }}>
                          <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "var(--navy)" }}>{c.company}</h3>
                          {c.verified && <span className="badge badge-green" style={{ fontSize: "0.6875rem" }}>✓ {t.common.verified}</span>}
                          {c.licensed && <span className="badge badge-blue" style={{ fontSize: "0.6875rem" }}>{t.common.licensed}</span>}
                          {c.insured && <span className="badge badge-gray" style={{ fontSize: "0.6875rem" }}>{t.common.insured}</span>}
                        </div>
                        <div style={{ fontSize: "0.875rem", color: "var(--gray-500)", marginBottom: "0.5rem" }}>
                          {c.category} · {c.location} · {c.yearsExp} {t.common.yearsExp}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                          <Stars rating={c.rating} />
                          <span style={{ fontWeight: 700, color: "var(--navy)", fontSize: "0.9375rem" }}>{c.rating}</span>
                          <span style={{ color: "var(--gray-400)", fontSize: "0.875rem" }}>({c.reviews} {t.common.reviews})</span>
                        </div>
                        <p style={{ color: "var(--gray-600)", fontSize: "0.875rem", lineHeight: 1.65, marginBottom: "0.875rem" }}>{c.description}</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem", alignItems: "center" }}>
                          {c.services.map(s => <span key={s} className="badge badge-gray" style={{ fontSize: "0.75rem" }}>{s}</span>)}
                          <span style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem", color: "var(--gray-400)", marginLeft: "0.25rem" }}>
                            <div style={{ width: "6px", height: "6px", background: "#22c55e", borderRadius: "50%" }}/>
                            {t.common.responds} {c.responseTime}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem", flexShrink: 0 }}>
                        <Link href={`/request-quote?contractor=${c.id}`} className="btn-red" style={{ padding: "0.625rem 1.25rem", fontSize: "0.875rem" }}>
                          {t.common.getQuote}
                        </Link>
                        <Link href={`/contractors/${c.id}`} className="btn-secondary" style={{ padding: "0.625rem 1.25rem", fontSize: "0.875rem" }}>
                          {t.common.viewProfile}
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FindContractors() {
  return (
    <Suspense fallback={<div style={{ paddingTop: "76px", textAlign: "center", padding: "4rem" }}>Loading...</div>}>
      <FindContractorsContent />
    </Suspense>
  );
}
