"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useLang, mono, cut, toAr, ORANGE, CREAM, PLUM900 } from "@/lib/ui";
import { useStore, daysLeft, statusLabel, objHref, CObj } from "@/lib/content";
import { Wrap, PxStyles } from "./kit";
import { Reveal } from "./reveal";

/** IA T3 — deep-link-first object detail. Renders complete without prior context. */
export function ObjectDetail({ id: idProp }: { id?: string }) {
  const params = useParams<{ slug?: string }>();
  const id = idProp ?? params?.slug ?? "";
  const { ar } = useLang();
  const [store] = useStore();
  const [now, setNow] = React.useState(() => Date.now());
  React.useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);

  const o = store.objects.find((x) => x.id === id);
  if (!o) {
    return (
      <Wrap style={{ paddingTop: 140, paddingBottom: 120 }}>
        <p style={{ ...mono, color: ORANGE }}>{ar ? "٤٠٤" : "404"}</p>
        <h1 style={{ fontSize: "clamp(28px,4vw,48px)", fontWeight: 800, margin: "10px 0 18px" }}>
          {ar ? "ما لقينا هالصفحة" : "We couldn't find that one"}
        </h1>
        <a href="/whats-on" className="u-link" style={{ ...mono, color: CREAM, textDecoration: "none" }}>
          {ar ? "← شوف كل القادم" : "← See everything coming up"}
        </a>
      </Wrap>
    );
  }
  const c = ar ? o.ar : o.en;
  const d = daysLeft(o.due, now);
  const isBattle = o.type === "Competition";
  const sections = isBattle
    ? (ar ? [["brief","الملخص"],["timeline","الجدول"],["judges","اللجنة"],["prizes","الجوائز"],["faq","أسئلة"]] 
          : [["brief","Brief"],["timeline","Timeline"],["judges","Judges"],["prizes","Prizes"],["faq","FAQ"]])
    : (ar ? [["about","عن الفعالية"],["details","التفاصيل"]] : [["about","About"],["details","Details"]]);

  return (
    <div style={{ paddingTop: 92 }}>
      <PxStyles tint={o.tint} />
      <Wrap>
        <nav aria-label="breadcrumb" style={{ ...mono, opacity: .55, marginBottom: 20 }}>
          <a href={isBattle ? "/compete" : "/whats-on"} className="u-link" style={{ color: CREAM, textDecoration: "none" }}>
            {isBattle ? (ar ? "نافس" : "Compete") : (ar ? "شو في قريب؟" : "What's On")}
          </a>
          <span style={{ margin: "0 8px", opacity: .5 }}>/</span>{c.t.slice(0, 26)}
        </nav>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
          <span style={{ ...mono, fontWeight: 700, padding: "7px 14px",
                         ...(o.status === "closing-soon" ? { background: ORANGE, color: PLUM900 } : { border: `1px solid ${o.tint}`, color: o.tint }),
                         ...cut(8) }}>
            {statusLabel(o, ar, toAr, now)}
          </span>
          <span style={{ ...mono, opacity: .5 }}>{o.arm} · {o.type}</span>
        </div>
        <h1 style={{ margin: "16px 0 0", maxWidth: "18ch", fontSize: "clamp(34px,6vw,72px)", fontWeight: 800,
                     letterSpacing: ar ? 0 : "-.04em", lineHeight: ar ? 1.35 : 1.02, textWrap: "balance" }}>{c.t}</h1>
        <p style={{ margin: "16px 0 0", maxWidth: "52ch", fontSize: 16, lineHeight: ar ? 1.9 : 1.6, color: "rgba(255,254,236,.74)" }}>{c.d}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, margin: "22px 0 0" }}>
          {[c.when, o.level, o.format, o.city, o.discipline].map((t, i) => (
            <span key={i} style={{ ...mono, padding: "6px 12px", border: "1px solid rgba(255,254,236,.2)", color: "rgba(255,254,236,.72)" }}>{t}</span>
          ))}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14, margin: "30px 0 0" }}>
          <a href={isBattle ? `/compete/${o.id}/find-a-team` : o.id === "final-showcase-2026" ? "/whats-on/final-showcase-2026/tickets" : "#register"} className="mp-btn"
             style={{ ["--wipe" as string]: CREAM, ["--wipe-fg" as string]: PLUM900, background: o.tint, color: PLUM900,
                      fontFamily: "var(--font-mono)", fontSize: 13.5, fontWeight: 700, padding: "16px 30px", textDecoration: "none", ...cut(12) }}>
            {c.cta}<span className="arw" aria-hidden="true">→</span>
          </a>
          {isBattle && d != null && (
            <span style={{ ...mono, fontVariantNumeric: "tabular-nums", opacity: .8 }}>
              {ar ? `باقي ${toAr(d)} أيام` : `${d} days left`}
            </span>
          )}
        </div>

        {/* section-local subnav (IA T3) */}
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", margin: "44px 0 0", borderBottom: "1px solid rgba(255,254,236,.14)" }}>
          {sections.map(([sid, label]) => (
            <a key={sid} href={`#${sid}`} className="u-link"
               style={{ ...mono, color: "rgba(255,254,236,.7)", textDecoration: "none", padding: "10px 12px" }}>{label}</a>
          ))}
        </div>

        <div style={{ display: "grid", gap: 40, padding: "40px 0 90px", maxWidth: 880 }}>
          {isBattle ? (
            <>
              <Reveal><section id="brief"><h2 style={h2s}>{ar ? "الملخص" : "The brief"}</h2>
                <p style={ps}>{ar ? "بتوصلك التفاصيل الكاملة ساعة الانطلاق. الفكرة: خدمة عامة حقيقية، بحاجة إعادة تصميم كاملة — بحث، رحلة، واجهات، وقياس." : "Full details drop at kickoff. The shape: a real public service that needs a full redesign — research, journey, screens, and how you'd measure it."}</p></section></Reveal>
              <Reveal><section id="timeline"><h2 style={h2s}>{ar ? "الجدول" : "Timeline"}</h2>
                <p style={ps}>{ar ? "٧٢ ساعة من الانطلاق للتسليم، والتحكيم مباشر بعدها بيومين. ~١٤ ساعة شغل فعلي متوقعة." : "72 hours from kickoff to submission; live judging two days later. Expect ~14 hours of actual work — it fits around a job."}</p></section></Reveal>
              <Reveal><section id="judges"><h2 style={h2s}>{ar ? "اللجنة" : "Judges"}</h2>
                <p style={ps}>{ar ? "بننشر اللجنة بالأسماء والصور قبل الانطلاق — التحكيم على معايير منشورة." : "The panel publishes with names and faces before kickoff — judging runs on the published scorecard, nothing hidden."}</p>
                <a href="/compete/how-judging-works" className="u-link" style={{ ...mono, color: o.tint, textDecoration: "none" }}>{ar ? "كيف يتم التحكيم ←" : "How judging works →"}</a></section></Reveal>
              <Reveal><section id="prizes"><h2 style={h2s}>{ar ? "الجوائز" : "Prizes"}</h2>
                <p style={ps}>{ar ? "الفايزين بيطلعوا على مسرح العرض الختامي — ٢٦ أيلول — وشغلهم بينحط بالمعرض بأسمائهم الكاملة." : "Winners walk the Final Showcase stage on 26 Sep, and the work enters the Showcase with full credits."}</p></section></Reveal>
              <Reveal><section id="faq"><h2 style={h2s}>{ar ? "أسئلة" : "FAQ"}</h2>
                <p style={ps}>{ar ? "لحالك؟ منوصلك بفريق — أغلب المتنافسين بيجوا لحالهم." : "Coming solo? We'll match you — most competitors do."}
                  {" "}<a href={`/compete/${o.id}/find-a-team`} className="u-link" style={{ color: o.tint }}>{ar ? "دوّر على فريق" : "Find a team"}</a></p></section></Reveal>
            </>
          ) : (
            <>
              <Reveal><section id="about"><h2 style={h2s}>{ar ? "عن الفعالية" : "About"}</h2><p style={ps}>{c.d}</p></section></Reveal>
              <Reveal><section id="details"><h2 style={h2s}>{ar ? "التفاصيل" : "Details"}</h2>
                <p style={ps}>{c.when} · {o.city} · {o.format} · {o.level}</p></section></Reveal>
            </>
          )}
        </div>
      </Wrap>
    </div>
  );
}
const h2s: React.CSSProperties = { margin: "0 0 10px", fontSize: 22, fontWeight: 800, letterSpacing: "-.02em" };
const ps: React.CSSProperties = { margin: 0, fontSize: 15, lineHeight: 1.75, color: "rgba(255,254,236,.72)" };
