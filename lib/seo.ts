/**
 * SEO utilities for Smart Choice Constructions
 * Generates structured data (JSON-LD), meta tags, and canonical URLs
 */

import { COMPANY, CATEGORIES } from "./data";
import type { Metadata } from "next";

const BASE_URL = "https://smartchoiceconstructions.com";

// ─── Base metadata factory ─────────────────────────────────────────────────────

export function buildMeta({
  title,
  description,
  path = "",
  image = "/og-image.jpg",
  noIndex = false,
}: {
  title: string;
  description: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
}): Metadata {
  const url = `${BASE_URL}${path}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "Smart Choice Constructions",
      type: "website",
      locale: "en_US",
      images: [{ url: `${BASE_URL}${image}`, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${BASE_URL}${image}`],
      site: "@smartchoiceconstruction",
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  };
}

// ─── JSON-LD Schema builders ───────────────────────────────────────────────────

/** Organization schema — used in root layout */
export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${BASE_URL}/#organization`,
  name: COMPANY.legalName,
  alternateName: COMPANY.name,
  url: BASE_URL,
  logo: {
    "@type": "ImageObject",
    url: `${BASE_URL}/logo.png`,
    width: 512,
    height: 512,
  },
  contactPoint: {
    "@type": "ContactPoint",
    email: COMPANY.email,
    contactType: "customer service",
    areaServed: "US",
    availableLanguage: ["English", "Spanish"],
  },
  address: {
    "@type": "PostalAddress",
    streetAddress: "2222 W Grand River Ave Ste A",
    addressLocality: "Okemos",
    addressRegion: "MI",
    postalCode: "48864",
    addressCountry: "US",
  },
  sameAs: Object.values(COMPANY.social),
  description: "Smart Choice Constructions connects homeowners with verified, licensed local contractors across the United States.",
  slogan: COMPANY.tagline,
};

/** WebSite schema with SearchAction — enables sitelinks search box in Google */
export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${BASE_URL}/#website`,
  url: BASE_URL,
  name: COMPANY.name,
  publisher: { "@id": `${BASE_URL}/#organization` },
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${BASE_URL}/find-contractors?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
};

/** Service page schema */
export function serviceSchema({ categoryId, categoryName, description, stateCode, cityName }: {
  categoryId: string;
  categoryName: string;
  description: string;
  stateCode?: string;
  cityName?: string;
}) {
  const areaServed = cityName && stateCode
    ? { "@type": "City", name: cityName, containedInPlace: { "@type": "State", name: stateCode } }
    : stateCode
      ? { "@type": "State", name: stateCode }
      : { "@type": "Country", name: "United States" };

  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${categoryName} Contractors`,
    serviceType: categoryName,
    description,
    provider: { "@id": `${BASE_URL}/#organization` },
    areaServed,
    url: cityName && stateCode
      ? `${BASE_URL}/locations/${stateCode.toLowerCase()}/${cityName.toLowerCase().replace(/\s+/g, "-")}/${categoryId}`
      : `${BASE_URL}/services/${categoryId}`,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `${categoryName} Services`,
      itemListElement: [
        { "@type": "Offer", itemOffered: { "@type": "Service", name: `${categoryName} Installation` } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: `${categoryName} Repair` } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: `${categoryName} Maintenance` } },
      ],
    },
  };
}

/** LocalBusiness schema for location pages */
export function localBusinessSchema({ cityName, stateName, stateCode }: {
  cityName?: string;
  stateName: string;
  stateCode: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${BASE_URL}/locations/${stateCode.toLowerCase()}${cityName ? `/${cityName.toLowerCase().replace(/\s+/g, "-")}` : ""}#business`,
    name: `Smart Choice Constructions — ${cityName ?? stateName}`,
    url: BASE_URL,
    image: `${BASE_URL}/og-image.jpg`,
    telephone: COMPANY.phone,
    email: COMPANY.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: cityName ?? stateName,
      addressRegion: stateCode,
      addressCountry: "US",
    },
    areaServed: {
      "@type": cityName ? "City" : "State",
      name: cityName ?? stateName,
    },
    description: `Find local contractors in ${cityName ?? stateName}. Free for homeowners.`,
    priceRange: "Free for homeowners",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "12483",
      bestRating: "5",
      worstRating: "1",
    },
  };
}

