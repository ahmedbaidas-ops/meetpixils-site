"use client";
import * as React from "react";
import { useParams } from "next/navigation";
import { useLang, mono, cut, CREAM, LILAC, ORANGE, PLUM900 } from "@/lib/ui";
import { useStore } from "@/lib/content";
import { SectionHero, Wrap } from "@/components/meetpixils/kit";
import { Reveal } from "@/components/meetpixils/reveal";

/** IA §09: a closed page becomes a recruitment page; an unjudged one says so honestly. */
export default function Results() {
  const { slug } = useParams<{ slug: string }>();
  const { ar } = useLang();
  const [store] = useStore();
  const o = store.objects.find((x) => x.id === slug);
  const out = o?.status === "results-out" || o?.status === "closed";
  return (
    <div>
      <SectionHero tint="#2F263B" fg={CREAM} ar={ar}
        kicker={ar ? "ميت باتل · النتائج" : "MeetBattle · Results"}
        title={o ? (ar ? o.ar.t : o.en.t) : (ar ? "النتائج" : "Results")}
        dek={out
          ? (ar ? "الفائزون والمتأهلون، مع ملاحظات اللجنة." : "Winners and finalists, with the panel's notes.")
          : (ar ? "التحكيم لسا شغّال — النتائج بتنعلن مباشرة على المسرح." : "Judging is still in progress — results are announced live on stage.")} />
      <Wrap style={{ padding: "clamp(46px,8vh,80px) clamp(20px,5vw,64px) clamp(70px,11vh,120px)", maxWidth: 980 }}>
        {out ? (
          <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))" }}>
            {store.works.map((w, i) => (
              <Reveal key={w.title} delay={i * 70}>
                <div style={{ border: "1px solid rgba(255,254,236,.16)", padding: "20px 22px", ...cut(14) }}>
                  <span style={{ ...mono, color: LILAC }}>{i === 0 ? (ar ? "الفائز" : "Winner") : (ar ? "متأهل" : "Finalist")}</span>
                  <strong style={{ display: "block", fontSize: 17, margin: "8px 0 4px" }}>{w.title}</strong>
                  <span style={{ fontSize: 13, color: "rgba(255,254,236,.62)" }}>{w.team}</span>
                </div>
              </Reveal>
            ))}
          </div>
        ) : (
          <div style={{ border: "1px dashed rgba(255,254,236,.3)", padding: "36px 30px", ...cut(16) }}>
            <strong style={{ display: "block", fontSize: 20, marginBottom: 10 }}>
              {ar ? "بتحب نخبرك أول ما تطلع؟" : "Want to know the moment they land?"}
            </strong>
            <a href="/community/whatsapp" className="mp-btn"
               style={{ ["--wipe" as string]: CREAM, ["--wipe-fg" as string]: PLUM900, display: "inline-block",
                        background: ORANGE, color: PLUM900, fontFamily: "var(--font-mono)", fontSize: 13,
                        fontWeight: 700, padding: "14px 26px", textDecoration: "none", ...cut(12) }}>
              {ar ? "انضم للواتساب" : "Join the WhatsApp"}
            </a>
          </div>
        )}
      </Wrap>
    </div>
  );
}
