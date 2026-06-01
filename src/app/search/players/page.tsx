import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { IconSearch } from "@tabler/icons-react";

export const metadata = {
  title: "Players | Black Pill",
  description: "Directory of all registered players.",
};

export default async function PlayersDirectoryPage(props: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;
  const query = searchParams.q || "";
  const take = 20;
  const skip = (page - 1) * take;

  const where = query
    ? {
        OR: [
          { username: { contains: query, mode: "insensitive" as const } },
          { steamPersonaName: { contains: query, mode: "insensitive" as const } },
          { steamId64: { contains: query } },
        ],
      }
    : {};

  const [players, totalCount] = await Promise.all([
    prisma.user.findMany({
      where,
      take,
      skip,
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / take);

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-16">
      <div className="flex flex-col items-center mb-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-neutral-900 to-neutral-500 mb-4">
          Players Directory
        </h1>
        <p className="text-neutral-500 font-medium max-w-xl">
          Browse all registered players on Black Pill.
        </p>
      </div>

      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-[0_8px_40px_rgb(0,0,0,0.04)] border border-white animate-in fade-in slide-in-from-bottom-8 duration-700">
        <form className="mb-8 max-w-md mx-auto relative">
          <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 size-5" />
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search by name or SteamID64..."
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-neutral-100/50 border-transparent focus:bg-white focus:border-neutral-300 focus:ring-4 focus:ring-neutral-100 transition-all font-medium"
          />
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {players.map((player) => (
            <Link
              key={player.id}
              href={`/player/${player.steamId64}`}
              className="flex items-center gap-4 p-4 rounded-2xl border border-neutral-100 hover:border-neutral-300 hover:shadow-md transition-all group bg-white"
            >
              <Image
                src={player.steamAvatarUrl ?? "/blackpill.png"}
                alt={player.username ?? "Player"}
                width={48}
                height={48}
                className="rounded-full object-cover shadow-sm group-hover:scale-105 transition-transform"
                style={{ width: "auto", height: "auto" }}
              />
              <div className="flex flex-col">
                <span className="font-bold text-neutral-800 truncate">
                  {player.username ?? player.steamPersonaName}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {players.length === 0 && (
          <div className="text-center py-12 text-neutral-500 font-medium">
            No players found.
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            {page > 1 && (
              <Link
                href={`/search/players?page=${page - 1}${query ? `&q=${query}` : ""}`}
                className="px-4 py-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-sm font-bold text-neutral-700 transition-colors"
              >
                Previous
              </Link>
            )}
            <span className="px-4 py-2 text-sm font-medium text-neutral-500">
              Page {page} of {totalPages}
            </span>
            {page < totalPages && (
              <Link
                href={`/search/players?page=${page + 1}${query ? `&q=${query}` : ""}`}
                className="px-4 py-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-sm font-bold text-neutral-700 transition-colors"
              >
                Next
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
