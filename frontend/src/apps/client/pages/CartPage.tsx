import { useEffect, useState } from "react";
import {
  Container, Row, Col, Card, Button,
  Spinner, Alert, Table, Form, Modal,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../shared/authStore";
import { apiFetch } from "../../../shared/api";
import { mapCartFromAPI, type Cart } from "../../../mappers/cart";
import { mapOrderFromAPI, type Order } from "../../../mappers/order";

export default function CartPage() {
  const { token } = useAuthStore();
  const navigate = useNavigate();

  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const [showCheckout, setShowCheckout] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [checkoutError, setCheckoutError] = useState("");
  const [checkoutSuccess, setCheckoutSuccess] = useState<Order | null>(null);

  useEffect(() => {
    if (!token) { navigate("/"); return; }
    fetchCart();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function fetchCart() {
    setLoading(true);
    setError("");
    try {
      const raw = await apiFetch("/cart", { method: "GET" }, token);
      setCart(raw ? mapCartFromAPI(raw) : null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки корзины");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateQuantity(bookId: string, delta: number, currentQty: number) {
    if (!token) return;
    const newQty = currentQty + delta;
    setActionLoading(true);
    try {
      if (newQty <= 0) {
        await apiFetch(`/cart/items/${bookId}`, { method: "DELETE" }, token);
      } else {
        await apiFetch(`/cart/items/${bookId}`, {
          method: "PUT",
          body: JSON.stringify({ quantity: newQty }),
        }, token);
      }
      await fetchCart();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleClear() {
    if (!token) return;
    setActionLoading(true);
    try {
      await apiFetch("/cart", { method: "DELETE" }, token);
      await fetchCart();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCheckout() {
    if (!token) return;
    setCheckoutError("");
    setActionLoading(true);
    try {
      const rawOrder = await apiFetch("/orders", { method: "POST" }, token);
      const order = mapOrderFromAPI(rawOrder);

      if (deliveryAddress) {
        await apiFetch(`/orders/${order.id}/delivery`, {
          method: "POST",
          body: JSON.stringify({ address: deliveryAddress }),
        }, token);
      }

      await apiFetch(`/orders/${order.id}/payment`, {
        method: "POST",
        body: JSON.stringify({ method: paymentMethod }),
      }, token);

      setCheckoutSuccess(order);
      await fetchCart();
    } catch (e) {
      setCheckoutError(e instanceof Error ? e.message : "Ошибка оформления");
    } finally {
      setActionLoading(false);
    }
  }

  const items = cart?.items ?? [];
  const total = items.reduce((sum, item) => {
    const price = item.book?.price ?? 0;
    return sum + price * item.quantity;
  }, 0);

  if (loading) {
    return (
      <Container className="py-5 text-center"><Spinner animation="border" /></Container>
    );
  }

  return (
    <Container className="py-4">
      <h1 className="mb-4">Корзина</h1>

      {error && <Alert variant="danger" dismissible onClose={() => setError("")}>{error}</Alert>}

      {items.length === 0 ? (
        <Alert variant="info">
          Корзина пуста.{" "}
          <Alert.Link onClick={() => navigate("/books")}>Перейти к каталогу</Alert.Link>
        </Alert>
      ) : (
        <Row>
          <Col md={8}>
            <Card className="mb-3">
              <Card.Body>
                <Table responsive hover className="mb-0">
                  <thead>
                    <tr>
                      <th>Книга</th>
                      <th className="text-center">Кол-во</th>
                      <th className="text-end">Сумма</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => {
                      const price = item.book?.price ?? 0;
                      const title = item.book?.title ?? item.book_id;
                      const authors = item.book?.authors ?? [];
                      return (
                        <tr key={item.book_id}>
                          <td>
                            <div className="fw-semibold">{title}</div>
                            {authors.length > 0 && (
                              <div className="text-muted small">
                                {authors.map((a) => `${a.surname} ${a.name}`).join(", ")}
                              </div>
                            )}
                          </td>
                          <td className="text-center align-middle">
                            <div className="d-flex align-items-center justify-content-center gap-1">
                              <Button
                                variant="outline-secondary" size="sm"
                                onClick={() => handleUpdateQuantity(item.book_id, -1, item.quantity)}
                                disabled={actionLoading}
                              >−</Button>
                              <span style={{ minWidth: 24, textAlign: "center" }}>{item.quantity}</span>
                              <Button
                                variant="outline-secondary" size="sm"
                                onClick={() => handleUpdateQuantity(item.book_id, +1, item.quantity)}
                                disabled={actionLoading}
                              >+</Button>
                            </div>
                          </td>
                          <td className="text-end align-middle fw-semibold">
                            {(price * item.quantity).toLocaleString("ru-RU", {
                              style: "currency", currency: "RUB",
                            })}
                          </td>
                          <td className="align-middle">
                            <Button
                              variant="outline-danger" size="sm"
                              onClick={() => handleUpdateQuantity(item.book_id, -item.quantity, item.quantity)}
                              disabled={actionLoading}
                            >✕</Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
            <Button
              variant="outline-secondary" size="sm"
              onClick={handleClear}
              disabled={actionLoading}
            >
              Очистить корзину
            </Button>
          </Col>

          <Col md={4}>
            <Card>
              <Card.Body>
                <h5>Итого</h5>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Товаров:</span>
                  <span>{items.reduce((s, i) => s + i.quantity, 0)}</span>
                </div>
                <div className="d-flex justify-content-between mb-3">
                  <span className="fw-bold">Сумма:</span>
                  <span className="fw-bold text-primary">
                    {total.toLocaleString("ru-RU", { style: "currency", currency: "RUB" })}
                  </span>
                </div>
                <Button
                  variant="primary" className="w-100"
                  onClick={() => setShowCheckout(true)}
                  disabled={actionLoading}
                >
                  Оформить заказ
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Checkout modal */}
      <Modal show={showCheckout} onHide={() => { setShowCheckout(false); setCheckoutSuccess(null); }}>
        <Modal.Header closeButton>
          <Modal.Title>Оформление заказа</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {checkoutSuccess ? (
            <Alert variant="success">
              <Alert.Heading>Заказ #{checkoutSuccess.id.slice(0, 8)} оформлен!</Alert.Heading>
              <p>Сумма: <strong>{checkoutSuccess.total_price.toLocaleString("ru-RU", { style: "currency", currency: "RUB" })}</strong></p>
              <Button variant="outline-success" size="sm" onClick={() => navigate("/orders")}>
                Перейти к заказам
              </Button>
            </Alert>
          ) : (
            <>
              {checkoutError && <Alert variant="danger">{checkoutError}</Alert>}

              <Form.Group className="mb-3">
                <Form.Label>Адрес доставки</Form.Label>
                <Form.Control
                  placeholder="Введите адрес (необязательно)"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                />
                <Form.Text className="text-muted">Можно указать позже</Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Способ оплаты</Form.Label>
                <Form.Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                  <option value="card">Банковская карта</option>
                  <option value="cash">Наличные</option>
                  <option value="online">Онлайн-оплата</option>
                </Form.Select>
              </Form.Group>

              <div className="border-top pt-3">
                <div className="d-flex justify-content-between fw-bold">
                  <span>К оплате:</span>
                  <span className="text-primary">
                    {total.toLocaleString("ru-RU", { style: "currency", currency: "RUB" })}
                  </span>
                </div>
              </div>
            </>
          )}
        </Modal.Body>
        {!checkoutSuccess && (
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCheckout(false)}>
              Отмена
            </Button>
            <Button variant="primary" onClick={handleCheckout} disabled={actionLoading}>
              {actionLoading ? <Spinner size="sm" animation="border" className="me-1" /> : null}
              Подтвердить
            </Button>
          </Modal.Footer>
        )}
      </Modal>
    </Container>
  );
}
