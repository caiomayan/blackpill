import { redirect } from "next/navigation";

import { OnboardingForm } from "@/components/onboarding-form";
import { getCurrentUserFromCookies } from "@/lib/session";
import { sanitizeReturnTo } from "@/lib/return-to";

export default async function OnboardingPage(props: {
  searchParams?: Promise<{ returnTo?: string }>;
}) {
  const searchParams = await props.searchParams;
  const user = await getCurrentUserFromCookies();
  const returnTo = sanitizeReturnTo(searchParams?.returnTo);

  if (!user) {
    redirect("/login");
  }

  if (user.onboardingCompleted) {
    redirect(returnTo);
  }

  return (
    <main className="fixed inset-0 flex items-center justify-center px-6">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-border bg-background p-8">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
            First access
          </p>
          <h1 className="text-2xl font-semibold text-black">
            Complete your profile
          </h1>
          <p className="text-sm text-muted-foreground">
            Choose your username, email and role before using the platform.
          </p>
        </div>

        <OnboardingForm
          returnTo={returnTo}
          defaultValues={{
            username: user.username ?? user.steamPersonaName ?? "",
            email: user.email ?? "",
            inGameRoles: user.inGameRoles || [],
          }}
        />
      </div>
    </main>
  );
}
