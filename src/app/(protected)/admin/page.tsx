import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { IconUsers, IconShield, IconBuildingCommunity, IconPlus } from "@tabler/icons-react";
import DeleteUserButton from "./delete-user-button";

export const metadata = {
  title: "Admin Console | Black Pill",
};

export default async function AdminDashboardPage() {
  const [usersCount, teamsCount, recentUsers, recentTeams] = await Promise.all([
    prisma.user.count(),
    prisma.team.count(),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        steamId64: true,
        username: true,
        steamPersonaName: true,
        steamAvatarUrl: true,
        systemRole: true,
        createdAt: true,
      },
    }),
    prisma.team.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        members: true,
      },
    }),
  ]);

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Top Action Bar */}
      <div className="flex justify-end">
        <Link
          href="/admin/players/create"
          className="flex items-center gap-2 px-5 py-2.5 bg-black text-white font-bold rounded-xl hover:bg-neutral-800 transition-colors shadow-sm"
        >
          <IconPlus size={18} stroke={2.5} />
          <span>Create Unauthenticated Profile</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/60 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-neutral-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center shrink-0">
            <IconUsers size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider">Total Users</p>
            <p className="text-3xl font-extrabold">{usersCount}</p>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-neutral-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center shrink-0">
            <IconBuildingCommunity size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider">Total Teams</p>
            <p className="text-3xl font-extrabold">{teamsCount}</p>
          </div>
        </div>

        <div className="bg-red-50/60 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-red-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-red-600 text-white rounded-full flex items-center justify-center shrink-0">
            <IconShield size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-red-500 uppercase tracking-wider">System Status</p>
            <p className="text-3xl font-extrabold text-red-600">Online</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Recent Users Table */}
        <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-sm border border-neutral-100 flex flex-col">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <IconUsers size={20} className="text-neutral-500" />
            Recent Users
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 text-sm text-neutral-500">
                  <th className="pb-3 font-bold px-2">User</th>
                  <th className="pb-3 font-bold px-2">Role</th>
                  <th className="pb-3 font-bold px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((user) => (
                  <tr key={user.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/50 transition-colors">
                    <td className="py-4 px-2">
                      <div className="flex items-center gap-3">
                        {user.steamAvatarUrl ? (
                          <Image
                            src={user.steamAvatarUrl}
                            alt="Avatar"
                            width={32}
                            height={32}
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center font-bold text-neutral-500 text-xs">
                            ?
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="font-bold text-sm leading-tight">{user.username || user.steamPersonaName}</span>
                          <span className="text-[10px] text-neutral-500 font-medium font-mono truncate max-w-[120px]">{user.steamId64}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold tracking-widest ${
                        user.systemRole === "ADMIN" 
                          ? "bg-red-100 text-red-700" 
                          : user.systemRole === "MODERATOR"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-neutral-100 text-neutral-700"
                      }`}>
                        {user.systemRole}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <DeleteUserButton userId={user.id} username={user.username || user.steamPersonaName || user.steamId64} />
                        <Link 
                          href={`/player/${user.steamId64}`}
                          className="text-xs font-bold text-neutral-500 hover:text-black transition-colors px-3 py-1.5 bg-white border border-neutral-200 rounded-lg shadow-sm"
                        >
                          Profile
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
                {recentUsers.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-neutral-500 font-medium text-sm">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Teams Table */}
        <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-sm border border-neutral-100 flex flex-col">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <IconBuildingCommunity size={20} className="text-neutral-500" />
            Recent Teams
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 text-sm text-neutral-500">
                  <th className="pb-3 font-bold px-2">Team</th>
                  <th className="pb-3 font-bold px-2 text-center">Members</th>
                  <th className="pb-3 font-bold px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentTeams.map((team) => (
                  <tr key={team.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/50 transition-colors">
                    <td className="py-4 px-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {team.avatarUrl ? (
                            <img src={team.avatarUrl} alt={team.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-black text-neutral-300 text-xs">
                              {team.tag || team.name.substring(0, 3).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm leading-tight">{team.name}</span>
                          <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">{team.tag || "NO TAG"}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-2 text-center text-sm font-bold text-neutral-600">
                      {team.members.length}
                    </td>
                    <td className="py-4 px-2 text-right">
                      <Link 
                        href={`/teams/${team.id}/settings`}
                        className="text-xs font-bold text-neutral-500 hover:text-black transition-colors px-3 py-1.5 bg-white border border-neutral-200 rounded-lg shadow-sm"
                      >
                        Settings
                      </Link>
                    </td>
                  </tr>
                ))}
                {recentTeams.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-neutral-500 font-medium text-sm">
                      No teams found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}
