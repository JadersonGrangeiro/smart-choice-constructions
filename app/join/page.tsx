"use client";
import { useState, useCallback } from "react";
import Link from "next/link";
import { US_STATES, CATEGORIES, COMPANY } from "@/lib/data";
import { useI18n } from "@/lib/i18n/context";
import { validate } from "@/lib/validation";
import { FormField, StyledInput, StyledSelect, StyledTextarea } from "@/components/FormField";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Step1Data { firstName: string; lastName: string; email: string; phone: string; password: string; confirm: string; }
interface Step2Data { company: string; category: string; state: string; city: string; years: string; license: string; insurance: string; }
interface Step3Data { description: string; website: string; facebook: string; instagram: string; linkedin: string; }
interface Step4Data { monday: boolean; tuesday: boolean; wednesday: boolean; thursday: boolean; friday: boolean; saturday: boolean; sunday: boolean; openTime: string; closeTime: string; emergency: boolean; }
interface Step5Data { serviceRadius: string; additionalStates: string[]; additionalCities: string; }
// Step6Data removed — payment handled by Stripe Checkout redirect

const TOTAL_STEPS = 6;

const STEP_LABELS = ["Account","Business","Profile","Schedule","Coverage","Payment"];
const STEP_ICONS  = ["👤","🏢","📝","🕐","📍","💳"];

