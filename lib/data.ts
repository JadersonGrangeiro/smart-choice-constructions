export const COMPANY = {
  name: "Smart Choice Constructions",
  legalName: "Smart Choice Constructions LLC",
  tagline: "Simple, Clear, Complete.",
  phone: process.env.NEXT_PUBLIC_COMPANY_PHONE ?? "(512) 555-0190",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@smartchoiceconstructions.com",
  address: "2222 W Grand River Ave, Ste A, Okemos, MI 48864",
  ein: "35-2894127",
  website: "https://smartchoiceconstructions.com",
  social: {
    facebook: "https://facebook.com/smartchoiceconstructions",
    instagram: "https://instagram.com/smartchoiceconstructions",
    twitter: "https://twitter.com/smartchoiceconstructions",
    linkedin: "https://linkedin.com/company/smartchoiceconstructions",
  },
  pricing: {
    firstMonth: 29.90,
    monthly: 49.90,
  },
};

export const STATS = [
  { value: "50,000+", label: "Verified Contractors" },
  { value: "2.4M+",  label: "Projects Completed" },
  { value: "4.8",    label: "Average Rating" },
  { value: "48",     label: "States Covered" },
];

export const CATEGORIES = [
  { id: "general-contractor",   name: "General Contractor",     icon: "🏗️", color: "#374151" },
  { id: "electrician",          name: "Electrician",            icon: "⚡", color: "#f59e0b" },
  { id: "plumber",              name: "Plumber",                icon: "🔧", color: "#0ea5e9" },
  { id: "hvac",                 name: "HVAC",                   icon: "❄️", color: "#6366f1" },
  { id: "roofing",              name: "Roofing",                icon: "🏠", color: "#162E5E" },
  { id: "carpenter",            name: "Carpenter",              icon: "🪚", color: "#b45309" },
  { id: "painter",              name: "Painter",                icon: "🎨", color: "#ec4899" },
  { id: "drywall",              name: "Drywall",                icon: "🏚️", color: "#78716c" },
  { id: "flooring",             name: "Flooring",               icon: "🪵", color: "#92400e" },
  { id: "masonry",              name: "Masonry",                icon: "🧱", color: "#92400e" },
  { id: "concrete",             name: "Concrete",               icon: "🏗️", color: "#475569" },
  { id: "deck-patio",           name: "Deck & Patio",           icon: "🌅", color: "#d97706" },
  { id: "landscaping",          name: "Landscaping",            icon: "🌿", color: "#16a34a" },
  { id: "doors",                name: "Doors",                  icon: "🚪", color: "#7e22ce" },
  { id: "windows",              name: "Windows",                icon: "🪟", color: "#0284c7" },
  { id: "kitchen-remodeling",   name: "Kitchen Remodeling",     icon: "🍳", color: "#059669" },
  { id: "bathroom-remodeling",  name: "Bathroom Remodeling",    icon: "🛁", color: "#7c3aed" },
  { id: "house-cleaning",       name: "House Cleaning",         icon: "✨", color: "#0891b2" },
  { id: "tree-service",         name: "Tree Service",           icon: "🌳", color: "#166534" },
  { id: "exterior-painting",    name: "Exterior Painting",      icon: "🏡", color: "#0f766e" },
  { id: "interior-painting",    name: "Interior Painting",      icon: "🖌️", color: "#be185d" },
  { id: "remodeling",           name: "Remodeling",             icon: "🔨", color: "#1d4ed8" },
  { id: "installations",        name: "Installations",          icon: "⚙️", color: "#374151" },
  { id: "demolition",           name: "Demolition",             icon: "💥", color: "#b91c1c" },
  { id: "solar",                name: "Solar Panels",           icon: "☀️", color: "#ca8a04" },
  { id: "pools-spas",           name: "Pools & Spas",           icon: "🏊", color: "#0369a1" },
  { id: "garage",               name: "Garage",                 icon: "🚗", color: "#1e40af" },
  { id: "sidewalk-walkway",     name: "Sidewalk & Walkway",     icon: "🛣️", color: "#6b7280" },
  { id: "asphalt-paving",       name: "Asphalt & Paving",       icon: "🛤️", color: "#374151" },
  { id: "waterproofing",        name: "Waterproofing",          icon: "💧", color: "#0284c7" },
  { id: "gardening",            name: "Gardening",              icon: "🌻", color: "#15803d" },
  { id: "pest-control",         name: "Pest Control",           icon: "🐛", color: "#16a34a" },
  { id: "moving",               name: "Moving",                 icon: "📦", color: "#7c3aed" },
  { id: "post-construction-cleaning", name: "Post-Construction Cleaning", icon: "🧹", color: "#0891b2" },
  { id: "fence-gate",           name: "Fence & Gate",           icon: "🔒", color: "#be185d" },
  { id: "siding",               name: "Siding",                 icon: "🏘️", color: "#0f766e" },
  { id: "gutters",              name: "Gutters",                icon: "🌧️", color: "#1d4ed8" },
  { id: "insulation",           name: "Insulation",             icon: "🛡️", color: "#15803d" },
  { id: "foundation-repair",    name: "Foundation Repair",      icon: "🏛️", color: "#6b7280" },
  { id: "tile-stone",           name: "Tile & Stone",           icon: "🔲", color: "#4338ca" },
  { id: "cabinets",             name: "Cabinets",               icon: "🗄️", color: "#854d0e" },
  { id: "pressure-washing",     name: "Pressure Washing",       icon: "💦", color: "#2563eb" },
  { id: "home-additions",       name: "Home Additions",         icon: "➕", color: "#059669" },
  { id: "garage-doors",         name: "Garage Doors",           icon: "🔑", color: "#1e40af" },
  { id: "skylights",            name: "Skylights",              icon: "🌤️", color: "#0284c7" },
  { id: "chimney",              name: "Chimney Services",       icon: "🏠", color: "#6b7280" },
  { id: "epoxy-flooring",       name: "Epoxy Flooring",         icon: "✨", color: "#4338ca" },
  { id: "handyman",             name: "Handyman",               icon: "🔨", color: "#d97706" },
  { id: "appliance-repair",     name: "Appliance Repair",       icon: "🍽️", color: "#6b7280" },
  { id: "fire-damage",          name: "Fire Damage Repair",     icon: "🔥", color: "#dc2626" },
  { id: "water-damage",         name: "Water Damage",           icon: "🌊", color: "#0ea5e9" },
  { id: "mold-removal",         name: "Mold Removal",           icon: "🧪", color: "#15803d" },
  { id: "hardwood-floors",      name: "Hardwood Floors",        icon: "🪵", color: "#92400e" },
  { id: "carpet",               name: "Carpet Installation",    icon: "🟥", color: "#be185d" },
  { id: "stucco",               name: "Stucco",                 icon: "🏛️", color: "#b45309" },
  { id: "smart-home",           name: "Smart Home",             icon: "📱", color: "#0ea5e9" },
  { id: "home-security",        name: "Home Security",          icon: "🔐", color: "#1e40af" },
  { id: "septic",               name: "Septic Services",        icon: "🌱", color: "#15803d" },
  { id: "irrigation",           name: "Irrigation",             icon: "💧", color: "#0369a1" },
  { id: "framing",              name: "Framing",                icon: "📐", color: "#374151" },
  { id: "stone-work",           name: "Stone Work",             icon: "🪨", color: "#78716c" },
  { id: "welding",              name: "Welding",                icon: "⚡", color: "#f59e0b" },
  { id: "custom-homes",         name: "Custom Homes",           icon: "🏘️", color: "#162E5E" },
  { id: "commercial",           name: "Commercial",             icon: "🏢", color: "#374151" },
];

