"use client";

import * as React from "react";
import { mono, cut, ORANGE, LILAC, CYAN, PERI, CREAM, PLUM900 } from "@/lib/ui";
import { useStore, resetStore, publishStore, fetchEntries, hasDraft, Status, CObj, ObjType, Store } from "@/lib/content";

/**
 * Admin — T6 utility (Playbook §07): dense, functional, no ambient, no pitch.
 *
 * Edits are a draft in this browser (instant preview via the status engine, IA §09:
 * hero, header CTA and listings all re-rank live). "Publish" pushes the draft to the
 * PHP backend (api/content.php) so every visitor sees it — password lives in
 * api/config.php on the server. Submissions load from api/entries.php the same way.
 */

const STATUSES: Status[] = ["closing-soon", "open", "upcoming", "results-out", "closed"];
const inp: React.CSSProperties = {
  fontFamily: "var(--font-mono)", fontSize: 12.5, padding: "9px 11px", minHeight: 38,
  background: "rgba(255,254,236,.05)", color: CREAM,
  border: "1px solid rgba(255,254,236,.22)", borderRadius: 0, outline: "none",
};

export default function Admin() {
  const [store, update] = useStore();
  const [flash, setFlash] = React.useState<string | null>(null);
  const [pw, setPw] = React.useState("");
  const [authed, setAuthed] = React.useState<null | boolean>(null); // null = checking saved session
  const [role, setRole] = React.useState<string>("super");

  React.useEffect(() => {
    const saved = sessionStorage.getItem("mp-admin-pw");
    if (!saved) { setAuthed(false); return; }
    // re-verify the saved session against the server; keep working offline (preview)
    fetch("/api/whoami.php", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: saved }), cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((j: { role?: string }) => {
        if (!j.role) throw 401;
        sessionStorage.setItem("mp-admin-role", j.role);
        setPw(saved); setRole(j.role); setAuthed(true);
      })
      .catch((e) => {
        if (e === 401) { sessionStorage.removeItem("mp-admin-pw"); sessionStorage.removeItem("mp-admin-role"); setAuthed(false); }
        else { setPw(saved); setRole(sessionStorage.getItem("mp-admin-role") || "super"); setAuthed(true); } // offline preview
      });
  }, []);

  const signOut = () => { sessionStorage.removeItem("mp-admin-pw"); sessionStorage.removeItem("mp-admin-role"); setPw(""); setAuthed(false); };
  const [tab, setTabRaw] = React.useState<"overview" | "events" | "subs" | "site" | "judging">("overview");
  React.useEffect(() => {
    const t = sessionStorage.getItem("mp-admin-tab");
    if (t === "events" || t === "subs" || t === "site" || t === "judging") setTabRaw(t);
  }, []);
  const setTab = (t: "overview" | "events" | "subs" | "site" | "judging") => { setTabRaw(t); try { sessionStorage.setItem("mp-admin-tab", t); } catch {} };
  const [pubMsg, setPubMsg] = React.useState<string | null>(null);
  const doPublish = async () => {
    if (!pw) { setPubMsg("✗ preview session — sign in on the live site to publish"); return; }
    setPubMsg("publishing…");
    const r = await publishStore(pw);
    setPubMsg(r.ok ? "✓ live — every visitor sees this now" : `✗ ${r.error}`);
  };
  const ping = (id: string) => { setFlash(id); window.setTimeout(() => setFlash(null), 700); };

  const [expanded, setExpanded] = React.useState<string | null>(null);
  const setObj = (id: string, patch: Partial<CObj>) => {
    update((s) => ({ ...s, objects: s.objects.map((o) => (o.id === id ? { ...o, ...patch } : o)) }));
    ping(id);
  };
  const delObj = (id: string) => {
    update((s) => ({ ...s, objects: s.objects.filter((o) => o.id !== id) }));
    setExpanded(null); ping("reset");
  };
  const addObj = (o: CObj) => {
    update((s) => ({ ...s, objects: [...s.objects, s.objects.some((x) => x.id === o.id) ? { ...o, id: o.id + "-2" } : o] }));
    ping(o.id);
  };
  const addFace = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    update((s) => ({ ...s, faces: [...s.faces, { name: String(fd.get("name")), role: String(fd.get("role")), proof: "" }] }));
    e.currentTarget.reset(); ping("faces");
  };
  const addWork = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    update((s) => ({ ...s, works: [...s.works, { title: String(fd.get("title")), team: String(fd.get("team")), src: "Khedmetak 2026", tint: ORANGE }] }));
    e.currentTarget.reset(); ping("works");
  };

  if (authed === null) {
    return <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}><span style={{ ...mono, opacity: .5 }}>…</span></div>;
  }
  if (!authed) {
    return <SignIn onAuth={(p, r, preview) => {
      if (!preview) { sessionStorage.setItem("mp-admin-pw", p); sessionStorage.setItem("mp-admin-role", r); }
      setPw(p); setRole(r); setAuthed(true);
      if (r === "judge") setTab("judging");
      if (r === "moderator") setTab("subs");
    }} />;
  }

  return (
    <div style={{ minHeight: "100vh", padding: "34px clamp(16px,4vw,48px) 80px" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(15,1,10,.92)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16, margin: "0 0 8px", padding: "12px 0", borderBottom: "1px solid rgba(255,254,236,.1)" }}>
        <a href="/" className="u-link" style={{ ...mono, color: ORANGE, textDecoration: "none" }}>← MeetPixils</a>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: "-.02em" }}>Admin</h1>
        <span style={{ ...mono, fontSize: 10.5, padding: "5px 10px", background: role === "super" ? ORANGE : role === "moderator" ? CYAN : LILAC, color: PLUM900, fontWeight: 700, ...cut(6) }}>
          {role === "super" ? "SUPER ADMIN" : role.toUpperCase()}
        </span>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginInlineStart: "auto" }}>
          {role === "super" && (
          <button onClick={doPublish} className="mp-ghost"
                  style={{ ...inp, cursor: "pointer", background: ORANGE, color: PLUM900, fontWeight: 700, border: 0 }}>
            {hasDraft() ? "● Publish draft" : "Publish to site"}
          </button>
          )}
          {role === "super" && (
          <button onClick={() => { resetStore(); ping("reset"); }} className="mp-ghost"
                  style={{ ...inp, cursor: "pointer" }}>
            Discard draft
          </button>
          )}
          <button onClick={signOut} className="mp-ghost" style={{ ...inp, cursor: "pointer", opacity: .75 }}>
            Sign out
          </button>
        </div>
      </header>
      {pubMsg && (
        <p role="status" style={{ ...mono, margin: "0 0 10px", color: pubMsg.startsWith("✓") ? "#5FD39A" : ORANGE }}>
          {pubMsg}
        </p>
      )}
      <nav aria-label="Admin sections" style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "14px 0 24px" }}>
        {([["overview", "Overview"], ["events", "Events"], ["subs", "Submissions"], ["site", "Site"], ["judging", "Judging"]] as const)
          .filter(([id]) =>
            role === "super" ? true :
            role === "moderator" ? id === "overview" || id === "subs" :
            id === "judging")
          .map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} aria-current={tab === id ? "page" : undefined}
                  style={{ ...inp, cursor: "pointer", minHeight: 42, padding: "8px 18px", fontWeight: 700,
                           background: tab === id ? CYAN : "rgba(255,254,236,.05)",
                           color: tab === id ? PLUM900 : CREAM, border: tab === id ? 0 : inp.border }}>
            {label}
          </button>
        ))}
      </nav>
      <p style={{ ...mono, opacity: .55, margin: "0 0 26px", maxWidth: "78ch", lineHeight: 1.8 }}>
        Edits are a draft in this browser first — preview the whole site with them, then
        <strong> Publish</strong> makes them live for everyone. Discard returns to the published version.
      </p>

      {tab === "overview" && <Overview pw={pw} store={store} goto={setTab} role={role} />}

      {tab === "site" && <SiteSettings store={store} update={update} ping={ping} />}

      {tab === "events" && <>
      {/* ---- objects ---- */}
      <section style={{ marginBottom: 44 }}>
        <h2 style={h2}>Objects <span style={{ ...mono, opacity: .5 }}>· status drives everything</span></h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 780 }}>
            <thead><tr>
              {["Title (EN)", "Type", "Status", "Deadline", "Arm", ""].map((h) => (
                <th key={h} style={{ ...mono, textAlign: "start", padding: "8px 10px", borderBottom: "1px solid rgba(255,254,236,.3)", color: CYAN }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {store.objects.map((o) => (
                <React.Fragment key={o.id}>
                  <tr style={{ background: flash === o.id ? "rgba(239,82,41,.14)" : "transparent", transition: "background .5s" }}>
                    <td style={td}>
                      <input defaultValue={o.en.t} onBlur={(e) => { const v = e.target.value.trim(); if (v) setObj(o.id, { en: { ...o.en, t: v } }); else e.target.value = o.en.t; }}
                             className="px-input" style={{ ...inp, width: "100%", minWidth: 240 }} aria-label={`Title of ${o.id}`} />
                    </td>
                    <td style={{ ...td, fontFamily: "var(--font-mono)", fontSize: 12, opacity: .6 }}>{o.type}</td>
                    <td style={td}>
                      <select value={o.status} onChange={(e) => setObj(o.id, { status: e.target.value as Status })}
                              className="px-input" style={{ ...inp, cursor: "pointer" }} aria-label={`Status of ${o.id}`}>
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td style={td}>
                      <input type="datetime-local" defaultValue={o.due ? o.due.slice(0, 16) : ""}
                             onBlur={(e) => setObj(o.id, { due: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                             className="px-input" style={inp} aria-label={`Deadline of ${o.id}`} />
                    </td>
                    <td style={{ ...td, fontFamily: "var(--font-mono)", fontSize: 11, color: o.tint }}>{o.arm}</td>
                    <td style={td}>
                      <button onClick={() => setExpanded(expanded === o.id ? null : o.id)} aria-expanded={expanded === o.id}
                              aria-label={`Edit all fields of ${o.id}`}
                              style={{ ...inp, minHeight: 32, padding: "4px 12px", cursor: "pointer",
                                       color: expanded === o.id ? PLUM900 : CREAM,
                                       background: expanded === o.id ? CYAN : "rgba(255,254,236,.05)" }}>
                        {expanded === o.id ? "close" : "edit ▾"}
                      </button>
                    </td>
                  </tr>
                  {expanded === o.id && (
                    <tr><td colSpan={6} style={{ padding: 0 }}>
                      <ObjEditor o={o} onPatch={(patch) => setObj(o.id, patch)} onDelete={() => delObj(o.id)} />
                    </td></tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        <AddObject onAdd={addObj} />
        <p style={{ ...mono, opacity: .45, margin: "12px 0 0", maxWidth: "78ch", lineHeight: 1.7 }}>
          New objects get their page at /whats-on/&lt;slug&gt; (or /compete/&lt;slug&gt; for competitions) the moment
          you publish — listings, homepage and menus pick them up automatically.
        </p>
      </section>

      {/* ---- gates ---- */}
      <section style={{ display: "grid", gap: 24, gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", marginBottom: 44 }}>
        <div style={{ border: "1px solid rgba(255,254,236,.16)", padding: "20px 22px", ...cut(12), background: flash === "faces" ? "rgba(239,82,41,.1)" : "transparent", transition: "background .5s" }}>
          <h2 style={h2}>Faces <span style={{ ...mono, color: store.faces.length >= 4 ? "#5FD39A" : ORANGE }}>
            {store.faces.length}/4 — roster {store.faces.length >= 4 ? "LIVE" : "gated"}</span></h2>
          {store.faces.map((f, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "6px 0", fontSize: 13.5 }}>
              <span style={{ flex: 1 }}>{f.name} · <span style={{ opacity: .6 }}>{f.role}</span></span>
              <button onClick={() => { update((s) => ({ ...s, faces: s.faces.filter((_, j) => j !== i) })); ping("faces"); }}
                      style={{ ...inp, minHeight: 30, padding: "4px 10px", cursor: "pointer" }} aria-label={`Remove ${f.name}`}>✕</button>
            </div>
          ))}
          <form onSubmit={addFace} style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
            <input name="name" required placeholder="Name" className="px-input" style={{ ...inp, flex: 1, minWidth: 120 }} />
            <input name="role" required placeholder="Role" className="px-input" style={{ ...inp, flex: 1, minWidth: 120 }} />
            <button type="submit" style={{ ...inp, cursor: "pointer", background: LILAC, color: PLUM900, fontWeight: 700, border: 0 }}>Add</button>
          </form>
        </div>
        <div style={{ border: "1px solid rgba(255,254,236,.16)", padding: "20px 22px", ...cut(12), background: flash === "works" ? "rgba(239,82,41,.1)" : "transparent", transition: "background .5s" }}>
          <h2 style={h2}>Works <span style={{ ...mono, color: store.works.length >= 12 ? "#5FD39A" : ORANGE }}>
            {store.works.length}/12 — showcase {store.works.length >= 12 ? "FULL" : "partial"}</span></h2>
          {store.works.map((w, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "6px 0", fontSize: 13.5 }}>
              <span style={{ flex: 1 }}>{w.title} · <span style={{ opacity: .6 }}>{w.team}</span></span>
              <button onClick={() => { update((s) => ({ ...s, works: s.works.filter((_, j) => j !== i) })); ping("works"); }}
                      style={{ ...inp, minHeight: 30, padding: "4px 10px", cursor: "pointer" }} aria-label={`Remove ${w.title}`}>✕</button>
            </div>
          ))}
          <form onSubmit={addWork} style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
            <input name="title" required placeholder="Project title" className="px-input" style={{ ...inp, flex: 1, minWidth: 140 }} />
            <input name="team" required placeholder="Team" className="px-input" style={{ ...inp, flex: 1, minWidth: 100 }} />
            <button type="submit" style={{ ...inp, cursor: "pointer", background: PERI, color: PLUM900, fontWeight: 700, border: 0 }}>Add</button>
          </form>
        </div>
      </section>

      </>}

      {tab === "judging" && <JudgePanel pw={pw} store={store} judgeName={role === "judge"} />}

      {tab === "subs" && (
      <section>
        <h2 style={h2}>Submissions <span style={{ ...mono, opacity: .5 }}>· tickets · donations · forms</span></h2>
        <Entries pw={pw} />
      </section>
      )}
      <style>{`.px-input:focus { border-color: ${CYAN}; box-shadow: 0 0 0 3px rgba(46,190,239,.22) }`}</style>
    </div>
  );
}
function SignIn({ onAuth }: { onAuth: (pw: string, role: string, preview?: boolean) => void }) {
  const [val, setVal] = React.useState("");
  const [err, setErr] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [offline, setOffline] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!val) return;
    setBusy(true); setErr(null);
    try {
      const r = await fetch("/api/whoami.php", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: val }), cache: "no-store" });
      if (r.status === 401) { setErr("Wrong password."); setBusy(false); return; }
      if (!r.ok) { setErr(`Server said HTTP ${r.status} — try again.`); setBusy(false); return; }
      const j: { role?: string } = await r.json().catch(() => ({}));
      onAuth(val, j.role || "super");
    } catch {
      setOffline(true); setBusy(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <form onSubmit={submit} style={{ width: "min(360px, 92vw)", border: "1px solid rgba(255,254,236,.2)", padding: "34px 30px", display: "grid", gap: 16, ...cut(16) }}>
        <div>
          <div style={{ ...mono, color: ORANGE, marginBottom: 6 }}>MEETPIXILS · ADMIN</div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: "-.02em" }}>Sign in</h1>
        </div>
        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ ...mono, opacity: .55 }}>Admin password</span>
          <input type="password" value={val} onChange={(e) => setVal(e.target.value)} autoFocus
                 autoComplete="current-password" className="px-input" style={{ ...inp, width: "100%" }} />
        </label>
        {err && <p role="alert" style={{ ...mono, color: "#FF7A4F", margin: 0 }}>✗ {err}</p>}
        {offline && (
          <div style={{ display: "grid", gap: 10 }}>
            <p style={{ ...mono, color: ORANGE, margin: 0, lineHeight: 1.7 }}>
              Server unreachable — you seem to be on a local preview.
            </p>
            <button type="button" onClick={() => onAuth("", "super", true)}
                    style={{ ...inp, cursor: "pointer" }}>
              Continue in preview mode (drafts only)
            </button>
          </div>
        )}
        <button type="submit" disabled={busy}
                style={{ ...inp, cursor: busy ? "wait" : "pointer", background: ORANGE, color: PLUM900, fontWeight: 700, border: 0, opacity: busy ? .6 : 1 }}>
          {busy ? "Checking…" : "Sign in"}
        </button>
        <p style={{ ...mono, opacity: .4, margin: 0, lineHeight: 1.7 }}>
          The password is set in api/config.php on the server.
        </p>
      </form>
    </div>
  );
}

