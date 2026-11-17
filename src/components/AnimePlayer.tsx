import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

interface AnimePlayerProps {
  videoUrl: string;
}

export default function AnimePlayer({ videoUrl }: AnimePlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls;

    if (Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(videoUrl);
      hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Fallback for Safari
      video.src = videoUrl;
    }

    return () => {
      if (hls) hls.destroy();
    };
  }, [videoUrl]);

  return (
    <div className="w-full max-w-5xl mx-auto bg-black rounded-lg overflow-hidden shadow-2xl">
      <video
        ref={videoRef}
        controls
        autoPlay
        className="w-full h-auto aspect-video"
      />
    </div>
  );
}