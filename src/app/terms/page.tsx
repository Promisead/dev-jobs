import { SITE } from "@/lib/site";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use",

  description: "Terms governing access to and use of Dev Champions Jobs.",

  alternates: {
    canonical: `${SITE.url}/terms`,
  },
};

export default function TermsPage() {
  return (
    <main className="bg-white">
      <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#077998]">
          Legal
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-950">
          Terms of Use
        </h1>

        <p className="mt-4 text-sm text-gray-500">
          Last updated: {SITE.legal.lastUpdated}
        </p>

        <div className="mt-10 space-y-10 text-base leading-8 text-gray-700">
          <section>
            <h2 className="text-2xl font-bold text-gray-950">
              1. Platform purpose
            </h2>

            <p className="mt-4">
              Dev Champions Jobs provides a technology job discovery and
              publishing platform connecting job seekers with organisations
              advertising opportunities.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-950">
              2. Job listings
            </h2>

            <p className="mt-4">
              Employers and authorised organisation users are responsible for
              ensuring that listings they publish are accurate, lawful, current
              and not misleading.
            </p>

            <p className="mt-4">
              Listings must not contain unlawful, discriminatory, fraudulent,
              deceptive, malicious or unrelated content.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-950">
              3. Job seeker responsibility
            </h2>

            <p className="mt-4">
              Job seekers should independently review an employer, role and
              application process before providing sensitive information, making
              payments or accepting an offer.
            </p>

            <p className="mt-4">
              Dev Champions Jobs does not guarantee employment, interview
              invitations, employer conduct, compensation or the continued
              availability of a listing.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-950">
              4. Fraud and prohibited payments
            </h2>

            <p className="mt-4">
              Users should exercise caution where a purported employer requests
              unusual payments, banking credentials, passwords, authentication
              codes or other information unrelated to a legitimate recruitment
              process.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-950">
              5. Accounts and security
            </h2>

            <p className="mt-4">
              You are responsible for maintaining the security of your account
              and for activity performed through your authorised credentials.
              You must not attempt to gain unauthorised access to another
              account, organisation or system.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-950">
              6. Content and intellectual property
            </h2>

            <p className="mt-4">
              Users must have the necessary rights to text, logos, photographs
              and other content they upload. By publishing a job, you permit Dev
              Champions Jobs to host, display, format and distribute that
              listing for operation and promotion of the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-950">
              7. Removal and moderation
            </h2>

            <p className="mt-4">
              We may restrict, suspend or remove content or access where
              reasonably necessary to protect users, enforce these terms, comply
              with law, prevent abuse or maintain the integrity of the platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-950">
              8. Third-party services
            </h2>

            <p className="mt-4">
              The platform may contain links to employers, external websites and
              other Dev Champions services. Third-party services are governed by
              their own terms and privacy practices.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-950">9. Contact</h2>

            <p className="mt-4">
              Questions concerning these terms may be sent to{" "}
              <a
                href={`mailto:${SITE.contact.email}`}
                className="font-semibold text-[#077998] hover:underline"
              >
                {SITE.contact.email}
              </a>
              .
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
