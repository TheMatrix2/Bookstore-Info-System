import { useState } from 'react';
import { Modal, Nav } from 'react-bootstrap';
import LoginForm from './loginForm';
import RegisterForm from './registerForm';


interface AuthModalProps {
  show: boolean;
  onHide: () => void;
}

type Tab = 'login' | 'register';

export default function AuthModal({ show, onHide }: AuthModalProps) {
  const [tab, setTab] = useState<Tab>('login');
  const [_, setError] = useState<string | null>(null);

  const handleTabSelect = (key: string | null) => {
    if (key === 'login' || key === 'register') {
      setTab(key);
      setError(null);
    }
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Аккаунт</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Nav variant="tabs" activeKey={tab} onSelect={handleTabSelect} className="mb-3">
          <Nav.Item>
            <Nav.Link eventKey="login">Вход</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="register">Регистрация</Nav.Link>
          </Nav.Item>
        </Nav>
        {tab === 'login' ? <LoginForm onHide={onHide} /> : <RegisterForm onHide={onHide} />}
      </Modal.Body>
    </Modal>
  );
}