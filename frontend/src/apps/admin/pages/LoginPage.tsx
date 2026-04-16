import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from "react-bootstrap";
import { useAuthStore } from "../../../shared/authStore";
import { apiFetch } from "../../../shared/api";

export default function AdminLoginPage() {
  const { setToken } = useAuthStore();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const EMPLOYEE_ROLES = ["admin", "manager", "delivery", "support"];

  function parseRole(token: string): string {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.role ?? "";
    } catch {
      return "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      const role = parseRole(data.token);
      if (!EMPLOYEE_ROLES.includes(role)) {
        setError("Доступ запрещён. Эта страница только для сотрудников.");
        return;
      }
      setToken(data.token);
      navigate("/admin/profile");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ошибка входа");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container 
      fluid 
      className="d-flex align-items-center justify-content-center" 
      style={{ minHeight: "100vh" }}
    >
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={8} md={10} lg={4}>
          <Card className="shadow-sm">
            <Card.Header className="bg-dark text-white py-3">
              <h5 className="mb-0 text-center">🔐 Вход для сотрудников</h5>
            </Card.Header>
            <Card.Body className="p-4">
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Пароль</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>
                <div className="d-grid mt-4">
                  <Button type="submit" variant="dark" size="lg" disabled={loading}>
                    {loading ? <Spinner size="sm" animation="border" /> : "Войти"}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );

}