"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import { useRouter } from "next/navigation";

function closeToPreviousOrHome(router: ReturnType<typeof useRouter>) {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push("/");
  }
}

const REEL_VIDEO_URL = "https://res.cloudinary.com/dax2qbori/video/upload/v1772063461/LyonGraulty_reel_2019_sbjx4v.mp4";
const REEL_THUMBNAIL_URL =
  "https://res.cloudinary.com/dax2qbori/image/upload/v1772047560/NameStill_qs7yvc.jpg";

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }

  const total = Math.floor(seconds);
  const minutes = Math.floor(total / 60);
  const secs = total % 60;
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

export function ReelOverlayWindow({ onClose }: { onClose?: () => void }) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const defaultClose = useCallback(() => {
    closeToPreviousOrHome(router);
  }, [router]);

  const handleClose = onClose ?? defaultClose;

  const closeReel = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.pause();
    }
    handleClose();
  }, [handleClose]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    const syncFromVideo = () => {
      setCurrentTime(video.currentTime);
      setDuration(video.duration || 0);
      setIsPlaying(!video.paused);
      setVolume(video.volume);
      setIsMuted(video.muted);
    };

    syncFromVideo();
    video.addEventListener("loadedmetadata", syncFromVideo);
    video.addEventListener("timeupdate", syncFromVideo);
    video.addEventListener("play", syncFromVideo);
    video.addEventListener("pause", syncFromVideo);
    video.addEventListener("volumechange", syncFromVideo);

    return () => {
      video.removeEventListener("loadedmetadata", syncFromVideo);
      video.removeEventListener("timeupdate", syncFromVideo);
      video.removeEventListener("play", syncFromVideo);
      video.removeEventListener("pause", syncFromVideo);
      video.removeEventListener("volumechange", syncFromVideo);
    };
  }, [hasStarted]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeReel();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeReel]);

  const startPlayback = useCallback(() => {
    setHasStarted(true);
    window.requestAnimationFrame(() => {
      const video = videoRef.current;
      if (!video) {
        return;
      }
      void video.play();
    });
  }, []);

  const togglePlayback = useCallback(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }
    if (video.paused) {
      void video.play();
    } else {
      video.pause();
    }
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }
    video.muted = !video.muted;
  }, []);

  const onSeek = useCallback((value: string) => {
    const video = videoRef.current;
    if (!video) {
      return;
    }
    const next = Number(value);
    if (Number.isFinite(next)) {
      video.currentTime = next;
    }
  }, []);

  const onVolumeChange = useCallback((value: string) => {
    const video = videoRef.current;
    if (!video) {
      return;
    }
    const next = Number(value);
    if (!Number.isFinite(next)) {
      return;
    }
    video.volume = next;
    if (video.muted && next > 0) {
      video.muted = false;
    }
  }, []);

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      closeReel();
    }
  };

  return (
    <div
      className="window-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Motion reel overlay"
      onClick={handleBackdropClick}
    >
      <div className="window-panel reel-window">
        <div className="reel-embed">
          {hasStarted ? (
            <>
              <video
                ref={videoRef}
                src={REEL_VIDEO_URL}
                className="reel-video"
                preload="metadata"
                playsInline
                onClick={togglePlayback}
              />
              <div className="reel-controls" role="group" aria-label="Video controls">
                <button type="button" className="reel-control-btn type-button" onClick={togglePlayback}>
                  {isPlaying ? "Pause" : "Play"}
                </button>
                <input
                  className="reel-scrubber"
                  type="range"
                  min={0}
                  max={Math.max(duration, 0)}
                  step={0.1}
                  value={Math.min(currentTime, duration || 0)}
                  onChange={(event) => onSeek(event.currentTarget.value)}
                  aria-label="Seek"
                />
                <span className="reel-time type-meta">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
                <button type="button" className="reel-control-btn type-button" onClick={toggleMute}>
                  {isMuted || volume === 0 ? "Unmute" : "Mute"}
                </button>
                <input
                  className="reel-volume"
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={isMuted ? 0 : volume}
                  onChange={(event) => onVolumeChange(event.currentTarget.value)}
                  aria-label="Volume"
                />
              </div>
            </>
          ) : (
            <button
              type="button"
              className="reel-cover-button"
              onClick={startPlayback}
              aria-label="Play motion reel"
            >
              <img
                src={REEL_THUMBNAIL_URL}
                alt="Motion reel thumbnail"
              />
              <span className="reel-cover-play" aria-hidden="true" />
            </button>
          )}
        </div>
        <h2>MOTION REEL</h2>
        <p className="reel-meta-heading type-overline">Title // Client // Role:</p>
        <ul className="reel-meta-list">
          <li className="type-body">&quot;Con Mi Madre&quot; // Zoticus // Animation</li>
          <li className="type-body">&quot;Tomlinson&apos;s&quot; // Mishnoon // Design &amp; Animation</li>
          <li className="type-body">&quot;Glitch Callout&quot; // Captive // Animation</li>
          <li className="type-body">&quot;Tradestation - Fresh Look&quot; // Black Math // 3D Animation</li>
          <li className="type-body">&quot;Reach&quot; // Mishnoon // Design &amp; Animation</li>
          <li className="type-body">&quot;MTN&quot; // Personal Work // Design &amp; Animation</li>
          <li className="type-body">&quot;Idea Energy - unreleased&quot; // Perfect Form // Design &amp; Animation</li>
          <li className="type-body">&quot;Package Sensor&quot; // Captive // Animation</li>
          <li className="type-body">&quot;Ash Britt&quot; // Zoticus // Design &amp; Animation</li>
          <li className="type-body">&quot;Electrolab&quot; // Zoticus // Design, Lighting, Texture, Camera &amp; Animation</li>
          <li className="type-body">&quot;Hammer Down&quot; // Personal Work // Design, Lighting, Texture, Camera, 2D &amp; 3D Animation</li>
          <li className="type-body">&quot;Tradestation - Discipline&quot; // Black Math // 3D Animation</li>
          <li className="type-body">&quot;Universal Returns&quot; // Captive // Animation</li>
          <li className="type-body">&quot;Jump&quot; // Personal Work // Design &amp; Animation</li>
          <li className="type-body">&quot;2019 Title Sequence&quot; // Personal Work // Design, Lighting, Texture, Camera &amp; Animation</li>
        </ul>
        <p className="reel-music type-meta">Music: &quot;Same Old Shit&quot; - Mulle Beats</p>
        <div className="reel-close-wrap">
          <button
            type="button"
            className="window-close type-button"
            onClick={closeReel}
            aria-label="Close reel overlay"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
