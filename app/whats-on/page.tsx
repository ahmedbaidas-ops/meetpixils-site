"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MeetMark } from "@/components/meetpixils/mark";
import { Reveal } from "@/components/meetpixils/reveal";
import { useLang } from "@/lib/ui";
import { useStore, objHref } from "@/lib/content";

/* ============================================================
   /whats-on — IA T2 section landing, MeetExperience skin.
   Header + sticky facet bar + status-driven bento + trust block.
   Filtering never animates the grid (Playbook §08): a re-query
   must feel instant, so entrance motion is suppressed after the
   first paint.
   ============================================================ */

const ORANGE = "#EF5229";
const LILAC = "#CCA4FD";
const CYAN = "#2EBEEF";
const PERI = "#C3B8FB";
const PLUM = "#310622";
const PLUM900 = "#0F010A";
const CREAM = "#FFFEEC";

const cut = (n = 14): React.CSSProperties => ({
  borderRadius: 0,
  clipPath: `polygon(${n}px 0, 100% 0, 100% calc(100% - ${n}px), calc(100% - ${n}px) 100%, 0 100%, 0 ${n}px)`,
});
const mono: React.CSSProperties = {
  fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase",
};
const wrap: React.CSSProperties = { maxWidth: 1480, margin: "0 auto", padding: "0 clamp(20px,5vw,64px)" };

type Status = "closing-soon" | "open" | "upcoming" | "results-out" | "closed";
type Item = {
  id: string; type: "Event" | "Competition" | "Program";
  status: Status; due?: string; tint: string; arm: string;
  discipline: string; level: string; format: string; city: string;
  en: { t: string; d: string; when: string; cta: string };
  ar: { t: string; d: string; when: string; cta: string };
};

const FACETS = {
  type: ["Event", "Competition", "Program"],
  discipline: ["UX/UI", "UX Research", "Branding", "Graphic", "Motion & 3D", "All"],
  format: ["In person", "Online", "Hybrid"],
  city: ["Amman", "Online"],
} as const;
type FacetKey = keyof typeof FACETS;

const AR_D = ["٠","١","٢","٣","٤","٥","٦","٧","٨","٩"];
const toAr = (n: number | string) => String(n).replace(/\d/g, (d) => AR_D[+d]);

const FACET_AR: Record<string, string> = {
  type: "النوع", discipline: "التخصص", format: "الصيغة", city: "المكان",
  Event: "فعالية", Competition: "منافسة", Program: "برنامج",
  "UX/UI": "UX/UI", "UX Research": "بحث المستخدم", Branding: "براندنج", Graphic: "جرافيك",
  "Motion & 3D": "موشن و٣د", All: "الكل", "In person": "حضوري", Online: "أونلاين", Hybrid: "هجين", Amman: "عمّان",
};

const RANK: Record<Status, number> = { "closing-soon": 0, open: 1, upcoming: 2, "results-out": 3, closed: 4 };

