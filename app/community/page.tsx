"use client";
import { useLang, mono, ORANGE, CREAM } from "@/lib/ui";
import { SectionHero, Wrap, PxStyles } from "@/components/meetpixils/kit";
import { Reveal } from "@/components/meetpixils/reveal";

const DOORS = [
  { href: "/community/showcase", en: ["Showcase", "Winning work, full credits."], ar: ["معرض الأعمال", "شغل فايز بأسماء أصحابه."] },
  { href: "/community/people", en: ["People", "Judges, mentors, winners."], ar: ["الناس", "محكمون ومرشدون وفائزون."] },
  { href: "/community/stories", en: ["Stories", "Recaps and winner interviews."], ar: ["قصص", "ملخصات ومقابلات الفائزين."] },
  { href: "/community/whatsapp", en: ["WhatsApp", "Where the scene actually talks."], ar: ["واتساب", "وين الوسط فعلاً بيحكي."] },
  { href: "https://discord.gg/FhnNbqZk5", ext: true, en: ["Discord", "Voice rooms, battle channels, and the mid-battle panic."], ar: ["ديسكورد", "غرف صوتية وقنوات التحديات."] },
  { href: "https://www.instagram.com/meet_pixils/", ext: true, en: ["Instagram", "Where every drop lands first — @meet_pixils."], ar: ["إنستغرام", "وين كل إعلان بينزل أول — @meet_pixils"] },
];

export default function Community() {
  const { ar } = useLang();
  return (
    <div>
      <PxStyles tint={ORANGE} />
      <SectionHero tint="#310622" fg={CREAM} ar={ar}
        kicker={ar ? "ميت بيكسلز" : "MeetPixils"}
        title={ar ? "المجتمع" : "Community"}
        dek={ar ? "الشغل، الناس، والقصص — والحكي الحقيقي على واتساب." : "The work, the people, the stories — and the real talk on WhatsApp."} />
      <Wrap style={{ padding: "clamp(46px,8vh,80px) clamp(20px,5vw,64px) clamp(70px,11vh,120px)" }}>
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))" }}>
          {DOORS.map((d, i) => (
            <Reveal key={d.href} delay={i * 70}>
              <a href={d.href} className="px-card" style={{ ["--tint" as string]: ORANGE, minHeight: 150 }}
                 {...((d as { ext?: boolean }).ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                <strong style={{ fontSize: 19, fontWeight: 750 }}>{(ar ? d.ar : d.en)[0]}</strong>
                <p style={{ margin: 0, fontSize: 13.5, color: "rgba(255,254,236,.66)" }}>{(ar ? d.ar : d.en)[1]}</p>
                <span style={{ ...mono, marginTop: "auto", color: ORANGE }}>{ar ? "افتح" : "Open"}<span className="arw" aria-hidden="true">{(d as { ext?: boolean }).ext ? "↗" : "→"}</span></span>
              </a>
            </Reveal>
          ))}
        </div>
      </Wrap>
    </div>
  );
}
