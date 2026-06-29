import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { I18nProvider } from "@/lib/i18n/context";
import { organizationSchema, websiteSchema } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL("https://smartchoiceconstructions.com"),
  title: {
    default: "Smart Choice Constructions | Find Trusted Contractors Near You",
    template: "%s | Smart Choice Constructions",
  },
  description: "Smart Choice Constructions connects homeowners with verified local contractors. Free for homeowners. 60+ service categories across all 48 continental states.",
  keywords: ["contractors near me","home improvement","roofing contractor","kitchen remodeling","find a contractor","licensed contractors","electrician","plumber","HVAC contractor","handyman"],
  authors: [{ name: "Smart Choice Constructions LLC" }],
  creator: "Smart Choice Constructions LLC",
  publisher: "Smart Choice Constructions LLC",
  category: "Home Improvement",
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: "es_US",
    url: "https://smartchoiceconstructions.com",
    siteName: "Smart Choice Constructions",
    title: "Smart Choice Constructions | Simple, Clear, Complete.",
    description: "Find local contractors in your area. Free for homeowners. 50,000+ professionals. 60+ service categories.",
    images: [{ url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=80", width: 1200, height: 630, alt: "Smart Choice Constructions — Find Trusted Contractors" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@smartchoicescc",
    creator: "@smartchoicescc",
    title: "Smart Choice Constructions | Find Trusted Contractors",
    description: "Find trusted, verified contractors in your area. Always free for homeowners.",
    images: ["https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=80"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/logo-icon.svg", type: "image/svg+xml" },
    ],
    apple: "/logo-icon.svg",
    shortcut: "/logo-icon.svg",
  },
  // google verification: add token after claiming property in Search Console
  alternates: {
    canonical: "https://smartchoiceconstructions.com",
    languages: {
      "en-US": "https://smartchoiceconstructions.com",
      "es-US": "https://smartchoiceconstructions.com",
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="theme-color" content="#162E5E" />
        <meta name="color-scheme" content="light" />
        <meta name="format-detection" content="telephone=no" />
        {/* Organization JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify([organizationSchema, websiteSchema]) }}
        />
      </head>
      <body>
        <I18nProvider>
          {/* Skip to main content — accessibility */}
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
          <Header />
          <main id="main-content" tabIndex={-1}>{children}</main>
          <Footer />
        </I18nProvider>
      </body>
    </html>
  );
}
