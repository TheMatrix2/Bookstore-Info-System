import { Container, Row, Col, Card } from "react-bootstrap";

export default function HomePage() {
  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <h1>Добро пожаловать в Bookstore</h1>
          <p className="text-muted">Каталог книг, авторов и издательств</p>
        </Col>
      </Row>
      <Row xs={1} md={3} className="g-4">
        <Col>
          <Card>
            <Card.Body>
              <Card.Title>📖 Книги</Card.Title>
              <Card.Text>Просматривайте каталог книг с фильтрацией по категориям и цене.</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card>
            <Card.Body>
              <Card.Title>✍️ Авторы</Card.Title>
              <Card.Text>Знакомьтесь с авторами и их произведениями.</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card>
            <Card.Body>
              <Card.Title>🏢 Издательства</Card.Title>
              <Card.Text>Информация об издательствах и их изданиях.</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}