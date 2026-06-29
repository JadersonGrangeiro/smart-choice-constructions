"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Supplier {
  id: string; company_name: string; category: string; city: string; state_code: string;
  phone: string | null; email: string; website: string | null; description: string | null;
  status: string; rating: number; total_reviews: number; logo_url: string | null;
  years_in_business: number | null; verified: boolean | null;
}

export default function SupplierDashboardPage() {
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ description: "", website: "", phone: "" });

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = "/login"; return; }

    const { data } = await supabase
      .from("suppliers")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (data) {
      setSupplier(data as Supplier);
      setForm({ description: data.description ?? "", website: data.website ?? "", phone: data.phone ?? "" });
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleSave() {
    if (!supplier) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from("suppliers").update({
      description: form.description,
      website: form.website || null,
      phone: form.phone || null,
    }).eq("id", supplier.id);
    setSupplier(s => s ? { ...s, ...form } : s);
    setSaved(true);
    setEditMode(false);
    setSaving(false);
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading) {
    return (
      <div style={{ paddingTop: "76px", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "var(--gray-400)", fontSize: "1rem" }}>Loading your dashboard...</div>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div style={{ paddingTop: "76px", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", maxWidth: "400px", padding: "2rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏢</div>
          <h2 style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "0.75rem" }}>No Supplier Profile Found</h2>
          <p style={{ color: "var(--gray-500)", lineHeight: 1.75, marginBottom: "1.5rem" }}>Your account doesn't have an associated supplier profile yet. Please contact our team.</p>
          <a href="mailto:hello@smartchoiceconstructions.com" className="btn-primary">Contact Support</a>
        </div>
      </div>
    );
  }

  const statusColor = supplier.status === "active" ? "#16a34a" : supplier.status === "pending" ? "#d97706" : "var(--red)";
  const statusBg = supplier.status === "active" ? "rgba(22,163,74,0.1)" : supplier.status === "pending" ? "rgba(245,158,11,0.1)" : "rgba(199,25,26,0.08)";

  return (
    <div style={{ paddingTop: "76px", minHeight: "100vh", background: "var(--gray-50)" }}>
      {/* Header */}
      <div style={{ background: "var(--navy)", padding: "2.5rem 0" }}>
        <div className="container">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
              <div style={{ width: "56px", height: "56px", background: "rgba(255,255,255,0.1)", borderRadius: "var(--radius)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.75rem" }}>🏢</div>
              <div>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "white", marginBottom: "0.25rem" }}>{supplier.company_name}</h1>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span style={{ background: statusBg, color: statusColor, padding: "0.2rem 0.625rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700 }}>
                    {supplier.status.charAt(0).toUpperCase() + supplier.status.slice(1)}
                  </span>
                  <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.875rem" }}>{supplier.category} · {supplier.city}, {supplier.state_code}</span>
                </div>
              </div>
            </div>
            <Link href={`/suppliers/profile/${supplier.id}`} target="_blank"
              style={{ padding: "0.75rem 1.5rem", background: "rgba(255,255,255,0.1)", color: "white", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "var(--radius)", textDecoration: "none", fontWeight: 700, fontSize: "0.875rem" }}>
              View Public Profile →
            </Link>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: "2rem 1.5rem" }}>
        {saved && (
          <div style={{ background: "rgba(22,163,74,0.08)", border: "1px solid rgba(22,163,74,0.2)", borderRadius: "var(--radius)", padding: "0.875rem 1.25rem", marginBottom: "1.5rem", color: "#166534", fontWeight: 600, fontSize: "0.9375rem" }}>
            ✓ Profile updated successfully.
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem", alignItems: "start" }}>
          {/* Profile Info */}
          <div className="card" style={{ padding: "2rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.75rem" }}>
              <h2 style={{ fontWeight: 700, fontSize: "1.125rem", color: "var(--navy)" }}>Profile Information</h2>
              {!editMode ? (
                <button onClick={() => setEditMode(true)} className="btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}>Edit Profile</button>
              ) : (
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button onClick={() => setEditMode(false)} className="btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}>Cancel</button>
                  <button onClick={handleSave} disabled={saving} className="btn-red" style={{ padding: "0.5rem 1rem", fontSize: "0.875rem", opacity: saving ? 0.7 : 1 }}>
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {/* Read-only fields */}
              {[
                { label: "Company Name", value: supplier.company_name },
                { label: "Category", value: supplier.category },
                { label: "Location", value: `${supplier.city}, ${supplier.state_code}` },
                { label: "Email", value: supplier.email },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.375rem" }}>{label}</div>
                  <div style={{ color: "var(--navy)", fontWeight: 500 }}>{value}</div>
                </div>
              ))}

              {/* Editable fields */}
              <div>
                <label className="form-label">Phone Number</label>
                {editMode
                  ? <input className="form-input" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+1 (555) 000-0000" />
                  : <div style={{ color: "var(--navy)", fontWeight: 500 }}>{supplier.phone ?? <span style={{ color: "var(--gray-400)" }}>Not set</span>}</div>
                }
              </div>
              <div>
                <label className="form-label">Website</label>
                {editMode
                  ? <input className="form-input" value={form.website} onChange={e => setForm(p => ({ ...p, website: e.target.value }))} placeholder="https://yourwebsite.com" />
                  : supplier.website
                    ? <a href={supplier.website} target="_blank" rel="noreferrer" style={{ color: "var(--navy)", fontWeight: 500 }}>{supplier.website}</a>
                    : <span style={{ color: "var(--gray-400)" }}>Not set</span>
                }
              </div>
              <div>
                <label className="form-label">Description</label>
                {editMode
                  ? <textarea className="form-input" rows={4} style={{ resize: "vertical" }} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Describe your business, products, and services..." />
                  : <div style={{ color: "var(--gray-600)", lineHeight: 1.75 }}>{supplier.description ?? <span style={{ color: "var(--gray-400)" }}>No description yet. Click Edit Profile to add one.</span>}</div>
                }
              </div>
            </div>
          </div>

          {/* Stats sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {[
              { label: "Rating", value: supplier.rating > 0 ? `${supplier.rating.toFixed(1)} / 5.0` : "No reviews yet", icon: "⭐" },
              { label: "Total Reviews", value: supplier.total_reviews, icon: "💬" },
              { label: "Verification", value: supplier.verified ? "Verified" : "Pending verification", icon: supplier.verified ? "✅" : "⏳" },
            ].map(stat => (
              <div key={stat.label} className="card" style={{ padding: "1.25rem" }}>
                <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{stat.icon}</div>
                <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--navy)", marginBottom: "0.25rem" }}>{stat.value}</div>
                <div style={{ fontSize: "0.8125rem", color: "var(--gray-500)" }}>{stat.label}</div>
              </div>
            ))}

            {supplier.status === "pending" && (
              <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "var(--radius)", padding: "1.25rem" }}>
                <div style={{ fontWeight: 700, color: "#92400e", marginBottom: "0.5rem" }}>Profile Under Review</div>
                <p style={{ fontSize: "0.875rem", color: "#92400e", lineHeight: 1.65 }}>
                  Your supplier profile is being reviewed by our team. You'll receive an email once approved (usually within 24 hours).
                </p>
              </div>
            )}

            <div className="card" style={{ padding: "1.25rem" }}>
              <div style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "0.75rem", fontSize: "0.9375rem" }}>Quick Links</div>
              {[
                { label: "View Public Profile", href: `/suppliers/profile/${supplier.id}` },
                { label: "Browse Contractors", href: "/find-contractors" },
                { label: "Contact Support", href: "mailto:hello@smartchoiceconstructions.com" },
              ].map(link => (
                <a key={link.href} href={link.href} style={{ display: "block", padding: "0.5rem 0", color: "var(--navy)", textDecoration: "none", fontWeight: 500, fontSize: "0.875rem", borderBottom: "1px solid var(--gray-100)" }}>
                  {link.label} →
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
