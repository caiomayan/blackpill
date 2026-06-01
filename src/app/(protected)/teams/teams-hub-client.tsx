"use client";

import { useTransition } from "react";
import Link from "next/link";
import { acceptInvitation, declineInvitation } from "@/app/actions/invitation";
import { IconCheck, IconX, IconMail, IconUsers, IconPlus, IconSettings } from "@tabler/icons-react";

export default function TeamsHubClient({
  myTeams,
  invitations,
}: {
  myTeams: any[];
  invitations: any[];
}) {
  const [isPending, startTransition] = useTransition();

  async function handleAccept(id: string) {
    startTransition(async () => {
      await acceptInvitation(id);
    });
  }

  async function handleDecline(id: string) {
    startTransition(async () => {
      await declineInvitation(id);
    });
  }

  return (
    <main className="flex-1 w-full max-w-5xl mx-auto px-6 pt-12 pb-16">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-black text-white rounded-xl">
            <IconUsers size={28} stroke={2} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">My Teams</h1>
            <p className="text-neutral-500 font-medium">Manage your teams and pending invitations.</p>
          </div>
        </div>

        <Link
          href="/teams/create"
          className="flex items-center gap-2 px-5 py-2.5 bg-black text-white font-bold rounded-xl hover:bg-neutral-800 transition-colors shadow-sm"
        >
          <IconPlus size={18} stroke={2.5} />
          <span className="hidden sm:inline">Create Team</span>
        </Link>
      </div>

      <div className="space-y-10">
        {/* User's Teams */}
        <section>
          {myTeams.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-neutral-100 text-center shadow-sm">
              <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <IconUsers size={32} className="text-neutral-300" />
              </div>
              <h2 className="text-xl font-bold text-neutral-900 mb-2">No teams yet</h2>
              <p className="text-neutral-500 mb-6">You are not part of any teams. Create one or wait for an invite.</p>
              <Link
                href="/teams/create"
                className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white font-bold rounded-xl hover:bg-neutral-800 transition-colors"
              >
                Create Team
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myTeams.map((userTeam) => {
                const team = userTeam.team;
                const isManager = userTeam.memberRole === "OWNER" || userTeam.memberRole === "ADMIN";

                return (
                  <div key={team.id} className="bg-white rounded-3xl p-6 border border-neutral-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all flex flex-col relative group">
                    
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {team.avatarUrl ? (
                          <img src={team.avatarUrl} alt={team.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-black text-neutral-300 text-xl">
                            {team.tag || team.name.substring(0, 3).toUpperCase()}
                          </span>
                        )}
                      </div>
                      
                      {isManager && (
                        <Link 
                          href={`/teams/${team.id}/settings`}
                          className="p-2 text-neutral-400 hover:text-black hover:bg-neutral-100 rounded-full transition-colors"
                          title="Manage Team"
                        >
                          <IconSettings size={20} stroke={2.5} />
                        </Link>
                      )}
                    </div>

                    <div>
                      <h3 className="text-xl font-extrabold text-neutral-900 leading-tight mb-1">{team.name}</h3>
                      {team.tag && (
                        <span className="inline-block bg-black text-white px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase mb-3">
                          {team.tag}
                        </span>
                      )}
                    </div>

                    <div className="mt-auto pt-4 border-t border-neutral-100 flex items-center justify-between">
                      <span className={`text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider ${
                        userTeam.memberRole === "OWNER" ? "bg-red-50 text-red-600" :
                        "bg-neutral-100 text-neutral-500"
                      }`}>
                        {userTeam.memberRole}
                      </span>
                      <Link 
                        href={`/teams/${team.id}`}
                        className="text-sm font-bold text-black hover:underline"
                      >
                        View Team &rarr;
                      </Link>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Pending Invitations */}
        {invitations.length > 0 && (
          <section>
            <h2 className="text-xl font-extrabold text-neutral-900 mb-4 flex items-center gap-2">
              <IconMail size={20} /> Pending Invitations
            </h2>
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-100">
              <div className="space-y-4">
                {invitations.map((invite) => (
                  <div key={invite.id} className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-2xl bg-neutral-50 border border-neutral-100 gap-4">
                    
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center overflow-hidden flex-shrink-0">
                        {invite.team.avatarUrl ? (
                          <img src={invite.team.avatarUrl} alt={invite.team.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-black text-neutral-300">
                            {invite.team.tag || invite.team.name.substring(0, 3).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-neutral-900 text-lg leading-tight">{invite.team.name}</h3>
                        <p className="text-sm text-neutral-500">
                          Invited by <span className="font-semibold text-neutral-700">{invite.inviter.username || invite.inviter.steamPersonaName}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => handleAccept(invite.id)}
                        disabled={isPending}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-black text-white font-bold rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-50 text-sm"
                      >
                        <IconCheck size={16} /> Accept
                      </button>
                      <button
                        onClick={() => handleDecline(invite.id)}
                        disabled={isPending}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white text-red-500 font-bold rounded-lg border border-red-100 hover:bg-red-50 transition-colors disabled:opacity-50 text-sm"
                      >
                        <IconX size={16} /> Decline
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>

    </main>
  );
}
