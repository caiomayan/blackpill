"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { IconRefresh } from "@tabler/icons-react";
import { revalidateProfile } from "@/app/actions/user";

type SyncButtonProps = {
  steamId64: string;
};

export function SyncButton({ steamId64 }: SyncButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);

  function handleSync() {
    setSuccess(false);
    startTransition(async () => {
      const res = await revalidateProfile(steamId64);
      if (res.success) {
        setSuccess(true);
        router.refresh();
        setTimeout(() => setSuccess(false), 2000);
      }
    });
  }

  return (
    <button
      onClick={handleSync}
      disabled={isPending}
      className="flex items-center gap-1.5 bg-white text-neutral-700 border border-neutral-200/60 px-4 py-2 rounded-full font-bold text-xs md:text-sm hover:bg-neutral-50 hover:text-black hover:-translate-y-0.5 transition-all shadow-sm active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0"
      title="Sync player statistics & inventory from Steam/Faceit APIs"
    >
      <IconRefresh 
        size={14} 
        stroke={2.5}
        className={`flex-shrink-0 ${isPending ? "animate-spin text-neutral-400" : success ? "text-green-500 scale-110" : "text-neutral-500"} transition-all duration-300`} 
      />
      <span>{isPending ? "Syncing..." : success ? "Synced!" : "Sync Profile"}</span>
    </button>
  );
}
