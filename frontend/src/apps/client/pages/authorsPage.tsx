import { useEffect, useState } from "react";
import { apiFetch } from "../../../shared/api";
import { Container, Alert, Spinner, Row, Col, Card } from "react-bootstrap";
import AuthorModal from "../modals/AuthorModal";
import type Author from "../../../mappers/author";
import { mapAuthorFromApi } from "../../../mappers/author";

export default function AuthorsPage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [authorModal, setAuthorModal] = useState<Author | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/authors")
      .then((rawList) => setAuthors((rawList ?? []).map(mapAuthorFromApi)))
      .catch((err) => setError(err instanceof Error ? err.message : "Ошибка загрузки"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h1 className="mb-4">Авторы</h1>
      <Row xs={1} md={2} lg={3} className="g-4">
        {authors.map((author) => (
          <Col key={author.id}>
            <Card
              onClick={() => setAuthorModal(author)}
              style={{ cursor: "pointer" }}
              className="h-100 shadow-sm"
            >
              <Card.Body>
                <Card.Title><strong>{author.surname}</strong></Card.Title>
                <Card.Text>{author.name} {author.patronymic}</Card.Text>
                {author.info && (
                  <Card.Text className="text-muted small">
                    {author.info.length > 100 ? author.info.slice(0, 100) + "..." : author.info}
                  </Card.Text>
                )}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {authorModal && (
        <AuthorModal
          author={authorModal}
          show={!!authorModal}
          onHide={() => setAuthorModal(null)}
        />
      )}
    </Container>
  );
}
