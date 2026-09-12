import { LILAC, CYAN, ORANGE, PERI } from "./colors";

/** Pixel Arcade registry — header controller menu, /play hub and footer all read this. */
export const GAMES = [
  {
    id: "de-pixel", href: "/play/de-pixel", tint: ORANGE,
    en: { name: "De-Pixel", tag: "Guess it before it sharpens" },
    ar: { name: "دي-بكسل", tag: "خمّنها قبل ما توضح" },
  },
  {
    id: "kern-it", href: "/play/kern-it", tint: LILAC,
    en: { name: "Kern It", tag: "Drag the letters into place" },
    ar: { name: "ظبّط الحروف", tag: "اسحب الحروف لمكانها" },
  },
  {
    id: "pixel-perfect", href: "/play/pixel-perfect", tint: CYAN,
    en: { name: "Pixel Perfect", tag: "Spot the odd pixel out" },
    ar: { name: "بكسل مظبوط", tag: "دوّر على البكسل الشاذ" },
  },
  {
    id: "shootout", href: "/play/shootout", tint: PERI,
    en: { name: "Pixel Shootout", tag: "Splat everyone except the pet" },
    ar: { name: "تصويب البكسل", tag: "بقّع الكل إلا البكسل الأليف" },
  },
] as const;
