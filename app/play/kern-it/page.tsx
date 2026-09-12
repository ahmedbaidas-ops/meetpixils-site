"use client";

import * as React from "react";
import { useLang, mono, cut, toAr, CREAM, PLUM900, LILAC } from "@/lib/ui";
import { Wrap, PxStyles } from "@/components/meetpixils/kit";

/* Kern It — the letters arrive scrambled; drag them back to optically-even
   spacing. Score = how close your offsets land to the type designer's zero. */

const WORDS = ["DESIGN", "AMMAN", "PIXILS"];
const MAX_OFF = 34; // px a letter can stray

export default function KernIt() {
  const { ar } = useLang();
  const [word, setWord] = React.useState(0);
  const [offsets, setOffsets] = React.useState<number[]>([]);
  const [locked, setLocked] = React.useState(false);
  const [scores, setScores] = React.useState<number[]>([]);
  const [drag, setDrag] = React.useState<{ i: number; startX: number; startOff: number } | null>(null);
  const num = (n: number | string) => (ar ? toAr(n) : String(n));

  const letters = WORDS[word].split("");
  React.useEffect(() => {
    // scramble inner letters; first stays anchored
    setOffsets(letters.map((_, i) => (i === 0 ? 0 : Math.round((Math.random() * 2 - 1) * (14 + Math.random() * 14)))));
    setLocked(false);
  }, [word]); // eslint-disable-line react-hooks/exhaustive-deps

  const wordScore = (offs: number[]) => {
    const inner = offs.slice(1);
    const mean = inner.reduce((t, o) => t + Math.abs(o), 0) / inner.length;
    return Math.max(0, Math.round(100 - (mean / 24) * 100));
  };

  const onDown = (i: number) => (e: React.PointerEvent) => {
    if (locked || i === 0) return;
    try { (e.target as HTMLElement).setPointerCapture(e.pointerId); } catch {}
    setDrag({ i, startX: e.clientX, startOff: offsets[i] });
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag) return;
    const d = e.clientX - drag.startX;
    setOffsets((o) => o.map((v, j) => (j === drag.i ? Math.max(-MAX_OFF, Math.min(MAX_OFF, drag.startOff + d)) : v)));
  };
  const onUp = () => setDrag(null);

  const lock = () => {
    setScores((s) => [...s, wordScore(offsets)]);
    setLocked(true);
    setOffsets((o) => o.map(() => 0)); // letters glide home — the reveal
  };
  const next = () => setWord((w) => w + 1);
  const restart = () => { setScores([]); setWord(0); setOffsets(letters.map(() => 0)); setLocked(false); };

  const finished = scores.length === WORDS.length && locked;
  const avg = scores.length ? Math.round(scores.reduce((t, s) => t + s, 0) / scores.length) : 0;
  const grade = (v: number) =>
    v >= 90 ? (ar ? "عين ميزان" : "Master optician") :
    v >= 75 ? (ar ? "عين حادة" : "Sharp eye") :
    v >= 50 ? (ar ? "غمّض وركّز" : "Squint harder") :
              (ar ? "الحروف خايفة منك" : "The letters fear you");

  return (
    <div style={{ paddingTop: 92, minHeight: "100vh" }}>
      <PxStyles tint={LILAC} />
      <Wrap style={{ maxWidth: 860, paddingBottom: "clamp(70px,11vh,120px)" }}>
        <nav aria-label="breadcrumb" style={{ ...mono, opacity: .55, margin: "10px 0 22px" }}>
          <a href="/play" className="u-link" style={{ color: CREAM, textDecoration: "none" }}>{ar ? "بكسل أركيد" : "Pixel Arcade"}</a>
          <span> / {ar ? "ظبّط الحروف" : "Kern It"}</span>
        </nav>
        <h1 style={{ margin: "0 0 6px", fontSize: "clamp(26px,3.6vw,40px)", fontWeight: 800, letterSpacing: ar ? 0 : "-.03em" }}>
          {ar ? "ظبّط الحروف" : "Kern It"}
        </h1>
        <p style={{ margin: "0 0 30px", fontSize: 14.5, color: "rgba(255,254,236,.68)", lineHeight: ar ? 1.85 : 1.6, maxWidth: "54ch" }}>
          {ar ? "الحروف وصلت مبعثرة. اسحبها يمين وشمال ليصير التباعد مريح بصرياً، بعدين ثبّتها وشوف قديش قربت." : "The letters arrived scrambled. Drag them left and right until the spacing feels optically even, then lock it in and see how close you got."}
        </p>

        {finished ? (
          <div role="status" style={{ border: `1px solid ${LILAC}`, padding: "30px 28px", ...cut(14) }}>
            <strong style={{ display: "block", fontSize: "clamp(30px,5vw,46px)", fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>
              {num(avg)}<span style={{ opacity: .45, fontSize: "60%" }}>/{num(100)}</span>
            </strong>
            <p style={{ ...mono, color: LILAC, margin: "8px 0 4px" }}>{grade(avg)}</p>
            <p style={{ ...mono, opacity: .55, margin: "0 0 18px" }}>
              {WORDS.map((w, i) => `${w} ${scores[i] ?? "—"}`).join(" · ")}
            </p>
            <button onClick={restart} className="mp-btn" style={{ ["--wipe" as string]: CREAM, ["--wipe-fg" as string]: PLUM900, background: LILAC, color: PLUM900, fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, padding: "14px 24px", border: 0, cursor: "pointer", ...cut(10) }}>
              {ar ? "عيدها" : "Play again"}
            </button>
          </div>
        ) : (
          <div>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 18 }}>
              <span style={{ ...mono, color: LILAC }}>{ar ? `كلمة ${num(word + 1)}/${num(WORDS.length)}` : `Word ${word + 1}/${WORDS.length}`}</span>
              {locked && <span style={{ ...mono, opacity: .8 }}>{ar ? `نتيجة الكلمة: ${num(scores[scores.length - 1])}` : `Word score: ${scores[scores.length - 1]}`}</span>}
            </div>
            <div dir="ltr" onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
                 style={{ border: "1px solid rgba(255,254,236,.18)", padding: "clamp(30px,7vw,60px) clamp(10px,3vw,30px)", display: "flex", justifyContent: "center", overflow: "hidden", userSelect: "none", ...cut(16) }}>
              <div style={{ display: "flex" }}>
                {letters.map((L, i) => (
                  <span key={i} onPointerDown={onDown(i)} role={i === 0 ? undefined : "slider"}
                        aria-label={i === 0 ? undefined : `${ar ? "حرف" : "Letter"} ${L}`}
                        aria-valuenow={i === 0 ? undefined : offsets[i]} aria-valuemin={-MAX_OFF} aria-valuemax={MAX_OFF}
                        tabIndex={i === 0 || locked ? -1 : 0}
                        onKeyDown={(e) => {
                          if (locked || i === 0) return;
                          if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
                            e.preventDefault();
                            const d = e.key === "ArrowLeft" ? -2 : 2;
                            setOffsets((o) => o.map((v, j) => (j === i ? Math.max(-MAX_OFF, Math.min(MAX_OFF, v + d)) : v)));
                          }
                        }}
                        style={{ display: "inline-block", fontSize: "clamp(44px,9vw,88px)", fontWeight: 800, letterSpacing: 0, lineHeight: 1,
                                 transform: `translateX(${(offsets[i] ?? 0)}px)`,
                                 transition: locked ? "transform 600ms cubic-bezier(.16,1,.3,1), color 600ms" : "none",
                                 color: locked ? LILAC : CREAM,
                                 cursor: i === 0 || locked ? "default" : "grab", touchAction: "none",
                                 outline: "none" }}
                        className={i === 0 ? undefined : "ki-letter"}>
                    {L}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
              {!locked ? (
                <button onClick={lock} className="mp-btn" style={{ ["--wipe" as string]: CREAM, ["--wipe-fg" as string]: PLUM900, background: LILAC, color: PLUM900, fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, padding: "14px 26px", border: 0, cursor: "pointer", ...cut(10) }}>
                  {ar ? "ثبّتها" : "Lock it in"}
                </button>
              ) : (
                <button onClick={word + 1 < WORDS.length ? next : () => setLocked(true)} className="mp-btn"
                        style={{ ["--wipe" as string]: CREAM, ["--wipe-fg" as string]: PLUM900, background: LILAC, color: PLUM900, fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, padding: "14px 26px", border: 0, cursor: "pointer", ...cut(10), visibility: word + 1 < WORDS.length ? "visible" : "hidden" }}>
                  {ar ? "الكلمة الجاية" : "Next word"}
                </button>
              )}
              <span style={{ ...mono, opacity: .45, alignSelf: "center" }}>
                {locked ? (ar ? "بنفسجي = التباعد الصح" : "Lilac = the correct spacing") : (ar ? "أول حرف مثبّت — اسحب الباقي" : "First letter is anchored — drag the rest")}
              </span>
            </div>
          </div>
        )}
        <style>{`
          .ki-letter:focus-visible { outline: 2px solid ${LILAC}; outline-offset: 4px }
          .ki-letter:active { cursor: grabbing }
        `}</style>
      </Wrap>
    </div>
  );
}
