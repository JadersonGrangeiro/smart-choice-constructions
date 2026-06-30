"use client";
import { useState, useEffect, useCallback } from "react";

/* ─── Types ─────────────────────────────────────────────────────────────── */
type CRMType      = "contractor" | "supplier" | "homeowner" | "partner";
type CRMStage     = "lead" | "contacted" | "proposal" | "negotiating" | "won" | "lost";
type CRMPriority  = "low" | "medium" | "high" | "urgent";
type InteractionType = "call" | "email_out" | "email_in" | "message" | "meeting" | "note";
type TaskStatus   = "todo" | "in_progress" | "follow_up" | "done";

interface CRMContact {
  id: string; name: string; type: CRMType; stage: CRMStage;
  company?: string; email?: string; phone?: string; state?: string;
  priority: CRMPriority; notes?: string; nextContactDate?: string;
  tags?: string[]; dealValue?: number; createdAt: string; updatedAt: string;
}
interface CRMInteraction {
  id: string; contactId: string;
  type: InteractionType; subject: string; body: string; date: string;
  fromEmail?: string;
}
interface CRMTask {
  id: string; contactId?: string; title: string;
  status: TaskStatus; dueDate?: string; notes?: string; createdAt: string;
}
interface ComposeEmail {
  to: string; toName: string; contactId: string;
  subject: string; body: string; isReply?: boolean; replyToId?: string;
}

/* ─── Constants ─────────────────────────────────────────────────────────── */
const STAGE_MAP: Record<CRMStage, { label: string; color: string; bg: string }> = {
  lead:        { label:"Lead",        color:"var(--gray-500)",  bg:"var(--gray-100)" },
  contacted:   { label:"Contacted",   color:"#6366f1",          bg:"rgba(99,102,241,0.1)" },
  proposal:    { label:"Proposal",    color:"#d97706",          bg:"rgba(245,158,11,0.1)" },
  negotiating: { label:"Negotiating", color:"#0891b2",          bg:"rgba(8,145,178,0.1)" },
  won:         { label:"Won ✓",       color:"#16a34a",          bg:"rgba(22,163,74,0.1)" },
  lost:        { label:"Lost",        color:"var(--red)",       bg:"rgba(199,25,26,0.1)" },
};
const STAGES: CRMStage[] = ["lead","contacted","proposal","negotiating","won","lost"];
const PRIORITY_MAP: Record<CRMPriority,{color:string;bg:string;label:string}> = {
  low:    { color:"var(--gray-500)", bg:"var(--gray-100)",        label:"Low" },
  medium: { color:"#d97706",         bg:"rgba(245,158,11,0.1)",   label:"Medium" },
  high:   { color:"#6366f1",         bg:"rgba(99,102,241,0.1)",   label:"High" },
  urgent: { color:"var(--red)",      bg:"rgba(199,25,26,0.1)",    label:"🚨 Urgent" },
};
const TYPE_ICONS: Record<CRMType,string>         = { contractor:"🔨", supplier:"🏪", homeowner:"🏠", partner:"🤝" };
const INT_ICONS: Record<InteractionType,string>  = { call:"📞", email_out:"📤", email_in:"📥", message:"💬", meeting:"🤝", note:"📝" };
const INT_LABELS: Record<InteractionType,string> = { call:"Call", email_out:"Email Sent", email_in:"Email Received", message:"Message", meeting:"Meeting", note:"Note" };
const TASK_MAP: Record<TaskStatus,{color:string;bg:string;label:string}> = {
  todo:        { color:"var(--gray-500)", bg:"var(--gray-100)",        label:"To Do" },
  in_progress: { color:"#6366f1",         bg:"rgba(99,102,241,0.1)",   label:"In Progress" },
  follow_up:   { color:"#d97706",         bg:"rgba(245,158,11,0.1)",   label:"Follow Up" },
  done:        { color:"#16a34a",         bg:"rgba(22,163,74,0.1)",    label:"Done ✓" },
};

const EMAIL_TEMPLATES = [
  { label:"Introduction",       subject:"Introduction — Smart Choice Constructions", body:"Hi {name},\n\nI'm reaching out from Smart Choice Constructions. We help connect homeowners with verified local contractors across the US.\n\nI'd love to learn more about your business and see how we can help you grow.\n\nBest regards,\nSmart Choice Team" },
  { label:"Follow Up",          subject:"Following up — Smart Choice Constructions", body:"Hi {name},\n\nJust following up on my previous message. I wanted to make sure you had a chance to review our platform.\n\nWould you have 15 minutes this week for a quick call?\n\nBest regards,\nSmart Choice Team" },
  { label:"Proposal",           subject:"Proposal — Join Smart Choice Constructions", body:"Hi {name},\n\nThank you for your interest in Smart Choice Constructions. I've put together a proposal tailored to your business needs.\n\nFirst month: $29.90 | Then $49.90/mo\n\nThis includes: verified profile listing, lead matching, review management, and priority placement in your area.\n\nReady to get started? Reply to this email or call us directly.\n\nBest regards,\nSmart Choice Team" },
  { label:"Welcome / Onboarding",subject:"Welcome to Smart Choice Constructions!", body:"Hi {name},\n\nWelcome to Smart Choice Constructions! We're excited to have you on board.\n\nHere are your next steps:\n1. Complete your profile at smartchoiceconstructions.com\n2. Upload your license and insurance documents\n3. Add photos of your past work\n\nOur team is here to help. Feel free to reply to this email with any questions.\n\nWelcome aboard!\nSmart Choice Team" },
  { label:"Re-engagement",      subject:"We miss you — Smart Choice Constructions", body:"Hi {name},\n\nWe noticed you haven't been active recently. We've made several improvements to our platform that could benefit your business.\n\nWould you like to reconnect and see what's new?\n\nBest regards,\nSmart Choice Team" },
];

/* ─── UI Components ─────────────────────────────────────────────────────── */
function Toast({ msg, ok = true }: { msg: string; ok?: boolean }) {
  return (
    <div style={{ position:"fixed", bottom:"1.5rem", right:"1.5rem", zIndex:9999, background: ok?"#16a34a":"var(--red)", color:"white", padding:"0.875rem 1.5rem", borderRadius:"var(--radius)", fontWeight:600, fontSize:"0.9rem", boxShadow:"var(--shadow-lg)" }}>
      {msg}
    </div>
  );
}

