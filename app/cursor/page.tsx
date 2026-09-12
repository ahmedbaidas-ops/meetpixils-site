"use client";

import { useState } from "react";
import {
  CursorEffect,
  CURSOR_EFFECTS,
  type CursorEffectId,
} from "@/components/meetpixils/cursor-effects";

const ARMS = [
  { id: "master", label: "Pixils", color: "#EF5229" },
  { id: "battle", label: "Battle", color: "#CCA4FD" },
  { id: "academy", label: "Academy", color: "#C3B8FB" },
  { id: "experience", label: "Experience", color: "#2EBEEF" },
] as const;

export default function CursorPage() {
  const [effect, setEffect] = useState<CursorEffectId>("ribbon");
  const [arm, setArm] = useState<(typeof ARMS)[number]>(ARMS[0]);
  const [dark, setDark] = useState(true);

  const active = CURSOR_EFFECTS.find((e) => e.id === effect);

  return (
    <div
      className={dark ? "dark" : ""}
      style={{ minHeight: "100vh", background: "var(--background)", color: "var(--foreground)" }}
    >
      <CursorEffect effect={effect} color={arm.color} />

      <div className="mx-auto max-w-5xl px-6 py-14">
        <p
          className="mb-3 font-mono text-[11px] uppercase tracking-[0.14em]"
          style={{ color: arm.color }}
        >
          MeetPixils · Cursor effects
        </p>
        <h1 className="mb-4 max-w-2xl text-4xl font-bold leading-[1.06] tracking-tight sm:text-5xl">
          Pick a cursor
        </h1>
        <p className="mb-10 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Ported from the Mouse Effects pack, rebuilt as React components with no GSAP
          dependency. Every one is suppressed on touch pointers and under
          <code className="mx-1">prefers-reduced-motion</code>, so this page shows the default
          pointer on a phone or with motion reduced — that is correct, not broken.
        </p>

        {/* selector */}
        <div className="mb-4 flex flex-wrap gap-2">
          {CURSOR_EFFECTS.map((e) => (
            <button
              key={e.id}
              onClick={() => setEffect(e.id)}
              aria-pressed={effect === e.id}
              className="rounded-full border px-4 py-2 text-sm font-medium transition"
              style={
                effect === e.id
                  ? { background: arm.color, borderColor: arm.color, color: "#12030C" }
                  : { borderColor: "var(--border)", color: "var(--muted-foreground)" }
              }
            >
              {e.label}
            </button>
          ))}
        </div>
        <p className="mb-10 font-mono text-[11px] text-muted-foreground">{active?.note}</p>

        {/* palette + theme */}
        <div className="mb-12 flex flex-wrap items-center gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            Skin
          </span>
          {ARMS.map((a) => (
            <button
              key={a.id}
              onClick={() => setArm(a)}
              aria-pressed={arm.id === a.id}
              className="flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[11px] transition"
              style={{
                borderColor: arm.id === a.id ? a.color : "var(--border)",
                color: arm.id === a.id ? a.color : "var(--muted-foreground)",
              }}
            >
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ background: a.color }}
              />
              {a.label}
            </button>
          ))}
          <button
            onClick={() => setDark((d) => !d)}
            className="ms-2 rounded-full border px-3 py-1.5 font-mono text-[11px] transition"
            style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
          >
            {dark ? "Light" : "Dark"}
          </button>
        </div>

        {/* something to move across, with hover targets for Follower */}
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { t: "Khedmetak", d: "72-hour service design battle", m: "Closes in 6 days" },
            { t: "UX Research track", d: "Eight weeks, one real client project", m: "3 seats left" },
            { t: "Portfolio night", d: "Six seniors, six portfolios, in public", m: "Free · RSVP" },
            { t: "Final Showcase", d: "The annual flagship", m: "26 Sep · The ARC" },
            { t: "Winners' wall", d: "What good looks like", m: "42 entries" },
            { t: "Judges", d: "The trust layer", m: "12 people" },
          ].map((c) => (
            <article
              key={c.t}
              data-cursor-target
              className="rounded-xl border p-5 transition"
              style={{ borderColor: "var(--border)", background: "var(--card)" }}
            >
              <span
                className="font-mono text-[10px] uppercase tracking-[0.12em]"
                style={{ color: arm.color }}
              >
                {c.m}
              </span>
              <h3 className="mt-2 text-lg font-semibold tracking-tight">{c.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{c.d}</p>
            </article>
          ))}
        </div>

        <p className="mt-10 font-mono text-[11px] text-muted-foreground">
          Cards carry <code>data-cursor-target</code> — the Follower cursor grows over them.
        </p>
      </div>
    </div>
  );
}
