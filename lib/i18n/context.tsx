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

const I18nContext = createContext<I18nContextType>({
  locale: "en",
  setLocale: () => {},
  t: translations.en,
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("sc-locale") as Locale | null;
      if (saved === "en" || saved === "es") setLocaleState(saved);
    } catch {}
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    try { localStorage.setItem("sc-locale", l); } catch {}
  };

  // Cast to T to avoid structural incompatibility between const assertions
  const t = translations[locale] as unknown as T;

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
