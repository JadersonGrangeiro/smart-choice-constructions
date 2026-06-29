"use client";
import React from "react";

/** Inject JSON-LD structured data as a script tag */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** Accessible breadcrumb navigation component */
export function Breadcrumb({ items, light = false }: {
  items: { name: string; href: string }[];
  light?: boolean;
}) {
  const color = light ? "rgba(255,255,255,0.5)" : "var(--gray-400)";
  const hoverColor = light ? "rgba(255,255,255,0.85)" : "var(--gray-700)";

  return (
    <nav aria-label="Breadcrumb" style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", fontSize: "0.875rem", color }}>
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {!isLast ? (
              <>
                <a href={item.href} style={{ color, textDecoration: "none", transition: "color 0.15s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = hoverColor; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = color; }}>
                  {item.name}
                </a>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ opacity: 0.4, flexShrink: 0 }}>
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </>
            ) : (
              <span style={{ color: light ? "rgba(255,255,255,0.85)" : "var(--gray-600)", fontWeight: 500 }}>
                {item.name}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
