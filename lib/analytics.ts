/**
 * Analytics tracking utilities for Iron Oasis
 * Supports Google Analytics 4 and custom event tracking
 */

// Event types for conversion funnel tracking
export type AnalyticsEvent =
  | 'hero_cta_view'
  | 'hero_cta_click'
  | 'apply_page_view'
  | 'apply_page_click'
  | 'form_start'
  | 'form_field_blur'
  | 'form_validation_error'
  | 'form_submit_attempt'
  | 'form_submit_success'
  | 'form_submit_error'
  | 'section_view'
  | 'scene_complete'
  | 'scroll_depth'
  | 'video_play'
  | 'video_complete'
  | 'conversion'
  | 'page_view';

export interface AnalyticsEventParams {
  event: AnalyticsEvent;
  value?: string | number;
  label?: string;
  timestamp?: number;
  [key: string]: any;
}

/**
 * Track an analytics event
 * Works with Google Analytics 4 if gtag is available
 */
export function trackEvent(params: AnalyticsEventParams): void {
  if (typeof window === 'undefined') return;

  const { event, value, label, ...customParams } = params;
  const timestamp = params.timestamp || Date.now();

  // Google Analytics 4
  if (typeof (window as any).gtag === 'function') {
    (window as any).gtag('event', event, {
      value,
      label,
      timestamp,
      ...customParams,
    });
  }

  // Console logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Analytics] ${event}`, { value, label, ...customParams });
  }
}

/**
 * Track page view with custom properties
 */
export function trackPageView(
  path: string,
  title?: string,
  properties?: Record<string, any>
): void {
  if (typeof window === 'undefined') return;

  if (typeof (window as any).gtag === 'function') {
    (window as any).gtag('event', 'page_view', {
      page_path: path,
      page_title: title || document.title,
      ...properties,
    });
  }
}

/**
 * Track conversion funnel step
 */
export function trackConversion(
  step: 'hero_cta' | 'apply_start' | 'form_complete',
  metadata?: Record<string, any>
): void {
  trackEvent({
    event: 'conversion',
    label: step,
    ...metadata,
  });
}

/**
 * Track scroll depth for engagement measurement
 */
export function trackScrollDepth(depth: number): void {
  const percentThresholds = [25, 50, 75, 90];
  if (percentThresholds.includes(depth)) {
    trackEvent({
      event: 'scroll_depth',
      value: depth,
      label: `${depth}% of page`,
    });
  }
}

/**
 * Track form interaction with field-level granularity
 */
export function trackFormInteraction(
  formId: string,
  fieldName: string,
  interactionType: 'focus' | 'blur' | 'error',
  errorMessage?: string
): void {
  trackEvent({
    event: 'form_field_blur',
    label: `${formId}:${fieldName}`,
    value: interactionType,
    error: errorMessage,
  });
}

/**
 * Track section visibility (used with Intersection Observer)
 */
export function trackSectionView(sectionId: string, name: string): void {
  trackEvent({
    event: 'section_view',
    label: sectionId,
    value: name,
  });
}

/**
 * Track 3D scene transitions
 */
export function trackSceneComplete(sceneNumber: number, duration: number): void {
  trackEvent({
    event: 'scene_complete',
    value: sceneNumber,
    label: `Scene ${sceneNumber}`,
    duration_ms: duration,
  });
}

/**
 * Initialize analytics (called from app root)
 * Sets up Google Analytics if GA_ID is configured
 */
export function initializeAnalytics(): void {
  if (typeof window === 'undefined') return;

  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  if (!gaId) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics] GA_ID not configured, using dev mode');
    }
    return;
  }

  // Load Google Analytics script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  document.head.appendChild(script);

  // Initialize gtag
  (window as any).dataLayer = (window as any).dataLayer || [];
  function gtag(...args: any[]) {
    (window as any).dataLayer.push(arguments);
  }
  (window as any).gtag = gtag;
  gtag('js', new Date());
  gtag('config', gaId, {
    page_path: window.location.pathname,
    page_title: document.title,
  });
}
