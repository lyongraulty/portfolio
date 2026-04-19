"use client";

import { useState } from "react";

type ShareConceptButtonProps = {
  className?: string;
};

export function ShareConceptButton({ className }: ShareConceptButtonProps) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");

  const label = status === "copied" ? "Copied" : status === "error" ? "Retry Share" : "Share";

  const handleShare = async () => {
    try {
      if (typeof window === "undefined") return;
      await navigator.clipboard.writeText(window.location.href);
      setStatus("copied");
      window.setTimeout(() => setStatus("idle"), 1600);
    } catch {
      setStatus("error");
      window.setTimeout(() => setStatus("idle"), 2200);
    }
  };

  return (
    <button className={className} type="button" onClick={handleShare} aria-live="polite">
      {label}
    </button>
  );
}
