import { prisma } from "@/lib/prisma";
import "dotenv/config";

export async function syncUserFaceit(steamId64: string, userId: string) {
  try {
    const res = await fetch(
      `https://open.faceit.com/data/v4/players?game=cs2&game_player_id=${steamId64}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.FACEIT_API_KEY}`,
        },
        next: { revalidate: 3600 },
      },
    );
    if (!res.ok) return null;
    const data = await res.json();

    if (data.games?.cs2 && data.player_id) {
      await prisma.faceitProfile.upsert({
        where: { userId },
        update: {
          faceitId: data.player_id,
          nickname: data.nickname,
          level: data.games.cs2.skill_level,
          elo: data.games.cs2.faceit_elo,
          avatarUrl: data.avatar || null,
        },
        create: {
          userId,
          faceitId: data.player_id,
          nickname: data.nickname,
          level: data.games.cs2.skill_level,
          elo: data.games.cs2.faceit_elo,
          avatarUrl: data.avatar || null,
        },
      });
    }

    return {
      nickname: data.nickname,
      cs2: data.games?.cs2 || null,
    };
  } catch (error) {
    console.error(`[Faceit] Failed to sync data for user ${userId}`, error);
    return null;
  }
}
