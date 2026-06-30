"use client";
import { useState, useEffect, useCallback } from "react";

/* ─── Analytics Types ─────────────────────────────────────────────────────── */
interface ReportData {
  summary: { totalContractors:number; activeContractors:number; totalQuotes:number; totalReviews:number };
  revenueMonthly: { month:string; revenue:number }[];
  topCategories: { category:string; contractors:number; leads:number; conversionPct:number }[];
  topStates: { state:string; contractors:number; leads:number; revenue:number }[];
}

/* ─── CRM Types ───────────────────────────────────────────────────────────── */
type CRMType = "contractor" | "supplier" | "homeowner" | "partner";
type CRMPriority = "low" | "medium" | "high" | "urgent";
type InteractionType = "call" | "email" | "message" | "meeting" | "note";
type TaskStatus = "todo" | "in_progress" | "done" | "follow_up";

interface CRMContact {
  id: string; name: string; type: CRMType; company?: string;
  email?: string; phone?: string; state?: string;
  priority: CRMPriority; tags?: string[];
  notes?: string; nextContactDate?: string;
  createdAt: string; updatedAt: string;
}
interface CRMInteraction {
  id: string; contactId: string; type: InteractionType;
  subject: string; body: string; date: string; createdBy?: string;
}
interface CRMTask {
  id: string; contactId?: string; title: string;
  status: TaskStatus; dueDate?: string; notes?: string;
  createdAt: string;
}

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
function Bar({ pct, color = "var(--navy)" }: { pct:number; color?:string }) {
  return (
    <div style={{ flex:1, height:"10px", background:"var(--gray-100)", borderRadius:"999px", overflow:"hidden" }}>
      <div style={{ height:"100%", background:color, borderRadius:"999px", width:`${Math.max(pct,2)}%`, transition:"width 0.5s ease" }} />
    </div>
  );
}

