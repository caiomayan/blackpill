"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createTeam } from "@/app/actions/team";
import { IconCheck, IconLoader2 } from "@tabler/icons-react";

export function TeamForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    tag: "",
    description: "",
    avatarUrl: "",
    bannerUrl: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const res = await createTeam(formData);
      if (res.error) {
        setError(res.error);
      } else if (res.success && res.teamId) {
        // Redirecionar para a página do time no futuro (ex: /teams/[id])
        // Por enquanto, redireciona de volta para a lista de times ou dashboard
        router.push("/teams");
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex flex-col gap-2 flex-[2]">
          <label className="text-sm font-bold text-neutral-800">Team Name *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Natus Vincere"
            className="w-full px-4 py-3 rounded-xl bg-neutral-100/50 border-none ring-1 ring-neutral-200 focus:ring-2 focus:ring-black outline-none transition-all text-neutral-800"
          />
        </div>
        <div className="flex flex-col gap-2 flex-1">
          <label className="text-sm font-bold text-neutral-800">Tag</label>
          <input
            type="text"
            value={formData.tag}
            onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
            placeholder="e.g. NAVI"
            className="w-full px-4 py-3 rounded-xl bg-neutral-100/50 border-none ring-1 ring-neutral-200 focus:ring-2 focus:ring-black outline-none transition-all text-neutral-800 uppercase"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-neutral-800">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="What is your team's objective? (Casual, Tryhard, ESEA, etc.)"
          rows={3}
          className="w-full px-4 py-3 rounded-xl bg-neutral-100/50 border-none ring-1 ring-neutral-200 focus:ring-2 focus:ring-black outline-none transition-all text-neutral-800 resize-none"
        />
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex flex-col gap-2 flex-1">
          <label className="text-sm font-bold text-neutral-800">Logo / Avatar URL</label>
          <input
            type="url"
            value={formData.avatarUrl}
            onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
            placeholder="https://..."
            className="w-full px-4 py-3 rounded-xl bg-neutral-100/50 border-none ring-1 ring-neutral-200 focus:ring-2 focus:ring-black outline-none transition-all text-neutral-800"
          />
        </div>
        <div className="flex flex-col gap-2 flex-1">
          <label className="text-sm font-bold text-neutral-800">Banner URL</label>
          <input
            type="url"
            value={formData.bannerUrl}
            onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })}
            placeholder="https://..."
            className="w-full px-4 py-3 rounded-xl bg-neutral-100/50 border-none ring-1 ring-neutral-200 focus:ring-2 focus:ring-black outline-none transition-all text-neutral-800"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100">
          {error}
        </div>
      )}

      {/* Submit */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isPending || formData.name.length < 3}
          className="flex items-center gap-2 px-8 py-3 rounded-xl bg-black text-white font-bold hover:bg-neutral-800 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {isPending ? (
            <IconLoader2 size={18} className="animate-spin" />
          ) : null}
          Create Team
        </button>
      </div>
    </form>
  );
}
