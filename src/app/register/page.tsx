import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { RegistrationForm } from "../../components/registration-form";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export default async function RegisterPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/");
  }

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center px-4">
      <div className="mx-auto w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="heading-lg">Create Account</CardTitle>
            <CardDescription className="body-md">
              Create a new account for Trackerr
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RegistrationForm />

            <div className="mt-6 text-center">
              <p className="body-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/signin"
                  className="text-primary font-medium hover:underline"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