const ARMS: [string, string][] = [
  ["meetpixils", ORANGE], ["meetbattle", LILAC], ["meetexperience", CYAN],
  ["meetacademy", PERI], ["meetbrands", "#6B3050"],
];
const TYPES: ObjType[] = ["Event", "Competition", "Program"];
const FORMATS = ["In person", "Online", "Hybrid"];
const slugify = (t: string) =>
  t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48) || "event";

function ObjEditor({ o, onPatch, onDelete }: {
  o: CObj; onPatch: (patch: Partial<CObj>) => void; onDelete: () => void;
}) {
  const L = (side: "en" | "ar", key: keyof CObj["en"], label: string) => (
    <label style={{ display: "grid", gap: 4 }}>
      <span style={{ ...mono, opacity: .5, fontSize: 10.5 }}>{label}</span>
      <input defaultValue={o[side][key]} dir={side === "ar" ? "rtl" : "ltr"}
             onBlur={(e) => { const v = e.target.value; if (key === "t" && !v.trim()) { e.target.value = o[side][key]; return; } onPatch({ [side]: { ...o[side], [key]: v } } as Partial<CObj>); }}
             className="px-input" style={{ ...inp, width: "100%" }} />
    </label>
  );
  const Sel = ({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) => (
    <label style={{ display: "grid", gap: 4 }}>
      <span style={{ ...mono, opacity: .5, fontSize: 10.5 }}>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="px-input" style={{ ...inp, cursor: "pointer" }}>
        {options.map((x) => <option key={x} value={x}>{x}</option>)}
      </select>
    </label>
  );
  const Txt = ({ label, value, onCommit }: { label: string; value: string; onCommit: (v: string) => void }) => (
    <label style={{ display: "grid", gap: 4 }}>
      <span style={{ ...mono, opacity: .5, fontSize: 10.5 }}>{label}</span>
      <input defaultValue={value} onBlur={(e) => onCommit(e.target.value)} className="px-input" style={{ ...inp, width: "100%" }} />
    </label>
  );
  return (
    <div style={{ display: "grid", gap: 14, padding: "16px 12px 20px", borderBottom: "1px solid rgba(255,254,236,.14)", background: "rgba(255,254,236,.03)" }}>
      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}>
        {L("en", "t", "Title EN")}{L("ar", "t", "العنوان AR")}
        {L("en", "d", "Dek EN")}{L("ar", "d", "الوصف AR")}
        {L("en", "when", "When EN (e.g. 12 Oct)")}{L("ar", "when", "متى AR")}
        {L("en", "cta", "CTA EN")}{L("ar", "cta", "زر AR")}
      </div>
      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))" }}>
        <Sel label="Type" value={o.type} options={TYPES} onChange={(v) => onPatch({ type: v as ObjType })} />
        <Sel label="Arm (sets colour)" value={o.arm} options={ARMS.map(([a]) => a)}
             onChange={(v) => onPatch({ arm: v, tint: ARMS.find(([a]) => a === v)?.[1] ?? o.tint })} />
        <Sel label="Format" value={o.format} options={FORMATS}
             onChange={(v) => onPatch({ format: v, city: v === "Online" ? "Online" : o.city === "Online" ? "Amman" : o.city })} />
        <Txt label="City" value={o.city} onCommit={(v) => onPatch({ city: v })} />
        <Txt label="Discipline" value={o.discipline} onCommit={(v) => onPatch({ discipline: v })} />
        <Txt label="Level" value={o.level} onCommit={(v) => onPatch({ level: v })} />
        <label style={{ display: "flex", gap: 8, alignItems: "center", ...mono, fontSize: 11.5, opacity: .8, paddingTop: 18 }}>
          <input type="checkbox" checked={!!o.workshop} onChange={(e) => onPatch({ workshop: e.target.checked || undefined })} />
          workshop
        </label>
      </div>
      <div>
        <button onClick={() => { if (window.confirm(`Delete “${o.en.t}”? This can't be undone after publishing.`)) onDelete(); }}
                style={{ ...inp, cursor: "pointer", color: "#FF7A4F", borderColor: "rgba(255,122,79,.5)" }}>
          Delete this object
        </button>
      </div>
    </div>
  );
}

