import { useState, useEffect } from 'react';
import { Button, Modal, Form, Table, InputGroup, Alert } from 'react-bootstrap';
import { Pencil, Trash, Plus, ArrowsClockwise, CopySimple, Eye, EyeSlash } from '@phosphor-icons/react';
import toast, { Toaster } from 'react-hot-toast';
import api from '../../services/api';

interface UserGroup {
  groupId: number;
  group?: { name: string };
}

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  isActive: boolean;
  lastSeen?: string;
  groups?: UserGroup[];
  group?: UserGroup[];
}

interface FormData {
  id: number;
  name: string;
  email: string;
  password: string;
  phone: string;
  group: number;
  isActive: boolean;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<FormData>({ id: 0, name: '', email: '', password: '', phone: '', group: 1, isActive: true });
  const [showPassword, setShowPassword] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);

  // Gera uma senha aleatória segura de 10 caracteres
  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
    let pwd = '';
    for (let i = 0; i < 10; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, password: pwd });
    setGeneratedPassword(pwd);
    setShowPassword(true);
    toast.success('Senha gerada! Copie e passe para o funcionário.');
  };

  const copyPassword = () => {
    if (generatedPassword) {
      navigator.clipboard.writeText(generatedPassword);
      toast.success('Senha copiada!');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (error: any) {
      console.error('Erro na listagem:', error);
      const msg = error.response?.data?.error || 'Servidor inacessível ou erro no Banco.';
      toast.error(`Erro: ${msg}`);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenModal = (user: User | null = null) => {
    if (user) {
      // Pela estrutura do Prisma: user.groups[0].groupId
      const userGroups = user.groups || user.group || [];
      const groupId = userGroups.length > 0 ? userGroups[0].groupId : 1;
      setFormData({ 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        password: '', 
        phone: user.phone || '', 
        group: groupId,
        isActive: user.isActive !== undefined ? user.isActive : true
      });
    } else {
      setFormData({ id: 0, name: '', email: '', password: '', phone: '', group: 1, isActive: true });
    }
    setGeneratedPassword(null);
    setShowPassword(false);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setGeneratedPassword(null);
    setShowPassword(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Mapeia para os campos que o backend (projetoIntegrador_uc13) espera
      const payload: Record<string, any> = {
        name: formData.name,
        phone: formData.phone,
        group: formData.group,
      };

      // O backend restringe a alteração de email e desativação do Admin (id 1)
      if (formData.id !== 1) {
        payload.email = formData.email;
        payload.isActive = formData.isActive;
      } else if (!formData.id) {
        // Se for criação de novo usuário, envia tudo
        payload.email = formData.email;
        payload.isActive = formData.isActive;
      }

      // Só envia a senha se o admin digitou uma nova
      if (formData.password.trim()) {
        payload.senha = formData.password;
      }

      if (formData.id) {
        await api.put(`/users/${formData.id}`, payload);
        toast.success('Usuário atualizado com sucesso!');
      } else {
        await api.post('/users', payload);
        toast.success('Usuário cadastrado com sucesso!');
      }
      handleCloseModal();
      fetchUsers();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      toast.error(err.response?.data?.error || 'Erro ao salvar usuário!');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja apagar este usuário?')) {
      try {
        await api.delete(`/users/${id}`);
        toast.success('Usuário removido!');
        fetchUsers();
      } catch (error: unknown) {
        const err = error as { response?: { data?: { error?: string } } };
        toast.error(err.response?.data?.error || 'Erro ao deletar usuário');
      }
    }
  };

  return (
    <div className="container mt-5">
      <Toaster />
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gerenciamento de Usuários</h2>
        <div>
          <Button variant="outline-secondary" onClick={fetchUsers} className="me-2" title="Atualizar Lista">
            <ArrowsClockwise size={20} />
          </Button>
          <Button variant="primary" onClick={() => handleOpenModal()}>
            <Plus size={20} className="me-2"/> Cadastrar Usuário
          </Button>
        </div>
      </div>

      <Table striped bordered hover responsive>
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Email</th>
            <th>Grupo</th>
            <th>Status</th>
            <th>Presença</th>
            <th className="text-center">Ações</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td className="align-middle">{user.id}</td>
              <td className="align-middle">{user.name}</td>
              <td className="align-middle">{user.email}</td>
              <td className="align-middle">
                {(() => {
                  const groups = user.groups || user.group || [];
                  return (groups.length > 0 && groups[0].group) 
                    ? groups[0].group.name 
                    : 'Sem Grupo';
                })()}
              </td>
              <td className="align-middle">
                {user.isActive ? (
                  <span className="badge bg-success">Ativo</span>
                ) : (
                  <span className="badge bg-danger">Bloqueado</span>
                )}
              </td>
              <td className="align-middle">
                {(() => {
                  if (!user.lastSeen) return <span className="text-muted">Nunca logou</span>;
                  const lastSeenDate = new Date(user.lastSeen);
                  const diffMinutes = (new Date().getTime() - lastSeenDate.getTime()) / 60000;
                  return diffMinutes < 10 ? (
                    <span className="text-success fw-bold">● Online</span>
                  ) : (
                    <span className="text-muted">Offline ({lastSeenDate.toLocaleDateString()})</span>
                  );
                })()}
              </td>
              <td className="text-center">
                {user.id === 1 ? (
                  <span className="badge bg-secondary">🔒 Protegido</span>
                ) : (
                  <>
                    <Button variant="warning" size="sm" className="me-2" onClick={() => handleOpenModal(user)}>
                      <Pencil size={18} />
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(user.id)}>
                      <Trash size={18} />
                    </Button>
                  </>
                )}
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center">Nenhum usuário cadastrado.</td>
            </tr>
          )}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>{formData.id ? 'Editar Usuário' : 'Novo Usuário'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nome</Form.Label>
              <Form.Control
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                required
                disabled={formData.id === 1}
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
              {formData.id === 1 && (
                <Form.Text className="text-muted">
                  O email do administrador principal não pode ser alterado.
                </Form.Text>
              )}
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Senha</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  required={!formData.id}
                  placeholder={formData.id ? 'Mantenha a mesma caso não queira alterar...' : 'Clique em Gerar Senha'}
                  value={formData.password}
                  onChange={e => { setFormData({ ...formData, password: e.target.value }); setGeneratedPassword(null); }}
                />
                <Button variant="outline-secondary" onClick={() => setShowPassword(!showPassword)} title={showPassword ? 'Ocultar' : 'Mostrar'}>
                  {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                </Button>
                <Button variant="outline-primary" onClick={generatePassword} title="Gerar senha automática">
                  <ArrowsClockwise size={18} /> Gerar
                </Button>
              </InputGroup>
              {generatedPassword && (
                <Alert variant="info" className="mt-2 d-flex align-items-center justify-content-between py-2 px-3" style={{ fontSize: '0.9rem' }}>
                  <span><strong>Senha gerada:</strong> <code style={{ fontSize: '1rem' }}>{generatedPassword}</code></span>
                  <Button variant="outline-info" size="sm" onClick={copyPassword}>
                    <CopySimple size={16} className="me-1" /> Copiar
                  </Button>
                </Alert>
              )}
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Telefone</Form.Label>
              <Form.Control
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Grupo / Permissão</Form.Label>
              <Form.Select
                value={formData.group}
                onChange={e => setFormData({ ...formData, group: parseInt(e.target.value) })}
              >
                <option value={1}>Administrador (ADM)</option>
                <option value={2}>Confeiteira</option>
                <option value={3}>Atendente</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check 
                type="switch"
                id="active-switch"
                label={formData.isActive ? "Conta Ativa" : "Conta Bloqueada"}
                checked={formData.isActive}
                disabled={formData.id === 1}
                onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
              />
              {formData.id === 1 && (
                <Form.Text className="text-muted">
                  O administrador principal não pode ser desativado.
                </Form.Text>
              )}
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              {formData.id ? 'Salvar Edição' : 'Cadastrar'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
