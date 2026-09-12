"use client";
import * as React from "react";

export * from "./colors";
import { } from "./colors";

export const cut = (n = 14): React.CSSProperties => ({
  borderRadius: 0,
  clipPath: `polygon(${n}px 0, 100% 0, 100% calc(100% - ${n}px), calc(100% - ${n}px) 100%, 0 100%, 0 ${n}px)`,
});
export const mono: React.CSSProperties = {
  fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase",
};
const AR_D = ["٠","١","٢","٣","٤","٥","٦","٧","٨","٩"];
export const toAr = (n: number | string) => String(n).replace(/\d/g, (d) => AR_D[+d]);

export const LangCtx = React.createContext<{ ar: boolean; toggle: () => void }>({ ar: false, toggle: () => {} });
export const useLang = () => React.useContext(LangCtx);
