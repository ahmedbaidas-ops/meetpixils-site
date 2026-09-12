"use client";

import * as React from "react";
import { useLang, mono, cut, CREAM, PLUM900, ORANGE } from "@/lib/ui";
import { SectionHero, Wrap, Field, inputStyle, PxStyles } from "./kit";
import { submitEntry } from "@/lib/content";

type F = { id: string; en: string; ar: string; type?: "text" | "email" | "select" | "textarea"; options?: [string, string][] };

/** Shared form page — POSTs to the PHP backend, keeps a local copy under /me. */
export function FormPage({ storeKey, tint, fg = CREAM, kicker, title, dek, fields, submit }: {
  storeKey: string; tint: string; fg?: string;
  kicker: { en: string; ar: string }; title: { en: string; ar: string };
  dek: { en: string; ar: string }; fields: F[]; submit: { en: string; ar: string };
}) {
  const { ar } = useLang();
  const [done, setDone] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [sent, setSent] = React.useState(false); // false = offline preview, local copy only
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data: Record<string, string> = { _kind: storeKey, _at: new Date().toISOString() };
    new FormData(e.currentTarget).forEach((v, k) => (data[k] = String(v)));
    try {
      const list = JSON.parse(localStorage.getItem("mp-entries") || "[]");
      list.push(data);
      localStorage.setItem("mp-entries", JSON.stringify(list));
    } catch {}
    setSending(true);
    setSent(await submitEntry(data));
    setSending(false);
    setDone(true);
  };
  return (
    <div>
      <PxStyles tint={tint} />
      <SectionHero tint="#2F263B" fg={fg} ar={ar} kicker={ar ? kicker.ar : kicker.en}
                   title={ar ? title.ar : title.en} dek={ar ? dek.ar : dek.en} />
      <Wrap style={{ maxWidth: 760, padding: "clamp(46px,8vh,80px) clamp(20px,5vw,64px) clamp(70px,11vh,120px)" }}>
        {done ? (
          <div role="status" style={{ border: `1px solid ${tint}`, padding: "30px 28px", ...cut(14) }}>
            <strong style={{ display: "block", fontSize: 20, marginBottom: 8 }}>{ar ? "وصلنا ✓" : "Got it ✓"}</strong>
            <p style={{ margin: "0 0 16px", fontSize: 14, color: "rgba(255,254,236,.72)" }}>
              {sent
                ? (ar ? "وصلت لفريق ميت بكسلز — وفي نسخة عندك بصفحة ملفي." : "Sent to the MeetPixils team — a copy is also under My profile.")
                : (ar ? "محفوظ عندك بالمتصفح فقط (وضع المعاينة) — بتلاقيه بصفحة ملفي." : "Saved in this browser only (preview mode) — you'll find it under My profile.")}
            </p>
            <a href="/me" className="u-link" style={{ ...mono, color: tint, textDecoration: "none" }}>
              {ar ? "روح على ملفي ←" : "Go to my profile →"}
            </a>
          </div>
        ) : (
          <form onSubmit={onSubmit} style={{ display: "grid", gap: 18 }}>
            {fields.map((f) => (
              <Field key={f.id} label={ar ? f.ar : f.en}>
                {f.type === "select" ? (
                  <select name={f.id} required className="px-input" style={{ ...inputStyle, cursor: "pointer" }}>
                    {(f.options || []).map(([en, arr]) => <option key={en} value={en}>{ar ? arr : en}</option>)}
                  </select>
                ) : f.type === "textarea" ? (
                  <textarea name={f.id} rows={4} className="px-input" style={{ ...inputStyle, resize: "vertical" }} />
                ) : (
                  <input name={f.id} type={f.type || "text"} required className="px-input" style={inputStyle} />
                )}
              </Field>
            ))}
            <button type="submit" className="mp-btn" disabled={sending}
                    style={{ ["--wipe" as string]: CREAM, ["--wipe-fg" as string]: PLUM900, justifySelf: "start",
                             background: tint, color: PLUM900, fontFamily: "var(--font-mono)", fontSize: 13.5,
                             fontWeight: 700, padding: "16px 30px", border: 0, cursor: sending ? "wait" : "pointer",
                             opacity: sending ? .6 : 1, ...cut(12) }}>
              {sending ? (ar ? "لحظة…" : "Sending…") : ar ? submit.ar : submit.en}<span className="arw" aria-hidden="true">→</span>
            </button>
            <p style={{ ...mono, opacity: .5, margin: 0 }}>
              {ar ? "معلوماتك بتوصل لفريق ميت بكسلز مباشرة." : "Your details go straight to the MeetPixils team."}
            </p>
          </form>
        )}
      </Wrap>
    </div>
  );
}
