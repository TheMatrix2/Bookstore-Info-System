import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { Container, Row, Col, Nav, Button, Navbar } from "react-bootstrap";
import { useAuthStore } from "../../../shared/authStore";

export default function AdminLayout() {
  const { logout, role } = useAuthStore();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/admin/login");
  }

  return (
    <>
      <Navbar bg="dark" variant="dark">
        <Container fluid>
          <Navbar.Brand>⚙️ Панель управления</Navbar.Brand>
          <Navbar.Text className="me-3 text-light">
            Роль: <strong>{role}</strong>
          </Navbar.Text>
          <Button variant="outline-light" size="sm" onClick={handleLogout}>
            Выйти
          </Button>
        </Container>
      </Navbar>

      <Container fluid className="py-4">
        <Row>
          <Col md={2}>
            <Nav className="flex-column border-end pe-3" style={{ minHeight: "80vh" }}>
              {[
                { to: "/admin", label: "👤 Профиль", end: true },
                { to: "/admin/books", label: "📖 Книги" },
                { to: "/admin/authors", label: "✍️ Авторы" },
                { to: "/admin/publishers", label: "🏢 Издательства" },
                { to: "/admin/categories", label: "🏷️ Категории" },
                { to: "/admin/users", label: "👥 Пользователи" },
                { to: "/admin/orders", label: "📦 Заказы" },
              ].map(({ to, label, end }) => (
                <Nav.Item key={to}>
                  <NavLink
                    to={to}
                    end={end}
                    className={({ isActive }) =>
                      "nav-link" + (isActive ? " active fw-bold" : "")
                    }
                  >
                    {label}
                  </NavLink>
                </Nav.Item>
              ))}
            </Nav>
          </Col>

          <Col md={10}>
            <Outlet />
          </Col>
        </Row>
      </Container>
    </>
  );
}
