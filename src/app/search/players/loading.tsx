export default function PlayersSearchLoading() {
  return (
    <div className="flex-grow w-full max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-16 animate-pulse">
      {/* Title block skeleton */}
      <div className="flex flex-col items-center mb-12 text-center">
        <div className="h-12 w-80 bg-neutral-200/80 rounded-2xl mb-4" />
        <div className="h-5 w-64 bg-neutral-200/60 rounded-xl" />
      </div>

      {/* Directory search layout skeleton */}
      <div className="bg-white/80 border border-neutral-100/80 rounded-[2.5rem] p-6 md:p-8 shadow-sm">
        {/* Search input mock */}
        <div className="mb-8 max-w-md mx-auto h-12 bg-neutral-100 rounded-xl" />

        {/* Players Cards Grid Mock */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-4 p-4 rounded-2xl border border-neutral-100 bg-white shadow-sm h-[80px]"
            >
              {/* Avatar circle */}
              <div className="w-12 h-12 rounded-full bg-neutral-200/80 shrink-0" />
              {/* Name bar */}
              <div className="h-5 w-24 bg-neutral-200/80 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
