"use client";
import Link from "next/link";
import { useState } from "react";
import { COMPANY, CATEGORIES } from "@/lib/data";

const CONTRACTOR_BENEFITS = [
  {
    icon: "📨",
    title: "Qualified Leads Delivered to You",
    desc: "Homeowners in your area submit project requests and you get notified instantly. No cold calls, no chasing leads — they come to you.",
  },
  {
    icon: "🏆",
    title: "Verified Badge = More Trust",
    desc: "Upload your license, insurance, and background check once. We display verified badges on your profile so homeowners choose you with confidence.",
  },
  {
    icon: "📊",
    title: "Full Business Dashboard",
    desc: "Manage your availability, update your profile, track quote requests and reviews — all in one place, on any device.",
  },
  {
    icon: "⭐",
    title: "Build Your Reputation",
    desc: "Collect reviews from real clients. Contractors with 4.8+ ratings get featured placement and rank higher in search results.",
  },
  {
    icon: "📍",
    title: "Multi-State Coverage",
    desc: "Serve multiple cities and states from one account. Expand your service area without creating new profiles.",
  },
  {
    icon: "💳",
    title: "Simple, Cancel-Anytime Pricing",
    desc: `Start for just $${COMPANY.pricing.firstMonth.toFixed(2)} your first month, then $${COMPANY.pricing.monthly.toFixed(2)}/month. No long-term contract. Cancel any time.`,
  },
];

const SUPPLIER_BENEFITS = [
  {
    icon: "🔍",
    title: "Get Found by Local Contractors",
    desc: "Thousands of contractors use our platform to find materials, equipment, and supplies. Your business shows up exactly when they need you.",
  },
  {
    icon: "🗺️",
    title: "Category-Specific Listings",
    desc: "We organize suppliers by category — lumber, electrical, HVAC, roofing, and 25+ more — so the right contractors find you instantly.",
  },
  {
    icon: "🖼️",
    title: "Full Business Profile",
    desc: "Add your logo, description, location, contact info, and website. Your profile is always up-to-date and searchable.",
  },
  {
    icon: "📱",
    title: "Mobile-First Experience",
    desc: "Contractors often search from the job site. Your listing looks great on any screen size.",
  },
];

const FAQS = [
  {
    q: "How long does it take to get my profile live?",
    a: "After you register and pay, your profile goes live within 24 hours once our team reviews your documents. Most profiles are approved the same day.",
  },
  {
    q: "What happens after someone submits a quote request?",
    a: "You receive an email notification immediately. Log into your dashboard to see the full request details including the homeowner's description, budget, and contact information.",
  },
  {
    q: "Can I pause my account if I'm busy?",
    a: "Yes — set your availability to 'Busy' or 'Not Accepting Projects' from your dashboard. You'll stay in the directory but homeowners will see your current status.",
  },
  {
    q: "Do I have to commit to a long-term contract?",
    a: "No. Your subscription is month-to-month. Cancel anytime from your billing portal with no penalties or fees.",
  },
  {
    q: "What areas do you serve?",
    a: "We serve all 48 contiguous US states. You can list your primary service area and add additional states or cities as needed.",
  },
  {
    q: "I'm a supplier, not a contractor — how do I join?",
    a: "Suppliers have a separate, free listing program. Click 'Join as Supplier' below to apply.",
  },
];

function FAQ({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid var(--gray-100)", paddingBottom: "1rem", marginBottom: "1rem" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: "100%", background: "none", border: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", padding: "0.25rem 0", fontFamily: "inherit" }}
      >
        <span style={{ fontWeight: 600, color: "var(--navy)", fontSize: "1rem", textAlign: "left", lineHeight: 1.4 }}>{q}</span>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.25s" }}>
          <path d="M5 7.5l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      {open && (
        <p style={{ color: "var(--gray-600)", fontSize: "0.9375rem", lineHeight: 1.75, marginTop: "0.75rem", paddingLeft: "0" }}>{a}</p>
      )}
    </div>
  );
}

const POPULAR_CATS = CATEGORIES.slice(0, 9);

