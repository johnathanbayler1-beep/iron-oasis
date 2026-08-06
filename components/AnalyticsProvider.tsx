'use client';

import { useEffect } from 'react';
import { initializeAnalytics, trackPageView } from '@/lib/analytics';
import { usePathname } from 'next/navigation';

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    // Initialize analytics on mount
    initializeAnalytics();
  }, []);

  useEffect(() => {
    // Track page views on route changes
    trackPageView(pathname, document.title);
  }, [pathname]);

  return <>{children}</>;
}
