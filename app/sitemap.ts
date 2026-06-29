import type { MetadataRoute } from "next";
import { CATEGORIES, US_STATES, BLOG_POSTS } from "@/lib/data";
import { SUPPLIER_CATEGORIES, MOCK_SUPPLIERS } from "@/lib/supplier-data";
import { cityToSlug } from "@/lib/locations";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://smartchoiceconstructions.com";
  const now = new Date();

  const static_pages: MetadataRoute.Sitemap = [
    { url: base,                        lastModified: now, priority: 1.0, changeFrequency: "weekly" },
    { url: `${base}/find-contractors`,  lastModified: now, priority: 0.9, changeFrequency: "daily" },
    { url: `${base}/services`,          lastModified: now, priority: 0.9, changeFrequency: "monthly" },
    { url: `${base}/locations`,         lastModified: now, priority: 0.8, changeFrequency: "monthly" },
    { url: `${base}/pricing`,           lastModified: now, priority: 0.8, changeFrequency: "monthly" },
    { url: `${base}/blog`,              lastModified: now, priority: 0.7, changeFrequency: "weekly" },
    { url: `${base}/about`,             lastModified: now, priority: 0.6, changeFrequency: "monthly" },
    { url: `${base}/how-it-works`,      lastModified: now, priority: 0.7, changeFrequency: "monthly" },
    { url: `${base}/contact`,           lastModified: now, priority: 0.6, changeFrequency: "monthly" },
    { url: `${base}/faq`,               lastModified: now, priority: 0.6, changeFrequency: "monthly" },
    { url: `${base}/join`,              lastModified: now, priority: 0.8, changeFrequency: "monthly" },
    { url: `${base}/privacy`,           lastModified: now, priority: 0.3, changeFrequency: "yearly" },
    { url: `${base}/terms`,             lastModified: now, priority: 0.3, changeFrequency: "yearly" },
    { url: `${base}/cookies`,           lastModified: now, priority: 0.3, changeFrequency: "yearly" },
    { url: `${base}/careers`,           lastModified: now, priority: 0.5, changeFrequency: "monthly" },
    { url: `${base}/account`,           lastModified: now, priority: 0.4, changeFrequency: "monthly" },
  ];

  const service_pages: MetadataRoute.Sitemap = CATEGORIES.map(cat => ({
    url: `${base}/services/${cat.id}`,
    lastModified: now,
    priority: 0.8,
    changeFrequency: "monthly" as const,
  }));

  const state_pages: MetadataRoute.Sitemap = US_STATES.map(state => ({
    url: `${base}/locations/${state.slug}`,
    lastModified: now,
    priority: 0.7,
    changeFrequency: "monthly" as const,
  }));

  const city_pages: MetadataRoute.Sitemap = US_STATES.flatMap(state =>
    state.cities.map(city => ({
      url: `${base}/locations/${state.slug}/${cityToSlug(city)}`,
      lastModified: now,
      priority: 0.6,
      changeFrequency: "monthly" as const,
    }))
  );

  // Top city+service combinations (high-value SEO pages)
  const city_service_pages: MetadataRoute.Sitemap = US_STATES.slice(0, 10).flatMap(state =>
    state.cities.slice(0, 3).flatMap(city =>
      CATEGORIES.slice(0, 6).map(cat => ({
        url: `${base}/locations/${state.slug}/${cityToSlug(city)}/${cat.id}`,
        lastModified: now,
        priority: 0.65,
        changeFrequency: "monthly" as const,
      }))
    )
  );

  const blog_pages: MetadataRoute.Sitemap = BLOG_POSTS.map(post => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: now,
    priority: 0.6,
    changeFrequency: "monthly" as const,
  }));

  const supplier_pages: MetadataRoute.Sitemap = [
    { url: `${base}/suppliers`,       lastModified: now, priority: 0.9, changeFrequency: "weekly" as const },
    { url: `${base}/find-suppliers`,  lastModified: now, priority: 0.8, changeFrequency: "daily" as const },
  ];

  const supplier_category_pages: MetadataRoute.Sitemap = SUPPLIER_CATEGORIES.map(cat => ({
    url: `${base}/suppliers/categories/${cat.id}`,
    lastModified: now, priority: 0.75, changeFrequency: "weekly" as const,
  }));

  const supplier_profile_pages: MetadataRoute.Sitemap = MOCK_SUPPLIERS.map(s => ({
    url: `${base}/suppliers/profile/${s.id}`,
    lastModified: now, priority: 0.7, changeFrequency: "weekly" as const,
  }));

  const supplier_state_pages: MetadataRoute.Sitemap = US_STATES.map(st => ({
    url: `${base}/suppliers/${st.slug}`,
    lastModified: now, priority: 0.65, changeFrequency: "monthly" as const,
  }));

  return [
    ...static_pages,
    ...supplier_pages,
    ...supplier_category_pages,
    ...supplier_profile_pages,
    ...supplier_state_pages,
    ...service_pages,
    ...state_pages,
    ...city_pages,
    ...city_service_pages,
    ...blog_pages,
  ];
}
