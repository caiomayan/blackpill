"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createUnauthenticatedProfile } from "@/app/actions/admin";
import { IconLoader2, IconCheck, IconShieldX } from "@tabler/icons-react";

export default function AdminCreatePlayerPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    steamId64: "",
    username: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccess(false);
    setError(null);

    startTransition(async () => {
      const res = await createUnauthenticatedProfile(formData);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(true);
        setFormData({ steamId64: "", username: "" });
        setTimeout(() => {
          setSuccess(false);
          if (res.user) {
            router.push(`/player/${res.user.steamId64}`);
          }
        }, 1500);
      }
    });
  }

  return (
    <main className="flex-1 w-full max-w-2xl mx-auto px-6 relative flex flex-col pt-12 md:pt-20 min-h-[calc(100vh-130px)] pb-16">
      
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-black text-white rounded-xl">
            <IconShieldX size={24} stroke={2} />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">Add Profile Manually</h1>
        </div>
        <p className="text-neutral-500 font-medium">
          Administrators can use this tool to register users who haven't signed into the platform yet. They will be marked as "Unauthenticated".
        </p>
      </div>

      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-[0_8px_40px_rgb(0,0,0,0.04)] border border-white">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-neutral-800">SteamID64 or Steam URL <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              value={formData.steamId64}
              onChange={(e) => setFormData({ ...formData, steamId64: e.target.value })}
              placeholder="e.g. 76561198000000000"
              className="w-full px-4 py-3 rounded-xl bg-neutral-100/50 border-none ring-1 ring-neutral-200 focus:ring-2 focus:ring-black outline-none transition-all text-neutral-800 font-mono"
            />
            <p className="text-xs text-neutral-500">The 17-digit Steam ID, or a link to their profile (e.g. steamcommunity.com/id/nickname).</p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-neutral-800">Custom Username <span className="text-neutral-400 font-normal">(Optional)</span></label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="Player's known nickname"
              className="w-full px-4 py-3 rounded-xl bg-neutral-100/50 border-none ring-1 ring-neutral-200 focus:ring-2 focus:ring-black outline-none transition-all text-neutral-800"
            />
            <p className="text-xs text-neutral-500">If left blank, their Steam persona name will be fetched when they eventually login.</p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100">
              {error}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 px-8 py-3 rounded-xl bg-black text-white font-bold hover:bg-neutral-800 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {isPending ? (
                <IconLoader2 size={18} className="animate-spin" />
              ) : success ? (
                <IconCheck size={18} className="text-green-400" />
              ) : null}
              {success ? "Created!" : "Create Profile"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
