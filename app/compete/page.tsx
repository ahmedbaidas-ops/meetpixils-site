"use client";

import * as React from "react";
import { useLang, mono, cut, toAr, LILAC, ORANGE, CREAM, PLUM900 } from "@/lib/ui";
import { useStore, daysLeft, statusLabel, RANK } from "@/lib/content";
import { SectionHero, Wrap, PxStyles } from "@/components/meetpixils/kit";
import { FrameScrub } from "@/components/meetpixils/frame-scrub";
import { PixelStatement } from "@/components/meetpixils/pixel-text";
import { Reveal } from "@/components/meetpixils/reveal";
import { FAQ } from "@/components/meetpixils/faq";

/** IA T2 · MeetBattle skin. Fear-reduction order: winners → how it works → enter. */
export default function Compete() {
  const { ar } = useLang();
  const [store] = useStore();
  const battles = store.objects.filter((o) => o.type === "Competition").sort((a, b) => RANK[a.status] - RANK[b.status]);
  const live = battles.filter((o) => o.status === "closing-soon" || o.status === "open");

  return (
    <div>
      <PxStyles tint={LILAC} />
      <SectionHero tint="#2F263B" fg={CREAM} ar={ar}
        kicker={ar ? "ميت باتل" : "MeetBattle"}
        title={ar ? "نافس" : "The arena"}
        dek={ar ? "برييفات حقيقية، لجنة بالاسم، وساعة عم تعد. الفايزين بيطلعوا على مسرح النهائي."
               : "Real briefs, named judges, a ticking clock. Winners walk the season finale."} />

      {/* the frame-scrubbed sequence — scroll drives the render */}
      <FrameScrub holdVh={170}>
        <Wrap style={{ paddingBottom: "clamp(40px,7vh,80px)", width: "100%" }}>
          <div style={{ background: "rgba(15,1,10,.55)", backdropFilter: "blur(20px)", padding: "22px 26px", maxWidth: 560, ...cut(14) }}>
            <span style={{ ...mono, color: LILAC }}>{ar ? "خدمتك ٢٠٢٦" : "Khedmetak 2026"}</span>
            <p style={{ margin: "8px 0 0", fontSize: "clamp(19px,2.4vw,28px)", fontWeight: 800, letterSpacing: ar ? 0 : "-.03em", lineHeight: ar ? 1.5 : 1.15 }}>
              {ar ? "٧٢ ساعة. فريق من ثلاثة. خدمة عامة بتنولد من جديد." : "72 hours. A team of three. A public service reborn."}
            </p>
          </div>
        </Wrap>
      </FrameScrub>

      {/* winners first — proof before invitation */}
      <section style={{ background: CREAM, color: "#310622", padding: "clamp(60px,10vh,110px) 0" }}>
        <Wrap>
          <PixelStatement ar={ar} faint="rgba(49,6,34,.16)" full="#310622"
            text={ar ? "الخوف مش من المنافسة. الخوف إنك ما تجرب." : "The fear isn't the competition. It's never entering."} />
          <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", marginTop: 44 }}>
            {store.works.map((w, i) => (
              <Reveal key={w.title} delay={i * 70}>
                <a href="/community/showcase" style={{ display: "block", textDecoration: "none", color: "#310622",
                     border: "1px solid rgba(49,6,34,.14)", background: "#fff", overflow: "hidden", ...cut(14) }}>
                  <div style={{ height: 130, background: `linear-gradient(135deg, ${w.tint}33, rgba(49,6,34,.05))` }} />
                  <div style={{ padding: "14px 16px" }}>
                    <span style={{ ...mono, color: "rgba(49,6,34,.5)" }}>{w.src}</span>
                    <strong style={{ display: "block", fontSize: 15.5, marginTop: 5 }}>{w.title}</strong>
                    <span style={{ fontSize: 12.5, color: "rgba(49,6,34,.6)" }}>{w.team}</span>
                  </div>
                </a>
              </Reveal>
            ))}
          </div>
        </Wrap>
      </section>

      {/* live + past battles */}
      <section style={{ padding: "clamp(60px,10vh,110px) 0" }}>
        <Wrap>
          <h2 style={{ margin: "0 0 20px", fontSize: "clamp(22px,3vw,34px)", fontWeight: 800, letterSpacing: ar ? 0 : "-.03em" }}>
            {ar ? "التحديات" : "The battles"}
          </h2>
          {battles.map((o) => {
            const c = ar ? o.ar : o.en;
            const d = daysLeft(o.due);
            return (
              <a key={o.id} href={`/compete/${o.id}`} className="px-row">
                <span style={{ ...mono, color: o.tint, minWidth: 90 }}>{c.when}</span>
                <strong style={{ flex: 1, fontSize: 17, fontWeight: 650 }}>{c.t}</strong>
                <span style={{ ...mono, color: o.status === "closing-soon" ? ORANGE : "rgba(255,254,236,.55)" }}>
                  {statusLabel(o, ar, toAr)}{o.status === "closing-soon" && d != null ? "" : ""}
                </span>
                <span className="arw" aria-hidden="true">→</span>
              </a>
            );
          })}
          {live.length === 0 && (
            <p style={{ ...mono, marginTop: 18, opacity: .6 }}>
              {ar ? "ما في تحدي مفتوح هلّق — الموسم الجاي قريب." : "No battle is open right now — next season is close."}
            </p>
          )}
        </Wrap>
      </section>

      {/* FAQ — the aversion answer */}
      <section style={{ background: CREAM, padding: "clamp(60px,10vh,110px) 0" }}>
        <Wrap style={{ maxWidth: 880 }}>
          <FAQ tint={ORANGE} title={ar ? "الأسئلة اللي بتخطر" : "The questions everyone asks"}
            items={ar ? [
              { q: "لحالي وما عندي فريق؟", a: "أغلب المتنافسين بيجوا لحالهم — ٣٦ من ٤٨ بأول Battle. منوصلك بفريق قبل الانطلاق." },
              { q: "قديش بدها وقت فعلياً؟", a: "~١٤ ساعة شغل فعلي خلال ٧٢ ساعة. معمولة لتناسب دوام أو جامعة." },
              { q: "كيف بتم التحكيم؟", a: "معايير منشورة قبل الانطلاق، ولجنة بالأسماء والصور. التحكيم مباشر وعلني." },
              { q: "شو بستفيد إذا ما فزت؟", a: "شغل مكتمل لبورتفوليوك، وملاحظات لجنة حقيقية — وهاد اللي بيدور عليه أصحاب العمل." },
            ] : [
              { q: "I'm solo — can I still enter?", a: "Most competitors come alone — 36 of 48 in the first battle. We match you into a team before kickoff." },
              { q: "How much time does it really take?", a: "About 14 hours of actual work across the 72-hour window. It's built to fit around a job or classes." },
              { q: "How is judging decided?", a: "A scorecard published before kickoff, judged live by a named panel. Nothing happens behind closed doors." },
              { q: "What do I get if I don't win?", a: "A finished piece for your portfolio and real panel feedback — which is what employers actually ask about." },
            ]} />
        </Wrap>
      </section>
    </div>
  );
}
