import { useState } from 'react';
import { Form, Button, Spinner, FloatingLabel } from 'react-bootstrap';
import { Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from './authStore';

interface RegisterFormProps {
  onHide: () => void;
}

export default function RegisterForm({ onHide }: RegisterFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [touched, setTouched] = useState({
    username: false,
    email: false,
    phone: false,
    password: false,
    confirm: false,
  });

  const setToken = useAuthStore((s) => s.setToken);

  const getPasswordStrength = (password: string) => {
    let score = 0;

    if (password.length >= 6) score++;
    if (password.match(/[A-Z]/)) score++;
    if (password.match(/[0-9]/)) score++;
    if (password.match(/[^A-Za-z0-9]/)) score++;

    if (score <= 1) return { label: 'Слабый', variant: 'danger' };
    if (score === 2 || score === 3) return { label: 'Средний', variant: 'warning' };
    return { label: 'Сильный', variant: 'success' };
  };

  const strength = getPasswordStrength(regPassword);

  const usernameError = !regUsername
    ? 'Введите имя пользователя'
    : regUsername.length < 3
    ? 'Минимум 3 символа'
    : null;

  const emailError = !regEmail
    ? 'Введите email'
    : !/^\S+@\S+\.\S+$/.test(regEmail)
    ? 'Некорректный email'
    : null;
  
  const phoneError = !regPhone
    ? 'Введите номер телефона'
    : !/^\+?\d{10,15}$/.test(regPhone)
    ? 'Некорректный номер телефона'
    : null;

  const passwordError = !regPassword
    ? 'Введите пароль'
    : regPassword.length < 6
    ? 'Минимум 6 символов'
    : null;

  const confirmError = !regPasswordConfirm
    ? 'Повторите пароль'
    : regPassword !== regPasswordConfirm
    ? 'Пароли не совпадают'
    : null;

  const isFormValid =
    !usernameError && !emailError && !phoneError && !passwordError && !confirmError;

  const handleRegister = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    setTouched({
      username: true,
      email: true,
      phone: true,
      password: true,
      confirm: true,
    });

    if (!isFormValid) return;

    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: regUsername,
          email: regEmail,
          phone: regPhone,
          password: regPassword,
        }),
      });

      const data: { token?: string; error?: string } = await res.json();

      if (!res.ok) throw new Error(data.error ?? 'Ошибка регистрации');

      const token = data.token!;
      setToken(token);
      onHide();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleRegister}>
      <Form.Group className="mb-3">
        <FloatingLabel label="Имя пользователя">
          <Form.Control
            type="text"
            value={regUsername}
            onChange={(e) => setRegUsername(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, username: true }))}
            isInvalid={touched.username && !!usernameError}
            placeholder="username"
          />
        </FloatingLabel>
        <Form.Control.Feedback type="invalid">
          {usernameError}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <FloatingLabel label="Email">
          <Form.Control
            type="email"
            value={regEmail}
            onChange={(e) => setRegEmail(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
            isInvalid={touched.email && !!emailError}
            placeholder="you@example.com"
          />
        </FloatingLabel>
        <Form.Control.Feedback type="invalid">
          {emailError}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <FloatingLabel label="Телефон">
          <Form.Control
            type="tel"
            value={regPhone}
            onChange={(e) => setRegPhone(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
            isInvalid={touched.phone && !!phoneError}
            placeholder="+1234567890"
          />
        </FloatingLabel>
        <Form.Control.Feedback type="invalid">
          {phoneError}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <div className="password-wrapper">
          <FloatingLabel label="Пароль">
            <Form.Control
              type={showPassword ? 'text' : 'password'}
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              isInvalid={touched.password && !!passwordError}
              placeholder="••••••••"
            />
          </FloatingLabel>

          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {regPassword && (
          <div className={`text-${strength.variant} small mt-1`}>
            {strength.label}
          </div>
        )}

        <Form.Control.Feedback type="invalid">
          {passwordError}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <div className="password-wrapper">
          <FloatingLabel label="Повторите пароль">
            <Form.Control
              type={showPassword ? 'text' : 'password'}
              value={regPasswordConfirm}
              onChange={(e) => setRegPasswordConfirm(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, confirm: true }))}
              isInvalid={touched.confirm && !!confirmError}
              placeholder="••••••••"
            />
          </FloatingLabel>

          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <Form.Control.Feedback type="invalid">
          {confirmError}
        </Form.Control.Feedback>
      </Form.Group>

      {error && <div className="text-danger mb-2">{error}</div>}

      <Button
        type="submit"
        variant="primary"
        className="w-100"
        disabled={loading || !isFormValid}
      >
        {loading ? <Spinner animation="border" size="sm" /> : 'Зарегистрироваться'}
      </Button>
    </Form>
  );
}