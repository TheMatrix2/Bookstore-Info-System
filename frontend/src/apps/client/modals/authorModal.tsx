import { Button, Modal } from "react-bootstrap";
import type Author from "../../../interfaces/author";
import type BookFilter from "../../../interfaces/bookFilter";
import { apiFetch } from "../../../shared/api";

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
				<Button variant="primary" onClick={() => handleShowBooks(author.id)}>
					Показать книги автора
				</Button>
			</Modal.Body>
		</Modal>
	)
}