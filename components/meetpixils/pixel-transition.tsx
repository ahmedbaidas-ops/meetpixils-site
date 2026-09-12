"use client";

import * as React from "react";

/**
 * PixelTransition — a pixel curtain that dissolves to reveal content.
 *
 * Three ways to drive it, none of which pin the page:
 *   inview — a timed animation, played once when the block enters view
 *   scroll — the dissolve tracks the block's travel through the viewport
 *   manual — the curtain stays up and only the cursor dissolves it
 *
 * What makes a scroll effect feel "stuck" is pinning (position:sticky over a
 * tall spacer), which spends the user's scroll on the effect instead of on
 * moving down the page. Scroll mode here never pins: the block scrolls away
 * normally and the dissolve just rides its position, lerped so it glides
 * rather than stepping with each wheel notch.
 *
 * A cell dissolves when either the animation front or the pointer's heat
 * reaches it; mid-dissolve it flashes an accent colour, which is what reads as
 * colour sweeping through.
 */

export type PixelDirection =
  | "top-bottom" | "bottom-top" | "left-right" | "right-left" | "center-out" | "center-in";
export type PixelPattern = "random" | "checker" | "diagonal" | "wave" | "spiral" | "radial";
export type PixelEasing = "linear" | "ease-in" | "ease-out" | "ease-in-out" | "expo-out";

