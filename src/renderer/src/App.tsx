import { useState, useEffect, useCallback } from 'react';
import './App.css';
import UsersPage from './pages/UsersPage';
import LoginPage from './pages/LoginPage';

export interface LoggedUser {
  id: number;
  name: string;
  email: string;
}

// Decodifica o JWT e verifica se ainda é válido
function decodeToken(token: string): LoggedUser | null {
  try {
    const payload = JSON.parse(window.atob(token.split('.')[1]));
    // Verifica se expirou (exp é em segundos, Date.now() em milissegundos)
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      console.warn('🔒 Token expirado. Removendo...');
      localStorage.removeItem('token');
      return null;
    }
    // Restringe auto-login ao usuário Administrador Principal (ID 1)
    if (payload.sub !== 1) {
      console.warn('🔒 Acesso Negado: Usuário não é o Administrador Mestre.');
      localStorage.removeItem('token');
      return null;
    }
    return { name: payload.name, email: payload.email, id: payload.sub };
  } catch {
    localStorage.removeItem('token');
    return null;
  }
}

function App() {
  const [loggedUser, setLoggedUser] = useState<LoggedUser | null>(null);

  // Verifica o token ao iniciar
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setLoggedUser(decodeToken(token));
    }
  }, []);

  // Monitora mudanças no localStorage (ex: interceptor removeu o token)
  useEffect(() => {
    const interval = setInterval(() => {
      const token = localStorage.getItem('token');
      if (!token && loggedUser) {
        // Token foi removido (pelo interceptor ou manualmente) → volta ao login
        console.warn('🔒 Token removido. Redirecionando ao login...');
        setLoggedUser(null);
      } else if (token && loggedUser) {
        // Verifica se o token expirou enquanto o app estava aberto
        const stillValid = decodeToken(token);
        if (!stillValid) {
          setLoggedUser(null);
        }
      }
    }, 5000); // Verifica a cada 5 segundos

    return () => clearInterval(interval);
  }, [loggedUser]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    setLoggedUser(null);
  }, []);

  if (!loggedUser) {
    return <LoginPage onLogin={setLoggedUser} />;
  }

  return (
    <div style={{ backgroundColor: '#eaebee', minHeight: '100vh' }}>
      <div className="d-flex justify-content-between align-items-center px-4 py-2" style={{ backgroundColor: '#343a40' }}>
        <span className="text-white fw-bold">Sant Sapore - Sistema Administrativo</span>
        <div className="d-flex align-items-center gap-3">
          <span className="text-light">Olá, {loggedUser.name}</span>
          <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>Sair</button>
        </div>
      </div>
      <UsersPage />
    </div>
  );
}

export default App;

