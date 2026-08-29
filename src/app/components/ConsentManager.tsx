"use client";

import {
  CONSENT_UPDATED_EVENT,
  NotificationPreference,
  OPEN_COOKIE_SETTINGS_EVENT,
  readConsent,
  saveConsent,
} from "@/lib/consent";

import Link from "next/link";

import { useEffect, useState } from "react";

export default function ConsentManager() {
  const [visible, setVisible] = useState(false);

  const [showSettings, setShowSettings] = useState(false);

  const [analyticsAllowed, setAnalyticsAllowed] = useState(false);

  const [notificationPreference, setNotificationPreferenceState] =
    useState<NotificationPreference>("pending");

  useEffect(() => {
    const existing = readConsent();

    if (!existing) {
      setVisible(true);

      setNotificationPreferenceState("pending");
    } else {
      setAnalyticsAllowed(existing.analytics);

      setNotificationPreferenceState(existing.notifications);
    }

    function handleOpenSettings() {
      const current = readConsent();

      setAnalyticsAllowed(current?.analytics ?? false);

      setNotificationPreferenceState(current?.notifications ?? "pending");

      setShowSettings(true);

      setVisible(true);
    }

    function handleConsentUpdate() {
      const current = readConsent();

      if (!current) {
        return;
      }

      setAnalyticsAllowed(current.analytics);

      setNotificationPreferenceState(current.notifications);
    }

    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, handleOpenSettings);

    window.addEventListener(CONSENT_UPDATED_EVENT, handleConsentUpdate);

    return () => {
      window.removeEventListener(
        OPEN_COOKIE_SETTINGS_EVENT,
        handleOpenSettings,
      );

      window.removeEventListener(CONSENT_UPDATED_EVENT, handleConsentUpdate);
    };
  }, []);

  function acceptAnalytics() {
    const notificationState =
      notificationPreference === "enabled" ? "enabled" : "pending";

    saveConsent({
      analytics: true,

      notifications: notificationState,
    });

    setAnalyticsAllowed(true);

    setNotificationPreferenceState(notificationState);

    setShowSettings(false);

    setVisible(false);
  }

  function rejectAnalytics() {
    /*
     * Never silently disable an already-enabled
     * browser PushSubscription because analytics
     * consent is separate from Push consent.
     */
    const notificationState =
      notificationPreference === "enabled" ? "enabled" : "disabled";

    saveConsent({
      analytics: false,

      notifications: notificationState,
    });

    setAnalyticsAllowed(false);

    setNotificationPreferenceState(notificationState);

    setShowSettings(false);

    setVisible(false);
  }

  function savePreferences() {
    saveConsent({
      analytics: analyticsAllowed,

      notifications: notificationPreference,
    });

    setShowSettings(false);

    setVisible(false);
  }

  if (!visible) {
    return null;
  }

  return (
    <div
      className="
        fixed
        inset-x-0
        bottom-0
        z-[100]
        w-full
        border-t
        border-gray-200
        bg-white
        shadow-[0_-6px_28px_rgba(15,23,42,0.12)]
      "
      role="region"
      aria-label="Privacy preferences"
    >
      {!showSettings ? (
        <div
          className="
            w-full
            px-4
            py-3
            sm:px-6
            lg:px-10
            xl:px-14
          "
        >
          <div
            className="
              flex
              flex-col
              gap-3
              lg:flex-row
              lg:items-center
              lg:justify-between
              lg:gap-8
            "
          >
            <div
              className="
                min-w-0
                max-w-5xl
                grow
              "
            >
              <p
                className="
                  text-xs
                  leading-5
                  text-gray-600
                  sm:text-sm
                "
              >
                <strong
                  className="
                    font-bold
                    text-gray-950
                  "
                >
                  Help us improve your job search.
                </strong>{" "}
                Anonymous analytics helps us understand how D•C Jobs is used.
                Accepting also keeps job-alert setup ready for you, but browser
                notifications are never enabled without your explicit
                permission.
              </p>

              <div
                className="
                  mt-1
                  flex
                  flex-wrap
                  items-center
                  gap-x-3
                  gap-y-1
                  text-[11px]
                  text-gray-500
                  sm:text-xs
                "
              >
                <span>
                  We do not send your name, email, phone number or application
                  content to Google Analytics.
                </span>

                <Link
                  href="/privacy"
                  className="
                    font-semibold
                    text-[#077998]
                    hover:underline
                  "
                >
                  Privacy
                </Link>

                <Link
                  href="/cookies"
                  className="
                    font-semibold
                    text-[#077998]
                    hover:underline
                  "
                >
                  Cookies
                </Link>
              </div>
            </div>

            <div
              className="
                flex
                shrink-0
                flex-wrap
                items-center
                justify-end
                gap-2
              "
            >
              <button
                type="button"
                onClick={() => setShowSettings(true)}
                className="
                  px-2.5
                  py-2
                  text-xs
                  font-semibold
                  text-[#077998]
                  hover:underline
                  sm:text-sm
                "
              >
                Manage
              </button>

              <button
                type="button"
                onClick={rejectAnalytics}
                className="
                  rounded-lg
                  border
                  border-gray-300
                  bg-white
                  px-4
                  py-2
                  text-xs
                  font-semibold
                  text-gray-700
                  hover:bg-gray-50
                  sm:text-sm
                "
              >
                Decline
              </button>

              <button
                type="button"
                onClick={acceptAnalytics}
                className="
                  rounded-lg
                  bg-[#077998]
                  px-5
                  py-2
                  text-xs
                  font-semibold
                  text-white
                  hover:bg-[#066982]
                  sm:text-sm
                "
              >
                Accept &amp; Continue
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          className="
            w-full
            px-4
            py-4
            sm:px-6
            lg:px-10
            xl:px-14
          "
        >
          <div
            className="
              flex
              items-center
              justify-between
              gap-4
            "
          >
            <div>
              <h2
                className="
                  text-sm
                  font-bold
                  text-gray-950
                  sm:text-base
                "
              >
                Privacy preferences
              </h2>

              <p
                className="
                  mt-0.5
                  text-xs
                  text-gray-500
                "
              >
                Control analytics and how job-alert onboarding behaves.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowSettings(false)}
              className="
                rounded-md
                border
                border-gray-200
                px-3
                py-1.5
                text-xs
                font-semibold
                text-gray-500
                hover:bg-gray-50
              "
            >
              Back
            </button>
          </div>

          <div
            className="
              mt-4
              grid
              overflow-hidden
              rounded-xl
              border
              border-gray-200
              lg:grid-cols-3
            "
          >
            {/* NECESSARY */}

            <div
              className="
                flex
                items-center
                justify-between
                gap-4
                px-4
                py-4
                lg:border-r
                lg:border-gray-200
              "
            >
              <div>
                <div
                  className="
                    flex
                    flex-wrap
                    items-center
                    gap-2
                  "
                >
                  <h3
                    className="
                      text-xs
                      font-bold
                      text-gray-900
                      sm:text-sm
                    "
                  >
                    Necessary
                  </h3>

                  <span
                    className="
                      rounded-full
                      bg-emerald-50
                      px-2
                      py-0.5
                      text-[9px]
                      font-bold
                      text-emerald-700
                    "
                  >
                    Always active
                  </span>
                </div>

                <p
                  className="
                    mt-1
                    text-[11px]
                    leading-4
                    text-gray-500
                  "
                >
                  Authentication, security and essential functionality.
                </p>
              </div>
            </div>

            {/* ANALYTICS */}

            <div
              className="
                flex
                items-center
                justify-between
                gap-5
                border-t
                border-gray-200
                px-4
                py-4
                lg:border-r
                lg:border-t-0
              "
            >
              <div>
                <h3
                  className="
                    text-xs
                    font-bold
                    text-gray-900
                    sm:text-sm
                  "
                >
                  Analytics
                </h3>

                <p
                  className="
                    mt-1
                    text-[11px]
                    leading-4
                    text-gray-500
                  "
                >
                  Helps improve job search, discovery and platform performance.
                </p>
              </div>

              <label
                className="
                  relative
                  inline-flex
                  shrink-0
                  cursor-pointer
                  items-center
                "
              >
                <input
                  type="checkbox"
                  checked={analyticsAllowed}
                  onChange={(event) =>
                    setAnalyticsAllowed(event.target.checked)
                  }
                  className="
                    peer
                    sr-only
                  "
                  aria-label="Allow analytics"
                />

                <span
                  className="
                    h-6
                    w-11
                    rounded-full
                    bg-gray-300
                    transition
                    peer-checked:bg-[#077998]
                  "
                />

                <span
                  className="
                    absolute
                    left-1
                    top-1
                    h-4
                    w-4
                    rounded-full
                    bg-white
                    shadow
                    transition-transform
                    peer-checked:translate-x-5
                  "
                />
              </label>
            </div>

            {/* JOB ALERT ONBOARDING */}

            <div
              className="
                flex
                items-center
                justify-between
                gap-5
                border-t
                border-gray-200
                px-4
                py-4
                lg:border-t-0
              "
            >
              <div>
                <h3
                  className="
                    text-xs
                    font-bold
                    text-gray-900
                    sm:text-sm
                  "
                >
                  Job alerts
                </h3>

                <p
                  className="
                    mt-1
                    text-[11px]
                    leading-4
                    text-gray-500
                  "
                >
                  {notificationPreference === "enabled"
                    ? "Notifications are already enabled on this device."
                    : notificationPreference === "pending"
                      ? "Ready for you to enable when you choose."
                      : "Job-alert onboarding is currently off."}
                </p>
              </div>

              {notificationPreference === "enabled" ? (
                <span
                  className="
                    shrink-0
                    rounded-full
                    bg-emerald-50
                    px-3
                    py-1
                    text-[10px]
                    font-bold
                    text-emerald-700
                  "
                >
                  Enabled
                </span>
              ) : (
                <label
                  className="
                    relative
                    inline-flex
                    shrink-0
                    cursor-pointer
                    items-center
                  "
                >
                  <input
                    type="checkbox"
                    checked={notificationPreference === "pending"}
                    onChange={(event) =>
                      setNotificationPreferenceState(
                        event.target.checked ? "pending" : "disabled",
                      )
                    }
                    className="
                      peer
                      sr-only
                    "
                    aria-label="Keep job-alert setup ready"
                  />

                  <span
                    className="
                      h-6
                      w-11
                      rounded-full
                      bg-gray-300
                      transition
                      peer-checked:bg-[#077998]
                    "
                  />

                  <span
                    className="
                      absolute
                      left-1
                      top-1
                      h-4
                      w-4
                      rounded-full
                      bg-white
                      shadow
                      transition-transform
                      peer-checked:translate-x-5
                    "
                  />
                </label>
              )}
            </div>
          </div>

          <div
            className="
              mt-4
              flex
              flex-col
              gap-3
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <p
              className="
                text-[11px]
                text-gray-500
                sm:text-xs
              "
            >
              Browser notification permission is always requested separately.
            </p>

            <div
              className="
                flex
                flex-wrap
                justify-end
                gap-2
              "
            >
              <button
                type="button"
                onClick={rejectAnalytics}
                className="
                  rounded-lg
                  border
                  border-gray-300
                  bg-white
                  px-4
                  py-2
                  text-xs
                  font-semibold
                  text-gray-700
                  hover:bg-gray-50
                "
              >
                Decline analytics
              </button>

              <button
                type="button"
                onClick={savePreferences}
                className="
                  rounded-lg
                  bg-[#077998]
                  px-5
                  py-2
                  text-xs
                  font-semibold
                  text-white
                  hover:bg-[#066982]
                "
              >
                Save preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
