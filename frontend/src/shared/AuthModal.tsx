import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "./useAuthStore";
import { useToast } from "./UseToast";

// ─── Icons ────────────────────────────────────────────────────────────────────
const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const EyeIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOffIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

// ─── Sub-components ───────────────────────────────────────────────────────────
function ModalField({
  label, type = "text", value, error, placeholder, autoComplete, onChange,
}: {
  label: string; type?: string; value: string; error?: string;
  placeholder?: string; autoComplete?: string; onChange: (v: string) => void;
}) {
  const [showPass, setShowPass] = useState(false);
  const [focused, setFocused] = useState(false);
  const isPass = type === "password";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      <label style={{
        fontFamily: "'Crimson Pro', Georgia, serif",
        fontSize: "12px", fontWeight: 600, letterSpacing: "0.8px",
        textTransform: "uppercase", color: "#7A6A5A",
      }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          type={isPass ? (showPass ? "text" : "password") : type}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: "100%",
            padding: isPass ? "11px 40px 11px 14px" : "11px 14px",
            fontFamily: "'Crimson Pro', Georgia, serif",
            fontSize: "15px",
            color: "#1C1410",
            background: "#FDFAF6",
            border: `1.5px solid ${error ? "#C0392B" : focused ? "#8B6F47" : "#DDD5C8"}`,
            borderRadius: "3px",
            outline: "none",
            transition: "border-color 0.2s",
            boxSizing: "border-box",
          }}
        />
        {isPass && (
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            style={{
              position: "absolute", right: "10px", top: "50%",
              transform: "translateY(-50%)", background: "none", border: "none",
              cursor: "pointer", color: "#8B6F47", display: "flex", padding: "2px",
            }}
          >
            {showPass ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}
      </div>
      {error && (
        <p style={{ fontFamily: "'Crimson Pro', Georgia, serif", fontSize: "12px", color: "#E57373", margin: 0 }}>
          {error}
        </p>
      )}
    </div>
  );
}

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const s =
    password.length >= 12 && /[A-Z]/.test(password) && /[0-9]/.test(password) ? 3 :
    password.length >= 8 ? 2 : password.length >= 6 ? 1 : 0;
  const colors = ["", "#E57373", "#E67E22", "#66BB6A"];
  const labels = ["", "Слабый", "Хороший", "Надёжный"];
  return (
    <div style={{ display: "flex", gap: "4px", alignItems: "center", marginTop: "4px" }}>
      {[1, 2, 3].map((i) => (
        <div key={i} style={{
          flex: 1, height: "2px", borderRadius: "2px",
          background: i <= s ? colors[s] : "#E8E0D5",
          transition: "background 0.3s",
        }} />
      ))}
      {s > 0 && (
        <span style={{ fontFamily: "'Crimson Pro', serif", fontSize: "11px", color: colors[s], flexShrink: 0 }}>
          {labels[s]}
        </span>
      )}
    </div>
  );
}

// ─── Login Form ───────────────────────────────────────────────────────────────
function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!email.trim()) e.email = "Введите email";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Некорректный email";
    if (!password) e.password = "Введите пароль";
    else if (password.length < 6) e.password = "Минимум 6 символов";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || "Ошибка входа", "error"); return; }
      useAuthStore.getState().setToken(data.token as string);
      showToast("Добро пожаловать!", "success");
      onSuccess();
    } catch {
      showToast("Не удалось подключиться к серверу", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
      <ModalField label="Email" type="email" value={email} error={errors.email}
        placeholder="example@mail.com" autoComplete="email"
        onChange={(v) => { setEmail(v); setErrors((p) => ({ ...p, email: "" })); }} />
      <ModalField label="Пароль" type="password" value={password} error={errors.password}
        placeholder="Введите пароль" autoComplete="current-password"
        onChange={(v) => { setPassword(v); setErrors((p) => ({ ...p, password: "" })); }} />
      <button
        type="submit" disabled={loading}
        style={{
          width: "100%", padding: "13px",
          background: loading ? "#8B6F47" : "#1C1410",
          color: "#FAF7F2",
          fontFamily: "'Crimson Pro', Georgia, serif",
          fontSize: "16px", letterSpacing: "0.5px",
          border: "none", borderRadius: "3px",
          cursor: loading ? "not-allowed" : "pointer",
          marginTop: "4px",
          display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
          transition: "background 0.2s",
        }}
        onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = "#3D2B1F"; }}
        onMouseLeave={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = loading ? "#8B6F47" : "#1C1410"; }}
      >
        {loading ? (
          <>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              style={{ animation: "spin 1s linear infinite" }}>
              <path d="M21 12a9 9 0 11-6.22-8.56"/>
            </svg>
            Вход...
          </>
        ) : "Войти"}
      </button>
    </form>
  );
}

