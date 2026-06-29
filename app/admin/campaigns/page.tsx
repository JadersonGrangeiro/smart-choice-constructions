"use client";
import { useState, useEffect, useCallback } from "react";

type CampaignStatus = "active" | "scheduled" | "ended" | "draft";
type CampaignTarget = "all_contractors" | "new_contractors" | "past_due" | "all_homeowners" | "suppliers";

const TARGET_LABELS: Record<CampaignTarget, string> = {
  all_contractors:  "All Contractors",
  new_contractors:  "New Contractors (< 30 days)",
  past_due:         "Past Due Contractors",
  all_homeowners:   "All Homeowners",
  suppliers:        "Supplier Listings",
};

interface Campaign {
  id: string; name: string; type: "discount" | "email" | "banner" | "feature";
  target: CampaignTarget; status: CampaignStatus;
  startDate: string; endDate: string;
  description: string;
  couponCode?: string; discountValue?: string;
  impressions: number; conversions: number; revenue: number;
}

const MOCK_CAMPAIGNS: Campaign[] = [
  { id: "cam1", name: "Summer 2025 Launch",        type: "discount", target: "all_contractors",  status: "active",    startDate: "Jun 1, 2025",  endDate: "Aug 31, 2025", description: "50% off first month for new contractor signups during summer launch window.", couponCode: "LAUNCH50",  discountValue: "50%", impressions: 2400, conversions: 47, revenue: 0 },
  { id: "cam2", name: "Partner Supplier Welcome",  type: "email",    target: "suppliers",        status: "active",    startDate: "Jun 28, 2025", endDate: "Jul 31, 2025", description: "Email campaign welcoming the first wave of local suppliers to the platform.", impressions: 10, conversions: 10, revenue: 0 },
  { id: "cam3", name: "Win-Back: Suspended Pros",  type: "email",    target: "past_due",        status: "scheduled", startDate: "Jul 1, 2025",  endDate: "Jul 15, 2025", description: "Re-engagement campaign for contractors whose profiles are suspended due to payment failure.", couponCode: "RETURN20", discountValue: "20%", impressions: 0, conversions: 0, revenue: 0 },
  { id: "cam4", name: "Spring Remodeling Promo",   type: "banner",   target: "all_homeowners",  status: "ended",     startDate: "Mar 1, 2025",  endDate: "May 31, 2025", description: "Homepage banner campaign targeting homeowners starting spring projects.", impressions: 18400, conversions: 892, revenue: 0 },
  { id: "cam5", name: "First Month Free",           type: "discount", target: "new_contractors", status: "draft",     startDate: "",             endDate: "", description: "100% discount first month — reserve for strategic partnerships only.", couponCode: "FREEMONTH", discountValue: "100%", impressions: 0, conversions: 0, revenue: 0 },
];

const STATUS_STYLE: Record<CampaignStatus, { bg: string; color: string; label: string }> = {
  active:    { bg: "rgba(22,163,74,0.1)",  color: "#16a34a", label: "Active" },
  scheduled: { bg: "rgba(99,102,241,0.1)", color: "#6366f1", label: "Scheduled" },
  ended:     { bg: "var(--gray-100)",       color: "var(--gray-500)", label: "Ended" },
  draft:     { bg: "rgba(245,158,11,0.1)", color: "#d97706", label: "Draft" },
};

