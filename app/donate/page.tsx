"use client";

import * as React from "react";
import { useLang, mono, cut, toAr, CREAM, PLUM900, LILAC, CYAN, ORANGE } from "@/lib/ui";
import { SectionHero, Wrap, Field, inputStyle, PxStyles } from "@/components/meetpixils/kit";
import { submitEntry } from "@/lib/content";

/** Optional: set to a CliQ alias or payment URL once one exists — shown on the success panel. */
const PAYMENT_HINT = "";

const AMOUNTS = [10, 25, 50, 100];

const INITIATIVES = [
  {
    id: "creative-hub", tint: LILAC,
    en: { name: "Creative space & hub", line: "A permanent studio in Amman — desks, crit walls, a library, and room for every workshop and battle we host." },
    ar: { name: "مساحة إبداعية / هَب", line: "ستوديو دائم بعمّان — مكاتب، جدران نقد، مكتبة، ومكان لكل ورشة وتحدي منعمله." },
  },
  {
    id: "coffeeshop", tint: CYAN,
    en: { name: "Designers' coffeeshop", line: "A café where the scene hangs out — good coffee up front, portfolio nights in the back." },
    ar: { name: "قهوة المصممين", line: "كافيه للمشهد كله — قهوة مظبوطة قدّام، وليالي بورتفوليو ورا." },
  },
];

