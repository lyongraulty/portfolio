"use client";

import { useEffect, type MouseEvent } from "react";
import { useRouter } from "next/navigation";

type StaticOverlayWindowProps = {
  title: string;
};

function closeToPreviousOrHome(router: ReturnType<typeof useRouter>) {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push("/");
  }
}

export function StaticOverlayWindow({ title }: StaticOverlayWindowProps) {
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
    <div className="window-overlay" role="dialog" aria-modal="true" aria-label={`${title} overlay`} onClick={handleBackdropClick}>
      <div className="window-panel">
        <button type="button" className="window-close" onClick={() => closeToPreviousOrHome(router)}>
          Close
        </button>
        <h2>{title}</h2>
      </div>
    </div>
  );
}
