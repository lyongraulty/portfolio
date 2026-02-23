"use client";

import { useEffect, type MouseEvent } from "react";
import { useRouter } from "next/navigation";

type ProjectOverlayWindowProps = {
  title: string;
  description: string;
  index: number;
};

function formatIndex(index: number) {
  return String(index).padStart(2, "0");
}

function closeToPreviousOrHome(router: ReturnType<typeof useRouter>) {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push("/");
  }
}

export function ProjectOverlayWindow({ title, description, index }: ProjectOverlayWindowProps) {
  const router = useRouter();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeToPreviousOrHome(router);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [router]);

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      closeToPreviousOrHome(router);
    }
  };

  return (
    <div className="window-overlay" role="dialog" aria-modal="true" aria-label={title} onClick={handleBackdropClick}>
      <div className="window-panel">
        <button
          type="button"
          className="window-close"
          onClick={() => closeToPreviousOrHome(router)}
          aria-label="Close project"
        >
          Close
        </button>
        <p className="reel-label">PROJECT</p>
        <h1>{title}</h1>
        <p className="reel-index">{formatIndex(index)}.</p>
        <p className="reel-divider">-</p>
        <p className="reel-description">{description}</p>
      </div>
    </div>
  );
}
