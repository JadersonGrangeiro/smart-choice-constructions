import type { MetadataRoute } from "next";
import { CATEGORIES, US_STATES } from "@/lib/data";
import { SUPPLIER_CATEGORIES } from "@/lib/supplier-data";
import { cityToSlug } from "@/lib/locations";
import { createAdminClient } from "@/lib/supabase/server";

export const revalidate = 3600; // regenerate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://smartchoiceconstructions.com";
  const now = new Date();

  // ── Fetch live data from DB ────────────────────────────────────────────────
  const supabase = createAdminClient();

  const [contractorsRes, suppliersRes, blogRes] = await Promise.all([
    supabase
      .from("contractors")
      .select("id, updated_at")
      .eq("status", "active")
      .eq("profile_visible", true)
      .limit(5000),
    supabase
      .from("suppliers")
      .select("id, updated_at")
      .eq("is_active", true)
      .limit(5000),
    supabase
      .from("platform_settings")
      .select("value")
      .eq("key", "blog_posts")
      .single(),
  ]);

  // Blog posts
  let blogSlugs: string[] = [];
  try {
    if (blogRes.data?.value) {
      const posts = JSON.parse(blogRes.data.value);
      blogSlugs = (posts as Array<{ slug: string; published?: boolean }>)
        .filter(p => p.published !== false)
        .map(p => p.slug)
        .filter(Boolean);
    }
  } catch {}

  // ── Static pages ──────────────────────────────────────────────────────────
  const static_pages: MetadataRoute.Sitemap = [
    { url: base,                        lastModified: now, priority: 1.0,  changeFrequency: "weekly" },
    { url: `${base}/find-contractors`,  lastModified: now, priority: 0.9,  changeFrequency: "daily" },
    { url: `${base}/services`,          lastModified: now, priority: 0.9,  changeFrequency: "monthly" },
    { url: `${base}/locations`,         lastModified: now, priority: 0.8,  changeFrequency: "monthly" },
    { url: `${base}/pricing`,           lastModified: now, priority: 0.8,  changeFrequency: "monthly" },
    { url: `${base}/blog`,              lastModified: now, priority: 0.7,  changeFrequency: "weekly" },
    { url: `${base}/about`,             lastModified: now, priority: 0.6,  changeFrequency: "monthly" },
    { url: `${base}/how-it-works`,      lastModified: now, priority: 0.7,  changeFrequency: "monthly" },
    { url: `${base}/contact`,           lastModified: now, priority: 0.6,  changeFrequency: "monthly" },
    { url: `${base}/faq`,               lastModified: now, priority: 0.6,  changeFrequency: "monthly" },
    { url: `${base}/join`,              lastModified: now, priority: 0.8,  changeFrequency: "monthly" },
    { url: `${base}/suppliers`,         lastModified: now, priority: 0.9,  changeFrequency: "weekly" },
    { url: `${base}/find-suppliers`,    lastModified: now, priority: 0.8,  changeFrequency: "daily" },
    { url: `${base}/privacy`,           lastModified: now, priority: 0.3,  changeFrequency: "yearly" },
    { url: `${base}/terms`,             lastModified: now, priority: 0.3,  changeFrequency: "yearly" },
    { url: `${base}/cookies`,           lastModified: now, priority: 0.3,  changeFrequency: "yearly" },
    { url: `${base}/careers`,           lastModified: now, priority: 0.5,  changeFrequency: "monthly" },
  ];

  // ── Services ──────────────────────────────────────────────────────────────
  const service_pages: MetadataRoute.Sitemap = CATEGORIES.map(cat => ({
    url: `${base}/services/${cat.id}`,
    lastModified: now, priority: 0.8, changeFrequency: "monthly" as const,
  }));

  // ── Locations ─────────────────────────────────────────────────────────────
  const state_pages: MetadataRoute.Sitemap = US_STATES.map(state => ({
    url: `${base}/locations/${state.slug}`,
    lastModified: now, priority: 0.7, changeFrequency: "monthly" as const,
  }));

  const city_pages: MetadataRoute.Sitemap = US_STATES.flatMap(state =>
    state.cities.map(city => ({
      url: `${base}/locations/${state.slug}/${cityToSlug(city)}`,
      lastModified: now, priority: 0.6, changeFrequency: "monthly" as const,
    }))
  );

  // Mirror exactly the generateStaticParams logic from the [service] page
  const PRIORITY_STATES = new Set(["TX","CA","FL","NY","IL","GA","WA","CO","AZ","NC"]);
  const city_service_pages: MetadataRoute.Sitemap = US_STATES.flatMap(state => {
    const cityLimit = PRIORITY_STATES.has(state.code) ? 6 : 2;
    return state.cities.slice(0, cityLimit).flatMap(city =>
      CATEGORIES.slice(0, 18).map(cat => ({
        url: `${base}/locations/${state.slug}/${cityToSlug(city)}/${cat.id}`,
        lastModified: now, priority: 0.65, changeFrequency: "monthly" as const,
      }))
    );
  });

  // ── Contractors (real DB) ─────────────────────────────────────────────────
  const contractor_pages: MetadataRoute.Sitemap = (contractorsRes.data ?? []).map(c => ({
    url: `${base}/contractors/${c.id}`,
    lastModified: c.updated_at ? new Date(c.updated_at) : now,
    priority: 0.7, changeFrequency: "weekly" as const,
  }));

  // ── Suppliers (real DB) ───────────────────────────────────────────────────
  const supplier_category_pages: MetadataRoute.Sitemap = SUPPLIER_CATEGORIES.map(cat => ({
    url: `${base}/suppliers/categories/${cat.id}`,
    lastModified: now, priority: 0.75, changeFrequency: "weekly" as const,
  }));

  const supplier_profile_pages: MetadataRoute.Sitemap = (suppliersRes.data ?? []).map(s => ({
    url: `${base}/suppliers/profile/${s.id}`,
    lastModified: s.updated_at ? new Date(s.updated_at) : now,
    priority: 0.7, changeFrequency: "weekly" as const,
  }));

  const supplier_state_pages: MetadataRoute.Sitemap = US_STATES.map(st => ({
    url: `${base}/suppliers/${st.slug}`,
    lastModified: now, priority: 0.65, changeFrequency: "monthly" as const,
  }));

  // ── Blog (real DB) ────────────────────────────────────────────────────────
  const blog_pages: MetadataRoute.Sitemap = blogSlugs.map(slug => ({
    url: `${base}/blog/${slug}`,
    lastModified: now, priority: 0.6, changeFrequency: "monthly" as const,
  }));

  return [
    ...static_pages,
    ...service_pages,
    ...state_pages,
    ...city_pages,
    ...city_service_pages,
    ...contractor_pages,
    ...supplier_category_pages,
    ...supplier_profile_pages,
    ...supplier_state_pages,
    ...blog_pages,
  ];
}
