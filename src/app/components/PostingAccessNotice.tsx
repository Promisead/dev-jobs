import PostingAccessRequestForm from "@/app/components/PostingAccessRequestForm";

import Link from "next/link";

type PostingAccessNoticeProps = {
  userEmail?: string | null;

  userName?: string | null;
};

export default function PostingAccessNotice({
  userEmail,
  userName,
}: PostingAccessNoticeProps) {
  return (
    <main className="min-h-[65vh] bg-slate-50">
      <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
          <div className="border-b border-gray-100 bg-slate-50 px-6 py-6 sm:px-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#077998]">
              Employer access
            </p>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">
              Job publishing requires approval
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">
              Submit your employer details below. Your request will be reviewed
              before your account is allowed to publish jobs on D•C Jobs.
            </p>
          </div>

          <div className="px-6 py-6 sm:px-8 sm:py-7">
            <div className="rounded-xl border border-[#077998]/15 bg-[#077998]/5 px-4 py-4">
              <h2 className="text-sm font-bold text-gray-900">
                Why approval is required
              </h2>

              <p className="mt-1 text-sm leading-6 text-gray-600">
                D•C Jobs reviews employers and recruiters before granting
                publishing access to help reduce fraudulent, misleading and
                unauthorised job listings.
              </p>
            </div>

            <PostingAccessRequestForm
              accountEmail={userEmail || null}
              defaultName={userName || ""}
            />

            <div className="mt-6 border-t border-gray-100 pt-5">
              <Link
                href="/"
                className="text-sm font-semibold text-[#077998] transition hover:text-[#066982]"
              >
                ← Browse jobs instead
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
