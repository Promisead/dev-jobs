import PostingAccessNotice from "@/app/components/PostingAccessNotice";

import { getJobPosterAccess } from "@/lib/jobAuthorization";

import {
  faArrowRight,
  faBriefcase,
  faCheck,
  faShieldHalved,
} from "@fortawesome/free-solid-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { getSignInUrl } from "@workos-inc/authkit-nextjs";

import { WorkOS } from "@workos-inc/node";

import Link from "next/link";

export default async function NewListingPage() {
  /*
   * ========================================
   * CURRENT USER + POSTING APPROVAL
   * ========================================
   */

  const { user, approved } = await getJobPosterAccess();

  /*
   * ========================================
   * NOT LOGGED IN
   * ========================================
   */

  if (!user) {
    const signInUrl = await getSignInUrl();

    return (
      <main className="min-h-[70vh] bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-3xl">
            {/*
             * MAIN ACCESS CARD
             */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
              {/* TOP */}
              <div className="border-b border-gray-100 px-6 py-7 sm:px-8 sm:py-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#077998]/10 text-[#077998]">
                  <FontAwesomeIcon icon={faBriefcase} className="h-5 w-5" />
                </div>

                <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-[#077998]">
                  Employer Access
                </p>

                <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
                  Post jobs to qualified tech talent
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-600 sm:text-base">
                  Sign in to request employer access and publish opportunities
                  on D•C Jobs. We review job publishers before they can post so
                  job seekers can discover more trustworthy and relevant
                  opportunities.
                </p>
              </div>

              {/* BENEFITS */}
              <div className="grid gap-4 px-6 py-6 sm:grid-cols-3 sm:px-8">
                <div className="rounded-xl border border-gray-100 bg-slate-50 p-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#077998] shadow-sm">
                    <FontAwesomeIcon
                      icon={faShieldHalved}
                      className="h-4 w-4"
                    />
                  </div>

                  <h2 className="mt-3 text-sm font-bold text-gray-900">
                    Verified access
                  </h2>

                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    Posting access is reviewed before employers can publish.
                  </p>
                </div>

                <div className="rounded-xl border border-gray-100 bg-slate-50 p-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#077998] shadow-sm">
                    <FontAwesomeIcon icon={faCheck} className="h-4 w-4" />
                  </div>

                  <h2 className="mt-3 text-sm font-bold text-gray-900">
                    Quality listings
                  </h2>

                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    Publish structured opportunities with rich job descriptions
                    and employer details.
                  </p>
                </div>

                <div className="rounded-xl border border-gray-100 bg-slate-50 p-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#077998] shadow-sm">
                    <FontAwesomeIcon icon={faBriefcase} className="h-4 w-4" />
                  </div>

                  <h2 className="mt-3 text-sm font-bold text-gray-900">
                    Reach talent
                  </h2>

                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    Connect opportunities with technology professionals
                    searching across Nigeria and Africa.
                  </p>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex flex-col gap-3 border-t border-gray-100 bg-gray-50/70 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                <p className="text-xs leading-5 text-gray-500">
                  Already approved? Sign in with your authorised account.
                </p>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/"
                    className="inline-flex h-11 items-center justify-center rounded-lg border border-gray-300 bg-white px-5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    Browse Jobs
                  </Link>

                  <Link
                    href={signInUrl}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#077998] px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-[#066982]"
                  >
                    Login to Continue
                    <FontAwesomeIcon
                      icon={faArrowRight}
                      className="h-3.5 w-3.5"
                    />
                  </Link>
                </div>
              </div>
            </div>

            {/* TRUST NOTE */}
            <p className="mt-5 text-center text-xs leading-5 text-gray-500">
              D•C Jobs reviews employer posting access to reduce fraudulent,
              misleading and unauthorised job listings.
            </p>
          </div>
        </div>
      </main>
    );
  }

  /*
   * ========================================
   * LOGGED IN BUT NOT APPROVED
   * ========================================
   */

  if (!approved) {
    return <PostingAccessNotice userEmail={user.email} />;
  }

  /*
   * ========================================
   * APPROVED EMPLOYER
   * ========================================
   */

  const apiKey = process.env.WORKOS_API_KEY;

  if (!apiKey) {
    throw new Error("WORKOS_API_KEY is not configured.");
  }

  const workos = new WorkOS(apiKey);

  const memberships = await workos.userManagement.listOrganizationMemberships({
    userId: user.id,
  });

  const activeMemberships = memberships.data.filter(
    (membership) => membership.status === "active",
  );

  const organizations: Array<{
    id: string;
    name: string;
  }> = [];

  for (const membership of activeMemberships) {
    const organization = await workos.organizations.getOrganization(
      membership.organizationId,
    );

    organizations.push({
      id: organization.id,
      name: organization.name,
    });
  }

  /*
   * ========================================
   * APPROVED EMPLOYER UI
   * ========================================
   */

  return (
    <main className="min-h-[70vh] bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-7">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#077998]">
              Employer Dashboard
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-950">
              Post a new job
            </h1>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Choose the employer organisation that will own this job listing.
            </p>
          </div>

          {organizations.length > 0 ? (
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
                <h2 className="text-sm font-bold text-gray-900">
                  Your organisations
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Select a company to continue to the job form.
                </p>
              </div>

              <div>
                {organizations.map((organization, index) => (
                  <Link
                    key={organization.id}
                    href={`/new-listing/${organization.id}`}
                    className={`group flex items-center justify-between gap-4 px-5 py-5 transition hover:bg-[#077998]/5 sm:px-6 ${
                      index > 0 ? "border-t border-gray-100" : ""
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#077998]/10 text-[#077998]">
                        <FontAwesomeIcon
                          icon={faBriefcase}
                          className="h-4 w-4"
                        />
                      </div>

                      <div>
                        <p className="font-bold text-gray-900 transition group-hover:text-[#077998]">
                          {organization.name}
                        </p>

                        <p className="mt-0.5 text-xs text-gray-500">
                          Create a job listing for this organisation
                        </p>
                      </div>
                    </div>

                    <FontAwesomeIcon
                      icon={faArrowRight}
                      className="h-4 w-4 text-gray-400 transition group-hover:translate-x-1 group-hover:text-[#077998]"
                    />
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
              <h2 className="font-bold text-blue-950">
                No employer organisation yet
              </h2>

              <p className="mt-2 text-sm leading-6 text-blue-700">
                Your account is approved to publish jobs, but you need to create
                an employer organisation before publishing your first listing.
              </p>
            </div>
          )}

          <div className="mt-6">
            <Link
              href="/new-company"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-800 transition hover:border-[#077998]/30 hover:text-[#077998]"
            >
              Create a new company
              <FontAwesomeIcon icon={faArrowRight} className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
