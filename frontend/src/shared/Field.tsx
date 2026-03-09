import { useState } from "react";

// ─── Icons ─────────────────────────────────────────────────────────────────────
const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

// ─── Types ─────────────────────────────────────────────────────────────────────
export interface FieldProps {
  label: string;
  type?: string;
  value: string;
  error?: string;
  placeholder?: string;
  hint?: string;
  autoComplete?: string;
  onChange: (v: string) => void;
  /** Override label color for dark backgrounds */
  dark?: boolean;
}

// ─── Field ─────────────────────────────────────────────────────────────────────
export default function Field({
  label, type = "text", value, error, placeholder, hint, autoComplete, onChange, dark = false,
}: FieldProps) {
  const [showPass, setShowPass] = useState(false);
  const [focused, setFocused]   = useState(false);

  const isPassword = type === "password";
  const inputType  = isPassword ? (showPass ? "text" : "password") : type;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={{
        fontFamily: "'Crimson Pro', Georgia, serif",
        fontSize: "13px", fontWeight: 600,
        color: dark ? "#C4A882" : "#5A4A3A",
        letterSpacing: "0.8px", textTransform: "uppercase",
      }}>
        {label}
      </label>

      <div style={{ position: "relative" }}>
        <input
          type={inputType}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: "100%",
            padding: isPassword ? "13px 44px 13px 16px" : "13px 16px",
            fontFamily: "'Crimson Pro', Georgia, serif",
            fontSize: "16px",
            color: dark ? "#FAF7F2" : "#1C1410",
            background: dark ? "rgba(255,255,255,0.06)" : "#FDFAF6",
            border: `1.5px solid ${
              error   ? "#C0392B" :
              focused ? "#8B6F47" :
              dark    ? "rgba(196,168,130,0.3)" : "#DDD5C8"
            }`,
            borderRadius: "3px",
            outline: "none",
            transition: "border-color 0.2s, background 0.2s",
            boxSizing: "border-box",
          }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            style={{
              position: "absolute", right: "12px", top: "50%",
              transform: "translateY(-50%)", background: "none", border: "none",
              cursor: "pointer", color: dark ? "#C4A882" : "#8B6F47",
              display: "flex", alignItems: "center", padding: "4px",
            }}
          >
            {showPass ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}
      </div>

      {error && (
        <p style={{ fontFamily: "'Crimson Pro', Georgia, serif", fontSize: "13px", color: "#E57373", margin: 0 }}>
          {error}
        </p>
      )}
      {!error && hint && (
        <p style={{ fontFamily: "'Crimson Pro', Georgia, serif", fontSize: "13px", color: dark ? "#8B6F47" : "#9A8A7A", margin: 0 }}>
          {hint}
        </p>
      )}
    </div>
  );
}