"use client";

import * as React from "react";

/**
 * Cursor effects — ported from the Mouse Effects reference pack.
 *
 * Each effect is self-contained: it mounts its own overlay, attaches window
 * listeners, and tears everything down on unmount. None require GSAP — the
 * originals' spring/stagger behaviour is reproduced with rAF so the site
 * carries no extra runtime dependency.
 *
 * All are suppressed on touch and under prefers-reduced-motion (see useEnabled).
 */

export const CURSOR_EFFECTS = [
  { id: "none", label: "None", note: "Default pointer" },
  { id: "ribbon", label: "Ribbon", note: "Tapering spring trail · canvas" },
  { id: "follower", label: "Follower", note: "Lerped dot, grows on targets" },
  { id: "pixels", label: "Pixel grid", note: "Cells ignite under the cursor" },
  { id: "brush", label: "Brush", note: "Paints with the arm palette" },
  { id: "text", label: "Word trail", note: "Staggered labels chase the cursor" },
  { id: "images", label: "Image trail", note: "Spawns brand characters" },
] as const;

export type CursorEffectId = (typeof CURSOR_EFFECTS)[number]["id"];

const ORANGE = "#EF5229";
const LILAC = "#CCA4FD";
const CYAN = "#2EBEEF";
const CREAM = "#FFFEEC";

/** effects stay off for touch pointers and reduced-motion users */
function useEnabled() {
  const [ok, setOk] = React.useState(false);
  React.useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setOk(fine && !calm);
  }, []);
  return ok;
}

/** shared full-viewport canvas with DPR handling */
function useCanvas(draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void, deps: unknown[]) {
  const ref = React.useRef<HTMLCanvasElement>(null);
  React.useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = window.innerWidth * dpr;
      cv.height = window.innerHeight * dpr;
      cv.style.width = window.innerWidth + "px";
      cv.style.height = window.innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);
    const loop = () => {
      draw(ctx, window.innerWidth, window.innerHeight);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return ref;
}

const layer: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  pointerEvents: "none",
  zIndex: 90,
};

/* ---------------------------------------------------------------- Ribbon
   Port of the 3kb curly-cursor: 40 trail points, spring .4 / friction .5,
   drawn as quadratic curves with the width tapering along the tail. */
