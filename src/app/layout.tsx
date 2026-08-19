// src/app/layout.tsx

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "@/styles/globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://kooi.ai";
const SITE_NAME = "Kooi";
const TITLE = "Kooi | Partner for Your AI Voice Call Agents";
const DESCRIPTION =
  "Kooi deploys intelligent AI voice agents that call, qualify, and score your leads 24/7. Automate outbound lead qualification for your SMB with human-like voice AI — no cold-call burnout, no missed opportunities.";

export const metadata: Metadata = {
  // ─── Core ──────────────────────────────────────────────
  title: {
    default: TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  keywords: [
    "AI voice agents",
    "lead qualification",
    "voice AI",
    "AI calling",
    "outbound calling automation",
    "AI SDR",
    "lead scoring",
    "sales automation",
    "SMB sales tools",
    "conversational AI",
    "AI lead qualification",
    "automated cold calling",
    "voice AI agents",
    "AI sales assistant",
    "Kooi",
  ],
  authors: [{ name: "Kooi", url: SITE_URL }],
  creator: "Kooi",
  publisher: "Kooi",
  metadataBase: new URL(SITE_URL),

  // ─── Alternate / Canonical ─────────────────────────────
  alternates: {
    canonical: "/",
  },

  // ─── Open Graph ────────────────────────────────────────
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Kooi — AI Voice Agents for Automated Lead Qualification",
        type: "image/png",
      },
    ],
  },

  // ─── Twitter ───────────────────────────────────────────
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [`${SITE_URL}/og-image.png`],
    creator: "@kooi_ai",
    site: "@kooi_ai",
  },

  // ─── Robots ────────────────────────────────────────────
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // ─── Icons ─────────────────────────────────────────────
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: "/favicon.ico",
  },

  // ─── Manifest ──────────────────────────────────────────
  manifest: "/site.webmanifest",

  // ─── Category ──────────────────────────────────────────
  category: "technology",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a1628" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  colorScheme: "light",
};

// ─── JSON-LD Structured Data ───────────────────────────────────────
function JsonLd() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Kooi",
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: DESCRIPTION,
    sameAs: [
      "https://twitter.com/kooi_ai",
      "https://linkedin.com/company/kooi-ai",
      "https://github.com/kooi-ai",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      email: "hello@kooi.ai",
      availableLanguage: ["English"],
    },
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Kooi",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: DESCRIPTION,
    url: SITE_URL,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "USD",
      lowPrice: "79",
      highPrice: "249",
      offerCount: "3",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "127",
      bestRating: "5",
      worstRating: "1",
    },
    featureList: [
      "AI Voice Calling",
      "Automated Lead Qualification",
      "Smart Lead Scoring",
      "Real-Time Analytics",
      "Campaign Management",
      "Call Recording & Transcripts",
      "CRM Integration",
      "Multi-Tenant Architecture",
    ],
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: DESCRIPTION,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How natural do the AI voice agents sound?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Our AI agents use advanced voice synthesis that sounds remarkably human. They handle natural conversation flow, understand context, manage interruptions, and adapt their tone based on the conversation. Most leads don't realize they're speaking with AI.",
        },
      },
      {
        "@type": "Question",
        name: "How long does it take to set up a campaign?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You can launch your first campaign in under 5 minutes. Upload a CSV of leads, select or customize an AI agent, configure your property details, and hit start. Kooi handles everything else.",
        },
      },
      {
        "@type": "Question",
        name: "What data does Kooi extract from each call?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Kooi extracts 13+ data points from every conversation including disposition, lead temperature (Hot/Warm/Cold), budget range, purchase timeline, preferred configuration, location preferences, purchase purpose, next action, contact channel preference, and compliance flags.",
        },
      },
      {
        "@type": "Question",
        name: "Do you offer a free trial?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes! Every plan comes with a 14-day free trial with full access to all features. No credit card required to start.",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />
    </>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <JsonLd />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="antialiased">
        <Providers>
          {children}
          <Toaster
            position="top-right"
            richColors
            closeButton
            duration={4000}
            toastOptions={{
              className: "font-sans",
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
