"use client";

import { useSyncExternalStore } from "react";
import { copy, type Copy, type Lang } from "@/lib/copy";

const STORAGE_KEY = "shower-lang";

let current: Lang | null = null;
const listeners = new Set<() => void>();

function isLang(value: unknown): value is Lang {
  return value === "en" || value === "gu";
}

/** ?lang=gu in a shared link wins, then the guest's last choice, then English */
function readInitial(): Lang {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get("lang");
    if (isLang(fromUrl)) return fromUrl;
  } catch {
    /* ignore */
  }
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (isLang(saved)) return saved;
  } catch {
    /* storage can be blocked */
  }
  return "en";
}

function getSnapshot(): Lang {
  if (current === null) current = readInitial();
  return current;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setLang(next: Lang) {
  current = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    /* ignore */
  }
  listeners.forEach((listener) => listener());
}

export function useLang(): Lang {
  return useSyncExternalStore(subscribe, getSnapshot, () => "en" as Lang);
}

export function useCopy(): { lang: Lang; t: Copy } {
  const lang = useLang();
  return { lang, t: copy[lang] };
}
