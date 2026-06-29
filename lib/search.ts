/**
 * Smart Choice Constructions — Search Engine
 *
 * Architecture:
 * - Client-side for autocomplete (instant, no latency)
 * - In production: full-text search via Algolia / Typesense / PostgreSQL FTS
 *   for contractor profiles (name, description, services, city)
 *
 * Features implemented here:
 * - Fuzzy matching (Levenshtein distance ≤ 2 for short terms)
 * - Synonym expansion (e.g. "AC" → HVAC, "bathroom" → plumber)
 * - Singular/plural normalization
 * - Score-ranked results grouped by type
 * - ZIP code lookup with state/city resolution
 */

import { CATEGORIES, US_STATES, MOCK_CONTRACTORS } from "./data";
import { SUPPLIER_CATEGORIES, MOCK_SUPPLIERS } from "./supplier-data";
import { cityToSlug } from "./locations";

export type SearchResultType = "category" | "state" | "city" | "contractor" | "service" | "supplier" | "supplier_category";

export interface SearchResult {
  type:     SearchResultType;
  title:    string;
  subtitle: string;
  href:     string;
  icon?:    string;
  score:    number;
}

// ─── Synonym map ─────────────────────────────────────────────────────────────
// Maps common terms to canonical category IDs or search terms
const SYNONYMS: Record<string, string[]> = {
  "ac":            ["hvac", "air conditioning"],
  "air conditioner":["hvac"],
  "air conditioning":["hvac"],
  "heating":       ["hvac"],
  "furnace":       ["hvac"],
  "heat pump":     ["hvac"],
  "toilet":        ["plumber", "plumbing"],
  "sink":          ["plumber", "plumbing"],
  "pipe":          ["plumber", "plumbing"],
  "faucet":        ["plumber", "plumbing"],
  "drain":         ["plumber", "plumbing"],
  "electrical":    ["electrician"],
  "electric":      ["electrician"],
  "wiring":        ["electrician"],
  "outlet":        ["electrician"],
  "panel":         ["electrician"],
  "lights":        ["electrician"],
  "kitchen":       ["kitchen-remodeling"],
  "bath":          ["bathroom-remodeling"],
  "bathroom":      ["bathroom-remodeling"],
  "shower":        ["bathroom-remodeling"],
  "bathtub":       ["bathroom-remodeling"],
  "tub":           ["bathroom-remodeling"],
  "lawn":          ["landscaping"],
  "garden":        ["landscaping"],
  "grass":         ["landscaping"],
  "yard":          ["landscaping"],
  "mow":           ["landscaping"],
  "tree":          ["landscaping", "tree-service"],
  "deck":          ["decking"],
  "patio":         ["decking"],
  "floor":         ["flooring"],
  "tile":          ["flooring", "bathroom-remodeling"],
  "carpet":        ["flooring"],
  "hardwood":      ["flooring"],
  "paint":         ["painting"],
  "painter":       ["painting"],
  "roof":          ["roofing"],
  "shingles":      ["roofing"],
  "gutter":        ["roofing"],
  "siding":        ["roofing"],
  "window":        ["windows-doors"],
  "door":          ["windows-doors"],
  "insulation":    ["insulation"],
  "drywall":       ["drywall"],
  "move":          ["moving"],
  "pest":          ["pest-control"],
  "bug":           ["pest-control"],
  "termite":       ["pest-control"],
  "clean":         ["cleaning"],
  "maid":          ["cleaning"],
  "remodel":       ["general-contractor"],
  "addition":      ["general-contractor"],
  "renovation":    ["general-contractor"],
  "contractor":    ["general-contractor"],
  "handyman":      ["handyman"],
  "fix":           ["handyman"],
  "repair":        ["handyman"],
  "solar":         ["solar"],
  "pool":          ["pool-spa"],
  "spa":           ["pool-spa"],
  "fence":         ["fencing"],
  "garage":        ["garage-doors"],
  "security":      ["security-systems"],
  "alarm":         ["security-systems"],
  "camera":        ["security-systems"],
  "plaster":       ["drywall"],
  "stucco":        ["drywall"],
};

// ─── Fuzzy matching (Levenshtein distance) ────────────────────────────────────
function levenshtein(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const dp: number[][] = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[a.length][b.length];
}

