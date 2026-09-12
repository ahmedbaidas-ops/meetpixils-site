"use client";

import { useRef, useState } from "react";
import {
  PixelTransition,
  type PixelTransitionHandle,
  type PixelDirection,
  type PixelPattern,
  type PixelEasing,
} from "@/components/meetpixils/pixel-transition";

const DIRECTIONS: PixelDirection[] = [
  "bottom-top", "top-bottom", "left-right", "right-left", "center-out", "center-in",
];
const PATTERNS: PixelPattern[] = ["random", "checker", "diagonal", "wave", "spiral", "radial"];
const EASINGS: PixelEasing[] = ["ease-out", "expo-out", "ease-in-out", "linear"];
const ACCENTS = ["#EF5229", "#CCA4FD", "#2EBEEF", "#C3B8FB"];

function Chips<T extends string | number>({
  label, opts, value, set, fmt,
}: { label: string; opts: readonly T[]; value: T; set: (v: T) => void; fmt?: (v: T) => string }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-16 font-mono text-[10px] uppercase tracking-[0.12em] text-[#FFFEEC]/45">
        {label}
      </span>
      {opts.map((o) => (
        <button
          key={String(o)}
          onClick={() => set(o)}
          aria-pressed={value === o}
          className={
            "rounded-full border px-3 py-1 font-mono text-[11px] transition " +
            (value === o
              ? "border-[#EF5229] bg-[#EF5229] text-[#0F010A]"
              : "border-[#FFFEEC]/25 text-[#FFFEEC]/60 hover:text-[#FFFEEC]")
          }
        >
          {fmt ? fmt(o) : String(o)}
        </button>
      ))}
    </div>
  );
}

export default function PixelPage() {
  const [direction, setDirection] = useState<PixelDirection>("bottom-top");
  const [pattern, setPattern] = useState<PixelPattern>("random");
  const [easing, setEasing] = useState<PixelEasing>("expo-out");
  const [pixelSize, setPixelSize] = useState(28);
  const [duration, setDuration] = useState(1500);

  const autoRef = useRef<PixelTransitionHandle>(null);
  const wipeRef = useRef<PixelTransitionHandle>(null);

  const settings = { direction, pattern, easing, pixelSize, accentColors: ACCENTS };

  return (
    <main style={{ background: "#0F010A", color: "#FFFEEC" }}>
      <section className="mx-auto max-w-5xl px-6 py-16">
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.14em] text-[#EF5229]">
          MeetPixils · Pixel transition
        </p>
        <h1 className="mb-4 max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
          Plays itself. Wipes to your cursor.
        </h1>
        <p className="mb-8 max-w-2xl text-sm leading-relaxed text-[#FFFEEC]/65">
          No scroll pinning and no scrubbing — scrolling stays yours. The curtain animates once
          when it comes into view, and the cursor dissolves it independently. Move across either
          panel below.
        </p>

        <div className="flex flex-col gap-3 rounded-xl border border-[#FFFEEC]/12 p-5">
          <Chips label="Dir" opts={DIRECTIONS} value={direction} set={setDirection} />
          <Chips label="Pattern" opts={PATTERNS} value={pattern} set={setPattern} />
          <Chips label="Easing" opts={EASINGS} value={easing} set={setEasing} />
          <Chips label="Pixel" opts={[14, 20, 28, 40, 56]} value={pixelSize} set={setPixelSize} fmt={(v) => v + "px"} />
          <Chips label="Speed" opts={[700, 1100, 1500, 2400]} value={duration} set={setDuration} fmt={(v) => v + "ms"} />
        </div>
      </section>

      {/* auto-plays on entry */}
      <section className="mx-auto max-w-5xl px-6 pb-6">
        <div className="mb-3 flex items-center justify-between gap-4">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#FFFEEC]/50">
            Animation · plays once on entry
          </h2>
          <button
            onClick={() => { autoRef.current?.reset(); autoRef.current?.play(); }}
            className="rounded-full border border-[#EF5229] px-4 py-1.5 font-mono text-[11px] text-[#EF5229] transition hover:bg-[#EF5229] hover:text-[#0F010A]"
          >
            Replay
          </button>
        </div>
        <PixelTransition
          ref={autoRef}
          key={`a-${direction}-${pattern}-${easing}-${pixelSize}-${duration}`}
          {...settings}
          duration={duration}
          trigger="inview"
          height="62vh"
          className="rounded-xl"
        >
          <div className="flex h-full flex-col justify-center bg-[#FFFEEC] px-8 text-[#310622]">
            <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[#EF5229]">
              Revealed
            </p>
            <h3 className="max-w-2xl text-3xl font-bold leading-[1.08] tracking-tight sm:text-5xl">
              Where MENA design grows up
            </h3>
            <p className="mt-3 max-w-lg text-sm" style={{ color: "rgba(49,6,34,.65)" }}>
              This is the handoff from a dark hero into the cream body — one dissolve, no pinning.
            </p>
          </div>
        </PixelTransition>
      </section>

      {/* scroll-driven, no pinning */}
      <section className="mx-auto max-w-5xl px-6 pb-6">
        <h2 className="mb-3 font-mono text-[11px] uppercase tracking-[0.12em] text-[#FFFEEC]/50">
          Scroll · dissolve tracks the block, page never pins
        </h2>
        <PixelTransition
          key={`s-${direction}-${pattern}-${easing}-${pixelSize}`}
          {...settings}
          trigger="scroll"
          easing="linear"
          smoothing={0.12}
          height="62vh"
          className="rounded-xl"
        >
          <div className="flex h-full flex-col justify-center bg-[#FFFEEC] px-8 text-[#310622]">
            <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[#EF5229]">
              Scroll-driven
            </p>
            <h3 className="max-w-2xl text-3xl font-bold leading-[1.08] tracking-tight sm:text-5xl">
              Rides your scroll, never takes it
            </h3>
            <p className="mt-3 max-w-lg text-sm" style={{ color: "rgba(49,6,34,.65)" }}>
              Scroll up and down over this block — the dissolve follows both ways, and the page
              keeps moving at its normal speed. Linear easing here on purpose: front-loaded
              curves like expo-out are for timed reveals, and feel wrong when scrubbed.
            </p>
          </div>
        </PixelTransition>
      </section>

      {/* cursor only */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="mb-3 flex items-center justify-between gap-4">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#FFFEEC]/50">
            Interaction · wipe it with the cursor
          </h2>
          <button
            onClick={() => wipeRef.current?.reset()}
            className="rounded-full border border-[#FFFEEC]/30 px-4 py-1.5 font-mono text-[11px] text-[#FFFEEC]/70 transition hover:text-[#FFFEEC]"
          >
            Re-form
          </button>
        </div>
        <PixelTransition
          ref={wipeRef}
          key={`m-${direction}-${pattern}-${pixelSize}`}
          {...settings}
          trigger="manual"
          radius={130}
          height="62vh"
          className="rounded-xl"
        >
          <div className="flex h-full flex-col items-center justify-center bg-[#FFFEEC] px-8 text-center text-[#310622]">
            <h3 className="max-w-xl text-3xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
              Move your cursor across this
            </h3>
            <p className="mt-3 max-w-md text-sm" style={{ color: "rgba(49,6,34,.65)" }}>
              Cells dissolve where you touch them and heal behind you.
            </p>
          </div>
        </PixelTransition>
      </section>
    </main>
  );
}
