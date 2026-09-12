"use client";
import * as React from "react";
export * from "./defaults";
import { DEFAULTS, Store, CObj, Status, RANK } from "./defaults";

const KEY = "mp-cms-v1";
const API_CONTENT = "/api/content.php";
const API_ENTRIES = "/api/entries.php";

/* ---------------- published copy (PHP backend) ----------------
 * Fetched once per page load. Visitors see it; the admin's own browser
 * keeps an unpublished draft in localStorage that wins until published.
 * On dev / static preview the fetch 404s and everything falls back. */
let serverStore: Store | null = null;
let serverFetch: Promise<void> | null = null;

const normalize = (s: { objects?: CObj[]; faces?: Store["faces"]; works?: Store["works"]; settings?: Partial<Store["settings"]> }): Store =>
  ({ objects: s.objects ?? DEFAULTS.objects, faces: s.faces ?? [], works: s.works ?? DEFAULTS.works,
     settings: { ...DEFAULTS.settings, ...(s.settings ?? {}) } });

function ensureServer(): Promise<void> {
  if (!serverFetch) {
    serverFetch = fetch(API_CONTENT, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => { if (j && Array.isArray(j.objects) && j.objects.length) serverStore = normalize(j); })
      .catch(() => {});
  }
  return serverFetch;
}

export function loadStore(): Store {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(KEY); // local draft (admin preview) wins
    if (raw) return normalize(JSON.parse(raw));
  } catch {}
  return serverStore ?? DEFAULTS;
}
export function saveStore(s: Store) {
  localStorage.setItem(KEY, JSON.stringify(s));
  window.dispatchEvent(new Event("mp-cms"));
}
export function resetStore() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("mp-cms"));
}
export const hasDraft = () => typeof window !== "undefined" && !!localStorage.getItem(KEY);
export const hasPublished = () => serverStore !== null;

/** Push the current store live for everyone (needs the admin password from api/config.php). */
export async function publishStore(password: string): Promise<{ ok: boolean; error?: string }> {
  const s = loadStore();
  try {
    const r = await fetch(API_CONTENT, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, store: s }),
    });
    const j: { error?: string } = await r.json().catch(() => ({}));
    if (!r.ok) return { ok: false, error: j.error || `HTTP ${r.status}` };
    serverStore = s;
    localStorage.removeItem(KEY); // draft is now the published copy
    window.dispatchEvent(new Event("mp-cms"));
    return { ok: true };
  } catch { return { ok: false, error: "network — publish only works on the live site" }; }
}

/** Send a form/ticket entry to the server. False = offline/preview (localStorage still has it). */
export async function submitEntry(entry: Record<string, unknown>): Promise<boolean> {
  try {
    const r = await fetch(API_ENTRIES, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(entry),
    });
    return r.ok;
  } catch { return false; }
}

export async function fetchEntries(password: string):
  Promise<{ ok: boolean; entries?: Record<string, string>[]; error?: string }> {
  try {
    const r = await fetch(API_ENTRIES, { cache: "no-store", headers: { "X-MP-Pass": password } });
    const j: { entries?: Record<string, string>[]; error?: string } = await r.json().catch(() => ({}));
    if (!r.ok) return { ok: false, error: j.error || `HTTP ${r.status}` };
    return { ok: true, entries: j.entries ?? [] };
  } catch { return { ok: false, error: "network — only works on the live site" }; }
}

export function useStore(): [Store, (fn: (s: Store) => Store) => void] {
  const [store, setStore] = React.useState<Store>(DEFAULTS);
  React.useEffect(() => {
    const sync = () => setStore(loadStore());
    sync();
    ensureServer().then(sync);
    window.addEventListener("mp-cms", sync);
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener("mp-cms", sync); window.removeEventListener("storage", sync); };
  }, []);
  const update = React.useCallback((fn: (s: Store) => Store) => saveStore(fn(loadStore())), []);
  return [store, update];
}
export const mostUrgent = (objects: CObj[]) => [...objects].sort((a, b) => RANK[a.status] - RANK[b.status])[0];
export const daysLeft = (iso?: string, now = Date.now()) =>
  iso ? Math.max(0, Math.ceil((new Date(iso).getTime() - now) / 86400000)) : null;
export const objHref = (o: CObj) => (o.type === "Competition" ? `/compete/${o.id}` : `/whats-on/${o.id}`);
export const statusLabel = (o: CObj, ar: boolean, toAr: (n: number | string) => string, now = Date.now()) => {
  if (o.status === "closing-soon") {
    const d = daysLeft(o.due, now) ?? 0;
    return ar ? `يغلق خلال ${toAr(d)} أيام` : `Closes in ${d} days`;
  }
  const map: Record<Status, [string, string]> = {
    "closing-soon": ["", ""], open: ["Open", "مفتوح"], upcoming: ["Upcoming", "قريباً"],
    "results-out": ["Results out", "النتائج ظهرت"], closed: ["Closed", "انتهى"],
  };
  return ar ? map[o.status][1] : map[o.status][0];
}
