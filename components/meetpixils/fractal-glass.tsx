"use client";

import * as React from "react";

/**
 * FractalGlass — a refracting glass layer for T0 ambient surfaces.
 *
 * Two things make it "fractal":
 *  1. Structure — the plane is recursively subdivided into shards, always
 *     splitting the longer axis so nothing degenerates into a sliver.
 *  2. Refraction — an feTurbulence(fractalNoise) field drives an
 *     feDisplacementMap applied as a backdrop-filter, so each shard bends
 *     the aurora actually behind it rather than faking a frost.
 *
 * Playbook §08: this is Tier 0. It is decorative, so it is aria-hidden,
 * pointer-events:none, and must be switched off with the rest of the
 * ambient layer under reduced-motion and on mobile.
 */

/**
 * Two Chrome constraints discovered the hard way, both specific to a WebGL source:
 *   1. `backdrop-filter: url(#svgFilter)` parses (CSS.supports says true) but does
 *      not render — the backdrop samples as empty black.
 *   2. `filter: url(#svgFilter)` on an element containing a WebGL canvas also
 *      renders black.
 * So displacement-based refraction is unavailable over a live canvas. The fractal
 * character comes from three things that DO render: recursive shard subdivision,
 * per-pane frosting via backdrop-filter *functions*, and a turbulence grain drawn
 * on an SVG element (never over the canvas) and blended on top.
 */

type Rect = { x: number; y: number; w: number; h: number };

/** deterministic PRNG — Math.random would desync SSR and hydration */
function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function subdivide(rect: Rect, depth: number, rnd: () => number, out: Rect[]) {
  if (depth === 0 || (rect.w < 9 && rect.h < 9)) {
    out.push(rect);
    return;
  }
  const t = 0.3 + rnd() * 0.4; // 0.30–0.70 — never a perfect half
  if (rect.w >= rect.h) {
    subdivide({ ...rect, w: rect.w * t }, depth - 1, rnd, out);
    subdivide(
      { x: rect.x + rect.w * t, y: rect.y, w: rect.w * (1 - t), h: rect.h },
      depth - 1,
      rnd,
      out,
    );
  } else {
    subdivide({ ...rect, h: rect.h * t }, depth - 1, rnd, out);
    subdivide(
      { x: rect.x, y: rect.y + rect.h * t, w: rect.w, h: rect.h * (1 - t) },
      depth - 1,
      rnd,
      out,
    );
  }
}

export interface FractalGlassProps {
  /** recursion depth — shard count is 2^depth. @default 4 (16 shards) */
  depth?: number;
  /** turbulence grain opacity @default 0.16 */
  grain?: number;
  /** grain fineness — higher is finer @default 0.78 */
  grainScale?: number;
  /** base backdrop blur in px @default 3 */
  blur?: number;
  /** turbulence base frequency @default 0.01 */
  frequency?: number;
  /** gap between shards in px @default 2 */
  gap?: number;
  /** overall layer opacity @default 1 */
  opacity?: number;
  seed?: number;
  className?: string;
}

export function FractalGlass({
  depth = 4,
  grain = 0.16,
  grainScale = 0.78,
  blur = 3,
  frequency = 0.01,
  gap = 2,
  opacity = 1,
  seed = 7,
  className,
}: FractalGlassProps) {
  const grainId = "mp-fg-grain-" + seed;

  const shards = React.useMemo(() => {
    const rnd = mulberry32(seed);
    const out: Rect[] = [];
    subdivide({ x: 0, y: 0, w: 100, h: 100 }, depth, rnd, out);
    // a second pass of per-shard variance, same stream so it stays deterministic
    return out.map((r) => ({
      ...r,
      blur: blur * (0.35 + rnd() * 1.3),
      sheen: Math.round(rnd() * 360),
      tint: 0.03 + rnd() * 0.08,
      edge: 0.12 + rnd() * 0.2,
      bright: 0.94 + rnd() * 0.16,
      sat: 1.05 + rnd() * 0.45,
    }));
  }, [depth, blur, seed]);

  return (
    <div
      aria-hidden="true"
      className={className}
      style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity }}
    >
      {shards.map((s, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `calc(${s.x}% + ${gap / 2}px)`,
            top: `calc(${s.y}% + ${gap / 2}px)`,
            width: `calc(${s.w}% - ${gap}px)`,
            height: `calc(${s.h}% - ${gap}px)`,
            borderRadius: 3,
            backdropFilter: `blur(${s.blur.toFixed(2)}px) saturate(${s.sat.toFixed(2)}) brightness(${s.bright.toFixed(2)})`,
            WebkitBackdropFilter: `blur(${s.blur.toFixed(2)}px) saturate(${s.sat.toFixed(2)}) brightness(${s.bright.toFixed(2)})`,
            background: `linear-gradient(${s.sheen}deg, rgba(255,255,255,${s.tint.toFixed(3)}) 0%, rgba(255,255,255,0) 45%, rgba(255,255,255,${(s.tint * 0.5).toFixed(3)}) 100%)`,
            boxShadow: `inset 0 1px 0 rgba(255,255,255,${s.edge.toFixed(3)}), inset 0 -1px 0 rgba(0,0,0,0.14)`,
            border: `1px solid rgba(255,255,255,${(s.edge * 0.55).toFixed(3)})`,
          }}
        />
      ))}

      {/* fractal grain — turbulence on an SVG element, blended over the panes.
          This is the one place the fractal noise can actually render. */}
      <svg
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          mixBlendMode: "soft-light",
          opacity: grain,
        }}
      >
        <defs>
          <filter id={grainId} x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency={`${grainScale} ${grainScale}`}
              numOctaves={3}
              seed={seed}
              stitchTiles="stitch"
            />
          </filter>
        </defs>
        <rect width="100%" height="100%" filter={`url(#${grainId})`} />
      </svg>
    </div>
  );
}
