import Link from "next/link";
import { BLOG_POSTS } from "@/lib/data";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return BLOG_POSTS.map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_POSTS.find(p => p.slug === slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      authors: [post.author],
      publishedTime: post.date,
    },
  };
}

const CONTENT: Record<string, { intro: string; sections: { heading: string; body: string }[] }> = {
  "signs-you-need-new-roof": {
    intro: "Most homeowners don't think about their roof until water is dripping through the ceiling. By then, what could have been a $500 repair has turned into a $15,000 replacement. Here are the warning signs worth catching early.",
    sections: [
      { heading: "1. Missing or curling shingles", body: "Shingles that are buckling, curling at the edges, or missing entirely are a clear sign the roof is at or past the end of its useful life. Wind and rain do the rest. A few missing shingles can be patched, but widespread curling means the whole surface has dried out and is no longer sealing properly." },
      { heading: "2. Granules in the gutters", body: "Asphalt shingles shed the small mineral granules that protect them from UV damage as they age. If your gutters are collecting dark sandy material after a rain, your shingles are deteriorating. This typically shows up 15 to 20 years into a roof's life." },
      { heading: "3. Daylight through the roof boards", body: "Go into your attic on a bright day and turn off the lights. Any pinpoints of light coming through the roof decking mean gaps that let in water just as easily as they let in light. Even small gaps compound during freeze-thaw cycles." },
      { heading: "4. Sagging areas", body: "A roof deck should be flat and firm. Soft spots or visible sagging indicate the decking underneath has been compromised by moisture — meaning there has been a leak long enough to rot the wood structure itself. This requires immediate attention." },
      { heading: "5. Higher energy bills", body: "A failing roof lets conditioned air escape and outside air infiltrate. If your heating and cooling costs have increased without a clear reason, poor roof insulation or air sealing is often the cause." },
      { heading: "6. The roof is over 20 years old", body: "Standard asphalt shingles carry a 20 to 25 year lifespan under normal conditions. If yours is approaching that range, schedule an inspection regardless of visible symptoms. Proactive replacement on your timeline is far less disruptive than emergency work after a storm." },
      { heading: "What to do next", body: "A qualified roofing contractor can assess the full picture — not just the surface, but the decking, flashing, ventilation, and gutters. On Smart Choice, all roofing contractors are listed on our platform. We recommend always verifying credentials directly. Get multiple quotes before committing to any work." },
    ],
  },
  "choose-kitchen-remodeling-contractor": {
    intro: "A kitchen remodel is one of the highest-return investments you can make in your home — and one of the easiest to get wrong. The difference between a project that finishes on time and budget and one that drags on for months often comes down to how carefully you choose the contractor.",
    sections: [
      { heading: "Verify their license and insurance first", body: "Every state has different licensing requirements for contractors doing kitchen work. Before you look at portfolios or compare quotes, confirm the contractor holds a current license in your state and carries both general liability and workers' compensation insurance. A lapsed license or absent insurance exposes you to serious financial risk if something goes wrong." },
      { heading: "Look at completed kitchens specifically", body: "General contractors can do excellent work across many trades. But kitchen remodels involve coordinating cabinetry, plumbing, electrical, tile, and finish carpentry — often simultaneously. Ask to see three to five completed kitchens, and if possible, speak with those homeowners directly." },
      { heading: "Get a written scope before any quotes", body: "A quote is only meaningful if it covers the same scope as the competing quotes. Before asking for pricing, write out exactly what you want: cabinet brand and style, countertop material, appliance rough-ins, lighting plan, and backsplash. This gives every contractor the same basis and eliminates apples-to-oranges comparisons." },
      { heading: "Understand the payment schedule", body: "Reputable contractors do not ask for full payment upfront. A standard structure is 10 to 20 percent to start, progress payments tied to specific milestones, and a final 10 percent held until punch-list items are resolved. If a contractor asks for more than half upfront, walk away." },
      { heading: "Ask about the subcontractor arrangement", body: "Most kitchen remodels require licensed plumbers and electricians. Ask whether your contractor uses their own crews or subcontractors, who is responsible for pulling permits, and whether subs carry their own insurance. You want one point of accountability — the general contractor — not a web of relationships you have to manage yourself." },
      { heading: "Timeline and communication expectations", body: "Before signing any contract, establish how often you'll receive updates, what communication channel the contractor prefers, and what the realistic timeline looks like — including a buffer for material lead times and inspection scheduling. The best contractors set clear expectations and stick to them." },
    ],
  },
  "complete-guide-hvac-systems": {
    intro: "Your HVAC system is the single most used mechanical system in your home, running 24 hours a day for months at a time. Understanding how it works helps you recognize problems early, make smarter maintenance decisions, and have informed conversations with technicians.",
    sections: [
      { heading: "How a central air system works", body: "A split-system air conditioner has two main units: an outdoor condenser that releases heat and an indoor air handler that circulates cooled air. Refrigerant cycles between them, absorbing heat inside your home and expelling it outside. The blower in the air handler pushes conditioned air through ducts and into each room via supply vents, while return vents pull warm air back to be recooled." },
      { heading: "Heating: furnace vs. heat pump", body: "A gas furnace generates heat by burning natural gas, which is highly efficient in cold climates. A heat pump extracts heat from outdoor air — even cold air contains usable heat energy — and transfers it inside. Modern heat pumps work well down to around 5°F and are significantly more efficient than furnaces in mild climates. Dual-fuel systems combine a heat pump with a gas furnace to capture the advantages of both." },
      { heading: "SEER and AFUE ratings", body: "SEER (Seasonal Energy Efficiency Ratio) measures air conditioner efficiency. The higher the SEER, the less electricity the system uses for the same cooling output. Current minimum standards require 14 SEER in most of the US, with high-efficiency units reaching 20+ SEER. AFUE (Annual Fuel Utilization Efficiency) measures furnace efficiency — an 80 AFUE furnace converts 80 percent of fuel to heat, while 95+ AFUE units are considered high efficiency." },
      { heading: "When to repair vs. replace", body: "The 5,000 rule offers a useful starting point: multiply the repair cost by the age of the unit in years. If the result exceeds $5,000, replacement is typically more economical. A 15-year-old system facing a $400 repair scores 6,000 — suggesting replacement. A 5-year-old system facing the same repair scores 2,000 — suggesting repair. Age, frequency of past repairs, and current efficiency should all factor into the decision." },
      { heading: "Maintenance that matters", body: "Replace or clean the air filter every 1 to 3 months depending on your system and home environment. Schedule professional maintenance once a year — ideally in spring before cooling season and fall before heating season. A technician will check refrigerant levels, inspect electrical connections, clean coils, and test safety controls. This single investment extends equipment life and prevents the majority of mid-season failures." },
      { heading: "Signs your system needs attention", body: "Unusual noises (banging, squealing, or grinding) almost always indicate a mechanical issue. Inconsistent temperatures between rooms suggest duct problems or a failing blower. A sudden spike in energy bills without a change in usage points to a drop in efficiency. Ice forming on the indoor or outdoor unit means the system is running but not working correctly. None of these should be ignored." },
    ],
  },
  "bathroom-remodel-budget": {
    intro: "A bathroom remodel returns roughly 60 to 70 percent of its cost at resale — one of the better returns in home improvement. But that average hides enormous variation based on where you spend the money. Here's how to think about allocation when the budget is real.",
    sections: [
      { heading: "Where the money actually goes", body: "Labor typically represents 40 to 65 percent of total bathroom remodel cost. This surprises most homeowners who focus on tile and fixture prices. A $12,000 bathroom remodel might include $7,000 in labor and only $5,000 in materials. Understanding this split helps you evaluate where value comes from — and where cutting corners is dangerous versus safe." },
      { heading: "Splurge: the shower and tub", body: "The shower is the centerpiece of any bathroom remodel and the element that most affects resale perception. Quality tile, a frameless glass enclosure, and a well-specified showerhead make the space feel premium. This is not where to cut. A walk-in tile shower with frameless glass typically runs $3,000 to $8,000 installed — and justifies most of that cost in daily use and resale appeal." },
      { heading: "Splurge: waterproofing and substrate", body: "What's behind the tile matters more than the tile itself. Proper waterproofing membrane installation, cement board substrate, and correct drain slope are invisible when the job is done — but their absence leads to mold, water damage, and tile failure within a few years. Never let a contractor cut corners here." },
      { heading: "Save: toilet", body: "The toilet is purely functional. Mid-range models from major manufacturers ($200 to $350) perform identically to $800 designer versions. Spend the difference elsewhere. One exception: wall-hung toilets have real merit in small bathrooms for visual space and cleaning ease — but they require additional structural work." },
      { heading: "Save: vanity cabinet", body: "Ready-to-assemble vanities from major home improvement retailers have improved dramatically in quality. An $800 RTA vanity with a quality countertop can look nearly identical to a $3,000 custom piece. Spend more on the countertop surface (quartz or stone) than on the cabinet box." },
      { heading: "The right sequence", body: "Bathroom remodels follow a strict order: rough plumbing and electrical first, then waterproofing, then tile, then fixtures, then finish work. A contractor who suggests doing finish work before inspections are complete or before waterproofing is signed off is one to reconsider. The sequence exists for good reason." },
    ],
  },
};

