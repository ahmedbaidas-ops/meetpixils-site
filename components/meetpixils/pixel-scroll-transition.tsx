"use client";

import * as React from "react";

/**
 * PixelScrollTransition — canvas pixel wipe driven by scroll.
 *
 * Built to the documented API of @unlumen-ui/pixel-scroll-transition, which is
 * licence-gated (401). Same props and defaults, independent implementation.
 *
 * Mechanism: every cell in the grid gets a threshold in [0,1], blended from a
 * directional ramp and a pattern. As eased scroll progress crosses a cell's
 * threshold the cell flips from colorA to colorB; cells just behind the
 * leading edge briefly take an accent colour, which is what reads as a
 * coloured band sweeping across the wipe.
 */

export type PixelDirection =
  | "top-bottom" | "bottom-top" | "left-right" | "right-left" | "center-out" | "center-in";
export type PixelPattern = "random" | "checker" | "diagonal" | "wave" | "spiral" | "radial";
export type PixelEasing = "linear" | "ease-in" | "ease-out" | "ease-in-out" | "expo-out";

export interface PixelScrollTransitionProps {
  mode?: "sticky" | "inline";
  colorA?: string;
  colorB?: string;
  direction?: PixelDirection;
  pattern?: PixelPattern;
  patternIntensity?: number;
  easing?: PixelEasing;
  pixelSize?: number;
  gap?: number;
  endAt?: number;
  accentShare?: number;
  accentColors?: string[];
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
  scrollInfluence?: number;
  /** how fast drawn progress chases scroll progress, 0–1. Lower is smoother. @default 0.12 */
  smoothing?: number;
  /** fade window per cell, in progress units. 0 pops, higher is softer. @default 0.09 */
  softness?: number;
  scrollHeight?: string;
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
    case "center-out":
    case "center-in": {
      const dx = fx - 0.5;
      const dy = fy - 0.5;
      const dist = Math.hypot(dx, dy) / Math.SQRT1_2 / Math.SQRT2 * 2;
      return d === "center-out" ? clamp01(dist) : clamp01(1 - dist);
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
      const dx = fx - 0.5, dy = fy - 0.5;
      const ang = (Math.atan2(dy, dx) + Math.PI) / (Math.PI * 2);
      const rad = clamp01(Math.hypot(dx, dy) * 2);
      return clamp01((ang + rad * 1.6) % 1);
    }
    case "radial": {
      const dx = fx - 0.5, dy = fy - 0.5;
      return clamp01(Math.hypot(dx, dy) * 2);
    }
  }
}

/** resolves "--token" against <html>, or passes a literal colour through */
function resolveColor(c: string, root: HTMLElement) {
  if (!c.startsWith("--")) return c;
  const v = getComputedStyle(root).getPropertyValue(c).trim();
  return v || "#000";
}