// US States with major cities — scalable JSON structure
// Full cities data will be loaded from /public/data/cities.json in Passo 2
// For now, major cities per state for static generation
export const US_STATES = [
  { code: "AL", name: "Alabama",       slug: "alabama",       cities: ["Birmingham","Montgomery","Huntsville","Mobile","Tuscaloosa"] },
  { code: "AK", name: "Alaska",        slug: "alaska",        cities: ["Anchorage","Fairbanks","Juneau","Sitka","Ketchikan"] },
  { code: "AZ", name: "Arizona",       slug: "arizona",       cities: ["Phoenix","Tucson","Mesa","Chandler","Scottsdale","Glendale","Gilbert","Tempe"] },
  { code: "AR", name: "Arkansas",      slug: "arkansas",      cities: ["Little Rock","Fort Smith","Fayetteville","Springdale","Jonesboro"] },
  { code: "CA", name: "California",    slug: "california",    cities: ["Los Angeles","San Francisco","San Diego","San Jose","Sacramento","Fresno","Oakland","Long Beach"] },
  { code: "CO", name: "Colorado",      slug: "colorado",      cities: ["Denver","Colorado Springs","Aurora","Fort Collins","Boulder","Lakewood"] },
  { code: "CT", name: "Connecticut",   slug: "connecticut",   cities: ["Bridgeport","New Haven","Hartford","Stamford","Waterbury","Norwalk"] },
  { code: "DE", name: "Delaware",      slug: "delaware",      cities: ["Wilmington","Dover","Newark","Middletown","Smyrna"] },
  { code: "FL", name: "Florida",       slug: "florida",       cities: ["Miami","Orlando","Tampa","Jacksonville","Fort Lauderdale","Hialeah","St. Petersburg","Tallahassee"] },
  { code: "GA", name: "Georgia",       slug: "georgia",       cities: ["Atlanta","Augusta","Columbus","Macon","Savannah","Athens","Sandy Springs"] },
  { code: "HI", name: "Hawaii",        slug: "hawaii",        cities: ["Honolulu","Hilo","Kailua","Pearl City","Waipahu"] },
  { code: "ID", name: "Idaho",         slug: "idaho",         cities: ["Boise","Meridian","Nampa","Idaho Falls","Pocatello","Caldwell"] },
  { code: "IL", name: "Illinois",      slug: "illinois",      cities: ["Chicago","Aurora","Rockford","Joliet","Naperville","Springfield","Peoria"] },
  { code: "IN", name: "Indiana",       slug: "indiana",       cities: ["Indianapolis","Fort Wayne","Evansville","South Bend","Carmel","Fishers"] },
  { code: "IA", name: "Iowa",          slug: "iowa",          cities: ["Des Moines","Cedar Rapids","Davenport","Sioux City","Iowa City"] },
  { code: "KS", name: "Kansas",        slug: "kansas",        cities: ["Wichita","Overland Park","Kansas City","Olathe","Topeka","Lawrence"] },
  { code: "KY", name: "Kentucky",      slug: "kentucky",      cities: ["Louisville","Lexington","Bowling Green","Owensboro","Covington"] },
  { code: "LA", name: "Louisiana",     slug: "louisiana",     cities: ["New Orleans","Baton Rouge","Shreveport","Metairie","Lafayette"] },
  { code: "ME", name: "Maine",         slug: "maine",         cities: ["Portland","Lewiston","Bangor","South Portland","Auburn"] },
  { code: "MD", name: "Maryland",      slug: "maryland",      cities: ["Baltimore","Frederick","Rockville","Gaithersburg","Bowie","Hagerstown"] },
  { code: "MA", name: "Massachusetts", slug: "massachusetts", cities: ["Boston","Worcester","Springfield","Cambridge","Lowell","Brockton"] },
  { code: "MI", name: "Michigan",      slug: "michigan",      cities: ["Detroit","Grand Rapids","Warren","Sterling Heights","Lansing","Ann Arbor","Flint"] },
  { code: "MN", name: "Minnesota",     slug: "minnesota",     cities: ["Minneapolis","Saint Paul","Rochester","Duluth","Bloomington","Brooklyn Park"] },
  { code: "MS", name: "Mississippi",   slug: "mississippi",   cities: ["Jackson","Gulfport","Southaven","Hattiesburg","Biloxi"] },
  { code: "MO", name: "Missouri",      slug: "missouri",      cities: ["Kansas City","St. Louis","Springfield","Columbia","Independence"] },
  { code: "MT", name: "Montana",       slug: "montana",       cities: ["Billings","Missoula","Great Falls","Bozeman","Butte"] },
  { code: "NE", name: "Nebraska",      slug: "nebraska",      cities: ["Omaha","Lincoln","Bellevue","Grand Island","Kearney"] },
  { code: "NV", name: "Nevada",        slug: "nevada",        cities: ["Las Vegas","Henderson","Reno","North Las Vegas","Sparks","Carson City"] },
  { code: "NH", name: "New Hampshire", slug: "new-hampshire", cities: ["Manchester","Nashua","Concord","Derry","Dover"] },
  { code: "NJ", name: "New Jersey",    slug: "new-jersey",    cities: ["Newark","Jersey City","Paterson","Elizabeth","Trenton","Edison"] },
  { code: "NM", name: "New Mexico",    slug: "new-mexico",    cities: ["Albuquerque","Las Cruces","Rio Rancho","Santa Fe","Roswell"] },
  { code: "NY", name: "New York",      slug: "new-york",      cities: ["New York City","Buffalo","Rochester","Yonkers","Syracuse","Albany"] },
  { code: "NC", name: "North Carolina",slug: "north-carolina",cities: ["Charlotte","Raleigh","Greensboro","Durham","Winston-Salem","Fayetteville"] },
  { code: "ND", name: "North Dakota",  slug: "north-dakota",  cities: ["Fargo","Bismarck","Grand Forks","Minot","West Fargo"] },
  { code: "OH", name: "Ohio",          slug: "ohio",          cities: ["Columbus","Cleveland","Cincinnati","Toledo","Akron","Dayton"] },
  { code: "OK", name: "Oklahoma",      slug: "oklahoma",      cities: ["Oklahoma City","Tulsa","Norman","Broken Arrow","Lawton"] },
  { code: "OR", name: "Oregon",        slug: "oregon",        cities: ["Portland","Salem","Eugene","Gresham","Hillsboro","Beaverton"] },
  { code: "PA", name: "Pennsylvania",  slug: "pennsylvania",  cities: ["Philadelphia","Pittsburgh","Allentown","Erie","Reading","Scranton"] },
  { code: "RI", name: "Rhode Island",  slug: "rhode-island",  cities: ["Providence","Cranston","Warwick","Pawtucket","East Providence"] },
  { code: "SC", name: "South Carolina",slug: "south-carolina",cities: ["Columbia","Charleston","North Charleston","Mount Pleasant","Rock Hill"] },
  { code: "SD", name: "South Dakota",  slug: "south-dakota",  cities: ["Sioux Falls","Rapid City","Aberdeen","Brookings","Watertown"] },
  { code: "TN", name: "Tennessee",     slug: "tennessee",     cities: ["Nashville","Memphis","Knoxville","Chattanooga","Clarksville"] },
  { code: "TX", name: "Texas",         slug: "texas",         cities: ["Houston","San Antonio","Dallas","Austin","Fort Worth","El Paso","Arlington","Corpus Christi"] },
  { code: "UT", name: "Utah",          slug: "utah",          cities: ["Salt Lake City","West Valley City","Provo","West Jordan","Orem","Sandy"] },
  { code: "VT", name: "Vermont",       slug: "vermont",       cities: ["Burlington","South Burlington","Rutland","Barre","Montpelier"] },
  { code: "VA", name: "Virginia",      slug: "virginia",      cities: ["Virginia Beach","Norfolk","Chesapeake","Richmond","Newport News","Alexandria"] },
  { code: "WA", name: "Washington",    slug: "washington",    cities: ["Seattle","Spokane","Tacoma","Vancouver","Bellevue","Kent","Everett"] },
  { code: "WV", name: "West Virginia", slug: "west-virginia", cities: ["Charleston","Huntington","Parkersburg","Morgantown","Wheeling"] },
  { code: "WI", name: "Wisconsin",     slug: "wisconsin",     cities: ["Milwaukee","Madison","Green Bay","Kenosha","Racine","Appleton"] },
  { code: "WY", name: "Wyoming",       slug: "wyoming",       cities: ["Cheyenne","Casper","Laramie","Gillette","Rock Springs"] },
];

