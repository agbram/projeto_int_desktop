import { useState } from 'react';
import { Button, Form, Card } from 'react-bootstrap';
import { SignIn } from '@phosphor-icons/react';
import toast, { Toaster } from 'react-hot-toast';
import api from '../../services/api';

interface LoggedUser {
  id: number;
  name: string;
  email: string;
}

export default function LoginPage({ onLogin }: { onLogin: (user: LoggedUser) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/users/login', { email, senha: password });
      const { token } = response.data;

      localStorage.setItem('token', token);

      const payload = JSON.parse(window.atob(token.split('.')[1]));
      
      // Restringe o acesso do Electron apenas ao usuário seed (ID 1 - Administrador Mestre)
      if (payload.sub !== 1) {
        localStorage.removeItem('token');
        setLoading(false);
        toast.error('Acesso Negado: Apenas o Administrador Mestre pode acessar o painel desktop.');
        return;
      }

      const user: LoggedUser = {
        name: payload.name,
        email: payload.email,
        id: payload.sub,
      };

      toast.success(`Bem-vindo, ${user.name}!`);
      setTimeout(() => onLogin(user), 1000);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      toast.error(err.response?.data?.error || 'Credenciais inválidas ou erro no servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', backgroundColor: '#eaebee' }}>
      <Toaster />
      <Card className="shadow-sm" style={{ width: '400px', borderRadius: '10px', padding: '20px' }}>
        <Card.Body>
          <div className="text-center mb-4">
            <h3 className="mb-0 text-primary fw-bold">Login</h3>
            <p className="text-muted">Acesse o Sistema Administrativo</p>
          </div>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Ex: admin@admin.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label>Senha</Form.Label>
              <Form.Control
                type="password"
                placeholder="Ex: admin123"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100" disabled={loading}>
              <SignIn size={20} className="me-2" />
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}
