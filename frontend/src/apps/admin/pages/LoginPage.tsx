import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../../shared/UseToast";
import Field from "../../../shared/Field";

// ─── Shield icon ───────────────────────────────────────────────────────────────
const ShieldIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <polyline points="9 12 11 14 15 10"/>
  </svg>
);

// ─── AdminLoginPage ─────────────────────────────────────────────────────────────
export default function AdminLoginPage() {
  const navigate      = useNavigate();
  const { showToast } = useToast();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors]     = useState<Record<string, string>>({});
  const [loading, setLoading]   = useState(false);

  const clearError = (field: string) => setErrors((p) => ({ ...p, [field]: "" }));

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

      // Role guard — reject non-admins on the frontend
      // (backend also validates via JWT middleware on /admin/* routes)
      let role = "";
      try {
        const payload = JSON.parse(atob(data.token.split(".")[1]));
        role = payload.role ?? "";
      } catch {
        showToast("Не удалось прочитать токен", "error");
        return;
      }

      if (role !== "admin") {
        showToast("Доступ запрещён: недостаточно прав", "error");
        return;
      }

      localStorage.setItem("token", data.token);
      showToast("Добро пожаловать в панель управления", "success");
      setTimeout(() => navigate("/admin"), 800);
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
        body { background: #0A0705; }
        input::placeholder { color: rgba(196,168,130,0.35) !important; }
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity: 0.6; } 50% { opacity: 1; } }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: "radial-gradient(ellipse at 20% 50%, #1C1005 0%, #0A0705 60%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 16px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Background decorative rings */}
        {[600, 420, 260].map((size, i) => (
          <div key={i} style={{
            position: "absolute",
            width: `${size}px`, height: `${size}px`,
            borderRadius: "50%",
            border: `1px solid rgba(139,111,71,${0.06 - i * 0.015})`,
            pointerEvents: "none",
            left: "50%", top: "50%",
            transform: "translate(-50%, -50%)",
          }} />
        ))}

        {/* Card */}
        <div style={{
          width: "100%", maxWidth: "420px",
          background: "rgba(20,12,7,0.85)",
          border: "1px solid rgba(196,168,130,0.15)",
          borderRadius: "6px",
          padding: "48px 40px",
          backdropFilter: "blur(16px)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
          position: "relative",
          zIndex: 1,
        }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            {/* Shield badge */}
            <div style={{
              width: "64px", height: "64px",
              borderRadius: "50%",
              background: "rgba(139,111,71,0.1)",
              border: "1px solid rgba(196,168,130,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px",
              color: "#C4A882",
              animation: "pulse 3s ease-in-out infinite",
            }}>
              <ShieldIcon />
            </div>

            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: "2px", marginBottom: "8px" }}>
              <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "22px", fontWeight: 700, color: "#FAF7F2" }}>Book</span>
              <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "22px", fontWeight: 400, color: "#8B6F47", fontStyle: "italic" }}>store</span>
              <span style={{
                fontFamily: "system-ui", fontSize: "10px", color: "#5A4535",
                letterSpacing: "2px", textTransform: "uppercase",
                marginLeft: "8px", alignSelf: "center", paddingTop: "2px",
              }}>
                Admin
              </span>
            </div>

            <h1 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "22px", fontWeight: 600, color: "#FAF7F2",
              marginBottom: "8px",
            }}>
              Панель управления
            </h1>
            <p style={{
              fontFamily: "'Crimson Pro', Georgia, serif",
              fontSize: "14px", color: "rgba(196,168,130,0.6)",
              letterSpacing: "0.3px",
            }}>
              Доступ только для авторизованного персонала
            </p>
          </div>

          {/* Separator */}
          <div style={{
            height: "1px",
            background: "linear-gradient(to right, transparent, rgba(196,168,130,0.2), transparent)",
            marginBottom: "32px",
          }} />

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <Field
              label="Email"
              type="email"
              value={email}
              error={errors.email}
              placeholder="admin@bookstore.com"
              autoComplete="email"
              dark
              onChange={(v) => { setEmail(v); clearError("email"); }}
            />
            <Field
              label="Пароль"
              type="password"
              value={password}
              error={errors.password}
              placeholder="Введите пароль"
              autoComplete="current-password"
              dark
              onChange={(v) => { setPassword(v); clearError("password"); }}
            />

            {/* Custom dark button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: "14px",
                background: loading
                  ? "rgba(139,111,71,0.4)"
                  : "linear-gradient(135deg, #8B6F47 0%, #6B5030 100%)",
                color: "#FAF7F2",
                fontFamily: "'Crimson Pro', Georgia, serif",
                fontSize: "16px", letterSpacing: "0.5px",
                border: "1px solid rgba(196,168,130,0.3)",
                borderRadius: "3px",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "opacity 0.2s, transform 0.1s",
                marginTop: "8px",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
              }}
              onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.opacity = "0.88"; }}
              onMouseLeave={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
              onMouseDown={(e)  => { if (!loading) (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.99)"; }}
              onMouseUp={(e)    => { if (!loading) (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
            >
              {loading ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    style={{ animation: "spin 1s linear infinite" }}>
                    <path d="M21 12a9 9 0 11-6.22-8.56"/>
                  </svg>
                  Вход...
                </>
              ) : "Войти в панель"}
            </button>
          </form>

          {/* Footer note */}
          <p style={{
            fontFamily: "'Crimson Pro', Georgia, serif",
            fontSize: "12px", color: "rgba(139,111,71,0.45)",
            textAlign: "center", marginTop: "28px", lineHeight: 1.5,
          }}>
            Это защищённый раздел. Все действия<br />
            фиксируются и контролируются.
          </p>
        </div>

        {/* Link back to store */}
        <a
          href="/"
          style={{
            position: "absolute", bottom: "24px",
            fontFamily: "'Crimson Pro', Georgia, serif",
            fontSize: "13px", color: "rgba(139,111,71,0.5)",
            textDecoration: "none", letterSpacing: "0.3px",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#8B6F47")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(139,111,71,0.5)")}
        >
          ← Вернуться в магазин
        </a>
      </div>
    </>
  );
}