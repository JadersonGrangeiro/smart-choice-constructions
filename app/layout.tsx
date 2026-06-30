import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { I18nProvider } from "@/lib/i18n/context";
import { organizationSchema, websiteSchema } from "@/lib/seo";
import { createAdminClient } from "@/lib/supabase/server";

const DEFAULT_OG = "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=80";

async function getOgImage(): Promise<string> {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("platform_settings")
      .select("value")
      .eq("key", "site_images")
      .single();
    if (data?.value) {
      const parsed = JSON.parse(data.value);
      if (parsed?.og_image) return parsed.og_image;
    }
  } catch (_e) {
    // fallback to default
  }
  return DEFAULT_OG;
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#162E5E",
  colorScheme: "light",
};

export async function generateMetadata(): Promise<Metadata> {
  const ogImage = await getOgImage();
  return {
    metadataBase: new URL("https://smartchoiceconstructions.com"),
    title: {
      default: "Smart Choice Constructions | Find Trusted Contractors Near You",
      template: "%s | Smart Choice Constructions",
    },
    description: "Smart Choice Constructions connects homeowners with verified local contractors. Free for homeowners. 60+ service categories across all 48 continental states.",
    keywords: ["contractors near me", "home improvement", "roofing contractor", "kitchen remodeling", "find a contractor", "licensed contractors", "electrician", "plumber", "HVAC contractor", "handyman"],
    authors: [{ name: "Smart Choice Constructions LLC" }],
    creator: "Smart Choice Constructions LLC",
    publisher: "Smart Choice Constructions LLC",
    category: "Home Improvement",
    openGraph: {
      type: "website",
      locale: "en_US",
      url: "https://smartchoiceconstructions.com",
      siteName: "Smart Choice Constructions",
      title: "Smart Choice Constructions | Simple, Clear, Complete.",
      description: "Find local contractors in your area. Free for homeowners. 50,000+ professionals. 60+ service categories.",
      images: [{ url: ogImage, width: 1200, height: 630, alt: "Smart Choice Constructions - Find Trusted Contractors" }],
    },
    twitter: {
      card: "summary_large_image",
      site: "@smartchoicescc",
      creator: "@smartchoicescc",
      title: "Smart Choice Constructions | Find Trusted Contractors",
      description: "Find trusted, verified contractors in your area. Always free for homeowners.",
      images: [ogImage],
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
      icon: [{ url: "/logo-icon.svg", type: "image/svg+xml" }],
      apple: "/logo-icon.svg",
      shortcut: "/logo-icon.svg",
    },
    alternates: {
      canonical: "https://smartchoiceconstructions.com",
      languages: {
        "en-US": "https://smartchoiceconstructions.com",
        "es-US": "https://smartchoiceconstructions.com",
      },
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="format-detection" content="telephone=no" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify([organizationSchema, websiteSchema]) }}
        />
      </head>
      <body>
        <I18nProvider>
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
