"use client";
import { ErrorState } from "@/components/ui/error-state";
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorState onRetry={reset} message={error.message || undefined} />;
}
