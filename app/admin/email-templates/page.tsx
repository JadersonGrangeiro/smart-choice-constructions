"use client";
import { useState, useEffect, useCallback } from "react";

const DEFAULT_TEMPLATES = [
  { id: "welcome",           category: "Onboarding",  subject: "Welcome to Smart Choice Constructions!",
    previewText: "Your profile is being reviewed. Here's what happens next.",
    body: 'Hi {{contractor_name}},\n\nWelcome to Smart Choice Constructions! Your registration has been received and is currently under review.\n\nExpected review time: 1–2 business days\n\nWhile you wait, you can:\n• Complete your profile to improve your ranking\n• Upload your contractor license and insurance\n• Add portfolio photos\n\nIf you have any questions, contact us at {{support_email}}.\n\nBest,\nThe Smart Choice Team',
    status: "active", lastEdited: "Jun 1, 2025", sentCount: 287 },
  { id: "approved",          category: "Onboarding",  subject: "Your Profile is Live — Start Getting Leads!",
    previewText: "Your Smart Choice profile is now visible to homeowners.",
    body: 'Hi {{contractor_name}},\n\nGreat news — your Smart Choice profile is now live!\n\nView your public profile:\n{{profile_url}}\n\nTo improve your visibility:\n1. Add at least 5 portfolio photos\n2. Upload your license and insurance for verification badges\n3. Respond quickly to leads (faster response = higher ranking)\n\nDashboard: {{dashboard_url}}\n\nWelcome aboard,\nThe Smart Choice Team',
    status: "active", lastEdited: "Jun 1, 2025", sentCount: 241 },
  { id: "payment_failed",    category: "Billing",     subject: "Action Required: Payment Failed",
    previewText: "Your recent payment attempt failed. Update your card to stay live.",
    body: 'Hi {{contractor_name}},\n\nYour payment of ${{amount}} on {{date}} was unsuccessful.\n\nYour profile will remain live for {{grace_days}} more days. After that, it will be hidden from search results.\n\nUpdate your payment method:\n{{update_payment_url}}\n\nIf you need help, reply to this email.\n\nSmart Choice Constructions',
    status: "active", lastEdited: "Jun 1, 2025", sentCount: 14 },
  { id: "payment_confirmed", category: "Billing",     subject: "Payment Confirmed — ${{amount}}",
    previewText: "Your monthly subscription has been renewed successfully.",
    body: 'Hi {{contractor_name}},\n\nYour monthly subscription payment of ${{amount}} has been processed successfully.\n\nNext billing date: {{next_billing_date}}\n\nView invoice: {{invoice_url}}\n\nThank you for being part of Smart Choice.\n\nSmart Choice Constructions',
    status: "active", lastEdited: "Jun 1, 2025", sentCount: 2156 },
  { id: "doc_approved",      category: "Documents",   subject: "Document Approved — Badge Awarded",
    previewText: "Your {{doc_type}} has been reviewed and approved.",
    body: 'Hi {{contractor_name}},\n\nYour {{doc_type}} has been reviewed and approved.\n\nBadge awarded: {{badge_name}}\n\nThis badge is now visible on your public profile and will improve your search ranking.\n\nView your profile: {{profile_url}}\n\nSmart Choice Team',
    status: "active", lastEdited: "Jun 5, 2025", sentCount: 189 },
  { id: "doc_rejected",      category: "Documents",   subject: "Document Review — Action Required",
    previewText: "Your document requires attention before it can be approved.",
    body: 'Hi {{contractor_name}},\n\nWe were unable to approve your {{doc_type}}.\n\nReason: {{rejection_reason}}\n\nPlease resubmit a corrected document:\n{{upload_url}}\n\nIf you have questions, reply to this email.\n\nSmart Choice Team',
    status: "active", lastEdited: "Jun 5, 2025", sentCount: 23 },
  { id: "lead_notification", category: "Leads",       subject: "New Lead: {{service}} in {{city}}",
    previewText: "A homeowner in {{city}} is looking for {{service}}.",
    body: 'Hi {{contractor_name}},\n\nYou have a new lead!\n\nService: {{service}}\nLocation: {{city}}, {{state}}\nBudget: {{budget}}\nProject description: {{description}}\n\nRespond now (contractors who respond within 1 hour are 3× more likely to win the job):\n{{lead_url}}\n\nSmart Choice Constructions',
    status: "active", lastEdited: "Jun 10, 2025", sentCount: 3421 },
  { id: "password_reset",    category: "Account",     subject: "Reset Your Password",
    previewText: "Click the link below to reset your password. Expires in 1 hour.",
    body: "Hi {{name}},\n\nWe received a request to reset your password.\n\nReset your password (expires in 1 hour):\n{{reset_url}}\n\nIf you didn't request this, you can safely ignore this email.\n\nSmart Choice Constructions",
    status: "active", lastEdited: "Jun 1, 2025", sentCount: 67 },
  { id: "subscription_cancelled", category: "Billing", subject: "Subscription Cancelled — We're Sorry to See You Go",
    previewText: "Your Smart Choice subscription has been cancelled.",
    body: "Hi {{contractor_name}},\n\nYour Smart Choice subscription has been cancelled as of {{date}}.\n\nYour profile will remain visible until {{end_date}}. After that, it will be removed from search results.\n\nIf you'd like to reactivate, you can do so at any time:\n{{reactivate_url}}\n\nWe'd love to know what we could have done better. Reply to this email with any feedback.\n\nSmart Choice Constructions",
    status: "active", lastEdited: "Jun 15, 2025", sentCount: 8 },
  { id: "profile_incomplete", category: "Onboarding", subject: "Complete Your Profile to Start Getting Leads",
    previewText: "You're missing key sections that affect your search ranking.",
    body: "Hi {{contractor_name}},\n\nYour Smart Choice profile is live, but missing some important elements that affect your visibility in search results.\n\nComplete these sections to improve your ranking:\n• Add at least 5 portfolio photos — profiles with photos get 4× more views\n• Upload your license and insurance for verification badges\n• Add a personal bio that explains your specialty\n• List your service area cities\n\nComplete your profile:\n{{dashboard_url}}\n\nSmart Choice Team",
    status: "active", lastEdited: "Jun 20, 2025", sentCount: 156 },
  { id: "review_received",   category: "Leads",       subject: "New Review on Your Profile — {{rating}} Stars",
    previewText: "A homeowner left you a review. See what they said.",
    body: "Hi {{contractor_name}},\n\nYou've received a new review!\n\nRating: {{rating}}/5 stars\nProject type: {{project_type}}\n\nWhat they said:\n\"{{review_text}}\"\n\nView your profile to see the full review:\n{{profile_url}}\n\nPositive reviews significantly improve your search ranking and conversion rate.\n\nSmart Choice Team",
    status: "active", lastEdited: "Jun 22, 2025", sentCount: 312 },
];

