"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { US_STATES } from "@/lib/data";

type StateConfig = { code: string; active: boolean; featured: boolean };
type CityConfig  = { state: string; name: string; active: boolean; featured: boolean };

interface LocationsConfig {
  states: StateConfig[];
  cities: CityConfig[];
}

const DEFAULT_FEATURED = ["TX","CA","FL","NY","IL","GA","AZ","WA","CO","NC"];

function Toast({ msg }: { msg: string }) {
  return (
    <div style={{ position:"fixed", bottom:"1.5rem", right:"1.5rem", zIndex:9999, background:"var(--navy)", color:"white", padding:"0.875rem 1.5rem", borderRadius:"var(--radius)", fontWeight:600, fontSize:"0.9rem", boxShadow:"var(--shadow-lg)" }}>{msg}</div>
  );
}

export default function LocationsAdminPage() {
  const [tab, setTab]         = useState<"states"|"cities">("states");
  const [search, setSearch]   = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [toast, setToast]     = useState<string | null>(null);

  const [stateConfigs, setStateConfigs] = useState<StateConfig[]>([]);
  const [cityConfigs, setCityConfigs]   = useState<CityConfig[]>([]);
  const [selectedState, setSelectedState] = useState<string>("TX");
  const [newCity, setNewCity] = useState("");

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(null), 3000); };

  // Build state list merged with persisted config
  const stateList = US_STATES.map(s => {
    const cfg = stateConfigs.find(c => c.code === s.code);
    return {
      ...s,
      active:   cfg ? cfg.active   : true,
      featured: cfg ? cfg.featured : DEFAULT_FEATURED.includes(s.code),
    };
  });

  // Build city list for selected state
  const defaultCities = US_STATES.find(s => s.code === selectedState)?.cities ?? [];
  const savedCities = cityConfigs.filter(c => c.state === selectedState);
  const savedNames  = new Set(savedCities.map(c => c.name));
  const cityList = [
    ...defaultCities.map(name => {
      const saved = savedCities.find(c => c.name === name);
      return saved ?? { state: selectedState, name, active: true, featured: false };
    }),
    ...savedCities.filter(c => !defaultCities.includes(c.name)),
  ].filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()));

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/platform-data?key=locations_config");
      const json = await res.json();
      const cfg: LocationsConfig = json.value ?? { states: [], cities: [] };
      setStateConfigs(cfg.states ?? []);
      setCityConfigs(cfg.cities ?? []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const persist = useCallback(async (states: StateConfig[], cities: CityConfig[]) => {
    setSaving(true);
    try {
      await fetch("/api/admin/platform-data", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "locations_config", value: { states, cities } }),
      });
      showToast("Saved!");
    } catch { showToast("Save failed"); }
    finally { setSaving(false); }
  }, []);

  const toggleState = (code: string, field: "active"|"featured") => {
    const current = stateList.find(s => s.code === code)!;
    const updated = stateConfigs.some(c => c.code === code)
      ? stateConfigs.map(c => c.code === code ? { ...c, [field]: !c[field] } : c)
      : [...stateConfigs, { code, active: current.active, featured: current.featured, [field]: !current[field] }];
    setStateConfigs(updated);
    persist(updated, cityConfigs);
  };

  const toggleCity = (name: string, field: "active"|"featured") => {
    const current = cityList.find(c => c.name === name);
    if (!current) return;
    const updated = savedNames.has(name)
      ? cityConfigs.map(c => c.name === name && c.state === selectedState ? { ...c, [field]: !c[field] } : c)
      : [...cityConfigs, { state: selectedState, name, active: current.active, featured: current.featured, [field]: !(current as Record<string,unknown>)[field] }];
    setCityConfigs(updated);
    persist(stateConfigs, updated);
  };

  const addCity = () => {
    if (!newCity.trim() || !selectedState) return;
    const entry: CityConfig = { state: selectedState, name: newCity.trim(), active: true, featured: false };
    const updated = [...cityConfigs, entry];
    setCityConfigs(updated);
    persist(stateConfigs, updated);
    setNewCity("");
  };

  const removeCity = (name: string) => {
    const updated = cityConfigs.filter(c => !(c.name === name && c.state === selectedState));
    setCityConfigs(updated);
    persist(stateConfigs, updated);
  };

  const filteredStates = stateList.filter(s =>
    search === "" || s.name.toLowerCase().includes(search.toLowerCase()) || s.code.toLowerCase().includes(search.toLowerCase())
  );

  const activeStateCount = stateList.filter(s => s.active).length;

  return (
    <div>
      {toast && <Toast msg={toast} />}

      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.625rem", fontWeight: 800, color: "var(--navy)", marginBottom: "0.25rem" }}>Locations</h1>
        <p style={{ color: "var(--gray-500)", fontSize: "0.875rem" }}>
          {loading ? "Loading…" : `${activeStateCount} active states · changes save automatically`}
          {saving && <span style={{ marginLeft: "0.75rem", color: "#d97706", fontSize: "0.8rem" }}>Saving…</span>}
        </p>
      </div>

      <div style={{ display: "flex", gap: 0, marginBottom: "1.5rem", background: "white", borderRadius: "var(--radius)", border: "1px solid var(--gray-150)", overflow: "hidden" }}>
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
              {loading ? (
                <tr><td colSpan={6} style={{ padding:"2rem", textAlign:"center", color:"var(--gray-400)" }}>Loading…</td></tr>
              ) : filteredStates.map((state, i) => (
                <tr key={state.code} style={{ borderBottom: i < filteredStates.length - 1 ? "1px solid var(--gray-50)" : "none" }}>
                  <td style={{ padding: "0.875rem 1.25rem" }}>
                    <span style={{ background: "var(--gray-100)", borderRadius: "6px", padding: "3px 10px", fontWeight: 800, fontSize: "0.875rem", color: "var(--navy)" }}>{state.code}</span>
                  </td>
                  <td style={{ padding: "0.875rem 1.25rem", fontWeight: 600, color: "var(--navy)", fontSize: "0.9375rem" }}>{state.name}</td>
                  <td style={{ padding: "0.875rem 1.25rem", fontSize: "0.875rem", color: "var(--gray-500)" }}>
                    {(cityConfigs.filter(c => c.state === state.code && c.active).length || (US_STATES.find(s=>s.code===state.code)?.cities.length ?? 0))} active
                  </td>
                  <td style={{ padding: "0.875rem 1.25rem" }}>
                    <button onClick={() => toggleState(state.code, "active")} style={{
                      padding: "0.25rem 0.75rem", borderRadius: "999px", border: "none", cursor: "pointer",
                      fontFamily: "inherit", fontSize: "0.75rem", fontWeight: 700,
                      background: state.active ? "rgba(22,163,74,0.1)" : "var(--gray-100)",
                      color: state.active ? "#16a34a" : "var(--gray-400)",
                    }}>{state.active ? "Active" : "Hidden"}</button>
                  </td>
                  <td style={{ padding: "0.875rem 1.25rem" }}>
                    <button onClick={() => toggleState(state.code, "featured")} style={{
                      padding: "0.25rem 0.625rem", borderRadius: "999px", border: "none", cursor: "pointer",
                      fontFamily: "inherit", fontSize: "0.75rem", fontWeight: 700,
                      background: state.featured ? "rgba(245,158,11,0.1)" : "var(--gray-100)",
                      color: state.featured ? "#d97706" : "var(--gray-400)",
                    }}>{state.featured ? "★ Featured" : "Not featured"}</button>
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
          <div className="card" style={{ padding: "1rem", maxHeight: "600px", overflowY: "auto" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.75rem", paddingLeft: "0.5rem" }}>
              Select State
            </div>
            {stateList.map(state => (
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
                <span style={{ fontSize: "0.75rem", opacity: 0.6 }}>{US_STATES.find(s=>s.code===state.code)?.cities.length ?? 0}</span>
              </button>
            ))}
          </div>

          <div>
            {selectedState && (
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                  <h3 style={{ fontWeight: 700, color: "var(--navy)" }}>
                    {stateList.find(s => s.code === selectedState)?.name} — {cityList.length} cities
                  </h3>
                </div>

                <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.25rem" }}>
                  <input className="form-input" placeholder="Add city name..." value={newCity} onChange={e => setNewCity(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && addCity()} style={{ flex: 1 }} />
                  <button onClick={addCity} className="btn-red" style={{ padding: "0.75rem 1.25rem", fontSize: "0.875rem", flexShrink: 0 }}>+ Add City</button>
                </div>

                <div className="card" style={{ overflow: "hidden" }}>
                  <div style={{ background: "var(--gray-50)", borderBottom: "1px solid var(--gray-150)", padding: "0.75rem 1.25rem", display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: "1rem", fontSize: "0.8125rem", fontWeight: 700, color: "var(--gray-500)" }}>
                    <span>City</span>
                    <span>Featured</span>
                    <span>Status</span>
                    <span>Actions</span>
                  </div>
                  {cityList.map((city, i) => {
                    const isCustom = !US_STATES.find(s=>s.code===selectedState)?.cities.includes(city.name);
                    return (
                      <div key={city.name} style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: "1rem", padding: "0.75rem 1.25rem", borderBottom: i < cityList.length - 1 ? "1px solid var(--gray-50)" : "none", alignItems: "center" }}>
                        <span style={{ fontWeight: 500, color: "var(--navy)", fontSize: "0.9rem" }}>
                          {city.name}
                          {isCustom && <span style={{ marginLeft:"0.5rem", fontSize:"0.7rem", color:"var(--gray-400)", background:"var(--gray-100)", padding:"1px 5px", borderRadius:"4px" }}>custom</span>}
                        </span>
                        <button onClick={() => toggleCity(city.name, "featured")} style={{
                          padding: "0.25rem 0.625rem", borderRadius: "999px", border: "none", cursor: "pointer",
                          fontFamily: "inherit", fontSize: "0.75rem", fontWeight: 700,
                          background: city.featured ? "rgba(245,158,11,0.1)" : "var(--gray-100)",
                          color: city.featured ? "#d97706" : "var(--gray-300)",
                        }}>★</button>
                        <button onClick={() => toggleCity(city.name, "active")} style={{
                          padding: "0.25rem 0.625rem", borderRadius: "999px", border: "none", cursor: "pointer",
                          fontFamily: "inherit", fontSize: "0.75rem", fontWeight: 700,
                          background: city.active ? "rgba(22,163,74,0.1)" : "var(--gray-100)",
                          color: city.active ? "#16a34a" : "var(--gray-400)",
                        }}>{city.active ? "Active" : "Hidden"}</button>
                        <div style={{ display: "flex", gap: "0.375rem" }}>
                          <Link href={`/locations/${stateList.find(s=>s.code===selectedState)?.slug ?? ""}/${city.name.toLowerCase().replace(/\s+/g,"-")}`}
                            target="_blank" style={{ fontSize: "0.75rem", color: "var(--navy)", textDecoration: "none", fontWeight: 600, padding: "0.25rem 0.5rem", background: "var(--gray-100)", borderRadius: "4px" }}>
                            View →
                          </Link>
                          {isCustom && (
                            <button onClick={() => removeCity(city.name)} style={{ fontSize: "0.75rem", color: "var(--red)", background: "rgba(199,25,26,0.06)", border: "1px solid rgba(199,25,26,0.15)", borderRadius: "4px", padding: "0.25rem 0.5rem", cursor: "pointer", fontFamily: "inherit" }}>Del</button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
