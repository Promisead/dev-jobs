"use client";

import { useEffect, useState } from "react";

import { GoogleAnalytics } from "@next/third-parties/google";

import { Analytics } from "@vercel/analytics/react";

import EcosystemAnalytics from "@/app/components/EcosystemAnalytics";

import PushClickAnalytics from "@/app/components/PushClickAnalytics";

import { CONSENT_UPDATED_EVENT, hasAnalyticsConsent } from "@/lib/consent";

import { SITE } from "@/lib/site";

function isLocalEnvironment() {
  if (typeof window === "undefined") {
    return true;
  }

  const hostname = window.location.hostname;

  return hostname === "localhost" || hostname === "127.0.0.1";
}

export default function ConsentAwareAnalytics() {
  const [analyticsAllowed, setAnalyticsAllowed] = useState(false);

  const [localEnvironment, setLocalEnvironment] = useState(true);

  useEffect(() => {
    function syncConsent() {
      setAnalyticsAllowed(hasAnalyticsConsent());
    }

    setLocalEnvironment(isLocalEnvironment());

    syncConsent();

    window.addEventListener(CONSENT_UPDATED_EVENT, syncConsent);

    return () => {
      window.removeEventListener(CONSENT_UPDATED_EVENT, syncConsent);
    };
  }, []);

  if (localEnvironment) {
    return null;
  }

  if (!analyticsAllowed) {
    return null;
  }

  return (
    <>
      <EcosystemAnalytics />

      <Analytics />

      {SITE.gaId && <GoogleAnalytics gaId={SITE.gaId} />}

      <PushClickAnalytics />
    </>
  );
}
