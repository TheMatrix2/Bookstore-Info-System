import { useEffect, useState } from "react";
import { apiFetch } from "../../../shared/api";
import { Container, Card, Alert, Spinner, Row, Col } from "react-bootstrap";


interface Publisher {
  id: string;
  name: string;
  address: string;
  email: string;
  website: string | null;
}

function mapPublisherFromApi(raw: any): Publisher {
  return {
    id: raw.ID,
    name: raw.Name,
    address: raw.Address,
    email: raw.Email,
    website: raw.Website,
  };
}

export default function PublishersPage() {
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPublishers = async () => {
    try {
      const rawList = await apiFetch("/publishers", { method: "GET" });
      const data = rawList.map(mapPublisherFromApi);
      setPublishers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublishers();
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
      <h1 className="mb-4">Издатели</h1>
      <Row xs={1} md={2} lg={3} className="g-4">
        {publishers.map((pub) => (
          <Col key={pub.id}>
            <Card>
              <Card.Body>
                <Card.Title>{pub.name}</Card.Title>
                <Card.Text>
                  <strong>Адрес:</strong> {pub.address}
                  <br />
                  <strong>Email:</strong> {pub.email}
                  {pub.website && (
                    <>
                      <br />
                      <strong>Сайт:</strong>{" "}
                      <a href={pub.website} target="_blank" rel="noopener noreferrer">
                        {pub.website}
                      </a>
                    </>
                  )}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  )
}