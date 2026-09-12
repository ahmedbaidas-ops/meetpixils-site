"use client";
import { useLang, mono, LILAC, ORANGE, CREAM } from "@/lib/ui";
import { SectionHero, Wrap } from "@/components/meetpixils/kit";
import { Reveal } from "@/components/meetpixils/reveal";
import { FAQ } from "@/components/meetpixils/faq";

const ROWS = [
  ["Research & framing", "البحث وتأطير المشكلة", "25%"],
  ["Journey & interaction", "الرحلة والتفاعل", "25%"],
  ["Craft & visual quality", "الصنعة والجودة البصرية", "25%"],
  ["Story & presentation", "السرد والعرض", "15%"],
  ["Feasibility", "قابلية التنفيذ", "10%"],
];

export default function Page() {
  const { ar } = useLang();
  return (
    <div>
      <SectionHero tint="#2F263B" fg={CREAM} ar={ar}
        kicker={ar ? "ميت باتل" : "MeetBattle"}
        title={ar ? "كيف يتم التحكيم" : "How judging works"}
        dek={ar ? "نفس الورقة اللي بيستعملها المحكمون — منشورة قبل ما يبدأ أي تحدي." : "The same scorecard the judges hold — published before any battle starts."} />
      <Wrap style={{ maxWidth: 880, padding: "clamp(50px,8vh,90px) clamp(20px,5vw,64px)" }}>
        <Reveal>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 420 }}>
              <thead><tr>
                <th style={{ ...mono, textAlign: "start", padding: "10px 12px", borderBottom: "1px solid rgba(255,254,236,.3)", color: LILAC }}>{ar ? "المعيار" : "Criterion"}</th>
                <th style={{ ...mono, textAlign: "end", padding: "10px 12px", borderBottom: "1px solid rgba(255,254,236,.3)", color: LILAC }}>{ar ? "الوزن" : "Weight"}</th>
              </tr></thead>
              <tbody>
                {ROWS.map(([en, arr, w]) => (
                  <tr key={en}>
                    <td style={{ padding: "13px 12px", borderBottom: "1px solid rgba(255,254,236,.12)", fontSize: 15 }}>{ar ? arr : en}</td>
                    <td style={{ padding: "13px 12px", borderBottom: "1px solid rgba(255,254,236,.12)", textAlign: "end", fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums" }}>{w}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
        <p style={{ ...mono, marginTop: 16, opacity: .55 }}>
          {ar ? "هاي الصفحة بتنعرض من نفس مستند التحكيم الداخلي — ما في نسختين." : "This page renders from the same document the panel uses — there are never two versions."}
        </p>
        <div style={{ marginTop: 50 }}>
          <FAQ dark tint={ORANGE} title={ar ? "أسئلة التحكيم" : "Judging FAQ"}
            items={ar ? [
              { q: "مين بيحكّم؟", a: "لجنة بالأسماء والصور، بتنعلن قبل الانطلاق. ما في تحكيم مجهول." },
              { q: "بشوف ملاحظاتي؟", a: "كل فريق بياخد ملاحظات اللجنة كتابةً بعد إعلان النتائج." },
            ] : [
              { q: "Who judges?", a: "A named, photographed panel announced before kickoff. No anonymous scoring." },
              { q: "Do I see my feedback?", a: "Every team receives the panel's written notes after results go out." },
            ]} />
        </div>
      </Wrap>
    </div>
  );
}
