import { ORANGE, LILAC, CYAN, PERI } from "./colors";

export type Status = "closing-soon" | "open" | "upcoming" | "results-out" | "closed";
export type ObjType = "Event" | "Competition" | "Program";
export type L10n = { t: string; d: string; when: string; cta: string };
export type CObj = {
  id: string; type: ObjType; arm: string; status: Status; due?: string; tint: string;
  discipline: string; level: string; format: string; city: string; workshop?: boolean;
  en: L10n; ar: L10n;
};
export type Settings = {
  heroT: { en: string; ar: string };
  heroD: { en: string; ar: string };
  cta: { en: string; ar: string; href: string };
  cliq: string;
  discord: string;
  instagram: string;
  passes: { normal: number; diamond: number };
  capacity: { normal: number; diamond: number }; // 0 = unlimited
  loyaltyOff: number; // 0..1
};
export type Face = { name: string; role: string; proof: string };
export type Work = { title: string; team: string; src: string; tint: string };
export type Store = { objects: CObj[]; faces: Face[]; works: Work[]; settings: Settings };

export const RANK: Record<Status, number> = { "closing-soon": 0, open: 1, upcoming: 2, "results-out": 3, closed: 4 };

export const DEFAULTS: Store = {
  objects: [
    { id: "final-showcase-2026", type: "Event", arm: "meetpixils", status: "open", due: "2026-09-26T19:00:00+03:00", tint: ORANGE,
      discipline: "All", level: "All levels", format: "In person", city: "Amman",
      en: { t: "Final Showcase 2026", d: "Winners crowned, next season revealed, the whole scene in one room.", when: "26 Sep · The ARC", cta: "Event tickets" },
      ar: { t: "العرض الختامي ٢٠٢٦", d: "تتويج الفايزين، الكشف عن الموسم الجاي، والوسط كله بقاعة وحدة.", when: "٢٦ أيلول · ذا آرك", cta: "تذاكر الحدث" } },
  ],
  faces: [],
  settings: {
    heroT: { en: "Biggest Jordanian creative meetup is here!", ar: "أكبر لقاء إبداعي بالأردن وصل!" },
    heroD: { en: "26 September at The ARC, Amman — designathon winners crowned live, next season revealed, and the whole design scene in one room.",
             ar: "٢٦ أيلول في ذا آرك، عمّان — تتويج فايزين الديزاينثون مباشرة، الكشف عن الموسم الجاي، وكل مشهد التصميم بقاعة وحدة." },
    cta: { en: "Event tickets", ar: "تذاكر الحدث", href: "/whats-on/final-showcase-2026/tickets" },
    cliq: "0791319628",
    discord: "https://discord.gg/FhnNbqZk5",
    instagram: "https://www.instagram.com/meet_pixils/",
    passes: { normal: 30, diamond: 50 },
    capacity: { normal: 0, diamond: 0 },
    loyaltyOff: 0.6,
  },
  works: [],
};

