import PendingSubmitButton from "@/app/components/PendingSubmitButton";

import { createCompany } from "@/app/actions/workosActions";

import { getUser } from "@workos-inc/authkit-nextjs";

export default async function NewCompanyPage() {
  const { user } = await getUser();

  if (!user) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
          Please log in to create a company.
        </div>
      </main>
    );
  }

  async function handleNewCompanyFormSubmit(data: FormData) {
    "use server";

    if (!user) {
      return;
    }

    const companyName = data.get("newCompanyName")?.toString().trim();

    if (!companyName) {
      return;
    }

    await createCompany(companyName, user.id);
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="max-w-xl">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Create a new company
        </h1>

        <p className="mt-2 text-sm leading-6 text-gray-500">
          Before publishing a job, register the company that will own the
          listing.
        </p>

        <form
          action={handleNewCompanyFormSubmit}
          className="mt-6 flex flex-col gap-3 sm:flex-row"
        >
          <input
            required
            name="newCompanyName"
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
