"use server";

import { signIn } from "~/server/auth";
import { api } from "~/trpc/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { TRPCError } from "@trpc/server";

export interface RegistrationFormState {
  success?: boolean;
  message?: string;
  fieldErrors?: {
    username?: string[];
    email?: string[];
    password?: string[];
    name?: string[];
  };
}

export async function registerUserAction(
  _prevState: RegistrationFormState,
  formData: FormData,
): Promise<RegistrationFormState> {
  try {
    const registrationData = {
      username: formData.get("username") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      name: formData.get("name") as string,
    };

    // Call TRPC mutation
    await api.auth.register(registrationData);

    // Auto sign-in after successful registration
    const signInResult = (await signIn("credentials", {
      username: registrationData.username,
      password: registrationData.password,
      redirect: false,
    })) as { error?: string } | undefined;

    if (signInResult?.error) {
      return {
        success: true,
        message: "Registration successful! Please sign in manually.",
      };
    }

    revalidatePath("/");
    redirect("/");
  } catch (error: unknown) {
    if (error instanceof TRPCError) {
      return {
        message: error.message,
      };
    }

    const message =
      error instanceof Error
        ? error.message
        : "Registration failed. Please try again.";
    return { message };
  }
}
