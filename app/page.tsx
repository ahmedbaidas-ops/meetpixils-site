"use client";

import { useEffect, useMemo, useState } from "react";
import { MeetMark } from "@/components/meetpixils/mark";
import { Reveal } from "@/components/meetpixils/reveal";
import { PixelStatement } from "@/components/meetpixils/pixel-text";
import { useLang, toAr as toArU } from "@/lib/ui";
import { useStore, mostUrgent, daysLeft as daysLeftC, objHref, RANK as RANKC } from "@/lib/content";
import { PixelTransition } from "@/components/meetpixils/pixel-transition";

/* ============================================================
   Home hero — built to IA v1.0 + Playbook §07 T1.
   Nav is five task items (never brand names). The hero is
   whichever live object is most urgent by status metadata, and
   the single header CTA follows it. Nothing here is hand-picked.
   ============================================================ */

const ORANGE = "#EF5229";
const LILAC = "#CCA4FD";
const CYAN = "#2EBEEF";
const PLUM = "#310622";
const PLUM900 = "#0F010A";
const CREAM = "#FFFEEC";

type Status = "upcoming" | "open" | "closing-soon" | "closed" | "results-out";

/** the metadata spine from IA §01 — one tagging logic for every object */

/** IA §01: the five arms. Brand is a skin, never a nav path. */
const ARMS = [
  { id: "meetpixils", color: ORANGE, on: PLUM900,
    en: { name: "MeetPixils", line: "The masterbrand — the community and everything under it." },
    ar: { name: "ميت بيكسلز", line: "العلامة الأم — المجتمع وكل ما تحته." } },
  { id: "meetbattle", color: LILAC, on: "#2F263B",
    en: { name: "MeetBattle", line: "Competitions with real stakes, judged on a published scorecard." },
    ar: { name: "ميت باتل", line: "منافسات حقيقية بتحكيم ومعايير منشورة." } },
  { id: "meetacademy", color: "#C3B8FB", on: "#2A0A82",
    en: { name: "MeetAcademy", line: "Tracks and mentorship built on real client projects." },
    ar: { name: "ميت أكاديمي", line: "مسارات وإرشاد قائمة على مشاريع حقيقية." } },
  { id: "meetexperience", color: CYAN, on: PLUM,
    en: { name: "MeetExperience", line: "Events, talks and the annual flagship." },
    ar: { name: "ميت إكسبيرينس", line: "فعاليات وحوارات والحدث السنوي." } },
  { id: "meetbrands", color: "#6B3050", on: CREAM, provisional: true,
    en: { name: "MeetBrands", line: "Brand-identity programming. Palette not yet defined." },
    ar: { name: "ميت براندز", line: "برامج الهوية البصرية. الألوان لم تُحدد بعد." } },
];

/** Spec §05 — renders only at >=4 confirmed faces with photos. Placeholders do more damage than absence. */
const FACES: { name: string; role: string; proof: string; photo: string }[] = [];

/** Spec §06 — renders only at >=4 consented finalist works (IA SEV-3 empty state). */
const WORKS_CONSENTED: { title: string; team: string; src: string; cover: string }[] = [];