export const TESTIMONIALS = [
  { name: "Michael R.", location: "Dallas, TX",   service: "Roofing",             rating: 5, text: "Found an incredible roofing contractor through Smart Choice. On time, within budget, and the craftsmanship exceeded every expectation.",        avatar: "M" },
  { name: "Sarah J.",   location: "Orlando, FL",  service: "Kitchen Remodeling",  rating: 5, text: "My kitchen looks like it came out of a magazine. The contractor Smart Choice connected me with transformed the entire space in three weeks.", avatar: "S" },
  { name: "David K.",   location: "Chicago, IL",  service: "Electrical",          rating: 5, text: "Fast, professional, and honest pricing. The electrician rewired my entire basement and passed inspection on the first try.",                   avatar: "D" },
  { name: "Jennifer M.",location: "Phoenix, AZ",  service: "HVAC",                rating: 5, text: "My AC went out in July. Smart Choice connected me with a certified tech in under two hours. Same-day service, fair price.",                   avatar: "J" },
  { name: "Robert T.",  location: "Seattle, WA",  service: "Landscaping",         rating: 5, text: "Our backyard is unrecognizable. Professional, creative, and efficient. Every neighbor asks who did the work.",                               avatar: "R" },
  { name: "Lisa P.",    location: "Nashville, TN", service: "Bathroom Remodeling", rating: 5, text: "Worth every dollar. Smart Choice made finding a reliable bathroom contractor painless, and the results speak for themselves.",                avatar: "L" },
];

