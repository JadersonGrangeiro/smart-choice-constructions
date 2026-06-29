"use client";
import { useState } from "react";
import { CATEGORIES, BLOG_POSTS, FAQ_ITEMS } from "@/lib/data";

type Tab = "categories"|"blog"|"faq";

export default function ContentAdminPage() {
  const [tab, setTab] = useState<Tab>("categories");
  const [catSearch, setCatSearch] = useState("");

  const filteredCats = CATEGORIES.filter(c =>
    catSearch === "" || c.name.toLowerCase().includes(catSearch.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.625rem", fontWeight: 800, color: "var(--navy)", marginBottom: "0.25rem" }}>Content Management</h1>
          <p style={{ color: "var(--gray-500)", fontSize: "0.875rem" }}>Manage categories, blog posts, and FAQ</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0", marginBottom: "1.5rem", background: "white", borderRadius: "var(--radius)", border: "1px solid var(--gray-150)", overflow: "hidden" }}>
        {([
          { key: "categories", label: "Categories",  count: CATEGORIES.length },
          { key: "blog",       label: "Blog Posts",  count: BLOG_POSTS.length },
          { key: "faq",        label: "FAQ",         count: FAQ_ITEMS.length },
        ] as const).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            flex: 1, padding: "0.875rem 1.25rem",
            background: tab === t.key ? "var(--navy)" : "transparent",
            color: tab === t.key ? "white" : "var(--gray-600)",
            border: "none", cursor: "pointer", fontFamily: "inherit",
            fontWeight: tab === t.key ? 700 : 500, fontSize: "0.9rem",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
          }}>
            {t.label}
            <span style={{ background: tab === t.key ? "rgba(255,255,255,0.2)" : "var(--gray-100)", color: tab === t.key ? "white" : "var(--gray-500)", borderRadius: "999px", padding: "0 7px", fontSize: "0.75rem", fontWeight: 800 }}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Categories */}
      {tab === "categories" && (
        <div>
          <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
            <div style={{ flex: 1, position: "relative" }}>
              <div style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              </div>
              <input placeholder="Search categories..." value={catSearch} onChange={e => setCatSearch(e.target.value)} className="form-input" style={{ paddingLeft: "2.5rem" }} />
            </div>
            <button className="btn-red" style={{ padding: "0.75rem 1.5rem", fontSize: "0.875rem" }}>+ Add Category</button>
          </div>
          <div className="card" style={{ overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--gray-50)", borderBottom: "1px solid var(--gray-150)" }}>
                  {["Icon","Name","Slug","Active Listings","Actions"].map(h => (
                    <th key={h} style={{ padding: "0.875rem 1.25rem", textAlign: "left", fontSize: "0.8125rem", fontWeight: 700, color: "var(--gray-500)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredCats.map((cat, i) => (
                  <tr key={cat.id} style={{ borderBottom: i < filteredCats.length - 1 ? "1px solid var(--gray-50)" : "none" }}>
                    <td style={{ padding: "0.875rem 1.25rem", fontSize: "1.375rem" }}>{cat.icon}</td>
                    <td style={{ padding: "0.875rem 1.25rem", fontWeight: 600, color: "var(--navy)", fontSize: "0.9rem" }}>{cat.name}</td>
                    <td style={{ padding: "0.875rem 1.25rem" }}>
                      <code style={{ background: "var(--gray-100)", padding: "2px 8px", borderRadius: "4px", fontSize: "0.8125rem", color: "var(--gray-600)" }}>{cat.id}</code>
                    </td>
                    <td style={{ padding: "0.875rem 1.25rem", fontSize: "0.875rem", color: "var(--gray-600)" }}>
                      {Math.floor(Math.random() * 40) + 3}
                    </td>
                    <td style={{ padding: "0.875rem 1.25rem" }}>
                      <div style={{ display: "flex", gap: "0.375rem" }}>
                        <button style={{ padding: "0.3rem 0.625rem", background: "var(--gray-100)", border: "none", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", color: "var(--gray-700)", fontFamily: "inherit" }}>Edit</button>
                        <button style={{ padding: "0.3rem 0.625rem", background: "rgba(199,25,26,0.06)", color: "var(--red)", border: "1px solid rgba(199,25,26,0.15)", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Blog */}
      {tab === "blog" && (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1.25rem" }}>
            <button className="btn-red" style={{ padding: "0.75rem 1.5rem", fontSize: "0.875rem" }}>+ New Post</button>
          </div>
          <div className="card" style={{ overflow: "hidden" }}>
            {BLOG_POSTS.map((post, i) => (
              <div key={post.id} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: "1.5rem", padding: "1.25rem 1.5rem", borderBottom: i < BLOG_POSTS.length - 1 ? "1px solid var(--gray-50)" : "none", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 700, color: "var(--navy)", fontSize: "0.9375rem", marginBottom: "0.25rem" }}>{post.title}</div>
                  <div style={{ fontSize: "0.8125rem", color: "var(--gray-400)" }}>
                    {post.category} · {post.author} · {post.date} · {post.readTime}
                  </div>
                </div>
                <span style={{ background: "rgba(22,163,74,0.1)", color: "#16a34a", padding: "0.2rem 0.625rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700, whiteSpace: "nowrap" }}>
                  Published
                </span>
                <div style={{ display: "flex", gap: "0.375rem" }}>
                  <button style={{ padding: "0.375rem 0.75rem", background: "var(--gray-100)", border: "none", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", color: "var(--gray-700)", fontFamily: "inherit" }}>Edit</button>
                  <button style={{ padding: "0.375rem 0.75rem", background: "rgba(199,25,26,0.06)", color: "var(--red)", border: "1px solid rgba(199,25,26,0.15)", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Unpublish</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAQ */}
      {tab === "faq" && (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1.25rem" }}>
            <button className="btn-red" style={{ padding: "0.75rem 1.5rem", fontSize: "0.875rem" }}>+ Add Question</button>
          </div>
          <div className="card" style={{ overflow: "hidden" }}>
            {FAQ_ITEMS.map((faq, i) => (
              <div key={i} style={{ padding: "1.25rem 1.5rem", borderBottom: i < FAQ_ITEMS.length - 1 ? "1px solid var(--gray-50)" : "none" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: "var(--navy)", fontSize: "0.9375rem", marginBottom: "0.5rem" }}>{faq.question}</div>
                    <p style={{ fontSize: "0.875rem", color: "var(--gray-500)", lineHeight: 1.65 }}>{faq.answer}</p>
                  </div>
                  <div style={{ display: "flex", gap: "0.375rem", flexShrink: 0 }}>
                    <button style={{ padding: "0.375rem 0.75rem", background: "var(--gray-100)", border: "none", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", color: "var(--gray-700)", fontFamily: "inherit" }}>Edit</button>
                    <button style={{ padding: "0.375rem 0.75rem", background: "rgba(199,25,26,0.06)", color: "var(--red)", border: "1px solid rgba(199,25,26,0.15)", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
