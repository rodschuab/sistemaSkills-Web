const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

export const salvarToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

export const obterToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const removerToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const salvarUsuario = (usuario) => {
  if (usuario) {
    localStorage.setItem(USER_KEY, JSON.stringify(usuario));
  }
};

export const obterUsuario = () => {
  try {
    const usuario = localStorage.getItem(USER_KEY);
    if (usuario && usuario !== 'undefined' && usuario !== 'null') {
      return JSON.parse(usuario);
    }
    return null;
  } catch (error) {
    console.error('Erro ao obter usuário:', error);
    // Se der erro, limpar os dados corrompidos
    localStorage.removeItem(USER_KEY);
    return null;
  }
};

export const estaAutenticado = () => {
  const token = obterToken();
  const usuario = obterUsuario();
  return token && usuario && usuario.id;
};