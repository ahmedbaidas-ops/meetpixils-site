"use client";
import { useLang, mono, ORANGE, CREAM } from "@/lib/ui";
import { SectionHero, Wrap, PxStyles } from "@/components/meetpixils/kit";
import { PixelStatement } from "@/components/meetpixils/pixel-text";
import { Reveal } from "@/components/meetpixils/reveal";

export default function About() {
  const { ar } = useLang();
  const links = [
    { href: "/about/ecosystem", en: "The five arms", ar: "الأذرع الخمسة" },
    { href: "/about/partners", en: "Partners & sponsors", ar: "الشركاء والرعاة" },
    { href: "/about/sponsor", en: "Sponsor an event", ar: "ارعَ فعالية" },
    { href: "/about/contact", en: "Contact", ar: "تواصل معنا" },
  ];
  return (
    <div>
      <PxStyles tint={ORANGE} />
      <SectionHero tint="#310622" fg={CREAM} ar={ar}
        kicker={ar ? "ميت بيكسلز" : "MeetPixils"}
        title={ar ? "مين إحنا" : "Who we are"}
        dek={ar ? "فريق من عمّان بيبني موسم الإبداع الأردني — فعالية بفعالية." : "A team in Amman building Jordan's creative season — one event at a time."} />
      <section style={{ background: CREAM, color: "#310622", padding: "clamp(60px,10vh,110px) 0" }}>
        <Wrap>
          <PixelStatement ar={ar} faint="rgba(49,6,34,.16)" full="#310622"
            text={ar ? "الموهبة موجودة. اللي كان ناقص المسرح — عم نبنيه." : "The talent was always here. The stage wasn't — so we're building it."} />
        </Wrap>
      </section>
      <Wrap style={{ padding: "clamp(46px,8vh,80px) clamp(20px,5vw,64px) clamp(70px,11vh,120px)" }}>
        {links.map((l) => (
          <Reveal key={l.href}><a href={l.href} className="px-row">
            <strong style={{ flex: 1, fontSize: 17 }}>{ar ? l.ar : l.en}</strong>
            <span className="arw" aria-hidden="true">→</span>
          </a></Reveal>
        ))}
      </Wrap>
    </div>
  );
}
