import { useEffect, useState } from "react";
import { Modal, Button, Spinner } from "react-bootstrap";
import type Book from "../../../mappers/book";
import { apiFetch } from "../../../shared/api";
import type { CartItem } from "../../../mappers/cart";

interface BookModalProps {
  book: Book;
  show: boolean;
  onHide: () => void;
}

const handleAddToCart = async (bookId: string) => {
  await apiFetch(`/cart/items`, {
    method: "POST",
    body: JSON.stringify({ book_id: bookId, quantity: 1 }),
  });
};

const handleUpdateCartItem = async (bookId: string, quantity: number) => {
  await apiFetch(`/cart/items/${bookId}`, {
    method: "PUT",
    body: JSON.stringify({ book_id: bookId, quantity }),
  });
};

const handleRemoveCartItem = async (bookId: string) => {
  await apiFetch(`/cart/items/${bookId}`, { method: "DELETE" });
};

export default function BookModal({ book, show, onHide }: BookModalProps) {
  const [cartItem, setCartItem] = useState<CartItem | null>(null);
  const [loadingCart, setLoadingCart] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);

  // Fetch cart state when modal opens
  useEffect(() => {
    if (!show || !book) return;

    const fetchCart = async () => {
      setLoadingCart(true);
      try {
        const data = await apiFetch(`/cart/items`);
        const found = data.items?.find((i: CartItem) => i.book_id === book.id) ?? null;
        setCartItem(found);
      } catch {
        setCartItem(null);
      } finally {
        setLoadingCart(false);
      }
    };

    fetchCart();
  }, [show, book]);

  if (!book) return null;

  const handleAdd = async () => {
    setCartLoading(true);
    try {
      await handleAddToCart(book.id);
      setCartItem({ book_id: book.id, quantity: 1 });
    } catch (e) {
      console.error(e);
    } finally {
      setCartLoading(false);
    }
  };

  const handleQuantityChange = async (delta: number) => {
    if (!cartItem) return;
    const newQty = cartItem.quantity + delta;
    setCartLoading(true);
    try {
      if (newQty <= 0) {
        await handleRemoveCartItem(book.id);
        setCartItem(null);
      } else {
        await handleUpdateCartItem(book.id, newQty);
        setCartItem({ ...cartItem, quantity: newQty });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCartLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Информация о книге</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="row g-4">
          {/* Left column — cover placeholder */}
          <div className="col-12 col-md-4 d-flex align-items-start justify-content-center">
            <div
              className="bg-secondary-subtle rounded d-flex align-items-center justify-content-center text-secondary"
              style={{ width: "100%", aspectRatio: "2/3", maxWidth: 220 }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M1 2.828A2 2 0 0 1 3 1h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-1.172V2.828zm1 .344V13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v.172z" />
                <path d="M4 5.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5z" />
              </svg>
            </div>
          </div>

          {/* Right column — book details */}
          <div className="col-12 col-md-8">
            <h5 className="fw-bold mb-1">{book.title}</h5>

            <dl className="row mt-3 mb-0">
              {book.author && (
                <>
                  <dt className="col-sm-4 text-muted">Автор(ы)</dt>
                  <dd className="col-sm-8">
                    {book.author.surname} {book.author.name} {book.author.patronymic}
                  </dd>
                </>
              )}

              {book.publisher && (
                <>
                  <dt className="col-sm-4 text-muted">Издатель</dt>
                  <dd className="col-sm-8">{book.publisher.name}</dd>
                </>
              )}

              {book.categories?.length > 0 && (
                <>
                  <dt className="col-sm-4 text-muted">Категории</dt>
                  <dd className="col-sm-8">
                    {book.categories.map((c) => c.name).join(", ")}
                  </dd>
                </>
              )}

              {book.price !== undefined && (
                <>
                  <dt className="col-sm-4 text-muted">Цена</dt>
                  <dd className="col-sm-8 fw-semibold">
                    {book.price.toLocaleString("ru-RU", {
                      style: "currency",
                      currency: "RUB",
                    })}
                  </dd>
                </>
              )}

              {book.stock !== undefined && (
                <>
                  <dt className="col-sm-4 text-muted">В наличии</dt>
                  <dd className="col-sm-8">
                    {book.stock > 0 ? (
                      <span className="text-success">{book.stock} шт.</span>
                    ) : (
                      <span className="text-danger">Нет в наличии</span>
                    )}
                  </dd>
                </>
              )}
            </dl>
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Закрыть
        </Button>

        {loadingCart ? (
          <Spinner animation="border" size="sm" />
        ) : cartItem ? (
          /* Quantity controls */
          <div className="d-flex align-items-center gap-2">
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => handleQuantityChange(-1)}
              disabled={cartLoading}
            >
              −
            </Button>
            <span className="fw-semibold" style={{ minWidth: 24, textAlign: "center" }}>
              {cartItem.quantity}
            </span>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => handleQuantityChange(+1)}
              disabled={cartLoading || cartItem.quantity >= (book.stock ?? Infinity)}
            >
              +
            </Button>
            <span className="text-muted small">в корзине</span>
          </div>
        ) : (
          <Button
            variant="primary"
            onClick={handleAdd}
            disabled={cartLoading || book.stock === 0}
          >
            {cartLoading ? (
              <Spinner animation="border" size="sm" className="me-1" />
            ) : null}
            В корзину
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}