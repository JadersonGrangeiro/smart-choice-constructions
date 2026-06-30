"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { search, searchByZip, type SearchResult } from "@/lib/search";
import { useI18n } from "@/lib/i18n/context";

interface SearchBarProps {
  variant?:        "hero" | "inline";
  defaultCategory?: string;
  defaultZip?:     string;
}

const TYPE_LABEL: Record<string, string> = {
  category:         "Service",
  state:            "State",
  city:             "City",
  contractor:       "Contractor",
  supplier:         "Local Supplier",
  supplier_category:"Supplier Category",
};

const TYPE_ORDER: Record<string, number> = {
  category: 0, supplier_category: 1, contractor: 2, supplier: 3, city: 4, state: 5,
};

export default function SearchBar({ variant = "hero", defaultCategory = "", defaultZip = "" }: SearchBarProps) {
  const { t } = useI18n();
  const router = useRouter();
  const [query,       setQuery]       = useState(defaultCategory);
  const [zip,         setZip]         = useState(defaultZip);
  const [results,     setResults]     = useState<SearchResult[]>([]);
  const [zipInfo,     setZipInfo]     = useState<{ state: string; stateCode: string; cities: string[] } | null>(null);
  const [showDrop,    setShowDrop]    = useState(false);
  const [activeIdx,   setActiveIdx]   = useState(-1);
  const [searching,   setSearching]   = useState(false);
  const inputRef  = useRef<HTMLInputElement>(null);
  const dropRef   = useRef<HTMLDivElement>(null);
  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced search
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (query.trim().length >= 2) {
        setSearching(true);
        const r = search(query, 8);
        setResults(r);
        setShowDrop(true);
        setActiveIdx(-1);
        setSearching(false);
      } else {
        setResults([]);
        setShowDrop(false);
      }
    }, 120);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [query]);

  // ZIP lookup
  useEffect(() => {
    if (/^\d{5}$/.test(zip.trim())) {
      setZipInfo(searchByZip(zip));
    } else {
      setZipInfo(null);
    }
  }, [zip]);

  // Click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropRef.current && !dropRef.current.contains(e.target as Node) &&
        inputRef.current && !inputRef.current.contains(e.target as Node)
      ) setShowDrop(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDrop || results.length === 0) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, results.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, -1)); }
    if (e.key === "Enter" && activeIdx >= 0) { e.preventDefault(); router.push(results[activeIdx].href); setShowDrop(false); }
    if (e.key === "Escape") setShowDrop(false);
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (zip.trim())   params.set("zip", zip.trim());
    if (zipInfo?.stateCode) params.set("state", zipInfo.stateCode);
    router.push(`/find-contractors?${params.toString()}`);
    setShowDrop(false);
  };

  // Group results by type, ordered
  const groups = Object.entries(
    results.reduce((acc, r) => {
      const g = acc[r.type] ?? [];
      g.push(r);
      acc[r.type] = g;
      return acc;
    }, {} as Record<string, SearchResult[]>)
  ).sort(([a], [b]) => (TYPE_ORDER[a] ?? 9) - (TYPE_ORDER[b] ?? 9));

  const heroSize = variant === "hero";

  return (
    <div style={{ position: "relative" }}>
      <div style={{
        background: "white",
        borderRadius: heroSize ? "var(--radius-lg)" : "var(--radius)",
        padding: heroSize ? "0.875rem" : "0.625rem",
        boxShadow: heroSize ? "0 24px 64px rgba(0,0,0,0.28)" : "var(--shadow)",
        display: "flex", gap: "0.75rem", alignItems: "stretch", flexWrap: "wrap",
      }}>
        {/* Service input */}
        <div style={{ flex: "2", minWidth: "200px", position: "relative" }}>
          <div style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)", pointerEvents: "none", zIndex: 1 }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          </div>
          <input
            ref={inputRef}
            type="text"
            placeholder={t.hero.searchService}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => query.length >= 2 && setShowDrop(true)}
            className="form-input"
            style={{ paddingLeft: "2.75rem", border: "none", background: "var(--gray-50)", borderRadius: "var(--radius-sm)", height: "100%" }}
            autoComplete="off"
            aria-label="Search for a service or contractor"
            aria-expanded={showDrop}
            aria-haspopup="listbox"
            role="combobox"
            aria-autocomplete="list"
          />
        </div>

        {/* ZIP input */}
        <div style={{ flex: "1", minWidth: "130px", position: "relative" }}>
          <div style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)", pointerEvents: "none" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
          <input
            type="text"
            placeholder={t.hero.searchZip}
            value={zip}
            onChange={e => setZip(e.target.value.replace(/\D/g, ""))}
            maxLength={5}
            className="form-input"
            style={{ paddingLeft: "2.5rem", border: "none", background: "var(--gray-50)", borderRadius: "var(--radius-sm)", height: "100%" }}
            inputMode="numeric"
            aria-label="Enter ZIP code"
          />
          {/* ZIP validation indicator */}
          {zip.length === 5 && (
            <div style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)" }}>
              {zipInfo
                ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round"><path d="M5 13l4 4L19 7"/></svg>
                : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
              }
            </div>
          )}
        </div>

        {/* Search button */}
        <button
          onClick={handleSearch}
          className="btn-red"
          style={{ borderRadius: "var(--radius-sm)", padding: "0 1.75rem", flexShrink: 0 }}
          aria-label="Search contractors"
        >
          {t.hero.searchBtn}
        </button>
      </div>

      {/* ZIP result banner */}
      {zipInfo && zip.length === 5 && (
        <div style={{ background: "rgba(22,163,74,0.1)", border: "1px solid rgba(22,163,74,0.2)", borderRadius: "var(--radius-sm)", padding: "0.625rem 1rem", marginTop: "0.5rem", fontSize: "0.875rem", color: "#15803d", display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 13l4 4L19 7"/></svg>
          <span>ZIP {zip} — <strong>{zipInfo.state}</strong></span>
          {zipInfo.cities.map(city => (
            <Link key={city} href={`/find-contractors?q=${encodeURIComponent(query)}&city=${encodeURIComponent(city)}&state=${zipInfo.stateCode}`}
              style={{ color: "#15803d", fontWeight: 700, textDecoration: "none" }}
              onClick={() => setShowDrop(false)}>
              {city}
            </Link>
          ))}
        </div>
      )}

      {/* Dropdown */}
      {showDrop && results.length > 0 && (
        <div ref={dropRef} role="listbox" style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
          background: "white", borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-xl)", border: "1px solid var(--gray-100)",
          zIndex: 300, overflow: "hidden",
        }}>
          {groups.map(([type, group]) => (
            <div key={type}>
              <div style={{ padding: "0.5rem 1rem 0.25rem", fontSize: "0.625rem", fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "0.1em", background: "var(--gray-50)", borderBottom: "1px solid var(--gray-100)" }}>
                {TYPE_LABEL[type] ?? type}s
              </div>
              {group.map((result) => {
                const globalIdx = results.indexOf(result);
                return (
                  <Link key={result.href} href={result.href}
                    role="option"
                    aria-selected={activeIdx === globalIdx}
                    style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", textDecoration: "none", background: activeIdx === globalIdx ? "var(--gray-50)" : "white", transition: "background 0.1s", borderBottom: "1px solid var(--gray-50)" }}
                    onMouseEnter={() => setActiveIdx(globalIdx)}
                    onClick={() => setShowDrop(false)}
                  >
                    <span style={{ fontSize: "1.125rem", flexShrink: 0, width: "24px", textAlign: "center" }}>{result.icon ?? "→"}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: "0.9375rem", color: "var(--navy)" }}>{result.title}</div>
                      <div style={{ fontSize: "0.8125rem", color: "var(--gray-400)" }}>{result.subtitle}</div>
                    </div>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--gray-300)" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </Link>
                );
              })}
            </div>
          ))}
          {/* Search all */}
          <button onClick={handleSearch} style={{ width: "100%", padding: "0.875rem 1rem", background: "var(--gray-50)", border: "none", borderTop: "1px solid var(--gray-100)", cursor: "pointer", fontFamily: "inherit", fontSize: "0.875rem", fontWeight: 600, color: "var(--navy)", textAlign: "left", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            See all results for "{query}"
          </button>
        </div>
      )}

      {/* No results */}
      {showDrop && !searching && query.length >= 2 && results.length === 0 && (
        <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, background: "white", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-xl)", border: "1px solid var(--gray-100)", padding: "1.5rem", textAlign: "center", zIndex: 300 }}>
          <div style={{ color: "var(--gray-400)", fontSize: "0.9375rem", marginBottom: "0.5rem" }}>No exact matches for "{query}"</div>
          <button onClick={handleSearch} style={{ fontSize: "0.875rem", color: "var(--navy)", fontWeight: 600, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
            Search all contractors →
          </button>
        </div>
      )}
    </div>
  );
}