// ─── Register Form ────────────────────────────────────────────────────────────
function RegisterForm({ onSuccess }: { onSuccess: () => void }) {
  const { showToast } = useToast();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!username.trim()) e.username = "Введите имя пользователя";
    else if (username.trim().length < 3) e.username = "Минимум 3 символа";
    else if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) e.username = "Только латиница, цифры и _";
    if (!email.trim()) e.email = "Введите email";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Некорректный email";
    if (!password) e.password = "Введите пароль";
    else if (password.length < 6) e.password = "Минимум 6 символов";
    if (!confirm) e.confirm = "Подтвердите пароль";
    else if (confirm !== password) e.confirm = "Пароли не совпадают";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        let msg = (data.error as string) || "Ошибка регистрации";
        if (msg.includes("email already exists")) msg = "Пользователь с таким email уже существует";
        if (msg.includes("username already exists")) msg = "Это имя пользователя уже занято";
        showToast(msg, "error");
        return;
      }
      useAuthStore.getState().setToken(data.token as string);
      showToast("Аккаунт создан! Добро пожаловать.", "success");
      onSuccess();
    } catch {
      showToast("Не удалось подключиться к серверу", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <ModalField label="Имя пользователя" value={username} error={errors.username}
        placeholder="john_doe" autoComplete="username"
        onChange={(v) => { setUsername(v); setErrors((p) => ({ ...p, username: "" })); }} />
      <ModalField label="Email" type="email" value={email} error={errors.email}
        placeholder="example@mail.com" autoComplete="email"
        onChange={(v) => { setEmail(v); setErrors((p) => ({ ...p, email: "" })); }} />
      <div>
        <ModalField label="Пароль" type="password" value={password} error={errors.password}
          placeholder="Минимум 6 символов" autoComplete="new-password"
          onChange={(v) => { setPassword(v); setErrors((p) => ({ ...p, password: "" })); }} />
        <PasswordStrength password={password} />
      </div>
      <ModalField label="Подтвердите пароль" type="password" value={confirm} error={errors.confirm}
        placeholder="Повторите пароль" autoComplete="new-password"
        onChange={(v) => { setConfirm(v); setErrors((p) => ({ ...p, confirm: "" })); }} />
      <button
        type="submit" disabled={loading}
        style={{
          width: "100%", padding: "13px",
          background: loading ? "#8B6F47" : "#1C1410",
          color: "#FAF7F2",
          fontFamily: "'Crimson Pro', Georgia, serif",
          fontSize: "16px", letterSpacing: "0.5px",
          border: "none", borderRadius: "3px",
          cursor: loading ? "not-allowed" : "pointer",
          marginTop: "4px",
          display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
          transition: "background 0.2s",
        }}
        onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = "#3D2B1F"; }}
        onMouseLeave={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = loading ? "#8B6F47" : "#1C1410"; }}
      >
        {loading ? (
          <>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              style={{ animation: "spin 1s linear infinite" }}>
              <path d="M21 12a9 9 0 11-6.22-8.56"/>
            </svg>
            Регистрация...
          </>
        ) : "Создать аккаунт"}
      </button>
    </form>
  );
}

