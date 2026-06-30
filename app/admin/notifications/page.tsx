"use client";
import { useState, useEffect, useCallback } from "react";

type NotifType = "all_contractors" | "active_contractors" | "past_due" | "pending_approval" | "all_homeowners" | "all_users";

interface Notification {
  id: string; title: string; body: string; type: NotifType;
  channel: "email" | "dashboard" | "popup"; sentAt: string | null; status: "draft" | "sent" | "scheduled";
  scheduledFor?: string; recipients: number;
  popup?: { bgColor: string; textColor: string; ctaLabel: string; ctaUrl: string; dismissible: boolean; };
}

const MOCK_NOTIFS: Notification[] = [
  { id: "n1", title: "New Feature: Enhanced Contractor Profiles", body: "We've added galleries, before/after photos, and FAQ sections to all contractor profiles.", type: "active_contractors", channel: "email", sentAt: "Jun 20, 2025", status: "sent", recipients: 287 },
  { id: "n2", title: "Action Required: Update Your Payment Method", body: "Your recent payment attempt failed. Please update your payment method to keep your profile live.", type: "past_due", channel: "email", sentAt: "Jun 28, 2025", status: "sent", recipients: 5 },
  { id: "n3", title: "Complete Your Profile — Get More Visibility", body: "Profiles with 5+ photos and verified credentials appear higher in search results.", type: "pending_approval", channel: "dashboard", sentAt: null, status: "draft", recipients: 0 },
  { id: "n4", title: "July Platform Update", body: "We're launching new search filters and category pages on July 15. Here's what's coming.", type: "all_contractors", channel: "email", sentAt: null, status: "scheduled", scheduledFor: "Jul 10, 2025", recipients: 312 },
  { id: "n5", title: "Welcome Offer — 10% Off First Month", body: "Sign up this week and get your first month at a discount. Use code WELCOME10.", type: "all_users", channel: "popup", sentAt: null, status: "draft", recipients: 0, popup: { bgColor: "#1a2e5e", textColor: "#ffffff", ctaLabel: "Get Discount", ctaUrl: "/pricing", dismissible: true } },
];

const TARGET_LABELS: Record<NotifType, string> = {
  all_contractors:    "All Contractors",
  active_contractors: "Active Contractors",
  past_due:           "Past Due Contractors",
  pending_approval:   "Pending Approval",
  all_homeowners:     "All Homeowners",
  all_users:          "All Users (Site-wide)",
};

const STATUS_STYLE = {
  sent:      { bg: "rgba(22,163,74,0.1)",  color: "#16a34a", label: "Sent" },
  draft:     { bg: "var(--gray-100)",       color: "var(--gray-500)", label: "Draft" },
  scheduled: { bg: "rgba(99,102,241,0.1)", color: "#6366f1", label: "Scheduled" },
};

const EMPTY_NOTIF = {
  title: "", body: "", type: "active_contractors" as NotifType,
  channel: "email" as "email"|"dashboard"|"popup", scheduledFor: "",
  popup: { bgColor: "#1a2e5e", textColor: "#ffffff", ctaLabel: "Learn More", ctaUrl: "", dismissible: true },
};

interface ComposeModalProps {
  initial?: Partial<typeof EMPTY_NOTIF> & { id?: string; status?: string; recipients?: number; sentAt?: string | null };
  onClose: () => void;
  onSave: (data: Notification) => void;
  onSend: (data: Notification) => void;
}

