import { Button, Modal } from "react-bootstrap";
import { apiFetch } from "../../../shared/api";
import type Author from "../../../mappers/author";
import type BookFilter from "../../../mappers/book";

interface AuthorModalProps {
  author: Author;
  show: boolean;
  onHide: () => void;
}

const handleShowBooks = async (authorId: string) => {
	try {
		await apiFetch(`/books`, { 
			method: "GET",
			body: JSON.stringify({ author_id: authorId } as BookFilter)
		});
	} catch (error) {
		console.error("Error fetching books:", error);
	}
};

export default function AuthorModal({ author, show, onHide }: AuthorModalProps) {
	if (!author) return null;

	return (
		<Modal show={show} onHide={onHide}>
			<Modal.Header closeButton>
				<Modal.Title>{author.surname} {author.name} {author.patronymic}</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<p>{author.info || "Информация отсутствует"}</p>
			</Modal.Body>
			<Modal.Footer>
				<Button variant="primary" onClick={() => handleShowBooks(author.id)}>
					Показать книги автора
				</Button>
			</Modal.Footer>
		</Modal>
	)
}