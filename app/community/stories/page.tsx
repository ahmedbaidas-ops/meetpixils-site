"use client";
import { useLang, mono, ORANGE, CREAM } from "@/lib/ui";
import { SectionHero, Wrap, PxStyles } from "@/components/meetpixils/kit";

const STORIES = [
  { en: ["What the judges actually looked for", "The Spring scorecard, line by line, with the entries that scored highest."], ar: ["شو دوّرت عليه اللجنة فعلاً", "معايير الربيع سطر سطر، مع المشاركات الأعلى."], tag: ["4 min · EN", "٤ دق · EN"] },
  { en: ["Ninety designers, one rooftop", "Meetup 03 recap — zero slides, one long argument about Figma.", ], ar: ["تسعين مصمم وسطح واحد", "ملخص اللقاء ٠٣ — بدون شرائح، ونقاش طويل عن Figma."], tag: ["3 min · AR", "٣ دق · AR"] },
];

export default function Stories() {
  const { ar } = useLang();
  return (
    <div>
      <PxStyles tint={ORANGE} />
      <SectionHero tint="#310622" fg={CREAM} ar={ar}
        kicker={ar ? "المجتمع" : "Community"}
        title={ar ? "قصص" : "Stories"}
        dek={ar ? "ملخصات، مقابلات فائزين، وأخبار الموسم." : "Recaps, winner interviews, and season news."} />
      <Wrap style={{ padding: "clamp(46px,8vh,80px) clamp(20px,5vw,64px) clamp(70px,11vh,120px)", maxWidth: 880 }}>
        {STORIES.map((s, i) => (
          <a key={i} href="#" onClick={(e) => e.preventDefault()} className="px-row">
            <div style={{ flex: 1 }}>
              <strong style={{ display: "block", fontSize: 18, fontWeight: 700 }}>{(ar ? s.ar : s.en)[0]}</strong>
              <span style={{ fontSize: 13.5, color: "rgba(255,254,236,.62)" }}>{(ar ? s.ar : s.en)[1]}</span>
            </div>
            <span style={{ ...mono, opacity: .5 }}>{ar ? s.tag[1] : s.tag[0]}</span>
            <span className="arw" aria-hidden="true">→</span>
          </a>
        ))}
        <p style={{ ...mono, marginTop: 20, opacity: .5 }}>{ar ? "القصص بتنشر بلغتها — مش كلها مترجمة." : "Stories publish in their own language — not everything is translated."}</p>
      </Wrap>
    </div>
  );
}
