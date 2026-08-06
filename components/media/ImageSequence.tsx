/**
 * ImageSequence component for animated frame sequences
 * Used for logo reveal and other cinematic assets
 * Supports both lazy loading and progressive enhancement
 */

import { useState, useEffect, useRef, CSSProperties } from 'react';

export interface ImageSequenceProps {
  frames: string[];
  frameWidth: number;
  frameHeight: number;
  fps?: number;
  autoPlay?: boolean;
  loop?: boolean;
  className?: string;
  style?: CSSProperties;
  onComplete?: () => void;
  posterImage?: string;
}

export function ImageSequence({
  frames,
  frameWidth,
  frameHeight,
  fps = 30,
  autoPlay = true,
  loop = false,
  className = '',
  style,
  onComplete,
  posterImage,
}: ImageSequenceProps) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isLoaded, setIsLoaded] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Frame timing calculations
  const frameDuration = 1000 / fps;

  // Start/stop playback
  useEffect(() => {
    if (!isPlaying || !isLoaded) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setCurrentFrame((prev) => {
        const next = prev + 1;

        // Handle loop or completion
        if (next >= frames.length) {
          if (loop) {
            return 0;
          } else {
            setIsPlaying(false);
            onComplete?.();
            return prev;
          }
        }

        return next;
      });
    }, frameDuration);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, isLoaded, frames.length, frameDuration, loop, onComplete]);

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleReset = () => {
    setCurrentFrame(0);
    setIsPlaying(autoPlay);
  };

  // Expose controls via ref if needed
  useEffect(() => {
    if (containerRef.current) {
      (containerRef.current as any).play = handlePlay;
      (containerRef.current as any).pause = handlePause;
      (containerRef.current as any).reset = handleReset;
      (containerRef.current as any).seek = (frame: number) => {
        const clamped = Math.max(0, Math.min(frame, frames.length - 1));
        setCurrentFrame(clamped);
      };
    }
  }, [frames.length, autoPlay]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: frameWidth,
        height: frameHeight,
        overflow: 'hidden',
        ...style,
      }}
    >
      {frames.length > 0 ? (
        <img
          src={frames[currentFrame]}
          alt={`Frame ${currentFrame + 1} of ${frames.length}`}
          width={frameWidth}
          height={frameHeight}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            display: 'block',
          }}
          onLoad={() => setIsLoaded(true)}
          loading={currentFrame === 0 ? 'eager' : 'lazy'}
          decoding="async"
        />
      ) : posterImage ? (
        <img
          src={posterImage}
          alt="Poster"
          width={frameWidth}
          height={frameHeight}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            display: 'block',
          }}
          onLoad={() => setIsLoaded(true)}
        />
      ) : (
        <div style={{ width: '100%', height: '100%', backgroundColor: '#000' }} />
      )}
    </div>
  );
}
