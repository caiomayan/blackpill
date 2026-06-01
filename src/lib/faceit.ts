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
        next: { revalidate: 3600, tags: [`faceit-${steamId64}`] },
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
    let advancedStats = null;
    if (data.player_id) {
      try {
        const statsRes = await fetch(
          `https://open.faceit.com/data/v4/players/${data.player_id}/stats/cs2`,
          {
            headers: {
              Authorization: `Bearer ${process.env.FACEIT_API_KEY}`,
            },
            next: { revalidate: 3600, tags: [`faceit-${steamId64}`] },
          }
        );
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          if (statsData.lifetime) {
            advancedStats = {
              kdRatio: statsData.lifetime["Average K/D Ratio"],
              winRate: statsData.lifetime["Win Rate %"],
              hsPercentage: statsData.lifetime["Average Headshots %"],
              recentResults: statsData.lifetime["Recent Results"] || [],
              matches: statsData.lifetime["Matches"],
            };
          }
        }
      } catch (e) {
        console.error("Failed to fetch advanced stats", e);
      }
    }

    return {
      nickname: data.nickname,
      cs2: data.games?.cs2 || null,
      advancedStats,
    };
  } catch (error) {
    console.error(`[Faceit] Failed to sync data for user ${userId}`, error);
    return null;
  }
}
