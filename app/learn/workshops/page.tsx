"use client";
import { useLang, mono, PERI } from "@/lib/ui";
import { useStore, objHref, statusLabel } from "@/lib/content";
import { toAr } from "@/lib/ui";
import { SectionHero, Wrap, PxStyles } from "@/components/meetpixils/kit";

/** IA one-object rule: this is a filtered view — canonical pages live in /whats-on. */
export default function Workshops() {
  const { ar } = useLang();
  const [store] = useStore();
  const ws = store.objects.filter((o) => o.workshop);
  return (
    <div>
      <PxStyles tint={PERI} />
      <SectionHero tint="#2A0A82" fg="#FFFEEC" ar={ar}
        kicker={ar ? "ميت أكاديمي" : "MeetAcademy"}
        title={ar ? "الورشات" : "Workshops"}
        dek={ar ? "نفس فعاليات «شو في قريب» — مفلترة عالتعليمي منها." : "The same events from What's On — filtered to the educational ones."} />
      <Wrap style={{ padding: "clamp(40px,7vh,70px) clamp(20px,5vw,64px) clamp(70px,11vh,120px)" }}>
        {ws.map((o) => {
          const c = ar ? o.ar : o.en;
          return (
            <a key={o.id} href={objHref(o)} className="px-row">
              <span style={{ ...mono, color: PERI, minWidth: 90 }}>{c.when}</span>
              <strong style={{ flex: 1, fontSize: 17 }}>{c.t}</strong>
              <span style={{ ...mono, opacity: .6 }}>{statusLabel(o, ar, toAr)}</span>
              <span className="arw" aria-hidden="true">→</span>
            </a>
          );
        })}
      </Wrap>
    </div>
  );
}