function ProgressBar({ step }: { step: number }) {
  return (
    <div style={{ width: "100%" }}>
      {/* Step indicators */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem", position: "relative" }}>
        {/* Connector line */}
        <div style={{ position: "absolute", top: "20px", left: "20px", right: "20px", height: "2px", background: "rgba(255,255,255,0.15)", zIndex: 0 }} />
        <div style={{ position: "absolute", top: "20px", left: "20px", height: "2px", background: "var(--red)", zIndex: 1, transition: "width 0.4s ease", width: `calc(${Math.max(0,(step-1)/(TOTAL_STEPS-1)*100)}% * (100% - 40px) / 100%)` }} />

        {STEP_LABELS.map((label, i) => {
          const s = i + 1;
          const done    = s < step;
          const current = s === step;
          return (
            <div key={s} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.375rem", position: "relative", zIndex: 2 }}>
              <div style={{
                width: "40px", height: "40px", borderRadius: "50%",
                background: done ? "var(--red)" : current ? "white" : "rgba(255,255,255,0.15)",
                color: done ? "white" : current ? "var(--navy)" : "rgba(255,255,255,0.5)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 700, fontSize: done ? "1rem" : "0.875rem",
                border: current ? "3px solid var(--red)" : "2px solid transparent",
                transition: "all 0.3s",
              }}>
                {done ? "✓" : STEP_ICONS[i]}
              </div>
              <span style={{ fontSize: "0.7rem", color: done || current ? "white" : "rgba(255,255,255,0.4)", fontWeight: current ? 700 : 400, letterSpacing: "0.02em" }}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
      {/* Progress bar */}
      <div style={{ height: "3px", background: "rgba(255,255,255,0.1)", borderRadius: "999px", overflow: "hidden" }}>
        <div style={{ height: "100%", background: "var(--red)", borderRadius: "999px", width: `${((step-1)/(TOTAL_STEPS-1))*100}%`, transition: "width 0.4s ease" }} />
      </div>
    </div>
  );
}

// ─── Step 1: Account ──────────────────────────────────────────────────────────
function Step1({ onNext }: { onNext: (d: Step1Data) => void }) {
  const [d, setD] = useState<Step1Data>({ firstName: "", lastName: "", email: "", phone: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<Partial<Step1Data>>({});

  const set = (k: keyof Step1Data) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setD(prev => ({ ...prev, [k]: e.target.value }));

  const submit = () => {
    const errs: Partial<Step1Data> = {};
    errs.firstName = validate.required(d.firstName, "First name") ?? undefined;
    errs.lastName  = validate.required(d.lastName, "Last name") ?? undefined;
    errs.email     = validate.email(d.email) ?? undefined;
    errs.phone     = validate.phone(d.phone) ?? undefined;
    errs.password  = validate.password(d.password) ?? undefined;
    errs.confirm   = validate.passwordConfirm(d.confirm, d.password) ?? undefined;
    const clean = Object.fromEntries(Object.entries(errs).filter(([,v]) => v)) as Partial<Step1Data>;
    if (Object.keys(clean).length > 0) { setErrors(clean); return; }
    onNext(d);
  };

  return (
    <div className="card" style={{ padding: "2.5rem" }}>
      <h2 style={{ fontSize: "1.375rem", fontWeight: 700, color: "var(--navy)", marginBottom: "0.5rem" }}>Create Your Account</h2>
      <p style={{ color: "var(--gray-500)", marginBottom: "2rem", fontSize: "0.9375rem" }}>You'll use this to log in and manage your profile.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <FormField label="First Name" required error={errors.firstName}>
            <StyledInput placeholder="John" value={d.firstName} onChange={set("firstName")} hasError={!!errors.firstName} />
          </FormField>
          <FormField label="Last Name" required error={errors.lastName}>
            <StyledInput placeholder="Smith" value={d.lastName} onChange={set("lastName")} hasError={!!errors.lastName} />
          </FormField>
        </div>
        <FormField label="Email Address" required error={errors.email} hint="This is your login email. It will not be shown publicly.">
          <StyledInput type="email" placeholder="john@yourcompany.com" value={d.email} onChange={set("email")} hasError={!!errors.email} />
        </FormField>
        <FormField label="Phone Number" required error={errors.phone} hint="Used for account security. Not shared publicly.">
          <StyledInput type="tel" placeholder="+1 (555) 000-0000" value={d.phone} onChange={set("phone")} hasError={!!errors.phone} />
        </FormField>
        <FormField label="Password" required error={errors.password} hint="At least 8 characters, one uppercase letter, one number.">
          <StyledInput type="password" placeholder="Create a strong password" value={d.password} onChange={set("password")} hasError={!!errors.password} />
        </FormField>
        <FormField label="Confirm Password" required error={errors.confirm}>
          <StyledInput type="password" placeholder="Repeat your password" value={d.confirm} onChange={set("confirm")} hasError={!!errors.confirm} />
        </FormField>
        <p style={{ fontSize: "0.8125rem", color: "var(--gray-400)" }}>
          By continuing you agree to our{" "}
          <Link href="/terms" style={{ color: "var(--navy)" }}>Terms of Service</Link> and{" "}
          <Link href="/privacy" style={{ color: "var(--navy)" }}>Privacy Policy</Link>.
        </p>
      </div>
      <button className="btn-red" onClick={submit} style={{ width: "100%", marginTop: "2rem", padding: "1rem", fontSize: "1rem" }}>
        Continue →
      </button>
    </div>
  );
}

// ─── Step 2: Business Info ────────────────────────────────────────────────────
function Step2({ onNext, onBack }: { onNext: (d: Step2Data) => void; onBack: () => void }) {
  const [d, setD] = useState<Step2Data>({ company: "", category: "", state: "", city: "", years: "", license: "", insurance: "" });
  const [errors, setErrors] = useState<Partial<Step2Data>>({});

  const set = (k: keyof Step2Data) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setD(prev => ({ ...prev, [k]: e.target.value }));

  const submit = () => {
    const errs: Partial<Step2Data> = {};
    errs.company  = validate.required(d.company, "Company name") ?? undefined;
    errs.category = validate.required(d.category, "Service category") ?? undefined;
    errs.state    = validate.required(d.state, "State") ?? undefined;
    errs.city     = validate.required(d.city, "City") ?? undefined;
    errs.years    = validate.required(d.years, "Years in business") ?? undefined;
    const clean = Object.fromEntries(Object.entries(errs).filter(([,v]) => v)) as Partial<Step2Data>;
    if (Object.keys(clean).length > 0) { setErrors(clean); return; }
    onNext(d);
  };

  const stateOptions = US_STATES.map(s => ({ value: s.code, label: s.name }));
  const catOptions   = CATEGORIES.map(c => ({ value: c.id, label: `${c.icon}  ${c.name}` }));

  return (
    <div className="card" style={{ padding: "2.5rem" }}>
      <h2 style={{ fontSize: "1.375rem", fontWeight: 700, color: "var(--navy)", marginBottom: "0.5rem" }}>Business Information</h2>
      <p style={{ color: "var(--gray-500)", marginBottom: "2rem", fontSize: "0.9375rem" }}>Tell us about your company so we can verify and list you correctly.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <FormField label="Company Name" required error={errors.company}>
          <StyledInput placeholder="Smith Roofing LLC" value={d.company} onChange={set("company")} hasError={!!errors.company} />
        </FormField>
        <FormField label="Primary Service Category" required error={errors.category} hint="You can add more service types after registration.">
          <StyledSelect options={catOptions} placeholder="Select your main service" value={d.category} onChange={set("category")} hasError={!!errors.category} />
        </FormField>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <FormField label="State" required error={errors.state}>
            <StyledSelect options={stateOptions} placeholder="Select state" value={d.state} onChange={set("state")} hasError={!!errors.state} />
          </FormField>
          <FormField label="City" required error={errors.city}>
            <StyledInput placeholder="Your city" value={d.city} onChange={set("city")} hasError={!!errors.city} />
          </FormField>
        </div>
        <FormField label="Years in Business" required error={errors.years}>
          <StyledInput type="number" placeholder="e.g. 10" min="0" max="100" value={d.years} onChange={set("years")} hasError={!!errors.years} />
        </FormField>
        <FormField label="State License Number" error={errors.license} hint="Optional but recommended. Verified licenses increase trust.">
          <StyledInput placeholder="e.g. LIC-123456" value={d.license} onChange={set("license")} hasError={!!errors.license} />
        </FormField>
        <FormField label="Insurance Policy Number" error={errors.insurance} hint="Optional. Contractors with verified insurance rank higher in search results.">
          <StyledInput placeholder="e.g. POL-789012" value={d.insurance} onChange={set("insurance")} hasError={!!errors.insurance} />
        </FormField>
      </div>
      <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
        <button className="btn-secondary" onClick={onBack} style={{ flex: 1 }}>← Back</button>
        <button className="btn-red" onClick={submit} style={{ flex: 2, padding: "1rem" }}>Continue →</button>
      </div>
    </div>
  );
}

// ─── Step 3: Profile & Gallery ────────────────────────────────────────────────
function Step3({ onNext, onBack }: { onNext: (d: Step3Data) => void; onBack: () => void }) {
  const [d, setD] = useState<Step3Data>({ description: "", website: "", facebook: "", instagram: "", linkedin: "" });
  const [errors, setErrors] = useState<Partial<Step3Data>>({});
  const [photoCount, setPhotoCount] = useState(0);

  const set = (k: keyof Step3Data) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setD(prev => ({ ...prev, [k]: e.target.value }));

  const submit = () => {
    const errs: Partial<Step3Data> = {};
    errs.description = validate.minLength(d.description, 80, "Business description") ?? undefined;
    if (d.website) errs.website = validate.url(d.website) ?? undefined;
    const clean = Object.fromEntries(Object.entries(errs).filter(([,v]) => v)) as Partial<Step3Data>;
    if (Object.keys(clean).length > 0) { setErrors(clean); return; }
    onNext(d);
  };

  const charCount = d.description.length;

  return (
    <div className="card" style={{ padding: "2.5rem" }}>
      <h2 style={{ fontSize: "1.375rem", fontWeight: 700, color: "var(--navy)", marginBottom: "0.5rem" }}>Your Public Profile</h2>
      <p style={{ color: "var(--gray-500)", marginBottom: "2rem", fontSize: "0.9375rem" }}>This is what homeowners see when they find your listing. Make it count.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

        {/* Description */}
        <FormField label="Business Description" required error={errors.description} hint="Minimum 80 characters. Describe your experience, specialties, and what sets you apart.">
          <StyledTextarea
            placeholder="We are a family-owned roofing company with 15 years of experience serving the Austin metro area. We specialize in residential roof replacements, repairs, and storm damage restoration. All work is backed by a 5-year workmanship warranty..."
            value={d.description} onChange={set("description")} rows={5} hasError={!!errors.description}
          />
          <div style={{ fontSize: "0.8125rem", color: charCount >= 80 ? "#16a34a" : "var(--gray-400)", textAlign: "right", marginTop: "0.25rem" }}>
            {charCount}/80 minimum {charCount >= 80 && "✓"}
          </div>
        </FormField>

        {/* Photo gallery upload */}
        <div>
          <label style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--gray-700)", display: "block", marginBottom: "0.5rem" }}>
            Portfolio Photos <span style={{ color: "var(--gray-400)", fontWeight: 400 }}>(optional — up to 50 photos)</span>
          </label>
          <div
            style={{ border: "2px dashed var(--gray-300)", borderRadius: "var(--radius)", padding: "2.5rem", textAlign: "center", cursor: "pointer", background: "var(--gray-50)", transition: "all 0.2s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--navy)"; (e.currentTarget as HTMLDivElement).style.background = "white"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--gray-300)"; (e.currentTarget as HTMLDivElement).style.background = "var(--gray-50)"; }}
            onClick={() => setPhotoCount(c => Math.min(c + 3, 50))}
          >
            <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>📸</div>
            <div style={{ fontWeight: 600, color: "var(--navy)", marginBottom: "0.375rem" }}>
              {photoCount === 0 ? "Click to upload photos" : `${photoCount} photo${photoCount > 1 ? "s" : ""} selected`}
            </div>
            <div style={{ fontSize: "0.8125rem", color: "var(--gray-400)" }}>JPEG or PNG · Max 10MB each · Up to 50 photos</div>
          </div>
          <p style={{ fontSize: "0.8125rem", color: "var(--gray-400)", marginTop: "0.5rem" }}>
            Profiles with 5+ photos get 3× more contact requests. Add photos of completed projects, your team, and your equipment.
          </p>
        </div>

        {/* Website */}
        <FormField label="Website" error={errors.website} hint="Optional. Include https:// or just your domain.">
          <StyledInput type="url" placeholder="https://www.yourcompany.com" value={d.website} onChange={set("website")} hasError={!!errors.website} />
        </FormField>

        {/* Social */}
        <div>
          <label style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--gray-700)", display: "block", marginBottom: "0.75rem" }}>
            Social Media <span style={{ color: "var(--gray-400)", fontWeight: 400 }}>(optional)</span>
          </label>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {[
              { key: "facebook",  icon: "f",  label: "Facebook",  placeholder: "facebook.com/yourpage" },
              { key: "instagram", icon: "ig", label: "Instagram", placeholder: "instagram.com/yourhandle" },
              { key: "linkedin",  icon: "in", label: "LinkedIn",  placeholder: "linkedin.com/company/yourco" },
            ].map(({ key, icon, label, placeholder }) => (
              <div key={key} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ width: "34px", height: "34px", background: "var(--navy)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "0.75rem", fontWeight: 700, flexShrink: 0 }}>{icon}</div>
                <StyledInput
                  placeholder={placeholder}
                  value={(d as any)[key]}
                  onChange={set(key as keyof Step3Data)}
                  style={{ flex: 1 }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
        <button className="btn-secondary" onClick={onBack} style={{ flex: 1 }}>← Back</button>
        <button className="btn-red" onClick={submit} style={{ flex: 2, padding: "1rem" }}>Continue →</button>
      </div>
    </div>
  );
}

// ─── Step 4: Schedule ─────────────────────────────────────────────────────────
function Step4({ onNext, onBack }: { onNext: (d: Step4Data) => void; onBack: () => void }) {
  const [d, setD] = useState<Step4Data>({
    monday: true, tuesday: true, wednesday: true, thursday: true, friday: true,
    saturday: false, sunday: false, openTime: "08:00", closeTime: "17:00", emergency: false,
  });

  const days = [
    { key: "monday",    label: "Monday" },
    { key: "tuesday",   label: "Tuesday" },
    { key: "wednesday", label: "Wednesday" },
    { key: "thursday",  label: "Thursday" },
    { key: "friday",    label: "Friday" },
    { key: "saturday",  label: "Saturday" },
    { key: "sunday",    label: "Sunday" },
  ] as const;

  const toggleDay = (key: keyof Pick<Step4Data, "monday"|"tuesday"|"wednesday"|"thursday"|"friday"|"saturday"|"sunday">) =>
    setD(prev => ({ ...prev, [key]: !prev[key] }));

  const workingDays = days.filter(d2 => (d as any)[d2.key]);

  return (
    <div className="card" style={{ padding: "2.5rem" }}>
      <h2 style={{ fontSize: "1.375rem", fontWeight: 700, color: "var(--navy)", marginBottom: "0.5rem" }}>Availability & Schedule</h2>
      <p style={{ color: "var(--gray-500)", marginBottom: "2rem", fontSize: "0.9375rem" }}>Let homeowners know when you're available to take on new projects.</p>

      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        {/* Working days */}
        <div>
          <label style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--gray-700)", display: "block", marginBottom: "0.875rem" }}>
            Working Days
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.625rem" }}>
            {days.map(({ key, label }) => {
              const active = (d as any)[key];
              return (
                <button key={key} onClick={() => toggleDay(key)} aria-pressed={(d as any)[key]} aria-label={`Toggle ${label}`} style={{
                  padding: "0.5rem 1.125rem", borderRadius: "999px", border: "2px solid",
                  borderColor: active ? "var(--navy)" : "var(--gray-200)",
                  background: active ? "var(--navy)" : "white",
                  color: active ? "white" : "var(--gray-500)",
                  fontWeight: 600, fontSize: "0.875rem", cursor: "pointer", fontFamily: "inherit",
                  transition: "all 0.2s",
                }}>
                  {label.slice(0, 3)}
                </button>
              );
            })}
          </div>
          <p style={{ fontSize: "0.8125rem", color: "var(--gray-400)", marginTop: "0.625rem" }}>
            {workingDays.length === 0 ? "Select at least one working day." : `Working ${workingDays.length} day${workingDays.length > 1 ? "s" : ""} per week.`}
          </p>
        </div>

        {/* Hours */}
        <div>
          <label style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--gray-700)", display: "block", marginBottom: "0.875rem" }}>
            Business Hours
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span style={{ fontSize: "0.875rem", color: "var(--gray-600)" }}>From</span>
              <select className="form-select" value={d.openTime} onChange={e => setD(prev => ({ ...prev, openTime: e.target.value }))} style={{ width: "auto" }}>
                {["06:00","07:00","08:00","09:00","10:00"].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span style={{ fontSize: "0.875rem", color: "var(--gray-600)" }}>To</span>
              <select className="form-select" value={d.closeTime} onChange={e => setD(prev => ({ ...prev, closeTime: e.target.value }))} style={{ width: "auto" }}>
                {["15:00","16:00","17:00","18:00","19:00","20:00"].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Emergency */}
        <div style={{ background: "rgba(199,25,26,0.05)", border: "1.5px solid rgba(199,25,26,0.15)", borderRadius: "var(--radius)", padding: "1.25rem" }}>
          <label style={{ display: "flex", alignItems: "flex-start", gap: "0.875rem", cursor: "pointer" }}>
            <input type="checkbox" checked={d.emergency} onChange={e => setD(prev => ({ ...prev, emergency: e.target.checked }))}
              style={{ width: "18px", height: "18px", marginTop: "2px", accentColor: "var(--red)", flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "0.25rem" }}>
                Offer Emergency / Same-Day Service
              </div>
              <div style={{ fontSize: "0.875rem", color: "var(--gray-500)", lineHeight: 1.65 }}>
                Contractors who offer emergency service appear in a dedicated emergency search filter and receive priority placement for urgent requests.
              </div>
            </div>
          </label>
        </div>

        {/* Preview */}
        <div style={{ background: "var(--gray-50)", borderRadius: "var(--radius)", padding: "1.25rem" }}>
          <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.625rem" }}>
            Preview on your profile
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
            <span style={{ fontSize: "0.875rem", color: "var(--gray-700)" }}>
              {workingDays.map(wd => wd.label.slice(0,3)).join(", ")} · {d.openTime}–{d.closeTime}
            </span>
            {d.emergency && <span className="badge badge-red" style={{ fontSize: "0.75rem" }}>⚡ Emergency Service</span>}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
        <button className="btn-secondary" onClick={onBack} style={{ flex: 1 }}>← Back</button>
        <button className="btn-red" onClick={() => onNext(d)} style={{ flex: 2, padding: "1rem" }}>Continue →</button>
      </div>
    </div>
  );
}

// ─── Step 5: Service Area ─────────────────────────────────────────────────────
function Step5({ onNext, onBack }: { onNext: (d: Step5Data) => void; onBack: () => void }) {
  const [d, setD] = useState<Step5Data>({ serviceRadius: "25", additionalStates: [], additionalCities: "" });
  const [errors, setErrors] = useState<Partial<Step5Data>>({});

  const radiusOptions = [
    { value: "10", label: "10 miles — Hyperlocal" },
    { value: "25", label: "25 miles — Standard" },
    { value: "50", label: "50 miles — Regional" },
    { value: "100", label: "100 miles — Wide area" },
    { value: "statewide", label: "Statewide" },
    { value: "nationwide", label: "Nationwide" },
  ];

  const toggleState = (code: string) =>
    setD(prev => ({
      ...prev,
      additionalStates: prev.additionalStates.includes(code)
        ? prev.additionalStates.filter(s => s !== code)
        : [...prev.additionalStates, code],
    }));

  return (
    <div className="card" style={{ padding: "2.5rem" }}>
      <h2 style={{ fontSize: "1.375rem", fontWeight: 700, color: "var(--navy)", marginBottom: "0.5rem" }}>Service Area & Coverage</h2>
      <p style={{ color: "var(--gray-500)", marginBottom: "2rem", fontSize: "0.9375rem" }}>
        Define exactly where you're willing to travel for jobs. You'll only receive leads within this area.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        {/* Radius */}
        <div>
          <label style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--gray-700)", display: "block", marginBottom: "0.875rem" }}>
            Service Radius from Your City *
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.625rem" }}>
            {radiusOptions.map(opt => {
              const active = d.serviceRadius === opt.value;
              return (
                <button key={opt.value} onClick={() => setD(prev => ({ ...prev, serviceRadius: opt.value }))} aria-pressed={d.serviceRadius === opt.value} aria-label={`Service radius: ${opt.label}`} style={{
                  padding: "0.75rem 1rem", borderRadius: "var(--radius)",
                  border: "2px solid", borderColor: active ? "var(--navy)" : "var(--gray-200)",
                  background: active ? "var(--navy)" : "white",
                  color: active ? "white" : "var(--gray-600)",
                  fontWeight: active ? 700 : 500, fontSize: "0.875rem",
                  cursor: "pointer", fontFamily: "inherit", textAlign: "left", transition: "all 0.2s",
                }}>
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Specific cities */}
        <FormField label="Specific Cities or ZIP Codes" hint="Optional. List any additional cities or ZIP codes you serve, separated by commas.">
          <StyledTextarea
            placeholder="e.g. Round Rock, Cedar Park, Georgetown, 78626, 78628"
            value={d.additionalCities}
            onChange={e => setD(prev => ({ ...prev, additionalCities: e.target.value }))}
            rows={3}
          />
        </FormField>

        {/* Additional states */}
        <div>
          <label style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--gray-700)", display: "block", marginBottom: "0.5rem" }}>
            Additional States <span style={{ color: "var(--gray-400)", fontWeight: 400 }}>(optional — for contractors who serve multiple states)</span>
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem", maxHeight: "180px", overflowY: "auto", padding: "0.75rem", border: "1.5px solid var(--gray-200)", borderRadius: "var(--radius)", background: "var(--gray-50)" }}>
            {US_STATES.map(state => {
              const selected = d.additionalStates.includes(state.code);
              return (
                <button key={state.code} onClick={() => toggleState(state.code)} aria-pressed={d.additionalStates.includes(state.code)} aria-label={`Toggle ${state.code}`} style={{
                  padding: "0.3rem 0.75rem", borderRadius: "999px",
                  border: "1.5px solid", borderColor: selected ? "var(--navy)" : "var(--gray-300)",
                  background: selected ? "var(--navy)" : "white",
                  color: selected ? "white" : "var(--gray-600)",
                  fontWeight: 600, fontSize: "0.75rem", cursor: "pointer", fontFamily: "inherit",
                  transition: "all 0.15s",
                }}>
                  {state.code}
                </button>
              );
            })}
          </div>
          {d.additionalStates.length > 0 && (
            <p style={{ fontSize: "0.8125rem", color: "var(--navy)", marginTop: "0.5rem", fontWeight: 500 }}>
              {d.additionalStates.length} additional state{d.additionalStates.length > 1 ? "s" : ""} selected: {d.additionalStates.join(", ")}
            </p>
          )}
        </div>

        {/* Documents upload */}
        <div style={{ border: "1.5px solid var(--gray-200)", borderRadius: "var(--radius)", padding: "1.5rem", background: "var(--gray-50)" }}>
          <div style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "1rem" }}>
            📎 Upload Verification Documents <span style={{ color: "var(--gray-400)", fontWeight: 400 }}>(optional but recommended)</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            {[
              { label: "Contractor License",   desc: "State-issued contractor license" },
              { label: "Certificate of Insurance", desc: "COI showing liability coverage" },
              { label: "Background Check",     desc: "Recent background check report" },
            ].map(doc => (
              <div key={doc.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.875rem 1rem", background: "white", border: "1px solid var(--gray-200)", borderRadius: "var(--radius-sm)" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--navy)" }}>{doc.label}</div>
                  <div style={{ fontSize: "0.8125rem", color: "var(--gray-400)" }}>{doc.desc}</div>
                </div>
                <button style={{ padding: "0.5rem 1rem", borderRadius: "var(--radius-sm)", background: "var(--navy)", color: "white", border: "none", fontWeight: 600, fontSize: "0.8125rem", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
                  Upload
                </button>
              </div>
            ))}
          </div>
          <p style={{ fontSize: "0.8125rem", color: "var(--gray-400)", marginTop: "0.875rem" }}>
            Verified documents earn a badge on your public profile and are required to appear in verified-only search filters.
          </p>
        </div>
      </div>

      <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
        <button className="btn-secondary" onClick={onBack} style={{ flex: 1 }}>← Back</button>
        <button className="btn-red" onClick={() => onNext(d)} style={{ flex: 2, padding: "1rem" }}>Continue →</button>
      </div>
    </div>
  );
}

// ─── Step 6: Payment via Stripe Checkout ─────────────────────────────────────
interface Step6Props {
  onBack: () => void;
  allData: {
    step1: Step1Data | null;
    step2: Step2Data | null;
    step3Data: Step3Data | null;
    step4Data: Step4Data | null;
    step5Data: Step5Data | null;
  };
}

function Step6({ onBack, allData }: Step6Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleCheckout = async () => {
    const { step1, step2, step3Data, step4Data, step5Data } = allData;
    if (!step1 || !step2) { setError("Missing registration data. Please go back."); return; }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/contractors/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName:        step1.firstName,
          lastName:         step1.lastName,
          email:            step1.email,
          phone:            step1.phone,
          password:         step1.password,
          company:          step2.company,
          category:         step2.category,
          state:            step2.state,
          city:             step2.city,
          years:            step2.years,
          license:          step2.license,
          insurance:        step2.insurance,
          description:      step3Data?.description,
          website:          step3Data?.website,
          facebook:         step3Data?.facebook,
          instagram:        step3Data?.instagram,
          linkedin:         step3Data?.linkedin,
          workingDays:      step4Data ? Object.entries(step4Data).filter(([k, v]) => ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"].includes(k) && v).map(([k]) => k) : [],
          openTime:         step4Data?.openTime,
          closeTime:        step4Data?.closeTime,
          emergency:        step4Data?.emergency,
          serviceRadius:    step5Data?.serviceRadius,
          additionalStates: step5Data?.additionalStates,
          additionalCities: step5Data?.additionalCities,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Registration failed. Please try again.");
        setLoading(false);
        return;
      }

      // Redirect to Stripe Checkout
      window.location.href = data.checkoutUrl;
    } catch {
      setError("Network error. Please check your connection and try again.");
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ padding: "2.5rem" }}>
      <h2 style={{ fontSize: "1.375rem", fontWeight: 700, color: "var(--navy)", marginBottom: "0.5rem" }}>Start Your Subscription</h2>
      <p style={{ color: "var(--gray-500)", marginBottom: "2rem", fontSize: "0.9375rem" }}>
        Your first month is billed at <strong style={{ color: "var(--navy)" }}>${COMPANY.pricing.firstMonth.toFixed(2)}</strong>. Then ${COMPANY.pricing.monthly.toFixed(2)}/month. Cancel anytime.
      </p>

      {error && (
        <div style={{ background: "rgba(199,25,26,0.08)", border: "1px solid rgba(199,25,26,0.2)", borderRadius: "var(--radius-sm)", padding: "0.875rem 1rem", marginBottom: "1.5rem", fontSize: "0.875rem", color: "var(--red)" }}>
          {error}
        </div>
      )}

      {/* Plan summary */}
      <div style={{ background: "linear-gradient(135deg, var(--navy), #2a3d8f)", borderRadius: "var(--radius-lg)", padding: "1.5rem 2rem", marginBottom: "2rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8125rem", marginBottom: "0.25rem" }}>Professional Plan — First Month</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.125rem" }}>
            <span style={{ fontSize: "2.5rem", fontWeight: 800, color: "white", letterSpacing: "-0.04em" }}>${COMPANY.pricing.firstMonth.toFixed(2)}</span>
          </div>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8125rem" }}>then ${COMPANY.pricing.monthly.toFixed(2)}/month · cancel anytime</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
          {["Unlimited leads","Verified badge","Photo gallery","Analytics"].map(f => (
            <div key={f} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8125rem", color: "rgba(255,255,255,0.8)" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="3" strokeLinecap="round"><path d="M5 13l4 4L19 7"/></svg>
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Stripe redirect notice */}
      <div style={{ background: "var(--gray-50)", border: "1.5px solid var(--gray-200)", borderRadius: "var(--radius)", padding: "1.5rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
          <span style={{ fontSize: "1.5rem" }}>🔒</span>
          <div>
            <div style={{ fontWeight: 700, color: "var(--navy)", fontSize: "0.9375rem" }}>Secure payment via Stripe</div>
            <div style={{ fontSize: "0.8125rem", color: "var(--gray-400)" }}>You'll be redirected to Stripe's secure checkout page</div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: "0.375rem" }}>
            {["VISA","MC","AMEX","DISC"].map(brand => (
              <div key={brand} style={{ padding: "2px 6px", background: "white", border: "1px solid var(--gray-200)", borderRadius: "4px", fontSize: "0.6875rem", fontWeight: 700, color: "var(--gray-500)" }}>{brand}</div>
            ))}
          </div>
        </div>
        <ul style={{ margin: 0, paddingLeft: "1.25rem", fontSize: "0.875rem", color: "var(--gray-600)", lineHeight: 1.8 }}>
          <li>Your card details are never stored on our servers</li>
          <li>Payment is processed by Stripe — the same system trusted by Amazon and Google</li>
          <li>Cancel anytime from your dashboard — no fees</li>
        </ul>
      </div>

      <div style={{ display: "flex", gap: "1rem" }}>
        <button className="btn-secondary" onClick={onBack} style={{ flex: 1 }} disabled={loading}>← Back</button>
        <button className="btn-red" onClick={handleCheckout} style={{ flex: 2, padding: "1rem", opacity: loading ? 0.8 : 1 }} disabled={loading}>
          {loading ? (
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}>
                <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeOpacity="0.3"/>
                <path d="M21 12a9 9 0 00-9-9" strokeLinecap="round"/>
              </svg>
              Creating your account…
            </span>
          ) : `Continue to Payment — $${COMPANY.pricing.firstMonth.toFixed(2)}`}
        </button>
      </div>

      <p style={{ fontSize: "0.8125rem", color: "var(--gray-400)", textAlign: "center", marginTop: "1rem" }}>
        By continuing you'll be redirected to Stripe to complete your payment of ${COMPANY.pricing.firstMonth.toFixed(2)} today, then ${COMPANY.pricing.monthly.toFixed(2)}/month until cancelled.
      </p>
    </div>
  );
}

// ─── Success Screen ────────────────────────────────────────────────────────────
function Success({ name }: { name: string }) {
  return (
    <div style={{ textAlign: "center", padding: "3rem 1.5rem" }}>
      <div style={{ width: "80px", height: "80px", background: "rgba(22,163,74,0.1)", border: "2px solid rgba(22,163,74,0.3)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem", fontSize: "2.5rem" }}>
        🎉
      </div>
      <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--navy)", marginBottom: "0.875rem" }}>
        Welcome to Smart Choice, {name}!
      </h2>
      <p style={{ color: "var(--gray-600)", lineHeight: 1.75, fontSize: "1.0625rem", marginBottom: "0.75rem" }}>
        Your subscription is active and your profile is now under review.
      </p>
      <p style={{ color: "var(--gray-500)", lineHeight: 1.75, fontSize: "0.9375rem", maxWidth: "500px", margin: "0 auto 2.5rem" }}>
        Our team typically reviews new profiles within 24 hours. You'll receive an email at the address you provided once your profile goes live. While you wait, you can log in to complete your profile and add more photos.
      </p>
      <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
        <Link href="/login" className="btn-red" style={{ padding: "1rem 2rem" }}>Go to My Dashboard</Link>
        <Link href="/" className="btn-secondary" style={{ padding: "1rem 2rem" }}>Back to Home</Link>
      </div>
      <div style={{ marginTop: "2.5rem", background: "var(--gray-50)", borderRadius: "var(--radius)", padding: "1.5rem", maxWidth: "500px", margin: "2.5rem auto 0", textAlign: "left" }}>
        <div style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "1rem" }}>What happens next?</div>
        {[
          { icon: "📧", text: "You'll receive a confirmation email with your account details." },
          { icon: "🔍", text: "Our team reviews your profile for completeness and credential accuracy." },
          { icon: "✅", text: "Once approved, your profile goes live and you start receiving leads." },
          { icon: "📈", text: "Add more photos and details to maximize your visibility." },
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", gap: "0.875rem", marginBottom: i < 3 ? "0.875rem" : 0 }}>
            <span style={{ fontSize: "1.125rem", flexShrink: 0 }}>{item.icon}</span>
            <span style={{ fontSize: "0.9rem", color: "var(--gray-600)", lineHeight: 1.65 }}>{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Join Page ────────────────────────────────────────────────────────────
export default function JoinPage() {
  const { t } = useI18n();
  const [step, setStep]     = useState(1);
  const [done, setDone]     = useState(false);
  const [firstName, setFN]  = useState("");

  // Collect data from each step
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null);
  const [step2Data, setStep2Data] = useState<Step2Data | null>(null);
  const [step3Data, setStep3Data] = useState<Step3Data | null>(null);
  const [step4Data, setStep4Data] = useState<Step4Data | null>(null);
  const [step5Data, setStep5Data] = useState<Step5Data | null>(null);

  const handleStep1 = (d: Step1Data) => { setStep1Data(d); setFN(d.firstName); setStep(2); window.scrollTo(0,0); };
  const handleStep2 = (d: Step2Data) => { setStep2Data(d); setStep(3); window.scrollTo(0,0); };
  const handleStep3 = (d: Step3Data) => { setStep3Data(d); setStep(4); window.scrollTo(0,0); };
  const handleStep4 = (d: Step4Data) => { setStep4Data(d); setStep(5); window.scrollTo(0,0); };
  const handleStep5 = (d: Step5Data) => { setStep5Data(d); setStep(6); window.scrollTo(0,0); };

  if (done) {
    return (
      <div style={{ paddingTop: "76px", minHeight: "100vh", background: "var(--gray-50)" }}>
        <div className="container" style={{ maxWidth: "680px", padding: "3rem 1.5rem" }}>
          <Success name={firstName} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: "76px", minHeight: "100vh", background: "var(--gray-50)" }}>
      {/* Header */}
      <div style={{ background: "var(--navy)", padding: "3rem 0" }}>
        <div className="container" style={{ maxWidth: "680px" }}>
          <div style={{ marginBottom: "2rem" }}>
            <h1 style={{ color: "white", fontSize: "1.75rem", fontWeight: 800, marginBottom: "0.375rem" }}>
              Join Smart Choice as a Contractor
            </h1>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.9375rem" }}>
              Step {step} of {TOTAL_STEPS} — {STEP_LABELS[step-1]}
            </p>
          </div>
          <ProgressBar step={step} />
        </div>
      </div>

      <div className="container" style={{ maxWidth: "680px", padding: "2rem 1.5rem" }}>
        {/* Benefits bar */}
        <div style={{ background: "white", borderRadius: "var(--radius)", padding: "0.875rem 1.5rem", border: "1px solid var(--gray-100)", marginBottom: "1.5rem", display: "flex", justifyContent: "center", gap: "2rem", flexWrap: "wrap" }}>
          {[
            { icon: "💰", text: `$${COMPANY.pricing.firstMonth.toFixed(2)} first month` },
            { icon: "🚫", text: "No commission" },
            { icon: "🔄", text: "Cancel anytime" },
            { icon: "🛡️", text: "Secure payment" },
          ].map(b => (
            <div key={b.text} style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.875rem", fontWeight: 600, color: "var(--gray-600)" }}>
              <span>{b.icon}</span>{b.text}
            </div>
          ))}
        </div>

        {step === 1 && <Step1 onNext={handleStep1} />}
        {step === 2 && <Step2 onNext={handleStep2} onBack={() => { setStep(1); window.scrollTo(0,0); }} />}
        {step === 3 && <Step3 onNext={handleStep3} onBack={() => { setStep(2); window.scrollTo(0,0); }} />}
        {step === 4 && <Step4 onNext={handleStep4} onBack={() => { setStep(3); window.scrollTo(0,0); }} />}
        {step === 5 && <Step5 onNext={handleStep5} onBack={() => { setStep(4); window.scrollTo(0,0); }} />}
        {step === 6 && (
          <Step6
            onBack={() => { setStep(5); window.scrollTo(0,0); }}
            allData={{ step1: step1Data, step2: step2Data, step3Data, step4Data, step5Data }}
          />
        )}

        <p style={{ textAlign: "center", fontSize: "0.8125rem", color: "var(--gray-400)", marginTop: "1.5rem" }}>
          Already have an account? <Link href="/login" style={{ color: "var(--navy)", fontWeight: 600, textDecoration: "none" }}>Sign in</Link>
        </p>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
