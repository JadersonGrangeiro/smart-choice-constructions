import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/server";
import ContractorProfileClient from "@/components/ContractorProfileClient";
import { CATEGORIES } from "@/lib/data";

export const dynamic = "force-dynamic";

async function getContractor(id: string) {
  const supabase = createAdminClient();

  const { data: c, error } = await supabase
    .from("contractors")
    .select(`
      id, company_name, owner_first_name, owner_last_name,
      category, state_code, city, description, phone,
      is_licensed, is_insured, is_background_checked,
      years_experience, response_time_hours, profile_visible,
      website, facebook_url, instagram_url, linkedin_url,
      working_days, open_time, close_time, has_emergency,
      avatar_url, created_at,
      contractor_photos(public_url, sort_order, caption),
      reviews(id, reviewer_name, rating, title, body, project_type, created_at, is_published)
    `)
    .eq("id", id)
    .eq("profile_visible", true)
    .single();

  if (error || !c) return null;
  return c;
}

async function getRelated(id: string, category: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("contractors")
    .select("id, company_name, owner_first_name, owner_last_name, category, state_code, city, description, is_licensed, is_insured, is_background_checked, years_experience, response_time_hours")
    .eq("category", category)
    .eq("profile_visible", true)
    .eq("status", "active")
    .neq("id", id)
    .limit(3);
  return data ?? [];
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const c = await getContractor(id);
  if (!c) return {};
  return {
    title: `${c.company_name} | ${c.category} in ${c.city}, ${c.state_code}`,
    description: `${c.description ?? ""} ${c.years_experience} years of experience in ${c.city}, ${c.state_code}.`,
    openGraph: {
      title: `${c.company_name} — ${c.category} Professional`,
      description: c.description ?? undefined,
      type: "profile",
    },
  };
}

export default async function ContractorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = await getContractor(id);
  if (!c) notFound();

  const publishedReviews = (c.reviews as any[]).filter((r: any) => r.is_published !== false);
  const avgRating = publishedReviews.length > 0
    ? publishedReviews.reduce((s: number, r: any) => s + r.rating, 0) / publishedReviews.length
    : 0;

  const related = await getRelated(id, c.category);

  const toContractorData = (row: any) => ({
    id:           row.id,
    company:      row.company_name,
    name:         `${row.owner_first_name} ${row.owner_last_name}`,
    category:     row.category,
    location:     `${row.city}, ${row.state_code}`,
    rating:       0,
    reviews:      0,
    yearsExp:     row.years_experience ?? 0,
    verified:     row.is_background_checked ?? false,
    insured:      row.is_insured ?? false,
    licensed:     row.is_licensed ?? false,
    phone:        row.phone ?? "",
    description:  row.description ?? "",
    services:     [row.category],
    responseTime: row.response_time_hours ? `within ${row.response_time_hours}h` : "within 24h",
  });

  const contractorData = {
    ...toContractorData(c),
    rating:  parseFloat(avgRating.toFixed(1)),
    reviews: publishedReviews.length,
  };

  const relatedData = related.map(toContractorData);
  const categoryData = CATEGORIES.find(cat => cat.name === c.category) ?? null;

  const earnedBadges: string[] = [
    ...(c.is_licensed ? ["licensed"] : []),
    ...(c.is_insured ? ["insured"] : []),
    ...(c.is_background_checked ? ["background_check"] : []),
    ...(c.years_experience >= 10 ? ["veteran"] : []),
    ...(publishedReviews.length >= 10 ? ["top_rated"] : []),
  ];

  return (
    <ContractorProfileClient
      contractor={contractorData as any}
      earnedBadges={earnedBadges as any}
      relatedContractors={relatedData as any}
      categoryData={categoryData}
      extended={null}
    />
  );
}
