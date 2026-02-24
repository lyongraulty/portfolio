"use client";

import { useEffect, type MouseEvent } from "react";
import { useRouter } from "next/navigation";

function closeToPreviousOrHome(router: ReturnType<typeof useRouter>) {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push("/");
  }
}

export function ReelOverlayWindow({ onClose }: { onClose?: () => void }) {
  const router = useRouter();
  const handleClose = onClose ?? (() => closeToPreviousOrHome(router));

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        handleClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleClose]);

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      handleClose();
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
      <div className="window-panel">
        <button
          type="button"
          className="window-close"
          onClick={handleClose}
          aria-label="Close reel overlay"
        >
          Close
        </button>
        <p className="reel-label">MOTION REEL</p>
        <p className="reel-index">01.</p>
        <p className="reel-divider">-</p>
        <p className="reel-description">A tightly edited compilation of recent work - both client and personal</p>
      </div>
    </div>
  );
}
