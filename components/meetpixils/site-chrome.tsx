"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { SiteHeader } from "./site-header";
import { MeetPixilsLogo } from "./logo";
import { MeetMark } from "./mark";
import { LangCtx, toAr, mono, CREAM, PLUM900, ORANGE, LILAC, CYAN, PERI } from "@/lib/ui";
import { useStore } from "@/lib/content";

/** Procedural lofi loop — WebAudio, no external file, no licence questions. */
class Lofi {
  ctx: AudioContext | null = null;
  master: GainNode | null = null;
  timer: number | null = null;
  start() {
    if (this.ctx) { this.ctx.resume(); return; }
    const ctx = new AudioContext();
    const master = ctx.createGain(); master.gain.value = 0.045;
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 950; lp.Q.value = 0.6;
    master.connect(lp).connect(ctx.destination);
    // vinyl crackle
    const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() < 0.0016 ? (Math.random() * 2 - 1) * 0.4 : 0;
    const noise = ctx.createBufferSource(); noise.buffer = buf; noise.loop = true;
    const ng = ctx.createGain(); ng.gain.value = 0.5;
    noise.connect(ng).connect(master); noise.start();
    this.ctx = ctx; this.master = master;
    const CHORDS = [
      [261.63, 329.63, 392.0, 493.88],   // Cmaj7
      [220.0, 261.63, 329.63, 392.0],    // Am7
      [174.61, 220.0, 261.63, 329.63],   // Fmaj7
      [196.0, 246.94, 293.66, 349.23],   // G7
    ];
    let bar = 0;
    const playBar = () => {
      if (!this.ctx) return;
      const t = ctx.currentTime;
      const notes = CHORDS[bar % 4];
      notes.forEach((f, i) => {
        const o = ctx.createOscillator(); o.type = "triangle";
        o.frequency.value = f * (1 + (Math.random() - 0.5) * 0.002);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, t + i * 0.06);
        g.gain.linearRampToValueAtTime(0.55, t + i * 0.06 + 0.5);
        g.gain.exponentialRampToValueAtTime(0.001, t + 3.2);
        o.connect(g).connect(master); o.start(t + i * 0.06); o.stop(t + 3.4);
      });
      const b = ctx.createOscillator(); b.type = "sine"; b.frequency.value = notes[0] / 2;
      const bg = ctx.createGain();
      bg.gain.setValueAtTime(0.0001, t);
      bg.gain.linearRampToValueAtTime(0.8, t + 0.15);
      bg.gain.exponentialRampToValueAtTime(0.001, t + 3.0);
      b.connect(bg).connect(master); b.start(t); b.stop(t + 3.2);
      bar++;
    };
    playBar();
    this.timer = window.setInterval(playBar, 3333);
  }
  stop() {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
    this.ctx?.suspend();
  }
}
const lofi = typeof window !== "undefined" ? new Lofi() : (null as unknown as Lofi);

