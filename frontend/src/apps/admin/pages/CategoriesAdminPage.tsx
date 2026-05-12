import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Spinner, Alert } from "react-bootstrap";
import { useAuthStore } from "../../../shared/authStore";
import { apiFetch } from "../../../shared/api";

interface Category { id: string; name: string; }

export default function CategoriesAdminPage() {
  const { token } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [catName, setCatName] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  function mapCat(raw: { ID: string; Name: string }): Category {
    return { id: raw.ID, name: raw.Name };
  }

  useEffect(() => {
    apiFetch("/categories")
      .then((raw) => setCategories((raw ?? []).map(mapCat)))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function openCreate() {
    setEditing(null); setCatName(""); setFormError(""); setShowModal(true);
  }

  function openEdit(cat: Category) {
    setEditing(cat); setCatName(cat.name); setFormError(""); setShowModal(true);
  }

  async function handleSave(e: React.ChangeEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true); setFormError("");
    try {
      const body = { name: catName };
      if (editing) {
        const raw = await apiFetch(`/categories/${editing.id}`, { method: "PUT", body: JSON.stringify(body) }, token);
        setCategories((prev) => prev.map((c) => c.id === editing.id ? mapCat(raw) : c));
        setSuccess("Категория обновлена");
      } else {
        const raw = await apiFetch("/categories", { method: "POST", body: JSON.stringify(body) }, token);
        setCategories((prev) => [mapCat(raw), ...prev]);
        setSuccess("Категория добавлена");
      }
      setShowModal(false);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Удалить категорию?")) return;
    try {
      await apiFetch(`/categories/${id}`, { method: "DELETE" }, token);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setSuccess("Категория удалена");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    }
  }

  if (loading) return <div className="text-center py-5"><Spinner animation="border" /></div>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Категории</h2>
        <Button variant="primary" onClick={openCreate}>+ Добавить</Button>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError("")}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess("")}>{success}</Alert>}

      <Table responsive hover bordered style={{ maxWidth: 500 }}>
        <thead><tr><th>Название</th><th></th></tr></thead>
        <tbody>
          {categories.map((c) => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>
                <div className="d-flex gap-1">
                  <Button size="sm" variant="outline-secondary" onClick={() => openEdit(c)}>✏️</Button>
                  <Button size="sm" variant="outline-danger" onClick={() => handleDelete(c.id)}>🗑️</Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editing ? "Редактировать категорию" : "Новая категория"}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSave}>
          <Modal.Body>
            {formError && <Alert variant="danger">{formError}</Alert>}
            <Form.Group>
              <Form.Label>Название</Form.Label>
              <Form.Control required value={catName} onChange={(e) => setCatName(e.target.value)} />
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
