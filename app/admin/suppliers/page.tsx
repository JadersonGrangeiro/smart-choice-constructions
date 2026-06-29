"use client";
import { useState } from "react";
import Link from "next/link";
import { MOCK_SUPPLIERS, SUPPLIER_CATEGORIES } from "@/lib/supplier-data";

export default function SuppliersAdminPage() {
  const [suppliers, setSuppliers] = useState(MOCK_SUPPLIERS.map(s => ({ ...s, status: "active" as "active"|"pending"|"suspended" })));
  const [tab, setTab] = useState<"active"|"pending"|"suspended">("active");
  const [search, setSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = suppliers.filter(s =>
    s.status === tab &&
    (search === "" || s.name.toLowerCase().includes(search.toLowerCase()) || s.categoryId.includes(search.toLowerCase()))
  );

  const update = (id: string, status: "active"|"suspended") =>
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, status } : s));

  const deleteSupplier = (id: string) => {
    setSuppliers(prev => prev.filter(s => s.id !== id));
    setDeleteConfirm(null);
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.625rem", fontWeight: 800, color: "var(--navy)", marginBottom: "0.25rem" }}>Local Suppliers</h1>
          <p style={{ color: "var(--gray-500)", fontSize: "0.875rem" }}>
            {suppliers.filter(s => s.status === "active").length} active · {suppliers.filter(s => s.status === "pending").length} pending
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button className="btn-secondary" style={{ padding: "0.625rem 1.125rem", fontSize: "0.875rem" }}>Export CSV</button>
          <button className="btn-red" style={{ padding: "0.625rem 1.5rem", fontSize: "0.875rem" }}>+ Add Supplier</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0", marginBottom: "1.5rem", background: "white", borderRadius: "var(--radius)", border: "1px solid var(--gray-150)", overflow: "hidden" }}>
        {([["active","Active"],["pending","Pending"],["suspended","Suspended"]] as const).map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            flex: 1, padding: "0.875rem",
            background: tab === k ? "var(--navy)" : "transparent",
            color: tab === k ? "white" : "var(--gray-600)",
            border: "none", cursor: "pointer", fontFamily: "inherit",
            fontWeight: tab === k ? 700 : 500, fontSize: "0.9rem",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
          }}>
            {l}
            <span style={{ background: tab === k ? "rgba(255,255,255,0.2)" : "var(--gray-100)", color: tab === k ? "white" : "var(--gray-500)", borderRadius: "999px", padding: "0 7px", fontSize: "0.75rem", fontWeight: 800 }}>
              {suppliers.filter(s => s.status === k).length}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: "1.25rem" }}>
        <div style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        </div>
        <input placeholder="Search by name or category…" value={search} onChange={e => setSearch(e.target.value)} className="form-input" style={{ paddingLeft: "2.75rem" }} />
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: "hidden" }}>
        {filtered.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--gray-400)" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🏢</div>
            No {tab} suppliers found
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--gray-50)", borderBottom: "1px solid var(--gray-150)" }}>
                {["Name","Category","Location","Rating","Actions"].map(h => (
                  <th key={h} style={{ padding: "0.875rem 1.25rem", textAlign: "left", fontSize: "0.8125rem", fontWeight: 700, color: "var(--gray-500)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => {
                const cat = SUPPLIER_CATEGORIES.find(c => c.id === s.categoryId);
                return (
                  <tr key={s.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--gray-50)" : "none" }}>
                    <td style={{ padding: "1rem 1.25rem" }}>
                      <div style={{ fontWeight: 700, color: "var(--navy)", fontSize: "0.875rem" }}>{s.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--gray-400)" }}>{s.yearsInBusiness} yrs · {s.verified ? "✓ Verified" : "Unverified"}</div>
                    </td>
                    <td style={{ padding: "1rem 1.25rem" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", fontSize: "0.875rem", color: "var(--gray-600)" }}>
                        <span>{cat?.icon}</span> {cat?.name}
                      </span>
                    </td>
                    <td style={{ padding: "1rem 1.25rem", fontSize: "0.875rem", color: "var(--gray-600)" }}>{s.location}</td>
                    <td style={{ padding: "1rem 1.25rem" }}>
                      <span style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--navy)" }}>⭐ {s.rating}</span>
                      <span style={{ fontSize: "0.75rem", color: "var(--gray-400)", marginLeft: "4px" }}>({s.reviews})</span>
                    </td>
                    <td style={{ padding: "1rem 1.25rem" }}>
                      <div style={{ display: "flex", gap: "0.375rem" }}>
                        <Link href={`/suppliers/profile/${s.id}`} target="_blank" style={{ padding: "0.375rem 0.625rem", background: "var(--gray-100)", border: "none", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", color: "var(--gray-700)", textDecoration: "none" }}>
                          View
                        </Link>
                        <button style={{ padding: "0.375rem 0.625rem", background: "var(--gray-100)", border: "none", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", color: "var(--gray-700)", fontFamily: "inherit" }}>
                          Edit
                        </button>
                        {s.status === "active" ? (
                          <button onClick={() => update(s.id, "suspended")} style={{ padding: "0.375rem 0.625rem", background: "rgba(245,158,11,0.1)", color: "#d97706", border: "none", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                            Suspend
                          </button>
                        ) : (
                          <button onClick={() => update(s.id, "active")} style={{ padding: "0.375rem 0.625rem", background: "rgba(22,163,74,0.1)", color: "#16a34a", border: "none", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                            Restore
                          </button>
                        )}
                        <button onClick={() => setDeleteConfirm(s.id)} style={{ padding: "0.375rem 0.625rem", background: "rgba(199,25,26,0.06)", color: "var(--red)", border: "1px solid rgba(199,25,26,0.15)", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete confirm */}
      {deleteConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
          <div style={{ background: "white", borderRadius: "var(--radius-xl)", padding: "2rem", maxWidth: "400px", width: "100%" }}>
            <h3 style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "0.75rem" }}>Delete supplier?</h3>
            <p style={{ color: "var(--gray-500)", marginBottom: "1.5rem", lineHeight: 1.65 }}>
              This will permanently remove <strong>{suppliers.find(s => s.id === deleteConfirm)?.name}</strong> from the platform.
            </p>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button className="btn-secondary" onClick={() => setDeleteConfirm(null)} style={{ flex: 1 }}>Cancel</button>
              <button onClick={() => deleteSupplier(deleteConfirm)} style={{ flex: 2, padding: "0.875rem", background: "var(--red)", color: "white", border: "none", borderRadius: "var(--radius)", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
