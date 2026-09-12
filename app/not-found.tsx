"use client";

import * as React from "react";
import { mono, cut, CREAM, ORANGE } from "@/lib/ui";
import { useStore } from "@/lib/content";
import { ObjectDetail } from "@/components/meetpixils/detail";

/* Static export can only pre-render objects that existed at build time.
   Hostinger's ErrorDocument sends every unknown path here — if the path
   matches an object in the published store (e.g. an event added via /admin),
   render its detail page client-side instead of a dead end. */
export default function NotFound() {
  const [store] = useStore();
  const [path, setPath] = React.useState<string | null>(null);
  const [settled, setSettled] = React.useState(false);

  React.useEffect(() => {
    setPath(window.location.pathname);
    const t = window.setTimeout(() => setSettled(true), 2200); // give the store fetch a beat
    return () => window.clearTimeout(t);
  }, []);

  const m = path?.match(/^\/(whats-on|compete)\/([\w-]+)\/?$/);
  const obj = m ? store.objects.find((o) => o.id === m[2]) : undefined;

  if (obj) return <ObjectDetail id={obj.id} />;

  if (m && !settled) {
    return (
      <div style={{ minHeight: "70vh", display: "grid", placeItems: "center" }}>
        <span style={{ ...mono, opacity: .5 }}>…</span>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "70vh", display: "grid", placeItems: "center", padding: "120px 24px 60px" }}>
      <div style={{ textAlign: "center", maxWidth: 480 }}>
        <p style={{ ...mono, color: ORANGE, marginBottom: 10 }}>404</p>
        <h1 style={{ margin: "0 0 12px", fontSize: "clamp(26px,4vw,40px)", fontWeight: 800, letterSpacing: "-.03em" }}>
          This pixel doesn&apos;t exist.
        </h1>
        <p style={{ margin: "0 0 24px", fontSize: 14.5, color: "rgba(255,254,236,.65)" }}>
          The page moved, closed, or never was. Everything that is on:
        </p>
        <a href="/whats-on" className="mp-btn" style={{ ["--wipe" as string]: CREAM, ["--wipe-fg" as string]: "#0F010A", display: "inline-block", background: ORANGE, color: "#0F010A", fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, padding: "14px 26px", textDecoration: "none", ...cut(12) }}>
          See what&apos;s on →
        </a>
      </div>
    </div>
  );
}
