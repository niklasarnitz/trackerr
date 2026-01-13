import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { SettingsContent } from "~/components/settings-content";

export default async function SettingsPage() {
  const session = await auth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="heading-lg mb-2">Settings</h1>
        <p className="text-muted-foreground body-md">
          Manage your account settings and preferences.
        </p>
      </div>

      <SettingsContent user={session!.user} />
    </div>
  );
}
