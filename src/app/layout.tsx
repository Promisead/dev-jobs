import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";

import { SITE } from "@/lib/site";

import { GoogleAnalytics } from "@next/third-parties/google";

import { Analytics } from "@vercel/analytics/react";

import type { Metadata } from "next";

import EcosystemAnalytics from "@/app/components/EcosystemAnalytics";

import "@fontsource/caladea/400.css";
import "@fontsource/caladea/400-italic.css";
import "@fontsource/caladea/700.css";

import "@radix-ui/themes/styles.css";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),

  title: {
    default: "Tech Jobs in Nigeria & Africa | Dev Champions Jobs",

    template: "%s | Dev Champions Jobs",
  },

  description: SITE.description,

  applicationName: SITE.name,

  category: "Jobs and Careers",

  authors: [
    {
      name: SITE.parent.name,

      url: SITE.parent.url,
    },
  ],

  creator: SITE.parent.name,

  publisher: SITE.parent.name,

  robots: {
    index: true,

    follow: true,

    googleBot: {
      index: true,

      follow: true,

      "max-image-preview": "large",

      "max-snippet": -1,

      "max-video-preview": -1,
    },
  },

  openGraph: {
    type: "website",

    locale: SITE.locale,

    siteName: SITE.name,

    title: "Tech Jobs in Nigeria & Africa | Dev Champions Jobs",

    description: SITE.description,
  },

  twitter: {
    card: "summary",

    title: "Tech Jobs in Nigeria & Africa | Dev Champions Jobs",

    description: SITE.description,
  },

  verification: {
    google: "LpKsqnwfUu-q-O2vxgUqSoAUGgcYN5eOkmcS-VkkToQ",
  },

  icons: {
    icon: "/favicon.jpg",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",

  "@type": "Organization",

  "@id": `${SITE.parent.url}/#organization`,

  name: SITE.parent.name,

  url: SITE.parent.url,

  logo: `${SITE.url}/images/logo/logo_web.png`,

  email: SITE.contact.email,

  telephone: SITE.contact.phone,

  sameAs: [
    SITE.social.facebook,
    SITE.social.instagram,
    SITE.social.linkedin,
    SITE.social.x,
  ],
};

const websiteSchema = {
  "@context": "https://schema.org",

  "@type": "WebSite",

  "@id": `${SITE.url}/#website`,

  name: SITE.name,

  alternateName: SITE.shortName,

  url: SITE.url,

  inLanguage: SITE.language,

  publisher: {
    "@id": `${SITE.parent.url}/#organization`,
  },
};

function safeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={SITE.language}>
      <body>
        <EcosystemAnalytics />

        {/* ORGANIZATION SCHEMA */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLd(organizationSchema),
          }}
        />

        {/* WEBSITE SCHEMA */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLd(websiteSchema),
          }}
        />

        <Header />

        <Analytics />

        {children}

        <Footer />
      </body>

      {SITE.gaId && <GoogleAnalytics gaId={SITE.gaId} />}
    </html>
  );
}
