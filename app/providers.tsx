"use client";

import { AnalyticsProvider } from "@/components/AnalyticsProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <AnalyticsProvider>{children}</AnalyticsProvider>
    </ErrorBoundary>
  );
}
