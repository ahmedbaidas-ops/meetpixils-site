"use client";
import { useLang, mono, cut, ORANGE, CREAM, PLUM900 } from "@/lib/ui";
import { useStore } from "@/lib/content";
import { SectionHero, Wrap, PxStyles } from "@/components/meetpixils/kit";

/** Faces gate (spec §05): below 4 confirmed photos, honesty beats placeholders. */
export default function People() {
  const { ar } = useLang();
  const [store] = useStore();
  return (
    <div>
      <PxStyles tint={ORANGE} />
      <SectionHero tint="#310622" fg={CREAM} ar={ar}
        kicker={ar ? "المجتمع" : "Community"}
        title={ar ? "الناس" : "The people"}
        dek={ar ? "المحكمون والمرشدون والفائزون — بالأسماء والوجوه." : "Judges, mentors and winners — named, with faces."} />
      <Wrap style={{ padding: "clamp(46px,8vh,80px) clamp(20px,5vw,64px) clamp(70px,11vh,120px)", maxWidth: 880 }}>
        {store.faces.length >= 4 ? (
          <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}>
            {store.faces.map((f) => (
              <div key={f.name} style={{ border: "1px solid rgba(255,254,236,.16)", padding: "18px 20px", ...cut(14) }}>
                <strong style={{ display: "block", fontSize: 16 }}>{f.name}</strong>
                <span style={{ ...mono, opacity: .55, display: "block", margin: "6px 0" }}>{f.role}</span>
                <span style={{ fontSize: 13, color: "rgba(255,254,236,.66)" }}>{f.proof}</span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ border: "1px dashed rgba(255,254,236,.3)", padding: "36px 30px", ...cut(16) }}>
            <strong style={{ display: "block", fontSize: 20, marginBottom: 10 }}>
              {ar ? "الأسماء بتنشر مع انطلاق التحدي" : "The roster publishes at battle kickoff"}
            </strong>
            <p style={{ margin: "0 0 18px", fontSize: 14, color: "rgba(255,254,236,.7)", maxWidth: "52ch", lineHeight: 1.7 }}>
              {ar ? "منعرض وجوه حقيقية بس — ولا صورة رمزية. لحد وقتها، بتقدر تكون منهم:"
                  : "We only show real faces — never placeholders. Until then, you could be one of them:"}
            </p>
            <a href="/compete/be-a-judge" className="mp-btn"
               style={{ ["--wipe" as string]: CREAM, ["--wipe-fg" as string]: PLUM900, display: "inline-block",
                        background: ORANGE, color: PLUM900, fontFamily: "var(--font-mono)", fontSize: 13,
                        fontWeight: 700, padding: "14px 26px", textDecoration: "none", ...cut(12) }}>
              {ar ? "كن محكّماً" : "Be a judge"}
            </a>
          </div>
        )}
      </Wrap>
    </div>
  );
}
