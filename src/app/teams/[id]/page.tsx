import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUserFromCookies } from "@/lib/session";
import { canManageTeam } from "@/app/actions/team";
import { IconSettings } from "@tabler/icons-react";

async function getTeamData(teamId: string) {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      members: {
        include: {
          user: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!team) {
    return null;
  }

  return team;
}

export default async function TeamPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const teamId = params.id;
  const team = await getTeamData(teamId);
  const currentUser = await getCurrentUserFromCookies();

  if (!team) {
    notFound();
  }

  const isManager = currentUser 
    ? await canManageTeam(team.id, currentUser.id, currentUser.systemRole)
    : false;

  const roleIconMap: Record<string, string> = {
    RIFLER: "/role/icon-rifler.svg",
    AWPER: "/role/icon-awper.svg",
    ENTRY: "/role/icon-entry_fragger.svg",
    SUPPORT: "/role/icon-rifler.svg",
    LURKER: "/role/icon-rifler.svg",
    IGL: "/role/icon-igl.svg",
    COACH: "/role/icon-coach.svg",
  };

  return (
    <main className="flex-1 w-full max-w-[1200px] mx-auto px-6 relative flex flex-col pt-6 md:pt-8 min-h-[calc(100vh-130px)] pb-16">
      
      {/* Team Header / Card */}
      <div className="w-full bg-white/70 backdrop-blur-2xl rounded-3xl overflow-hidden shadow-[0_8px_40px_rgb(0,0,0,0.05)] border border-white mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500 py-12 px-6 md:px-12 flex flex-col items-center text-center">
        
        <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-[2rem] border-4 border-white shadow-[0_4px_20px_rgb(0,0,0,0.1)] bg-neutral-100 shrink-0 mb-6 flex items-center justify-center overflow-hidden rotate-3 hover:rotate-0 transition-transform duration-500 ease-out">
          {team.avatarUrl ? (
            <Image 
              src={team.avatarUrl} 
              alt={team.name} 
              fill 
              className="object-cover"
              sizes="160px"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#fff000] to-[#ffcc00]">
              <span className="text-black font-black text-4xl">{team.tag?.substring(0, 2) || team.name.substring(0, 2)}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col items-center gap-3 max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-neutral-900 to-neutral-500 tracking-tighter leading-none">
              {team.name}
            </h1>
            {isManager && (
              <Link href={`/teams/${team.id}/settings`} className="ml-1 p-2 bg-neutral-100 hover:bg-neutral-200 rounded-full transition-colors text-neutral-600 hover:text-neutral-900" title="Manage Team">
                <IconSettings size={22} stroke={2.5} />
              </Link>
            )}
          </div>
          
          {team.tag && (
            <span className="bg-black text-white px-3 py-1 rounded-lg text-sm font-bold tracking-widest uppercase shadow-sm">
              {team.tag}
            </span>
          )}
          
          <p className="text-neutral-500 font-medium mt-2 text-base md:text-lg">
            {team.description || "No description provided."}
          </p>

          <div className="mt-6 text-center px-6 py-2 bg-neutral-50 rounded-2xl border border-neutral-100 inline-block">
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-0.5">Active Roster</p>
            <p className="text-xl font-extrabold text-neutral-900">{team.members.length} Members</p>
          </div>
        </div>
      </div>

      {/* Roster Section */}
      <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
        <h2 className="text-2xl font-extrabold tracking-tight mb-6">Active Roster</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {team.members.map((member) => {
            const user = member.user;
            
            const displayRole = member.inGameRole || user.inGameRoles?.[0] || null;
            const roleIconPath = displayRole ? roleIconMap[displayRole] : null;

            return (
              <Link 
                href={`/player/${user.steamId64}`} 
                key={member.id}
                className="bg-white/60 backdrop-blur-md border border-white p-5 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:bg-white transition-all group flex flex-col items-center text-center"
              >
                <div className="relative w-20 h-20 rounded-full overflow-hidden mb-4 border-2 border-transparent group-hover:border-neutral-200 transition-colors">
                  <Image 
                    src={user.steamAvatarUrl ?? "/blackpill.png"} 
                    alt={user.username ?? "Player"} 
                    fill 
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
                
                <h3 className="font-bold text-neutral-900 text-lg mb-1 group-hover:text-black">
                  {user.username ?? user.steamPersonaName}
                </h3>
                
                <div className="flex items-center gap-1.5 mb-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest ${
                    member.memberRole === "OWNER" ? "bg-red-50 text-red-600" :
                    member.memberRole === "CAPTAIN" ? "bg-blue-50 text-blue-600" :
                    "bg-neutral-100 text-neutral-500"
                  }`}>
                    {member.memberRole}
                  </span>
                </div>

                {roleIconPath && (
                  <div className="flex items-center gap-1.5 mt-auto pt-4 border-t border-neutral-100/60 w-full justify-center">
                    <Image src={roleIconPath} alt={displayRole as string} width={18} height={18} className="opacity-70" title={displayRole as string} />
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{displayRole}</span>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>

    </main>
  );
}