export const HOW_IT_WORKS = [
  { step: 1, title: "Describe Your Project", desc: "Tell us what you need, from a simple repair to a full renovation. Our form captures every detail to match you with the right pros." },
  { step: 2, title: "Get Matched Instantly",  desc: "Our system connects you with local professionals in your area based on your project type, ZIP code, and schedule." },
  { step: 3, title: "Compare and Choose",     desc: "Review profiles, ratings, past work, and quotes side by side. Choose the contractor you trust most, with no pressure." },
  { step: 4, title: "Get the Job Done",       desc: "Your contractor handles everything from start to finish. Leave a review when complete to help other homeowners in your community." },
];


// ─── Extended contractor profile data ────────────────────────────────────────
// In production these fields come from the database.
// Each property maps to a section of the public profile page.
export const CONTRACTOR_EXTENDED: Record<string, {
  // Team
  team: { name: string; role: string; yearsExp: number }[];
  // Certifications
  certifications: { name: string; issuer: string; year: number }[];
  // Brands worked with
  brands: string[];
  // Languages spoken
  languages: string[];
  // Payment methods accepted
  paymentMethods: string[];
  // Videos (YouTube/Vimeo embed IDs)
  videos: { platform: "youtube" | "vimeo"; id: string; title: string }[];
  // Preferred suppliers
  preferredSuppliers: { name: string; category: string; website?: string }[];
  // Monthly analytics (for contractor dashboard)
  monthlyStats: {
    month: string;
    profileViews: number;
    leads: number;
    revenue: number;
    rankScore: number;
  }[];
}> = {
  "1": {
    team: [
      { name: "Thomas Rivera",   role: "Owner & Project Manager",  yearsExp: 18 },
      { name: "Carlos Mendez",   role: "Lead Carpenter",           yearsExp: 12 },
      { name: "Mike Johnson",    role: "Site Foreman",             yearsExp: 9  },
      { name: "Ana Reyes",       role: "Design Consultant",        yearsExp: 7  },
    ],
    certifications: [
      { name: "OSHA 30-Hour Construction Safety", issuer: "OSHA",                  year: 2023 },
      { name: "EPA Lead-Safe Certified Renovator", issuer: "EPA",                  year: 2022 },
      { name: "NAHB Certified Green Professional", issuer: "NAHB",                 year: 2021 },
      { name: "Texas Master Builder",              issuer: "Texas Association",     year: 2020 },
    ],
    brands: ["Andersen Windows", "Kohler", "Moen", "James Hardie", "Sherwin-Williams", "Trex", "Bosch", "Delta Faucet"],
    languages: ["English", "Spanish"],
    paymentMethods: ["Cash", "Check", "Credit Card", "Zelle", "Venmo", "Financing Available"],
    videos: [
      { platform: "youtube", id: "dQw4w9WgXcQ", title: "Kitchen Remodel — Before & After Tour" },
      { platform: "youtube", id: "dQw4w9WgXcQ", title: "Bathroom Renovation — Full Process" },
    ],
    preferredSuppliers: [
      { name: "Home Depot Pro",       category: "Building Materials", website: "https://www.homedepot.com/c/Pro" },
      { name: "ABC Supply Co.",        category: "Roofing Supplies",   website: "https://www.abcsupply.com" },
      { name: "Ferguson Bath & Kitchen", category: "Plumbing Fixtures", website: "https://www.ferguson.com" },
    ],
    monthlyStats: [
      { month: "Jan 2025", profileViews: 98,  leads: 6,  revenue: 49.90, rankScore: 84 },
      { month: "Feb 2025", profileViews: 134, leads: 8,  revenue: 49.90, rankScore: 86 },
      { month: "Mar 2025", profileViews: 156, leads: 11, revenue: 49.90, rankScore: 88 },
      { month: "Apr 2025", profileViews: 189, leads: 14, revenue: 49.90, rankScore: 90 },
      { month: "May 2025", profileViews: 211, leads: 16, revenue: 49.90, rankScore: 92 },
      { month: "Jun 2025", profileViews: 247, leads: 18, revenue: 49.90, rankScore: 95 },
    ],
  },
  "2": {
    team: [
      { name: "Marcus Johnson", role: "Owner & Lead Roofer",     yearsExp: 14 },
      { name: "Derek Smith",    role: "Project Estimator",       yearsExp: 8  },
      { name: "Jose Garza",     role: "Roofing Specialist",      yearsExp: 11 },
    ],
    certifications: [
      { name: "GAF Master Elite Contractor",    issuer: "GAF",           year: 2023 },
      { name: "Owens Corning Preferred Contractor", issuer: "Owens Corning", year: 2022 },
      { name: "OSHA 10-Hour Safety",            issuer: "OSHA",          year: 2023 },
    ],
    brands: ["GAF", "Owens Corning", "CertainTeed", "IKO", "Atlas Roofing", "TAMKO"],
    languages: ["English"],
    paymentMethods: ["Cash", "Check", "Credit Card", "Insurance Claims Accepted"],
    videos: [
      { platform: "youtube", id: "dQw4w9WgXcQ", title: "Storm Damage Roof Replacement — Full Job" },
    ],
    preferredSuppliers: [
      { name: "ABC Supply Co.",     category: "Roofing Materials" },
      { name: "Beacon Building Products", category: "Roofing Supplies" },
    ],
    monthlyStats: [
      { month: "Jan 2025", profileViews: 72,  leads: 5,  revenue: 49.90, rankScore: 78 },
      { month: "Feb 2025", profileViews: 89,  leads: 7,  revenue: 49.90, rankScore: 80 },
      { month: "Mar 2025", profileViews: 110, leads: 9,  revenue: 49.90, rankScore: 82 },
      { month: "Apr 2025", profileViews: 145, leads: 12, revenue: 49.90, rankScore: 84 },
      { month: "May 2025", profileViews: 167, leads: 14, revenue: 49.90, rankScore: 86 },
      { month: "Jun 2025", profileViews: 189, leads: 16, revenue: 49.90, rankScore: 88 },
    ],
  },
  "3": {
    team: [
      { name: "David Kim",      role: "Master Electrician / Owner", yearsExp: 22 },
      { name: "Tony Williams",  role: "Licensed Electrician",       yearsExp: 14 },
      { name: "Chris Park",     role: "Apprentice Electrician",     yearsExp: 3  },
    ],
    certifications: [
      { name: "Illinois Master Electrician License", issuer: "State of Illinois", year: 2018 },
      { name: "EV Charging Installation Certified",  issuer: "ChargePoint",       year: 2023 },
      { name: "Smart Home Integration Specialist",   issuer: "CEDIA",             year: 2022 },
      { name: "OSHA 30-Hour Construction Safety",    issuer: "OSHA",              year: 2023 },
    ],
    brands: ["Siemens", "Square D", "Leviton", "Lutron", "Ring", "Tesla", "ChargePoint", "Eaton"],
    languages: ["English", "Korean"],
    paymentMethods: ["Cash", "Check", "Credit Card", "ACH Transfer", "Zelle"],
    videos: [
      { platform: "youtube", id: "dQw4w9WgXcQ", title: "Panel Upgrade 100A to 200A — Full Process" },
      { platform: "youtube", id: "dQw4w9WgXcQ", title: "EV Charger Installation — Level 2" },
    ],
    preferredSuppliers: [
      { name: "Graybar Electric",     category: "Electrical Supplies" },
      { name: "Border States Electric", category: "Electrical Supplies" },
      { name: "Rexel USA",            category: "Lighting & Controls" },
    ],
    monthlyStats: [
      { month: "Jan 2025", profileViews: 112, leads: 9,  revenue: 49.90, rankScore: 89 },
      { month: "Feb 2025", profileViews: 145, leads: 12, revenue: 49.90, rankScore: 91 },
      { month: "Mar 2025", profileViews: 178, leads: 15, revenue: 49.90, rankScore: 93 },
      { month: "Apr 2025", profileViews: 210, leads: 18, revenue: 49.90, rankScore: 94 },
      { month: "May 2025", profileViews: 245, leads: 20, revenue: 49.90, rankScore: 96 },
      { month: "Jun 2025", profileViews: 312, leads: 24, revenue: 49.90, rankScore: 97 },
    ],
  },
};

