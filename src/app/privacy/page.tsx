import { SITE } from "@/lib/site";

import type { Metadata } from "next";

import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",

  description:
    "Learn how Dev Champions Jobs collects, uses, protects and manages personal data and privacy rights.",

  alternates: {
    canonical: `${SITE.url}/privacy`,
  },
};

export default function PrivacyPage() {
  return (
    <main className="bg-white">
      <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#077998]">
          Legal &amp; Privacy
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-950">
          Privacy Policy
        </h1>

        <p className="mt-4 text-sm text-gray-500">
          Last updated: {SITE.legal.lastUpdated}
        </p>

        <div className="mt-10 space-y-10 text-base leading-8 text-gray-700">
          <section>
            <h2 className="text-2xl font-bold text-gray-950">
              1. Who controls your data
            </h2>

            <p className="mt-4">
              Dev Champions IT operates Dev Champions Jobs and acts as the data
              controller for personal data processed through this platform where
              we determine why and how that information is used.
            </p>

            <div className="mt-4 rounded-xl bg-slate-50 p-5">
              <p>
                <strong>Controller:</strong> {SITE.legal.controllerName}
              </p>

              <p>
                <strong>Place of business:</strong> {SITE.legal.businessAddress}
              </p>

              <p>
                <strong>Privacy contact:</strong>{" "}
                <a
                  href={`mailto:${SITE.legal.privacyEmail}`}
                  className="font-semibold text-[#077998] hover:underline"
                >
                  {SITE.legal.privacyEmail}
                </a>
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-950">
              2. Information we process
            </h2>

            <p className="mt-4">
              Depending on how you use the platform, we may process account and
              authentication information, organisation membership information,
              job-listing details, employer contact information, job likes,
              technical security information and optional analytics data.
            </p>

            <p className="mt-4">
              Employer contact information intentionally included in a published
              job listing may be visible publicly and may be indexed by search
              engines.
            </p>

            <p className="mt-4">
              Where you choose to contact an employer through an email or
              telephone link, the information you subsequently provide to that
              employer is shared directly with them. Dev Champions Jobs does not
              currently operate an applicant CV or application-submission
              database through those links.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-950">
              3. Why we process information
            </h2>

            <p className="mt-4">
              We process information to operate and secure the service,
              authenticate users, manage organisations and job listings, provide
              job engagement features, prevent abuse, comply with applicable
              legal obligations and improve the platform.
            </p>

            <p className="mt-4">
              Optional analytics processing takes place only after the visitor
              has granted analytics consent through our privacy preference
              controls.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-950">
              4. Lawful bases
            </h2>

            <p className="mt-4">
              Depending on the activity, our lawful basis may include
              performance of a contract or steps requested before a contract,
              compliance with a legal obligation, legitimate interests in
              operating and protecting the service, or your consent.
            </p>

            <p className="mt-4">
              Where processing relies on consent, including optional analytics
              and non-essential tracking, you may withhold or later withdraw
              that consent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-950">
              5. Service providers
            </h2>

            <p className="mt-4">
              We use specialist providers to operate the platform. Depending on
              the relevant feature, these may include WorkOS for authentication
              and organisation management, MongoDB infrastructure for
              application data, Cloudinary for uploaded images, Vercel for
              hosting and optional analytics, and Google Analytics for optional
              usage measurement.
            </p>

            <p className="mt-4">
              These providers may process information on infrastructure located
              outside Nigeria. Where applicable, international transfers are
              handled using lawful transfer mechanisms and appropriate
              safeguards required by applicable data protection law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-950">6. Analytics</h2>

            <p className="mt-4">
              Analytics is optional. When analytics consent is granted, we may
              measure page views, searches, filters, job views, likes,
              navigation to other Dev Champions services and application-button
              interactions.
            </p>

            <p className="mt-4">
              We do not intentionally send names, email addresses, telephone
              numbers, application content or account identifiers to Google
              Analytics.
            </p>

            <p className="mt-4">
              See our{" "}
              <Link
                href="/cookies"
                className="font-semibold text-[#077998] hover:underline"
              >
                Cookie Policy
              </Link>{" "}
              for more information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-950">7. Retention</h2>

            <p className="mt-4">
              We retain personal data only for as long as necessary for the
              purpose for which it was collected, including operation of active
              accounts and job listings, security, dispute handling and
              applicable legal obligations. Retention periods may vary by
              category and applicable law.
            </p>

            <p className="mt-4">
              Your analytics preference is stored in your own browser until you
              change it, clear your browser storage or we replace the consent
              version and ask again.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-950">
              8. Your privacy rights
            </h2>

            <p className="mt-4">
              Subject to applicable law and relevant exceptions, you may have
              rights to be informed, access your personal data, correct
              inaccurate information, object to or restrict certain processing,
              withdraw consent, request deletion, request portability and
              challenge qualifying automated decision-making.
            </p>

            <p className="mt-4">
              You may exercise a privacy right by contacting{" "}
              <a
                href={`mailto:${SITE.legal.privacyEmail}`}
                className="font-semibold text-[#077998] hover:underline"
              >
                {SITE.legal.privacyEmail}
              </a>
              .
            </p>

            <p className="mt-4">
              You also have the right to lodge a complaint with the Nigeria Data
              Protection Commission where applicable.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-950">9. Children</h2>

            <p className="mt-4">
              The service is not designed to knowingly collect personal data
              from children for optional analytics without the permissions
              required by applicable law. If you believe a child&apos;s personal
              data has been processed improperly, contact us so the matter can
              be reviewed.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-950">10. Security</h2>

            <p className="mt-4">
              We use reasonable technical and organisational safeguards designed
              to protect personal data against unauthorised access, loss,
              alteration or misuse. No internet-based system can, however,
              guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-950">
              11. Changes to this policy
            </h2>

            <p className="mt-4">
              We may update this Privacy Policy when our services, providers or
              legal obligations change. Material changes will be reflected by
              updating the date shown at the top of this page and, where
              appropriate, requesting fresh consent.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