// ─── AuthModal ────────────────────────────────────────────────────────────────
export default function AuthModal() {
  const { isModalOpen, modalTab, closeModal, switchTab, runPendingAction } = useAuthStore();
  const overlayRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isModalOpen) return;
    // small delay for enter animation
    const raf = requestAnimationFrame(() => setVisible(true));
    document.body.style.overflow = "hidden";
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  // separate effect to reset visible when modal closes
  useEffect(() => {
    if (!isModalOpen) {
      const raf = requestAnimationFrame(() => setVisible(false));
      return () => cancelAnimationFrame(raf);
    }
  }, [isModalOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeModal(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closeModal]);

  if (!isModalOpen) return null;

  const handleSuccess = () => {
    closeModal();
    runPendingAction();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) closeModal();
  };

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: #BDB5AB; }
      `}</style>

      {/* Overlay */}
      <div
        ref={overlayRef}
        onClick={handleOverlayClick}
        style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(28, 20, 16, 0.55)",
          backdropFilter: "blur(6px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "16px",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.25s ease",
        }}
      >
        {/* Card */}
        <div
          style={{
            width: "100%", maxWidth: "440px",
            background: "#FAF7F2",
            borderRadius: "6px",
            boxShadow: "0 32px 80px rgba(0,0,0,0.25), 0 0 0 1px rgba(139,111,71,0.12)",
            overflow: "hidden",
            transform: visible ? "translateY(0) scale(1)" : "translateY(16px) scale(0.97)",
            transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease",
            opacity: visible ? 1 : 0,
          }}
        >
          {/* Header with tabs */}
          <div style={{
            display: "flex",
            borderBottom: "1px solid #E8E0D5",
            position: "relative",
          }}>
            {(["login", "register"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => switchTab(tab)}
                style={{
                  flex: 1,
                  padding: "20px 16px 16px",
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: "15px",
                  fontWeight: modalTab === tab ? 600 : 400,
                  color: modalTab === tab ? "#1C1410" : "#9A8A7A",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  transition: "color 0.2s",
                  position: "relative",
                }}
              >
                {tab === "login" ? "Вход" : "Регистрация"}
                {modalTab === tab && (
                  <div style={{
                    position: "absolute", bottom: 0, left: "20%", right: "20%",
                    height: "2px", background: "#8B6F47",
                    borderRadius: "2px 2px 0 0",
                  }} />
                )}
              </button>
            ))}
            <button
              onClick={closeModal}
              style={{
                position: "absolute", top: "12px", right: "12px",
                background: "none", border: "none", cursor: "pointer",
                color: "#9A8A7A", display: "flex", padding: "6px",
                borderRadius: "6px", transition: "background 0.2s, color 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "#F0E9DF";
                (e.currentTarget as HTMLButtonElement).style.color = "#1C1410";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "none";
                (e.currentTarget as HTMLButtonElement).style.color = "#9A8A7A";
              }}
            >
              <CloseIcon />
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: "28px 32px 32px" }}>
            {/* Brand mark */}
            <div style={{ display: "flex", alignItems: "baseline", gap: "2px", marginBottom: "24px" }}>
              <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "20px", fontWeight: 700, color: "#1C1410" }}>Book</span>
              <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "20px", fontWeight: 400, color: "#8B6F47", fontStyle: "italic" }}>store</span>
            </div>

            {modalTab === "login" ? (
              <>
                <p style={{ fontFamily: "'Crimson Pro', Georgia, serif", fontSize: "15px", color: "#7A6A5A", marginBottom: "24px", lineHeight: 1.5 }}>
                  Войдите, чтобы продолжить
                </p>
                <LoginForm onSuccess={handleSuccess} />
                <p style={{
                  fontFamily: "'Crimson Pro', Georgia, serif",
                  fontSize: "14px", color: "#9A8A7A",
                  textAlign: "center", marginTop: "20px",
                }}>
                  Нет аккаунта?{" "}
                  <button
                    onClick={() => switchTab("register")}
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      fontFamily: "'Crimson Pro', Georgia, serif",
                      fontSize: "14px", color: "#8B6F47",
                      padding: 0, borderBottom: "1px solid #C4A882",
                      transition: "color 0.2s",
                    }}
                  >
                    Зарегистрироваться
                  </button>
                </p>
              </>
            ) : (
              <>
                <p style={{ fontFamily: "'Crimson Pro', Georgia, serif", fontSize: "15px", color: "#7A6A5A", marginBottom: "20px", lineHeight: 1.5 }}>
                  Создайте аккаунт — это займёт минуту
                </p>
                <RegisterForm onSuccess={handleSuccess} />
                <p style={{
                  fontFamily: "'Crimson Pro', Georgia, serif",
                  fontSize: "14px", color: "#9A8A7A",
                  textAlign: "center", marginTop: "20px",
                }}>
                  Уже есть аккаунт?{" "}
                  <button
                    onClick={() => switchTab("login")}
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      fontFamily: "'Crimson Pro', Georgia, serif",
                      fontSize: "14px", color: "#8B6F47",
                      padding: 0, borderBottom: "1px solid #C4A882",
                      transition: "color 0.2s",
                    }}
                  >
                    Войти
                  </button>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}