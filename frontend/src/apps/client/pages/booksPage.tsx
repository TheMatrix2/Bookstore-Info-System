import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Container, Row, Col, Card, Badge, Button, Form,
  Spinner, Alert, InputGroup, Offcanvas,
} from "react-bootstrap";
import { apiFetch } from "../../../shared/api";
import { mapBookFromAPI, type Book } from "../../../mappers/book";
import { mapAuthorFromApi } from "../../../mappers/author";
import type Author from "../../../mappers/author";
import { mapPublisherFromApi } from "../../../mappers/publisher";
import type Publisher from "../../../mappers/publisher";
import { useAuthStore } from "../../../shared/authStore";
import BookModal from "../modals/BookModal";

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

function buildApiQuery(params: URLSearchParams): string {
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export default function BooksPage() {
  const { token } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const [books, setBooks] = useState<Book[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [publishers, setPublishers] = useState<Publisher[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showFilter, setShowFilter] = useState(false);

  // applied state — drives fetch and URL
  const [search, setSearch] = useState(() => searchParams.get("search") ?? "");
  const [sortBy, setSortBy] = useState(() => searchParams.get("sort_by") ?? "");
  const [appliedAuthorIds, setAppliedAuthorIds] = useState<string[]>(() =>
    searchParams.get("author_ids")?.split(",").filter(Boolean) ?? []
  );
  const [appliedCategoryIds, setAppliedCategoryIds] = useState<string[]>(() =>
    searchParams.get("category_ids")?.split(",").filter(Boolean) ?? []
  );
  const [appliedPublisherId, setAppliedPublisherId] = useState(
    () => searchParams.get("publisher_id") ?? ""
  );
  const [appliedMinPrice, setAppliedMinPrice] = useState(
    () => searchParams.get("min_price") ?? ""
  );
  const [appliedMaxPrice, setAppliedMaxPrice] = useState(
    () => searchParams.get("max_price") ?? ""
  );
  const [appliedInStock, setAppliedInStock] = useState(
    () => searchParams.get("in_stock") === "true"
  );

  // draft state — offcanvas only, committed on Apply
  const [draftAuthorIds, setDraftAuthorIds] = useState<string[]>(appliedAuthorIds);
  const [draftCategoryIds, setDraftCategoryIds] = useState<string[]>(appliedCategoryIds);
  const [draftPublisherId, setDraftPublisherId] = useState(appliedPublisherId);
  const [draftMinPrice, setDraftMinPrice] = useState(appliedMinPrice);
  const [draftMaxPrice, setDraftMaxPrice] = useState(appliedMaxPrice);
  const [draftInStock, setDraftInStock] = useState(appliedInStock);

  // sync URL whenever applied state changes
  const syncUrl = useCallback((
    s: string, sb: string,
    authorIds: string[], categoryIds: string[],
    publisherId: string, minP: string, maxP: string, inS: boolean,
  ) => {
    const p = new URLSearchParams();
    if (s) p.set("search", s);
    if (sb) p.set("sort_by", sb);
    if (authorIds.length) p.set("author_ids", authorIds.join(","));
    if (categoryIds.length) p.set("category_ids", categoryIds.join(","));
    if (publisherId) p.set("publisher_id", publisherId);
    if (minP) p.set("min_price", minP);
    if (maxP) p.set("max_price", maxP);
    if (inS) p.set("in_stock", "true");
    setSearchParams(p, { replace: true });
  }, [setSearchParams]);

  const fetchBooks = useCallback(async (
    s: string, sb: string,
    authorIds: string[], categoryIds: string[],
    publisherId: string, minP: string, maxP: string, inS: boolean,
  ) => {
    setLoading(true);
    setError("");
    try {
      const p = new URLSearchParams();
      if (s) p.set("search", s);
      if (sb) p.set("sort_by", sb);
      if (authorIds.length) p.set("author_ids", authorIds.join(","));
      if (categoryIds.length) p.set("category_ids", categoryIds.join(","));
      if (publisherId) p.set("publisher_id", publisherId);
      if (minP) p.set("min_price", minP);
      if (maxP) p.set("max_price", maxP);
      if (inS) p.set("in_stock", "true");
      const raw = await apiFetch(`/books${buildApiQuery(p)}`);
      setBooks((raw ?? []).map(mapBookFromAPI));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }, []);

  // load filter reference data once
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

  // initial fetch from URL params
  useEffect(() => {
    fetchBooks(search, sortBy, appliedAuthorIds, appliedCategoryIds, appliedPublisherId, appliedMinPrice, appliedMaxPrice, appliedInStock);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openFilter() {
    setDraftAuthorIds(appliedAuthorIds);
    setDraftCategoryIds(appliedCategoryIds);
    setDraftPublisherId(appliedPublisherId);
    setDraftMinPrice(appliedMinPrice);
    setDraftMaxPrice(appliedMaxPrice);
    setDraftInStock(appliedInStock);
    setShowFilter(true);
  }

  function applyFilters() {
    setAppliedAuthorIds(draftAuthorIds);
    setAppliedCategoryIds(draftCategoryIds);
    setAppliedPublisherId(draftPublisherId);
    setAppliedMinPrice(draftMinPrice);
    setAppliedMaxPrice(draftMaxPrice);
    setAppliedInStock(draftInStock);
    syncUrl(search, sortBy, draftAuthorIds, draftCategoryIds, draftPublisherId, draftMinPrice, draftMaxPrice, draftInStock);
    fetchBooks(search, sortBy, draftAuthorIds, draftCategoryIds, draftPublisherId, draftMinPrice, draftMaxPrice, draftInStock);
    setShowFilter(false);
  }

  function handleSearch() {
    syncUrl(search, sortBy, appliedAuthorIds, appliedCategoryIds, appliedPublisherId, appliedMinPrice, appliedMaxPrice, appliedInStock);
    fetchBooks(search, sortBy, appliedAuthorIds, appliedCategoryIds, appliedPublisherId, appliedMinPrice, appliedMaxPrice, appliedInStock);
  }

  function handleSortChange(value: string) {
    setSortBy(value);
    syncUrl(search, value, appliedAuthorIds, appliedCategoryIds, appliedPublisherId, appliedMinPrice, appliedMaxPrice, appliedInStock);
    fetchBooks(search, value, appliedAuthorIds, appliedCategoryIds, appliedPublisherId, appliedMinPrice, appliedMaxPrice, appliedInStock);
  }

  function handleReset() {
    setSearch("");
    setSortBy("");
    setAppliedAuthorIds([]);
    setAppliedCategoryIds([]);
    setAppliedPublisherId("");
    setAppliedMinPrice("");
    setAppliedMaxPrice("");
    setAppliedInStock(false);
    setDraftAuthorIds([]);
    setDraftCategoryIds([]);
    setDraftPublisherId("");
    setDraftMinPrice("");
    setDraftMaxPrice("");
    setDraftInStock(false);
    setSearchParams({}, { replace: true });
    fetchBooks("", "", [], [], "", "", "", false);
  }

  function toggleMultiSelect(id: string, list: string[], setter: (v: string[]) => void) {
    setter(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  }

  const activeFiltersCount = [
    search,
    appliedAuthorIds.length > 0,
    appliedCategoryIds.length > 0,
    appliedPublisherId,
    appliedMinPrice,
    appliedMaxPrice,
    appliedInStock,
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
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button variant="outline-secondary" onClick={handleSearch}>🔍</Button>
          </InputGroup>
          <Button
            variant="outline-primary"
            onClick={openFilter}
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
          onChange={(e) => handleSortChange(e.target.value)}
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
      {(appliedAuthorIds.length > 0 || appliedCategoryIds.length > 0 || appliedPublisherId) && (
        <div className="d-flex flex-wrap gap-1 mb-3">
          {appliedAuthorIds.map((id) => {
            const a = authors.find((x) => x.id === id);
            return a ? (
              <Badge
                key={id} bg="secondary" className="d-flex align-items-center gap-1"
                style={{ cursor: "pointer", fontWeight: 400 }}
                onClick={() => {
                  const next = appliedAuthorIds.filter((x) => x !== id);
                  setAppliedAuthorIds(next);
                  setDraftAuthorIds(next);
                  syncUrl(search, sortBy, next, appliedCategoryIds, appliedPublisherId, appliedMinPrice, appliedMaxPrice, appliedInStock);
                  fetchBooks(search, sortBy, next, appliedCategoryIds, appliedPublisherId, appliedMinPrice, appliedMaxPrice, appliedInStock);
                }}
              >
                {a.surname} {a.name} ×
              </Badge>
            ) : null;
          })}
          {appliedCategoryIds.map((id) => {
            const c = categories.find((x) => x.id === id);
            return c ? (
              <Badge
                key={id} bg="info" text="dark" className="d-flex align-items-center gap-1"
                style={{ cursor: "pointer", fontWeight: 400 }}
                onClick={() => {
                  const next = appliedCategoryIds.filter((x) => x !== id);
                  setAppliedCategoryIds(next);
                  setDraftCategoryIds(next);
                  syncUrl(search, sortBy, appliedAuthorIds, next, appliedPublisherId, appliedMinPrice, appliedMaxPrice, appliedInStock);
                  fetchBooks(search, sortBy, appliedAuthorIds, next, appliedPublisherId, appliedMinPrice, appliedMaxPrice, appliedInStock);
                }}
              >
                {c.name} ×
              </Badge>
            ) : null;
          })}
          {appliedPublisherId && (
            <Badge
              bg="warning" text="dark" className="d-flex align-items-center gap-1"
              style={{ cursor: "pointer", fontWeight: 400 }}
              onClick={() => {
                setAppliedPublisherId("");
                setDraftPublisherId("");
                syncUrl(search, sortBy, appliedAuthorIds, appliedCategoryIds, "", appliedMinPrice, appliedMaxPrice, appliedInStock);
                fetchBooks(search, sortBy, appliedAuthorIds, appliedCategoryIds, "", appliedMinPrice, appliedMaxPrice, appliedInStock);
              }}
            >
              {publishers.find((p) => p.id === appliedPublisherId)?.name ?? appliedPublisherId} ×
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
                type="number" placeholder="От" value={draftMinPrice}
                onChange={(e) => setDraftMinPrice(e.target.value)} min={0}
              />
              <Form.Control
                type="number" placeholder="До" value={draftMaxPrice}
                onChange={(e) => setDraftMaxPrice(e.target.value)} min={0}
              />
            </div>
          </div>

          {/* In stock */}
          <div className="mb-4">
            <Form.Check
              type="switch"
              id="in-stock-switch"
              label="Только в наличии"
              checked={draftInStock}
              onChange={(e) => setDraftInStock(e.target.checked)}
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
                    checked={draftAuthorIds.includes(a.id)}
                    onChange={() => toggleMultiSelect(a.id, draftAuthorIds, setDraftAuthorIds)}
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
                    checked={draftCategoryIds.includes(c.id)}
                    onChange={() => toggleMultiSelect(c.id, draftCategoryIds, setDraftCategoryIds)}
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
                value={draftPublisherId}
                onChange={(e) => setDraftPublisherId(e.target.value)}
              >
                <option value="">Все</option>
                {publishers.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </Form.Select>
            </div>
          )}

          <div className="d-grid gap-2">
            <Button variant="primary" onClick={applyFilters}>
              Применить
            </Button>
            <Button variant="outline-secondary" onClick={() => {
              setDraftAuthorIds([]);
              setDraftCategoryIds([]);
              setDraftPublisherId("");
              setDraftMinPrice("");
              setDraftMaxPrice("");
              setDraftInStock(false);
            }}>
              Сбросить в панели
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
