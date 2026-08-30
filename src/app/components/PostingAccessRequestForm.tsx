"use client";

import { FormEvent, useEffect, useState } from "react";
import emailjs from "@emailjs/browser";

type PostingAccessRequestFormProps = {
  accountEmail: string | null;

  defaultName: string;
};

type PendingRequest = {
  id: string;

  companyName: string;

  status: string;

  createdAt: string;
};

async function updateEmailStatus({
  requestId,
  status,
  error,
}: {
  requestId: string;

  status: "sent" | "failed";

  error?: string;
}) {
  try {
    await fetch("/api/posting-access/request", {
      method: "PATCH",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        requestId,
        status,
        error,
      }),
    });
  } catch (statusError) {
    console.error("Unable to update email delivery status:", statusError);
  }
}

const DEFAULT_MESSAGE = `Hello Dev Champions,

I would like to request approval to publish jobs on D•C Jobs.

Please review my account for employer or recruiter posting access.

Thank you.`;

export default function PostingAccessRequestForm({
  accountEmail,
  defaultName,
}: PostingAccessRequestFormProps) {
  const [name, setName] = useState(defaultName);

  const [workEmail, setWorkEmail] = useState(accountEmail || "");

  const [companyName, setCompanyName] = useState("");

  const [companyWebsite, setCompanyWebsite] = useState("");

  const [role, setRole] = useState("");

  const [message, setMessage] = useState(DEFAULT_MESSAGE);

  const [loading, setLoading] = useState(false);

  const [checking, setChecking] = useState(true);

  const [error, setError] = useState("");

  const [pending, setPending] = useState<PendingRequest | null>(null);

  useEffect(() => {
    let active = true;

    async function loadPendingRequest() {
      try {
        const response = await fetch("/api/posting-access/request", {
          method: "GET",

          cache: "no-store",
        });

        const data = await response.json();

        if (!active) {
          return;
        }

        if (response.ok && data.pending) {
          setPending(data.pending);
        }
      } catch {
        /*
         * Failure to check existing state
         * should not prevent rendering the form.
         */
      } finally {
        if (active) {
          setChecking(false);
        }
      }
    }

    loadPendingRequest();

    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) {
      return;
    }

    setError("");
    setLoading(true);

    try {
      /*
       * ========================================
       * STEP 1 — SAVE REQUEST FIRST
       * ========================================
       */
      const response = await fetch("/api/posting-access/request", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name,
          workEmail,
          companyName,
          companyWebsite,
          role,
          message,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (data.pending) {
          setPending({
            id: data.pending.id,

            companyName: data.pending.companyName,

            status: "pending",

            createdAt: data.pending.createdAt,
          });

          return;
        }

        throw new Error(data.error || "Unable to submit your request.");
      }

      const requestId = data.request.id;

      /*
       * ========================================
       * STEP 2 — EMAILJS FROM THE BROWSER
       * ========================================
       */
      const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;

      const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;

      const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

      if (!serviceId || !templateId || !publicKey) {
        await updateEmailStatus({
          requestId,

          status: "failed",

          error: "EmailJS browser configuration is missing.",
        });

        /*
         * Request still exists, so continue
         * to the success/pending screen.
         */
        setPending({
          id: requestId,

          companyName: data.request.companyName,

          status: "pending",

          createdAt: data.request.createdAt,
        });

        return;
      }

      try {
        await emailjs.send(
          serviceId,

          templateId,

          {
            /*
             * Must match the variables configured
             * inside your EmailJS template.
             */
            to_email: "dev.champions.it@gmail.com",

            reply_to: workEmail,

            request_id: requestId,

            name,

            account_email: accountEmail || workEmail,

            work_email: workEmail,

            company_name: companyName,

            company_website: companyWebsite || "Not provided",

            role,

            message,

            submitted_at: new Date(data.request.createdAt).toLocaleString(),
          },

          {
            publicKey,
          },
        );

        /*
         * EmailJS accepted the message.
         */
        await updateEmailStatus({
          requestId,

          status: "sent",
        });
      } catch (emailError) {
        console.error("EmailJS browser delivery failed:", emailError);

        let emailErrorMessage = "EmailJS browser delivery failed.";

        if (emailError instanceof Error) {
          emailErrorMessage = emailError.message;
        } else if (
          typeof emailError === "object" &&
          emailError !== null &&
          "text" in emailError
        ) {
          emailErrorMessage = String(emailError.text);
        }

        await updateEmailStatus({
          requestId,

          status: "failed",

          error: emailErrorMessage,
        });

        /*
         * IMPORTANT:
         *
         * We DO NOT tell the employer that their
         * request failed because the Mongo record
         * was successfully created.
         */
      }

      /*
       * ========================================
       * STEP 3 — REQUEST SUCCESS
       * ========================================
       */
      setPending({
        id: requestId,

        companyName: data.request.companyName,

        status: "pending",

        createdAt: data.request.createdAt,
      });
    } catch (submitError) {
      console.error("Posting access submission failed:", submitError);

      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to submit your request. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-5">
        <div className="h-4 w-40 animate-pulse rounded bg-gray-200" />

        <div className="mt-3 h-3 w-full animate-pulse rounded bg-gray-200" />

        <div className="mt-2 h-3 w-4/5 animate-pulse rounded bg-gray-200" />
      </div>
    );
  }

  if (pending) {
    return (
      <div className="mt-6 overflow-hidden rounded-xl border border-emerald-200 bg-emerald-50">
        <div className="px-5 py-5 sm:px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-lg text-emerald-700">
            ✓
          </div>

          <h2 className="mt-4 text-lg font-bold text-emerald-950">
            Request received
          </h2>

          <p className="mt-2 text-sm leading-6 text-emerald-800">
            Your request to publish jobs for{" "}
            <strong>{pending.companyName}</strong> is under review.
          </p>

          <div className="mt-4 rounded-lg border border-emerald-200 bg-white/70 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Request ID
            </p>

            <p className="mt-1 break-all text-sm font-semibold text-gray-900">
              {pending.id}
            </p>
          </div>

          <p className="mt-4 text-xs leading-5 text-emerald-700">
            You do not need to submit another request. We&apos;ll review your
            account before granting employer posting access.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="posting-name"
            className="text-sm font-semibold text-gray-800"
          >
            Your name
          </label>

          <input
            id="posting-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={120}
            required
            autoComplete="name"
            className="mt-2 h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-[#077998] focus:ring-2 focus:ring-[#077998]/15"
          />
        </div>

        <div>
          <label
            htmlFor="posting-account-email"
            className="text-sm font-semibold text-gray-800"
          >
            D•C Jobs account email
          </label>

          <input
            id="posting-account-email"
            value={accountEmail || ""}
            readOnly
            disabled
            className="mt-2 h-11 w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-3 text-sm text-gray-600"
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="posting-work-email"
            className="text-sm font-semibold text-gray-800"
          >
            Work email
          </label>

          <input
            id="posting-work-email"
            type="email"
            value={workEmail}
            onChange={(event) => setWorkEmail(event.target.value)}
            maxLength={254}
            required
            autoComplete="email"
            className="mt-2 h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-[#077998] focus:ring-2 focus:ring-[#077998]/15"
          />
        </div>

        <div>
          <label
            htmlFor="posting-role"
            className="text-sm font-semibold text-gray-800"
          >
            Your role
          </label>

          <input
            id="posting-role"
            value={role}
            onChange={(event) => setRole(event.target.value)}
            placeholder="e.g. Recruiter, Hiring Manager"
            maxLength={120}
            required
            className="mt-2 h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-[#077998] focus:ring-2 focus:ring-[#077998]/15"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="posting-company-name"
          className="text-sm font-semibold text-gray-800"
        >
          Company / organisation
        </label>

        <input
          id="posting-company-name"
          value={companyName}
          onChange={(event) => setCompanyName(event.target.value)}
          maxLength={160}
          required
          autoComplete="organization"
          className="mt-2 h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-[#077998] focus:ring-2 focus:ring-[#077998]/15"
        />
      </div>

      <div>
        <label
          htmlFor="posting-company-website"
          className="text-sm font-semibold text-gray-800"
        >
          Company website{" "}
          <span className="font-normal text-gray-400">(optional)</span>
        </label>

        <input
          id="posting-company-website"
          type="url"
          value={companyWebsite}
          onChange={(event) => setCompanyWebsite(event.target.value)}
          placeholder="https://company.com"
          maxLength={500}
          autoComplete="url"
          className="mt-2 h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-[#077998] focus:ring-2 focus:ring-[#077998]/15"
        />
      </div>

      <div>
        <div className="flex items-center justify-between gap-4">
          <label
            htmlFor="posting-message"
            className="text-sm font-semibold text-gray-800"
          >
            Request message
          </label>

          <span className="text-xs text-gray-400">
            {message.length}
            /3000
          </span>
        </div>

        <textarea
          id="posting-message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          maxLength={3000}
          required
          rows={7}
          className="mt-2 w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm leading-6 text-gray-900 outline-none transition focus:border-[#077998] focus:ring-2 focus:ring-[#077998]/15"
        />
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3"
        >
          <p className="text-sm font-semibold text-red-800">{error}</p>
        </div>
      )}

      <div className="flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-md text-xs leading-5 text-gray-500">
          Your request will be securely recorded before our notification email
          is sent.
        </p>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-11 items-center justify-center rounded-lg bg-[#077998] px-6 text-sm font-semibold text-white transition hover:bg-[#066982] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Submitting..." : "Submit access request"}
        </button>
      </div>
    </form>
  );
}