function AddObject({ onAdd }: { onAdd: (o: CObj) => void }) {
  const [open, setOpen] = React.useState(false);
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const tEn = String(fd.get("t_en") || "").trim();
    if (!tEn) return;
    const arm = String(fd.get("arm") || "meetexperience");
    const due = String(fd.get("due") || "");
    const o: CObj = {
      id: slugify(String(fd.get("id") || "") || tEn),
      type: String(fd.get("type")) as ObjType,
      arm, tint: ARMS.find(([a]) => a === arm)?.[1] ?? ORANGE,
      status: String(fd.get("status")) as Status,
      due: due ? new Date(due).toISOString() : undefined,
      discipline: String(fd.get("discipline") || "All"),
      level: String(fd.get("level") || "All levels"),
      format: String(fd.get("format") || "In person"),
      city: String(fd.get("format")) === "Online" ? "Online" : String(fd.get("city") || "Amman"),
      workshop: fd.get("workshop") ? true : undefined,
      en: { t: tEn, d: String(fd.get("d_en") || ""), when: String(fd.get("when_en") || "TBA"), cta: String(fd.get("cta_en") || "Notify me") },
      ar: { t: String(fd.get("t_ar") || "") || tEn, d: String(fd.get("d_ar") || "") || String(fd.get("d_en") || ""),
            when: String(fd.get("when_ar") || "") || String(fd.get("when_en") || "قريباً"), cta: String(fd.get("cta_ar") || "ذكّرني") },
    };
    onAdd(o);
    e.currentTarget.reset();
    setOpen(false);
  };
  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
              style={{ ...inp, cursor: "pointer", background: ORANGE, color: PLUM900, fontWeight: 700, border: 0, marginTop: 12 }}>
        + Add event / competition / program
      </button>
    );
  }
  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 14, border: "1px solid rgba(255,254,236,.2)", padding: "20px 22px", marginTop: 14, ...cut(12) }}>
      <strong style={{ fontSize: 15 }}>New object <span style={{ ...mono, opacity: .5 }}>· appears everywhere once published</span></strong>
      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))" }}>
        <input name="t_en" required placeholder="Title (EN) *" className="px-input" style={inp} />
        <input name="t_ar" placeholder="العنوان (AR)" dir="rtl" className="px-input" style={inp} />
        <input name="d_en" placeholder="One-line description (EN)" className="px-input" style={inp} />
        <input name="d_ar" placeholder="الوصف (AR)" dir="rtl" className="px-input" style={inp} />
        <input name="when_en" placeholder="When, human (e.g. 12 Oct · The ARC)" className="px-input" style={inp} />
        <input name="when_ar" placeholder="متى (AR)" dir="rtl" className="px-input" style={inp} />
        <input name="cta_en" placeholder="Button label (EN), e.g. RSVP" className="px-input" style={inp} />
        <input name="cta_ar" placeholder="نص الزر (AR)" dir="rtl" className="px-input" style={inp} />
      </div>
      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))" }}>
        <select name="type" className="px-input" style={{ ...inp, cursor: "pointer" }}>{TYPES.map((t) => <option key={t}>{t}</option>)}</select>
        <select name="arm" className="px-input" style={{ ...inp, cursor: "pointer" }}>{ARMS.map(([a]) => <option key={a}>{a}</option>)}</select>
        <select name="status" defaultValue="upcoming" className="px-input" style={{ ...inp, cursor: "pointer" }}>{STATUSES.map((st) => <option key={st}>{st}</option>)}</select>
        <select name="format" className="px-input" style={{ ...inp, cursor: "pointer" }}>{FORMATS.map((f) => <option key={f}>{f}</option>)}</select>
        <input name="city" placeholder="City (Amman)" className="px-input" style={inp} />
        <input name="discipline" placeholder="Discipline (All)" className="px-input" style={inp} />
        <input name="level" placeholder="Level (All levels)" className="px-input" style={inp} />
        <input name="due" type="datetime-local" aria-label="Deadline / date" className="px-input" style={inp} />
        <input name="id" placeholder="URL slug (auto)" className="px-input" style={inp} />
        <label style={{ display: "flex", gap: 8, alignItems: "center", ...mono, fontSize: 11.5, opacity: .8 }}>
          <input type="checkbox" name="workshop" /> workshop
        </label>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button type="submit" style={{ ...inp, cursor: "pointer", background: ORANGE, color: PLUM900, fontWeight: 700, border: 0 }}>Add as draft</button>
        <button type="button" onClick={() => setOpen(false)} style={{ ...inp, cursor: "pointer" }}>Cancel</button>
      </div>
    </form>
  );
}

