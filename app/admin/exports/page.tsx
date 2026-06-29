"use client";
import { useState } from "react";

type ExportFormat = "csv" | "xlsx" | "json";

interface ExportConfig {
  id: string; label: string; description: string; icon: string;
  columns: string[]; rowCount: number; lastExported: string | null;
}

const EXPORTS: ExportConfig[] = [
  { id: "contractors",   label: "Contractors",        icon: "👷", description: "All contractor accounts with contact info, subscription status, and verification state.", columns: ["ID","Company","Name","Email","Phone","Category","Location","Status","Subscription","Rating","Reviews","Joined","Verified","Licensed","Insured"], rowCount: 312, lastExported: "Jun 25, 2025" },
  { id: "suppliers",     label: "Suppliers",          icon: "🏢", description: "All supplier listings with category, location, contact, and verification status.", columns: ["ID","Name","Category","City","State","Phone","Email","Rating","Reviews","Verified","Featured","Status","Joined"], rowCount: 10, lastExported: null },
  { id: "homeowners",    label: "Homeowners",         icon: "🏠", description: "Registered homeowner accounts with location and activity summary.", columns: ["ID","Name","Email","City","State","ZIP","Quotes Sent","Contacts Made","Joined"], rowCount: 1847, lastExported: "Jun 20, 2025" },
  { id: "subscriptions", label: "Subscriptions",      icon: "💳", description: "Active and historical subscription records with billing amounts and dates.", columns: ["ID","Contractor","Email","Status","Amount","Start Date","Next Billing","Stripe ID","Months Active"], rowCount: 287, lastExported: "Jun 28, 2025" },
  { id: "payments",      label: "Payment History",    icon: "💰", description: "All payment transactions including successful charges, failures, and refunds.", columns: ["Invoice ID","Contractor","Date","Amount","Status","Stripe Charge ID","Card Last 4","Failure Reason"], rowCount: 1892, lastExported: "Jun 27, 2025" },
  { id: "reviews",       label: "Reviews",            icon: "⭐", description: "All reviews including published, flagged, and removed.", columns: ["ID","Contractor","Reviewer","Rating","Project","Date","Status","Flag Reason"], rowCount: 3421, lastExported: null },
  { id: "leads",         label: "Quote Requests",     icon: "📩", description: "All homeowner quote requests with service type, location, and contractor match.", columns: ["ID","Homeowner","Service","City","State","Budget","Date","Matched Contractors","Status"], rowCount: 8904, lastExported: null },
  { id: "audit_logs",    label: "Audit Logs",         icon: "📋", description: "Complete admin action history for compliance and review.", columns: ["Timestamp","Admin","Role","Action","Entity","Entity ID","Details","IP Address"], rowCount: 487, lastExported: null },
];

export default function ExportsPage() {
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [exporting, setExporting] = useState<string | null>(null);
  const [exported, setExported] = useState<Record<string, string>>({});

  const triggerExport = (config: ExportConfig) => {
    setExporting(config.id);
    setTimeout(() => {
      setExporting(null);
      setExported(p => ({ ...p, [config.id]: "Just now" }));
    }, 1800);
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.625rem", fontWeight: 800, color: "var(--navy)", marginBottom: "0.25rem" }}>Data Exports</h1>
          <p style={{ color: "var(--gray-500)", fontSize: "0.875rem" }}>Export platform data for analysis, backup, or compliance purposes.</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", background: "white", border: "1px solid var(--gray-150)", borderRadius: "var(--radius)", padding: "0.375rem" }}>
          {(["csv","xlsx","json"] as ExportFormat[]).map(f => (
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

            {/* Column preview */}
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
              <div>
                <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--navy)" }}>{exp.rowCount.toLocaleString()}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--gray-400)" }}>
                  {exported[exp.id] ? `Exported: ${exported[exp.id]}` : exp.lastExported ? `Last export: ${exp.lastExported}` : "Never exported"}
                </div>
              </div>
              <button onClick={() => triggerExport(exp)} className="btn-red"
                style={{ padding: "0.625rem 1.25rem", fontSize: "0.875rem", opacity: exporting === exp.id ? 0.7 : 1, cursor: exporting === exp.id ? "wait" : "pointer" }}
                disabled={exporting === exp.id}>
                {exporting === exp.id ? "Preparing…" : `Export .${format.toUpperCase()}`}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "2rem", background: "var(--gray-50)", border: "1px solid var(--gray-150)", borderRadius: "var(--radius)", padding: "1.25rem 1.5rem" }}>
        <p style={{ fontSize: "0.875rem", color: "var(--gray-500)", lineHeight: 1.65 }}>
          <strong>Data Privacy:</strong> All exports include personal data. Handle with care per your Privacy Policy commitments. Exports are logged in Audit Logs with your admin credentials. Do not share export files with unauthorized parties. In production, exports of large datasets will be emailed as a download link rather than served directly.
        </p>
      </div>
    </div>
  );
}
