"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface QuoteRequest {
  id: string;
  category: string;
  description: string;
  zip_code: string;
  status: string;
  created_at: string;
}

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  pending:   { bg: "rgba(245,158,11,0.1)",  color: "#d97706", label: "Pending" },
  active:    { bg: "rgba(22,163,74,0.1)",   color: "#16a34a", label: "Active" },
  completed: { bg: "rgba(22,46,94,0.1)",    color: "var(--navy)", label: "Completed" },
  cancelled: { bg: "rgba(100,116,139,0.1)", color: "var(--gray-500)", label: "Cancelled" },
};

export default function HomeownerDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
    });
    // Load quote requests for this user
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { setLoading(false); return; }
      const { data: rows } = await supabase
        .from("quote_requests")
        .select("id,category,description,zip_code,status,created_at")
        .eq("homeowner_id", data.user.id)
        .order("created_at", { ascending: false })
        .limit(10);
      setQuotes(rows ?? []);
      setLoading(false);
    });
  }, []);

  const firstName = user?.user_metadata?.first_name ?? user?.email?.split("@")[0] ?? "there";

  return (
    <div style={{ paddingTop: "76px", minHeight: "100vh", background: "var(--gray-50)" }}>
      <div className="container" style={{ padding: "2.5rem 1.5rem" }}>

        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--navy)", marginBottom: "0.375rem" }}>
            Welcome back, {firstName}
          </h1>
          <p style={{ color: "var(--gray-500)", fontSize: "0.9375rem" }}>
            Manage your project requests and find verified contractors.
          </p>
        </div>

        {/* Quick actions */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: "1rem", marginBottom: "2.5rem" }}>
          {[
            { icon: "🔍", label: "Find Contractors", desc: "Search verified pros near you", href: "/find-contractors", color: "var(--navy)" },
            { icon: "📋", label: "Request a Quote", desc: "Post your project for free", href: "/contact", color: "var(--red)" },
            { icon: "🗺️", label: "Browse by Location", desc: "Contractors in your state", href: "/locations", color: "#047857" },
            { icon: "💬", label: "Messages", desc: "View your conversations", href: "/dashboard/messages", color: "#6366f1" },
          ].map(action => (
            <Link key={action.href} href={action.href}
              style={{ textDecoration: "none", background: "white", borderRadius: "var(--radius-lg)", padding: "1.375rem", border: "1.5px solid var(--gray-150)", display: "flex", flexDirection: "column", gap: "0.625rem", transition: "all 0.2s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = action.color; (e.currentTarget as HTMLAnchorElement).style.boxShadow = "var(--shadow-md)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--gray-150)"; (e.currentTarget as HTMLAnchorElement).style.boxShadow = "none"; }}>
              <span style={{ fontSize: "1.75rem" }}>{action.icon}</span>
              <div>
                <div style={{ fontWeight: 700, color: "var(--navy)", fontSize: "0.9375rem", marginBottom: "0.2rem" }}>{action.label}</div>
                <div style={{ fontSize: "0.8125rem", color: "var(--gray-500)" }}>{action.desc}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quote requests */}
        <div className="card" style={{ padding: "1.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
            <h2 style={{ fontWeight: 700, color: "var(--navy)", fontSize: "1.125rem" }}>Your Quote Requests</h2>
            <Link href="/contact" className="btn-red" style={{ padding: "0.625rem 1.25rem", fontSize: "0.875rem" }}>
              + New Request
            </Link>
          </div>

          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "3rem", color: "var(--gray-400)" }}>
              <div style={{ width: "28px", height: "28px", border: "3px solid var(--gray-200)", borderTopColor: "var(--navy)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          ) : quotes.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📋</div>
              <div style={{ fontWeight: 600, color: "var(--navy)", marginBottom: "0.5rem" }}>No quote requests yet</div>
              <p style={{ color: "var(--gray-500)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
                Post your first project and get matched with verified local contractors.
              </p>
              <Link href="/contact" className="btn-red" style={{ padding: "0.75rem 1.5rem" }}>Request a Quote</Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {quotes.map(q => {
                const st = STATUS_STYLE[q.status] ?? STATUS_STYLE.pending;
                return (
                  <div key={q.id} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem 1.25rem", background: "var(--gray-50)", borderRadius: "var(--radius)", border: "1px solid var(--gray-100)", flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: "200px" }}>
                      <div style={{ fontWeight: 600, color: "var(--navy)", fontSize: "0.9375rem", marginBottom: "0.2rem" }}>{q.category}</div>
                      <div style={{ fontSize: "0.8125rem", color: "var(--gray-500)" }}>{q.description?.slice(0, 80)}{q.description?.length > 80 ? "…" : ""}</div>
                    </div>
                    <div style={{ fontSize: "0.8125rem", color: "var(--gray-400)" }}>ZIP {q.zip_code}</div>
                    <div style={{ padding: "0.3rem 0.75rem", borderRadius: "999px", background: st.bg, color: st.color, fontSize: "0.8125rem", fontWeight: 600 }}>{st.label}</div>
                    <div style={{ fontSize: "0.8125rem", color: "var(--gray-400)" }}>{new Date(q.created_at).toLocaleDateString()}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Account actions */}
        <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link href="/account" style={{ fontSize: "0.875rem", color: "var(--gray-500)", textDecoration: "none", padding: "0.5rem 1rem", border: "1px solid var(--gray-200)", borderRadius: "var(--radius)", background: "white" }}>
            Account Settings
          </Link>
          <form action="/api/auth/signout" method="post">
            <button type="submit" style={{ fontSize: "0.875rem", color: "var(--gray-500)", background: "white", border: "1px solid var(--gray-200)", borderRadius: "var(--radius)", padding: "0.5rem 1rem", cursor: "pointer", fontFamily: "inherit" }}>
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
