"use client";
import { useLang, mono, cut, ORANGE, CREAM, PLUM900 } from "@/lib/ui";
import { SectionHero, Wrap } from "@/components/meetpixils/kit";

/** IA: the conversation lives on WhatsApp — this page is only the door. */
export default function WA() {
  const { ar } = useLang();
  const inside = ar
    ? ["أخبار التحديات والمقاعد أول بأول", "فرص فرق للي جايين لحالهم", "نقاشات تصميم حقيقية (وأحياناً عن Figma)"]
    : ["Battle and seat drops, first", "Team-matching for solo entrants", "Real design talk (occasionally about Figma)"];
  return (
    <div>
      <SectionHero tint="#310622" fg={CREAM} ar={ar}
        kicker={ar ? "المجتمع" : "Community"}
        title={ar ? "مش جاهز تنافس؟ تفرّج الأول." : "Not ready to compete? Lurk first."}
        dek={ar ? "٤٠٠ مصمم قبلك جوّا. ببلاش، وبتقدر تعمللنا Mute." : "400 designers are already in. Free, and you can mute us."} />
      <Wrap style={{ padding: "clamp(46px,8vh,80px) clamp(20px,5vw,64px) clamp(70px,11vh,120px)", maxWidth: 760 }}>
        <ul style={{ listStyle: "none", margin: "0 0 30px", padding: 0, display: "grid", gap: 12 }}>
          {inside.map((x) => (
            <li key={x} style={{ display: "flex", gap: 12, alignItems: "center", fontSize: 15.5 }}>
              <span aria-hidden="true" style={{ width: 8, height: 8, background: ORANGE, flex: "0 0 auto" }} />{x}
            </li>
          ))}
        </ul>
        <a href="#" onClick={(e) => e.preventDefault()} className="mp-btn"
           style={{ ["--wipe" as string]: CREAM, ["--wipe-fg" as string]: PLUM900, display: "inline-block",
                    background: ORANGE, color: PLUM900, fontFamily: "var(--font-mono)", fontSize: 14,
                    fontWeight: 700, padding: "17px 32px", textDecoration: "none", ...cut(14) }}>
          {ar ? "انضم للواتساب" : "Join the WhatsApp"}<span className="arw" aria-hidden="true">→</span>
        </a>
        <p style={{ ...mono, marginTop: 14, opacity: .5 }}>{ar ? "رابط الواتساب بينحط هون عند الإطلاق." : "The WhatsApp invite link lands here at launch."}</p>
        <p style={{ marginTop: 26, fontSize: 14.5, color: "rgba(255,254,236,.72)" }}>
          {ar ? "بتفضّل ديسكورد؟ " : "Prefer Discord? "}
          <a href="https://discord.gg/FhnNbqZk5" target="_blank" rel="noopener noreferrer" className="u-link" style={{ color: ORANGE }}>
            {ar ? "إحنا هناك كمان ↗" : "We're there too ↗"}
          </a>
        </p>
      </Wrap>
    </div>
  );
}