export interface PixelTransitionProps {
  colorA?: string;
  accentColors?: string[];
  direction?: PixelDirection;
  pattern?: PixelPattern;
  patternIntensity?: number;
  easing?: PixelEasing;
  pixelSize?: number;
  gap?: number;
  duration?: number;
  softness?: number;
  /** scroll mode: how fast the dissolve chases scroll (0–1) @default 0.12 */
  smoothing?: number;
  trigger?: "inview" | "scroll" | "manual";
  interactive?: boolean;
  radius?: number;
  /** "auto" lets the wrapped content set the height — the curtain then sits
   *  over the real section instead of occupying its own empty block. */
  height?: string;
  className?: string;
  children?: React.ReactNode;
}

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
function hash(x: number, y: number) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return n - Math.floor(n);
}
const EASE: Record<PixelEasing, (t: number) => number> = {
  linear: (t) => t,
  "ease-in": (t) => t * t,
  "ease-out": (t) => 1 - (1 - t) * (1 - t),
  "ease-in-out": (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  "expo-out": (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
};

function directional(d: PixelDirection, x: number, y: number, cols: number, rows: number) {
  const fx = cols > 1 ? x / (cols - 1) : 0;
  const fy = rows > 1 ? y / (rows - 1) : 0;
  switch (d) {
    case "top-bottom": return fy;
    case "bottom-top": return 1 - fy;
    case "left-right": return fx;
    case "right-left": return 1 - fx;
    default: {
      const dist = clamp01(Math.hypot(fx - 0.5, fy - 0.5) * 2);
      return d === "center-out" ? dist : 1 - dist;
    }
  }
}
function patterned(p: PixelPattern, x: number, y: number, cols: number, rows: number) {
  const fx = cols > 1 ? x / (cols - 1) : 0;
  const fy = rows > 1 ? y / (rows - 1) : 0;
  switch (p) {
    case "random": return hash(x, y);
    case "checker": return (x + y) % 2 === 0 ? 0.22 : 0.78;
    case "diagonal": return clamp01((x + y) / Math.max(1, cols + rows - 2));
    case "wave": return clamp01(0.5 + 0.5 * Math.sin(x * 0.42 + Math.sin(y * 0.3) * 1.8));
    case "spiral": {
      const ang = (Math.atan2(fy - 0.5, fx - 0.5) + Math.PI) / (Math.PI * 2);
      return clamp01((ang + clamp01(Math.hypot(fx - 0.5, fy - 0.5) * 2) * 1.6) % 1);
    }
    default: return clamp01(Math.hypot(fx - 0.5, fy - 0.5) * 2);
  }
}
function resolveColor(c: string, root: HTMLElement) {
  if (!c.startsWith("--")) return c;
  return getComputedStyle(root).getPropertyValue(c).trim() || "#000";
}

export interface PixelTransitionHandle {
  play: () => void;
  reset: () => void;
}

export const PixelTransition = React.forwardRef<PixelTransitionHandle, PixelTransitionProps>(
  function PixelTransition(
    {
      colorA = "#0F010A",
      accentColors = ["#EF5229", "#CCA4FD", "#2EBEEF", "#C3B8FB"],
      direction = "bottom-top",
      pattern = "random",
      patternIntensity = 0.45,
      easing = "ease-out",
      pixelSize = 28,
      gap = 0,
      duration = 1500,
      softness = 0.1,
      trigger = "inview",
      smoothing = 0.12,
      interactive = true,
      radius = 110,
      height = "80vh",
      className,
      children,
    },
    ref,
  ) {
    const hostRef = React.useRef<HTMLDivElement>(null);
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const api = React.useRef<PixelTransitionHandle>({ play: () => {}, reset: () => {} });
    React.useImperativeHandle(ref, () => api.current, []);

    React.useEffect(() => {
      const host = hostRef.current;
      const cv = canvasRef.current;
      if (!host || !cv) return;
      const ctx = cv.getContext("2d");
      if (!ctx) return;

      let cols = 0, rows = 0, cell = 0;
      let thresholds = new Float32Array(0);
      let heat = new Float32Array(0);
      let accentIdx = new Uint8Array(0);
      let raf = 0;
      let animStart = 0;
      let animating = false;
      let front = 0;
      let anyHeat = false;
      let scrollTarget = 0;
      const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const build = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = host.clientWidth;
        const h = host.clientHeight;
        cv.width = Math.max(1, Math.round(w * dpr));
        cv.height = Math.max(1, Math.round(h * dpr));
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        cell = Math.max(2, pixelSize + gap);
        cols = Math.ceil(w / cell);
        rows = Math.ceil(h / cell);
        thresholds = new Float32Array(cols * rows);
        heat = new Float32Array(cols * rows);
        accentIdx = new Uint8Array(cols * rows);
        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            const i = y * cols + x;
            thresholds[i] = clamp01(
              directional(direction, x, y, cols, rows) * (1 - patternIntensity) +
                patterned(pattern, x, y, cols, rows) * patternIntensity,
            );
            accentIdx[i] =
              Math.floor(hash(x * 3.7, y * 9.1) * accentColors.length) % accentColors.length;
          }
        }
      };

      const draw = () => {
        const root = document.documentElement;
        const a = resolveColor(colorA, root);
        const acc = accentColors.map((c) => resolveColor(c, root));
        const w = cv.clientWidth, h = cv.clientHeight;
        const size = Math.max(1, pixelSize);
        const soft = Math.max(0.0001, softness);

        ctx.clearRect(0, 0, w, h);
        const buckets: number[][] = acc.map(() => []);
        const solid: number[] = [];

        for (let i = 0; i < thresholds.length; i++) {
          const byFront = (front - thresholds[i]) / soft;
          const reveal = Math.max(byFront, heat[i]);
          if (reveal >= 1) continue;
          if (reveal <= 0) { solid.push(i); continue; }
          buckets[accentIdx[i]].push(i);
        }

        ctx.globalAlpha = 1;
        ctx.fillStyle = a;
        for (let j = 0; j < solid.length; j++) {
          const i = solid[j];
          ctx.fillRect((i % cols) * cell, ((i / cols) | 0) * cell, size, size);
        }
        for (let k = 0; k < acc.length; k++) {
          const b = buckets[k];
          if (!b.length) continue;
          ctx.fillStyle = acc[k];
          for (let j = 0; j < b.length; j++) {
            const i = b[j];
            const reveal = clamp01(Math.max((front - thresholds[i]) / soft, heat[i]));
            ctx.globalAlpha = 1 - reveal;
            ctx.fillRect((i % cols) * cell, ((i / cols) | 0) * cell, size, size);
          }
        }
        ctx.globalAlpha = 1;
      };

      /**
       * Element travel through the viewport → 0–1. No pinning involved.
       * The span is the block's own height (capped at one viewport), so the
       * dissolve finishes just as the block finishes entering rather than
       * being over before it is even centred.
       */
      const readScroll = () => {
        const r = host.getBoundingClientRect();
        const viewH = window.innerHeight;
        const span = Math.max(1, Math.min(r.height, viewH));
        return clamp01((viewH - r.top) / span);
      };

      const chase = calm ? 1 : Math.min(1, Math.max(0.02, smoothing));

      const loop = (t: number) => {
        let more = false;
        if (trigger === "scroll") {
          const d = scrollTarget - front;
          if (Math.abs(d) > 0.0004) {
            front += d * chase;
            more = true;
          } else {
            front = scrollTarget;
          }
        }
        if (animating) {
          const e = clamp01((t - animStart) / Math.max(1, duration));
          front = EASE[easing](e);
          if (e >= 1) animating = false;
        }
        if (anyHeat) {
          anyHeat = false;
          for (let i = 0; i < heat.length; i++) {
            if (heat[i] > 0) {
              heat[i] = heat[i] < 0.002 ? 0 : heat[i] * 0.94;
              if (heat[i] > 0) anyHeat = true;
            }
          }
        }
        draw();
        raf = animating || anyHeat || more ? requestAnimationFrame(loop) : 0;
      };
      const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };

      api.current = {
        play: () => {
          if (calm) { front = 1; draw(); return; }
          animStart = performance.now();
          animating = true;
          kick();
        },
        reset: () => {
          animating = false;
          front = 0;
          heat.fill(0);
          anyHeat = false;
          draw();
        },
      };

      const onPointer = (e: PointerEvent) => {
        if (!interactive || calm) return;
        const r = cv.getBoundingClientRect();
        const px = e.clientX - r.left;
        const py = e.clientY - r.top;
        const reach = Math.ceil(radius / cell);
        const cx = Math.floor(px / cell);
        const cy = Math.floor(py / cell);
        for (let y = cy - reach; y <= cy + reach; y++) {
          if (y < 0 || y >= rows) continue;
          for (let x = cx - reach; x <= cx + reach; x++) {
            if (x < 0 || x >= cols) continue;
            const d = Math.hypot(x * cell + cell / 2 - px, y * cell + cell / 2 - py);
            if (d > radius) continue;
            const i = y * cols + x;
            // gain so the core of the brush fully clears instead of only dimming;
            // without it heat only reaches 1 at the exact centre pixel
            const v = clamp01((1 - d / radius) * 1.9);
            if (v > heat[i]) heat[i] = v;
            anyHeat = true;
          }
        }
        kick();
      };

      build();
      front = 0;
      draw();

      cv.addEventListener("pointermove", onPointer);
      const onResize = () => { build(); draw(); };
      window.addEventListener("resize", onResize);
      const ro = new ResizeObserver(onResize);
      ro.observe(host);

      const onScroll = () => {
        scrollTarget = EASE[easing](readScroll());
        kick();
      };
      if (trigger === "scroll") {
        scrollTarget = EASE[easing](readScroll());
        front = scrollTarget;
        draw();
        window.addEventListener("scroll", onScroll, { passive: true });
      }

      let io: IntersectionObserver | null = null;
      if (trigger === "inview") {
        io = new IntersectionObserver(
          (entries) => {
            entries.forEach((en) => {
              if (en.isIntersecting) { api.current.play(); io?.disconnect(); }
            });
          },
          { threshold: 0.35 },
        );
        io.observe(host);
      }

      return () => {
        if (raf) cancelAnimationFrame(raf);
        cv.removeEventListener("pointermove", onPointer);
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onResize);
        ro.disconnect();
        io?.disconnect();
      };
    }, [
      colorA, accentColors, direction, pattern, patternIntensity, easing,
      pixelSize, gap, duration, softness, trigger, interactive, radius, smoothing,
    ]);

    // "auto" lets the wrapped content set the height, so the curtain overlays a
    // real section instead of occupying its own empty block above it.
    const fitsContent = height === "auto";
    return (
      <div
        ref={hostRef}
        className={className}
        style={{ position: "relative", height: fitsContent ? undefined : height, overflow: "hidden" }}
      >
        <div style={fitsContent ? { position: "relative" } : { position: "absolute", inset: 0 }}>{children}</div>
        <canvas
          ref={canvasRef}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: interactive ? "auto" : "none" }}
          aria-hidden="true"
        />
      </div>
    );
  },
);
