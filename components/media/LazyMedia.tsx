/**
 * LazyMedia component for lazy-loading images and videos
 * Uses Intersection Observer for performance
 */

import { useState, useRef, useEffect, CSSProperties, ReactNode } from 'react';

export interface LazyMediaProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  threshold?: number | number[];
  rootMargin?: string;
  fallback?: ReactNode;
  onVisible?: () => void;
}

export function LazyMedia({
  children,
  className = '',
  style,
  threshold = 0.1,
  rootMargin = '50px',
  fallback,
  onVisible,
}: LazyMediaProps) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          onVisible?.();
          if (containerRef.current) {
            observer.unobserve(containerRef.current);
          }
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [threshold, rootMargin, onVisible]);

  return (
    <div ref={containerRef} className={className} style={style}>
      {isVisible ? children : fallback || null}
    </div>
  );
}
