"use client";

import * as React from "react";
import { useLang, mono, cut, toAr, ORANGE, LILAC, CYAN, CREAM, PLUM900 } from "@/lib/ui";
import { submitEntry, useStore } from "@/lib/content";
import { Wrap, Field, inputStyle, PxStyles } from "@/components/meetpixils/kit";
import { MeetMark } from "@/components/meetpixils/mark";

/**
 * Ticket flow for the Final Showcase — 3 steps (pass → details → confirm),
 * stepper styled after the ClarityLab reference but in our chamfer/mono system.
 * Loyalty rule: 3+ stamps on the stamp pass → 60% off either pass, verified at
 * the door. Prototype: reserves save locally and surface in /me and /admin.
 */


const PASSES = [
  {
    id: "normal", price: 30, tint: CYAN, popular: false,
    en: { name: "Normal pass", dek: "The full night, on the floor.", feats: ["Networking with designers", "Access to The ARC", "Classes & workshops"] },
    ar: { name: "الباس العادي", dek: "الليلة كاملة، من قلب القاعة.", feats: ["تعارف مع المصممين", "دخول The ARC", "كلاسات وورشات"] },
  },
  {
    id: "diamond", price: 50, tint: LILAC, popular: true,
    en: { name: "Diamond pass", dek: "Closer to the people who matter.", feats: ["Premium networks", "Private 1:01 access to mentors", "F&B access · launch", "Priority pass"] },
    ar: { name: "باس دايموند", dek: "أقرب للناس اللي بتفرق.", feats: ["شبكات بريميوم", "جلسة خاصة ١:٠١ مع المنتورز", "مأكولات ومشروبات · الإطلاق", "أولوية دخول"] },
  },
] as const;

type PassId = (typeof PASSES)[number]["id"];