export const FAQ_ITEMS = [
  { question: "Is Smart Choice free for homeowners?",     answer: "Yes, completely. Homeowners use our platform at no cost. Browse contractors, read reviews, compare quotes, and request services for free." },
  { question: "How are contractors vetted?",              answer: "Contractors register on our platform and may submit documentation such as licenses, insurance certificates, and references. We review submitted documents and display verified credentials as badges. Not all contractors submit documentation." },
  { question: "How much does it cost for contractors?",   answer: "The first month is $29.90. After that, the subscription renews at $49.90 per month. No hidden fees, no commissions, no long-term contracts." },
  { question: "How quickly can I get matched?",           answer: "Most homeowners receive contractor matches within minutes of submitting their project request. Many contractors offer same-day availability." },
  { question: "What types of projects are covered?",      answer: "We cover over 60 service categories, from minor repairs to full custom home builds. If it involves your property, we have a specialist for it." },
  { question: "Are contractors licensed and insured?",    answer: "Contractors may voluntarily submit licenses, insurance certificates, and other documents. Verified documents are displayed as badges on their profile. Submission and verification status varies by contractor." },
  { question: "What if I'm not happy with the work?",     answer: "Contractors with repeated negative feedback are reviewed and may be removed. We take every complaint seriously." },
  { question: "Can I get multiple quotes?",               answer: "Absolutely. We encourage homeowners to compare quotes from several contractors at once. Our platform makes it easy." },
];

