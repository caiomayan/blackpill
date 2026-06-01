"use client";

import { useState, useTransition } from "react";
import { User, InGameRole } from "@prisma/client";
import { updateProfile } from "@/app/actions/user";
import { IconBrandX, IconBrandInstagram, IconBrandYoutube, IconCheck, IconLoader2, IconTrophy } from "@tabler/icons-react";

export function ProfileForm({ initialData }: { initialData: User }) {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    username: initialData.username || "",
    bio: initialData.bio || "",
    location: initialData.location || "",
    bannerUrl: initialData.bannerUrl || "",
    xUrl: initialData.xUrl || "",
    instagramUrl: initialData.instagramUrl || "",
    youtubeUrl: initialData.youtubeUrl || "",
    hltvUrl: initialData.hltvUrl || "",
    inGameRoles: initialData.inGameRoles || [],
  });

  const IN_GAME_ROLES = Object.values(InGameRole);

  const toggleRole = (role: InGameRole) => {
    setFormData((prev) => {
      const isSelected = prev.inGameRoles.includes(role);
      if (isSelected) {
        return { ...prev, inGameRoles: prev.inGameRoles.filter((r) => r !== role) };
      }
      if (prev.inGameRoles.length >= 3) {
        return prev;
      }
      return { ...prev, inGameRoles: [...prev.inGameRoles, role] };
    });
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccess(false);
    setError(null);

    startTransition(async () => {
      const res = await updateProfile(formData);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {/* Basic Info */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-neutral-800">Username</label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            placeholder="Your custom username"
            className="w-full px-4 py-3 rounded-xl bg-neutral-100/50 border-none ring-1 ring-neutral-200 focus:ring-2 focus:ring-black outline-none transition-all text-neutral-800"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-neutral-800">Bio</label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            placeholder="Tell us a little bit about yourself"
            rows={3}
            className="w-full px-4 py-3 rounded-xl bg-neutral-100/50 border-none ring-1 ring-neutral-200 focus:ring-2 focus:ring-black outline-none transition-all text-neutral-800 resize-none"
          />
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex flex-col gap-2 flex-1">
            <label className="text-sm font-bold text-neutral-800">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g. São Paulo, BR"
              className="w-full px-4 py-3 rounded-xl bg-neutral-100/50 border-none ring-1 ring-neutral-200 focus:ring-2 focus:ring-black outline-none transition-all text-neutral-800"
            />
          </div>
          <div className="flex flex-col gap-2 flex-1">
            <label className="text-sm font-bold text-neutral-800">Profile Banner URL</label>
            <input
              type="url"
              value={formData.bannerUrl}
              onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })}
              placeholder="https://..."
              className="w-full px-4 py-3 rounded-xl bg-neutral-100/50 border-none ring-1 ring-neutral-200 focus:ring-2 focus:ring-black outline-none transition-all text-neutral-800"
            />
            <p className="text-xs text-neutral-500">Paste an image URL for your profile banner.</p>
          </div>
        </div>
      </div>

      <hr className="border-neutral-200" />

      {/* In-Game Roles */}
      <div className="flex flex-col gap-4">
        <div>
          <label className="text-sm font-bold text-neutral-800">In-Game Roles</label>
          <p className="text-xs text-neutral-500 mt-1">Select your preferred roles in CS2.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {IN_GAME_ROLES.map((role) => {
            const isSelected = formData.inGameRoles.includes(role);
            return (
              <button
                key={role}
                type="button"
                onClick={() => toggleRole(role)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                  isSelected
                    ? "bg-black text-white border-black"
                    : "bg-white text-neutral-500 border-neutral-200 hover:border-black hover:text-black"
                }`}
              >
                {role}
              </button>
            );
          })}
        </div>
      </div>

      <hr className="border-neutral-200" />

      {/* Social Links */}
      <div className="flex flex-col gap-6">
        <div>
          <label className="text-sm font-bold text-neutral-800">Social Links</label>
          <p className="text-xs text-neutral-500 mt-1">Connect your other platforms to your profile.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm font-bold text-neutral-800">
              <IconBrandX size={16} /> X (Twitter)
            </div>
            <input
              type="url"
              value={formData.xUrl}
              onChange={(e) => setFormData({ ...formData, xUrl: e.target.value })}
              placeholder="https://x.com/..."
              className="w-full px-4 py-3 rounded-xl bg-neutral-100/50 border-none ring-1 ring-neutral-200 focus:ring-2 focus:ring-black outline-none transition-all text-neutral-800"
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm font-bold text-neutral-800">
              <IconBrandInstagram size={16} /> Instagram
            </div>
            <input
              type="url"
              value={formData.instagramUrl}
              onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
              placeholder="https://instagram.com/..."
              className="w-full px-4 py-3 rounded-xl bg-neutral-100/50 border-none ring-1 ring-neutral-200 focus:ring-2 focus:ring-black outline-none transition-all text-neutral-800"
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm font-bold text-neutral-800">
              <IconBrandYoutube size={16} /> YouTube
            </div>
            <input
              type="url"
              value={formData.youtubeUrl}
              onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
              placeholder="https://youtube.com/..."
              className="w-full px-4 py-3 rounded-xl bg-neutral-100/50 border-none ring-1 ring-neutral-200 focus:ring-2 focus:ring-black outline-none transition-all text-neutral-800"
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm font-bold text-neutral-800">
              <IconTrophy size={16} /> HLTV
            </div>
            <input
              type="url"
              value={formData.hltvUrl}
              onChange={(e) => setFormData({ ...formData, hltvUrl: e.target.value })}
              placeholder="https://hltv.org/player/..."
              className="w-full px-4 py-3 rounded-xl bg-neutral-100/50 border-none ring-1 ring-neutral-200 focus:ring-2 focus:ring-black outline-none transition-all text-neutral-800"
            />
          </div>
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
          disabled={isPending}
          className="flex items-center gap-2 px-8 py-3 rounded-xl bg-black text-white font-bold hover:bg-neutral-800 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {isPending ? (
            <IconLoader2 size={18} className="animate-spin" />
          ) : success ? (
            <IconCheck size={18} className="text-green-400" />
          ) : null}
          {success ? "Saved!" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