function Stars({ count }: { count: number }) {
  return (
    <div style={{ display: "flex", gap: "2px" }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i <= count ? "#f59e0b" : "#e2e8f0"}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </div>
  );
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = BLOG_POSTS.find(p => p.slug === slug);
  if (!post) notFound();

  const content = CONTENT[slug] ?? {
    intro: post.excerpt,
    sections: [
      { heading: "About this topic", body: "Our network of professional contractors has compiled practical guidance on this subject. The information below is drawn from real-world experience across thousands of projects." },
      { heading: "Getting the right help", body: "Whatever your project involves, the most important decision is who you hire. Verify licenses, check insurance, read reviews from real homeowners in your area, and get at least two quotes before committing. Smart Choice makes all of this straightforward." },
    ],
  };

  const related = BLOG_POSTS.filter(p => p.slug !== slug).slice(0, 3);
  const categoryService = post.category.toLowerCase().replace(/\s+/g, "-");

  return (
    <div style={{ paddingTop: "76px" }}>
      {/* Hero */}
      <div style={{ background: "linear-gradient(155deg, var(--navy-dark), var(--navy))", padding: "4rem 0 3rem" }}>
        <div className="container-narrow">
          <nav aria-label="Breadcrumb" style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", fontSize: "0.875rem", color: "rgba(255,255,255,0.5)", flexWrap: "wrap" }}>
            <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>Home</Link>
            <span>/</span>
            <Link href="/blog" style={{ color: "inherit", textDecoration: "none" }}>Blog</Link>
            <span>/</span>
            <span style={{ color: "rgba(255,255,255,0.8)" }}>{post.category}</span>
          </nav>
          <span className="badge badge-white" style={{ marginBottom: "1.25rem" }}>{post.category}</span>
          <h1 className="heading-lg" style={{ color: "white", marginBottom: "1.25rem" }}>{post.title}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", color: "rgba(255,255,255,0.55)", fontSize: "0.875rem", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{ width: "32px", height: "32px", background: "rgba(255,255,255,0.12)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "white", fontSize: "0.875rem" }}>
                {post.author.charAt(0)}
              </div>
              <span>{post.author}</span>
            </div>
            <span>·</span>
            <span>{post.date}</span>
            <span>·</span>
            <span>{post.readTime}</span>
          </div>
        </div>
      </div>

      <div className="container-narrow" style={{ padding: "3rem 1.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "3rem", alignItems: "start" }}>
          {/* Article */}
          <article>
            {/* Intro */}
            <p style={{ fontSize: "1.125rem", color: "var(--gray-700)", lineHeight: 1.85, marginBottom: "2.5rem", fontWeight: 500, borderLeft: "4px solid var(--red)", paddingLeft: "1.25rem" }}>
              {content.intro}
            </p>

            {/* Sections */}
            {content.sections.map((section, i) => (
              <div key={i} style={{ marginBottom: "2.25rem" }}>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--navy)", marginBottom: "0.875rem" }}>
                  {section.heading}
                </h2>
                <p style={{ color: "var(--gray-600)", lineHeight: 1.85, fontSize: "1rem" }}>
                  {section.body}
                </p>
              </div>
            ))}

            {/* CTA block */}
            <div style={{ background: "linear-gradient(135deg, var(--navy), #2a3d8f)", borderRadius: "var(--radius-xl)", padding: "2.5rem", textAlign: "center", margin: "3rem 0" }}>
              <h3 style={{ fontWeight: 800, fontSize: "1.375rem", color: "white", marginBottom: "0.875rem" }}>
                Ready to find a {post.category} professional?
              </h3>
              <p style={{ color: "rgba(255,255,255,0.7)", marginBottom: "1.75rem", fontSize: "0.9375rem", lineHeight: 1.65 }}>
                Every contractor on Smart Choice is local and professional, with reviews from real homeowners. Getting quotes is free and takes about two minutes.
              </p>
              <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                <Link href={`/request-quote?service=${categoryService}`} className="btn-white">
                  Get Free Quotes
                </Link>
                <Link href={`/services/${categoryService}`} className="btn-outline-white">
                  Browse {post.category} Pros
                </Link>
              </div>
            </div>

            {/* Author bio */}
            <div style={{ background: "var(--gray-50)", borderRadius: "var(--radius-lg)", padding: "1.5rem", display: "flex", gap: "1.25rem", alignItems: "flex-start" }}>
              <div style={{ width: "52px", height: "52px", background: "var(--navy)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: "1.25rem", flexShrink: 0 }}>
                {post.author.charAt(0)}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "0.375rem" }}>{post.author}</div>
                <p style={{ fontSize: "0.875rem", color: "var(--gray-500)", lineHeight: 1.65 }}>
                  Contributing writer at Smart Choice Constructions with expertise in home improvement, contractor selection, and residential construction. Writes based on research and input from licensed professionals in our network.
                </p>
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside style={{ position: "sticky", top: "96px", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {/* Table of contents */}
            <div className="card" style={{ padding: "1.5rem" }}>
              <h3 style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "1rem", fontSize: "0.9375rem" }}>
                In This Article
              </h3>
              {content.sections.map((s, i) => (
                <div key={i} style={{ display: "flex", gap: "0.625rem", padding: "0.5rem 0", borderBottom: i < content.sections.length - 1 ? "1px solid var(--gray-50)" : "none" }}>
                  <span style={{ color: "var(--red)", fontWeight: 700, fontSize: "0.8125rem", flexShrink: 0, marginTop: "1px" }}>{i + 1}</span>
                  <span style={{ fontSize: "0.8125rem", color: "var(--gray-600)", lineHeight: 1.4 }}>{s.heading.replace(/^\d+\.\s/, "")}</span>
                </div>
              ))}
            </div>

            {/* Quick CTA */}
            <div style={{ background: "var(--navy)", borderRadius: "var(--radius-lg)", padding: "1.5rem", textAlign: "center" }}>
              <div style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>{post.category === "Roofing" ? "🏠" : post.category === "Kitchen" ? "🍳" : post.category === "Bathroom" ? "🛁" : "❄️"}</div>
              <h3 style={{ fontWeight: 700, color: "white", marginBottom: "0.625rem", fontSize: "1rem" }}>
                Find a {post.category} Pro
              </h3>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8125rem", marginBottom: "1.25rem", lineHeight: 1.6 }}>
                Verified contractors. Free quotes. No commitment.
              </p>
              <Link href={`/services/${categoryService}`} className="btn-white" style={{ display: "block", fontSize: "0.875rem", padding: "0.75rem 1rem" }}>
                Browse Contractors
              </Link>
            </div>

            {/* Related posts */}
            <div className="card" style={{ padding: "1.5rem" }}>
              <h3 style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "1rem", fontSize: "0.9375rem" }}>Related Articles</h3>
              {related.map(p => (
                <Link key={p.slug} href={`/blog/${p.slug}`}
                  style={{ display: "flex", gap: "0.75rem", padding: "0.75rem 0", borderBottom: "1px solid var(--gray-50)", textDecoration: "none", alignItems: "flex-start" }}
                  className="related-post-link">
                  <span style={{ fontSize: "1.25rem", flexShrink: 0, marginTop: "1px" }}>
                    {p.category === "Roofing" ? "🏠" : p.category === "Kitchen" ? "🍳" : p.category === "Bathroom" ? "🛁" : "❄️"}
                  </span>
                  <div>
                    <div style={{ fontWeight: 600, color: "var(--navy)", fontSize: "0.875rem", lineHeight: 1.35, marginBottom: "0.25rem" }}>{p.title}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--gray-400)" }}>{p.readTime}</div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Rating trust signal */}
            <div className="card" style={{ padding: "1.25rem", textAlign: "center" }}>
              <Stars count={5} />
              <div style={{ fontWeight: 800, fontSize: "1.5rem", color: "var(--navy)", margin: "0.5rem 0 0.25rem" }}>4.8</div>
              <div style={{ fontSize: "0.8125rem", color: "var(--gray-400)" }}>Average contractor rating<br />from 12,483 verified reviews</div>
            </div>
          </aside>
        </div>
      </div>

      <style>{`.related-post-link:hover div { color: var(--red) !important; }`}</style>
    </div>
  );
}
