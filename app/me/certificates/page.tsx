"use client";
import { useLang, mono, cut, ORANGE, CREAM } from "@/lib/ui";
import { SectionHero, Wrap } from "@/components/meetpixils/kit";

export default function Certs() {
  const { ar } = useLang();
  return (
    <div>
      <SectionHero tint="#310622" fg={CREAM} ar={ar}
        kicker={ar ? "ملفي" : "My profile"}
        title={ar ? "شهاداتي" : "Certificates"}
        dek={ar ? "كل ورشة أو مسار بتكمله بيطلعلك شهادة هون." : "Every workshop or track you finish lands a certificate here."} />
      <Wrap style={{ padding: "clamp(40px,7vh,70px) clamp(20px,5vw,64px) clamp(70px,11vh,120px)", maxWidth: 760 }}>
        <div style={{ border: "1px dashed rgba(255,254,236,.3)", padding: "34px 28px", ...cut(16) }}>
          <strong style={{ display: "block", fontSize: 19, marginBottom: 8 }}>{ar ? "ولا شهادة لسا" : "None yet"}</strong>
          <p style={{ margin: "0 0 14px", fontSize: 14, color: "rgba(255,254,236,.68)" }}>
            {ar ? "أقرب وحدة: ورشة بحث المستخدم — ٤ أيلول." : "Your nearest one: the UX Research workshop — 4 Sep."}
          </p>
          <a href="/whats-on/ux-research-workshop" className="u-link" style={{ ...mono, color: ORANGE, textDecoration: "none" }}>
            {ar ? "احجز مقعدك ←" : "Save a seat →"}
          </a>
        </div>
      </Wrap>
    </div>
  );
}
