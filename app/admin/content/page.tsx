"use client";
import { useState, useEffect, useCallback } from "react";
import { BLOG_POSTS, FAQ_ITEMS } from "@/lib/data";

type Tab = "blog" | "faq";

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface BlogPost {
  id: string; title: string; slug: string; category: string;
  excerpt: string; content: string; image: string;
  author: string; date: string; readTime: string;
  published: boolean; source?: "static" | "dynamic";
}
interface FaqItem {
  id: string; question: string; answer: string;
  category?: string; order: number; active: boolean;
  source?: "static" | "dynamic";
}
const BLOG_CATS = ["Roofing","Kitchen","Bathroom","HVAC","Electrical","Landscaping","General"];
const EMPTY_POST: Partial<BlogPost> = { category: "Roofing", published: true, author: "Smart Choice Editorial", readTime: "5 min", content: "" };
const EMPTY_FAQ:  Partial<FaqItem>  = { category: "General", active: true, order: 99 };

/* ─── Toast ──────────────────────────────────────────────────────────────── */
function Toast({ msg, type }: { msg: string; type: "success"|"error" }) {
  return (
    <div style={{ position:"fixed", bottom:"1.5rem", right:"1.5rem", zIndex:9999,
      background: type==="success" ? "#16a34a" : "var(--red)", color:"white",
      padding:"0.875rem 1.5rem", borderRadius:"var(--radius)", fontWeight:600,
      fontSize:"0.9rem", boxShadow:"var(--shadow-lg)", maxWidth:"320px" }}>
      {msg}
    </div>
  );
}

/* ─── Modal wrapper ──────────────────────────────────────────────────────── */
function Modal({ title, onClose, children }: { title:string; onClose:()=>void; children:React.ReactNode }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", zIndex:500,
      display:"flex", alignItems:"center", justifyContent:"center", padding:"1.5rem", overflowY:"auto" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background:"white", borderRadius:"var(--radius-xl)", padding:"2rem",
        width:"100%", maxWidth:"720px", boxShadow:"var(--shadow-xl)", maxHeight:"90vh", overflowY:"auto" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.5rem" }}>
          <h2 style={{ fontWeight:800, color:"var(--navy)", fontSize:"1.25rem" }}>{title}</h2>
          <button onClick={onClose} style={{ background:"none", border:"none", fontSize:"1.375rem", cursor:"pointer", color:"var(--gray-400)", lineHeight:1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ─── Field helpers ───────────────────────────────────────────────────────── */
const F = ({ label, children, span }: { label:string; children:React.ReactNode; span?:boolean }) => (
  <div style={{ gridColumn: span ? "1/-1" : undefined }}>
    <label style={{ display:"block", fontWeight:700, color:"var(--gray-700)", fontSize:"0.8125rem", marginBottom:"0.375rem" }}>{label}</label>
    {children}
  </div>
);
const Input = (p: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...p} className="form-input" style={{ width:"100%", ...p.style }} />
);
const Textarea = (p: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea {...p} className="form-input" style={{ width:"100%", resize:"vertical", minHeight:"120px", ...p.style }} />
);
const Select = (p: React.SelectHTMLAttributes<HTMLSelectElement> & { children:React.ReactNode }) => (
  <select {...p} className="form-input" style={{ width:"100%" }} />
);

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════════════════ */
export default function ContentAdminPage() {
  const [tab, setTab] = useState<Tab>("blog");
  const [toast, setToast] = useState<{ msg:string; type:"success"|"error" }|null>(null);

  const showToast = (msg:string, type:"success"|"error"="success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <div>
      {toast && <Toast {...toast} />}

      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"2rem", flexWrap:"wrap", gap:"1rem" }}>
        <div>
          <h1 style={{ fontSize:"1.625rem", fontWeight:800, color:"var(--navy)", marginBottom:"0.25rem" }}>Content Management</h1>
          <p style={{ color:"var(--gray-500)", fontSize:"0.875rem" }}>Manage blog posts and FAQ items</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:0, marginBottom:"1.5rem", background:"white", borderRadius:"var(--radius)", border:"1px solid var(--gray-150)", overflow:"hidden" }}>
        {([
          { key:"blog", label:"Blog Posts", icon:"📝" },
          { key:"faq",  label:"FAQ",        icon:"❓" },
        ] as const).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            flex:1, padding:"0.875rem 1.25rem",
            background: tab===t.key ? "var(--navy)" : "transparent",
            color: tab===t.key ? "white" : "var(--gray-600)",
            border:"none", cursor:"pointer", fontFamily:"inherit",
            fontWeight: tab===t.key ? 700 : 500, fontSize:"0.9rem",
            display:"flex", alignItems:"center", justifyContent:"center", gap:"0.5rem",
          }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === "blog" && <BlogTab showToast={showToast} />}
      {tab === "faq"  && <FaqTab  showToast={showToast} />}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   BLOG TAB
