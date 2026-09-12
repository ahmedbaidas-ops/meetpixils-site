"use client";

import * as React from "react";

/**
 * PixelStatement — the big editorial text block.
 *
 * Two motions layered:
 *  1. On first entry each word materialises with a stepped checkerboard-mask
 *     dissolve — the "pixels" appear coarse and refine, then the mask drops.
 *  2. On scroll, words light from `faint` to `full` progressively, Brikken-style,
 *     following the block's travel through the viewport.
 */
export function PixelStatement({
  text, faint = "rgba(49,6,34,.18)", full = "#310622",
  size = "clamp(26px,4.2vw,54px)", ar = false, className,
}: {
  text: string; faint?: string; full?: string; size?: string; ar?: boolean; className?: string;
}) {
  const ref = React.useRef<HTMLParagraphElement>(null);
  const [entered, setEntered] = React.useState(false);
  const [lit, setLit] = React.useState(0);
  const words = React.useMemo(() => text.split(/\s+/), [text]);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (calm) { setEntered(true); setLit(words.length); return; }
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting || e.boundingClientRect.top < 0) { setEntered(true); io.disconnect(); } });
    }, { threshold: 0.2 });
    io.observe(el);
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const r = el.getBoundingClientRect();
        const span = Math.max(1, window.innerHeight * 0.55);
        const p = Math.min(1, Math.max(0, (window.innerHeight * 0.82 - r.top) / span));
        setLit(Math.round(p * words.length));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { io.disconnect(); window.removeEventListener("scroll", onScroll); if (raf) cancelAnimationFrame(raf); };
  }, [words.length]);

  return (
    <p ref={ref} className={className}
       style={{ margin: 0, fontSize: size, fontWeight: 700, letterSpacing: ar ? 0 : "-.035em",
                lineHeight: ar ? 1.55 : 1.14, maxWidth: "26ch", textWrap: "balance" }}>
      {words.map((w, i) => (
        <span key={i} className={entered ? "pxw in" : "pxw"}
              style={{ color: i < lit ? full : faint,
                       transitionDelay: entered ? undefined : `${Math.min(i * 34, 900)}ms`,
                       animationDelay: `${Math.min(i * 34, 900)}ms` }}>
          {w}{" "}
        </span>
      ))}
      <style>{`
        .pxw {
          display: inline; opacity: 0;
          transition: color .5s cubic-bezier(.16,1,.3,1);
        }
        .pxw.in { animation: pxin .55s steps(5) forwards }
        @keyframes pxin {
          0%   { opacity: 0; -webkit-mask-image: repeating-conic-gradient(#000 0 25%, transparent 0 50%); mask-image: repeating-conic-gradient(#000 0 25%, transparent 0 50%); -webkit-mask-size: 22px 22px; mask-size: 22px 22px }
          35%  { opacity: 1; -webkit-mask-size: 13px 13px; mask-size: 13px 13px }
          70%  { -webkit-mask-size: 6px 6px; mask-size: 6px 6px }
          99%  { -webkit-mask-size: 3px 3px; mask-size: 3px 3px }
          100% { opacity: 1; -webkit-mask-image: none; mask-image: none }
        }
        @media (prefers-reduced-motion: reduce) {
          .pxw { opacity: 1; transition: none }
          .pxw.in { animation: none }
        }
      `}</style>
    </p>
  );
}
