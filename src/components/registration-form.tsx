"use client";

import { useActionState } from "react";
import { Button } from "~/components/ui/button";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";
import {
  registerUserAction,
  type RegistrationFormState,
} from "../app/register/actions";
import { RegistrationField } from "./registration-field";

const initialState: RegistrationFormState = {};

export function RegistrationForm() {
  const [state, formAction, isPending] = useActionState(
    registerUserAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-6">
      {state.message && (
        <Alert variant={state.success ? "default" : "destructive"}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <RegistrationField
          name="username"
          label="Username"
          placeholder="Enter your username"
          error={state.fieldErrors?.username}
        />

        <RegistrationField
          name="email"
          label="Email Address"
          type="email"
          placeholder="Enter your email"
          error={state.fieldErrors?.email}
        />

        <RegistrationField
          name="name"
          label="Full Name"
          placeholder="Enter your full name"
          error={state.fieldErrors?.name}
        />

        <RegistrationField
          name="password"
          label="Password"
          type="password"
          placeholder="Enter your password"
          error={state.fieldErrors?.password}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create Account
      </Button>
    </form>
  );
}