export default function WhatsOn() {
  const { ar } = useLang();
  const [cms] = useStore();
  const [sel, setSel] = useState<Record<FacetKey, string[]>>({ type: [], discipline: [], format: [], city: [] });
  const [view, setView] = useState<"bento" | "list">("bento");
  const [now, setNow] = useState(() => Date.now());
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  // pointer-tracked spotlight on the header — pure CSS vars, no rAF loop
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
      el.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
    };
    el.addEventListener("pointermove", move);
    return () => el.removeEventListener("pointermove", move);
  }, []);

  const toggle = (k: FacetKey, v: string) =>
    setSel((s) => ({ ...s, [k]: s[k].includes(v) ? s[k].filter((x) => x !== v) : [...s[k], v] }));
  const clear = () => setSel({ type: [], discipline: [], format: [], city: [] });
  const activeCount = Object.values(sel).reduce((n, a) => n + a.length, 0);

  const results = useMemo(() => {
    const pass = (i: Item) =>
      (!sel.type.length || sel.type.includes(i.type)) &&
      (!sel.discipline.length || sel.discipline.includes(i.discipline)) &&
      (!sel.format.length || sel.format.includes(i.format)) &&
      (!sel.city.length || sel.city.includes(i.city));
    return cms.objects.filter(pass).sort((a, b) => RANK[a.status] - RANK[b.status]);
  }, [sel, cms]);

  const closingSoon = results.filter((i) => i.status === "closing-soon");
  const daysLeft = (iso?: string) => (iso ? Math.max(0, Math.ceil((new Date(iso).getTime() - now) / 86400000)) : null);
  const num = (n: number | string) => (ar ? toAr(n) : String(n));

  const statusLabel = (i: Item) => {
    const d = daysLeft(i.due);
    if (i.status === "closing-soon") return ar ? `يغلق خلال ${num(d ?? 0)} أيام` : `Closes in ${d ?? 0} days`;
    const map: Record<Status, [string, string]> = {
      "closing-soon": ["", ""], open: ["Open", "مفتوح"], upcoming: ["Upcoming", "قريباً"],
      "results-out": ["Results out", "النتائج ظهرت"], closed: ["Closed", "انتهى"],
    };
    return ar ? map[i.status][1] : map[i.status][0];
  };

  /** bento sizing is a function of status, never of editorial taste (IA §09) */
  const span = (i: Item, idx: number) => {
    if (i.status === "closing-soon") return "span 12";
    if (i.status === "open" && idx < 3) return "span 6";
    return "span 4";
  };

  return (
    <div dir={ar ? "rtl" : "ltr"} lang={ar ? "ar" : "en"}
         style={{ background: PLUM900, color: CREAM, minHeight: "100vh", fontFamily: ar ? "var(--font-arabic)" : "var(--font-sans)" }}>

      {/* ---------- header: cyan skin + pointer spotlight + pattern ---------- */}
      <header
        ref={headerRef}
        className="wo-head"
        style={{ position: "relative", overflow: "hidden", background: CYAN, color: PLUM, paddingTop: 92 }}
      >
        <div aria-hidden="true" className="wo-grid" />
        <div aria-hidden="true" className="wo-spot" />
        <div style={{ ...wrap, position: "relative", zIndex: 2, paddingBottom: "clamp(44px,7vh,84px)" }}>
          <a href="/" style={{ ...mono, color: PLUM, opacity: .6, textDecoration: "none", display: "inline-block", marginBottom: 22 }}>
            {ar ? "← ميت بيكسلز" : "← MeetPixils"}
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
            <MeetMark size={34} color={PLUM} />
            <span style={{ ...mono, opacity: .68 }}>{ar ? "ميت إكسبيرينس" : "MeetExperience"}</span>
          </div>
          <h1 style={{ margin: 0, maxWidth: "14ch", fontSize: "clamp(44px,8vw,104px)", fontWeight: 800,
                       letterSpacing: ar ? 0 : "-.045em", lineHeight: ar ? 1.28 : .96 }}>
            {ar ? "شو في قريب؟" : "What's on"}
          </h1>
          <p style={{ margin: "20px 0 0", maxWidth: "44ch", fontSize: "clamp(15px,1.8vw,19px)", lineHeight: ar ? 1.9 : 1.55, color: "rgba(49,6,34,.72)" }}>
            {ar ? "كل اللي جاي — تحديات، ورشات، لقاءات، وليلة النهائي. فلتر حسب اللي بناسبك."
                : "Everything coming up — battles, workshops, meetups, and the season finale. Filter it down to what fits."}
          </p>
        </div>
      </header>

      {/* ---------- closing-soon rail — hides when empty (IA §09) ---------- */}
      {closingSoon.length > 0 && (
        <div style={{ background: ORANGE, color: PLUM900 }}>
          <div style={{ ...wrap, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16, padding: "14px clamp(20px,5vw,64px)" }}>
            <span style={{ ...mono, fontWeight: 700 }}>{ar ? "يغلق قريباً" : "Closing soon"}</span>
            {closingSoon.map((i) => (
              <a key={i.id} href={`/compete/${i.id}`} style={{ ...mono, color: PLUM900, textDecoration: "none", display: "inline-flex", gap: 8 }}>
                <span style={{ fontWeight: 700 }}>{num(daysLeft(i.due) ?? 0)}{ar ? " يوم" : "d"}</span>
                <span style={{ opacity: .78 }}>{(ar ? i.ar : i.en).t.slice(0, 34)}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* ---------- sticky facet bar ---------- */}
      <div className="wo-bar" style={{ position: "sticky", top: 0, zIndex: 40 }}>
        <div style={{ ...wrap, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, padding: "12px clamp(20px,5vw,64px)" }}>
          {(Object.keys(FACETS) as FacetKey[]).map((k) => (
            <div key={k} style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <span style={{ ...mono, opacity: .45 }}>{ar ? FACET_AR[k] : k}</span>
              {FACETS[k].map((v) => {
                const on = sel[k].includes(v);
                return (
                  <button key={v} type="button" onClick={() => toggle(k, v)} aria-pressed={on} className="wo-chip"
                          style={on ? { background: CYAN, color: PLUM900, borderColor: CYAN } : undefined}>
                    {ar ? (FACET_AR[v] ?? v) : v}
                  </button>
                );
              })}
            </div>
          ))}
          <div style={{ marginInlineStart: "auto", display: "flex", alignItems: "center", gap: 10 }}>
            {activeCount > 0 && (
              <button type="button" onClick={clear} className="wo-chip" style={{ borderColor: ORANGE, color: ORANGE }}>
                {ar ? `مسح (${num(activeCount)})` : `Clear (${activeCount})`}
              </button>
            )}
            <div className="wo-seg">
              <button type="button" aria-pressed={view === "bento"} onClick={() => setView("bento")}>{ar ? "شبكة" : "Grid"}</button>
              <button type="button" aria-pressed={view === "list"} onClick={() => setView("list")}>{ar ? "قائمة" : "List"}</button>
            </div>
            <span aria-live="polite" style={{ ...mono, opacity: .6, fontVariantNumeric: "tabular-nums" }}>
              {num(results.length)} {ar ? "نتيجة" : "results"}
            </span>
          </div>
        </div>
      </div>

      {/* ---------- the grid ---------- */}
      <section style={{ padding: "clamp(34px,6vh,64px) 0 clamp(70px,12vh,120px)" }}>
        <div style={wrap}>
          {results.length === 0 ? (
            /* IA §09: never render "no results" — offer the nearest live thing */
            <div style={{ border: "1px dashed rgba(255,254,236,.24)", padding: "44px 28px", textAlign: "center", ...cut(16) }}>
              <strong style={{ display: "block", fontSize: 20, marginBottom: 10 }}>
                {ar ? "ما في إشي بهالفلاتر" : "Nothing matches those filters"}
              </strong>
              <p style={{ margin: "0 auto 20px", maxWidth: "44ch", color: "rgba(255,254,236,.7)", fontSize: 14 }}>
                {ar ? "بس في ٩ أشياء جاية هالموسم — شيل فلتر أو اثنين." : "There are still 9 things coming this season — try dropping a filter."}
              </p>
              <button onClick={clear} className="wo-cta" style={{ background: CYAN, color: PLUM900 }}>
                {ar ? "امسح الفلاتر" : "Clear filters"}
              </button>
            </div>
          ) : view === "list" ? (
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {results.map((i) => {
                const c = ar ? i.ar : i.en;
                return (
                  <li key={i.id}>
                    <a href={objHref(i)} className="wo-row">
                      <span style={{ ...mono, color: i.tint, minWidth: 96 }}>{c.when}</span>
                      <strong style={{ flex: 1, fontSize: 17, fontWeight: 650 }}>{c.t}</strong>
                      <span style={{ ...mono, opacity: .55 }}>{ar ? FACET_AR[i.format] : i.format}</span>
                      <span style={{ ...mono, color: i.status === "closing-soon" ? ORANGE : "rgba(255,254,236,.55)" }}>{statusLabel(i)}</span>
                      <span className="arw" aria-hidden="true">→</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(12,1fr)", gap: 16 }}>
              {results.map((i, idx) => {
                const c = ar ? i.ar : i.en;
                const big = i.status === "closing-soon";
                return (
                  <Reveal key={i.id} delay={Math.min(idx * 55, 330)} className="wo-cell" style={{ gridColumn: span(i, idx) }}>
                    <a href={objHref(i)} className="wo-card"
                       style={{ ["--tint" as string]: i.tint, minHeight: big ? 300 : 240, ...cut(16) }}>
                      <span aria-hidden="true" className="wo-wash" />
                      <div className="wo-cardtop">
                        <span className="wo-status" style={ i.status === "closing-soon"
                          ? { background: ORANGE, color: PLUM900 }
                          : { border: `1px solid ${i.tint}`, color: i.tint } }>
                          {i.status === "closing-soon" && <span className="wo-dot" />}
                          {statusLabel(i)}
                        </span>
                        <span style={{ ...mono, opacity: .5 }}>{i.arm}</span>
                      </div>
                      <strong style={{ fontSize: big ? "clamp(24px,3.4vw,40px)" : 19, fontWeight: 750,
                                       letterSpacing: ar ? 0 : "-.025em", lineHeight: ar ? 1.45 : 1.14, maxWidth: "20ch" }}>
                        {c.t}
                      </strong>
                      <p style={{ margin: 0, fontSize: 13.5, color: "rgba(255,254,236,.66)", maxWidth: "46ch", lineHeight: ar ? 1.8 : 1.5 }}>{c.d}</p>
                      <div className="wo-meta">
                        {/* format and city can both be "Online" — key by slot, not value */}
                        {[c.when, ar ? FACET_AR[i.format] : i.format, ar ? FACET_AR[i.city] ?? i.city : i.city, i.level].map((m, mi) => (
                          <span key={`${i.id}-m${mi}`} className="wo-tag">{m}</span>
                        ))}
                      </div>
                      <span className="wo-cta" style={{ background: i.tint, color: PLUM900 }}>
                        {c.cta}<span className="arw" aria-hidden="true">→</span>
                      </span>
                    </a>
                  </Reveal>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ---------- cross-link band (IA T2) ---------- */}
      <section style={{ background: PLUM, padding: "clamp(50px,9vh,90px) 0" }}>
        <div style={{ ...wrap, display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))" }}>
          {[
            { href: "/compete", tint: LILAC, en: ["Want to be in it, not at it?", "See how battles work"], ar: ["بدك تشارك مش بس تحضر؟", "كيف بتشتغل الـ Battles"] },
            { href: "/learn", tint: PERI, en: ["Building a skill, not a night out?", "Explore the Academy"], ar: ["بدك تبني مهارة؟", "اكتشف الأكاديمية"] },
          ].map((x) => (
            <a key={x.href} href={x.href} className="wo-cross" style={{ ["--tint" as string]: x.tint, ...cut(14) }}>
              <strong style={{ fontSize: 19, fontWeight: 700, letterSpacing: ar ? 0 : "-.02em" }}>{(ar ? x.ar : x.en)[0]}</strong>
              <span style={{ ...mono, color: x.tint }}>{(ar ? x.ar : x.en)[1]}<span className="arw" aria-hidden="true">→</span></span>
            </a>
          ))}
        </div>
      </section>

      <style>{`
        .wo-head { --mx: 70%; --my: 30%; }
        .wo-grid {
          position: absolute; inset: 0;
          background-image: linear-gradient(rgba(49,6,34,.10) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(49,6,34,.10) 1px, transparent 1px);
          background-size: 46px 46px;
          mask-image: radial-gradient(120% 100% at 50% 0%, #000 40%, transparent 100%);
        }
        .wo-spot {
          position: absolute; inset: 0; pointer-events: none;
          background: radial-gradient(340px circle at var(--mx) var(--my), rgba(255,254,236,.42), transparent 60%);
          transition: opacity .3s;
        }
        .wo-lang:hover { filter: brightness(1.15) }
        .wo-bar {
          background: rgba(15,1,10,.72);
          backdrop-filter: blur(28px) saturate(1.7) brightness(.7);
          -webkit-backdrop-filter: blur(28px) saturate(1.7) brightness(.7);
        }
        .wo-chip {
          font-family: var(--font-mono); font-size: 11px; letter-spacing: .06em;
          min-height: 32px; padding: 7px 12px; cursor: pointer;
          background: transparent; color: rgba(255,254,236,.72);
          border: 1px solid rgba(255,254,236,.22); border-radius: 0;
          transition: background .2s, color .2s, border-color .2s, transform .15s;
        }
        .wo-chip:hover { color: #FFFEEC; border-color: rgba(255,254,236,.5) }
        .wo-chip:active { transform: translateY(1px) }
        .wo-chip:focus-visible { outline: 2px solid ${CYAN}; outline-offset: 2px }
        .wo-seg { display: inline-flex; border: 1px solid rgba(255,254,236,.22) }
        .wo-seg button {
          font-family: var(--font-mono); font-size: 11px; letter-spacing: .06em; text-transform: uppercase;
          min-height: 32px; padding: 7px 14px; background: none; border: 0; cursor: pointer; color: rgba(255,254,236,.6);
        }
        .wo-seg button[aria-pressed="true"] { background: rgba(255,254,236,.12); color: #FFFEEC }
        .wo-seg button:focus-visible { outline: 2px solid ${CYAN}; outline-offset: -2px }
        .wo-card {
          position: relative; overflow: hidden; height: 100%;
          display: flex; flex-direction: column; gap: 12; gap: 12px;
          padding: 26px 28px; text-decoration: none; color: #FFFEEC;
          background: rgba(255,254,236,.03);
          box-shadow: inset 0 0 0 1px rgba(255,254,236,.12);
          transition: transform .45s cubic-bezier(.16,1,.3,1), box-shadow .45s cubic-bezier(.16,1,.3,1);
        }
        .wo-card:hover { transform: translateY(-6px); box-shadow: inset 0 0 0 1px var(--tint) }
        .wo-card:focus-visible { outline: 2px solid var(--tint); outline-offset: 3px }
        .wo-wash {
          position: absolute; inset: 0; pointer-events: none; opacity: 0;
          background: radial-gradient(120% 90% at 50% 120%, color-mix(in srgb, var(--tint) 26%, transparent), transparent 70%);
          transition: opacity .45s cubic-bezier(.16,1,.3,1);
        }
        .wo-card:hover .wo-wash { opacity: 1 }
        .wo-card > * { position: relative }
        .wo-cardtop { display: flex; align-items: center; justify-content: space-between; gap: 10px }
        .wo-status {
          display: inline-flex; align-items: center; gap: 7px;
          font-family: var(--font-mono); font-size: 10px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
          padding: 6px 12px; white-space: nowrap;
        }
        .wo-dot { width: 6px; height: 6px; border-radius: 999px; background: currentColor; animation: wopulse 1.6s infinite }
        @keyframes wopulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.35;transform:scale(.7)} }
        .wo-meta { display: flex; flex-wrap: wrap; gap: 8px; margin-top: auto }
        .wo-tag {
          font-family: var(--font-mono); font-size: 10px; letter-spacing: .08em; text-transform: uppercase;
          padding: 5px 10px; border: 1px solid rgba(255,254,236,.18); color: rgba(255,254,236,.66); white-space: nowrap;
        }
        .wo-cta {
          align-self: flex-start; font-family: var(--font-mono); font-size: 12px; font-weight: 700;
          padding: 12px 20px; cursor: pointer; border: 0;
          clip-path: polygon(10px 0,100% 0,100% calc(100% - 10px),calc(100% - 10px) 100%,0 100%,0 10px);
          transition: transform .2s cubic-bezier(.16,1,.3,1);
        }
        .wo-card:hover .wo-cta { transform: translateX(3px) }
        [dir="rtl"] .wo-card:hover .wo-cta { transform: translateX(-3px) }
        .arw { display: inline-block; margin-inline-start: 8px; transition: transform .3s cubic-bezier(.16,1,.3,1) }
        .wo-row:hover .arw, .wo-cross:hover .arw { transform: translateX(5px) }
        [dir="rtl"] .wo-row:hover .arw, [dir="rtl"] .wo-cross:hover .arw { transform: translateX(-5px) }
        .wo-row {
          display: flex; align-items: center; gap: 18px; padding: 20px 4px;
          border-bottom: 1px solid rgba(255,254,236,.1); text-decoration: none; color: #FFFEEC;
          transition: padding-inline-start .3s cubic-bezier(.16,1,.3,1), background .3s;
        }
        .wo-row:hover { padding-inline-start: 16px; background: rgba(255,254,236,.04) }
        .wo-row:focus-visible { outline: 2px solid ${CYAN}; outline-offset: -2px }
        .wo-cross {
          display: flex; flex-direction: column; justify-content: space-between; gap: 20px;
          min-height: 150px; padding: 26px 28px; text-decoration: none; color: #FFFEEC;
          box-shadow: inset 0 0 0 1px rgba(255,254,236,.14);
          transition: transform .4s cubic-bezier(.16,1,.3,1), box-shadow .4s;
        }
        .wo-cross:hover { transform: translateY(-4px); box-shadow: inset 0 0 0 1px var(--tint) }
        @media (max-width: 900px) { .wo-cell { grid-column: span 12 !important } }
        @media (prefers-reduced-motion: reduce) {
          .wo-card, .wo-cross, .wo-row, .arw, .wo-cta, .wo-wash { transition: none }
          .wo-card:hover, .wo-cross:hover { transform: none }
          .wo-dot { animation: none }
          .wo-spot { display: none }
        }
      `}</style>
    </div>
  );
}
