import { useEffect, useState } from "react";
import { apiFetch } from "../../../shared/api";
import { Container, Alert, Spinner, Row, Col, Card } from "react-bootstrap";
import type Author from "../../../interfaces/author";
import AuthorModal from "../modals/authorModal";

function mapAuthorFromApi(raw: any): Author {
	return {
		id: raw.ID,
		surname: raw.Surname,
		name: raw.Name,
		patronymic: raw.Patronymic,
		info: raw.Info,
	};
}

export default function AuthorsPage() {
	const [authors, setAuthors] = useState<Author[]>([]);
	const [authorModal, setAuthorModal] = useState<Author | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	const fetchAuthors = async () => {
		try {
			const rawList = await apiFetch("/authors", { method: "GET" });
			const data = rawList.map(mapAuthorFromApi);
			setAuthors(data);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Ошибка загрузки");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchAuthors();
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
							style={{ cursor: "pointer" }}>
							<Card.Body>
								<Card.Title><strong>{`${author.surname}`}</strong></Card.Title>
								<Card.Text>{`${author.name} ${author.patronymic}`}</Card.Text>
							</Card.Body>
						</Card>
					</Col>
				))}
			</Row>
			{AuthorModal && (
				<AuthorModal 
					author={authorModal!} 
					show={!!authorModal} 
					onHide={() => setAuthorModal(null)} 
				/>
			)}
		</Container>
	);
}