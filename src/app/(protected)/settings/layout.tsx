import Link from "next/link";
import { requireOnboardedUser } from "@/lib/session";
import { IconUser, IconShieldLock } from "@tabler/icons-react";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireOnboardedUser();

  return (
    <div className="flex-1 w-full max-w-[1200px] mx-auto px-6 pt-10 md:pt-16 pb-16 min-h-[calc(100vh-130px)] flex flex-col md:flex-row gap-8">
      {/* Sidebar */}
      <aside className="w-full md:w-64 flex flex-col gap-2 shrink-0">
        <h2 className="text-xl font-bold tracking-tight mb-4 pl-2">Settings</h2>
        
        <nav className="flex flex-col gap-1">
          <Link 
            href="/settings/profile" 
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/60 font-semibold shadow-sm border border-neutral-100 text-black hover:bg-white transition-all"
          >
            <IconUser size={18} />
            Public Profile
          </Link>
          
          <Link 
            href="#" 
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-500 font-medium hover:bg-neutral-100/50 transition-all opacity-50 cursor-not-allowed"
          >
            <IconShieldLock size={18} />
            Account (Soon)
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  );
}
