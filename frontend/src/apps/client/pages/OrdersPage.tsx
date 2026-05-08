import { useEffect, useState } from "react";
import {
  Container, Card, Badge, Spinner, Alert, Accordion, Button, Modal, Form,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../shared/authStore";
import { apiFetch } from "../../../shared/api";
import { mapOrderFromAPI, type Order } from "../../../mappers/order";

const ORDER_STATUS_COLORS: Record<string, string> = {
  New: "primary",
  Processing: "warning",
  Shipped: "info",
  Delivered: "success",
  Cancelled: "danger",
};

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  "Not paid": "warning",
  Paid: "success",
  Refunded: "secondary",
};

const DELIVERY_STATUS_COLORS: Record<string, string> = {
  Waiting: "secondary",
  "In progress": "info",
  Delivered: "success",
};

export default function OrdersPage() {
  const { token } = useAuthStore();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [deliveryError, setDeliveryError] = useState("");

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  useEffect(() => {
    if (!token) { navigate("/"); return; }
    fetchOrders();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function fetchOrders() {
    setLoading(true);
    setError("");
    try {
      const raw = await apiFetch("/orders", { method: "GET" }, token);
      setOrders((raw ?? []).map(mapOrderFromAPI));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddDelivery() {
    if (!token || !selectedOrder) return;
    setDeliveryLoading(true);
    setDeliveryError("");
    try {
      await apiFetch(`/orders/${selectedOrder.id}/delivery`, {
        method: "POST",
        body: JSON.stringify({ address: deliveryAddress }),
      }, token);
      setShowDeliveryModal(false);
      await fetchOrders();
    } catch (e) {
      setDeliveryError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setDeliveryLoading(false);
    }
  }

  async function handleAddPayment() {
    if (!token || !selectedOrder) return;
    setPaymentLoading(true);
    setPaymentError("");
    try {
      await apiFetch(`/orders/${selectedOrder.id}/payment`, {
        method: "POST",
        body: JSON.stringify({ method: paymentMethod }),
      }, token);
      setShowPaymentModal(false);
      await fetchOrders();
    } catch (e) {
      setPaymentError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setPaymentLoading(false);
    }
  }

  if (loading) {
    return <Container className="py-5 text-center"><Spinner animation="border" /></Container>;
  }

  return (
    <Container className="py-4">
      <h1 className="mb-4">Мои заказы</h1>

      {error && <Alert variant="danger">{error}</Alert>}

      {orders.length === 0 ? (
        <Alert variant="info">
          У вас ещё нет заказов.{" "}
          <Alert.Link onClick={() => navigate("/books")}>Перейти к каталогу</Alert.Link>
        </Alert>
      ) : (
        <Accordion defaultActiveKey="0">
          {orders.map((order, idx) => (
            <Accordion.Item key={order.id} eventKey={String(idx)}>
              <Accordion.Header>
                <div className="d-flex align-items-center gap-3 flex-wrap w-100 me-3">
                  <span className="fw-semibold">
                    Заказ #{order.id.slice(0, 8)}
                  </span>
                  <Badge bg={ORDER_STATUS_COLORS[order.status] ?? "secondary"}>
                    {order.status}
                  </Badge>
                  <span className="text-muted small">
                    {new Date(order.created_at).toLocaleDateString("ru-RU")}
                  </span>
                  <span className="ms-auto fw-bold text-primary">
                    {order.total_price.toLocaleString("ru-RU", { style: "currency", currency: "RUB" })}
                  </span>
                </div>
              </Accordion.Header>
              <Accordion.Body>
                {/* Items */}
                <h6 className="text-muted mb-2">Состав заказа</h6>
                <ul className="list-unstyled mb-3">
                  {(order.items ?? []).map((item) => (
                    <li key={item.id} className="d-flex justify-content-between border-bottom py-2">
                      <span>
                        <strong>{item.book?.title ?? item.book_id}</strong>
                        {item.book?.authors && item.book.authors.length > 0 && (
                          <span className="text-muted small ms-2">
                            {item.book.authors.map((a) => `${a.surname} ${a.name}`).join(", ")}
                          </span>
                        )}
                        <span className="text-muted ms-2">× {item.quantity}</span>
                      </span>
                      <span className="fw-semibold">
                        {(item.price * item.quantity).toLocaleString("ru-RU", {
                          style: "currency", currency: "RUB",
                        })}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="row g-3">
                  {/* Payment */}
                  <div className="col-md-6">
                    <Card className="h-100">
                      <Card.Body>
                        <Card.Title className="fs-6">Оплата</Card.Title>
                        {order.payment ? (
                          <>
                            <p className="mb-1">
                              <span className="text-muted">Метод: </span>{order.payment.method}
                            </p>
                            <p className="mb-1">
                              <span className="text-muted">Сумма: </span>
                              {order.payment.amount.toLocaleString("ru-RU", {
                                style: "currency", currency: "RUB",
                              })}
                            </p>
                            <Badge bg={PAYMENT_STATUS_COLORS[order.payment.status] ?? "secondary"}>
                              {order.payment.status}
                            </Badge>
                          </>
                        ) : (
                          <>
                            <p className="text-muted small">Оплата не создана</p>
                            <Button
                              size="sm" variant="outline-primary"
                              onClick={() => { setSelectedOrder(order); setShowPaymentModal(true); }}
                            >
                              Добавить оплату
                            </Button>
                          </>
                        )}
                      </Card.Body>
                    </Card>
                  </div>

                  {/* Delivery */}
                  <div className="col-md-6">
                    <Card className="h-100">
                      <Card.Body>
                        <Card.Title className="fs-6">Доставка</Card.Title>
                        {order.delivery ? (
                          <>
                            <p className="mb-1">
                              <span className="text-muted">Адрес: </span>{order.delivery.address}
                            </p>
                            <Badge bg={DELIVERY_STATUS_COLORS[order.delivery.status] ?? "secondary"}>
                              {order.delivery.status}
                            </Badge>
                          </>
                        ) : (
                          <>
                            <p className="text-muted small">Доставка не оформлена</p>
                            <Button
                              size="sm" variant="outline-primary"
                              onClick={() => { setSelectedOrder(order); setShowDeliveryModal(true); setDeliveryAddress(""); }}
                            >
                              Оформить доставку
                            </Button>
                          </>
                        )}
                      </Card.Body>
                    </Card>
                  </div>
                </div>
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      )}

      {/* Delivery modal */}
      <Modal show={showDeliveryModal} onHide={() => setShowDeliveryModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Оформить доставку</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {deliveryError && <Alert variant="danger">{deliveryError}</Alert>}
          <Form.Group>
            <Form.Label>Адрес доставки</Form.Label>
            <Form.Control
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder="Улица, дом, квартира"
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeliveryModal(false)}>Отмена</Button>
          <Button
            variant="primary"
            onClick={handleAddDelivery}
            disabled={deliveryLoading || !deliveryAddress}
          >
            {deliveryLoading ? <Spinner size="sm" animation="border" className="me-1" /> : null}
            Сохранить
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Payment modal */}
      <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Способ оплаты</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {paymentError && <Alert variant="danger">{paymentError}</Alert>}
          <Form.Group>
            <Form.Label>Способ оплаты</Form.Label>
            <Form.Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
              <option value="card">Банковская карта</option>
              <option value="cash">Наличные</option>
              <option value="online">Онлайн-оплата</option>
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>Отмена</Button>
          <Button
            variant="primary"
            onClick={handleAddPayment}
            disabled={paymentLoading}
          >
            {paymentLoading ? <Spinner size="sm" animation="border" className="me-1" /> : null}
            Подтвердить
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
