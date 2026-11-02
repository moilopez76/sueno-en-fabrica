"use client";

import { useEffect, useState } from "react";

/** Mirrors `(prefers-reduced-motion: reduce)` for gating JS-driven animations
 * (framer-motion springs/drag, the equaliser, swipe carousels) — CSS
 * transitions/animations are already handled globally in app/globals.css. */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const onChange = () => setReduced(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
