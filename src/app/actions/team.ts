"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireOnboardedUser } from "@/lib/session";
import { SystemRole, InGameRole, TeamMemberRole } from "@prisma/client";
import { resolveSteamId } from "@/lib/steam";

export async function createTeam(data: { name: string; tag: string }) {
  const currentUser = await requireOnboardedUser();

  if (!data.name || data.name.trim() === "") {
    return { error: "Team name is required." };
  }

  try {
    const team = await prisma.team.create({
      data: {
        name: data.name,
        tag: data.tag.toUpperCase() || null,
        members: {
          create: {
            userId: currentUser.id,
            memberRole: "OWNER",
            inGameRole: currentUser.inGameRoles?.[0] || null,
          },
        },
      },
    });

    revalidatePath("/teams");
    return { success: true, team };
  } catch (error) {
    console.error("Error creating team:", error);
    return { error: "An unexpected error occurred while creating the team." };
  }
}

export async function updateTeam(
  teamId: string,
  data: { name?: string; tag?: string; description?: string; avatarUrl?: string }
) {
  const currentUser = await requireOnboardedUser();

  const isAuthorized = await canManageTeam(teamId, currentUser.id, currentUser.systemRole);
  if (!isAuthorized) {
    return { error: "Unauthorized. You do not have permission to manage this team." };
  }

  try {
    const team = await prisma.team.update({
      where: { id: teamId },
      data: {
        name: data.name || undefined,
        tag: data.tag ? data.tag.toUpperCase() : undefined,
        description: data.description,
        avatarUrl: data.avatarUrl || null,
      },
    });

    revalidatePath(`/teams/${teamId}`);
    return { success: true, team };
  } catch (error) {
    console.error("Error updating team:", error);
    return { error: "An unexpected error occurred while updating the team." };
  }
}

export async function kickMember(teamId: string, userId: string) {
  const currentUser = await requireOnboardedUser();

  const isAuthorized = await canManageTeam(teamId, currentUser.id, currentUser.systemRole);
  if (!isAuthorized) {
    return { error: "Unauthorized." };
  }

  // Prevent kicking the owner
  const targetMember = await prisma.userTeam.findUnique({
    where: { userId_teamId: { userId, teamId } },
  });

  if (!targetMember) {
    return { error: "User is not in the team." };
  }

  if (targetMember.memberRole === "OWNER") {
    return { error: "You cannot kick the owner of the team." };
  }

  try {
    await prisma.userTeam.delete({
      where: { userId_teamId: { userId, teamId } },
    });

    revalidatePath(`/teams/${teamId}`);
    return { success: true };
  } catch (error) {
    console.error("Error kicking member:", error);
    return { error: "An unexpected error occurred." };
  }
}

export async function canManageTeam(teamId: string, userId: string, systemRole: string) {
  if (systemRole === SystemRole.ADMIN) {
    return true;
  }

  const userTeam = await prisma.userTeam.findUnique({
    where: { userId_teamId: { userId, teamId } },
  });

  return userTeam?.memberRole === "OWNER";
}

export async function forceAddMember(teamId: string, identifier: string) {
  const currentUser = await requireOnboardedUser();

  if (currentUser.systemRole !== SystemRole.ADMIN) {
    return { error: "Unauthorized. Only admins can force-add members." };
  }

  const resolvedSteamId = await resolveSteamId(identifier);

  const targetUser = await prisma.user.findFirst({
    where: {
      OR: [
        { steamId64: resolvedSteamId || identifier },
        { username: { equals: identifier, mode: 'insensitive' } },
      ],
    },
  });

  if (!targetUser) {
    return { error: "User not found." };
  }

  const existingMember = await prisma.userTeam.findUnique({
    where: { userId_teamId: { userId: targetUser.id, teamId } },
  });

  if (existingMember) {
    return { error: "User is already in the team." };
  }

  try {
    await prisma.userTeam.create({
      data: {
        userId: targetUser.id,
        teamId,
        memberRole: "PLAYER",
        inGameRole: targetUser.inGameRoles?.[0] || null,
      },
    });

    // Remova qualquer invite pendente que o user pudesse ter para esse time
    await prisma.teamInvitation.deleteMany({
      where: { userId: targetUser.id, teamId },
    });

    revalidatePath(`/teams/${teamId}`);
    return { success: true };
  } catch (error) {
    console.error("Error force adding member:", error);
    return { error: "An unexpected error occurred." };
  }
}

export async function deleteTeam(teamId: string) {
  const currentUser = await requireOnboardedUser();

  const isAuthorized = await canManageTeam(teamId, currentUser.id, currentUser.systemRole);
  if (!isAuthorized) {
    return { error: "Unauthorized. You cannot delete this team." };
  }

  try {
    await prisma.team.delete({
      where: { id: teamId },
    });

    revalidatePath("/teams");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error deleting team:", error);
    return { error: "An unexpected error occurred while deleting the team." };
  }
}

export async function updateMemberRole(
  teamId: string, 
  userId: string, 
  inGameRole: InGameRole | null
) {
  const currentUser = await requireOnboardedUser();

  const isAuthorized = await canManageTeam(teamId, currentUser.id, currentUser.systemRole);
  if (!isAuthorized) {
    return { error: "Unauthorized." };
  }

  try {
    await prisma.userTeam.update({
      where: { userId_teamId: { userId, teamId } },
      data: {
        inGameRole,
      },
    });

    revalidatePath(`/teams/${teamId}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating member role:", error);
    return { error: "An unexpected error occurred." };
  }
}
