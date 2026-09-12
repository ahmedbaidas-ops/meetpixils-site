"use client";

import * as React from "react";
import { MeetMark } from "./mark";
import { mono, cut, PLUM, PLUM900, CREAM } from "@/lib/ui";

/** Section landing header — skinned ground, masked grid, pointer spotlight. */
export function SectionHero({ tint, fg = PLUM, accent = "#EF5229", kicker, title, dek, ar = false, children }: {
  tint: string; fg?: string; accent?: string; kicker: string; title: string; dek?: string; ar?: boolean; children?: React.ReactNode;
}) {
  // Static pixel-cluster ornament — blocks echo the mark's corner language.
  // [size, x-from-end, y, opacity, delay-ms]
  const blocks: [number, number, number, number, number][] = [
    [52, 34, 60, 1, 0], [26, 108, 126, .8, 90], [18, 34, 134, .55, 180],
    [32, 130, 42, .9, 45], [14, 88, 88, .45, 240], [22, 168, 96, .65, 135],
  ];
  return (
    <section className="px-hero" style={{ position: "relative", overflow: "hidden", background: tint, color: fg, paddingTop: 92 }}>
      <div aria-hidden="true" className="px-orn">
        {blocks.map(([sz, x, y, op, d], i) => (
          <span key={i} style={{ position: "absolute", insetInlineEnd: x, top: y, width: sz, height: sz,
                                 background: accent, opacity: 0,
                                 clipPath: `polygon(${sz / 4}px 0,100% 0,100% calc(100% - ${sz / 4}px),calc(100% - ${sz / 4}px) 100%,0 100%,0 ${sz / 4}px)`,
                                 animation: `px-pop 560ms cubic-bezier(.16,1,.3,1) ${d}ms both`,
                                 ["--op" as string]: op }} />
        ))}
      </div>
      <div style={{ maxWidth: 1480, margin: "0 auto", padding: "0 clamp(20px,5vw,64px) clamp(44px,7vh,84px)", position: "relative", zIndex: 2 }}>
        <div className="px-h-a" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
          <span aria-hidden="true" style={{ width: 10, height: 10, background: accent, flex: "0 0 auto",
                clipPath: "polygon(3px 0,100% 0,100% calc(100% - 3px),calc(100% - 3px) 100%,0 100%,0 3px)" }} />
          <span style={{ ...mono, opacity: .68 }}>{kicker}</span>
        </div>
        <h1 className="px-h-b" style={{ margin: 0, maxWidth: "15ch", fontSize: "clamp(40px,7vw,92px)", fontWeight: 800,
                     letterSpacing: ar ? 0 : "-.045em", lineHeight: ar ? 1.3 : .98, textWrap: "balance" }}>{title}</h1>
        {dek && <p className="px-h-c" style={{ margin: "18px 0 0", maxWidth: "46ch", fontSize: "clamp(15px,1.7vw,18px)",
                            lineHeight: ar ? 1.9 : 1.55, opacity: .74 }}>{dek}</p>}
        {children}
      </div>
      <div aria-hidden="true" style={{ position: "absolute", insetInline: 0, bottom: 0, height: 6, opacity: .4,
           background: `repeating-linear-gradient(90deg, ${accent} 0 16px, transparent 16px 40px)` }} />
      <style>{`
        @keyframes px-pop { from { opacity: 0; transform: translateY(10px) scale(.7) } to { opacity: var(--op); transform: none } }
        @keyframes px-rise { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: none } }
        .px-h-a { animation: px-rise 560ms cubic-bezier(.16,1,.3,1) both }
        .px-h-b { animation: px-rise 620ms cubic-bezier(.16,1,.3,1) 70ms both }
        .px-h-c { animation: px-rise 680ms cubic-bezier(.16,1,.3,1) 140ms both }
        .px-orn { position: absolute; top: 92px; inset-inline-end: clamp(16px,4vw,60px); width: 210px; height: 200px; z-index: 1 }
        @media (max-width: 760px) { .px-orn { display: none } }
        @media (prefers-reduced-motion: reduce) {
          .px-h-a, .px-h-b, .px-h-c { animation: none }
          .px-orn span { animation: none; opacity: var(--op) }
        }
      `}</style>
    </section>
  );
}

export const Wrap: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ maxWidth: 1480, margin: "0 auto", padding: "0 clamp(20px,5vw,64px)", ...style }}>{children}</div>
);

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 7, fontSize: 13, fontWeight: 600 }}>
      {label}
      {children}
    </label>
  );
}

export const inputStyle: React.CSSProperties = {
  fontFamily: "inherit", fontSize: 14, minHeight: 46, padding: "12px 14px",
  background: "rgba(255,254,236,.05)", color: "#FFFEEC",
  border: "1px solid rgba(255,254,236,.22)", borderRadius: 0, outline: "none",
};

/** shared page styles — cards, rows, inputs. Include once per page. */
export function PxStyles({ tint = "#EF5229" }: { tint?: string }) {
  return (
    <style>{`
      .px-card { position: relative; display: flex; flex-direction: column; gap: 12px;
        padding: 24px 26px; text-decoration: none; color: #FFFEEC;
        background: rgba(255,254,236,.03); box-shadow: inset 0 0 0 1px rgba(255,254,236,.12);
        clip-path: polygon(16px 0,100% 0,100% calc(100% - 16px),calc(100% - 16px) 100%,0 100%,0 16px);
        transition: transform .45s cubic-bezier(.16,1,.3,1), box-shadow .45s }
      .px-card:hover { transform: translateY(-5px); box-shadow: inset 0 0 0 1px var(--tint, ${tint}) }
      .px-card:focus-visible { outline: 2px solid var(--tint, ${tint}); outline-offset: 3px }
      .px-row { display: flex; align-items: center; gap: 18px; padding: 20px 4px;
        border-bottom: 1px solid rgba(255,254,236,.1); text-decoration: none; color: #FFFEEC;
        transition: padding-inline-start .3s cubic-bezier(.16,1,.3,1), background .3s }
      .px-row:hover { padding-inline-start: 16px; background: rgba(255,254,236,.04) }
      .px-row:focus-visible { outline: 2px solid ${tint}; outline-offset: -2px }
      .px-input { transition: border-color .2s, background .2s, box-shadow .2s }
      .px-input:hover { border-color: rgba(255,254,236,.4) }
      .px-input:focus { border-color: ${tint}; box-shadow: 0 0 0 3px color-mix(in srgb, ${tint} 25%, transparent); background: rgba(255,254,236,.08) }
      .px-float { animation: pxfloat 7s ease-in-out infinite }
      @keyframes pxfloat { 0%,100% { transform: translateY(0) rotate(-1.5deg) } 50% { transform: translateY(-14px) rotate(1.5deg) } }
      @media (prefers-reduced-motion: reduce) {
        .px-card, .px-row, .px-input { transition: none }
        .px-card:hover { transform: none }
        .px-float { animation: none }
      }
    `}</style>
  );
}
