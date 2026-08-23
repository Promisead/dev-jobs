"use client";

import { useEffect, useState } from "react";

import { trackEvent } from "@/lib/analytics";

type AlertState =
  | "loading"
  | "ready"
  | "subscribed"
  | "denied"
  | "unsupported"
  | "install-required"
  | "error";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);

  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);

  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

function isIOS() {
  return /iPad|iPhone|iPod/i.test(navigator.userAgent);
}

function isStandalone() {
  const navigatorWithStandalone = navigator as Navigator & {
    standalone?: boolean;
  };

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    navigatorWithStandalone.standalone === true
  );
}

export default function JobAlertsCard() {
  const [state, setState] = useState<AlertState>("loading");

  const [busy, setBusy] = useState(false);

  useEffect(() => {
    async function check() {
      if (
        !("serviceWorker" in navigator) ||
        !("PushManager" in window) ||
        !("Notification" in window)
      ) {
        setState("unsupported");

        return;
      }

      /*
       * iPhone/iPad Web Push works from
       * the installed Home Screen app.
       */
      if (isIOS() && !isStandalone()) {
        setState("install-required");

        return;
      }

      if (Notification.permission === "denied") {
        setState("denied");

        return;
      }

      try {
        const registration = await navigator.serviceWorker.ready;

        const subscription = await registration.pushManager.getSubscription();

        setState(subscription ? "subscribed" : "ready");
      } catch {
        setState("error");
      }
    }

    void check();
  }, []);

  async function enableAlerts() {
    setBusy(true);

    try {
      if (isIOS() && !isStandalone()) {
        setState("install-required");

        return;
      }

      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

      if (!publicKey) {
        throw new Error("VAPID public key is not configured.");
      }

      let permission = Notification.permission;

      /*
       * Permission is requested ONLY
       * from this direct button click.
       */
      if (permission === "default") {
        permission = await Notification.requestPermission();
      }

      if (permission !== "granted") {
        setState("denied");

        return;
      }

      const registration = await navigator.serviceWorker.ready;

      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,

          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });
      }

      const response = await fetch(
        "/api/push/subscribe",

        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(subscription.toJSON()),
        },
      );

      if (!response.ok) {
        throw new Error("Unable to save subscription.");
      }

      setState("subscribed");

      trackEvent("job_alert_subscribe", {
        source: "homepage",
      });
    } catch (error) {
      console.error("Unable to enable job alerts:", error);

      setState("error");
    } finally {
      setBusy(false);
    }
  }

  async function disableAlerts() {
    setBusy(true);

    try {
      const registration = await navigator.serviceWorker.ready;

      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        /*
         * Remove server record first.
         */
        await fetch(
          "/api/push/subscribe",

          {
            method: "DELETE",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              endpoint: subscription.endpoint,
            }),
          },
        );

        await subscription.unsubscribe();
      }

      setState("ready");

      trackEvent("job_alert_unsubscribe", {
        source: "homepage",
      });
    } catch (error) {
      console.error("Unable to disable job alerts:", error);

      setState("error");
    } finally {
      setBusy(false);
    }
  }

  if (state === "unsupported") {
    return null;
  }

  return (
    <section className="mx-auto max-w-7xl px-4 pb-3 pt-5 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-2xl border border-[#077998]/15 bg-gradient-to-r from-[#f5fbfc] to-white shadow-sm">
        <div className="flex flex-col gap-5 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#077998] text-white">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
                className="h-5 w-5"
              >
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />

                <path d="M10 21h4" />
              </svg>
            </div>

            <div>
              <p className="font-bold text-gray-950">Get new job alerts</p>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-600">
                Be notified when new technology opportunities are published on
                D•C Jobs.
              </p>

              <div aria-live="polite" className="mt-1">
                {state === "subscribed" && (
                  <p className="text-xs font-semibold text-[#077998]">
                    Job alerts are enabled on this device.
                  </p>
                )}

                {state === "install-required" && (
                  <p className="text-xs text-gray-500">
                    On iPhone or iPad, install D•C Jobs to your Home Screen
                    first, then enable alerts from the installed app.
                  </p>
                )}

                {state === "denied" && (
                  <p className="text-xs text-amber-700">
                    Notifications are currently blocked. Enable them in your
                    browser or device notification settings.
                  </p>
                )}

                {state === "error" && (
                  <p className="text-xs text-red-600">
                    We could not update your notification settings. Please try
                    again.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="shrink-0">
            {state === "subscribed" ? (
              <button
                type="button"
                disabled={busy}
                onClick={disableAlerts}
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-gray-300 bg-white px-5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? "Please wait..." : "Turn Off Alerts"}
              </button>
            ) : (
              <button
                type="button"
                disabled={
                  busy ||
                  state === "loading" ||
                  state === "denied" ||
                  state === "install-required"
                }
                onClick={enableAlerts}
                className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#077998] px-5 text-sm font-semibold text-white transition hover:bg-[#066982] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? "Enabling..." : "Enable Job Alerts"}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