function Modal({ title, onClose, children }: { title:string; onClose:()=>void; children:React.ReactNode }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", zIndex:500, display:"flex", alignItems:"center", justifyContent:"center", padding:"1.5rem", overflowY:"auto" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background:"white", borderRadius:"var(--radius-xl)", padding:"2rem", width:"100%", maxWidth:"620px", boxShadow:"var(--shadow-xl)", maxHeight:"90vh", overflowY:"auto" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.5rem" }}>
          <h2 style={{ fontWeight:800, color:"var(--navy)", fontSize:"1.25rem" }}>{title}</h2>
          <button onClick={onClose} style={{ background:"none", border:"none", fontSize:"1.375rem", cursor:"pointer", color:"var(--gray-400)", lineHeight:1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

const F = ({ label, children }: { label:string; children:React.ReactNode }) => (
  <div>
    <label style={{ display:"block", fontWeight:700, color:"var(--gray-700)", fontSize:"0.8125rem", marginBottom:"0.375rem" }}>{label}</label>
    {children}
  </div>
);

const PRIORITY_STYLE: Record<CRMPriority, { bg:string; color:string; label:string }> = {
  low:    { bg:"var(--gray-100)",         color:"var(--gray-500)", label:"Low" },
  medium: { bg:"rgba(99,102,241,0.1)",    color:"#6366f1",         label:"Medium" },
  high:   { bg:"rgba(245,158,11,0.1)",    color:"#d97706",         label:"High" },
  urgent: { bg:"rgba(199,25,26,0.1)",     color:"var(--red)",      label:"Urgent" },
};
const TASK_STATUS_STYLE: Record<TaskStatus, { bg:string; color:string; label:string }> = {
  todo:        { bg:"var(--gray-100)",         color:"var(--gray-600)", label:"To Do" },
  in_progress: { bg:"rgba(99,102,241,0.1)",    color:"#6366f1",         label:"In Progress" },
  done:        { bg:"rgba(22,163,74,0.1)",     color:"#16a34a",         label:"Done" },
  follow_up:   { bg:"rgba(245,158,11,0.1)",    color:"#d97706",         label:"Follow Up" },
};
const TYPE_ICONS: Record<CRMType,string> = { contractor:"🔨", supplier:"🏪", homeowner:"🏠", partner:"🤝" };
const INT_ICONS: Record<InteractionType,string> = { call:"📞", email:"📧", message:"💬", meeting:"🤝", note:"📝" };

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════════════════ */
export default function ReportsAdminPage() {
  const [tab, setTab] = useState<"analytics"|"crm">("analytics");

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.75rem", flexWrap:"wrap", gap:"1rem" }}>
        <div>
          <h1 style={{ fontSize:"1.625rem", fontWeight:800, color:"var(--navy)", marginBottom:"0.25rem" }}>Reports & CRM</h1>
          <p style={{ color:"var(--gray-500)", fontSize:"0.875rem" }}>Analytics, metrics, and contact management</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:0, marginBottom:"1.75rem", background:"white", borderRadius:"var(--radius)", border:"1px solid var(--gray-150)", overflow:"hidden" }}>
        {([
          { key:"analytics", label:"Analytics", icon:"📊" },
          { key:"crm",       label:"CRM / Contacts", icon:"👥" },
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

      {tab === "analytics" && <AnalyticsTab />}
      {tab === "crm"       && <CRMTab />}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ANALYTICS TAB (unchanged original)
═══════════════════════════════════════════════════════════════════════════ */
function AnalyticsTab() {
  const [data, setData] = useState<ReportData|null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/reports").then(r=>r.json()).then(setData).finally(()=>setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"300px", color:"var(--gray-400)", flexDirection:"column", gap:"1rem" }}>
      <div style={{ width:"32px", height:"32px", border:"3px solid var(--gray-200)", borderTopColor:"var(--navy)", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
      Loading reports...
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const s = data?.summary;
  const maxRevenue = Math.max(...(data?.revenueMonthly??[]).map(m=>m.revenue),1);
  const maxCatContractors = Math.max(...(data?.topCategories??[]).map(c=>c.contractors),1);
  const maxStateContractors = Math.max(...(data?.topStates??[]).map(s=>s.contractors),1);

  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))", gap:"1rem", marginBottom:"2rem" }}>
        {[
          { label:"Total Contractors",  value:s?.totalContractors??0 },
          { label:"Active Contractors", value:s?.activeContractors??0 },
          { label:"Quote Requests",     value:s?.totalQuotes??0 },
          { label:"Total Reviews",      value:s?.totalReviews??0 },
        ].map(kpi => (
          <div key={kpi.label} className="card" style={{ padding:"1.25rem" }}>
            <div style={{ fontSize:"1.625rem", fontWeight:800, color:"var(--navy)", letterSpacing:"-0.02em", marginBottom:"0.25rem" }}>{kpi.value.toLocaleString()}</div>
            <div style={{ fontSize:"0.875rem", fontWeight:600, color:"var(--gray-600)" }}>{kpi.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.5rem", marginBottom:"1.5rem" }}>
        <div className="card" style={{ padding:"1.75rem" }}>
          <h2 style={{ fontWeight:700, color:"var(--navy)", fontSize:"1.0625rem", marginBottom:"1.5rem" }}>Revenue Trend</h2>
          {(data?.revenueMonthly??[]).length===0 ? (
            <div style={{ color:"var(--gray-400)", fontSize:"0.9rem" }}>No revenue data yet.</div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:"0.875rem" }}>
              {(data?.revenueMonthly??[]).map((m,i,arr) => (
                <div key={i} style={{ display:"grid", gridTemplateColumns:"56px 1fr 90px", gap:"0.75rem", alignItems:"center" }}>
                  <span style={{ fontSize:"0.8125rem", fontWeight:600, color:"var(--gray-500)" }}>{m.month}</span>
                  <Bar pct={(m.revenue/maxRevenue)*100} color={i===arr.length-1?"var(--navy)":"var(--gray-200)"} />
                  <span style={{ fontSize:"0.875rem", fontWeight:700, color:"var(--navy)", textAlign:"right" }}>${m.revenue.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card" style={{ padding:"1.75rem" }}>
          <h2 style={{ fontWeight:700, color:"var(--navy)", fontSize:"1.0625rem", marginBottom:"1.5rem" }}>Active Contractors by Category</h2>
          {(data?.topCategories??[]).length===0 ? (
            <div style={{ color:"var(--gray-400)", fontSize:"0.9rem" }}>No active contractors yet.</div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
              {(data?.topCategories??[]).map((cat,i) => (
                <div key={i}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"4px", fontSize:"0.875rem" }}>
                    <span style={{ fontWeight:600, color:"var(--navy)" }}>{cat.category}</span>
                    <span style={{ color:"var(--gray-400)" }}>{cat.contractors} contractors</span>
                  </div>
                  <Bar pct={(cat.contractors/maxCatContractors)*100} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {(data?.topStates??[]).length>0 && (
        <div className="card" style={{ padding:"1.75rem", marginBottom:"1.5rem" }}>
          <h2 style={{ fontWeight:700, color:"var(--navy)", fontSize:"1.0625rem", marginBottom:"1.5rem" }}>Contractors by State</h2>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ borderBottom:"1px solid var(--gray-100)" }}>
                {["State","Active Contractors","Distribution"].map(h=>(
                  <th key={h} style={{ padding:"0.625rem 0", textAlign:"left", fontSize:"0.8125rem", fontWeight:700, color:"var(--gray-500)", paddingBottom:"0.875rem" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data?.topStates??[]).map((row,i,arr) => (
                <tr key={i} style={{ borderBottom: i<arr.length-1?"1px solid var(--gray-50)":"none" }}>
                  <td style={{ padding:"0.875rem 0", fontWeight:600, color:"var(--navy)", fontSize:"0.875rem" }}>{row.state}</td>
                  <td style={{ padding:"0.875rem 0", color:"var(--gray-600)", fontSize:"0.875rem" }}>{row.contractors}</td>
                  <td style={{ padding:"0.875rem 0", minWidth:"140px" }}><Bar pct={(row.contractors/maxStateContractors)*100} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="card" style={{ padding:"1.75rem" }}>
        <h2 style={{ fontWeight:700, color:"var(--navy)", fontSize:"1.0625rem", marginBottom:"1.5rem" }}>Platform Health</h2>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:"1rem" }}>
          {[
            { label:"Active Contractors", value:`${s?.activeContractors??0}` },
            { label:"Contractor Activation Rate", value:s&&s.totalContractors>0?`${Math.round((s.activeContractors/s.totalContractors)*100)}%`:"—" },
            { label:"Total Quote Requests", value:s?.totalQuotes.toLocaleString()??"0" },
            { label:"Reviews Published", value:s?.totalReviews.toLocaleString()??"0" },
          ].map(item => (
            <div key={item.label} style={{ padding:"1rem", background:"rgba(22,163,74,0.04)", border:"1.5px solid rgba(22,163,74,0.15)", borderRadius:"var(--radius)" }}>
              <div style={{ fontSize:"1.375rem", fontWeight:800, color:"#16a34a", marginBottom:"0.25rem" }}>{item.value}</div>
              <div style={{ fontSize:"0.8125rem", fontWeight:600, color:"var(--gray-600)" }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   CRM TAB
═══════════════════════════════════════════════════════════════════════════ */
function CRMTab() {
  const [view, setView] = useState<"contacts"|"tasks">("contacts");
  const [contacts, setContacts]       = useState<CRMContact[]>([]);
  const [interactions, setInteractions] = useState<CRMInteraction[]>([]);
  const [tasks, setTasks]             = useState<CRMTask[]>([]);
  const [loading, setLoading]         = useState(true);

  const [selectedContact, setSelectedContact] = useState<CRMContact|null>(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [editingContact, setEditingContact]   = useState<CRMContact|null>(null);
  const [contactForm, setContactForm]         = useState<Partial<CRMContact>>({ type:"contractor", priority:"medium" });

  const [showInteractionForm, setShowInteractionForm] = useState(false);
  const [intForm, setIntForm] = useState<Partial<CRMInteraction>>({ type:"note" });

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskForm, setTaskForm]         = useState<Partial<CRMTask>>({ status:"todo" });

  const [search, setSearch]   = useState("");
  const [typeFilter, setTypeFilter] = useState<CRMType|"all">("all");

  const [toast, setToast] = useState<string|null>(null);
  const showToast = (m:string) => { setToast(m); setTimeout(()=>setToast(null),3000); };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [r1,r2] = await Promise.all([
        fetch("/api/admin/platform-data?key=crm_contacts").then(r=>r.json()),
        fetch("/api/admin/platform-data?key=crm_interactions").then(r=>r.json()),
      ]);
      setContacts(r1.value ?? []);
      const allData = r2.value ?? {};
      setInteractions(allData.interactions ?? []);
      setTasks(allData.tasks ?? []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const persistContacts = async (updated: CRMContact[]) => {
    await fetch("/api/admin/platform-data",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({key:"crm_contacts",value:updated})});
  };
  const persistInteractionsAndTasks = async (ints: CRMInteraction[], tks: CRMTask[]) => {
    await fetch("/api/admin/platform-data",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({key:"crm_interactions",value:{interactions:ints,tasks:tks}})});
  };

  const saveContact = async () => {
    if (!contactForm.name) { showToast("Name required"); return; }
    const now = new Date().toISOString();
    const entry: CRMContact = {
      id: editingContact?.id ?? `c-${Date.now()}`,
      name:contactForm.name!, type:contactForm.type??"contractor",
      company:contactForm.company, email:contactForm.email, phone:contactForm.phone,
      state:contactForm.state, priority:contactForm.priority??"medium",
      notes:contactForm.notes, nextContactDate:contactForm.nextContactDate,
      tags:contactForm.tags, createdAt:editingContact?.createdAt??now, updatedAt:now,
    };
    const updated = editingContact ? contacts.map(c=>c.id===editingContact.id?entry:c) : [...contacts, entry];
    await persistContacts(updated);
    setContacts(updated);
    showToast(editingContact ? "Contact updated!" : "Contact created!");
    setShowContactForm(false); setEditingContact(null); setContactForm({ type:"contractor", priority:"medium" });
  };

  const deleteContact = async (id: string) => {
    if (!confirm("Delete this contact?")) return;
    const updated = contacts.filter(c=>c.id!==id);
    await persistContacts(updated);
    setContacts(updated);
    if (selectedContact?.id===id) setSelectedContact(null);
    showToast("Contact deleted");
  };

  const saveInteraction = async () => {
    if (!intForm.subject || !selectedContact) return;
    const entry: CRMInteraction = {
      id:`i-${Date.now()}`, contactId:selectedContact.id,
      type:intForm.type??"note", subject:intForm.subject!, body:intForm.body??"",
      date:new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric",hour:"2-digit",minute:"2-digit"}),
    };
    const updated = [entry, ...interactions];
    await persistInteractionsAndTasks(updated, tasks);
    setInteractions(updated);
    showToast("Interaction saved!");
    setShowInteractionForm(false); setIntForm({ type:"note" });
  };

  const saveTask = async () => {
    if (!taskForm.title) { showToast("Task title required"); return; }
    const entry: CRMTask = {
      id:`t-${Date.now()}`, contactId:selectedContact?.id,
      title:taskForm.title!, status:taskForm.status??"todo",
      dueDate:taskForm.dueDate, notes:taskForm.notes,
      createdAt:new Date().toISOString(),
    };
    const updated = [...tasks, entry];
    await persistInteractionsAndTasks(interactions, updated);
    setTasks(updated);
    showToast("Task created!");
    setShowTaskForm(false); setTaskForm({ status:"todo" });
  };

  const cycleTaskStatus = async (task: CRMTask) => {
    const cycle: TaskStatus[] = ["todo","in_progress","done","follow_up"];
    const next = cycle[(cycle.indexOf(task.status)+1)%cycle.length];
    const updated = tasks.map(t=>t.id===task.id?{...t,status:next}:t);
    await persistInteractionsAndTasks(interactions, updated);
    setTasks(updated);
  };

  const deleteTask = async (id: string) => {
    const updated = tasks.filter(t=>t.id!==id);
    await persistInteractionsAndTasks(interactions, updated);
    setTasks(updated);
  };

  const filteredContacts = contacts.filter(c => {
    if (typeFilter !== "all" && c.type !== typeFilter) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.email?.toLowerCase().includes(search.toLowerCase()) && !c.company?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const contactInteractions = selectedContact ? interactions.filter(i=>i.contactId===selectedContact.id) : [];
  const pendingTasks = tasks.filter(t => t.status !== "done");

  return (
    <div>
      {toast && (
        <div style={{ position:"fixed", bottom:"1.5rem", right:"1.5rem", zIndex:9999, background:"var(--navy)", color:"white", padding:"0.875rem 1.5rem", borderRadius:"var(--radius)", fontWeight:600, fontSize:"0.9rem", boxShadow:"var(--shadow-lg)" }}>{toast}</div>
      )}

      {/* Sub-nav */}
      <div style={{ display:"flex", gap:"0.5rem", marginBottom:"1.25rem", flexWrap:"wrap" }}>
        <button onClick={()=>{setView("contacts");setSelectedContact(null);}} style={{ padding:"0.5rem 1rem", borderRadius:"999px", fontWeight:600, fontSize:"0.8125rem", cursor:"pointer", fontFamily:"inherit", background:view==="contacts"&&!selectedContact?"var(--navy)":"white", color:view==="contacts"&&!selectedContact?"white":"var(--gray-600)", border:`1.5px solid ${view==="contacts"&&!selectedContact?"var(--navy)":"var(--gray-200)"}` }}>
          👥 Contacts ({contacts.length})
        </button>
        <button onClick={()=>{setView("tasks");setSelectedContact(null);}} style={{ padding:"0.5rem 1rem", borderRadius:"999px", fontWeight:600, fontSize:"0.8125rem", cursor:"pointer", fontFamily:"inherit", background:view==="tasks"?"var(--navy)":"white", color:view==="tasks"?"white":"var(--gray-600)", border:`1.5px solid ${view==="tasks"?"var(--navy)":"var(--gray-200)"}` }}>
          ✅ Tasks ({pendingTasks.length} pending)
        </button>
        {selectedContact && (
          <button onClick={()=>setSelectedContact(null)} style={{ padding:"0.5rem 1rem", borderRadius:"999px", fontWeight:600, fontSize:"0.8125rem", cursor:"pointer", fontFamily:"inherit", background:"white", color:"var(--gray-600)", border:"1.5px solid var(--gray-200)", marginLeft:"auto" }}>
            ← Back to Contacts
          </button>
        )}
      </div>

      {/* ── Contact detail view ── */}
      {selectedContact && (
        <div style={{ display:"grid", gridTemplateColumns:"360px 1fr", gap:"1.5rem" }}>
          {/* Left: contact info */}
          <div>
            <div className="card" style={{ padding:"1.5rem", marginBottom:"1rem" }}>
              <div style={{ display:"flex", alignItems:"flex-start", gap:"1rem", marginBottom:"1.25rem" }}>
                <div style={{ width:"48px", height:"48px", borderRadius:"50%", background:"var(--navy)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.375rem", flexShrink:0 }}>
                  {TYPE_ICONS[selectedContact.type]}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:800, color:"var(--navy)", fontSize:"1.0625rem" }}>{selectedContact.name}</div>
                  {selectedContact.company && <div style={{ fontSize:"0.875rem", color:"var(--gray-500)" }}>{selectedContact.company}</div>}
                  <span style={{ ...PRIORITY_STYLE[selectedContact.priority], padding:"2px 8px", borderRadius:"999px", fontSize:"0.7rem", fontWeight:700, display:"inline-block", marginTop:"4px" }}>
                    {PRIORITY_STYLE[selectedContact.priority].label}
                  </span>
                </div>
              </div>
              {selectedContact.email && <div style={{ fontSize:"0.875rem", color:"var(--gray-600)", marginBottom:"0.5rem" }}>✉️ {selectedContact.email}</div>}
              {selectedContact.phone && <div style={{ fontSize:"0.875rem", color:"var(--gray-600)", marginBottom:"0.5rem" }}>📞 {selectedContact.phone}</div>}
              {selectedContact.state && <div style={{ fontSize:"0.875rem", color:"var(--gray-600)", marginBottom:"0.5rem" }}>📍 {selectedContact.state}</div>}
              {selectedContact.nextContactDate && <div style={{ fontSize:"0.875rem", color:"#d97706", fontWeight:600, marginBottom:"0.5rem" }}>📅 Next contact: {selectedContact.nextContactDate}</div>}
              {selectedContact.notes && (
                <div style={{ marginTop:"1rem", padding:"0.75rem", background:"var(--gray-50)", borderRadius:"var(--radius)", fontSize:"0.875rem", color:"var(--gray-600)", lineHeight:1.65 }}>{selectedContact.notes}</div>
              )}
              <div style={{ display:"flex", gap:"0.5rem", marginTop:"1.25rem" }}>
                <button onClick={()=>{ setContactForm({...selectedContact}); setEditingContact(selectedContact); setShowContactForm(true); }} style={{ flex:1, padding:"0.5rem", background:"rgba(99,102,241,0.08)", border:"1px solid rgba(99,102,241,0.2)", borderRadius:"4px", fontSize:"0.8125rem", fontWeight:600, cursor:"pointer", color:"#6366f1", fontFamily:"inherit" }}>Edit</button>
                <button onClick={()=>deleteContact(selectedContact.id)} style={{ flex:1, padding:"0.5rem", background:"rgba(199,25,26,0.06)", color:"var(--red)", border:"1px solid rgba(199,25,26,0.15)", borderRadius:"4px", fontSize:"0.8125rem", fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>Delete</button>
              </div>
            </div>
            {/* Tasks for this contact */}
            <div className="card" style={{ padding:"1.25rem" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1rem" }}>
                <h3 style={{ fontWeight:700, color:"var(--navy)", fontSize:"0.9375rem" }}>Tasks</h3>
                <button onClick={()=>setShowTaskForm(true)} style={{ padding:"0.3rem 0.75rem", background:"var(--navy)", color:"white", border:"none", borderRadius:"4px", fontSize:"0.75rem", fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>+ Add</button>
              </div>
              {tasks.filter(t=>t.contactId===selectedContact.id).length===0 ? (
                <div style={{ color:"var(--gray-400)", fontSize:"0.8125rem" }}>No tasks for this contact.</div>
              ) : tasks.filter(t=>t.contactId===selectedContact.id).map(t => (
                <div key={t.id} style={{ display:"flex", gap:"0.5rem", alignItems:"flex-start", padding:"0.625rem 0", borderBottom:"1px solid var(--gray-50)" }}>
                  <button onClick={()=>cycleTaskStatus(t)} style={{ padding:"2px 6px", background:TASK_STATUS_STYLE[t.status].bg, color:TASK_STATUS_STYLE[t.status].color, border:"none", borderRadius:"4px", fontSize:"0.7rem", fontWeight:700, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap", flexShrink:0 }}>{TASK_STATUS_STYLE[t.status].label}</button>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:"0.875rem", fontWeight:600, color:"var(--navy)", textDecoration:t.status==="done"?"line-through":"none" }}>{t.title}</div>
                    {t.dueDate && <div style={{ fontSize:"0.75rem", color:"var(--gray-400)" }}>Due {t.dueDate}</div>}
                  </div>
                  <button onClick={()=>deleteTask(t.id)} style={{ background:"none", border:"none", color:"var(--gray-300)", cursor:"pointer", fontSize:"1rem", lineHeight:1, flexShrink:0 }}>×</button>
                </div>
              ))}
            </div>
          </div>

          {/* Right: interaction history */}
          <div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1rem" }}>
              <h3 style={{ fontWeight:700, color:"var(--navy)", fontSize:"1rem" }}>Interaction History</h3>
              <button onClick={()=>setShowInteractionForm(true)} className="btn-red" style={{ padding:"0.5rem 1.25rem", fontSize:"0.8125rem" }}>+ Log Interaction</button>
            </div>
            {contactInteractions.length===0 ? (
              <div className="card" style={{ padding:"2rem", textAlign:"center", color:"var(--gray-400)" }}>No interactions yet. Log your first call, email, or note.</div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:"0.75rem" }}>
                {contactInteractions.map(int => (
                  <div key={int.id} className="card" style={{ padding:"1.25rem" }}>
                    <div style={{ display:"flex", gap:"0.75rem", alignItems:"flex-start" }}>
                      <span style={{ fontSize:"1.375rem" }}>{INT_ICONS[int.type]}</span>
                      <div style={{ flex:1 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:"0.75rem", marginBottom:"0.375rem" }}>
                          <span style={{ fontWeight:700, color:"var(--navy)", fontSize:"0.9375rem" }}>{int.subject}</span>
                          <span style={{ fontSize:"0.75rem", color:"var(--gray-400)" }}>{int.date}</span>
                        </div>
                        {int.body && <p style={{ fontSize:"0.875rem", color:"var(--gray-600)", lineHeight:1.65 }}>{int.body}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Contacts list ── */}
      {!selectedContact && view === "contacts" && (
        <div>
          <div style={{ display:"flex", gap:"0.75rem", marginBottom:"1.25rem", flexWrap:"wrap" }}>
            <input className="form-input" placeholder="Search contacts…" value={search} onChange={e=>setSearch(e.target.value)} style={{ flex:1, minWidth:"180px" }} />
            <select className="form-input" value={typeFilter} onChange={e=>setTypeFilter(e.target.value as CRMType|"all")} style={{ width:"160px" }}>
              <option value="all">All Types</option>
              {(["contractor","supplier","homeowner","partner"] as CRMType[]).map(t=>(
                <option key={t} value={t}>{TYPE_ICONS[t]} {t.charAt(0).toUpperCase()+t.slice(1)}</option>
              ))}
            </select>
            <button onClick={()=>{ setContactForm({type:"contractor",priority:"medium"}); setEditingContact(null); setShowContactForm(true); }} className="btn-red" style={{ padding:"0.75rem 1.25rem", fontSize:"0.875rem" }}>+ Add Contact</button>
          </div>

          {loading ? (
            <div className="card" style={{ padding:"2rem", textAlign:"center", color:"var(--gray-400)" }}>Loading…</div>
          ) : filteredContacts.length===0 ? (
            <div className="card" style={{ padding:"3rem", textAlign:"center", color:"var(--gray-400)" }}>
              <div style={{ fontSize:"3rem", marginBottom:"1rem" }}>👥</div>
              <div style={{ fontWeight:700, marginBottom:"0.5rem" }}>No contacts yet</div>
              <div style={{ fontSize:"0.875rem" }}>Add your first contractor, supplier, or partner contact.</div>
            </div>
          ) : (
            <div className="card" style={{ overflow:"hidden" }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr style={{ background:"var(--gray-50)", borderBottom:"1px solid var(--gray-150)" }}>
                    {["Contact","Type","Priority","Next Contact","Tags","Actions"].map(h=>(
                      <th key={h} style={{ padding:"0.875rem 1rem", textAlign:"left", fontSize:"0.8rem", fontWeight:700, color:"var(--gray-500)", whiteSpace:"nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredContacts.map((c,i) => (
                    <tr key={c.id} style={{ borderBottom:i<filteredContacts.length-1?"1px solid var(--gray-50)":"none" }}>
                      <td style={{ padding:"1rem" }}>
                        <div style={{ fontWeight:700, color:"var(--navy)", fontSize:"0.9375rem" }}>{c.name}</div>
                        {c.company && <div style={{ fontSize:"0.8rem", color:"var(--gray-500)" }}>{c.company}</div>}
                        {c.email && <div style={{ fontSize:"0.8rem", color:"var(--gray-400)" }}>{c.email}</div>}
                      </td>
                      <td style={{ padding:"1rem" }}>
                        <span style={{ background:"var(--gray-100)", padding:"2px 8px", borderRadius:"999px", fontSize:"0.75rem", fontWeight:700 }}>
                          {TYPE_ICONS[c.type]} {c.type}
                        </span>
                      </td>
                      <td style={{ padding:"1rem" }}>
                        <span style={{ ...PRIORITY_STYLE[c.priority], padding:"2px 8px", borderRadius:"999px", fontSize:"0.75rem", fontWeight:700 }}>
                          {PRIORITY_STYLE[c.priority].label}
                        </span>
                      </td>
                      <td style={{ padding:"1rem", fontSize:"0.8125rem", color:c.nextContactDate?"#d97706":"var(--gray-400)", fontWeight:c.nextContactDate?600:400 }}>
                        {c.nextContactDate ?? "—"}
                      </td>
                      <td style={{ padding:"1rem" }}>
                        <div style={{ display:"flex", gap:"4px", flexWrap:"wrap" }}>
                          {(c.tags??[]).slice(0,3).map(tag=>(
                            <span key={tag} style={{ background:"rgba(22,163,74,0.1)", color:"#16a34a", padding:"1px 6px", borderRadius:"4px", fontSize:"0.7rem", fontWeight:700 }}>{tag}</span>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding:"1rem" }}>
                        <div style={{ display:"flex", gap:"0.375rem" }}>
                          <button onClick={()=>setSelectedContact(c)} style={{ padding:"0.3rem 0.75rem", background:"var(--navy)", color:"white", border:"none", borderRadius:"4px", fontSize:"0.75rem", fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>View</button>
                          <button onClick={()=>{setContactForm({...c});setEditingContact(c);setShowContactForm(true);}} style={{ padding:"0.3rem 0.625rem", background:"rgba(99,102,241,0.08)", border:"1px solid rgba(99,102,241,0.2)", borderRadius:"4px", fontSize:"0.75rem", fontWeight:600, cursor:"pointer", color:"#6366f1", fontFamily:"inherit" }}>Edit</button>
                          <button onClick={()=>deleteContact(c.id)} style={{ padding:"0.3rem 0.625rem", background:"rgba(199,25,26,0.06)", color:"var(--red)", border:"1px solid rgba(199,25,26,0.15)", borderRadius:"4px", fontSize:"0.75rem", fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>Del</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Tasks board ── */}
      {!selectedContact && view === "tasks" && (
        <div>
          <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:"1.25rem" }}>
            <button onClick={()=>setShowTaskForm(true)} className="btn-red" style={{ padding:"0.75rem 1.25rem", fontSize:"0.875rem" }}>+ New Task</button>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"1rem" }}>
            {(["todo","in_progress","follow_up","done"] as TaskStatus[]).map(status => {
              const colTasks = tasks.filter(t=>t.status===status);
              const st = TASK_STATUS_STYLE[status];
              return (
                <div key={status}>
                  <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", marginBottom:"0.875rem" }}>
                    <span style={{ background:st.bg, color:st.color, padding:"3px 10px", borderRadius:"999px", fontSize:"0.8125rem", fontWeight:700 }}>{st.label}</span>
                    <span style={{ fontSize:"0.8125rem", color:"var(--gray-400)", fontWeight:600 }}>{colTasks.length}</span>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:"0.625rem" }}>
                    {colTasks.map(t=>{
                      const contact = t.contactId ? contacts.find(c=>c.id===t.contactId) : null;
                      return (
                        <div key={t.id} className="card" style={{ padding:"1rem" }}>
                          <div style={{ fontWeight:700, color:"var(--navy)", fontSize:"0.875rem", marginBottom:"0.375rem" }}>{t.title}</div>
                          {contact && <div style={{ fontSize:"0.75rem", color:"var(--gray-500)", marginBottom:"0.375rem" }}>👤 {contact.name}</div>}
                          {t.dueDate && <div style={{ fontSize:"0.75rem", color:"#d97706", fontWeight:600, marginBottom:"0.5rem" }}>📅 {t.dueDate}</div>}
                          {t.notes && <div style={{ fontSize:"0.75rem", color:"var(--gray-500)", lineHeight:1.5 }}>{t.notes}</div>}
                          <div style={{ display:"flex", gap:"0.375rem", marginTop:"0.75rem" }}>
                            <button onClick={()=>cycleTaskStatus(t)} style={{ flex:1, padding:"0.3rem", background:st.bg, color:st.color, border:`1px solid ${st.color}30`, borderRadius:"4px", fontSize:"0.7rem", fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>→ Next</button>
                            <button onClick={()=>deleteTask(t.id)} style={{ padding:"0.3rem 0.625rem", background:"none", color:"var(--gray-300)", border:"1px solid var(--gray-150)", borderRadius:"4px", fontSize:"0.75rem", fontWeight:600, cursor:"pointer" }}>×</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Contact form modal ── */}
      {showContactForm && (
        <Modal title={editingContact?"Edit Contact":"New Contact"} onClose={()=>{setShowContactForm(false);setEditingContact(null);}}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
            <F label="Name *"><input className="form-input" value={contactForm.name??""} onChange={e=>setContactForm(p=>({...p,name:e.target.value}))} placeholder="James Carter" style={{ width:"100%" }} /></F>
            <F label="Type">
              <select className="form-input" value={contactForm.type??"contractor"} onChange={e=>setContactForm(p=>({...p,type:e.target.value as CRMType}))} style={{ width:"100%" }}>
                {(["contractor","supplier","homeowner","partner"] as CRMType[]).map(t=><option key={t} value={t}>{TYPE_ICONS[t]} {t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
              </select>
            </F>
            <F label="Company"><input className="form-input" value={contactForm.company??""} onChange={e=>setContactForm(p=>({...p,company:e.target.value}))} placeholder="Carter Roofing LLC" style={{ width:"100%" }} /></F>
            <F label="Priority">
              <select className="form-input" value={contactForm.priority??"medium"} onChange={e=>setContactForm(p=>({...p,priority:e.target.value as CRMPriority}))} style={{ width:"100%" }}>
                {(["low","medium","high","urgent"] as CRMPriority[]).map(p=><option key={p} value={p}>{PRIORITY_STYLE[p].label}</option>)}
              </select>
            </F>
            <F label="Email"><input className="form-input" type="email" value={contactForm.email??""} onChange={e=>setContactForm(p=>({...p,email:e.target.value}))} placeholder="james@carter.com" style={{ width:"100%" }} /></F>
            <F label="Phone"><input className="form-input" value={contactForm.phone??""} onChange={e=>setContactForm(p=>({...p,phone:e.target.value}))} placeholder="(555) 123-4567" style={{ width:"100%" }} /></F>
            <F label="State"><input className="form-input" value={contactForm.state??""} onChange={e=>setContactForm(p=>({...p,state:e.target.value}))} placeholder="Texas" style={{ width:"100%" }} /></F>
            <F label="Next Contact Date"><input className="form-input" type="date" value={contactForm.nextContactDate??""} onChange={e=>setContactForm(p=>({...p,nextContactDate:e.target.value}))} style={{ width:"100%" }} /></F>
            <F label="Tags (comma-separated)"><input className="form-input" value={(contactForm.tags??[]).join(",")} onChange={e=>setContactForm(p=>({...p,tags:e.target.value.split(",").map(s=>s.trim()).filter(Boolean)}))} placeholder="roofing, premium, TX" style={{ width:"100%" }} /></F>
            <F label="Notes"><textarea className="form-input" rows={3} value={contactForm.notes??""} onChange={e=>setContactForm(p=>({...p,notes:e.target.value}))} placeholder="Key observations…" style={{ width:"100%", resize:"vertical", gridColumn:"1/-1" }} /></F>
          </div>
          <div style={{ display:"flex", gap:"0.75rem", marginTop:"1.5rem", justifyContent:"flex-end" }}>
            <button onClick={()=>setShowContactForm(false)} className="btn-secondary" style={{ padding:"0.75rem 1.5rem" }}>Cancel</button>
            <button onClick={saveContact} className="btn-red" style={{ padding:"0.75rem 1.75rem" }}>Save</button>
          </div>
        </Modal>
      )}

      {/* ── Interaction form modal ── */}
      {showInteractionForm && selectedContact && (
        <Modal title={`Log Interaction — ${selectedContact.name}`} onClose={()=>setShowInteractionForm(false)}>
          <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
            <F label="Type">
              <select className="form-input" value={intForm.type??"note"} onChange={e=>setIntForm(p=>({...p,type:e.target.value as InteractionType}))} style={{ width:"100%" }}>
                {(["call","email","message","meeting","note"] as InteractionType[]).map(t=><option key={t} value={t}>{INT_ICONS[t]} {t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
              </select>
            </F>
            <F label="Subject *"><input className="form-input" value={intForm.subject??""} onChange={e=>setIntForm(p=>({...p,subject:e.target.value}))} placeholder="Called to discuss renewal…" style={{ width:"100%" }} /></F>
            <F label="Notes"><textarea className="form-input" rows={5} value={intForm.body??""} onChange={e=>setIntForm(p=>({...p,body:e.target.value}))} placeholder="Details of the interaction…" style={{ width:"100%", resize:"vertical" }} /></F>
          </div>
          <div style={{ display:"flex", gap:"0.75rem", marginTop:"1.5rem", justifyContent:"flex-end" }}>
            <button onClick={()=>setShowInteractionForm(false)} className="btn-secondary" style={{ padding:"0.75rem 1.5rem" }}>Cancel</button>
            <button onClick={saveInteraction} className="btn-red" style={{ padding:"0.75rem 1.75rem" }}>Save</button>
          </div>
        </Modal>
      )}

      {/* ── Task form modal ── */}
      {showTaskForm && (
        <Modal title="New Task" onClose={()=>setShowTaskForm(false)}>
          <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
            <F label="Task Title *"><input className="form-input" value={taskForm.title??""} onChange={e=>setTaskForm(p=>({...p,title:e.target.value}))} placeholder="Follow up on proposal…" style={{ width:"100%" }} /></F>
            <F label="Status">
              <select className="form-input" value={taskForm.status??"todo"} onChange={e=>setTaskForm(p=>({...p,status:e.target.value as TaskStatus}))} style={{ width:"100%" }}>
                {(["todo","in_progress","follow_up","done"] as TaskStatus[]).map(s=><option key={s} value={s}>{TASK_STATUS_STYLE[s].label}</option>)}
              </select>
            </F>
            <F label="Due Date"><input className="form-input" type="date" value={taskForm.dueDate??""} onChange={e=>setTaskForm(p=>({...p,dueDate:e.target.value}))} style={{ width:"100%" }} /></F>
            <F label="Notes"><textarea className="form-input" rows={3} value={taskForm.notes??""} onChange={e=>setTaskForm(p=>({...p,notes:e.target.value}))} placeholder="Additional context…" style={{ width:"100%", resize:"vertical" }} /></F>
          </div>
          <div style={{ display:"flex", gap:"0.75rem", marginTop:"1.5rem", justifyContent:"flex-end" }}>
            <button onClick={()=>setShowTaskForm(false)} className="btn-secondary" style={{ padding:"0.75rem 1.5rem" }}>Cancel</button>
            <button onClick={saveTask} className="btn-red" style={{ padding:"0.75rem 1.75rem" }}>Create Task</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
