import { auth } from "~/server/auth";
import { AppNavigation } from "./app-navigation";

export async function NavigationWrapper() {
  const session = await auth();

  return <AppNavigation user={session?.user} />;
}
