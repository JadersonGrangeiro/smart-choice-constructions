"use client";
import { useState } from "react";

interface FeatureFlag {
  id: string; name: string; description: string; category: string;
  enabled: boolean; rollout: number; lastChanged: string; changedBy: string;
}

const MOCK_FLAGS: FeatureFlag[] = [
  { id: "ff_suppliers",        name: "Local Suppliers Ecosystem",     category: "Core",       description: "Show the Local Suppliers section in navigation, footer, and search results.", enabled: true,  rollout: 100, lastChanged: "Jun 28, 2025", changedBy: "Carlos Admin" },
  { id: "ff_contractor_video", name: "Contractor Video Profiles",      category: "Profile",    description: "Allow contractors to embed YouTube/Vimeo videos in their profiles.", enabled: true,  rollout: 100, lastChanged: "Jun 10, 2025", changedBy: "Carlos Admin" },
  { id: "ff_instant_quote",    name: "Instant Quote Widget",           category: "Conversion", description: "Show an inline quote form on contractor profiles instead of redirecting to /request-quote.", enabled: false, rollout: 0,   lastChanged: "Jun 1, 2025",  changedBy: "Carlos Admin" },
  { id: "ff_ai_matching",      name: "AI Contractor Matching",         category: "Core",       description: "Use ML-based ranking instead of the rule-based algorithm. Requires ML API endpoint.", enabled: false, rollout: 0,   lastChanged: "Jun 1, 2025",  changedBy: "Carlos Admin" },
  { id: "ff_reviews_photos",   name: "Photos in Reviews",              category: "Reviews",    description: "Allow homeowners to attach up to 3 photos when submitting a review.", enabled: false, rollout: 0,   lastChanged: "Jun 5, 2025",  changedBy: "Carlos Admin" },
  { id: "ff_homeowner_dash",   name: "Homeowner Project Dashboard",    category: "Account",    description: "Full project management dashboard for homeowners (multi-contractor, timeline, budget).", enabled: true,  rollout: 100, lastChanged: "Jun 15, 2025", changedBy: "Carlos Admin" },
  { id: "ff_supplier_sub",     name: "Supplier Subscriptions",         category: "Billing",    description: "Enable paid subscription tier for suppliers. Requires Stripe supplier product ID in settings.", enabled: false, rollout: 0,   lastChanged: "Jun 28, 2025", changedBy: "Carlos Admin" },
  { id: "ff_bulk_quotes",      name: "Multi-Contractor Quote Request", category: "Conversion", description: "Allow homeowners to send one request to up to 5 contractors simultaneously.", enabled: true,  rollout: 100, lastChanged: "Jun 20, 2025", changedBy: "Carlos Admin" },
  { id: "ff_sms_notifications",name: "SMS Notifications",              category: "Notifications", description: "Send SMS alerts to contractors for new leads. Requires Twilio configuration.", enabled: false, rollout: 0,   lastChanged: "Jun 1, 2025",  changedBy: "Carlos Admin" },
  { id: "ff_map_view",         name: "Map View Search Results",        category: "Search",     description: "Show an interactive map alongside the contractor list on /find-contractors.", enabled: false, rollout: 0,   lastChanged: "Jun 1, 2025",  changedBy: "Carlos Admin" },
  { id: "ff_saved_searches",   name: "Saved Searches",                 category: "Account",    description: "Allow homeowners to save search queries and get email alerts for new matches.", enabled: false, rollout: 0,   lastChanged: "Jun 1, 2025",  changedBy: "Carlos Admin" },
  { id: "ff_dark_mode",        name: "Dark Mode",                      category: "UI",         description: "Platform-wide dark mode toggle. CSS custom properties are ready; toggle activates them.", enabled: false, rollout: 0,   lastChanged: "Jun 1, 2025",  changedBy: "Carlos Admin" },
];

