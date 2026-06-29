import Link from "next/link";
import { MOCK_CONTRACTORS, CATEGORIES, CONTRACTOR_EXTENDED } from "@/lib/data";
import { BADGES, MOCK_CONTRACTOR_BADGES } from "@/lib/badges";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ContractorProfileClient from "@/components/ContractorProfileClient";

export async function generateStaticParams() {
  return MOCK_CONTRACTORS.map(c => ({ id: c.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const c = MOCK_CONTRACTORS.find(x => x.id === id);
  if (!c) return {};
  return {
    title: `${c.company} | ${c.category} in ${c.location}`,
    description: `${c.description} ${c.yearsExp} years of experience in ${c.location}. View profile, reviews, team and portfolio on Smart Choice Constructions.`,
    openGraph: {
      title: `${c.company} — ${c.category} Professional`,
      description: c.description,
      type: "profile",
    },
  };
}

export default async function ContractorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = MOCK_CONTRACTORS.find(x => x.id === id);
  if (!c) notFound();

  const earnedBadges       = MOCK_CONTRACTOR_BADGES[c.id] ?? [];
  const relatedContractors = MOCK_CONTRACTORS.filter(x => x.id !== c.id && x.category === c.category).slice(0, 3);
  const categoryData       = CATEGORIES.find(cat => cat.name === c.category);
  // Pass extended data (team, videos, brands, certifications, etc.)
  const extended           = CONTRACTOR_EXTENDED[c.id] ?? null;

  return (
    <ContractorProfileClient
      contractor={c}
      earnedBadges={earnedBadges}
      relatedContractors={relatedContractors}
      categoryData={categoryData}
      extended={extended}
    />
  );
}