/** Spec v3 §03 — five arms, equal weight, order follows a designer's journey. */
const ARM_BLOCKS = [
  { id: "academy", bg: "#2A0A82", fg: CREAM, accent: "#C3B8FB", href: "/learn",
    en: { kicker: "MeetAcademy · the learning arm", head: "Learn on real projects, not exercises.",
          body: "Bootcamps and mentorship tracks — UX Research, UI, Interaction — built with industry, aimed at the gap between university and the job.",
          status: "First cohorts announced this season", cta: "Explore the Academy" },
    ar: { kicker: "ميت أكاديمي · ذراع التعلّم", head: "اتعلّم على مشاريع حقيقية، مش تمارين.",
          body: "بوتكامبات ومسارات منتورشيب — UX Research وUI وInteraction — مبنية مع السوق، هدفها الفجوة بين الجامعة والشغل.",
          status: "أول دفعات بننعلن عنها هالموسم", cta: "اكتشف الأكاديمية" } },
  { id: "battle", bg: "#2F263B", fg: CREAM, accent: LILAC, href: "/compete/how-judging-works",
    en: { kicker: "MeetBattle · the competition arm", head: "Real briefs. Named judges. A ticking clock.",
          body: "Design battles and designathons where you prove your craft — solo or matched into a team.",
          status: "First battle done: 48 entries · winners walk the season finale", cta: "See how battles work" },
    ar: { kicker: "ميت باتل · ذراع المنافسة", head: "برييفات حقيقية. لجنة بالاسم. وساعة عم تعد.",
          body: "تحديات وديزاينثونات بتثبت فيها شغلك — لحالك أو منوصلك بفريق.",
          status: "أول Battle خلص: ٤٨ مشاركة · الفايزين بيطلعوا على مسرح النهائي", cta: "كيف بتشتغل الـ Battles" } },
  { id: "experience", bg: CYAN, fg: PLUM, accent: PLUM, href: "/whats-on",
    en: { kicker: "MeetExperience · the community-events arm", head: "Where the scene actually meets.",
          body: "Meetups, talks, and workshops through the year — the rooms where juniors find mentors and studios find their next hire.",
          status: "6 events delivered this season", cta: "See what's on" },
    ar: { kicker: "ميت إكسبيرينس · ذراع الفعاليات", head: "وين الوسط فعلاً بيلتقي.",
          body: "لقاءات ومحاضرات وورشات على مدار السنة — القاعات اللي فيها الجونيور بيلاقي منتور والاستوديو بيلاقي موظفه الجاي.",
          status: "٦ فعاليات هالموسم", cta: "شو في قريب" } },
  { id: "brands", bg: PLUM, fg: CREAM, accent: CREAM, href: "/community/brands",
    en: { kicker: "MeetBrands · the branding community", head: "For the people who build identities.",
          body: "A year-round community for brand designers and strategists — critique, craft, and the discipline behind identity work.",
          status: "Opening this season · palette still in progress", cta: "Get notified" },
    ar: { kicker: "ميت براندز · مجتمع البراندنج", head: "للناس اللي بتبني هويات.",
          body: "مجتمع على طول السنة لمصممي واستراتيجيي البراندنج — نقد، صنعة، والانضباط اللي ورا شغل الهوية.",
          status: "بيفتح هالموسم · الألوان لسا قيد العمل", cta: "ذكّرني" } },
  { id: "flagship", bg: ORANGE, fg: PLUM900, accent: PLUM900, href: "/whats-on/final-showcase-2026/tickets",
    en: { kicker: "MeetPixils · the flagship night", head: "One night a year, the whole season walks one stage.",
          body: "Winners crowned, next season revealed, the scene in one room.",
          status: "This year: 26 September, The ARC, Amman", cta: "Event tickets" },
    ar: { kicker: "ميت بيكسلز · ليلة النهائي", head: "ليلة وحدة بالسنة، الموسم كله بيمشي على مسرح واحد.",
          body: "تتويج الفايزين، الكشف عن الموسم الجاي، والوسط كله بقاعة وحدة.",
          status: "هالسنة: ٢٦ أيلول، The ARC، عمّان", cta: "تذاكر الحدث" } },
];

/** Spec v3 §04 — four audiences, four doors. */
const AUDIENCES = [
  { id: "students", tint: "#C3B8FB", href: "/learn",
    en: { who: "Students & fresh grads", line: "Start before graduation: workshops, your first battle, your first mentor.", cta: "Learn →" },
    ar: { who: "طلاب وخريجين جدد", line: "ابدأ قبل التخرج: ورشات، أول Battle، أول منتور.", cta: "اتعلّم ←" } },
  { id: "working", tint: LILAC, href: "/compete",
    en: { who: "Working designers", line: "Specialize, compete, and put your name in the room.", cta: "Compete →" },
    ar: { who: "مصممين شغالين", line: "تخصّص، نافس، وخلّي اسمك بالغرفة.", cta: "نافس ←" } },
  { id: "senior", tint: CYAN, href: "/compete/be-a-judge",
    en: { who: "Senior designers", line: "Judge, mentor, speak — shape the scene you came up in.", cta: "Be a judge →" },
    ar: { who: "سينيور", line: "حكّم، كون منتور، احكي — ساهم بالوسط اللي كبرت فيه.", cta: "كن محكّم ←" } },
  { id: "partners", tint: ORANGE, href: "/about/sponsor",
    en: { who: "Companies & universities", line: "Meet validated talent and put your brand behind the season.", cta: "Partner with us →" },
    ar: { who: "شركات وجامعات", line: "تعرّفوا على مواهب مثبتة وحطوا اسمكم ورا الموسم.", cta: "اشتركوا معنا ←" } },
];

/** Spec v3 §05 — one number per arm, not four for Battle. */
const NUMBERS = [
  { en: ["400+", "designers in the community"], ar: ["+٤٠٠", "مصمم بالمجتمع"] },
  { en: ["6", "events & workshops delivered"], ar: ["٦", "فعاليات وورشات"] },
  { en: ["48", "entries in the first battle"], ar: ["٤٨", "مشاركة بأول Battle"] },
  { en: ["66", "designers shaping the Academy's first tracks"], ar: ["٦٦", "مصمم عم يشاركوا ببناء مسارات الأكاديمية"] },
  { en: ["1", "finale — 26 Sep"], ar: ["نهائي واحد", "٢٦ أيلول"] },
];

