"use client";
import { useLang, mono, toAr, CYAN } from "@/lib/ui";
import { useStore, statusLabel, objHref } from "@/lib/content";
import { SectionHero, Wrap, PxStyles } from "@/components/meetpixils/kit";

/** IA: the archive is proof of delivery. */
export default function Past() {
  const { ar } = useLang();
  const [store] = useStore();
  const past = store.objects.filter((o) => o.status === "closed" || o.status === "results-out");
  return (
    <div>
      <PxStyles tint={CYAN} />
      <SectionHero tint={CYAN} ar={ar}
        kicker={ar ? "ميت إكسبيرينس" : "MeetExperience"}
        title={ar ? "اللي صار" : "What already happened"}
        dek={ar ? "الأرشيف هو الدليل — كل فعالية انعملت، بنتائجها." : "The archive is the proof — everything delivered, with its results."} />
      <Wrap style={{ padding: "clamp(40px,7vh,70px) clamp(20px,5vw,64px) clamp(70px,11vh,120px)" }}>
        {past.map((o) => {
          const c = ar ? o.ar : o.en;
          return (
            <a key={o.id} href={objHref(o)} className="px-row">
              <span style={{ ...mono, color: o.tint, minWidth: 90 }}>{c.when}</span>
              <strong style={{ flex: 1, fontSize: 17, fontWeight: 650 }}>{c.t}</strong>
              <span style={{ ...mono, opacity: .55 }}>{statusLabel(o, ar, toAr)}</span>
              <span className="arw" aria-hidden="true">→</span>
            </a>
          );
        })}
      </Wrap>
    </div>
  );
}