const CRITERIA: [string, number][] = [
  ["Research & framing", 25], ["Journey & interaction", 25], ["Craft & visual quality", 25],
  ["Story & presentation", 15], ["Feasibility", 10],
];

function JudgePanel({ pw, store, judgeName }: { pw: string; store: Store; judgeName: boolean }) {
  const comps = store.objects.filter((o) => o.type === "Competition");
  const [name, setName] = React.useState("");
  const [comp, setComp] = React.useState(comps[0]?.id ?? "");
  const [team, setTeam] = React.useState("");
  const [scores, setScores] = React.useState<number[]>(CRITERIA.map(() => 5));
  const [note, setNote] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [msg, setMsg] = React.useState<string | null>(null);
  const [mine, setMine] = React.useState<{ team: string; total: string }[]>([]);
  React.useEffect(() => { try { setName(localStorage.getItem("mp-judge-name") || ""); } catch {} }, []);

  const total = scores.reduce((t, v, i) => t + (v / 10) * CRITERIA[i][1], 0);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setMsg(null);
    try { localStorage.setItem("mp-judge-name", name); } catch {}
    const compObj = comps.find((c) => c.id === comp);
    try {
      const r = await fetch("/api/entries.php", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _action: "evaluate", password: pw, evaluation: {
          judge: name, comp: (compObj?.en.t || comp), team,
          scores: Object.fromEntries(CRITERIA.map(([c], i) => [c, scores[i]])),
          total: total.toFixed(1), note,
        } }),
      });
      const j = await r.json().catch(() => ({} as { error?: string }));
      if (!r.ok) { setMsg(`✗ ${j.error || `HTTP ${r.status}`}`); setBusy(false); return; }
      setMine((m) => [...m, { team, total: total.toFixed(1) }]);
      setMsg(`✓ Scored ${team} — ${total.toFixed(1)}/100`);
      setTeam(""); setScores(CRITERIA.map(() => 5)); setNote("");
    } catch { setMsg("✗ Server unreachable — evaluations only work on the live site."); }
    setBusy(false);
  };

  return (
    <div style={{ maxWidth: 640 }}>
      <h2 style={h2}>Score an entry <span style={{ ...mono, opacity: .5 }}>· the published scorecard, weights included</span></h2>
      <form onSubmit={submit} style={{ display: "grid", gap: 16 }}>
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}>
          <label style={{ display: "grid", gap: 4 }}>
            <span style={{ ...mono, opacity: .55, fontSize: 10.5 }}>YOUR NAME (shown on the score)</span>
            <input required value={name} onChange={(e) => setName(e.target.value)} className="px-input" style={{ ...inp, width: "100%" }} />
          </label>
          <label style={{ display: "grid", gap: 4 }}>
            <span style={{ ...mono, opacity: .55, fontSize: 10.5 }}>COMPETITION</span>
            <select value={comp} onChange={(e) => setComp(e.target.value)} className="px-input" style={{ ...inp, cursor: "pointer" }}>
              {comps.map((c) => <option key={c.id} value={c.id}>{c.en.t || c.id}</option>)}
            </select>
          </label>
          <label style={{ display: "grid", gap: 4 }}>
            <span style={{ ...mono, opacity: .55, fontSize: 10.5 }}>TEAM / ENTRY</span>
            <input required value={team} onChange={(e) => setTeam(e.target.value)} placeholder="Team Sanad" className="px-input" style={{ ...inp, width: "100%" }} />
          </label>
        </div>
        <div style={{ display: "grid", gap: 10 }}>
          {CRITERIA.map(([label, weight], i) => (
            <label key={label} style={{ display: "grid", gap: 4 }}>
              <span style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <span style={{ fontSize: 13.5 }}>{label} <span style={{ ...mono, opacity: .45 }}>{weight}%</span></span>
                <strong style={{ ...mono, color: LILAC, fontVariantNumeric: "tabular-nums" }}>{scores[i]}/10</strong>
              </span>
              <input type="range" min={0} max={10} step={1} value={scores[i]}
                     aria-label={`${label} score`}
                     onChange={(e) => setScores((sc) => sc.map((v, j) => (j === i ? Number(e.target.value) : v)))}
                     style={{ accentColor: LILAC, minHeight: 32 }} />
            </label>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <span style={{ ...mono, opacity: .55 }}>WEIGHTED TOTAL</span>
          <strong style={{ fontSize: 30, fontWeight: 800, color: LILAC, fontVariantNumeric: "tabular-nums" }}>{total.toFixed(1)}</strong>
          <span style={{ ...mono, opacity: .45 }}>/100</span>
        </div>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3}
                  placeholder="One line of feedback the team will actually use (optional)"
                  aria-label="Feedback note" className="px-input" style={{ ...inp, width: "100%", resize: "vertical" }} />
        <button type="submit" disabled={busy || !comps.length}
                style={{ ...inp, cursor: busy ? "wait" : "pointer", background: LILAC, color: PLUM900, fontWeight: 700, border: 0, justifySelf: "start", opacity: busy ? .6 : 1 }}>
          {busy ? "Submitting…" : "Submit evaluation"}
        </button>
        {msg && <p role="status" style={{ ...mono, margin: 0, color: msg.startsWith("✓") ? "#5FD39A" : ORANGE }}>{msg}</p>}
      </form>
      {mine.length > 0 && (
        <div style={{ marginTop: 26 }}>
          <h2 style={h2}>Scored this session</h2>
          {mine.map((m, i) => (
            <p key={i} style={{ ...mono, margin: "4px 0", opacity: .75 }}>{m.team} — {m.total}/100</p>
          ))}
        </div>
      )}
    </div>
  );
}

