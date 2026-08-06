/**
 * VideoPlayer component with WebM/MP4 support
 * Handles lazy loading, poster images, and fallbacks
 */

import { useState, useRef, useEffect, CSSProperties } from 'react';

export interface VideoPlayerProps {
  src: string | { webm?: string; mp4?: string };
  posterImage?: string;
  className?: string;
  style?: CSSProperties;
  autoPlay?: boolean;
  loop?: boolean;
  controls?: boolean;
  muted?: boolean;
  preload?: 'none' | 'metadata' | 'auto';
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  width?: number;
  height?: number;
}

export function VideoPlayer({
  src,
  posterImage,
  className = '',
  style,
  autoPlay = false,
  loop = false,
  controls = true,
  muted = true,
  preload = 'metadata',
  onPlay,
  onPause,
  onEnded,
  width,
  height,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Handle source variations
  const getSourceUrl = (): string => {
    if (typeof src === 'string') return src;
    return src.webm || src.mp4 || '';
  };

  const getFormat = (): 'webm' | 'mp4' => {
    if (typeof src === 'string') {
      return src.endsWith('.webm') ? 'webm' : 'mp4';
    }
    return src.webm ? 'webm' : 'mp4';
  };

  const sourceUrl = getSourceUrl();
  const format = getFormat();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => onPlay?.();
    const handlePause = () => onPause?.();
    const handleEnded = () => onEnded?.();

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
    };
  }, [onPlay, onPause, onEnded]);

  return (
    <div className={className} style={style}>
      <video
        ref={videoRef}
        poster={posterImage}
        autoPlay={autoPlay}
        loop={loop}
        controls={controls}
        muted={muted}
        preload={preload}
        width={width}
        height={height}
        onLoadedMetadata={() => setIsLoaded(true)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
        }}
      >
        {typeof src === 'string' ? (
          <source src={sourceUrl} type={`video/${format}`} />
        ) : (
          <>
            {src.webm && <source src={src.webm} type="video/webm" />}
            {src.mp4 && <source src={src.mp4} type="video/mp4" />}
          </>
        )}
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
