import { useState, useEffect } from 'react';
import { Button, Modal, Form, Table } from 'react-bootstrap';
import { Pencil, Trash, Plus } from '@phosphor-icons/react';
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
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<FormData>({ id: 0, name: '', email: '', password: '', phone: '', group: 1 });

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (error: unknown) {
      console.error('Erro na listagem:', error);
      toast.error('Erro ao buscar usuários do servidor backend.');
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
      setFormData({ id: user.id, name: user.name, email: user.email, password: '', phone: user.phone || '', group: groupId });
    } else {
      setFormData({ id: 0, name: '', email: '', password: '', phone: '', group: 1 });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Mapeia para os campos que o backend (projetoIntegrador_uc13) espera
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        senha: formData.password,
        group: formData.group,
      };

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
        <Button variant="primary" onClick={() => handleOpenModal()}>
          <Plus size={20} className="me-2"/> Cadastrar Usuário
        </Button>
      </div>

      <Table striped bordered hover responsive>
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Email</th>
            <th>Telefone</th>
            <th>Grupo</th>
            <th className="text-center">Ações</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td className="align-middle">{user.id}</td>
              <td className="align-middle">{user.name}</td>
              <td className="align-middle">{user.email}</td>
              <td className="align-middle">{user.phone}</td>
              <td className="align-middle">
                {(() => {
                  const groups = user.groups || user.group || [];
                  return (groups.length > 0 && groups[0].group) 
                    ? groups[0].group.name 
                    : 'Sem Grupo';
                })()}
              </td>
              <td className="text-center">
                <Button variant="warning" size="sm" className="me-2" onClick={() => handleOpenModal(user)}>
                  <Pencil size={18} />
                </Button>
                <Button variant="danger" size="sm" onClick={() => handleDelete(user.id)}>
                  <Trash size={18} />
                </Button>
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
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Senha</Form.Label>
              <Form.Control
                type="password"
                required={!formData.id}
                placeholder={formData.id ? 'Mantenha a mesma caso não queira alterar...' : ''}
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
              />
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
                <option value={1}>Administradores (ADM)</option>
                <option value={2}>Vendedores</option>
                <option value={3}>Produção</option>
              </Form.Select>
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