const TYPE_ICONS: Record<string, string> = { discount: "🎟️", email: "📧", banner: "🖼️", feature: "⭐" };

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState(MOCK_CAMPAIGNS);
  const [showNew, setShowNew] = useState(false);
  const [filter, setFilter] = useState<CampaignStatus | "all">("all");
  const [newC, setNewC] = useState<Partial<Campaign>>({ type: "discount", target: "all_contractors", status: "draft" });

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/platform-data?key=campaigns");
      const json = await res.json();
      if (json.value && Array.isArray(json.value)) setCampaigns(json.value);
    } catch {}
  }, []);

  const persist = useCallback(async (updated: Campaign[]) => {
    fetch("/api/admin/platform-data", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: "campaigns", value: updated }) }).catch(() => {});
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = filter === "all" ? campaigns : campaigns.filter(c => c.status === filter);
  const totalConversions = campaigns.filter(c => c.status === "active" || c.status === "ended").reduce((s,c) => s + c.conversions, 0);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.625rem", fontWeight: 800, color: "var(--navy)", marginBottom: "0.25rem" }}>Campaigns</h1>
          <p style={{ color: "var(--gray-500)", fontSize: "0.875rem" }}>
            {campaigns.filter(c => c.status === "active").length} active · {totalConversions.toLocaleString()} total conversions
          </p>
        </div>
        <button className="btn-red" onClick={() => setShowNew(true)} style={{ padding: "0.75rem 1.5rem" }}>+ New Campaign</button>
      </div>

      {/* Summary metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { label: "Active Campaigns",   value: campaigns.filter(c=>c.status==="active").length },
          { label: "Total Conversions",  value: totalConversions.toLocaleString() },
          { label: "Total Impressions",  value: campaigns.reduce((s,c)=>s+c.impressions,0).toLocaleString() },
          { label: "Campaign Budget",    value: "Coupon-based" },
        ].map(m => (
          <div key={m.label} className="card" style={{ padding: "1.25rem" }}>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--navy)", marginBottom: "0.25rem" }}>{m.value}</div>
            <div style={{ fontSize: "0.875rem", color: "var(--gray-500)" }}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {(["all","active","scheduled","draft","ended"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "0.375rem 0.875rem", borderRadius: "999px",
            background: filter === f ? "var(--navy)" : "white",
            color: filter === f ? "white" : "var(--gray-600)",
            border: `1.5px solid ${filter === f ? "var(--navy)" : "var(--gray-200)"}`,
            fontWeight: 600, fontSize: "0.8125rem", cursor: "pointer", fontFamily: "inherit",
          }}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {showNew && (
        <div className="card" style={{ padding: "1.75rem", marginBottom: "1.5rem", border: "2px solid var(--navy)" }}>
          <h3 style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "1.25rem" }}>New Campaign</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
            <div style={{ gridColumn: "1/-1" }}><label className="form-label">Campaign Name *</label><input className="form-input" value={newC.name ?? ""} onChange={e => setNewC(p => ({ ...p, name: e.target.value }))} /></div>
            <div><label className="form-label">Type</label><select className="form-select" value={newC.type} onChange={e => setNewC(p => ({ ...p, type: e.target.value as any }))}>{["discount","email","banner","feature"].map(t => <option key={t} value={t}>{TYPE_ICONS[t]} {t.charAt(0).toUpperCase()+t.slice(1)}</option>)}</select></div>
            <div><label className="form-label">Target Audience</label><select className="form-select" value={newC.target} onChange={e => setNewC(p => ({ ...p, target: e.target.value as CampaignTarget }))}>{Object.entries(TARGET_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}</select></div>
            <div><label className="form-label">Coupon Code</label><input className="form-input" placeholder="OPTIONAL" value={newC.couponCode ?? ""} onChange={e => setNewC(p => ({ ...p, couponCode: e.target.value.toUpperCase() }))} style={{ fontFamily: "monospace", fontWeight: 700 }} /></div>
            <div><label className="form-label">Start Date</label><input className="form-input" type="date" onChange={e => setNewC(p => ({ ...p, startDate: e.target.value }))} /></div>
            <div><label className="form-label">End Date</label><input className="form-input" type="date" onChange={e => setNewC(p => ({ ...p, endDate: e.target.value }))} /></div>
            <div style={{ gridColumn: "1/-1" }}><label className="form-label">Description</label><textarea className="form-input" rows={3} value={newC.description ?? ""} onChange={e => setNewC(p => ({ ...p, description: e.target.value }))} style={{ resize: "vertical" }} /></div>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem" }}>
            <button className="btn-red" onClick={() => {
              if (!newC.name) return;
              const updated = [...campaigns, { ...(newC as Campaign), id: `cam${Date.now()}`, status: "draft" as CampaignStatus, impressions: 0, conversions: 0, revenue: 0 }];
              setCampaigns(updated); persist(updated);
              setShowNew(false);
            }}>Create Campaign</button>
            <button className="btn-secondary" onClick={() => setShowNew(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {filtered.map(c => {
          const st = STATUS_STYLE[c.status];
          const convRate = c.impressions > 0 ? ((c.conversions / c.impressions) * 100).toFixed(1) : "—";
          return (
            <div key={c.id} className="card" style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
                <div style={{ fontSize: "1.75rem" }}>{TYPE_ICONS[c.type]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.375rem", flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 700, color: "var(--navy)", fontSize: "1rem" }}>{c.name}</span>
                    <span style={{ background: st.bg, color: st.color, padding: "0.2rem 0.625rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700 }}>{st.label}</span>
                    {c.couponCode && <code style={{ background: "var(--navy)", color: "white", padding: "2px 8px", borderRadius: "6px", fontSize: "0.8125rem", fontWeight: 700 }}>{c.couponCode}</code>}
                  </div>
                  <div style={{ fontSize: "0.8125rem", color: "var(--gray-500)", marginBottom: "0.5rem" }}>
                    {TARGET_LABELS[c.target]} · {c.startDate}{c.endDate ? ` → ${c.endDate}` : ""}
                  </div>
                  <p style={{ color: "var(--gray-600)", fontSize: "0.875rem" }}>{c.description}</p>
                </div>
                {/* Stats */}
                <div style={{ display: "flex", gap: "1.5rem", flexShrink: 0 }}>
                  {[["Impressions",c.impressions.toLocaleString()],["Conversions",c.conversions.toLocaleString()],["Conv. Rate",`${convRate}%`]].map(([label,val]) => (
                    <div key={label} style={{ textAlign: "center" }}>
                      <div style={{ fontWeight: 800, color: "var(--navy)", fontSize: "1.125rem" }}>{val}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--gray-400)" }}>{label}</div>
                    </div>
                  ))}
                </div>
                {/* Actions */}
                <div style={{ display: "flex", gap: "0.375rem", flexShrink: 0 }}>
                  <button style={{ padding: "0.375rem 0.75rem", background: "var(--gray-100)", border: "none", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", color: "var(--gray-700)", fontFamily: "inherit" }}>Edit</button>
                  {c.status === "draft" && <button onClick={() => { const u = campaigns.map(x => x.id === c.id ? { ...x, status: "active" as CampaignStatus } : x); setCampaigns(u); persist(u); }} style={{ padding: "0.375rem 0.75rem", background: "rgba(22,163,74,0.1)", color: "#16a34a", border: "none", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Launch</button>}
                  {c.status === "active" && <button onClick={() => { const u = campaigns.map(x => x.id === c.id ? { ...x, status: "ended" as CampaignStatus } : x); setCampaigns(u); persist(u); }} style={{ padding: "0.375rem 0.75rem", background: "rgba(245,158,11,0.1)", color: "#d97706", border: "none", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>End</button>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
