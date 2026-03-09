import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "../../../shared/UseToast";
import Field from "../../../shared/Field";

export default function LoginPage() {
  const navigate        = useNavigate();
  const { showToast }   = useToast();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors]     = useState<Record<string, string>>({});
  const [loading, setLoading]   = useState(false);

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = () => {
    const e: Record<string, string> = {};
    if (!email.trim()) {
      e.email = "Введите email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      e.email = "Некорректный формат email";
    }
    if (!password) {
      e.password = "Введите пароль";
    } else if (password.length < 6) {
      e.password = "Пароль не менее 6 символов";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const clearError = (field: string) => setErrors((p) => ({ ...p, [field]: "" }));

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res  = await fetch("/api/v1/auth/login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || "Ошибка входа", "error");
        return;
      }

      localStorage.setItem("token", data.token);
      showToast("Добро пожаловать!", "success");
      setTimeout(() => navigate("/"), 800);
    } catch {
      showToast("Не удалось подключиться к серверу", "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #FAF7F2; }
        input::placeholder { color: #BDB5AB; }
        @media (max-width: 768px) { .auth-panel { display: none !important; } .auth-form { flex: 1 !important; } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ minHeight: "100vh", display: "flex", background: "#FAF7F2" }}>
        {/* ── Left decorative panel ─────────────────────────────────────────── */}
        <div className="auth-panel" style={{
          flex: "0 0 45%",
          background: "linear-gradient(160deg, #1C1410 0%, #3D2B1F 60%, #5A3E2B 100%)",
          display: "flex", flexDirection: "column", justifyContent: "space-between",
          padding: "56px 64px", position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", bottom: "-120px", right: "-120px",
            width: "500px", height: "500px", borderRadius: "50%",
            border: "1px solid rgba(196,168,130,0.12)", pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", bottom: "60px", right: "-60px",
            width: "300px", height: "300px", borderRadius: "50%",
            border: "1px solid rgba(196,168,130,0.07)", pointerEvents: "none",
          }} />

          {/* Logo */}
          <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "baseline", gap: "2px" }}>
            <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "28px", fontWeight: 700, color: "#FAF7F2" }}>Book</span>
            <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "28px", fontWeight: 400, color: "#C4A882", fontStyle: "italic" }}>store</span>
          </a>

          {/* Quote */}
          <div>
            <p style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "30px", fontWeight: 400, fontStyle: "italic",
              color: "#FAF7F2", lineHeight: 1.45, marginBottom: "24px",
            }}>
              "Книга — это зеркало;<br />
              если в неё смотрит осёл,<br />
              она не может отразить апостола."
            </p>
            <p style={{ fontFamily: "'Crimson Pro', Georgia, serif", fontSize: "15px", color: "#C4A882", letterSpacing: "0.5px" }}>
              — Георг Кристоф Лихтенберг
            </p>
          </div>
        </div>

        {/* ── Right form panel ──────────────────────────────────────────────── */}
        <div className="auth-form" style={{
          flex: "0 0 55%", display: "flex", alignItems: "center",
          justifyContent: "center", padding: "48px 32px",
        }}>
          <div style={{ width: "100%", maxWidth: "420px" }}>
            <div style={{ marginBottom: "48px" }}>
              <h1 style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "36px", fontWeight: 700, color: "#1C1410", marginBottom: "10px",
              }}>
                Вход в аккаунт
              </h1>
              <p style={{ fontFamily: "'Crimson Pro', Georgia, serif", fontSize: "16px", color: "#7A6A5A" }}>
                Нет аккаунта?{" "}
                <Link to="/register" style={{ color: "#8B6F47", textDecoration: "none", borderBottom: "1px solid #C4A882" }}>
                  Зарегистрироваться
                </Link>
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <Field
                label="Email"
                type="email"
                value={email}
                error={errors.email}
                placeholder="example@mail.com"
                autoComplete="email"
                onChange={(v) => { setEmail(v); clearError("email"); }}
              />
              <Field
                label="Пароль"
                type="password"
                value={password}
                error={errors.password}
                placeholder="Введите пароль"
                autoComplete="current-password"
                onChange={(v) => { setPassword(v); clearError("password"); }}
              />

              <SubmitButton loading={loading} label="Войти" loadingLabel="Вход..." />
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Shared submit button ──────────────────────────────────────────────────────
export function SubmitButton({ loading, label, loadingLabel }: { loading: boolean; label: string; loadingLabel: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      style={{
        width: "100%", padding: "15px",
        background: loading ? "#8B6F47" : "#1C1410",
        color: "#FAF7F2",
        fontFamily: "'Crimson Pro', Georgia, serif",
        fontSize: "17px", letterSpacing: "0.5px",
        border: "none", borderRadius: "3px",
        cursor: loading ? "not-allowed" : "pointer",
        transition: "background 0.2s", marginTop: "8px",
        display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
      }}
      onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = "#3D2B1F"; }}
      onMouseLeave={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = loading ? "#8B6F47" : "#1C1410"; }}
    >
      {loading ? (
        <>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            style={{ animation: "spin 1s linear infinite" }}>
            <path d="M21 12a9 9 0 11-6.22-8.56"/>
          </svg>
          {loadingLabel}
        </>
      ) : label}
    </button>
  );
}