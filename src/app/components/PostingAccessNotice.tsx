import { SITE } from "@/lib/site";

type PostingAccessNoticeProps = {
  userEmail?: string | null;
};

/*
 * ========================================
 * POSTING ACCESS RECIPIENTS
 * ========================================
 *
 * Example:
 *
 * JOB_POSTING_ACCESS_EMAILS=
 * jobs@dev-champions.tech,
 * info@dev-champions.tech
 */

function getPostingAccessRecipients() {
  const configured = process.env.JOB_POSTING_ACCESS_EMAILS ?? "";

  const emails = configured
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);

  /*
   * Safe fallback if the ENV variable
   * has not been configured.
   */
  if (emails.length === 0) {
    return [SITE.contact.email];
  }

  return Array.from(new Set(emails));
}

export default function PostingAccessNotice({
  userEmail,
}: PostingAccessNoticeProps) {
  const recipients = getPostingAccessRecipients();

  /*
   * First email becomes the main recipient.
   *
   * Additional configured addresses are
   * copied through CC for better mail-client
   * compatibility.
   */
  const primaryRecipient = recipients[0];

  const ccRecipients = recipients.slice(1);

  const subject = "Request for D•C Jobs posting access";

  const body = [
    "Hello Dev Champions,",

    "",

    "I would like to request approval to publish jobs on D•C Jobs.",

    "",

    userEmail ? `My D•C Jobs account email is: ${userEmail}` : "",

    "",

    "Please review my account for employer/recruiter posting access.",

    "",

    "Thank you.",
  ]
    .filter((line, index, lines) => {
      /*
       * Keep intentional blank lines,
       * but remove the optional empty
       * user-email line.
       */
      if (line !== "") {
        return true;
      }

      return index === 1 || index === 3 || index === lines.length - 2;
    })
    .join("\n");

  const query = new URLSearchParams();

  query.set("subject", subject);

  query.set("body", body);

  if (ccRecipients.length > 0) {
    query.set("cc", ccRecipients.join(","));
  }

  const requestUrl = `mailto:${primaryRecipient}?${query.toString()}`;

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 bg-slate-50 px-6 py-5 sm:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#077998]">
            Employer access
          </p>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-950">
            Job publishing requires approval
          </h1>
        </div>

        <div className="px-6 py-6 sm:px-8">
          <p className="text-sm leading-7 text-gray-600">
            To protect job seekers and maintain trustworthy opportunities, D•C
            Jobs only allows approved employers and recruiters to publish job
            listings.
          </p>

          <p className="mt-3 text-sm leading-7 text-gray-600">
            Your account can still browse, search and interact with jobs
            normally. Once your posting access is approved, you&apos;ll be able
            to create companies and publish jobs for organisations you&apos;re
            authorised to manage.
          </p>

          {userEmail && (
            <div className="mt-5 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Signed-in account
              </p>

              <p className="mt-1 break-all text-sm font-semibold text-gray-800">
                {userEmail}
              </p>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={requestUrl}
              className="inline-flex items-center justify-center rounded-lg bg-[#077998] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#066982]"
            >
              Request posting access
            </a>

            <a
              href="/"
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Browse jobs
            </a>
          </div>

          <p className="mt-5 text-xs leading-5 text-gray-500">
            Approval helps us reduce fraudulent, misleading and unauthorised job
            listings.
          </p>
        </div>
      </div>
    </main>
  );
}
