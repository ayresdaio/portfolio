/**
 * =====================================================================
 * PÁGINA DE LOGIN ADMINISTRATIVO DO PORTFÓLIO (Chave de Segurança Integrada)
 * =====================================================================
 * Rota: /admin/login/
 * Acesso: Público
 * 
 * Fornece um formulário de login premium com validação em tempo real,
 * proteção contra ataques e validação em dois passos: palavra-passe e chave 
 * de segurança. Se o utilizador se esquecer da chave de segurança, pode 
 * redefini-la fornecendo a senha atual de administração.
 */

import React, { useState, useEffect } from 'react';
import { LogIn, Key, Mail, AlertCircle, CheckCircle2, Lock, Shield, X } from 'lucide-react';

export default function AdminLoginPage() {
  // Configurar tema escuro persistente ao entrar no login
  useEffect(() => {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }, []);

  // 1. Estados do formulário de login principal
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [securityKey, setSecurityKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; msg: string }>({ type: null, msg: '' });

  // 2. Estados para o modal de redefinição da chave de segurança
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [newSecurityKey, setNewSecurityKey] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetStatus, setResetStatus] = useState<{ type: 'success' | 'error' | null; msg: string }>({ type: null, msg: '' });

  /**
   * Processa a submissão do login administrativo principal.
   * Envia as credenciais e a chave de segurança para validação da API.
   *
   * @param {React.FormEvent} e Evento de submissão do formulário.
   */
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, msg: '' });

    try {
      const res = await fetch('/backend/api/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrEmail, password, securityKey })
      });

      const data = await res.json();

      if (data.success) {
        setStatus({ type: 'success', msg: data.message });
        // Redirecionar para o dashboard após autenticação bem-sucedida
        setTimeout(() => {
          window.location.href = '/admin/dashboard/';
        }, 1200);
      } else {
        setStatus({ type: 'error', msg: data.message || 'Falha na autenticação.' });
      }
    } catch (err) {
      setStatus({ type: 'error', msg: 'Erro ao ligar ao servidor de segurança. Verifique a sua conexão.' });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Processa a redefinição/alteração da chave de segurança em caso de esquecimento.
   * Valida a password atual e atualiza a chave na base de dados.
   *
   * @param {React.FormEvent} e Evento de submissão do formulário.
   */
  const handleResetSecurityKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetStatus({ type: null, msg: '' });

    try {
      const res = await fetch('/backend/api/update_security_key.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail, password: resetPassword, newSecurityKey })
      });

      const data = await res.json();

      if (data.success) {
        setResetStatus({ type: 'success', msg: data.message });
        setResetEmail('');
        setResetPassword('');
        setNewSecurityKey('');
        // Fechar o modal automaticamente após o sucesso
        setTimeout(() => {
          setShowResetModal(false);
          setResetStatus({ type: null, msg: '' });
        }, 2500);
      } else {
        setResetStatus({ type: 'error', msg: data.message || 'Erro ao atualizar a chave.' });
      }
    } catch (err) {
      setResetStatus({ type: 'error', msg: 'Erro ao ligar ao servidor. Verifique a conexão.' });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-darkBg flex items-center justify-center px-4 relative overflow-hidden font-sans">
      {/* Elementos de decoração luminosos de fundo */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brandBlue/5 rounded-full blur-3xl pointer-events-none select-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brandBlue/5 rounded-full blur-3xl pointer-events-none select-none"></div>

      <div className="max-w-md w-full relative z-10">
        {/* Logótipo / Nome */}
        <div className="text-center mb-8 space-y-2">
          <a href="/" className="text-sm font-semibold tracking-wider text-textSecondary hover:text-textPrimary transition-colors">
            ← Voltar ao Portfólio
          </a>
          <h1 className="text-3xl font-extrabold tracking-tight text-textPrimary flex items-center justify-center space-x-3">
            <Lock className="text-brandBlue" size={28} />
            <span className="text-gradient">Painel de Acesso</span>
          </h1>
          <p className="text-sm text-textSecondary">Autenticação de administrador protegida</p>
        </div>

        {/* Painel do Formulário Glassmorphism */}
        <form onSubmit={handleLoginSubmit} className="glass-panel p-8 space-y-5 rounded-3xl">
          <h2 className="text-lg font-bold text-textPrimary border-b border-darkBorder pb-3">Iniciar Sessão</h2>

          {/* Feedback de Estado */}
          {status.type && (
            <div className={`p-4 rounded-xl flex items-start space-x-3 text-sm ${
              status.type === 'success' 
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
            }`}>
              {status.type === 'success' ? <CheckCircle2 size={18} className="mt-0.5 shrink-0" /> : <AlertCircle size={18} className="mt-0.5 shrink-0" />}
              <span>{status.msg}</span>
            </div>
          )}

          {/* Campo utilizador/email */}
          <div className="space-y-2">
            <label htmlFor="username" className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Utilizador ou E-mail</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-textSecondary" size={18} />
              <input 
                id="username"
                type="text" 
                required
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                placeholder="Insira o seu utilizador ou email"
                className="w-full bg-darkBg border border-darkBorder rounded-xl pl-12 pr-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
              />
            </div>
          </div>

          {/* Campo Password */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Palavra-passe</label>
              <a href="/admin/forgot/" className="text-xs text-brandBlue hover:text-textPrimary transition-colors">
                Esqueceu-se da senha?
              </a>
            </div>
            <div className="relative">
              <Key className="absolute left-4 top-3.5 text-textSecondary" size={18} />
              <input 
                id="password"
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-darkBg border border-darkBorder rounded-xl pl-12 pr-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
              />
            </div>
          </div>

          {/* Campo Chave de Segurança (MFA) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="securityKey" className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Chave de Segurança</label>
              <button
                type="button"
                onClick={() => {
                  setResetStatus({ type: null, msg: '' });
                  setShowResetModal(true);
                }}
                className="text-xs text-brandBlue hover:text-textPrimary transition-colors cursor-pointer outline-none bg-transparent border-none"
              >
                Esqueceu-se da chave?
              </button>
            </div>
            <div className="relative">
              <Shield className="absolute left-4 top-3.5 text-textSecondary" size={18} />
              <input 
                id="securityKey"
                type="password" 
                required
                value={securityKey}
                onChange={(e) => setSecurityKey(e.target.value)}
                placeholder="Insira a sua chave de 2º passo"
                className="w-full bg-darkBg border border-darkBorder rounded-xl pl-12 pr-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
              />
            </div>
          </div>

          {/* Botão de Submissão */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 mt-2 bg-brandBlue hover:bg-brandBlue/90 disabled:bg-brandBlue/60 text-textPrimary font-semibold rounded-xl flex items-center justify-center space-x-2 transition-all hover:shadow-lg hover:shadow-brandBlue/10 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>A autenticar...</span>
              </>
            ) : (
              <>
                <LogIn size={16} />
                <span>Entrar no Painel</span>
              </>
            )}
          </button>
        </form>

        <p className="text-center mt-6 text-xs text-textSecondary">
          Esta zona é de acesso restrito. Todas as tentativas não autorizadas são registadas.
        </p>
      </div>

      {/* =====================================================================
          MODAL DE RECUPERAÇÃO DA CHAVE DE SEGURANÇA (OLED Glassmorphism)
          ===================================================================== */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="glass-panel max-w-md w-full p-8 bg-zinc-950/90 border border-brandBlue/20 shadow-2xl space-y-6 animate-slide-up rounded-3xl relative">
            
            {/* Botão de fechar modal */}
            <button
              onClick={() => setShowResetModal(false)}
              className="absolute top-4 right-4 text-textSecondary hover:text-textPrimary transition-colors"
              title="Fechar"
            >
              <X size={20} />
            </button>

            <div className="flex items-center space-x-3 border-b border-darkBorder pb-4">
              <div className="w-10 h-10 rounded-xl bg-brandBlue/10 border border-brandBlue/20 flex items-center justify-center text-brandBlue">
                <Shield size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-textPrimary uppercase tracking-wide">Recuperar Chave</h3>
                <p className="text-xs text-textSecondary">Redefina a sua chave de segurança usando a senha atual.</p>
              </div>
            </div>

            {/* Feedback no Modal */}
            {resetStatus.type && (
              <div className={`p-4 rounded-xl flex items-start space-x-3 text-sm ${
                resetStatus.type === 'success' 
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                  : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
              }`}>
                {resetStatus.type === 'success' ? <CheckCircle2 size={18} className="mt-0.5 shrink-0" /> : <AlertCircle size={18} className="mt-0.5 shrink-0" />}
                <span>{resetStatus.msg}</span>
              </div>
            )}

            <form onSubmit={handleResetSecurityKeySubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">O seu E-mail</label>
                <input
                  id="resetEmail"
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="exemplo@dominio.com"
                  className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Palavra-passe Atual (Senha)</label>
                <input
                  id="resetPassword"
                  type="password"
                  required
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary">Nova Chave de Segurança</label>
                <input
                  id="newSecurityKey"
                  type="password"
                  required
                  value={newSecurityKey}
                  onChange={(e) => setNewSecurityKey(e.target.value)}
                  placeholder="Nova chave de 2º passo"
                  className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-textPrimary transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={resetLoading}
                className="w-full py-3 bg-brandBlue hover:bg-brandBlue/90 disabled:bg-brandBlue/60 text-textPrimary font-semibold rounded-xl flex items-center justify-center space-x-2 transition-all"
              >
                {resetLoading ? 'A processar...' : 'Redefinir Chave de Segurança'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