const jod = (v: string | undefined) => { const m = /(\d+)/.exec(v || ""); return m ? Number(m[1]) : 0; };

const StatCard = ({ label, value, sub, tint, onClick }: { label: string; value: string; sub?: string; tint: string; onClick?: () => void }) => (
  <button onClick={onClick} disabled={!onClick}
          style={{ textAlign: "start", background: "rgba(255,254,236,.04)", color: CREAM, border: `1px solid rgba(255,254,236,.14)`,
                   padding: "18px 20px", display: "grid", gap: 4, cursor: onClick ? "pointer" : "default", ...cut(12) }}>
    <span style={{ ...mono, opacity: .55 }}>{label}</span>
    <strong style={{ fontSize: 30, fontWeight: 800, color: tint, fontVariantNumeric: "tabular-nums" }}>{value}</strong>
    {sub && <span style={{ ...mono, opacity: .6 }}>{sub}</span>}
  </button>
);

function Overview({ pw, store, goto, role }: { pw: string; store: Store; goto: (t: "overview" | "events" | "subs" | "site" | "judging") => void; role: string }) {
  const [rows, setRows] = React.useState<Record<string, string>[] | null>(null);
  const [offline, setOffline] = React.useState(false);
  React.useEffect(() => {
    fetchEntries(pw).then((r) => { if (r.ok) setRows(r.entries as Record<string, string>[]); else setOffline(true); })
      .catch(() => setOffline(true));
  }, [pw]);

  const tickets = (rows ?? []).filter((r) => r._kind === "ticket");
  const by = (st: string) => tickets.filter((t) => t.status === st).length;
  const paidJod = tickets.filter((t) => t.status === "paid").reduce((s, t) => s + jod(t.price), 0);
  const pendingJod = tickets.filter((t) => t.status && t.status !== "paid" && t.status !== "rejected").reduce((s, t) => s + jod(t.price), 0);
  const donations = (rows ?? []).filter((r) => r._kind === "donation");
  const needs = by("receipt-review") + by("loyalty-review");
  const [bkMsg, setBkMsg] = React.useState<string | null>(null);
  const downloadAll = async () => {
    setBkMsg("preparing…");
    try {
      const r = await fetch("/api/export.php", { headers: { "X-MP-Pass": pw } });
      if (!r.ok) { setBkMsg(`✗ HTTP ${r.status}`); return; }
      const blob = await r.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `meetpixils-backup-${new Date().toISOString().slice(0, 10)}.${blob.type.includes("zip") ? "zip" : "json"}`;
      a.click();
      setBkMsg("✓ downloaded — keep it somewhere safe");
    } catch { setBkMsg("✗ only works on the live site"); }
  };
  const cap = store.settings.capacity;
  const soldOf = (passName: string, id: string) => tickets.filter((t) => (t.pass === passName || t.pass === id) && t.status !== "rejected").length;
  const capLine = (cap.normal > 0 || cap.diamond > 0)
    ? `${cap.normal > 0 ? `N ${soldOf("Normal pass", "normal")}/${cap.normal}` : ""}${cap.normal > 0 && cap.diamond > 0 ? " · " : ""}${cap.diamond > 0 ? `D ${soldOf("Diamond pass", "diamond")}/${cap.diamond}` : ""}`
    : null;

  const Card = StatCard;

  return (
    <div style={{ display: "grid", gap: 26 }}>
      {needs > 0 && (
        <button onClick={() => goto("subs")}
                style={{ textAlign: "start", background: "rgba(239,82,41,.12)", border: `1px solid ${ORANGE}`, color: CREAM,
                         padding: "16px 20px", cursor: "pointer", ...cut(12) }}>
          <strong style={{ color: ORANGE }}>⚑ {needs} ticket{needs > 1 ? "s" : ""} waiting on you</strong>
          <span style={{ ...mono, opacity: .7, display: "block", marginTop: 4 }}>
            {by("receipt-review")} receipt{by("receipt-review") === 1 ? "" : "s"} to verify · {by("loyalty-review")} loyalty approval{by("loyalty-review") === 1 ? "" : "s"} → review now
          </span>
        </button>
      )}
      <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))" }}>
        <Card label="CONFIRMED REVENUE" value={`${paidJod} JOD`} sub={`${by("paid")} paid${capLine ? ` · seats ${capLine}` : ""}`} tint="#5FD39A" onClick={() => goto("subs")} />
        <Card label="IN THE PIPELINE" value={`${pendingJod} JOD`} sub={`${tickets.length - by("paid") - by("rejected")} awaiting review/payment`} tint={ORANGE} onClick={() => goto("subs")} />
        <Card label="DONATION PLEDGES" value={`${donations.reduce((s, d) => s + jod(d.amount), 0)} JOD`} sub={`${donations.length} pledge${donations.length === 1 ? "" : "s"}`} tint={LILAC} onClick={() => goto("subs")} />
        <Card label="LIVE OBJECTS" value={String(store.objects.length)} sub={`${store.objects.filter((o) => o.status === "open" || o.status === "closing-soon").length} open now`} tint={CYAN} onClick={() => goto("events")} />
      </div>
      {offline && <p style={{ ...mono, color: ORANGE, margin: 0 }}>⚠ Live numbers unavailable — this preview can't reach the server. On meetpixils.com/admin they load automatically.</p>}
      {rows && !rows.length && <p style={{ ...mono, opacity: .5, margin: 0 }}>No submissions yet — numbers fill in as tickets and pledges arrive.</p>}
      <div>
        <h2 style={h2}>Quick actions</h2>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          {([["+ Add an event", "events"], ["Review submissions", "subs"], ["Edit hero / prices / links", "site"]] as const).map(([label, t]) => (
            <button key={t} onClick={() => goto(t)} style={{ ...inp, cursor: "pointer", background: "rgba(255,254,236,.07)" }}>{label}</button>
          ))}
          {role === "super" && (
            <button onClick={downloadAll} style={{ ...inp, cursor: "pointer", background: "rgba(95,211,154,.14)", borderColor: "rgba(95,211,154,.5)" }}>
              ⤓ Download full backup
            </button>
          )}
          {bkMsg && <span style={{ ...mono, color: bkMsg.startsWith("✓") ? "#5FD39A" : ORANGE }}>{bkMsg}</span>}
        </div>
        {role === "super" && (
          <p style={{ ...mono, opacity: .45, margin: "10px 0 0", lineHeight: 1.7 }}>
            The server also snapshots your data automatically on the first change of every day (kept 30 days).
          </p>
        )}
      </div>
    </div>
  );
}

