"use client";

import EcosystemAnalytics from "@/app/components/EcosystemAnalytics";

import { CONSENT_UPDATED_EVENT, hasAnalyticsConsent } from "@/lib/consent";

import { SITE } from "@/lib/site";

import { GoogleAnalytics } from "@next/third-parties/google";

import { Analytics } from "@vercel/analytics/react";

import { useEffect, useState } from "react";

export default function ConsentAwareAnalytics() {
  const [analyticsAllowed, setAnalyticsAllowed] = useState(false);

  useEffect(() => {
    function syncConsent() {
      setAnalyticsAllowed(hasAnalyticsConsent());
    }

    syncConsent();

    window.addEventListener(CONSENT_UPDATED_EVENT, syncConsent);

    return () => {
      window.removeEventListener(CONSENT_UPDATED_EVENT, syncConsent);
    };
  }, []);

  /*
   * BASIC CONSENT MODE
   *
   * Google Analytics and Vercel Analytics
   * are not loaded at all until the visitor
   * explicitly allows analytics.
   */
  if (!analyticsAllowed) {
    return null;
  }

  return (
    <>
      <EcosystemAnalytics />

      <Analytics />

      {SITE.gaId && <GoogleAnalytics gaId={SITE.gaId} />}
    </>
  );
}
