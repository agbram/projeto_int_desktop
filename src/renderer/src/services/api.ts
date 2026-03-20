import axios from 'axios';

// Defina aqui a porta do seu projeto backend (projetoIntegrador_uc13)
const api = axios.create({
  baseURL: 'http://localhost:4000', // Modifique se o seu backend estiver em outra porta
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

export default api;
