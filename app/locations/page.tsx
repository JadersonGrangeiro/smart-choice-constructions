import Link from "next/link";
import { US_STATES } from "@/lib/data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Find Contractors by State | All 50 States",
  description: "Find verified contractors in your state. Browse by location to connect with licensed, credential-verified professionals.",
};

export default function LocationsPage() {
  return (
    <div style={{ paddingTop: "76px" }}>
      <div style={{ background: "var(--navy)", padding: "4rem 0 3rem" }}>
        <div className="container">
          <h1 className="heading-lg" style={{ color: "white", marginBottom: "1rem" }}>Find Contractors Near You</h1>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "1.0625rem", maxWidth: "500px" }}>
            Smart Choice covers all 50 states. Browse by location to find verified professionals in your area.
          </p>
        </div>
      </div>
      <div className="container" style={{ padding: "3rem 1.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: "1rem" }}>
          {US_STATES.map(state => (
            <Link key={state.code} href={`/locations/${state.slug}`} className="state-loc-card"
              style={{ background: "white", border: "1.5px solid var(--gray-150)", borderRadius: "var(--radius-lg)", padding: "1.25rem", textDecoration: "none", display: "flex", flexDirection: "column", gap: "0.5rem", transition: "all 0.2s" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                <span style={{ background: "var(--navy)", color: "white", borderRadius: "6px", padding: "3px 7px", fontSize: "0.8125rem", fontWeight: 700 }}>{state.code}</span>
                <span style={{ fontWeight: 700, color: "var(--navy)", fontSize: "1rem" }}>{state.name}</span>
              </div>
              <div style={{ fontSize: "0.8125rem", color: "var(--gray-400)" }}>
                {state.cities.slice(0, 2).join(", ")}
                {state.cities.length > 2 && ` +${state.cities.length - 2} more`}
              </div>
            </Link>
          ))}
        </div>
      </div>
      <style>{`.state-loc-card:hover{border-color:var(--navy)!important;box-shadow:var(--shadow-md)!important;transform:translateY(-2px)!important}`}</style>
    </div>
  );
}
