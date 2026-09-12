"use client";

import * as React from "react";
import { useLang, mono, cut, CREAM, PLUM900 } from "@/lib/ui";
import { GAMES } from "@/lib/games";
import { Wrap, PxStyles } from "@/components/meetpixils/kit";
import { Reveal } from "@/components/meetpixils/reveal";
import { MeetMark } from "@/components/meetpixils/mark";

export default function Play() {
  const { ar } = useLang();
  return (
    <div style={{ paddingTop: 92, minHeight: "100vh" }}>
      <PxStyles tint="#EF5229" />
      <Wrap style={{ paddingBottom: "clamp(70px,11vh,120px)" }}>
        <Reveal>
          <span style={{ ...mono, opacity: .6 }}>{ar ? "استراحة المصممين" : "Designer break room"}</span>
          <h1 style={{ margin: "10px 0 8px", fontSize: "clamp(30px,4.6vw,54px)", fontWeight: 800, letterSpacing: ar ? 0 : "-.035em", lineHeight: ar ? 1.4 : 1.05 }}>
            {ar ? "بكسل أركيد" : "Pixel Arcade"}
          </h1>
          <p style={{ margin: "0 0 34px", maxWidth: "52ch", fontSize: 15, color: "rgba(255,254,236,.7)", lineHeight: ar ? 1.85 : 1.6 }}>
            {ar ? "ثلاث ألعاب صغيرة بتختبر عين المصمم اللي فيك. النتائج بتنحفظ عندك بالمتصفح." : "Three small games that test your designer eye. Best scores live in your browser."}
          </p>
        </Reveal>
        <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", maxWidth: 980 }}>
          {GAMES.map((g, i) => {
            const c = ar ? g.ar : g.en;
            return (
              <Reveal key={g.id} delay={i * 80}>
                <a href={g.href} className="mp-gamecard" style={{ ["--tint" as string]: g.tint, display: "flex", flexDirection: "column", gap: 14, textDecoration: "none", color: CREAM, background: "rgba(255,254,236,.03)", border: "1px solid rgba(255,254,236,.16)", padding: "26px 28px", minHeight: 190, ...cut(16) }}>
                  <MeetMark size={24} color={g.tint} />
                  <strong style={{ fontSize: 24, fontWeight: 800, letterSpacing: ar ? 0 : "-.025em" }}>{c.name}</strong>
                  <span style={{ fontSize: 14, color: "rgba(255,254,236,.66)", lineHeight: ar ? 1.8 : 1.5 }}>{c.tag}</span>
                  <span style={{ ...mono, marginTop: "auto", color: g.tint }}>{ar ? "العب ←" : "Play →"}</span>
                </a>
              </Reveal>
            );
          })}
        </div>
        <style>{`
          .mp-gamecard { transition: transform 320ms cubic-bezier(.16,1,.3,1), border-color 320ms, background 320ms }
          .mp-gamecard:hover { transform: translateY(-4px); border-color: var(--tint); background: rgba(255,254,236,.055) }
          .mp-gamecard:focus-visible { outline: 2px solid var(--tint); outline-offset: 3px }
          @media (prefers-reduced-motion: reduce) { .mp-gamecard { transition: none } }
        `}</style>
      </Wrap>
    </div>
  );
}
