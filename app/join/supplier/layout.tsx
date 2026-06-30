import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Join as Supplier — Free Listing for Building Supply Businesses",
  description: "List your building supply business on Smart Choice Constructions for free. Reach local contractors searching for materials, equipment, and professional services. No credit card required.",
  openGraph: {
    title: "Free Supplier Listing — Smart Choice Constructions",
    description: "Get discovered by contractors who need your products and services. Apply in minutes. Free forever.",
    url: "https://smartchoiceconstructions.com/join/supplier",
    type: "website",
  },
  alternates: { canonical: "https://smartchoiceconstructions.com/join/supplier" },
};

export default function SupplierJoinLayout({ children }: { children: React.ReactNode }) {
  return children;
}
