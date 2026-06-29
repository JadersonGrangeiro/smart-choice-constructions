"use client";
import { useState } from "react";
import { SUPPLIER_CATEGORIES, MOCK_SUPPLIERS } from "@/lib/supplier-data";
import Link from "next/link";
import { BadgeChip, BadgeGrid, BadgeCard } from "./BadgeDisplay";
import { GalleryGrid } from "./Lightbox";
import type { BadgeId } from "@/lib/badges";
import { CONTRACTOR_EXTENDED } from "@/lib/data";

interface ContractorData {
  id: string; company: string; name: string; category: string;
  location: string; rating: number; reviews: number; yearsExp: number;
  verified: boolean; insured: boolean; licensed: boolean;
  phone: string; description: string;
  services: string[]; responseTime: string;
}

interface ExtendedData {
  team:              { name: string; role: string; yearsExp: number }[];
  certifications:    { name: string; issuer: string; year: number }[];
  brands:            string[];
  languages:         string[];
  paymentMethods:    string[];
  videos:            { platform: "youtube" | "vimeo"; id: string; title: string }[];
  preferredSuppliers:{ name: string; category: string; website?: string }[];
  monthlyStats:      { month: string; profileViews: number; leads: number; revenue: number; rankScore: number }[];
}

interface Props {
  contractor:         ContractorData;
  earnedBadges:       BadgeId[];
  relatedContractors: ContractorData[];
  categoryData?:      { id: string; name: string; icon: string } | null;
  extended?:          ExtendedData | null;
}

function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div style={{ display: "flex", gap: "2px" }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24"
          fill={i <= Math.round(rating) ? "#f59e0b" : "#e2e8f0"}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </div>
  );
}

function RatingBar({ label, score }: { label: string; score: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.625rem" }}>
      <span style={{ fontSize: "0.875rem", color: "var(--gray-600)", width: "110px", flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: "6px", background: "var(--gray-100)", borderRadius: "999px", overflow: "hidden" }}>
        <div style={{ height: "100%", background: "#f59e0b", borderRadius: "999px", width: `${score * 20}%` }} />
      </div>
      <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--navy)", width: "30px" }}>{score.toFixed(1)}</span>
    </div>
  );
}

function FaqItem({ q, a, isLast }: { q: string; a: string; isLast: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: isLast ? "none" : "1px solid var(--gray-100)" }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "1.125rem 0", background: "none", border: "none", cursor: "pointer",
        fontFamily: "inherit", fontSize: "1rem", fontWeight: 600, color: "var(--navy)",
        textAlign: "left", gap: "1rem",
      }}>
        {q}
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none"
          style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.3s", flexShrink: 0 }}>
          <path d="M5 7.5l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>
      {open && (
        <div style={{ paddingBottom: "1.125rem", color: "var(--gray-600)", lineHeight: 1.75, fontSize: "0.9375rem" }}>
          {a}
        </div>
      )}
    </div>
  );
}

/** Google Maps embed placeholder — replace src with real Maps Embed API URL in production */
function MapEmbed({ location }: { location: string }) {
  const query = encodeURIComponent(location);
  return (
    <div style={{ borderRadius: "var(--radius)", overflow: "hidden", height: "220px", position: "relative" }}>
      {/* Production: replace this div with an actual <iframe> using Google Maps Embed API */}
      {/* <iframe
        src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${query}`}
        width="100%" height="220" style={{ border: 0 }} allowFullScreen loading="lazy"
        referrerPolicy="no-referrer-when-downgrade" title={`Map showing ${location}`}
      /> */}
      <div style={{
        height: "100%", background: "linear-gradient(135deg, #e8f0fe, #c5d9f9)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: "0.75rem", cursor: "pointer",
      }}
        onClick={() => window.open(`https://maps.google.com/?q=${query}`, '_blank')}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4285F4" strokeWidth="1.5">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
          <circle cx="12" cy="10" r="3" fill="#4285F4" stroke="none"/>
        </svg>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontWeight: 700, color: "#1a73e8", fontSize: "0.9375rem" }}>{location}</div>
          <div style={{ fontSize: "0.8125rem", color: "#5f6368", marginTop: "0.25rem" }}>Click to open in Google Maps</div>
        </div>
      </div>
    </div>
  );
}