export const BLOG_POSTS = [
  { id: "1", title: "10 Signs You Need a New Roof Before Winter",             category: "Roofing",   excerpt: "Don't wait for a leak to tell you there's a problem. These warning signs can save you thousands in water damage repairs.", readTime: "5 min",  date: "June 15, 2025", author: "James Carter",    slug: "signs-you-need-new-roof" },
  { id: "2", title: "How to Choose the Right Kitchen Remodeling Contractor",  category: "Kitchen",   excerpt: "Your kitchen is the heart of your home. Here's what to know before hiring someone to transform it.",                   readTime: "7 min",  date: "June 8, 2025",  author: "Maria Gonzalez",  slug: "choose-kitchen-remodeling-contractor" },
  { id: "3", title: "The Complete Guide to Home HVAC Systems",                 category: "HVAC",     excerpt: "Understanding your heating and cooling system helps you make smarter decisions about maintenance, repairs, and replacement.", readTime: "9 min", date: "May 29, 2025", author: "Robert Williams", slug: "complete-guide-hvac-systems" },
  { id: "4", title: "Bathroom Remodel on a Budget: What's Actually Worth It",  category: "Bathroom", excerpt: "A bathroom remodel doesn't have to break the bank. We break down where to splurge and where to save for maximum ROI.", readTime: "6 min",  date: "May 20, 2025",  author: "Sarah Thompson",  slug: "bathroom-remodel-budget" },
];

