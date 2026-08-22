import Link from "next/link";

type PaginationProps = {
  currentPage: number;

  totalPages: number;

  searchParams: Record<string, string | undefined>;

  basePath?: string;
};

function createPageHref(
  page: number,

  searchParams: Record<string, string | undefined>,

  basePath: string,
) {
  const params = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    if (key !== "page" && value && value.trim()) {
      params.set(key, value);
    }
  });

  /*
   * Keep page-one URLs clean:
   *
   * /locations/lagos
   *
   * rather than:
   *
   * /locations/lagos?page=1
   */
  if (page > 1) {
    params.set("page", String(page));
  }

  const query = params.toString();

  return query ? `${basePath}?${query}` : basePath;
}

function getVisiblePages(currentPage: number, totalPages: number) {
  const pages = new Set<number>();

  pages.add(1);

  pages.add(totalPages);

  pages.add(currentPage);

  pages.add(currentPage - 1);

  pages.add(currentPage + 1);

  return Array.from(pages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);
}

export default function Pagination({
  currentPage,

  totalPages,

  searchParams,

  basePath = "/",
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const visiblePages = getVisiblePages(currentPage, totalPages);

  return (
    <nav
      className="mt-8 flex flex-wrap items-center justify-center gap-2"
      aria-label="Job results pagination"
    >
      {/* PREVIOUS */}
      {currentPage > 1 ? (
        <Link
          href={createPageHref(
            currentPage - 1,

            searchParams,

            basePath,
          )}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          ← Previous
        </Link>
      ) : (
        <span className="cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-4 py-2 text-sm text-gray-400">
          ← Previous
        </span>
      )}

      {/* PAGE NUMBERS */}
      {visiblePages.map((page, index) => {
        const previousPage = visiblePages[index - 1];

        const showEllipsis = Boolean(previousPage && page - previousPage > 1);

        return (
          <div key={page} className="flex items-center gap-2">
            {showEllipsis && <span className="px-1 text-gray-400">…</span>}

            {page === currentPage ? (
              <span
                aria-current="page"
                className="flex h-10 min-w-10 items-center justify-center rounded-lg bg-[#077998] px-3 text-sm font-semibold text-white"
              >
                {page}
              </span>
            ) : (
              <Link
                href={createPageHref(
                  page,

                  searchParams,

                  basePath,
                )}
                className="flex h-10 min-w-10 items-center justify-center rounded-lg border border-gray-300 bg-white px-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                {page}
              </Link>
            )}
          </div>
        );
      })}

      {/* NEXT */}
      {currentPage < totalPages ? (
        <Link
          href={createPageHref(
            currentPage + 1,

            searchParams,

            basePath,
          )}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          Next →
        </Link>
      ) : (
        <span className="cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-4 py-2 text-sm text-gray-400">
          Next →
        </span>
      )}
    </nav>
  );
}
