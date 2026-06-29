"use client";
import { useState, useEffect, useCallback } from "react";

type NotifType = "all_contractors" | "active_contractors" | "past_due" | "pending_approval" | "all_homeowners";

interface Notification {
  id: string; title: string; body: string; type: NotifType;
  channel: "email" | "dashboard"; sentAt: string | null; status: "draft" | "sent" | "scheduled";
  scheduledFor?: string; recipients: number;
}

const MOCK_NOTIFS: Notification[] = [
  { id: "n1", title: "New Feature: Enhanced Contractor Profiles",   body: "We've added galleries, before/after photos, and FAQ sections to all contractor profiles.",    type: "active_contractors", channel: "email",     sentAt: "Jun 20, 2025", status: "sent",      recipients: 287 },
  { id: "n2", title: "Action Required: Update Your Payment Method", body: "Your recent payment attempt failed. Please update your payment method to keep your profile live.",type: "past_due",          channel: "email",     sentAt: "Jun 28, 2025", status: "sent",      recipients: 5 },
  { id: "n3", title: "Complete Your Profile — Get More Visibility", body: "Profiles with 5+ photos and verified credentials appear higher in search results.",            type: "pending_approval",  channel: "dashboard", sentAt: null,           status: "draft",     recipients: 0 },
  { id: "n4", title: "July Platform Update",                         body: "We're launching new search filters and category pages on July 15. Here's what's coming.",       type: "all_contractors",   channel: "email",     sentAt: null,           status: "scheduled", scheduledFor: "Jul 10, 2025", recipients: 312 },
];

const TARGET_LABELS: Record<NotifType, string> = {
  all_contractors:    "All Contractors",
  active_contractors: "Active Contractors",
  past_due:           "Past Due Contractors",
  pending_approval:   "Pending Approval",
  all_homeowners:     "All Homeowners",
};

const STATUS_STYLE = {
  sent:      { bg: "rgba(22,163,74,0.1)",  color: "#16a34a", label: "Sent" },
  draft:     { bg: "var(--gray-100)",       color: "var(--gray-500)", label: "Draft" },
  scheduled: { bg: "rgba(99,102,241,0.1)", color: "#6366f1", label: "Scheduled" },
};

