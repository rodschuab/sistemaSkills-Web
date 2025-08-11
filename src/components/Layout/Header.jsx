import React from 'react';
import { useNavigate } from 'react-router-dom';
import { removerToken, obterUsuario } from '../../utils/auth';
import styles from './Header.module.css';

const Header = () => {
  const navigate = useNavigate();
  const usuario = obterUsuario();

  const fazerLogout = () => {
    removerToken();
    navigate('/');
  };

  return (
    <header className={styles.header}>
      <div className={`container ${styles.headerContent}`}>
        <div className={styles.logo}>
          <h1>Skills Manager</h1>
        </div>
        
        <div className={styles.userInfo}>
          <span className={styles.welcome}>
            Bem-vindo, {usuario?.nome || usuario?.login || 'Usuário'}!
          </span>
          <button 
            className={`btn-danger ${styles.logoutBtn}`}
            onClick={fazerLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;