export function PixelScrollTransition({
  mode = "sticky",
  colorA = "#252422",
  colorB = "#fffcf2",
  direction = "bottom-top",
  pattern = "random",
  patternIntensity = 0.4,
  easing = "ease-out",
  pixelSize = 24,
  gap = 0,
  endAt = 0.85,
  accentShare = 0.15,
  accentColors = ["#eb5e28", "#00A699", "#FFB400", "#FC642D"],
  scrollContainerRef,
  scrollInfluence = 1,
  smoothing = 0.12,
  softness = 0.09,
  scrollHeight = "200vh",
  height = "600px",
  className,
  children,
}: PixelScrollTransitionProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const progress = React.useRef(0);
  const [themeTick, setThemeTick] = React.useState(0);

  // CSS-variable colours must survive a theme flip without a remount
  React.useEffect(() => {
    const obs = new MutationObserver(() => setThemeTick((t) => t + 1));
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style", "data-theme", "data-arm"],
    });
    return () => obs.disconnect();
  }, []);

  React.useEffect(() => {
    const host = rootRef.current;
    const cv = canvasRef.current;
    if (!host || !cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    let cols = 0, rows = 0, cell = 0;
    let thresholds: Float32Array = new Float32Array(0);
    let accents: Uint8Array = new Uint8Array(0);
    let raf = 0;

    const build = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = cv.clientWidth || host.clientWidth;
      const h = cv.clientHeight || host.clientHeight;
      cv.width = Math.max(1, Math.round(w * dpr));
      cv.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      cell = Math.max(2, pixelSize + gap);
      cols = Math.ceil(w / cell);
      rows = Math.ceil(h / cell);
      thresholds = new Float32Array(cols * rows);
      accents = new Uint8Array(cols * rows);
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const d = directional(direction, x, y, cols, rows);
          const p = patterned(pattern, x, y, cols, rows);
          const i = y * cols + x;
          thresholds[i] = clamp01(d * (1 - patternIntensity) + p * patternIntensity);
          accents[i] = Math.floor(hash(x * 3.7, y * 9.1) * accentColors.length) % accentColors.length;
        }
      }
    };

    const readProgress = () => {
      const scroller = scrollContainerRef?.current;
      const rect = host.getBoundingClientRect();
      const viewH = scroller ? scroller.clientHeight : window.innerHeight;
      const top = scroller ? rect.top - scroller.getBoundingClientRect().top : rect.top;
      if (mode === "sticky") {
        const total = Math.max(1, rect.height - viewH);
        return clamp01(-top / total);
      }
      const total = Math.max(1, viewH + rect.height);
      return clamp01((viewH - top) / total);
    };

    /** raw scroll → endAt → influence → easing */
    const shape = (raw: number) => {
      let p = clamp01(raw / Math.max(0.0001, endAt));
      if (scrollInfluence !== 1) p = Math.pow(p, Math.max(0.05, scrollInfluence));
      return EASE[easing](p);
    };

    let target = shape(readProgress());
    let current = target;
    let running = false;

    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const chase = calm ? 1 : Math.min(1, Math.max(0.02, smoothing));

    const draw = () => {
      const root = document.documentElement;
      const a = resolveColor(colorA, root);
      const b = resolveColor(colorB, root);
      const acc = accentColors.map((c) => resolveColor(c, root));

      const p = current;
      const w = cv.clientWidth;
      const h = cv.clientHeight;
      const size = Math.max(1, pixelSize);
      const soft = Math.max(0.0001, softness);
      // the accent band closes as the wipe completes
      const bandW = p >= 1 ? 0 : accentShare;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = a;
      ctx.fillRect(0, 0, w, h);

      // Batched by colour: setting fillStyle per cell is what makes a grid this
      // size stutter. Solid cells go down in one pass per colour; only the thin
      // leading band needs per-cell alpha.
      const partial: number[] = [];
      const accentBuckets: number[][] = acc.map(() => []);

      ctx.fillStyle = b;
      for (let i = 0; i < thresholds.length; i++) {
        const t = thresholds[i];
        const alpha = (p - t) / soft;
        if (alpha <= 0) continue;
        if (alpha < 1) {
          partial.push(i);
          continue;
        }
        if (bandW > 0 && t > p - bandW) {
          accentBuckets[accents[i]].push(i);
          continue;
        }
        const x = i % cols;
        const y = (i / cols) | 0;
        ctx.fillRect(x * cell, y * cell, size, size);
      }

      for (let k = 0; k < acc.length; k++) {
        const bucket = accentBuckets[k];
        if (!bucket.length) continue;
        ctx.fillStyle = acc[k];
        for (let j = 0; j < bucket.length; j++) {
          const i = bucket[j];
          ctx.fillRect((i % cols) * cell, ((i / cols) | 0) * cell, size, size);
        }
      }

      for (let j = 0; j < partial.length; j++) {
        const i = partial[j];
        const t = thresholds[i];
        const alpha = clamp01((p - t) / soft);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = bandW > 0 && t > p - bandW ? acc[accents[i]] : b;
        ctx.fillRect((i % cols) * cell, ((i / cols) | 0) * cell, size, size);
      }
      ctx.globalAlpha = 1;
    };

    const loop = () => {
      const d = target - current;
      if (Math.abs(d) < 0.0004) {
        current = target;
        draw();
        running = false;
        raf = 0;
        return;
      }
      current += d * chase;
      draw();
      raf = requestAnimationFrame(loop);
    };

    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };

    const onScroll = () => {
      target = shape(readProgress());
      start();
    };

    const tick = () => {
      target = shape(readProgress());
      current = target;
      draw();
    };

    build();
    tick();

    const scroller: HTMLElement | Window = scrollContainerRef?.current ?? window;
    scroller.addEventListener("scroll", onScroll, { passive: true });
    const onResize = () => {
      build();
      tick();
    };
    window.addEventListener("resize", onResize);
    const ro = new ResizeObserver(onResize);
    ro.observe(host);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      scroller.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      ro.disconnect();
    };
  }, [
    mode, colorA, colorB, direction, pattern, patternIntensity, easing,
    pixelSize, gap, endAt, accentShare, accentColors, scrollContainerRef,
    scrollInfluence, smoothing, softness, themeTick,
  ]);

  if (mode === "inline") {
    return (
      <div ref={rootRef} className={className} style={{ position: "relative", height, overflow: "hidden" }}>
        <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} aria-hidden="true" />
        {children ? <div style={{ position: "relative" }}>{children}</div> : null}
      </div>
    );
  }

  return (
    <div ref={rootRef} className={className} style={{ position: "relative", height: scrollHeight }}>
      <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}>
        <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} aria-hidden="true" />
        {children ? <div style={{ position: "relative", height: "100%" }}>{children}</div> : null}
      </div>
    </div>
  );
}
