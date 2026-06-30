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
  "electrical-panel-upgrade-signs": {
    intro: "Your home's electrical panel is the backbone of every outlet, light switch, and appliance in the house. Most homeowners ignore it until something fails — and by that point, what could have been a straightforward upgrade has become an emergency. Knowing the warning signs can prevent serious damage and, in the worst cases, an electrical fire that starts silently inside a finished wall.",
    sections: [
      { heading: "1. Your breakers trip frequently and won't reset cleanly", body: "A breaker tripping once in a while is normal. A breaker that trips repeatedly under ordinary load, or that won't reset without a fight, is telling you something. Either that circuit is overloaded beyond what the breaker can handle, or the breaker itself has failed. In older panels, both happen together. When multiple circuits trip frequently, the issue is usually the panel itself — not enough capacity for the actual demand your home is placing on it. A licensed electrician can run a load analysis to determine whether your panel is undersized for your current usage." },
      { heading: "2. You're adding a major appliance or EV charger", body: "Electric vehicles, heat pumps, electric dryers, induction cooktops, and whole-home generators are high-draw loads that most older panels were never designed to support. A standard 100-amp panel is fine for a modest home with basic appliances. But adding a Level 2 EV charger — which typically draws 40 to 48 amps — to a home already near capacity will trip breakers constantly and stress every component in the panel. Before installing any major appliance, have an electrician assess your available capacity. The answer is often a panel upgrade to 200 or even 400 amps." },
      { heading: "3. Your panel is 25 or more years old", body: "Standard circuit breakers are rated for 20,000 to 100,000 operations over their lifetime. In a panel that's 25 or 30 years old, many of those operations have already happened. Breakers that have aged past their rated life may fail to trip when they should — which is far more dangerous than one that trips too often. Additionally, certain manufacturers produced panels through the 1970s and 1990s that are now known to be defective and are flagged by insurance companies and home inspectors nationwide. If your panel is more than two decades old, have it inspected regardless of how it appears to be performing." },
      { heading: "4. Lights flicker or dim when appliances cycle on", body: "When your lights dim every time the refrigerator compressor kicks on, or the overhead light in the kitchen flickers when the microwave runs, the panel is struggling to maintain stable voltage across circuits. This happens when the panel is drawing close to its capacity limit. Lights and sensitive electronics can sustain damage from sustained voltage fluctuations over time. Flickering also points to deteriorating grounding and neutral connections inside the panel — a condition that requires professional evaluation before it worsens." },
      { heading: "5. You smell burning or see scorch marks near the panel", body: "Any burning smell coming from your electrical panel is an emergency. Shut off the main breaker and call a licensed electrician immediately — not tomorrow, now. Burning odors indicate that wiring insulation is melting or arcing is occurring inside the enclosure. These conditions precede electrical fires. Similarly, any scorch marks, blackening around breaker slots, or melted plastic visible inside the panel door mean the same thing: the panel is failing and needs immediate replacement. There is no safe way to defer this." },
      { heading: "What a panel upgrade actually involves", body: "A panel upgrade means removing the existing panel, installing a new main breaker panel at the correct amperage, rewiring the circuits to the new enclosure, and verifying the grounding and bonding. Most jobs take a licensed electrician one to two days. A permit is required in every jurisdiction and triggers at least one inspection by your local building department after the work is complete. Costs vary significantly by region and panel size, but a 200-amp upgrade typically runs $1,500 to $4,000 all-in, including labor, materials, and permit fees. On Smart Choice, you can connect with licensed electricians in your area who specialize in panel upgrades and coordinate directly with your utility company." },
    ],
  },
  "ev-charger-installation-guide": {
    intro: "Electric vehicle ownership in the United States has passed 10 million and continues to accelerate. Most EV owners charge primarily at home — and for good reason: home charging is cheaper per mile, more convenient, and lets you start every day with a full battery. But a home EV charger installation involves more than running an extension cord. There's panel capacity to evaluate, wiring to run, permits to pull, and an equipment choice that will affect your daily driving for years.",
    sections: [
      { heading: "Level 1 vs. Level 2: the real difference", body: "Every EV comes with a Level 1 charging cable that plugs into a standard 120V outlet. This is the slowest option: most EVs gain roughly 3 to 5 miles of range per hour of charging. For a short commute or a plug-in hybrid, Level 1 may be adequate. For a long-range EV with an 80kWh+ battery, Level 1 alone isn't practical — a fully depleted battery could take 40 hours or more to top off. Level 2 charging operates on 240V — the same voltage as a dryer or electric range — and delivers 20 to 60 miles of range per hour depending on the charger's amperage. For the vast majority of homeowners with a full battery EV, Level 2 is the right choice." },
      { heading: "What your panel can handle — and what it can't", body: "A Level 2 home charger typically requires a dedicated 40-amp or 50-amp circuit on a 240V branch. Before any equipment is ordered, an electrician needs to assess your panel's available capacity. A 100-amp panel serving a home near its load limit may not have room for an EV circuit without upgrading the panel first. A 200-amp panel with available breaker slots can usually accommodate the circuit directly. The electrician will look at your total load calculation, available breaker positions, and whether the service entrance cable can handle the additional continuous draw." },
      { heading: "Permits and utility coordination", body: "EV charger installation requires a permit in virtually every jurisdiction in the United States. The permit process involves a plan review and at least one inspection by a licensed electrical inspector after the work is complete. Some utilities also require advance notification when significant new electrical loads are added to their grid — particularly for chargers at 48 amps and above that may affect transformer capacity in older neighborhoods. Your electrician should handle the permit application and schedule the inspection. If they suggest skipping the permit, that's a red flag for both code compliance and your homeowner's insurance." },
      { heading: "Choosing the right charging equipment", body: "The charger unit itself is called an EVSE (Electric Vehicle Supply Equipment). Key specs to evaluate: amperage output (most homes benefit from a 32A or 48A unit), cable length (18 to 25 feet covers most garage configurations), smart features like scheduling and energy monitoring via app, and weatherproofing if outdoor installation is planned. Major brands include ChargePoint, Grizzl-E, JuiceBox, and Tesla's Wall Connector. For non-Tesla vehicles, confirm NACS or J1772 connector compatibility depending on your vehicle model and year. For most homeowners, a 48-amp Level 2 charger on a 60-amp dedicated circuit is the right specification for current and future needs." },
      { heading: "Garage vs. exterior installation", body: "Most homeowners install the EVSE in the garage, as close to the vehicle's charge port as possible. If garage access isn't available, weatherproof exterior installations on an exterior wall or a dedicated post are standard practice. The key cost driver is distance: the further the new circuit needs to run from the panel, the higher the installation cost, since longer wire runs require larger conductor gauge to prevent voltage drop. If the panel is on the opposite side of the house from the garage, costs can double or triple compared to a short run. An electrician will assess the optimal path and provide options with pricing." },
      { heading: "What to expect on installation day", body: "A straightforward installation — panel has capacity, charger mounts near the panel, short wire run — typically costs $800 to $1,500 all-in including equipment, labor, and permit fees. Costs rise with panel upgrade requirements, long wire runs, conduit through finished walls, or trenching for exterior conduit paths. On the day of installation, the electrician will run the circuit, mount and wire the EVSE, restore power, and test the charging function. After the building inspection passes, you're authorized to charge. The majority of standard installations complete in a single day. On Smart Choice, you can find licensed electricians in your area who specialize in EV installations and can provide same-week scheduling." },
    ],
  },
  "backyard-renovation-budget-planning": {
    intro: "A well-planned backyard renovation can fundamentally change how you use your home — extending living space outdoors, adding a destination for family and guests, and delivering measurable value at resale. But without a clear plan, it's easy to spend money in the wrong order and end up with a space that feels unfinished despite significant investment. Whether you have $5,000 or $75,000, the planning process is the same: define how you want to use the space, work backward to the elements that support that use, and sequence the work so each phase builds correctly on the last.",
    sections: [
      { heading: "Define your primary use case before anything else", body: "Before you talk to a contractor or look at a single material sample, answer one question: what do you actually want to do back there? A family with young children has different needs than a couple who entertains frequently, which is entirely different from a homeowner who wants a low-maintenance retreat. Your use case determines everything — the hardscape footprint, the plant selection, the furniture scale, the lighting requirements, and the irrigation design. Write it down in one or two sentences before any planning conversation, because every contractor will ask and your answer will shape the entire scope and budget." },
      { heading: "Separate baseline work from aspirational features", body: "Most successful backyard renovations happen in phases. Start by identifying what's a baseline requirement — drainage correction, grading issues, removal of overgrown landscape, or a failing retaining wall — versus what's aspirational, like an outdoor kitchen, fire pit, or pergola. Phase one should always address site problems first and create the foundational hardscape. Phase two adds features that extend your usable season or serve entertainment needs. Phase three is finish work: lighting, planting, furniture, and accessories. This prevents the most common mistake in backyard projects — installing a beautiful deck before fixing a drainage problem that will eventually rot the framing." },
      { heading: "Where your budget actually goes", body: "Labor typically represents 40 to 60 percent of a landscaping or hardscape project. Materials for a well-built project aren't cheap: concrete pavers, quality lumber, irrigation components, and established plants all add up quickly. Where homeowners waste money: impulse additions mid-project that weren't in the original scope, low-grade materials that need replacement within five years, and skipping site prep to reduce the initial bid. Where homeowners save wisely: choosing durable over premium where it's aesthetically equivalent (stamped concrete versus natural stone, pressure-treated lumber versus cedar), buying plants in fall when nurseries discount for end-of-season clearance, and phasing the work over two seasons rather than borrowing to fund it all at once." },
      { heading: "Understand permit requirements before you break ground", body: "Many common backyard improvements require building permits. Decks above a certain height from grade, swimming pools and spas, pergolas with electrical, retaining walls above a specific height threshold, and detached structures all typically require permits with inspections at multiple stages. The specific thresholds vary by municipality — in some cities, a deck over 12 inches off grade needs a permit; in others, 30 inches is the threshold. Your contractor should know your local requirements and handle the permit process. Unpermitted work can complicate a sale and may need to be demolished or brought into compliance at your expense years later when a buyer's inspector flags it." },
      { heading: "How to evaluate and compare contractors", body: "For backyard renovations, you typically need a landscape contractor for plants, grading, and irrigation, and possibly a separate hardscape or deck contractor depending on the scope. The most important step in contractor selection is asking for references from similar projects — not testimonials on a website, but actual homeowners you call directly and ask specifically about the project sequence, how change orders were handled, and whether the contractor communicated proactively when problems arose. Request a detailed written scope before comparing quotes: two bids for 'a patio and some landscaping' may describe entirely different scopes and specifications. The cheapest bid should prompt questions, not just excitement." },
      { heading: "Final checklist before you start", body: "A few things consistently make backyard renovations go smoother: discuss drainage in detail before work begins, confirm material selections and availability before signing a contract (pavers and specific lumber species can have extended lead times), and establish a payment schedule tied to milestones rather than dates. Leave a 10 to 15 percent contingency in your budget for unexpected site conditions — especially on older properties where buried irrigation conflicts, old concrete, or grading surprises are common. On Smart Choice, you can browse local landscaping and hardscape contractors with real reviews from homeowners who've completed similar projects." },
    ],
  },
  "low-maintenance-landscaping-plants": {
    intro: "The biggest mistake homeowners make when landscaping is choosing plants that look beautiful in the nursery but demand constant attention to survive in their actual climate. Low-maintenance landscaping isn't about bare mulch and rock — it's about choosing the right plants for your specific conditions: your soil type, sun exposure, average rainfall, and local temperature extremes. Every plant listed below performs well across wide geographic areas of the United States with minimal intervention once it's properly established.",
    sections: [
      { heading: "Native ornamental grasses — the backbone of low-care landscapes", body: "Native grasses are the workhorse of no-fuss landscaping. Little Bluestem (Schizachyrium scoparium) is native to most of the eastern and central US, thrives in poor soil and full sun, needs no irrigation once established, and produces striking blue-green summer foliage that turns rust-orange in fall — providing color even after frost. Switch Grass (Panicum virgatum) grows in dense upright clumps to four feet and tolerates flooding, drought, and coastal conditions with equal ease. Karl Foerster Feather Reed Grass performs across zones 4–9, provides dramatic vertical structure, and holds its form through the winter months. All three require nothing more than a single annual cutback in late winter." },
      { heading: "Coneflowers and black-eyed Susans for reliable color", body: "Purple Coneflower (Echinacea purpurea) is native to the eastern and central US, blooms from June through September, tolerates clay soil and summer drought, and self-seeds reliably over time. Once established, it needs no supplemental irrigation even in dry summers and no deadheading if you prefer a naturalistic look. Black-Eyed Susan (Rudbeckia hirta) is similarly tough — a biennial or short-lived perennial that naturalizes easily, tolerates poor drainage and drought, and provides brilliant yellow color from summer well into fall. Both plants attract pollinators at a time of year when many other flowers have finished, making them valuable ecologically as well as visually." },
      { heading: "Drought-tolerant shrubs that perform coast to coast", body: "Knock Out Roses are arguably the most important development in residential landscaping of the past quarter century — disease-resistant, repeat-blooming from late spring through frost, cold-hardy to zone 4, and requiring essentially no maintenance beyond a single annual pruning. Spirea (Spiraea japonica) is equally adaptable, blooming in late spring with a dense mounded form that needs no shearing to look tidy and tolerates both drought and clay. For year-round structure, Inkberry Holly (Ilex glabra) is native to the eastern US, provides evergreen presence in all four seasons, tolerates wet conditions that kill most shrubs, and maintains a clean shape without pruning. These three alone can form the backbone of a landscape that performs well for decades." },
      { heading: "Ground covers to replace high-maintenance lawn", body: "Lawn is the most labor-intensive element in most residential landscapes: it requires mowing every one to two weeks, irrigation during dry periods, fertilizing, aerating, and reseeding each season. For areas with light foot traffic, creeping thyme (Thymus serpyllum) is an outstanding alternative — it tolerates drought, spreads reliably to fill gaps, and produces a carpet of small purple flowers in early summer. Liriope (monkey grass) forms dense no-mow borders in zones 4–10 and tolerates both full shade and dry conditions better than almost any other ground cover. Blue Star Creeper (Isotoma fluviatilis) works beautifully between stepping stones in warm climates. Each of these saves significant time and water annually compared to conventional turf." },
      { heading: "Trees that provide value without constant maintenance", body: "The right tree, planted in the right location, is the highest-value landscaping investment you can make. Mature trees provide shade that measurably reduces cooling costs, increase property value by up to 15 percent, and create visual structure that ties an entire landscape together. Service Berry (Amelanchier canadensis) is native to the eastern US, provides four-season interest through spring flowers, early-summer berries, outstanding fall color, and distinctive winter bark — all in a 15–20 foot tree that won't conflict with power lines. River Birch (Betula nigra) is native across most of the country east of the Rockies, tolerates wet soil, and resists the bronze birch borer beetle that kills white-barked species. Both trees need zero supplemental care once established in appropriate soil." },
      { heading: "Working with a landscaping contractor on plant selection", body: "A skilled landscaping contractor will assess your soil composition, drainage patterns, and sun exposure before recommending any specific plants — not the other way around. Be cautious of any contractor who proposes a plant list without first walking your property and evaluating your specific site conditions, since even native plants fail when placed incorrectly. Ask specifically about native species for your region: they're typically better adapted to local rainfall patterns and temperature swings, require less maintenance over time, and support local pollinators and wildlife. Always request a written plant list with the botanical name in addition to the common name, the size at installation, and the expected size at full maturity. This protects you from substitutions and gives you a reference document for the long life of your landscape." },
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
              <div style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>{post.category === "Roofing" ? "🏠" : post.category === "Kitchen" ? "🍳" : post.category === "Bathroom" ? "🛁" : post.category === "HVAC" ? "❄️" : post.category === "Electrical" ? "⚡" : post.category === "Landscaping" ? "🌿" : "🔨"}</div>
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
