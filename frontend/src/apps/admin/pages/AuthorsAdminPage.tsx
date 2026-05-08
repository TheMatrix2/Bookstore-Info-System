import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Spinner, Alert } from "react-bootstrap";
import { useAuthStore } from "../../../shared/authStore";
import { apiFetch } from "../../../shared/api";
import { mapAuthorFromApi } from "../../../mappers/author";
import type Author from "../../../mappers/author";

export default function AuthorsAdminPage() {
  const { token } = useAuthStore();
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Author | null>(null);
  const [surname, setSurname] = useState("");
  const [name, setName] = useState("");
  const [patronymic, setPatronymic] = useState("");
  const [info, setInfo] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    apiFetch("/authors")
      .then((raw) => setAuthors((raw ?? []).map(mapAuthorFromApi)))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function openCreate() {
    setEditing(null);
    setSurname(""); setName(""); setPatronymic(""); setInfo("");
    setFormError(""); setShowModal(true);
  }

  function openEdit(author: Author) {
    setEditing(author);
    setSurname(author.surname); setName(author.name);
    setPatronymic(author.patronymic); setInfo(author.info ?? "");
    setFormError(""); setShowModal(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setFormError("");
    try {
      const body = { surname, name, patronymic, info: info || null };
      if (editing) {
        const raw = await apiFetch(`/authors/${editing.id}`, { method: "PUT", body: JSON.stringify(body) }, token);
        const updated = mapAuthorFromApi(raw);
        setAuthors((prev) => prev.map((a) => a.id === editing.id ? updated : a));
        setSuccess("Автор обновлён");
      } else {
        const raw = await apiFetch("/authors", { method: "POST", body: JSON.stringify(body) }, token);
        setAuthors((prev) => [mapAuthorFromApi(raw), ...prev]);
        setSuccess("Автор добавлен");
      }
      setShowModal(false);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Удалить автора?")) return;
    try {
      await apiFetch(`/authors/${id}`, { method: "DELETE" }, token);
      setAuthors((prev) => prev.filter((a) => a.id !== id));
      setSuccess("Автор удалён");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    }
  }

  if (loading) return <div className="text-center py-5"><Spinner animation="border" /></div>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Авторы</h2>
        <Button variant="primary" onClick={openCreate}>+ Добавить</Button>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError("")}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess("")}>{success}</Alert>}

      <Table responsive hover bordered>
        <thead>
          <tr><th>Фамилия</th><th>Имя</th><th>Отчество</th><th>О себе</th><th></th></tr>
        </thead>
        <tbody>
          {authors.map((a) => (
            <tr key={a.id}>
              <td>{a.surname}</td>
              <td>{a.name}</td>
              <td>{a.patronymic}</td>
              <td className="small text-muted" style={{ maxWidth: 200 }}>{a.info || "—"}</td>
              <td>
                <div className="d-flex gap-1">
                  <Button size="sm" variant="outline-secondary" onClick={() => openEdit(a)}>✏️</Button>
                  <Button size="sm" variant="outline-danger" onClick={() => handleDelete(a.id)}>🗑️</Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editing ? "Редактировать автора" : "Новый автор"}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSave}>
          <Modal.Body>
            {formError && <Alert variant="danger">{formError}</Alert>}
            <Form.Group className="mb-3">
              <Form.Label>Фамилия</Form.Label>
              <Form.Control required value={surname} onChange={(e) => setSurname(e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Имя</Form.Label>
              <Form.Control required value={name} onChange={(e) => setName(e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Отчество</Form.Label>
              <Form.Control required value={patronymic} onChange={(e) => setPatronymic(e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>О себе</Form.Label>
              <Form.Control as="textarea" rows={3} value={info} onChange={(e) => setInfo(e.target.value)} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Отмена</Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? <Spinner size="sm" animation="border" className="me-1" /> : null}
              Сохранить
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
