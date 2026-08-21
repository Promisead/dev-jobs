import JobRichContent from "@/app/components/JobRichContent";

import { Job, JobModel } from "@/models/Job";

import mongoose from "mongoose";

import Image from "next/image";
import Link from "next/link";

import { notFound } from "next/navigation";

import type { ReactNode } from "react";

type PageProps = {
  params: {
    jobId: string;
  };
};

export default async function SingleJobPage({ params }: PageProps) {
  const { jobId } = params;

  /*
   * Prevent invalid MongoDB IDs from
   * reaching findById().
   */
  if (!mongoose.isValidObjectId(jobId)) {
    notFound();
  }

  await mongoose.connect(process.env.MONGO_URI as string);

  /*
   * The existing JobModel is intentionally
   * flexible and isn't strongly typed as
   * mongoose.Model<Job>.
   *
   * Therefore explicitly narrow the result
   * of this single-document query.
   */
  const rawJobDoc = await JobModel.findById(jobId).lean().exec();

  const jobDoc = rawJobDoc as unknown as Job | null;

  if (!jobDoc) {
    notFound();
  }

  const hasJobIcon =
    typeof jobDoc.jobIcon === "string" &&
    jobDoc.jobIcon.includes("res.cloudinary.com");

  const hasContactPhoto =
    typeof jobDoc.contactPhoto === "string" &&
    jobDoc.contactPhoto.includes("res.cloudinary.com");

  const companyName = jobDoc.orgName || "Company";

  const contactInitial =
    jobDoc.contactName?.trim().charAt(0).toUpperCase() || "?";

  return (
    <main className="min-h-screen bg-slate-50 pb-16">
      {/* JOB HERO */}
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-[#077998]"
          >
            <span aria-hidden="true">←</span>
            Back to jobs
          </Link>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 gap-5">
              {/* COMPANY LOGO */}
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
                {hasJobIcon ? (
                  <Image
                    src={jobDoc.jobIcon}
                    alt={`${companyName} logo`}
                    width={80}
                    height={80}
                    className="h-full w-full bg-white object-contain p-1"
                    priority
                  />
                ) : (
                  <span aria-hidden="true" className="text-3xl">
                    💼
                  </span>
                )}
              </div>

              {/* TITLE */}
              <div className="min-w-0">
                <p className="mb-2 text-sm font-semibold uppercase tracking-[0.12em] text-[#077998]">
                  {companyName}
                </p>

                <h1 className="max-w-4xl text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
                  {jobDoc.title}
                </h1>

                <div className="mt-4 flex flex-wrap gap-2">
                  <JobBadge>{formatRemote(jobDoc.remote)}</JobBadge>

                  <JobBadge>{formatJobType(jobDoc.type)}</JobBadge>

                  <JobBadge>
                    {[jobDoc.city, jobDoc.state, jobDoc.country]
                      .filter(Boolean)
                      .join(", ")}
                  </JobBadge>
                </div>
              </div>
            </div>

            {/* SALARY */}
            <div className="shrink-0 rounded-xl border border-emerald-100 bg-emerald-50 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                Salary
              </p>

              <p className="mt-1 text-xl font-bold text-emerald-900">
                {formatSalary(jobDoc.salary)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* BODY */}
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:px-8">
        {/* DESCRIPTION */}
        <article className="min-w-0 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-7 border-b border-gray-100 pb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#077998]">
              Opportunity
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-950">
              About this role
            </h2>
          </div>

          <JobRichContent description={jobDoc.description} />
        </article>

        {/* SIDEBAR */}
        <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
          {/* CONTACT */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#077998]">
              Application contact
            </p>

            <h2 className="mt-2 text-xl font-bold text-gray-950">
              Interested in this role?
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Contact the hiring team using the information below.
            </p>

            <div className="mt-6 flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-100">
                {hasContactPhoto ? (
                  <Image
                    src={jobDoc.contactPhoto}
                    alt={jobDoc.contactName}
                    width={64}
                    height={64}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-xl font-bold text-gray-500">
                    {contactInitial}
                  </span>
                )}
              </div>

              <div className="min-w-0">
                <p className="font-semibold text-gray-900">
                  {jobDoc.contactName}
                </p>

                <p className="mt-1 text-xs text-gray-500">Hiring contact</p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <a
                href={`mailto:${jobDoc.contactEmail}`}
                className="flex w-full items-center justify-center rounded-lg bg-[#077998] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#066982]"
              >
                Email hiring contact
              </a>

              <a
                href={`tel:${jobDoc.contactPhone}`}
                className="flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Call hiring contact
              </a>
            </div>

            <div className="mt-5 border-t border-gray-100 pt-5 text-sm">
              <p className="break-all text-gray-600">{jobDoc.contactEmail}</p>

              <p className="mt-2 text-gray-600">{jobDoc.contactPhone}</p>
            </div>
          </section>

          {/* OVERVIEW */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="font-bold text-gray-950">Job overview</h2>

            <dl className="mt-5 space-y-4 text-sm">
              <SummaryRow label="Company" value={companyName} />

              <SummaryRow
                label="Work mode"
                value={formatRemote(jobDoc.remote)}
              />

              <SummaryRow
                label="Employment"
                value={formatJobType(jobDoc.type)}
              />

              <SummaryRow
                label="Location"
                value={[jobDoc.city, jobDoc.state, jobDoc.country]
                  .filter(Boolean)
                  .join(", ")}
              />

              <SummaryRow label="Salary" value={formatSalary(jobDoc.salary)} />
            </dl>
          </section>
        </aside>
      </div>
    </main>
  );
}

function JobBadge({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm font-medium text-gray-600">
      {children}
    </span>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
      <dt className="text-gray-500">{label}</dt>

      <dd className="text-right font-semibold text-gray-800">{value}</dd>
    </div>
  );
}

function formatRemote(value: string) {
  const normalized = value?.toLowerCase();

  const labels: Record<string, string> = {
    remote: "Remote",
    onsite: "On-site",
    "on-site": "On-site",
    hybrid: "Hybrid",
  };

  return labels[normalized] || value;
}

function formatJobType(value: string) {
  const normalized = value?.toLowerCase();

  const labels: Record<string, string> = {
    full: "Full-time",
    "full-time": "Full-time",

    part: "Part-time",
    "part-time": "Part-time",

    project: "Project",
    contract: "Contract",
    internship: "Internship",
    temporary: "Temporary",
  };

  return labels[normalized] || value;
}

function formatSalary(salary: number) {
  const amount = Number(salary);

  if (!Number.isFinite(amount)) {
    return "Not specified";
  }

  return `₦${amount.toLocaleString()}k / month`;
}
