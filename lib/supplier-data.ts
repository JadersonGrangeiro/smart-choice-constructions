/**
 * Smart Choice Constructions — Local Suppliers Ecosystem
 *
 * Separate data layer for the supplier/partner ecosystem.
 * Mirrors the contractor data structure but with supplier-specific fields.
 *
 * In production: replace all MOCK_* exports with database queries.
 */

// ─── Supplier Categories ─────────────────────────────────────────────────────

export interface SupplierCategory {
  id:          string;
  name:        string;
  icon:        string;
  description: string;
  color:       string;
  group:       "materials" | "equipment" | "professional" | "services";
}

export const SUPPLIER_CATEGORIES: SupplierCategory[] = [
  // Materials — physical products for construction
  { id: "building-materials",    name: "Building Materials",     icon: "🧱", color: "#92400e", group: "materials",     description: "Lumber, steel, concrete, framing materials, and general construction supplies." },
  { id: "roofing-supplies",      name: "Roofing Supplies",       icon: "🏠", color: "#1e3a5f", group: "materials",     description: "Shingles, underlayment, flashing, gutters, and roofing accessories." },
  { id: "electrical-supplies",   name: "Electrical Supplies",    icon: "⚡", color: "#d97706", group: "materials",     description: "Wire, conduit, panels, fixtures, switches, outlets, and electrical accessories." },
  { id: "plumbing-supplies",     name: "Plumbing Supplies",      icon: "🚰", color: "#0369a1", group: "materials",     description: "Pipes, fittings, fixtures, water heaters, and plumbing tools." },
  { id: "hvac-supplies",         name: "HVAC Supplies",          icon: "❄️", color: "#0891b2", group: "materials",     description: "AC units, furnaces, ductwork, vents, thermostats, and HVAC parts." },
  { id: "flooring-stores",       name: "Flooring Stores",        icon: "🪵", color: "#78350f", group: "materials",     description: "Hardwood, tile, carpet, LVP, laminate, and specialty flooring." },
  { id: "paint-stores",          name: "Paint & Coatings",       icon: "🎨", color: "#7c3aed", group: "materials",     description: "Interior and exterior paints, stains, primers, and coating supplies." },
  { id: "lumber-yards",          name: "Lumber Yards",           icon: "🌲", color: "#166534", group: "materials",     description: "Dimensional lumber, sheet goods, engineered wood, and framing supplies." },
  { id: "concrete-suppliers",    name: "Concrete & Masonry",     icon: "🪨", color: "#374151", group: "materials",     description: "Ready-mix concrete, block, brick, stone, and masonry materials." },
  { id: "kitchen-showrooms",     name: "Kitchen Showrooms",      icon: "🍳", color: "#047857", group: "materials",     description: "Cabinets, countertops, kitchen islands, sinks, and appliances." },
  { id: "bathroom-showrooms",    name: "Bathroom Showrooms",     icon: "🛁", color: "#0f766e", group: "materials",     description: "Vanities, toilets, showers, bathtubs, tile, and bathroom fixtures." },
  { id: "window-suppliers",      name: "Window Suppliers",       icon: "🪟", color: "#1d4ed8", group: "materials",     description: "Vinyl, wood, aluminum, and fiberglass windows for new construction and replacement." },
  { id: "door-suppliers",        name: "Door Suppliers",         icon: "🚪", color: "#1e40af", group: "materials",     description: "Interior, exterior, sliding, and specialty doors — stock and custom." },
  { id: "insulation-suppliers",  name: "Insulation Suppliers",   icon: "🏡", color: "#9a3412", group: "materials",     description: "Fiberglass, spray foam, blown-in, and rigid foam insulation products." },
  { id: "landscape-supplies",    name: "Landscape Supplies",     icon: "🌿", color: "#15803d", group: "materials",     description: "Plants, mulch, topsoil, pavers, retaining wall block, and landscape materials." },
  { id: "solar-companies",       name: "Solar & Energy",         icon: "☀️", color: "#b45309", group: "materials",     description: "Solar panels, batteries, inverters, and EV charging equipment." },
  // Equipment
  { id: "tool-suppliers",        name: "Tool Suppliers",         icon: "🔧", color: "#475569", group: "equipment",    description: "Power tools, hand tools, safety equipment, and contractor supplies." },
  { id: "equipment-rental",      name: "Equipment Rental",       icon: "🏗️", color: "#374151", group: "equipment",    description: "Excavators, lifts, compactors, scaffolding, and heavy equipment rental." },
  { id: "dumpster-rental",       name: "Dumpster Rental",        icon: "♻️", color: "#4d7c0f", group: "equipment",    description: "Roll-off dumpsters for construction debris, demo waste, and cleanouts." },
  // Professional services
  { id: "architects",            name: "Architects",             icon: "📐", color: "#1e3a5f", group: "professional", description: "Licensed architects for residential, commercial, and mixed-use design." },
  { id: "engineers",             name: "Structural Engineers",   icon: "🏛️", color: "#162E5E", group: "professional", description: "Structural, civil, and MEP engineering for new builds and renovations." },
  { id: "interior-designers",    name: "Interior Designers",     icon: "🛋️", color: "#9333ea", group: "professional", description: "Residential and commercial interior design, space planning, and staging." },
  { id: "home-inspectors",       name: "Home Inspectors",        icon: "🔍", color: "#0f172a", group: "professional", description: "Pre-purchase, new construction, and specialty home inspections." },
  { id: "insurance-providers",   name: "Insurance Providers",    icon: "🛡️", color: "#0369a1", group: "professional", description: "Home, flood, builder's risk, and contractor liability insurance." },
  // Support services
  { id: "cleaning-services",     name: "Post-Construction Cleaning",icon: "🧹", color: "#475569", group: "services",   description: "Final construction cleanup, debris removal, and move-in-ready cleaning." },
  { id: "moving-companies",      name: "Moving Companies",       icon: "🚛", color: "#7c2d12", group: "services",     description: "Local and long-distance moving, packing services, and storage." },
  { id: "storage-units",         name: "Storage Solutions",      icon: "📦", color: "#44403c", group: "services",     description: "On-site storage pods, self-storage facilities, and climate-controlled units." },
];

