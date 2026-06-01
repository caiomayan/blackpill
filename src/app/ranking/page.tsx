import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Ranking | Black Pill",
  description: "Global player ranking",
};

export const revalidate = 60; // Cache for 60 seconds

export default async function RankingPage() {
  const users = await prisma.user.findMany({
    include: {
      faceitProfile: true,
    },
  });

  const sortedUsers = users.sort((a, b) => {
    const eloA = a.faceitProfile?.elo || -1;
    const eloB = b.faceitProfile?.elo || -1;
    
    if (eloA !== eloB) {
      return eloB - eloA;
    }
    
    // Fallback to alphabetical sorting if elo is the same or both are null
    const nameA = a.username || a.steamPersonaName || a.steamId64;
    const nameB = b.username || b.steamPersonaName || b.steamId64;
    return nameA.localeCompare(nameB);
  });

  // Assign ranks
  let currentRank = 1;

  const rankedUsers = sortedUsers.map((user) => {
    const hasElo = user.faceitProfile?.elo != null;
    const rank = hasElo ? currentRank++ : null;

    return {
      user,
      rank,
      elo: user.faceitProfile?.elo ?? null,
      level: user.faceitProfile?.level ?? null,
    };
  });

  return (
    <main className="flex-1 w-full max-w-4xl mx-auto px-6 pt-12 pb-16">
      <div className="flex flex-col items-center mb-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-neutral-900 to-neutral-500 mb-4">
          Global Ranking
        </h1>
        <p className="text-neutral-500 font-medium max-w-xl">
          The best players competing for the top spot. Connect your Faceit account to appear on the leaderboard.
        </p>
      </div>

      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-[0_8px_40px_rgb(0,0,0,0.04)] border border-white animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b-2 border-neutral-100 text-sm font-extrabold text-neutral-400 uppercase tracking-widest">
                <th className="pb-4 px-4 w-20 text-center">Rank</th>
                <th className="pb-4 px-4">Player</th>
                <th className="pb-4 px-4 text-center">Faceit Level</th>
                <th className="pb-4 px-4 text-right">Elo</th>
              </tr>
            </thead>
            <tbody>
              {rankedUsers.map(({ user, rank, elo, level }) => (
                <tr 
                  key={user.id} 
                  className="border-b border-neutral-100/60 last:border-0 hover:bg-neutral-50/50 transition-colors group"
                >
                  <td className="py-4 px-4 text-center">
                    {rank === 1 ? (
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 text-white font-black shadow-sm">
                        1
                      </span>
                    ) : rank === 2 ? (
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-neutral-300 to-neutral-400 text-white font-black shadow-sm">
                        2
                      </span>
                    ) : rank === 3 ? (
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 text-white font-black shadow-sm">
                        3
                      </span>
                    ) : rank ? (
                      <span className="text-lg font-bold text-neutral-400">{rank}</span>
                    ) : (
                      <span className="text-lg font-bold text-neutral-300">-</span>
                    )}
                  </td>
                  
                  <td className="py-4 px-4">
                    <Link href={`/player/${user.steamId64}`} className="flex items-center gap-4 hover:opacity-80 transition-opacity w-fit">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-neutral-100 flex-shrink-0 border-2 border-transparent group-hover:border-neutral-200 transition-colors">
                        {user.steamAvatarUrl ? (
                          <Image src={user.steamAvatarUrl} alt="Avatar" width={48} height={48} className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-400 font-bold">?</div>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-extrabold text-neutral-900 text-lg leading-tight">
                          {user.username || user.steamPersonaName}
                        </span>
                        {user.systemRole === "ADMIN" && (
                          <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest mt-0.5">Admin</span>
                        )}
                      </div>
                    </Link>
                  </td>

                  <td className="py-4 px-4">
                    <div className="flex justify-center">
                      {level ? (
                        <Image src={`/faceit-level/level${level}.png`} alt={`Level ${level}`} width={36} height={36} />
                      ) : (
                        <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Unranked</span>
                      )}
                    </div>
                  </td>

                  <td className="py-4 px-4 text-right">
                    {elo ? (
                      <span className="text-xl font-extrabold text-neutral-900 font-mono tracking-tighter">
                        {elo}
                      </span>
                    ) : (
                      <span className="text-sm font-bold text-neutral-300">N/A</span>
                    )}
                  </td>
                </tr>
              ))}

              {rankedUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-neutral-500 font-medium">
                    No players found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
