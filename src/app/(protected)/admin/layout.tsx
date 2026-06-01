import { requireOnboardedUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { SystemRole } from "@prisma/client";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await requireOnboardedUser();

  if (currentUser.systemRole !== SystemRole.ADMIN) {
    redirect("/"); // If not an admin, boot them to home.
  }

  return (
    <div className="flex-1 w-full max-w-[1400px] mx-auto px-6 pt-10 pb-16 min-h-[calc(100vh-130px)]">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-red-600">Admin Console</h1>
        <p className="text-neutral-500 font-medium mt-1">
          System overview and moderation tools.
        </p>
      </div>
      
      {children}
    </div>
  );
}
