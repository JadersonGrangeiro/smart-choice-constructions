import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Find Local Suppliers | Building Materials, Equipment & Services",
  description: "Search local building material suppliers, equipment rental companies, and professional services. Browse by category, state, or city.",
  openGraph: {
    title: "Find Local Suppliers | Smart Choice Constructions",
    description: "Browse local suppliers by category and location. Free for contractors and homeowners.",
  },
};

export default function FindSuppliersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
