import BreadcrumbJsonLd from "@/app/components/BreadcrumbJsonLd";
import JobApplyLink from "@/app/components/JobApplyLink";
import JobPostingJsonLd from "@/app/components/JobPostingJsonLd";
import JobRichContent from "@/app/components/JobRichContent";
import JobViewTracker from "@/app/components/JobViewTracker";

import { getJobById } from "@/lib/getJobById";

import {
  formatJobPostedDate,
  formatJobSalary,
  formatJobType,
  formatWorkMode,
  getJobCanonicalUrl,
  getJobLocationText,
  getJobMetaDescription,
  getJobMetaTitle,
  isFullyRemote,
} from "@/lib/jobSeo";

import { SITE } from "@/lib/site";

import type { Metadata } from "next";

import Image from "next/image";
import Link from "next/link";

import { notFound } from "next/navigation";

import type { ReactNode } from "react";

type PageProps = {
  params: {
    jobId: string;
  };
};

/*
 * ========================================
 * DYNAMIC JOB METADATA
 * ========================================
 */

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const jobDoc = await getJobById(params.jobId);

  if (!jobDoc) {
    return {
      title: "Job Not Found",

      robots: {
        index: false,

        follow: false,
      },
    };
  }

  const jobId = String(jobDoc._id);

  const canonical = getJobCanonicalUrl(jobId);

  const title = getJobMetaTitle(jobDoc);

  const description = getJobMetaDescription(jobDoc);

  const companyName = jobDoc.orgName || "Hiring Company";

  const hasJobIcon =
    typeof jobDoc.jobIcon === "string" &&
    jobDoc.jobIcon.startsWith("https://res.cloudinary.com/");

  return {
    /*
     * Root layout adds:
     *
     * | Dev Champions Jobs
     */
    title,

    description,

    alternates: {
      canonical,
    },

    robots: {
      index: true,

      follow: true,

      googleBot: {
        index: true,

        follow: true,

        "max-image-preview": "large",

        "max-snippet": -1,

        "max-video-preview": -1,
      },
    },

    openGraph: {
      type: "website",

      url: canonical,

      siteName: SITE.name,

      title: `${title} | ${SITE.name}`,

      description,

      ...(hasJobIcon
        ? {
            images: [
              {
                url: jobDoc.jobIcon,

                alt: `${companyName} logo`,
              },
            ],
          }
        : {}),
    },

    twitter: {
      card: "summary",

      title: `${title} | ${SITE.name}`,

      description,

      ...(hasJobIcon
        ? {
            images: [jobDoc.jobIcon],
          }
        : {}),
    },
  };
}

/*
 * ========================================
 * JOB PAGE
 * ========================================
 */

