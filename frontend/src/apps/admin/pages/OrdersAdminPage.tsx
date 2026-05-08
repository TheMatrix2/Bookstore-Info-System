import { useEffect, useState } from "react";
import {
  Table, Spinner, Alert, Badge, Button, Form, Modal, Accordion,
} from "react-bootstrap";
import { useAuthStore } from "../../../shared/authStore";
import { apiFetch } from "../../../shared/api";
import { mapOrderFromAPI, type Order } from "../../../mappers/order";

const ORDER_STATUSES = ["New", "Processing", "Shipped", "Delivered", "Cancelled"];
const PAYMENT_STATUSES = ["Not paid", "Paid", "Refunded"];
const DELIVERY_STATUSES = ["Waiting", "In progress", "Delivered"];

const STATUS_COLORS: Record<string, string> = {
  New: "primary", Processing: "warning", Shipped: "info", Delivered: "success", Cancelled: "danger",
  "Not paid": "warning", Paid: "success", Refunded: "secondary",
  Waiting: "secondary", "In progress": "info",
};

export default function OrdersAdminPage() {
  const { token } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusTarget, setStatusTarget] = useState<{ type: "order" | "payment" | "delivery"; id: string; current: string } | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiFetch("/admin/orders", {}, token)
      .then((raw) => setOrders((raw ?? []).map(mapOrderFromAPI)))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  function openStatusModal(type: "order" | "payment" | "delivery", id: string, current: string) {
    setStatusTarget({ type, id, current });
    setNewStatus(current);
    setShowStatusModal(true);
  }

  async function handleStatusUpdate() {
    if (!statusTarget || !token) return;
    setSaving(true);
    try {
      const { type, id } = statusTarget;
      if (type === "order") {
        await apiFetch(`/admin/orders/${id}/status`, { method: "PUT", body: JSON.stringify({ status: newStatus }) }, token);
      } else if (type === "payment") {
        await apiFetch(`/admin/payments/${id}/status`, { method: "PUT", body: JSON.stringify({ status: newStatus }) }, token);
      } else {
        await apiFetch(`/admin/deliveries/${id}/status`, { method: "PUT", body: JSON.stringify({ status: newStatus }) }, token);
      }
      const raw = await apiFetch("/admin/orders", {}, token);
      setOrders((raw ?? []).map(mapOrderFromAPI));
      setSuccess("Статус обновлён");
      setShowStatusModal(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="text-center py-5"><Spinner animation="border" /></div>;

  const statusOptions = statusTarget?.type === "order"
    ? ORDER_STATUSES
    : statusTarget?.type === "payment"
    ? PAYMENT_STATUSES
    : DELIVERY_STATUSES;

  return (
    <div>
      <h2 className="mb-3">Заказы</h2>

      {error && <Alert variant="danger" dismissible onClose={() => setError("")}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess("")}>{success}</Alert>}

      {orders.length === 0 ? (
        <Alert variant="info">Заказов нет</Alert>
      ) : (
        <Accordion>
          {orders.map((order, idx) => (
            <Accordion.Item key={order.id} eventKey={String(idx)}>
              <Accordion.Header>
                <div className="d-flex align-items-center gap-3 flex-wrap w-100 me-3">
                  <span className="fw-semibold text-monospace">#{order.id.slice(0, 8)}</span>
                  <Badge bg={STATUS_COLORS[order.status] ?? "secondary"}>{order.status}</Badge>
                  <span className="text-muted small">
                    Пользователь: {order.user_id.slice(0, 8)}
                  </span>
                  <span className="text-muted small">
                    {new Date(order.created_at).toLocaleDateString("ru-RU")}
                  </span>
                  <span className="ms-auto fw-bold text-primary">
                    {order.total_price.toLocaleString("ru-RU", { style: "currency", currency: "RUB" })}
                  </span>
                </div>
              </Accordion.Header>
              <Accordion.Body>
                <div className="row g-3">
                  {/* Order status */}
                  <div className="col-md-4">
                    <strong>Статус заказа</strong>
                    <div className="d-flex align-items-center gap-2 mt-1">
                      <Badge bg={STATUS_COLORS[order.status] ?? "secondary"}>{order.status}</Badge>
                      <Button
                        size="sm" variant="outline-secondary"
                        onClick={() => openStatusModal("order", order.id, order.status)}
                      >
                        Изменить
                      </Button>
                    </div>
                  </div>

                  {/* Payment status */}
                  <div className="col-md-4">
                    <strong>Оплата</strong>
                    {order.payment ? (
                      <div className="d-flex align-items-center gap-2 mt-1">
                        <Badge bg={STATUS_COLORS[order.payment.status] ?? "secondary"}>
                          {order.payment.status}
                        </Badge>
                        <span className="text-muted small">{order.payment.method}</span>
                        <Button
                          size="sm" variant="outline-secondary"
                          onClick={() => openStatusModal("payment", order.payment!.id, order.payment!.status)}
                        >
                          Изменить
                        </Button>
                      </div>
                    ) : (
                      <div className="text-muted small mt-1">Не создана</div>
                    )}
                  </div>

                  {/* Delivery status */}
                  <div className="col-md-4">
                    <strong>Доставка</strong>
                    {order.delivery ? (
                      <div className="d-flex align-items-center gap-2 mt-1">
                        <Badge bg={STATUS_COLORS[order.delivery.status] ?? "secondary"}>
                          {order.delivery.status}
                        </Badge>
                        <span className="text-muted small">{order.delivery.address}</span>
                        <Button
                          size="sm" variant="outline-secondary"
                          onClick={() => openStatusModal("delivery", order.delivery!.order_id, order.delivery!.status)}
                        >
                          Изменить
                        </Button>
                      </div>
                    ) : (
                      <div className="text-muted small mt-1">Не создана</div>
                    )}
                  </div>
                </div>

                {/* Items */}
                <div className="mt-3">
                  <strong>Состав</strong>
                  <Table size="sm" className="mt-2">
                    <thead><tr><th>Книга</th><th className="text-center">Кол-во</th><th className="text-end">Цена</th></tr></thead>
                    <tbody>
                      {(order.items ?? []).map((item) => (
                        <tr key={item.id}>
                          <td>{item.book?.title ?? item.book_id}</td>
                          <td className="text-center">{item.quantity}</td>
                          <td className="text-end">
                            {(item.price * item.quantity).toLocaleString("ru-RU", {
                              style: "currency", currency: "RUB",
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      )}

      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Изменить статус</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
            {statusOptions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Form.Select>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStatusModal(false)}>Отмена</Button>
          <Button variant="primary" onClick={handleStatusUpdate} disabled={saving}>
            {saving ? "Сохранение..." : "Сохранить"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
