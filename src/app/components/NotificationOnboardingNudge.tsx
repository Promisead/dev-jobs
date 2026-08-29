"use client";

import { useCallback, useEffect, useState } from "react";

import { CONSENT_UPDATED_EVENT, readConsent } from "@/lib/consent";

import {
  enableJobAlerts,
  getCurrentPushState,
  isIOSDevice,
  isStandalonePwa,
  PushClientState,
  supportsPushNotifications,
} from "@/lib/clientPushNotifications";

import { trackEvent } from "@/lib/analytics";

const DISMISSED_UNTIL_KEY = "dc_jobs_notification_nudge_dismissed_until";

const THREE_DAYS = 3 * 24 * 60 * 60 * 1000;

function isDismissed() {
  if (typeof window === "undefined") {
    return true;
  }

  const dismissedUntil = Number(
    window.localStorage.getItem(DISMISSED_UNTIL_KEY) || "0",
  );

  return dismissedUntil > Date.now();
}

function dismissForThreeDays() {
  window.localStorage.setItem(
    DISMISSED_UNTIL_KEY,

    String(Date.now() + THREE_DAYS),
  );
}

export default function NotificationOnboardingNudge() {
  const [visible, setVisible] = useState(false);

  const [state, setState] = useState<PushClientState>("ready");

  const [busy, setBusy] = useState(false);

  const [message, setMessage] = useState("");

  const [iosInstallNeeded, setIosInstallNeeded] = useState(false);

  /*
   * ========================================
   * DECIDE WHETHER NUDGE SHOULD APPEAR
   * ========================================
   */

  const evaluateNudge = useCallback(async () => {
    const consent = readConsent();

    /*
     * Privacy decision must happen first.
     */
    if (!consent) {
      setVisible(false);

      return;
    }

    /*
     * User explicitly disabled notification
     * onboarding.
     */
    if (consent.notifications === "disabled") {
      setVisible(false);

      return;
    }

    /*
     * Already enabled.
     */
    if (consent.notifications === "enabled") {
      setVisible(false);

      return;
    }

    if (!supportsPushNotifications()) {
      setVisible(false);

      return;
    }

    if (isDismissed()) {
      setVisible(false);

      return;
    }

    /*
     * iOS Web Push requires standalone PWA.
     */
    if (isIOSDevice() && !isStandalonePwa()) {
      setIosInstallNeeded(true);

      setState("install-required");

      setVisible(true);

      return;
    }

    const current = await getCurrentPushState();

    setState(current.state);

    /*
     * This includes Chrome Incognito and
     * manually-blocked notification permissions.
     *
     * Do not annoy the user with a CTA that
     * cannot currently work.
     */
    if (
      current.state === "denied" ||
      current.state === "unsupported" ||
      current.state === "subscribed"
    ) {
      setVisible(false);

      return;
    }

    if (current.state === "error") {
      setVisible(false);

      return;
    }

    /*
     * Small delay so Accept & Continue does not
     * visually transform straight into another
     * banner.
     */
    window.setTimeout(
      () => {
        setVisible(true);
      },

      900,
    );
  }, []);

  useEffect(() => {
    void evaluateNudge();

    function handleConsentUpdate() {
      void evaluateNudge();
    }

    window.addEventListener(CONSENT_UPDATED_EVENT, handleConsentUpdate);

    return () => {
      window.removeEventListener(CONSENT_UPDATED_EVENT, handleConsentUpdate);
    };
  }, [evaluateNudge]);

  /*
   * ========================================
   * ENABLE
   * ========================================
   */

  async function handleEnable() {
    setBusy(true);

    setMessage("");

    try {
      const result = await enableJobAlerts();

      setState(result.state);

      if (result.state === "subscribed") {
        setMessage(
          "You're all set. We'll alert you when fresh opportunities are published.",
        );

        trackEvent(
          "job_alert_subscribe",

          {
            source: "onboarding_nudge",
          },
        );

        /*
         * Give the success message a moment
         * before dismissing.
         */
        window.setTimeout(
          () => {
            setVisible(false);
          },

          1500,
        );

        return;
      }

      if (result.state === "denied") {
        setMessage(
          "Notifications are blocked in this browser session. If you're using private/incognito browsing, open D•C Jobs in a normal window.",
        );

        return;
      }

      if (result.state === "install-required") {
        setIosInstallNeeded(true);

        setMessage(result.message || "");

        return;
      }

      setMessage(result.message || "Unable to enable job alerts.");
    } finally {
      setBusy(false);
    }
  }

  /*
   * ========================================
   * MAYBE LATER
   * ========================================
   */

  function handleLater() {
    dismissForThreeDays();

    trackEvent(
      "job_alert_nudge_later",

      {
        source: "onboarding_nudge",
      },
    );

    setVisible(false);
  }

  /*
   * ========================================
   * GO TO INSTALL HELP
   * ========================================
   */

  function handleInstallHelp() {
    trackEvent(
      "job_alert_install_prompt",

      {
        source: "onboarding_nudge",
      },
    );

    /*
     * Reuse your existing PWA install UI by
     * moving the visitor toward the page content.
     *
     * Your existing InstallAppButton remains the
     * source of truth for actual installation.
     */
    const installElement = document.getElementById("install-dc-jobs");

    if (installElement) {
      installElement.scrollIntoView({
        behavior: "smooth",

        block: "center",
      });
    }

    setVisible(false);
  }

  if (!visible) {
    return null;
  }

  return (
    <div
      className="
        fixed
        inset-x-3
        bottom-3
        z-[90]

        sm:inset-x-auto
        sm:bottom-5
        sm:right-5
        sm:w-[390px]

        lg:bottom-7
        lg:right-7
      "
      role="dialog"
      aria-modal="false"
      aria-labelledby="notification-nudge-title"
      aria-describedby="notification-nudge-description"
    >
      <div
        className="
          overflow-hidden
          rounded-3xl
          border
          border-[#077998]/20
          bg-white
          shadow-[0_24px_70px_rgba(15,23,42,0.22)]
        "
      >
        {/* TOP ACCENT */}

        <div
          className="
            h-1.5
            w-full
            bg-gradient-to-r
            from-[#077998]
            via-[#1697b6]
            to-[#78c7d8]
          "
        />

        <div
          className="
            p-5
            sm:p-6
          "
        >
          {/* HEADER */}

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
                h-12
                w-12
                shrink-0
                items-center
                justify-center
                rounded-2xl
                bg-[#077998]
                text-white
                shadow-sm
              "
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
                className="
                  h-6
                  w-6
                "
              >
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />

                <path d="M10 21h4" />
              </svg>
            </div>

            <div
              className="
                min-w-0
                grow
              "
            >
              <p
                className="
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-[0.16em]
                  text-[#077998]
                "
              >
                D•C Jobs alerts
              </p>

              <h2
                id="notification-nudge-title"
                className="
                  mt-1
                  text-xl
                  font-bold
                  leading-tight
                  text-gray-950
                "
              >
                Don&apos;t miss your next opportunity 🔔
              </h2>
            </div>

            <button
              type="button"
              onClick={handleLater}
              aria-label="Close notification suggestion"
              className="
                flex
                h-8
                w-8
                shrink-0
                items-center
                justify-center
                rounded-full
                text-xl
                text-gray-400
                transition

                hover:bg-gray-100
                hover:text-gray-700
              "
            >
              ×
            </button>
          </div>

          <p
            id="notification-nudge-description"
            className="
              mt-4
              text-sm
              leading-6
              text-gray-600
            "
          >
            Great roles can move quickly. Get notified when fresh opportunities
            are published — even when D•C Jobs isn&apos;t open.
          </p>

          {/* BENEFITS */}

          <div
            className="
              mt-4
              space-y-3
            "
          >
            <div
              className="
                flex
                items-start
                gap-3
              "
            >
              <span
                className="
                  mt-0.5
                  flex
                  h-5
                  w-5
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-emerald-50
                  text-xs
                  font-bold
                  text-emerald-700
                "
              >
                ✓
              </span>

              <div>
                <p
                  className="
                    text-sm
                    font-bold
                    text-gray-900
                  "
                >
                  Be early
                </p>

                <p
                  className="
                    text-xs
                    leading-5
                    text-gray-500
                  "
                >
                  See newly published opportunities sooner.
                </p>
              </div>
            </div>

            <div
              className="
                flex
                items-start
                gap-3
              "
            >
              <span
                className="
                  mt-0.5
                  flex
                  h-5
                  w-5
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-sky-50
                  text-xs
                  font-bold
                  text-[#077998]
                "
              >
                ✓
              </span>

              <div>
                <p
                  className="
                    text-sm
                    font-bold
                    text-gray-900
                  "
                >
                  Stay informed
                </p>

                <p
                  className="
                    text-xs
                    leading-5
                    text-gray-500
                  "
                >
                  Receive alerts while you&apos;re away from the site.
                </p>
              </div>
            </div>

            <div
              className="
                flex
                items-start
                gap-3
              "
            >
              <span
                className="
                  mt-0.5
                  flex
                  h-5
                  w-5
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-violet-50
                  text-xs
                  font-bold
                  text-violet-700
                "
              >
                ✓
              </span>

              <div>
                <p
                  className="
                    text-sm
                    font-bold
                    text-gray-900
                  "
                >
                  Stay relevant
                </p>

                <p
                  className="
                    text-xs
                    leading-5
                    text-gray-500
                  "
                >
                  Personalize roles, locations, work modes and more.
                </p>
              </div>
            </div>
          </div>

          {/* STATUS */}

          {message && (
            <div
              aria-live="polite"
              className={`
                mt-4
                rounded-xl
                border
                px-4
                py-3
                text-xs
                leading-5

                ${
                  state === "subscribed"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-amber-200 bg-amber-50 text-amber-800"
                }
              `}
            >
              {message}
            </div>
          )}

          {/* ACTION */}

          <div
            className="
              mt-5
            "
          >
            {iosInstallNeeded ? (
              <button
                type="button"
                onClick={handleInstallHelp}
                className="
                  inline-flex
                  min-h-11
                  w-full
                  items-center
                  justify-center
                  rounded-xl
                  bg-[#077998]
                  px-5
                  text-sm
                  font-bold
                  text-white
                  transition

                  hover:bg-[#066982]
                "
              >
                Install D•C Jobs for Alerts
              </button>
            ) : (
              <button
                type="button"
                disabled={busy || state === "subscribed"}
                onClick={handleEnable}
                className="
                  inline-flex
                  min-h-11
                  w-full
                  items-center
                  justify-center
                  rounded-xl
                  bg-[#077998]
                  px-5
                  text-sm
                  font-bold
                  text-white
                  transition

                  hover:bg-[#066982]

                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {busy
                  ? "Enabling..."
                  : state === "subscribed"
                    ? "Job Alerts Enabled"
                    : "Enable Job Alerts"}
              </button>
            )}

            <button
              type="button"
              disabled={busy}
              onClick={handleLater}
              className="
                mt-2
                inline-flex
                min-h-9
                w-full
                items-center
                justify-center
                rounded-lg
                px-4
                text-xs
                font-semibold
                text-gray-500
                transition

                hover:bg-gray-50
                hover:text-gray-800

                disabled:opacity-50
              "
            >
              Maybe later
            </button>
          </div>

          <p
            className="
              mt-3
              text-center
              text-[10px]
              leading-4
              text-gray-400
            "
          >
            Optional. You can personalize or turn off alerts at any time.
          </p>
        </div>
      </div>
    </div>
  );
}
