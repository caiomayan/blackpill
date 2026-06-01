"use server";

import { prisma } from "@/lib/prisma";

export async function searchGlobal(query: string) {
  if (!query || query.trim() === "") {
    return { players: [], teams: [] };
  }

  const cleanQuery = query.trim();

  try {
    const players = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: cleanQuery, mode: "insensitive" } },
          { steamPersonaName: { contains: cleanQuery, mode: "insensitive" } },
        ],
      },
      select: {
        steamId64: true,
        username: true,
        steamPersonaName: true,
        steamAvatarUrl: true,
      },
      take: 5,
    });

    const teams = await prisma.team.findMany({
      where: {
        OR: [
          { name: { contains: cleanQuery, mode: "insensitive" } },
          { tag: { contains: cleanQuery, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        tag: true,
        avatarUrl: true,
      },
      take: 5,
    });

    return { players, teams };
  } catch (error) {
    console.error("Search failed:", error);
    return { players: [], teams: [] };
  }
}
