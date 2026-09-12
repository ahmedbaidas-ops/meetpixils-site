"use client";

import * as React from "react";

/**
 * FlutedGlass — reeded/fluted glass over a soft luminous orb.
 *
 * How real fluted glass behaves: each vertical flute is a half-cylinder lens,
 * so it shows a *displaced and slightly magnified* slice of whatever is behind
 * it. The discontinuity at every flute edge is the whole effect.
 *
 * CSS cannot offset a backdrop, so each flute owns a full-width copy of the
 * background, shifted into place plus a per-flute refraction offset. That is
 * cheap here because the background is gradients, not a canvas — and it is the
 * reason this cannot be layered over the WebGL aurora (see fractal-glass.tsx).
 */

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

/** dark ground — full bleed */
const GROUND = "linear-gradient(180deg, #0A0812 0%, #0C0A1A 52%, #080610 100%)";

/**
 * The torus, composed inside a square so it stays a circle at any hero
 * aspect ratio. Painting these straight onto a wide box flattens the ring
 * into a horizontal band, which is the whole thing you are trying to avoid.
 */
const ORB = [
  // near-white core at the top of the ring
  "radial-gradient(30% 22% at 50% 24%, rgba(255,244,224,0.95) 0%, rgba(255,206,158,0.45) 42%, rgba(255,190,140,0) 72%)",
  // the ring — open centre makes it a torus
  "radial-gradient(closest-side circle at 50% 50%, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 34%, rgba(239,82,41,0.98) 52%, rgba(255,142,86,0.62) 66%, rgba(239,82,41,0) 92%)",
  // warm bloom under the ring
  "radial-gradient(52% 40% at 50% 88%, rgba(239,82,41,0.85) 0%, rgba(255,154,90,0.34) 46%, rgba(239,82,41,0) 80%)",
  // cool spill, lower left
  "radial-gradient(62% 58% at 12% 76%, rgba(46,120,239,0.85) 0%, rgba(46,190,239,0.3) 46%, rgba(46,190,239,0) 80%)",
  // cool spill, right
  "radial-gradient(52% 64% at 92% 44%, rgba(43,95,217,0.8) 0%, rgba(46,190,239,0.24) 50%, rgba(46,190,239,0) 82%)",
].join(", ");

export interface FlutedGlassProps {
  /** number of vertical flutes @default 22 */
  strips?: number;
  /** max horizontal refraction offset per flute, px @default 16 */
  amplitude?: number;
  /** per-flute magnification @default 1.06 */
  magnify?: number;
  /** grain opacity @default 0.5 */
  grain?: number;
  /** grain fineness — higher is finer @default 0.72 */
  grainScale?: number;
  /** seconds for one drift cycle; 0 disables motion @default 44 */
  drift?: number;
  /**
   * Overlay mode: draw no background of its own and flute whatever is already
   * behind (e.g. the live WebGL aurora). Gains real motion, loses lateral
   * displacement — backdrop-filter samples the pixels directly behind each
   * flute, so a translated flute moves the glass but not the image in it.
   */
  overlay?: boolean;
  /** overlay frost strength in px @default 5 */
  frost?: number;
  seed?: number;
  className?: string;
}

export function FlutedGlass({
  strips = 22,
  amplitude = 16,
  magnify = 1.06,
  grain = 0.5,
  grainScale = 0.72,
  drift = 44,
  overlay = false,
  frost = 5,
  seed = 11,
  className,
}: FlutedGlassProps) {
  const grainId = "mp-fluted-grain-" + seed;

  const flutes = React.useMemo(() => {
    const rnd = mulberry32(seed);
    return Array.from({ length: strips }, (_, i) => {
      // sine gives the regular cylindrical rhythm; jitter stops it reading as a pattern
      const wave = Math.sin(i * 0.85) * 0.62 + Math.sin(i * 2.3) * 0.38;
      return {
        offset: wave * amplitude + (rnd() - 0.5) * amplitude * 0.5,
        lift: 0.9 + rnd() * 0.22,
        // per-flute frost/lensing variance — the only displacement-free way to
        // make adjacent flutes read as separately ground pieces of glass
        blur: frost * (0.25 + rnd() * 1.5),
        sat: 1.0 + rnd() * 0.5,
        bright: 0.9 + Math.abs(wave) * 0.35 + rnd() * 0.12,
      };
    });
  }, [strips, amplitude, seed, frost]);

  const w = 100 / strips;

  return (
    <div
      aria-hidden="true"
      className={className}
      style={{ position: "absolute", inset: 0, overflow: "hidden" }}
    >
      <style>{`
        @keyframes mpFlutedDrift {
          0%   { transform: translate3d(0,0,0) scale(1.04); }
          50%  { transform: translate3d(-2.2%, 1.6%, 0) scale(1.1); }
          100% { transform: translate3d(0,0,0) scale(1.04); }
        }
        @media (prefers-reduced-motion: reduce) {
          .mp-flute-inner { animation: none !important; }
        }
      `}</style>

      {flutes.map((f, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: 0,
            left: `${i * w}%`,
            width: `calc(${w}% + 1px)`,
            height: "100%",
            overflow: "hidden",
          }}
        >
          {overlay ? (
            <div
              style={{
                position: "absolute",
                inset: 0,
                backdropFilter: `blur(${f.blur.toFixed(2)}px) saturate(${f.sat.toFixed(2)}) brightness(${f.bright.toFixed(2)})`,
                WebkitBackdropFilter: `blur(${f.blur.toFixed(2)}px) saturate(${f.sat.toFixed(2)}) brightness(${f.bright.toFixed(2)})`,
              }}
            />
          ) : (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: `calc(${-i * w}% + ${f.offset}px)`,
              width: `${strips * 100}%`,
              height: "100%",
              background: GROUND,
              filter: `brightness(${f.lift.toFixed(3)})`,
            }}
          >
            <div
              className="mp-flute-inner"
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                height: "150%",
                aspectRatio: "1",
                marginTop: "-75%",
                marginLeft: "-75%",
                background: ORB,
                transform: `scale(${magnify})`,
                animation: drift ? `mpFlutedDrift ${drift}s ease-in-out infinite` : undefined,
                animationDelay: `${-(i * 0.35)}s`,
              }}
            />
          </div>
          )}
          {/* cylinder shading — dark at the flute edges, bright down the centre */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(90deg, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0.04) 24%, rgba(255,255,255,0.09) 48%, rgba(0,0,0,0.06) 74%, rgba(0,0,0,0.28) 100%)",
            }}
          />
          {/* specular seam */}
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              width: 1,
              background: "rgba(255,255,255,0.10)",
            }}
          />
        </div>
      ))}

      {/* film grain */}
      <svg
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          mixBlendMode: "overlay",
          opacity: grain,
          pointerEvents: "none",
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
