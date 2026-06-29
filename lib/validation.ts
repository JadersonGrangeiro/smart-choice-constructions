/**
 * Form validation for Smart Choice Constructions
 * Used in contractor registration, contact forms, quote requests
 */

export type FieldError = string | null;
export type FormErrors<T> = Partial<Record<keyof T, FieldError>>;

export const validate = {
  required: (value: string, label = "This field"): FieldError =>
    !value?.trim() ? `${label} is required.` : null,

  email: (value: string): FieldError => {
    if (!value?.trim()) return "Email address is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Enter a valid email address.";
    return null;
  },

  phone: (value: string): FieldError => {
    if (!value?.trim()) return "Phone number is required.";
    const digits = value.replace(/\D/g, "");
    if (digits.length < 10) return "Enter a valid phone number (at least 10 digits).";
    return null;
  },

  password: (value: string): FieldError => {
    if (!value) return "Password is required.";
    if (value.length < 8) return "Password must be at least 8 characters.";
    if (!/[A-Z]/.test(value)) return "Include at least one uppercase letter.";
    if (!/[0-9]/.test(value)) return "Include at least one number.";
    return null;
  },

  passwordConfirm: (value: string, password: string): FieldError => {
    if (!value) return "Please confirm your password.";
    if (value !== password) return "Passwords do not match.";
    return null;
  },

  zip: (value: string): FieldError => {
    if (!value?.trim()) return "ZIP code is required.";
    if (!/^\d{5}$/.test(value.trim())) return "Enter a valid 5-digit ZIP code.";
    return null;
  },

  url: (value: string): FieldError => {
    if (!value?.trim()) return null; // optional
    try { new URL(value.startsWith("http") ? value : `https://${value}`); return null; }
    catch { return "Enter a valid website URL."; }
  },

  minLength: (value: string, min: number, label = "This field"): FieldError =>
    value?.trim().length < min ? `${label} must be at least ${min} characters.` : null,

  maxLength: (value: string, max: number, label = "This field"): FieldError =>
    value?.trim().length > max ? `${label} must be ${max} characters or fewer.` : null,

  positiveNumber: (value: string, label = "Value"): FieldError => {
    const n = Number(value);
    if (isNaN(n) || n < 0) return `${label} must be a positive number.`;
    return null;
  },

  cardNumber: (value: string): FieldError => {
    const digits = value.replace(/\D/g, "");
    if (digits.length < 13 || digits.length > 19) return "Enter a valid card number.";
    return null;
  },

  cardExpiry: (value: string): FieldError => {
    if (!/^\d{2}\/\d{2}$/.test(value)) return "Enter expiry as MM/YY.";
    const [mm, yy] = value.split("/").map(Number);
    if (mm < 1 || mm > 12) return "Invalid month.";
    const now = new Date();
    const expYear = 2000 + yy;
    if (expYear < now.getFullYear() || (expYear === now.getFullYear() && mm < now.getMonth() + 1))
      return "This card has expired.";
    return null;
  },

  cardCvc: (value: string): FieldError => {
    if (!/^\d{3,4}$/.test(value)) return "Enter a valid CVC (3 or 4 digits).";
    return null;
  },
};

/** Run multiple validators and return the first error */
export function runValidators(...validators: (FieldError | (() => FieldError))[]): FieldError {
  for (const v of validators) {
    const err = typeof v === "function" ? v() : v;
    if (err) return err;
  }
  return null;
}
