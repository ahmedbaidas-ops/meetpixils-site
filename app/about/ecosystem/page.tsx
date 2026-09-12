"use client";
import { useLang, mono, cut, ORANGE, LILAC, CYAN, PERI, CREAM, PLUM } from "@/lib/ui";
import { SectionHero, Wrap } from "@/components/meetpixils/kit";
import { MeetMark } from "@/components/meetpixils/mark";
import { Reveal } from "@/components/meetpixils/reveal";

const ARMS = [
  { bg: "#2A0A82", fg: CREAM, ac: PERI, en: ["MeetAcademy", "Learn on real projects, not exercises."], ar: ["ميت أكاديمي", "اتعلّم على مشاريع حقيقية."], href: "/learn" },
  { bg: "#2F263B", fg: CREAM, ac: LILAC, en: ["MeetBattle", "Real briefs, named judges, a ticking clock."], ar: ["ميت باتل", "برييفات حقيقية ولجنة بالاسم."], href: "/compete" },
  { bg: CYAN, fg: PLUM, ac: PLUM, en: ["MeetExperience", "Where the scene actually meets."], ar: ["ميت إكسبيرينس", "وين الوسط فعلاً بيلتقي."], href: "/whats-on" },
  { bg: PLUM, fg: CREAM, ac: CREAM, en: ["MeetBrands", "For the people who build identities. Opening this season."], ar: ["ميت براندز", "للناس اللي بتبني هويات. بيفتح هالموسم."], href: "/community" },
  { bg: ORANGE, fg: "#0F010A", ac: "#0F010A", en: ["MeetPixils — the flagship", "One night a year, the whole season walks one stage."], ar: ["ميت بيكسلز — النهائي", "ليلة وحدة بالسنة، الموسم كله على مسرح واحد."], href: "/whats-on/final-showcase-2026" },
];

export default function Ecosystem() {
  const { ar } = useLang();
  return (
    <div>
      <SectionHero tint="#310622" fg={CREAM} ar={ar}
        kicker={ar ? "مين إحنا" : "About"}
        title={ar ? "الأذرع الخمسة" : "The five arms"}
        dek={ar ? "الصفحة الوحيدة اللي بتبدأ بالعلامات — لأنه هون هاد سؤالك." : "The one page that leads with the brands — because here, that's your question."} />
      <div style={{ position: "relative" }}>
        <img src="/characters/pet-cut.png" alt="" aria-hidden="true" className="px-float"
             style={{ position: "absolute", insetInlineEnd: "3%", top: -60, width: "clamp(110px,14vw,200px)", zIndex: 2, pointerEvents: "none" }} />
        {ARMS.map((a, i) => (
          <section key={a.en[0]} style={{ background: a.bg, color: a.fg }}>
            <Wrap style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 24, padding: "clamp(40px,7vh,70px) clamp(20px,5vw,64px)" }}>
              <Reveal><MeetMark size={38} color={a.ac} /></Reveal>
              <Reveal delay={80}><div style={{ flex: "1 1 300px" }}>
                <strong style={{ display: "block", fontSize: "clamp(22px,3vw,34px)", fontWeight: 800, letterSpacing: ar ? 0 : "-.03em" }}>{(ar ? a.ar : a.en)[0]}</strong>
                <span style={{ fontSize: 14.5, opacity: .8 }}>{(ar ? a.ar : a.en)[1]}</span>
              </div></Reveal>
              <Reveal delay={140}><a href={a.href} className="u-link" style={{ ...mono, color: a.ac, textDecoration: "none" }}>
                {ar ? "افتح ←" : "Open →"}
              </a></Reveal>
            </Wrap>
          </section>
        ))}
      </div>
      <style>{`
        .px-float { animation: pxfloat 7s ease-in-out infinite }
        @keyframes pxfloat { 0%,100% { transform: translateY(0) rotate(-1.5deg) } 50% { transform: translateY(-14px) rotate(1.5deg) } }
        @media (prefers-reduced-motion: reduce) { .px-float { animation: none } }
      `}</style>
    </div>
  );
}