function Ribbon({ color }: { color: string }) {
  const pointer = React.useRef({ x: 0, y: 0 });
  const moved = React.useRef(false);
  const trail = React.useRef(
    Array.from({ length: 40 }, () => ({ x: 0, y: 0, dx: 0, dy: 0 })),
  );

  React.useEffect(() => {
    pointer.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    trail.current.forEach((p) => {
      p.x = pointer.current.x;
      p.y = pointer.current.y;
    });
    const move = (e: MouseEvent) => {
      moved.current = true;
      pointer.current.x = e.clientX;
      pointer.current.y = e.clientY;
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  const ref = useCanvas((ctx, w, h) => {
    const t = performance.now();
    if (!moved.current) {
      pointer.current.x = (0.5 + 0.3 * Math.cos(0.002 * t) * Math.sin(0.005 * t)) * w;
      pointer.current.y = (0.5 + 0.2 * Math.cos(0.005 * t) + 0.1 * Math.cos(0.01 * t)) * h;
    }
    ctx.clearRect(0, 0, w, h);
    const pts = trail.current;
    pts.forEach((p, i) => {
      const prev = i === 0 ? pointer.current : pts[i - 1];
      const spring = i === 0 ? 0.4 * 0.4 : 0.4;
      p.dx += (prev.x - p.x) * spring;
      p.dy += (prev.y - p.y) * spring;
      p.dx *= 0.5;
      p.dy *= 0.5;
      p.x += p.dx;
      p.y += p.dy;
    });
    ctx.strokeStyle = color;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length - 1; i++) {
      const xc = 0.5 * (pts[i].x + pts[i + 1].x);
      const yc = 0.5 * (pts[i].y + pts[i + 1].y);
      ctx.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc);
      ctx.lineWidth = 0.3 * (pts.length - i);
      ctx.stroke();
    }
    ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
    ctx.stroke();
  }, [color]);

  return <canvas ref={ref} style={layer} aria-hidden="true" />;
}

/* -------------------------------------------------------------- Follower
   Port of canvas-cursor: lerp 0.25 toward the pointer, radius 10 easing to
   3× while over anything marked data-cursor-target. */
function Follower({ color }: { color: string }) {
  const mouse = React.useRef({ x: 0, y: 0 });
  const pos = React.useRef({ x: 0, y: 0 });
  const radius = React.useRef(10);
  const target = React.useRef(10);

  React.useEffect(() => {
    const move = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };
    const over = (e: MouseEvent) => {
      const el = (e.target as HTMLElement)?.closest?.("[data-cursor-target]");
      target.current = el ? 30 : 10;
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
    };
  }, []);

  const ref = useCanvas((ctx, w, h) => {
    pos.current.x += (mouse.current.x - pos.current.x) * 0.25;
    pos.current.y += (mouse.current.y - pos.current.y) * 0.25;
    radius.current += (target.current - radius.current) * 0.15;
    ctx.clearRect(0, 0, w, h);
    ctx.beginPath();
    ctx.arc(pos.current.x, pos.current.y, Math.max(radius.current, 0.5), 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.9;
    ctx.fill();
    ctx.globalAlpha = 1;
  }, [color]);

  return <canvas ref={ref} style={{ ...layer, mixBlendMode: "difference" }} aria-hidden="true" />;
}

/* ----------------------------------------------------------------- Brush
   Additive canvas painting: strokes accumulate and fade, hue cycling through
   the arm palette rather than a rainbow. */
function Brush() {
  const pts = React.useRef<{ x: number; y: number; life: number; hue: number }[]>([]);
  const last = React.useRef({ x: 0, y: 0, has: false });

  React.useEffect(() => {
    const move = (e: MouseEvent) => {
      const p = last.current;
      if (p.has) {
        const dx = e.clientX - p.x;
        const dy = e.clientY - p.y;
        const dist = Math.hypot(dx, dy);
        const steps = Math.min(Math.ceil(dist / 6), 12);
        for (let i = 0; i < steps; i++) {
          pts.current.push({
            x: p.x + (dx * i) / steps,
            y: p.y + (dy * i) / steps,
            life: 1,
            hue: (performance.now() / 22) % 360,
          });
        }
      }
      last.current = { x: e.clientX, y: e.clientY, has: true };
      if (pts.current.length > 900) pts.current.splice(0, pts.current.length - 900);
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  const palette = [ORANGE, LILAC, CYAN];
  const ref = useCanvas((ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = "lighter";
    pts.current.forEach((p) => {
      p.life -= 0.012;
      if (p.life <= 0) return;
      const c = palette[Math.floor(p.hue / 120) % palette.length];
      ctx.beginPath();
      ctx.arc(p.x, p.y, 16 * p.life, 0, Math.PI * 2);
      ctx.fillStyle = c;
      ctx.globalAlpha = 0.16 * p.life;
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    pts.current = pts.current.filter((p) => p.life > 0);
  }, []);

  return <canvas ref={ref} style={layer} aria-hidden="true" />;
}

/* ------------------------------------------------------------ Pixel grid
   Port of the GSAP pixel-trail: a 20-column grid whose cells flash the accent
   on pointer entry and fade over 300ms. Done with CSS transitions, no GSAP. */
function Pixels({ color }: { color: string }) {
  const [dims, setDims] = React.useState({ cols: 20, rows: 12, size: 60 });
  const host = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const measure = () => {
      const size = window.innerWidth * (window.innerWidth <= 900 ? 0.08 : 0.05);
      setDims({
        cols: Math.ceil(window.innerWidth / size),
        rows: Math.ceil(window.innerHeight / size),
        size,
      });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  React.useEffect(() => {
    const el = host.current;
    if (!el) return;
    const move = (e: MouseEvent) => {
      const c = Math.floor(e.clientX / dims.size);
      const r = Math.floor(e.clientY / dims.size);
      const cell = el.querySelector<HTMLElement>(`[data-c="${c}-${r}"]`);
      if (!cell) return;
      cell.style.transition = "none";
      cell.style.opacity = "1";
      requestAnimationFrame(() => {
        cell.style.transition = "opacity 300ms linear";
        cell.style.opacity = "0";
      });
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [dims]);

  return (
    <div ref={host} style={layer} aria-hidden="true">
      {Array.from({ length: dims.rows }).map((_, r) =>
        Array.from({ length: dims.cols }).map((_, c) => (
          <div
            key={`${c}-${r}`}
            data-c={`${c}-${r}`}
            style={{
              position: "absolute",
              left: c * dims.size,
              top: r * dims.size,
              width: dims.size,
              height: dims.size,
              background: color,
              opacity: 0,
            }}
          />
        )),
      )}
    </div>
  );
}

/* ------------------------------------------------------------- Word trail
   Port of the GSAP stagger trail: N labels chase the pointer, each lagging
   the one before it. The original used stagger each:-0.02; here every label
   lerps toward its predecessor, which produces the same read. */
const WORDS = ["Compete", "Learn", "Meet", "Build", "Ship", "Judge", "Win"];

function WordTrail({ color }: { color: string }) {
  const refs = React.useRef<(HTMLSpanElement | null)[]>([]);
  const pts = React.useRef(WORDS.map(() => ({ x: -200, y: -200 })));
  const mouse = React.useRef({ x: -200, y: -200 });

  React.useEffect(() => {
    const move = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", move);
    let raf = 0;
    const loop = () => {
      pts.current.forEach((p, i) => {
        const t = i === 0 ? mouse.current : pts.current[i - 1];
        p.x += (t.x - p.x) * 0.24;
        p.y += (t.y - p.y) * 0.24;
        const el = refs.current[i];
        if (el) el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) translate(-50%, -50%)`;
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", move);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div style={layer} aria-hidden="true">
      {WORDS.map((wd, i) => (
        <span
          key={wd}
          ref={(el) => {
            refs.current[i] = el;
          }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            font: "600 15px/1 ui-sans-serif, system-ui, sans-serif",
            letterSpacing: "-0.01em",
            color,
            opacity: 1 - i / (WORDS.length + 1),
            whiteSpace: "nowrap",
          }}
        >
          {wd}
        </span>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------ Image trail
   Port of the image-trail family: after the pointer travels a threshold
   distance, the next image in the set is placed and fades out. */
const IMAGES = ["/characters/running-2.png", "/characters/money-1.png", "/characters/image-222.png"];

function ImageTrail() {
  const host = React.useRef<HTMLDivElement>(null);
  const last = React.useRef({ x: 0, y: 0, has: false });
  const idx = React.useRef(0);

  React.useEffect(() => {
    // decode up front — without this the first pass through the set spawns
    // <img> elements that are removed before they finish loading
    IMAGES.forEach((src) => {
      const pre = new Image();
      pre.src = src;
    });
  }, []);

  React.useEffect(() => {
    const el = host.current;
    if (!el) return;
    const move = (e: MouseEvent) => {
      const p = last.current;
      if (p.has && Math.hypot(e.clientX - p.x, e.clientY - p.y) < 110) return;
      last.current = { x: e.clientX, y: e.clientY, has: true };

      const img = document.createElement("img");
      img.src = IMAGES[idx.current % IMAGES.length];
      idx.current += 1;
      const rot = (Math.random() - 0.5) * 26;
      img.style.cssText = `position:absolute;left:${e.clientX}px;top:${e.clientY}px;width:150px;height:auto;
        transform:translate(-50%,-50%) scale(0.7) rotate(${rot}deg);opacity:0;
        transition:transform 600ms cubic-bezier(.16,1,.3,1),opacity 600ms cubic-bezier(.16,1,.3,1);
        will-change:transform,opacity;`;
      el.appendChild(img);
      requestAnimationFrame(() => {
        img.style.opacity = "1";
        img.style.transform = `translate(-50%,-50%) scale(1) rotate(${rot}deg)`;
      });
      window.setTimeout(() => {
        img.style.opacity = "0";
        img.style.transform = `translate(-50%,-40%) scale(0.92) rotate(${rot}deg)`;
      }, 380);
      window.setTimeout(() => img.remove(), 1100);
    };
    window.addEventListener("mousemove", move);
    return () => {
      window.removeEventListener("mousemove", move);
      el.innerHTML = "";
    };
  }, []);

  return <div ref={host} style={layer} aria-hidden="true" />;
}

export function CursorEffect({
  effect,
  color = ORANGE,
}: {
  effect: CursorEffectId;
  color?: string;
}) {
  const enabled = useEnabled();
  if (!enabled || effect === "none") return null;
  switch (effect) {
    case "ribbon":
      return <Ribbon color={color} />;
    case "follower":
      return <Follower color={CREAM} />;
    case "pixels":
      return <Pixels color={color} />;
    case "brush":
      return <Brush />;
    case "text":
      return <WordTrail color={color} />;
    case "images":
      return <ImageTrail />;
    default:
      return null;
  }
}
