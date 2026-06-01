import openid from "openid";

import { prisma } from "@/lib/prisma";
import { sanitizeReturnTo } from "@/lib/return-to";

const STEAM_OPENID_IDENTIFIER = "https://steamcommunity.com/openid";

function getRequestOrigin(request: Request) {
  const url = new URL(request.url);
  return url.origin;
}

function createSteamRelyingParty(request: Request, returnTo: string) {
  const origin = getRequestOrigin(request);
  const callbackUrl = new URL(`${origin}/api/auth/steam/callback`);

  callbackUrl.searchParams.set("returnTo", returnTo);

  return new openid.RelyingParty(
    callbackUrl.toString(),
    origin,
    true,
    false,
    [],
  );
}

export function authenticateWithSteam(
  request: Request,
  returnTo?: string | null,
) {
  const relyingParty = createSteamRelyingParty(
    request,
    sanitizeReturnTo(returnTo),
  );

  return new Promise<string>((resolve, reject) => {
    relyingParty.authenticate(
      STEAM_OPENID_IDENTIFIER,
      false,
      (error, authUrl) => {
        if (error) {
          reject(error);
          return;
        }

        if (!authUrl) {
          reject(new Error("Steam did not return an authentication URL."));
          return;
        }

        resolve(authUrl);
      },
    );
  });
}

export function verifySteamAssertion(request: Request) {
  const returnTo = sanitizeReturnTo(
    new URL(request.url).searchParams.get("returnTo"),
  );
  const relyingParty = createSteamRelyingParty(request, returnTo);

  return new Promise<string>((resolve, reject) => {
    relyingParty.verifyAssertion(request.url, (error, result) => {
      if (error) {
        reject(error);
        return;
      }

      if (!result?.authenticated || !result.claimedIdentifier) {
        reject(new Error("Steam authentication failed."));
        return;
      }

      const steamId64 = result.claimedIdentifier.split("/").pop();

      if (!steamId64) {
        reject(new Error("Steam ID was not returned by Steam."));
        return;
      }

      resolve(steamId64);
    });
  });
}

export async function fetchSteamProfile(steamId64: string) {
  const steamApiKey = process.env.STEAM_API_KEY;

  if (!steamApiKey) {
    return null;
  }

  const response = await fetch(
    `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${steamApiKey}&steamids=${steamId64}`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as {
    response?: {
      players?: Array<{ personaname?: string; avatarfull?: string }>;
    };
  };

  const player = data.response?.players?.[0];

  if (!player) {
    return null;
  }

  return {
    personaName: player.personaname ?? null,
    avatarUrl: player.avatarfull ?? null,
  };
}

export async function upsertSteamUser(steamId64: string) {
  const steamProfile = await fetchSteamProfile(steamId64);

  return prisma.user.upsert({
    where: { steamId64 },
    update: {
      hasAuthenticated: true,
      steamPersonaName: steamProfile?.personaName ?? undefined,
      steamAvatarUrl: steamProfile?.avatarUrl ?? undefined,
    },
    create: {
      steamId64,
      hasAuthenticated: true,
      steamPersonaName: steamProfile?.personaName ?? null,
      steamAvatarUrl: steamProfile?.avatarUrl ?? null,
      onboardingCompleted: false,
    },
  });
}

/**
 * Resolves a given input string to a SteamID64.
 * The input can be:
 * - A 17-digit SteamID64 directly.
 * - A Steam profile URL: https://steamcommunity.com/profiles/76561198...
 * - A Steam vanity URL: https://steamcommunity.com/id/vanityname
 */
export async function resolveSteamId(input: string): Promise<string | null> {
  const trimmed = input.trim();

  // If it's just a 17-digit number, assume it's already a SteamID64
  if (/^\d{17}$/.test(trimmed)) {
    return trimmed;
  }

  let vanityName = "";

  try {
    const url = new URL(trimmed);
    const pathParts = url.pathname.split("/").filter(Boolean);

    if (pathParts[0] === "profiles" && pathParts[1]) {
      // It's a profile URL, the second part is the SteamID64
      const possibleId = pathParts[1];
      if (/^\d{17}$/.test(possibleId)) {
        return possibleId;
      }
      return null; // Invalid profiles format
    } else if (pathParts[0] === "id" && pathParts[1]) {
      // It's a vanity URL, we need to resolve it
      vanityName = pathParts[1];
    } else {
      return null; // Unknown URL structure
    }
  } catch (e) {
    // Not a valid URL, and not a 17-digit number.
    // It might just be the vanity name itself (e.g. user typed 'henryzinkk')
    // We will try to resolve it as a vanity URL as a fallback.
    vanityName = trimmed;
  }

  if (vanityName) {
    const steamApiKey = process.env.STEAM_API_KEY;
    if (!steamApiKey) {
      console.warn("STEAM_API_KEY not set. Cannot resolve vanity URL.");
      return null;
    }

    const response = await fetch(
      `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${steamApiKey}&vanityurl=${encodeURIComponent(vanityName)}`,
      { cache: "no-store" }
    );

    if (!response.ok) return null;

    const data = await response.json() as {
      response?: { success?: number; steamid?: string; message?: string };
    };

    if (data.response?.success === 1 && data.response?.steamid) {
      return data.response.steamid;
    }
  }

  return null;
}