export default function NotificationsAdminPage() {
  const [notifs, setNotifs] = useState(MOCK_NOTIFS);
  const [showNew, setShowNew] = useState(false);
  const [newNotif, setNewNotif] = useState({ title: "", body: "", type: "active_contractors" as NotifType, channel: "email" as "email"|"dashboard", scheduledFor: "" });

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/platform-data?key=notifications");
      const json = await res.json();
      if (json.value && Array.isArray(json.value)) setNotifs(json.value);
    } catch {}
  }, []);

  const persist = useCallback((updated: Notification[]) => {
    fetch("/api/admin/platform-data", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: "notifications", value: updated }) }).catch(() => {});
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.625rem", fontWeight: 800, color: "var(--navy)", marginBottom: "0.25rem" }}>Notifications</h1>
          <p style={{ color: "var(--gray-500)", fontSize: "0.875rem" }}>Send announcements, alerts, and messages to contractors or homeowners.</p>
        </div>
        <button className="btn-red" onClick={() => setShowNew(true)} style={{ padding: "0.75rem 1.5rem" }}>
          + New Notification
        </button>
      </div>

      {showNew && (
        <div className="card" style={{ padding: "1.75rem", marginBottom: "1.5rem", border: "2px solid var(--navy)" }}>
          <h3 style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "1.25rem" }}>Compose Notification</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label className="form-label">Recipients</label>
                <select className="form-select" value={newNotif.type} onChange={e => setNewNotif(p => ({ ...p, type: e.target.value as NotifType }))}>
                  {Object.entries(TARGET_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Channel</label>
                <select className="form-select" value={newNotif.channel} onChange={e => setNewNotif(p => ({ ...p, channel: e.target.value as "email"|"dashboard" }))}>
                  <option value="email">Email</option>
                  <option value="dashboard">Dashboard notification</option>
                </select>
              </div>
            </div>
            <div>
              <label className="form-label">Subject / Title</label>
              <input className="form-input" placeholder="Notification title" value={newNotif.title} onChange={e => setNewNotif(p => ({ ...p, title: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">Message</label>
              <textarea className="form-input" rows={4} placeholder="Notification body..." value={newNotif.body} onChange={e => setNewNotif(p => ({ ...p, body: e.target.value }))} style={{ resize: "vertical" }} />
            </div>
            <div>
              <label className="form-label">Schedule For (optional — leave blank to send immediately)</label>
              <input className="form-input" type="datetime-local" value={newNotif.scheduledFor} onChange={e => setNewNotif(p => ({ ...p, scheduledFor: e.target.value }))} style={{ width: "320px" }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem" }}>
            <button className="btn-secondary" onClick={() => {
              const u: Notification[] = [...notifs, { id: `n${Date.now()}`, ...newNotif, sentAt: null, status: "draft" as "draft", recipients: 0 }];
              setNotifs(u); persist(u); setShowNew(false);
            }}>Save Draft</button>
            <button className="btn-red" onClick={() => {
              if (!newNotif.title || !newNotif.body) return;
              const newStatus: "sent" | "scheduled" = newNotif.scheduledFor ? "scheduled" : "sent";
              const u: Notification[] = [...notifs, { id: `n${Date.now()}`, ...newNotif, sentAt: new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}), status: newStatus, recipients: 287 }];
              setNotifs(u); persist(u); setShowNew(false);
            }}>
              {newNotif.scheduledFor ? "Schedule" : "Send Now"}
            </button>
            <button className="btn-secondary" onClick={() => setShowNew(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {notifs.map(n => {
          const st = STATUS_STYLE[n.status];
          return (
            <div key={n.id} className="card" style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 700, color: "var(--navy)", fontSize: "0.9375rem" }}>{n.title}</span>
                    <span style={{ background: st.bg, color: st.color, padding: "0.2rem 0.625rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700 }}>{st.label}</span>
                    <span style={{ background: "var(--gray-100)", color: "var(--gray-600)", padding: "0.2rem 0.625rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600 }}>
                      {n.channel === "email" ? "📧 Email" : "🔔 Dashboard"}
                    </span>
                  </div>
                  <p style={{ color: "var(--gray-600)", fontSize: "0.875rem", lineHeight: 1.65, marginBottom: "0.625rem" }}>{n.body}</p>
                  <div style={{ fontSize: "0.8125rem", color: "var(--gray-400)" }}>
                    To: <strong style={{ color: "var(--gray-600)" }}>{TARGET_LABELS[n.type]}</strong>
                    {n.sentAt && <span style={{ marginLeft: "1rem" }}>Sent: {n.sentAt}</span>}
                    {n.scheduledFor && n.status === "scheduled" && <span style={{ marginLeft: "1rem" }}>Scheduled: {n.scheduledFor}</span>}
                    {n.recipients > 0 && <span style={{ marginLeft: "1rem" }}>{n.recipients} recipients</span>}
                  </div>
                </div>
                {n.status === "draft" && (
                  <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                    <button style={{ padding: "0.5rem 1rem", background: "var(--gray-100)", border: "none", borderRadius: "var(--radius-sm)", fontSize: "0.8125rem", fontWeight: 600, cursor: "pointer", color: "var(--gray-700)", fontFamily: "inherit" }}>
                      Edit
                    </button>
                    <button onClick={() => { const u = notifs.map(x => x.id === n.id ? { ...x, status: "sent" as const, sentAt: "Now", recipients: 287 } : x); setNotifs(u); persist(u); }}
                      style={{ padding: "0.5rem 1rem", background: "var(--navy)", color: "white", border: "none", borderRadius: "var(--radius-sm)", fontSize: "0.8125rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                      Send Now
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
