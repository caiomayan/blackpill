import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { syncUserFaceit } from "@/lib/faceit";

export const runtime = "nodejs";

export async function GET(request: Request) {
  // Validate CRON secret if you want to secure it (optional but recommended for production)
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Only fetch users that have logged in or have a steamId64
    const users = await prisma.user.findMany({
      select: { id: true, steamId64: true }
    });

    console.log(`[Cron] Syncing Faceit for ${users.length} users...`);
    let synced = 0;

    for (const user of users) {
      const data = await syncUserFaceit(user.steamId64, user.id);
      if (data) synced++;
      
      // Add a tiny delay to respect Faceit rate limits (e.g. 200ms)
      await new Promise(r => setTimeout(r, 200));
    }

    return NextResponse.json({ success: true, totalUsers: users.length, syncedUsers: synced });
  } catch (error) {
    console.error("[Cron][SyncFaceit] Error:", error);
    return NextResponse.json({ error: "Failed to sync" }, { status: 500 });
  }
}
