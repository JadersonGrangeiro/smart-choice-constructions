"use client";
import { useState } from "react";

type ExportFormat = "csv" | "json";

interface ExportConfig {
  id: string; label: string; description: string; icon: string;
  columns: string[]; lastExported: string | null;
}

const EXPORTS: ExportConfig[] = [
  { id: "contractors",   label: "Contractors",     icon: "👷", description: "All contractor accounts with contact info, subscription status, and verification state.", columns: ["id","company_name","owner_first_name","owner_last_name","email","phone","category","city","state_code","status","rating","total_reviews","created_at","profile_visible"], lastExported: "Jun 25, 2025" },
  { id: "suppliers",     label: "Suppliers",       icon: "🏢", description: "All supplier listings with category, location, contact, and verification status.", columns: ["id","company_name","category","city","state_code","phone","email","status","created_at"], lastExported: null },
  { id: "homeowners",    label: "Homeowners",      icon: "🏠", description: "Registered homeowner accounts with location and activity summary.", columns: ["id","full_name","email","phone","role","created_at"], lastExported: "Jun 20, 2025" },
  { id: "subscriptions", label: "Subscriptions",   icon: "💳", description: "Active and historical subscription records with billing amounts and dates.", columns: ["id","contractor_id","status","plan","amount_cents","current_period_start","current_period_end","stripe_subscription_id","created_at"], lastExported: "Jun 28, 2025" },
  { id: "payments",      label: "Payment History", icon: "💰", description: "All payment transactions including successful charges and failures.", columns: ["id","contractor_id","event_type","amount_cents","invoice_id","created_at"], lastExported: "Jun 27, 2025" },
  { id: "reviews",       label: "Reviews",         icon: "⭐", description: "All reviews including published, flagged, and removed.", columns: ["id","contractor_id","rating","project_type","review_text","status","created_at"], lastExported: null },
  { id: "leads",         label: "Quote Requests",  icon: "📩", description: "All homeowner quote requests with service type, location, and contact info.", columns: ["id","contractor_id","homeowner_id","service_type","budget_range","city","state_code","contact_name","contact_email","status","created_at"], lastExported: null },
  { id: "audit_logs",    label: "Audit Logs",      icon: "📋", description: "Complete admin action history for compliance and review.", columns: ["id","admin_id","action","entity_type","entity_id","created_at"], lastExported: null },
];

export default function ExportsPage() {
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [exporting, setExporting] = useState<string | null>(null);
  const [exported, setExported] = useState<Record<string, string>>({});

  const triggerExport = async (config: ExportConfig) => {
    setExporting(config.id);
    try {
      const res = await fetch(`/api/admin/export/${config.id}?format=${format}`);
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${config.id}_${new Date().toISOString().split("T")[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExported(p => ({ ...p, [config.id]: new Date().toLocaleTimeString() }));
    } catch {
      alert("Export failed. Please try again.");
    } finally {
      setExporting(null);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.625rem", fontWeight: 800, color: "var(--navy)", marginBottom: "0.25rem" }}>Data Exports</h1>
          <p style={{ color: "var(--gray-500)", fontSize: "0.875rem" }}>Export real platform data for analysis, backup, or compliance purposes.</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", background: "white", border: "1px solid var(--gray-150)", borderRadius: "var(--radius)", padding: "0.375rem" }}>
          {(["csv","json"] as ExportFormat[]).map(f => (
            <button key={f} onClick={() => setFormat(f)} style={{
              padding: "0.5rem 0.875rem", border: "none", borderRadius: "var(--radius-sm)",
              background: format === f ? "var(--navy)" : "transparent",
              color: format === f ? "white" : "var(--gray-600)",
              fontWeight: 700, fontSize: "0.875rem", cursor: "pointer", fontFamily: "inherit",
              textTransform: "uppercase",
            }}>{f}</button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(400px,1fr))", gap: "1.25rem" }}>
        {EXPORTS.map(exp => (
          <div key={exp.id} className="card" style={{ padding: "1.75rem" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", marginBottom: "1.25rem" }}>
              <span style={{ fontSize: "2rem" }}>{exp.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: "var(--navy)", fontSize: "1.0625rem", marginBottom: "0.25rem" }}>{exp.label}</div>
                <div style={{ fontSize: "0.8125rem", color: "var(--gray-500)", lineHeight: 1.6 }}>{exp.description}</div>
              </div>
            </div>
            <div style={{ marginBottom: "1.25rem" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5rem" }}>
                Columns ({exp.columns.length})
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem" }}>
                {exp.columns.slice(0, 6).map(col => (
                  <code key={col} style={{ background: "var(--gray-100)", color: "var(--gray-600)", padding: "0.15rem 0.5rem", borderRadius: "4px", fontSize: "0.7rem" }}>{col}</code>
                ))}
                {exp.columns.length > 6 && (
                  <code style={{ background: "var(--gray-100)", color: "var(--gray-500)", padding: "0.15rem 0.5rem", borderRadius: "4px", fontSize: "0.7rem" }}>+{exp.columns.length - 6} more</code>
                )}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--gray-400)" }}>
                {exported[exp.id] ? `Downloaded at ${exported[exp.id]}` : exp.lastExported ? `Last export: ${exp.lastExported}` : "Never exported"}
              </div>
              <button onClick={() => triggerExport(exp)} className="btn-red"
                style={{ padding: "0.625rem 1.25rem", fontSize: "0.875rem", opacity: exporting === exp.id ? 0.7 : 1, cursor: exporting === exp.id ? "wait" : "pointer" }}
                disabled={exporting === exp.id}>
                {exporting === exp.id ? "Preparing..." : `Export .${format.toUpperCase()}`}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "2rem", background: "var(--gray-50)", border: "1px solid var(--gray-150)", borderRadius: "var(--radius)", padding: "1.25rem 1.5rem" }}>
        <p style={{ fontSize: "0.875rem", color: "var(--gray-500)", lineHeight: 1.65 }}>
          <strong>Data Privacy:</strong> All exports include personal data from the live database. Handle with care per your Privacy Policy. Exports are logged in Audit Logs.
        </p>
      </div>
    </div>
  );
}
