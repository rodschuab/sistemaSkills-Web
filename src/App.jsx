import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { estaAutenticado } from './utils/auth';
import Login from './components/Auth/Login';
import Cadastro from './components/Auth/Cadastro';
import Home from './components/Home/Home';
import './components/styles/global.css';
import styles from './App.module.css';

const RotaProtegida = ({ children }) => {
  return estaAutenticado() ? children : <Navigate to="/" replace />;
};

const RotaPublica = ({ children }) => {
  return !estaAutenticado() ? children : <Navigate to="/home" replace />;
};

const App = () => {
  const [telaAtiva, setTelaAtiva] = useState('login'); 

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
          {/* Rota catch-all - redireciona para home se autenticado, senao paro login */}
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