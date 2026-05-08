import { useEffect, useState } from "react";
import {
  Table, Button, Modal, Form, Spinner, Alert, Badge,
} from "react-bootstrap";
import { useAuthStore } from "../../../shared/authStore";
import { apiFetch } from "../../../shared/api";
import { mapBookFromAPI, type Book } from "../../../mappers/book";
import { mapAuthorFromApi } from "../../../mappers/author";
import type Author from "../../../mappers/author";
import { mapPublisherFromApi } from "../../../mappers/publisher";
import type Publisher from "../../../mappers/publisher";

interface Category { id: string; name: string; }

export default function BooksAdminPage() {
  const { token } = useAuthStore();
  const [books, setBooks] = useState<Book[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Book | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [publisherId, setPublisherId] = useState("");
  const [selectedAuthorIds, setSelectedAuthorIds] = useState<string[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      apiFetch("/books", {}, token),
      apiFetch("/authors", {}, token),
      apiFetch("/publishers", {}, token),
      apiFetch("/categories", {}, token),
    ]).then(([rawBooks, rawAuthors, rawPublishers, rawCategories]) => {
      setBooks((rawBooks ?? []).map(mapBookFromAPI));
      setAuthors((rawAuthors ?? []).map(mapAuthorFromApi));
      setPublishers((rawPublishers ?? []).map(mapPublisherFromApi));
      setCategories((rawCategories ?? []).map((c: { ID: string; Name: string }) => ({ id: c.ID, name: c.Name })));
    }).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, [token]);

  function openCreate() {
    setEditing(null);
    setTitle(""); setDescription(""); setPrice(""); setStock("");
    setPublisherId(publishers[0]?.id ?? "");
    setSelectedAuthorIds([]); setSelectedCategoryIds([]);
    setFormError(""); setShowModal(true);
  }

  function openEdit(book: Book) {
    setEditing(book);
    setTitle(book.title);
    setDescription(book.description ?? "");
    setPrice(String(book.price));
    setStock(String(book.stock));
    setPublisherId(book.publisher?.id ?? "");
    setSelectedAuthorIds(book.authors.map((a) => a.id));
    setSelectedCategoryIds(book.categories.map((c) => c.id));
    setFormError(""); setShowModal(true);
  }

  function toggleId(id: string, list: string[], setter: (v: string[]) => void) {
    setter(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setFormError("");
    try {
      const body = {
        title, description: description || null,
        price: parseFloat(price), stock: parseInt(stock),
        publisher_id: publisherId,
        author_ids: selectedAuthorIds,
        category_ids: selectedCategoryIds,
      };
      if (editing) {
        const raw = await apiFetch(`/books/${editing.id}`, { method: "PUT", body: JSON.stringify(body) }, token);
        setBooks((prev) => prev.map((b) => b.id === editing.id ? mapBookFromAPI(raw) : b));
        setSuccess("Книга обновлена");
      } else {
        const raw = await apiFetch("/books", { method: "POST", body: JSON.stringify(body) }, token);
        setBooks((prev) => [mapBookFromAPI(raw), ...prev]);
        setSuccess("Книга добавлена");
      }
      setShowModal(false);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Удалить книгу?")) return;
    setDeleting(id);
    try {
      await apiFetch(`/books/${id}`, { method: "DELETE" }, token);
      setBooks((prev) => prev.filter((b) => b.id !== id));
      setSuccess("Книга удалена");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setDeleting(null);
    }
  }

  if (loading) return <div className="text-center py-5"><Spinner animation="border" /></div>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Книги</h2>
        <Button variant="primary" onClick={openCreate}>+ Добавить</Button>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError("")}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess("")}>{success}</Alert>}

      <Table responsive hover bordered>
        <thead>
          <tr>
            <th>Название</th>
            <th>Авторы</th>
            <th>Издательство</th>
            <th>Категории</th>
            <th className="text-end">Цена</th>
            <th className="text-center">Склад</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {books.map((book) => (
            <tr key={book.id}>
              <td>{book.title}</td>
              <td className="small">
                {book.authors.map((a) => `${a.surname} ${a.name}`).join(", ") || "—"}
              </td>
              <td>{book.publisher?.name ?? "—"}</td>
              <td>
                {book.categories.map((c) => (
                  <Badge key={c.id} bg="light" text="dark" className="me-1 border">{c.name}</Badge>
                ))}
              </td>
              <td className="text-end">
                {book.price.toLocaleString("ru-RU", { style: "currency", currency: "RUB" })}
              </td>
              <td className="text-center">
                {book.stock > 0 ? (
                  <Badge bg="success">{book.stock}</Badge>
                ) : (
                  <Badge bg="danger">0</Badge>
                )}
              </td>
              <td>
                <div className="d-flex gap-1">
                  <Button size="sm" variant="outline-secondary" onClick={() => openEdit(book)}>✏️</Button>
                  <Button
                    size="sm" variant="outline-danger"
                    onClick={() => handleDelete(book.id)}
                    disabled={deleting === book.id}
                  >🗑️</Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editing ? "Редактировать книгу" : "Новая книга"}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSave}>
          <Modal.Body>
            {formError && <Alert variant="danger">{formError}</Alert>}
            <div className="row g-3">
              <div className="col-12">
                <Form.Label>Название</Form.Label>
                <Form.Control required value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="col-12">
                <Form.Label>Описание</Form.Label>
                <Form.Control as="textarea" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="col-md-4">
                <Form.Label>Цена (₽)</Form.Label>
                <Form.Control required type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
              </div>
              <div className="col-md-4">
                <Form.Label>На складе</Form.Label>
                <Form.Control required type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} />
              </div>
              <div className="col-md-4">
                <Form.Label>Издательство</Form.Label>
                <Form.Select value={publisherId} onChange={(e) => setPublisherId(e.target.value)} required>
                  <option value="">Выберите...</option>
                  {publishers.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </Form.Select>
              </div>
              <div className="col-md-6">
                <Form.Label>Авторы</Form.Label>
                <div style={{ maxHeight: 150, overflowY: "auto", border: "1px solid #dee2e6", borderRadius: 4, padding: "8px" }}>
                  {authors.map((a) => (
                    <Form.Check
                      key={a.id} type="checkbox"
                      id={`ba-${a.id}`}
                      label={`${a.surname} ${a.name}`}
                      checked={selectedAuthorIds.includes(a.id)}
                      onChange={() => toggleId(a.id, selectedAuthorIds, setSelectedAuthorIds)}
                    />
                  ))}
                </div>
              </div>
              <div className="col-md-6">
                <Form.Label>Категории</Form.Label>
                <div style={{ maxHeight: 150, overflowY: "auto", border: "1px solid #dee2e6", borderRadius: 4, padding: "8px" }}>
                  {categories.map((c) => (
                    <Form.Check
                      key={c.id} type="checkbox"
                      id={`bc-${c.id}`}
                      label={c.name}
                      checked={selectedCategoryIds.includes(c.id)}
                      onChange={() => toggleId(c.id, selectedCategoryIds, setSelectedCategoryIds)}
                    />
                  ))}
                </div>
              </div>
            </div>
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
