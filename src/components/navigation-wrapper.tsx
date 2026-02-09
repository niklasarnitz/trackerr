import { Navigation } from "~/components/navigation";
import { auth } from "~/server/auth";

export async function NavigationWrapper() {
  const session = await auth();

  return <Navigation user={session?.user} />;
}
