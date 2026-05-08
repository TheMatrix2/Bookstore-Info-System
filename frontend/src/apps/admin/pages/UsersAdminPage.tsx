import { useEffect, useState } from "react";
import { Table, Spinner, Alert, Badge, Button, Nav } from "react-bootstrap";
import { useAuthStore } from "../../../shared/authStore";
import { apiFetch } from "../../../shared/api";

interface UserRow {
  id: string;
  username: string;
  email: string;
  phone: string | null;
  role: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapUserRow(raw: any): UserRow {
  return {
    id: raw.ID ?? raw.id ?? "",
    username: raw.Username ?? raw.username ?? "",
    email: raw.Email ?? raw.email ?? "",
    phone: raw.Phone ?? raw.phone ?? null,
    role: raw.Role?.Name ?? raw.role?.name ?? "",
  };
}

export default function UsersAdminPage() {
  const { token } = useAuthStore();
  const [tab, setTab] = useState<"customers" | "employees">("customers");
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    const path = tab === "customers" ? "/users/customers" : "/users/employees";
    apiFetch(path, {}, token)
      .then((raw) => setUsers((raw ?? []).map(mapUserRow)))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [tab, token]);

  async function handleDelete(id: string) {
    if (!confirm("Удалить пользователя?")) return;
    try {
      await apiFetch(`/users/${id}`, { method: "DELETE" }, token);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setSuccess("Пользователь удалён");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    }
  }

  return (
    <div>
      <h2 className="mb-3">Пользователи</h2>

      <Nav variant="tabs" className="mb-3" activeKey={tab} onSelect={(k) => k && setTab(k as "customers" | "employees")}>
        <Nav.Item><Nav.Link eventKey="customers">Клиенты</Nav.Link></Nav.Item>
        <Nav.Item><Nav.Link eventKey="employees">Сотрудники</Nav.Link></Nav.Item>
      </Nav>

      {error && <Alert variant="danger" dismissible onClose={() => setError("")}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess("")}>{success}</Alert>}

      {loading ? (
        <div className="text-center py-4"><Spinner animation="border" /></div>
      ) : (
        <Table responsive hover bordered>
          <thead>
            <tr><th>Имя</th><th>Email</th><th>Телефон</th><th>Роль</th><th></th></tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.username}</td>
                <td>{u.email}</td>
                <td>{u.phone ?? "—"}</td>
                <td><Badge bg="secondary">{u.role}</Badge></td>
                <td>
                  <Button size="sm" variant="outline-danger" onClick={() => handleDelete(u.id)}>
                    🗑️
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
