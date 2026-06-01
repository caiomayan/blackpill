import { NextResponse } from "next/server";

import { authenticateWithSteam } from "@/lib/steam";
import { sanitizeReturnTo } from "@/lib/return-to";

export const runtime = "nodejs";

async function handleSteamStart(request: Request) {
  try {
    const returnTo = sanitizeReturnTo(
      new URL(request.url).searchParams.get("returnTo"),
    );
    const authUrl = await authenticateWithSteam(request, returnTo);
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("[auth][steam][start]", error);
    return NextResponse.redirect(
      new URL("/login?error=steam_start", request.url),
    );
  }
}

export async function GET(request: Request) {
  return handleSteamStart(request);
}

export async function POST(request: Request) {
  return handleSteamStart(request);
}
