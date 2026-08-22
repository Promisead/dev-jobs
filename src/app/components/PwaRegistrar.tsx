"use client";

import { useEffect } from "react";

export default function PwaRegistrar() {
  useEffect(() => {
    /*
     * Never register the production SW
     * during next dev.
     *
     * Stale development service workers
     * are extremely frustrating and were
     * part of the type of problem we saw
     * previously with Path.
     */
    if (process.env.NODE_ENV !== "production") {
      return;
    }

    if (!("serviceWorker" in navigator)) {
      return;
    }

    if (!window.isSecureContext) {
      return;
    }

    async function register() {
      try {
        const registration = await navigator.serviceWorker.register(
          "/sw.js",

          {
            scope: "/",

            updateViaCache: "none",
          },
        );

        /*
         * Ask the browser to check whether
         * a newer worker exists.
         */
        await registration.update();

        console.info("D•C Jobs service worker registered.");
      } catch (error) {
        console.error(
          "Unable to register D•C Jobs service worker:",

          error,
        );
      }
    }

    void register();
  }, []);

  return null;
}
