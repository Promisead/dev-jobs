import JobForm from "@/app/components/JobForm";
import PostingAccessNotice from "@/app/components/PostingAccessNotice";

import {
  JobAuthorizationError,
  getJobPosterAccess,
  requireOrganizationMembership,
} from "@/lib/jobAuthorization";

import { getSignInUrl } from "@workos-inc/authkit-nextjs";

import Link from "next/link";

type PageProps = {
  params: {
    orgId: string;
  };
};

export default async function NewListingForOrgPage({ params }: PageProps) {
  const { user, approved } = await getJobPosterAccess();

  /*
   * ========================================
   * AUTHENTICATION
   * ========================================
   */

  if (!user) {
    const signInUrl = await getSignInUrl();

    return (
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-bold text-gray-950">Login required</h1>

          <p className="mt-2 text-sm text-gray-600">
            Please sign in before publishing a job.
          </p>

          <Link
            href={signInUrl}
            className="mt-5 inline-flex rounded-lg bg-[#077998] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Login
          </Link>
        </div>
      </main>
    );
  }

  /*
   * ========================================
   * PLATFORM APPROVAL
   * ========================================
   */

  if (!approved) {
    return <PostingAccessNotice userEmail={user.email} />;
  }

  /*
   * ========================================
   * WORKOS ORGANIZATION AUTHORIZATION
   * ========================================
   */

  try {
    await requireOrganizationMembership(params.orgId);
  } catch (error) {
    if (error instanceof JobAuthorizationError) {
      return (
        <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-xl rounded-xl border border-red-200 bg-red-50 p-6">
            <h1 className="font-bold text-red-900">
              Organisation access denied
            </h1>

            <p className="mt-2 text-sm leading-6 text-red-700">
              You are approved to publish jobs, but your WorkOS account does not
              have an active membership for this organisation.
            </p>

            <Link
              href="/new-listing"
              className="mt-5 inline-flex rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700"
            >
              Choose another company
            </Link>
          </div>
        </main>
      );
    }

    throw error;
  }

  return <JobForm orgId={params.orgId} />;
}
