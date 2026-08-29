"use client";

import { useEffect } from "react";

const LAST_SYNC_KEY = "dc_jobs_push_activity_sync";

const SIX_HOURS = 6 * 60 * 60 * 1000;

function getPushAttribution() {
  const url = new URL(window.location.href);

  const fromPush = url.searchParams.get("utm_medium") === "web_push";

  return {
    fromPush,

    campaign: fromPush
      ? url.searchParams.get("push_campaign") ||
        url.searchParams.get("utm_campaign")
      : null,

    pushId: fromPush
      ? url.searchParams.get("push_id") || url.searchParams.get("utm_content")
      : null,
  };
}

export default function PushActivityTracker() {
  useEffect(() => {
    /*
     * PwaRegistrar intentionally doesn't
     * install the production service worker
     * during next dev.
     */
    if (process.env.NODE_ENV !== "production") {
      return;
    }

    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      return;
    }

    let disposed = false;

    async function syncActivity(force: boolean) {
      try {
        const attribution = getPushAttribution();

        const now = Date.now();

        const previous = Number(
          window.localStorage.getItem(LAST_SYNC_KEY) || "0",
        );

        /*
         * Normal website visits are throttled.
         *
         * Push clicks always bypass the throttle
         * because we want reliable click/return
         * attribution.
         */
        if (
          !force &&
          !attribution.fromPush &&
          previous &&
          now - previous < SIX_HOURS
        ) {
          return;
        }

        const registration = await navigator.serviceWorker.ready;

        if (disposed) {
          return;
        }

        const subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
          return;
        }

        const response = await fetch(
          "/api/push/activity",

          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              endpoint: subscription.endpoint,

              source: attribution.fromPush
                ? "notification_click"
                : "site_visit",

              campaign: attribution.campaign,

              pushId: attribution.pushId,
            }),
          },
        );

        if (response.ok) {
          window.localStorage.setItem(
            LAST_SYNC_KEY,

            String(now),
          );
        }
      } catch (error) {
        /*
         * Activity tracking must never affect
         * the user's ability to browse jobs.
         */
        console.error("Unable to synchronize Push activity:", error);
      }
    }

    const attribution = getPushAttribution();

    void syncActivity(attribution.fromPush);

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        void syncActivity(false);
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      disposed = true;

      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return null;
}
