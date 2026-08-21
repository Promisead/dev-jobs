export default function Loading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="animate-pulse">
        <div className="mb-3 h-8 w-52 rounded-lg bg-gray-200" />

        <div className="mb-6 h-4 w-80 max-w-full rounded-lg bg-gray-200" />

        <div className="flex max-w-xl flex-col gap-3 sm:flex-row">
          <div className="h-11 grow rounded-lg bg-gray-200" />

          <div className="h-11 w-40 rounded-lg bg-gray-200" />
        </div>
      </div>
    </main>
  );
}
