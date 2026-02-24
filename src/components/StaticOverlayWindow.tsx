"use client";

import { useEffect, type MouseEvent } from "react";
import { useRouter } from "next/navigation";

type StaticOverlayWindowProps = {
  title: string;
  onClose?: () => void;
};

function closeToPreviousOrHome(router: ReturnType<typeof useRouter>) {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push("/");
  }
}

export function StaticOverlayWindow({ title, onClose }: StaticOverlayWindowProps) {
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
    <div className="window-overlay" role="dialog" aria-modal="true" aria-label={`${title} overlay`} onClick={handleBackdropClick}>
      <div className="window-panel">
        <button type="button" className="window-close" onClick={handleClose}>
          Close
        </button>
        <h2>{title}</h2>
      </div>
    </div>
  );
}
