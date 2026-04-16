import { useState, useEffect } from "react";
import { Card, Button, Form, Alert, Spinner, Row, Col } from "react-bootstrap";
import { useAuthStore } from "../../../shared/authStore";
import { apiFetch } from "../../../shared/api";

interface User {
  id: string;
  username: string;
  email: string;
  phone: string | null;
}

export default function AdminProfilePage() {
  const { token } = useAuthStore();

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
    if (!user) return;
    apiFetch(`/users/${user.id}`, {}, token)
      .then((data: User) => {
        setUser(data);
        setUsername(data.username);
        setEmail(data.email);
        setPhone(data.phone ?? "");
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setSaveError("");
    setSaveSuccess(false);
    try {
      const updated: User = await apiFetch(
        `/users/${user.id}`,
        {
          method: "PUT",
          body: JSON.stringify({ username, email, phone: phone || null }),
        },
        token
      );
      setUser(updated);
      setEditing(false);
      setSaveSuccess(true);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Row className="justify-content-start">
      <Col md={6}>
        <Card>
          <Card.Header>
            <h5 className="mb-0">Мой профиль</h5>
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
  );
}