═══════════════════════════════════════════════════════════════════════════ */
function BlogTab({ showToast }: { showToast:(m:string,t?:"success"|"error")=>void }) {
  const [posts, setPosts]       = useState<BlogPost[]>([]);
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState<BlogPost|null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm]         = useState<Partial<BlogPost>>(EMPTY_POST);
  const [saving, setSaving]     = useState(false);
  const [catFilter, setCatFilter] = useState("All");
  const [search, setSearch]     = useState("");
  const [preview, setPreview]   = useState<BlogPost|null>(null);

  const staticPosts: BlogPost[] = BLOG_POSTS.map(p => ({ ...p, published:true, content:"", source:"static" as const }));

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/platform-data?key=blog_posts");
      const json = await res.json();
      const dynamic: BlogPost[] = (json.value ?? []).map((p: BlogPost) => ({ ...p, source:"dynamic" as const }));
      const staticIds = new Set(staticPosts.map(p => p.slug));
      const dynamicOverrides = new Map(dynamic.filter(p => staticIds.has(p.slug)).map(p => [p.slug, p]));
      const merged = staticPosts.map(p => dynamicOverrides.get(p.slug) ?? p);
      const newDynamic = dynamic.filter(p => !staticIds.has(p.slug));
      setPosts([...merged, ...newDynamic]);
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!form.title || !form.slug || !form.category) { showToast("Title, slug and category required", "error"); return; }
    setSaving(true);
    try {
      const res0 = await fetch("/api/admin/platform-data?key=blog_posts");
      const j0 = await res0.json();
      const existing: BlogPost[] = j0.value ?? [];
      const now = new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"});
      const entry: BlogPost = {
        id: editing?.id ?? `dyn-${Date.now()}`,
        title: form.title!, slug: form.slug!,
        category: form.category!, excerpt: form.excerpt ?? "",
        content: form.content ?? "", image: form.image ?? "",
        author: form.author ?? "Smart Choice Editorial",
        date: form.date ?? now, readTime: form.readTime ?? "5 min",
        published: form.published ?? true, source: "dynamic",
      };
      const updated = editing
        ? existing.map(p => p.id===editing.id || p.slug===editing.slug ? entry : p)
        : [...existing, entry];
      const res = await fetch("/api/admin/platform-data", {
        method:"PUT", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ key:"blog_posts", value:updated }),
      });
      if (!res.ok) throw new Error();
      showToast(editing ? "Post updated!" : "Post created!");
      setEditing(null); setCreating(false); setForm(EMPTY_POST);
      load();
    } catch { showToast("Save failed", "error"); }
    finally { setSaving(false); }
  };

  const togglePublish = async (post: BlogPost) => {
    const res0 = await fetch("/api/admin/platform-data?key=blog_posts");
    const j0 = await res0.json();
    const existing: BlogPost[] = j0.value ?? [];
    const updated = existing.some(p => p.slug===post.slug)
      ? existing.map(p => p.slug===post.slug ? { ...p, published:!p.published } : p)
      : [...existing, { ...post, published:!post.published, source:"dynamic" as const }];
    await fetch("/api/admin/platform-data", {
      method:"PUT", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ key:"blog_posts", value:updated }),
    });
    showToast(post.published ? "Post unpublished" : "Post published");
    load();
  };

  const deletePost = async (post: BlogPost) => {
    if (!confirm(`Delete "${post.title}"?`)) return;
    const res0 = await fetch("/api/admin/platform-data?key=blog_posts");
    const j0 = await res0.json();
    const existing: BlogPost[] = j0.value ?? [];
    const updated = existing.filter(p => p.id!==post.id && p.slug!==post.slug);
    await fetch("/api/admin/platform-data", {
      method:"PUT", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ key:"blog_posts", value:updated }),
    });
    showToast("Post deleted");
    load();
  };

  const openEdit = (post: BlogPost) => { setForm({ ...post }); setEditing(post); setCreating(true); };
  const openNew  = () => { setForm({ ...EMPTY_POST, date: new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"}) }); setEditing(null); setCreating(true); };

  const filtered = posts.filter(p => {
    if (catFilter !== "All" && p.category !== catFilter) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display:"flex", gap:"0.75rem", marginBottom:"1.25rem", flexWrap:"wrap", alignItems:"center" }}>
        <input className="form-input" placeholder="Search posts..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex:1, minWidth:"180px" }} />
        <select className="form-input" value={catFilter} onChange={e => setCatFilter(e.target.value)} style={{ width:"160px" }}>
          {["All",...BLOG_CATS].map(c => <option key={c}>{c}</option>)}
        </select>
        <button className="btn-red" onClick={openNew} style={{ padding:"0.75rem 1.25rem", fontSize:"0.875rem", flexShrink:0 }}>+ New Post</button>
      </div>

      <div className="card" style={{ overflow:"hidden" }}>
        {loading ? (
          <div style={{ padding:"2rem", textAlign:"center", color:"var(--gray-400)" }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding:"2rem", textAlign:"center", color:"var(--gray-400)" }}>No posts found.</div>
        ) : (
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:"var(--gray-50)", borderBottom:"1px solid var(--gray-150)" }}>
                {["Title","Category","Author","Date","Status","Source","Actions"].map(h => (
                  <th key={h} style={{ padding:"0.875rem 1rem", textAlign:"left", fontSize:"0.8rem", fontWeight:700, color:"var(--gray-500)", whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((post, i) => (
                <tr key={post.id} style={{ borderBottom: i<filtered.length-1 ? "1px solid var(--gray-50)" : "none" }}>
                  <td style={{ padding:"0.875rem 1rem", maxWidth:"260px" }}>
                    <div style={{ fontWeight:600, color:"var(--navy)", fontSize:"0.875rem", lineHeight:1.3, marginBottom:"0.2rem" }}>{post.title}</div>
                    <code style={{ fontSize:"0.7rem", color:"var(--gray-400)" }}>{post.slug}</code>
                  </td>
                  <td style={{ padding:"0.875rem 1rem" }}>
                    <span style={{ background:"var(--gray-100)", padding:"2px 8px", borderRadius:"999px", fontSize:"0.75rem", fontWeight:600, color:"var(--gray-700)", whiteSpace:"nowrap" }}>{post.category}</span>
                  </td>
                  <td style={{ padding:"0.875rem 1rem", fontSize:"0.8rem", color:"var(--gray-500)", whiteSpace:"nowrap" }}>{post.author}</td>
                  <td style={{ padding:"0.875rem 1rem", fontSize:"0.8rem", color:"var(--gray-400)", whiteSpace:"nowrap" }}>{post.date}</td>
                  <td style={{ padding:"0.875rem 1rem" }}>
                    <span style={{ background: post.published ? "rgba(22,163,74,0.1)" : "var(--gray-100)", color: post.published ? "#16a34a" : "var(--gray-500)", padding:"2px 8px", borderRadius:"999px", fontSize:"0.75rem", fontWeight:700 }}>
                      {post.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td style={{ padding:"0.875rem 1rem" }}>
                    <span style={{ fontSize:"0.7rem", color:"var(--gray-400)", background:"var(--gray-50)", padding:"2px 6px", borderRadius:"4px" }}>
                      {post.source === "dynamic" ? "dynamic" : "static"}
                    </span>
                  </td>
                  <td style={{ padding:"0.875rem 1rem" }}>
                    <div style={{ display:"flex", gap:"0.375rem", flexWrap:"wrap" }}>
                      <button onClick={() => setPreview(post)} style={{ padding:"0.3rem 0.625rem", background:"var(--gray-100)", border:"none", borderRadius:"4px", fontSize:"0.75rem", fontWeight:600, cursor:"pointer", color:"var(--gray-700)", fontFamily:"inherit" }}>Preview</button>
                      <button onClick={() => openEdit(post)} style={{ padding:"0.3rem 0.625rem", background:"rgba(99,102,241,0.08)", border:"1px solid rgba(99,102,241,0.2)", borderRadius:"4px", fontSize:"0.75rem", fontWeight:600, cursor:"pointer", color:"#6366f1", fontFamily:"inherit" }}>Edit</button>
                      <button onClick={() => togglePublish(post)} style={{ padding:"0.3rem 0.625rem", background:"rgba(245,158,11,0.08)", border:"1px solid rgba(245,158,11,0.2)", borderRadius:"4px", fontSize:"0.75rem", fontWeight:600, cursor:"pointer", color:"#d97706", fontFamily:"inherit" }}>
                        {post.published ? "Unpublish" : "Publish"}
                      </button>
                      {post.source === "dynamic" && (
                        <button onClick={() => deletePost(post)} style={{ padding:"0.3rem 0.625rem", background:"rgba(199,25,26,0.06)", color:"var(--red)", border:"1px solid rgba(199,25,26,0.15)", borderRadius:"4px", fontSize:"0.75rem", fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>Delete</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit/Create modal */}
      {creating && (
        <Modal title={editing ? "Edit Post" : "New Blog Post"} onClose={() => { setCreating(false); setEditing(null); setForm(EMPTY_POST); }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
            <F label="Title *" span><Input value={form.title??""} onChange={e=>setForm(p=>({...p,title:e.target.value}))} placeholder="10 Signs You Need a New Roof…" /></F>
            <F label="Slug *"><Input value={form.slug??""} onChange={e=>setForm(p=>({...p,slug:e.target.value.toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,"")}))} placeholder="signs-you-need-new-roof" /></F>
            <F label="Category *">
              <Select value={form.category??""} onChange={e=>setForm(p=>({...p,category:e.target.value}))}>
                {BLOG_CATS.map(c=><option key={c}>{c}</option>)}
              </Select>
            </F>
            <F label="Author"><Input value={form.author??""} onChange={e=>setForm(p=>({...p,author:e.target.value}))} placeholder="James Carter" /></F>
            <F label="Date"><Input value={form.date??""} onChange={e=>setForm(p=>({...p,date:e.target.value}))} placeholder="June 30, 2025" /></F>
            <F label="Read Time"><Input value={form.readTime??""} onChange={e=>setForm(p=>({...p,readTime:e.target.value}))} placeholder="5 min" /></F>
            <F label="Hero Image URL" span><Input value={form.image??""} onChange={e=>setForm(p=>({...p,image:e.target.value}))} placeholder="https://images.unsplash.com/photo-…" /></F>
            {form.image && <div style={{ gridColumn:"1/-1" }}><img src={form.image} alt="" style={{ width:"100%", maxHeight:"180px", objectFit:"cover", borderRadius:"var(--radius)", border:"1px solid var(--gray-150)" }} /></div>}
            <F label="Excerpt" span><Textarea rows={2} value={form.excerpt??""} onChange={e=>setForm(p=>({...p,excerpt:e.target.value}))} placeholder="Short description shown in listings…" /></F>
            <F label="Full Content (paragraphs — separate with blank lines)" span>
              <Textarea rows={12} value={form.content??""} onChange={e=>setForm(p=>({...p,content:e.target.value}))} placeholder={"Your article content here.\n\nSeparate paragraphs with a blank line.\n\nEach paragraph becomes its own section."} style={{ minHeight:"240px", fontFamily:"monospace", fontSize:"0.875rem" }} />
            </F>
            <F label="Status">
              <div style={{ display:"flex", gap:"1rem", alignItems:"center", paddingTop:"0.5rem" }}>
                <label style={{ display:"flex", alignItems:"center", gap:"0.5rem", cursor:"pointer" }}>
                  <input type="checkbox" checked={form.published??true} onChange={e=>setForm(p=>({...p,published:e.target.checked}))} />
                  <span style={{ fontSize:"0.875rem", fontWeight:600, color:"var(--gray-700)" }}>Published</span>
                </label>
              </div>
            </F>
          </div>
          <div style={{ display:"flex", gap:"0.75rem", marginTop:"1.5rem", justifyContent:"flex-end" }}>
            <button onClick={() => { setCreating(false); setEditing(null); }} className="btn-secondary" style={{ padding:"0.75rem 1.5rem" }}>Cancel</button>
            <button onClick={save} disabled={saving} className="btn-red" style={{ padding:"0.75rem 1.75rem" }}>{saving ? "Saving…" : editing ? "Save Changes" : "Create Post"}</button>
          </div>
        </Modal>
      )}

      {/* Preview modal */}
      {preview && (
        <Modal title="Post Preview" onClose={() => setPreview(null)}>
          {preview.image && <img src={preview.image} alt="" style={{ width:"100%", height:"200px", objectFit:"cover", borderRadius:"var(--radius)", marginBottom:"1.25rem" }} />}
          <span style={{ background:"var(--gray-100)", color:"var(--gray-600)", padding:"2px 10px", borderRadius:"999px", fontSize:"0.75rem", fontWeight:700 }}>{preview.category}</span>
          <h2 style={{ fontWeight:800, color:"var(--navy)", fontSize:"1.375rem", margin:"0.75rem 0 0.5rem" }}>{preview.title}</h2>
          <div style={{ fontSize:"0.8125rem", color:"var(--gray-400)", marginBottom:"1.25rem" }}>{preview.author} · {preview.date} · {preview.readTime}</div>
          <p style={{ color:"var(--gray-600)", lineHeight:1.75, fontSize:"0.9375rem", borderLeft:"4px solid var(--red)", paddingLeft:"1rem" }}>{preview.excerpt}</p>
          {preview.content && (
            <div style={{ marginTop:"1.25rem" }}>
              {preview.content.split(/\n\n+/).map((para,i) => (
                <p key={i} style={{ color:"var(--gray-700)", lineHeight:1.8, marginBottom:"1rem" }}>{para}</p>
              ))}
            </div>
          )}
          <div style={{ marginTop:"1.25rem", display:"flex", gap:"0.75rem" }}>
            <a href={`/blog/${preview.slug}`} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ padding:"0.625rem 1.25rem", fontSize:"0.875rem" }}>View on Site →</a>
            <button onClick={() => { setPreview(null); openEdit(preview); }} className="btn-red" style={{ padding:"0.625rem 1.25rem", fontSize:"0.875rem" }}>Edit Post</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   FAQ TAB
═══════════════════════════════════════════════════════════════════════════ */
function FaqTab({ showToast }: { showToast:(m:string,t?:"success"|"error")=>void }) {
  const [items, setItems]     = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<FaqItem|null>(null);
  const [form, setForm]       = useState<Partial<FaqItem>>(EMPTY_FAQ);
  const [saving, setSaving]   = useState(false);
  const [showModal, setShowModal] = useState(false);

  const staticItems: FaqItem[] = FAQ_ITEMS.map((f, i) => ({
    id: `static-${i}`, question:f.question, answer:f.answer,
    category:"General", order:i, active:true, source:"static" as const,
  }));

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/platform-data?key=faq_items");
      const json = await res.json();
      const dynamic: FaqItem[] = (json.value ?? []).map((f: FaqItem) => ({ ...f, source:"dynamic" as const }));
      const dynamicIds = new Set(dynamic.map(f => f.id));
      const merged = [...staticItems.filter(f => !dynamicIds.has(f.id)), ...dynamic];
      merged.sort((a,b) => a.order - b.order);
      setItems(merged);
    } finally { setLoading(false); }
  }, []); // eslint-disable-line

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!form.question || !form.answer) { showToast("Question and answer required", "error"); return; }
    setSaving(true);
    try {
      const res0 = await fetch("/api/admin/platform-data?key=faq_items");
      const j0 = await res0.json();
      const existing: FaqItem[] = j0.value ?? [];
      const entry: FaqItem = {
        id: editing?.id ?? `faq-${Date.now()}`,
        question:form.question!, answer:form.answer!,
        category: form.category ?? "General", order: form.order ?? 99, active: form.active ?? true,
        source: "dynamic",
      };
      const updated = editing
        ? existing.map(f => f.id===editing.id ? entry : f)
        : [...existing, entry];
      await fetch("/api/admin/platform-data", {
        method:"PUT", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ key:"faq_items", value:updated }),
      });
      showToast(editing ? "FAQ updated!" : "FAQ item created!");
      setShowModal(false); setEditing(null); setForm(EMPTY_FAQ);
      load();
    } catch { showToast("Save failed", "error"); }
    finally { setSaving(false); }
  };

  const toggleActive = async (item: FaqItem) => {
    const res0 = await fetch("/api/admin/platform-data?key=faq_items");
    const j0 = await res0.json();
    const existing: FaqItem[] = j0.value ?? [];
    const dynEntry: FaqItem = { ...item, active:!item.active, source:"dynamic" };
    const updated = existing.some(f=>f.id===item.id)
      ? existing.map(f => f.id===item.id ? dynEntry : f)
      : [...existing, dynEntry];
    await fetch("/api/admin/platform-data",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({key:"faq_items",value:updated})});
    showToast(item.active ? "FAQ item hidden" : "FAQ item visible");
    load();
  };

  const deleteItem = async (item: FaqItem) => {
    if (!confirm("Delete this FAQ item?")) return;
    const res0 = await fetch("/api/admin/platform-data?key=faq_items");
    const j0 = await res0.json();
    const existing: FaqItem[] = j0.value ?? [];
    await fetch("/api/admin/platform-data",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({key:"faq_items",value:existing.filter(f=>f.id!==item.id)})});
    showToast("FAQ item deleted");
    load();
  };

  const openEdit = (item: FaqItem) => { setForm({...item}); setEditing(item); setShowModal(true); };
  const openNew  = () => { setForm({...EMPTY_FAQ, order: items.length}); setEditing(null); setShowModal(true); };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:"1.25rem" }}>
        <button className="btn-red" onClick={openNew} style={{ padding:"0.75rem 1.25rem", fontSize:"0.875rem" }}>+ Add FAQ Item</button>
      </div>
      <div className="card" style={{ overflow:"hidden" }}>
        {loading ? (
          <div style={{ padding:"2rem", textAlign:"center", color:"var(--gray-400)" }}>Loading…</div>
        ) : items.map((faq, i) => (
          <div key={faq.id} style={{ padding:"1.25rem 1.5rem", borderBottom: i<items.length-1 ? "1px solid var(--gray-50)" : "none" }}>
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:"1rem" }}>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:"0.625rem", marginBottom:"0.5rem", flexWrap:"wrap" }}>
                  <span style={{ fontWeight:700, color:"var(--navy)", fontSize:"0.9375rem" }}>{faq.question}</span>
                  <span style={{ fontSize:"0.7rem", color:"var(--gray-400)", background:"var(--gray-50)", padding:"1px 6px", borderRadius:"4px" }}>
                    {faq.source === "dynamic" ? "custom" : "static"}
                  </span>
                  {!faq.active && <span style={{ fontSize:"0.75rem", color:"var(--red)", fontWeight:700 }}>Hidden</span>}
                </div>
                <p style={{ fontSize:"0.875rem", color:"var(--gray-500)", lineHeight:1.65 }}>{faq.answer}</p>
              </div>
              <div style={{ display:"flex", gap:"0.375rem", flexShrink:0 }}>
                <button onClick={() => openEdit(faq)} style={{ padding:"0.375rem 0.75rem", background:"rgba(99,102,241,0.08)", border:"1px solid rgba(99,102,241,0.2)", borderRadius:"4px", fontSize:"0.75rem", fontWeight:600, cursor:"pointer", color:"#6366f1", fontFamily:"inherit" }}>Edit</button>
                <button onClick={() => toggleActive(faq)} style={{ padding:"0.375rem 0.75rem", background:"rgba(245,158,11,0.08)", border:"1px solid rgba(245,158,11,0.2)", borderRadius:"4px", fontSize:"0.75rem", fontWeight:600, cursor:"pointer", color:"#d97706", fontFamily:"inherit" }}>{faq.active ? "Hide" : "Show"}</button>
                {faq.source === "dynamic" && (
                  <button onClick={() => deleteItem(faq)} style={{ padding:"0.375rem 0.75rem", background:"rgba(199,25,26,0.06)", color:"var(--red)", border:"1px solid rgba(199,25,26,0.15)", borderRadius:"4px", fontSize:"0.75rem", fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>Delete</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <Modal title={editing ? "Edit FAQ Item" : "New FAQ Item"} onClose={() => { setShowModal(false); setEditing(null); }}>
          <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
            <F label="Question *"><Input value={form.question??""} onChange={e=>setForm(p=>({...p,question:e.target.value}))} placeholder="Is Smart Choice free for homeowners?" /></F>
            <F label="Answer *"><Textarea rows={5} value={form.answer??""} onChange={e=>setForm(p=>({...p,answer:e.target.value}))} placeholder="Yes, completely. Homeowners use our platform at no cost…" /></F>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
              <F label="Category"><Input value={form.category??""} onChange={e=>setForm(p=>({...p,category:e.target.value}))} placeholder="General, Pricing, Contractors…" /></F>
              <F label="Order (lower = first)"><Input type="number" value={form.order??99} onChange={e=>setForm(p=>({...p,order:+e.target.value}))} /></F>
            </div>
            <label style={{ display:"flex", alignItems:"center", gap:"0.5rem", cursor:"pointer" }}>
              <input type="checkbox" checked={form.active??true} onChange={e=>setForm(p=>({...p,active:e.target.checked}))} />
              <span style={{ fontSize:"0.875rem", fontWeight:600 }}>Visible on site</span>
            </label>
          </div>
          <div style={{ display:"flex", gap:"0.75rem", marginTop:"1.5rem", justifyContent:"flex-end" }}>
            <button onClick={() => setShowModal(false)} className="btn-secondary" style={{ padding:"0.75rem 1.5rem" }}>Cancel</button>
            <button onClick={save} disabled={saving} className="btn-red" style={{ padding:"0.75rem 1.75rem" }}>{saving ? "Saving…" : "Save"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
