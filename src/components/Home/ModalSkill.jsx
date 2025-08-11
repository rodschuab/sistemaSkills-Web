import React, { useState, useEffect } from 'react';
import { skillService } from '../../service/api';
import styles from './ModalSkill.module.css';

const ModalSkill = ({ estaAberto, aoFechar, aoSalvar }) => {
  const [skills, setSkills] = useState([]);
  const [skillSelecionada, setSkillSelecionada] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (estaAberto) {
      carregarSkills();
    }
  }, [estaAberto]);

  const carregarSkills = async () => {
    setCarregando(true);
    setErro('');
    
    try {
      const response = await skillService.listar();
      setSkills(response.skills || response || []);
    } catch (error) {
      console.error('Erro ao carregar skills:', error);
      setErro('Erro ao carregar lista de skills');
    } finally {
      setCarregando(false);
    }
  };

  const handleSalvar = () => {
    if (!skillSelecionada) {
      setErro('Por favor, selecione uma skill');
      return;
    }

    const skill = skills.find(s => s.id === parseInt(skillSelecionada));
    if (skill) {
      aoSalvar(skill);
      handleCancelar();
    }
  };

  const handleCancelar = () => {
    setSkillSelecionada('');
    setErro('');
    aoFechar();
  };

  if (!estaAberto) {
    return null;
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3>Adicionar Skill</h3>
          <button 
            className={styles.closeButton}
            onClick={handleCancelar}
          >
            ×
          </button>
        </div>

        <div className={styles.modalBody}>
          {carregando ? (
            <div className={styles.loading}>Carregando skills...</div>
          ) : (
            <>
              <div className="form-group">
                <label htmlFor="skillSelect" className="form-label">
                  Selecione uma Skill:
                </label>
                <select
                  id="skillSelect"
                  className={`form-input ${styles.skillSelect}`}
                  value={skillSelecionada}
                  onChange={(e) => {
                    setSkillSelecionada(e.target.value);
                    setErro('');
                  }}
                >
                  <option value="">-- Escolha uma skill --</option>
                  {skills.map((skill) => (
                    <option key={skill.id} value={skill.id}>
                      {skill.nome} ({skill.versao})
                    </option>
                  ))}
                </select>
              </div>

              {skills.length === 0 && !carregando && (
                <div className={styles.noSkills}>
                  Nenhuma skill disponível para seleção.
                </div>
              )}

              {erro && (
                <div className="error-message">
                  {erro}
                </div>
              )}
            </>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button
            className="btn-primary"
            onClick={handleSalvar}
            disabled={carregando || !skillSelecionada}
          >
            Salvar
          </button>
          <button
            className="btn-secondary"
            onClick={handleCancelar}
            disabled={carregando}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalSkill;