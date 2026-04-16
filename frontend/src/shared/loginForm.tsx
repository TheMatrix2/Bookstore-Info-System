import { useState } from 'react';
import {
  Form,
  Button,
  Spinner,
  FloatingLabel,
  InputGroup
} from 'react-bootstrap';
import { useAuthStore } from './authStore';
import { Eye, EyeOff } from 'lucide-react';

interface AuthModalProps {
  onHide: () => void;
}

export default function LoginForm({ onHide }: AuthModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [touched, setTouched] = useState({
    email: false,
    password: false
  });

  const setToken = useAuthStore((s) => s.setToken);

  const emailError = (() => {
    if (!/^\S+@\S+\.\S+$/.test(loginEmail)) return 'Некорректный email';
    return null;
  })();

  const passwordError = (() => {
    if (loginPassword.length < 6) return 'Минимум 6 символов';
    return null;
  })();

  const isFormValid = !emailError && !passwordError;

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setTouched({ email: true, password: true });

    if (!isFormValid) return;

    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data: { token?: string; error?: string } = await res.json();

      if (!res.ok) throw new Error(data.error ?? 'Ошибка входа');

      const token = data.token!;
      setToken(token);
      onHide();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleLogin}>
      <InputGroup className="mb-3">
        <FloatingLabel label="Email">
          <Form.Control
            type="email"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
            isInvalid={touched.email && !!emailError}
            placeholder="you@example.com"
          />
          <Form.Control.Feedback type="invalid">
            {emailError}
          </Form.Control.Feedback>
        </FloatingLabel>
      </InputGroup>

      <InputGroup className="mb-3">
        <div className="password-wrapper w-100">
            <FloatingLabel label="Пароль">
                <Form.Control
                type={showPassword ? 'text' : 'password'}
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
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
      </InputGroup>

      {error && (
        <div className="text-danger mb-2">{error}</div>
      )}

      <Button
        type="submit"
        variant="primary"
        className="w-100"
        disabled={loading || !isFormValid}
      >
        {loading ? <Spinner animation="border" size="sm" /> : 'Войти'}
      </Button>
    </Form>
  );
}