"use client";
import { useState } from "react";

const TEMPLATES = [
  { id: "welcome",           category: "Onboarding",  subject: "Welcome to Smart Choice Constructions!",                  status: "active",   lastEdited: "Jun 1, 2025",  sentCount: 287,
    previewText: "Your profile is being reviewed. Here's what happens next.",
    body: 'Hi {{contractor_name}},\n\nWelcome to Smart Choice Constructions! Your registration has been received and is currently under review.\n\nExpected review time: 1–2 business days\n\nWhile you wait, you can:\n• Complete your profile to improve your ranking\n• Upload your contractor license and insurance\n• Add portfolio photos\n\nIf you have any questions, contact us at {{support_email}}.\n\nBest,\nThe Smart Choice Team' },
  { id: "approved",          category: "Onboarding",  subject: "Your Profile is Live — Start Getting Leads!",             status: "active",   lastEdited: "Jun 1, 2025",  sentCount: 241,
    previewText: "Your Smart Choice profile is now visible to homeowners.",
    body: 'Hi {{contractor_name}},\n\nGreat news — your Smart Choice profile is now live!\n\nView your public profile:\n{{profile_url}}\n\nTo improve your visibility:\n1. Add at least 5 portfolio photos\n2. Upload your license and insurance for verification badges\n3. Respond quickly to leads (faster response = higher ranking)\n\nDashboard: {{dashboard_url}}\n\nWelcome aboard,\nThe Smart Choice Team' },
  { id: "payment_failed",    category: "Billing",     subject: "Action Required: Payment Failed",                          status: "active",   lastEdited: "Jun 1, 2025",  sentCount: 14,
    previewText: "Your recent payment attempt failed. Update your card to stay live.",
    body: 'Hi {{contractor_name}},\n\nYour payment of ${{amount}} on {{date}} was unsuccessful.\n\nYour profile will remain live for {{grace_days}} more days. After that, it will be hidden from search results.\n\nUpdate your payment method:\n{{update_payment_url}}\n\nIf you need help, reply to this email.\n\nSmart Choice Constructions' },
  { id: "payment_confirmed", category: "Billing",     subject: "Payment Confirmed — ${{amount}}",                         status: "active",   lastEdited: "Jun 1, 2025",  sentCount: 2156,
    previewText: "Your monthly subscription has been renewed successfully.",
    body: 'Hi {{contractor_name}},\n\nYour monthly subscription payment of ${{amount}} has been processed successfully.\n\nNext billing date: {{next_billing_date}}\n\nView invoice: {{invoice_url}}\n\nThank you for being part of Smart Choice.\n\nSmart Choice Constructions' },
  { id: "doc_approved",      category: "Documents",   subject: "Document Approved — Badge Awarded",                        status: "active",   lastEdited: "Jun 5, 2025",  sentCount: 189,
    previewText: "Your {{doc_type}} has been reviewed and approved.",
    body: 'Hi {{contractor_name}},\n\nYour {{doc_type}} has been reviewed and approved.\n\nBadge awarded: {{badge_name}}\n\nThis badge is now visible on your public profile and will improve your search ranking.\n\nView your profile: {{profile_url}}\n\nSmart Choice Team' },
  { id: "doc_rejected",      category: "Documents",   subject: "Document Review — Action Required",                        status: "active",   lastEdited: "Jun 5, 2025",  sentCount: 23,
    previewText: "Your document requires attention before it can be approved.",
    body: 'Hi {{contractor_name}},\n\nWe were unable to approve your {{doc_type}}.\n\nReason: {{rejection_reason}}\n\nPlease resubmit a corrected document:\n{{upload_url}}\n\nIf you have questions, reply to this email.\n\nSmart Choice Team' },
  { id: "lead_notification", category: "Leads",       subject: "New Lead: {{service}} in {{city}}",                        status: "active",   lastEdited: "Jun 10, 2025", sentCount: 3421,
    previewText: "A homeowner in {{city}} is looking for {{service}}.",
    body: 'Hi {{contractor_name}},\n\nYou have a new lead!\n\nService: {{service}}\nLocation: {{city}}, {{state}}\nBudget: {{budget}}\nProject description: {{description}}\n\nRespond now (contractors who respond within 1 hour are 3× more likely to win the job):\n{{lead_url}}\n\nSmart Choice Constructions' },
  { id: "password_reset",    category: "Account",     subject: "Reset Your Password",                                      status: "active",   lastEdited: "Jun 1, 2025",  sentCount: 67,
    previewText: "Click the link below to reset your password. Expires in 1 hour.",
    body: 'Hi {{name}},\n\nWe received a request to reset your password.\n\nReset your password (expires in 1 hour):\n{{reset_url}}\n\nIf you didn\'t request this, you can safely ignore this email.\n\nSmart Choice Constructions' },
];

