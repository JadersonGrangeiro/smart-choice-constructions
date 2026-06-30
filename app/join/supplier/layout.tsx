import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Join as Supplier — $14.90 First Month | Smart Choice Constructions",
  description: "List your building supply business on Smart Choice Constructions. Reach local contractors searching for materials, equipment, and professional services. Start at $14.90 your first month.",
  openGraph: {
    title: "Join as Supplier — Smart Choice Constructions",
    description: "Get discovered by contractors who need your products and services. $14.90 first month, then $29.90/month.",
    url: "https://smartchoiceconstructions.com/join/supplier",
    type: "website",
  },
  alternates: { canonical: "https://smartchoiceconstructions.com/join/supplier" },
};

export default function SupplierJoinLayout({ children }: { children: React.ReactNode }) {
  return children;
}
