"use client";
import { useState } from "react";

interface Section {
  id: string;
  icon: string;
  title: string;
  summary: string;
  items: { q: string; a: string }[];
}

const SECTIONS: Section[] = [
  {
    id: "dashboard",
    icon: "📊",
    title: "Dashboard",
    summary: "Overview of key platform metrics in real time.",
    items: [
      { q: "What do the dashboard numbers show?", a: "Active contractors, total homeowners, monthly revenue, open disputes, and pending reviews. All figures pull live from Supabase — refresh the page to update." },
      { q: "Why is revenue $0?", a: "Revenue reflects processed Stripe payments. If Stripe webhooks are not yet configured or no subscription has completed a billing cycle, the total will be zero." },
    ],
  },
  {
    id: "contractors",
    icon: "👷",
    title: "Contractors",
    summary: "View, search, suspend, or approve contractor accounts.",
    items: [
      { q: "How do I approve a contractor?", a: "Open the contractor's row, click the status badge to change it from 'pending' to 'active'. This immediately makes their profile visible to homeowners." },
      { q: "How do I suspend a contractor?", a: "Change their status to 'suspended'. Their public profile returns a 404 and they cannot receive new leads. Existing subscription charges continue until cancelled in Stripe." },
      { q: "Can I edit a contractor's profile?", a: "Admin can view all profile fields but direct editing is intentionally locked — contractors own their data. Use the Notes field to flag issues, then contact the contractor." },
      { q: "What is the 'verified' badge?", a: "Manual verification that the contractor has submitted and passed a license + insurance check. Toggle it from the contractor detail view." },
    ],
  },
  {
    id: "suppliers",
    icon: "🏢",
    title: "Suppliers",
    summary: "Manage supplier listings visible in the Suppliers directory.",
    items: [
      { q: "How do I add a supplier?", a: "Use the '+ Add Supplier' button. Fill in name, category, location, contact, and description. Suppliers are immediately visible once saved." },
      { q: "How do I feature a supplier?", a: "Toggle the 'Featured' switch on the supplier row. Featured suppliers appear at the top of the directory and on the homepage Suppliers section." },
      { q: "Can homeowners contact suppliers directly?", a: "Yes. Each supplier profile shows a contact form and their website link. Inquiries go directly to the supplier's email." },
    ],
  },
  {
    id: "subscriptions",
    icon: "💳",
    title: "Subscriptions",
    summary: "Monitor contractor subscription status and billing via Stripe.",
    items: [
      { q: "Where do subscription records come from?", a: "From Stripe webhooks. When a contractor subscribes, Stripe fires an event and the platform saves it to Supabase. No manual entry is needed." },
      { q: "How do I cancel a subscription?", a: "Navigate to the Stripe dashboard for immediate cancellation or refund. The platform will sync the status automatically on the next webhook event." },
      { q: "What subscription tiers exist?", a: "Basic ($29/mo), Professional ($79/mo), and Enterprise ($199/mo). Tier determines how many photos, how much profile detail, and whether the contractor appears in featured search results." },
    ],
  },
  {
    id: "blog-faq",
    icon: "📝",
    title: "Blog & FAQ",
    summary: "Create and manage blog posts and FAQ entries that appear on the public site.",
    items: [
      { q: "How do I publish a new blog post?", a: "Go to Content > Blog & FAQ, click '+ New Post', fill in title, slug (URL-friendly ID), excerpt, category, and content. Toggle 'Published' on. The post appears at /blog and /blog/[slug] immediately." },
      { q: "What format should the content field use?", a: "Plain text. Separate sections with a blank line (double newline). The first paragraph becomes the intro. Subsequent paragraphs become numbered sections (Part 1, Part 2…)." },
      { q: "Can I override a built-in static post?", a: "Yes. Create a dynamic post with the exact same slug as a static one. The dynamic version takes precedence on the public blog." },
      { q: "How do FAQ items work?", a: "FAQ items saved here appear on the /faq public page. Static items (from code) can be hidden but not deleted. Custom items have full CRUD." },
      { q: "Where is content stored?", a: "Blog posts under the 'blog_posts' key and FAQ under 'faq_items' in the platform_settings table (Supabase). No separate table needed." },
    ],
  },
  {
    id: "categories",
    icon: "🔧",
    title: "Service Categories",
    summary: "Control which service categories appear in search filters and the homepage grid.",
    items: [
      { q: "Can I delete a built-in category?", a: "No. Built-in (static) categories can only be hidden. Hiding removes them from the homepage grid and all search filters. Contractor listings in that category are preserved." },
      { q: "How do I add a custom category?", a: "Click '+ Add Category', enter a name, emoji icon, color, and display order. The category becomes available for contractors to select and appears in public search." },
      { q: "What is the 'order' field?", a: "Categories sort ascending by order number. Lower numbers appear first in the grid. Default categories start at 0–11; custom ones default to 99." },
    ],
  },
  {
    id: "locations",
    icon: "📍",
    title: "Locations",
    summary: "Configure which US states and cities are active and featured on the platform.",
    items: [
      { q: "What does 'active' vs 'featured' mean for states?", a: "Active states appear in search filters and SEO landing pages. Featured states are highlighted on the homepage location section and sorted to the top." },
      { q: "How do I add a city to a state?", a: "Switch to the Cities tab, select the state in the left panel, then click '+ Add City'. Custom cities can be deleted; default cities can only be toggled." },
      { q: "Do changes take effect immediately?", a: "Yes. Locations are saved to the database on every toggle — there is no manual Save button. A 'Saving…' indicator confirms the write." },
    ],
  },
  {
    id: "campaigns",
    icon: "🎯",
    title: "Campaigns",
    summary: "Create and manage marketing campaigns with coupon codes, email blasts, or banner promotions.",
    items: [
      { q: "How do I create a campaign?", a: "Click '+ New Campaign', fill in name, type (discount/email/banner/feature), target audience, optional coupon code, start and end dates, and description. It saves as a draft." },
      { q: "How do I activate a campaign?", a: "Click 'Launch' on a draft campaign. It moves to 'active' status. Click 'End' to stop it early." },
      { q: "How do I duplicate a campaign?", a: "Click the 'Duplicate' button on any campaign. A copy is created as a draft with '(copy)' appended to the name and stats reset to zero." },
      { q: "Where are coupon codes enforced?", a: "Currently tracked here for reference. Actual discount logic must be wired in the checkout/Stripe integration if needed." },
    ],
  },
  {
    id: "email-templates",
    icon: "📧",
    title: "Email Templates",
    summary: "Edit transactional email templates for system-triggered notifications.",
    items: [
      { q: "How do I edit a template?", a: "Click on any template card, then click 'Edit'. Modify the Subject, Preview Text, and Body. Click 'Save Changes'. The template is persisted to the database immediately." },
      { q: "What are template variables?", a: "Variables like {{contractor_name}} or {{subscription_plan}} are placeholders replaced at send time. Click any variable chip while editing to insert it at the end of the body." },
      { q: "Are emails actually sent from here?", a: "The templates store the copy. Sending requires an email provider (Resend, SendGrid, etc.) wired to the API. Templates here define what gets sent, not the delivery mechanism." },
      { q: "How many templates are there?", a: "11 templates: Welcome Contractor, Welcome Homeowner, Subscription Confirmed, Payment Failed, Profile Approved, New Lead Alert, Review Received, Profile Incomplete, Password Reset, Weekly Digest, and Subscription Cancelled." },
    ],
  },
  {
    id: "notifications",
    icon: "🔔",
    title: "Notifications",
    summary: "Push in-platform notification banners to contractors and homeowners.",
    items: [
      { q: "How do I send a notification?", a: "Click '+ New Notification', fill in the title, message, target audience, and type (info/warning/success/error). Toggle 'Active' and save. It appears in the target user's notification feed." },
      { q: "How long do notifications stay active?", a: "Until manually deactivated or the expiry date (if set) passes. Toggle the Active switch at any time." },
    ],
  },
  {
    id: "coupons",
    icon: "🎟️",
    title: "Coupons",
    summary: "Create discount coupon codes redeemable at checkout.",
    items: [
      { q: "What discount types are supported?", a: "Percentage (e.g. 20%) and fixed amount (e.g. $10 off). Set a max uses limit to cap redemptions." },
      { q: "How do I deactivate a coupon?", a: "Toggle the Active switch on any coupon row. Inactive coupons cannot be redeemed even if the code is known." },
    ],
  },
  {
    id: "reports",
    icon: "📈",
    title: "Reports",
    summary: "Analyze revenue, contractor growth, homeowner sign-ups, and CRM interactions.",
    items: [
      { q: "What tabs are in Reports?", a: "Overview (platform KPIs), Revenue (billing trends), Contractors (sign-up cohorts), Homeowners (search activity), and CRM (contact/interaction log)." },
      { q: "How do I export data?", a: "Go to Exports in the sidebar. Download any dataset (contractors, homeowners, subscriptions, reports) as CSV or JSON." },
    ],
  },
  {
    id: "feature-flags",
    icon: "🚩",
    title: "Feature Flags",
    summary: "Enable or disable platform features without a code deploy.",
    items: [
      { q: "What can I toggle with feature flags?", a: "Features like 'AI Recommendations', 'Supplier Directory', 'Free Trial', 'Referral Program', and others. Each flag is a boolean stored in the database." },
      { q: "Do changes take effect immediately?", a: "Yes. The flags table is read on every relevant page load. No server restart needed." },
    ],
  },
  {
    id: "settings",
    icon: "⚙️",
    title: "Platform Settings",
    summary: "Edit global configuration: site name, contact email, feature toggles, and SEO defaults.",
    items: [
      { q: "Where are settings stored?", a: "In the platform_settings Supabase table under various keys. Changes via the Settings UI persist immediately." },
      { q: "Can I change the admin email here?", a: "No. Admin credentials and authentication emails are managed directly in Supabase Auth. Do not change them here." },
    ],
  },
  {
    id: "permissions",
    icon: "🔐",
    title: "Permissions",
    summary: "Reference matrix showing which admin roles can access which features.",
    items: [
      { q: "Can I edit role permissions from here?", a: "The matrix is read-only by design. Role assignments are managed in code (middleware) and Supabase RLS policies. Contact a developer to add or remove permissions." },
      { q: "What roles exist?", a: "Super Admin (full access), Content Manager (content/blog/FAQ only), Support Agent (contractors/homeowners/reviews, no billing), and Billing Admin (subscriptions/reports, no content)." },
    ],
  },
  {
    id: "audit-logs",
    icon: "📋",
    title: "Audit Logs",
    summary: "Read-only log of all admin actions for compliance and debugging.",
    items: [
      { q: "What actions are logged?", a: "Contractor status changes, settings updates, coupon creation/deletion, subscription cancellations, and content publishes. Each entry includes admin user ID, action, and timestamp." },
      { q: "How long are logs retained?", a: "Indefinitely (until manually purged). Filter by date range or action type to narrow results." },
    ],
  },
];

