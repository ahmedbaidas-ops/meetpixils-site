"use client";
import { useLang, mono, cut, ORANGE, CREAM, PLUM900 } from "@/lib/ui";
import { SectionHero, Wrap } from "@/components/meetpixils/kit";

export default function Partners() {
  const { ar } = useLang();
  return (
    <div>
      <SectionHero tint="#310622" fg={CREAM} ar={ar}
        kicker={ar ? "مين إحنا" : "About"}
        title={ar ? "الشركاء" : "Partners"}
        dek={ar ? "الجهات اللي حاطة اسمها ورا الموسم." : "The names behind the season."} />
      <Wrap style={{ padding: "clamp(46px,8vh,80px) clamp(20px,5vw,64px) clamp(70px,11vh,120px)", maxWidth: 880 }}>
        <div style={{ border: "1px dashed rgba(255,254,236,.3)", padding: "36px 30px", ...cut(16) }}>
          <strong style={{ display: "block", fontSize: 20, marginBottom: 10 }}>
            {ar ? "شعارات الشركاء بتنشر مع إعلان الموسم" : "Partner logos publish with the season announcement"}
          </strong>
          <p style={{ margin: "0 0 18px", fontSize: 14, color: "rgba(255,254,236,.7)", maxWidth: "52ch", lineHeight: 1.7 }}>
            {ar ? "منعرض شركاء مؤكدين بس. بدك تكون منهم؟" : "We only show confirmed partners. Want to be one of them?"}
          </p>
          <a href="/about/sponsor" className="mp-btn"
             style={{ ["--wipe" as string]: CREAM, ["--wipe-fg" as string]: PLUM900, display: "inline-block",
                      background: ORANGE, color: PLUM900, fontFamily: "var(--font-mono)", fontSize: 13,
                      fontWeight: 700, padding: "14px 26px", textDecoration: "none", ...cut(12) }}>
            {ar ? "ارعَ فعالية" : "Sponsor an event"}
          </a>
        </div>
      </Wrap>
    </div>
  );
}
