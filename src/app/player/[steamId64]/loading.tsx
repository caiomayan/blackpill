export default function PlayerLoading() {
  return (
    <div className="flex-grow w-full max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-16 pb-24 animate-pulse">
      {/* Profile Header Skeleton */}
      <div className="flex flex-col md:flex-row items-center gap-6 mb-12 bg-white/60 border border-neutral-100 p-8 rounded-[2.5rem] shadow-sm max-w-4xl w-full mx-auto">
        {/* Avatar Skeleton */}
        <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-neutral-200/80 shrink-0" />
        
        {/* Name and tags Skeleton */}
        <div className="flex-grow flex flex-col items-center md:items-start gap-3.5 w-full">
          <div className="h-10 w-64 bg-neutral-200/80 rounded-xl" />
          <div className="flex gap-2">
            <div className="h-6 w-20 bg-neutral-200/80 rounded-full" />
            <div className="h-6 w-28 bg-neutral-200/80 rounded-full" />
          </div>
        </div>
        
        {/* Team Logo Skeleton */}
        <div className="w-18 h-18 rounded-2xl bg-neutral-200/80 shrink-0 hidden md:block" />
      </div>

      {/* Grid for Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Faceit Stats Block */}
        <div className="lg:col-span-1 bg-white/60 border border-neutral-100 p-8 rounded-[2.5rem] flex flex-col gap-6 shadow-sm">
          <div className="h-6 w-32 bg-neutral-200/80 rounded-lg" />
          <div className="flex items-center justify-between border-b border-neutral-100/60 pb-4">
            <div className="h-10 w-10 rounded-xl bg-neutral-200/80" />
            <div className="flex flex-col gap-1.5 items-end">
              <div className="h-4 w-16 bg-neutral-200/80 rounded" />
              <div className="h-3 w-10 bg-neutral-200/80 rounded" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-neutral-50/50 border border-neutral-100/20 p-4 rounded-2xl flex flex-col gap-2 shadow-sm">
              <div className="h-3 w-16 bg-neutral-200/80 rounded" />
              <div className="h-5 w-12 bg-neutral-200/80 rounded" />
            </div>
            <div className="bg-neutral-50/50 border border-neutral-100/20 p-4 rounded-2xl flex flex-col gap-2 shadow-sm">
              <div className="h-3 w-16 bg-neutral-200/80 rounded" />
              <div className="h-5 w-12 bg-neutral-200/80 rounded" />
            </div>
          </div>
        </div>

        {/* Right Column: Main Content Area */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Tabs skeleton */}
          <div className="flex gap-2 bg-neutral-100/40 border border-neutral-200/20 p-1.5 rounded-2xl w-fit">
            <div className="h-8 w-24 bg-neutral-200/80 rounded-xl" />
            <div className="h-8 w-24 bg-neutral-200/60 rounded-xl" />
            <div className="h-8 w-24 bg-neutral-200/60 rounded-xl" />
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="h-44 bg-white/60 border border-neutral-100 p-6 rounded-3xl shadow-sm" />
            <div className="h-44 bg-white/60 border border-neutral-100 p-6 rounded-3xl shadow-sm" />
          </div>
        </div>
      </div>
    </div>
  );
}