export default function HelpPage() {
  const [active, setActive] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = SECTIONS.filter(s =>
    search === "" ||
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.items.some(i => i.q.toLowerCase().includes(search.toLowerCase()) || i.a.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ maxWidth: "900px" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.625rem", fontWeight: 800, color: "var(--navy)", marginBottom: "0.25rem" }}>Admin Manual</h1>
        <p style={{ color: "var(--gray-500)", fontSize: "0.9375rem" }}>
          Reference guide for every section of the Smart Choice admin panel.
        </p>
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: "1.75rem" }}>
        <div style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        </div>
        <input
          placeholder="Search documentation…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="form-input"
          style={{ paddingLeft: "2.75rem", fontSize: "0.9375rem" }}
        />
      </div>

      {/* Quick nav */}
      {search === "" && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "2rem" }}>
          {SECTIONS.map(s => (
            <a
              key={s.id}
              href={`#${s.id}`}
              onClick={e => { e.preventDefault(); document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth" }); setActive(s.id); }}
              style={{
                display: "inline-flex", alignItems: "center", gap: "0.375rem",
                padding: "0.375rem 0.875rem", borderRadius: "999px",
                background: active === s.id ? "var(--navy)" : "white",
                color: active === s.id ? "white" : "var(--gray-600)",
                border: `1.5px solid ${active === s.id ? "var(--navy)" : "var(--gray-200)"}`,
                fontSize: "0.8125rem", fontWeight: 600, cursor: "pointer", textDecoration: "none",
                transition: "all 0.15s",
              }}
            >
              <span>{s.icon}</span>{s.title}
            </a>
          ))}
        </div>
      )}

      {/* Sections */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {filtered.map(section => {
          const matchingItems = search
            ? section.items.filter(i => i.q.toLowerCase().includes(search.toLowerCase()) || i.a.toLowerCase().includes(search.toLowerCase()))
            : section.items;

          return (
            <div key={section.id} id={section.id} className="card" style={{ overflow: "hidden" }}>
              <div
                style={{ padding: "1.25rem 1.5rem", background: "var(--gray-50)", borderBottom: "1px solid var(--gray-150)", display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer" }}
                onClick={() => setActive(active === section.id ? null : section.id)}
              >
                <span style={{ fontSize: "1.375rem" }}>{section.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, color: "var(--navy)", fontSize: "1rem" }}>{section.title}</div>
                  <div style={{ fontSize: "0.8125rem", color: "var(--gray-500)" }}>{section.summary}</div>
                </div>
                <span style={{ color: "var(--gray-400)", fontSize: "1rem", fontWeight: 700, transition: "transform 0.2s", display: "inline-block", transform: active === section.id || search !== "" ? "rotate(90deg)" : "none" }}>▶</span>
              </div>

              {(active === section.id || search !== "") && (
                <div>
                  {matchingItems.map((item, i) => (
                    <div key={i} style={{ padding: "1.125rem 1.5rem", borderBottom: i < matchingItems.length - 1 ? "1px solid var(--gray-50)" : "none" }}>
                      <div style={{ fontWeight: 700, color: "var(--navy)", fontSize: "0.9rem", marginBottom: "0.5rem", display: "flex", gap: "0.625rem" }}>
                        <span style={{ color: "var(--red)", flexShrink: 0 }}>Q:</span>
                        <span>{item.q}</span>
                      </div>
                      <div style={{ fontSize: "0.875rem", color: "var(--gray-600)", lineHeight: 1.7, paddingLeft: "1.5rem" }}>
                        {item.a}
                      </div>
                    </div>
                  ))}
                  {matchingItems.length === 0 && (
                    <div style={{ padding: "1.25rem 1.5rem", color: "var(--gray-400)", fontSize: "0.875rem" }}>No matches in this section.</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--gray-400)" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>🔍</div>
          <div style={{ fontWeight: 600 }}>No results for &ldquo;{search}&rdquo;</div>
          <div style={{ fontSize: "0.875rem", marginTop: "0.375rem" }}>Try a different keyword or browse the sections above.</div>
        </div>
      )}

      <div style={{ marginTop: "2.5rem", padding: "1.25rem 1.5rem", background: "rgba(22,46,94,0.04)", borderRadius: "var(--radius)", border: "1px solid var(--gray-150)" }}>
        <div style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "0.375rem" }}>Need more help?</div>
        <p style={{ fontSize: "0.875rem", color: "var(--gray-600)", lineHeight: 1.65 }}>
          For technical issues (database, API errors, Stripe webhooks), check the Supabase dashboard logs and Vercel function logs.
          For billing disputes, use the Stripe dashboard directly. Do not modify environment variables or Supabase auth users from within this panel.
        </p>
      </div>
    </div>
  );
}