// ─── Supplier type ────────────────────────────────────────────────────────────

export interface Supplier {
  id:           string;
  name:         string;
  categoryId:   string;
  location:     string;
  city:         string;
  stateCode:    string;
  address:      string;
  phone:        string;
  email:        string;
  website:      string;
  rating:       number;
  reviews:      number;
  description:  string;
  brands:       string[];
  products:     string[];
  hours:        string;
  yearsInBusiness: number;
  verified:     boolean;
  featured:     boolean;
  instagram?:   string;
  facebook?:    string;
  linkedin?:    string;
}

// ─── Mock suppliers ───────────────────────────────────────────────────────────

export const MOCK_SUPPLIERS: Supplier[] = [
  {
    id: "s1",
    name: "Texas Building Supply Co.",
    categoryId: "building-materials",
    location: "Austin, TX",
    city: "Austin",
    stateCode: "TX",
    address: "4801 E Ben White Blvd, Austin, TX 78741",
    phone: "+1 (512) 555-0201",
    email: "info@texasbuilding.com",
    website: "https://www.texasbuilding.com",
    rating: 4.7,
    reviews: 312,
    description: "Full-service building materials supplier serving Central Texas contractors since 1998. Stock includes dimensional lumber, sheet goods, concrete, masonry, and contractor-grade supplies. Pro accounts available with net-30 terms and dedicated account managers.",
    brands: ["James Hardie", "LP SmartSide", "Georgia-Pacific", "USG", "National Gypsum"],
    products: ["Dimensional Lumber", "OSB & Plywood", "Concrete Block", "Drywall", "Framing Hardware", "Insulation"],
    hours: "Mon–Fri 6:00 AM–6:00 PM · Sat 7:00 AM–4:00 PM",
    yearsInBusiness: 27,
    verified: true,
    featured: true,
    facebook: "https://facebook.com/texasbuilding",
  },
  {
    id: "s2",
    name: "Lone Star Roofing Supply",
    categoryId: "roofing-supplies",
    location: "Dallas, TX",
    city: "Dallas",
    stateCode: "TX",
    address: "2200 Irving Blvd, Dallas, TX 75207",
    phone: "+1 (214) 555-0218",
    email: "sales@lonestarroofing.com",
    website: "https://www.lonestarroofing.com",
    rating: 4.8,
    reviews: 198,
    description: "Wholesale and retail roofing materials for residential and commercial projects across DFW. Same-day delivery available within 30 miles. GAF Certified Distributor and Owens Corning Preferred Supplier.",
    brands: ["GAF", "Owens Corning", "CertainTeed", "IKO", "Atlas", "TAMKO", "Boral"],
    products: ["Asphalt Shingles", "Metal Roofing", "Underlayment", "Ice & Water Shield", "Ridge Caps", "Gutters & Downspouts"],
    hours: "Mon–Fri 7:00 AM–5:00 PM · Sat 7:00 AM–12:00 PM",
    yearsInBusiness: 15,
    verified: true,
    featured: false,
  },
  {
    id: "s3",
    name: "Chicago Electrical Wholesalers",
    categoryId: "electrical-supplies",
    location: "Chicago, IL",
    city: "Chicago",
    stateCode: "IL",
    address: "1400 W Diversey Pkwy, Chicago, IL 60614",
    phone: "+1 (312) 555-0235",
    email: "trade@chicagoelectric.com",
    website: "https://www.chicagoelectric.com",
    rating: 4.9,
    reviews: 421,
    description: "Trade-only electrical distributor with over 40,000 SKUs in stock. Panel boards to LED drivers, wire by the foot or spool, commercial lighting packages, and contractor pricing. Next-day delivery across metro Chicago.",
    brands: ["Siemens", "Square D", "Eaton", "Leviton", "Hubbell", "Lutron", "Philips Lighting"],
    products: ["Wire & Cable", "Panel Boards", "Circuit Breakers", "Conduit & Fittings", "LED Fixtures", "Smart Controls"],
    hours: "Mon–Fri 6:30 AM–5:30 PM · Sat 7:00 AM–1:00 PM",
    yearsInBusiness: 32,
    verified: true,
    featured: true,
    linkedin: "https://linkedin.com/company/chicago-electrical",
  },
  {
    id: "s4",
    name: "Pacific Plumbing Supply",
    categoryId: "plumbing-supplies",
    location: "Seattle, WA",
    city: "Seattle",
    stateCode: "WA",
    address: "800 2nd Ave Ext S, Seattle, WA 98134",
    phone: "+1 (206) 555-0244",
    email: "info@pacificplumbing.com",
    website: "https://www.pacificplumbing.com",
    rating: 4.7,
    reviews: 267,
    description: "Commercial and residential plumbing supply house serving the Pacific Northwest for 20+ years. Broad stock of copper, PEX, CPVC, and cast iron. Showroom open to homeowners; trade counter for licensed contractors with daily truck deliveries.",
    brands: ["Kohler", "Moen", "Delta", "American Standard", "NIBCO", "Watts", "Rheem"],
    products: ["PEX Tubing", "Copper Fittings", "Fixtures & Faucets", "Water Heaters", "Pumps & Valves", "Drain & Sewer"],
    hours: "Mon–Fri 7:00 AM–5:30 PM · Sat 8:00 AM–2:00 PM",
    yearsInBusiness: 22,
    verified: true,
    featured: false,
  },
  {
    id: "s5",
    name: "Arizona Floor Gallery",
    categoryId: "flooring-stores",
    location: "Phoenix, AZ",
    city: "Phoenix",
    stateCode: "AZ",
    address: "3120 E Camelback Rd, Phoenix, AZ 85016",
    phone: "+1 (602) 555-0256",
    email: "design@azfloorgallery.com",
    website: "https://www.azfloorgallery.com",
    rating: 4.8,
    reviews: 184,
    description: "Showroom featuring 5,000+ flooring samples across hardwood, tile, carpet, LVP, and natural stone. Free in-home consultations. Licensed installation crews available. Contractor discount program for qualified professionals.",
    brands: ["Shaw", "Mohawk", "Armstrong", "Pergo", "Florida Tile", "Daltile", "Karndean"],
    products: ["Hardwood Flooring", "Luxury Vinyl Plank", "Porcelain Tile", "Carpet", "Natural Stone", "Cork & Bamboo"],
    hours: "Mon–Fri 9:00 AM–6:00 PM · Sat 9:00 AM–5:00 PM · Sun 11:00 AM–4:00 PM",
    yearsInBusiness: 18,
    verified: true,
    featured: false,
    instagram: "https://instagram.com/azfloorgallery",
  },
  {
    id: "s6",
    name: "Metro Kitchen & Bath Design",
    categoryId: "kitchen-showrooms",
    location: "Nashville, TN",
    city: "Nashville",
    stateCode: "TN",
    address: "150 4th Ave N, Nashville, TN 37219",
    phone: "+1 (615) 555-0267",
    email: "hello@metrokitchenbath.com",
    website: "https://www.metrokitchenbath.com",
    rating: 4.9,
    reviews: 143,
    description: "Full-service kitchen and bath design studio with 3D rendering capabilities. Cabinetry to countertops, we help homeowners and contractors visualize and specify complete kitchen packages. Certified kitchen designers (CKD) on staff.",
    brands: ["Kraftmaid", "Waypoint Living Spaces", "Cambria", "Silestone", "Blanco", "Rohl", "Sub-Zero"],
    products: ["Custom Cabinetry", "Quartz Countertops", "Kitchen Islands", "Under-Cabinet Lighting", "Pantry Systems", "Hardware"],
    hours: "Mon–Sat 9:00 AM–5:00 PM (by appointment preferred)",
    yearsInBusiness: 11,
    verified: true,
    featured: true,
    instagram: "https://instagram.com/metrokitchenbath",
    facebook: "https://facebook.com/metrokitchenbath",
  },
  {
    id: "s7",
    name: "Southeast Equipment Rental",
    categoryId: "equipment-rental",
    location: "Atlanta, GA",
    city: "Atlanta",
    stateCode: "GA",
    address: "6200 Peachtree Ind Blvd, Atlanta, GA 30360",
    phone: "+1 (404) 555-0278",
    email: "rentals@southeastequip.com",
    website: "https://www.southeastequip.com",
    rating: 4.6,
    reviews: 89,
    description: "Full fleet of construction equipment available daily, weekly, and monthly. Mini excavators, skid steers, scissor lifts, towable booms, compactors, and concrete equipment. Delivery and pickup available within 50 miles of Atlanta.",
    brands: ["Caterpillar", "JLG", "Genie", "Bobcat", "Multiquip", "Husqvarna"],
    products: ["Mini Excavators", "Skid Steer Loaders", "Scissor Lifts", "Boom Lifts", "Plate Compactors", "Concrete Saws"],
    hours: "Mon–Fri 7:00 AM–5:00 PM · Sat 7:00 AM–12:00 PM (24/7 emergency available)",
    yearsInBusiness: 14,
    verified: true,
    featured: false,
  },
  {
    id: "s8",
    name: "Sunshine Solar & Energy",
    categoryId: "solar-companies",
    location: "Orlando, FL",
    city: "Orlando",
    stateCode: "FL",
    address: "1200 N Orange Ave, Orlando, FL 32804",
    phone: "+1 (407) 555-0289",
    email: "info@sunshinesolar.com",
    website: "https://www.sunshinesolar.com",
    rating: 4.7,
    reviews: 156,
    description: "Florida-based solar distributor and installation partner. Panels, inverters, battery storage systems, and EV charging equipment. Wholesale pricing for licensed solar installers. State-certified inspection coordination.",
    brands: ["LG Solar", "Enphase", "SolarEdge", "Tesla Powerwall", "SunPower", "Canadian Solar"],
    products: ["Solar Panels", "String Inverters", "Microinverters", "Battery Storage", "EV Chargers", "Monitoring Systems"],
    hours: "Mon–Fri 8:00 AM–5:00 PM",
    yearsInBusiness: 9,
    verified: true,
    featured: false,
  },
  {
    id: "s9",
    name: "Denver Design Studio",
    categoryId: "interior-designers",
    location: "Denver, CO",
    city: "Denver",
    stateCode: "CO",
    address: "1430 Larimer St, Denver, CO 80202",
    phone: "+1 (720) 555-0291",
    email: "studio@denverdesign.com",
    website: "https://www.denverdesign.com",
    rating: 5.0,
    reviews: 67,
    description: "Award-winning interior design firm specializing in mountain-modern residential renovations. Full-service from concept to completion. Certified Interior Designer (CID) credentials. Contractor coordination and furniture procurement.",
    brands: ["Room & Board", "Restoration Hardware", "Visual Comfort", "Rejuvenation", "Walker Zanger"],
    products: ["Space Planning", "3D Renderings", "Material Sourcing", "Furniture Specification", "Lighting Design", "Color Consulting"],
    hours: "Mon–Fri 9:00 AM–5:00 PM (appointments required)",
    yearsInBusiness: 8,
    verified: true,
    featured: true,
    instagram: "https://instagram.com/denverdesignstudio",
  },
  {
    id: "s10",
    name: "National Home Inspectors",
    categoryId: "home-inspectors",
    location: "Houston, TX",
    city: "Houston",
    stateCode: "TX",
    address: "9801 Westheimer Rd, Houston, TX 77042",
    phone: "+1 (713) 555-0302",
    email: "schedule@nationalhomeinspect.com",
    website: "https://www.nationalhomeinspect.com",
    rating: 4.8,
    reviews: 534,
    description: "InterNACHI Certified home inspectors covering all of Greater Houston. Pre-purchase, new construction, 11-month warranty, and specialty inspections (pools, roofs, mold, HVAC). Same-week scheduling. Detailed digital reports within 24 hours.",
    brands: ["InterNACHI", "TREC Licensed"],
    products: ["Pre-Purchase Inspection", "New Construction Phases", "11-Month Warranty", "Mold Assessment", "Pool & Spa", "Roof Certification"],
    hours: "7 days a week · 7:00 AM–8:00 PM",
    yearsInBusiness: 12,
    verified: true,
    featured: false,
  },
];

