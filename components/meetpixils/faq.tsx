"use client";

import * as React from "react";
import { mono, cut } from "@/lib/ui";

export type QA = { q: string; a: string };

/** FAQ accordion — grid-rows height animation, chamfer tint on the open item. */
export function FAQ({ items, tint = "#EF5229", dark = false, title }: {
  items: QA[]; tint?: string; dark?: boolean; title?: string;
}) {
  const [open, setOpen] = React.useState<number | null>(0);
  const ink = dark ? "#FFFEEC" : "#310622";
  const dim = dark ? "rgba(255,254,236,.68)" : "rgba(49,6,34,.66)";
  const line = dark ? "rgba(255,254,236,.14)" : "rgba(49,6,34,.14)";
  return (
    <div>
      {title && <h2 style={{ margin: "0 0 22px", fontSize: "clamp(22px,3vw,34px)", fontWeight: 800, letterSpacing: "-.03em", color: ink }}>{title}</h2>}
      {items.map((it, i) => {
        const on = open === i;
        return (
          <div key={i} style={{ borderBottom: `1px solid ${line}`, background: on ? (dark ? "rgba(255,254,236,.04)" : "rgba(49,6,34,.03)") : "transparent", transition: "background .25s", ...(on ? cut(10) : {}) }}>
            <button type="button" aria-expanded={on} className="faq-q"
                    onClick={() => setOpen(on ? null : i)}
                    style={{ width: "100%", minHeight: 56, display: "flex", alignItems: "center", justifyContent: "space-between",
                             gap: 14, background: "none", border: 0, cursor: "pointer", textAlign: "start",
                             padding: "14px 12px", color: ink, fontFamily: "inherit", fontSize: 16, fontWeight: 650 }}>
              {it.q}
              <span aria-hidden="true" style={{ color: tint, fontSize: 20, lineHeight: 1, flex: "0 0 auto",
                                                transition: "transform .3s cubic-bezier(.16,1,.3,1)", transform: on ? "rotate(45deg)" : "none" }}>+</span>
            </button>
            <div style={{ display: "grid", gridTemplateRows: on ? "1fr" : "0fr", transition: "grid-template-rows .38s cubic-bezier(.16,1,.3,1)" }}>
              <div style={{ overflow: "hidden" }}>
                <p style={{ margin: 0, padding: "0 12px 18px", fontSize: 14, lineHeight: 1.7, color: dim, maxWidth: "62ch" }}>{it.a}</p>
              </div>
            </div>
          </div>
        );
      })}
      <style>{`
        .faq-q:focus-visible { outline: 2px solid ${tint}; outline-offset: -2px }
        @media (prefers-reduced-motion: reduce) { .faq-q + div { transition: none } }
      `}</style>
    </div>
  );
}
