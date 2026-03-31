import axios from 'axios';

// Defina aqui a porta do seu projeto backend (projetoIntegrador_uc13)
const api = axios.create({
  baseURL: 'http://127.0.0.1:4000', // Usa IPv4 direto para evitar problemas de resolução no Windows
  timeout: 10000, // 10 segundos de timeout
});

// Adiciona o token em cada requisição se ele existir
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor de resposta: auto-logout e depuração
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      console.error('❌ ERRO DE REDE:', error.message);
    } else {
      console.error(`❌ ERRO ${error.response.status}:`, error.response.data);

      // Se recebeu 401 em rota protegida (não login), remove o token.
      // O App.tsx detecta a remoção automaticamente e redireciona ao login.
      if (error.response.status === 401) {
        const url = error.config?.url || '';
        if (!url.includes('login')) {
          localStorage.removeItem('token');
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