export default function ForProvidersPage() {
  return (
    <div style={{ paddingTop: "76px" }}>

      {/* ── HERO ── */}
      <section style={{ background: "linear-gradient(155deg, #0a1829 0%, var(--navy) 60%, #1e3a5f 100%)", padding: "5rem 0 6rem", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 80% 40%, rgba(199,25,26,0.15) 0%, transparent 60%)", pointerEvents: "none" }} />
        <div className="container" style={{ position: "relative", textAlign: "center", maxWidth: "780px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(199,25,26,0.15)", border: "1px solid rgba(199,25,26,0.3)", borderRadius: "999px", padding: "0.375rem 1rem", marginBottom: "2rem" }}>
            <span style={{ fontSize: "0.8125rem", color: "#fca5a5", fontWeight: 600 }}>For Contractors & Suppliers</span>
          </div>
          <h1 style={{ fontSize: "clamp(2.25rem,5vw,3.5rem)", fontWeight: 900, color: "white", lineHeight: 1.1, marginBottom: "1.5rem" }}>
            Grow Your Business.<br />
            <span style={{ color: "#93c5fd" }}>We Bring the Customers.</span>
          </h1>
          <p style={{ fontSize: "1.1875rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: "2.5rem", maxWidth: "580px", margin: "0 auto 2.5rem" }}>
            Join thousands of contractors and suppliers on Smart Choice Constructions — America's fastest-growing marketplace connecting pros with homeowners who are ready to hire.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/join" style={{ background: "var(--red)", color: "white", fontWeight: 700, fontSize: "1rem", padding: "0.875rem 2rem", borderRadius: "var(--radius)", textDecoration: "none", transition: "opacity 0.15s" }}
              onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.opacity = "0.88"}
              onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.opacity = "1"}
            >
              Join as Contractor — ${COMPANY.pricing.firstMonth.toFixed(2)} First Month
            </Link>
            <Link href="/join/supplier" style={{ background: "rgba(255,255,255,0.1)", color: "white", fontWeight: 700, fontSize: "1rem", padding: "0.875rem 2rem", borderRadius: "var(--radius)", textDecoration: "none", border: "1px solid rgba(255,255,255,0.2)", transition: "background 0.15s" }}
              onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.18)"}
              onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.1)"}
            >
              Join as Supplier — Free
            </Link>
          </div>
          {/* Trust row */}
          <div style={{ display: "flex", justifyContent: "center", gap: "2rem", marginTop: "2.5rem", flexWrap: "wrap" }}>
            {["No long-term contract", "Cancel anytime", "Set up in 10 minutes"].map(t => (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "rgba(255,255,255,0.7)", fontSize: "0.875rem" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round"><path d="M5 13l4 4L19 7"/></svg>
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ background: "white", borderBottom: "1px solid var(--gray-100)", padding: "3rem 0" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "2rem", textAlign: "center" }}>
            {[
              { value: "60+",    label: "Service Categories" },
              { value: "48",     label: "States Covered" },
              { value: "$29.90", label: "First Month Price" },
              { value: "4.8★",   label: "Average Contractor Rating" },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontSize: "2.25rem", fontWeight: 900, color: "var(--navy)", marginBottom: "0.375rem" }}>{s.value}</div>
                <div style={{ fontSize: "0.9375rem", color: "var(--gray-500)", fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTRACTOR BENEFITS ── */}
      <section style={{ padding: "5rem 0", background: "var(--gray-50)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <span style={{ display: "inline-block", background: "rgba(199,25,26,0.08)", color: "var(--red)", fontWeight: 700, fontSize: "0.8125rem", letterSpacing: "0.08em", textTransform: "uppercase", padding: "0.375rem 1rem", borderRadius: "999px", marginBottom: "1rem" }}>For Contractors</span>
            <h2 style={{ fontSize: "clamp(1.75rem,3.5vw,2.5rem)", fontWeight: 800, color: "var(--navy)", marginBottom: "0.875rem" }}>Everything You Need to Win More Jobs</h2>
            <p style={{ color: "var(--gray-500)", fontSize: "1.0625rem", maxWidth: "560px", margin: "0 auto" }}>
              We handle the marketing. You handle the work. It's that simple.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: "1.5rem" }}>
            {CONTRACTOR_BENEFITS.map(b => (
              <div key={b.title} className="card" style={{ padding: "1.875rem" }}>
                <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>{b.icon}</div>
                <h3 style={{ fontWeight: 700, color: "var(--navy)", fontSize: "1.0625rem", marginBottom: "0.75rem" }}>{b.title}</h3>
                <p style={{ color: "var(--gray-600)", lineHeight: 1.7, fontSize: "0.9375rem", margin: 0 }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: "5rem 0", background: "white" }}>
        <div className="container" style={{ maxWidth: "800px" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <h2 style={{ fontSize: "clamp(1.75rem,3.5vw,2.5rem)", fontWeight: 800, color: "var(--navy)", marginBottom: "0.875rem" }}>How It Works for Contractors</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
            {[
              { step: "1", title: "Create Your Profile", desc: "Register your business, upload your credentials, and set your service area in under 10 minutes." },
              { step: "2", title: "Get Matched with Homeowners", desc: "When homeowners search in your area, your profile appears. They can request quotes directly from your listing." },
              { step: "3", title: "Receive Quote Requests", desc: "You get notified instantly via email. Log in to see the full project description, budget, and contact info." },
              { step: "4", title: "Win the Job", desc: "Contact the homeowner, send your quote, and grow your business with every 5-star review you earn." },
            ].map(s => (
              <div key={s.step} style={{ display: "flex", gap: "1.75rem", alignItems: "flex-start" }}>
                <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "var(--red)", color: "white", fontWeight: 800, fontSize: "1.25rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{s.step}</div>
                <div>
                  <h3 style={{ fontWeight: 700, color: "var(--navy)", fontSize: "1.125rem", marginBottom: "0.5rem" }}>{s.title}</h3>
                  <p style={{ color: "var(--gray-600)", lineHeight: 1.7, fontSize: "0.9375rem", margin: 0 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICE CATEGORIES ── */}
      <section style={{ padding: "5rem 0", background: "var(--gray-50)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2 style={{ fontSize: "clamp(1.75rem,3vw,2.25rem)", fontWeight: 800, color: "var(--navy)", marginBottom: "0.875rem" }}>60+ Service Categories</h2>
            <p style={{ color: "var(--gray-500)", fontSize: "1rem" }}>We match homeowners with the right specialist for every project type.</p>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", justifyContent: "center", marginBottom: "2rem" }}>
            {POPULAR_CATS.map(cat => (
              <div key={cat.id} style={{ background: "white", border: "1.5px solid var(--gray-150)", borderRadius: "var(--radius)", padding: "0.625rem 1.125rem", fontSize: "0.9375rem", fontWeight: 500, color: "var(--gray-700)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span>{cat.icon}</span> {cat.name}
              </div>
            ))}
            <div style={{ background: "var(--navy)", border: "1.5px solid var(--navy)", borderRadius: "var(--radius)", padding: "0.625rem 1.125rem", fontSize: "0.9375rem", fontWeight: 600, color: "white" }}>
              + 50 more
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section style={{ padding: "5rem 0", background: "white" }}>
        <div className="container" style={{ maxWidth: "600px", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(1.75rem,3.5vw,2.5rem)", fontWeight: 800, color: "var(--navy)", marginBottom: "0.75rem" }}>Simple, Transparent Pricing</h2>
          <p style={{ color: "var(--gray-500)", marginBottom: "2.5rem", fontSize: "1.0625rem" }}>One plan. Everything included. No hidden fees.</p>
          <div className="card" style={{ padding: "2.5rem", border: "2px solid var(--navy)" }}>
            <div style={{ display: "inline-block", background: "var(--red)", color: "white", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase", padding: "0.25rem 0.875rem", borderRadius: "999px", marginBottom: "1.5rem" }}>Limited Intro Offer</div>
            <div style={{ fontSize: "3.5rem", fontWeight: 900, color: "var(--navy)", lineHeight: 1, marginBottom: "0.25rem" }}>${COMPANY.pricing.firstMonth.toFixed(2)}</div>
            <div style={{ color: "var(--gray-500)", marginBottom: "0.25rem" }}>first month</div>
            <div style={{ color: "var(--gray-400)", fontSize: "0.875rem", marginBottom: "2rem" }}>then ${COMPANY.pricing.monthly.toFixed(2)}/month · cancel anytime</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "2rem", textAlign: "left" }}>
              {[
                "Verified profile in the directory",
                "Unlimited quote requests",
                "Photo gallery (up to 10 photos)",
                "Availability & schedule management",
                "Review collection and responses",
                "Multi-city and multi-state coverage",
                "Document verification (license, insurance)",
                "Email notifications for new leads",
              ].map(f => (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.9375rem", color: "var(--gray-700)" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round"><path d="M5 13l4 4L19 7"/></svg>
                  {f}
                </div>
              ))}
            </div>
            <Link href="/join" className="btn-red" style={{ display: "block", textAlign: "center", fontSize: "1rem", padding: "1rem 2rem" }}>
              Get Started Today →
            </Link>
          </div>
        </div>
      </section>

      {/* ── SUPPLIER SECTION ── */}
      <section style={{ padding: "5rem 0", background: "linear-gradient(135deg, var(--navy-dark) 0%, var(--navy) 100%)" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center" }} className="hero-grid">
            <div>
              <span style={{ display: "inline-block", background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.85)", fontWeight: 600, fontSize: "0.8125rem", letterSpacing: "0.07em", textTransform: "uppercase", padding: "0.375rem 1rem", borderRadius: "999px", marginBottom: "1.5rem" }}>For Suppliers</span>
              <h2 style={{ fontSize: "clamp(1.75rem,3.5vw,2.5rem)", fontWeight: 800, color: "white", marginBottom: "1rem", lineHeight: 1.2 }}>
                Be Where Contractors Shop
              </h2>
              <p style={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.75, fontSize: "1.0625rem", marginBottom: "2rem" }}>
                Contractors using Smart Choice are always looking for reliable local suppliers. List your business for free and get discovered by pros who need exactly what you sell.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2.5rem" }}>
                {SUPPLIER_BENEFITS.map(b => (
                  <div key={b.title} style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                    <div style={{ fontSize: "1.5rem", flexShrink: 0, marginTop: "0.1rem" }}>{b.icon}</div>
                    <div>
                      <div style={{ fontWeight: 700, color: "white", marginBottom: "0.25rem" }}>{b.title}</div>
                      <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9375rem", lineHeight: 1.6 }}>{b.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/join/supplier" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "white", color: "var(--navy)", fontWeight: 700, fontSize: "0.9375rem", padding: "0.875rem 1.75rem", borderRadius: "var(--radius)", textDecoration: "none" }}>
                Join as Supplier — Free
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
            </div>
            <div className="hide-mobile" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {[
                { cat: "🧱 Building Materials", n: "Lumber yards, concrete, masonry" },
                { cat: "⚡ Electrical Supplies", n: "Wire, panels, fixtures" },
                { cat: "🚰 Plumbing Supplies",   n: "Pipes, fittings, fixtures" },
                { cat: "❄️ HVAC Supplies",       n: "AC units, ductwork, thermostats" },
                { cat: "🪵 Flooring Stores",     n: "Hardwood, tile, carpet, LVP" },
              ].map(item => (
                <div key={item.cat} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "var(--radius)", padding: "1rem 1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 600, color: "white", fontSize: "0.9375rem" }}>{item.cat}</span>
                  <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8125rem" }}>{item.n}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ padding: "5rem 0", background: "white" }}>
        <div className="container" style={{ maxWidth: "720px" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2 style={{ fontSize: "clamp(1.75rem,3.5vw,2.25rem)", fontWeight: 800, color: "var(--navy)", marginBottom: "0.75rem" }}>Frequently Asked Questions</h2>
            <p style={{ color: "var(--gray-500)", fontSize: "1rem" }}>Still have questions? Email us at <a href={`mailto:${COMPANY.email}`} style={{ color: "var(--navy)", fontWeight: 600 }}>{COMPANY.email}</a></p>
          </div>
          <div>
            {FAQS.map(faq => <FAQ key={faq.q} {...faq} />)}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section style={{ background: "var(--red)", padding: "4rem 0", textAlign: "center" }}>
        <div className="container">
          <h2 style={{ fontSize: "clamp(1.75rem,3.5vw,2.25rem)", fontWeight: 800, color: "white", marginBottom: "0.875rem" }}>Ready to Grow Your Business?</h2>
          <p style={{ color: "rgba(255,255,255,0.8)", marginBottom: "2rem", fontSize: "1.0625rem" }}>Join the platform homeowners trust. Your first month is just ${COMPANY.pricing.firstMonth.toFixed(2)}.</p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/join" style={{ background: "white", color: "var(--red)", fontWeight: 800, fontSize: "1rem", padding: "0.875rem 2rem", borderRadius: "var(--radius)", textDecoration: "none" }}>
              Join as Contractor →
            </Link>
            <Link href="/join/supplier" style={{ background: "rgba(255,255,255,0.15)", color: "white", fontWeight: 700, fontSize: "1rem", padding: "0.875rem 2rem", borderRadius: "var(--radius)", textDecoration: "none", border: "1px solid rgba(255,255,255,0.3)" }}>
              Join as Supplier — Free
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
