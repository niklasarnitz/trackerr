"use client";

import React from "react";
import { ErrorDisplay } from "./error-display";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{
    fallback?: React.ComponentType<{ error?: Error; reset?: () => void }>;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  }>,
  ErrorBoundaryState
> {
  constructor(
    props: React.PropsWithChildren<{
      fallback?: React.ComponentType<{ error?: Error; reset?: () => void }>;
      onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
    }>,
  ) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  reset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent error={this.state.error} reset={this.reset} />
        );
      }

      return (
        <ErrorDisplay
          title="Something went wrong"
          message="An unexpected error occurred. Please refresh the page or try again."
        />
      );
    }

    return this.props.children;
  }
}