/** Video embed — YouTube or Vimeo */
function VideoEmbed({ platform, id, title }: { platform: "youtube" | "vimeo"; id: string; title: string }) {
  const [playing, setPlaying] = useState(false);
  const src = platform === "youtube"
    ? `https://www.youtube.com/embed/${id}?autoplay=1`
    : `https://player.vimeo.com/video/${id}?autoplay=1`;
  const thumb = platform === "youtube"
    ? `https://img.youtube.com/vi/${id}/hqdefault.jpg`
    : null;

  return (
    <div style={{ borderRadius: "var(--radius)", overflow: "hidden", aspectRatio: "16/9", position: "relative", background: "#000", cursor: "pointer" }}
      onClick={() => setPlaying(true)}>
      {playing ? (
        <iframe
          src={src}
          style={{ width: "100%", height: "100%", border: "none", display: "block" }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={title}
        />
      ) : (
        <>
          <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, var(--navy), #1c3875)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "1rem" }}>
            <div style={{ width: "64px", height: "64px", background: "rgba(255,255,255,0.9)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--navy)">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
            </div>
            <div style={{ color: "white", fontWeight: 600, fontSize: "0.9375rem", textAlign: "center", padding: "0 1.5rem" }}>{title}</div>
          </div>
        </>
      )}
    </div>
  );
}

export default function ContractorProfileClient({ contractor: c, earnedBadges, relatedContractors, categoryData, extended: extProp }: Props) {
  const [activeTab, setActiveTab] = useState<"overview"|"gallery"|"team"|"reviews"|"credentials">("overview");
  const [showAllBadges, setShowAllBadges] = useState(false);

  const ext = CONTRACTOR_EXTENDED[c.id] ?? {
    team: [], certifications: [], brands: [], languages: ["English"],
    paymentMethods: ["Cash", "Check", "Credit Card"], videos: [],
    preferredSuppliers: [], monthlyStats: [],
  };

  const portfolioImages = [
    { src: "gradient:linear-gradient(135deg,#162E5E,#1c3875)", alt: "Completed project — kitchen",    caption: "Full kitchen renovation, Austin TX" },
    { src: "gradient:linear-gradient(135deg,#1c3875,#243580)", alt: "Completed project — cabinetry",  caption: "Custom cabinetry installation" },
    { src: "gradient:linear-gradient(135deg,#243580,#162E5E)", alt: "Completed project — deck",       caption: "Deck addition with composite decking" },
    { src: "gradient:linear-gradient(135deg,#162E5E,#0d1f40)", alt: "Completed project — bathroom",   caption: "Master bathroom remodel" },
    { src: "gradient:linear-gradient(135deg,#0d1f40,#162E5E)", alt: "Completed project — living room",caption: "Open floor plan conversion" },
    { src: "gradient:linear-gradient(135deg,#1c3875,#162E5E)", alt: "Completed project — outdoor",    caption: "Outdoor kitchen build" },
  ];

  const beforeAfterImages = [
    { src: "gradient:linear-gradient(135deg,#6b7280,#374151)", alt: "Kitchen before", label: "Before", caption: "Original kitchen — 1990s layout" },
    { src: "gradient:linear-gradient(135deg,#162E5E,#1c3875)", alt: "Kitchen after",  label: "After",  caption: "Completed renovation — open concept" },
    { src: "gradient:linear-gradient(135deg,#78716c,#57534e)", alt: "Bathroom before",label: "Before", caption: "Original bathroom" },
    { src: "gradient:linear-gradient(135deg,#1c3875,#243580)", alt: "Bathroom after", label: "After",  caption: "Master bath renovation" },
  ];

  const reviews = [
    { name: "Michael T.", rating: 5, date: "May 2025",  project: "Kitchen Remodel",    text: "Outstanding work from start to finish. Professional crew, clean site, and the project came in under budget. I've already recommended them to two neighbors." },
    { name: "Sarah K.",   rating: 5, date: "April 2025",project: "Bathroom Renovation", text: "Incredible attention to detail. The team communicated at every stage and the workmanship is top tier. Our home looks completely transformed." },
    { name: "David R.",   rating: 4, date: "March 2025",project: "Deck Addition",       text: "Very professional and knowledgeable crew. There was a minor scheduling adjustment but they communicated proactively. Final result is excellent." },
    { name: "Maria C.",   rating: 5, date: "Feb 2025",  project: "Exterior Painting",  text: "I've worked with a lot of contractors over the years and this team stands out. Honest pricing, clean work, and they finished two days ahead of schedule." },
  ];

  const ratingBreakdown = [5,4,3,2,1].map(stars => ({
    stars,
    count: reviews.filter(r => r.rating === stars).length,
    pct:   Math.round(reviews.filter(r => r.rating === stars).length / reviews.length * 100),
  }));

  const faqItems = [
    { q: `Do you offer free estimates for ${c.category.toLowerCase()} work?`, a: "Yes. All estimates are free and come with no obligation. Contact us to schedule a walkthrough of your project." },
    { q: "What areas do you serve?",              a: `We primarily serve ${c.location} and surrounding communities within a 25-mile radius. Contact us for projects outside this range.` },
    { q: "How long does a typical project take?", a: "Timeline depends on the scope of work. We provide a detailed schedule during the estimate process and keep you updated throughout." },
    { q: "What forms of payment do you accept?",  a: ext.paymentMethods.join(", ") + "." },
    { q: "Are you licensed and insured?",          a: "Please check our Credentials tab for current documentation status. We always recommend homeowners independently verify credentials before hiring." },
  ];

  const totalGallery = portfolioImages.length + beforeAfterImages.length + ext.videos.length;

  const tabs = [
    { key: "overview",     label: "Overview" },
    { key: "gallery",      label: `Gallery (${totalGallery})` },
    { key: "team",         label: `Team${ext.team.length > 0 ? ` (${ext.team.length})` : ""}` },
    { key: "reviews",      label: `Reviews (${c.reviews})` },
    { key: "credentials",  label: "Credentials" },
  ] as const;

  return (
    <div style={{ paddingTop: "76px" }}>
      {/* ── Cover image ── */}
      <div style={{
        height: "280px",
        background: "linear-gradient(155deg, var(--navy-dark) 0%, var(--navy) 60%, #1c3875 100%)",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "8rem", opacity: 0.08 }}>
          {categoryData?.icon ?? "🏗️"}
        </div>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "1rem 0", background: "linear-gradient(transparent, rgba(0,0,0,0.55))" }}>
          <div className="container">
            <nav aria-label="Breadcrumb" style={{ display: "flex", gap: "0.5rem", fontSize: "0.8125rem", color: "rgba(255,255,255,0.6)", flexWrap: "wrap" }}>
              <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>Home</Link>
              <span>/</span>
              <Link href="/find-contractors" style={{ color: "inherit", textDecoration: "none" }}>Contractors</Link>
              <span>/</span>
              <Link href={`/services/${categoryData?.id ?? "general-contractor"}`} style={{ color: "inherit", textDecoration: "none" }}>{c.category}</Link>
              <span>/</span>
              <span style={{ color: "rgba(255,255,255,0.9)" }}>{c.company}</span>
            </nav>
          </div>
        </div>
      </div>

      {/* ── Sticky profile header ── */}
      <div style={{ background: "white", borderBottom: "1px solid var(--gray-100)", position: "sticky", top: "72px", zIndex: 50 }}>
        <div className="container" style={{ padding: "1.25rem 1.5rem" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "1.5rem", flexWrap: "wrap" }}>
            {/* Logo avatar */}
            <div style={{
              width: "84px", height: "84px",
              background: "linear-gradient(135deg, var(--navy), #1c3875)",
              borderRadius: "20px",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", fontWeight: 900, fontSize: "2.125rem",
              flexShrink: 0, border: "3px solid white",
              boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
              marginTop: "-42px",
            }}>
              {c.name.charAt(0)}
            </div>

            <div style={{ flex: 1, minWidth: 0, paddingTop: "0.25rem" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.875rem", flexWrap: "wrap", marginBottom: "0.375rem" }}>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--navy)", letterSpacing: "-0.02em" }}>{c.company}</h1>
                {earnedBadges.includes("featured") && <BadgeChip badgeId="featured" size="sm" />}
              </div>
              <div style={{ fontSize: "0.875rem", color: "var(--gray-500)", marginBottom: "0.625rem", display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                <span>{c.name}</span>
                <span style={{ color: "var(--gray-300)" }}>·</span>
                <span>{c.category}</span>
                <span style={{ color: "var(--gray-300)" }}>·</span>
                <span>📍 {c.location}</span>
                {ext.languages.length > 0 && (
                  <>
                    <span style={{ color: "var(--gray-300)" }}>·</span>
                    <span>🗣️ {ext.languages.join(", ")}</span>
                  </>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Stars rating={c.rating} />
                  <span style={{ fontWeight: 800, color: "var(--navy)" }}>{c.rating}</span>
                  <span style={{ color: "var(--gray-400)", fontSize: "0.875rem" }}>({c.reviews})</span>
                </div>
                <span style={{ color: "var(--gray-200)" }}>|</span>
                <span style={{ fontSize: "0.875rem", color: "var(--gray-500)" }}>{c.yearsExp} yrs</span>
                <span style={{ color: "var(--gray-200)" }}>|</span>
                <span style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.875rem", color: "#16a34a", fontWeight: 600 }}>
                  <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#22c55e" }} />
                  {c.responseTime}
                </span>
              </div>
              {earnedBadges.length > 0 && (
                <div style={{ marginTop: "0.75rem" }}>
                  <BadgeGrid badgeIds={earnedBadges} size="sm" maxShow={5} />
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexShrink: 0 }}>
              <Link href={`/request-quote?contractor=${c.id}`} className="btn-red" style={{ padding: "0.75rem 1.5rem" }}>
                Get Free Quote
              </Link>
              <a href={`tel:${c.phone}`} className="btn-secondary" style={{ padding: "0.75rem 1.25rem" }}>
                📞 Call
              </a>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: "0", marginTop: "1.25rem", borderBottom: "2px solid var(--gray-100)", marginLeft: "-1.5rem", marginRight: "-1.5rem", paddingLeft: "1.5rem", overflowX: "auto" }}>
            {tabs.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: "0.75rem 1.125rem", background: "none", border: "none", cursor: "pointer",
                  fontFamily: "inherit", fontSize: "0.875rem",
                  fontWeight: activeTab === tab.key ? 700 : 500,
                  color: activeTab === tab.key ? "var(--navy)" : "var(--gray-500)",
                  borderBottom: `2px solid ${activeTab === tab.key ? "var(--red)" : "transparent"}`,
                  marginBottom: "-2px", transition: "all 0.15s", whiteSpace: "nowrap",
                }}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="container" style={{ padding: "2.5rem 1.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2.5rem" }}>

          {/* ══ Left column ══ */}
          <div>

            {/* ── OVERVIEW ── */}
            {activeTab === "overview" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {/* About */}
                <div className="card" style={{ padding: "2rem" }}>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--navy)", marginBottom: "1rem" }}>About {c.company}</h2>
                  <p style={{ color: "var(--gray-600)", lineHeight: 1.85, marginBottom: "1.25rem" }}>{c.description}</p>
                  <p style={{ color: "var(--gray-600)", lineHeight: 1.85 }}>
                    With {c.yearsExp} years serving {c.location} and the surrounding area, our team has built a reputation for clear communication, honest pricing, and work that meets or exceeds expectations.
                  </p>
                  {/* Services */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "1.5rem" }}>
                    {c.services.map(s => (
                      <span key={s} style={{ background: "rgba(22,46,94,0.07)", color: "var(--navy)", padding: "0.375rem 0.875rem", borderRadius: "999px", fontSize: "0.875rem", fontWeight: 600 }}>{s}</span>
                    ))}
                  </div>
                </div>

                {/* Brands worked with */}
                {ext.brands.length > 0 && (
                  <div className="card" style={{ padding: "2rem" }}>
                    <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--navy)", marginBottom: "1.25rem" }}>Brands & Products We Work With</h2>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.625rem" }}>
                      {ext.brands.map(brand => (
                        <span key={brand} style={{ padding: "0.5rem 1rem", background: "var(--gray-50)", border: "1.5px solid var(--gray-150)", borderRadius: "var(--radius-sm)", fontSize: "0.875rem", fontWeight: 600, color: "var(--gray-700)" }}>
                          {brand}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Certifications */}
                {ext.certifications.length > 0 && (
                  <div className="card" style={{ padding: "2rem" }}>
                    <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--navy)", marginBottom: "1.25rem" }}>Certifications & Training</h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      {ext.certifications.map((cert, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.875rem", padding: "0.875rem 1rem", background: "rgba(22,46,94,0.04)", border: "1px solid rgba(22,46,94,0.1)", borderRadius: "var(--radius)" }}>
                          <div style={{ width: "36px", height: "36px", background: "var(--navy)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "1rem", flexShrink: 0 }}>
                            🏅
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: "var(--navy)", fontSize: "0.9375rem" }}>{cert.name}</div>
                            <div style={{ fontSize: "0.8125rem", color: "var(--gray-500)", marginTop: "0.125rem" }}>
                              {cert.issuer} · {cert.year}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Gallery preview */}
                <div className="card" style={{ padding: "2rem" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
                    <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--navy)" }}>Portfolio</h2>
                    <button onClick={() => setActiveTab("gallery")}
                      style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--navy)", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
                      View all {totalGallery} →
                    </button>
                  </div>
                  <GalleryGrid images={portfolioImages.slice(0, 3)} columns={3} />
                </div>

                {/* Preferred Suppliers — linked to supplier profiles */}
                {ext.preferredSuppliers.length > 0 && (
                  <div className="card" style={{ padding: "2rem" }}>
                    <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--navy)", marginBottom: "0.375rem" }}>Preferred Suppliers</h2>
                    <p style={{ fontSize: "0.875rem", color: "var(--gray-400)", marginBottom: "1.25rem" }}>
                      Trusted suppliers this contractor regularly works with — verified by Smart Choice.
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      {ext.preferredSuppliers.map((s, i) => {
                        // Try to find a matching supplier in our platform
                        const matched = MOCK_SUPPLIERS.find(ms =>
                          ms.name.toLowerCase().includes(s.name.toLowerCase().split(" ")[0]) ||
                          s.name.toLowerCase().includes(ms.name.toLowerCase().split(" ")[0])
                        );
                        const catMatch = SUPPLIER_CATEGORIES.find(sc =>
                          sc.name.toLowerCase().includes(s.category.toLowerCase().split(" ")[0]) ||
                          s.category.toLowerCase().includes(sc.name.toLowerCase().split(" ")[0])
                        );
                        const icon  = catMatch?.icon ?? "🏭";
                        const color = catMatch?.color ?? "var(--navy)";

                        const inner = (
                          <div style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem 1.125rem", background: "var(--gray-50)", border: `1.5px solid ${matched ? "rgba(22,46,94,0.15)" : "var(--gray-150)"}`, borderRadius: "var(--radius)", textDecoration: "none" }}>
                            <div style={{ width: "40px", height: "40px", background: `${color}18`, border: `1px solid ${color}22`, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem", flexShrink: 0 }}>
                              {icon}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 700, color: "var(--navy)", fontSize: "0.9375rem" }}>{s.name}</div>
                              <div style={{ fontSize: "0.8125rem", color: "var(--gray-400)" }}>{s.category}</div>
                            </div>
                            {matched ? (
                              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#16a34a", background: "rgba(22,163,74,0.1)", padding: "0.2rem 0.625rem", borderRadius: "999px", flexShrink: 0 }}>
                                On Platform →
                              </span>
                            ) : s.website ? (
                              <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--navy)", flexShrink: 0 }}>Visit →</span>
                            ) : null}
                          </div>
                        );

                        return matched ? (
                          <a key={i} href={`/suppliers/profile/${matched.id}`} style={{ textDecoration: "none" }}>
                            {inner}
                          </a>
                        ) : s.website ? (
                          <a key={i} href={s.website} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                            {inner}
                          </a>
                        ) : (
                          <div key={i}>{inner}</div>
                        );
                      })}
                    </div>
                    <a href="/suppliers" style={{ display: "inline-block", marginTop: "1rem", fontSize: "0.875rem", fontWeight: 600, color: "var(--navy)", textDecoration: "none" }}>
                      Browse all local suppliers →
                    </a>
                  </div>
                )}

                {/* Service area + map */}
                <div className="card" style={{ padding: "2rem" }}>
                  <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--navy)", marginBottom: "1rem" }}>Service Area</h2>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
                    <span style={{ fontSize: "1.25rem" }}>📍</span>
                    <div>
                      <div style={{ fontWeight: 600, color: "var(--navy)" }}>Based in {c.location}</div>
                      <div style={{ fontSize: "0.875rem", color: "var(--gray-500)" }}>Serves up to 25 miles</div>
                    </div>
                  </div>
                  <MapEmbed location={c.location} />
                </div>

                {/* FAQ */}
                <div className="card" style={{ padding: "2rem" }}>
                  <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--navy)", marginBottom: "1.5rem" }}>Frequently Asked Questions</h2>
                  {faqItems.map((item, i) => (
                    <FaqItem key={i} q={item.q} a={item.a} isLast={i === faqItems.length - 1} />
                  ))}
                </div>

                {/* Related contractors */}
                {relatedContractors.length > 0 && (
                  <div className="card" style={{ padding: "2rem" }}>
                    <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--navy)", marginBottom: "1.5rem" }}>Other {c.category} Professionals</h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                      {relatedContractors.map(rc => (
                        <Link key={rc.id} href={`/contractors/${rc.id}`}
                          style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem", background: "var(--gray-50)", borderRadius: "var(--radius)", textDecoration: "none", transition: "background 0.15s" }}
                          className="related-contractor-link">
                          <div style={{ width: "44px", height: "44px", background: "var(--navy)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: "1.125rem", flexShrink: 0 }}>
                            {rc.name.charAt(0)}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, color: "var(--navy)", fontSize: "0.9375rem" }}>{rc.company}</div>
                            <div style={{ fontSize: "0.8125rem", color: "var(--gray-400)" }}>{rc.location}</div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                            <span style={{ color: "#f59e0b" }}>★</span>
                            <span style={{ fontWeight: 700, color: "var(--navy)", fontSize: "0.9rem" }}>{rc.rating}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <Link href={`/find-contractors?q=${encodeURIComponent(c.category)}`}
                      style={{ display: "block", textAlign: "center", marginTop: "1.25rem", fontSize: "0.875rem", fontWeight: 600, color: "var(--navy)", textDecoration: "none" }}>
                      See all {c.category} professionals →
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* ── GALLERY ── */}
            {activeTab === "gallery" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                {/* Videos */}
                {ext.videos.length > 0 && (
                  <div className="card" style={{ padding: "2rem" }}>
                    <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--navy)", marginBottom: "1.25rem" }}>Videos</h2>
                    <div style={{ display: "grid", gridTemplateColumns: ext.videos.length === 1 ? "1fr" : "1fr 1fr", gap: "1rem" }}>
                      {ext.videos.map((v, i) => (
                        <VideoEmbed key={i} platform={v.platform} id={v.id} title={v.title} />
                      ))}
                    </div>
                  </div>
                )}
                {/* Portfolio photos */}
                <div className="card" style={{ padding: "2rem" }}>
                  <GalleryGrid images={portfolioImages} columns={3} title="Portfolio Photos" />
                </div>
                {/* Before & After */}
                <div className="card" style={{ padding: "2rem" }}>
                  <GalleryGrid images={beforeAfterImages} columns={2} title="Before & After" />
                </div>
              </div>
            )}

            {/* ── TEAM ── */}
            {activeTab === "team" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <div className="card" style={{ padding: "2rem" }}>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--navy)", marginBottom: "0.5rem" }}>Our Team</h2>
                  <p style={{ color: "var(--gray-500)", marginBottom: "1.75rem", lineHeight: 1.65 }}>
                    The people who will work on your project — licensed professionals and experienced tradespeople.
                  </p>
                  {ext.team.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "2rem", color: "var(--gray-400)" }}>
                      <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>👥</div>
                      Team information not yet added.
                    </div>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                      {ext.team.map((member, i) => (
                        <div key={i} style={{ display: "flex", gap: "1.125rem", padding: "1.5rem", background: "var(--gray-50)", borderRadius: "var(--radius-lg)", border: "1.5px solid var(--gray-150)" }}>
                          <div style={{ width: "52px", height: "52px", background: "var(--navy)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: "1.25rem", flexShrink: 0 }}>
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: "var(--navy)", fontSize: "0.9375rem", marginBottom: "0.25rem" }}>{member.name}</div>
                            <div style={{ fontSize: "0.875rem", color: "var(--red)", fontWeight: 600, marginBottom: "0.25rem" }}>{member.role}</div>
                            <div style={{ fontSize: "0.8125rem", color: "var(--gray-400)" }}>{member.yearsExp} years experience</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Certifications */}
                {ext.certifications.length > 0 && (
                  <div className="card" style={{ padding: "2rem" }}>
                    <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--navy)", marginBottom: "1.25rem" }}>Team Certifications</h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      {ext.certifications.map((cert, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "1rem", padding: "1rem 1.125rem", background: "rgba(22,46,94,0.04)", borderRadius: "var(--radius)", border: "1px solid rgba(22,46,94,0.1)" }}>
                          <span style={{ fontSize: "1.375rem", flexShrink: 0 }}>🏅</span>
                          <div>
                            <div style={{ fontWeight: 700, color: "var(--navy)", fontSize: "0.9375rem" }}>{cert.name}</div>
                            <div style={{ fontSize: "0.8125rem", color: "var(--gray-500)", marginTop: "0.125rem" }}>{cert.issuer} · {cert.year}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── REVIEWS ── */}
            {activeTab === "reviews" && (
              <div className="card" style={{ padding: "2rem" }}>
                <div style={{ display: "flex", gap: "2rem", marginBottom: "2rem", flexWrap: "wrap" }}>
                  <div style={{ textAlign: "center", flexShrink: 0 }}>
                    <div style={{ fontSize: "4.5rem", fontWeight: 900, color: "var(--navy)", lineHeight: 1 }}>{c.rating}</div>
                    <Stars rating={Math.round(c.rating)} size={20} />
                    <div style={{ fontSize: "0.875rem", color: "var(--gray-400)", marginTop: "0.375rem" }}>{c.reviews} reviews</div>
                  </div>
                  <div style={{ flex: 1, minWidth: "200px" }}>
                    {ratingBreakdown.map(rb => (
                      <div key={rb.stars} style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.375rem" }}>
                        <span style={{ fontSize: "0.8125rem", color: "var(--gray-500)", width: "40px", flexShrink: 0 }}>{rb.stars} star</span>
                        <div style={{ flex: 1, height: "8px", background: "var(--gray-100)", borderRadius: "999px", overflow: "hidden" }}>
                          <div style={{ height: "100%", background: "#f59e0b", borderRadius: "999px", width: `${rb.pct}%` }} />
                        </div>
                        <span style={{ fontSize: "0.8125rem", color: "var(--gray-400)", width: "28px" }}>{rb.count}</span>
                      </div>
                    ))}
                    <div style={{ marginTop: "1.25rem", paddingTop: "1.25rem", borderTop: "1px solid var(--gray-100)" }}>
                      <RatingBar label="Quality"        score={4.9} />
                      <RatingBar label="Communication"  score={4.8} />
                      <RatingBar label="Timeliness"     score={4.7} />
                      <RatingBar label="Value"          score={4.8} />
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  {reviews.map((r, i) => (
                    <div key={i} style={{ paddingBottom: "1.5rem", borderBottom: i < reviews.length - 1 ? "1px solid var(--gray-100)" : "none" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <div style={{ width: "42px", height: "42px", background: "var(--navy)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: "1rem", flexShrink: 0 }}>
                            {r.name.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: "var(--navy)", fontSize: "0.9375rem" }}>{r.name}</div>
                            <div style={{ fontSize: "0.8125rem", color: "var(--gray-400)" }}>{r.date} · {r.project}</div>
                          </div>
                        </div>
                        <Stars rating={r.rating} />
                      </div>
                      <p style={{ color: "var(--gray-600)", lineHeight: 1.75, fontSize: "0.9375rem" }}>{r.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── CREDENTIALS ── */}
            {activeTab === "credentials" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {earnedBadges.length > 0 ? (
                  <div className="card" style={{ padding: "2rem" }}>
                    <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--navy)", marginBottom: "0.625rem" }}>Earned Credentials</h2>
                    <p style={{ color: "var(--gray-500)", fontSize: "0.875rem", marginBottom: "1.5rem", lineHeight: 1.65 }}>
                      Documents submitted by this professional and reviewed by Smart Choice Constructions. Verify credentials independently before hiring.
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      {earnedBadges.map(id => (
                        <BadgeCard key={id} badgeId={id} earnedDate="June 2025"
                          expiresDate={["license_verified","insured","background_verified"].includes(id) ? "June 2026" : undefined} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
                    <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>📋</div>
                    <h3 style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "0.75rem" }}>No credentials submitted yet</h3>
                    <p style={{ color: "var(--gray-500)", lineHeight: 1.65 }}>
                      This professional has not yet submitted documentation. We recommend asking for credentials directly.
                    </p>
                  </div>
                )}
                <div className="card" style={{ padding: "2rem" }}>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--navy)", marginBottom: "0.75rem" }}>About Our Credential System</h3>
                  <p style={{ color: "var(--gray-500)", fontSize: "0.9375rem", lineHeight: 1.75 }}>
                    Contractors may voluntarily submit documents including licenses, insurance certificates, and background reports. Our team reviews each submission before awarding any badge. Badges expire when the underlying document expires.
                  </p>
                  <p style={{ color: "var(--gray-400)", fontSize: "0.875rem", marginTop: "0.875rem", lineHeight: 1.65 }}>
                    Smart Choice Constructions does not conduct independent investigations and cannot guarantee the accuracy of submitted documents. Always verify credentials with relevant state licensing boards before entering any contract. <Link href="/terms" style={{ color: "var(--navy)", textDecoration: "none" }}>Terms of Service</Link>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ══ Sidebar ══ */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {/* Contact */}
            <div className="card" style={{ padding: "1.75rem" }}>
              <h3 style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "1.25rem", fontSize: "1.0625rem" }}>
                Contact {c.company}
              </h3>
              <Link href={`/request-quote?contractor=${c.id}`} className="btn-red"
                style={{ display: "block", textAlign: "center", marginBottom: "0.75rem", padding: "1rem" }}>
                Request Free Quote
              </Link>
              <a href={`tel:${c.phone}`} className="btn-secondary"
                style={{ display: "block", textAlign: "center", padding: "0.875rem" }}>
                📞 {c.phone}
              </a>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "1rem", justifyContent: "center", fontSize: "0.8125rem", color: "#16a34a" }}>
                <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#22c55e" }} />
                Typically responds {c.responseTime}
              </div>
            </div>

            {/* Quick facts */}
            <div className="card" style={{ padding: "1.5rem" }}>
              <h3 style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "1rem", fontSize: "1rem" }}>Quick Facts</h3>
              {[
                ["Years Active",      `${c.yearsExp} years`],
                ["Based in",          c.location],
                ["Specialty",         c.category],
                ["Reviews",           c.reviews.toString()],
                ["Response Time",     c.responseTime],
                ["Languages",         ext.languages.join(", ")],
                ["Payment Methods",   ext.paymentMethods.slice(0,2).join(", ") + (ext.paymentMethods.length > 2 ? " +" + (ext.paymentMethods.length - 2) : "")],
                ["Emergency Service", "Available"],
              ].map(([label, value]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "0.625rem 0", borderBottom: "1px solid var(--gray-100)", fontSize: "0.875rem", gap: "0.5rem" }}>
                  <span style={{ color: "var(--gray-500)", flexShrink: 0 }}>{label}</span>
                  <span style={{ fontWeight: 600, color: "var(--navy)", textAlign: "right" }}>{value}</span>
                </div>
              ))}
            </div>

            {/* Services */}
            <div className="card" style={{ padding: "1.5rem" }}>
              <h3 style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "1rem", fontSize: "1rem" }}>Services Offered</h3>
              {c.services.map(s => (
                <div key={s} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 0", borderBottom: "1px solid var(--gray-100)", fontSize: "0.875rem", color: "var(--gray-700)" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round"><path d="M5 13l4 4L19 7"/></svg>
                  {s}
                </div>
              ))}
            </div>

            {/* Credentials sidebar */}
            {earnedBadges.length > 0 && (
              <div className="card" style={{ padding: "1.5rem" }}>
                <h3 style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "1rem", fontSize: "1rem" }}>Credentials</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {earnedBadges.slice(0, showAllBadges ? earnedBadges.length : 4).map(id => (
                    <BadgeChip key={id} badgeId={id} size="sm" />
                  ))}
                </div>
                {earnedBadges.length > 4 && (
                  <button onClick={() => setShowAllBadges(!showAllBadges)}
                    style={{ marginTop: "0.625rem", fontSize: "0.8125rem", fontWeight: 600, color: "var(--navy)", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
                    {showAllBadges ? "Show less" : `+${earnedBadges.length - 4} more`}
                  </button>
                )}
              </div>
            )}

            {/* Payment methods */}
            {ext.paymentMethods.length > 0 && (
              <div className="card" style={{ padding: "1.5rem" }}>
                <h3 style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "1rem", fontSize: "1rem" }}>Payment Methods</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {ext.paymentMethods.map(pm => (
                    <span key={pm} style={{ padding: "0.375rem 0.75rem", background: "var(--gray-50)", border: "1.5px solid var(--gray-200)", borderRadius: "999px", fontSize: "0.8125rem", fontWeight: 600, color: "var(--gray-700)" }}>
                      {pm}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Marketplace disclaimer */}
            <div style={{ background: "var(--gray-50)", borderRadius: "var(--radius)", padding: "1.125rem", border: "1px solid var(--gray-150)" }}>
              <p style={{ fontSize: "0.8125rem", color: "var(--gray-400)", lineHeight: 1.65 }}>
                Smart Choice Constructions is a marketplace platform. We connect homeowners with professionals but do not employ contractors, supervise work, or guarantee results.{" "}
                <Link href="/terms" style={{ color: "var(--navy)", textDecoration: "none" }}>Terms</Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .related-contractor-link:hover { background: var(--gray-100) !important; }
      `}</style>
    </div>
  );
}
