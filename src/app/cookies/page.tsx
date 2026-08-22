import CookieSettingsButton from "@/app/components/CookieSettingsButton";

import { SITE } from "@/lib/site";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy",

  description:
    "Learn about cookies, browser storage and analytics technologies used by Dev Champions Jobs.",

  alternates: {
    canonical: `${SITE.url}/cookies`,
  },
};

export default function CookiesPage() {
  return (
    <main className="bg-white">
      <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#077998]">
          Privacy Controls
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-950">
          Cookie &amp; Tracking Technologies Policy
        </h1>

        <p className="mt-4 text-sm text-gray-500">
          Last updated: {SITE.legal.lastUpdated}
        </p>

        <div className="mt-10 space-y-10 text-base leading-8 text-gray-700">
          <section>
            <h2 className="text-2xl font-bold text-gray-950">What we use</h2>

            <p className="mt-4">
              Dev Champions Jobs may use cookies, browser storage and similar
              technologies for necessary site functionality and, where you
              agree, analytics.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-950">
              Necessary technologies
            </h2>

            <p className="mt-4">
              Necessary technologies support functions such as authentication,
              security, session management and storing your privacy preference.
              They are required for core service operation and are not used by
              us for advertising.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-950">
              Analytics technologies
            </h2>

            <p className="mt-4">
              If you grant analytics consent, Google Analytics and Vercel
              Analytics may be loaded to help us understand how the service is
              used and improve job discovery and platform performance.
            </p>

            <p className="mt-4">
              If you reject optional analytics, these analytics tools are not
              loaded by our consent implementation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-950">Your choice</h2>

            <p className="mt-4">
              Analytics is optional. Rejecting analytics does not prevent you
              from browsing jobs or using core platform functionality.
            </p>

            <div className="mt-5 inline-flex rounded-lg bg-[#077998] px-5 py-3 text-sm font-semibold text-white">
              <CookieSettingsButton />
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-950">
              Withdrawing consent
            </h2>

            <p className="mt-4">
              You may change or withdraw analytics consent at any time using the
              Cookie settings control available in the site footer. Withdrawal
              does not affect processing that lawfully occurred before the
              preference was changed.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