type Template = typeof DEFAULT_TEMPLATES[0];

const CATEGORY_COLORS: Record<string, string> = {
  Onboarding: "#0369a1", Billing: "#047857", Documents: "#6d28d9",
  Leads: "#b45309", Account: "#374151",
};

const VARIABLES = [
  "{{contractor_name}}","{{amount}}","{{date}}","{{profile_url}}","{{dashboard_url}}",
  "{{invoice_url}}","{{support_email}}","{{doc_type}}","{{badge_name}}","{{rejection_reason}}",
  "{{city}}","{{service}}","{{budget}}","{{name}}","{{reset_url}}","{{next_billing_date}}",
  "{{grace_days}}","{{upload_url}}","{{lead_url}}","{{state}}","{{description}}",
  "{{end_date}}","{{reactivate_url}}","{{rating}}","{{project_type}}","{{review_text}}",
  "{{update_payment_url}}",
];

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>(DEFAULT_TEMPLATES);
  const [selected, setSelected]   = useState<string | null>(null);
  const [editing, setEditing]     = useState(false);
  const [editBody, setEditBody]   = useState("");
  const [editSubject, setEditSubject] = useState("");
  const [editPreview, setEditPreview] = useState("");
  const [saving, setSaving]       = useState(false);
  const [toast, setToast]         = useState<string | null>(null);
  const [catFilter, setCatFilter] = useState("All");

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(null), 3000); };

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/platform-data?key=email_templates");
      const json = await res.json();
      if (json.value && Array.isArray(json.value) && json.value.length > 0) {
        setTemplates(json.value);
      } else {
        // Seed with defaults
        setTemplates(DEFAULT_TEMPLATES);
        fetch("/api/admin/platform-data", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: "email_templates", value: DEFAULT_TEMPLATES }) }).catch(() => {});
      }
    } catch {}
  }, []);

  useEffect(() => { load(); }, [load]);

  const selectedTemplate = templates.find(t => t.id === selected);

  const startEdit = (t: Template) => {
    setEditBody(t.body);
    setEditSubject(t.subject);
    setEditPreview(t.previewText);
    setEditing(true);
  };

  const saveTemplate = async () => {
    if (!selectedTemplate) return;
    setSaving(true);
    try {
      const now = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      const updated = templates.map(t => t.id === selectedTemplate.id
        ? { ...t, subject: editSubject, body: editBody, previewText: editPreview, lastEdited: now }
        : t
      );
      await fetch("/api/admin/platform-data", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: "email_templates", value: updated }) });
      setTemplates(updated);
      setEditing(false);
      showToast("Template saved!");
    } catch { showToast("Save failed"); }
    finally { setSaving(false); }
  };

  const cats = ["All", ...Array.from(new Set(templates.map(t => t.category)))];
  const filtered = catFilter === "All" ? templates : templates.filter(t => t.category === catFilter);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "1.5rem" }}>
      {toast && <div style={{ position: "fixed", bottom: "1.5rem", right: "1.5rem", zIndex: 9999, background: "var(--navy)", color: "white", padding: "0.875rem 1.5rem", borderRadius: "var(--radius)", fontWeight: 600, fontSize: "0.9rem", boxShadow: "var(--shadow-lg)" }}>{toast}</div>}

      {/* List */}
      <div>
        <h1 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--navy)", marginBottom: "1rem" }}>Email Templates</h1>
        <select className="form-input" value={catFilter} onChange={e => setCatFilter(e.target.value)} style={{ marginBottom: "0.875rem" }}>
          {cats.map(c => <option key={c}>{c}</option>)}
        </select>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
          {filtered.map(t => (
            <button key={t.id} onClick={() => { setSelected(t.id); setEditing(false); }} style={{
              textAlign: "left", padding: "0.875rem 1rem", border: "1.5px solid",
              borderColor: selected === t.id ? "var(--navy)" : "var(--gray-150)",
              borderRadius: "var(--radius)", background: selected === t.id ? "rgba(22,46,94,0.04)" : "white",
              cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                <span style={{ background: `${CATEGORY_COLORS[t.category] ?? "#374151"}18`, color: CATEGORY_COLORS[t.category] ?? "#374151", padding: "0.15rem 0.5rem", borderRadius: "999px", fontSize: "0.65rem", fontWeight: 700 }}>{t.category}</span>
              </div>
              <div style={{ fontWeight: 600, color: "var(--navy)", fontSize: "0.875rem", marginBottom: "0.25rem" }}>{t.id.replace(/_/g," ").replace(/\b\w/g,l=>l.toUpperCase())}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--gray-400)" }}>{t.sentCount.toLocaleString()} sent · {t.lastEdited}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Editor */}
      {selectedTemplate ? (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h2 style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "0.25rem" }}>{selectedTemplate.id.replace(/_/g," ").replace(/\b\w/g,l=>l.toUpperCase())}</h2>
              <p style={{ color: "var(--gray-400)", fontSize: "0.8125rem" }}>Last edited {selectedTemplate.lastEdited} · {selectedTemplate.sentCount.toLocaleString()} sent</p>
            </div>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              {editing ? (
                <>
                  <button className="btn-secondary" onClick={() => setEditing(false)} style={{ padding: "0.75rem 1.25rem" }}>Cancel</button>
                  <button className="btn-red" onClick={saveTemplate} disabled={saving} style={{ padding: "0.75rem 1.25rem" }}>{saving ? "Saving…" : "Save Changes"}</button>
                </>
              ) : (
                <button className="btn-red" onClick={() => startEdit(selectedTemplate)} style={{ padding: "0.75rem 1.25rem" }}>Edit Template</button>
              )}
            </div>
          </div>

          <div className="card" style={{ padding: "1.75rem", marginBottom: "1.25rem" }}>
            <div style={{ marginBottom: "1.25rem" }}>
              <label className="form-label">Subject Line</label>
              {editing ? (
                <input className="form-input" value={editSubject} onChange={e => setEditSubject(e.target.value)} />
              ) : (
                <div style={{ padding: "0.75rem 1rem", background: "var(--gray-50)", borderRadius: "var(--radius-sm)", fontSize: "0.9375rem", color: "var(--navy)", fontWeight: 500, fontFamily: "monospace" }}>{selectedTemplate.subject}</div>
              )}
            </div>
            <div style={{ marginBottom: "1.25rem" }}>
              <label className="form-label">Preview Text <span style={{ fontWeight: 400, color: "var(--gray-400)" }}>(shown in inbox before opening)</span></label>
              {editing ? (
                <input className="form-input" value={editPreview} onChange={e => setEditPreview(e.target.value)} />
              ) : (
                <div style={{ padding: "0.75rem 1rem", background: "var(--gray-50)", borderRadius: "var(--radius-sm)", fontSize: "0.875rem", color: "var(--gray-500)" }}>{selectedTemplate.previewText}</div>
              )}
            </div>
            <div>
              <label className="form-label">Email Body</label>
              {editing ? (
                <textarea className="form-input" rows={16} value={editBody} onChange={e => setEditBody(e.target.value)} style={{ fontFamily: "monospace", fontSize: "0.875rem", resize: "vertical" }} />
              ) : (
                <pre style={{ padding: "1rem", background: "var(--gray-50)", borderRadius: "var(--radius-sm)", fontSize: "0.8125rem", color: "var(--gray-700)", lineHeight: 1.75, overflowX: "auto", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                  {selectedTemplate.body}
                </pre>
              )}
            </div>
          </div>

          <div className="card" style={{ padding: "1.25rem" }}>
            <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--navy)", marginBottom: "0.75rem" }}>Available Variables</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
              {VARIABLES.map(v => (
                <code key={v} style={{ background: "rgba(22,46,94,0.07)", color: "var(--navy)", padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.75rem", cursor: "pointer" }}
                  onClick={() => { if (editing) { setEditBody(b => b + v); } }}>
                  {v}
                </code>
              ))}
            </div>
            {editing && <p style={{ fontSize: "0.75rem", color: "var(--gray-400)", marginTop: "0.75rem" }}>Click a variable to insert it at the end of the body.</p>}
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "400px", color: "var(--gray-400)", flexDirection: "column", gap: "1rem" }}>
          <div style={{ fontSize: "3rem" }}>📧</div>
          <div style={{ fontWeight: 600 }}>Select a template to view or edit</div>
          <div style={{ fontSize: "0.875rem" }}>{templates.length} templates across {new Set(templates.map(t=>t.category)).size} categories</div>
        </div>
      )}
    </div>
  );
}
