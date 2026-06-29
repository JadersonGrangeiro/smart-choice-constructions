"use client";
import { useState } from "react";
import { COMPANY } from "@/lib/data";

type Tab = "general"|"pricing"|"integrations"|"email"|"seo"|"security";

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

function SaveBar({ tab }: { tab: string }) {
  const [saved, setSaved] = useState(false);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1rem", paddingTop: "1.5rem", borderTop: "1px solid var(--gray-100)", marginTop: "0.5rem" }}>
      <button className="btn-red" style={{ padding: "0.75rem 1.75rem" }}
        onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2500); }}>
        Save {tab} Settings
      </button>
      {saved && (
        <span style={{ fontSize: "0.875rem", color: "#16a34a", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.375rem" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 13l4 4L19 7"/></svg>
          Saved successfully
        </span>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>("general");
  const [logo, setLogo] = useState<string | null>(null);
  const [favicon, setFavicon] = useState<string | null>(null);

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
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.625rem", fontWeight: 800, color: "var(--navy)", marginBottom: "0.25rem" }}>Settings</h1>
        <p style={{ color: "var(--gray-500)", fontSize: "0.875rem" }}>
          All platform settings — no code editing required.
        </p>
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
          <Section title="Brand Identity" desc="Logo and favicon used across the entire platform.">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--gray-700)", marginBottom: "0.75rem" }}>
                  Logo
                </label>
                <div style={{ width: "100%", aspectRatio: "3/1", background: logo ? `url(${logo}) center/contain no-repeat` : "var(--gray-50)", border: "2px dashed var(--gray-300)", borderRadius: "var(--radius)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexDirection: "column", gap: "0.5rem", marginBottom: "0.75rem" }}
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
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--gray-700)", marginBottom: "0.75rem" }}>
                  Favicon
                </label>
                <div style={{ width: "80px", height: "80px", background: favicon ? `url(${favicon}) center/contain no-repeat` : "var(--gray-50)", border: "2px dashed var(--gray-300)", borderRadius: "var(--radius)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", marginBottom: "0.75rem" }}
                  onClick={() => document.getElementById("favicon-upload")?.click()}>
                  {favicon ? null : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gray-300)" strokeWidth="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>}
                </div>
                <input id="favicon-upload" type="file" accept="image/*" style={{ display: "none" }}
                  onChange={e => { const f = e.target.files?.[0]; if (f) setFavicon(URL.createObjectURL(f)); }} />
                <p style={{ fontSize: "0.75rem", color: "var(--gray-400)" }}>ICO or PNG · 32×32 or 64×64px</p>
              </div>
            </div>
          </Section>

          <Section title="Company Information" desc="Displayed in the footer, contact page, and legal documents.">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
              <Field label="Company Name">
                <input className="form-input" defaultValue={COMPANY.legalName} />
              </Field>
              <Field label="Tagline / Slogan">
                <input className="form-input" defaultValue={COMPANY.tagline} />
              </Field>
              <Field label="Contact Email">
                <input className="form-input" type="email" defaultValue={COMPANY.email} />
              </Field>
              <Field label="Contact Phone">
                <input className="form-input" type="tel" defaultValue={COMPANY.phone} />
              </Field>
              <Field label="Street Address" hint="Used in legal pages and structured data.">
                <input className="form-input" defaultValue="2222 W Grand River Ave Ste A" />
              </Field>
              <Field label="City / State / ZIP">
                <input className="form-input" defaultValue="Okemos, MI 48864" />
              </Field>
            </div>
          </Section>

          <Section title="Social Media" desc="Links shown in the footer and structured data.">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
              {[
                ["Facebook",  "https://facebook.com/..."],
                ["Instagram", "https://instagram.com/..."],
                ["LinkedIn",  "https://linkedin.com/company/..."],
                ["Twitter/X", "https://twitter.com/..."],
                ["YouTube",   "https://youtube.com/..."],
              ].map(([label, placeholder]) => (
                <Field key={label} label={label}>
                  <input className="form-input" placeholder={placeholder} />
                </Field>
              ))}
            </div>
          </Section>

          <Section title="Language & Localization">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
              <Field label="Default Language">
                <select className="form-select">
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                </select>
              </Field>
              <Field label="Additional Languages" hint="Languages available in the switcher.">
                <div style={{ display: "flex", gap: "1rem" }}>
                  {[["en","English"],["es","Spanish"]].map(([code,label]) => (
                    <label key={code} style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.9rem", color: "var(--gray-700)", fontWeight: 500 }}>
                      <input type="checkbox" defaultChecked style={{ accentColor: "var(--navy)" }} /> {label}
                    </label>
                  ))}
                </div>
              </Field>
            </div>
          </Section>
          <SaveBar tab="General" />
        </div>
      )}

      {/* ── PRICING ── */}
      {tab === "pricing" && (
        <div>
          <Section title="Subscription Pricing" desc="Prices charged to contractors. Changes take effect for new subscriptions immediately. Existing subscribers are not affected until their next renewal.">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
              <div style={{ background: "rgba(22,46,94,0.04)", border: "1.5px solid rgba(22,46,94,0.12)", borderRadius: "var(--radius-lg)", padding: "1.75rem" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.75rem" }}>First Month Price</div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontSize: "1.5rem", color: "var(--gray-500)", fontWeight: 400 }}>$</span>
                  <input className="form-input" type="number" step="0.01" min="0"
                    defaultValue={COMPANY.pricing.firstMonth}
                    style={{ fontSize: "2rem", fontWeight: 800, color: "var(--navy)", border: "none", background: "transparent", padding: "0", width: "120px" }} />
                </div>
                <p style={{ fontSize: "0.8125rem", color: "var(--gray-400)", marginTop: "0.5rem" }}>
                  One-time introductory price. Billed on signup.
                </p>
              </div>
              <div style={{ background: "rgba(22,46,94,0.04)", border: "1.5px solid rgba(22,46,94,0.12)", borderRadius: "var(--radius-lg)", padding: "1.75rem" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.75rem" }}>Monthly Renewal Price</div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontSize: "1.5rem", color: "var(--gray-500)", fontWeight: 400 }}>$</span>
                  <input className="form-input" type="number" step="0.01" min="0"
                    defaultValue={COMPANY.pricing.monthly}
                    style={{ fontSize: "2rem", fontWeight: 800, color: "var(--navy)", border: "none", background: "transparent", padding: "0", width: "120px" }} />
                </div>
                <p style={{ fontSize: "0.8125rem", color: "var(--gray-400)", marginTop: "0.5rem" }}>
                  Auto-renews monthly until cancelled.
                </p>
              </div>
            </div>
            <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "var(--radius)", padding: "1rem 1.25rem" }}>
              <p style={{ fontSize: "0.875rem", color: "#92400e" }}>
                <strong>Important:</strong> After changing prices here, you must also update the corresponding Stripe Price IDs in the Integrations tab. Stripe controls the actual billing amount.
              </p>
            </div>
          </Section>

          <Section title="Grace Period" desc="How long a contractor profile remains visible after a failed payment before being suspended.">
            <Field label="Grace Period (days)" hint="After this many days with a failed payment, the profile is hidden from search results.">
              <input className="form-input" type="number" min="0" max="30" defaultValue="3" style={{ width: "120px" }} />
            </Field>
            <Field label="Deactivation Period (days)" hint="After this many days suspended with no payment, the account is permanently deactivated.">
              <input className="form-input" type="number" min="1" max="90" defaultValue="30" style={{ width: "120px" }} />
            </Field>
          </Section>
          <SaveBar tab="Pricing" />
        </div>
      )}

      {/* ── INTEGRATIONS ── */}
      {tab === "integrations" && (
        <div>
          <Section title="Google Analytics" desc="Tracks pageviews, sessions, and user behaviour across the platform.">
            <Field label="Measurement ID" hint="Format: G-XXXXXXXXXX — found in Google Analytics → Admin → Data Streams.">
              <input className="form-input" placeholder="G-XXXXXXXXXX" style={{ fontFamily: "monospace" }} />
            </Field>
            <Field label="Enable Analytics">
              <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer" }}>
                <input type="checkbox" defaultChecked style={{ accentColor: "var(--navy)", width: "18px", height: "18px" }} />
                <span style={{ fontSize: "0.9375rem", color: "var(--gray-700)" }}>Active — tracking is enabled</span>
              </label>
            </Field>
          </Section>

          <Section title="Google Tag Manager" desc="Manages all tracking tags without code deployments.">
            <Field label="Container ID" hint="Format: GTM-XXXXXXX">
              <input className="form-input" placeholder="GTM-XXXXXXX" style={{ fontFamily: "monospace" }} />
            </Field>
          </Section>

          <Section title="Meta Pixel" desc="Facebook/Instagram ads tracking and retargeting.">
            <Field label="Pixel ID">
              <input className="form-input" placeholder="1234567890123456" style={{ fontFamily: "monospace" }} />
            </Field>
          </Section>

          <Section title="Stripe" desc="Payment processor for contractor subscriptions. Update these when creating new pricing in Stripe Dashboard.">
            <div style={{ background: "rgba(200,16,46,0.04)", border: "1px solid rgba(200,16,46,0.12)", borderRadius: "var(--radius)", padding: "1rem 1.25rem", marginBottom: "1.25rem" }}>
              <p style={{ fontSize: "0.875rem", color: "var(--gray-700)" }}>
                <strong>Security note:</strong> Secret keys are stored encrypted server-side and never exposed to the browser. Only enter keys in this form — they are not visible after saving.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
              <Field label="Publishable Key (live)" hint="Starts with pk_live_">
                <input className="form-input" placeholder="pk_live_..." style={{ fontFamily: "monospace" }} type="password" />
              </Field>
              <Field label="Secret Key (live)" hint="Starts with sk_live_ — stored encrypted">
                <input className="form-input" placeholder="sk_live_..." style={{ fontFamily: "monospace" }} type="password" />
              </Field>
              <Field label="Webhook Secret" hint="Starts with whsec_">
                <input className="form-input" placeholder="whsec_..." style={{ fontFamily: "monospace" }} type="password" />
              </Field>
              <Field label="First-Month Price ID">
                <input className="form-input" placeholder="price_..." style={{ fontFamily: "monospace" }} />
              </Field>
              <Field label="Monthly Renewal Price ID">
                <input className="form-input" placeholder="price_..." style={{ fontFamily: "monospace" }} />
              </Field>
              <Field label="Product ID">
                <input className="form-input" placeholder="prod_..." style={{ fontFamily: "monospace" }} />
              </Field>
            </div>
          </Section>

          <Section title="Google Search Console" desc="Used to verify domain ownership for search indexing.">
            <Field label="Verification Token" hint="The token value from the HTML meta tag method.">
              <input className="form-input" placeholder="google-site-verification token" style={{ fontFamily: "monospace" }} />
            </Field>
          </Section>
          <SaveBar tab="Integrations" />
        </div>
      )}

      {/* ── EMAIL / SMTP ── */}
      {tab === "email" && (
        <div>
          <Section title="SMTP Configuration" desc="Used to send transactional emails (welcome, password reset, payment alerts, notifications).">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
              <Field label="SMTP Host">
                <input className="form-input" placeholder="smtp.sendgrid.net" />
              </Field>
              <Field label="Port">
                <input className="form-input" type="number" defaultValue="587" style={{ width: "120px" }} />
              </Field>
              <Field label="Username / API Key">
                <input className="form-input" placeholder="apikey" />
              </Field>
              <Field label="Password">
                <input className="form-input" type="password" placeholder="•••••••••••••" />
              </Field>
              <Field label="From Address">
                <input className="form-input" type="email" placeholder="noreply@smartchoiceconstructions.com" />
              </Field>
              <Field label="From Name">
                <input className="form-input" defaultValue="Smart Choice Constructions" />
              </Field>
            </div>
            <div style={{ marginTop: "1.25rem" }}>
              <button className="btn-secondary" style={{ padding: "0.625rem 1.25rem", fontSize: "0.875rem" }}>
                Send Test Email
              </button>
            </div>
          </Section>

          <Section title="Email Templates" desc="Which automated emails are active. Content is managed in code.">
            {[
              ["Welcome Email",              "Sent when a contractor's account is approved"],
              ["Payment Failed",             "Sent when a renewal payment fails"],
              ["Profile Suspended",          "Sent when grace period expires"],
              ["Payment Confirmed",          "Sent on each successful renewal"],
              ["Password Reset",             "Sent when a user requests a password reset"],
              ["Quote Request Notification", "Sent to contractor when a homeowner submits a quote request"],
              ["Document Approved",          "Sent when admin approves a submitted document"],
              ["Document Rejected",          "Sent when admin rejects a submitted document"],
            ].map(([name, desc]) => (
              <div key={name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.875rem 0", borderBottom: "1px solid var(--gray-100)" }}>
                <div>
                  <div style={{ fontWeight: 600, color: "var(--navy)", fontSize: "0.9375rem" }}>{name}</div>
                  <div style={{ fontSize: "0.8125rem", color: "var(--gray-400)" }}>{desc}</div>
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                  <input type="checkbox" defaultChecked style={{ accentColor: "var(--navy)", width: "16px", height: "16px" }} />
                  <span style={{ fontSize: "0.875rem", color: "var(--gray-600)" }}>Active</span>
                </label>
              </div>
            ))}
          </Section>
          <SaveBar tab="Email" />
        </div>
      )}

      {/* ── SEO ── */}
      {tab === "seo" && (
        <div>
          <Section title="Default SEO" desc="Fallback metadata used when a page doesn't have specific SEO settings.">
            <Field label="Default Title Template" hint="Use %s as placeholder for the page name. Example: %s | Smart Choice Constructions">
              <input className="form-input" defaultValue="%s | Smart Choice Constructions" />
            </Field>
            <Field label="Default Meta Description">
              <textarea className="form-input" rows={3} defaultValue="Smart Choice Constructions connects homeowners with local construction professionals across the United States. Free to use for homeowners." style={{ resize: "vertical" }} />
            </Field>
            <Field label="Default OG Image" hint="1200×630px recommended. Used for social sharing previews.">
              <div style={{ display: "flex", gap: "0.875rem", alignItems: "flex-start" }}>
                <div style={{ width: "200px", height: "105px", background: "var(--gray-100)", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--gray-400)" }}>OG Image Preview</span>
                </div>
                <button className="btn-secondary" style={{ padding: "0.625rem 1.125rem", fontSize: "0.875rem" }}>
                  Upload Image
                </button>
              </div>
            </Field>
          </Section>

          <Section title="Sitemap & Indexing" desc="Controls how search engines discover and index the platform.">
            <Field label="Canonical Domain" hint="Used in all canonical URL tags. Must match your actual domain.">
              <input className="form-input" defaultValue="https://smartchoiceconstructions.com" style={{ fontFamily: "monospace" }} />
            </Field>
            <Field label="Robots.txt Rules">
              <textarea className="form-input" rows={6} style={{ fontFamily: "monospace", fontSize: "0.875rem", resize: "vertical" }} defaultValue={`User-Agent: *\nAllow: /\nDisallow: /dashboard/\nDisallow: /admin/\n\nSitemap: https://smartchoiceconstructions.com/sitemap.xml`} />
            </Field>
            <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer" }}>
              <input type="checkbox" defaultChecked style={{ accentColor: "var(--navy)", width: "18px", height: "18px" }} />
              <div>
                <div style={{ fontWeight: 600, color: "var(--navy)", fontSize: "0.9375rem" }}>Auto-generate sitemap</div>
                <div style={{ fontSize: "0.8125rem", color: "var(--gray-400)" }}>Rebuilds sitemap on every deployment. Includes all pages, states, cities, and contractor profiles.</div>
              </div>
            </label>
          </Section>
          <SaveBar tab="SEO" />
        </div>
      )}

      {/* ── SECURITY ── */}
      {tab === "security" && (
        <div>
          <Section title="Admin Access" desc="Protect the admin panel from unauthorized access.">
            <Field label="Admin Password" hint="Used for HTTP Basic Auth on /admin/* routes when deploying to Netlify.">
              <input className="form-input" type="password" placeholder="Current password hidden" />
            </Field>
            <Field label="Allowed Admin IPs" hint="Leave blank to allow all IPs. Enter one IP per line to restrict access.">
              <textarea className="form-input" rows={4} placeholder="203.0.113.1&#10;198.51.100.0/24" style={{ fontFamily: "monospace", fontSize: "0.875rem" }} />
            </Field>
          </Section>

          <Section title="Rate Limiting" desc="Protects forms and API endpoints from abuse.">
            {[
              ["Quote requests per IP per hour",  "20",  "Prevents spam quote submissions"],
              ["Login attempts per IP per 15 min","5",   "Prevents brute-force attacks"],
              ["Registration attempts per IP/day", "3",   "Prevents fake account creation"],
              ["Document uploads per contractor/day","10","Prevents upload abuse"],
            ].map(([label, def, hint]) => (
              <Field key={label} label={label} hint={hint}>
                <input className="form-input" type="number" defaultValue={def} style={{ width: "120px" }} />
              </Field>
            ))}
          </Section>

          <Section title="Content Security" desc="Upload and content restrictions.">
            <Field label="Max upload file size (MB)">
              <input className="form-input" type="number" defaultValue="10" style={{ width: "120px" }} />
            </Field>
            <Field label="Allowed file types for documents" hint="Comma-separated MIME types.">
              <input className="form-input" defaultValue="application/pdf,image/jpeg,image/png" style={{ fontFamily: "monospace" }} />
            </Field>
            <Field label="Allowed file types for photos">
              <input className="form-input" defaultValue="image/jpeg,image/png,image/webp" style={{ fontFamily: "monospace" }} />
            </Field>
          </Section>
          <SaveBar tab="Security" />
        </div>
      )}
    </div>
  );
}
