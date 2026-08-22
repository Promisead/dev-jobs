"use client";

import { trackEcosystemClick, trackEvent } from "@/lib/analytics";

import { useEffect } from "react";

type EcosystemDestination =
  | "dev_champions"
  | "tech_path"
  | "tech_core"
  | "calendly";

const HOST_DESTINATIONS = new Map<string, EcosystemDestination>([
  ["dev-champions.tech", "dev_champions"],

  ["www.dev-champions.tech", "dev_champions"],

  ["path.dev-champions.tech", "tech_path"],

  ["core.dev-champions.tech", "tech_core"],

  ["calendly.com", "calendly"],
]);

export default function EcosystemAnalytics() {
  useEffect(() => {
    function handleDocumentClick(event: MouseEvent) {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest("a");

      if (!anchor) {
        return;
      }

      const href = anchor.getAttribute("href");

      if (!href) {
        return;
      }

      try {
        const url = new URL(
          href,

          window.location.origin,
        );

        const destination = HOST_DESTINATIONS.get(url.hostname);

        if (!destination) {
          return;
        }

        const linkText =
          anchor.textContent?.replace(/\s+/g, " ").trim() || "unknown";

        trackEcosystemClick({
          destination,

          url: url.href,

          linkText,
        });

        /*
         * Calendly is a strong Dev Champions
         * business-lead intent signal.
         *
         * This measures the click, NOT a
         * completed booking.
         */
        if (destination === "calendly") {
          trackEvent("book_meeting_click", {
            link_url: url.href,

            link_text: linkText,

            destination_product: "dev_champions",
          });
        }
      } catch {
        /*
         * Ignore malformed links.
         */
      }
    }

    document.addEventListener("click", handleDocumentClick);

    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);

  return null;
}