/** Spec v3 §06 — must carry dots from at least three arms at all times. */
/** 3D character set, pulled from the Meetpixils Master file (node 352:59). */
const CHARACTERS = [
  { id: "designer", src: "/characters/designer.jpg", tint: ORANGE,
    en: { name: "The designer", note: "Brand palette on the badge" },
    ar: { name: "المصمّم", note: "ألوان الهوية على الشارة" } },
  { id: "knit", src: "/characters/knit.jpg", tint: LILAC,
    en: { name: "The regular", note: "Mark on the knit" },
    ar: { name: "الحاضر الدائم", note: "الشعار على الكنزة" } },
  { id: "pixel-pet", src: "/characters/pixel-pet.jpg", tint: CYAN,
    en: { name: "The pixel pet", note: "Mascot, cube form" },
    ar: { name: "الرفيق", note: "التميمة بشكل مكعّب" } },
];

/** IA §09: urgency decides the hero and the header CTA — never editorial taste */
const RANK: Record<Status, number> = {
  "closing-soon": 0, open: 1, upcoming: 2, "results-out": 3, closed: 4,
};

const toAr = toArU;

function useCountdown(iso?: string) {
  const [left, setLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(null);
  useEffect(() => {
    if (!iso) return;
    const target = new Date(iso).getTime();
    const tick = () => {
      const ms = Math.max(0, target - Date.now());
      setLeft({
        d: Math.floor(ms / 86400000),
        h: Math.floor(ms / 3600000) % 24,
        m: Math.floor(ms / 60000) % 60,
        s: Math.floor(ms / 1000) % 60,
      });
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [iso]);
  return left;
}

export default function Home() {
  const { ar } = useLang();
  const [ambient, setAmbient] = useState(true);
  const [ready, setReady] = useState(false);

  const L = ar ? "ar" : "en";
  const dir = ar ? "rtl" : "ltr";
  const num = (n: number | string) => (ar ? toAr(n) : String(n));

  // most urgent object drives the hero — the admin store decides, never taste
  const [store] = useStore();
  const hero = useMemo(() => mostUrgent(store.objects), [store]);
  const rail = useMemo(
    () => [...store.objects].filter((o) => o.id !== hero.id && o.id !== "final-showcase-2026" && (o.status === "open" || o.status === "upcoming"))
      .sort((a, b) => RANKC[a.status] - RANKC[b.status]).slice(0, 2),
    [store, hero],
  );
  const left = useCountdown("2026-09-26T19:00:00+03:00");
  const copy = ar ? hero.ar : hero.en;

  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 60);
    return () => window.clearTimeout(t);
  }, []);

  const rise = (i: number): React.CSSProperties => ({
    opacity: ready ? 1 : 0,
    transform: ready ? "translateY(0)" : "translateY(18px)",
    transition: `opacity 640ms cubic-bezier(.16,1,.3,1) ${i * 70}ms, transform 640ms cubic-bezier(.16,1,.3,1) ${i * 70}ms`,
  });

  return (
    <div dir={dir} lang={L} style={{ background: PLUM900, color: CREAM, minHeight: "100vh", fontFamily: ar ? "var(--font-arabic)" : "var(--font-sans)" }}>

      {/* ---------- hero: 78vh, status-driven, ambient behind ---------- */}
      <section style={{ position: "relative", minHeight: "92vh", overflow: "hidden", background: PLUM900, display: "flex", alignItems: "flex-end", paddingTop: "clamp(88px,12vh,132px)" }}>
        {ambient && (
          /* translateZ(0) keeps the video on its own composited layer so the
             fluted glass above can sample it (Playbook §08). */
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, transform: "translateZ(0)", willChange: "transform", background: PLUM900 }}>
            <video
              autoPlay muted loop playsInline preload="metadata"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            >
              <source src="/video/hero.mp4" type="video/mp4" />
            </video>
          </div>
        )}

        {/* scrim — contrast is a guarantee, not a hope (Playbook §08) */}
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, zIndex: 5, background: "linear-gradient(to top, rgba(15,1,10,.94) 0%, rgba(15,1,10,.72) 32%, rgba(15,1,10,.16) 66%, rgba(15,1,10,0) 100%)" }} />
        {/* top scrim — the video is bright at the horizon and the header sits over it */}
        <div aria-hidden="true" style={{ position: "absolute", insetInlineStart: 0, insetInlineEnd: 0, top: 0, height: "34%", zIndex: 5, background: "linear-gradient(to bottom, rgba(15,1,10,.82) 0%, rgba(15,1,10,.45) 46%, rgba(15,1,10,0) 100%)" }} />

        <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 1480, margin: "0 auto", padding: "0 clamp(20px,5vw,64px) clamp(54px,9vh,104px)" }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, marginBottom: 16, ...rise(0) }}>
            <span style={pill(ORANGE, PLUM900)}>
              <span style={{ width: 6, height: 6, borderRadius: 999, background: PLUM900, animation: "mpPulse 1.6s cubic-bezier(.16,1,.3,1) infinite" }} />
              {ar ? `باقي ${num(left?.d ?? 0)} يوم` : `${left?.d ?? 0} days to go`}
            </span>
            <span style={mono}>{ar ? "ميت بيكسلز · العرض الختامي" : "meetpixils · Final Showcase"}</span>
          </div>

          <h1 style={{ ...rise(1), margin: 0, maxWidth: "16ch", fontSize: "clamp(38px,7vw,84px)", fontWeight: 800, lineHeight: ar ? 1.32 : 1.02, letterSpacing: ar ? 0 : "-.04em", textWrap: "balance" }}>
            {ar ? store.settings.heroT.ar : store.settings.heroT.en}
          </h1>

          <p style={{ ...rise(2), margin: "18px 0 0", maxWidth: ar ? "48ch" : "52ch", fontSize: "clamp(14px,1.5vw,16.5px)", lineHeight: ar ? 1.85 : 1.6, color: "rgba(255,254,236,.74)" }}>
            {ar ? store.settings.heroD.ar : store.settings.heroD.en}
          </p>

          {/* metadata spine — level, discipline, format, and the hours that answer the timing objection */}
          <div style={{ ...rise(3), display: "flex", flexWrap: "wrap", gap: 10, margin: "30px 0 0" }}>
            {[ar ? "٢٦ أيلول · The ARC" : "26 Sep · The ARC", ar ? "كل المستويات" : "All levels", "AR / EN"].map((t) => (
              <span key={t as string} style={tag}>{t}</span>
            ))}
          </div>

          <div style={{ ...rise(4), display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14, marginTop: 40 }}>
            <a href="/whats-on/final-showcase-2026/tickets" className="mp-btn" style={{ ["--wipe" as string]: CREAM, ["--wipe-fg" as string]: PLUM, background: ORANGE, color: PLUM900, fontFamily: "var(--font-mono)", fontSize: 13.5, fontWeight: 700, padding: "17px 34px", textDecoration: "none", ...cut(14) }}>
              {ar ? "تذاكر الحدث" : "Event tickets"}<span className="arw" aria-hidden="true">→</span>
            </a>
            <a href="/whats-on" className="mp-btn" style={{ ["--wipe" as string]: CREAM, ["--wipe-fg" as string]: PLUM900, border: "2px solid rgba(255,254,236,.32)", color: CREAM, fontFamily: "var(--font-mono)", fontSize: 13.5, fontWeight: 700, padding: "15px 30px", textDecoration: "none", borderRadius: 0 }}>
              {ar ? "شو في قريب؟" : "See what\u2019s on"}
            </a>
            {left && (
              <span style={{ ...mono, fontSize: 12, opacity: .8, fontVariantNumeric: "tabular-nums" }}>
                {num(String(left.d).padStart(2, "0"))}:{num(String(left.h).padStart(2, "0"))}:{num(String(left.m).padStart(2, "0"))}:{num(String(left.s).padStart(2, "0"))}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ---------- pixel handoff: dark hero → cream body ---------- */}
      <PixelTransition
        trigger="scroll" easing="linear" colorA={PLUM900}
        accentColors={[ORANGE, LILAC, CYAN, "#C3B8FB"]}
        direction="bottom-top" pattern="random" pixelSize={26} softness={0.12}
        height="auto" interactive={false}
      >
      {/* ---------- 02 · What is MeetPixils — the definition (Spec v3 §02) ---------- */}
      <section id="what" style={{ background: CREAM, color: PLUM, padding: "clamp(70px,12vh,130px) 0" }}>
        <div style={wrap}>
          <Reveal><div style={{ ...mono, color: "rgba(49,6,34,.5)", marginBottom: 18 }}>
            {ar ? "شو هو MeetPixils" : "What is MeetPixils"}
          </div></Reveal>
          <PixelStatement
            ar={ar}
            size="clamp(28px,4.4vw,52px)"
            text={ar ? "الأردن مليان مواهب تصميم، وناقصه أماكن تكبر فيها." : "Jordan is full of design talent and short on places to grow it."}
          />
          <Reveal delay={180}><p style={{ margin: "26px 0 0", maxWidth: "50ch", fontSize: "clamp(16px,1.9vw,21px)", lineHeight: ar ? 1.9 : 1.55, color: "rgba(49,6,34,.7)" }}>
            {ar
              ? "MeetPixils هو جوابنا: مجتمع واحد فيه المصمم بيتعلّم، بينافس، بيتعرّف على السوق، وشغله بينشاف — طول السنة، تحت سقف واحد، بخمس أذرع."
              : "MeetPixils is the answer we're building: one community where designers learn, compete, meet the industry, and get their work seen — all year, under one roof, in five arms."}
          </p></Reveal>
        </div>
      </section>
      </PixelTransition>

      {/* ---------- 03 · The five arms — equal weight, full blocks (Spec v3 §03) ---------- */}
      <section className="mp-armstack" style={{ background: CREAM, isolation: "isolate" }}>
        {ARM_BLOCKS.map((a, i) => {
          const c = ar ? a.ar : a.en;
          const flip = i % 2 === 1;
          return (
            <div key={a.id} className="mp-armpanel" style={{ background: a.bg, color: a.fg, zIndex: i + 1 }}>
              <div style={{ ...wrap, display: "grid", gap: "clamp(24px,4vw,56px)", gridTemplateColumns: "1fr", alignItems: "center", padding: "clamp(56px,9vh,96px) clamp(20px,5vw,64px)" }}>
                <div style={{ display: "grid", gap: "clamp(20px,3vw,44px)", gridTemplateColumns: "minmax(0,1fr)", }} className="mp-armrow">
                  <Reveal style={{ order: flip ? 2 : 1 }}><div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <MeetMark size={40} color={a.accent} />
                    <span style={{ ...mono, color: a.accent }}>{c.kicker}</span>
                    <h2 style={{ margin: 0, maxWidth: "18ch", fontSize: "clamp(24px,3.4vw,40px)", fontWeight: 800, letterSpacing: ar ? 0 : "-.03em", lineHeight: ar ? 1.4 : 1.1 }}>
                      {c.head}
                    </h2>
                  </div></Reveal>
                  <Reveal delay={120} style={{ order: flip ? 1 : 2 }}><div style={{ display: "flex", flexDirection: "column", gap: 16, justifyContent: "center", height: "100%" }}>
                    <p style={{ margin: 0, maxWidth: "46ch", fontSize: "clamp(14px,1.6vw,16.5px)", lineHeight: ar ? 1.9 : 1.6, opacity: .86 }}>
                      {c.body}
                    </p>
                    <p style={{ ...mono, margin: 0, opacity: .72 }}>{c.status}</p>
                    <a href={a.href} className="mp-btn" style={{ ["--wipe" as string]: a.fg, ["--wipe-fg" as string]: a.bg, ["--ring" as string]: a.accent, alignSelf: "flex-start", background: a.accent, color: a.bg, fontFamily: "var(--font-mono)", fontSize: 12.5, fontWeight: 700, padding: "13px 24px", textDecoration: "none", ...cut(12) }}>
                      {c.cta}<span className="arw" aria-hidden="true">→</span>
                    </a>
                  </div></Reveal>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* ---------- 04 · Who it's for (Spec v3 §04) ---------- */}
      <section style={{ background: CREAM, color: PLUM, padding: "clamp(70px,12vh,120px) 0" }}>
        <div style={wrap}>
          <Reveal><h2 style={{ margin: "0 0 24px", fontSize: "clamp(22px,3vw,34px)", fontWeight: 800, letterSpacing: ar ? 0 : "-.03em" }}>
            {ar ? "لمين هالإشي" : "Who it's for"}
          </h2></Reveal>
          <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))" }}>
            {AUDIENCES.map((au, ai) => {
              const c = ar ? au.ar : au.en;
              return (
                <Reveal key={au.id} delay={ai * 70}><a href={au.href} className="mp-aud" style={{ textDecoration: "none", color: PLUM, border: "1px solid rgba(49,6,34,.14)", padding: "22px 24px", display: "flex", flexDirection: "column", gap: 10, ...cut(14) }}>
                  <span style={{ ...mono, color: au.tint }}>{c.who}</span>
                  <p style={{ margin: 0, fontSize: 14.5, lineHeight: ar ? 1.85 : 1.5, color: "rgba(49,6,34,.72)" }}>{c.line}</p>
                  <span style={{ ...mono, marginTop: "auto", color: ORANGE }}>{c.cta}</span>
                </a></Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------- 05 · Numbers wall — one per arm (Spec v3 §05) ---------- */}
      <section style={{ background: ORANGE, color: PLUM900, padding: "clamp(34px,6vh,58px) 0" }}>
        <div style={{ ...wrap, display: "grid", gap: 22, gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))" }}>
          {NUMBERS.map((n, i) => {
            const [big, small] = ar ? n.ar : n.en;
            return (
              <Reveal key={i} delay={i * 60}><div>
                <div style={{ fontSize: "clamp(26px,3.2vw,38px)", fontWeight: 800, letterSpacing: ar ? 0 : "-.03em", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{big}</div>
                <div style={{ fontSize: 12.5, marginTop: 8, opacity: .82, lineHeight: ar ? 1.75 : 1.45 }}>{small}</div>
              </div></Reveal>
            );
          })}
        </div>
      </section>

      {/* ---------- 07 · Roster — gated (Spec v3 §07) ---------- */}
      {FACES.length >= 4 && (
        <section style={{ background: CREAM, color: PLUM, padding: "clamp(60px,10vh,100px) 0" }}>
          <div style={wrap}>
            <h2 style={{ margin: "0 0 20px", fontSize: "clamp(22px,3vw,32px)", fontWeight: 800 }}>
              {ar ? "مين بالغرفة" : "The people in the room"}
            </h2>
            <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}>
              {FACES.slice(0, 6).map((f) => (
                <a key={f.name} href="/community/people" style={{ textDecoration: "none", color: PLUM, border: "1px solid rgba(49,6,34,.14)", overflow: "hidden", ...cut(14) }}>
                  <img src={f.photo} alt={f.name} style={{ width: "100%", height: 200, objectFit: "cover", display: "block" }} />
                  <div style={{ padding: "14px 16px" }}>
                    <strong style={{ display: "block", fontSize: 15.5 }}>{f.name}</strong>
                    <span style={{ ...mono, color: "rgba(49,6,34,.5)", display: "block", marginTop: 4 }}>{f.role}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------- 07b · The open door — no battle references (Spec v3 §07) ---------- */}
      <section style={{ background: PLUM, color: CREAM, padding: "clamp(70px,12vh,130px) 0" }}>
        <div style={{ ...wrap, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 22 }}>
          <Reveal><div style={{ maxWidth: "46ch" }}>
            <h2 style={{ margin: 0, fontSize: "clamp(21px,2.8vw,32px)", fontWeight: 800, letterSpacing: ar ? 0 : "-.025em", lineHeight: ar ? 1.45 : 1.15 }}>
              {ar ? "٤٠٠ مصمم قبلك جوّا." : "400 designers are already in the room."}
            </h2>
            <p style={{ margin: "10px 0 0", fontSize: 14, color: "rgba(255,254,236,.7)", lineHeight: ar ? 1.85 : 1.6 }}>
              {ar
                ? "قروب الواتساب أول مكان بينزل فيه كل شي — فعاليات، دفعات، تحديات، مقاعد. ببلاش، وبتقدر تعمللنا Mute."
                : "The WhatsApp community is where everything lands first — events, cohorts, battles, seats. Free, and you can mute us."}
            </p>
          </div></Reveal>
          <a href="/community/whatsapp" className="mp-btn" style={{ ["--wipe" as string]: ORANGE, ["--wipe-fg" as string]: PLUM900, ["--ring" as string]: CREAM, background: CREAM, color: PLUM, fontFamily: "var(--font-mono)", fontSize: 13.5, fontWeight: 700, padding: "17px 32px", textDecoration: "none", whiteSpace: "nowrap", ...cut(14) }}>
            {ar ? "انضم للواتساب" : "Join the WhatsApp"}
          </a>
        </div>
      </section>

      {/* ---------- 07c · Build with us — donations band ---------- */}
      <section style={{ background: LILAC, color: PLUM900, padding: "clamp(60px,10vh,110px) 0" }}>
        <div style={{ ...wrap, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 22 }}>
          <Reveal><div style={{ maxWidth: "52ch" }}>
            <span style={{ ...mono, opacity: .6 }}>{ar ? "شو بعدين؟" : "What's next"}</span>
            <h2 style={{ margin: "8px 0 0", fontSize: "clamp(21px,2.8vw,32px)", fontWeight: 800, letterSpacing: ar ? 0 : "-.025em", lineHeight: ar ? 1.45 : 1.15 }}>
              {ar ? "ساعدنا نبني بيت دائم للمصممين." : "Help us build a permanent home for designers."}
            </h2>
            <p style={{ margin: "10px 0 0", fontSize: 14, opacity: .78, lineHeight: ar ? 1.85 : 1.6 }}>
              {ar
                ? "مساحة إبداعية / هَب للمصممين، وقهوة خاصة فينا — مشروعين عم نجمعلهم، تبرعك بيقرّبهم."
                : "A creative space & hub, and a designers' coffeeshop — two things we're raising for. Your pledge gets them closer."}
            </p>
          </div></Reveal>
          <a href="/donate" className="mp-btn" style={{ ["--wipe" as string]: CREAM, ["--wipe-fg" as string]: PLUM900, ["--ring" as string]: PLUM900, background: PLUM900, color: CREAM, fontFamily: "var(--font-mono)", fontSize: 13.5, fontWeight: 700, padding: "17px 32px", textDecoration: "none", whiteSpace: "nowrap", ...cut(14) }}>
            {ar ? "تبرّع" : "Donate"}<span className="arw" aria-hidden="true">→</span>
          </a>
        </div>
      </section>


      <button onClick={() => setAmbient((v) => !v)} style={{ position: "fixed", insetInlineEnd: 16, bottom: 16, zIndex: 60, ...ghost, opacity: .38, fontSize: 10.5 }}>
        {ambient ? (ar ? "إيقاف الحركة" : "Ambient off") : (ar ? "تشغيل الحركة" : "Ambient on")}
      </button>

      <style>{`
        /* Button states. The fill is an inset box-shadow rather than a pseudo-
           element, so it paints behind the label with no extra markup and no
           stacking-context surprises inside the chamfer clip-path. */
        .mp-btn {
          position: relative;
          transition: box-shadow 420ms cubic-bezier(.16,1,.3,1),
                      color 240ms cubic-bezier(.16,1,.3,1),
                      transform 180ms cubic-bezier(.16,1,.3,1),
                      border-color 240ms cubic-bezier(.16,1,.3,1);
        }
        .mp-btn:hover { box-shadow: inset 0 -4.4em 0 0 var(--wipe); color: var(--wipe-fg); }
        .mp-btn:active { transform: translateY(1px) scale(.995); }
        .mp-btn:focus-visible { outline: 2px solid var(--ring, #FF7A4F); outline-offset: 3px; }
        .mp-btn .arw { display: inline-block; margin-inline-start: 8px; transition: transform 320ms cubic-bezier(.16,1,.3,1); }
        .mp-btn:hover .arw { transform: translateX(5px); }
        [dir="rtl"] .mp-btn:hover .arw { transform: translateX(-5px); }
        .mp-ghost { transition: background 220ms cubic-bezier(.16,1,.3,1), color 220ms, border-color 220ms, transform 180ms; }
        .mp-ghost:hover { background: rgba(255,254,236,.1); color: #FFFEEC; border-color: rgba(255,254,236,.55); }
        .mp-ghost:active { transform: translateY(1px); }
        .mp-ghost:focus-visible { outline: 2px solid #FF7A4F; outline-offset: 2px; }
        .mp-aud { transition: transform 400ms cubic-bezier(.16,1,.3,1), border-color 300ms; }
        .mp-aud:hover { transform: translateY(-4px); border-color: rgba(49,6,34,.42); }
        .mp-aud .arw { display: inline-block; transition: transform 320ms cubic-bezier(.16,1,.3,1); }
        .mp-aud:hover .arw { transform: translateX(5px); }
        [dir="rtl"] .mp-aud:hover .arw { transform: translateX(-5px); }
        @media (prefers-reduced-motion: reduce) {
          .mp-btn, .mp-btn .arw, .mp-ghost, .mp-aud, .mp-aud .arw { transition: none }
          .mp-btn:active, .mp-ghost:active, .mp-aud:hover { transform: none }
        }
        @media (min-width: 880px) { .mp-armrow { grid-template-columns: 1fr 1fr !important } }
        .mp-door { transition: transform .4s cubic-bezier(.16,1,.3,1) }
        .mp-door:hover { transform: translateY(-4px) }
        .mp-char img { transition: transform 600ms cubic-bezier(.16,1,.3,1) }
        .mp-char:hover img { transform: scale(1.04) }
        /* Arms stack: each panel pins, the next slides over it. Solid panel
           backgrounds do the covering; z-index follows DOM order. Disabled on
           small screens where a pinned panel taller than the viewport would
           clip its own CTA. */
        @media (min-width: 641px) {
          .mp-armstack .mp-armpanel {
            position: sticky; top: 0; min-height: 76svh;
            display: flex; align-items: center;
          }
          .mp-armstack .mp-armpanel > div { width: 100% }
        }
        .mp-arm { transition: transform 400ms cubic-bezier(.16,1,.3,1), filter 400ms cubic-bezier(.16,1,.3,1) }
        .mp-arm:hover { transform: translateY(-4px); filter: brightness(1.06) }
        @media (min-width: 860px) { .mp-arm:first-child { grid-column: span 12 } }
        @media (max-width: 640px) { .mp-arm { grid-column: span 12 !important } }
        .mp-nav [data-slot="navigation-menu-trigger"]:hover { color: #FFFEEC }
        /* bridge the gap between trigger and panel — without this the pointer
           crosses dead space, pointerleave fires and the menu shuts mid-reach */
        .mp-nav [data-slot="navigation-menu-viewport"] { padding-top: 12px; margin-top: -12px; }
        .mp-nav [data-slot="navigation-menu-list"] { padding-bottom: 6px; margin-bottom: -6px; }
        /* THE fix: the registry viewport ships bg-background + border + rounded-md
           + overflow-hidden. That opaque cream box sat over the frosted panel and
           supplied the white border, and its overflow clipped the chamfer and the
           focus rings. Strip it and let our own glass surface be the only one. */
        .mp-nav [data-slot="navigation-menu-viewport"] {
          background: transparent !important;
          border: 0 !important;
          box-shadow: none !important;
          border-radius: 0 !important;
          overflow: visible !important;
        }
        /* the anchor itself is the hit target — 44px min, not a 15px text box */
        .mp-nav [data-slot="navigation-menu-viewport"] a {
          display: flex; align-items: center; min-height: 46px; box-sizing: border-box;
          padding: 11px 12px; font-size: 13.5px; line-height: 1.35;
          color: rgba(255,254,236,.92); text-decoration: none;
          transition: background 150ms cubic-bezier(.16,1,.3,1), color 150ms cubic-bezier(.16,1,.3,1);
        }
        .mp-nav [data-slot="navigation-menu-viewport"] a:hover {
          background: rgba(255,254,236,.09); color: #FFFEEC;
        }
        .mp-nav [data-slot="navigation-menu-viewport"] a:focus-visible {
          outline: 2px solid #FF7A4F; outline-offset: -2px;
          background: rgba(255,254,236,.09); color: #FFFEEC;
        }
        .mp-nav [data-slot="navigation-menu-trigger"]:focus-visible {
          outline: 2px solid #FF7A4F; outline-offset: 2px;
        }
        .mp-acc:focus-visible, .mp-drawerlink:focus-visible {
          outline: 2px solid #FF7A4F; outline-offset: -2px; background: rgba(255,254,236,.09);
        }
        .mp-drawerlink { transition: background 150ms, color 150ms }
        .mp-drawerlink:hover { background: rgba(255,254,236,.09); color: #FFFEEC }
        .mp-burger { display: none }
        @media (max-width: 860px) {
          .mp-nav { display: none }
          .mp-burger { display: inline-flex !important; align-items: center; justify-content: center }
        }
        @media (min-width: 861px) { .mp-drawer { display: none } }
        @keyframes mpTicker { from { transform: translate3d(0,0,0) } to { transform: translate3d(-50%,0,0) } }
        .mp-ticker { animation: mpTicker 34s linear infinite }
        [dir="rtl"] .mp-ticker { animation-direction: reverse }
        @media (prefers-reduced-motion: reduce) { .mp-ticker { animation: none } }
        @keyframes mpPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.35;transform:scale(.7)} }
        @media (min-width: 720px) { .mp-signin { display: inline-flex !important } }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration:.01ms !important; transition-duration:.01ms !important }
          .mp-flutes { display: none }
        }
      `}</style>
    </div>
  );
}

/** rig.ai's signature: a diagonal cut on top-left and bottom-right, radius 0, no shadow. */
const cut = (n = 14): React.CSSProperties => ({
  borderRadius: 0,
  clipPath: `polygon(${n}px 0, 100% 0, 100% calc(100% - ${n}px), calc(100% - ${n}px) 100%, 0 100%, 0 ${n}px)`,
});

const wrap: React.CSSProperties = {
  maxWidth: 1480, margin: "0 auto", padding: "0 clamp(16px,4vw,44px)",
};
const ghost: React.CSSProperties = {
  fontFamily: "var(--font-mono)", fontSize: 11.5,
  padding: "9px 14px", borderRadius: 0, cursor: "pointer",
  background: "transparent", color: "rgba(255,254,236,.78)",
  border: "1px solid rgba(255,254,236,.26)", whiteSpace: "nowrap",
};
const mono: React.CSSProperties = {
  fontFamily: "var(--font-mono)", fontSize: 11,
  letterSpacing: ".1em", textTransform: "uppercase",
};
const tag: React.CSSProperties = {
  fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: ".1em",
  textTransform: "uppercase", padding: "6px 12px", borderRadius: 0,
  border: "1px solid rgba(255,254,236,.2)", background: "transparent",
  color: "rgba(255,254,236,.72)", whiteSpace: "nowrap",
};
function pill(bg: string, fg: string): React.CSSProperties {
  return {
    display: "inline-flex", alignItems: "center", gap: 7,
    fontFamily: "var(--font-mono)", fontSize: 10.5,
    fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase",
    padding: "7px 14px", background: bg, color: fg, whiteSpace: "nowrap", ...cut(8),
  };
}