const F = ({ label, value, onCommit, dir, wide, warn }: { label: string; value: string; onCommit: (v: string) => void; dir?: "rtl"; wide?: boolean; warn?: string }) => (
    <label style={{ display: "grid", gap: 5, gridColumn: wide ? "1 / -1" : undefined }}>
      <span style={{ ...mono, opacity: .55, fontSize: 10.5 }}>{label}</span>
      <input key={value} defaultValue={value} dir={dir} onBlur={(e) => { if (e.target.value !== value) onCommit(e.target.value); }}
             className="px-input" style={{ ...inp, width: "100%" }} />
      {warn && <span style={{ ...mono, color: ORANGE, fontSize: 10.5 }}>{warn}</span>}
    </label>
);
const N = ({ label, value, onCommit, suffix }: { label: string; value: number; onCommit: (v: number) => void; suffix: string }) => (
    <label style={{ display: "grid", gap: 5 }}>
      <span style={{ ...mono, opacity: .55, fontSize: 10.5 }}>{label}</span>
      <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input key={value} type="number" min={0} defaultValue={value}
               onBlur={(e) => { const v = Number(e.target.value); if (Number.isFinite(v) && v >= 0 && v !== value) onCommit(v); }}
               className="px-input" style={{ ...inp, width: 90 }} />
        <span style={{ ...mono, opacity: .5 }}>{suffix}</span>
      </span>
    </label>
);

