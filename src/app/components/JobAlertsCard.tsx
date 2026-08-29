"use client";

import { useEffect, useState } from "react";

import { trackEvent } from "@/lib/analytics";

import {
  disableJobAlerts,
  enableJobAlerts,
  getCurrentPushState,
  PUSH_SUBSCRIPTION_CHANGED_EVENT,
  PushClientState,
  PushStateChangeDetail,
  syncPushSubscriptionWithServer,
} from "@/lib/clientPushNotifications";

import JobAlertPreferences, {
  AlertPreferences,
  DEFAULT_ALERT_PREFERENCES,
} from "@/app/components/JobAlertPreferences";

type AlertState = "loading" | PushClientState;

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
   * INITIAL STATE
   * ========================================
   */

  useEffect(() => {
    let mounted = true;

    async function loadState() {
      const result = await getCurrentPushState();

      if (!mounted) {
        return;
      }

      setState(result.state);

      setEndpoint(result.subscription?.endpoint ?? null);

      if (result.message) {
        setMessage(result.message);
      }
    }

    void loadState();

    /*
     * ========================================
     * SHARED PUSH STATE
     * ========================================
     *
     * If the onboarding popup enables alerts,
     * this card updates immediately.
     *
     * If this card turns them off, any other
     * listener can update too.
     */

    function handlePushStateChange(event: Event) {
      const customEvent = event as CustomEvent<PushStateChangeDetail>;

      const detail = customEvent.detail;

      if (!detail) {
        return;
      }

      setState(detail.state);

      setEndpoint(detail.endpoint);

      setMessage(detail.message ?? "");

      if (detail.state === "ready") {
        setPreferences(DEFAULT_ALERT_PREFERENCES);

        setPreferencesOpen(false);
      }
    }

    window.addEventListener(
      PUSH_SUBSCRIPTION_CHANGED_EVENT,
      handlePushStateChange,
    );

    return () => {
      mounted = false;

      window.removeEventListener(
        PUSH_SUBSCRIPTION_CHANGED_EVENT,
        handlePushStateChange,
      );
    };
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
      const result = await enableJobAlerts();

      setState(result.state);

      setEndpoint(result.subscription?.endpoint ?? null);

      setMessage(result.message ?? "");

      if (result.state === "subscribed") {
        trackEvent(
          "job_alert_subscribe",

          {
            source: "homepage",
          },
        );
      }
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
      const result = await disableJobAlerts();

      setState(result.state);

      setEndpoint(result.subscription?.endpoint ?? null);

      setMessage(result.message ?? "");

      if (result.state === "ready") {
        setPreferences(DEFAULT_ALERT_PREFERENCES);

        setPreferencesOpen(false);

        trackEvent(
          "job_alert_unsubscribe",

          {
            source: "homepage",
          },
        );
      }
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
      const current = await getCurrentPushState();

      if (current.state !== "subscribed" || !current.subscription) {
        setEndpoint(null);

        setState(current.state);

        setMessage(
          current.message || "Enable job alerts before personalizing them.",
        );

        return;
      }

      const subscription = current.subscription;

      await syncPushSubscriptionWithServer(subscription);

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

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error || "Unable to load notification preferences.",
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
        className="
          mx-auto
          max-w-7xl
          px-4
          pb-3
          pt-5
          sm:px-6
          lg:px-8
        "
      >
        <div
          className="
            overflow-hidden
            rounded-2xl
            border
            border-[#077998]/15
            bg-gradient-to-r
            from-[#f5fbfc]
            to-white
            shadow-sm
          "
        >
          <div
            className="
              flex
              flex-col
              gap-5
              px-5
              py-5

              sm:flex-row
              sm:items-center
              sm:justify-between
              sm:px-7
            "
          >
            <div
              className="
                flex
                items-start
                gap-4
              "
            >
              <div
                className="
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-[#077998]
                  text-white
                "
              >
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
                <p
                  className="
                    font-bold
                    text-gray-950
                  "
                >
                  Get personalized job alerts
                </p>

                <p
                  className="
                    mt-1
                    max-w-2xl
                    text-sm
                    leading-6
                    text-gray-600
                  "
                >
                  Receive new opportunities and customize which kinds of jobs
                  matter most to you.
                </p>

                <div aria-live="polite" className="mt-1">
                  {state === "subscribed" && (
                    <p
                      className="
                        text-xs
                        font-semibold
                        text-[#077998]
                      "
                    >
                      {message || "Job alerts are enabled on this device."}
                    </p>
                  )}

                  {state === "install-required" && (
                    <p
                      className="
                        text-xs
                        text-gray-500
                      "
                    >
                      On iPhone or iPad, install D•C Jobs to your Home Screen
                      first, then enable alerts from the installed app.
                    </p>
                  )}

                  {state === "denied" && (
                    <p
                      className="
                        max-w-xl
                        text-xs
                        leading-5
                        text-amber-700
                      "
                    >
                      Notifications are unavailable in this browsing session. If
                      you&apos;re using private or Incognito browsing, open D•C
                      Jobs in a normal browser window. Otherwise, allow
                      notifications from your browser&apos;s site settings.
                    </p>
                  )}

                  {state === "error" && (
                    <p
                      className="
                        max-w-xl
                        text-xs
                        leading-5
                        text-red-600
                      "
                    >
                      {message || "Unable to configure notifications."}
                    </p>
                  )}

                  {state === "ready" && message && (
                    <p
                      className="
                          text-xs
                          text-gray-500
                        "
                    >
                      {message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div
              className="
                flex
                shrink-0
                flex-col
                gap-2
                sm:flex-row
              "
            >
              {state === "subscribed" ? (
                <>
                  <button
                    type="button"
                    disabled={preferencesLoading}
                    onClick={openPreferences}
                    className="
                      inline-flex
                      min-h-11
                      items-center
                      justify-center
                      rounded-lg
                      bg-[#077998]
                      px-5
                      text-sm
                      font-semibold
                      text-white
                      transition

                      hover:bg-[#066982]

                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  >
                    {preferencesLoading ? "Loading..." : "Personalize Alerts"}
                  </button>

                  <button
                    type="button"
                    disabled={busy}
                    onClick={disableAlerts}
                    className="
                      inline-flex
                      min-h-11
                      items-center
                      justify-center
                      rounded-lg
                      border
                      border-gray-300
                      bg-white
                      px-5
                      text-sm
                      font-semibold
                      text-gray-700
                      transition

                      hover:bg-gray-50

                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  >
                    {busy ? "Please wait..." : "Turn Off"}
                  </button>
                </>
              ) : state === "denied" ? (
                <button
                  type="button"
                  disabled
                  className="
                    inline-flex
                    min-h-11
                    items-center
                    justify-center
                    rounded-lg
                    bg-gray-200
                    px-5
                    text-sm
                    font-semibold
                    text-gray-500
                  "
                >
                  Notifications unavailable
                </button>
              ) : state === "install-required" ? (
                <button
                  type="button"
                  disabled
                  className="
                    inline-flex
                    min-h-11
                    items-center
                    justify-center
                    rounded-lg
                    bg-gray-200
                    px-5
                    text-sm
                    font-semibold
                    text-gray-500
                  "
                >
                  Install App First
                </button>
              ) : (
                <button
                  type="button"
                  disabled={busy || state === "loading"}
                  onClick={enableAlerts}
                  className="
                    inline-flex
                    min-h-11
                    items-center
                    justify-center
                    rounded-lg
                    bg-[#077998]
                    px-5
                    text-sm
                    font-semibold
                    text-white
                    transition

                    hover:bg-[#066982]

                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
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
