"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireOnboardedUser } from "@/lib/session";
import { canManageTeam } from "@/app/actions/team";
import { resolveSteamId } from "@/lib/steam";

export async function inviteUserToTeam(teamId: string, identifier: string) {
  const currentUser = await requireOnboardedUser();

  const isAuthorized = await canManageTeam(teamId, currentUser.id, currentUser.systemRole);
  if (!isAuthorized) {
    return { error: "Unauthorized. You cannot invite users to this team." };
  }

  const resolvedSteamId = await resolveSteamId(identifier);

  // Find user by steamId64 or username
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

  // Check if user is already in the team
  const existingMember = await prisma.userTeam.findUnique({
    where: { userId_teamId: { userId: targetUser.id, teamId } },
  });

  if (existingMember) {
    return { error: "User is already in the team." };
  }

  // Check if invitation already exists
  const existingInvitation = await prisma.teamInvitation.findUnique({
    where: { teamId_userId: { teamId, userId: targetUser.id } },
  });

  if (existingInvitation) {
    return { error: "An invitation is already pending for this user." };
  }

  try {
    await prisma.teamInvitation.create({
      data: {
        teamId,
        userId: targetUser.id,
        inviterId: currentUser.id,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error creating invitation:", error);
    return { error: "An unexpected error occurred." };
  }
}

export async function acceptInvitation(invitationId: string) {
  const currentUser = await requireOnboardedUser();

  const invitation = await prisma.teamInvitation.findUnique({
    where: { id: invitationId },
  });

  if (!invitation) {
    return { error: "Invitation not found." };
  }

  if (invitation.userId !== currentUser.id) {
    return { error: "Unauthorized." };
  }

  try {
    // Transaction to delete invite and add member
    await prisma.$transaction([
      prisma.userTeam.create({
        data: {
          userId: currentUser.id,
          teamId: invitation.teamId,
          memberRole: "PLAYER",
          inGameRole: currentUser.inGameRoles?.[0] || null,
        },
      }),
      prisma.teamInvitation.delete({
        where: { id: invitationId },
      }),
    ]);

    revalidatePath("/settings/invitations");
    revalidatePath(`/teams/${invitation.teamId}`);
    return { success: true };
  } catch (error) {
    console.error("Error accepting invitation:", error);
    return { error: "An unexpected error occurred." };
  }
}

export async function declineInvitation(invitationId: string) {
  const currentUser = await requireOnboardedUser();

  const invitation = await prisma.teamInvitation.findUnique({
    where: { id: invitationId },
  });

  if (!invitation) {
    return { error: "Invitation not found." };
  }

  if (invitation.userId !== currentUser.id) {
    return { error: "Unauthorized." };
  }

  try {
    await prisma.teamInvitation.delete({
      where: { id: invitationId },
    });

    revalidatePath("/settings/invitations");
    return { success: true };
  } catch (error) {
    console.error("Error declining invitation:", error);
    return { error: "An unexpected error occurred." };
  }
}
