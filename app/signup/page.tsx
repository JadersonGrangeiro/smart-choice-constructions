"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { validate } from "@/lib/validation";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", zip: "" });
  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = async () => {
    const errs: Partial<typeof form> = {};
    errs.firstName = validate.required(form.firstName, "First name") ?? undefined;
    errs.lastName  = validate.required(form.lastName, "Last name") ?? undefined;
    errs.email     = validate.email(form.email) ?? undefined;
    errs.password  = validate.password(form.password) ?? undefined;
    errs.zip       = validate.zip(form.zip) ?? undefined;
    const clean = Object.fromEntries(Object.entries(errs).filter(([, v]) => v)) as Partial<typeof form>;
    if (Object.keys(clean).length > 0) { setErrors(clean); return; }
    setErrors({});
    setLoading(true);
    setServerError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          role:      "customer",
          full_name: `${form.firstName} ${form.lastName}`,
          zip_code:  form.zip,
        },
        emailRedirectTo: `${window.location.origin}/api/auth/callback?next=/account`,
      },
    });

    if (error) {
      setServerError(error.message.includes("already registered")
        ? "An account with this email already exists."
        : error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div style={{ paddingTop: "76px", minHeight: "100vh", background: "var(--gray-50)", display: "flex", alignItems: "center" }}>
        <div className="container" style={{ maxWidth: "460px", padding: "3rem 1.5rem", textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📧</div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--navy)", marginBottom: "0.75rem" }}>Check your email</h1>
          <p style={{ color: "var(--gray-500)", lineHeight: 1.7 }}>
            We sent a confirmation link to <strong>{form.email}</strong>. Click the link to activate your account.
          </p>
          <p style={{ color: "var(--gray-400)", fontSize: "0.875rem", marginTop: "1rem" }}>
            Didn't receive it? Check your spam folder or{" "}
            <button onClick={handleSubmit} style={{ background: "none", border: "none", color: "var(--navy)", cursor: "pointer", fontWeight: 600, padding: 0, fontFamily: "inherit" }}>
              resend
            </button>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: "76px", minHeight: "100vh", background: "var(--gray-50)", display: "flex", alignItems: "center" }}>
      <div className="container" style={{ maxWidth: "460px", padding: "3rem 1.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🏠</div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--navy)", marginBottom: "0.5rem" }}>Create a Homeowner Account</h1>
          <p style={{ color: "var(--gray-500)" }}>Free forever. No credit card required.</p>
        </div>

        <div className="card" style={{ padding: "2rem" }}>
          {serverError && (
            <div style={{ background: "rgba(199,25,26,0.08)", border: "1px solid rgba(199,25,26,0.2)", borderRadius: "var(--radius-sm)", padding: "0.75rem 1rem", marginBottom: "1.25rem", fontSize: "0.875rem", color: "var(--red)" }}>
              {serverError}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "1.125rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label className="form-label">First Name *</label>
                <input placeholder="John" value={form.firstName} onChange={set("firstName")} className={`form-input${errors.firstName ? " error" : ""}`} />
                {errors.firstName && <p style={{ color: "var(--red)", fontSize: "0.8125rem", marginTop: "0.25rem" }}>{errors.firstName}</p>}
              </div>
              <div>
                <label className="form-label">Last Name *</label>
                <input placeholder="Smith" value={form.lastName} onChange={set("lastName")} className={`form-input${errors.lastName ? " error" : ""}`} />
                {errors.lastName && <p style={{ color: "var(--red)", fontSize: "0.8125rem", marginTop: "0.25rem" }}>{errors.lastName}</p>}
              </div>
            </div>

            <div>
              <label className="form-label">Email Address *</label>
              <input type="email" placeholder="john@example.com" value={form.email} onChange={set("email")} className={`form-input${errors.email ? " error" : ""}`} />
              {errors.email && <p style={{ color: "var(--red)", fontSize: "0.8125rem", marginTop: "0.25rem" }}>{errors.email}</p>}
            </div>

            <div>
              <label className="form-label">Password *</label>
              <input type="password" placeholder="Minimum 8 characters" value={form.password} onChange={set("password")} className={`form-input${errors.password ? " error" : ""}`} />
              {errors.password && <p style={{ color: "var(--red)", fontSize: "0.8125rem", marginTop: "0.25rem" }}>{errors.password}</p>}
            </div>

            <div>
              <label className="form-label">ZIP Code *</label>
              <input placeholder="48864" maxLength={5} value={form.zip} onChange={set("zip")} className={`form-input${errors.zip ? " error" : ""}`} />
              {errors.zip && <p style={{ color: "var(--red)", fontSize: "0.8125rem", marginTop: "0.25rem" }}>{errors.zip}</p>}
            </div>

            <button
              className="btn-primary"
              style={{ padding: "1rem", opacity: loading ? 0.7 : 1 }}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Creating account…" : "Create Free Account"}
            </button>
          </div>

          <p style={{ fontSize: "0.8125rem", color: "var(--gray-400)", textAlign: "center", marginTop: "1rem" }}>
            By signing up you agree to our{" "}
            <Link href="/terms" style={{ color: "var(--navy)" }}>Terms</Link> and{" "}
            <Link href="/privacy" style={{ color: "var(--navy)" }}>Privacy Policy</Link>.
          </p>
          <div style={{ textAlign: "center", marginTop: "1.25rem", fontSize: "0.9375rem", color: "var(--gray-500)" }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "var(--navy)", fontWeight: 700, textDecoration: "none" }}>Sign In</Link>
          </div>
          <div style={{ textAlign: "center", marginTop: "0.75rem", fontSize: "0.875rem", color: "var(--gray-400)" }}>
            Are you a contractor?{" "}
            <Link href="/join" style={{ color: "var(--navy)", textDecoration: "none", fontWeight: 600 }}>Join here →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
