"use client";
import React from "react";

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string | null;
  hint?: string;
  children: React.ReactNode;
}

export function FormField({ label, required, error, hint, children }: FormFieldProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
      <label style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--gray-700)" }}>
        {label}
        {required && <span style={{ color: "var(--red)", marginLeft: "3px" }}>*</span>}
      </label>
      {children}
      {hint && !error && (
        <p style={{ fontSize: "0.8125rem", color: "var(--gray-400)", margin: 0 }}>{hint}</p>
      )}
      {error && (
        <p role="alert" style={{ fontSize: "0.8125rem", color: "var(--red)", margin: 0, display: "flex", alignItems: "center", gap: "0.375rem" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

// Reusable styled input that shows error state
interface StyledInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}
export function StyledInput({ hasError, ...props }: StyledInputProps) {
  return (
    <input
      {...props}
      className={`form-input${hasError ? " error" : ""}`}
      style={{ ...(props.style || {}) }}
    />
  );
}

interface StyledSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;
  options: { value: string; label: string }[];
  placeholder?: string;
}
export function StyledSelect({ hasError, options, placeholder, ...props }: StyledSelectProps) {
  return (
    <select className={`form-select${hasError ? " error" : ""}`} {...props}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

interface StyledTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}
export function StyledTextarea({ hasError, ...props }: StyledTextareaProps) {
  return (
    <textarea
      {...props}
      className={`form-input${hasError ? " error" : ""}`}
      style={{ resize: "vertical", ...(props.style || {}) }}
    />
  );
}