function fuzzyScore(haystack: string, needle: string): number {
  const h = haystack.toLowerCase().trim();
  const n = needle.toLowerCase().trim();
  if (!n) return 0;

  // Exact match
  if (h === n) return 100;
  // Prefix match
  if (h.startsWith(n)) return 90;
  // Contains exact term
  if (h.includes(n)) return 75;

  // Word-level matching
  const hWords = h.split(/[\s-]+/);
  const nWords = n.split(/[\s-]+/);

  // All needle words found as substrings in haystack words
  const allFound = nWords.every(nw => hWords.some(hw => hw.startsWith(nw) || nw.startsWith(hw)));
  if (allFound) return 65;

  // Some needle words found
  const someFound = nWords.some(nw => hWords.some(hw => hw.startsWith(nw) || nw.startsWith(hw)));
  if (someFound) return 45;

  // Fuzzy — only for terms with ≥ 4 chars to avoid false positives
  if (n.length >= 4 && h.length >= 4) {
    const dist = levenshtein(n, h.slice(0, n.length + 2));
    if (dist <= 1) return 55;
    if (dist <= 2 && n.length >= 6) return 35;
  }

  return 0;
}

// ─── Normalize query (expand synonyms, strip plurals) ─────────────────────────
function normalizeQuery(query: string): string[] {
  const q = query.toLowerCase().trim();

  // Singular/plural normalization (simple English rules)
  const normalized = q
    .replace(/ies$/, "y")        // categories → category
    .replace(/ves$/, "f")        // knives → knife
    .replace(/([^s])s$/, "$1");  // rooms → room (but not "class")

  const terms = new Set([q, normalized]);

  // Expand synonyms
  for (const [syn, targets] of Object.entries(SYNONYMS)) {
    if (q.includes(syn) || normalized.includes(syn)) {
      targets.forEach(t => terms.add(t));
    }
  }

  return [...terms];
}

// ─── Main search function ─────────────────────────────────────────────────────
export function search(query: string, limit = 8): SearchResult[] {
  const q = query.trim();
  if (q.length < 2) return [];

  const terms = normalizeQuery(q);
  const results: SearchResult[] = [];
  const seen = new Set<string>();

  const addResult = (r: SearchResult) => {
    if (!seen.has(r.href)) {
      seen.add(r.href);
      results.push(r);
    }
  };

  // ── Categories ──────────────────────────────────────────────────
  CATEGORIES.forEach(cat => {
    const best = Math.max(
      ...terms.map(t => Math.max(fuzzyScore(cat.name, t), fuzzyScore(cat.id.replace(/-/g, " "), t)))
    );
    if (best > 0) {
      addResult({ type: "category", title: cat.name, subtitle: "Service Category", href: `/services/${cat.id}`, icon: cat.icon, score: best + 10 });
    }
  });

  // ── States ──────────────────────────────────────────────────────
  US_STATES.forEach(state => {
    const best = Math.max(...terms.map(t => Math.max(fuzzyScore(state.name, t), fuzzyScore(state.code, t))));
    if (best > 0) {
      addResult({ type: "state", title: state.name, subtitle: "State", href: `/locations/${state.slug}`, icon: "📍", score: best + 5 });
    }
  });

  // ── Cities ──────────────────────────────────────────────────────
  US_STATES.forEach(state => {
    state.cities.forEach(city => {
      // Also match "city, state" patterns
      const best = Math.max(...terms.map(t => Math.max(fuzzyScore(city, t), fuzzyScore(`${city} ${state.code}`, t))));
      if (best > 0) {
        addResult({ type: "city", title: city, subtitle: state.name, href: `/locations/${state.slug}/${cityToSlug(city)}`, icon: "🏙️", score: best });
      }
    });
  });

  // ── Contractors ─────────────────────────────────────────────────
  MOCK_CONTRACTORS.forEach(c => {
    const best = Math.max(
      ...terms.map(t => Math.max(
        fuzzyScore(c.company, t),
        fuzzyScore(c.category, t),
        fuzzyScore(c.name, t),
        ...c.services.map(s => fuzzyScore(s, t))
      ))
    );
    if (best > 0) {
      addResult({ type: "contractor", title: c.company, subtitle: `${c.category} · ${c.location}`, href: `/contractors/${c.id}`, icon: "👤", score: best + 8 });
    }
  });

  // ── Supplier categories ─────────────────────────────────────────
  SUPPLIER_CATEGORIES.forEach(cat => {
    const best = Math.max(...terms.map(t => Math.max(fuzzyScore(cat.name, t), fuzzyScore(cat.id.replace(/-/g, " "), t))));
    if (best > 0) {
      addResult({ type: "supplier_category", title: cat.name, subtitle: "Supplier Category", href: `/suppliers/categories/${cat.id}`, icon: cat.icon, score: best + 6 });
    }
  });

  // ── Suppliers ────────────────────────────────────────────────────
  MOCK_SUPPLIERS.forEach(s => {
    const cat = SUPPLIER_CATEGORIES.find(c => c.id === s.categoryId);
    const best = Math.max(...terms.map(t => Math.max(fuzzyScore(s.name, t), fuzzyScore(cat?.name ?? "", t), ...s.products.map(p => fuzzyScore(p, t)))));
    if (best > 0) {
      addResult({ type: "supplier", title: s.name, subtitle: `${cat?.name} · ${s.location}`, href: `/suppliers/${s.id}`, icon: cat?.icon ?? "🏢", score: best + 7 });
    }
  });

  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}

