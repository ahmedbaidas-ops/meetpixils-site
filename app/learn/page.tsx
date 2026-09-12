"use client";
import { useLang, mono, cut, PERI, CREAM, PLUM900 } from "@/lib/ui";
import { useStore } from "@/lib/content";
import { SectionHero, Wrap, PxStyles } from "@/components/meetpixils/kit";
import { PixelStatement } from "@/components/meetpixils/pixel-text";
import { Reveal } from "@/components/meetpixils/reveal";

const TRACKS = [
  { id: "ux-research", href: "/learn/tracks/ux-research", en: ["UX Research", "The gap employers name first."], ar: ["بحث المستخدم", "الفجوة اللي أصحاب العمل بيسموها أول شي."] },
  { id: "ui", href: "/learn", en: ["UI Design", "Cohort announced this season."], ar: ["تصميم الواجهات", "الدفعة بتنعلن هالموسم."] },
  { id: "interaction", href: "/learn", en: ["Interaction", "Cohort announced this season."], ar: ["التفاعل", "الدفعة بتنعلن هالموسم."] },
];

export default function Learn() {
  const { ar } = useLang();
  const [store] = useStore();
  const cohort = store.objects.find((o) => o.id === "ux-research-track");
  return (
    <div>
      <PxStyles tint={PERI} />
      <SectionHero tint="#2A0A82" fg={CREAM} ar={ar}
        kicker={ar ? "ميت أكاديمي" : "MeetAcademy"}
        title={ar ? "اتعلّم" : "Learn"}
        dek={ar ? "مسارات مبنية مع السوق، على مشاريع حقيقية — مش تمارين." : "Tracks built with industry, on real projects — not exercises."} />
      <section style={{ background: CREAM, color: "#310622", padding: "clamp(60px,10vh,110px) 0", position: "relative", overflow: "hidden" }}>
        <img src="/characters/pet-cut.png" alt="" aria-hidden="true" className="px-float"
             style={{ position: "absolute", insetInlineEnd: "4%", top: "8%", width: "clamp(120px,16vw,230px)", opacity: .9, pointerEvents: "none" }} />
        <Wrap>
          <PixelStatement ar={ar} faint="rgba(49,6,34,.16)" full="#310622"
            text={ar ? "تخصّص بدل ما تغرق بـ«لازم تعرف كل شي»." : "Specialize instead of drowning in know-everything."} />
        </Wrap>
      </section>
      <section style={{ padding: "clamp(56px,9vh,100px) 0" }}>
        <Wrap>
          <h2 style={{ margin: "0 0 20px", fontSize: "clamp(22px,3vw,34px)", fontWeight: 800, letterSpacing: ar ? 0 : "-.03em" }}>{ar ? "المسارات" : "The tracks"}</h2>
          <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))" }}>
            {TRACKS.map((t, i) => (
              <Reveal key={t.id} delay={i * 70}>
                <a href={t.href} className="px-card" style={{ ["--tint" as string]: PERI, minHeight: 170 }}>
                  <span style={{ ...mono, color: PERI }}>{ar ? "مسار" : "Track"}</span>
                  <strong style={{ fontSize: 20, fontWeight: 750 }}>{(ar ? t.ar : t.en)[0]}</strong>
                  <p style={{ margin: 0, fontSize: 13.5, color: "rgba(255,254,236,.66)" }}>{(ar ? t.ar : t.en)[1]}</p>
                  <span style={{ ...mono, marginTop: "auto", color: PERI }}>{ar ? "التفاصيل" : "Details"}<span className="arw" aria-hidden="true">→</span></span>
                </a>
              </Reveal>
            ))}
          </div>
          {cohort && (
            <a href={`/whats-on/${cohort.id}`} className="px-row" style={{ marginTop: 26 }}>
              <span style={{ ...mono, color: PERI, minWidth: 110 }}>{(ar ? cohort.ar : cohort.en).when}</span>
              <strong style={{ flex: 1, fontSize: 17 }}>{(ar ? cohort.ar : cohort.en).t}</strong>
              <span className="arw" aria-hidden="true">→</span>
            </a>
          )}
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 34 }}>
            <a href="/learn/mentorship" className="u-link" style={{ ...mono, color: CREAM, textDecoration: "none" }}>{ar ? "الإرشاد ←" : "Mentorship →"}</a>
            <a href="/learn/workshops" className="u-link" style={{ ...mono, color: CREAM, textDecoration: "none" }}>{ar ? "الورشات ←" : "Workshops →"}</a>
          </div>
        </Wrap>
      </section>
    </div>
  );
}
