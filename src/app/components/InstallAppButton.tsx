"use client";

import { trackEvent } from "@/lib/analytics";

import { useEffect, useState } from "react";

import { createPortal } from "react-dom";

type InstallChoice = {
  outcome: "accepted" | "dismissed";

  platform: string;
};

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;

  userChoice: Promise<InstallChoice>;
}

type Platform = "ios" | "mac-safari" | "android" | "desktop";

type InstallStep = {
  title: string;
};

/*
 * ========================================
 * CHECK WHETHER PWA IS ALREADY INSTALLED
 * ========================================
 */

function isRunningStandalone() {
  if (typeof window === "undefined") {
    return false;
  }

  const standaloneDisplay = window.matchMedia(
    "(display-mode: standalone)",
  ).matches;

  const iosStandalone =
    (
      navigator as Navigator & {
        standalone?: boolean;
      }
    ).standalone === true;

  return standaloneDisplay || iosStandalone;
}

/*
 * ========================================
 * PLATFORM DETECTION
 * ========================================
 */

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") {
    return "desktop";
  }

  const userAgent = navigator.userAgent;

  const isIOS = /iPad|iPhone|iPod/i.test(userAgent);

  const isAndroid = /Android/i.test(userAgent);

  const isMac = /Macintosh|Mac OS X/i.test(userAgent);

  const isSafari =
    /Safari/i.test(userAgent) && !/Chrome|Chromium|Edg|OPR/i.test(userAgent);

  if (isIOS) {
    return "ios";
  }

  if (isAndroid) {
    return "android";
  }

  if (isMac && isSafari) {
    return "mac-safari";
  }

  return "desktop";
}

/*
 * ========================================
 * INSTALL INSTRUCTIONS
 * ========================================
 */

function getInstallSteps(platform: Platform): InstallStep[] {
  if (platform === "ios") {
    return [
      {
        title: "Tap the Share icon in Safari.",
      },

      {
        title: "Choose Add to Home Screen.",
      },

      {
        title: "Tap Add to confirm the installation.",
      },

      {
        title: "Launch D•C Jobs directly from your Home Screen.",
      },
    ];
  }

  if (platform === "mac-safari") {
    return [
      {
        title: "Open D•C Jobs in Safari.",
      },

      {
        title: "Open the File menu in Safari.",
      },

      {
        title: "Choose Add to Dock.",
      },

      {
        title: "Launch D•C Jobs from your Dock or Applications.",
      },
    ];
  }

  if (platform === "android") {
    return [
      {
        title: "Open the browser menu or look for the Install App icon.",
      },

      {
        title: "Choose Install D•C Jobs or Add to Home Screen.",
      },

      {
        title: "Confirm the installation.",
      },

      {
        title: "Launch D•C Jobs from your phone's app launcher.",
      },
    ];
  }

  return [
    {
      title: "Look for the Install icon in your browser address bar or menu.",
    },

    {
      title: "Choose Install D•C Jobs / Install app.",
    },

    {
      title: "Confirm the installation.",
    },

    {
      title: "Launch D•C Jobs from your desktop, Start menu or app launcher.",
    },
  ];
}

/*
 * ========================================
 * INSTALL APP BUTTON
 * ========================================
 */

