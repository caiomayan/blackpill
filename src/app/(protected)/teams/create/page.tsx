"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createTeam } from "@/app/actions/team";
import { IconLoader2, IconUsers } from "@tabler/icons-react";

export default function CreateTeamPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    tag: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const res = await createTeam(formData);
      if (res.error) {
        setError(res.error);
      } else if (res.team) {
        router.push(`/teams/${res.team.id}`);
      }
    });
  }

  return (
    <main className="flex-1 w-full max-w-2xl mx-auto px-6 relative flex flex-col pt-12 md:pt-20 min-h-[calc(100vh-130px)] pb-16">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-black text-white rounded-xl">
            <IconUsers size={24} stroke={2} />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">Create Team</h1>
        </div>
        <p className="text-neutral-500 font-medium">
          Start your own team. You'll be assigned as the Owner automatically.
        </p>
      </div>

      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-[0_8px_40px_rgb(0,0,0,0.04)] border border-white">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-neutral-800">Team Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Natus Vincere"
              className="w-full px-4 py-3 rounded-xl bg-neutral-100/50 border-none ring-1 ring-neutral-200 focus:ring-2 focus:ring-black outline-none transition-all text-neutral-800"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-neutral-800">Team Tag <span className="text-neutral-400 font-normal">(Optional)</span></label>
            <input
              type="text"
              value={formData.tag}
              onChange={(e) => setFormData({ ...formData, tag: e.target.value.toUpperCase() })}
              placeholder="e.g. NAVI"
              maxLength={10}
              className="w-full px-4 py-3 rounded-xl bg-neutral-100/50 border-none ring-1 ring-neutral-200 focus:ring-2 focus:ring-black outline-none transition-all text-neutral-800 uppercase"
            />
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
              {isPending ? <IconLoader2 size={18} className="animate-spin" /> : "Create Team"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
