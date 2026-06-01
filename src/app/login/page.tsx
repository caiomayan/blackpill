import { redirect } from "next/navigation";

import { getCurrentUserFromCookies } from "@/lib/session";
import { sanitizeReturnTo } from "@/lib/return-to";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ returnTo?: string; error?: string }>;
}) {
  const user = await getCurrentUserFromCookies();
  const resolvedSearchParams = await searchParams;
  const returnTo = sanitizeReturnTo(resolvedSearchParams?.returnTo);

  if (user?.onboardingCompleted) {
    redirect(returnTo);
  }

  if (user && !user.onboardingCompleted) {
    redirect("/onboarding");
  }

  if (resolvedSearchParams?.error) {
    return (
      <main className="fixed inset-0 flex items-center justify-center px-6 bg-neutral-50">
        <div className="w-full max-w-md space-y-6 rounded-3xl border border-neutral-200 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">Authentication Failed</h1>
          <p className="text-neutral-500 text-sm">
            There was an issue communicating with Steam or saving your profile. Please try again.
          </p>
          <p className="text-xs text-neutral-400 mt-2">Error code: {resolvedSearchParams.error}</p>
          <a href="/api/auth/steam/start" className="inline-block mt-4 px-6 py-3 bg-black text-white rounded-xl font-bold hover:bg-neutral-800 transition-colors">
            Try Again
          </a>
        </div>
      </main>
    );
  }

  redirect(`/api/auth/steam/start?returnTo=${encodeURIComponent(returnTo)}`);
}
