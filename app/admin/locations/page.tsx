"use client";
import { useState } from "react";
import Link from "next/link";
import { US_STATES } from "@/lib/data";

export default function LocationsAdminPage() {
  const [tab, setTab] = useState<"states"|"cities">("states");
  const [search, setSearch] = useState("");
  const [states, setStates] = useState(US_STATES.map(s => ({ ...s, active: true, featured: ["TX","CA","FL","NY","IL"].includes(s.code) })));
  const [selectedState, setSelectedState] = useState<string | null>("TX");
  const [cities, setCities] = useState<Record<string, { name: string; active: boolean; featured: boolean }[]>>(
    Object.fromEntries(US_STATES.map(s => [s.code, s.cities.map(c => ({ name: c, active: true, featured: false }))]))
  );
  const [newCity, setNewCity] = useState("");

  const filteredStates = states.filter(s =>
    search === "" || s.name.toLowerCase().includes(search.toLowerCase()) || s.code.toLowerCase().includes(search.toLowerCase())
  );

  const selectedCities = selectedState ? (cities[selectedState] ?? []) : [];
  const filteredCities = selectedCities.filter(c =>
    search === "" || c.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleState = (code: string) => setStates(prev => prev.map(s => s.code === code ? { ...s, active: !s.active } : s));
  const toggleCity = (statCode: string, cityName: string, field: "active"|"featured") =>
    setCities(prev => ({ ...prev, [statCode]: prev[statCode].map(c => c.name === cityName ? { ...c, [field]: !c[field] } : c) }));
  const addCity = () => {
    if (!selectedState || !newCity.trim()) return;
    setCities(prev => ({ ...prev, [selectedState]: [...(prev[selectedState] ?? []), { name: newCity.trim(), active: true, featured: false }] }));
    setNewCity("");
  };

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.625rem", fontWeight: 800, color: "var(--navy)", marginBottom: "0.25rem" }}>Locations</h1>
        <p style={{ color: "var(--gray-500)", fontSize: "0.875rem" }}>
          {states.filter(s => s.active).length} active states · {Object.values(cities).flat().filter(c => c.active).length.toLocaleString()} active cities
        </p>
      </div>

      <div style={{ display: "flex", gap: "0", marginBottom: "1.5rem", background: "white", borderRadius: "var(--radius)", border: "1px solid var(--gray-150)", overflow: "hidden" }}>
        {([["states","States & Territories"],["cities","Cities"]] as const).map(([key, label]) => (
          <button key={key} onClick={() => { setTab(key); setSearch(""); }} style={{
            flex: 1, padding: "0.875rem", background: tab === key ? "var(--navy)" : "transparent",
            color: tab === key ? "white" : "var(--gray-600)",
            border: "none", cursor: "pointer", fontFamily: "inherit",
            fontWeight: tab === key ? 700 : 500, fontSize: "0.9rem",
          }}>
            {label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: "1.25rem" }}>
        <div style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        </div>
        <input placeholder={`Search ${tab}...`} value={search} onChange={e => setSearch(e.target.value)} className="form-input" style={{ paddingLeft: "2.75rem" }} />
      </div>

      {/* STATES TAB */}
      {tab === "states" && (
        <div className="card" style={{ overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--gray-50)", borderBottom: "1px solid var(--gray-150)" }}>
                {["Code","State","Cities","Status","Featured","Actions"].map(h => (
                  <th key={h} style={{ padding: "0.875rem 1.25rem", textAlign: "left", fontSize: "0.8125rem", fontWeight: 700, color: "var(--gray-500)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredStates.map((state, i) => (
                <tr key={state.code} style={{ borderBottom: i < filteredStates.length - 1 ? "1px solid var(--gray-50)" : "none" }}>
                  <td style={{ padding: "0.875rem 1.25rem" }}>
                    <span style={{ background: "var(--gray-100)", borderRadius: "6px", padding: "3px 10px", fontWeight: 800, fontSize: "0.875rem", color: "var(--navy)" }}>{state.code}</span>
                  </td>
                  <td style={{ padding: "0.875rem 1.25rem", fontWeight: 600, color: "var(--navy)", fontSize: "0.9375rem" }}>{state.name}</td>
                  <td style={{ padding: "0.875rem 1.25rem", fontSize: "0.875rem", color: "var(--gray-500)" }}>
                    {(cities[state.code] ?? []).filter(c => c.active).length} active
                  </td>
                  <td style={{ padding: "0.875rem 1.25rem" }}>
                    <button onClick={() => toggleState(state.code)} style={{
                      padding: "0.25rem 0.75rem", borderRadius: "999px", border: "none", cursor: "pointer",
                      fontFamily: "inherit", fontSize: "0.75rem", fontWeight: 700,
                      background: state.active ? "rgba(22,163,74,0.1)" : "var(--gray-100)",
                      color: state.active ? "#16a34a" : "var(--gray-400)",
                    }}>
                      {state.active ? "Active" : "Hidden"}
                    </button>
                  </td>
                  <td style={{ padding: "0.875rem 1.25rem" }}>
                    <button onClick={() => setStates(prev => prev.map(s => s.code === state.code ? { ...s, featured: !s.featured } : s))} style={{
                      padding: "0.25rem 0.625rem", borderRadius: "999px", border: "none", cursor: "pointer",
                      fontFamily: "inherit", fontSize: "0.75rem", fontWeight: 700,
                      background: state.featured ? "rgba(245,158,11,0.1)" : "var(--gray-100)",
                      color: state.featured ? "#d97706" : "var(--gray-400)",
                    }}>
                      {state.featured ? "★ Featured" : "Not featured"}
                    </button>
                  </td>
                  <td style={{ padding: "0.875rem 1.25rem" }}>
                    <div style={{ display: "flex", gap: "0.375rem" }}>
                      <button onClick={() => { setTab("cities"); setSelectedState(state.code); setSearch(""); }}
                        style={{ padding: "0.375rem 0.75rem", background: "var(--gray-100)", border: "none", borderRadius: "var(--radius-xs)", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", color: "var(--gray-700)", fontFamily: "inherit" }}>
                        Cities
                      </button>
                      <Link href={`/locations/${state.slug}`} target="_blank"
                        style={{ padding: "0.375rem 0.75rem", background: "var(--gray-100)", border: "none", borderRadius: "var(--radius-xs)", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", color: "var(--gray-700)", textDecoration: "none", display: "inline-flex" }}>
                        View →
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CITIES TAB */}
      {tab === "cities" && (
        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: "1.5rem" }}>
          {/* State picker */}
          <div className="card" style={{ padding: "1rem", maxHeight: "600px", overflowY: "auto" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.75rem", paddingLeft: "0.5rem" }}>
              Select State
            </div>
            {states.map(state => (
              <button key={state.code} onClick={() => setSelectedState(state.code)} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                width: "100%", padding: "0.625rem 0.75rem", border: "none", cursor: "pointer",
                borderRadius: "var(--radius-sm)", fontFamily: "inherit", textAlign: "left",
                background: selectedState === state.code ? "var(--navy)" : "transparent",
                color: selectedState === state.code ? "white" : "var(--gray-700)",
                fontSize: "0.875rem", fontWeight: selectedState === state.code ? 700 : 400,
                marginBottom: "1px",
              }}>
                <span>{state.code} — {state.name}</span>
                <span style={{ fontSize: "0.75rem", opacity: 0.6 }}>{(cities[state.code] ?? []).length}</span>
              </button>
            ))}
          </div>

          {/* Cities list */}
          <div>
            {selectedState && (
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                  <h3 style={{ fontWeight: 700, color: "var(--navy)" }}>
                    {states.find(s => s.code === selectedState)?.name} — {filteredCities.length} cities
                  </h3>
                </div>

                {/* Add city */}
                <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.25rem" }}>
                  <input className="form-input" placeholder="City name..." value={newCity} onChange={e => setNewCity(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && addCity()} style={{ flex: 1 }} />
                  <button onClick={addCity} className="btn-red" style={{ padding: "0.75rem 1.25rem", fontSize: "0.875rem", flexShrink: 0 }}>
                    + Add City
                  </button>
                </div>

                <div className="card" style={{ overflow: "hidden" }}>
                  <div style={{ background: "var(--gray-50)", borderBottom: "1px solid var(--gray-150)", padding: "0.75rem 1.25rem", display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: "1rem", fontSize: "0.8125rem", fontWeight: 700, color: "var(--gray-500)" }}>
                    <span>City</span>
                    <span>Featured</span>
                    <span>Status</span>
                    <span>Link</span>
                  </div>
                  {filteredCities.map((city, i) => (
                    <div key={city.name} style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: "1rem", padding: "0.75rem 1.25rem", borderBottom: i < filteredCities.length - 1 ? "1px solid var(--gray-50)" : "none", alignItems: "center" }}>
                      <span style={{ fontWeight: 500, color: "var(--navy)", fontSize: "0.9rem" }}>{city.name}</span>
                      <button onClick={() => toggleCity(selectedState, city.name, "featured")} style={{
                        padding: "0.25rem 0.625rem", borderRadius: "999px", border: "none", cursor: "pointer",
                        fontFamily: "inherit", fontSize: "0.75rem", fontWeight: 700,
                        background: city.featured ? "rgba(245,158,11,0.1)" : "var(--gray-100)",
                        color: city.featured ? "#d97706" : "var(--gray-300)",
                      }}>
                        ★
                      </button>
                      <button onClick={() => toggleCity(selectedState, city.name, "active")} style={{
                        padding: "0.25rem 0.625rem", borderRadius: "999px", border: "none", cursor: "pointer",
                        fontFamily: "inherit", fontSize: "0.75rem", fontWeight: 700,
                        background: city.active ? "rgba(22,163,74,0.1)" : "var(--gray-100)",
                        color: city.active ? "#16a34a" : "var(--gray-400)",
                      }}>
                        {city.active ? "Active" : "Hidden"}
                      </button>
                      <Link href={`/locations/${states.find(s=>s.code===selectedState)?.slug ?? ""}/${city.name.toLowerCase().replace(/\s+/g,"-")}`}
                        target="_blank" style={{ fontSize: "0.75rem", color: "var(--navy)", textDecoration: "none", fontWeight: 600 }}>
                        View →
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
