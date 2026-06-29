"use client";
import { useState, useEffect, useCallback } from "react";

interface User {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  role: string;
  created_at: string;
  quote_count: number;
  homeowners: { city: string | null; state_code: string | null; zip_code: string | null } | null;
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function UsersAdminPage() {
  const [users,   setUsers]   = useState<User[]>([]);
  const [total,   setTotal]   = useState(0);
  const [search,  setSearch]  = useState("");
  const [loading, setLoading] = useState(true);
  const [debounce, setDebounce] = useState("");

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebounce(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const sp = new URLSearchParams({ limit: "100" });
      if (debounce) sp.set("q", debounce);
      const res  = await fetch(`/api/admin/users?${sp}`);
      const json = await res.json();
      setUsers(json.users ?? []);
      setTotal(json.total ?? 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [debounce]);

  useEffect(() => { load(); }, [load]);

  const location = (u: User) => {
    const h = u.homeowners;
    if (!h) return "—";
    const parts = [h.city, h.state_code].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : (h.zip_code ?? "—");
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.625rem", fontWeight: 800, color: "var(--navy)", marginBottom: "0.25rem" }}>Homeowners</h1>
          <p style={{ color: "var(--gray-500)", fontSize: "0.875rem" }}>
            {loading ? "Loading…" : `${total} registered homeowners`}
          </p>
        </div>
      </div>

      <div style={{ position: "relative", marginBottom: "1.25rem" }}>
        <div style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        </div>
        <input
          placeholder="Search by name or email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="form-input"
          style={{ paddingLeft: "2.75rem" }}
        />
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--gray-400)" }}>Loading…</div>
        ) : users.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--gray-400)" }}>No homeowners found.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--gray-50)", borderBottom: "1px solid var(--gray-150)" }}>
                {["Name","Email","Location","Joined","Quotes"].map(h => (
                  <th key={h} style={{ padding: "0.875rem 1.25rem", textAlign: "left", fontSize: "0.8125rem", fontWeight: 700, color: "var(--gray-500)", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u.id} style={{ borderBottom: i < users.length - 1 ? "1px solid var(--gray-50)" : "none" }}>
                  <td style={{ padding: "1rem 1.25rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div style={{ width: "34px", height: "34px", background: "var(--navy)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: "0.875rem", flexShrink: 0 }}>
                        {(u.full_name ?? u.email).charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600, color: "var(--navy)", fontSize: "0.875rem" }}>
                        {u.full_name ?? <span style={{ color: "var(--gray-400)", fontStyle: "italic" }}>No name</span>}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: "1rem 1.25rem", fontSize: "0.875rem", color: "var(--gray-600)" }}>{u.email}</td>
                  <td style={{ padding: "1rem 1.25rem", fontSize: "0.875rem", color: "var(--gray-600)" }}>{location(u)}</td>
                  <td style={{ padding: "1rem 1.25rem", fontSize: "0.875rem", color: "var(--gray-500)" }}>{fmt(u.created_at)}</td>
                  <td style={{ padding: "1rem 1.25rem", fontWeight: 700, fontSize: "0.875rem", color: "var(--navy)", textAlign: "center" }}>
                    {u.quote_count > 0 ? u.quote_count : <span style={{ color: "var(--gray-300)" }}>0</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
