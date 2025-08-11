import React, { useState, useEffect } from 'react';
import { usuarioSkillService } from '../../service/api';
import { obterUsuario } from '../../utils/auth';
import Header from '../Layout/Header';
import ModalSkill from './ModalSkill';
import styles from './Home.module.css';
import { FaRegSave } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import pythonImg from '../../assets/image/python.png';
import javascriptImg from '../../assets/image/javascript.png';
import javaImg from '../../assets/image/java.png';
import reactImg from '../../assets/image/react.png';
import nodeImg from '../../assets/image/node.png';


const SKILL_IMAGES = {
  'Java': javaImg,
  'JavaScript': javascriptImg,
  'Node.js': nodeImg,
  'Python': pythonImg,
  'React': reactImg,
};


const obterImagemSkill = (skill) => {
  console.log('🔍 === DEBUG ===');
  console.log('skill recebida:', skill);
  console.log('skill?.nome:', skill?.nome);
  console.log('skill?.skillNome:', skill?.skillNome);
  console.log('=================');
  
  const nomeSkill = skill?.nome || skill?.skillNome;
  console.log('🎯 Nome final extraído:', nomeSkill);
  
  if (nomeSkill && SKILL_IMAGES[nomeSkill]) {
    console.log('✅ Encontrou:', SKILL_IMAGES[nomeSkill]);
    return SKILL_IMAGES[nomeSkill];
  }
  
  console.log('⚠️ Não encontrou imagem para:', nomeSkill);
  return null;
};


const SkillImage = ({ skill, className }) => {
  const imagemEscolhida = obterImagemSkill(skill);
  const nomeSkill = skill?.nome || 'Skill';
  

  if (!imagemEscolhida) {
    return (
      <div 
        className={className}
        style={{
          width: '48px',
          height: '48px',
          backgroundColor: '#6B7280',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '8px',
          fontSize: '20px',
          fontWeight: 'bold'
        }}
      >
        {nomeSkill.charAt(0).toUpperCase()}
      </div>
    );
  }

  
  return (
    <img 
      src={imagemEscolhida}
      alt={nomeSkill}
      className={className}
      style={{
        width: '48px',
        height: '48px',
        objectFit: 'contain'
      }}
      onError={(e) => {
        console.log(`❌ Erro ao carregar: ${imagemEscolhida}`);
        e.target.outerHTML = `
          <div style="
            width: 48px; 
            height: 48px; 
            background-color: #EF4444; 
            color: white; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            border-radius: 8px; 
            font-size: 20px; 
            font-weight: bold;
          ">
            ${nomeSkill.charAt(0).toUpperCase()}
          </div>
        `;
      }}
    />
  );
};