export default function Tickets() {
  const { ar } = useLang();
  const [cms] = useStore();
  const [avail, setAvail] = React.useState<Record<string, { cap: number; left: number | null }> | null>(null);
  React.useEffect(() => {
    fetch("/api/availability.php", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null)).then(setAvail).catch(() => {});
  }, []);
  const soldOut = (id: string) => !!(avail && avail[id] && avail[id].left === 0);
  const SP = cms.settings.passes;
  const LOY = cms.settings.loyaltyOff;
  const [step, setStep] = React.useState(0);
  const [pass, setPass] = React.useState<PassId | null>(null);
  const [loyal, setLoyal] = React.useState(false);
  const [details, setDetails] = React.useState({ name: "", email: "" });
  const [done, setDone] = React.useState(false);

  const PASSES_LIVE = PASSES.map((p) => ({ ...p, price: SP[p.id as "normal" | "diamond"] ?? p.price }));
  const chosen = PASSES_LIVE.find((p) => p.id === pass);
  const priceOf = (base: number) => (loyal ? Math.round(base * (1 - LOY)) : base);
  const num = (n: number | string) => (ar ? toAr(n) : String(n));
  const JOD = ar ? "د.أ" : "JOD";

  const STEPS = ar
    ? [["الخطوة ١", "اختار الباس"], ["الخطوة ٢", "معلوماتك"], ["الخطوة ٣", "التأكيد"]]
    : [["Step 1", "Choose your pass"], ["Step 2", "Your details"], ["Step 3", "Confirm"]];

  const [sent, setSent] = React.useState(false);
  /* ---- CliQ payment flow: pay to the alias, attach proof, team verifies ---- */
  const CLIQ = { local: cms.settings.cliq, intl: "+962 " + cms.settings.cliq.replace(/^0/, ""), holder: "MeetPixils" };
  const [receiptImg, setReceiptImg] = React.useState<string | null>(null); // compressed dataURL
  const [stampImg, setStampImg] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [cliqDone, setCliqDone] = React.useState<null | { order: string; kind: "receipt" | "loyalty"; offline?: boolean }>(null);
  const [copied, setCopied] = React.useState(false);

  const copyCliq = async () => {
    try { await navigator.clipboard.writeText(CLIQ.local); setCopied(true); window.setTimeout(() => setCopied(false), 1500); } catch {}
  };

  /** Downscale phone photos to ≤1600px JPEG so uploads stay small. */
  const readImage = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const max = 1600;
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("decode")); };
    img.src = url;
  });
  const onPick = (which: "receipt" | "stamp") => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setSubmitError(null);
    try {
      const data = await readImage(f);
      (which === "receipt" ? setReceiptImg : setStampImg)(data);
    } catch {
      setSubmitError(ar ? "ما قدرنا نقرأ الصورة — جرب صورة JPG أو لقطة شاشة." : "Couldn't read that image — try a JPG or a screenshot.");
    }
  };

  const [wlDone, setWlDone] = React.useState(false);
  const joinWaitlist = async () => {
    if (!chosen) return;
    setSubmitting(true); setSubmitError(null);
    try {
      const r = await fetch("/api/entries.php", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _kind: "waitlist", _at: new Date().toISOString(),
                               name: details.name, email: details.email, pass: chosen.en.name }),
      });
      if (r.ok) { setWlDone(true); setSubmitting(false); return; }
      setSubmitError(`HTTP ${r.status}`);
    } catch { setWlDone(true); } // preview fallback: treat as noted
    setSubmitting(false);
  };

  const submitCliq = async () => {
    if (!chosen) return;
    if (loyal && !stampImg) { setSubmitError(ar ? "صورة باس الأختام مطلوبة." : "Your stamp pass photo is required."); return; }
    if (!loyal && !receiptImg) { setSubmitError(ar ? "صورة إيصال كليك مطلوبة." : "Your CliQ receipt is required."); return; }
    setSubmitting(true); setSubmitError(null);
    try {
      const r = await fetch("/api/ticket-submit.php", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pass: chosen.id, name: details.name, email: details.email, loyalty: loyal,
          receipt_b64: receiptImg ?? undefined, stamp_b64: stampImg ?? undefined,
        }),
      });
      const j = await r.json().catch(() => ({} as { ok?: boolean; order?: string; error?: string }));
      if (r.ok && j.ok) {
        setCliqDone({ order: j.order || "", kind: loyal ? "loyalty" : "receipt" });
        setSubmitting(false);
        return;
      }
      if (r.status === 409) { setSubmitError(ar ? "للأسف كمل الباس وإنت عم تدفع — سجّل بالانتظار من صفحة الباسات." : "This pass sold out while you were paying — contact us with your receipt and we'll sort it out."); setSubmitting(false); return; }
      setSubmitError(j.error || `HTTP ${r.status}`);
    } catch {
      // offline / preview: keep a local note so nothing is silently lost
      try {
        const list = JSON.parse(localStorage.getItem("mp-entries") || "[]");
        list.push({ _kind: "ticket", _at: new Date().toISOString(), name: details.name, email: details.email,
                    pass: chosen.en.name, price: `${priceOf(chosen.price)} JOD`,
                    loyalty: loyal ? "3+ stamps" : "no", status: "offline-draft" });
        localStorage.setItem("mp-entries", JSON.stringify(list));
      } catch {}
      setCliqDone({ order: "", kind: loyal ? "loyalty" : "receipt", offline: true });
    }
    setSubmitting(false);
  };
  const confirm = async () => {
    if (!chosen) return;
    const entry = {
      _kind: "ticket", _at: new Date().toISOString(),
      name: details.name, email: details.email,
      pass: chosen.en.name, price: `${priceOf(chosen.price)} JOD`, loyalty: loyal ? "3+ stamps (verify at door)" : "no",
    };
    try {
      const list = JSON.parse(localStorage.getItem("mp-entries") || "[]");
      list.push(entry);
      localStorage.setItem("mp-entries", JSON.stringify(list));
    } catch {}
    setSent(await submitEntry(entry)); // reaches the team's reservation list on the live site
    setDone(true);
  };

  if (wlDone) {
    return (
      <div style={{ paddingTop: 92, minHeight: "100vh" }}>
        <PxStyles tint={ORANGE} />
        <Wrap style={{ maxWidth: 640, paddingBottom: "clamp(70px,11vh,120px)" }}>
          <div role="status" style={{ border: "1px solid #5FD39A", padding: "34px 30px", marginTop: 30, ...cut(16) }}>
            <strong style={{ display: "block", fontSize: 23, marginBottom: 10 }}>
              {ar ? "إنت عالقائمة ✓" : "You're on the waitlist ✓"}
            </strong>
            <p style={{ margin: "0 0 14px", fontSize: 14.5, color: "rgba(255,254,236,.75)", lineHeight: ar ? 1.9 : 1.65 }}>
              {ar ? "إذا فضي مقعد منبعتلك إيميل فوراً — بالترتيب، الأول فالأول." : "If a seat opens we email you immediately — first come, first served."}
            </p>
            <a href="/" className="u-link" style={{ ...mono, color: ORANGE, textDecoration: "none" }}>{ar ? "رجوع ←" : "Back home →"}</a>
          </div>
        </Wrap>
      </div>
    );
  }

  if (cliqDone) {
    const loyalFlow = cliqDone.kind === "loyalty";
    return (
      <div style={{ paddingTop: 92, minHeight: "100vh" }}>
        <PxStyles tint={ORANGE} />
        <Wrap style={{ maxWidth: 660, paddingBottom: "clamp(70px,11vh,120px)" }}>
          <div role="status" style={{ border: `1px solid ${cliqDone.offline ? ORANGE : "#5FD39A"}`, padding: "34px 30px", marginTop: 30, ...cut(16) }}>
            <strong style={{ display: "block", fontSize: 23, marginBottom: 10 }}>
              {cliqDone.offline
                ? (ar ? "محفوظ محلياً (وضع المعاينة)" : "Saved locally (preview mode)")
                : loyalFlow
                  ? (ar ? "وصلنا باس الأختام ✓" : "Stamp pass received ✓")
                  : (ar ? "وصلنا الإيصال ✓" : "Receipt received ✓")}
            </strong>
            <p style={{ margin: "0 0 14px", fontSize: 14.5, color: "rgba(255,254,236,.75)", lineHeight: ar ? 1.9 : 1.65 }}>
              {cliqDone.offline
                ? (ar ? "عالموقع الحي بتوصل مباشرة للفريق." : "On the live site this goes straight to the team.")
                : loyalFlow
                  ? (ar
                      ? `طلبك ${cliqDone.order} قيد الموافقة — بنأكد الخصم على إيميلك، وبعدها بتحوّل ${num(priceOf(chosen!.price))} ${JOD} عبر كليك على ${toAr(cms.settings.cliq)} وبتبعتلنا الإيصال برد على نفس الإيميل.`
                      : `Order ${cliqDone.order} is in review — we'll confirm your ${Math.round(LOY * 100)}% discount by email, then you send ${priceOf(chosen!.price)} ${JOD} via CliQ to ${CLIQ.local} and reply with the receipt.`)
                  : (ar
                      ? `طلبك ${cliqDone.order} قيد التدقيق — بنطابق الإيصال وبنبعتلك تأكيد التذكرة على إيميلك.`
                      : `Order ${cliqDone.order} is being verified — we match your receipt and email your ticket confirmation.`)}
            </p>
            <a href="/" className="u-link" style={{ ...mono, color: ORANGE, textDecoration: "none" }}>
              {ar ? "رجوع للرئيسية ←" : "Back home →"}
            </a>
          </div>
        </Wrap>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: 92, minHeight: "100vh" }}>
      <PxStyles tint={ORANGE} />
      <Wrap style={{ paddingBottom: "clamp(70px,11vh,120px)" }}>
        <nav aria-label="breadcrumb" style={{ ...mono, opacity: .55, margin: "10px 0 26px" }}>
          <a href="/whats-on/final-showcase-2026" className="u-link" style={{ color: CREAM, textDecoration: "none" }}>
            {ar ? "العرض الختامي ٢٠٢٦" : "Final Showcase 2026"}
          </a>
          <span style={{ margin: "0 8px", opacity: .5 }}>/</span>{ar ? "التذاكر" : "Tickets"}
        </nav>

        {/* ---------- stepper ---------- */}
        <ol className="tk-steps" style={{ listStyle: "none", margin: "0 0 40px", padding: 0, display: "flex", gap: 10 }}>
          {STEPS.map(([kick, label], i) => {
            const state = done ? "done" : i < step ? "done" : i === step ? "now" : "next";
            return (
              <li key={label} style={{ flex: "1 1 0", minWidth: 0 }}>
                <button type="button" className="tk-step" disabled={state === "next"}
                        onClick={() => !done && i < step && setStep(i)}
                        aria-current={state === "now" ? "step" : undefined}
                        style={{ width: "100%", background: "none", border: 0, cursor: state === "done" && !done ? "pointer" : "default",
                                 color: CREAM, textAlign: ar ? "right" : "left", padding: 0, fontFamily: "inherit" }}>
                  <span style={{ ...mono, opacity: .5, display: "block" }}>{kick}</span>
                  <span style={{ display: "block", fontSize: 15, fontWeight: 650, margin: "4px 0 10px",
                                 opacity: state === "next" ? .38 : 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {state === "done" ? "✓ " : ""}{label}
                  </span>
                  <span aria-hidden="true" style={{ display: "block", height: 3, background: "rgba(255,254,236,.14)", position: "relative", overflow: "hidden" }}>
                    <span style={{ position: "absolute", insetBlock: 0, insetInlineStart: 0,
                                   width: state === "next" ? 0 : "100%",
                                   background: state === "now" ? ORANGE : "rgba(255,254,236,.45)",
                                   transition: "width .5s cubic-bezier(.16,1,.3,1)" }} />
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        {done ? (
          /* ---------- the stub ---------- */
          <div role="status" style={{ maxWidth: 560 }}>
            <div style={{ background: chosen?.tint, color: PLUM900, padding: "28px 30px", ...cut(18) }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <MeetMark size={26} color={PLUM900} />
                <span style={{ ...mono, fontWeight: 700 }}>{ar ? "٢٦ أيلول · The ARC" : "26 Sep · The ARC"}</span>
              </div>
              <strong style={{ display: "block", fontSize: 26, fontWeight: 800, margin: "18px 0 4px", letterSpacing: ar ? 0 : "-.03em" }}>
                {ar ? chosen?.ar.name : chosen?.en.name}
              </strong>
              <span style={{ fontSize: 14 }}>{details.name}</span>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 18, paddingTop: 14, borderTop: `1px dashed ${PLUM900}` }}>
                <span style={{ ...mono }}>{loyal ? (ar ? `خصم الولاء ${toAr(Math.round(LOY * 100))}٪ — بتنأكد الأختام عالباب` : `Loyalty ${Math.round(LOY * 100)}% — stamps verified at door`) : (ar ? "الدفع عند الباب" : "Pay at the door")}</span>
                <strong style={{ fontSize: 24, fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>{num(priceOf(chosen!.price))} {JOD}</strong>
              </div>
            </div>
            <p style={{ margin: "18px 0 0", fontSize: 14, color: "rgba(255,254,236,.72)" }}>
              {sent
                ? (ar ? "محجوز — وصل الحجز لفريق ميت بكسلز. الدفع عالباب." : "Reserved — the team got your reservation. Payment is at the door.")
                : (ar ? "محفوظ بمتصفحك (وضع المعاينة) — عالموقع الحي بيوصل الحجز للفريق." : "Saved in this browser (preview mode) — on the live site this reaches the team.")}
            </p>
            <a href="/me" className="u-link" style={{ ...mono, color: ORANGE, textDecoration: "none", display: "inline-block", marginTop: 10 }}>
              {ar ? "روح على ملفي ←" : "Go to my profile →"}
            </a>
          </div>
        ) : step === 0 ? (
          <>
            <h1 style={{ margin: "0 0 8px", fontSize: "clamp(30px,4.6vw,54px)", fontWeight: 800, letterSpacing: ar ? 0 : "-.035em", lineHeight: ar ? 1.4 : 1.05 }}>
              {ar ? "اختار الباس تبعك" : "Choose your pass"}
            </h1>
            <p style={{ margin: "0 0 26px", maxWidth: "52ch", fontSize: 15, color: "rgba(255,254,236,.7)", lineHeight: ar ? 1.85 : 1.6 }}>
              {ar ? "٢٦ أيلول، The ARC — تتويج فايزين الديزاينثون، والكشف عن الموسم الجاي." : "26 September at The ARC — designathon winners crowned, next season revealed."}
            </p>

            {/* loyalty toggle drives live prices */}
            <label className="tk-loyal" style={{ display: "inline-flex", alignItems: "center", gap: 12, cursor: "pointer",
                     border: `1px solid ${loyal ? ORANGE : "rgba(255,254,236,.24)"}`, padding: "13px 18px", marginBottom: 28,
                     background: loyal ? "rgba(239,82,41,.1)" : "transparent", transition: "border-color .25s, background .25s", ...cut(10) }}>
              <input type="checkbox" checked={loyal} onChange={(e) => setLoyal(e.target.checked)}
                     style={{ width: 18, height: 18, accentColor: ORANGE }} />
              <span style={{ fontSize: 14 }}>
                {ar ? <>عندي <b>٣+ أختام</b> على باس الولاء — خصم <b style={{ color: ORANGE }}>{toAr(Math.round(LOY * 100))}٪</b> على أي باس</>
                    : <>I have <b>3+ stamps</b> on my loyalty pass — <b style={{ color: ORANGE }}>{Math.round(LOY * 100)}% off</b> any pass</>}
              </span>
            </label>

            <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fit,minmax(290px,1fr))", maxWidth: 880 }}>
              {PASSES_LIVE.map((p) => {
                const c = ar ? p.ar : p.en;
                const disc = loyal;
                return (
                  <div key={p.id} className="tk-card" style={{ ["--tint" as string]: p.tint, position: "relative",
                         background: "rgba(255,254,236,.03)", padding: "26px 28px", display: "flex", flexDirection: "column", gap: 14, ...cut(18) }}>
                    {p.popular && (
                      <span style={{ ...mono, position: "absolute", top: 18, insetInlineEnd: 20, background: p.tint, color: PLUM900,
                                     fontWeight: 700, padding: "5px 11px", ...cut(6) }}>
                        {ar ? "الأكثر طلباً" : "Most popular"}
                      </span>
                    )}
                    <MeetMark size={26} color={p.tint} />
                    <div>
                      <strong style={{ display: "block", fontSize: 22, fontWeight: 800, letterSpacing: ar ? 0 : "-.025em" }}>{c.name}</strong>
                      <span style={{ fontSize: 13.5, color: "rgba(255,254,236,.62)" }}>{c.dek}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 10, minHeight: 44 }}>
                      <strong key={String(disc)} className="tk-price" style={{ fontSize: 38, fontWeight: 800, letterSpacing: "-.03em", fontVariantNumeric: "tabular-nums" }}>
                        {num(priceOf(p.price))}
                      </strong>
                      <span style={{ ...mono, opacity: .6 }}>{JOD}</span>
                      {disc && (
                        <span style={{ ...mono, textDecoration: "line-through", opacity: .45 }}>{num(p.price)}</span>
                      )}
                      {disc && <span style={{ ...mono, color: ORANGE, fontWeight: 700 }}>-{Math.round(LOY * 100)}%</span>}
                    </div>
                    <button type="button" className="mp-btn" onClick={() => { setPass(p.id); setStep(1); }}
                            disabled={false}
                            style={{ ["--wipe" as string]: CREAM, ["--wipe-fg" as string]: PLUM900,
                                     background: p.popular ? ORANGE : "transparent",
                                     color: p.popular ? PLUM900 : CREAM,
                                     border: p.popular ? 0 : "1px solid rgba(255,254,236,.32)",
                                     fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700,
                                     padding: "15px 24px", cursor: "pointer", ...cut(12) }}>
                      {soldOut(p.id)
                        ? (ar ? "كمل الباس — سجّل بالانتظار" : "Sold out — join waitlist")
                        : <>{ar ? "اختار هالباس" : "Choose this pass"}<span className="arw" aria-hidden="true">→</span></>}
                    </button>
                    <ul style={{ listStyle: "none", margin: "6px 0 0", padding: 0, display: "grid", gap: 10 }}>
                      {c.feats.map((f) => (
                        <li key={f} style={{ display: "flex", gap: 11, alignItems: "center", fontSize: 14 }}>
                          <span aria-hidden="true" style={{ width: 8, height: 8, background: p.tint, flex: "0 0 auto" }} />{f}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
            <p style={{ ...mono, marginTop: 22, opacity: .5, maxWidth: "70ch", lineHeight: 1.8 }}>
              {ar ? "خصم الولاء بينأكد عالباب — جيب باس الأختام معك." : "The loyalty discount is verified at the door — bring your stamp pass with you."}
            </p>
          </>
        ) : step === 1 ? (
          <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} style={{ maxWidth: 520, display: "grid", gap: 18 }}>
            <h1 style={{ margin: 0, fontSize: "clamp(26px,3.6vw,40px)", fontWeight: 800, letterSpacing: ar ? 0 : "-.03em" }}>
              {ar ? "معلوماتك" : "Your details"}
            </h1>
            <Field label={ar ? "الاسم الكامل" : "Full name"}>
              <input required className="px-input" style={inputStyle} value={details.name}
                     onChange={(e) => setDetails((d) => ({ ...d, name: e.target.value }))} />
            </Field>
            <Field label={ar ? "الإيميل" : "Email"}>
              <input required type="email" className="px-input" style={inputStyle} value={details.email}
                     onChange={(e) => setDetails((d) => ({ ...d, email: e.target.value }))} />
            </Field>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button type="submit" className="mp-btn"
                      style={{ ["--wipe" as string]: CREAM, ["--wipe-fg" as string]: PLUM900, background: ORANGE, color: PLUM900,
                               fontFamily: "var(--font-mono)", fontSize: 13.5, fontWeight: 700, padding: "16px 30px", border: 0, cursor: "pointer", ...cut(12) }}>
                {ar ? "كمّل" : "Continue"}<span className="arw" aria-hidden="true">→</span>
              </button>
              <button type="button" onClick={() => setStep(0)} className="mp-ghost"
                      style={{ fontFamily: "var(--font-mono)", fontSize: 12, padding: "14px 22px", background: "none",
                               border: "1px solid rgba(255,254,236,.26)", color: "rgba(255,254,236,.78)", cursor: "pointer" }}>
                {ar ? "رجوع" : "Back"}
              </button>
            </div>
          </form>
        ) : (
          <div style={{ maxWidth: 560 }}>
            <h1 style={{ margin: "0 0 22px", fontSize: "clamp(26px,3.6vw,40px)", fontWeight: 800, letterSpacing: ar ? 0 : "-.03em" }}>
              {ar ? "التأكيد" : "Confirm"}
            </h1>
            <dl style={{ margin: "0 0 26px", display: "grid", gridTemplateColumns: "auto 1fr", gap: "12px 22px", fontSize: 15 }}>
              {[[ar ? "الباس" : "Pass", (ar ? chosen?.ar.name : chosen?.en.name) || ""],
                [ar ? "الاسم" : "Name", details.name],
                [ar ? "الإيميل" : "Email", details.email],
                [ar ? "الولاء" : "Loyalty", loyal ? (ar ? `٣+ أختام — ${toAr(Math.round(LOY * 100))}٪` : `3+ stamps — ${Math.round(LOY * 100)}%`) : (ar ? "لا" : "No")],
                [ar ? "السعر" : "Price", `${num(priceOf(chosen!.price))} ${JOD}`]].map(([k, v]) => (
                <React.Fragment key={k}>
                  <dt style={{ ...mono, opacity: .55 }}>{k}</dt>
                  <dd style={{ margin: 0, fontWeight: k === (ar ? "السعر" : "Price") ? 800 : 500 }}>{v}</dd>
                </React.Fragment>
              ))}
            </dl>
            {chosen && soldOut(chosen.id) ? (
              <div>
                <div style={{ border: "1px solid #FF7A4F", padding: "22px 24px", marginBottom: 20, ...cut(14) }}>
                  <strong style={{ display: "block", fontSize: 16.5, marginBottom: 6 }}>
                    {ar ? "هالباس كمل 😔" : "This pass is sold out 😔"}
                  </strong>
                  <p style={{ margin: 0, fontSize: 13.5, color: "rgba(255,254,236,.7)", lineHeight: ar ? 1.85 : 1.6 }}>
                    {ar ? "بنضيفك على قائمة الانتظار — إذا فضي مقعد منبعتلك إيميل بالترتيب." : "We'll add you to the waitlist — if a seat opens, we email in order."}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <button type="button" onClick={joinWaitlist} disabled={submitting} className="mp-btn"
                          style={{ ["--wipe" as string]: CREAM, ["--wipe-fg" as string]: PLUM900, background: ORANGE, color: PLUM900,
                                   fontFamily: "var(--font-mono)", fontSize: 13.5, fontWeight: 700, padding: "16px 30px", border: 0,
                                   cursor: submitting ? "wait" : "pointer", opacity: submitting ? .6 : 1, ...cut(12) }}>
                    {submitting ? (ar ? "لحظة…" : "…") : ar ? "سجّلني بالانتظار" : "Join the waitlist"}<span className="arw" aria-hidden="true">→</span>
                  </button>
                  <button type="button" onClick={() => setStep(0)} className="mp-ghost"
                          style={{ fontFamily: "var(--font-mono)", fontSize: 12, padding: "14px 22px", background: "none",
                                   border: "1px solid rgba(255,254,236,.26)", color: "rgba(255,254,236,.78)", cursor: "pointer" }}>
                    {ar ? "غيّر الباس" : "Pick the other pass"}
                  </button>
                </div>
                {submitError && <p role="alert" style={{ ...mono, marginTop: 14, color: ORANGE }}>✗ {submitError}</p>}
              </div>
            ) : (
            <div>
            {/* ---- CliQ payment card ---- */}
            <div style={{ border: `1px solid ${loyal ? LILAC : "#5FD39A"}`, padding: "22px 24px", marginBottom: 20, ...cut(14) }}>
              {loyal ? (
                <>
                  <strong style={{ display: "block", fontSize: 16.5, marginBottom: 8 }}>
                    {ar ? "١ · ارفع صورة باس الأختام تبعك" : "1 · Upload your stamp pass photo"}
                  </strong>
                  <p style={{ margin: "0 0 14px", fontSize: 13.5, color: "rgba(255,254,236,.7)", lineHeight: ar ? 1.85 : 1.6 }}>
                    {ar
                      ? `منراجع الأختام (٣+)، وبعد الموافقة بنبعتلك إيميل — بعدها بتحوّل ${num(priceOf(chosen!.price))} ${JOD} عبر كليك على ${toAr(cms.settings.cliq)} وبتبعت الإيصال برد عالإيميل.`
                      : `We check your 3+ stamps and email the approval — then you send ${priceOf(chosen!.price)} ${JOD} via CliQ to ${CLIQ.local} and reply with the receipt.`}
                  </p>
                </>
              ) : (
                <>
                  <strong style={{ display: "block", fontSize: 16.5, marginBottom: 8 }}>
                    {ar ? `١ · حوّل ${num(priceOf(chosen!.price))} ${JOD} عبر كليك` : `1 · Send ${priceOf(chosen!.price)} ${JOD} via CliQ`}
                  </strong>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 10 }}>
                    <span dir="ltr" style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 700, letterSpacing: ".04em", fontVariantNumeric: "tabular-nums" }}>
                      {CLIQ.local}
                    </span>
                    <button type="button" onClick={copyCliq} className="mp-ghost"
                            style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, padding: "8px 14px", background: "none",
                                     border: "1px solid rgba(255,254,236,.3)", color: CREAM, cursor: "pointer" }}>
                      {copied ? (ar ? "انتسخ ✓" : "Copied ✓") : (ar ? "انسخ الرقم" : "Copy number")}
                    </button>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: "rgba(255,254,236,.62)" }} dir="ltr">
                    {CLIQ.holder} · {CLIQ.intl} · {ar ? "من تطبيق بنكك، خانة كليك" : "from your banking app → CliQ"}
                  </p>
                </>
              )}
            </div>

            {/* ---- proof uploaders ---- */}
            <div style={{ display: "grid", gap: 14, marginBottom: 20 }}>
              {!loyal && (
                <label className="tk-upload" style={{ borderColor: receiptImg ? "#5FD39A" : "rgba(255,254,236,.28)" }}>
                  <input type="file" accept="image/*" onChange={onPick("receipt")} style={{ display: "none" }} />
                  {receiptImg
                    ? <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <img src={receiptImg} alt="" style={{ width: 52, height: 52, objectFit: "cover", ...cut(8) }} />
                        <span>{ar ? "إيصال كليك مرفق ✓ — اضغط للتغيير" : "CliQ receipt attached ✓ — tap to change"}</span>
                      </span>
                    : <span>{ar ? "٢ · ارفق صورة إيصال كليك (لقطة شاشة)" : "2 · Attach your CliQ receipt (screenshot)"}</span>}
                </label>
              )}
              {loyal && (
                <label className="tk-upload" style={{ borderColor: stampImg ? "#5FD39A" : "rgba(255,254,236,.28)" }}>
                  <input type="file" accept="image/*" onChange={onPick("stamp")} style={{ display: "none" }} />
                  {stampImg
                    ? <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <img src={stampImg} alt="" style={{ width: 52, height: 52, objectFit: "cover", ...cut(8) }} />
                        <span>{ar ? "صورة باس الأختام مرفقة ✓ — اضغط للتغيير" : "Stamp pass attached ✓ — tap to change"}</span>
                      </span>
                    : <span>{ar ? "ارفق صورة باس الأختام (٣+ أختام ظاهرة)" : "Attach your stamp pass photo (3+ stamps visible)"}</span>}
                </label>
              )}
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button type="button" onClick={submitCliq} disabled={submitting} className="mp-btn"
                      style={{ ["--wipe" as string]: CREAM, ["--wipe-fg" as string]: PLUM900,
                               background: loyal ? LILAC : "#5FD39A", color: PLUM900,
                               fontFamily: "var(--font-mono)", fontSize: 13.5, fontWeight: 700, padding: "16px 30px", border: 0,
                               cursor: submitting ? "wait" : "pointer", opacity: submitting ? .6 : 1, ...cut(12) }}>
                {submitting ? (ar ? "لحظة…" : "Uploading…")
                            : loyal ? (ar ? "قدّم للموافقة" : "Submit for approval")
                                    : (ar ? "ابعت الإيصال" : "Submit receipt")}
                <span className="arw" aria-hidden="true">→</span>
              </button>
              <button type="button" onClick={confirm} className="mp-ghost"
                      style={{ fontFamily: "var(--font-mono)", fontSize: 12, padding: "14px 22px", background: "none",
                               border: "1px solid rgba(255,254,236,.26)", color: "rgba(255,254,236,.78)", cursor: "pointer" }}>
                {ar ? "ما بقدر كليك؟ احجز وادفع عالباب" : "Can't CliQ? Reserve — pay at the door"}
              </button>
              <button type="button" onClick={() => setStep(1)} className="mp-ghost"
                      style={{ fontFamily: "var(--font-mono)", fontSize: 12, padding: "14px 22px", background: "none",
                               border: "1px solid rgba(255,254,236,.26)", color: "rgba(255,254,236,.78)", cursor: "pointer" }}>
                {ar ? "رجوع" : "Back"}
              </button>
            </div>
            {submitError && <p role="alert" style={{ ...mono, marginTop: 14, color: ORANGE }}>✗ {submitError}</p>}
            <p style={{ ...mono, marginTop: 16, opacity: .5, maxWidth: "64ch", lineHeight: 1.8 }}>
              {ar
                ? "منطابق كل إيصال يدوياً وبنأكدلك عالإيميل. صور الإيصالات محفوظة بشكل خاص ولا تُشارك مع أحد."
                : "Every receipt is matched by hand and confirmed by email. Proof images are stored privately and never shared."}
              {" "}<a href="/about/terms" className="u-link" style={{ color: "rgba(255,254,236,.6)" }}>{ar ? "شروط الاسترجاع" : "Refund policy"}</a>
            </p>
            </div>
            )}
          </div>
        )}
      </Wrap>
      <style>{`
        .tk-upload {
          display: flex; align-items: center; min-height: 64px; padding: 14px 18px;
          border: 1px dashed rgba(255,254,236,.28); cursor: pointer; font-size: 14px;
          clip-path: polygon(12px 0,100% 0,100% calc(100% - 12px),calc(100% - 12px) 100%,0 100%,0 12px);
          transition: border-color .25s, background .25s;
        }
        .tk-upload:hover { background: rgba(255,254,236,.05) }
        .tk-upload:focus-within { outline: 2px solid #FF7A4F; outline-offset: 2px }
        .tk-card { transition: transform .45s cubic-bezier(.16,1,.3,1), box-shadow .45s;
                   box-shadow: inset 0 0 0 1px rgba(255,254,236,.12) }
        .tk-card:hover { transform: translateY(-5px); box-shadow: inset 0 0 0 1px var(--tint) }
        .tk-price { display: inline-block; animation: tkpop .35s cubic-bezier(.16,1,.3,1) }
        @keyframes tkpop { 0% { transform: scale(.8); opacity: .4 } 100% { transform: scale(1); opacity: 1 } }
        .tk-step:focus-visible { outline: 2px solid ${ORANGE}; outline-offset: 3px }
        .tk-loyal:focus-within { outline: 2px solid ${ORANGE}; outline-offset: 3px }
        @media (prefers-reduced-motion: reduce) {
          .tk-card { transition: none } .tk-card:hover { transform: none }
          .tk-price { animation: none }
        }
      `}</style>
    </div>
  );
}