function Modal({ title, onClose, width = 640, children }: { title:string; onClose:()=>void; width?:number; children:React.ReactNode }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", zIndex:600, display:"flex", alignItems:"center", justifyContent:"center", padding:"1.5rem", overflowY:"auto" }}
      onClick={e=>{ if (e.target===e.currentTarget) onClose(); }}>
      <div style={{ background:"white", borderRadius:"var(--radius-xl)", padding:"2rem", width:"100%", maxWidth:`${width}px`, boxShadow:"var(--shadow-xl)", maxHeight:"92vh", overflowY:"auto" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.5rem" }}>
          <h2 style={{ fontWeight:800, color:"var(--navy)", fontSize:"1.125rem" }}>{title}</h2>
          <button onClick={onClose} style={{ background:"none", border:"none", fontSize:"1.5rem", cursor:"pointer", color:"var(--gray-400)", lineHeight:1, padding:"0.25rem" }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, span, children }: { label:string; span?:boolean; children:React.ReactNode }) {
  return (
    <div style={{ gridColumn: span?"1/-1":undefined }}>
      <label style={{ display:"block", fontWeight:700, color:"var(--gray-700)", fontSize:"0.8125rem", marginBottom:"0.375rem" }}>{label}</label>
      {children}
    </div>
  );
}

function Pill({ text, color, bg }: { text:string; color:string; bg:string }) {
  return <span style={{ background:bg, color, padding:"0.2rem 0.625rem", borderRadius:"999px", fontSize:"0.75rem", fontWeight:700, whiteSpace:"nowrap" }}>{text}</span>;
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════════════════ */
export default function CRMPage() {
  const [view,     setView]     = useState<"contacts"|"pipeline"|"tasks"|"inbox">("contacts");
  const [contacts, setContacts] = useState<CRMContact[]>([]);
  const [interactions, setInteractions] = useState<CRMInteraction[]>([]);
  const [tasks, setTasks]       = useState<CRMTask[]>([]);
  const [loading, setLoading]   = useState(true);

  // UI state
  const [selected,  setSelected]  = useState<CRMContact|null>(null);
  const [showCForm, setShowCForm] = useState(false);
  const [editC,     setEditC]     = useState<CRMContact|null>(null);
  const [cForm,     setCForm]     = useState<Partial<CRMContact>>({ type:"contractor", priority:"medium", stage:"lead" });

  const [showIntForm, setShowIntForm] = useState(false);
  const [intForm,     setIntForm]     = useState<Partial<CRMInteraction>>({ type:"note" });

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskForm,     setTaskForm]     = useState<Partial<CRMTask>>({ status:"todo" });

  const [compose,    setCompose]    = useState<ComposeEmail|null>(null);
  const [composeBody, setComposeBody] = useState("");
  const [composeSub,  setComposeSub]  = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);

  const [search,     setSearch]     = useState("");
  const [typeFilter, setTypeFilter] = useState<CRMType|"all">("all");
  const [stageFilter,setStageFilter]= useState<CRMStage|"all">("all");
  const [toast,      setToast]      = useState<{msg:string;ok?:boolean}|null>(null);

  const showToast = (msg:string, ok=true) => { setToast({msg,ok}); setTimeout(()=>setToast(null),3000); };

  /* Persistence */
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [r1,r2] = await Promise.all([
        fetch("/api/admin/platform-data?key=crm_contacts").then(r=>r.json()),
        fetch("/api/admin/platform-data?key=crm_interactions").then(r=>r.json()),
      ]);
      setContacts(r1.value ?? []);
      const d = r2.value ?? {};
      setInteractions(d.interactions ?? []);
      setTasks(d.tasks ?? []);
    } finally { setLoading(false); }
  }, []);
  useEffect(()=>{ load(); },[load]);

  const saveContacts = async (c: CRMContact[]) => {
    await fetch("/api/admin/platform-data",{ method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify({key:"crm_contacts",value:c}) });
    setContacts(c);
  };
  const saveInts = async (ints: CRMInteraction[], tks: CRMTask[]) => {
    await fetch("/api/admin/platform-data",{ method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify({key:"crm_interactions",value:{interactions:ints,tasks:tks}}) });
    setInteractions(ints); setTasks(tks);
  };

  /* Contact CRUD */
  const openNewContact = () => { setEditC(null); setCForm({type:"contractor",priority:"medium",stage:"lead"}); setShowCForm(true); };
  const openEditContact= (c:CRMContact) => { setEditC(c); setCForm({...c}); setShowCForm(true); };

  const saveContact = async () => {
    if (!cForm.name) { showToast("Name is required","false" as unknown as boolean); return; }
    const now = new Date().toISOString();
    const entry: CRMContact = {
      id: editC?.id ?? `c-${Date.now()}`,
      name: cForm.name!, type: cForm.type??"contractor", stage: cForm.stage??"lead",
      company: cForm.company, email: cForm.email, phone: cForm.phone,
      state: cForm.state, priority: cForm.priority??"medium",
      notes: cForm.notes, nextContactDate: cForm.nextContactDate,
      tags: cForm.tags, dealValue: cForm.dealValue ? +cForm.dealValue : undefined,
      createdAt: editC?.createdAt??now, updatedAt: now,
    };
    const updated = editC ? contacts.map(c=>c.id===editC.id?entry:c) : [...contacts, entry];
    await saveContacts(updated);
    showToast(editC ? "Contact updated ✓" : "Contact created ✓");
    setShowCForm(false); setEditC(null);
    if (selected?.id===entry.id) setSelected(entry);
  };

  const deleteContact = async (id:string) => {
    if (!confirm("Delete this contact and all their history?")) return;
    await saveContacts(contacts.filter(c=>c.id!==id));
    if (selected?.id===id) setSelected(null);
    showToast("Contact deleted");
  };

  const moveStage = async (contactId:string, stage:CRMStage) => {
    const now = new Date().toISOString();
    const updated = contacts.map(c=>c.id===contactId?{...c,stage,updatedAt:now}:c);
    await saveContacts(updated);
    if (selected?.id===contactId) setSelected(updated.find(c=>c.id===contactId)??null);
  };

  /* Interaction */
  const saveInteraction = async () => {
    if (!intForm.subject||!selected) return;
    const entry: CRMInteraction = {
      id:`i-${Date.now()}`, contactId:selected.id,
      type: intForm.type??"note", subject:intForm.subject!, body:intForm.body??"",
      date: new Date().toLocaleString("en-US",{month:"short",day:"numeric",year:"numeric",hour:"2-digit",minute:"2-digit"}),
    };
    const updated = [entry,...interactions];
    await saveInts(updated, tasks);
    showToast("Interaction saved ✓");
    setShowIntForm(false); setIntForm({type:"note"});
  };

  /* Email compose */
  const openCompose = (contact: CRMContact, isReply=false, replyInt?: CRMInteraction) => {
    setCompose({ to: contact.email??"", toName: contact.name, contactId: contact.id, subject: isReply&&replyInt?`Re: ${replyInt.subject}`:"", body:"", isReply, replyToId: replyInt?.id });
    setComposeSub(isReply&&replyInt?`Re: ${replyInt.subject}`:"");
    setComposeBody("");
  };

  const applyTemplate = (tpl: typeof EMAIL_TEMPLATES[0]) => {
    const name = compose?.toName.split(" ")[0] ?? "";
    setComposeSub(tpl.subject);
    setComposeBody(tpl.body.replace("{name}", name));
  };

  const sendEmail = async () => {
    if (!compose||!composeSub||!composeBody) return;
    if (!compose.to) { showToast("No email address for this contact", false); return; }
    setSendingEmail(true);
    try {
      const res = await fetch("/api/admin/crm/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: compose.to, toName: compose.toName, subject: composeSub, body: composeBody }),
      });
      if (!res.ok) {
        const d = await res.json();
        showToast(d.error ?? "Failed to send email", false);
        setSendingEmail(false);
        return;
      }
      // Log interaction after successful send
      const entry: CRMInteraction = {
        id:`i-${Date.now()}`, contactId: compose.contactId,
        type:"email_out", subject: composeSub, body: composeBody,
        date: new Date().toLocaleString("en-US",{month:"short",day:"numeric",year:"numeric",hour:"2-digit",minute:"2-digit"}),
      };
      await saveInts([entry,...interactions], tasks);
      showToast(`Email sent to ${compose.to} ✓`);
      setCompose(null); setComposeSub(""); setComposeBody("");
    } catch {
      showToast("Network error — email not sent", false);
    }
    setSendingEmail(false);
  };

  const logInboundEmail = async (contact: CRMContact) => {
    const subject = prompt("Subject of received email:");
    if (!subject) return;
    const body = prompt("Paste email body (optional):");
    const entry: CRMInteraction = {
      id:`i-${Date.now()}`, contactId: contact.id,
      type:"email_in", subject, body: body??"",
      fromEmail: contact.email,
      date: new Date().toLocaleString("en-US",{month:"short",day:"numeric",year:"numeric",hour:"2-digit",minute:"2-digit"}),
    };
    const updated = [entry,...interactions];
    await saveInts(updated, tasks);
    showToast("Incoming email logged ✓");
  };

  /* Task */
  const saveTask = async () => {
    if (!taskForm.title) return;
    const entry: CRMTask = {
      id:`t-${Date.now()}`, contactId: selected?.id,
      title:taskForm.title!, status:taskForm.status??"todo",
      dueDate:taskForm.dueDate, notes:taskForm.notes, createdAt:new Date().toISOString(),
    };
    const updated = [...tasks, entry];
    await saveInts(interactions, updated);
    showToast("Task created ✓");
    setShowTaskForm(false); setTaskForm({status:"todo"});
  };

  const cycleTask = async (t:CRMTask) => {
    const cycle:TaskStatus[] = ["todo","in_progress","follow_up","done"];
    const next = cycle[(cycle.indexOf(t.status)+1)%cycle.length];
    const updated = tasks.map(x=>x.id===t.id?{...x,status:next}:x);
    await saveInts(interactions, updated);
  };

  const deleteTask = async (id:string) => {
    await saveInts(interactions, tasks.filter(t=>t.id!==id));
  };

  /* Derived */
  const filtered = contacts.filter(c=>{
    if (typeFilter!=="all"&&c.type!==typeFilter) return false;
    if (stageFilter!=="all"&&c.stage!==stageFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!c.name.toLowerCase().includes(q)&&!c.email?.toLowerCase().includes(q)&&!c.company?.toLowerCase().includes(q)&&!c.phone?.includes(q)) return false;
    }
    return true;
  });

  const contactInts  = selected ? interactions.filter(i=>i.contactId===selected.id) : [];
  const contactTasks = selected ? tasks.filter(t=>t.contactId===selected.id) : [];
  const allEmails    = interactions.filter(i=>i.type==="email_in"||i.type==="email_out");
  const openTasks    = tasks.filter(t=>t.status!=="done");
  const urgentCount  = contacts.filter(c=>c.priority==="urgent").length;
  const pipelineVal  = contacts.filter(c=>!["won","lost"].includes(c.stage)).reduce((s,c)=>s+(c.dealValue??0),0);

  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"300px", flexDirection:"column", gap:"1rem", color:"var(--gray-400)" }}>
      <div style={{ width:"32px", height:"32px", border:"3px solid var(--gray-200)", borderTopColor:"var(--navy)", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      Loading CRM…
    </div>
  );

  return (
    <div>
      {toast && <Toast msg={toast.msg} ok={toast.ok} />}

      {/* ── Email Compose Modal ── */}
      {compose && (
        <Modal title={compose.isReply?"Reply Email":"Compose Email"} onClose={()=>setCompose(null)} width={700}>
          {/* Template picker */}
          <div style={{ marginBottom:"1rem" }}>
            <div style={{ fontSize:"0.8125rem", fontWeight:700, color:"var(--gray-500)", marginBottom:"0.5rem" }}>QUICK TEMPLATES</div>
            <div style={{ display:"flex", gap:"0.5rem", flexWrap:"wrap" }}>
              {EMAIL_TEMPLATES.map(tpl=>(
                <button key={tpl.label} onClick={()=>applyTemplate(tpl)}
                  style={{ padding:"0.375rem 0.75rem", background:"var(--gray-100)", color:"var(--gray-700)", border:"1px solid var(--gray-200)", borderRadius:"999px", fontSize:"0.75rem", fontWeight:600, cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s" }}>
                  {tpl.label}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:"0.875rem" }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.875rem" }}>
              <div>
                <label className="form-label">To</label>
                <input className="form-input" value={compose.to} readOnly style={{ background:"var(--gray-50)", color:"var(--gray-500)" }} />
              </div>
              <div>
                <label className="form-label">Contact</label>
                <input className="form-input" value={compose.toName} readOnly style={{ background:"var(--gray-50)", color:"var(--gray-500)" }} />
              </div>
            </div>
            <div>
              <label className="form-label">Subject *</label>
              <input className="form-input" placeholder="Email subject…" value={composeSub} onChange={e=>setComposeSub(e.target.value)} />
            </div>
            <div>
              <label className="form-label">Message *</label>
              <textarea value={composeBody} onChange={e=>setComposeBody(e.target.value)}
                placeholder="Type your email here…"
                style={{ width:"100%", minHeight:"200px", padding:"0.875rem 1.125rem", border:"1.5px solid var(--gray-200)", borderRadius:"var(--radius)", fontSize:"0.9375rem", fontFamily:"inherit", resize:"vertical", outline:"none" }} />
            </div>
            <div style={{ background:"rgba(22,46,94,0.05)", borderRadius:"var(--radius-sm)", padding:"0.75rem 1rem", fontSize:"0.8125rem", color:"var(--gray-600)" }}>
              💡 Clicking <strong>Send</strong> will log this email in the CRM timeline and open your email client (Outlook / Gmail / Apple Mail) with the message pre-filled for sending.
            </div>
          </div>
          <div style={{ display:"flex", gap:"0.75rem", marginTop:"1.5rem" }}>
            <button className="btn-red" onClick={sendEmail} disabled={sendingEmail||!composeSub||!composeBody} style={{ padding:"0.875rem 1.75rem" }}>
              {sendingEmail?"Sending…":"📤 Send Email"}
            </button>
            <button className="btn-secondary" onClick={()=>setCompose(null)} style={{ padding:"0.875rem 1.25rem" }}>Cancel</button>
          </div>
        </Modal>
      )}

      {/* ── Contact Form Modal ── */}
      {showCForm && (
        <Modal title={editC?"Edit Contact":"New Contact"} onClose={()=>setShowCForm(false)} width={680}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
            <Field label="Full Name *" span><input className="form-input" value={cForm.name??""} onChange={e=>setCForm(p=>({...p,name:e.target.value}))} /></Field>
            <Field label="Company"><input className="form-input" value={cForm.company??""} onChange={e=>setCForm(p=>({...p,company:e.target.value}))} /></Field>
            <Field label="Email"><input className="form-input" type="email" value={cForm.email??""} onChange={e=>setCForm(p=>({...p,email:e.target.value}))} /></Field>
            <Field label="Phone"><input className="form-input" value={cForm.phone??""} onChange={e=>setCForm(p=>({...p,phone:e.target.value}))} /></Field>
            <Field label="Type">
              <select className="form-select" value={cForm.type} onChange={e=>setCForm(p=>({...p,type:e.target.value as CRMType}))}>
                {(["contractor","supplier","homeowner","partner"] as CRMType[]).map(t=><option key={t} value={t}>{TYPE_ICONS[t]} {t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
              </select>
            </Field>
            <Field label="Stage">
              <select className="form-select" value={cForm.stage} onChange={e=>setCForm(p=>({...p,stage:e.target.value as CRMStage}))}>
                {STAGES.map(s=><option key={s} value={s}>{STAGE_MAP[s].label}</option>)}
              </select>
            </Field>
            <Field label="Priority">
              <select className="form-select" value={cForm.priority} onChange={e=>setCForm(p=>({...p,priority:e.target.value as CRMPriority}))}>
                {(["low","medium","high","urgent"] as CRMPriority[]).map(p=><option key={p} value={p}>{PRIORITY_MAP[p].label}</option>)}
              </select>
            </Field>
            <Field label="Deal Value ($)">
              <input className="form-input" type="number" min={0} value={cForm.dealValue??""} onChange={e=>setCForm(p=>({...p,dealValue:e.target.value?+e.target.value:undefined}))} placeholder="0" />
            </Field>
            <Field label="State / Location">
              <input className="form-input" value={cForm.state??""} onChange={e=>setCForm(p=>({...p,state:e.target.value}))} placeholder="TX" />
            </Field>
            <Field label="Next Contact Date">
              <input className="form-input" type="date" value={cForm.nextContactDate??""} onChange={e=>setCForm(p=>({...p,nextContactDate:e.target.value}))} />
            </Field>
            <Field label="Notes" span>
              <textarea value={cForm.notes??""} onChange={e=>setCForm(p=>({...p,notes:e.target.value}))}
                style={{ width:"100%", minHeight:"80px", padding:"0.75rem 1rem", border:"1.5px solid var(--gray-200)", borderRadius:"var(--radius)", fontSize:"0.9375rem", fontFamily:"inherit", resize:"vertical", outline:"none" }} />
            </Field>
          </div>
          <div style={{ display:"flex", gap:"0.75rem", marginTop:"1.5rem" }}>
            <button className="btn-red" onClick={saveContact} style={{ padding:"0.875rem 1.75rem" }}>
              {editC?"Save Changes":"Create Contact"}
            </button>
            <button className="btn-secondary" onClick={()=>setShowCForm(false)} style={{ padding:"0.875rem 1.25rem" }}>Cancel</button>
          </div>
        </Modal>
      )}

      {/* ── Log Interaction Modal ── */}
      {showIntForm && selected && (
        <Modal title={`Log Interaction — ${selected.name}`} onClose={()=>setShowIntForm(false)}>
          <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
            <Field label="Type">
              <select className="form-select" value={intForm.type} onChange={e=>setIntForm(p=>({...p,type:e.target.value as InteractionType}))}>
                {(["call","email_out","email_in","message","meeting","note"] as InteractionType[]).map(t=>(
                  <option key={t} value={t}>{INT_ICONS[t]} {INT_LABELS[t]}</option>
                ))}
              </select>
            </Field>
            <Field label="Subject *"><input className="form-input" value={intForm.subject??""} onChange={e=>setIntForm(p=>({...p,subject:e.target.value}))} /></Field>
            <Field label="Details / Body">
              <textarea value={intForm.body??""} onChange={e=>setIntForm(p=>({...p,body:e.target.value}))}
                style={{ width:"100%", minHeight:"100px", padding:"0.75rem 1rem", border:"1.5px solid var(--gray-200)", borderRadius:"var(--radius)", fontSize:"0.9375rem", fontFamily:"inherit", resize:"vertical", outline:"none" }} />
            </Field>
          </div>
          <div style={{ display:"flex", gap:"0.75rem", marginTop:"1.5rem" }}>
            <button className="btn-red" onClick={saveInteraction} style={{ padding:"0.875rem 1.75rem" }}>Save</button>
            <button className="btn-secondary" onClick={()=>setShowIntForm(false)} style={{ padding:"0.875rem 1.25rem" }}>Cancel</button>
          </div>
        </Modal>
      )}

      {/* ── Task Form Modal ── */}
      {showTaskForm && (
        <Modal title="New Task" onClose={()=>setShowTaskForm(false)}>
          <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
            <Field label="Task Title *"><input className="form-input" value={taskForm.title??""} onChange={e=>setTaskForm(p=>({...p,title:e.target.value}))} /></Field>
            {selected&&<div style={{ padding:"0.625rem 1rem", background:"var(--gray-50)", borderRadius:"var(--radius-sm)", fontSize:"0.875rem", color:"var(--gray-600)" }}>Linked to: <strong>{selected.name}</strong></div>}
            <Field label="Status">
              <select className="form-select" value={taskForm.status} onChange={e=>setTaskForm(p=>({...p,status:e.target.value as TaskStatus}))}>
                {(["todo","in_progress","follow_up"] as TaskStatus[]).map(s=><option key={s} value={s}>{TASK_MAP[s].label}</option>)}
              </select>
            </Field>
            <Field label="Due Date"><input className="form-input" type="date" value={taskForm.dueDate??""} onChange={e=>setTaskForm(p=>({...p,dueDate:e.target.value}))} /></Field>
            <Field label="Notes">
              <textarea value={taskForm.notes??""} onChange={e=>setTaskForm(p=>({...p,notes:e.target.value}))}
                style={{ width:"100%", minHeight:"80px", padding:"0.75rem 1rem", border:"1.5px solid var(--gray-200)", borderRadius:"var(--radius)", fontSize:"0.9375rem", fontFamily:"inherit", resize:"vertical", outline:"none" }} />
            </Field>
          </div>
          <div style={{ display:"flex", gap:"0.75rem", marginTop:"1.5rem" }}>
            <button className="btn-red" onClick={saveTask} style={{ padding:"0.875rem 1.75rem" }}>Create Task</button>
            <button className="btn-secondary" onClick={()=>setShowTaskForm(false)} style={{ padding:"0.875rem 1.25rem" }}>Cancel</button>
          </div>
        </Modal>
      )}

      {/* ─── HEADER ─── */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.5rem", flexWrap:"wrap", gap:"1rem" }}>
        <div>
          <h1 style={{ fontSize:"1.625rem", fontWeight:800, color:"var(--navy)", marginBottom:"0.2rem" }}>CRM</h1>
          <p style={{ color:"var(--gray-500)", fontSize:"0.875rem" }}>{contacts.length} contacts · {openTasks.length} open tasks · {allEmails.length} emails logged</p>
        </div>
        <button className="btn-red" onClick={openNewContact} style={{ padding:"0.75rem 1.5rem" }}>+ New Contact</button>
      </div>

      {/* ─── KPI STRIP ─── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:"1rem", marginBottom:"1.75rem" }}>
        {[
          { label:"Total Contacts",  value:contacts.length,  color:"var(--navy)" },
          { label:"Pipeline Value",  value:`$${pipelineVal.toLocaleString()}`, color:"#047857" },
          { label:"Urgent",          value:urgentCount,       color:"var(--red)" },
          { label:"Open Tasks",      value:openTasks.length,  color:"#d97706" },
          { label:"Emails Logged",   value:allEmails.length,  color:"#6366f1" },
          { label:"Won Deals",       value:contacts.filter(c=>c.stage==="won").length, color:"#16a34a" },
        ].map(k=>(
          <div key={k.label} className="card" style={{ padding:"1.125rem", borderTop:`3px solid ${k.color}` }}>
            <div style={{ fontSize:"1.5rem", fontWeight:800, color:k.color, letterSpacing:"-0.02em" }}>{k.value}</div>
            <div style={{ fontSize:"0.8125rem", fontWeight:600, color:"var(--gray-500)", marginTop:"0.2rem" }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* ─── VIEW TABS ─── */}
      <div style={{ display:"flex", gap:"0.375rem", marginBottom:"1.5rem", background:"var(--gray-100)", padding:"4px", borderRadius:"var(--radius)", width:"fit-content" }}>
        {([["contacts","👥 Contacts"],["pipeline","📊 Pipeline"],["tasks","✅ Tasks"],["inbox","📧 Email Inbox"]] as [typeof view, string][]).map(([v,l])=>(
          <button key={v} onClick={()=>setView(v)} style={{ padding:"0.5rem 1.125rem", border:"none", borderRadius:"calc(var(--radius) - 2px)", cursor:"pointer", fontFamily:"inherit", fontSize:"0.875rem", fontWeight:600, transition:"all 0.15s", background: view===v?"white":"transparent", color: view===v?"var(--navy)":"var(--gray-500)", boxShadow: view===v?"var(--shadow-xs)":"none" }}>
            {l}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════
          CONTACTS VIEW
      ══════════════════════════════════════════ */}
      {view==="contacts" && (
        <div style={{ display:"grid", gridTemplateColumns: selected?"1fr 400px":"1fr", gap:"1.5rem", alignItems:"start" }}>
          {/* LEFT: Contact list */}
          <div>
            {/* Filters */}
            <div style={{ display:"flex", gap:"0.75rem", marginBottom:"1rem", flexWrap:"wrap" }}>
              <input className="form-input" placeholder="🔍 Search name, email, company…" value={search} onChange={e=>setSearch(e.target.value)} style={{ flex:1, minWidth:"200px", padding:"0.625rem 1rem" }} />
              <select className="form-select" value={typeFilter} onChange={e=>setTypeFilter(e.target.value as CRMType|"all")} style={{ width:"160px" }}>
                <option value="all">All Types</option>
                {(["contractor","supplier","homeowner","partner"] as CRMType[]).map(t=><option key={t} value={t}>{TYPE_ICONS[t]} {t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
              </select>
              <select className="form-select" value={stageFilter} onChange={e=>setStageFilter(e.target.value as CRMStage|"all")} style={{ width:"160px" }}>
                <option value="all">All Stages</option>
                {STAGES.map(s=><option key={s} value={s}>{STAGE_MAP[s].label}</option>)}
              </select>
            </div>

            {filtered.length===0 && (
              <div className="card" style={{ padding:"3rem", textAlign:"center", color:"var(--gray-400)" }}>
                <div style={{ fontSize:"2.5rem", marginBottom:"0.75rem" }}>👥</div>
                <div style={{ fontWeight:600 }}>{contacts.length===0?"No contacts yet — add one above":"No contacts match filters"}</div>
              </div>
            )}

            <div style={{ display:"flex", flexDirection:"column", gap:"0.5rem" }}>
              {filtered.map(c=>{
                const st = STAGE_MAP[c.stage];
                const pr = PRIORITY_MAP[c.priority];
                const isSelected = selected?.id===c.id;
                return (
                  <div key={c.id} onClick={()=>setSelected(isSelected?null:c)}
                    style={{ padding:"1rem 1.25rem", background:isSelected?"rgba(22,46,94,0.04)":"white", borderRadius:"var(--radius)", border: isSelected?"1.5px solid var(--navy)":"1.5px solid var(--gray-150)", cursor:"pointer", transition:"all 0.15s", display:"flex", alignItems:"center", gap:"1rem" }}>
                    <div style={{ width:"40px", height:"40px", background: isSelected?"var(--navy)":"var(--gray-150)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, color: isSelected?"white":"var(--gray-500)", fontSize:"1rem", flexShrink:0 }}>
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:700, color:"var(--navy)", fontSize:"0.9375rem", marginBottom:"0.125rem" }}>{c.name}</div>
                      <div style={{ fontSize:"0.8125rem", color:"var(--gray-500)" }}>{c.company&&<span>{c.company} · </span>}{c.email||c.phone}</div>
                    </div>
                    <div style={{ display:"flex", gap:"0.375rem", flexWrap:"wrap", justifyContent:"flex-end" }}>
                      <span style={{ fontSize:"1.125rem" }}>{TYPE_ICONS[c.type]}</span>
                      <Pill text={st.label} color={st.color} bg={st.bg} />
                      {c.priority!=="medium"&&<Pill text={pr.label} color={pr.color} bg={pr.bg} />}
                    </div>
                    <div style={{ display:"flex", gap:"0.375rem", flexShrink:0 }} onClick={e=>e.stopPropagation()}>
                      {c.email&&<a href={`mailto:${c.email}`} title="Email" style={{ padding:"0.375rem 0.625rem", background:"rgba(99,102,241,0.1)", color:"#6366f1", borderRadius:"6px", fontSize:"0.8125rem", textDecoration:"none" }} onClick={()=>openCompose(c)}>✉️</a>}
                      {c.phone&&<a href={`tel:${c.phone.replace(/\D/g,"")}`} title="Call" style={{ padding:"0.375rem 0.625rem", background:"rgba(22,163,74,0.1)", color:"#16a34a", borderRadius:"6px", fontSize:"0.8125rem", textDecoration:"none" }}>📞</a>}
                      <button onClick={()=>openEditContact(c)} style={{ padding:"0.375rem 0.625rem", background:"var(--navy)", color:"white", border:"none", borderRadius:"6px", fontSize:"0.75rem", fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>Edit</button>
                      <button onClick={()=>deleteContact(c.id)} style={{ padding:"0.375rem 0.5rem", background:"rgba(199,25,26,0.08)", color:"var(--red)", border:"none", borderRadius:"6px", fontSize:"0.8125rem", cursor:"pointer" }}>🗑</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Contact detail panel */}
          {selected && (
            <div style={{ position:"sticky", top:"90px" }}>
              <div className="card" style={{ padding:"1.5rem" }}>
                {/* Header */}
                <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:"1.25rem" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"0.875rem" }}>
                    <div style={{ width:"52px", height:"52px", background:"var(--navy)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, color:"white", fontSize:"1.25rem", flexShrink:0 }}>
                      {selected.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight:800, color:"var(--navy)", fontSize:"1.0625rem" }}>{selected.name}</div>
                      {selected.company&&<div style={{ fontSize:"0.875rem", color:"var(--gray-500)" }}>{selected.company}</div>}
                    </div>
                  </div>
                  <button onClick={()=>setSelected(null)} style={{ background:"none", border:"none", color:"var(--gray-400)", cursor:"pointer", fontSize:"1.25rem", padding:"0.25rem" }}>×</button>
                </div>

                {/* Info */}
                <div style={{ display:"flex", flexDirection:"column", gap:"0.5rem", marginBottom:"1.25rem", fontSize:"0.875rem" }}>
                  {selected.email&&<div style={{ display:"flex", alignItems:"center", gap:"0.5rem", color:"var(--gray-600)" }}>📧 <a href={`mailto:${selected.email}`} style={{ color:"var(--navy)", textDecoration:"none", fontWeight:600 }}>{selected.email}</a></div>}
                  {selected.phone&&<div style={{ display:"flex", alignItems:"center", gap:"0.5rem", color:"var(--gray-600)" }}>📞 <a href={`tel:${selected.phone.replace(/\D/g,"")}`} style={{ color:"var(--navy)", textDecoration:"none", fontWeight:600 }}>{selected.phone}</a></div>}
                  {selected.state&&<div style={{ color:"var(--gray-600)" }}>📍 {selected.state}</div>}
                  {selected.dealValue&&<div style={{ color:"#16a34a", fontWeight:700 }}>💰 ${selected.dealValue.toLocaleString()}</div>}
                  {selected.nextContactDate&&<div style={{ color:"var(--gray-600)" }}>📅 Follow up: {selected.nextContactDate}</div>}
                </div>

                {/* Stage selector */}
                <div style={{ marginBottom:"1.25rem" }}>
                  <div style={{ fontSize:"0.75rem", fontWeight:700, color:"var(--gray-400)", marginBottom:"0.5rem", textTransform:"uppercase", letterSpacing:"0.08em" }}>PIPELINE STAGE</div>
                  <div style={{ display:"flex", gap:"0.25rem", flexWrap:"wrap" }}>
                    {STAGES.map(s=>{
                      const st = STAGE_MAP[s];
                      const active = selected.stage===s;
                      return (
                        <button key={s} onClick={()=>moveStage(selected.id, s)}
                          style={{ padding:"0.3rem 0.625rem", border: active?`2px solid ${st.color}`:"1px solid var(--gray-200)", borderRadius:"999px", fontSize:"0.75rem", fontWeight:700, cursor:"pointer", fontFamily:"inherit", background: active?st.bg:"white", color: active?st.color:"var(--gray-500)", transition:"all 0.15s" }}>
                          {st.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Notes */}
                {selected.notes&&(
                  <div style={{ padding:"0.875rem", background:"rgba(245,158,11,0.07)", borderRadius:"var(--radius-sm)", border:"1px solid rgba(245,158,11,0.2)", fontSize:"0.875rem", color:"var(--gray-700)", marginBottom:"1.25rem" }}>
                    📝 {selected.notes}
                  </div>
                )}

                {/* Action buttons */}
                <div style={{ display:"flex", gap:"0.5rem", flexWrap:"wrap", marginBottom:"1.5rem" }}>
                  {selected.email&&<button onClick={()=>openCompose(selected)} className="btn-red" style={{ padding:"0.5rem 0.875rem", fontSize:"0.8125rem" }}>✉️ Email</button>}
                  {selected.phone&&<a href={`tel:${selected.phone.replace(/\D/g,"")}`} className="btn-primary" style={{ padding:"0.5rem 0.875rem", fontSize:"0.8125rem" }}>📞 Call</a>}
                  <button onClick={()=>{ setShowIntForm(true); }} style={{ padding:"0.5rem 0.875rem", border:"1.5px solid var(--gray-200)", background:"white", borderRadius:"var(--radius)", fontSize:"0.8125rem", fontWeight:600, cursor:"pointer", fontFamily:"inherit", color:"var(--gray-700)" }}>+ Log Activity</button>
                  <button onClick={()=>{ setShowTaskForm(true); }} style={{ padding:"0.5rem 0.875rem", border:"1.5px solid var(--gray-200)", background:"white", borderRadius:"var(--radius)", fontSize:"0.8125rem", fontWeight:600, cursor:"pointer", fontFamily:"inherit", color:"var(--gray-700)" }}>+ Task</button>
                  {selected.email&&<button onClick={()=>logInboundEmail(selected)} style={{ padding:"0.5rem 0.875rem", border:"1.5px solid rgba(99,102,241,0.3)", background:"rgba(99,102,241,0.06)", borderRadius:"var(--radius)", fontSize:"0.8125rem", fontWeight:600, cursor:"pointer", fontFamily:"inherit", color:"#6366f1" }}>📥 Log Received</button>}
                </div>

                {/* Tasks for this contact */}
                {contactTasks.length>0&&(
                  <div style={{ marginBottom:"1.25rem" }}>
                    <div style={{ fontSize:"0.75rem", fontWeight:700, color:"var(--gray-400)", marginBottom:"0.5rem", textTransform:"uppercase", letterSpacing:"0.08em" }}>TASKS</div>
                    {contactTasks.map(t=>{
                      const ts = TASK_MAP[t.status];
                      return (
                        <div key={t.id} style={{ display:"flex", alignItems:"center", gap:"0.5rem", padding:"0.5rem 0", borderBottom:"1px solid var(--gray-50)" }}>
                          <button onClick={()=>cycleTask(t)} style={{ flexShrink:0, background:ts.bg, color:ts.color, border:"none", borderRadius:"999px", padding:"0.2rem 0.625rem", fontSize:"0.6875rem", fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>{ts.label}</button>
                          <span style={{ flex:1, fontSize:"0.875rem", color:"var(--gray-700)", textDecoration:t.status==="done"?"line-through":"none" }}>{t.title}</span>
                          {t.dueDate&&<span style={{ fontSize:"0.75rem", color:"var(--gray-400)" }}>{t.dueDate}</span>}
                          <button onClick={()=>deleteTask(t.id)} style={{ background:"none", border:"none", color:"var(--gray-300)", cursor:"pointer", fontSize:"0.875rem" }}>×</button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Interaction timeline */}
                <div>
                  <div style={{ fontSize:"0.75rem", fontWeight:700, color:"var(--gray-400)", marginBottom:"0.625rem", textTransform:"uppercase", letterSpacing:"0.08em" }}>ACTIVITY TIMELINE</div>
                  {contactInts.length===0&&<div style={{ fontSize:"0.875rem", color:"var(--gray-400)", padding:"0.5rem 0" }}>No activity yet. Use the buttons above to log your first interaction.</div>}
                  <div style={{ display:"flex", flexDirection:"column", gap:"0.75rem" }}>
                    {contactInts.map(i=>(
                      <div key={i.id} style={{ display:"flex", gap:"0.75rem", paddingBottom:"0.75rem", borderBottom:"1px solid var(--gray-50)" }}>
                        <div style={{ fontSize:"1.25rem", flexShrink:0, lineHeight:1.4 }}>{INT_ICONS[i.type]}</div>
                        <div style={{ flex:1 }}>
                          <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", gap:"0.5rem" }}>
                            <div style={{ fontWeight:700, fontSize:"0.875rem", color:"var(--navy)" }}>{i.subject}</div>
                            <div style={{ fontSize:"0.75rem", color:"var(--gray-400)", flexShrink:0 }}>{i.date}</div>
                          </div>
                          <div style={{ fontSize:"0.75rem", color:"var(--gray-500)", fontWeight:600, marginBottom:"0.25rem" }}>{INT_LABELS[i.type]}{i.fromEmail&&` from ${i.fromEmail}`}</div>
                          {i.body&&<div style={{ fontSize:"0.8125rem", color:"var(--gray-600)", lineHeight:1.5 }}>{i.body}</div>}
                          {(i.type==="email_in"||i.type==="email_out")&&(
                            <button onClick={()=>openCompose(selected, true, i)} style={{ marginTop:"0.375rem", background:"rgba(99,102,241,0.08)", color:"#6366f1", border:"none", borderRadius:"999px", padding:"0.25rem 0.625rem", fontSize:"0.75rem", fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>↩ Reply</button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════
          PIPELINE VIEW (Kanban)
      ══════════════════════════════════════════ */}
      {view==="pipeline" && (
        <div>
          <div style={{ overflowX:"auto", paddingBottom:"1rem" }}>
            <div style={{ display:"flex", gap:"1rem", minWidth:"900px" }}>
              {STAGES.map(stage=>{
                const st    = STAGE_MAP[stage];
                const cols  = contacts.filter(c=>c.stage===stage);
                const total = cols.reduce((s,c)=>s+(c.dealValue??0),0);
                return (
                  <div key={stage} style={{ flex:1, minWidth:"180px" }}>
                    {/* Column header */}
                    <div style={{ background:st.bg, border:`1.5px solid ${st.color}40`, borderRadius:"var(--radius)", padding:"0.75rem 1rem", marginBottom:"0.75rem", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                      <span style={{ fontWeight:700, color:st.color, fontSize:"0.875rem" }}>{st.label}</span>
                      <span style={{ background:"rgba(0,0,0,0.08)", color:st.color, padding:"0.1rem 0.5rem", borderRadius:"999px", fontSize:"0.75rem", fontWeight:700 }}>{cols.length}</span>
                    </div>
                    {total>0&&<div style={{ fontSize:"0.75rem", color:st.color, fontWeight:700, marginBottom:"0.75rem", paddingLeft:"0.25rem" }}>${total.toLocaleString()}</div>}
                    {/* Cards */}
                    <div style={{ display:"flex", flexDirection:"column", gap:"0.625rem" }}>
                      {cols.map(c=>(
                        <div key={c.id} className="card" style={{ padding:"0.875rem", cursor:"pointer" }} onClick={()=>{ setView("contacts"); setSelected(c); }}>
                          <div style={{ fontWeight:700, color:"var(--navy)", fontSize:"0.875rem", marginBottom:"0.25rem" }}>{c.name}</div>
                          {c.company&&<div style={{ fontSize:"0.75rem", color:"var(--gray-400)", marginBottom:"0.375rem" }}>{c.company}</div>}
                          {c.dealValue&&<div style={{ fontSize:"0.875rem", fontWeight:700, color:"#16a34a", marginBottom:"0.375rem" }}>${c.dealValue.toLocaleString()}</div>}
                          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                            <span style={{ fontSize:"1rem" }}>{TYPE_ICONS[c.type]}</span>
                            <Pill text={PRIORITY_MAP[c.priority].label} color={PRIORITY_MAP[c.priority].color} bg={PRIORITY_MAP[c.priority].bg} />
                          </div>
                          {/* Move stage buttons */}
                          <div style={{ display:"flex", gap:"0.25rem", marginTop:"0.625rem" }} onClick={e=>e.stopPropagation()}>
                            {STAGES.indexOf(stage)>0&&(
                              <button onClick={()=>moveStage(c.id,STAGES[STAGES.indexOf(stage)-1])} style={{ flex:1, padding:"0.25rem", background:"var(--gray-100)", border:"none", borderRadius:"4px", fontSize:"0.6875rem", cursor:"pointer", fontFamily:"inherit", color:"var(--gray-500)" }}>← Back</button>
                            )}
                            {STAGES.indexOf(stage)<STAGES.length-1&&(
                              <button onClick={()=>moveStage(c.id,STAGES[STAGES.indexOf(stage)+1])} style={{ flex:1, padding:"0.25rem", background:"var(--navy)", color:"white", border:"none", borderRadius:"4px", fontSize:"0.6875rem", cursor:"pointer", fontFamily:"inherit" }}>Next →</button>
                            )}
                          </div>
                        </div>
                      ))}
                      {cols.length===0&&(
                        <div style={{ padding:"1.5rem", textAlign:"center", color:"var(--gray-300)", fontSize:"0.8125rem", border:"2px dashed var(--gray-200)", borderRadius:"var(--radius)" }}>Empty</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          TASKS VIEW
      ══════════════════════════════════════════ */}
      {view==="tasks" && (
        <div>
          <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:"1rem" }}>
            <button className="btn-red" onClick={()=>setShowTaskForm(true)} style={{ padding:"0.625rem 1.25rem" }}>+ New Task</button>
          </div>
          {tasks.length===0&&(
            <div className="card" style={{ padding:"3rem", textAlign:"center", color:"var(--gray-400)" }}>
              <div style={{ fontSize:"2.5rem", marginBottom:"0.75rem" }}>✅</div>
              <div style={{ fontWeight:600 }}>No tasks yet</div>
            </div>
          )}
          <div style={{ display:"flex", flexDirection:"column", gap:"0.5rem" }}>
            {tasks.map(t=>{
              const ts = TASK_MAP[t.status];
              const contact = contacts.find(c=>c.id===t.contactId);
              return (
                <div key={t.id} className="card" style={{ padding:"1rem 1.25rem", display:"flex", alignItems:"center", gap:"1rem", opacity:t.status==="done"?0.6:1 }}>
                  <button onClick={()=>cycleTask(t)} style={{ background:ts.bg, color:ts.color, border:"none", borderRadius:"999px", padding:"0.3rem 0.75rem", fontSize:"0.75rem", fontWeight:700, cursor:"pointer", fontFamily:"inherit", flexShrink:0 }}>{ts.label}</button>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, color:"var(--navy)", fontSize:"0.9375rem", textDecoration:t.status==="done"?"line-through":"none" }}>{t.title}</div>
                    {contact&&<div style={{ fontSize:"0.8125rem", color:"var(--gray-400)", marginTop:"0.125rem" }}>🔗 {contact.name}</div>}
                    {t.notes&&<div style={{ fontSize:"0.8125rem", color:"var(--gray-500)", marginTop:"0.125rem" }}>{t.notes}</div>}
                  </div>
                  {t.dueDate&&<div style={{ fontSize:"0.8125rem", color: new Date(t.dueDate)<new Date()&&t.status!=="done"?"var(--red)":"var(--gray-400)", fontWeight:600, flexShrink:0 }}>📅 {t.dueDate}</div>}
                  <button onClick={()=>deleteTask(t.id)} style={{ background:"none", border:"none", color:"var(--gray-300)", cursor:"pointer", fontSize:"1.125rem", flexShrink:0 }}>×</button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          EMAIL INBOX VIEW
      ══════════════════════════════════════════ */}
      {view==="inbox" && (
        <div>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1rem" }}>
            <div style={{ fontSize:"0.875rem", color:"var(--gray-500)" }}>All email activity logged in CRM · {allEmails.length} emails</div>
            <div style={{ padding:"0.625rem 1rem", background:"rgba(99,102,241,0.08)", border:"1px solid rgba(99,102,241,0.2)", borderRadius:"var(--radius)", fontSize:"0.8125rem", color:"#6366f1", fontWeight:600 }}>
              💡 To receive emails in CRM: connect Mailgun or Gmail integration in Settings
            </div>
          </div>

          {allEmails.length===0&&(
            <div className="card" style={{ padding:"3rem", textAlign:"center", color:"var(--gray-400)" }}>
              <div style={{ fontSize:"2.5rem", marginBottom:"0.75rem" }}>📧</div>
              <div style={{ fontWeight:600, marginBottom:"0.5rem" }}>No emails logged yet</div>
              <div style={{ fontSize:"0.875rem" }}>Open a contact and click "Email" to compose or "Log Received" to record incoming emails.</div>
            </div>
          )}

          <div style={{ display:"flex", flexDirection:"column", gap:"0.625rem" }}>
            {[...allEmails].sort((a,b)=>b.date.localeCompare(a.date)).map(i=>{
              const contact = contacts.find(c=>c.id===i.contactId);
              const isOut = i.type==="email_out";
              return (
                <div key={i.id} className="card" style={{ padding:"1.125rem 1.5rem", borderLeft:`4px solid ${isOut?"#6366f1":"#16a34a"}` }}>
                  <div style={{ display:"flex", alignItems:"flex-start", gap:"1rem" }}>
                    <div style={{ fontSize:"1.5rem", flexShrink:0 }}>{isOut?"📤":"📥"}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", gap:"1rem", marginBottom:"0.25rem" }}>
                        <div style={{ fontWeight:700, color:"var(--navy)", fontSize:"0.9375rem" }}>{i.subject}</div>
                        <div style={{ fontSize:"0.8125rem", color:"var(--gray-400)", flexShrink:0 }}>{i.date}</div>
                      </div>
                      <div style={{ fontSize:"0.8125rem", color:"var(--gray-500)", marginBottom:"0.5rem" }}>
                        {isOut?"Sent to":"Received from"} {contact?.name??i.fromEmail??"Unknown"} {contact?.email&&`<${contact.email}>`}
                      </div>
                      {i.body&&<div style={{ fontSize:"0.875rem", color:"var(--gray-600)", lineHeight:1.6, whiteSpace:"pre-wrap", maxHeight:"80px", overflow:"hidden", maskImage:"linear-gradient(to bottom, black 60%, transparent 100%)" }}>{i.body}</div>}
                    </div>
                    {contact&&(
                      <div style={{ flexShrink:0 }}>
                        <button onClick={()=>openCompose(contact,true,i)} style={{ padding:"0.5rem 0.875rem", background:"rgba(99,102,241,0.1)", color:"#6366f1", border:"none", borderRadius:"var(--radius-xs)", fontSize:"0.8125rem", fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
                          ↩ Reply
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
