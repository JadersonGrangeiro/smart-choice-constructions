"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword]  = useState("");
  const [confirm, setConfirm]    = useState("");
  const [loading, setLoading]    = useState(false);
  const [error, setError]        = useState("");
  const [done, setDone]          = useState(false);

  const handleSubmit = async () => {
    if (!password || password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setDone(true);
    setTimeout(() => router.push("/login"), 3000);
  };

  return (
    <div style={{ paddingTop: "76px", minHeight: "100vh", background: "var(--gray-50)", display: "flex", alignItems: "center" }}>
      <div className="container" style={{ maxWidth: "440px", padding: "3rem 1.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🔒</div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--navy)", marginBottom: "0.5rem" }}>
            {done ? "Password updated!" : "Set new password"}
          </h1>
        </div>

        {done ? (
          <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
            <div style={{ background: "rgba(22,163,74,0.08)", border: "1px solid rgba(22,163,74,0.2)", borderRadius: "var(--radius)", padding: "1.25rem", color: "#15803d", marginBottom: "1rem" }}>
              Your password has been updated. Redirecting to login…
            </div>
          </div>
        ) : (
          <div className="card" style={{ padding: "2rem" }}>
            {error && (
              <div style={{ background: "rgba(199,25,26,0.08)", border: "1px solid rgba(199,25,26,0.2)", borderRadius: "var(--radius-sm)", padding: "0.75rem 1rem", marginBottom: "1.25rem", fontSize: "0.875rem", color: "var(--red)" }}>
                {error}
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label className="form-label">New Password</label>
                <input type="password" placeholder="At least 8 characters" value={password} onChange={e => setPassword(e.target.value)} className="form-input" />
              </div>
              <div>
                <label className="form-label">Confirm Password</label>
                <input type="password" placeholder="Repeat your password" value={confirm} onChange={e => setConfirm(e.target.value)} className="form-input" onKeyDown={e => e.key === "Enter" && handleSubmit()} />
              </div>
              <button className="btn-red" style={{ padding: "1rem", opacity: loading ? 0.7 : 1 }} onClick={handleSubmit} disabled={loading}>
                {loading ? "Updating…" : "Update Password"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
