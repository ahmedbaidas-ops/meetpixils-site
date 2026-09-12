"use client";

import { useState } from "react";
import { AuroraBlur } from "@/components/unlumen-ui/aurora-blur";
import { FlutedGlass } from "@/components/meetpixils/fluted-glass";
import { AnimatedList } from "@/components/unlumen-ui/animated-list";
import { FloatingTooltip } from "@/components/unlumen-ui/floating-tooltip";
import { CountUp } from "@/components/unlumen-ui/count-up";
import { Dock } from "@/components/unlumen-ui/dock";
import { AppleSwitch } from "@/components/unlumen-ui/apple-switch";
import {
  Calendar,
  Swords,
  GraduationCap,
  Users,
  Info,
  Trophy,
} from "lucide-react";

/* MeetPixils palette — DS v1.0 */
const ORANGE = "#EF5229";
const LILAC = "#CCA4FD";
const CYAN = "#2EBEEF";
const PLUM = "#310622";
const PLUM900 = "#0F010A";

type Entry = { id: number; team: string; title: string; discipline: string };

const ENTRIES: Entry[] = [
  { id: 1, team: "Team Sanad", title: "Rebuilding the transit pass", discipline: "UX/UI" },
  { id: 2, team: "Team Rukn", title: "Clinic queue redesign", discipline: "UX/UI" },
  { id: 3, team: "Solo · R. Khatib", title: "Municipal permit flow", discipline: "Branding" },
  { id: 4, team: "Team Bayt", title: "School enrolment, rethought", discipline: "UX/UI" },
  { id: 5, team: "Team Nawras", title: "Water bill, made legible", discipline: "Graphic" },
];

function Section({
  tier,
  title,
  blurb,
  children,
}: {
  tier: string;
  title: string;
  blurb: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-border py-14">
      <div className="mb-6 flex flex-wrap items-baseline gap-3">
        <span className="font-mono text-xs tracking-widest text-primary">{tier}</span>
        <h2 className="text-xl font-bold tracking-tight">{title}</h2>
      </div>
      <p className="mb-8 max-w-2xl text-sm leading-relaxed text-muted-foreground">{blurb}</p>
      {children}
    </section>
  );
}

