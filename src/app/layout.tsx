import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";

import { SITE } from "@/lib/site";
import PwaRegistrar from "@/app/components/PwaRegistrar";

import ConsentAwareAnalytics from "@/app/components/ConsentAwareAnalytics";
import ConsentManager from "@/app/components/ConsentManager";

import type { Metadata, Viewport } from "next";

import "@fontsource/caladea/400.css";
import "@fontsource/caladea/400-italic.css";
import "@fontsource/caladea/700.css";

import "@radix-ui/themes/styles.css";

import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#077998",

  colorScheme: "light",
};

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

  manifest: "/manifest.webmanifest",

  appleWebApp: {
    capable: true,

    title: "D•C Jobs",

    statusBarStyle: "default",
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
    icon: [
      {
        url: "/favicon.jpg",
      },

      {
        url: "/icons/icon-192.png",

        sizes: "192x192",

        type: "image/png",
      },

      {
        url: "/icons/icon-512.png",

        sizes: "512x512",

        type: "image/png",
      },
    ],

    apple: [
      {
        url: "/icons/apple-touch-icon.png",

        sizes: "180x180",

        type: "image/png",
      },
    ],
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
        <PwaRegistrar />

        <ConsentAwareAnalytics />

        <ConsentManager />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLd(organizationSchema),
          }}
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLd(websiteSchema),
          }}
        />

        <Header />

        {children}

        <Footer />
      </body>
    </html>
  );
}