function SiteSettings({ store, update, ping }: { store: Store; update: (fn: (s: Store) => Store) => void; ping: (id: string) => void }) {
  const st = store.settings;
  const patch = (p: Partial<Store["settings"]>) => { update((s) => ({ ...s, settings: { ...s.settings, ...p } })); ping("site"); };
  return (
    <div style={{ display: "grid", gap: 30, maxWidth: 920 }}>
      <section>
        <h2 style={h2}>Homepage hero</h2>
        <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))" }}>
          <F label="Headline (EN)" value={st.heroT.en} onCommit={(v) => patch({ heroT: { ...st.heroT, en: v } })} />
          <F label="العنوان (AR)" value={st.heroT.ar} dir="rtl" onCommit={(v) => patch({ heroT: { ...st.heroT, ar: v } })} />
          <F label="Description (EN)" value={st.heroD.en} wide onCommit={(v) => patch({ heroD: { ...st.heroD, en: v } })} />
          <F label="الوصف (AR)" value={st.heroD.ar} dir="rtl" wide onCommit={(v) => patch({ heroD: { ...st.heroD, ar: v } })} />
        </div>
      </section>
      <section>
        <h2 style={h2}>Header button <span style={{ ...mono, opacity: .5 }}>· the orange CTA on every page</span></h2>
        <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}>
          <F label="Label (EN)" value={st.cta.en} onCommit={(v) => patch({ cta: { ...st.cta, en: v } })} />
          <F label="النص (AR)" value={st.cta.ar} dir="rtl" onCommit={(v) => patch({ cta: { ...st.cta, ar: v } })} />
          <F label="Links to (path or URL)" value={st.cta.href} onCommit={(v) => patch({ cta: { ...st.cta, href: v } })} />
        </div>
      </section>
      <section>
        <h2 style={h2}>Tickets & money</h2>
        <div style={{ display: "flex", gap: 22, flexWrap: "wrap", alignItems: "start" }}>
          <N label="NORMAL PASS" value={st.passes.normal} suffix="JOD" onCommit={(v) => patch({ passes: { ...st.passes, normal: v } })} />
          <N label="DIAMOND PASS" value={st.passes.diamond} suffix="JOD" onCommit={(v) => patch({ passes: { ...st.passes, diamond: v } })} />
          <N label="NORMAL CAPACITY (0 = unlimited)" value={st.capacity.normal} suffix="seats"
             onCommit={(v) => patch({ capacity: { ...st.capacity, normal: Math.max(0, v) } })} />
          <N label="DIAMOND CAPACITY (0 = unlimited)" value={st.capacity.diamond} suffix="seats"
             onCommit={(v) => patch({ capacity: { ...st.capacity, diamond: Math.max(0, v) } })} />
          <N label="LOYALTY DISCOUNT" value={Math.round(st.loyaltyOff * 100)} suffix="% off"
             onCommit={(v) => patch({ loyaltyOff: Math.min(95, Math.max(0, v)) / 100 })} />
          <div style={{ flex: "1 1 260px" }}>
            <F label="CLIQ NUMBER — where the money goes" value={st.cliq}
               warn="Triple-check this. Wrong number = wrong pocket."
               onCommit={(v) => patch({ cliq: v.replace(/[^\d]/g, "") })} />
          </div>
        </div>
        <p style={{ ...mono, opacity: .5, margin: "12px 0 0", lineHeight: 1.7 }}>
          Prices apply everywhere (checkout pages AND the server that validates payments) as soon as you publish.
        </p>
      </section>
      <section>
        <h2 style={h2}>Community links</h2>
        <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))" }}>
          <F label="Discord invite URL" value={st.discord} onCommit={(v) => patch({ discord: v })}
             warn={st.discord.includes("FhnNbqZk5") ? "This invite EXPIRES 18 Sep — paste a permanent one." : undefined} />
          <F label="Instagram URL" value={st.instagram} onCommit={(v) => patch({ instagram: v })} />
        </div>
      </section>
    </div>
  );
}

const h2: React.CSSProperties = { margin: "0 0 14px", fontSize: 16, fontWeight: 800, display: "flex", gap: 12, alignItems: "baseline", flexWrap: "wrap" };
const td: React.CSSProperties = { padding: "7px 10px", borderBottom: "1px solid rgba(255,254,236,.1)", verticalAlign: "middle" };

const TICKET_STATUSES = ["receipt-review", "loyalty-review", "approved-pay-now", "paid", "rejected"];

