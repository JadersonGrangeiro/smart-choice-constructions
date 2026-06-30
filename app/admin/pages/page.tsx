"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface StaticPage {
  id: string; title: string; slug: string; description: string;
  content: string; lastEdited: string; status: "published" | "draft";
  editable: boolean; wordCount: number;
}

const DEFAULT_PAGES: StaticPage[] = [
  { id: "pg_about",     title: "About Us",         slug: "/about",         description: "Company story, mission, and team.",                          content: "", lastEdited: "Jun 1, 2025",  status: "published", editable: true,  wordCount: 420 },
  { id: "pg_how",       title: "How It Works",     slug: "/how-it-works",  description: "Step-by-step guide for homeowners and contractors.",         content: "", lastEdited: "Jun 5, 2025",  status: "published", editable: true,  wordCount: 380 },
  { id: "pg_pricing",   title: "Pricing",           slug: "/pricing",       description: "Subscription plans and billing information.",                content: "", lastEdited: "Jun 10, 2025", status: "published", editable: true,  wordCount: 290 },
  { id: "pg_terms",     title: "Terms of Service", slug: "/terms",         description: "Legal terms governing use of the platform.",                content: "", lastEdited: "Jun 1, 2025",  status: "published", editable: false, wordCount: 2100 },
  { id: "pg_privacy",   title: "Privacy Policy",   slug: "/privacy",       description: "How we collect, use, and protect user data.",               content: "", lastEdited: "Jun 1, 2025",  status: "published", editable: false, wordCount: 1850 },
  { id: "pg_cookies",   title: "Cookie Policy",    slug: "/cookies",       description: "Cookie usage and consent information.",                     content: "", lastEdited: "Jun 1, 2025",  status: "published", editable: false, wordCount: 420 },
  { id: "pg_careers",   title: "Careers",           slug: "/careers",       description: "Open positions and company culture.",                       content: "", lastEdited: "Jun 15, 2025", status: "published", editable: true,  wordCount: 310 },
  { id: "pg_contact",   title: "Contact",           slug: "/contact",       description: "Contact form and support information.",                     content: "", lastEdited: "Jun 1, 2025",  status: "published", editable: true,  wordCount: 150 },
  { id: "pg_faq",       title: "FAQ",               slug: "/faq",           description: "Frequently asked questions for homeowners and contractors.", content: "", lastEdited: "Jun 8, 2025",  status: "published", editable: true,  wordCount: 890 },
  { id: "pg_supplier",  title: "Join as Supplier", slug: "/join-supplier", description: "Landing page for supplier registration.",                   content: "", lastEdited: "",             status: "draft",     editable: true,  wordCount: 0 },
  { id: "pg_investors", title: "Investors",         slug: "/investors",     description: "Investor relations and platform metrics.",                  content: "", lastEdited: "",             status: "draft",     editable: true,  wordCount: 0 },
];

async function loadPages(): Promise<StaticPage[]> {
  try {
    const r = await fetch("/api/admin/platform-data?key=pages_config");
    const d = await r.json();
    if (Array.isArray(d.value) && d.value.length > 0) return d.value;
  } catch { /* fall through */ }
  return DEFAULT_PAGES;
}

async function savePages(pages: StaticPage[]) {
  await fetch("/api/admin/platform-data", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key: "pages_config", value: pages }),
  });
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "0.625rem 0.875rem", border: "1.5px solid var(--gray-200)",
  borderRadius: "6px", fontFamily: "inherit", fontSize: "0.9375rem",
  color: "var(--gray-800)", outline: "none", boxSizing: "border-box",
};