const CATEGORY_COLORS: Record<string, string> = {
  Onboarding: "#0369a1", Billing: "#047857", Documents: "#6d28d9", Leads: "#b45309", Account: "#374151",
};

export default function EmailTemplatesPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editBody, setEditBody] = useState("");
  const [editSubject, setEditSubject] = useState("");
  const selectedTemplate = TEMPLATES.find(t => t.id === selected);

  const startEdit = (t: typeof TEMPLATES[0]) => {
    setEditBody(t.body);
    setEditSubject(t.subject);
    setEditing(true);
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "1.5rem" }}>
      {/* List */}
      <div>
        <h1 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--navy)", marginBottom: "1.5rem" }}>Email Templates</h1>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
          {TEMPLATES.map(t => (
            <button key={t.id} onClick={() => { setSelected(t.id); setEditing(false); }} style={{
              textAlign: "left", padding: "0.875rem 1rem", border: "1.5px solid",
              borderColor: selected === t.id ? "var(--navy)" : "var(--gray-150)",
              borderRadius: "var(--radius)", background: selected === t.id ? "rgba(22,46,94,0.04)" : "white",
              cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                <span style={{ background: `${CATEGORY_COLORS[t.category]}18`, color: CATEGORY_COLORS[t.category], padding: "0.15rem 0.5rem", borderRadius: "999px", fontSize: "0.65rem", fontWeight: 700 }}>{t.category}</span>
              </div>
              <div style={{ fontWeight: 600, color: "var(--navy)", fontSize: "0.875rem", marginBottom: "0.25rem" }}>{t.id.replace(/_/g," ").replace(/\b\w/g,l=>l.toUpperCase())}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--gray-400)" }}>{t.sentCount.toLocaleString()} sent</div>
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
                  <button className="btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
                  <button className="btn-red">Save Changes</button>
                </>
              ) : (
                <button className="btn-red" onClick={() => startEdit(selectedTemplate)}>Edit Template</button>
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
              <input className="form-input" defaultValue={selectedTemplate.previewText} readOnly={!editing} style={{ color: editing ? undefined : "var(--gray-500)" }} />
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

          {/* Variables reference */}
          <div className="card" style={{ padding: "1.25rem" }}>
            <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--navy)", marginBottom: "0.75rem" }}>Available Variables</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
              {["{{contractor_name}}","{{amount}}","{{date}}","{{profile_url}}","{{dashboard_url}}","{{invoice_url}}","{{support_email}}","{{doc_type}}","{{badge_name}}","{{rejection_reason}}","{{city}}","{{service}}","{{budget}}","{{name}}","{{reset_url}}","{{next_billing_date}}","{{grace_days}}","{{upload_url}}","{{lead_url}}","{{state}}","{{description}}"].map(v => (
                <code key={v} style={{ background: "rgba(22,46,94,0.07)", color: "var(--navy)", padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.75rem" }}>{v}</code>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "400px", color: "var(--gray-400)", flexDirection: "column", gap: "1rem" }}>
          <div style={{ fontSize: "3rem" }}>📧</div>
          <div style={{ fontWeight: 600 }}>Select a template to view or edit</div>
        </div>
      )}
    </div>
  );
}
