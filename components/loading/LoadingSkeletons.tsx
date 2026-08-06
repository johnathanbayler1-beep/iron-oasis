/**
 * Loading skeleton components for progressive enhancement
 */

import { CSSProperties } from 'react';

export function FormSkeleton() {
  return (
    <div className="space-y-6">
      {[...Array(6)].map((_, i) => (
        <div key={i}>
          <div className="h-4 w-24 bg-white/10 rounded mb-2 animate-pulse" />
          <div className="h-10 w-full bg-white/5 rounded animate-pulse" />
        </div>
      ))}
      <div className="h-10 w-full bg-white/10 rounded animate-pulse" />
    </div>
  );
}

export function VideoSkeleton({ width = 320, height = 180 }: { width?: number; height?: number }) {
  return (
    <div
      className="bg-black/50 animate-pulse rounded-lg"
      style={{ width, height, aspectRatio: `${width}/${height}` }}
    />
  );
}

export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="h-48 bg-white/5 rounded-lg animate-pulse" />
      ))}
    </div>
  );
}

export function TextSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {[...Array(lines)].map((_, i) => (
        <div
          key={i}
          className="h-4 bg-white/10 rounded animate-pulse"
          style={{ width: i === lines - 1 ? '60%' : '100%' }}
        />
      ))}
    </div>
  );
}

export function ImageSkeleton({
  width = 400,
  height = 300,
  className = '',
}: {
  width?: number;
  height?: number;
  className?: string;
}) {
  return (
    <div
      className={`bg-white/5 animate-pulse rounded ${className}`}
      style={{ width, height, aspectRatio: `${width}/${height}` }}
    />
  );
}

/**
 * Generic skeleton component
 */
export function Skeleton({
  width = '100%',
  height = '1rem',
  className = '',
  style,
}: {
  width?: string | number;
  height?: string | number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={`bg-white/10 rounded animate-pulse ${className}`}
      style={{ width, height, ...style }}
    />
  );
}
