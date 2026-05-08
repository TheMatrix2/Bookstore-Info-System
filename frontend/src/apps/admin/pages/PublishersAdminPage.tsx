import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Spinner, Alert } from "react-bootstrap";
import { useAuthStore } from "../../../shared/authStore";
import { apiFetch } from "../../../shared/api";
import { mapPublisherFromApi } from "../../../mappers/publisher";
import type Publisher from "../../../mappers/publisher";

export default function PublishersAdminPage() {
  const { token } = useAuthStore();
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Publisher | null>(null);
  const [pubName, setPubName] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    apiFetch("/publishers")
      .then((raw) => setPublishers((raw ?? []).map(mapPublisherFromApi)))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function openCreate() {
    setEditing(null);
    setPubName(""); setAddress(""); setEmail(""); setWebsite("");
    setFormError(""); setShowModal(true);
  }

  function openEdit(pub: Publisher) {
    setEditing(pub);
    setPubName(pub.name); setAddress(pub.address);
    setEmail(pub.email); setWebsite(pub.website ?? "");
    setFormError(""); setShowModal(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setFormError("");
    try {
      const body = { name: pubName, address, email, website: website || null };
      if (editing) {
        const raw = await apiFetch(`/publishers/${editing.id}`, { method: "PUT", body: JSON.stringify(body) }, token);
        const updated = mapPublisherFromApi(raw);
        setPublishers((prev) => prev.map((p) => p.id === editing.id ? updated : p));
        setSuccess("Издательство обновлено");
      } else {
        const raw = await apiFetch("/publishers", { method: "POST", body: JSON.stringify(body) }, token);
        setPublishers((prev) => [mapPublisherFromApi(raw), ...prev]);
        setSuccess("Издательство добавлено");
      }
      setShowModal(false);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Удалить издательство?")) return;
    try {
      await apiFetch(`/publishers/${id}`, { method: "DELETE" }, token);
      setPublishers((prev) => prev.filter((p) => p.id !== id));
      setSuccess("Издательство удалено");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    }
  }

  if (loading) return <div className="text-center py-5"><Spinner animation="border" /></div>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Издательства</h2>
        <Button variant="primary" onClick={openCreate}>+ Добавить</Button>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError("")}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess("")}>{success}</Alert>}

      <Table responsive hover bordered>
        <thead>
          <tr><th>Название</th><th>Адрес</th><th>Email</th><th>Сайт</th><th></th></tr>
        </thead>
        <tbody>
          {publishers.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.address}</td>
              <td>{p.email}</td>
              <td>
                {p.website ? (
                  <a href={p.website} target="_blank" rel="noopener noreferrer">{p.website}</a>
                ) : "—"}
              </td>
              <td>
                <div className="d-flex gap-1">
                  <Button size="sm" variant="outline-secondary" onClick={() => openEdit(p)}>✏️</Button>
                  <Button size="sm" variant="outline-danger" onClick={() => handleDelete(p.id)}>🗑️</Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editing ? "Редактировать издательство" : "Новое издательство"}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSave}>
          <Modal.Body>
            {formError && <Alert variant="danger">{formError}</Alert>}
            <Form.Group className="mb-3">
              <Form.Label>Название</Form.Label>
              <Form.Control required value={pubName} onChange={(e) => setPubName(e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Адрес</Form.Label>
              <Form.Control required value={address} onChange={(e) => setAddress(e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control required type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Сайт</Form.Label>
              <Form.Control placeholder="https://..." value={website} onChange={(e) => setWebsite(e.target.value)} />
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
