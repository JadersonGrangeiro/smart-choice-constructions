import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Find Local Contractors | Search by Service & Location",
  description: "Search contractors by service type, location, and ZIP code. Browse profiles, compare reviews, and get free quotes from local construction professionals.",
  openGraph: {
    title: "Find Local Contractors | Smart Choice Constructions",
    description: "Browse local contractors by service type and ZIP code. Free quotes, verified reviews.",
  },
};

export default function FindContractorsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