// ─── Helper functions ─────────────────────────────────────────────────────────

export function getSupplierCategoryById(id: string): SupplierCategory | undefined {
  return SUPPLIER_CATEGORIES.find(c => c.id === id);
}

export function getSuppliersByCategory(categoryId: string): Supplier[] {
  return MOCK_SUPPLIERS.filter(s => s.categoryId === categoryId);
}

export function getSuppliersByState(stateCode: string): Supplier[] {
  return MOCK_SUPPLIERS.filter(s => s.stateCode === stateCode);
}

export function getSuppliersByCity(city: string, stateCode: string): Supplier[] {
  return MOCK_SUPPLIERS.filter(s =>
    s.stateCode === stateCode &&
    s.city.toLowerCase() === city.toLowerCase()
  );
}

export function getFeaturedSuppliers(limit = 6): Supplier[] {
  return MOCK_SUPPLIERS.filter(s => s.featured).slice(0, limit);
}

export function getRelatedSuppliers(supplierId: string, categoryId: string, limit = 3): Supplier[] {
  return MOCK_SUPPLIERS.filter(s => s.id !== supplierId && s.categoryId === categoryId).slice(0, limit);
}

export const SUPPLIER_CATEGORY_GROUPS = {
  materials:    "Building Materials",
  equipment:    "Equipment & Tools",
  professional: "Professional Services",
  services:     "Support Services",
};
