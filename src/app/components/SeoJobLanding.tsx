import BreadcrumbJsonLd from "@/app/components/BreadcrumbJsonLd";
import Jobs from "@/app/components/Jobs";

import { SEO_LOCATION_LIST } from "@/lib/seoLocations";

import { SITE } from "@/lib/site";

import { addOrgAndUserData, Job, JobModel } from "@/models/Job";

import { getUser } from "@workos-inc/authkit-nextjs";

import type { FilterQuery } from "mongoose";

import mongoose from "mongoose";

import Link from "next/link";

import { notFound } from "next/navigation";

const PAGE_SIZE = 10;

type SeoJobLandingProps = {
  eyebrow: string;

  title: string;

  intro: string;

  content: string[];

  jobsHeader: string;

  basePath: string;

  breadcrumbLabel: string;

  query: FilterQuery<Job>;

  page: number;

  currentLocationSlug?: string;
};

export default async function SeoJobLanding({
  eyebrow,

  title,

  intro,

  content,

  jobsHeader,

  basePath,

  breadcrumbLabel,

  query,

  page,

  currentLocationSlug,
}: SeoJobLandingProps) {
  const { user } = await getUser();

  const typedUser = user as unknown as import("@workos-inc/node").User;

  await mongoose.connect(process.env.MONGO_URI as string);

  const totalJobs = await JobModel.countDocuments(query);

  const totalPages = Math.max(
    1,

    Math.ceil(totalJobs / PAGE_SIZE),
  );

  /*
   * Invalid pagination URLs should not
   * quietly duplicate page 1.
   */
  if (page > totalPages) {
    notFound();
  }

  const skip = (page - 1) * PAGE_SIZE;

  const jobDocs = await JobModel.find(query)
    .sort({
      createdAt: -1,
    })
    .skip(skip)
    .limit(PAGE_SIZE);

  const jobs = await addOrgAndUserData(jobDocs, typedUser);

  const relatedLocations = SEO_LOCATION_LIST.filter(
    (location) => location.slug !== currentLocationSlug,
  );

  return (
    <main className="min-h-screen bg-white">
      <BreadcrumbJsonLd
        items={[
          {
            name: "Dev Champions Jobs",

            url: SITE.url,
          },

          {
            name: breadcrumbLabel,

            url: `${SITE.url}${basePath}`,
          },
        ]}
      />

      {/* HERO */}
      <section className="border-b border-gray-100 bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          {/* VISIBLE BREADCRUMB */}
          <nav
            aria-label="Breadcrumb"
            className="mb-6 flex flex-wrap items-center gap-2 text-sm text-gray-500"
          >
            <Link href="/" className="transition hover:text-[#077998]">
              Jobs
            </Link>

            <span aria-hidden="true">/</span>

            <span aria-current="page" className="font-medium text-gray-700">
              {breadcrumbLabel}
            </span>
          </nav>

          <div className="max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#077998]">
              {eyebrow}
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-950 sm:text-5xl">
              {title}
            </h1>

            <p className="mt-5 max-w-3xl text-base leading-8 text-gray-600 sm:text-lg">
              {intro}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-[#077998]/20 bg-[#077998]/5 px-4 py-2 text-sm font-semibold text-[#077998]">
                {totalJobs === 1
                  ? "1 current opportunity"
                  : `${totalJobs} current opportunities`}
              </span>

              <Link
                href="/"
                className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
              >
                Search all jobs
              </Link>

              <Link
                href="/remote-jobs"
                className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
              >
                Remote jobs
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* LIVE JOB INVENTORY */}
      <Jobs
        header={jobsHeader}
        jobs={jobs}
        total={totalJobs}
        currentPage={page}
        totalPages={totalPages}
        pageSize={PAGE_SIZE}
        searchParams={{}}
        basePath={basePath}
      />

      {/* SUPPORTING SEO CONTENT */}
      <section className="border-t border-gray-100 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8 lg:py-16">
          <article>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#077998]">
              Career opportunities
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-950">
              Find the right technology opportunity
            </h2>

            <div className="mt-6 max-w-3xl space-y-5 text-base leading-8 text-gray-600">
              {content.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-[#077998]/15 bg-[#077998]/5 p-6">
              <h3 className="text-xl font-bold text-gray-950">
                Build more than your job search
              </h3>

              <p className="mt-3 leading-7 text-gray-600">
                Explore technology career guidance through Tech Path and deepen
                your technical skills with practical resources from Tech Core.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href={SITE.path.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-[#077998] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#066982]"
                >
                  Explore Career Insights
                </Link>

                <Link
                  href={SITE.core.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Explore Tech Learning
                </Link>
              </div>
            </div>
          </article>

          {/* RELATED MARKETS */}
          <aside className="rounded-2xl border border-gray-200 bg-slate-50 p-6 lg:self-start">
            <h2 className="text-xl font-bold text-gray-950">
              Explore jobs by location
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Browse dedicated career pages for key Nigerian job markets.
            </p>

            <nav aria-label="Related job locations" className="mt-6 space-y-2">
              {relatedLocations.map((location) => (
                <Link
                  key={location.slug}
                  href={`/locations/${location.slug}`}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:border-[#077998]/40 hover:text-[#077998]"
                >
                  <span>Jobs in {location.shortName}</span>

                  <span aria-hidden="true">→</span>
                </Link>
              ))}

              <Link
                href="/remote-jobs"
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:border-[#077998]/40 hover:text-[#077998]"
              >
                <span>Remote jobs</span>

                <span aria-hidden="true">→</span>
              </Link>
            </nav>

            <div className="mt-6 border-t border-gray-200 pt-6">
              <p className="text-sm leading-6 text-gray-600">
                Hiring or building a digital product?
              </p>

              <Link
                href={SITE.parent.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex text-sm font-bold text-[#077998] transition hover:underline"
              >
                Explore Dev Champions Digital Solutions →
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
