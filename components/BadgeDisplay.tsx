"use client";
import { BADGES, type BadgeId } from "@/lib/badges";

interface BadgeDisplayProps {
  badgeId: BadgeId;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
}

export function BadgeChip({ badgeId, size = "md" }: BadgeDisplayProps) {
  const badge = BADGES[badgeId];
  if (!badge) return null;

  const padding = size === "sm" ? "0.2rem 0.5rem" : size === "lg" ? "0.5rem 1rem" : "0.3rem 0.75rem";
  const fontSize = size === "sm" ? "0.7rem" : size === "lg" ? "0.9375rem" : "0.8125rem";

  return (
    <span
      title={badge.description}
      style={{
        display: "inline-flex", alignItems: "center", gap: "0.375rem",
        padding, borderRadius: "999px",
        background: badge.bgColor,
        color: badge.color,
        fontSize, fontWeight: 700,
        border: `1px solid ${badge.color}22`,
        whiteSpace: "nowrap",
        cursor: "default",
      }}
    >
      <span style={{ fontSize: size === "sm" ? "0.75rem" : "0.875rem" }}>{badge.icon}</span>
      {badge.label}
    </span>
  );
}

interface BadgeGridProps {
  badgeIds: BadgeId[];
  size?: "sm" | "md" | "lg";
  maxShow?: number;
}

export function BadgeGrid({ badgeIds, size = "md", maxShow }: BadgeGridProps) {
  const shown = maxShow ? badgeIds.slice(0, maxShow) : badgeIds;
  const rest  = maxShow && badgeIds.length > maxShow ? badgeIds.length - maxShow : 0;

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem", alignItems: "center" }}>
      {shown.map(id => <BadgeChip key={id} badgeId={id} size={size} />)}
      {rest > 0 && (
        <span style={{ fontSize: "0.8125rem", color: "var(--gray-400)", fontWeight: 500 }}>
          +{rest} more
        </span>
      )}
    </div>
  );
}

interface BadgeCardProps {
  badgeId: BadgeId;
  earnedDate?: string;
  expiresDate?: string;
}

export function BadgeCard({ badgeId, earnedDate, expiresDate }: BadgeCardProps) {
  const badge = BADGES[badgeId];
  if (!badge) return null;

  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: "1rem",
      padding: "1rem", borderRadius: "var(--radius)",
      background: badge.bgColor,
      border: `1.5px solid ${badge.color}22`,
    }}>
      <div style={{
        width: "40px", height: "40px", borderRadius: "10px",
        background: badge.color,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "1.25rem", flexShrink: 0,
        color: "white",
      }}>
        {badge.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, color: badge.color, fontSize: "0.9375rem", marginBottom: "0.25rem" }}>
          {badge.label}
        </div>
        <div style={{ fontSize: "0.8125rem", color: "var(--gray-600)", lineHeight: 1.5 }}>
          {badge.description}
        </div>
        {(earnedDate || expiresDate) && (
          <div style={{ marginTop: "0.375rem", fontSize: "0.75rem", color: "var(--gray-400)" }}>
            {earnedDate && <span>Verified {earnedDate}</span>}
            {expiresDate && <span style={{ marginLeft: "0.75rem" }}>Expires {expiresDate}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

/** Full badge legend for the "How badges work" section */
export function BadgeLegend() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {Object.values(BADGES).map(badge => (
        <div key={badge.id} style={{
          display: "flex", alignItems: "flex-start", gap: "0.875rem",
          padding: "0.875rem 1rem",
          background: "var(--gray-50)", borderRadius: "var(--radius-sm)",
          border: "1px solid var(--gray-100)",
        }}>
          <span style={{
            width: "32px", height: "32px", borderRadius: "8px",
            background: badge.color,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1rem", color: "white", flexShrink: 0,
          }}>{badge.icon}</span>
          <div>
            <div style={{ fontWeight: 700, color: "var(--navy)", fontSize: "0.875rem" }}>{badge.label}</div>
            <div style={{ fontSize: "0.8125rem", color: "var(--gray-500)", marginTop: "0.125rem" }}>{badge.requirement}</div>
          </div>
          {badge.adminApproval && (
            <span style={{ marginLeft: "auto", fontSize: "0.75rem", color: "var(--gray-400)", flexShrink: 0 }}>
              Admin verified
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
