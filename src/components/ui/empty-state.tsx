import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { FileX, AlertCircle } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  message?: string;
  children?: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function EmptyState({
  icon: Icon = FileX,
  title = "No data available",
  message,
  children,
  className = "",
  size = "md",
}: EmptyStateProps) {
  const sizeClasses = {
    sm: "h-32",
    md: "h-64",
    lg: "h-80",
  };

  const iconSizes = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div
      className={`text-muted-foreground flex ${sizeClasses[size]} flex-col items-center justify-center ${className}`}
    >
      <Icon className={`${iconSizes[size]} mb-2`} />
      <p className="font-medium">{title}</p>
      {message && <p className="mt-1 text-sm">{message}</p>}
      {children}
    </div>
  );
}

interface NoDataStateProps {
  entity: string;
  suggestion?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function NoDataState({
  entity,
  suggestion = "Try adjusting your filters or add some data.",
  className,
  size = "md",
}: NoDataStateProps) {
  return (
    <EmptyState
      title={`No ${entity} found`}
      message={suggestion}
      className={className}
      size={size}
    />
  );
}

interface ErrorState extends Omit<EmptyStateProps, "icon"> {
  error?: Error | string;
  retry?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  message,
  error,
  retry,
  className,
  size = "md",
}: ErrorState) {
  const errorMessage = typeof error === "string" ? error : error?.message;
  const displayMessage =
    message ??
    errorMessage ??
    "An unexpected error occurred. Please try again.";

  return (
    <EmptyState
      icon={AlertCircle}
      title={title}
      message={displayMessage}
      className={className}
      size={size}
    >
      {retry && (
        <button
          onClick={retry}
          className="mt-4 text-sm underline hover:no-underline"
        >
          Try again
        </button>
      )}
    </EmptyState>
  );
}
