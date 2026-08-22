import { createCompany } from "@/app/actions/workosActions";

import PendingSubmitButton from "@/app/components/PendingSubmitButton";
import PostingAccessNotice from "@/app/components/PostingAccessNotice";

import { getJobPosterAccess } from "@/lib/jobAuthorization";

import { getSignInUrl } from "@workos-inc/authkit-nextjs";

import Link from "next/link";

export default async function NewCompanyPage() {
  const { user, approved } = await getJobPosterAccess();

  /*
   * ========================================
   * LOGIN REQUIRED
   * ========================================
   */

  if (!user) {
    const signInUrl = await getSignInUrl();

    return (
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="max-w-xl rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm text-amber-800">
            Please log in before creating an employer organisation.
          </p>

          <Link
            href={signInUrl}
            className="mt-4 inline-flex rounded-lg bg-[#077998] px-4 py-2 text-sm font-semibold text-white"
          >
            Login
          </Link>
        </div>
      </main>
    );
  }

  /*
   * ========================================
   * D•C JOBS APPROVAL REQUIRED
   * ========================================
   */

  if (!approved) {
    return <PostingAccessNotice userEmail={user.email} />;
  }

  async function handleNewCompanyFormSubmit(data: FormData) {
    "use server";

    const companyName = data.get("newCompanyName")?.toString().trim();

    if (!companyName) {
      return;
    }

    /*
     * createCompany checks authenticated
     * identity and approval AGAIN.
     *
     * The page-level check is only UX.
     * The action-level check is security.
     */
    await createCompany(companyName);
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="max-w-xl">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#077998]">
          Approved employer
        </p>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
          Create a new company
        </h1>

        <p className="mt-2 text-sm leading-6 text-gray-500">
          Register the employer organisation that will own your job listings.
        </p>

        <form
          action={handleNewCompanyFormSubmit}
          className="mt-6 flex flex-col gap-3 sm:flex-row"
        >
          <input
            required
            name="newCompanyName"
            maxLength={120}
            className="h-11 grow rounded-lg border border-gray-300 px-4 text-sm outline-none transition focus:border-[#077998] focus:ring-2 focus:ring-[#077998]/10"
            type="text"
            placeholder="Company name"
          />

          <PendingSubmitButton
            idleText="Create Company"
            pendingText="Creating..."
            className="h-11 rounded-lg bg-[#077998] px-5 text-sm font-semibold text-white transition hover:bg-[#066982]"
          />
        </form>
      </div>
    </main>
  );
}
