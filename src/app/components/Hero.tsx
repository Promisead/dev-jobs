"use client";

import InlineLoader from "@/app/components/InlineLoader";

import { FormEvent, useRef, useState, useTransition } from "react";

import { useRouter } from "next/navigation";

type SearchFilters = {
  q: string;
  remote: string;
  type: string;
  country: string;
  minSalary: string;
  maxSalary: string;
  sort: string;
};

type HeroProps = {
  filters: SearchFilters;
  countries: string[];
  total: number;
};

type PendingAction = "search" | "filters" | "clear" | null;

export default function Hero({ filters, countries, total }: HeroProps) {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();

  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  /*
   * We keep a ref as well as state because
   * button click + form submit can happen
   * during the same React update cycle.
   */
  const pendingActionRef = useRef<PendingAction>(null);

  const hasAdvancedFilters = Boolean(
    filters.remote ||
    filters.type ||
    filters.country ||
    filters.minSalary ||
    filters.maxSalary ||
    filters.sort !== "newest",
  );

  function setAction(action: PendingAction) {
    pendingActionRef.current = action;

    setPendingAction(action);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isPending) {
      return;
    }

    /*
     * If the user presses Enter inside
     * the search field instead of clicking
     * a button, treat it as a search.
     */
    if (pendingActionRef.current === null) {
      setAction("search");
    }

    const form = event.currentTarget;

    const formData = new FormData(form);

    const params = new URLSearchParams();

    /*
     * IMPORTANT:
     * Use FormData.forEach rather than
     * `for...of formData.entries()`.
     *
     * This avoids the downlevelIteration
     * TypeScript build error in this project.
     */
    formData.forEach((rawValue, key) => {
      if (typeof rawValue !== "string") {
        return;
      }

      const value = rawValue.trim();

      if (!value) {
        return;
      }

      /*
       * Do not put the default sorting
       * option into the URL.
       *
       * This keeps:
       *
       * /
       *
       * instead of:
       *
       * /?sort=newest
       */
      if (key === "sort" && value === "newest") {
        return;
      }

      params.set(key, value);
    });

    /*
     * Pagination always returns to
     * page 1 when doing a new search
     * or applying different filters.
     */
    params.delete("page");

    const query = params.toString();

    const destination = query ? `/?${query}` : "/";

    startTransition(() => {
      router.push(destination);
    });
  }

  function handleClearFilters() {
    if (isPending) {
      return;
    }

    setAction("clear");

    startTransition(() => {
      router.push("/");
    });
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* HERO HEADING */}
        <div className="text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#077998]">
            Career Opportunities
          </p>

          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Find your next dream job
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-gray-500 sm:text-lg">
            Search opportunities by role, company, location, work mode,
            employment type and other job details.
          </p>
        </div>

        {/* SEARCH + FILTER FORM */}
        <form onSubmit={handleSubmit} className="mt-8">
          {/* MAIN SEARCH */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative grow">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                aria-hidden="true"
                className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m21 21-4.35-4.35m1.35-5.65a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
                />
              </svg>

              <input
                name="q"
                type="search"
                defaultValue={filters.q}
                placeholder="Job title, company, skill, location..."
                disabled={isPending}
                className="h-14 w-full rounded-xl border border-gray-300 bg-white py-3 pl-12 pr-4 text-base outline-none transition placeholder:text-gray-400 focus:border-[#077998] focus:ring-2 focus:ring-[#077998]/10 disabled:cursor-wait disabled:bg-gray-50"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              onClick={() => setAction("search")}
              aria-busy={isPending && pendingAction === "search"}
              className="inline-flex h-14 min-w-[150px] items-center justify-center gap-2 rounded-xl bg-[#077998] px-7 font-semibold text-white shadow-sm transition hover:bg-[#066982] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending && pendingAction === "search" && <InlineLoader />}

              {isPending && pendingAction === "search"
                ? "Searching..."
                : "Search Jobs"}
            </button>
          </div>

          {/* FILTER AREA */}
          <details
            open={hasAdvancedFilters}
            className="mt-4 rounded-xl border border-gray-200 bg-gray-50"
          >
            <summary className="cursor-pointer select-none px-5 py-4 text-sm font-semibold text-gray-700">
              Filters &amp; sorting
            </summary>

            <div className="border-t border-gray-200 px-5 py-5">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* WORK MODE */}
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-gray-700">
                    Work mode
                  </span>

                  <select
                    name="remote"
                    disabled={isPending}
                    defaultValue={filters.remote}
                    className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-[#077998] disabled:cursor-wait disabled:bg-gray-100"
                  >
                    <option value="">Any work mode</option>

                    <option value="onsite">On-site</option>

                    <option value="hybrid">Hybrid</option>

                    <option value="remote">Fully remote</option>
                  </select>
                </label>

                {/* EMPLOYMENT TYPE */}
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-gray-700">
                    Employment type
                  </span>

                  <select
                    name="type"
                    disabled={isPending}
                    defaultValue={filters.type}
                    className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-[#077998] disabled:cursor-wait disabled:bg-gray-100"
                  >
                    <option value="">Any type</option>

                    <option value="full">Full-time</option>

                    <option value="part">Part-time</option>

                    <option value="project">Project</option>
                  </select>
                </label>

                {/* COUNTRY */}
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-gray-700">
                    Country
                  </span>

                  <select
                    name="country"
                    disabled={isPending}
                    defaultValue={filters.country}
                    className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-[#077998] disabled:cursor-wait disabled:bg-gray-100"
                  >
                    <option value="">All countries</option>

                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </label>

                {/* MINIMUM SALARY */}
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-gray-700">
                    Minimum salary
                  </span>

                  <input
                    name="minSalary"
                    type="number"
                    min="0"
                    disabled={isPending}
                    defaultValue={filters.minSalary}
                    placeholder="e.g. 300"
                    className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-[#077998] disabled:cursor-wait disabled:bg-gray-100"
                  />
                </label>

                {/* MAXIMUM SALARY */}
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-gray-700">
                    Maximum salary
                  </span>

                  <input
                    name="maxSalary"
                    type="number"
                    min="0"
                    disabled={isPending}
                    defaultValue={filters.maxSalary}
                    placeholder="e.g. 1000"
                    className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-[#077998] disabled:cursor-wait disabled:bg-gray-100"
                  />
                </label>

                {/* SORT */}
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-gray-700">
                    Sort by
                  </span>

                  <select
                    name="sort"
                    disabled={isPending}
                    defaultValue={filters.sort}
                    className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-[#077998] disabled:cursor-wait disabled:bg-gray-100"
                  >
                    <option value="newest">Newest first</option>

                    <option value="oldest">Oldest first</option>

                    <option value="salary-high">Salary: high to low</option>

                    <option value="salary-low">Salary: low to high</option>
                  </select>
                </label>
              </div>

              {/* FILTER FOOTER */}
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-gray-500">
                  {total === 1 ? "1 job available" : `${total} jobs available`}
                </p>

                <div className="flex flex-wrap gap-3">
                  {/* CLEAR FILTERS */}
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={handleClearFilters}
                    aria-busy={isPending && pendingAction === "clear"}
                    className="inline-flex min-w-[125px] items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-gray-400 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isPending && pendingAction === "clear" && <InlineLoader />}

                    {isPending && pendingAction === "clear"
                      ? "Clearing..."
                      : "Clear filters"}
                  </button>

                  {/* APPLY FILTERS */}
                  <button
                    type="submit"
                    disabled={isPending}
                    onClick={() => setAction("filters")}
                    aria-busy={isPending && pendingAction === "filters"}
                    className="inline-flex min-w-[130px] items-center justify-center gap-2 rounded-lg bg-[#077998] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#066982] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isPending && pendingAction === "filters" && (
                      <InlineLoader />
                    )}

                    {isPending && pendingAction === "filters"
                      ? "Applying..."
                      : "Apply filters"}
                  </button>
                </div>
              </div>
            </div>
          </details>
        </form>
      </div>
    </section>
  );
}