export default function MotionPage() {
  const [visible, setVisible] = useState(3);
  const [ambient, setAmbient] = useState(true);
  const [mode, setMode] = useState<"aurora" | "orb">("aurora");

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ---------- T0 · AMBIENT ---------- */}
      <div className="relative h-[62vh] min-h-[420px] w-full overflow-hidden bg-[#0F010A]">
        {ambient && (
          /* translateZ(0) is load-bearing: backdrop-filter will not sample a
             WebGL canvas unless it sits on its own composited layer. Without
             this the glass shards above render pure black. */
          <div
            className="absolute inset-0"
            aria-hidden="true"
            style={{ transform: "translateZ(0)", willChange: "transform" }}
          >
            <AuroraBlur
              width="100%"
              height="100%"
              speed={0.42}
              brightness={1}
              saturation={1.1}
              layers={[
                { color: ORANGE, speed: 0.3, intensity: 0.8 },
                { color: LILAC, speed: 0.18, intensity: 0.5 },
                { color: CYAN, speed: 0.12, intensity: 0.24 },
              ]}
              skyLayers={[
                { color: PLUM900, blend: 0.5 },
                { color: PLUM, blend: 0.72 },
              ]}
            />
          </div>
        )}
        {ambient && mode === "aurora" && (
          <FlutedGlass
            className="z-[2]"
            strips={26}
            frost={5}
            grain={0.34}
            overlay
          />
        )}
        {ambient && mode === "orb" && <FlutedGlass className="z-[2]" strips={26} amplitude={16} />}
        <div
          className="pointer-events-none absolute inset-0 z-[5]"
          aria-hidden="true"
          style={{
            background:
              "linear-gradient(to top, rgba(15,1,10,0.92) 0%, rgba(15,1,10,0.72) 32%, rgba(15,1,10,0.15) 68%, rgba(15,1,10,0) 100%)",
          }}
        />
        <div className="relative z-10 mx-auto flex h-full max-w-5xl flex-col justify-end px-6 pb-12">
          <span className="mb-3 font-mono text-xs uppercase tracking-[0.14em] text-[#FF7A4F]">
            Tier 0 · Ambient · aurora-blur + fluted-glass
          </span>
          <h1 className="max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight text-[#FFFEEC] sm:text-6xl">
            Motion, running for real
          </h1>
          <p className="mt-4 max-w-xl text-sm text-[#FFFEEC]/75">
            The live WebGL aurora seen through fluted glass — each flute frosted to its own
            depth, with cylinder shading, seams and film grain. Switch to “orb” to see true
            lateral refraction, which only works over a background the flutes can duplicate.
          </p>
          <div className="mt-6">
            <div style={{ ["--foreground" as string]: ORANGE }}>
            <AppleSwitch
              tone="accent"
              checked={ambient}
              onCheckedChange={setAmbient}
              label={<span className="text-sm text-[#FFFEEC]">Ambient layer</span>}
              description={
                <span className="text-xs text-[#FFFEEC]/60">
                  Off is what mobile and reduced-motion users get
                </span>
              }
            />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#FFFEEC]/55">
                Layer
              </span>
              {(["aurora", "orb"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  aria-pressed={mode === m}
                  className={
                    "rounded-full border px-3 py-1 font-mono text-[11px] transition " +
                    (mode === m
                      ? "border-[#FF7A4F] bg-[#FF7A4F] text-[#0F010A]"
                      : "border-[#FFFEEC]/30 text-[#FFFEEC]/70 hover:text-[#FFFEEC]")
                  }
                >
                  {m === "aurora" ? "live aurora" : "orb · true refraction"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6">
        {/* ---------- T4 · FEEDBACK ---------- */}
        <Section
          tier="Tier 4"
          title="Feedback — count-up"
          blurb="Odometer digits for the numbers that carry urgency. Deadline surfaces only, and never more than one running in view at a time."
        >
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { to: 428, label: "Records in the research corpus", sub: "6 datasets · 2 interviews" },
              { to: 48, label: "Battle registrations", sub: "75% solo · 96% portfolio" },
              { to: 306, label: "Total registrations", sub: "Events · workshops · battles" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-border bg-card p-5">
                <div className="text-4xl font-bold tracking-tight text-primary">
                  <CountUp to={s.to} duration={2} digitEffect="slide" separator="," />
                </div>
                <div className="mt-2 text-sm text-card-foreground">{s.label}</div>
                <div className="mt-1 font-mono text-[11px] text-muted-foreground">{s.sub}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* ---------- T1 · ENTRANCE ---------- */}
        <Section
          tier="Tier 1"
          title="Entrance — animated-list"
          blurb="Staggered reveal as objects arrive. Add an entry to watch the choreography — this is the pattern for a live entries feed, not for a filtered grid, which must render instantly."
        >
          <div className="mb-5 flex flex-wrap gap-3">
            <button
              onClick={() => setVisible((v) => Math.min(v + 1, ENTRIES.length))}
              className="rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              Add an entry
            </button>
            <button
              onClick={() => setVisible(1)}
              className="rounded-full border border-border px-5 py-3 text-sm font-medium transition hover:bg-muted"
            >
              Reset
            </button>
          </div>
          <AnimatedList
            items={ENTRIES.slice(0, visible)}
            animation="scale"
            gap={12}
            renderItem={(e: Entry) => (
              <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4">
                <div>
                  <div className="text-sm font-semibold">{e.title}</div>
                  <div className="font-mono text-[11px] text-muted-foreground">{e.team}</div>
                </div>
                <span className="rounded-full bg-muted px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  {e.discipline}
                </span>
              </div>
            )}
          />
        </Section>

        {/* ---------- T2 · INTERACTION ---------- */}
        <Section
          tier="Tier 2"
          title="Interaction — dock, floating-tooltip"
          blurb="Hover the dock to feel the magnification spring; hover a judge to see the cursor-tracked tooltip. These are the tier that runs everywhere, so they stay cheap."
        >
          <div className="mb-10 flex justify-center">
            <Dock
              iconSize={44}
              magnification={1.9}
              distance={130}
              items={[
                { icon: <Calendar size={20} />, label: "What's On" },
                { icon: <Swords size={20} />, label: "Compete" },
                { icon: <GraduationCap size={20} />, label: "Learn" },
                { icon: <Users size={20} />, label: "Community", separator: true },
                { icon: <Trophy size={20} />, label: "Winners" },
                { icon: <Info size={20} />, label: "About" },
              ]}
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <FloatingTooltip.Provider className="rounded-2xl border border-border bg-card p-6">
              <h3 className="mb-1 text-lg font-bold tracking-tight">Judges — hover a face</h3>
              <p className="mb-5 text-sm text-muted-foreground">
                A cursor-following tooltip. The IA makes judges first-class objects because
                legitimacy is checked through people, not About pages.
              </p>
              <div className="flex flex-wrap gap-3">
                {[
                  { i: "AH", n: "Ahmed Haddad", r: "Service design lead · 6 appearances", c: "#2F263B" },
                  { i: "LM", n: "Lina Mansour", r: "Design systems · 4 appearances", c: "#2A0A82" },
                  { i: "NS", n: "Nadia Srour", r: "UX research · 3 appearances", c: "#2EBEEF" },
                  { i: "RK", n: "Rama Al-Khatib", r: "2026 winner · now judging", c: "#EF5229" },
                ].map((j) => (
                  <FloatingTooltip.Trigger key={j.i} content={j.n} description={j.r}>
                    <div
                      className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full text-sm font-semibold text-[#FFFEEC]"
                      style={{ background: j.c }}
                    >
                      {j.i}
                    </div>
                  </FloatingTooltip.Trigger>
                ))}
              </div>
            </FloatingTooltip.Provider>

            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="text-lg font-bold tracking-tight">What is not here</h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>
                  <strong className="text-card-foreground">Tier 3 (page transitions)</strong> — needs
                  route changes, not a single page.
                </li>
                <li>
                  <strong className="text-card-foreground">blob-card</strong> — installed, then
                  removed: it imports <code>FluidBlobs</code> and <code>glow-effect</code>, both of
                  which 404 from the registry, and it declares no registryDependencies. A broken
                  registry item, not a licence problem.
                </li>
                <li>
                  <strong className="text-card-foreground">gravity-stars, wave-background, pixel,
                  dia-text-reveal, gooey-navbar</strong> — all licence-gated. They return 401 until
                  a real key replaces the placeholder in <code>.env.local</code>.
                </li>
              </ul>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}