const CATEGORY_COLORS: Record<string, string> = {
  Core: "#162E5E", Profile: "#047857", Conversion: "#b45309", Reviews: "#f59e0b",
  Account: "#6366f1", Billing: "#C7191A", Notifications: "#0891b2", Search: "#374151", UI: "#9333ea",
};

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState(MOCK_FLAGS);
  const [category, setCategory] = useState("all");
  const categories = ["all", ...new Set(MOCK_FLAGS.map(f => f.category))];

  const filtered = category === "all" ? flags : flags.filter(f => f.category === category);

  const toggle = (id: string) =>
    setFlags(p => p.map(f => f.id === id ? { ...f, enabled: !f.enabled, rollout: f.enabled ? 0 : 100, lastChanged: "Now", changedBy: "You" } : f));

  const enabledCount = flags.filter(f => f.enabled).length;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.625rem", fontWeight: 800, color: "var(--navy)", marginBottom: "0.25rem" }}>Feature Flags</h1>
          <p style={{ color: "var(--gray-500)", fontSize: "0.875rem" }}>
            {enabledCount} of {flags.length} features enabled · Toggle features without code deployment.
          </p>
        </div>
        <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "var(--radius-sm)", padding: "0.75rem 1.125rem" }}>
          <p style={{ fontSize: "0.8125rem", color: "#92400e", fontWeight: 500 }}>
            Changes take effect immediately for all users. Changes are logged in Audit Logs.
          </p>
        </div>
      </div>

      {/* Category filter */}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)} style={{
            padding: "0.375rem 0.875rem", borderRadius: "999px",
            background: category === cat ? "var(--navy)" : "white",
            color: category === cat ? "white" : "var(--gray-600)",
            border: `1.5px solid ${category === cat ? "var(--navy)" : "var(--gray-200)"}`,
            fontWeight: 600, fontSize: "0.8125rem", cursor: "pointer", fontFamily: "inherit",
            textTransform: cat === "all" ? "capitalize" : "none",
          }}>
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {filtered.map(flag => (
          <div key={flag.id} className="card" style={{ padding: "1.5rem", display: "flex", alignItems: "flex-start", gap: "1.25rem", borderLeft: `4px solid ${flag.enabled ? "rgba(22,163,74,0.4)" : "var(--gray-200)"}` }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.375rem", flexWrap: "wrap" }}>
                <span style={{ fontWeight: 700, color: "var(--navy)", fontSize: "1rem" }}>{flag.name}</span>
                <span style={{ background: `${CATEGORY_COLORS[flag.category] ?? "var(--gray-500)"}18`, color: CATEGORY_COLORS[flag.category] ?? "var(--gray-500)", padding: "0.15rem 0.5rem", borderRadius: "999px", fontSize: "0.7rem", fontWeight: 700 }}>{flag.category}</span>
              </div>
              <p style={{ color: "var(--gray-600)", fontSize: "0.9rem", lineHeight: 1.65, marginBottom: "0.625rem" }}>{flag.description}</p>
              <div style={{ fontSize: "0.75rem", color: "var(--gray-400)" }}>
                Last changed {flag.lastChanged} by {flag.changedBy}
                {flag.enabled && flag.rollout < 100 && <span style={{ marginLeft: "0.75rem", color: "#d97706" }}>Partial rollout: {flag.rollout}%</span>}
              </div>
            </div>
            {/* Toggle switch */}
            <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.375rem" }}>
              <button onClick={() => toggle(flag.id)} style={{
                width: "56px", height: "30px", background: flag.enabled ? "#16a34a" : "var(--gray-200)",
                border: "none", borderRadius: "999px", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0,
              }}>
                <span style={{
                  position: "absolute", top: "3px", left: flag.enabled ? "28px" : "3px",
                  width: "24px", height: "24px", background: "white", borderRadius: "50%",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.2)", transition: "left 0.2s",
                }} />
              </button>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: flag.enabled ? "#16a34a" : "var(--gray-400)" }}>
                {flag.enabled ? "ON" : "OFF"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
