import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUserFromCookies } from "@/lib/session";
import { canManageTeam } from "@/app/actions/team";
import TeamSettingsClient from "./team-settings-client";

export default async function TeamSettingsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const teamId = params.id;

  const currentUser = await getCurrentUserFromCookies();
  if (!currentUser) {
    redirect("/login");
  }

  const isAuthorized = await canManageTeam(teamId, currentUser.id, currentUser.systemRole);

  if (!isAuthorized) {
    redirect(`/teams/${teamId}`); // Redirect back to team page if not authorized
  }

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      members: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!team) {
    notFound();
  }

  return <TeamSettingsClient team={team} currentUser={currentUser} />;
}