export const MOCK_CONTRACTORS = [
  { id: "1", company: "ProBuild Solutions",       name: "Thomas Rivera",  category: "General Contractor", location: "Austin, TX",    rating: 4.9, reviews: 247, yearsExp: 18, verified: true, insured: true, licensed: true, phone: "+1 (512) 555-0147", description: "Full-service construction specializing in residential remodels, additions, and new builds.", services: ["Kitchen Remodeling","Bathroom Remodeling","Home Additions","Custom Homes"], responseTime: "under 1 hour" },
  { id: "2", company: "Elite Roofing & Exteriors", name: "Marcus Johnson", category: "Roofing",           location: "Dallas, TX",    rating: 4.8, reviews: 189, yearsExp: 14, verified: true, insured: true, licensed: true, phone: "+1 (214) 555-0183", description: "Roofing installation, repair, and replacement. Storm damage experts with insurance claim assistance.", services: ["Roof Installation","Roof Repair","Storm Damage","Gutters"], responseTime: "under 2 hours" },
  { id: "3", company: "PowerUp Electrical",        name: "David Kim",      category: "Electrician",        location: "Chicago, IL",   rating: 4.9, reviews: 312, yearsExp: 22, verified: true, insured: true, licensed: true, phone: "+1 (312) 555-0219", description: "Master electrician with 22 years of experience. Panel upgrades, EV chargers, smart home wiring.", services: ["Panel Upgrade","Wiring","EV Chargers","Smart Home"], responseTime: "under 30 min" },
  { id: "4", company: "GreenScape Landscaping",    name: "Antonio Reyes",  category: "Landscaping",        location: "Phoenix, AZ",   rating: 4.7, reviews: 156, yearsExp: 11, verified: true, insured: true, licensed: true, phone: "+1 (602) 555-0142", description: "Full-service landscaping design and maintenance, specializing in drought-resistant desert landscapes.", services: ["Design","Maintenance","Irrigation","Hardscaping"], responseTime: "under 3 hours" },
  { id: "5", company: "BathPro Renovations",       name: "Jennifer Walsh",  category: "Bathroom Remodeling",location: "Seattle, WA",   rating: 5.0, reviews: 88,  yearsExp: 9,  verified: true, insured: true, licensed: true, phone: "+1 (206) 555-0198", description: "Bathroom transformation specialists. Custom tile, walk-in showers, and luxury vanities.", services: ["Full Remodel","Tile Work","Vanities","Showers"], responseTime: "under 1 hour" },
  { id: "6", company: "HVAC Masters LLC",           name: "Robert Chen",    category: "HVAC",               location: "Nashville, TN", rating: 4.9, reviews: 203, yearsExp: 16, verified: true, insured: true, licensed: true, phone: "+1 (615) 555-0167", description: "Certified HVAC technicians. Installation, repair, and maintenance of all major brands.", services: ["AC Install","Heating","Duct Work","Maintenance"], responseTime: "under 30 min" },
];
