import { useState } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { Navbar, Nav, Container, Button, Row, Col } from "react-bootstrap";
import { useAuthStore } from "../../../shared/authStore";
import AuthModal from "../../../shared/authModal";

export default function ClientLayout() {
  const { token, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <>
        <Navbar bg="dark" variant="dark" expand="lg" sticky="top">
            <Container>
            <Navbar.Brand as={Link} to="/">
                📚 Bookstore
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="client-nav" />
            <Navbar.Collapse id="client-nav">
                <Nav className="me-auto">
                <Nav.Link as={Link} to="/">
                    Главная
                </Nav.Link>
                <Nav.Link as={Link} to="/publishers">
                    Издательства
                </Nav.Link>
                </Nav>
                <Nav>
                {token ? (
                    <>
                    <Nav.Link as={Link} to="/profile">
                        Профиль
                    </Nav.Link>
                    <Button variant="outline-light" size="sm" onClick={handleLogout} className="ms-2">
                        Выйти
                    </Button>
                    </>
                ) : (
                    <Button variant="outline-light" size="sm" onClick={() => setShowAuth(true)}>
                    Войти
                    </Button>
                )}
                </Nav>
            </Navbar.Collapse>
            </Container>
        </Navbar>

        <main className="content">
            <Container className="py-4">
            <Outlet /> 
            </Container>
        </main>

        <AuthModal show={showAuth} onHide={() => setShowAuth(false)} />
    
        <footer className="footer bg-dark text-white py-4 mt-auto">
            <Container>
                <Row>
                <Col md={4}>
                    <h5>Bookstore</h5>
                    <p>Сближаем людей с книгами</p>
                </Col>
                <Col md={4}>
                    <h5>Links</h5>
                    <ul className="list-unstyled">
                    <li><a href="/" className="text-white">На главную</a></li>
                    <li><a href="/about" className="text-white">О нас</a></li>
                    </ul>
                </Col>
                <Col md={4}>
                    <h5>Contact</h5>
                    <p>Email: info@example.com</p>
                </Col>
                </Row>
                <hr className="bg-light" />
                <Row>
                <Col className="text-center">
                    <p>&copy; {new Date().getFullYear()} Bookstore</p>
                </Col>
                </Row>
            </Container>
        </footer>
    </>
  );
}