function Entries({ pw }: { pw: string }) {
  const [rows, setRows] = React.useState<Record<string, string>[]>([]);
  const [src, setSrc] = React.useState<"this browser" | "live site">("this browser");
  const [err, setErr] = React.useState<string | null>(null);

  const setStatus = async (order: string, status: string) => {
    setErr(null);
    const r = await fetch("/api/entries.php", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _action: "set-status", password: pw, order, status }),
    });
    if (!r.ok) { setErr(`status update failed (HTTP ${r.status}) — wrong password?`); return; }
    setRows((rs) => rs.map((x) => (x.order === order ? { ...x, status } : x)));
  };
  const viewProof = async (file: string) => {
    setErr(null);
    const r = await fetch(`/api/receipt.php?f=${encodeURIComponent(file)}`, { headers: { "X-MP-Pass": pw } });
    if (!r.ok) { setErr(`couldn't load image (HTTP ${r.status}) — enter the admin password above`); return; }
    const url = URL.createObjectURL(await r.blob());
    window.open(url, "_blank", "noopener");
  };
  React.useEffect(() => {
    try { setRows(JSON.parse(localStorage.getItem("mp-entries") || "[]")); } catch {}
  }, []);
  const loadLive = async () => {
    setErr(null);
    if (!pw) { setErr("enter the admin password above first"); return; }
    const r = await fetchEntries(pw);
    if (r.ok) { setRows(r.entries as Record<string, string>[]); setSrc("live site"); }
    else setErr(r.error ?? "failed");
  };
  const [kind, setKind] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [q, setQ] = React.useState("");
  const shown = rows.filter((r) =>
    (kind === "all" || (kind === "other" ? r._kind !== "ticket" && r._kind !== "donation" && r._kind !== "evaluation" : r._kind === kind)) &&
    (statusFilter === "all" || r.status === statusFilter) &&
    (!q || `${r.name} ${r.email} ${r.order}`.toLowerCase().includes(q.toLowerCase())));
  const exportCsv = () => {
    const cols = ["_kind", "order", "status", "name", "email", "pass", "price", "loyalty", "amount", "initiative", "_ts", "_at"];
    const esc = (v: string) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [cols.join(","), ...shown.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["\ufeff" + csv], { type: "text/csv" }));
    a.download = `meetpixils-submissions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  React.useEffect(() => { if (pw) loadLive(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ display: "grid", gap: 6 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 6 }}>
        <button onClick={loadLive} style={{ ...inp, cursor: "pointer", background: CYAN, color: PLUM900, fontWeight: 700, border: 0 }}>
          ↻ Refresh
        </button>
        {["all", "ticket", "donation", "evaluation", "other"].map((k) => (
          <button key={k} onClick={() => setKind(k)} aria-pressed={kind === k}
                  style={{ ...inp, minHeight: 42, padding: "8px 15px", cursor: "pointer",
                           background: kind === k ? "rgba(255,254,236,.16)" : "transparent" }}>{k}</button>
        ))}
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filter by status"
                style={{ ...inp, minHeight: 42, padding: "8px 10px", cursor: "pointer" }}>
          <option value="all">any status</option>
          {TICKET_STATUSES.map((st) => <option key={st} value={st}>{st}</option>)}
        </select>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name / email / order"
               aria-label="Search submissions" className="px-input" style={{ ...inp, minHeight: 42, width: 210 }} />
        <button onClick={exportCsv} disabled={!shown.length} style={{ ...inp, minHeight: 42, padding: "8px 15px", cursor: "pointer", opacity: shown.length ? 1 : .4 }}>
          ⤓ CSV
        </button>
        <span style={{ ...mono, opacity: .5 }}>{src} · {shown.length}/{rows.length}</span>
        {err && <span style={{ ...mono, color: ORANGE }}>✗ {err}</span>}
      </div>
      {!shown.length && <p style={{ ...mono, opacity: .5, margin: 0 }}>{rows.length ? "Nothing matches these filters." : "None yet — ticket reservations and form entries land here."}</p>}
      {shown.map((r, i) => (
        <div key={i} style={{ display: "flex", gap: 14, flexWrap: "wrap", fontFamily: "var(--font-mono)", fontSize: 12, padding: "8px 10px", background: "rgba(255,254,236,.04)" }}>
          <span style={{ color: ORANGE, minWidth: 100 }}>{r._kind}</span>
          <span style={{ flex: 1, minWidth: 200 }}>
            {r.name || r.company || r.url || "—"}
            {r.email ? <span style={{ opacity: .6 }}> · {r.email}</span> : null}
            {r.pass ? <span style={{ color: CYAN }}> · {r.pass} {r.price}{r.loyalty && r.loyalty !== "no" ? " · loyalty" : ""}</span> : null}
            {r.status ? <span style={{ color: r.status === "paid" ? "#5FD39A" : ORANGE, fontWeight: 700 }}> · {r.order ?? ""}</span> : null}
            {r.amount ? <span style={{ color: LILAC }}> · {r.initiative} · {r.amount}</span> : null}
            {r._kind === "evaluation" ? <span style={{ color: PERI }}> · {r.judge} scored {r.team} — {r.total}/100 ({r.comp})</span> : null}
          </span>
          {r.receipt && <button onClick={() => viewProof(r.receipt)} style={{ ...inp, minHeight: 36, padding: "5px 12px", cursor: "pointer", fontSize: 11.5 }}>receipt</button>}
          {r.stamp && <button onClick={() => viewProof(r.stamp)} style={{ ...inp, minHeight: 36, padding: "5px 12px", cursor: "pointer", fontSize: 11.5 }}>stamp</button>}
          {r.order && r.status && (
            <select value={r.status} onChange={(e) => setStatus(r.order, e.target.value)} aria-label={`Status of ${r.order}`}
                    style={{ ...inp, minHeight: 36, padding: "5px 10px", fontSize: 11.5, cursor: "pointer",
                             color: r.status === "paid" ? "#5FD39A" : r.status === "rejected" ? "#FF7A4F" : CREAM }}>
              {TICKET_STATUSES.map((st) => <option key={st} value={st}>{st}</option>)}
              {!TICKET_STATUSES.includes(r.status) && <option value={r.status}>{r.status}</option>}
            </select>
          )}
          <span style={{ opacity: .5 }}>{((r._ts || r._at) || "").slice(0, 16).replace("T", " ")}</span>
        </div>
      ))}
    </div>
  );
}
