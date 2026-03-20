import { useState, useEffect } from 'react';
import './App.css';
import UsersPage from './pages/UsersPage';
import LoginPage from './pages/LoginPage';

export interface LoggedUser {
  id: number;
  name: string;
  email: string;
}

function App() {
  const [loggedUser, setLoggedUser] = useState<LoggedUser | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(window.atob(token.split('.')[1]));
        setLoggedUser({
          name: payload.name,
          email: payload.email,
          id: payload.sub,
        });
      } catch {
        localStorage.removeItem('token');
      }
    }
  }, []);

  if (!loggedUser) {
    return <LoginPage onLogin={setLoggedUser} />;
  }

  return (
    <div style={{ backgroundColor: '#eaebee', minHeight: '100vh' }}>
      <UsersPage />
    </div>
  );
}

export default App;
