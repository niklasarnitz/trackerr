"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

interface RegistrationFieldProps {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  error?: string[];
  required?: boolean;
}

export function RegistrationField({
  name,
  label,
  type = "text",
  placeholder,
  error,
  required = true,
}: RegistrationFieldProps) {
  const [isVisible, setIsVisible] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (isVisible ? "text" : "password") : type;

  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="label">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <div className="relative">
        <Input
          id={name}
          name={name}
          type={inputType}
          placeholder={placeholder}
          required={required}
          className={cn(
            error ? "border-destructive" : "",
            isPassword ? "pr-10" : "",
          )}
        />
        {isPassword && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground absolute right-0 top-0 h-full w-9 hover:bg-transparent"
            onClick={() => setIsVisible(!isVisible)}
            aria-label={isVisible ? "Hide password" : "Show password"}
          >
            {isVisible ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
      {error && <p className="body-xs text-destructive">{error[0]}</p>}
    </div>
  );
}
