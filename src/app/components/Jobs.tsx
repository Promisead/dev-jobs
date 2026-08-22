import JobRow from "@/app/components/JobRow";
import Pagination from "@/app/components/Pagination";

import type { Job } from "@/models/Job";

type JobsProps = {
  header: string;

  jobs: Job[];

  total?: number;

  currentPage?: number;

  totalPages?: number;

  pageSize?: number;

  searchParams?: Record<string, string | undefined>;

  basePath?: string;
};

export default function Jobs({
  header,

  jobs,

  total = jobs.length,

  currentPage = 1,

  totalPages = 1,

  pageSize = jobs.length || 1,

  searchParams = {},

  basePath = "/",
}: JobsProps) {
  const firstResult = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;

  const lastResult = Math.min(
    currentPage * pageSize,

    total,
  );

  return (
    <section className="bg-slate-100 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* RESULTS HEADER */}
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {header || "Recent jobs"}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {total === 0
                ? "No matching jobs are currently available"
                : `Showing ${firstResult}–${lastResult} of ${total} ${
                    total === 1 ? "job" : "jobs"
                  }`}
            </p>
          </div>
        </div>

        {/* JOB LIST */}
        <div className="flex flex-col gap-4">
          {!jobs.length && (
            <div className="rounded-xl border border-gray-200 bg-white px-6 py-12 text-center">
              <h3 className="font-semibold text-gray-900">
                No jobs currently available
              </h3>

              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-gray-500">
                New opportunities are added as employers publish them. Explore
                another location or return to the main job search.
              </p>
            </div>
          )}

          {jobs.map((job) => (
            <JobRow key={job._id} jobDoc={job} />
          ))}
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            searchParams={searchParams}
            basePath={basePath}
          />
        )}
      </div>
    </section>
  );
}
