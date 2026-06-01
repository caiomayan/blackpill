"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireOnboardedUser } from "@/lib/session";
import { InGameRole } from "@prisma/client";

export async function updateProfile(data: {
  username?: string;
  bio?: string;
  location?: string;
  xUrl?: string;
  instagramUrl?: string;
  hltvUrl?: string;
  youtubeUrl?: string;
  bannerUrl?: string;
  inGameRoles?: InGameRole[];
}) {
  const currentUser = await requireOnboardedUser();

  try {
    // Basic validation
    if (data.username && data.username.length < 3) {
      return { error: "Username must be at least 3 characters long." };
    }
    if (data.inGameRoles && data.inGameRoles.length > 3) {
      return { error: "You can select up to 3 In-Game Roles maximum." };
    }

    await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        username: data.username,
        bio: data.bio,
        location: data.location,
        xUrl: data.xUrl,
        instagramUrl: data.instagramUrl,
        hltvUrl: data.hltvUrl,
        youtubeUrl: data.youtubeUrl,
        bannerUrl: data.bannerUrl,
        inGameRoles: data.inGameRoles,
      },
    });

    revalidatePath("/settings/profile");
    revalidatePath(`/player/${currentUser.steamId64}`);

    return { success: true };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { error: "An unexpected error occurred while updating the profile." };
  }
}

export async function revalidateProfile(steamId64: string) {
  try {
    const { revalidateTag, revalidatePath } = await import("next/cache");
    revalidateTag(`inventory-${steamId64}`, "max");
    revalidateTag(`faceit-${steamId64}`, "max");
    revalidatePath(`/player/${steamId64}`);
    return { success: true };
  } catch (error) {
    console.error("Error revalidating profile:", error);
    return { error: "Failed to refresh profile data." };
  }
}
