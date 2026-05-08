import { useEffect, useState, useCallback } from "react";
import {
  Container, Row, Col, Card, Badge, Button, Form,
  Spinner, Alert, InputGroup, Offcanvas,
} from "react-bootstrap";
import { apiFetch } from "../../../shared/api";
import { mapBookFromAPI, type Book, type BookFilter } from "../../../mappers/book";
import { mapAuthorFromApi } from "../../../mappers/author";
import type Author from "../../../mappers/author";
import { mapPublisherFromApi } from "../../../mappers/publisher";
import type Publisher from "../../../mappers/publisher";
import { useAuthStore } from "../../../shared/authStore";
import BookModal from "../modals/bookModal";

interface Category {
  id: string;
  name: string;
}

function mapCategoryFromApi(raw: { ID: string; Name: string }): Category {
  return { id: raw.ID, name: raw.Name };
}

const SORT_OPTIONS = [
  { value: "", label: "По умолчанию (новые)" },
  { value: "price_asc", label: "Цена: по возрастанию" },
  { value: "price_desc", label: "Цена: по убыванию" },
  { value: "title_asc", label: "Название: А–Я" },
  { value: "title_desc", label: "Название: Я–А" },
];

export default function BooksPage() {
  const { token } = useAuthStore();

  const [books, setBooks] = useState<Book[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [publishers, setPublishers] = useState<Publisher[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showFilter, setShowFilter] = useState(false);

  // filter state
  const [search, setSearch] = useState("");
  const [selectedAuthorIds, setSelectedAuthorIds] = useState<string[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedPublisherId, setSelectedPublisherId] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [inStock, setInStock] = useState(false);
  const [sortBy, setSortBy] = useState("");

  const buildQueryString = useCallback((filter: BookFilter): string => {
    const params = new URLSearchParams();
    if (filter.search) params.append("search", filter.search);
    if (filter.publisher_id) params.append("publisher_id", filter.publisher_id);
    if (filter.min_price !== undefined) params.append("min_price", String(filter.min_price));
    if (filter.max_price !== undefined) params.append("max_price", String(filter.max_price));
    if (filter.in_stock) params.append("in_stock", "true");
    if (filter.sort_by) params.append("sort_by", filter.sort_by);
    (filter.author_ids ?? []).forEach((id) => params.append("author_ids", id));
    (filter.category_ids ?? []).forEach((id) => params.append("category_ids", id));
    return params.toString();
  }, []);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const filter: BookFilter = {
        search: search || undefined,
        publisher_id: selectedPublisherId || undefined,
        min_price: minPrice ? parseFloat(minPrice) : undefined,
        max_price: maxPrice ? parseFloat(maxPrice) : undefined,
        in_stock: inStock || undefined,
        sort_by: sortBy || undefined,
        author_ids: selectedAuthorIds.length ? selectedAuthorIds : undefined,
        category_ids: selectedCategoryIds.length ? selectedCategoryIds : undefined,
      };
      const qs = buildQueryString(filter);
      const raw = await apiFetch(`/books${qs ? `?${qs}` : ""}`);
      setBooks((raw ?? []).map(mapBookFromAPI));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }, [search, selectedAuthorIds, selectedCategoryIds, selectedPublisherId, minPrice, maxPrice, inStock, sortBy, buildQueryString]);

  // load filter data once
  useEffect(() => {
    Promise.all([
      apiFetch("/authors"),
      apiFetch("/categories"),
      apiFetch("/publishers"),
    ]).then(([rawAuthors, rawCategories, rawPublishers]) => {
      setAuthors((rawAuthors ?? []).map(mapAuthorFromApi));
      setCategories((rawCategories ?? []).map(mapCategoryFromApi));
      setPublishers((rawPublishers ?? []).map(mapPublisherFromApi));
    }).catch(() => {/* non-critical */});
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  function toggleMultiSelect(id: string, list: string[], setter: (v: string[]) => void) {
    setter(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  }

  function handleReset() {
    setSearch("");
    setSelectedAuthorIds([]);
    setSelectedCategoryIds([]);
    setSelectedPublisherId("");
    setMinPrice("");
    setMaxPrice("");
    setInStock(false);
    setSortBy("");
  }

  const activeFiltersCount = [
    search,
    selectedAuthorIds.length > 0,
    selectedCategoryIds.length > 0,
    selectedPublisherId,
    minPrice,
    maxPrice,
    inStock,
    sortBy,
  ].filter(Boolean).length;

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <h1 className="mb-0">Каталог книг</h1>
        <div className="d-flex gap-2 align-items-center flex-wrap">
          <InputGroup style={{ maxWidth: 320 }}>
            <Form.Control
              placeholder="Поиск по названию..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchBooks()}
            />
            <Button variant="outline-secondary" onClick={fetchBooks}>🔍</Button>
          </InputGroup>
          <Button
            variant="outline-primary"
            onClick={() => setShowFilter(true)}
          >
            Фильтры {activeFiltersCount > 0 && <Badge bg="primary" className="ms-1">{activeFiltersCount}</Badge>}
          </Button>
        </div>
      </div>

      {/* Sort bar */}
      <div className="d-flex align-items-center gap-3 mb-3 flex-wrap">
        <Form.Select
          style={{ maxWidth: 260 }}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </Form.Select>
        {activeFiltersCount > 0 && (
          <Button size="sm" variant="outline-secondary" onClick={handleReset}>
            Сбросить фильтры
          </Button>
        )}
        <span className="text-muted small ms-auto">
          {loading ? "" : `Найдено: ${books.length}`}
        </span>
      </div>

      {/* Active filter chips */}
      {(selectedAuthorIds.length > 0 || selectedCategoryIds.length > 0 || selectedPublisherId) && (
        <div className="d-flex flex-wrap gap-1 mb-3">
          {selectedAuthorIds.map((id) => {
            const a = authors.find((x) => x.id === id);
            return a ? (
              <Badge
                key={id} bg="secondary" className="d-flex align-items-center gap-1"
                style={{ cursor: "pointer", fontWeight: 400 }}
                onClick={() => setSelectedAuthorIds(selectedAuthorIds.filter((x) => x !== id))}
              >
                {a.surname} {a.name} ×
              </Badge>
            ) : null;
          })}
          {selectedCategoryIds.map((id) => {
            const c = categories.find((x) => x.id === id);
            return c ? (
              <Badge
                key={id} bg="info" text="dark" className="d-flex align-items-center gap-1"
                style={{ cursor: "pointer", fontWeight: 400 }}
                onClick={() => setSelectedCategoryIds(selectedCategoryIds.filter((x) => x !== id))}
              >
                {c.name} ×
              </Badge>
            ) : null;
          })}
          {selectedPublisherId && (
            <Badge
              bg="warning" text="dark" className="d-flex align-items-center gap-1"
              style={{ cursor: "pointer", fontWeight: 400 }}
              onClick={() => setSelectedPublisherId("")}
            >
              {publishers.find((p) => p.id === selectedPublisherId)?.name ?? selectedPublisherId} ×
            </Badge>
          )}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" /></div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : books.length === 0 ? (
        <Alert variant="info">Книги не найдены. Попробуйте изменить фильтры.</Alert>
      ) : (
        <Row xs={1} sm={2} md={3} lg={4} className="g-4">
          {books.map((book) => (
            <Col key={book.id}>
              <Card
                className="h-100 shadow-sm"
                style={{ cursor: "pointer" }}
                onClick={() => setSelectedBook(book)}
              >
                <div
                  className="bg-secondary-subtle d-flex align-items-center justify-content-center text-secondary"
                  style={{ height: 180 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M1 2.828A2 2 0 0 1 3 1h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-1.172V2.828zm1 .344V13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v.172z"/>
                    <path d="M4 5.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5z"/>
                  </svg>
                </div>
                <Card.Body className="d-flex flex-column">
                  <Card.Title className="fs-6">{book.title}</Card.Title>
                  <Card.Text className="text-muted small mb-1">
                    {book.authors.length > 0
                      ? book.authors.map((a) => `${a.surname} ${a.name}`).join(", ")
                      : "—"}
                  </Card.Text>
                  {book.categories.length > 0 && (
                    <div className="mb-2">
                      {book.categories.map((c) => (
                        <Badge key={c.id} bg="light" text="dark" className="me-1 border">{c.name}</Badge>
                      ))}
                    </div>
                  )}
                  <div className="mt-auto d-flex justify-content-between align-items-center">
                    <strong className="text-primary">
                      {book.price.toLocaleString("ru-RU", { style: "currency", currency: "RUB" })}
                    </strong>
                    {book.stock > 0 ? (
                      <Badge bg="success">В наличии</Badge>
                    ) : (
                      <Badge bg="danger">Нет</Badge>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Filter offcanvas */}
      <Offcanvas show={showFilter} onHide={() => setShowFilter(false)} placement="end">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Фильтры</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {/* Price */}
          <div className="mb-4">
            <h6 className="fw-semibold mb-2">Цена (₽)</h6>
            <div className="d-flex gap-2">
              <Form.Control
                type="number" placeholder="От" value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)} min={0}
              />
              <Form.Control
                type="number" placeholder="До" value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)} min={0}
              />
            </div>
          </div>

          {/* In stock */}
          <div className="mb-4">
            <Form.Check
              type="switch"
              id="in-stock-switch"
              label="Только в наличии"
              checked={inStock}
              onChange={(e) => setInStock(e.target.checked)}
            />
          </div>

          {/* Authors */}
          {authors.length > 0 && (
            <div className="mb-4">
              <h6 className="fw-semibold mb-2">Авторы</h6>
              <div style={{ maxHeight: 200, overflowY: "auto" }}>
                {authors.map((a) => (
                  <Form.Check
                    key={a.id}
                    type="checkbox"
                    id={`author-${a.id}`}
                    label={`${a.surname} ${a.name}`}
                    checked={selectedAuthorIds.includes(a.id)}
                    onChange={() => toggleMultiSelect(a.id, selectedAuthorIds, setSelectedAuthorIds)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Categories */}
          {categories.length > 0 && (
            <div className="mb-4">
              <h6 className="fw-semibold mb-2">Категории</h6>
              <div style={{ maxHeight: 200, overflowY: "auto" }}>
                {categories.map((c) => (
                  <Form.Check
                    key={c.id}
                    type="checkbox"
                    id={`cat-${c.id}`}
                    label={c.name}
                    checked={selectedCategoryIds.includes(c.id)}
                    onChange={() => toggleMultiSelect(c.id, selectedCategoryIds, setSelectedCategoryIds)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Publisher */}
          {publishers.length > 0 && (
            <div className="mb-4">
              <h6 className="fw-semibold mb-2">Издательство</h6>
              <Form.Select
                value={selectedPublisherId}
                onChange={(e) => setSelectedPublisherId(e.target.value)}
              >
                <option value="">Все</option>
                {publishers.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </Form.Select>
            </div>
          )}

          <div className="d-grid gap-2">
            <Button variant="primary" onClick={() => { setShowFilter(false); fetchBooks(); }}>
              Применить
            </Button>
            <Button variant="outline-secondary" onClick={handleReset}>
              Сбросить всё
            </Button>
          </div>
        </Offcanvas.Body>
      </Offcanvas>

      {/* Book detail modal */}
      {selectedBook && (
        <BookModal
          book={selectedBook}
          show={!!selectedBook}
          onHide={() => setSelectedBook(null)}
          token={token}
        />
      )}
    </Container>
  );
}
