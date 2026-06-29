"use client";
import { useI18n } from "@/lib/i18n/context";

export default function LangSwitcher({ scrolled }: { scrolled: boolean }) {
  const { locale, setLocale } = useI18n();

  return (
    <div style={{ display: "flex", background: scrolled ? "var(--gray-100)" : "rgba(255,255,255,0.12)", borderRadius: "999px", padding: "3px", gap: "2px" }}>
      {(["en", "es"] as const).map(lang => (
        <button
          key={lang}
          onClick={() => setLocale(lang)}
          aria-label={lang === "en" ? "English" : "Español"}
          style={{
            padding: "0.25rem 0.625rem",
            borderRadius: "999px",
            border: "none",
            cursor: "pointer",
            fontFamily: "inherit",
            fontSize: "0.8125rem",
            fontWeight: 700,
            letterSpacing: "0.03em",
            textTransform: "uppercase",
            transition: "all 0.2s ease",
            background: locale === lang
              ? (scrolled ? "white" : "rgba(255,255,255,0.92)")
              : "transparent",
            color: locale === lang
              ? (scrolled ? "var(--navy)" : "#162E5E")
              : (scrolled ? "var(--gray-500)" : "rgba(255,255,255,0.7)"),
            boxShadow: locale === lang ? "var(--shadow-xs)" : "none",
          }}
        >
          {lang}
        </button>
      ))}
    </div>
  );
}