export default function PagesAdminPage() {
  const [pages, setPages]       = useState<StaticPage[]>([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [showNew, setShowNew]   = useState(false);
  const [editPage, setEditPage] = useState<StaticPage | null>(null);
  const [newPage, setNewPage]   = useState({ title: "", slug: "", description: "" });

  useEffect(() => {
    loadPages().then(p => { setPages(p); setLoading(false); });
  }, []);

  const persist = useCallback(async (updated: StaticPage[]) => {
    setSaving(true);
    await savePages(updated);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, []);

  const toggleStatus = (id: string) => {
    const updated = pages.map(p =>
      p.id === id ? { ...p, status: p.status === "published" ? "draft" : "published", lastEdited: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) } as StaticPage : p
    );
    setPages(updated);
    persist(updated);
  };

  const saveEdit = () => {
    if (!editPage) return;
    const wc = editPage.content.trim().split(/\s+/).filter(Boolean).length;
    const updated = pages.map(p =>
      p.id === editPage.id
        ? { ...editPage, wordCount: wc || p.wordCount, lastEdited: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) }
        : p
    );
    setPages(updated);
    persist(updated);
    setEditPage(null);
  };

  const addPage = () => {
    if (!newPage.title || !newPage.slug) return;
    const updated = [...pages, {
      ...newPage, id: `pg_${Date.now()}`, content: "",
      lastEdited: "", status: "draft" as const, editable: true, wordCount: 0,
    }];
    setPages(updated);
    persist(updated);
    setShowNew(false);
    setNewPage({ title: "", slug: "", description: "" });
  };

  const deletePage = (id: string) => {
    if (!confirm("Delete this page?")) return;
    const updated = pages.filter(p => p.id !== id);
    setPages(updated);
    persist(updated);
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "300px", flexDirection: "column", gap: "1rem", color: "var(--gray-400)" }}>
      <div style={{ width: "28px", height: "28px", border: "3px solid var(--gray-200)", borderTopColor: "var(--navy)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      Loading pages…
    </div>
  );

  return (
    <div>
      {/* ── Edit Modal ── */}
      {editPage && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ background: "white", borderRadius: "var(--radius-xl)", width: "100%", maxWidth: "760px", maxHeight: "90vh", overflow: "auto", boxShadow: "var(--shadow-xl)" }}>
            <div style={{ padding: "1.75rem 2rem", borderBottom: "1px solid var(--gray-150)", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: "white", zIndex: 1 }}>
              <h2 style={{ fontWeight: 800, color: "var(--navy)", fontSize: "1.125rem" }}>Edit Page — {editPage.title}</h2>
              <button onClick={() => setEditPage(null)} style={{ background: "none", border: "none", fontSize: "1.25rem", color: "var(--gray-400)", cursor: "pointer" }}>✕</button>
            </div>

            <div style={{ padding: "1.75rem 2rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontWeight: 600, fontSize: "0.8125rem", color: "var(--gray-700)", marginBottom: "0.375rem" }}>Page Title</label>
                  <input style={inputStyle} value={editPage.title}
                    onChange={e => setEditPage(p => p ? { ...p, title: e.target.value } : p)} />
                </div>
                <div>
                  <label style={{ display: "block", fontWeight: 600, fontSize: "0.8125rem", color: "var(--gray-700)", marginBottom: "0.375rem" }}>URL Slug</label>
                  <input style={{ ...inputStyle, fontFamily: "monospace" }} value={editPage.slug}
                    onChange={e => setEditPage(p => p ? { ...p, slug: e.target.value } : p)} />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontWeight: 600, fontSize: "0.8125rem", color: "var(--gray-700)", marginBottom: "0.375rem" }}>Description / SEO Subtitle</label>
                <input style={inputStyle} value={editPage.description}
                  onChange={e => setEditPage(p => p ? { ...p, description: e.target.value } : p)} />
              </div>

              <div>
                <label style={{ display: "block", fontWeight: 600, fontSize: "0.8125rem", color: "var(--gray-700)", marginBottom: "0.375rem" }}>
                  Status
                </label>
                <select
                  value={editPage.status}
                  onChange={e => setEditPage(p => p ? { ...p, status: e.target.value as "published" | "draft" } : p)}
                  style={{ ...inputStyle, width: "auto", minWidth: "160px" }}
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontWeight: 600, fontSize: "0.8125rem", color: "var(--gray-700)", marginBottom: "0.375rem" }}>
                  Page Content
                  <span style={{ fontWeight: 400, color: "var(--gray-400)", marginLeft: "0.5rem" }}>
                    ({editPage.content.trim().split(/\s+/).filter(Boolean).length} words)
                  </span>
                </label>
                <textarea
                  value={editPage.content}
                  onChange={e => setEditPage(p => p ? { ...p, content: e.target.value } : p)}
                  rows={14}
                  placeholder="Write the page content here. You can use plain text or simple Markdown (# Heading, **bold**, *italic*, - list item)."
                  style={{ ...inputStyle, resize: "vertical", lineHeight: 1.65, fontFamily: "inherit" }}
                />
                <p style={{ fontSize: "0.8125rem", color: "var(--gray-400)", marginTop: "0.375rem" }}>
                  Supports basic Markdown: # H1, ## H2, **bold**, *italic*, - list
                </p>
              </div>
            </div>

            <div style={{ padding: "1.25rem 2rem", borderTop: "1px solid var(--gray-150)", display: "flex", gap: "0.75rem", justifyContent: "flex-end", position: "sticky", bottom: 0, background: "white" }}>
              <button onClick={() => setEditPage(null)} style={{ padding: "0.625rem 1.25rem", background: "var(--gray-100)", border: "none", borderRadius: "6px", fontFamily: "inherit", fontSize: "0.9375rem", fontWeight: 600, color: "var(--gray-600)", cursor: "pointer" }}>
                Cancel
              </button>
              <button onClick={saveEdit} className="btn-red" style={{ padding: "0.625rem 1.5rem" }}>
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.625rem", fontWeight: 800, color: "var(--navy)", marginBottom: "0.25rem" }}>Static Pages</h1>
          <p style={{ color: "var(--gray-500)", fontSize: "0.875rem" }}>
            {pages.filter(p => p.status === "published").length} published · {pages.filter(p => p.status === "draft").length} drafts
            {saving && <span style={{ marginLeft: "0.75rem", color: "var(--gray-400)" }}>Saving…</span>}
            {saved && <span style={{ marginLeft: "0.75rem", color: "#16a34a", fontWeight: 600 }}>✓ Saved</span>}
          </p>
        </div>
        <button className="btn-red" onClick={() => setShowNew(true)} style={{ padding: "0.75rem 1.5rem" }}>+ New Page</button>
      </div>

      {/* ── New Page form ── */}
      {showNew && (
        <div className="card" style={{ padding: "1.75rem", marginBottom: "1.5rem", border: "2px solid var(--navy)" }}>
          <h3 style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "1.25rem" }}>New Page</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label className="form-label">Page Title *</label>
              <input className="form-input" value={newPage.title}
                onChange={e => setNewPage(p => ({ ...p, title: e.target.value, slug: `/${e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-")}` }))} />
            </div>
            <div>
              <label className="form-label">URL Slug *</label>
              <input className="form-input" value={newPage.slug}
                onChange={e => setNewPage(p => ({ ...p, slug: e.target.value }))} style={{ fontFamily: "monospace" }} />
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <label className="form-label">Description</label>
              <input className="form-input" value={newPage.description}
                onChange={e => setNewPage(p => ({ ...p, description: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
            <button className="btn-red" onClick={addPage}>Create Page</button>
            <button className="btn-secondary" onClick={() => setShowNew(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* ── Table ── */}
      <div className="card" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--gray-50)", borderBottom: "1px solid var(--gray-150)" }}>
              {["Page", "URL", "Words", "Status", "Last Edited", "Actions"].map(h => (
                <th key={h} style={{ padding: "0.875rem 1.25rem", textAlign: "left", fontSize: "0.8125rem", fontWeight: 700, color: "var(--gray-500)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pages.map((pg, i) => (
              <tr key={pg.id} style={{ borderBottom: i < pages.length - 1 ? "1px solid var(--gray-50)" : "none" }}>
                <td style={{ padding: "1rem 1.25rem" }}>
                  <div style={{ fontWeight: 700, color: "var(--navy)", fontSize: "0.9375rem" }}>{pg.title}</div>
                  <div style={{ fontSize: "0.8125rem", color: "var(--gray-400)", marginTop: "0.125rem" }}>{pg.description}</div>
                </td>
                <td style={{ padding: "1rem 1.25rem" }}>
                  <code style={{ background: "var(--gray-100)", padding: "2px 8px", borderRadius: "4px", fontSize: "0.8125rem", color: "var(--gray-600)" }}>{pg.slug}</code>
                </td>
                <td style={{ padding: "1rem 1.25rem", fontSize: "0.875rem", color: "var(--gray-500)" }}>
                  {pg.wordCount > 0 ? pg.wordCount.toLocaleString() : "—"}
                </td>
                <td style={{ padding: "1rem 1.25rem" }}>
                  <span style={{ background: pg.status === "published" ? "rgba(22,163,74,0.1)" : "var(--gray-100)", color: pg.status === "published" ? "#16a34a" : "var(--gray-500)", padding: "0.2rem 0.625rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700 }}>
                    {pg.status === "published" ? "Published" : "Draft"}
                  </span>
                </td>
                <td style={{ padding: "1rem 1.25rem", fontSize: "0.875rem", color: "var(--gray-400)" }}>
                  {pg.lastEdited || "Never"}
                </td>
                <td style={{ padding: "1rem 1.25rem" }}>
                  <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap" }}>
                    {pg.status === "published" && (
                      <Link href={pg.slug} target="_blank" style={{ padding: "0.375rem 0.625rem", background: "var(--gray-100)", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 600, color: "var(--gray-700)", textDecoration: "none" }}>
                        View
                      </Link>
                    )}
                    {/* Edit button — always shown */}
                    <button
                      onClick={() => setEditPage({ ...pg, content: pg.content ?? "" })}
                      style={{ padding: "0.375rem 0.625rem", background: "rgba(10,24,41,0.08)", color: "var(--navy)", border: "none", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
                    >
                      Edit
                    </button>
                    {pg.editable && (
                      <button onClick={() => toggleStatus(pg.id)}
                        style={{ padding: "0.375rem 0.625rem", background: pg.status === "published" ? "rgba(245,158,11,0.1)" : "rgba(22,163,74,0.1)", color: pg.status === "published" ? "#d97706" : "#16a34a", border: "none", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                        {pg.status === "published" ? "Unpublish" : "Publish"}
                      </button>
                    )}
                    {!pg.editable && (
                      <span style={{ padding: "0.375rem 0.625rem", fontSize: "0.75rem", color: "var(--gray-300)" }}>Code-managed</span>
                    )}
                    {pg.editable && (
                      <button onClick={() => deletePage(pg.id)}
                        style={{ padding: "0.375rem 0.625rem", background: "rgba(199,25,26,0.08)", color: "var(--red)", border: "none", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
