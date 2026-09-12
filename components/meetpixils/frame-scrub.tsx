"use client";

import * as React from "react";
import { mono } from "@/lib/ui";

/**
 * FrameScrub — Apple-style scroll-scrubbed image sequence.
 *
 * 89 pre-optimised JPEG frames drawn to a cover-fit canvas; scroll progress is
 * lerped (0.16) so wheel steps glide instead of snapping. The section pins for
 * `holdVh` of scroll — kept deliberately short so it reads as a moment, not a
 * hijack. Reduced-motion renders the first frame as a plain still.
 */
export function FrameScrub({
  count = 89, src = (i: number) => `/frames/f${String(i).padStart(3, "0")}.jpg`,
  holdVh = 170, children,
}: {
  count?: number; src?: (i: number) => string; holdVh?: number; children?: React.ReactNode;
}) {
  const hostRef = React.useRef<HTMLDivElement>(null);
  const cvRef = React.useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = React.useState(0);
  const [calm, setCalm] = React.useState(false);
  const imgs = React.useRef<HTMLImageElement[]>([]);

  React.useEffect(() => {
    setCalm(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    let alive = true;
    const list: HTMLImageElement[] = [];
    for (let i = 1; i <= count; i++) {
      const im = new Image();
      im.src = src(i);
      im.onload = () => { if (alive) setLoaded((n) => n + 1); };
      list.push(im);
    }
    imgs.current = list;
    return () => { alive = false; };
  }, [count]);

  React.useEffect(() => {
    const host = hostRef.current, cv = cvRef.current;
    if (!host || !cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    let raf = 0, cur = 0, tgt = 0;

    const size = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      cv.width = Math.round(cv.clientWidth * dpr);
      cv.height = Math.round(cv.clientHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const draw = (f: number) => {
      const im = imgs.current[Math.max(0, Math.min(count - 1, Math.round(f)))];
      if (!im || !im.complete || !im.naturalWidth) return;
      const w = cv.clientWidth, h = cv.clientHeight;
      const s = Math.max(w / im.naturalWidth, h / im.naturalHeight);
      const dw = im.naturalWidth * s, dh = im.naturalHeight * s;
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(im, (w - dw) / 2, (h - dh) / 2, dw, dh);
    };
    const read = () => {
      const r = host.getBoundingClientRect();
      const total = Math.max(1, r.height - window.innerHeight);
      return Math.min(1, Math.max(0, -r.top / total)) * (count - 1);
    };
    const loop = () => {
      const d = tgt - cur;
      if (Math.abs(d) > 0.08) { cur += d * 0.16; draw(cur); raf = requestAnimationFrame(loop); }
      else { cur = tgt; draw(cur); raf = 0; }
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };
    const onScroll = () => { tgt = read(); kick(); };

    size(); tgt = cur = read(); draw(cur);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", () => { size(); draw(cur); });
    const ro = new ResizeObserver(() => { size(); draw(cur); });
    ro.observe(cv);
    return () => { window.removeEventListener("scroll", onScroll); ro.disconnect(); if (raf) cancelAnimationFrame(raf); };
  }, [count, loaded > 0]);

  if (calm) {
    return (
      <div style={{ position: "relative", height: "72vh", overflow: "hidden" }}>
        <img src={src(1)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "flex-end" }}>{children}</div>
      </div>
    );
  }
  const pct = Math.round((loaded / count) * 100);
  return (
    <div ref={hostRef} style={{ position: "relative", height: `${holdVh}vh` }}>
      <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}>
        <canvas ref={cvRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} aria-hidden="true" />
        {pct < 100 && (
          <span style={{ ...mono, position: "absolute", top: 84, insetInlineEnd: "clamp(20px,5vw,64px)", opacity: .55 }} aria-live="polite">
            {pct}%
          </span>
        )}
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "flex-end", pointerEvents: "none" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
