/**
 * Admin mock data for Smart Choice Constructions
 * Replace all values here with real database queries in production.
 * Each export maps 1:1 to a DB query or API call.
 */

export const ADMIN_STATS = {
  contractors: {
    total:        312,
    active:       287,
    pending:       18,
    suspended:      5,
    canceled:       2,
    newThisMonth:  24,
    churnThisMonth: 3,
  },
  revenue: {
    mrr:           14_301.30,   // Monthly Recurring Revenue
    arr:          171_615.60,   // Annual Run Rate
    thisMonth:     14_301.30,
    lastMonth:     13_852.50,
    growthPct:       3.24,
    avgRevenuePerContractor: 49.90,
  },
  homeowners: {
    total:         8_412,
    newThisMonth:    634,
    quoteRequests: 1_847,
    projectsCompleted: 5_231,
  },
  platform: {
    avgRating:      4.81,
    reviewsTotal:  12_483,
    searchesToday:  1_204,
    topCategory:   "Roofing",
    topState:      "Texas",
  },
};

export const PENDING_CONTRACTORS = [
  { id: "p1", company: "Sunshine Roofing LLC",     name: "Carlos Mendez",   category: "Roofing",    location: "Houston, TX",   submittedAt: "2025-06-28 09:14", hasLicense: true,  hasInsurance: true,  photoCount: 6 },
  { id: "p2", company: "All Star Electric",         name: "James Wilson",    category: "Electrician",location: "Phoenix, AZ",   submittedAt: "2025-06-28 08:33", hasLicense: true,  hasInsurance: false, photoCount: 3 },
  { id: "p3", company: "Crystal Clear Plumbing",   name: "Maria Santos",    category: "Plumber",    location: "Miami, FL",     submittedAt: "2025-06-27 22:10", hasLicense: false, hasInsurance: true,  photoCount: 8 },
  { id: "p4", company: "Premier HVAC Solutions",   name: "Robert Kim",      category: "HVAC",       location: "Chicago, IL",   submittedAt: "2025-06-27 18:55", hasLicense: true,  hasInsurance: true,  photoCount: 5 },
  { id: "p5", company: "Green Thumb Landscaping",  name: "Ana Flores",      category: "Landscaping",location: "Denver, CO",    submittedAt: "2025-06-27 15:30", hasLicense: false, hasInsurance: false, photoCount: 12 },
  { id: "p6", company: "TrueBuild General Cont.",  name: "Kevin O'Brien",   category: "General",    location: "Seattle, WA",   submittedAt: "2025-06-27 11:22", hasLicense: true,  hasInsurance: true,  photoCount: 9 },
];

export const ACTIVE_CONTRACTORS = [
  { id: "1",  company: "ProBuild Solutions",       name: "Thomas Rivera",  category: "General Contractor", location: "Austin, TX",    rating: 4.9, reviews: 247, status: "active",    billingDate: "Jul 1",  mrr: 49.90 },
  { id: "2",  company: "Elite Roofing & Exteriors",name: "Marcus Johnson", category: "Roofing",            location: "Dallas, TX",    rating: 4.8, reviews: 189, status: "active",    billingDate: "Jul 3",  mrr: 49.90 },
  { id: "3",  company: "PowerUp Electrical",       name: "David Kim",      category: "Electrician",        location: "Chicago, IL",   rating: 4.9, reviews: 312, status: "active",    billingDate: "Jul 5",  mrr: 49.90 },
  { id: "4",  company: "GreenScape Landscaping",   name: "Antonio Reyes",  category: "Landscaping",        location: "Phoenix, AZ",   rating: 4.7, reviews: 156, status: "active",    billingDate: "Jul 8",  mrr: 49.90 },
  { id: "5",  company: "BathPro Renovations",      name: "Jennifer Walsh", category: "Bathroom",           location: "Seattle, WA",   rating: 5.0, reviews: 88,  status: "past_due",  billingDate: "Jun 28", mrr: 49.90 },
  { id: "6",  company: "HVAC Masters LLC",          name: "Robert Chen",    category: "HVAC",               location: "Nashville, TN", rating: 4.9, reviews: 203, status: "suspended", billingDate: "Jun 25", mrr: 0 },
];

export const RECENT_PAYMENTS = [
  { id: "pay1", contractor: "ProBuild Solutions",       amount: 49.90, date: "Jun 28, 2025", status: "succeeded", method: "Visa 4242" },
  { id: "pay2", contractor: "Elite Roofing",             amount: 49.90, date: "Jun 28, 2025", status: "succeeded", method: "MC 5555" },
  { id: "pay3", contractor: "BathPro Renovations",       amount: 49.90, date: "Jun 28, 2025", status: "failed",    method: "Visa 0002" },
  { id: "pay4", contractor: "PowerUp Electrical",        amount: 49.90, date: "Jun 27, 2025", status: "succeeded", method: "Amex 8431" },
  { id: "pay5", contractor: "GreenScape Landscaping",    amount: 49.90, date: "Jun 27, 2025", status: "succeeded", method: "Visa 4567" },
  { id: "pay6", contractor: "Sunshine Roofing",          amount: 29.90, date: "Jun 26, 2025", status: "succeeded", method: "MC 1234" },
  { id: "pay7", contractor: "HVAC Masters",              amount: 49.90, date: "Jun 25, 2025", status: "failed",    method: "Visa 9999" },
  { id: "pay8", contractor: "All Star Electric",          amount: 29.90, date: "Jun 25, 2025", status: "succeeded", method: "Visa 4242" },
];

export const REVENUE_MONTHLY = [
  { month: "Jan", revenue: 8_971.00,  contractors: 180 },
  { month: "Feb", revenue: 9_830.10,  contractors: 197 },
  { month: "Mar", revenue: 10_528.90, contractors: 211 },
  { month: "Apr", revenue: 11_477.00, contractors: 230 },
  { month: "May", revenue: 12_645.20, contractors: 253 },
  { month: "Jun", revenue: 13_852.50, contractors: 278 },
  { month: "Jul", revenue: 14_301.30, contractors: 287 },
];

export const FLAGGED_REVIEWS = [
  { id: "r1", contractor: "ProBuild Solutions",  reviewer: "Mike T.",   rating: 1, text: "Never showed up. Complete waste of time.", date: "Jun 27", reason: "Low rating" },
  { id: "r2", contractor: "All Star Electric",   reviewer: "Sarah K.",  rating: 1, text: "Overcharged me and did poor work.",          date: "Jun 25", reason: "Dispute" },
  { id: "r3", contractor: "Quick Fix Plumbing",  reviewer: "Carlos R.", rating: 2, text: "Work was ok but very late.",                 date: "Jun 23", reason: "Low rating" },
];

export const TOP_CATEGORIES = [
  { category: "Roofing",             contractors: 48, leads: 312, conversionPct: 34 },
  { category: "Electrician",         contractors: 41, leads: 287, conversionPct: 38 },
  { category: "HVAC",                contractors: 36, leads: 245, conversionPct: 29 },
  { category: "General Contractor",  contractors: 31, leads: 198, conversionPct: 41 },
  { category: "Plumber",             contractors: 28, leads: 176, conversionPct: 33 },
  { category: "Kitchen Remodeling",  contractors: 22, leads: 154, conversionPct: 27 },
  { category: "Landscaping",         contractors: 19, leads: 143, conversionPct: 22 },
  { category: "Bathroom Remodeling", contractors: 18, leads: 128, conversionPct: 30 },
];
