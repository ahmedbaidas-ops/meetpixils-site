"use client";
import { useLang, mono, cut, ORANGE, CREAM, PLUM900 } from "@/lib/ui";
import { useStore } from "@/lib/content";
import { SectionHero, Wrap, PxStyles } from "@/components/meetpixils/kit";
import { Reveal } from "@/components/meetpixils/reveal";

/** IA SEV-3 empty state: below 12 consented works this page stays honest, not hollow. */
export default function Showcase() {
  const { ar } = useLang();
  const [store] = useStore();
  const full = store.works.length >= 12;
  return (
    <div>
      <PxStyles tint={ORANGE} />
      <SectionHero tint="#310622" fg={CREAM} ar={ar}
        kicker={ar ? "المجتمع" : "Community"}
        title={ar ? "معرض الأعمال" : "The Showcase"}
        dek={ar ? "شغل فايز ومختار، بأسماء أصحابه كاملة." : "Winning and selected work, always with full credits."} />
      <Wrap style={{ padding: "clamp(46px,8vh,80px) clamp(20px,5vw,64px) clamp(70px,11vh,120px)" }}>
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))" }}>
          {store.works.map((w, i) => (
            <Reveal key={w.title + i} delay={i * 60}>
              <div style={{ border: "1px solid rgba(255,254,236,.16)", overflow: "hidden", ...cut(14) }}>
                <div style={{ height: 140, background: `linear-gradient(135deg, ${w.tint}33, rgba(255,254,236,.04))` }} />
                <div style={{ padding: "14px 16px" }}>
                  <span style={{ ...mono, opacity: .5 }}>{w.src}</span>
                  <strong style={{ display: "block", fontSize: 15.5, margin: "6px 0 2px" }}>{w.title}</strong>
                  <span style={{ fontSize: 12.5, color: "rgba(255,254,236,.6)" }}>{w.team}</span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        {!full && (
          <p style={{ ...mono, marginTop: 22, opacity: .55, maxWidth: "60ch", lineHeight: 1.8 }}>
            {ar ? "المعرض بيكبر مع كل موسم — شغل خدمتك بينضاف بعد النتائج وبموافقة أصحابه."
                : "The Showcase grows each season — Khedmetak work lands after results day, with each team's consent."}
          </p>
        )}
      </Wrap>
    </div>
  );
}
