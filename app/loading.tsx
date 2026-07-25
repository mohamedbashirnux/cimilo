export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-16 pt-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="skeleton size-10 rounded-xl" />
          <div className="space-y-1.5">
            <div className="skeleton h-4 w-24 rounded" />
            <div className="skeleton h-2.5 w-36 rounded" />
          </div>
        </div>
        <div className="skeleton h-8 w-20 rounded-full" />
      </div>
      <div className="skeleton h-16 rounded-2xl" />
      <div className="skeleton mt-4 h-72 rounded-2xl" />
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skeleton h-32 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
