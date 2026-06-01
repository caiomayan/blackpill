import { NextResponse } from "next/server";

import { createSessionForUser, setSessionCookie } from "@/lib/session";
import { upsertSteamUser, verifySteamAssertion } from "@/lib/steam";
import { sanitizeReturnTo } from "@/lib/return-to";
import { syncUserFaceit } from "@/lib/faceit";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const returnTo = sanitizeReturnTo(
      new URL(request.url).searchParams.get("returnTo"),
    );
    const steamId64 = await verifySteamAssertion(request);
    const user = await upsertSteamUser(steamId64);
    const { token, expiresAt } = await createSessionForUser(user.id);
    
    // Sync Faceit in the background (we await it but it's fast enough)
    await syncUserFaceit(steamId64, user.id);

    const destination = user.onboardingCompleted
      ? returnTo
      : `/onboarding?returnTo=${encodeURIComponent(returnTo)}`;
    const response = NextResponse.redirect(new URL(destination, request.url));

    return setSessionCookie(response, token, expiresAt);
  } catch (error) {
    console.error("[auth][steam][callback]", error);
    return NextResponse.redirect(
      new URL("/login?error=steam_callback", request.url),
    );
  }
}
