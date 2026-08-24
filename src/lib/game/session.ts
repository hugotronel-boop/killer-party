import type { SessionRecord } from "./types";

const KEY = "killer-party-session-v1";

type Store = {
  currentCode: string | null;
  byCode: Record<string, SessionRecord>;
};

function empty(): Store {
  return { currentCode: null, byCode: {} };
}

function read(): Store {
  if (typeof window === "undefined") return empty();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw) as Store;
    if (!parsed || typeof parsed !== "object") return empty();
    return {
      currentCode: parsed.currentCode ?? null,
      byCode: parsed.byCode ?? {},
    };
  } catch {
    return empty();
  }
}

function write(store: Store) {
  localStorage.setItem(KEY, JSON.stringify(store));
}

export function getSession(code?: string): SessionRecord | null {
  const store = read();
  const key = (code ?? store.currentCode ?? "").toUpperCase();
  if (!key) return null;
  return store.byCode[key] ?? null;
}

export function saveSession(record: SessionRecord) {
  const store = read();
  const code = record.code.toUpperCase();
  store.byCode[code] = { ...record, code };
  store.currentCode = code;
  write(store);
}

export function clearSession(code?: string) {
  const store = read();
  if (code) {
    delete store.byCode[code.toUpperCase()];
    if (store.currentCode === code.toUpperCase()) store.currentCode = null;
  } else {
    store.currentCode = null;
  }
  write(store);
}

export function currentCode(): string | null {
  return read().currentCode;
}
