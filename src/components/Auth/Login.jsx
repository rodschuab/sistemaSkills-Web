import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { authService } from '../../service/api';
import { salvarToken, salvarUsuario, obterToken, obterUsuario } from '../../utils/auth';
import { 
  salvarPreferenciaSenha, 
  obterPreferenciaSenha, 
  salvarSenha, 
  obterSenhaSalva,
  limparDadosSalvos 
} from '../../utils/storage';
import styles from './Login.module.css';

const Login = ({ aoMudarParaCadastro }) => {
  const [formData, setFormData] = useState({
    login: '',
    senha: ''
  });
  const [lembrarSenha, setLembrarSenha] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const lembrarPref = obterPreferenciaSenha();
    setLembrarSenha(lembrarPref);
    
    if (lembrarPref) {
      const senhaSalva = obterSenhaSalva();
      setFormData(prev => ({ ...prev, senha: senhaSalva }));
    }
  }, []);

  const alterarCampo = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (erro) setErro('');
  };

  const alterarLembrarSenha = (e) => {
    const novoValor = e.target.checked;
    setLembrarSenha(novoValor);
    salvarPreferenciaSenha(novoValor);
    
    if (!novoValor) {
      limparDadosSalvos();
    }
  };

  const submeterForm = async (e) => {
    e.preventDefault();
    
    console.log('🔍 Iniciando processo de login...');
    console.log('📝 Dados do formulário:', { login: formData.login, senha: '***' });
    
    if (!formData.login || !formData.senha) {
      setErro('Por favor, preencha todos os campos');
      return;
    }

    setCarregando(true);
    setErro('');

    try {
      console.log('🌐 Fazendo requisição para o servidor...');
      
      const resposta = await authService.login({
        login: formData.login,
        senha: formData.senha
      });

      console.log('✅ Resposta do servidor recebida:', resposta);
      console.log('🔑 Token recebido:', resposta.token ? 'SIM' : 'NÃO');
      
      // Verificar diferentes formatos de resposta do usuário
      let dadosUsuario = null;
      if (resposta.usuario) {
        dadosUsuario = resposta.usuario;
        console.log('👤 Usuário encontrado em resposta.usuario');
      } else if (resposta.user) {
        dadosUsuario = resposta.user;
        console.log('👤 Usuário encontrado em resposta.user');
      } else {
        // Se não tem campo específico, usar toda a resposta exceto o token
        dadosUsuario = { ...resposta };
        delete dadosUsuario.token;
        console.log('👤 Usando resposta completa como dados do usuário');
      }
      
      console.log('👤 Dados do usuário:', dadosUsuario);

      if (!resposta.token) {
        console.error('❌ Token não foi recebido na resposta');
        setErro('Erro: Token não recebido do servidor');
        return;
      }

      if (!dadosUsuario || (!dadosUsuario.id && !dadosUsuario.userId && !dadosUsuario.usuarioId)) {
        console.error('❌ Dados do usuário não foram recebidos na resposta');
        setErro('Erro: Dados do usuário não recebidos do servidor');
        return;
      }

      // Normalizar o campo id se vier como usuarioId
      if (dadosUsuario.usuarioId && !dadosUsuario.id) {
        dadosUsuario.id = dadosUsuario.usuarioId;
        console.log('🔄 Normalizando usuarioId para id:', dadosUsuario.id);
      }

      // Salvar token e dados do usuário
      console.log('💾 Salvando token...');
      salvarToken(resposta.token);
      
      console.log('💾 Salvando usuário...');
      salvarUsuario(dadosUsuario);

      // Verificar se os dados foram salvos corretamente
      const tokenSalvo = obterToken();
      const usuarioSalvo = obterUsuario();
      
      console.log('🔍 Verificando dados salvos:');
      console.log('Token salvo:', tokenSalvo ? 'SIM' : 'NÃO');
      console.log('Usuário salvo:', usuarioSalvo ? 'SIM' : 'NÃO');
      console.log('ID do usuário:', usuarioSalvo?.id ? usuarioSalvo.id : 'NÃO ENCONTRADO');

      if (!tokenSalvo) {
        console.error('❌ Erro: Token não foi salvo corretamente');
        setErro('Erro ao salvar dados de login');
        return;
      }

      if (!usuarioSalvo || !usuarioSalvo.id) {
        console.error('❌ Erro: Usuário não foi salvo corretamente');
        setErro('Erro ao salvar dados do usuário');
        return;
      }

      // Salvar senha se o usuário escolheu lembrar
      if (lembrarSenha) {
        console.log('💾 Salvando senha...');
        salvarSenha(formData.senha);
      }

      console.log('🚀 Redirecionando para /home...');
      
      // Tentar diferentes métodos de redirecionamento
      try {
        navigate('/home', { replace: true });
        console.log('✅ navigate() executado');
      } catch (navError) {
        console.error('❌ Erro no navigate:', navError);
        console.log('🔄 Tentando window.location...');
        window.location.href = '/home';
      }

    } catch (error) {
      console.error('❌ Erro no login:', error);
      console.error('Detalhes do erro:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });

      if (error.response?.data?.message) {
        setErro(error.response.data.message);
      } else if (error.response?.status === 401) {
        setErro('Login ou senha incorretos');
      } else if (error.response?.status === 500) {
        setErro('Erro interno do servidor. Tente novamente.');
      } else if (error.message?.includes('Network Error')) {
        setErro('Erro de conexão. Verifique se o servidor está rodando.');
      } else {
        setErro('Erro ao fazer login. Verifique suas credenciais.');
      }
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <form className={styles.loginForm} onSubmit={submeterForm}>
        <h2 className={styles.titulo}>Login</h2>
        
        <div className="form-group">
          <label htmlFor="login" className="form-label">
            Login
          </label>
          <input
            type="text"
            id="login"
            name="login"
            className="form-input"
            value={formData.login}
            onChange={alterarCampo}
            disabled={carregando}
          />
        </div>

        <div className="form-group">
          <label htmlFor="senha" className="form-label">
            Senha
          </label>
          <div className={styles.senhaContainer}>
            <input
              type={mostrarSenha ? "text" : "password"}
              id="senha"
              name="senha"
              className="form-input"
              value={formData.senha}
              onChange={alterarCampo}
              disabled={carregando}
            />
            <button
              type="button"
              className={styles.botaoMostrarSenha}
              onClick={() => setMostrarSenha(!mostrarSenha)}
              disabled={carregando}
            >
              {mostrarSenha ? <FaEye/> : <FaEyeSlash/>}
            </button>
          </div>
        </div>

        <div className={styles.checkboxContainer}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={lembrarSenha}
              onChange={alterarLembrarSenha}
              disabled={carregando}
            />
            <span className={styles.checkboxText}>Gravar Senha</span>
          </label>
        </div>

        {erro && (
          <div className="error-message">
            {erro}
          </div>
        )}

        <button
          type="submit"
          className={`btn-primary ${styles.botaoEntrar}`}
          disabled={carregando}
        >
          {carregando ? 'Entrando...' : 'Entrar'}
        </button>

        <button
          type="button"
          className={`btn-secondary ${styles.botaoCadastro}`}
          onClick={aoMudarParaCadastro}
          disabled={carregando}
        >
          Cadastrar-se
        </button>
      </form>
    </div>
  );
};

export default Login;