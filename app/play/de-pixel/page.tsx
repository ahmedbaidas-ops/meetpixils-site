"use client";

import * as React from "react";
import { useLang, mono, cut, toAr, CREAM, PLUM900, ORANGE } from "@/lib/ui";
import { Wrap, PxStyles, inputStyle } from "@/components/meetpixils/kit";

/* De-Pixel — the daily de-pixelation guessing game.
   An emoji renders as a handful of giant pixels and sharpens with every miss.
   Same five puzzles for everyone on a given day (date-seeded shuffle). */

const POOL: { e: string; en: string[]; ar: string[] }[] = [
  { e: "🎨", en: ["palette", "paint palette", "colors", "paint"], ar: ["لوحة", "الوان", "ألوان", "لوحة الوان"] },
  { e: "✂️", en: ["scissors", "scissor"], ar: ["مقص"] },
  { e: "📐", en: ["ruler", "triangle ruler", "set square"], ar: ["مسطرة", "مثلث"] },
  { e: "🖌️", en: ["brush", "paintbrush", "paint brush"], ar: ["فرشاة", "فرشاه"] },
  { e: "📷", en: ["camera"], ar: ["كاميرا", "كاميره"] },
  { e: "☕", en: ["coffee", "coffee cup", "cup"], ar: ["قهوة", "قهوه", "فنجان"] },
  { e: "💡", en: ["bulb", "lightbulb", "light bulb", "idea"], ar: ["لمبة", "فكرة", "مصباح"] },
  { e: "🖥️", en: ["computer", "desktop", "monitor", "screen"], ar: ["كمبيوتر", "شاشة", "حاسوب"] },
  { e: "⌛", en: ["hourglass", "sand clock", "timer"], ar: ["ساعة رملية", "ساعه رمليه"] },
  { e: "🚀", en: ["rocket", "spaceship"], ar: ["صاروخ"] },
  { e: "🦄", en: ["unicorn"], ar: ["يونيكورن", "وحيد القرن"] },
  { e: "🍉", en: ["watermelon", "melon"], ar: ["بطيخ", "بطيخة"] },
  { e: "🕹️", en: ["joystick", "controller", "arcade"], ar: ["يد تحكم", "جويستيك"] },
  { e: "🧠", en: ["brain"], ar: ["دماغ", "مخ", "عقل"] },
  { e: "👁️", en: ["eye"], ar: ["عين"] },
  { e: "🔥", en: ["fire", "flame"], ar: ["نار", "لهب"] },
  { e: "🌙", en: ["moon", "crescent"], ar: ["قمر", "هلال"] },
  { e: "🐫", en: ["camel"], ar: ["جمل", "بعير"] },
  { e: "🫒", en: ["olive", "olives"], ar: ["زيتون", "زيتونة"] },
  { e: "🏺", en: ["amphora", "vase", "pot", "jar"], ar: ["جرة", "فخار", "مزهرية"] },
];

const STEPS = [6, 10, 16, 26, 44]; // pixel grid per reveal step
const ROUNDS = 5;

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const norm = (s: string) => s.trim().toLowerCase().replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/\s+/g, " ");

