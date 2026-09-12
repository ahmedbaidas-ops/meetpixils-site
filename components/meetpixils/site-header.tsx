"use client";

import * as React from "react";
import { GAMES } from "@/lib/games";
import { useStore } from "@/lib/content";
import { usePathname } from "next/navigation";
import {
  MotionNavigationMenu, MotionNavigationMenuList, MotionNavigationMenuItem,
  MotionNavigationMenuTrigger, MotionNavigationMenuContent, MotionNavigationMenuLink,
} from "@/components/unlumen-ui/motion-navigation-menu";
import { MeetPixilsLogo } from "@/components/meetpixils/logo";
import { ORANGE, LILAC, CYAN, PERI, CREAM, PLUM900, cut, mono } from "@/lib/ui";

const ghost: React.CSSProperties = {
  fontFamily: "var(--font-mono)", fontSize: 11.5, padding: "9px 14px", borderRadius: 0, cursor: "pointer",
  background: "transparent", color: "rgba(255,254,236,.78)",
  border: "1px solid rgba(255,254,236,.26)", whiteSpace: "nowrap",
};

export const NAV = [
  { id: "whats-on", base: "/whats-on", tint: CYAN,
    en: { label: "What's On", items: [["All upcoming","/whats-on"],["Final Showcase · 26 Sep","/whats-on/final-showcase-2026"],["Workshops & talks","/learn/workshops"],["Past events","/whats-on/past"]] },
    ar: { label: "شو في قريب؟", items: [["كل القادم","/whats-on"],["العرض الختامي · ٢٦ أيلول","/whats-on/final-showcase-2026"],["ورشات وحوارات","/learn/workshops"],["فعاليات سابقة","/whats-on/past"]] } },
  { id: "compete", base: "/compete", tint: LILAC,
    en: { label: "Compete", items: [["Live battles","/compete"],["How judging works","/compete/how-judging-works"],["Be a judge","/compete/be-a-judge"]] },
    ar: { label: "نافس", items: [["التحديات الجارية","/compete"],["كيف يتم التحكيم","/compete/how-judging-works"],["كن محكّماً","/compete/be-a-judge"]] } },
  { id: "learn", base: "/learn", tint: PERI,
    en: { label: "Learn", items: [["Tracks & bootcamps","/learn"],["Mentorship","/learn/mentorship"],["Workshops","/learn/workshops"],["My certificates","/me/certificates"]] },
    ar: { label: "اتعلّم", items: [["المسارات والمعسكرات","/learn"],["الإرشاد","/learn/mentorship"],["ورشات","/learn/workshops"],["شهاداتي","/me/certificates"]] } },
  { id: "community", base: "/community", tint: ORANGE,
    en: { label: "Community", items: [["Showcase — work","/community/showcase"],["People","/community/people"],["Stories & news","/community/stories"],["Join the WhatsApp","/community/whatsapp"],["Discord \u2197","https://discord.gg/FhnNbqZk5"]] },
    ar: { label: "المجتمع", items: [["معرض الأعمال","/community/showcase"],["الناس","/community/people"],["قصص وأخبار","/community/stories"],["انضم لواتساب","/community/whatsapp"],["ديسكورد \u2197","https://discord.gg/FhnNbqZk5"]] } },
  { id: "about", base: "/about", tint: CREAM,
    en: { label: "About", items: [["The five arms","/about/ecosystem"],["Partners & sponsors","/about/partners"],["Sponsor an event","/about/sponsor"],["Contact","/about/contact"],["Support us · donate","/donate"]] },
    ar: { label: "مين إحنا", items: [["الأذرع الخمسة","/about/ecosystem"],["الشركاء والرعاة","/about/partners"],["ارعَ فعالية","/about/sponsor"],["تواصل معنا","/about/contact"],["ادعمنا · تبرّع","/donate"]] } },
];

