import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "For Providers — Join Our Contractor & Supplier Network",
  description: "Grow your contracting or supply business with Smart Choice Constructions. Get qualified leads, build your online reputation, and reach homeowners across 48 states. First month just $29.90.",
  openGraph: {
    title: "Grow Your Business with Smart Choice Constructions",
    description: "Join thousands of contractors and suppliers. Get qualified leads, verified badge, and a full business dashboard. Start for $29.90.",
    url: "https://smartchoiceconstructions.com/for-providers",
    type: "website",
  },
  alternates: { canonical: "https://smartchoiceconstructions.com/for-providers" },
};

export default function ForProvidersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
