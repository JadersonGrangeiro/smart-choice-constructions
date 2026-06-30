"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { translations } from "./translations";

type Locale = "en" | "es";
type T = typeof translations.en;

interface I18nContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: T;
}

function deepMerge(base: any, overrides: any): any {
  if (!overrides || typeof overrides !== "object") return base;
  if (Array.isArray(overrides)) return overrides;
  const result = { ...base };
  for (const key of Object.keys(overrides)) {
    if (
      overrides[key] !== null &&
      typeof overrides[key] === "object" &&
      !Array.isArray(overrides[key]) &&
      base?.[key] !== undefined &&
      typeof base[key] === "object" &&
      !Array.isArray(base[key])
    ) {
      result[key] = deepMerge(base[key], overrides[key]);
    } else {
      result[key] = overrides[key];
    }
  }
  return result;
}

const I18nContext = createContext<I18nContextType>({
  locale: "en",
  setLocale: () => {},
  t: translations.en,
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [overrides, setOverrides] = useState<any>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem("sc-locale") as Locale | null;
      if (saved === "en" || saved === "es") setLocaleState(saved);
    } catch {}
  }, []);

  useEffect(() => {
    fetch("/api/admin/platform-data?key=site_content")
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        if (d?.value && typeof d.value === "object") setOverrides(d.value);
      })
      .catch(() => {});
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    try { localStorage.setItem("sc-locale", l); } catch {}
  };

  const baseT = translations[locale] as unknown as T;
  // Only apply EN overrides to EN locale; ES keeps its own hardcoded translations
  const t = (locale === "en" && Object.keys(overrides).length > 0
    ? deepMerge(baseT, overrides)
    : baseT) as T;

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
