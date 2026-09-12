"use client";

import * as React from "react";
import { useLang, mono, cut, toAr, CREAM, PLUM900, PERI } from "@/lib/ui";
import { Wrap, PxStyles } from "@/components/meetpixils/kit";

/* Pixel Shootout — carnival pop-up shooter with the MeetPixils characters.
   Clients pop up out of the floor slots: splat them for points.
   The rush client (recolored) is worth more and vanishes faster.
   Never, ever splat the pixel pet. 60 seconds. */

const W = 640, H = 420, TIME = 60;
const SLOTS = [
  { x: 40, y: 300 }, { x: 195, y: 300 }, { x: 350, y: 300 }, { x: 505, y: 300 },
  { x: 118, y: 165 }, { x: 272, y: 165 }, { x: 426, y: 165 },
];
type Kind = "client" | "rush" | "pet";
type Target = { slot: number; kind: Kind; born: number; ttl: number; hit?: number };

export default function Shootout() {
  const { ar } = useLang();
  const [phase, setPhase] = React.useState<"idle" | "play" | "end">("idle");
  const [hud, setHud] = React.useState({ score: 0, combo: 0, left: TIME, hits: 0, shots: 0 });
  const [best, setBest] = React.useState(0);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const game = React.useRef<{ targets: Target[]; score: number; combo: number; hits: number; shots: number;
                              started: number; lastSpawn: number; splats: { x: number; y: number; born: number; bad?: boolean }[];
                              cursor: { x: number; y: number } | null; raf: number }>({ targets: [], score: 0, combo: 0, hits: 0, shots: 0, started: 0, lastSpawn: 0, splats: [], cursor: null, raf: 0 });
  const imgs = React.useRef<{ client?: HTMLImageElement; pet?: HTMLImageElement }>({});
  const num = (n: number | string) => (ar ? toAr(n) : String(n));
  const audioRef = React.useRef<AudioContext | null>(null);
  const sfx = (kind: "shot" | "hit" | "bad") => {
    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ac = (audioRef.current ??= new AC());
      if (ac.state === "suspended") void ac.resume();
      const t0 = ac.currentTime;
      const o = ac.createOscillator(), g = ac.createGain();
      o.connect(g); g.connect(ac.destination);
      if (kind === "shot") {          // pixel pew: square dive-bomb
        o.type = "square";
        o.frequency.setValueAtTime(880, t0);
        o.frequency.exponentialRampToValueAtTime(150, t0 + 0.09);
        g.gain.setValueAtTime(0.07, t0);
        g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.1);
        o.start(t0); o.stop(t0 + 0.11);
      } else if (kind === "hit") {    // coin blip on top of the pew
        o.type = "square";
        o.frequency.setValueAtTime(660, t0 + 0.05);
        o.frequency.setValueAtTime(1040, t0 + 0.1);
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.setValueAtTime(0.055, t0 + 0.05);
        g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.18);
        o.start(t0 + 0.05); o.stop(t0 + 0.19);
      } else {                        // wrong: low saw buzz
        o.type = "sawtooth";
        o.frequency.setValueAtTime(140, t0);
        o.frequency.exponentialRampToValueAtTime(65, t0 + 0.18);
        g.gain.setValueAtTime(0.08, t0);
        g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.2);
        o.start(t0); o.stop(t0 + 0.21);
      }
    } catch {}
  };

  React.useEffect(() => { try { setBest(Number(localStorage.getItem("mp-shoot-best") || 0)); } catch {} }, []);
  React.useEffect(() => {
    const load = (src: string) => { const i = new Image(); i.src = src; return i; };
    imgs.current.client = load("/characters/target-client.png");
    imgs.current.pet = load("/characters/friendly-pet.png");
  }, []);

  const start = () => {
    game.current = { targets: [], score: 0, combo: 0, hits: 0, shots: 0, started: performance.now(), lastSpawn: 0, splats: [], cursor: null, raf: 0 };
    setHud({ score: 0, combo: 0, left: TIME, hits: 0, shots: 0 });
    setPhase("play");
  };

  // main loop
  React.useEffect(() => {
    if (phase !== "play") return;
    const cv = canvasRef.current!;
    const ctx = cv.getContext("2d")!;
    let live = true;

    const loop = (now: number) => {
      if (!live) return;
      const g = game.current;
      const t = (now - g.started) / 1000;
      const left = Math.max(0, TIME - t);
      const ramp = Math.min(1, t / 45); // difficulty 0→1

      // spawn
      const interval = 1050 - ramp * 520;
      if (now - g.lastSpawn > interval) {
        const free = SLOTS.map((_, i) => i).filter((i) => !g.targets.some((tg) => tg.slot === i && !tg.hit));
        if (free.length) {
          const slot = free[Math.floor(Math.random() * free.length)];
          const r = Math.random();
          const kind: Kind = r < 0.16 ? "pet" : r < 0.38 ? "rush" : "client";
          const ttl = (kind === "rush" ? 1050 : 1750) - ramp * (kind === "rush" ? 350 : 650);
          g.targets.push({ slot, kind, born: now, ttl });
          g.lastSpawn = now;
        }
      }
      g.targets = g.targets.filter((tg) => (tg.hit ? now - tg.hit < 260 : now - tg.born < tg.ttl));
      g.splats = g.splats.filter((s) => now - s.born < 420);

      // ---- draw ----
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#2F263B";
      ctx.fillRect(0, 0, W, H);
      // back wall grid
      ctx.strokeStyle = "rgba(255,254,236,.05)";
      for (let x = 0; x < W; x += 32) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += 32) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

      // characters rise out of slim floor slots
      g.targets.forEach((tg) => {
        const s = SLOTS[tg.slot];
        const img = tg.kind === "pet" ? imgs.current.pet : imgs.current.client;
        if (!img || !img.complete || !img.naturalWidth) return;
        const age = now - tg.born;
        const upT = 160;
        const p = tg.hit ? 1 : Math.min(1, age / upT);
        const sink = !tg.hit && tg.ttl - age < 200 ? (200 - (tg.ttl - age)) / 200 : 0;
        const rise = (p - sink) * 112;
        const iw = 92, ih = (img.naturalHeight / img.naturalWidth) * iw;
        const x = s.x, y = s.y - rise + 8;
        ctx.save();
        ctx.beginPath(); ctx.rect(0, 0, W, s.y + 6); ctx.clip(); // stay behind cover
        if (tg.kind === "rush") ctx.filter = "hue-rotate(150deg) saturate(1.3)";
        if (tg.hit) { ctx.globalAlpha = Math.max(0, 1 - (now - tg.hit) / 260); ctx.filter = (ctx.filter === "none" ? "" : ctx.filter + " ") + "brightness(1.8)"; }
        ctx.drawImage(img, x, y - ih + 20, iw, ih);
        ctx.restore();
      });
      SLOTS.forEach((s) => {
        ctx.fillStyle = "rgba(15,1,10,.6)";
        ctx.fillRect(s.x - 10, s.y + 2, 112, 7);
      });

      // splats
      g.splats.forEach((s) => {
        const a = 1 - (now - s.born) / 420;
        ctx.fillStyle = s.bad ? `rgba(255,90,60,${a})` : `rgba(239,82,41,${a})`;
        for (let k = 0; k < 7; k++) {
          const ang = (k / 7) * Math.PI * 2;
          const d = 6 + (1 - a) * 26;
          ctx.fillRect(s.x + Math.cos(ang) * d - 3, s.y + Math.sin(ang) * d - 3, 6, 6);
        }
      });

      // crosshair
      if (g.cursor) {
        ctx.strokeStyle = CREAM; ctx.lineWidth = 1.5;
        const { x, y } = g.cursor;
        ctx.beginPath(); ctx.arc(x, y, 11, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x - 17, y); ctx.lineTo(x - 5, y); ctx.moveTo(x + 5, y); ctx.lineTo(x + 17, y);
        ctx.moveTo(x, y - 17); ctx.lineTo(x, y - 5); ctx.moveTo(x, y + 5); ctx.lineTo(x, y + 17);
        ctx.stroke();
      }

      setHud({ score: g.score, combo: g.combo, left: Math.ceil(left), hits: g.hits, shots: g.shots });
      if (left <= 0) {
        live = false;
        setPhase("end");
        setBest((b) => {
          const nb = Math.max(b, g.score);
          try { localStorage.setItem("mp-shoot-best", String(nb)); } catch {}
          return nb;
        });
        return;
      }
      g.raf = requestAnimationFrame(loop);
    };
    game.current.raf = requestAnimationFrame(loop);
    return () => { live = false; cancelAnimationFrame(game.current.raf); };
  }, [phase]);

  const canvasPoint = (e: React.PointerEvent) => {
    const r = canvasRef.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
  };
  const onMove = (e: React.PointerEvent) => { if (phase === "play") game.current.cursor = canvasPoint(e); };
  const shoot = (e: React.PointerEvent) => {
    if (phase !== "play") return;
    const g = game.current;
    const { x, y } = canvasPoint(e);
    g.shots++;
    sfx("shot");
    const now = performance.now();
    // topmost target under the shot
    const under = [...g.targets].reverse().find((tg) => {
      if (tg.hit) return false;
      const s = SLOTS[tg.slot];
      return x > s.x - 8 && x < s.x + 104 && y > s.y - 110 && y < s.y + 40;
    });
    if (under) {
      under.hit = now;
      if (under.kind === "pet") {
        g.score = Math.max(0, g.score - 200); g.combo = 0;
        sfx("bad");
        g.splats.push({ x, y, born: now, bad: true });
      } else {
        g.combo++; g.hits++;
        g.score += (under.kind === "rush" ? 150 : 100) + g.combo * 10;
        sfx("hit");
        g.splats.push({ x, y, born: now });
      }
    } else {
      g.combo = 0;
      sfx("bad");
      g.splats.push({ x, y, born: now, bad: true });
    }
  };

  const acc = hud.shots ? Math.round((hud.hits / hud.shots) * 100) : 0;

  return (
    <div style={{ paddingTop: 92, minHeight: "100vh" }}>
      <PxStyles tint={PERI} />
      <Wrap style={{ maxWidth: 760, paddingBottom: "clamp(70px,11vh,120px)" }}>
        <nav aria-label="breadcrumb" style={{ ...mono, opacity: .55, margin: "10px 0 22px" }}>
          <a href="/play" className="u-link" style={{ color: CREAM, textDecoration: "none" }}>{ar ? "بكسل أركيد" : "Pixel Arcade"}</a>
          <span> / {ar ? "تصويب البكسل" : "Pixel Shootout"}</span>
        </nav>
        <h1 style={{ margin: "0 0 6px", fontSize: "clamp(26px,3.6vw,40px)", fontWeight: 800, letterSpacing: ar ? 0 : "-.03em" }}>
          {ar ? "تصويب البكسل" : "Pixel Shootout"}
        </h1>
        <p style={{ margin: "0 0 24px", fontSize: 14.5, color: "rgba(255,254,236,.68)", lineHeight: ar ? 1.85 : 1.6, maxWidth: "54ch" }}>
          {ar
            ? "الشخصيات بتطلع من الأرض — بقّعها قبل ما تختفي. المستعجل (الملوّن) نقاطه أكتر. وإوعى تبقّع البكسل الأليف."
            : "Characters pop up out of the floor — splat them before they duck back. The rush one (recolored) is worth more. And never splat the pixel pet."}
        </p>

        {phase === "idle" && (
          <div>
            {best > 0 && <p style={{ ...mono, color: PERI, margin: "0 0 16px" }}>{ar ? `أفضل نتيجة: ${num(best)}` : `Best: ${best}`}</p>}
            <button onClick={start} className="mp-btn" style={{ ["--wipe" as string]: CREAM, ["--wipe-fg" as string]: PLUM900, background: PERI, color: PLUM900, fontFamily: "var(--font-mono)", fontSize: 13.5, fontWeight: 700, padding: "16px 30px", border: 0, cursor: "pointer", ...cut(12) }}>
              {ar ? "ابدأ" : "Start"}<span className="arw" aria-hidden="true">→</span>
            </button>
          </div>
        )}

        {phase !== "idle" && (
          <div style={{ display: phase === "play" ? "block" : "none" }}>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 12, fontVariantNumeric: "tabular-nums" }}>
              <span style={{ ...mono, color: PERI }}>{ar ? `نقاط ${num(hud.score)}` : `Score ${hud.score}`}</span>
              <span style={{ ...mono, opacity: .8 }}>{ar ? `تتابع ×${num(hud.combo)}` : `Combo ×${hud.combo}`}</span>
              <span style={{ ...mono, marginInlineStart: "auto", color: hud.left <= 10 ? "#FF7A4F" : "rgba(255,254,236,.8)" }}>⏱ {num(hud.left)}{ar ? "" : "s"}</span>
            </div>
            <canvas ref={canvasRef} width={W} height={H} dir="ltr"
                    onPointerMove={onMove} onPointerDown={shoot}
                    onPointerLeave={() => { game.current.cursor = null; }}
                    aria-label={ar ? "ساحة التصويب" : "Shooting range"}
                    style={{ display: "block", width: "100%", maxWidth: 640, cursor: "none", touchAction: "manipulation",
                             border: "1px solid rgba(255,254,236,.18)", ...cut(16) }} />
          </div>
        )}

        {phase === "end" && (
          <div role="status" style={{ border: `1px solid ${PERI}`, padding: "30px 28px", ...cut(14) }}>
            <strong style={{ display: "block", fontSize: "clamp(30px,5vw,46px)", fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>{num(hud.score)}</strong>
            <p style={{ ...mono, color: PERI, margin: "8px 0 4px" }}>
              {ar ? `${num(hud.hits)} إصابة · دقة ${num(acc)}٪` : `${hud.hits} hits · ${acc}% accuracy`}
              {hud.score >= best && hud.score > 0 ? (ar ? " · رقمك الجديد!" : " · new best!") : ""}
            </p>
            <p style={{ ...mono, opacity: .55, margin: "0 0 18px" }}>{ar ? `أفضل نتيجة: ${num(Math.max(best, hud.score))}` : `Best: ${Math.max(best, hud.score)}`}</p>
            <button onClick={start} className="mp-btn" style={{ ["--wipe" as string]: CREAM, ["--wipe-fg" as string]: PLUM900, background: PERI, color: PLUM900, fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, padding: "14px 24px", border: 0, cursor: "pointer", ...cut(10) }}>
              {ar ? "عيدها" : "Play again"}
            </button>
          </div>
        )}
      </Wrap>
    </div>
  );
}
