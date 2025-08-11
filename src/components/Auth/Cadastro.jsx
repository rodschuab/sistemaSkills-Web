import React, { useState } from 'react';
import { authService } from '../../service/api';
import styles from './Cadastro.module.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Cadastro = ({ aoVoltarParaLogin }) => {
  const [formData, setFormData] = useState({
    login: '',
    senha: '',
    confirmarSenha: ''
  });
  const [mostrarSenhas, setMostrarSenhas] = useState({
    senha: false,
    confirmarSenha: false
  });
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  const alterarCampo = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpar mensagens ao digitar
    if (erro) setErro('');
    if (sucesso) setSucesso('');
  };

  const alterarVisibilidadeSenha = (campo) => {
    setMostrarSenhas(prev => ({
      ...prev,
      [campo]: !prev[campo]
    }));
  };

  const validarFormulario = () => {
    if (!formData.login || !formData.senha || !formData.confirmarSenha) {
      setErro('Por favor, preencha todos os campos');
      return false;
    }

    if (formData.senha !== formData.confirmarSenha) {
      setErro('As senhas não coincidem');
      return false;
    }

    if (formData.senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres');
      return false;
    }

    return true;
  };

  const submeterForm = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }

    setCarregando(true);
    setErro('');
    setSucesso('');

    try {
      await authService.cadastro({
        login: formData.login,
        senha: formData.senha
      });

      setSucesso('Cadastro realizado com sucesso! Redirecionando para login...');
      
      // espear 2 segundos e voltar para login
      setTimeout(() => {
        aoVoltarParaLogin();
      }, 2000);

    } catch (error) {
      console.error('Erro no cadastro:', error);
      if (error.response?.data?.message) {
        setErro(error.response.data.message);
      } else if (error.response?.status === 409) {
        setErro('Este login já está em uso. Escolha outro.');
      } else {
        setErro('Erro ao realizar cadastro. Tente novamente.');
      }
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className={styles.cadastroContainer}>
      <form className={styles.cadastroForm} onSubmit={submeterForm}>
        <h2 className={styles.titulo}>Cadastrar-se</h2>
        
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
            placeholder="Digite seu login"
          />
        </div>

        <div className="form-group">
          <label htmlFor="senha" className="form-label">
            Senha
          </label>
          <div className={styles.senhaContainer}>
            <input
              type={mostrarSenhas.senha ? "text" : "password"}
              id="senha"
              name="senha"
              className="form-input"
              value={formData.senha}
              onChange={alterarCampo}
              disabled={carregando}
              placeholder="Digite sua senha"
            />
            <button
              type="button"
              className={styles.botaoMostrarSenha}
              onClick={() => alterarVisibilidadeSenha('senha')}
              disabled={carregando}
            >
              {mostrarSenhas.senha ? <FaEye/> : <FaEyeSlash/>}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="confirmarSenha" className="form-label">
            Confirmar Senha
          </label>
          <div className={styles.senhaContainer}>
            <input
              type={mostrarSenhas.confirmarSenha ? "text" : "password"}
              id="confirmarSenha"
              name="confirmarSenha"
              className="form-input"
              value={formData.confirmarSenha}
              onChange={alterarCampo}
              disabled={carregando}
              placeholder="Confirme sua senha"
            />
            <button
              type="button"
              className={styles.botaoMostrarSenha}
              onClick={() => alterarVisibilidadeSenha('confirmarSenha')}
              disabled={carregando}
            >
              {mostrarSenhas.confirmarSenha ? <FaEye/> : <FaEyeSlash/>}
            </button>
          </div>
        </div>

        {erro && (
          <div className="error-message">
            {erro}
          </div>
        )}

        {sucesso && (
          <div className="success-message">
            {sucesso}
          </div>
        )}

        <button
          type="submit"
          className={`btn-primary ${styles.botaoSalvar}`}
          disabled={carregando}
        >
          {carregando ? 'Cadastrando...' : 'Salvar'}
        </button>

        <button
          type="button"
          className={`btn-secondary ${styles.botaoCancelar}`}
          onClick={aoVoltarParaLogin}
          disabled={carregando}
        >
          Cancelar
        </button>
      </form>
    </div>
  );
};

export default Cadastro;