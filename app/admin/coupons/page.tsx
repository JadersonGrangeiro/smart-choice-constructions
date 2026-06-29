"use client";
import { useState } from "react";

interface Coupon {
  id: string; code: string; type: "percent" | "fixed"; value: number;
  description: string; maxUses: number | null; uses: number;
  validFrom: string; validUntil: string | null;
  active: boolean; firstMonthOnly: boolean;
}

const MOCK_COUPONS: Coupon[] = [
  { id: "c1", code: "LAUNCH50",    type: "percent", value: 50, description: "Launch promotion — 50% off first month",      maxUses: 100, uses: 47,  validFrom: "Jun 1, 2025",  validUntil: "Aug 31, 2025", active: true,  firstMonthOnly: true },
  { id: "c2", code: "FREEMONTH",   type: "percent", value: 100, description: "First month free — partner promotion",       maxUses: 25,  uses: 18,  validFrom: "Jun 1, 2025",  validUntil: "Jul 31, 2025", active: true,  firstMonthOnly: true },
  { id: "c3", code: "PARTNER10",   type: "percent", value: 10,  description: "10% off — ongoing partner referral discount", maxUses: null, uses: 134, validFrom: "Jan 1, 2025",  validUntil: null,            active: true,  firstMonthOnly: false },
  { id: "c4", code: "SUMMER25",    type: "percent", value: 25,  description: "Summer promo — 25% off first month",         maxUses: 50,  uses: 50,  validFrom: "May 1, 2025",  validUntil: "May 31, 2025", active: false, firstMonthOnly: true },
  { id: "c5", code: "FLAT10",      type: "fixed",   value: 10,  description: "$10 off first month",                        maxUses: 200, uses: 89,  validFrom: "Apr 1, 2025",  validUntil: null,            active: false, firstMonthOnly: true },
];