export default async function SingleJobPage({ params }: PageProps) {
  const jobDoc = await getJobById(params.jobId);

  if (!jobDoc) {
    notFound();
  }

  const jobId = String(jobDoc._id);

  const companyName = jobDoc.orgName || "Hiring Company";

  const canonical = getJobCanonicalUrl(jobId);

  const location = getJobLocationText(jobDoc);

  const workMode = formatWorkMode(jobDoc.remote);

  const employmentType = formatJobType(jobDoc.type);

  const salary = formatJobSalary(jobDoc.salary);

  const postedDate = formatJobPostedDate(jobDoc.createdAt);

  const remote = isFullyRemote(jobDoc.remote);

  const hasJobIcon =
    typeof jobDoc.jobIcon === "string" &&
    jobDoc.jobIcon.includes("res.cloudinary.com");

  const hasContactPhoto =
    typeof jobDoc.contactPhoto === "string" &&
    jobDoc.contactPhoto.includes("res.cloudinary.com");

  const contactInitial =
    jobDoc.contactName?.trim().charAt(0).toUpperCase() || "?";

  return (
    <main className="min-h-screen bg-slate-50 pb-16">
      {/* GOOGLE JOB POSTING */}
      <JobPostingJsonLd job={jobDoc} />

      {/* BREADCRUMB SCHEMA */}
      <BreadcrumbJsonLd
        items={[
          {
            name: SITE.name,

            url: SITE.url,
          },

          {
            name: jobDoc.title,

            url: canonical,
          },
        ]}
      />

      {/* GA4 JOB VIEW */}
      <JobViewTracker
        jobId={jobId}
        jobTitle={jobDoc.title}
        companyName={companyName}
        location={location}
        employmentType={employmentType}
        workMode={workMode}
      />

      {/* JOB HERO */}
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* VISIBLE BREADCRUMB */}
          <nav
            aria-label="Breadcrumb"
            className="mb-6 flex flex-wrap items-center gap-2 text-sm text-gray-500"
          >
            <Link href="/" className="transition hover:text-[#077998]">
              Jobs
            </Link>

            <span aria-hidden="true">/</span>

            <span
              aria-current="page"
              className="max-w-[520px] truncate font-medium text-gray-700"
            >
              {jobDoc.title}
            </span>
          </nav>

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

              {/* JOB IDENTITY */}
              <div className="min-w-0">
                <Link
                  href={`/jobs/${jobDoc.orgId}`}
                  className="mb-2 inline-block text-sm font-semibold uppercase tracking-[0.12em] text-[#077998] transition hover:underline"
                >
                  {companyName}
                </Link>

                <h1 className="max-w-4xl text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
                  {jobDoc.title}
                </h1>

                <div className="mt-4 flex flex-wrap gap-2">
                  <JobBadge>{workMode}</JobBadge>

                  <JobBadge>{employmentType}</JobBadge>

                  {location && <JobBadge>{location}</JobBadge>}
                </div>

                <p className="mt-4 text-sm text-gray-500">
                  Posted <time dateTime={jobDoc.createdAt}>{postedDate}</time>
                </p>
              </div>
            </div>

            {/* SALARY */}
            <div className="shrink-0 rounded-xl border border-emerald-100 bg-emerald-50 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                Monthly salary
              </p>

              <p className="mt-1 text-xl font-bold text-emerald-900">
                {salary}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PAGE BODY */}
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:px-8">
        {/* JOB DESCRIPTION */}
        <article className="min-w-0 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-7 border-b border-gray-100 pb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#077998]">
              Opportunity
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-950">
              About this role
            </h2>
          </div>

          {/* REMOTE CLARIFICATION */}
          {remote && (
            <div className="mb-7 rounded-xl border border-[#077998]/15 bg-[#077998]/5 p-4">
              <p className="font-semibold text-gray-900">
                Fully remote position
              </p>

              <p className="mt-1 text-sm leading-6 text-gray-600">
                This position is listed as fully remote. Applicant location:{" "}
                <strong>{jobDoc.country}</strong>.
              </p>
            </div>
          )}

          <JobRichContent description={jobDoc.description} />
        </article>

        {/* SIDEBAR */}
        <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
          {/* APPLICATION */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#077998]">
              Application contact
            </p>

            <h2 className="mt-2 text-xl font-bold text-gray-950">
              Interested in this role?
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Contact the hiring team directly using the verified application
              information supplied with this job.
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

            {/* APPLICATION CTA */}
            <div className="mt-6 space-y-3">
              <JobApplyLink
                href={`mailto:${jobDoc.contactEmail}`}
                method="email"
                jobId={jobId}
                jobTitle={jobDoc.title}
                companyName={companyName}
                className="flex w-full items-center justify-center rounded-lg bg-[#077998] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#066982]"
              >
                Email hiring contact
              </JobApplyLink>

              <JobApplyLink
                href={`tel:${jobDoc.contactPhone}`}
                method="phone"
                jobId={jobId}
                jobTitle={jobDoc.title}
                companyName={companyName}
                className="flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Call hiring contact
              </JobApplyLink>
            </div>

            <div className="mt-5 border-t border-gray-100 pt-5 text-sm">
              <p className="break-all text-gray-600">{jobDoc.contactEmail}</p>

              <p className="mt-2 text-gray-600">{jobDoc.contactPhone}</p>
            </div>
          </section>

          {/* JOB OVERVIEW */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="font-bold text-gray-950">Job overview</h2>

            <dl className="mt-5 space-y-4 text-sm">
              <SummaryRow label="Company" value={companyName} />

              <SummaryRow label="Work mode" value={workMode} />

              <SummaryRow label="Employment" value={employmentType} />

              <SummaryRow
                label={remote ? "Applicant location" : "Location"}
                value={location || "Not specified"}
              />

              <SummaryRow label="Salary" value={salary} />

              <SummaryRow label="Posted" value={postedDate} />
            </dl>
          </section>

          {/* CAREER ECOSYSTEM */}
          <section className="rounded-2xl border border-gray-200 bg-slate-50 p-6">
            <h2 className="font-bold text-gray-950">
              Prepare for opportunities
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Build your career knowledge and technical capability across the
              Dev Champions ecosystem.
            </p>

            <div className="mt-4 space-y-3">
              <Link
                href={SITE.path.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm font-semibold text-[#077998] transition hover:underline"
              >
                Career & Industry Insights →
              </Link>

              <Link
                href={SITE.core.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm font-semibold text-[#077998] transition hover:underline"
              >
                Developer Tutorials & Learning →
              </Link>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}

/*
 * ========================================
 * PRESENTATIONAL HELPERS
 * ========================================
 */

function JobBadge({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm font-medium text-gray-600">
      {children}
    </span>
  );
}

function SummaryRow({
  label,

  value,
}: {
  label: string;

  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
      <dt className="text-gray-500">{label}</dt>

      <dd className="text-right font-semibold text-gray-800">{value}</dd>
    </div>
  );
}