function SignInMenu({ ar, ghost }: { ar: boolean; ghost: React.CSSProperties }) {
  const [open, setOpen] = React.useState(false);
  const [tab, setTab] = React.useState<"user" | "admin">("user");
  // user lookup
  const [email, setEmail] = React.useState("");
  const [order, setOrder] = React.useState("");
  const [result, setResult] = React.useState<null | { found: boolean; status?: string; pass?: string; price?: string }>(null);
  const [busy, setBusy] = React.useState(false);
  // admin
  const [pwd, setPwd] = React.useState("");
  const [adminErr, setAdminErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => { if (!(e.target as HTMLElement).closest(".mp-signwrap")) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("pointerdown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);

  const STATUS_HUMAN: Record<string, [string, string, string]> = {
    "receipt-review": ["Receipt being verified — we'll email you", "الإيصال قيد التدقيق — منأكدلك عالإيميل", "#FF7A4F"],
    "loyalty-review": ["Loyalty pass under review", "باس الولاء قيد المراجعة", "#FF7A4F"],
    "approved-pay-now": ["Approved! Send the CliQ transfer to finish", "تمت الموافقة! حوّل عبر كليك لتكمل", "#CCA4FD"],
    paid: ["Paid — you're in ✓", "مدفوع — إنت جوّا ✓", "#5FD39A"],
    rejected: ["Not approved — contact us", "ما انقبل — تواصل معنا", "#FF7A4F"],
  };

  const lookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setResult(null);
    try {
      const r = await fetch("/api/ticket-status.php", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, order }),
      });
      setResult(r.ok ? await r.json() : { found: false });
    } catch { setResult({ found: false }); }
    setBusy(false);
  };
  const adminGo = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setAdminErr(null);
    try {
      const r = await fetch("/api/whoami.php", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pwd }), cache: "no-store" });
      if (r.status === 401) { setAdminErr(ar ? "كلمة السر غلط" : "Wrong password"); setBusy(false); return; }
      const j: { role?: string } = await r.json().catch(() => ({}));
      sessionStorage.setItem("mp-admin-pw", pwd);
      sessionStorage.setItem("mp-admin-role", j.role || "super");
      window.location.href = "/admin/";
    } catch {
      sessionStorage.setItem("mp-admin-pw", pwd);
      window.location.href = "/admin/"; // preview: the admin page handles offline itself
    }
  };

  const field: React.CSSProperties = { fontFamily: "var(--font-mono)", fontSize: 13, padding: "11px 12px", minHeight: 46,
    background: "rgba(255,254,236,.07)", color: "#FFFEEC", border: "1px solid rgba(255,254,236,.28)", borderRadius: 0, outline: "none", width: "100%" };

  return (
    <div className="mp-signwrap" style={{ position: "relative" }}>
      <button type="button" onClick={() => setOpen((v) => !v)} className="mp-ghost"
              aria-haspopup="dialog" aria-expanded={open}
              style={{ ...ghost, padding: "9px 12px", display: "inline-flex", alignItems: "center", gap: 7,
                       color: open ? "#FFFEEC" : undefined, background: open ? "rgba(255,254,236,.1)" : undefined }}>
        <svg width="13" height="14" viewBox="0 0 13 14" fill="currentColor" aria-hidden="true" style={{ display: "block" }}>
          <circle cx="6.5" cy="3.6" r="3.1" />
          <path d="M0.5 14c0-3.3 2.7-5.4 6-5.4s6 2.1 6 5.4Z" />
        </svg>
        <span className="mp-si-label">{ar ? "دخول" : "Sign in"}</span>
      </button>
      {open && (
        <div role="dialog" aria-label={ar ? "تسجيل الدخول" : "Sign in"}
             style={{ position: "absolute", top: "calc(100% + 12px)", insetInlineEnd: 0, width: "min(320px, 88vw)", zIndex: 70 }}>
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "rgba(15,1,10,.42)",
                backdropFilter: "blur(64px) saturate(1.9) brightness(.45)",
                WebkitBackdropFilter: "blur(64px) saturate(1.9) brightness(.45)", ...cut(12) }} />
          <div style={{ position: "relative", padding: 16 }}>
            <div role="tablist" aria-label={ar ? "نوع الدخول" : "Sign-in type"} style={{ display: "flex", gap: 6, marginBottom: 14 }}>
              {([["user", ar ? "زائر" : "User"], ["admin", ar ? "الإدارة" : "Admin"]] as const).map(([id, label]) => (
                <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)}
                        style={{ flex: 1, minHeight: 44, cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 12.5, fontWeight: 700,
                                 background: tab === id ? "#EF5229" : "rgba(255,254,236,.08)",
                                 color: tab === id ? "#0F010A" : "rgba(255,254,236,.85)", border: 0, ...cut(8) }}>
                  {label}
                </button>
              ))}
            </div>
            {tab === "user" ? (
              <form onSubmit={lookup} style={{ display: "grid", gap: 10 }}>
                <p style={{ margin: 0, fontSize: 12.5, color: "rgba(255,254,236,.7)", lineHeight: ar ? 1.8 : 1.55 }}>
                  {ar ? "تتبّع تذكرتك — الإيميل ورقم الطلب اللي ظهرلك عند التقديم." : "Track your ticket — the email and order number shown when you submitted."}
                </p>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                       placeholder={ar ? "الإيميل" : "Email"} aria-label={ar ? "الإيميل" : "Email"} style={field} />
                <input required value={order} onChange={(e) => setOrder(e.target.value)}
                       placeholder={ar ? "رقم الطلب — MP-…" : "Order — MP-…"} aria-label={ar ? "رقم الطلب" : "Order number"} style={field} dir="ltr" />
                <button type="submit" disabled={busy}
                        style={{ minHeight: 46, cursor: busy ? "wait" : "pointer", fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700,
                                 background: "#2EBEEF", color: "#0F010A", border: 0, opacity: busy ? .6 : 1, ...cut(10) }}>
                  {busy ? "…" : ar ? "شيك" : "Check status"}
                </button>
                {result && (
                  <p role="status" style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: 12, lineHeight: 1.7,
                                            color: result.found ? (STATUS_HUMAN[result.status || ""]?.[2] ?? "#FFFEEC") : "#FF7A4F" }}>
                    {result.found
                      ? `${result.pass} · ${result.price} — ${ar ? (STATUS_HUMAN[result.status || ""]?.[1] ?? result.status) : (STATUS_HUMAN[result.status || ""]?.[0] ?? result.status)}`
                      : ar ? "✗ ما لقينا طلب بهالإيميل والرقم." : "✗ No ticket matches that email + order."}
                  </p>
                )}
                <a href="/me" className="u-link" style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, color: "rgba(255,254,236,.6)", textDecoration: "none" }}>
                  {ar ? "كل المحفوظ بهالمتصفح ← ملفي" : "Everything saved in this browser → My profile"}
                </a>
              </form>
            ) : (
              <form onSubmit={adminGo} style={{ display: "grid", gap: 10 }}>
                <p style={{ margin: 0, fontSize: 12.5, color: "rgba(255,254,236,.7)", lineHeight: ar ? 1.8 : 1.55 }}>
                  {ar ? "للفريق — بتوديك على بوابة الإدارة." : "For the team — takes you into the admin portal."}
                </p>
                <input type="password" required value={pwd} onChange={(e) => setPwd(e.target.value)}
                       placeholder={ar ? "كلمة السر" : "Admin password"} aria-label={ar ? "كلمة السر" : "Admin password"}
                       autoComplete="current-password" style={field} />
                {adminErr && <p role="alert" style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: 12, color: "#FF7A4F" }}>✗ {adminErr}</p>}
                <button type="submit" disabled={busy}
                        style={{ minHeight: 46, cursor: busy ? "wait" : "pointer", fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700,
                                 background: "#EF5229", color: "#0F010A", border: 0, opacity: busy ? .6 : 1, ...cut(10) }}>
                  {busy ? "…" : ar ? "ادخل" : "Sign in"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function SiteHeader({
  ar, onToggleAr, ctaLabel, ctaHref, sound, onToggleSound,
}: {
  ar: boolean; onToggleAr: () => void; ctaLabel: string; ctaHref: string;
  sound: boolean; onToggleSound: () => void;
}) {
  const pathname = usePathname() || "/";
  const [cms] = useStore();
  const [scrolled, setScrolled] = React.useState(false);
  const [drawer, setDrawer] = React.useState(false);
  const [openAcc, setOpenAcc] = React.useState<string | null>(null);
  const [games, setGames] = React.useState(false);

  React.useEffect(() => {
    if (!games) return;
    const onDown = (e: PointerEvent) => { if (!(e.target as HTMLElement).closest(".mp-gameswrap")) setGames(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setGames(false); };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("pointerdown", onDown); document.removeEventListener("keydown", onKey); };
  }, [games]);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  React.useEffect(() => { setDrawer(false); setGames(false); }, [pathname]);

  return (
    <>
      <header style={{
        position: "fixed", insetInlineStart: 0, insetInlineEnd: 0, top: 0, zIndex: 60,
        background: scrolled ? "rgba(15,1,10,.9)" : "transparent",
        backdropFilter: scrolled ? "blur(14px) saturate(1.4)" : "none",
        transition: "background 300ms cubic-bezier(.16,1,.3,1)",
      }}>
        <div style={{ maxWidth: 1480, margin: "0 auto", padding: "12px clamp(20px,5vw,64px)", display: "flex", alignItems: "center", gap: "clamp(14px,2.4vw,30px)" }}>
          <a href="/" aria-label="MeetPixils — home" className="mp-logo" style={{ color: CREAM, textDecoration: "none", flex: "0 0 auto", display: "flex" }}>
            <MeetPixilsLogo height={38} />
          </a>

          <MotionNavigationMenu className="mp-nav" aria-label={ar ? "التنقل الرئيسي" : "Primary"}>
            <MotionNavigationMenuList style={{ display: "flex", gap: 2, listStyle: "none", margin: 0, padding: 0 }}>
              {NAV.map((n) => {
                const c = ar ? n.ar : n.en;
                const active = pathname === n.base || pathname.startsWith(n.base + "/");
                return (
                  <MotionNavigationMenuItem key={n.id} value={n.id}>
                    <MotionNavigationMenuTrigger
                      className={active ? "mp-trig on" : "mp-trig"}
                      style={{ background: "transparent", border: 0, cursor: "pointer",
                               fontFamily: ar ? "var(--font-arabic)" : "var(--font-sans)",
                               fontSize: 13.5, fontWeight: 500,
                               color: active ? "#FFFEEC" : "rgba(255,254,236,.84)",
                               padding: "8px 12px", whiteSpace: "nowrap", borderRadius: 0 }}
                    >
                      {c.label}
                    </MotionNavigationMenuTrigger>
                    <MotionNavigationMenuContent>
                      <div style={{ position: "relative", minWidth: 272, maxWidth: 340 }}>
                        <div aria-hidden="true" style={{
                          position: "absolute", inset: 0, background: "rgba(15,1,10,.42)",
                          backdropFilter: "blur(64px) saturate(1.9) brightness(.45)",
                          WebkitBackdropFilter: "blur(64px) saturate(1.9) brightness(.45)", ...cut(12),
                        }} />
                        <div style={{ position: "relative", padding: 8 }}>
                          <div style={{ ...mono, color: n.tint, padding: "8px 12px 10px", filter: "brightness(1.15)" }}>{c.label}</div>
                          {c.items.map(([label, href0]) => { const href = href0.startsWith("https://discord.gg") ? cms.settings.discord : href0; return (
                            <MotionNavigationMenuLink key={href} href={href}
                              {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                              {label}
                            </MotionNavigationMenuLink>
                          ); })}
                        </div>
                      </div>
                    </MotionNavigationMenuContent>
                  </MotionNavigationMenuItem>
                );
              })}
            </MotionNavigationMenuList>
          </MotionNavigationMenu>

          <div style={{ marginInlineStart: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            <button className="mp-burger mp-ghost" type="button" aria-expanded={drawer} aria-controls="mp-drawer"
                    aria-label={ar ? "القائمة" : "Menu"} onClick={() => setDrawer((v) => !v)}
                    style={{ ...ghost, padding: "9px 12px" }}>
              {drawer ? "✕" : "☰"}
            </button>
            <button onClick={onToggleSound} className="mp-ghost" aria-pressed={sound}
                    aria-label={ar ? (sound ? "إيقاف الصوت" : "تشغيل الصوت") : (sound ? "Sound off" : "Sound on")}
                    style={{ ...ghost, padding: "9px 12px", display: "inline-flex", alignItems: "center", gap: 7 }}>
              <span className={sound ? "mp-eq on" : "mp-eq"} aria-hidden="true"><i /><i /><i /></span>
              {ar ? "صوت" : "Sound"}
            </button>
            <div className="mp-gameswrap" style={{ position: "relative" }}>
              <button type="button" onClick={() => setGames((v) => !v)} className="mp-ghost"
                      aria-haspopup="menu" aria-expanded={games} aria-label={ar ? "الألعاب" : "Games"}
                      style={{ ...ghost, padding: "9px 12px", display: "inline-flex", alignItems: "center",
                               color: games ? "#FFFEEC" : undefined,
                               background: games ? "rgba(255,254,236,.1)" : undefined }}>
                <svg width="19" height="13" viewBox="0 0 19 13" fill="currentColor" aria-hidden="true" style={{ display: "block" }}>
                  <path d="M3.5 1h12l3 4.5V11l-2 2h-2.5l-2-2h-5l-2 2H2.5l-2-2V5.5Z" opacity=".32" />
                  <path d="M4.2 4.6h1.6V3h1.7v1.6h1.6v1.7H7.5v1.6H5.8V6.3H4.2Z" />
                  <rect x="12" y="3.4" width="2" height="2" />
                  <rect x="14.4" y="5.8" width="2" height="2" />
                </svg>
              </button>
              {games && (
                <div role="menu" aria-label={ar ? "بكسل أركيد" : "Pixel Arcade"}
                     style={{ position: "absolute", top: "calc(100% + 12px)", insetInlineEnd: 0, minWidth: 244, zIndex: 70 }}>
                  <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "rgba(15,1,10,.42)",
                        backdropFilter: "blur(64px) saturate(1.9) brightness(.45)",
                        WebkitBackdropFilter: "blur(64px) saturate(1.9) brightness(.45)", ...cut(12) }} />
                  <div style={{ position: "relative", padding: 8 }}>
                    <div style={{ ...mono, color: ORANGE, padding: "8px 12px 10px", filter: "brightness(1.15)" }}>
                      {ar ? "بكسل أركيد" : "Pixel arcade"}
                    </div>
                    {GAMES.map((g) => {
                      const c = ar ? g.ar : g.en;
                      return (
                        <a key={g.id} href={g.href} role="menuitem" className="mp-gameitem" onClick={() => setGames(false)}>
                          <span aria-hidden="true" style={{ width: 8, height: 8, background: g.tint, flex: "0 0 auto" }} />
                          <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            <span>{c.name}</span>
                            <span style={{ fontSize: 11.5, opacity: .55 }}>{c.tag}</span>
                          </span>
                        </a>
                      );
                    })}
                    <a href="/play" role="menuitem" className="mp-gameitem" onClick={() => setGames(false)}
                       style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, letterSpacing: ".08em", textTransform: "uppercase" }}>
                      {ar ? "كل الألعاب ←" : "All games →"}
                    </a>
                  </div>
                </div>
              )}
            </div>
            <SignInMenu ar={ar} ghost={ghost} />
            <button onClick={onToggleAr} className="mp-ghost" style={ghost}>{ar ? "EN" : "عربي"}</button>
            <a href={ctaHref} className="mp-btn"
               style={{ ["--wipe" as string]: CREAM, ["--wipe-fg" as string]: PLUM900, ["--ring" as string]: CREAM,
                        background: ORANGE, color: PLUM900, fontFamily: "var(--font-mono)", fontSize: 12,
                        fontWeight: 700, letterSpacing: ".02em", padding: "12px 20px",
                        textDecoration: "none", whiteSpace: "nowrap", ...cut(10) }}>
              {ctaLabel}
            </a>
          </div>
        </div>
      </header>

      {drawer && (
        <div id="mp-drawer" className="mp-drawer"
             style={{ position: "fixed", inset: 0, zIndex: 55, background: "rgba(15,1,10,.44)",
                      backdropFilter: "blur(64px) saturate(1.9) brightness(.45)",
                      WebkitBackdropFilter: "blur(64px) saturate(1.9) brightness(.45)",
                      paddingTop: 74, overflowY: "auto" }}>
          <nav aria-label={ar ? "التنقل الرئيسي" : "Primary"} style={{ padding: "8px clamp(20px,5vw,44px) 40px" }}>
            {NAV.map((n) => {
              const c = ar ? n.ar : n.en;
              const open = openAcc === n.id;
              return (
                <div key={n.id} style={{ background: open ? "rgba(255,254,236,.05)" : "transparent",
                                         transition: "background 240ms cubic-bezier(.16,1,.3,1)",
                                         ...(open ? cut(12) : {}), marginBottom: 2 }}>
                  <button type="button" aria-expanded={open} className="mp-acc"
                          onClick={() => setOpenAcc(open ? null : n.id)}
                          style={{ width: "100%", minHeight: 56, display: "flex", alignItems: "center",
                                   justifyContent: "space-between", gap: 12, background: "none", border: 0,
                                   color: CREAM, fontFamily: "inherit", fontSize: 17, fontWeight: 650,
                                   padding: "8px 14px", cursor: "pointer", textAlign: ar ? "right" : "left" }}>
                    {c.label}
                    <span aria-hidden="true" style={{ color: n.tint, transition: "transform 250ms cubic-bezier(.16,1,.3,1)",
                                                      transform: open ? "rotate(45deg)" : "none", fontSize: 20, lineHeight: 1 }}>+</span>
                  </button>
                  {open && (
                    <div style={{ paddingBottom: 10 }}>
                      {c.items.map(([label, href0]) => { const href = href0.startsWith("https://discord.gg") ? cms.settings.discord : href0; return (
                        <a key={href} href={href} className="mp-drawerlink" onClick={() => setDrawer(false)}
                           {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                           style={{ display: "flex", alignItems: "center", minHeight: 48, padding: "10px 14px",
                                    fontSize: 14.5, color: "rgba(255,254,236,.88)", textDecoration: "none" }}>
                          {label}
                        </a>
                      ); })}
                    </div>
                  )}
                </div>
              );
            })}
            <div style={{ background: openAcc === "games" ? "rgba(255,254,236,.05)" : "transparent",
                          transition: "background 240ms cubic-bezier(.16,1,.3,1)",
                          ...(openAcc === "games" ? cut(12) : {}), marginBottom: 2 }}>
              <button type="button" aria-expanded={openAcc === "games"} className="mp-acc"
                      onClick={() => setOpenAcc(openAcc === "games" ? null : "games")}
                      style={{ width: "100%", minHeight: 56, display: "flex", alignItems: "center",
                               justifyContent: "space-between", gap: 12, background: "none", border: 0,
                               color: CREAM, fontFamily: "inherit", fontSize: 17, fontWeight: 650,
                               padding: "8px 14px", cursor: "pointer", textAlign: ar ? "right" : "left" }}>
                {ar ? "بكسل أركيد" : "Pixel Arcade"}
                <span aria-hidden="true" style={{ color: ORANGE, transition: "transform 250ms cubic-bezier(.16,1,.3,1)",
                                                  transform: openAcc === "games" ? "rotate(45deg)" : "none", fontSize: 20, lineHeight: 1 }}>+</span>
              </button>
              {openAcc === "games" && (
                <div style={{ paddingBottom: 10 }}>
                  {[...GAMES.map((g) => [ar ? g.ar.name : g.en.name, g.href] as [string, string]), [ar ? "كل الألعاب" : "All games", "/play"] as [string, string]].map(([label, href]) => (
                    <a key={href} href={href} onClick={() => setDrawer(false)} className="mp-drawerlink"
                       style={{ display: "flex", alignItems: "center", minHeight: 48, padding: "6px 14px 6px 22px",
                                fontSize: 14.5, color: "rgba(255,254,236,.88)", textDecoration: "none" }}>
                      {label}
                    </a>
                  ))}
                </div>
              )}
            </div>
            <a href={ctaHref} onClick={() => setDrawer(false)} className="mp-btn"
               style={{ ["--wipe" as string]: CREAM, ["--wipe-fg" as string]: PLUM900,
                        display: "flex", justifyContent: "center", marginTop: 26, background: ORANGE,
                        color: PLUM900, fontFamily: "var(--font-mono)", fontSize: 13.5, fontWeight: 700,
                        padding: "17px 24px", textDecoration: "none", ...cut(12) }}>
              {ctaLabel}
            </a>
          </nav>
        </div>
      )}

      <style>{`
        .mp-logo { transition: transform .3s cubic-bezier(.16,1,.3,1) }
        .mp-logo:hover { transform: translateY(-1px) }
        .mp-trig { position: relative }
        .mp-trig::after {
          content: ""; position: absolute; inset-inline: 12px; bottom: 2px; height: 2px;
          background: #FF7A4F; transform: scaleX(0); transform-origin: var(--uo, left);
          transition: transform .35s cubic-bezier(.16,1,.3,1);
        }
        .mp-trig.on::after, .mp-trig:hover::after { transform: scaleX(1) }
        [dir="rtl"] .mp-trig::after { --uo: right }
        .mp-eq { display: inline-flex; align-items: flex-end; gap: 2px; height: 11px }
        .mp-eq i { width: 2.5px; background: currentColor; height: 4px; opacity: .5 }
        .mp-eq.on i { opacity: 1; animation: mpeq 1s ease-in-out infinite }
        .mp-eq.on i:nth-child(2) { animation-delay: .18s }
        .mp-eq.on i:nth-child(3) { animation-delay: .36s }
        @keyframes mpeq { 0%,100% { height: 4px } 50% { height: 11px } }
        .mp-nav [data-slot="navigation-menu-viewport"] {
          background: transparent !important; border: 0 !important;
          box-shadow: none !important; border-radius: 0 !important; overflow: visible !important;
          padding-top: 12px; margin-top: -12px;
        }
        .mp-nav [data-slot="navigation-menu-list"] { padding-bottom: 6px; margin-bottom: -6px }
        /* Unlumen highlight pill ships bg-accent (near-white) — invisible under cream text.
           Re-skin to frosted cream on the dark header, chamfered per the button vocabulary. */
        .mp-nav [data-slot="motion-highlight"] {
          background: rgba(255,254,236,.12) !important;
          border-radius: 0 !important;
          clip-path: polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px);
        }
        .mp-nav [data-slot="navigation-menu-trigger"]:hover,
        .mp-nav [data-slot="navigation-menu-trigger"][data-state="open"] { color: #FFFEEC !important }
        .mp-nav [data-slot="navigation-menu-trigger"]:focus-visible { outline: 2px solid #FF7A4F; outline-offset: 2px }
        .mp-nav [data-slot="navigation-menu-viewport"] a {
          display: flex; align-items: center; min-height: 46px; box-sizing: border-box;
          padding: 11px 12px; font-size: 13.5px; line-height: 1.35;
          color: rgba(255,254,236,.92); text-decoration: none;
          transition: background 150ms cubic-bezier(.16,1,.3,1), color 150ms, padding-inline-start 200ms cubic-bezier(.16,1,.3,1);
        }
        .mp-nav [data-slot="navigation-menu-viewport"] a:hover { background: rgba(255,254,236,.09); color: #FFFEEC; padding-inline-start: 17px }
        .mp-nav [data-slot="navigation-menu-viewport"] a:focus-visible {
          outline: 2px solid #FF7A4F; outline-offset: -2px; background: rgba(255,254,236,.09); color: #FFFEEC;
        }
        .mp-acc:focus-visible, .mp-drawerlink:focus-visible {
          outline: 2px solid #FF7A4F; outline-offset: -2px; background: rgba(255,254,236,.09);
        }
        .mp-gameitem {
          display: flex; align-items: center; gap: 12; min-height: 46px;
          padding: 10px 12px; font-size: 13.5px; text-decoration: none;
          color: rgba(255,254,236,.92); gap: 12px;
          transition: background 150ms, color 150ms, padding-inline-start 150ms;
        }
        .mp-gameitem:hover { background: rgba(255,254,236,.09); color: #FFFEEC; padding-inline-start: 15px }
        .mp-gameitem:focus-visible { outline: 2px solid #FF7A4F; outline-offset: -2px }
        @media (max-width: 859px) { .mp-gameswrap { display: none } .mp-si-label { display: none } }
        .mp-drawerlink { transition: background 150ms, color 150ms }
        .mp-drawerlink:hover { background: rgba(255,254,236,.09); color: #FFFEEC }
        .mp-ghost { transition: background 220ms cubic-bezier(.16,1,.3,1), color 220ms, border-color 220ms, transform 180ms }
        .mp-ghost:hover { background: rgba(255,254,236,.1); color: #FFFEEC; border-color: rgba(255,254,236,.55) }
        .mp-ghost:active { transform: translateY(1px) }
        .mp-ghost:focus-visible { outline: 2px solid #FF7A4F; outline-offset: 2px }
        .mp-burger { display: none }
        @media (max-width: 860px) {
          .mp-nav { display: none }
          .mp-burger { display: inline-flex !important; align-items: center; justify-content: center }
        }
        @media (min-width: 861px) { .mp-drawer { display: none } }
        @media (prefers-reduced-motion: reduce) {
          .mp-ghost, .mp-drawerlink, .mp-trig::after, .mp-logo { transition: none }
          .mp-eq.on i { animation: none }
          .mp-ghost:active { transform: none }
        }
      `}</style>
    </>
  );
}