export default function Donate() {
  const { ar } = useLang();
  const [initiative, setInitiative] = React.useState<string>("creative-hub");
  const [amount, setAmount] = React.useState<number>(25);
  const [custom, setCustom] = React.useState<string>("");
  const [done, setDone] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  const finalAmount = custom !== "" ? Math.max(1, Math.floor(Number(custom) || 0)) : amount;
  const num = (n: number | string) => (ar ? toAr(n) : String(n));
  const JOD = ar ? "د.أ" : "JOD";
  const chosen = INITIATIVES.find((x) => x.id === initiative)!;

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const entry = {
      _kind: "donation", _at: new Date().toISOString(),
      initiative: chosen.en.name, amount: `${finalAmount} JOD`,
      name: String(fd.get("name")), email: String(fd.get("email")), note: String(fd.get("note") || ""),
    };
    try {
      const list = JSON.parse(localStorage.getItem("mp-entries") || "[]");
      list.push(entry);
      localStorage.setItem("mp-entries", JSON.stringify(list));
    } catch {}
    setSending(true);
    setSent(await submitEntry(entry));
    setSending(false);
    setDone(true);
  };

  return (
    <div>
      <PxStyles tint={LILAC} />
      <SectionHero tint="#2F263B" fg={CREAM} ar={ar}
        kicker={ar ? "أبعد من الفعاليات" : "Beyond the events"}
        title={ar ? "ساعدنا نبني بيت للمصممين." : "Help us build a home for designers."}
        dek={ar
          ? "كل فعالية منعملها بمساحة مستأجرة. عم نجمع لشيئين دايمين — اختار واحد، اتعهد بمبلغ، وإحنا منكمل معك."
          : "Every event we run happens in rented space. We're raising for two permanent things — pick one, pledge, and we'll take it from there."} />
      <Wrap style={{ maxWidth: 880, padding: "clamp(46px,8vh,80px) clamp(20px,5vw,64px) clamp(70px,11vh,120px)" }}>
        {done ? (
          <div role="status" style={{ border: `1px solid ${LILAC}`, padding: "30px 28px", ...cut(14) }}>
            <strong style={{ display: "block", fontSize: 20, marginBottom: 8 }}>
              {sent ? (ar ? "وصل تعهدك ✓" : "Pledge received ✓") : (ar ? "محفوظ ✓" : "Saved ✓")}
            </strong>
            <p style={{ margin: "0 0 6px", fontSize: 14.5, color: "rgba(255,254,236,.78)", lineHeight: ar ? 1.85 : 1.6 }}>
              {sent
                ? (ar
                    ? `${num(finalAmount)} ${JOD} لـ«${ar ? chosen.ar.name : chosen.en.name}» — منبعتلك تفاصيل كليك / التحويل البنكي عالإيميل. شكراً!`
                    : `${finalAmount} ${JOD} toward “${chosen.en.name}” — we'll email you CliQ / bank transfer details to complete it. Shukran!`)
                : (ar
                    ? "محفوظ بمتصفحك فقط (وضع المعاينة) — عالموقع الحي بيوصل التعهد للفريق."
                    : "Saved in this browser only (preview mode) — on the live site this reaches the team.")}
            </p>
            {PAYMENT_HINT && (
              <p style={{ ...mono, margin: "10px 0 0", color: LILAC }}>{PAYMENT_HINT}</p>
            )}
            <a href="/" className="u-link" style={{ ...mono, color: LILAC, textDecoration: "none", display: "inline-block", marginTop: 12 }}>
              {ar ? "رجوع للرئيسية ←" : "Back home →"}
            </a>
          </div>
        ) : (
          <form onSubmit={onSubmit} style={{ display: "grid", gap: 26 }}>
            {/* initiative picker */}
            <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))" }}>
              {INITIATIVES.map((x) => {
                const c = ar ? x.ar : x.en;
                const on = initiative === x.id;
                return (
                  <button type="button" key={x.id} onClick={() => setInitiative(x.id)} aria-pressed={on}
                    style={{ textAlign: "start", cursor: "pointer", background: on ? "rgba(255,254,236,.06)" : "transparent",
                             color: CREAM, border: `1px solid ${on ? x.tint : "rgba(255,254,236,.2)"}`,
                             padding: "22px 24px", display: "flex", flexDirection: "column", gap: 10, ...cut(14) }}>
                    <span style={{ ...mono, color: x.tint }}>{on ? "● " : "○ "}{c.name}</span>
                    <span style={{ fontSize: 14, lineHeight: ar ? 1.85 : 1.55, color: "rgba(255,254,236,.72)" }}>{c.line}</span>
                  </button>
                );
              })}
            </div>

            {/* amount chips */}
            <div>
              <div style={{ ...mono, opacity: .6, marginBottom: 10 }}>{ar ? "المبلغ" : "Amount"}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
                {AMOUNTS.map((a) => {
                  const on = custom === "" && amount === a;
                  return (
                    <button type="button" key={a} onClick={() => { setAmount(a); setCustom(""); }} aria-pressed={on}
                      style={{ cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 13.5, fontWeight: 700,
                               background: on ? LILAC : "transparent", color: on ? PLUM900 : CREAM,
                               border: on ? 0 : "1px solid rgba(255,254,236,.3)", padding: "13px 20px", minHeight: 46, ...cut(10) }}>
                      {num(a)} {JOD}
                    </button>
                  );
                })}
                <input inputMode="numeric" placeholder={ar ? "مبلغ آخر" : "Custom"} value={custom}
                  onChange={(e) => setCustom(e.target.value.replace(/[^\d]/g, ""))}
                  aria-label={ar ? "مبلغ آخر" : "Custom amount"}
                  className="px-input" style={{ ...inputStyle, width: 120, minHeight: 46 }} />
              </div>
            </div>

            <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))" }}>
              <Field label={ar ? "الاسم" : "Name"}>
                <input name="name" required className="px-input" style={inputStyle} />
              </Field>
              <Field label={ar ? "الإيميل" : "Email"}>
                <input name="email" required type="email" className="px-input" style={inputStyle} />
              </Field>
            </div>
            <Field label={ar ? "ملاحظة (اختياري)" : "Note (optional)"}>
              <textarea name="note" rows={3} className="px-input" style={{ ...inputStyle, resize: "vertical" }} />
            </Field>

            <button type="submit" className="mp-btn" disabled={sending}
              style={{ ["--wipe" as string]: CREAM, ["--wipe-fg" as string]: PLUM900, justifySelf: "start",
                       background: LILAC, color: PLUM900, fontFamily: "var(--font-mono)", fontSize: 13.5,
                       fontWeight: 700, padding: "16px 30px", border: 0,
                       cursor: sending ? "wait" : "pointer", opacity: sending ? .6 : 1, ...cut(12) }}>
              {sending ? (ar ? "لحظة…" : "Sending…")
                       : ar ? `اتعهد بـ ${num(finalAmount)} ${JOD}` : `Pledge ${finalAmount} ${JOD}`}
              <span className="arw" aria-hidden="true">→</span>
            </button>
            <p style={{ ...mono, opacity: .5, margin: 0, maxWidth: "68ch", lineHeight: 1.8 }}>
              {ar
                ? "ما في دفع إلكتروني هلأ — منتواصل معك شخصياً بتفاصيل التحويل. كل متبرع اسمه رح يكون على الحيط يوم ما نفتتح."
                : "Nothing is charged online — we follow up personally with transfer details. Every contributor gets their name on the wall when we open."}
            </p>
          </form>
        )}
      </Wrap>
    </div>
  );
}
