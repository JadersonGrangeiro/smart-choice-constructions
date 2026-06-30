"use client";
import { useState, useEffect } from "react";
import { translations } from "@/lib/i18n/translations";

// Mutable deep clone of the EN defaults
const BASE: any = JSON.parse(JSON.stringify(translations.en));

type Tab = "hero" | "nav" | "sections" | "steps" | "faq" | "footer" | "common" | "pages";

const TABS: { id: Tab; label: string }[] = [
  { id: "hero",     label: "Hero" },
  { id: "nav",      label: "Navigation" },
  { id: "sections", label: "Sections" },
  { id: "steps",    label: "Steps & Bullets" },
  { id: "faq",      label: "FAQ" },
  { id: "footer",   label: "Footer" },
  { id: "common",   label: "Common Labels" },
  { id: "pages",    label: "Pages" },
];

function getPath(obj: any, path: string): any {
  return path.split(".").reduce((o, k) => o?.[k], obj);
}
function setPath(obj: any, path: string, value: any): any {
  const keys = path.split(".");
  if (keys.length === 1) return { ...obj, [keys[0]]: value };
  return { ...obj, [keys[0]]: setPath(obj[keys[0]] ?? {}, keys.slice(1).join("."), value) };
}

function Toast({ msg, ok }: { msg: string; ok: boolean }) {
  return (
    <div style={{ position: "fixed", bottom: "1.5rem", right: "1.5rem", zIndex: 9999,
      background: ok ? "#16a34a" : "var(--red)", color: "white",
      padding: "0.875rem 1.5rem", borderRadius: "var(--radius)", fontWeight: 600,
      fontSize: "0.9rem", boxShadow: "var(--shadow-lg)" }}>{msg}</div>
  );
}

