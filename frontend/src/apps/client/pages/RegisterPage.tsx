import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "../../../shared/UseToast";
import Field from "../../../shared/Field";
import { SubmitButton } from "./LoginPage";

// ─── Password strength indicator ───────────────────────────────────────────────
function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const strength =
    password.length >= 12 && /[A-Z]/.test(password) && /[0-9]/.test(password) ? 3 :
    password.length >= 8  ? 2 :
    password.length >= 6  ? 1 : 0;

  const labels = ["", "Слабый", "Хороший", "Надёжный"];
  const colors = ["", "#E57373", "#E67E22", "#66BB6A"];

  return (
    <div style={{ display: "flex", gap: "6px", alignItems: "center", marginTop: "6px" }}>
      {[1, 2, 3].map((i) => (
        <div key={i} style={{
          flex: 1, height: "3px", borderRadius: "2px",
          background: i <= strength ? colors[strength] : "#E8E0D5",
          transition: "background 0.3s",
        }} />
      ))}
      {strength > 0 && (
        <span style={{
          fontFamily: "'Crimson Pro', Georgia, serif",
          fontSize: "12px", color: colors[strength], letterSpacing: "0.3px", flexShrink: 0,
        }}>
          {labels[strength]}
        </span>
      )}
    </div>
  );
}

// ─── RegisterPage ───────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const navigate      = useNavigate();
  const { showToast } = useToast();

  const [username, setUsername] = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [errors, setErrors]     = useState<Record<string, string>>({});
  const [loading, setLoading]   = useState(false);

  const clearError = (field: string) => setErrors((p) => ({ ...p, [field]: "" }));

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = () => {
    const e: Record<string, string> = {};

    if (!username.trim()) {
      e.username = "Введите имя пользователя";
    } else if (username.trim().length < 3) {
      e.username = "Не менее 3 символов";
    } else if (username.trim().length > 50) {
      e.username = "Не более 50 символов";
    } else if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
      e.username = "Только латиница, цифры и _";
    }

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

    if (!confirm) {
      e.confirm = "Подтвердите пароль";
    } else if (confirm !== password) {
      e.confirm = "Пароли не совпадают";
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
      const res  = await fetch("/api/v1/auth/register", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ username: username.trim(), email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        let msg = data.error || "Ошибка регистрации";
        if (msg.includes("email already exists"))    msg = "Пользователь с таким email уже зарегистрирован";
        if (msg.includes("username already exists")) msg = "Это имя пользователя уже занято";
        showToast(msg, "error");
        return;
      }

      localStorage.setItem("token", data.token);
      showToast("Аккаунт создан! Добро пожаловать.", "success");
      setTimeout(() => navigate("/"), 900);
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
        {/* ── Left panel ────────────────────────────────────────────────────── */}
        <div className="auth-panel" style={{
          flex: "0 0 45%",
          background: "linear-gradient(160deg, #1C1410 0%, #3D2B1F 60%, #5A3E2B 100%)",
          display: "flex", flexDirection: "column", justifyContent: "space-between",
          padding: "56px 64px", position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: "-100px", left: "-100px",
            width: "500px", height: "500px", borderRadius: "50%",
            border: "1px solid rgba(196,168,130,0.1)", pointerEvents: "none",
          }} />

          <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "baseline", gap: "2px" }}>
            <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "28px", fontWeight: 700, color: "#FAF7F2" }}>Book</span>
            <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "28px", fontWeight: 400, color: "#C4A882", fontStyle: "italic" }}>store</span>
          </a>

          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            <h2 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "26px", fontWeight: 700, color: "#FAF7F2", lineHeight: 1.35,
            }}>
              Присоединяйтесь к нашему{" "}
              <span style={{ color: "#C4A882", fontStyle: "italic" }}>книжному сообществу</span>
            </h2>
            {[
              { icon: "📚", text: "Персональные рекомендации на основе ваших предпочтений" },
              { icon: "🔖", text: "Сохраняйте избранные книги и создавайте списки чтения" },
              { icon: "🚚", text: "История всех ваших заказов в одном месте" },
            ].map(({ icon, text }, i) => (
              <div key={i} style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                <span style={{ fontSize: "22px", flexShrink: 0 }}>{icon}</span>
                <p style={{ fontFamily: "'Crimson Pro', Georgia, serif", fontSize: "16px", color: "rgba(250,247,242,0.75)", lineHeight: 1.5 }}>
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right form panel ──────────────────────────────────────────────── */}
        <div className="auth-form" style={{
          flex: "0 0 55%", display: "flex", alignItems: "center",
          justifyContent: "center", padding: "48px 32px", overflowY: "auto",
        }}>
          <div style={{ width: "100%", maxWidth: "440px" }}>
            <div style={{ marginBottom: "40px" }}>
              <h1 style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "36px", fontWeight: 700, color: "#1C1410", marginBottom: "10px",
              }}>
                Создать аккаунт
              </h1>
              <p style={{ fontFamily: "'Crimson Pro', Georgia, serif", fontSize: "16px", color: "#7A6A5A" }}>
                Уже есть аккаунт?{" "}
                <Link to="/login" style={{ color: "#8B6F47", textDecoration: "none", borderBottom: "1px solid #C4A882" }}>
                  Войти
                </Link>
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
              <Field
                label="Имя пользователя"
                value={username}
                error={errors.username}
                placeholder="john_doe"
                hint="3–50 символов: латиница, цифры, _"
                autoComplete="username"
                onChange={(v) => { setUsername(v); clearError("username"); }}
              />
              <Field
                label="Email"
                type="email"
                value={email}
                error={errors.email}
                placeholder="example@mail.com"
                autoComplete="email"
                onChange={(v) => { setEmail(v); clearError("email"); }}
              />
              <div>
                <Field
                  label="Пароль"
                  type="password"
                  value={password}
                  error={errors.password}
                  placeholder="Не менее 6 символов"
                  autoComplete="new-password"
                  onChange={(v) => { setPassword(v); clearError("password"); }}
                />
                <PasswordStrength password={password} />
              </div>
              <Field
                label="Подтвердите пароль"
                type="password"
                value={confirm}
                error={errors.confirm}
                placeholder="Повторите пароль"
                autoComplete="new-password"
                onChange={(v) => { setConfirm(v); clearError("confirm"); }}
              />

              <SubmitButton loading={loading} label="Зарегистрироваться" loadingLabel="Регистрация..." />

              <p style={{
                fontFamily: "'Crimson Pro', Georgia, serif",
                fontSize: "13px", color: "#9A8A7A", textAlign: "center", lineHeight: 1.5,
              }}>
                Регистрируясь, вы соглашаетесь с нашими{" "}
                <a href="/terms" style={{ color: "#8B6F47", textDecoration: "none" }}>условиями использования</a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}