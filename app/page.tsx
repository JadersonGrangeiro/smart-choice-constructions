"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { CATEGORIES, TESTIMONIALS, US_STATES, COMPANY } from "@/lib/data";
import { useI18n } from "@/lib/i18n/context";
import SearchBar from "@/components/SearchBar";

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(entries => entries.forEach(e => e.target.classList.toggle("visible", e.isIntersecting)), { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return ref;
}

function Reveal({ children, delay = 0, style = {}, className = "" }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties; className?: string }) {
  const ref = useReveal();
  return <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms`, ...style }}>{children}</div>;
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="stars">
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="15" height="15" viewBox="0 0 24 24" fill={i <= rating ? "#f59e0b" : "#e2e8f0"}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </div>
  );
}

function Accordion({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="accordion-item">
      <button className="accordion-trigger" onClick={() => setOpen(!open)}>
        {question}
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.3s", flexShrink: 0 }}>
          <path d="M5 7.5l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>
      <div className={`accordion-content ${open ? "open" : ""}`}>
        <div className="accordion-body">{answer}</div>
      </div>
    </div>
  );
}

const DEFAULT_HERO = "https://images.unsplash.com/photo-1599427303058-f04cbcf4756f?w=900&q=80";
const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=88&h=88&fit=crop&q=80";

export default function Home() {
  const { t } = useI18n();
  const [counts, setCounts]   = useState([0, 0, 0, 0]);
  const statsRef = useRef<HTMLDivElement>(null);
  const animated = useRef(false);
  const [heroImg, setHeroImg] = useState(DEFAULT_HERO);
  const [avatarImg, setAvatarImg] = useState(DEFAULT_AVATAR);

  useEffect(() => {
    fetch("/api/admin/platform-data?key=site_images")
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.value?.homepage_hero) setHeroImg(d.value.homepage_hero);
        if (d?.value?.homepage_contractor_avatar) setAvatarImg(d.value.homepage_contractor_avatar);
      })
      .catch(() => {});
  }, []);


  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !animated.current) {
        animated.current = true;
        [60, 48, 4.8, 0].forEach((target, i) => {
          const steps = 60;
          let current = 0;
          const timer = setInterval(() => {
            current = Math.min(current + target / steps, target);
            setCounts(prev => { const n = [...prev]; n[i] = current; return n; });
            if (current >= target) clearInterval(timer);
          }, 2000 / steps);
        });
      }
    }, { threshold: 0.3 });
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  const fmt = (v: number, i: number) => i === 0 ? `${Math.floor(v)}+` : i === 1 ? `${Math.floor(v)}` : i === 2 ? v.toFixed(1) : "Free";
  const popular = CATEGORIES.slice(0, 12);

  const featuredContractors = [
    { id: "f00ed9b9-ece2-4a19-9818-9663a600450a", company: "ProBuild Solutions",        cat: "General Contractor", loc: "Austin, TX",    r: 4.9, n: 247, y: 18, init: "P", badge: "Top Rated",    svcs: ["Kitchen","Bathroom","Additions"] },
    { id: "a645986a-37bc-4ea4-8e3f-ae813dc064d1", company: "Elite Roofing & Exteriors", cat: "Roofing",            loc: "Dallas, TX",    r: 4.8, n: 189, y: 14, init: "E", badge: "Featured",     svcs: ["Roof Install","Repair","Gutters"] },
    { id: "ef870dcc-b8ef-4299-bc59-3a19c6923242", company: "PowerUp Electrical",         cat: "Electrician",        loc: "Chicago, IL",   r: 4.9, n: 312, y: 22, init: "P", badge: "Most Reviews", svcs: ["Panel Upgrade","Wiring","EV Chargers"] },
  ];

  const topStates = US_STATES.filter(s =>
    ["CA","TX","FL","NY","IL","PA","OH","GA","NC","MI","NJ","VA","WA","AZ","MA","TN","IN","CO","MO","WI"].includes(s.code)
  );

  return (
    <>
      {/* ── HERO ── */}
      <section className="hero-bg" style={{ minHeight: "100vh", display: "flex", alignItems: "center", paddingTop: "76px" }}>
        <div className="container" style={{ position: "relative", zIndex: 10, width: "100%", paddingTop: "2rem", paddingBottom: "5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center" }} className="hero-grid">
            <div>
              {/* Badge */}
              <div className="animate-fade-in" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "999px", padding: "0.375rem 1rem 0.375rem 0.5rem", marginBottom: "2rem" }}>
                <div style={{ background: "var(--red)", borderRadius: "999px", padding: "0.2rem 0.625rem", fontSize: "0.6875rem", fontWeight: 700, color: "white", letterSpacing: "0.05em", textTransform: "uppercase" }}>New</div>
                <span style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>{t.hero.badge}</span>
              </div>

              <h1 className="heading-xl animate-fade-in delay-100" style={{ color: "white", marginBottom: "1.5rem" }}>
                {t.hero.title1}
                <br />
                <span style={{ color: "#93c5fd" }}>{t.hero.title2}</span>
                <br />
                {t.hero.title3}
              </h1>

              <p className="text-lg animate-fade-in delay-200" style={{ color: "rgba(255,255,255,0.75)", marginBottom: "2.5rem", maxWidth: "480px" }}>
                {t.hero.subtitle}
              </p>

              {/* Search */}
              <div className="animate-fade-in delay-300" style={{ marginBottom: "1.75rem" }}>
                <SearchBar variant="hero" />
              </div>

              {/* Trust */}
              <div className="animate-fade-in delay-400" style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
                {[t.hero.trust1, t.hero.trust2, t.hero.trust3].map(trust => (
                  <div key={trust} className="trust-badge">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round"><path d="M5 13l4 4L19 7"/></svg>
                    {trust}
                  </div>
                ))}
              </div>

              {/* Pricing teaser */}
              <div className="animate-fade-in delay-500" style={{ marginTop: "2rem" }}>
                <div className="hero-pricing-teaser" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "1.25rem", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.13)", borderRadius: "var(--radius-lg)", padding: "1rem 1.375rem" }}>
                  <div>
                    <div style={{ fontSize: "0.6875rem", color: "rgba(255,255,255,0.5)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.2rem" }}>For Contractors</div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "0.375rem" }}>
                      <span style={{ fontSize: "1.625rem", fontWeight: 900, color: "white", lineHeight: 1 }}>$29.90</span>
                      <span style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>/ first month</span>
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", marginTop: "0.125rem" }}>then $49.90/mo · cancel anytime</div>
                  </div>
                  <Link href="/register" style={{ background: "white", color: "var(--navy)", fontWeight: 700, fontSize: "0.875rem", padding: "0.625rem 1.125rem", borderRadius: "var(--radius)", textDecoration: "none", flexShrink: 0, transition: "opacity 0.15s" }}>
                    List Your Business →
                  </Link>
                </div>
              </div>
            </div>

            {/* Right panel — real construction photo */}
            <div className="animate-fade-in delay-200 hide-mobile" style={{ position: "relative", height: "460px" }}>
              {/* Main photo */}
              <div style={{ position: "absolute", top: 0, left: "5%", right: 0, borderRadius: "var(--radius-2xl)", height: "370px", overflow: "hidden", boxShadow: "0 32px 64px rgba(0,0,0,0.35)" }}>
                <img
                  src={heroImg}
                  alt="Professional roofer installing shingles on a residential roof"
                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
                />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 50%, rgba(10,20,45,0.7) 100%)" }} />
                {/* Overlay text */}
                <div style={{ position: "absolute", bottom: "1.5rem", left: "1.5rem", right: "1.5rem" }}>
                  <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "0.375rem" }}>Licensed & Insured</div>
                  <div style={{ color: "white", fontWeight: 700, fontSize: "1.0625rem" }}>Professional contractors across 48 states</div>
                </div>
                {/* Rating pill */}
                <div style={{ position: "absolute", top: "1.25rem", right: "1.25rem", background: "rgba(199,25,26,0.9)", borderRadius: "var(--radius)", padding: "0.625rem 1rem", backdropFilter: "blur(8px)", textAlign: "center" }}>
                  <div style={{ fontSize: "0.6875rem", color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>Avg Rating</div>
                  <div style={{ fontSize: "1.375rem", fontWeight: 800, color: "white", lineHeight: 1 }}>4.8 ★</div>
                </div>
              </div>

              {/* Floating contractor card */}
              <div className="animate-float" style={{ position: "absolute", bottom: "20px", left: 0, background: "white", borderRadius: "var(--radius-lg)", padding: "1rem 1.25rem", boxShadow: "var(--shadow-xl)", border: "1px solid var(--gray-100)", display: "flex", alignItems: "center", gap: "0.875rem", minWidth: "240px" }}>
                <img
                  src={avatarImg}
                  alt="Marcus Rivera"
                  style={{ width: "44px", height: "44px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--navy)" }}>Marcus Rivera</div>
                  <div style={{ fontSize: "0.8125rem", color: "var(--gray-500)" }}>General Contractor · Austin, TX</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "3px" }}>
                    <Stars rating={5} />
                    <span style={{ fontSize: "0.75rem", color: "var(--gray-500)" }}>4.9 (247 reviews)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
          <svg viewBox="0 0 1440 60" fill="none" style={{ display: "block" }}>
            <path d="M0 60L1440 60L1440 20C1200 55 960 5 720 30C480 55 240 0 0 20L0 60Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="section" style={{ background: "white" }}>
        <div className="container">
          <Reveal style={{ textAlign: "center", marginBottom: "3rem" }}>
            <span className="badge badge-blue" style={{ marginBottom: "1rem" }}>{t.sections.categoriesBadge}</span>
            <h2 className="heading-lg" style={{ color: "var(--navy)", marginBottom: "1rem" }}>{t.sections.categoriesTitle}</h2>
            <p className="text-lg" style={{ color: "var(--gray-500)", maxWidth: "520px", margin: "0 auto" }}>{t.sections.categoriesSubtitle}</p>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(155px,1fr))", gap: "1rem", marginBottom: "2.5rem" }}>
            {popular.map((cat, i) => (
              <Reveal key={cat.id} delay={i * 35}>
                <Link href={`/services/${cat.id}`} className="category-card">
                  <div className="category-icon" style={{ background: `${cat.color}18` }}>
                    <span style={{ fontSize: "1.5rem" }}>{cat.icon}</span>
                  </div>
                  <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--navy)", textAlign: "center", lineHeight: 1.3 }}>{cat.name}</div>
                </Link>
              </Reveal>
            ))}
          </div>
          <div style={{ textAlign: "center" }}>
            <Link href="/services" className="btn-secondary">
              {t.sections.viewAllServices} →
            </Link>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section ref={statsRef} style={{ background: "var(--navy)", padding: "4rem 0" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "2rem", textAlign: "center" }}>
            {t.stats.map((stat, i) => (
              <div key={i}>
                <div className="stat-number" style={{ color: "white", marginBottom: "0.5rem" }}>
                  {counts[i] > 0 ? fmt(counts[i], i) : stat.value}
                </div>
                <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "1rem", fontWeight: 500 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="section-lg" style={{ background: "var(--gray-50)" }}>
        <div className="container">
          <Reveal style={{ textAlign: "center", marginBottom: "4rem" }}>
            <span className="badge badge-blue" style={{ marginBottom: "1rem" }}>{t.sections.howItWorksBadge}</span>
            <h2 className="heading-lg" style={{ color: "var(--navy)", marginBottom: "1rem" }}>{t.sections.howItWorksTitle}</h2>
            <p className="text-lg" style={{ color: "var(--gray-500)", maxWidth: "480px", margin: "0 auto" }}>{t.sections.howItWorksSubtitle}</p>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: "1.5rem" }}>
            {t.howItWorks.map((step, i) => (
              <Reveal key={i} delay={i * 100}>
                <div className="card" style={{ padding: "2rem", height: "100%" }}>
                  <div className="step-number" style={{ marginBottom: "1.5rem" }}>{step.step}</div>
                  <h3 style={{ fontSize: "1.0625rem", fontWeight: 700, color: "var(--navy)", marginBottom: "0.75rem" }}>{step.title}</h3>
                  <p style={{ color: "var(--gray-500)", fontSize: "0.9375rem", lineHeight: 1.75 }}>{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED CONTRACTORS ── */}
      <section className="section" style={{ background: "white" }}>
        <div className="container">
          <Reveal style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "2.5rem" }}>
            <div>
              <span className="badge badge-blue" style={{ marginBottom: "0.625rem" }}>{t.sections.featuredBadge}</span>
              <h2 className="heading-md" style={{ color: "var(--navy)" }}>{t.sections.featuredTitle}</h2>
            </div>
            <Link href="/find-contractors" className="btn-secondary">{t.sections.viewAllContractors}</Link>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: "1.5rem" }}>
            {featuredContractors.map((c, i) => (
              <Reveal key={c.id} delay={i * 100}>
                <div className="contractor-card">
                  <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--gray-100)" }}>
                    <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
                      <div style={{ width: "52px", height: "52px", background: "var(--navy)", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: "1.25rem", flexShrink: 0 }}>{c.init}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                          <h3 style={{ fontWeight: 700, color: "var(--navy)", fontSize: "1rem" }}>{c.company}</h3>
                          <span className="badge badge-blue" style={{ fontSize: "0.6875rem", padding: "0.175rem 0.5rem" }}>{c.badge}</span>
                        </div>
                        <div style={{ fontSize: "0.8125rem", color: "var(--gray-500)", marginTop: "0.125rem" }}>{c.cat} · {c.loc}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.875rem" }}>
                      <Stars rating={5} />
                      <span style={{ fontWeight: 700, color: "var(--navy)" }}>{c.r}</span>
                      <span style={{ color: "var(--gray-400)", fontSize: "0.875rem" }}>({c.n} {t.common.reviews})</span>
                      <span style={{ color: "var(--gray-300)" }}>·</span>
                      <span style={{ fontSize: "0.875rem", color: "var(--gray-500)" }}>{c.y} {t.common.yearsExp}</span>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
                      {c.svcs.map(s => <span key={s} className="badge badge-gray" style={{ fontSize: "0.75rem" }}>{s}</span>)}
                    </div>
                  </div>
                  <div style={{ padding: "1rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.8125rem", color: "var(--gray-500)" }}>
                      <div style={{ width: "7px", height: "7px", background: "#22c55e", borderRadius: "50%" }}/>
                      {t.common.availableNow}
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <Link href={`/contractors/${c.id}`} className="btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.8125rem" }}>{t.common.viewProfile}</Link>
                      <Link href={`/request-quote?contractor=${c.id}`} className="btn-red" style={{ padding: "0.5rem 1rem", fontSize: "0.8125rem" }}>{t.common.getQuote}</Link>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="section-lg" style={{ background: "var(--gray-50)" }}>
        <div className="container">
          <Reveal style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <span className="badge badge-blue" style={{ marginBottom: "1rem" }}>{t.sections.testimonialsBadge}</span>
            <h2 className="heading-lg" style={{ color: "var(--navy)", marginBottom: "1rem" }}>{t.sections.testimonialsTitle}</h2>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem" }}>
              <Stars rating={5} />
              <span style={{ fontWeight: 700, color: "var(--navy)", fontSize: "1.125rem" }}>4.8</span>
              <span style={{ color: "var(--gray-400)" }}>from verified reviews</span>
            </div>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(290px,1fr))", gap: "1.5rem" }}>
            {TESTIMONIALS.map((t2, i) => (
              <Reveal key={i} delay={i * 70}>
                <div className="testimonial-card">
                  <Stars rating={t2.rating} />
                  <p style={{ color: "var(--gray-700)", lineHeight: 1.75, margin: "1rem 0 1.5rem", fontSize: "0.9375rem" }}>{t2.text}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{ width: "38px", height: "38px", background: "var(--navy)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, flexShrink: 0 }}>{t2.avatar}</div>
                    <div>
                      <div style={{ fontWeight: 700, color: "var(--navy)", fontSize: "0.9375rem" }}>{t2.name}</div>
                      <div style={{ fontSize: "0.8125rem", color: "var(--gray-400)" }}>{t2.location} · {t2.service}</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOR CONTRACTORS ── */}
      <section style={{ background: "var(--navy)", padding: "5rem 0" }}>
        <div className="container">
          <div className="contractors-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center" }}>
            <Reveal>
              <span className="badge badge-white" style={{ marginBottom: "1.5rem" }}>{t.sections.forContractorsBadge}</span>
              <h2 className="heading-lg" style={{ color: "white", marginBottom: "1.25rem" }}>{t.sections.forContractorsTitle}</h2>
              <p className="text-lg" style={{ color: "rgba(255,255,255,0.7)", marginBottom: "2rem" }}>{t.sections.forContractorsSubtitle}</p>
              {t.contractorBullets.map((item, i) => (
                <div key={i} style={{ display: "flex", gap: "0.75rem", marginBottom: "0.875rem" }}>
                  <div style={{ width: "20px", height: "20px", background: "rgba(74,222,128,0.2)", border: "1.5px solid rgba(74,222,128,0.4)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px" }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="3" strokeLinecap="round"><path d="M5 13l4 4L19 7"/></svg>
                  </div>
                  <span style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.9375rem" }}>{item}</span>
                </div>
              ))}
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "2rem" }}>
                <Link href="/join" className="btn-white">
                  Join for ${COMPANY.pricing.firstMonth.toFixed(2)} First Month →
                </Link>
                <Link href="/pricing" className="btn-outline-white">See what's included</Link>
              </div>
            </Reveal>
            <Reveal delay={150} className="hide-mobile">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                {[
                  { label: "Profile Reach",    value: "Active",  icon: "📈" },
                  { label: "Avg. Rating",       value: "4.8★",icon: "⭐" },
                  { label: "Commission",         value: "$0", icon: "💰" },
                  { label: "Setup Time",         value: "<1hr",icon: "⚡" },
                ].map((item, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "var(--radius-lg)", padding: "1.5rem", textAlign: "center" }}>
                    <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{item.icon}</div>
                    <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "white" }}>{item.value}</div>
                    <div style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.5)", marginTop: "0.25rem" }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── LOCAL SUPPLIERS ── */}
      <section className="section" style={{ background: "white" }}>
        <div className="container">
          <Reveal style={{ textAlign: "center", marginBottom: "3rem" }}>
            <span className="badge badge-blue" style={{ marginBottom: "1rem" }}>Local Supplier Network</span>
            <h2 className="heading-lg" style={{ color: "var(--navy)", marginBottom: "1rem" }}>
              Materials, Tools & Equipment — All Local
            </h2>
            <p className="text-lg" style={{ color: "var(--gray-500)", maxWidth: "520px", margin: "0 auto" }}>
              From lumber yards to tile showrooms — find trusted local suppliers for every phase of your project.
            </p>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: "1.25rem", marginBottom: "2.5rem" }}>
            {[
              { icon: "🪵", label: "Building Materials",   href: "/suppliers/categories/building-materials" },
              { icon: "⚡", label: "Electrical Supplies",  href: "/suppliers/categories/electrical-supplies" },
              { icon: "🔧", label: "Plumbing Supplies",    href: "/suppliers/categories/plumbing-supplies" },
              { icon: "🏠", label: "Roofing Supplies",     href: "/suppliers/categories/roofing-supplies" },
              { icon: "🎨", label: "Paint & Coatings",     href: "/suppliers/categories/paint-coatings" },
              { icon: "🪟", label: "Windows & Doors",      href: "/suppliers/categories/windows-doors" },
              { icon: "🔩", label: "Hardware & Tools",     href: "/suppliers/categories/hardware-tools" },
              { icon: "🌿", label: "Landscaping Supply",   href: "/suppliers/categories/landscaping-supply" },
            ].map((item, i) => (
              <Reveal key={i} delay={i * 40}>
                <Link href={item.href} style={{ display: "flex", alignItems: "center", gap: "0.875rem", padding: "1.125rem 1.25rem", background: "var(--gray-50)", border: "1.5px solid var(--gray-150)", borderRadius: "var(--radius-lg)", textDecoration: "none", color: "var(--gray-700)", fontWeight: 600, fontSize: "0.9375rem", transition: "all 0.2s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--navy)"; (e.currentTarget as HTMLAnchorElement).style.background = "white"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--gray-150)"; (e.currentTarget as HTMLAnchorElement).style.background = "var(--gray-50)"; }}>
                  <span style={{ fontSize: "1.5rem" }}>{item.icon}</span>
                  {item.label}
                </Link>
              </Reveal>
            ))}
          </div>
          <div style={{ textAlign: "center" }}>
            <Link href="/find-suppliers" className="btn-secondary">Browse All Suppliers →</Link>
          </div>
        </div>
      </section>

      {/* ── LOCATIONS ── */}
      <section className="section" style={{ background: "white" }}>
        <div className="container">
          <Reveal style={{ textAlign: "center", marginBottom: "3rem" }}>
            <span className="badge badge-blue" style={{ marginBottom: "1rem" }}>{t.sections.locationsBadge}</span>
            <h2 className="heading-md" style={{ color: "var(--navy)" }}>{t.sections.locationsTitle}</h2>
            <p style={{ color: "var(--gray-500)", marginTop: "0.75rem" }}>{t.sections.locationsSubtitle}</p>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: "0.625rem", marginBottom: "2rem" }}>
            {topStates.map(state => (
              <Link key={state.code} href={`/locations/${state.slug}`} className="state-pill"
                style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.875rem 1rem", background: "var(--gray-50)", border: "1.5px solid var(--gray-150)", borderRadius: "var(--radius)", textDecoration: "none", color: "var(--gray-700)", fontSize: "0.875rem", fontWeight: 600, transition: "all 0.2s" }}>
                <span style={{ background: "var(--navy)", color: "white", borderRadius: "4px", padding: "1px 5px", fontSize: "0.75rem", fontWeight: 700, flexShrink: 0 }}>{state.code}</span>
                {state.name}
              </Link>
            ))}
          </div>
          <div style={{ textAlign: "center" }}>
            <Link href="/locations" className="btn-secondary">{t.sections.viewAllStates}</Link>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="section-lg" style={{ background: "var(--gray-50)" }}>
        <div className="container-narrow">
          <Reveal style={{ textAlign: "center", marginBottom: "3rem" }}>
            <span className="badge badge-blue" style={{ marginBottom: "1rem" }}>{t.sections.faqBadge}</span>
            <h2 className="heading-lg" style={{ color: "var(--navy)" }}>{t.sections.faqTitle}</h2>
          </Reveal>
          <Reveal>
            <div style={{ background: "white", borderRadius: "var(--radius-xl)", padding: "2rem", boxShadow: "var(--shadow-sm)", border: "1px solid var(--gray-100)" }}>
              {t.faq.slice(0, 6).map((faq, i) => <Accordion key={i} question={faq.question} answer={faq.answer} />)}
            </div>
          </Reveal>
          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <Link href="/faq" className="btn-secondary">{t.sections.viewAllFaq}</Link>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ background: "linear-gradient(135deg, var(--navy) 0%, var(--navy-mid) 50%, #2a3d8f 100%)", padding: "6rem 0", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, right: 0, width: "400px", height: "400px", background: "radial-gradient(circle, rgba(199,25,26,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div className="container" style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          <Reveal>
            <p className="slogan" style={{ color: "rgba(255,255,255,0.6)", fontSize: "1.0625rem", marginBottom: "1rem" }}>Simple, Clear, Complete.</p>
            <h2 className="heading-lg" style={{ color: "white", marginBottom: "1.25rem" }}>{t.sections.ctaTitle}</h2>
            <p className="text-lg" style={{ color: "rgba(255,255,255,0.75)", marginBottom: "2.5rem", maxWidth: "520px", margin: "0 auto 2.5rem" }}>{t.sections.ctaSubtitle}</p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/find-contractors" className="btn-white" style={{ padding: "1rem 2.25rem", fontSize: "1.0625rem" }}>{t.sections.ctaBtn1}</Link>
              <Link href="/join" className="btn-red" style={{ padding: "1rem 2.25rem", fontSize: "1.0625rem" }}>{t.sections.ctaBtn2}</Link>
            </div>
            <div style={{ marginTop: "2rem", display: "flex", gap: "2rem", justifyContent: "center", flexWrap: "wrap" }}>
              {[t.sections.ctaTrust1, t.sections.ctaTrust2, t.sections.ctaTrust3].map(trust => (
                <div key={trust} style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: "rgba(255,255,255,0.6)", fontSize: "0.875rem" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="3" strokeLinecap="round"><path d="M5 13l4 4L19 7"/></svg>
                  {trust}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── SUPPLIER JOIN CTA ── */}
      <section style={{ background: "var(--gray-50)", padding: "3.5rem 0", borderTop: "1px solid var(--gray-100)" }}>
        <div className="container">
          <div style={{ background: "linear-gradient(135deg, var(--navy) 0%, #1e3a5f 100%)", borderRadius: "var(--radius-2xl)", padding: "2.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "2rem", flexWrap: "wrap" }}>
            <div>
              <div style={{ display: "inline-block", background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.9)", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", padding: "0.25rem 0.75rem", borderRadius: "999px", marginBottom: "0.875rem" }}>
                For Building Supply Businesses
              </div>
              <h2 style={{ fontWeight: 800, color: "white", fontSize: "1.375rem", marginBottom: "0.5rem" }}>
                Are you a supplier or materials dealer?
              </h2>
              <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.9375rem", margin: 0 }}>
                Get discovered by local contractors for free. No credit card required.
              </p>
            </div>
            <div style={{ display: "flex", gap: "0.875rem", flexShrink: 0, flexWrap: "wrap" }}>
              <Link href="/join/supplier" style={{ background: "white", color: "var(--navy)", fontWeight: 700, padding: "0.75rem 1.5rem", borderRadius: "var(--radius)", textDecoration: "none", fontSize: "0.9375rem" }}>
                List Your Business — Free →
              </Link>
              <Link href="/for-providers" style={{ background: "transparent", color: "rgba(255,255,255,0.8)", fontWeight: 600, padding: "0.75rem 1.25rem", borderRadius: "var(--radius)", textDecoration: "none", fontSize: "0.9375rem", border: "1px solid rgba(255,255,255,0.2)" }}>
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ + HomepageService JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: t.faq.slice(0, 6).map(faq => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: { "@type": "Answer", text: faq.answer },
          })),
        })}}
      />
      <style>{`
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .contractors-grid { grid-template-columns: 1fr !important; gap: 2rem !important; }
          .hero-pricing-teaser { flex-wrap: wrap !important; }
        }
        .state-pill:hover { border-color: var(--navy) !important; color: var(--navy) !important; background: white !important; }
      `}</style>
    </>
  );
}
