import { Button, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import type Author from "../../../mappers/author";

interface AuthorModalProps {
  author: Author;
  show: boolean;
  onHide: () => void;
}

export default function AuthorModal({ author, show, onHide }: AuthorModalProps) {
  const navigate = useNavigate();

  if (!author) return null;

  function handleShowBooks() {
    onHide();
    navigate(`/books?author_ids=${author.id}`);
  }

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>{author.surname} {author.name} {author.patronymic}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{author.info || "Информация отсутствует"}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Закрыть</Button>
        <Button variant="primary" onClick={handleShowBooks}>
          Книги автора
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
