function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-lg bg-gray-200 ${className}`}
    />
  );
}

function JobRowSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex gap-4">
        <SkeletonBlock className="h-12 w-12 shrink-0" />

        <div className="grow">
          <SkeletonBlock className="mb-2 h-3 w-28" />

          <SkeletonBlock className="mb-3 h-5 w-2/3" />

          <SkeletonBlock className="h-3 w-1/2" />
        </div>

        <SkeletonBlock className="hidden h-3 w-20 sm:block" />
      </div>
    </div>
  );
}

export function HomeSkeleton() {
  return (
    <>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-col items-center">
            <SkeletonBlock className="mb-4 h-4 w-40" />

            <SkeletonBlock className="mb-4 h-12 w-full max-w-xl" />

            <SkeletonBlock className="mb-8 h-5 w-full max-w-2xl" />

            <div className="flex w-full max-w-3xl gap-3">
              <SkeletonBlock className="h-14 grow" />

              <SkeletonBlock className="h-14 w-32" />
            </div>

            <SkeletonBlock className="mt-4 h-14 w-full max-w-3xl" />
          </div>
        </div>
      </section>

      <JobListSkeleton />
    </>
  );
}

export function JobListSkeleton() {
  return (
    <section className="bg-slate-100 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SkeletonBlock className="mb-3 h-6 w-40" />

        <SkeletonBlock className="mb-6 h-4 w-48" />

        <div className="space-y-4">
          {Array.from({
            length: 5,
          }).map((_, index) => (
            <JobRowSkeleton key={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function JobDetailsSkeleton() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-start justify-between gap-6">
        <div className="grow">
          <SkeletonBlock className="mb-4 h-10 w-2/3" />

          <SkeletonBlock className="h-4 w-1/3" />
        </div>

        <SkeletonBlock className="h-16 w-16 shrink-0" />
      </div>

      <div className="mt-10 space-y-4">
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-5/6" />
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-3/4" />
      </div>

      <div className="mt-10 rounded-xl bg-gray-100 p-8">
        <SkeletonBlock className="mb-6 h-6 w-48" />

        <div className="flex gap-5">
          <SkeletonBlock className="h-24 w-24 shrink-0" />

          <div className="grow space-y-3">
            <SkeletonBlock className="h-4 w-40" />
            <SkeletonBlock className="h-4 w-64 max-w-full" />
            <SkeletonBlock className="h-4 w-48" />
          </div>
        </div>
      </div>
    </main>
  );
}

export function JobFormSkeleton() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <SkeletonBlock className="mb-8 h-8 w-56" />

      <div className="space-y-6">
        <SkeletonBlock className="h-11 w-full" />

        <div className="grid gap-6 sm:grid-cols-3">
          <SkeletonBlock className="h-28" />

          <SkeletonBlock className="h-28" />

          <SkeletonBlock className="h-28" />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <SkeletonBlock className="h-11" />

          <SkeletonBlock className="h-11" />

          <SkeletonBlock className="h-11" />
        </div>

        <SkeletonBlock className="h-40 w-full" />

        <div className="grid gap-8 sm:grid-cols-2">
          <SkeletonBlock className="h-32" />

          <SkeletonBlock className="h-32" />
        </div>

        <div className="flex justify-center">
          <SkeletonBlock className="h-12 w-48" />
        </div>
      </div>
    </main>
  );
}

export function CompanySelectionSkeleton() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <SkeletonBlock className="mb-3 h-8 w-48" />

      <SkeletonBlock className="mb-8 h-4 w-72 max-w-full" />

      <div className="max-w-lg space-y-3">
        <SkeletonBlock className="h-12 w-full" />

        <SkeletonBlock className="h-12 w-full" />

        <SkeletonBlock className="h-12 w-full" />
      </div>

      <SkeletonBlock className="mt-8 h-11 w-44" />
    </main>
  );
}
