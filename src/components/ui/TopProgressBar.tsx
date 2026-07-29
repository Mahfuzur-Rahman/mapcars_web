"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * TopProgressBar — a modern, glowing top progress indicator for Next.js App Router.
 * Automatically triggers on page transitions, internal link clicks, and manual API loading events.
 */
export default function TopProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startProgress = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setVisible(true);
    setProgress(20);

    // Smoothly trickle up to ~85% while waiting for route transition
    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 85) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 85;
        }
        return prev + Math.random() * 12 + 4;
      });
    }, 180);
  };

  const completeProgress = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setProgress(100);

    setTimeout(() => {
      setVisible(false);
      setTimeout(() => setProgress(0), 200);
    }, 250);
  };

  // Complete progress on pathname / searchParams change
  useEffect(() => {
    completeProgress();
  }, [pathname, searchParams]);

  // Intercept internal link clicks to start loading instantly
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      // Ignore external links, mailto, tel, anchors (#), and modifier keys
      if (
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("#") ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey ||
        e.altKey ||
        target.target === "_blank"
      ) {
        return;
      }

      // If navigating to a different route, trigger progress bar
      const currentUrl = window.location.pathname + window.location.search;
      if (href !== currentUrl) {
        startProgress();
      }
    };

    const handleCustomStart = () => startProgress();
    const handleCustomStop = () => completeProgress();

    window.addEventListener("click", handleAnchorClick, { capture: true });
    window.addEventListener("mapcars:progress-start", handleCustomStart);
    window.addEventListener("mapcars:progress-stop", handleCustomStop);

    return () => {
      window.removeEventListener("click", handleAnchorClick, { capture: true });
      window.removeEventListener("mapcars:progress-start", handleCustomStart);
      window.removeEventListener("mapcars:progress-stop", handleCustomStop);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (!visible && progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[99999] pointer-events-none transition-opacity duration-200"
      style={{ opacity: visible ? 1 : 0 }}
      aria-hidden="true"
    >
      {/* Outer progress bar */}
      <div
        className="h-[3px] w-full transition-all duration-250 ease-out"
        style={{
          width: `${progress}%`,
          background:
            "linear-gradient(90deg, #00b9d9 0%, #0b7dc0 45%, #22c55e 100%)",
          boxShadow:
            "0 0 12px rgba(0, 185, 217, 0.8), 0 0 6px rgba(34, 197, 94, 0.8)",
        }}
      >
        {/* Leading edge light pulse dot */}
        <div
          className="absolute top-0 right-0 h-[3px] w-16 -translate-y-0"
          style={{
            background:
              "linear-gradient(90deg, transparent, #ffffff, rgba(34, 197, 94, 0.9))",
            boxShadow: "0 0 10px #ffffff, 0 0 5px #22c55e",
          }}
        />
      </div>
    </div>
  );
}

/** Global helper to trigger top progress bar for async data fetches */
export function showTopProgress() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("mapcars:progress-start"));
  }
}

/** Global helper to hide top progress bar when data fetch finishes */
export function hideTopProgress() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("mapcars:progress-stop"));
  }
}