function ComposeModal({ initial, onClose, onSave, onSend }: ComposeModalProps) {
  const [form, setForm] = useState({ ...EMPTY_NOTIF, ...initial });
  const isEdit = !!initial?.id;

  const buildNotif = (status: "draft" | "sent" | "scheduled"): Notification => ({
    id: initial?.id ?? `n${Date.now()}`,
    title: form.title,
    body: form.body,
    type: form.type,
    channel: form.channel,
    scheduledFor: form.scheduledFor || undefined,
    sentAt: status === "sent" ? new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : (initial?.sentAt ?? null),
    status,
    recipients: initial?.recipients ?? (status === "sent" ? 287 : 0),
    popup: form.channel === "popup" ? form.popup : undefined,
  });

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
      <div style={{ background: "white", borderRadius: "var(--radius-xl)", padding: "2rem", width: "100%", maxWidth: "640px", maxHeight: "92vh", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <h3 style={{ fontWeight: 800, color: "var(--navy)", fontSize: "1.25rem" }}>
            {isEdit ? "Edit Notification" : "Compose Notification"}
          </h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.5rem", color: "var(--gray-400)", lineHeight: 1 }}>×</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label className="form-label">Recipients</label>
              <select className="form-select" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as NotifType }))}>
                {Object.entries(TARGET_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Channel</label>
              <select className="form-select" value={form.channel} onChange={e => setForm(p => ({ ...p, channel: e.target.value as "email"|"dashboard"|"popup" }))}>
                <option value="email">📧 Email</option>
                <option value="dashboard">🔔 Dashboard Notification</option>
                <option value="popup">🪟 Site Popup / Banner</option>
              </select>
            </div>
          </div>

          <div>
            <label className="form-label">Subject / Title</label>
            <input className="form-input" placeholder="Notification title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
          </div>

          <div>
            <label className="form-label">Message</label>
            <textarea className="form-input" rows={4} placeholder="Notification body..." value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} style={{ resize: "vertical" }} />
          </div>

          {/* Popup-specific settings */}
          {form.channel === "popup" && (
            <div style={{ padding: "1.25rem", background: "var(--gray-50)", borderRadius: "var(--radius)", border: "1px solid var(--gray-150)" }}>
              <div style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "1rem", fontSize: "0.9rem" }}>🪟 Popup Settings</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label className="form-label">Background Color</label>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <input type="color" value={form.popup.bgColor} onChange={e => setForm(p => ({ ...p, popup: { ...p.popup, bgColor: e.target.value } }))} style={{ width: "40px", height: "36px", borderRadius: "4px", border: "1px solid var(--gray-200)", cursor: "pointer" }} />
                    <input className="form-input" value={form.popup.bgColor} onChange={e => setForm(p => ({ ...p, popup: { ...p.popup, bgColor: e.target.value } }))} style={{ fontFamily: "monospace", flex: 1 }} />
                  </div>
                </div>
                <div>
                  <label className="form-label">Text Color</label>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <input type="color" value={form.popup.textColor} onChange={e => setForm(p => ({ ...p, popup: { ...p.popup, textColor: e.target.value } }))} style={{ width: "40px", height: "36px", borderRadius: "4px", border: "1px solid var(--gray-200)", cursor: "pointer" }} />
                    <input className="form-input" value={form.popup.textColor} onChange={e => setForm(p => ({ ...p, popup: { ...p.popup, textColor: e.target.value } }))} style={{ fontFamily: "monospace", flex: 1 }} />
                  </div>
                </div>
                <div>
                  <label className="form-label">CTA Button Label</label>
                  <input className="form-input" placeholder="Learn More" value={form.popup.ctaLabel} onChange={e => setForm(p => ({ ...p, popup: { ...p.popup, ctaLabel: e.target.value } }))} />
                </div>
                <div>
                  <label className="form-label">CTA URL</label>
                  <input className="form-input" placeholder="/pricing" value={form.popup.ctaUrl} onChange={e => setForm(p => ({ ...p, popup: { ...p.popup, ctaUrl: e.target.value } }))} />
                </div>
                <div style={{ gridColumn: "1/-1", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.9rem", fontWeight: 600, color: "var(--gray-700)" }}>
                    <input type="checkbox" checked={form.popup.dismissible} onChange={e => setForm(p => ({ ...p, popup: { ...p.popup, dismissible: e.target.checked } }))} style={{ accentColor: "var(--navy)", width: "16px", height: "16px" }} />
                    Allow visitors to dismiss popup
                  </label>
                </div>
              </div>

              {/* Popup live preview */}
              <div style={{ marginTop: "1rem" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--gray-500)", fontWeight: 600, marginBottom: "0.5rem" }}>PREVIEW</div>
                <div style={{ background: form.popup.bgColor, color: form.popup.textColor, padding: "1rem 1.25rem", borderRadius: "var(--radius)", display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.9375rem", marginBottom: "0.25rem" }}>{form.title || "Popup Title"}</div>
                    <div style={{ fontSize: "0.8125rem", opacity: 0.85 }}>{form.body || "Popup message text goes here."}</div>
                  </div>
                  {form.popup.ctaLabel && (
                    <div style={{ background: "rgba(255,255,255,0.2)", color: form.popup.textColor, padding: "0.4rem 1rem", borderRadius: "var(--radius-sm)", fontWeight: 700, fontSize: "0.875rem", flexShrink: 0, border: "1.5px solid rgba(255,255,255,0.4)", cursor: "default" }}>
                      {form.popup.ctaLabel}
                    </div>
                  )}
                  {form.popup.dismissible && (
                    <span style={{ opacity: 0.6, cursor: "default", fontSize: "1.25rem", lineHeight: 1 }}>×</span>
                  )}
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="form-label">Schedule For (optional — leave blank to send immediately)</label>
            <input className="form-input" type="datetime-local" value={form.scheduledFor} onChange={e => setForm(p => ({ ...p, scheduledFor: e.target.value }))} style={{ width: "320px" }} />
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem", flexWrap: "wrap" }}>
          <button className="btn-red" onClick={() => { if (!form.title || !form.body) return; onSend(buildNotif(form.scheduledFor ? "scheduled" : "sent")); }} disabled={!form.title || !form.body} style={{ flex: 2 }}>
            {form.scheduledFor ? "Schedule" : (form.channel === "popup" ? "Activate Popup" : "Send Now")}
          </button>
          <button className="btn-secondary" onClick={() => onSave(buildNotif("draft"))}>Save Draft</button>
          <button onClick={onClose} style={{ padding: "0.75rem 1rem", background: "none", border: "1px solid var(--gray-200)", borderRadius: "var(--radius)", cursor: "pointer", fontFamily: "inherit", color: "var(--gray-500)", fontWeight: 600 }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default function NotificationsAdminPage() {
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);
  const [editingNotif, setEditingNotif] = useState<Notification | null>(null);
  const [tab, setTab] = useState<"all" | "popup">("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/platform-data?key=notifications");
      const json = await res.json();
      if (json.value && Array.isArray(json.value) && json.value.length > 0) {
        setNotifs(json.value);
      } else {
        setNotifs(MOCK_NOTIFS);
        fetch("/api/admin/platform-data", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: "notifications", value: MOCK_NOTIFS }) }).catch(() => {});
      }
    } catch {
      setNotifs(MOCK_NOTIFS);
    } finally {
      setLoading(false);
    }
  }, []);

  const persist = useCallback((updated: Notification[]) => {
    setNotifs(updated);
    fetch("/api/admin/platform-data", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: "notifications", value: updated }) }).catch(() => {});
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = (n: Notification) => {
    const updated = notifs.find(x => x.id === n.id) ? notifs.map(x => x.id === n.id ? n : x) : [...notifs, n];
    persist(updated);
    setShowCompose(false);
    setEditingNotif(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this notification?")) return;
    persist(notifs.filter(n => n.id !== id));
  };

  const displayed = tab === "popup" ? notifs.filter(n => n.channel === "popup") : notifs;

  return (
    <div>
      {(showCompose || editingNotif) && (
        <ComposeModal
          initial={editingNotif ?? undefined}
          onClose={() => { setShowCompose(false); setEditingNotif(null); }}
          onSave={handleSave}
          onSend={handleSave}
        />
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.625rem", fontWeight: 800, color: "var(--navy)", marginBottom: "0.25rem" }}>Notifications & Popups</h1>
          <p style={{ color: "var(--gray-500)", fontSize: "0.875rem" }}>
            Send emails, dashboard alerts, and site-wide popups to contractors or homeowners.
          </p>
        </div>
        <button className="btn-red" onClick={() => setShowCompose(true)} style={{ padding: "0.75rem 1.5rem" }}>+ New Notification</button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0", marginBottom: "1.5rem", background: "white", borderRadius: "var(--radius)", border: "1px solid var(--gray-150)", overflow: "hidden", width: "fit-content" }}>
        {[
          { key: "all",   label: "All Notifications", count: notifs.length },
          { key: "popup", label: "🪟 Site Popups",    count: notifs.filter(n => n.channel === "popup").length },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as "all"|"popup")}
            style={{ padding: "0.75rem 1.25rem", background: tab === t.key ? "var(--navy)" : "transparent", color: tab === t.key ? "white" : "var(--gray-600)", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: tab === t.key ? 700 : 500, fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {t.label}
            <span style={{ background: tab === t.key ? "rgba(255,255,255,0.2)" : "var(--gray-100)", color: tab === t.key ? "white" : "var(--gray-500)", borderRadius: "999px", padding: "0 7px", fontSize: "0.75rem", fontWeight: 800 }}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card" style={{ padding: "3rem", textAlign: "center", color: "var(--gray-400)" }}>
          <div style={{ width: "28px", height: "28px", border: "3px solid var(--gray-200)", borderTopColor: "var(--navy)", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 0.75rem" }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          Loading…
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {displayed.length === 0 && (
            <div className="card" style={{ padding: "3rem", textAlign: "center", color: "var(--gray-400)" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🔔</div>
              No notifications yet.
            </div>
          )}
          {displayed.map(n => {
            const st = STATUS_STYLE[n.status];
            return (
              <div key={n.id} className="card" style={{ padding: "1.5rem", borderLeft: `4px solid ${n.channel === "popup" ? "#6366f1" : n.status === "sent" ? "#16a34a" : "var(--gray-200)"}` }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 700, color: "var(--navy)", fontSize: "0.9375rem" }}>{n.title}</span>
                      <span style={{ background: st.bg, color: st.color, padding: "0.2rem 0.625rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700 }}>{st.label}</span>
                      <span style={{ background: "var(--gray-100)", color: "var(--gray-600)", padding: "0.2rem 0.625rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600 }}>
                        {n.channel === "email" ? "📧 Email" : n.channel === "popup" ? "🪟 Popup" : "🔔 Dashboard"}
                      </span>
                    </div>
                    <p style={{ color: "var(--gray-600)", fontSize: "0.875rem", lineHeight: 1.65, marginBottom: "0.625rem" }}>{n.body}</p>

                    {/* Popup preview */}
                    {n.channel === "popup" && n.popup && (
                      <div style={{ background: n.popup.bgColor, color: n.popup.textColor, padding: "0.75rem 1rem", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.625rem", maxWidth: "480px" }}>
                        <div style={{ flex: 1, fontSize: "0.8125rem" }}>{n.body.slice(0, 60)}{n.body.length > 60 ? "…" : ""}</div>
                        {n.popup.ctaLabel && <span style={{ background: "rgba(255,255,255,0.2)", padding: "0.25rem 0.625rem", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 700, border: "1px solid rgba(255,255,255,0.3)", flexShrink: 0 }}>{n.popup.ctaLabel}</span>}
                      </div>
                    )}

                    <div style={{ fontSize: "0.8125rem", color: "var(--gray-400)" }}>
                      To: <strong style={{ color: "var(--gray-600)" }}>{TARGET_LABELS[n.type]}</strong>
                      {n.sentAt && <span style={{ marginLeft: "1rem" }}>Sent: {n.sentAt}</span>}
                      {n.scheduledFor && n.status === "scheduled" && <span style={{ marginLeft: "1rem" }}>Scheduled: {n.scheduledFor}</span>}
                      {n.recipients > 0 && <span style={{ marginLeft: "1rem" }}>{n.recipients} recipients</span>}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0, flexWrap: "wrap" }}>
                    <button onClick={() => setEditingNotif(n)}
                      style={{ padding: "0.5rem 1rem", background: "white", border: "1px solid var(--gray-200)", borderRadius: "var(--radius-sm)", fontSize: "0.8125rem", fontWeight: 600, cursor: "pointer", color: "var(--navy)", fontFamily: "inherit" }}>
                      Edit
                    </button>
                    {n.status === "draft" && (
                      <button onClick={() => handleSave({ ...n, status: "sent", sentAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), recipients: 287 })}
                        style={{ padding: "0.5rem 1rem", background: "var(--navy)", color: "white", border: "none", borderRadius: "var(--radius-sm)", fontSize: "0.8125rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                        {n.channel === "popup" ? "Activate" : "Send Now"}
                      </button>
                    )}
                    <button onClick={() => handleDelete(n.id)}
                      style={{ padding: "0.5rem 0.75rem", background: "rgba(199,25,26,0.06)", color: "var(--red)", border: "1px solid rgba(199,25,26,0.15)", borderRadius: "var(--radius-sm)", fontSize: "0.8125rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
