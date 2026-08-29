"use client";

import { useEffect } from "react";

import { trackEvent } from "@/lib/analytics";

const SESSION_PREFIX = "dc_jobs_push_click:";

export default function PushClickAnalytics() {
  useEffect(() => {
    const url = new URL(window.location.href);

    const medium = url.searchParams.get("utm_medium");

    if (medium !== "web_push") {
      return;
    }

    const campaign =
      url.searchParams.get("push_campaign") ||
      url.searchParams.get("utm_campaign") ||
      "unknown";

    const pushType = url.searchParams.get("push_type") || "unknown";

    const pushId = url.searchParams.get("push_id") || "unknown";

    const storageKey = `${SESSION_PREFIX}${campaign}:${pushId}:${url.pathname}`;

    /*
     * Prevent duplicate custom events caused by
     * normal refreshes during the same session.
     */
    if (window.sessionStorage.getItem(storageKey)) {
      return;
    }

    trackEvent(
      "push_notification_click",

      {
        push_campaign: campaign,

        push_type: pushType,

        push_id: pushId,

        landing_path: url.pathname,
      },
    );

    window.sessionStorage.setItem(storageKey, "1");
  }, []);

  return null;
}