export default function DePixel() {
  const { ar } = useLang();
  const day = Math.floor(Date.now() / 86400000);
  const puzzles = React.useMemo(() => {
    const rnd = mulberry32(day);
    const arr = [...POOL];
    for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
    return arr.slice(0, ROUNDS);
  }, [day]);

  const [round, setRound] = React.useState(0);
  const [step, setStep] = React.useState(0);
  const [guess, setGuess] = React.useState("");
  const [shake, setShake] = React.useState(0);
  const [results, setResults] = React.useState<number[]>([]); // step solved at, 5 = failed
  const [phase, setPhase] = React.useState<"play" | "between" | "end">("play");
  const [copied, setCopied] = React.useState(false);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const num = (n: number | string) => (ar ? toAr(n) : String(n));
  const score = results.reduce((t, s) => t + (s >= STEPS.length ? 0 : (STEPS.length - s) * 20), 0);

  // draw current pixelation
  React.useEffect(() => {
    const cv = canvasRef.current;
    if (!cv || phase === "end") return;
    const ctx = cv.getContext("2d")!;
    const S = 264;
    const off = document.createElement("canvas");
    off.width = off.height = S;
    const octx = off.getContext("2d")!;
    octx.fillStyle = "#2F263B";
    octx.fillRect(0, 0, S, S);
    octx.font = "190px 'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',serif";
    octx.textAlign = "center";
    octx.textBaseline = "middle";
    octx.fillText(puzzles[round].e, S / 2, S / 2 + 12);
    const r = phase === "between" ? S : STEPS[Math.min(step, STEPS.length - 1)];
    const tmp = document.createElement("canvas");
    tmp.width = tmp.height = r;
    const tctx = tmp.getContext("2d")!;
    tctx.imageSmoothingEnabled = true;
    tctx.drawImage(off, 0, 0, r, r);
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, S, S);
    ctx.drawImage(tmp, 0, 0, S, S);
  }, [round, step, phase, puzzles]);

  const advance = (solvedAt: number) => {
    const res = [...results, solvedAt];
    setResults(res);
    setPhase("between");
    window.setTimeout(() => {
      if (res.length >= ROUNDS) setPhase("end");
      else { setRound(res.length); setStep(0); setGuess(""); setPhase("play"); }
    }, 1400);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const g = norm(guess);
    if (!g) return;
    const p = puzzles[round];
    if ([...p.en, ...p.ar].some((w) => norm(w) === g)) { advance(step); return; }
    setGuess("");
    setShake((s) => s + 1);
    if (step + 1 >= STEPS.length) advance(STEPS.length);
    else setStep(step + 1);
  };

  const shareText = () => {
    const boxes = results.map((s) => (s <= 1 ? "🟧" : s <= 2 ? "🟨" : s < STEPS.length ? "🟦" : "⬛")).join("");
    return `De-Pixel #${day % 1000} — ${score}/500\n${boxes}\nmeetpixils.com/play/de-pixel`;
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(shareText()); setCopied(true); window.setTimeout(() => setCopied(false), 1600); } catch {}
  };
  const restart = () => { setRound(0); setStep(0); setGuess(""); setResults([]); setPhase("play"); };

  return (
    <div style={{ paddingTop: 92, minHeight: "100vh" }}>
      <PxStyles tint={ORANGE} />
      <Wrap style={{ maxWidth: 720, paddingBottom: "clamp(70px,11vh,120px)" }}>
        <nav aria-label="breadcrumb" style={{ ...mono, opacity: .55, margin: "10px 0 22px" }}>
          <a href="/play" className="u-link" style={{ color: CREAM, textDecoration: "none" }}>{ar ? "بكسل أركيد" : "Pixel Arcade"}</a>
          <span> / {ar ? "دي-بكسل" : "De-Pixel"}</span>
        </nav>
        <h1 style={{ margin: "0 0 6px", fontSize: "clamp(26px,3.6vw,40px)", fontWeight: 800, letterSpacing: ar ? 0 : "-.03em" }}>
          {ar ? "دي-بكسل" : "De-Pixel"}
        </h1>
        <p style={{ margin: "0 0 26px", fontSize: 14.5, color: "rgba(255,254,236,.68)", lineHeight: ar ? 1.85 : 1.6, maxWidth: "52ch" }}>
          {ar ? "خمّن شو الصورة قبل ما توضح — كل غلطة بتزيد الوضوح وبتنقص النقاط. نفس الأحجية للكل اليوم." : "Guess the picture before it sharpens — every miss reveals more and costs points. Same five puzzles for everyone today."}
        </p>

        {phase === "end" ? (
          <div role="status" style={{ border: `1px solid ${ORANGE}`, padding: "30px 28px", ...cut(14) }}>
            <div style={{ ...mono, opacity: .6, marginBottom: 6 }}>{ar ? `دي-بكسل #${num(day % 1000)}` : `De-Pixel #${day % 1000}`}</div>
            <strong style={{ display: "block", fontSize: "clamp(30px,5vw,46px)", fontWeight: 800, letterSpacing: "-.02em", fontVariantNumeric: "tabular-nums" }}>
              {num(score)}<span style={{ opacity: .45, fontSize: "60%" }}>/{num(500)}</span>
            </strong>
            <div style={{ fontSize: 26, letterSpacing: 4, margin: "10px 0 18px" }} aria-hidden="true">
              {results.map((s, i) => <span key={i}>{s <= 1 ? "🟧" : s <= 2 ? "🟨" : s < STEPS.length ? "🟦" : "⬛"}</span>)}
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button onClick={copy} className="mp-btn" style={{ ["--wipe" as string]: CREAM, ["--wipe-fg" as string]: PLUM900, background: ORANGE, color: PLUM900, fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, padding: "14px 24px", border: 0, cursor: "pointer", ...cut(10) }}>
                {copied ? (ar ? "انتسخ ✓" : "Copied ✓") : (ar ? "انسخ نتيجتك" : "Copy result")}
              </button>
              <button onClick={restart} className="mp-ghost" style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, padding: "14px 22px", background: "none", border: "1px solid rgba(255,254,236,.3)", color: CREAM, cursor: "pointer" }}>
                {ar ? "عيدها" : "Play again"}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap", marginBottom: 14 }}>
              <span style={{ ...mono, color: ORANGE }}>{ar ? `جولة ${num(round + 1)}/${num(ROUNDS)}` : `Round ${round + 1}/${ROUNDS}`}</span>
              <span style={{ ...mono, opacity: .55 }}>{ar ? `الوضوح ${num(step + 1)}/${num(STEPS.length)}` : `Clarity ${step + 1}/${STEPS.length}`}</span>
              <span style={{ ...mono, opacity: .55, marginInlineStart: "auto", fontVariantNumeric: "tabular-nums" }}>{ar ? `نقاط ${num(score)}` : `Score ${score}`}</span>
            </div>
            <div key={shake} className="dp-stage" style={{ display: "inline-block", border: "1px solid rgba(255,254,236,.18)", ...cut(16) }}>
              <canvas ref={canvasRef} width={264} height={264} style={{ display: "block", imageRendering: "pixelated" }} aria-label={ar ? "الصورة المبكسلة" : "The pixelated picture"} />
            </div>
            {phase === "between" && (
              <p role="status" style={{ ...mono, color: ORANGE, margin: "12px 0 0" }}>
                {results[results.length - 1] < STEPS.length ? (ar ? "صح! ✓" : "Got it ✓") : (ar ? `كانت: ${puzzles[round].e}` : `It was: ${puzzles[round].e}`)}
              </p>
            )}
            {phase === "play" && (
              <form onSubmit={submit} style={{ display: "flex", gap: 10, marginTop: 18, maxWidth: 420 }}>
                <input value={guess} onChange={(e) => setGuess(e.target.value)} autoFocus
                       placeholder={ar ? "شو هاي؟" : "What is it?"} aria-label={ar ? "تخمينك" : "Your guess"}
                       className="px-input" style={{ ...inputStyle, flex: 1 }} />
                <button type="submit" className="mp-btn" style={{ ["--wipe" as string]: CREAM, ["--wipe-fg" as string]: PLUM900, background: ORANGE, color: PLUM900, fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, padding: "13px 22px", border: 0, cursor: "pointer", ...cut(10) }}>
                  {ar ? "خمّن" : "Guess"}
                </button>
              </form>
            )}
          </div>
        )}
        <style>{`
          .dp-stage { animation: dpshake 260ms cubic-bezier(.36,.07,.19,.97) }
          @keyframes dpshake { 10%,90% {transform:translateX(-1px)} 20%,80% {transform:translateX(2px)} 30%,50%,70% {transform:translateX(-3px)} 40%,60% {transform:translateX(3px)} }
          @media (prefers-reduced-motion: reduce) { .dp-stage { animation: none } }
        `}</style>
      </Wrap>
    </div>
  );
}
