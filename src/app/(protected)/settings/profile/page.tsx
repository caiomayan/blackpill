import { requireOnboardedUser } from "@/lib/session";
import { ProfileForm } from "./profile-form";

export const metadata = {
  title: "Profile Settings | Black Pill",
};

export default async function SettingsProfilePage() {
  const user = await requireOnboardedUser();

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Public Profile</h1>
        <p className="text-neutral-500 mt-1">
          This is how others will see you on the site.
        </p>
      </div>

      <div className="w-full bg-white/70 backdrop-blur-2xl rounded-[2rem] p-6 md:p-10 shadow-[0_8px_40px_rgb(0,0,0,0.05)] border border-white">
        <ProfileForm initialData={user} />
      </div>
    </div>
  );
}
