import axios from 'axios';
import { obterToken, removerToken } from '../utils/auth';

const API_BASE_URL = 'http://localhost:8080'; 

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = obterToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removerToken();
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (dadosLogin) => {
    const response = await api.post('/auth/login', dadosLogin);
    return response.data;
  },

  cadastro: async (dadosCadastro) => {
    const response = await api.post('/auth/cadastro', dadosCadastro);
    return response.data;
  }
};

export const skillService = {
  listar: async () => {
    const response = await api.get('/skills/listar');
    return response.data;
  },

  cadastrar: async (dadosSkill) => {
    const response = await api.post('/skills/cadastrar', dadosSkill);
    return response.data;
  },

  excluir: async (skillId) => {
    const response = await api.delete(`/skills/excluir/${skillId}`);
    return response.data;
  }
};

// Usuario-Skills
export const usuarioSkillService = {
  listar: async (usuarioId) => {
    const response = await api.get(`/usuario-skills/listar/${usuarioId}`);
    return response.data;
  },

  atualizar: async (usuarioId, dadosAtualizacao) => {
    const response = await api.put(`/usuario-skills/atualizar/${usuarioId}`, dadosAtualizacao);
    return response.data;
  },

  associar: async (usuarioId, skillData) => {
    const response = await api.post(`/usuario-skills/associar/${usuarioId}`, skillData);
    return response.data;
  },

  excluir: async (usuarioId, skillId) => {
    const response = await api.delete(`/usuario-skills/excluir/${usuarioId}/${skillId}`);
    return response.data;
  }
};

export default api;