// ─── ZIP code lookup ──────────────────────────────────────────────────────────
export interface ZipResult {
  state:  string;
  stateCode: string;
  cities: string[];
}

const ZIP_RANGES: { min: number; max: number; state: string; code: string; cities: string[] }[] = [
  { min: 35004, max: 36925, state: "Alabama",        code: "AL", cities: ["Birmingham","Montgomery","Huntsville","Mobile"] },
  { min: 99501, max: 99950, state: "Alaska",          code: "AK", cities: ["Anchorage","Fairbanks","Juneau"] },
  { min: 85001, max: 86556, state: "Arizona",         code: "AZ", cities: ["Phoenix","Tucson","Mesa","Scottsdale"] },
  { min: 71601, max: 72959, state: "Arkansas",        code: "AR", cities: ["Little Rock","Fort Smith","Fayetteville"] },
  { min: 90001, max: 96162, state: "California",      code: "CA", cities: ["Los Angeles","San Diego","San Jose","San Francisco"] },
  { min: 80001, max: 81658, state: "Colorado",        code: "CO", cities: ["Denver","Colorado Springs","Aurora","Fort Collins"] },
  { min: 6001,  max: 6928,  state: "Connecticut",     code: "CT", cities: ["Bridgeport","New Haven","Hartford","Stamford"] },
  { min: 19701, max: 19980, state: "Delaware",        code: "DE", cities: ["Wilmington","Dover","Newark"] },
  { min: 32004, max: 34997, state: "Florida",         code: "FL", cities: ["Jacksonville","Miami","Tampa","Orlando"] },
  { min: 30001, max: 31999, state: "Georgia",         code: "GA", cities: ["Atlanta","Augusta","Columbus","Savannah"] },
  { min: 96701, max: 96898, state: "Hawaii",          code: "HI", cities: ["Honolulu","Hilo","Kailua"] },
  { min: 83201, max: 83876, state: "Idaho",           code: "ID", cities: ["Boise","Nampa","Meridian","Idaho Falls"] },
  { min: 60001, max: 62999, state: "Illinois",        code: "IL", cities: ["Chicago","Aurora","Rockford","Joliet"] },
  { min: 46001, max: 47997, state: "Indiana",         code: "IN", cities: ["Indianapolis","Fort Wayne","Evansville","South Bend"] },
  { min: 50001, max: 52809, state: "Iowa",            code: "IA", cities: ["Des Moines","Cedar Rapids","Davenport"] },
  { min: 66002, max: 67954, state: "Kansas",          code: "KS", cities: ["Wichita","Overland Park","Kansas City","Topeka"] },
  { min: 40003, max: 42788, state: "Kentucky",        code: "KY", cities: ["Louisville","Lexington","Bowling Green"] },
  { min: 70001, max: 71497, state: "Louisiana",       code: "LA", cities: ["New Orleans","Baton Rouge","Shreveport"] },
  { min: 3901,  max: 4992,  state: "Maine",           code: "ME", cities: ["Portland","Lewiston","Bangor"] },
  { min: 20601, max: 21930, state: "Maryland",        code: "MD", cities: ["Baltimore","Frederick","Rockville","Gaithersburg"] },
  { min: 1001,  max: 2791,  state: "Massachusetts",   code: "MA", cities: ["Boston","Worcester","Springfield","Lowell"] },
  { min: 48001, max: 49971, state: "Michigan",        code: "MI", cities: ["Detroit","Grand Rapids","Warren","Sterling Heights"] },
  { min: 55001, max: 56763, state: "Minnesota",       code: "MN", cities: ["Minneapolis","Saint Paul","Rochester","Duluth"] },
  { min: 38601, max: 39776, state: "Mississippi",     code: "MS", cities: ["Jackson","Gulfport","Southaven","Hattiesburg"] },
  { min: 63001, max: 65899, state: "Missouri",        code: "MO", cities: ["Kansas City","St. Louis","Springfield","Columbia"] },
  { min: 59001, max: 59937, state: "Montana",         code: "MT", cities: ["Billings","Missoula","Great Falls","Bozeman"] },
  { min: 68001, max: 69367, state: "Nebraska",        code: "NE", cities: ["Omaha","Lincoln","Bellevue","Grand Island"] },
  { min: 88901, max: 89883, state: "Nevada",          code: "NV", cities: ["Las Vegas","Henderson","Reno","North Las Vegas"] },
  { min: 3031,  max: 3897,  state: "New Hampshire",   code: "NH", cities: ["Manchester","Nashua","Concord","Derry"] },
  { min: 7001,  max: 8989,  state: "New Jersey",      code: "NJ", cities: ["Newark","Jersey City","Paterson","Elizabeth"] },
  { min: 87001, max: 88441, state: "New Mexico",      code: "NM", cities: ["Albuquerque","Las Cruces","Rio Rancho","Santa Fe"] },
  { min: 10001, max: 14975, state: "New York",        code: "NY", cities: ["New York City","Buffalo","Rochester","Yonkers"] },
  { min: 27006, max: 28909, state: "North Carolina",  code: "NC", cities: ["Charlotte","Raleigh","Greensboro","Durham"] },
  { min: 58001, max: 58856, state: "North Dakota",    code: "ND", cities: ["Fargo","Bismarck","Grand Forks","Minot"] },
  { min: 43001, max: 45999, state: "Ohio",            code: "OH", cities: ["Columbus","Cleveland","Cincinnati","Toledo"] },
  { min: 73001, max: 74966, state: "Oklahoma",        code: "OK", cities: ["Oklahoma City","Tulsa","Norman","Broken Arrow"] },
  { min: 97001, max: 97920, state: "Oregon",          code: "OR", cities: ["Portland","Salem","Eugene","Gresham"] },
  { min: 15001, max: 19640, state: "Pennsylvania",    code: "PA", cities: ["Philadelphia","Pittsburgh","Allentown","Erie"] },
  { min: 2801,  max: 2940,  state: "Rhode Island",    code: "RI", cities: ["Providence","Cranston","Warwick","Pawtucket"] },
  { min: 29001, max: 29948, state: "South Carolina",  code: "SC", cities: ["Columbia","Charleston","North Charleston","Mount Pleasant"] },
  { min: 57001, max: 57799, state: "South Dakota",    code: "SD", cities: ["Sioux Falls","Rapid City","Aberdeen","Brookings"] },
  { min: 37010, max: 38589, state: "Tennessee",       code: "TN", cities: ["Nashville","Memphis","Knoxville","Chattanooga"] },
  { min: 75001, max: 79999, state: "Texas",           code: "TX", cities: ["Houston","San Antonio","Dallas","Austin"] },
  { min: 84001, max: 84784, state: "Utah",            code: "UT", cities: ["Salt Lake City","Provo","West Jordan","Orem"] },
  { min: 5001,  max: 5907,  state: "Vermont",         code: "VT", cities: ["Burlington","Essex","South Burlington"] },
  { min: 22001, max: 24658, state: "Virginia",        code: "VA", cities: ["Virginia Beach","Norfolk","Chesapeake","Richmond"] },
  { min: 98001, max: 99403, state: "Washington",      code: "WA", cities: ["Seattle","Spokane","Tacoma","Vancouver"] },
  { min: 24701, max: 26886, state: "West Virginia",   code: "WV", cities: ["Charleston","Huntington","Parkersburg","Morgantown"] },
  { min: 53001, max: 54990, state: "Wisconsin",       code: "WI", cities: ["Milwaukee","Madison","Green Bay","Kenosha"] },
  { min: 82001, max: 83128, state: "Wyoming",         code: "WY", cities: ["Cheyenne","Casper","Laramie","Gillette"] },
];

export function searchByZip(zip: string): ZipResult | null {
  if (!/^\d{5}$/.test(zip.trim())) return null;
  const zipNum = parseInt(zip.trim(), 10);
  const match = ZIP_RANGES.find(r => zipNum >= r.min && zipNum <= r.max);
  return match ? { state: match.state, stateCode: match.code, cities: match.cities } : null;
}

// ─── City + category search ────────────────────────────────────────────────────
export function searchCityCategory(city: string, category: string): string | null {
  const state = US_STATES.find(s => s.cities.some(c => c.toLowerCase() === city.toLowerCase()));
  const cat   = CATEGORIES.find(c => c.name.toLowerCase() === category.toLowerCase() || c.id === category.toLowerCase());
  if (!state || !cat) return null;
  return `/locations/${state.slug}/${cityToSlug(city)}/${cat.id}`;
}
