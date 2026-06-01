"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireOnboardedUser } from "@/lib/session";
import { fetchSteamProfile, resolveSteamId } from "@/lib/steam";

export async function createUnauthenticatedProfile(data: {
  steamId64: string;
  username?: string;
}) {
  const currentUser = await requireOnboardedUser();

  if (currentUser.systemRole !== "ADMIN") {
    return { error: "Unauthorized. You must be an administrator to perform this action." };
  }

  if (!data.steamId64 || data.steamId64.trim() === "") {
    return { error: "SteamID64 is required." };
  }

  const resolvedSteamId = await resolveSteamId(data.steamId64);

  if (!resolvedSteamId) {
    return { error: "Invalid SteamID64 or Steam URL. Could not resolve the profile." };
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { steamId64: resolvedSteamId },
    });

    if (existingUser) {
      return { error: "A profile with this SteamID64 already exists." };
    }

    const steamProfile = await fetchSteamProfile(resolvedSteamId);

    const newUser = await prisma.user.create({
      data: {
        steamId64: resolvedSteamId,
        username: data.username && data.username.trim() !== "" ? data.username : null,
        steamPersonaName: steamProfile?.personaName ?? null,
        steamAvatarUrl: steamProfile?.avatarUrl ?? null,
        hasAuthenticated: false,
        onboardingCompleted: false,
      },
    });

    revalidatePath(`/player/${newUser.steamId64}`);

    return { success: true, user: newUser };
  } catch (error) {
    console.error("Error creating unauthenticated profile:", error);
    return { error: "An unexpected error occurred while creating the profile." };
  }
}

export async function deleteUser(userId: string) {
  const currentUser = await requireOnboardedUser();

  if (currentUser.systemRole !== "ADMIN") {
    return { error: "Unauthorized. You must be an administrator to perform this action." };
  }

  // Prevent self-deletion via this admin endpoint to be safe
  if (currentUser.id === userId) {
    return { error: "You cannot delete your own admin account." };
  }

  try {
    await prisma.user.delete({
      where: { id: userId },
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { error: "An unexpected error occurred while deleting the user." };
  }
}
