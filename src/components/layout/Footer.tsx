export function Footer() {
  return (
    <footer className="flex items-center justify-center h-14 px-6 max-w-[1200px] w-full text-neutral-400 text-[10px] font-bold tracking-wider uppercase mx-auto">
      <div className="flex items-center gap-2">
        <span className="text-neutral-800">BLACK PILL</span>
        <span className="opacity-40">•</span>
        <span className="text-neutral-400 font-medium font-mono">©{new Date().getFullYear()}</span>
      </div>
    </footer>
  );
}
