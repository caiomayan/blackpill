"use client";

import { useState, useTransition } from "react";
import { updateTeam, kickMember, forceAddMember, deleteTeam, updateMemberRole } from "@/app/actions/team";
import { IconSettings, IconLoader2, IconCheck, IconX, IconAlertTriangle } from "@tabler/icons-react";
import { inviteUserToTeam } from "@/app/actions/invitation";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { InGameRole } from "@prisma/client";

export default function TeamSettingsClient({ team, currentUser }: { team: any; currentUser: any }) {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: team.name,
    tag: team.tag || "",
    description: team.description || "",
    avatarUrl: team.avatarUrl || "",
  });

  const [inviteIdentifier, setInviteIdentifier] = useState("");
  const [inviteMessage, setInviteMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);

  async function handleUpdateTeam(e: React.FormEvent) {
    e.preventDefault();
    setSuccess(false);
    setError(null);

    startTransition(async () => {
      const res = await updateTeam(team.id, formData);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
      }
    });
  }

  async function handleKick(userId: string) {
    if (!confirm("Are you sure you want to kick this member?")) return;
    
    startTransition(async () => {
      const res = await kickMember(team.id, userId);
      if (res?.error) {
        alert(res.error);
      }
    });
  }

  async function handleRoleChange(userId: string, newRole: InGameRole | "") {
    startTransition(async () => {
      const res = await updateMemberRole(team.id, userId, newRole === "" ? null : newRole);
      if (res?.error) {
        alert(res.error);
      }
    });
  }

  async function handleDeleteTeam() {
    const confirmation = prompt(`Type "${team.name}" to delete this team forever. This cannot be undone.`);
    if (confirmation !== team.name) return;

    startTransition(async () => {
      const res = await deleteTeam(team.id);
      if (res?.error) {
        alert(res.error);
      } else {
        router.push("/teams");
      }
    });
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviteMessage(null);

    startTransition(async () => {
      const res = await inviteUserToTeam(team.id, inviteIdentifier);
      if (res.error) {
        setInviteMessage({ type: 'error', text: res.error });
      } else {
        setInviteMessage({ type: 'success', text: "Invitation sent!" });
        setInviteIdentifier("");
      }
    });
  }

  async function handleForceAdd() {
    if (!inviteIdentifier) return;
    setInviteMessage(null);

    startTransition(async () => {
      const res = await forceAddMember(team.id, inviteIdentifier);
      if (res.error) {
        setInviteMessage({ type: 'error', text: res.error });
      } else {
        setInviteMessage({ type: 'success', text: "Player force added!" });
        setInviteIdentifier("");
      }
    });
  }

  return (
    <main className="flex-1 w-full max-w-4xl mx-auto px-6 pt-12 pb-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-neutral-100 text-neutral-900 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 border border-neutral-200">
            {team.avatarUrl ? (
              <img src={team.avatarUrl} alt={team.name} className="w-full h-full object-cover" />
            ) : (
              <IconSettings size={28} stroke={2} />
            )}
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">Manage Team</h1>
            <p className="text-neutral-500 font-medium">Configure {team.name} settings and roster.</p>
          </div>
        </div>
        <Link
          href={`/teams/${team.id}`}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-neutral-200 text-neutral-700 font-bold rounded-xl hover:bg-neutral-50 hover:text-black transition-colors text-sm shadow-sm"
        >
          View Public Profile
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Team Settings Form */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-neutral-100">
            <h2 className="text-xl font-bold mb-6">Team Profile</h2>
            <form onSubmit={handleUpdateTeam} className="space-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-neutral-800">Team Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all text-neutral-800"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-neutral-800">Team Tag</label>
                <input
                  type="text"
                  value={formData.tag}
                  onChange={(e) => setFormData({ ...formData, tag: e.target.value.toUpperCase() })}
                  maxLength={10}
                  className="w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all text-neutral-800 uppercase"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-neutral-800">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all text-neutral-800 resize-none"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-neutral-800">Logo URL (Avatar)</label>
                <input
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={formData.avatarUrl}
                  onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all text-neutral-800"
                />
              </div>

              {error && <div className="text-red-500 text-sm font-medium">{error}</div>}

              <button
                type="submit"
                disabled={isPending}
                className="flex items-center justify-center gap-2 w-full md:w-auto px-8 py-3 rounded-xl bg-black text-white font-bold hover:bg-neutral-800 transition-all disabled:opacity-50"
              >
                {isPending ? <IconLoader2 size={18} className="animate-spin" /> : success ? <IconCheck size={18} className="text-green-400" /> : "Save Changes"}
              </button>
            </form>
          </div>

          <div className="bg-red-50 rounded-3xl p-6 md:p-8 shadow-sm border border-red-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-red-600 mb-1 flex items-center gap-2">
                <IconAlertTriangle size={20} />
                Danger Zone
              </h2>
              <p className="text-sm text-red-500 font-medium">Delete this team forever. This action cannot be undone.</p>
            </div>
            <button
              onClick={handleDeleteTeam}
              disabled={isPending}
              className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50 flex-shrink-0"
            >
              Delete Team
            </button>
          </div>
        </div>

        {/* Roster & Invites Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-100">
            <h2 className="text-lg font-bold mb-4">Invite Player</h2>
            <form onSubmit={handleInvite} className="space-y-4">
              <input
                type="text"
                placeholder="SteamID64, URL, or Username"
                value={inviteIdentifier}
                onChange={(e) => setInviteIdentifier(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-xl bg-neutral-50 border border-neutral-200 focus:border-black outline-none text-sm"
              />
              {inviteMessage && (
                <div className={`text-xs font-medium ${inviteMessage.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
                  {inviteMessage.text}
                </div>
              )}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isPending || !inviteIdentifier}
                  className="flex-1 py-2 bg-neutral-900 text-white rounded-xl text-sm font-bold hover:bg-neutral-800 disabled:opacity-50 transition-colors"
                >
                  Send Invite
                </button>
                {currentUser.systemRole === "ADMIN" && (
                  <button
                    type="button"
                    onClick={handleForceAdd}
                    disabled={isPending || !inviteIdentifier}
                    className="flex-1 py-2 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    Force Add
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-100">
            <h2 className="text-lg font-bold mb-4">Active Roster</h2>
            <div className="space-y-3">
              {team.members.map((member: any) => (
                <div key={member.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-neutral-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-neutral-200 overflow-hidden">
                      {member.user.steamAvatarUrl && (
                        <img src={member.user.steamAvatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-neutral-900 leading-tight">
                        {member.user.username || member.user.steamPersonaName}
                      </span>
                      <span className="text-[10px] font-bold text-neutral-400">
                        {member.memberRole}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <select 
                      value={member.inGameRole || ""} 
                      onChange={(e) => handleRoleChange(member.userId, e.target.value as any)}
                      disabled={isPending}
                      className="text-xs bg-neutral-100 border-none font-bold text-neutral-600 rounded-lg px-2 py-1 outline-none cursor-pointer hover:bg-neutral-200 transition-colors"
                    >
                      <option value="">No Role</option>
                      {Object.values(InGameRole).map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>

                    {member.memberRole !== "OWNER" && (
                      <button 
                        onClick={() => handleKick(member.userId)}
                        disabled={isPending}
                        className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                        title="Kick Player"
                      >
                        <IconX size={16} stroke={2.5} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
