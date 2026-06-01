export default function RankingLoading() {
  return (
    <main className="flex-1 w-full max-w-4xl mx-auto px-6 pt-12 pb-16 animate-pulse">
      {/* Title section skeleton */}
      <div className="flex flex-col items-center mb-12 text-center">
        <div className="h-10 w-64 bg-neutral-200/80 rounded-2xl mb-4" />
        <div className="h-5 w-80 bg-neutral-200/60 rounded-xl" />
      </div>

      {/* Leaderboard Table Skeleton */}
      <div className="bg-white/80 border border-neutral-100/80 rounded-[2.5rem] p-6 shadow-sm flex flex-col gap-4">
        {/* Table Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100/60 px-4">
          <div className="h-4 w-12 bg-neutral-200/80 rounded" />
          <div className="h-4 w-32 bg-neutral-200/80 rounded" />
          <div className="h-4 w-16 bg-neutral-200/80 rounded" />
        </div>

        {/* Rows */}
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex items-center justify-between py-3 px-4 border-b border-neutral-50 last:border-0">
            <div className="flex items-center gap-4">
              {/* Rank Badge */}
              <div className="h-5 w-5 bg-neutral-200/60 rounded-full" />
              {/* Avatar */}
              <div className="h-10 w-10 bg-neutral-200/80 rounded-full" />
              {/* Name */}
              <div className="h-5 w-32 bg-neutral-200/80 rounded-xl" />
            </div>
            {/* Elo/Level Badge */}
            <div className="h-6 w-16 bg-neutral-200/80 rounded-full" />
          </div>
        ))}
      </div>
    </main>
  );
}
