"use client";
import { useState, useEffect, useCallback } from "react";
import { COMPANY } from "@/lib/data";

type Tab = "general"|"pricing"|"integrations"|"email"|"seo"|"security";

interface PlatformSettings {
  maintenance_mode: string;
  signup_enabled: string;
  contractor_signup_enabled: string;
  first_month_price_cents: string;
  monthly_price_cents: string;
  grace_period_days: string;
  deactivation_days: string;
}

function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "2.5rem" }}>
      <div style={{ marginBottom: "1.25rem" }}>
        <h3 style={{ fontWeight: 700, color: "var(--navy)", fontSize: "1.0625rem", marginBottom: "0.25rem" }}>{title}</h3>
        {desc && <p style={{ fontSize: "0.875rem", color: "var(--gray-500)" }}>{desc}</p>}
      </div>
      <div className="card" style={{ padding: "1.75rem" }}>{children}</div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "1.25rem" }}>
      <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--gray-700)", marginBottom: "0.375rem" }}>{label}</label>
      {children}
      {hint && <p style={{ fontSize: "0.8125rem", color: "var(--gray-400)", marginTop: "0.375rem" }}>{hint}</p>}
    </div>
  );
}

function Toast({ msg, type }: { msg: string; type: "success" | "error" }) {
  return (
    <div style={{ position: "fixed", bottom: "1.5rem", right: "1.5rem", zIndex: 1000, background: type === "success" ? "#16a34a" : "var(--red)", color: "white", padding: "0.875rem 1.5rem", borderRadius: "var(--radius)", fontWeight: 600, fontSize: "0.9rem", boxShadow: "var(--shadow-lg)" }}>
      {msg}
    </div>
  );
}

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>("general");
  const [settings, setSettings] = useState<Partial<PlatformSettings>>({});
  const [saving, setSaving] = useState(false);
  const [logo, setLogo] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/settings");
      const json = await res.json();
      if (json.settings) setSettings(json.settings);
    } catch { /* silent */ }
  }, []);

  useEffect(() => { load(); }, [load]);

  const saveSettings = async (patch: Partial<PlatformSettings>) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error();
      setSettings(prev => ({ ...prev, ...patch }));
      showToast("Settings saved");
    } catch {
      showToast("Failed to save settings", "error");
    } finally {
      setSaving(false);
    }
  };

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "general",      label: "General",      icon: "🏢" },
    { key: "pricing",      label: "Pricing",       icon: "💰" },
    { key: "integrations", label: "Integrations",  icon: "🔌" },
    { key: "email",        label: "Email / SMTP",  icon: "📧" },
    { key: "seo",          label: "SEO",           icon: "🔍" },
    { key: "security",     label: "Security",      icon: "🔒" },
  ];

  return (
    <div>
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.625rem", fontWeight: 800, color: "var(--navy)", marginBottom: "0.25rem" }}>Settings</h1>
        <p style={{ color: "var(--gray-500)", fontSize: "0.875rem" }}>All platform settings — no code editing required.</p>
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: "0.25rem", marginBottom: "2rem", background: "white", borderRadius: "var(--radius)", border: "1px solid var(--gray-150)", padding: "0.375rem", flexWrap: "wrap" }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            display: "flex", alignItems: "center", gap: "0.5rem",
            padding: "0.625rem 1rem", borderRadius: "var(--radius-sm)",
            background: tab === t.key ? "var(--navy)" : "transparent",
            color: tab === t.key ? "white" : "var(--gray-600)",
            border: "none", cursor: "pointer", fontFamily: "inherit",
            fontWeight: tab === t.key ? 700 : 500, fontSize: "0.875rem",
            transition: "all 0.15s",
          }}>
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {/* ── GENERAL ── */}
      {tab === "general" && (
        <div>
          <Section title="Brand Identity" desc="Logo shown in the header.">
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--gray-700)", marginBottom: "0.75rem" }}>Logo</label>
              <div style={{ width: "100%", maxWidth: "300px", aspectRatio: "3/1", background: logo ? `url(${logo}) center/contain no-repeat` : "var(--gray-50)", border: "2px dashed var(--gray-300)", borderRadius: "var(--radius)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexDirection: "column", gap: "0.5rem", marginBottom: "0.75rem" }}
                onClick={() => document.getElementById("logo-upload")?.click()}>
                {logo ? null : <>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--gray-300)" strokeWidth="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  <span style={{ fontSize: "0.8125rem", color: "var(--gray-400)" }}>Click to upload logo</span>
                </>}
              </div>
              <input id="logo-upload" type="file" accept="image/*" style={{ display: "none" }}
                onChange={e => { const f = e.target.files?.[0]; if (f) setLogo(URL.createObjectURL(f)); }} />
              <p style={{ fontSize: "0.75rem", color: "var(--gray-400)" }}>PNG or SVG · Recommended: 400×120px</p>
            </div>
          </Section>

          <Section title="Company Information">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
              <Field label="Company Name"><input className="form-input" defaultValue={COMPANY.legalName} /></Field>
              <Field label="Contact Email"><input className="form-input" type="email" defaultValue={COMPANY.email} /></Field>
              <Field label="Contact Phone"><input className="form-input" type="tel" defaultValue={COMPANY.phone} /></Field>
            </div>
          </Section>

          <Section title="Platform Switches" desc="Toggle features without redeployment.">
            {[
              ["maintenance_mode", "Maintenance Mode", "When enabled, shows a maintenance page to all visitors"],
              ["signup_enabled", "Homeowner Signup", "Allow new homeowner accounts"],
              ["contractor_signup_enabled", "Contractor Signup", "Allow new contractor registrations and payments"],
            ].map(([key, label, hint]) => (
              <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.875rem 0", borderBottom: "1px solid var(--gray-100)" }}>
                <div>
                  <div style={{ fontWeight: 600, color: "var(--navy)", fontSize: "0.9375rem" }}>{label}</div>
                  <div style={{ fontSize: "0.8125rem", color: "var(--gray-400)" }}>{hint}</div>
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                  <input type="checkbox"
                    checked={settings[key as keyof PlatformSettings] === "true"}
                    onChange={e => saveSettings({ [key]: String(e.target.checked) } as Partial<PlatformSettings>)}
                    style={{ accentColor: "var(--navy)", width: "18px", height: "18px" }} />
                  <span style={{ fontSize: "0.875rem", color: "var(--gray-600)" }}>{settings[key as keyof PlatformSettings] === "true" ? "On" : "Off"}</span>
                </label>
              </div>
            ))}
          </Section>
        </div>
      )}

      {/* ── PRICING ── */}
      {tab === "pricing" && (
        <div>
          <Section title="Subscription Pricing" desc="Prices charged to contractors. Changes take effect for new subscriptions immediately.">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
              {[
                { key: "first_month_price_cents", label: "First Month Price", hint: "One-time introductory price. Billed on signup." },
                { key: "monthly_price_cents", label: "Monthly Renewal Price", hint: "Auto-renews monthly until cancelled." },
              ].map(({ key, label, hint }) => (
                <div key={key} style={{ background: "rgba(22,46,94,0.04)", border: "1.5px solid rgba(22,46,94,0.12)", borderRadius: "var(--radius-lg)", padding: "1.75rem" }}>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.75rem" }}>{label}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    <span style={{ fontSize: "1.5rem", color: "var(--gray-500)", fontWeight: 400 }}>$</span>
                    <input className="form-input" type="number" step="1" min="0"
                      value={settings[key as keyof PlatformSettings] ?? ""}
                      onChange={e => setSettings(p => ({ ...p, [key]: e.target.value }))}
                      style={{ fontSize: "2rem", fontWeight: 800, color: "var(--navy)", border: "none", background: "transparent", padding: "0", width: "140px" }} />
                    <span style={{ fontSize: "0.8rem", color: "var(--gray-400)" }}>cents</span>
                  </div>
                  <p style={{ fontSize: "0.8125rem", color: "var(--gray-400)" }}>{hint}</p>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: "1rem" }}>
              <button className="btn-red" style={{ padding: "0.75rem 1.75rem" }} disabled={saving}
                onClick={() => saveSettings({
                  first_month_price_cents: settings.first_month_price_cents ?? "2990",
                  monthly_price_cents: settings.monthly_price_cents ?? "4990",
                })}>
                {saving ? "Saving..." : "Save Pricing Settings"}
              </button>
            </div>
            <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "var(--radius)", padding: "1rem 1.25rem", marginTop: "1.25rem" }}>
              <p style={{ fontSize: "0.875rem", color: "#92400e" }}>
                <strong>Important:</strong> Changing cents here updates the database display only. The actual billing amount is controlled by Stripe Price IDs in your .env.local file.
              </p>
            </div>
          </Section>

          <Section title="Grace Period">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
              <Field label="Grace Period (days)" hint="Days after a failed payment before profile is hidden.">
                <input className="form-input" type="number" min="0" max="30" style={{ width: "120px" }}
                  value={settings.grace_period_days ?? "3"}
                  onChange={e => setSettings(p => ({ ...p, grace_period_days: e.target.value }))} />
              </Field>
              <Field label="Deactivation Period (days)" hint="Days suspended with no payment before permanent deactivation.">
                <input className="form-input" type="number" min="1" max="90" style={{ width: "120px" }}
                  value={settings.deactivation_days ?? "30"}
                  onChange={e => setSettings(p => ({ ...p, deactivation_days: e.target.value }))} />
              </Field>
            </div>
            <button className="btn-red" style={{ padding: "0.75rem 1.75rem" }} disabled={saving}
              onClick={() => saveSettings({ grace_period_days: settings.grace_period_days, deactivation_days: settings.deactivation_days })}>
              {saving ? "Saving..." : "Save Grace Period Settings"}
            </button>
          </Section>
        </div>
      )}

      {/* ── INTEGRATIONS ── */}
      {tab === "integrations" && (
        <div>
          <Section title="Stripe" desc="Payment processor for contractor subscriptions.">
            <div style={{ background: "rgba(22,163,74,0.06)", border: "1px solid rgba(22,163,74,0.2)", borderRadius: "var(--radius)", padding: "1rem 1.25rem", marginBottom: "1.25rem" }}>
              <p style={{ fontSize: "0.875rem", color: "#16a34a", fontWeight: 600 }}>
                ✓ Stripe is configured via environment variables (.env.local / Vercel settings).
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
              <Field label="Publishable Key" hint="Set via NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY env var">
                <input className="form-input" value="pk_test_***configured***" disabled style={{ fontFamily: "monospace", opacity: 0.6 }} />
              </Field>
              <Field label="First-Month Price ID" hint="Set via STRIPE_PRICE_FIRST_MONTH env var">
                <input className="form-input" value="price_***configured***" disabled style={{ fontFamily: "monospace", opacity: 0.6 }} />
              </Field>
              <Field label="Monthly Price ID" hint="Set via STRIPE_PRICE_MONTHLY env var">
                <input className="form-input" value="price_***configured***" disabled style={{ fontFamily: "monospace", opacity: 0.6 }} />
              </Field>
            </div>
          </Section>

          <Section title="Analytics & Tracking" desc="Add tracking IDs below — they take effect on next deploy or page reload.">
            <Field label="Google Analytics Measurement ID" hint="Format: G-XXXXXXXXXX">
              <input className="form-input" placeholder="G-XXXXXXXXXX" style={{ fontFamily: "monospace" }} />
            </Field>
            <Field label="Meta Pixel ID">
              <input className="form-input" placeholder="1234567890123456" style={{ fontFamily: "monospace" }} />
            </Field>
          </Section>
        </div>
      )}

      {/* ── EMAIL ── */}
      {tab === "email" && (
        <div>
          <Section title="Email Provider" desc="Transactional emails are sent via Resend.">
            <div style={{ background: "rgba(22,163,74,0.06)", border: "1px solid rgba(22,163,74,0.2)", borderRadius: "var(--radius)", padding: "1rem 1.25rem", marginBottom: "1.25rem" }}>
              <p style={{ fontSize: "0.875rem", color: "#16a34a", fontWeight: 600 }}>
                ✓ Resend is configured via RESEND_API_KEY environment variable.
              </p>
            </div>
            <Field label="From Address" hint="Set via RESEND_FROM_EMAIL env var">
              <input className="form-input" value="noreply@smartchoiceconstructions.com" disabled style={{ opacity: 0.6 }} />
            </Field>
          </Section>

          <Section title="Active Email Templates">
            {[
              ["Welcome Email",              "Sent when a contractor's account is approved"],
              ["Payment Failed",             "Sent when a renewal payment fails"],
              ["Subscription Canceled",      "Sent when a contractor cancels"],
              ["Quote Request Notification", "Sent to contractor when a homeowner submits a quote"],
            ].map(([name, desc]) => (
              <div key={name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.875rem 0", borderBottom: "1px solid var(--gray-100)" }}>
                <div>
                  <div style={{ fontWeight: 600, color: "var(--navy)", fontSize: "0.9375rem" }}>{name}</div>
                  <div style={{ fontSize: "0.8125rem", color: "var(--gray-400)" }}>{desc}</div>
                </div>
                <span style={{ background: "rgba(22,163,74,0.1)", color: "#16a34a", padding: "0.25rem 0.75rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700 }}>Active</span>
              </div>
            ))}
          </Section>
        </div>
      )}

      {/* ── SEO ── */}
      {tab === "seo" && (
        <div>
          <Section title="Default SEO" desc="Fallback metadata used when a page doesn't have specific SEO settings.">
            <Field label="Default Title Template" hint="Use %s as placeholder for the page name.">
              <input className="form-input" defaultValue="%s | Smart Choice Constructions" />
            </Field>
            <Field label="Default Meta Description">
              <textarea className="form-input" rows={3} defaultValue="Smart Choice Constructions connects homeowners with local construction professionals across the United States." style={{ resize: "vertical" }} />
            </Field>
          </Section>

          <Section title="Sitemap & Indexing">
            <Field label="Canonical Domain">
              <input className="form-input" defaultValue="https://smartchoiceconstructions.com" style={{ fontFamily: "monospace" }} />
            </Field>
          </Section>
        </div>
      )}

      {/* ── SECURITY ── */}
      {tab === "security" && (
        <div>
          <Section title="Platform Access">
            <Field label="Maintenance Mode" hint="Blocks all public access and shows a maintenance message.">
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <input type="checkbox"
                  checked={settings.maintenance_mode === "true"}
                  onChange={e => saveSettings({ maintenance_mode: String(e.target.checked) })}
                  style={{ accentColor: "var(--navy)", width: "18px", height: "18px" }} />
                <span style={{ fontSize: "0.9375rem", color: "var(--gray-700)" }}>
                  {settings.maintenance_mode === "true" ? "Enabled — site is in maintenance mode" : "Disabled — site is live"}
                </span>
              </div>
            </Field>
          </Section>

          <Section title="Content Security" desc="Upload and content restrictions.">
            <Field label="Max upload file size (MB)">
              <input className="form-input" type="number" defaultValue="10" style={{ width: "120px" }} />
            </Field>
            <Field label="Allowed file types for documents" hint="Comma-separated MIME types.">
              <input className="form-input" defaultValue="application/pdf,image/jpeg,image/png" style={{ fontFamily: "monospace" }} />
            </Field>
          </Section>
        </div>
      )}
    </div>
  );
}
