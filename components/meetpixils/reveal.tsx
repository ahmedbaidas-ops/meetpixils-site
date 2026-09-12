"use client";

import * as React from "react";

/**
 * Reveal — the section intro from Playbook §08 Tier 1.
 *
 * translateY + opacity only, so it is direction-agnostic and carries no RTL
 * bugs. Fires once on entry, then unobserves. Under prefers-reduced-motion it
 * mounts already-revealed rather than animating.
 *
 * Budget (§08): 60ms stagger, 480ms total cap per group — pass `delay` as
 * index * 60 and keep groups under eight items.
 */
export function Reveal({
  children,
  delay = 0,
  y = 20,
  duration = 700,
  threshold = 0.15,
  className,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  duration?: number;
  threshold?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [shown, setShown] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          // `top < 0` is the important half: a fast scroll can carry an element
          // from below the fold to above it between observer samples, and
          // without this it would stay invisible forever.
          if (e.isIntersecting || e.boundingClientRect.top < 0) {
            setShown(true);
            io.disconnect();
          }
        });
      },
      { threshold, rootMargin: "0px 0px -6% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : `translateY(${y}px)`,
        transition: `opacity ${duration}ms cubic-bezier(.16,1,.3,1) ${delay}ms, transform ${duration}ms cubic-bezier(.16,1,.3,1) ${delay}ms`,
        willChange: shown ? "auto" : "opacity, transform",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
