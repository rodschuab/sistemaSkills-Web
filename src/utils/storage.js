// Utilitários para localStorage relacionados às preferências do usuário
export const salvarPreferenciaSenha = (lembrar) => {
  if (lembrar) {
    localStorage.setItem('lembrar_senha', 'true');
  } else {
    localStorage.removeItem('lembrar_senha');
    localStorage.removeItem('senha_salva');
  }
};

export const obterPreferenciaSenha = () => {
  return localStorage.getItem('lembrar_senha') === 'true';
};

export const salvarSenha = (senha) => {
  if (obterPreferenciaSenha()) {
    localStorage.setItem('senha_salva', senha);
  }
};

export const obterSenhaSalva = () => {
  return localStorage.getItem('senha_salva') || '';
};

export const limparDadosSalvos = () => {
  localStorage.removeItem('lembrar_senha');
  localStorage.removeItem('senha_salva');
};