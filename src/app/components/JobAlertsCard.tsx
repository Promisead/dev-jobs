"use client";

import { useEffect, useState } from "react";

import { trackEvent } from "@/lib/analytics";

import { readConsent, setNotificationPreference } from "@/lib/consent";

import JobAlertPreferences, {
  AlertPreferences,
  DEFAULT_ALERT_PREFERENCES,
} from "@/app/components/JobAlertPreferences";

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

  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.charCodeAt(index);
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

async function syncSubscriptionWithServer(subscription: PushSubscription) {
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

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || "Unable to synchronize push subscription.");
  }

  return true;
}

export default function JobAlertsCard() {
  const [state, setState] = useState<AlertState>("loading");

  const [busy, setBusy] = useState(false);

  const [endpoint, setEndpoint] = useState<string | null>(null);

  const [preferences, setPreferences] = useState<AlertPreferences>(
    DEFAULT_ALERT_PREFERENCES,
  );

  const [preferencesOpen, setPreferencesOpen] = useState(false);

  const [preferencesLoading, setPreferencesLoading] = useState(false);

  const [message, setMessage] = useState("");

  /*
   * ========================================
   * INITIAL STATE + SERVER RESYNC
   * ========================================
   */

  useEffect(() => {
    async function checkPushState() {
      if (
        !("serviceWorker" in navigator) ||
        !("PushManager" in window) ||
        !("Notification" in window)
      ) {
        setState("unsupported");

        return;
      }

      if (isIOS() && !isStandalone()) {
        setState("install-required");

        return;
      }

      if (Notification.permission === "denied") {
        if (readConsent()) {
          setNotificationPreference("disabled");
        }
        setState("denied");

        return;
      }

      try {
        const registration = await navigator.serviceWorker.ready;

        const subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
          setEndpoint(null);
          const consent = readConsent();

          if (consent && consent.notifications === "enabled") {
            setNotificationPreference("pending");
          }

          setState("ready");

          return;
        }

        /*
         * Browser subscription exists.
         *
         * Always synchronize it back to
         * MongoDB before claiming alerts
         * are enabled.
         */
        await syncSubscriptionWithServer(subscription);
        if (readConsent()) {
          setNotificationPreference("enabled");
        }

        setEndpoint(subscription.endpoint);

        setState("subscribed");
      } catch (error) {
        console.error("Unable to verify push subscription:", error);

        setMessage(
          error instanceof Error
            ? error.message
            : "Unable to verify notification settings.",
        );

        setState("error");
      }
    }

    void checkPushState();
  }, []);

  /*
   * ========================================
   * ENABLE
   * ========================================
   */

  async function enableAlerts() {
    setBusy(true);

    setMessage("");

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

      await syncSubscriptionWithServer(subscription);

      setEndpoint(subscription.endpoint);

      setState("subscribed");
      if (readConsent()) {
        setNotificationPreference("enabled");
      }

      setMessage("Job alerts are enabled on this device.");

      trackEvent(
        "job_alert_subscribe",

        {
          source: "homepage",
        },
      );
    } catch (error) {
      console.error("Unable to enable job alerts:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to enable notifications.",
      );

      setState("error");
    } finally {
      setBusy(false);
    }
  }

  /*
   * ========================================
   * DISABLE
   * ========================================
   */

  async function disableAlerts() {
    setBusy(true);

    setMessage("");

    try {
      const registration = await navigator.serviceWorker.ready;

      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        const response = await fetch(
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

        if (!response.ok) {
          throw new Error("Unable to remove the server subscription.");
        }

        await subscription.unsubscribe();
      }

      setEndpoint(null);

      setPreferences(DEFAULT_ALERT_PREFERENCES);

      setPreferencesOpen(false);

      setState("ready");
      if (readConsent()) {
        setNotificationPreference("disabled");
      }

      setMessage("Job alerts have been turned off.");

      trackEvent(
        "job_alert_unsubscribe",

        {
          source: "homepage",
        },
      );
    } catch (error) {
      console.error("Unable to disable job alerts:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to turn off notifications.",
      );

      setState("error");
    } finally {
      setBusy(false);
    }
  }

  /*
   * ========================================
   * LOAD PERSONALIZATION
   * ========================================
   */

  async function openPreferences() {
    setPreferencesLoading(true);

    setMessage("");

    try {
      const registration = await navigator.serviceWorker.ready;

      const subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        setEndpoint(null);

        setState("ready");

        setMessage("Enable job alerts before personalizing them.");

        return;
      }

      /*
       * Ensure MongoDB is synchronized first.
       */
      await syncSubscriptionWithServer(subscription);

      const response = await fetch(
        "/api/push/preferences",

        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            endpoint: subscription.endpoint,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to load notification preferences.",
        );
      }

      setEndpoint(subscription.endpoint);

      setPreferences(data.preferences as AlertPreferences);

      setPreferencesOpen(true);
    } catch (error) {
      console.error("Unable to load notification preferences:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to load notification preferences.",
      );
    } finally {
      setPreferencesLoading(false);
    }
  }

  if (state === "unsupported") {
    return null;
  }

  return (
    <>
      <section
        id="job-alerts"
        className="mx-auto max-w-7xl px-4 pb-3 pt-5 sm:px-6 lg:px-8"
      >
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
                <p className="font-bold text-gray-950">
                  Get personalized job alerts
                </p>

                <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-600">
                  Receive new opportunities and customize which kinds of jobs
                  matter most to you.
                </p>

                <div aria-live="polite" className="mt-1">
                  {state === "subscribed" && (
                    <p className="text-xs font-semibold text-[#077998]">
                      {message || "Job alerts are enabled on this device."}
                    </p>
                  )}

                  {state === "install-required" && (
                    <p className="text-xs text-gray-500">
                      On iPhone or iPad, install D•C Jobs to your Home Screen
                      first, then enable alerts from the installed app.
                    </p>
                  )}

                  {state === "denied" && (
                    <p className="max-w-xl text-xs leading-5 text-amber-700">
                      Notifications are unavailable in this browsing session. If
                      you&apos;re using private or Incognito browsing, open D•C
                      Jobs in a normal browser window. Otherwise, allow
                      notifications from your browser&apos;s site settings.
                    </p>
                  )}

                  {state === "error" && (
                    <p className="text-xs text-red-600">
                      {message || "Unable to configure notifications."}
                    </p>
                  )}

                  {state === "ready" && message && (
                    <p className="text-xs text-gray-500">{message}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
              {state === "subscribed" ? (
                <>
                  <button
                    type="button"
                    disabled={preferencesLoading}
                    onClick={openPreferences}
                    className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#077998] px-5 text-sm font-semibold text-white transition hover:bg-[#066982] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {preferencesLoading ? "Loading..." : "Personalize Alerts"}
                  </button>

                  <button
                    type="button"
                    disabled={busy}
                    onClick={disableAlerts}
                    className="inline-flex min-h-11 items-center justify-center rounded-lg border border-gray-300 bg-white px-5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {busy ? "Please wait..." : "Turn Off"}
                  </button>
                </>
              ) : state === "denied" ? (
                <button
                  type="button"
                  disabled
                  className="inline-flex min-h-11 items-center justify-center rounded-lg bg-gray-200 px-5 text-sm font-semibold text-gray-500"
                >
                  Notifications unavailable
                </button>
              ) : state === "install-required" ? (
                <button
                  type="button"
                  disabled
                  className="inline-flex min-h-11 items-center justify-center rounded-lg bg-gray-200 px-5 text-sm font-semibold text-gray-500"
                >
                  Install App First
                </button>
              ) : (
                <button
                  type="button"
                  disabled={busy || state === "loading"}
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

      {preferencesOpen && endpoint && (
        <JobAlertPreferences
          endpoint={endpoint}
          initialPreferences={preferences}
          onClose={() => setPreferencesOpen(false)}
          onSaved={(updatedPreferences) => {
            setPreferences(updatedPreferences);

            setMessage("Your notification preferences have been saved.");

            trackEvent(
              "job_alert_preferences_saved",

              {
                source: "homepage",
              },
            );
          }}
        />
      )}
    </>
  );
}
