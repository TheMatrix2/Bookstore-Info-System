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
              <Nav.Item>
                <NavLink
                  to="/admin/profile"
                  className={({ isActive }) =>
                    "nav-link" + (isActive ? " active fw-bold" : "")
                  }
                >
                  👤 Профиль
                </NavLink>
              </Nav.Item>
              <Nav.Item>
                <NavLink
                  to="/admin/users"
                  className={({ isActive }) =>
                    "nav-link" + (isActive ? " active fw-bold" : "")
                  }
                >
                  👥 Пользователи
                </NavLink>
              </Nav.Item>
              <Nav.Item>
                <NavLink
                  to="/admin/books"
                  className={({ isActive }) =>
                    "nav-link" + (isActive ? " active fw-bold" : "")
                  }
                >
                  📖 Книги
                </NavLink>
              </Nav.Item>
              <Nav.Item>
                <NavLink
                  to="/admin/authors"
                  className={({ isActive }) =>
                    "nav-link" + (isActive ? " active fw-bold" : "")
                  }
                >
                  ✍️ Авторы
                </NavLink>
              </Nav.Item>
              <Nav.Item>
                <NavLink
                  to="/admin/publishers"
                  className={({ isActive }) =>
                    "nav-link" + (isActive ? " active fw-bold" : "")
                  }
                >
                  🏢 Издательства
                </NavLink>
              </Nav.Item>
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