export default function GlobalLoading() {
  return (
    <div className="flex-1 w-full max-w-[1200px] mx-auto px-6 py-12 flex flex-col items-center justify-center min-h-[50vh] animate-in fade-in duration-300">
      <div className="flex flex-col items-center gap-4">
        {/* Loading Spinner */}
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-2 border-neutral-100/80 bg-neutral-50/50 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-t-black border-r-transparent border-b-transparent border-l-transparent animate-spin" />
          </div>
        </div>
        <p className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  );
}
