import { SITE } from "@/lib/site";

type PostingAccessNoticeProps = {
  userEmail?: string | null;
};

/*
 * ========================================
 * POSTING ACCESS EMAIL RECIPIENTS
 * ========================================
 *
 * Vercel / .env.local:
 *
 * JOB_POSTING_ACCESS_EMAILS=
 * recruiter@company.com,
 * admin@company.com,
 * jobs@company.com
 *
 * Supported separators:
 *
 * comma
 * semicolon
 * new line
 */

function getPostingAccessRecipients() {
  const configured = process.env.JOB_POSTING_ACCESS_EMAILS;

  if (!configured) {
    console.error("JOB_POSTING_ACCESS_EMAILS is not configured.");

    return [];
  }

  const recipients = configured
    .split(/[,;\n]+/)
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  /*
   * Remove duplicates.
   */
  return Array.from(new Set(recipients));
}

/*
 * ========================================
 * BUILD MAILTO URL
 * ========================================
 *
 * IMPORTANT:
 *
 * Do not use URLSearchParams here.
 *
 * URLSearchParams converts spaces to "+"
 * because it uses application/x-www-form-urlencoded
 * rules.
 *
 * Some mobile mail clients display those "+"
 * characters literally.
 *
 * encodeURIComponent produces proper mailto
 * percent-encoding instead.
 */

function buildPostingAccessMailto({
  recipients,
  userEmail,
}: {
  recipients: string[];

  userEmail?: string | null;
}) {
  if (recipients.length === 0) {
    return null;
  }

  const primaryRecipient = recipients[0];

  const ccRecipients = recipients.slice(1);

  const subject = "Request for D•C Jobs posting access";

  const bodyLines = [
    "Hello Dev Champions,",

    "",

    "I would like to request approval to publish jobs on D•C Jobs.",

    "",

    userEmail ? `My D•C Jobs account email is: ${userEmail}` : null,

    "",

    "Please review my account for employer or recruiter posting access.",

    "",

    "Thank you.",
  ];

  const body = bodyLines
    .filter((line): line is string => line !== null)
    .join("\r\n");

  const parameters: string[] = [];

  if (ccRecipients.length > 0) {
    parameters.push(`cc=${encodeURIComponent(ccRecipients.join(","))}`);
  }

  parameters.push(`subject=${encodeURIComponent(subject)}`);

  parameters.push(`body=${encodeURIComponent(body)}`);

  return `mailto:${primaryRecipient}?` + parameters.join("&");
}

export default function PostingAccessNotice({
  userEmail,
}: PostingAccessNoticeProps) {
  const recipients = getPostingAccessRecipients();

  const requestUrl = buildPostingAccessMailto({
    recipients,

    userEmail,
  });

  const isEmailConfigured = Boolean(requestUrl);

  return (
    <main className="min-h-[65vh] bg-slate-50">
      <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
          {/* HEADER */}
          <div className="border-b border-gray-100 bg-slate-50 px-6 py-6 sm:px-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#077998]">
              Employer access
            </p>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">
              Job publishing requires approval
            </h1>
          </div>

          {/* CONTENT */}
          <div className="px-6 py-6 sm:px-8 sm:py-7">
            <p className="text-sm leading-7 text-gray-600">
              To protect job seekers and maintain trustworthy opportunities, D•C
              Jobs only allows approved employers and recruiters to publish job
              listings.
            </p>

            <p className="mt-3 text-sm leading-7 text-gray-600">
              Your account can still browse, search and interact with jobs
              normally. Once your posting access is approved, you&apos;ll be
              able to create companies and publish jobs for organisations
              you&apos;re authorised to manage.
            </p>

            {/* SIGNED-IN ACCOUNT */}
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

            {/* CONFIGURATION WARNING */}
            {!isEmailConfigured && (
              <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                <p className="text-sm font-semibold text-amber-900">
                  Posting access requests are temporarily unavailable.
                </p>

                <p className="mt-1 text-xs leading-5 text-amber-700">
                  Please contact Dev Champions directly while this service is
                  being configured.
                </p>
              </div>
            )}

            {/* ACTIONS */}
            <div className="mt-6 flex flex-wrap gap-3">
              {requestUrl ? (
                <a
                  href={requestUrl}
                  className="inline-flex items-center justify-center rounded-lg bg-[#077998] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#066982]"
                >
                  Request posting access
                </a>
              ) : (
                <a
                  href={`mailto:${SITE.contact.email}`}
                  className="inline-flex items-center justify-center rounded-lg bg-[#077998] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#066982]"
                >
                  Contact Dev Champions
                </a>
              )}

              <a
                href="/"
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Browse jobs
              </a>
            </div>

            <p className="mt-5 text-xs leading-5 text-gray-500">
              Approval helps us reduce fraudulent, misleading and unauthorised
              job listings.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