/** FAQ page schema */
export function faqSchema(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map(item => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

/** Blog post schema */
export function articleSchema({ title, description, author, datePublished, slug }: {
  title: string;
  description: string;
  author: string;
  datePublished: string;
  slug: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    author: { "@type": "Person", name: author },
    publisher: { "@id": `${BASE_URL}/#organization` },
    datePublished,
    dateModified: datePublished,
    url: `${BASE_URL}/blog/${slug}`,
    mainEntityOfPage: { "@type": "WebPage", "@id": `${BASE_URL}/blog/${slug}` },
  };
}

/** Contractor (Person/LocalBusiness) schema for profile pages */
export function contractorSchema({ company, name, category, location, rating, reviews, phone }: {
  company: string;
  name: string;
  category: string;
  location: string;
  rating: number;
  reviews: number;
  phone: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: company,
    employee: { "@type": "Person", name },
    description: `Verified ${category} contractor serving ${location}.`,
    telephone: phone,
    areaServed: location,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: rating.toString(),
      reviewCount: reviews.toString(),
      bestRating: "5",
    },
  };
}

/** Breadcrumb schema */
export function breadcrumbSchema(items: { name: string; href: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${BASE_URL}${item.href}`,
    })),
  };
}

/** Pricing / Offer schema for /pricing page */
export const pricingSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Smart Choice Constructions Professional Plan",
  description: "Monthly subscription for contractors. Access leads, build your profile, and grow your business.",
  brand: { "@id": `${BASE_URL}/#organization` },
  offers: [
    {
      "@type": "Offer",
      name: "First Month",
      price: "29.90",
      priceCurrency: "USD",
      priceValidUntil: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split("T")[0],
      availability: "https://schema.org/InStock",
      url: `${BASE_URL}/join`,
    },
    {
      "@type": "Offer",
      name: "Monthly Renewal",
      price: "49.90",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `${BASE_URL}/join`,
    },
  ],
};





// ─── Supplier / Partner schemas ────────────────────────────────────────────────

import type { Supplier } from "./supplier-data";

/** LocalBusiness schema for a supplier profile */
export function supplierSchema(s: Supplier, categoryName: string) {
  const BASE_URL = "https://smartchoiceconstructions.com";
  return {
    "@context":        "https://schema.org",
    "@type":           "LocalBusiness",
    "@id":             `${BASE_URL}/suppliers/profile/${s.id}`,
    "name":            s.name,
    "description":     s.description,
    "url":             `${BASE_URL}/suppliers/profile/${s.id}`,
    "telephone":       s.phone,
    "email":           s.email,
    "address": {
      "@type":           "PostalAddress",
      "streetAddress":   s.address,
      "addressLocality": s.city,
      "addressRegion":   s.stateCode,
      "addressCountry":  "US",
    },
    "geo": {
      "@type": "GeoCoordinates",
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "description": s.hours,
    },
    "aggregateRating": {
      "@type":       "AggregateRating",
      "ratingValue": s.rating,
      "reviewCount": s.reviews,
      "bestRating":  5,
      "worstRating": 1,
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name":  categoryName,
      "itemListElement": s.products.map((p, i) => ({
        "@type":    "Offer",
        "position": i + 1,
        "itemOffered": { "@type": "Service", "name": p },
      })),
    },
    "brand": s.brands.slice(0, 5).map(b => ({ "@type": "Brand", "name": b })),
    "sameAs": [s.website, s.instagram, s.facebook, s.linkedin].filter(Boolean),
  };
}

/** ItemList schema for a category page (SEO rich result) */
export function supplierCategoryListSchema(
  suppliers: { id: string; name: string; rating: number }[],
  categoryName: string,
) {
  const BASE_URL = "https://smartchoiceconstructions.com";
  return {
    "@context": "https://schema.org",
    "@type":    "ItemList",
    "name":     `${categoryName} — Local Suppliers`,
    "itemListElement": suppliers.map((s, i) => ({
      "@type":    "ListItem",
      "position": i + 1,
      "url":      `${BASE_URL}/suppliers/profile/${s.id}`,
      "name":     s.name,
    })),
  };
}

/** Breadcrumb schema for supplier pages */
export function supplierBreadcrumbSchema(
  categoryId: string,
  categoryName: string,
  stateSlug?: string,
  stateName?: string,
  citySlug?: string,
  cityName?: string,
  supplierName?: string,
) {
  const BASE_URL = "https://smartchoiceconstructions.com";
  const items: { name: string; href: string }[] = [
    { name: "Home",            href: "/" },
    { name: "Local Suppliers", href: "/suppliers" },
  ];
  if (stateSlug && stateName) {
    items.push({ name: stateName, href: `/suppliers/${stateSlug}` });
  }
  if (stateSlug && citySlug && cityName) {
    items.push({ name: cityName, href: `/suppliers/${stateSlug}/${citySlug}` });
  }
  if (categoryName) {
    items.push({ name: categoryName, href: `/suppliers/categories/${categoryId}` });
  }
  if (supplierName) {
    items.push({ name: supplierName, href: "#" });
  }
  return breadcrumbSchema(items);
}