export default function InstallAppButton() {
  const [mounted, setMounted] = useState(false);

  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  const [installed, setInstalled] = useState(true);

  const [showInstallModal, setShowInstallModal] = useState(false);

  const [platform, setPlatform] = useState<Platform>("desktop");

  const [isInstalling, setIsInstalling] = useState(false);

  /*
   * ========================================
   * PWA INSTALL EVENTS
   * ========================================
   */

  useEffect(() => {
    setMounted(true);

    setPlatform(detectPlatform());

    setInstalled(isRunningStandalone());

    function handleBeforeInstallPrompt(event: Event) {
      /*
       * Prevent browser's automatic prompt.
       *
       * We use our branded installation
       * experience first.
       */
      event.preventDefault();

      setInstallPrompt(event as BeforeInstallPromptEvent);

      setInstalled(false);
    }

    function handleAppInstalled() {
      setInstalled(true);

      setInstallPrompt(null);

      setShowInstallModal(false);

      setIsInstalling(false);

      trackEvent("pwa_install_success");
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );

      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  /*
   * ========================================
   * LOCK PAGE SCROLL WHILE MODAL IS OPEN
   * ========================================
   */

  useEffect(() => {
    if (!showInstallModal) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setShowInstallModal(false);
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;

      window.removeEventListener("keydown", handleEscape);
    };
  }, [showInstallModal]);

  /*
   * ========================================
   * OPEN BRANDED INSTALL MODAL
   * ========================================
   */

  function openInstallModal() {
    trackEvent("pwa_install_click");

    setPlatform(detectPlatform());

    setShowInstallModal(true);
  }

  /*
   * ========================================
   * TRIGGER NATIVE BROWSER INSTALL
   * ========================================
   */

  async function triggerNativeInstall() {
    if (!installPrompt || isInstalling) {
      return;
    }

    setIsInstalling(true);

    try {
      await installPrompt.prompt();

      const choice = await installPrompt.userChoice;

      trackEvent(
        choice.outcome === "accepted"
          ? "pwa_install_accepted"
          : "pwa_install_dismissed",

        {
          install_platform: choice.platform,
        },
      );

      /*
       * beforeinstallprompt can only
       * be consumed once.
       */
      setInstallPrompt(null);

      if (choice.outcome === "accepted") {
        setShowInstallModal(false);
      }
    } catch (error) {
      console.error(
        "D•C Jobs installation failed:",

        error,
      );
    } finally {
      setIsInstalling(false);
    }
  }

  /*
   * ========================================
   * INSTALLED APP
   * ========================================
   */

  if (!mounted || installed) {
    return null;
  }

  const steps = getInstallSteps(platform);

  /*
   * ========================================
   * MODAL
   * ========================================
   *
   * IMPORTANT:
   *
   * createPortal renders this directly
   * under document.body instead of inside
   * the sticky/backdrop-blurred Header.
   *
   * This fixes the clipping bug.
   */

  const installModal = showInstallModal
    ? createPortal(
        <div
          className="fixed inset-0 z-[9999] overflow-y-auto bg-slate-900/35 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="install-dc-jobs-title"
          onClick={() => setShowInstallModal(false)}
        >
          <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
            <div
              className="relative w-full max-w-[540px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.22)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="max-h-[90vh] overflow-y-auto p-6 sm:p-7">
                {/* CLOSE BUTTON */}
                <button
                  type="button"
                  onClick={() => setShowInstallModal(false)}
                  aria-label="Close installation instructions"
                  className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-800"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    aria-hidden="true"
                    className="h-4 w-4"
                  >
                    <path d="M6 6l12 12" />
                    <path d="M18 6 6 18" />
                  </svg>
                </button>

                {/* APP ICON */}
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#077998]/10 text-[#077998]">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="h-7 w-7"
                  >
                    <rect x="3" y="4" width="18" height="13" rx="2" />

                    <path d="M12 7v6" />
                    <path d="m9 10 3 3 3-3" />
                    <path d="M8 21h8" />
                    <path d="M12 17v4" />
                  </svg>
                </div>

                {/* INTRODUCTION */}
                <div className="mt-5">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#077998]">
                    Dev Champions Jobs
                  </p>

                  <h2
                    id="install-dc-jobs-title"
                    className="mt-1 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl"
                  >
                    Install D•C Jobs App
                  </h2>

                  <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
                    Install D•C Jobs for quick access to technology
                    opportunities directly from your device and to prepare for
                    future personalised job alerts.
                  </p>
                </div>

                {/* INSTALLATION STEPS */}
                <ol className="mt-6 space-y-4">
                  {steps.map((step, index) => (
                    <li key={step.title} className="flex items-start gap-4">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#077998] text-xs font-bold text-white">
                        {index + 1}
                      </span>

                      <p className="pt-0.5 text-sm leading-6 text-slate-700">
                        {step.title}
                      </p>
                    </li>
                  ))}
                </ol>

                {/* NATIVE INSTALL BUTTON */}
                {installPrompt && (
                  <div className="mt-7 border-t border-slate-200 pt-5">
                    <button
                      type="button"
                      disabled={isInstalling}
                      onClick={triggerNativeInstall}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#077998] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#066982] disabled:cursor-wait disabled:opacity-60"
                    >
                      {isInstalling ? (
                        <>
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            aria-hidden="true"
                            className="h-4 w-4 animate-spin"
                          >
                            <circle
                              cx="12"
                              cy="12"
                              r="9"
                              stroke="currentColor"
                              strokeWidth="3"
                              className="opacity-25"
                            />

                            <path
                              d="M21 12a9 9 0 0 0-9-9"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                              className="opacity-90"
                            />
                          </svg>
                          Installing...
                        </>
                      ) : (
                        <>
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                            className="h-4 w-4"
                          >
                            <path d="M12 3v11" />
                            <path d="m8 10 4 4 4-4" />
                            <path d="M5 20h14" />
                          </svg>
                          Install D•C Jobs Now
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* FALLBACK INFO */}
                {!installPrompt &&
                  platform !== "ios" &&
                  platform !== "mac-safari" && (
                    <div className="mt-6 rounded-lg border border-[#077998]/15 bg-[#077998]/5 px-4 py-3">
                      <p className="text-xs leading-5 text-slate-600">
                        <strong className="text-[#077998]">
                          Installation tip:
                        </strong>{" "}
                        Look for the install icon in your browser&apos;s address
                        bar or menu. Once the production PWA is installable,
                        supported browsers will also offer the direct install
                        option here.
                      </p>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>,

        document.body,
      )
    : null;

  return (
    <>
      {/*
       * ========================================
       * NAVBAR INSTALL BUTTON
       * ========================================
       */}
      <button
        type="button"
        onClick={openInstallModal}
        title="Install D•C Jobs"
        aria-label="Install D•C Jobs app"
        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#077998]/20 bg-[#077998]/10 px-2.5 text-xs font-semibold text-[#077998] transition hover:border-[#077998]/40 hover:bg-[#077998]/15 min-[430px]:px-3 sm:text-sm"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="h-[18px] w-[18px] shrink-0"
        >
          <path d="M12 3v11" />
          <path d="m8 10 4 4 4-4" />
          <path d="M5 20h14" />
        </svg>

        {/*
         * Hidden on very small phones.
         */}
        <span className="hidden min-[430px]:inline">Install</span>

        {/*
         * Full wording only on large desktop.
         */}
        <span className="hidden xl:inline">App</span>
      </button>

      {installModal}
    </>
  );
}
