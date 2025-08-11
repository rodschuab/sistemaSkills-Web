import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { estaAutenticado } from './utils/auth';
import Login from './components/Auth/Login';
import Cadastro from './components/Auth/Cadastro';
import Home from './components/Home/Home';
import './components/styles/global.css';
import styles from './App.module.css';

// Componente para proteger rotas que precisam de autenticação
const RotaProtegida = ({ children }) => {
  return estaAutenticado() ? children : <Navigate to="/" replace />;
};

// Componente para redirecionar usuários autenticados da página de login
const RotaPublica = ({ children }) => {
  return !estaAutenticado() ? children : <Navigate to="/home" replace />;
};

const App = () => {
  const [telaAtiva, setTelaAtiva] = useState('login'); // 'login' ou 'cadastro'

  const TelaAuth = () => {
    return (
      <div className={styles.authContainer}>
        {telaAtiva === 'login' ? (
          <Login aoMudarParaCadastro={() => setTelaAtiva('cadastro')} />
        ) : (
          <Cadastro aoVoltarParaLogin={() => setTelaAtiva('login')} />
        )}
      </div>
    );
  };

  return (
    <Router>
      <div className={styles.app}>
        <Routes>
          <Route 
            path="/" 
            element={
              <RotaPublica>
                <TelaAuth />
              </RotaPublica>
            } 
          />
          <Route 
            path="/home" 
            element={
              <RotaProtegida>
                <Home />
              </RotaProtegida>
            } 
          />
          {/* Rota catch-all - redireciona para home se autenticado, senão para login */}
          <Route 
            path="*" 
            element={
              estaAutenticado() ? (
                <Navigate to="/home" replace />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;