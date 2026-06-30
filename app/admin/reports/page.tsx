"use client";
import { useState, useEffect } from "react";

/* ─── Analytics Types ─────────────────────────────────────────────────────── */
interface ReportData {
  summary: { totalContractors:number; activeContractors:number; totalQuotes:number; totalReviews:number };
  revenueMonthly: { month:string; revenue:number }[];
  topCategories: { category:string; contractors:number; leads:number; conversionPct:number }[];
  topStates: { state:string; contractors:number; leads:number; revenue:number }[];
}

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
function Bar({ pct, color = "var(--navy)" }: { pct:number; color?:string }) {
  return (
    <div style={{ flex:1, height:"10px", background:"var(--gray-100)", borderRadius:"999px", overflow:"hidden" }}>
      <div style={{ height:"100%", background:color, borderRadius:"999px", width:`${Math.max(pct,2)}%`, transition:"width 0.5s ease" }} />
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════════════════ */
export default function ReportsAdminPage() {
  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.75rem", flexWrap:"wrap", gap:"1rem" }}>
        <div>
          <h1 style={{ fontSize:"1.625rem", fontWeight:800, color:"var(--navy)", marginBottom:"0.25rem" }}>Reports</h1>
          <p style={{ color:"var(--gray-500)", fontSize:"0.875rem" }}>Platform analytics and metrics — <a href="/admin/crm" style={{ color:"var(--navy)", fontWeight:600 }}>CRM is now its own page →</a></p>
        </div>
      </div>
      <AnalyticsTab />
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

