"use client";
import * as React from "react";
import { useLang, mono, cut, ORANGE, CREAM } from "@/lib/ui";
import { SectionHero, Wrap, PxStyles } from "@/components/meetpixils/kit";

/** T6 utility — a tool, not a pitch. Reads the entries the prototype forms saved. */
export default function Me() {
  const { ar } = useLang();
  const [entries, setEntries] = React.useState<Record<string, string>[]>([]);
  React.useEffect(() => {
    try { setEntries(JSON.parse(localStorage.getItem("mp-entries") || "[]")); } catch {}
  }, []);
  return (
    <div>
      <PxStyles tint={ORANGE} />
      <SectionHero tint="#310622" fg={CREAM} ar={ar}
        kicker={ar ? "ملفي" : "My profile"}
        title={ar ? "أغراضي" : "My stuff"}
        dek={ar ? "تسجيلاتك وشهاداتك وبورتفوليوك — بمكان واحد." : "Your registrations, certificates and portfolio — in one place."} />
      <Wrap style={{ padding: "clamp(40px,7vh,70px) clamp(20px,5vw,64px) clamp(70px,11vh,120px)", maxWidth: 880 }}>
        <h2 style={{ margin: "0 0 16px", fontSize: 22, fontWeight: 800 }}>{ar ? "تسجيلاتي" : "My registrations"}</h2>
        {entries.length ? entries.map((e, i) => (
          <div key={i} className="px-row" style={{ cursor: "default" }}>
            <span style={{ ...mono, color: ORANGE, minWidth: 110 }}>{e._kind}</span>
            <span style={{ flex: 1, fontSize: 15 }}>{e.name || e.company || "—"}</span>
            <span style={{ ...mono, opacity: .5 }}>{(e._at || "").slice(0, 10)}</span>
          </div>
        )) : (
          <p style={{ fontSize: 14.5, color: "rgba(255,254,236,.65)" }}>
            {ar ? "ما سجّلت بإشي لسا — أقرب باب: " : "Nothing yet — the nearest door: "}
            <a href="/compete" className="u-link" style={{ color: ORANGE }}>{ar ? "دوّر على فريق" : "find a team"}</a>
          </p>
        )}
        <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginTop: 34 }}>
          <a href="/me/certificates" className="u-link" style={{ ...mono, color: CREAM, textDecoration: "none" }}>{ar ? "شهاداتي ←" : "Certificates →"}</a>
          <a href="/me/portfolio" className="u-link" style={{ ...mono, color: CREAM, textDecoration: "none" }}>{ar ? "بورتفوليو ←" : "Portfolio →"}</a>
        </div>
      </Wrap>
    </div>
  );
}