export default function CouponsAdminPage() {
  const [coupons, setCoupons] = useState(MOCK_COUPONS);
  const [showNew, setShowNew] = useState(false);
  const [newCode, setNewCode] = useState({ code: "", type: "percent" as "percent"|"fixed", value: 0, maxUses: "", firstMonthOnly: true, validUntil: "", description: "" });

  const toggle = (id: string) => setCoupons(prev => prev.map(c => c.id === id ? { ...c, active: !c.active } : c));

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.625rem", fontWeight: 800, color: "var(--navy)", marginBottom: "0.25rem" }}>Discount Coupons</h1>
          <p style={{ color: "var(--gray-500)", fontSize: "0.875rem" }}>
            {coupons.filter(c => c.active).length} active · {coupons.reduce((s, c) => s + c.uses, 0)} total uses
          </p>
        </div>
        <button className="btn-red" onClick={() => setShowNew(true)} style={{ padding: "0.75rem 1.5rem" }}>
          + Create Coupon
        </button>
      </div>

      {showNew && (
        <div className="card" style={{ padding: "1.75rem", marginBottom: "1.5rem", border: "2px solid var(--navy)" }}>
          <h3 style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "1.25rem" }}>New Coupon</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
            <div>
              <label className="form-label">Code *</label>
              <input className="form-input" placeholder="SUMMER50" value={newCode.code}
                onChange={e => setNewCode(p => ({ ...p, code: e.target.value.toUpperCase() }))} style={{ fontFamily: "monospace", fontWeight: 700 }} />
            </div>
            <div>
              <label className="form-label">Discount Type</label>
              <select className="form-select" value={newCode.type} onChange={e => setNewCode(p => ({ ...p, type: e.target.value as "percent"|"fixed" }))}>
                <option value="percent">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
              </select>
            </div>
            <div>
              <label className="form-label">Value *</label>
              <input className="form-input" type="number" min="0" max={newCode.type === "percent" ? 100 : 1000}
                placeholder={newCode.type === "percent" ? "50" : "10.00"}
                value={newCode.value || ""} onChange={e => setNewCode(p => ({ ...p, value: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="form-label">Max Uses</label>
              <input className="form-input" type="number" placeholder="Leave blank for unlimited"
                value={newCode.maxUses} onChange={e => setNewCode(p => ({ ...p, maxUses: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">Valid Until</label>
              <input className="form-input" type="date" value={newCode.validUntil} onChange={e => setNewCode(p => ({ ...p, validUntil: e.target.value }))} />
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: "0.5rem" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                <input type="checkbox" checked={newCode.firstMonthOnly} onChange={e => setNewCode(p => ({ ...p, firstMonthOnly: e.target.checked }))} style={{ accentColor: "var(--navy)" }} />
                <span style={{ fontSize: "0.9rem", color: "var(--gray-700)" }}>First month only</span>
              </label>
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <label className="form-label">Description</label>
              <input className="form-input" placeholder="Internal note about this coupon" value={newCode.description} onChange={e => setNewCode(p => ({ ...p, description: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem" }}>
            <button className="btn-red" onClick={() => {
              if (!newCode.code || !newCode.value) return;
              setCoupons(prev => [...prev, { id: `c${Date.now()}`, ...newCode, maxUses: newCode.maxUses ? Number(newCode.maxUses) : null, validFrom: new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}), validUntil: newCode.validUntil || null, uses: 0, active: true }]);
              setShowNew(false);
            }}>Save Coupon</button>
            <button className="btn-secondary" onClick={() => setShowNew(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="card" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--gray-50)", borderBottom: "1px solid var(--gray-150)" }}>
              {["Code","Discount","Description","Uses","Valid Until","Applies To","Status","Actions"].map(h => (
                <th key={h} style={{ padding: "0.875rem 1.25rem", textAlign: "left", fontSize: "0.8125rem", fontWeight: 700, color: "var(--gray-500)", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {coupons.map((c, i) => (
              <tr key={c.id} style={{ borderBottom: i < coupons.length - 1 ? "1px solid var(--gray-50)" : "none" }}>
                <td style={{ padding: "1rem 1.25rem" }}>
                  <code style={{ background: "var(--navy)", color: "white", padding: "3px 10px", borderRadius: "6px", fontSize: "0.875rem", fontWeight: 700 }}>{c.code}</code>
                </td>
                <td style={{ padding: "1rem 1.25rem", fontWeight: 800, fontSize: "1.0625rem", color: "var(--red)" }}>
                  {c.type === "percent" ? `${c.value}%` : `$${c.value.toFixed(2)}`}
                </td>
                <td style={{ padding: "1rem 1.25rem", fontSize: "0.875rem", color: "var(--gray-600)", maxWidth: "200px" }}>{c.description}</td>
                <td style={{ padding: "1rem 1.25rem", fontSize: "0.875rem", color: "var(--gray-600)" }}>
                  {c.uses}{c.maxUses ? ` / ${c.maxUses}` : ""}
                  {c.maxUses && (
                    <div style={{ height: "4px", background: "var(--gray-100)", borderRadius: "2px", marginTop: "4px", overflow: "hidden" }}>
                      <div style={{ height: "100%", background: c.uses >= c.maxUses ? "var(--red)" : "var(--navy)", width: `${(c.uses / c.maxUses) * 100}%` }} />
                    </div>
                  )}
                </td>
                <td style={{ padding: "1rem 1.25rem", fontSize: "0.875rem", color: c.validUntil ? "var(--gray-600)" : "var(--gray-400)" }}>
                  {c.validUntil ?? "No expiry"}
                </td>
                <td style={{ padding: "1rem 1.25rem", fontSize: "0.8125rem", color: "var(--gray-500)" }}>
                  {c.firstMonthOnly ? "First month" : "All billing"}
                </td>
                <td style={{ padding: "1rem 1.25rem" }}>
                  <button onClick={() => toggle(c.id)} style={{
                    padding: "0.25rem 0.75rem", borderRadius: "999px", border: "none", cursor: "pointer",
                    fontFamily: "inherit", fontSize: "0.75rem", fontWeight: 700,
                    background: c.active ? "rgba(22,163,74,0.1)" : "var(--gray-100)",
                    color: c.active ? "#16a34a" : "var(--gray-400)",
                  }}>
                    {c.active ? "Active" : "Inactive"}
                  </button>
                </td>
                <td style={{ padding: "1rem 1.25rem" }}>
                  <button style={{ padding: "0.375rem 0.75rem", background: "var(--gray-100)", border: "none", borderRadius: "var(--radius-xs)", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", color: "var(--gray-700)", fontFamily: "inherit" }}>
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
