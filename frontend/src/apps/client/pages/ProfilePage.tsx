import { useState, useEffect } from "react";
import { Container, Card, Button, Form, Alert, Spinner, Row, Col } from "react-bootstrap";
import { useAuthStore } from "../../../shared/authStore";
import { apiFetch } from "../../../shared/api";
import { useNavigate } from "react-router-dom";
import { mapUserFromApi, mapUserToApi } from "../../../mappers/user";
import type User from "../../../mappers/user";


export default function ClientProfilePage() {
  const { token, id, logout } = useAuthStore();
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    const fetchUser = async () => {
      try {
        const raw = await apiFetch(`/users/${id}`, { method: "GET" }, token);
        const data = mapUserFromApi(raw);
        setUser(data);
        setUsername(data.username);
        setEmail(data.email);
        setPhone(data.phone ?? "");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ошибка загрузки");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token, id, navigate]);

  async function handleSave(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setSaveError("");
    setSaveSuccess(false);
    try {
      const payload = mapUserToApi({
        username,
        email,
        phone: phone || null,
      });

      const updatedRaw = await apiFetch(
        `/users/${id}`,
        {
          method: "PUT",
          body: JSON.stringify(payload),
        },
        token
      );
      const updated = mapUserFromApi(updatedRaw);
      setUser(updated);
      setEditing(false);
      setSaveSuccess(true);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Мой профиль</h5>
              <Button variant="outline-danger" size="sm" onClick={logout}>
                Выйти
              </Button>
            </Card.Header>
            <Card.Body>
              {saveSuccess && (
                <Alert variant="success" dismissible onClose={() => setSaveSuccess(false)}>
                  Профиль обновлён
                </Alert>
              )}
              {!editing ? (
                <>
                  <p><strong>Имя пользователя:</strong> {user?.username}</p>
                  <p><strong>Email:</strong> {user?.email}</p>
                  <p><strong>Телефон:</strong> {user?.phone ?? "—"}</p>
                  <Button variant="primary" onClick={() => setEditing(true)}>
                    Редактировать
                  </Button>
                </>
              ) : (
                <Form onSubmit={handleSave}>
                  {saveError && <Alert variant="danger">{saveError}</Alert>}
                  <Form.Group className="mb-3">
                    <Form.Label>Имя пользователя</Form.Label>
                    <Form.Control
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Телефон</Form.Label>
                    <Form.Control
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+79000000000"
                    />
                  </Form.Group>
                  <div className="d-flex gap-2">
                    <Button type="submit" variant="primary" disabled={saving}>
                      {saving ? <Spinner size="sm" animation="border" /> : "Сохранить"}
                    </Button>
                    <Button variant="secondary" onClick={() => setEditing(false)}>
                      Отмена
                    </Button>
                  </div>
                </Form>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}