const Home = () => {
  const [minhasSkills, setMinhasSkills] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [salvandoNivel, setSalvandoNivel] = useState({});

  const usuario = obterUsuario();

  useEffect(() => {
    if (usuario && typeof usuario === 'object' && usuario.id) {
      carregarMinhasSkills();
    } else {
      setCarregando(false);
      setErro('Usuário não encontrado. Faça login novamente.');
    }
  }, []); 

  const carregarMinhasSkills = async () => {
    if (carregando && minhasSkills.length > 0) return;
    
    setCarregando(true);
    setErro('');

    try {
      if (!usuario || !usuario.id) {
        throw new Error('ID do usuário não encontrado');
      }

      console.log('🔍 Carregando skills do usuário:', usuario.id);
      const response = await usuarioSkillService.listar(usuario.id);
      console.log('📦 Resposta recebida:', response);
      
      if (response && Array.isArray(response)) {
        setMinhasSkills(response);
        console.log('✅ Skills carregadas:', response.length);
      } else if (response && Array.isArray(response.skills)) {
        setMinhasSkills(response.skills);
        console.log('✅ Skills carregadas:', response.skills.length);
      } else {
        console.warn('⚠️ Formato de resposta inesperado:', response);
        setMinhasSkills([]);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar skills do usuário:', error);
      
      if (error.message && error.message.includes('JSON')) {
        setErro('Erro ao processar dados do servidor. Tente novamente.');
      } else if (error.response?.status === 404) {
        console.log('ℹ️ Usuário ainda não possui skills');
        setMinhasSkills([]);
        setErro(''); 
      } else if (error.response?.status === 401) {
        setErro('Sessão expirada. Faça login novamente.');
        setTimeout(() => fazerLogout(), 2000);
      } else if (error.response) {
        setErro(error.response.data?.message || 'Erro ao carregar suas skills');
      } else if (error.request) {
        setErro('Erro de conexão. Verifique sua internet.');
      } else {
        setErro(error.message || 'Erro ao carregar suas skills');
      }
    } finally {
      setCarregando(false);
    }
  };

  const adicionarSkill = async (skill) => {
    if (!skill || !skill.id) {
      alert('Skill inválida');
      return;
    }

    setSalvando(true);
    try {
      console.log('🚀 Associando skill:', {
        usuarioId: usuario.id,
        skillId: skill.id,
        nivel: 1
      });

      await usuarioSkillService.associar(usuario.id, {
        skillId: skill.id,
        nivel: 1
      });
      
      await carregarMinhasSkills();
      setModalAberto(false);
    } catch (error) {
      console.error('Erro ao adicionar skill:', error);
      
      let mensagemErro = 'Erro ao adicionar skill';
      
      if (error.response?.data?.message) {
        mensagemErro = error.response.data.message;
      } else if (error.message && error.message.includes('JSON')) {
        mensagemErro = 'Erro ao processar resposta do servidor';
      } else if (error.message) {
        mensagemErro = error.message;
      }
      
      alert(`Erro: ${mensagemErro}`);
    } finally {
      setSalvando(false);
    }
  };

  const removerSkill = async (skillId) => {
    if (!skillId) {
      alert('ID da skill inválido');
      return;
    }

    if (!window.confirm('Tem certeza que deseja remover esta skill?')) {
      return;
    }

    try {
      await usuarioSkillService.excluir(usuario.id, skillId);
      await carregarMinhasSkills();
    } catch (error) {
      console.error('Erro ao remover skill:', error);
      
      let mensagemErro = 'Erro ao remover skill';
      
      if (error.response?.data?.message) {
        mensagemErro = error.response.data.message;
      } else if (error.message && error.message.includes('JSON')) {
        mensagemErro = 'Erro ao processar resposta do servidor';
      } else if (error.message) {
        mensagemErro = error.message;
      }
      
      alert(`Erro: ${mensagemErro}`);
    }
  };

  const salvarNivel = async (skillId, nivel) => {
    if (!skillId || !nivel) {
      alert('Dados inválidos para salvar nível');
      return;
    }

    setSalvandoNivel(prev => ({ ...prev, [skillId]: true }));

    try {
      console.log('💾 Salvando nível:', {
        usuarioId: usuario.id,
        skillId: skillId,
        nivel: parseInt(nivel)
      });

      await usuarioSkillService.atualizar(usuario.id, {
        skillId: skillId,
        nivel: parseInt(nivel)
      });
      
      setMinhasSkills(prev => 
        prev.map(skill => 
          skill.skillId === skillId 
            ? { ...skill, nivel: parseInt(nivel) }
            : skill
        )
      );

      alert('Nível atualizado com sucesso!');
      
    } catch (error) {
      console.error('Erro ao salvar nível:', error);
      
      let mensagemErro = 'Erro ao salvar nível';
      
      if (error.response?.data?.message) {
        mensagemErro = error.response.data.message;
      } else if (error.message && error.message.includes('JSON')) {
        mensagemErro = 'Erro ao processar resposta do servidor';
      } else if (error.message) {
        mensagemErro = error.message;
      }
      
      alert(`Erro: ${mensagemErro}`);
    } finally {
      setSalvandoNivel(prev => ({ ...prev, [skillId]: false }));
    }
  };

  const alterarNivelLocal = (skillId, novoNivel) => {
    setMinhasSkills(prev => 
      prev.map(skill => 
        skill.skillId === skillId 
          ? { ...skill, nivel: parseInt(novoNivel) }
          : skill
      )
    );
  };

  if (!usuario || typeof usuario !== 'object' || !usuario.id) {
    return (
      <div className={styles.homeContainer}>
        <Header />
        <main className={`container ${styles.mainContent}`}>
          <div className={styles.erro}>
            <p>Usuário não encontrado. Faça login novamente.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.homeContainer}>
      <Header />
      
      <main className={`container ${styles.mainContent}`}>
        <div className={styles.pageHeader}>
          <h2>Minhas Skills</h2>
          <button
            className={`btn-primary ${styles.adicionarBtn}`}
            onClick={() => setModalAberto(true)}
            disabled={salvando}
          >
            {salvando ? 'Salvando...' : 'Adicionar Skill'}
          </button>
        </div>

        {carregando ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Carregando suas skills...</p>
          </div>
        ) : erro ? (
          <div className={styles.erro}>
            <p>{erro}</p>
            <button 
              className="btn-primary"
              onClick={carregarMinhasSkills}
            >
              Tentar Novamente
            </button>
          </div>
        ) : !Array.isArray(minhasSkills) ? (
          <div className={styles.erro}>
            <p>Erro no formato dos dados. Recarregue a página.</p>
            <button 
              className="btn-primary"
              onClick={() => window.location.reload()}
            >
              Recarregar Página
            </button>
          </div>
        ) : minhasSkills.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🎯</div>
            <h3>Você ainda não possui skills!</h3>
            <p>Clique no botão "Adicionar Skill" para começar a construir seu perfil.</p>
          </div>
        ) : (
          <div className={styles.skillsList}>
            {minhasSkills.map((userSkill) => {
              if (!userSkill || typeof userSkill !== 'object') {
                return null;
              }

              const isSalvandoEstaSkill = salvandoNivel[userSkill.skillId];
              
             
              const nomeSkill = userSkill.skillNome || 'Skill Desconhecida';
              const descricaoSkill = userSkill.skillDescricao || 'Sem descrição disponível';

              return (
                <div key={userSkill.skillId || Math.random()} className={styles.skillCard}>
                  <div className={styles.skillInfo}>
                    <div className={styles.skillHeader}>
                      <div className={styles.skillImage}>
                        <SkillImage 
                          skill={{ nome: nomeSkill }} 
                          className={styles.skillIcon}
                        />
                      </div>
                      <div className={styles.skillDetails}>
                        <h3>{nomeSkill}</h3>
                      
                        <p className={styles.skillDescription}>
                          {descricaoSkill}
                        </p>
                      </div>
                    </div>
                    
                    <div className={styles.skillActions}>
                      <div className={styles.levelContainer}>
                        <label htmlFor={`nivel-${userSkill.skillId}`}>Nível:</label>
                        <select
                          id={`nivel-${userSkill.skillId}`}
                          value={userSkill.nivel || 1}
                          onChange={(e) => alterarNivelLocal(userSkill.skillId, e.target.value)}
                          className={styles.levelSelect}
                          disabled={isSalvandoEstaSkill}
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(nivel => (
                            <option key={nivel} value={nivel}>
                              {nivel}
                            </option>
                          ))}
                        </select>
                        
                        <button
                          className={`btn-success ${styles.salvarNivelBtn}`}
                          onClick={() => salvarNivel(userSkill.skillId, userSkill.nivel)}
                          disabled={isSalvandoEstaSkill || !userSkill.skillId}
                          title="Salvar nível"
                        >
                          {isSalvandoEstaSkill ? <FaRegSave /> : <FaRegSave />}
                        </button>
                      </div>
                      
                      <button
                        className={`btn-danger ${styles.removerBtn}`}
                        onClick={() => removerSkill(userSkill.skillId)}
                        title="Remover skill"
                        disabled={!userSkill.skillId}
                      >
                        <MdDelete />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <ModalSkill
        estaAberto={modalAberto}
        aoFechar={() => setModalAberto(false)}
        aoSalvar={adicionarSkill}
      />
    </div>
  );
};

export default Home;