const FOOT_ARMS = [
  { c: ORANGE, en: "MeetPixils", ar: "ميت بيكسلز" },
  { c: LILAC, en: "MeetBattle", ar: "ميت باتل" },
  { c: PERI, en: "MeetAcademy", ar: "ميت أكاديمي" },
  { c: CYAN, en: "MeetExperience", ar: "ميت إكسبيرينس" },
  { c: "#6B3050", en: "MeetBrands", ar: "ميت براندز" },
];

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const [ar, setAr] = React.useState(false);
  const [sound, setSound] = React.useState(false);
  const pathname = usePathname() || "/";
  React.useEffect(() => {
    try { setAr(localStorage.getItem("mp-lang") === "ar"); } catch {}
  }, []);
  const toggle = React.useCallback(() => {
    setAr((v) => { try { localStorage.setItem("mp-lang", v ? "en" : "ar"); } catch {} return !v; });
  }, []);
  const toggleSound = React.useCallback(() => {
    setSound((v) => { const n = !v; if (n) lofi.start(); else lofi.stop(); return n; });
  }, []);

  const [cms] = useStore();
  // Campaign CTA (user decision 19 Aug): tickets for the flagship, everywhere — label/href editable in /admin → Site.
  const ctaLabel = ar ? cms.settings.cta.ar : cms.settings.cta.en;
  const isAdmin = pathname.startsWith("/admin");

  return (
    <LangCtx.Provider value={{ ar, toggle }}>
      <div dir={ar ? "rtl" : "ltr"} lang={ar ? "ar" : "en"}
           style={{ background: PLUM900, color: CREAM, minHeight: "100vh",
                    fontFamily: ar ? "var(--font-arabic)" : "var(--font-sans)" }}>
        {/* route progress sweep — remounts per navigation via key */}
        <div key={pathname} className="mp-sweep" aria-hidden="true" />
        {!isAdmin && (
          <SiteHeader ar={ar} onToggleAr={toggle} ctaLabel={ctaLabel} ctaHref={cms.settings.cta.href}
                      sound={sound} onToggleSound={toggleSound} />
        )}
        <main>{children}</main>
        {!isAdmin && (
          <footer style={{ background: PLUM900, padding: "clamp(44px,7vh,72px) 0 40px", borderTop: "1px solid rgba(255,254,236,.1)" }}>
            <div style={{ maxWidth: 1480, margin: "0 auto", padding: "0 clamp(20px,5vw,64px)" }}>
              <div style={{ display: "grid", gap: 30, gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", marginBottom: 34 }}>
                <div>
                  <MeetPixilsLogo height={40} />
                  <p style={{ ...mono, opacity: .5, marginTop: 14 }}>{ar ? "عمّان · الأردن" : "Amman · Jordan"}</p>
                </div>
                {[
                  { h: ar ? "شو في قريب؟" : "What's On", l: [[ar ? "كل القادم" : "All upcoming", "/whats-on"], [ar ? "العرض الختامي" : "Final Showcase", "/whats-on/final-showcase-2026"], [ar ? "فعاليات سابقة" : "Past events", "/whats-on/past"], [ar ? "بكسل أركيد" : "Pixel Arcade", "/play"]] },
                  { h: ar ? "نافس" : "Compete", l: [[ar ? "التحديات" : "Live battles", "/compete"], [ar ? "كيف يتم التحكيم" : "How judging works", "/compete/how-judging-works"], [ar ? "كن محكّماً" : "Be a judge", "/compete/be-a-judge"]] },
                  { h: ar ? "اتعلّم" : "Learn", l: [[ar ? "المسارات" : "Tracks", "/learn"], [ar ? "الإرشاد" : "Mentorship", "/learn/mentorship"], [ar ? "شهاداتي" : "Certificates", "/me/certificates"]] },
                  { h: ar ? "مين إحنا" : "About", l: [[ar ? "الأذرع الخمسة" : "The five arms", "/about/ecosystem"], [ar ? "الشركاء" : "Partners", "/about/partners"], [ar ? "تواصل معنا" : "Contact", "/about/contact"], [ar ? "ادعمنا · تبرّع" : "Support us · donate", "/donate"], [ar ? "الشروط والاسترجاع" : "Terms & refunds", "/about/terms"]] },
                ].map((col) => (
                  <div key={col.h}>
                    <div style={{ ...mono, opacity: .5, marginBottom: 12 }}>{col.h}</div>
                    {col.l.map(([x, href]) => (
                      <a key={href} href={href} className="u-link"
                         style={{ display: "inline-block", fontSize: 13.5, color: "rgba(255,254,236,.78)", textDecoration: "none", padding: "4px 0", marginInlineEnd: 24 }}>{x}</a>
                    ))}
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "center", padding: "22px 0", borderBlock: "1px solid rgba(255,254,236,.1)" }}>
                {FOOT_ARMS.map((a) => (
                  <span key={a.en} style={{ display: "inline-flex", alignItems: "center", gap: 9 }}>
                    <MeetMark size={18} color={a.c} />
                    <span style={{ ...mono, opacity: .72 }}>{ar ? a.ar : a.en}</span>
                  </span>
                ))}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 14, paddingTop: 20 }}>
                <span style={{ ...mono, opacity: .42 }}>© 2026 MeetPixils · Pixilated</span>
                <span style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                  {[
                    { en: "Instagram", ar: "إنستغرام", href: cms.settings.instagram, ext: true },
                    { en: "Discord", ar: "ديسكورد", href: cms.settings.discord, ext: true },
                    { en: "WhatsApp", ar: "واتساب", href: "/community/whatsapp", ext: false },
                  ].map((x) => (
                    <a key={x.en} href={x.href} className="u-link"
                       {...(x.ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                       style={{ ...mono, opacity: .55, color: CREAM, textDecoration: "none" }}>
                      {ar ? x.ar : x.en}{x.ext ? " ↗" : ""}
                    </a>
                  ))}
                </span>
              </div>
            </div>
          </footer>
        )}
        <style>{`
          .mp-sweep {
            position: fixed; top: 0; inset-inline-start: 0; height: 2px; width: 100%;
            background: ${ORANGE}; z-index: 100; transform-origin: var(--uo, left);
            animation: mpsweep .7s cubic-bezier(.16,1,.3,1) forwards;
          }
          [dir="rtl"] .mp-sweep { --uo: right }
          @keyframes mpsweep { 0% { transform: scaleX(0); opacity: 1 } 70% { transform: scaleX(1); opacity: 1 } 100% { transform: scaleX(1); opacity: 0 } }
          .u-link { position: relative }
          .u-link::after {
            content: ""; position: absolute; inset-inline: 0; bottom: 1px; height: 1px;
            background: currentColor; transform: scaleX(0); transform-origin: var(--uo, left);
            transition: transform .35s cubic-bezier(.16,1,.3,1);
          }
          .u-link:hover::after { transform: scaleX(1) }
          [dir="rtl"] .u-link::after { --uo: right }
          .mp-btn { position: relative; transition: box-shadow 420ms cubic-bezier(.16,1,.3,1), color 240ms, transform 180ms }
          .mp-btn:hover { box-shadow: inset 0 -4.4em 0 0 var(--wipe); color: var(--wipe-fg) }
          .mp-btn:active { transform: translateY(1px) scale(.995) }
          .mp-btn:focus-visible { outline: 2px solid var(--ring, #FF7A4F); outline-offset: 3px }
          .arw { display: inline-block; margin-inline-start: 8px; transition: transform .32s cubic-bezier(.16,1,.3,1) }
          a:hover > .arw, .mp-btn:hover .arw { transform: translateX(5px) }
          [dir="rtl"] a:hover > .arw, [dir="rtl"] .mp-btn:hover .arw { transform: translateX(-5px) }
          @media (prefers-reduced-motion: reduce) {
            .mp-sweep { animation: none; opacity: 0 }
            .u-link::after, .mp-btn, .arw { transition: none }
          }
        `}</style>
      </div>
    </LangCtx.Provider>
  );
}
