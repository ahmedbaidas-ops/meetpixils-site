"use client";

import * as React from "react";
import { useLang, mono, cut, toAr, CREAM, PLUM900, CYAN } from "@/lib/ui";
import { Wrap, PxStyles } from "@/components/meetpixils/kit";

/* Pixel Perfect — one cell in the grid is a shade off. Click it.
   The grid grows and the difference shrinks. 60 seconds, 3 lives. */

const TIME = 60;

export default function PixelPerfect() {
  const { ar } = useLang();
  const [phase, setPhase] = React.useState<"idle" | "play" | "end">("idle");
  const [level, setLevel] = React.useState(1);
  const [lives, setLives] = React.useState(3);
  const [score, setScore] = React.useState(0);
  const [left, setLeft] = React.useState(TIME);
  const [board, setBoard] = React.useState<{ g: number; odd: number; base: string; oddC: string }>({ g: 3, odd: 0, base: "", oddC: "" });
  const [flash, setFlash] = React.useState<"" | "hit" | "miss">("");
  const [best, setBest] = React.useState(0);
  const num = (n: number | string) => (ar ? toAr(n) : String(n));

  React.useEffect(() => { try { setBest(Number(localStorage.getItem("mp-pp-best") || 0)); } catch {} }, []);

  const roll = React.useCallback((lv: number) => {
    const g = Math.min(3 + Math.floor((lv - 1) / 2), 8);
    const h = Math.floor(Math.random() * 360);
    const sat = 58 + Math.random() * 20;
    const li = 50 + Math.random() * 12;
    const d = Math.max(16 - (lv - 1) * 1.4, 3.5) * (Math.random() > 0.5 ? 1 : -1);
    setBoard({ g, odd: Math.floor(Math.random() * g * g), base: `hsl(${h} ${sat}% ${li}%)`, oddC: `hsl(${h} ${sat}% ${li + d}%)` });
  }, []);

  React.useEffect(() => {
    if (phase !== "play") return;
    const t = window.setInterval(() => setLeft((s) => s - 1), 1000);
    return () => window.clearInterval(t);
  }, [phase]);

  React.useEffect(() => {
    if (phase === "play" && (left <= 0 || lives <= 0)) {
      setPhase("end");
      setBest((b) => {
        const nb = Math.max(b, score);
        try { localStorage.setItem("mp-pp-best", String(nb)); } catch {}
        return nb;
      });
    }
  }, [left, lives, phase, score]);

  const start = () => { setLevel(1); setLives(3); setScore(0); setLeft(TIME); roll(1); setPhase("play"); };
  const pick = (i: number) => {
    if (phase !== "play") return;
    if (i === board.odd) {
      setScore((s) => s + 10 + level * 5);
      setLevel((l) => l + 1);
      roll(level + 1);
      setFlash("hit");
    } else {
      setLives((l) => l - 1);
      setFlash("miss");
    }
    window.setTimeout(() => setFlash(""), 220);
  };

  return (
    <div style={{ paddingTop: 92, minHeight: "100vh" }}>
      <PxStyles tint={CYAN} />
      <Wrap style={{ maxWidth: 720, paddingBottom: "clamp(70px,11vh,120px)" }}>
        <nav aria-label="breadcrumb" style={{ ...mono, opacity: .55, margin: "10px 0 22px" }}>
          <a href="/play" className="u-link" style={{ color: CREAM, textDecoration: "none" }}>{ar ? "بكسل أركيد" : "Pixel Arcade"}</a>
          <span> / {ar ? "بكسل مظبوط" : "Pixel Perfect"}</span>
        </nav>
        <h1 style={{ margin: "0 0 6px", fontSize: "clamp(26px,3.6vw,40px)", fontWeight: 800, letterSpacing: ar ? 0 : "-.03em" }}>
          {ar ? "بكسل مظبوط" : "Pixel Perfect"}
        </h1>
        <p style={{ margin: "0 0 26px", fontSize: 14.5, color: "rgba(255,254,236,.68)", lineHeight: ar ? 1.85 : 1.6, maxWidth: "52ch" }}>
          {ar ? "بكسل واحد لونه مختلف شوي. القطه. الشبكة بتكبر والفرق بيصغر — ٦٠ ثانية وثلاث أرواح." : "One pixel is a shade off. Catch it. The grid grows, the difference shrinks — 60 seconds, three lives."}
        </p>

        {phase === "idle" && (
          <div>
            {best > 0 && <p style={{ ...mono, color: CYAN, margin: "0 0 16px" }}>{ar ? `أفضل نتيجة: ${num(best)}` : `Best: ${best}`}</p>}
            <button onClick={start} className="mp-btn" style={{ ["--wipe" as string]: CREAM, ["--wipe-fg" as string]: PLUM900, background: CYAN, color: PLUM900, fontFamily: "var(--font-mono)", fontSize: 13.5, fontWeight: 700, padding: "16px 30px", border: 0, cursor: "pointer", ...cut(12) }}>
              {ar ? "ابدأ" : "Start"}<span className="arw" aria-hidden="true">→</span>
            </button>
          </div>
        )}

        {phase === "play" && (
          <div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 16, fontVariantNumeric: "tabular-nums" }}>
              <span style={{ ...mono, color: CYAN }}>{ar ? `مستوى ${num(level)}` : `Level ${level}`}</span>
              <span style={{ ...mono, opacity: .8 }}>{ar ? `نقاط ${num(score)}` : `Score ${score}`}</span>
              <span style={{ ...mono, opacity: .8 }} aria-label={ar ? "الأرواح" : "Lives"}>{"■".repeat(lives)}{"□".repeat(3 - lives)}</span>
              <span style={{ ...mono, marginInlineStart: "auto", color: left <= 10 ? "#FF7A4F" : "rgba(255,254,236,.8)" }}>
                {ar ? `⏱ ${num(left)}` : `⏱ ${left}s`}
              </span>
            </div>
            <div className={flash ? `pp-grid ${flash}` : "pp-grid"}
                 style={{ display: "grid", gap: 6, gridTemplateColumns: `repeat(${board.g}, 1fr)`, maxWidth: 480, ...cut(16), padding: 10, border: "1px solid rgba(255,254,236,.18)" }}>
              {Array.from({ length: board.g * board.g }, (_, i) => (
                <button key={`${level}-${i}`} onClick={() => pick(i)}
                        aria-label={ar ? `خلية ${num(i + 1)}` : `Cell ${i + 1}`}
                        style={{ aspectRatio: "1", border: 0, cursor: "pointer", borderRadius: 0,
                                 background: i === board.odd ? board.oddC : board.base, ...cut(6) }} />
              ))}
            </div>
          </div>
        )}

        {phase === "end" && (
          <div role="status" style={{ border: `1px solid ${CYAN}`, padding: "30px 28px", ...cut(14) }}>
            <strong style={{ display: "block", fontSize: "clamp(30px,5vw,46px)", fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>{num(score)}</strong>
            <p style={{ ...mono, color: CYAN, margin: "8px 0 4px" }}>
              {ar ? `وصلت مستوى ${num(level)}` : `Reached level ${level}`}{score >= best && score > 0 ? (ar ? " · رقمك الجديد!" : " · new best!") : ""}
            </p>
            <p style={{ ...mono, opacity: .55, margin: "0 0 18px" }}>{ar ? `أفضل نتيجة: ${num(Math.max(best, score))}` : `Best: ${Math.max(best, score)}`}</p>
            <button onClick={start} className="mp-btn" style={{ ["--wipe" as string]: CREAM, ["--wipe-fg" as string]: PLUM900, background: CYAN, color: PLUM900, fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, padding: "14px 24px", border: 0, cursor: "pointer", ...cut(10) }}>
              {ar ? "عيدها" : "Play again"}
            </button>
          </div>
        )}
        <style>{`
          .pp-grid.hit { animation: pphit 220ms }
          .pp-grid.miss { animation: ppmiss 220ms }
          @keyframes pphit { 50% { transform: scale(1.015) } }
          @keyframes ppmiss { 25% { transform: translateX(-4px) } 75% { transform: translateX(4px) } }
          @media (prefers-reduced-motion: reduce) { .pp-grid.hit, .pp-grid.miss { animation: none } }
          .pp-grid button:focus-visible { outline: 2px solid ${CYAN}; outline-offset: 2px }
        `}</style>
      </Wrap>
    </div>
  );
}