export default function SiteContentPage() {
  const [content, setContent] = useState<any>(BASE);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<Tab>("hero");
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  useEffect(() => {
    fetch("/api/admin/platform-data?key=site_content")
      .then(r => r.json())
      .then(({ value }) => {
        if (value && typeof value === "object") {
          // deep-merge DB overrides onto defaults
          setContent((prev: any) => mergeDeep(prev, value));
        }
      })
      .catch(() => {});
  }, []);

  function mergeDeep(base: any, over: any): any {
    if (!over || typeof over !== "object") return base;
    if (Array.isArray(over)) return over;
    const r = { ...base };
    for (const k of Object.keys(over)) {
      if (typeof over[k] === "object" && !Array.isArray(over[k]) && typeof base?.[k] === "object" && !Array.isArray(base?.[k])) {
        r[k] = mergeDeep(base[k], over[k]);
      } else r[k] = over[k];
    }
    return r;
  }

  function upd(path: string, value: string) {
    setContent((prev: any) => setPath(prev, path, value));
  }
  function updArr(arrPath: string, idx: number, field: string | null, value: string) {
    setContent((prev: any) => {
      const arr = [...(getPath(prev, arrPath) ?? [])];
      arr[idx] = field ? { ...arr[idx], [field]: value } : value;
      return setPath(prev, arrPath, arr);
    });
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/platform-data", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "site_content", value: content }),
      });
      setToast({ msg: res.ok ? "Content saved! Refresh the site to see changes." : "Save failed.", ok: res.ok });
    } catch { setToast({ msg: "Save failed.", ok: false }); }
    setSaving(false);
    setTimeout(() => setToast(null), 4000);
  }

  // ── Shared style helpers ────────────────────────────────────────────────────
  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "0.5rem 0.75rem", border: "1px solid var(--gray-200)",
    borderRadius: "var(--radius-sm)", fontSize: "0.875rem", fontFamily: "inherit",
    color: "var(--gray-800)", background: "white", boxSizing: "border-box",
  };
  const taStyle: React.CSSProperties = { ...inputStyle, resize: "vertical", minHeight: "72px" };
  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: "0.75rem", fontWeight: 600,
    color: "var(--gray-500)", marginBottom: "0.3rem", textTransform: "uppercase", letterSpacing: "0.05em",
  };
  const sectionHead: React.CSSProperties = {
    fontSize: "0.6875rem", fontWeight: 700, color: "var(--navy)", textTransform: "uppercase",
    letterSpacing: "0.1em", padding: "0.5rem 0", borderBottom: "2px solid var(--navy)",
    marginBottom: "1rem", marginTop: "1.5rem",
  };
  const grid2: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" };
  const grid3: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.875rem" };

  function F({ label, path, multi }: { label: string; path: string; multi?: boolean }) {
    const val = getPath(content, path) ?? "";
    return (
      <div>
        <label style={labelStyle}>{label}</label>
        {multi
          ? <textarea style={taStyle} value={val} onChange={e => upd(path, e.target.value)} />
          : <input style={inputStyle} value={val} onChange={e => upd(path, e.target.value)} />}
      </div>
    );
  }

  // ── Tab contents ────────────────────────────────────────────────────────────

  const HeroTab = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
      <div style={sectionHead}>Badge & Title</div>
      <div style={grid2}>
        <F label="Badge text" path="hero.badge" />
        <div />
      </div>
      <div style={grid3}>
        <F label="Title line 1" path="hero.title1" />
        <F label="Title line 2 (highlight)" path="hero.title2" />
        <F label="Title line 3" path="hero.title3" />
      </div>
      <F label="Subtitle paragraph" path="hero.subtitle" multi />

      <div style={sectionHead}>Search Bar</div>
      <div style={grid3}>
        <F label="Service placeholder" path="hero.searchService" />
        <F label="ZIP placeholder" path="hero.searchZip" />
        <F label="Search button" path="hero.searchBtn" />
      </div>

      <div style={sectionHead}>Trust Badges</div>
      <div style={grid3}>
        <F label="Trust badge 1" path="hero.trust1" />
        <F label="Trust badge 2" path="hero.trust2" />
        <F label="Trust badge 3" path="hero.trust3" />
      </div>
    </div>
  );

  const NavTab = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
      <div style={sectionHead}>Menu Items</div>
      <div style={grid3}>
        <F label="Services" path="nav.services" />
        <F label="Find Contractors" path="nav.findContractors" />
        <F label="Locations" path="nav.locations" />
        <F label="Blog" path="nav.blog" />
        <F label="Pricing" path="nav.pricing" />
        <F label="Sign In" path="nav.signIn" />
        <F label="Join as Contractor" path="nav.joinContractor" />
        <F label="Home" path="nav.home" />
        <F label="About" path="nav.about" />
        <F label="Contact" path="nav.contact" />
        <F label="FAQ" path="nav.faq" />
        <F label="How It Works" path="nav.howItWorks" />
      </div>
      <div style={grid2}>
        <F label="View all services link" path="nav.viewAllServices" />
      </div>
    </div>
  );

  const SectionsTab = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
      <div style={sectionHead}>Categories Section</div>
      <div style={grid3}>
        <F label="Badge" path="sections.categoriesBadge" />
        <F label="Title" path="sections.categoriesTitle" />
        <F label="View All link" path="sections.viewAllServices" />
      </div>
      <F label="Subtitle" path="sections.categoriesSubtitle" multi />

      <div style={sectionHead}>How It Works Section</div>
      <div style={grid3}>
        <F label="Badge" path="sections.howItWorksBadge" />
        <F label="Title" path="sections.howItWorksTitle" />
      </div>
      <F label="Subtitle" path="sections.howItWorksSubtitle" multi />

      <div style={sectionHead}>Featured Contractors Section</div>
      <div style={grid3}>
        <F label="Badge" path="sections.featuredBadge" />
        <F label="Title" path="sections.featuredTitle" />
        <F label="View All link" path="sections.viewAllContractors" />
      </div>

      <div style={sectionHead}>Testimonials Section</div>
      <div style={grid2}>
        <F label="Badge" path="sections.testimonialsBadge" />
        <F label="Title" path="sections.testimonialsTitle" />
      </div>

      <div style={sectionHead}>For Contractors Section</div>
      <div style={grid2}>
        <F label="Badge" path="sections.forContractorsBadge" />
        <F label="Title" path="sections.forContractorsTitle" />
      </div>
      <F label="Subtitle" path="sections.forContractorsSubtitle" multi />

      <div style={sectionHead}>Locations Section</div>
      <div style={grid3}>
        <F label="Badge" path="sections.locationsBadge" />
        <F label="Title" path="sections.locationsTitle" />
        <F label="View All States" path="sections.viewAllStates" />
      </div>
      <F label="Subtitle" path="sections.locationsSubtitle" />

      <div style={sectionHead}>FAQ Section</div>
      <div style={grid3}>
        <F label="Badge" path="sections.faqBadge" />
        <F label="Title" path="sections.faqTitle" />
        <F label="View All FAQ link" path="sections.viewAllFaq" />
      </div>

      <div style={sectionHead}>Final CTA Section</div>
      <div style={grid2}>
        <F label="Title" path="sections.ctaTitle" />
      </div>
      <F label="Subtitle" path="sections.ctaSubtitle" multi />
      <div style={grid3}>
        <F label="Button 1" path="sections.ctaBtn1" />
        <F label="Button 2" path="sections.ctaBtn2" />
      </div>
      <div style={grid3}>
        <F label="Trust line 1" path="sections.ctaTrust1" />
        <F label="Trust line 2" path="sections.ctaTrust2" />
        <F label="Trust line 3" path="sections.ctaTrust3" />
      </div>
    </div>
  );

  const StepsTab = () => {
    const steps: any[] = getPath(content, "howItWorks") ?? [];
    const bullets: string[] = getPath(content, "contractorBullets") ?? [];
    const stats: any[] = getPath(content, "stats") ?? [];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <div style={sectionHead}>How It Works — 4 Steps</div>
        {steps.map((step: any, i: number) => (
          <div key={i} style={{ background: "var(--gray-50)", border: "1px solid var(--gray-150)", borderRadius: "var(--radius)", padding: "1rem" }}>
            <div style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "0.75rem", fontSize: "0.875rem" }}>Step {i + 1}</div>
            <div style={grid2}>
              <div>
                <label style={labelStyle}>Title</label>
                <input style={inputStyle} value={step.title ?? ""} onChange={e => updArr("howItWorks", i, "title", e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Description</label>
                <textarea style={taStyle} value={step.desc ?? ""} onChange={e => updArr("howItWorks", i, "desc", e.target.value)} />
              </div>
            </div>
          </div>
        ))}

        <div style={sectionHead}>Contractor Bullets (For Contractors section)</div>
        {bullets.map((b: string, i: number) => (
          <div key={i}>
            <label style={labelStyle}>Bullet {i + 1}</label>
            <input style={inputStyle} value={b ?? ""} onChange={e => updArr("contractorBullets", i, null, e.target.value)} />
          </div>
        ))}

        <div style={sectionHead}>Stats (4 animated counters)</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
          {stats.map((s: any, i: number) => (
            <div key={i} style={{ background: "var(--gray-50)", border: "1px solid var(--gray-150)", borderRadius: "var(--radius)", padding: "1rem" }}>
              <div style={grid2}>
                <div>
                  <label style={labelStyle}>Value</label>
                  <input style={inputStyle} value={s.value ?? ""} onChange={e => updArr("stats", i, "value", e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Label</label>
                  <input style={inputStyle} value={s.label ?? ""} onChange={e => updArr("stats", i, "label", e.target.value)} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const FaqTab = () => {
    const items: any[] = getPath(content, "faq") ?? [];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={sectionHead}>FAQ Items</div>
        {items.map((item: any, i: number) => (
          <div key={i} style={{ background: "var(--gray-50)", border: "1px solid var(--gray-150)", borderRadius: "var(--radius)", padding: "1rem" }}>
            <div style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "0.75rem", fontSize: "0.875rem" }}>Question {i + 1}</div>
            <div>
              <label style={labelStyle}>Question</label>
              <input style={inputStyle} value={item.question ?? ""} onChange={e => updArr("faq", i, "question", e.target.value)} />
            </div>
            <div style={{ marginTop: "0.5rem" }}>
              <label style={labelStyle}>Answer</label>
              <textarea style={taStyle} value={item.answer ?? ""} onChange={e => updArr("faq", i, "answer", e.target.value)} />
            </div>
          </div>
        ))}
      </div>
    );
  };

  const FooterTab = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
      <div style={sectionHead}>Column Headings</div>
      <div style={grid3}>
        <F label="Popular Services heading" path="footer.popularServices" />
        <F label="Top States heading" path="footer.topStates" />
        <F label="View All States link" path="footer.allStates" />
        <F label="Company heading" path="footer.company" />
        <F label="For Contractors heading" path="footer.forContractors" />
      </div>

      <div style={sectionHead}>Newsletter</div>
      <div style={grid2}>
        <F label="Newsletter title" path="footer.newsletter" />
        <F label="Subscribe button" path="footer.subscribe" />
      </div>
      <F label="Newsletter subtitle" path="footer.newsletterSub" multi />
      <div style={grid2}>
        <F label="Email placeholder" path="footer.emailPlaceholder" />
      </div>

      <div style={sectionHead}>Bottom Bar</div>
      <F label="Copyright text" path="footer.copyright" />
    </div>
  );

  const CommonTab = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
      <div style={sectionHead}>Shared Labels</div>
      <div style={grid3}>
        <F label="Get Quote button" path="common.getQuote" />
        <F label="View Profile button" path="common.viewProfile" />
        <F label="Get Free Quotes" path="common.getFreeQuotes" />
        <F label="Browse Contractors" path="common.browseContractors" />
        <F label="Available Now" path="common.availableNow" />
        <F label="Responds" path="common.responds" />
        <F label="Years Experience" path="common.yearsExp" />
        <F label="Reviews" path="common.reviews" />
        <F label="Verified" path="common.verified" />
        <F label="Insured" path="common.insured" />
        <F label="Licensed" path="common.licensed" />
        <F label="Background Checked" path="common.backgroundChecked" />
        <F label="Find Contractor Free" path="common.findContractorFree" />
        <F label="Join as Contractor" path="common.joinAsContractor" />
        <F label="Free" path="common.free" />
        <F label="No Commission" path="common.noCommission" />
        <F label="Cancel Anytime" path="common.cancelAnytime" />
      </div>
    </div>
  );

  const PagesTab = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
      <div style={sectionHead}>Pricing Page</div>
      <div style={grid3}>
        <F label="Badge" path="pages.pricing.badge" />
        <F label="Plan Name" path="pages.pricing.planName" />
        <F label="Start Button" path="pages.pricing.startBtn" />
        <F label="First Month label" path="pages.pricing.firstMonth" />
        <F label="First Month price" path="pages.pricing.firstMonthPrice" />
        <F label="Then monthly text" path="pages.pricing.thenMonth" />
      </div>
      <F label="Page Title" path="pages.pricing.title" />
      <F label="Subtitle" path="pages.pricing.subtitle" multi />
      <F label="Why section title" path="pages.pricing.whyTitle" />
      <F label="Why section description" path="pages.pricing.whyDesc" multi />

      <div style={sectionHead}>About Page</div>
      <div style={grid2}>
        <F label="Badge" path="pages.about.badge" />
      </div>
      <F label="Title" path="pages.about.title" />
      <F label="Subtitle" path="pages.about.subtitle" multi />
      {(getPath(content, "pages.about.story") as string[] ?? []).map((para: string, i: number) => (
        <div key={i}>
          <label style={labelStyle}>Story paragraph {i + 1}</label>
          <textarea style={taStyle} value={para} onChange={e => updArr("pages.about.story", i, null, e.target.value)} />
        </div>
      ))}

      <div style={sectionHead}>How It Works Page</div>
      <div style={grid2}>
        <F label="Badge" path="pages.howItWorksPage.badge" />
        <F label="Title" path="pages.howItWorksPage.title" />
        <F label="For Homeowners tab" path="pages.howItWorksPage.forHomeowners" />
        <F label="For Contractors tab" path="pages.howItWorksPage.forContractors" />
      </div>
      <F label="Subtitle" path="pages.howItWorksPage.subtitle" multi />

      <div style={sectionHead}>FAQ Page</div>
      <div style={grid2}>
        <F label="Page Title" path="pages.faqPage.title" />
        <F label="Search placeholder" path="pages.faqPage.searchPlaceholder" />
        <F label="Still Have Questions?" path="pages.faqPage.stillHaveQ" />
        <F label="Contact button" path="pages.faqPage.contactBtn" />
      </div>
      <F label="Subtitle" path="pages.faqPage.subtitle" multi />

      <div style={sectionHead}>Contact Page</div>
      <div style={grid3}>
        <F label="Page Title" path="pages.contact.title" />
        <F label="Form Title" path="pages.contact.formTitle" />
        <F label="Send button" path="pages.contact.sendBtn" />
        <F label="First Name label" path="pages.contact.firstName" />
        <F label="Last Name label" path="pages.contact.lastName" />
        <F label="Email label" path="pages.contact.email" />
        <F label="Phone label" path="pages.contact.phone" />
        <F label="I Am A label" path="pages.contact.iAmA" />
        <F label="Subject label" path="pages.contact.subject" />
      </div>
      <F label="Subtitle" path="pages.contact.subtitle" multi />

      <div style={sectionHead}>Join / Register Page</div>
      <div style={grid3}>
        <F label="Page Title" path="pages.join.title" />
        <F label="Step 1 label" path="pages.join.step1" />
        <F label="Step 2 label" path="pages.join.step2" />
        <F label="Step 3 label" path="pages.join.step3" />
        <F label="Continue button" path="pages.join.continueBtn" />
        <F label="Back button" path="pages.join.backBtn" />
        <F label="Start Subscription button" path="pages.join.startSubscription" />
      </div>
      <F label="Subtitle" path="pages.join.subtitle" multi />
      <F label="Payment security text" path="pages.join.paymentEncrypted" />
    </div>
  );

  const tabContent: Record<Tab, React.ReactNode> = {
    hero: <HeroTab />,
    nav: <NavTab />,
    sections: <SectionsTab />,
    steps: <StepsTab />,
    faq: <FaqTab />,
    footer: <FooterTab />,
    common: <CommonTab />,
    pages: <PagesTab />,
  };

  return (
    <div style={{ maxWidth: "960px" }}>
      {toast && <Toast msg={toast.msg} ok={toast.ok} />}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.5rem", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.625rem", fontWeight: 800, color: "var(--navy)" }}>Site Content</h1>
          <p style={{ color: "var(--gray-500)", marginTop: "0.25rem", fontSize: "0.9rem" }}>
            Edit every text string across the site. Changes go live after saving — no code deploy needed.
          </p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          style={{ background: "var(--navy)", color: "white", border: "none", borderRadius: "var(--radius)",
            padding: "0.75rem 1.75rem", fontWeight: 700, cursor: saving ? "not-allowed" : "pointer",
            opacity: saving ? 0.7 : 1, fontSize: "0.9375rem", flexShrink: 0 }}>
          {saving ? "Saving…" : "Save All Changes"}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.25rem", borderBottom: "2px solid var(--gray-150)", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              padding: "0.625rem 1rem", fontSize: "0.875rem",
              fontWeight: tab === t.id ? 700 : 500,
              color: tab === t.id ? "var(--navy)" : "var(--gray-500)",
              borderBottom: tab === t.id ? "2px solid var(--navy)" : "2px solid transparent",
              marginBottom: "-2px", fontFamily: "inherit", transition: "color 0.15s",
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content panel */}
      <div style={{ background: "white", border: "1px solid var(--gray-150)", borderRadius: "var(--radius-lg)",
        padding: "1.5rem", boxShadow: "var(--shadow-sm)" }}>
        {tabContent[tab]}
      </div>

      <div style={{ marginTop: "1.25rem", padding: "0.875rem 1.125rem", background: "var(--gray-50)",
        border: "1px solid var(--gray-150)", borderRadius: "var(--radius)", fontSize: "0.8125rem",
        color: "var(--gray-500)" }}>
        <strong style={{ color: "var(--gray-700)" }}>Note:</strong> These texts are loaded at page load. After saving,
        visitors will see updated text within seconds. The Spanish translation is separate and uses the built-in translations.
      </div>
    </div>
  );
}
