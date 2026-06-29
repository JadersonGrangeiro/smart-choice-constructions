"use client";
import { useState } from "react";

const MOCK_USERS = [
  { id: "u1", name: "Jennifer Morrison", email: "jmorrison@email.com", zip: "78701", city: "Austin, TX", joined: "Jun 15, 2025", quotes: 4, contacts: 2, status: "active" as const },
  { id: "u2", name: "Carlos Reyes",      email: "c.reyes@gmail.com",  zip: "75201", city: "Dallas, TX",  joined: "Jun 18, 2025", quotes: 2, contacts: 1, status: "active" as const },
  { id: "u3", name: "Sarah Kim",          email: "sarah.k@email.com",  zip: "60601", city: "Chicago, IL", joined: "Jun 20, 2025", quotes: 7, contacts: 3, status: "active" as const },
  { id: "u4", name: "David Liu",          email: "dliu@outlook.com",   zip: "33101", city: "Miami, FL",   joined: "Jun 22, 2025", quotes: 1, contacts: 0, status: "active" as const },
  { id: "u5", name: "Maria Santos",       email: "msantos@email.com",  zip: "85001", city: "Phoenix, AZ", joined: "Jun 10, 2025", quotes: 9, contacts: 5, status: "active" as const },
  { id: "u6", name: "Robert Chen",        email: "rchen@email.com",    zip: "98101", city: "Seattle, WA", joined: "May 28, 2025", quotes: 0, contacts: 0, status: "suspended" as const },
];

export default function UsersAdminPage() {
  const [users, setUsers] = useState(MOCK_USERS);
  const [search, setSearch] = useState("");

  const filtered = users.filter(u =>
    search === "" ||
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.625rem", fontWeight: 800, color: "var(--navy)", marginBottom: "0.25rem" }}>Homeowners</h1>
          <p style={{ color: "var(--gray-500)", fontSize: "0.875rem" }}>{users.length} registered · {users.filter(u => u.status === "active").length} active</p>
        </div>
        <button className="btn-secondary" style={{ padding: "0.625rem 1.25rem", fontSize: "0.875rem" }}>Export CSV</button>
      </div>

      <div style={{ position: "relative", marginBottom: "1.25rem" }}>
        <div style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        </div>
        <input placeholder="Search by name, email, or city..." value={search} onChange={e => setSearch(e.target.value)} className="form-input" style={{ paddingLeft: "2.75rem" }} />
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--gray-50)", borderBottom: "1px solid var(--gray-150)" }}>
              {["Name","Email","Location","Joined","Quotes","Contacts","Status","Actions"].map(h => (
                <th key={h} style={{ padding: "0.875rem 1.25rem", textAlign: "left", fontSize: "0.8125rem", fontWeight: 700, color: "var(--gray-500)", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((u, i) => (
              <tr key={u.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--gray-50)" : "none" }}>
                <td style={{ padding: "1rem 1.25rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{ width: "34px", height: "34px", background: "var(--navy)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: "0.875rem", flexShrink: 0 }}>
                      {u.name.charAt(0)}
                    </div>
                    <span style={{ fontWeight: 600, color: "var(--navy)", fontSize: "0.875rem" }}>{u.name}</span>
                  </div>
                </td>
                <td style={{ padding: "1rem 1.25rem", fontSize: "0.875rem", color: "var(--gray-600)" }}>{u.email}</td>
                <td style={{ padding: "1rem 1.25rem", fontSize: "0.875rem", color: "var(--gray-600)" }}>{u.city}</td>
                <td style={{ padding: "1rem 1.25rem", fontSize: "0.875rem", color: "var(--gray-500)" }}>{u.joined}</td>
                <td style={{ padding: "1rem 1.25rem", fontWeight: 700, fontSize: "0.875rem", color: "var(--navy)", textAlign: "center" }}>{u.quotes}</td>
                <td style={{ padding: "1rem 1.25rem", fontWeight: 700, fontSize: "0.875rem", color: "var(--navy)", textAlign: "center" }}>{u.contacts}</td>
                <td style={{ padding: "1rem 1.25rem" }}>
                  <span style={{
                    background: u.status === "active" ? "rgba(22,163,74,0.1)" : "rgba(200,16,46,0.08)",
                    color: u.status === "active" ? "#16a34a" : "var(--red)",
                    padding: "0.2rem 0.625rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700,
                  }}>
                    {u.status.charAt(0).toUpperCase() + u.status.slice(1)}
                  </span>
                </td>
                <td style={{ padding: "1rem 1.25rem" }}>
                  <div style={{ display: "flex", gap: "0.375rem" }}>
                    <button style={{ padding: "0.375rem 0.625rem", background: "var(--gray-100)", border: "none", borderRadius: "var(--radius-xs)", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", color: "var(--gray-700)", fontFamily: "inherit" }}>
                      View
                    </button>
                    <button
                      onClick={() => setUsers(prev => prev.map(x => x.id === u.id ? { ...x, status: x.status === "active" ? "suspended" : "active" } : x))}
                      style={{ padding: "0.375rem 0.625rem", background: u.status === "active" ? "rgba(200,16,46,0.06)" : "rgba(22,163,74,0.1)", color: u.status === "active" ? "var(--red)" : "#16a34a", border: "none", borderRadius: "var(--radius-xs)", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                      {u.status === "active" ? "Suspend" : "Restore"}
                    </button>
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
