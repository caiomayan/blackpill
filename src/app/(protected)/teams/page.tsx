import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireOnboardedUser } from "@/lib/session";
import TeamsHubClient from "./teams-hub-client";

export default async function TeamsHubPage() {
  const currentUser = await requireOnboardedUser();

  const [myTeams, invitations] = await Promise.all([
    prisma.userTeam.findMany({
      where: { userId: currentUser.id },
      include: {
        team: true,
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.teamInvitation.findMany({
      where: { userId: currentUser.id },
      include: {
        team: true,
        inviter: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return <TeamsHubClient myTeams={myTeams} invitations={invitations} />;
}
