

/**
 * =====================================================================
 * FORMULÁRIO DE REDEFINIÇÃO DE PALAVRA-PASSE COM TOKEN DO EMAIL
 * =====================================================================
 * Rota: /admin/reset/
 * Acesso: Público (Exige token na URL)
 * Lê o token a partir da barra de endereços, permite introduzir a nova
 * palavra-passe com dupla validação e submete de forma segura ao PHP.
 */

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Key, Save, AlertCircle, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

function ResetPasswordForm() {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; msg: string }>({ type: null, msg: '' });

  // Capturar o token a partir dos parâmetros de pesquisa da URL no cliente
  useEffect(() => {
    const t = searchParams.get('token');
    if (t) {
      setToken(t);
    } else {
      setStatus({ 
        type: 'error', 
        msg: 'Token de recuperação em falta na URL. Por favor, utilize o link recebido no seu e-mail.' 
      });
    }
  }, [searchParams]);

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setStatus({ type: 'error', msg: 'Não é possível redefinir. Token inválido.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatus({ type: 'error', msg: 'As palavras-passe introduzidas não coincidem.' });
      return;
    }

    if (newPassword.length < 8) {
      setStatus({ type: 'error', msg: 'A palavra-passe deve conter pelo menos 8 caracteres.' });
      return;
    }

    setLoading(true);
    setStatus({ type: null, msg: '' });

    try {
      const res = await fetch('/backend/api/reset_password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword, confirmPassword })
      });

      const data = await res.json();
      if (data.success) {
        setStatus({ type: 'success', msg: data.message });
        // Limpar campos
        setNewPassword('');
        setConfirmPassword('');
        // Redirecionar para o login após 2 segundos
        setTimeout(() => {
          window.location.href = '/admin/login/';
        }, 2200);
      } else {
        setStatus({ type: 'error', msg: data.message || 'Falha ao redefinir a palavra-passe.' });
      }
    } catch (err) {
      setStatus({ type: 'error', msg: 'Erro técnico ao conectar ao servidor. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleResetSubmit} className="glass-panel p-8 space-y-6">
      <h2 className="text-lg font-bold text-white border-b border-darkBorder pb-3">Redefinir Palavra-passe</h2>
      
      {/* Feedback de Estado */}
      {status.type && (
        <div className={`p-4 rounded-xl flex items-start space-x-3 text-sm ${
          status.type === 'success' 
            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
            : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
        }`}>
          {status.type === 'success' ? <CheckCircle2 size={18} className="mt-0.5 shrink-0" /> : <AlertCircle size={18} className="mt-0.5 shrink-0" />}
          <span className="leading-relaxed">{status.msg}</span>
        </div>
      )}

      {/* Só mostra os campos se houver um token válido e não tiver ocorrido sucesso de redefinição */}
      {token && status.type !== 'success' && (
        <>
          {/* Nova Senha */}
          <div className="space-y-2">
            <label htmlFor="new-password" className="text-xs font-semibold uppercase tracking-wider text-slate-400">Nova Palavra-passe</label>
            <div className="relative">
              <Key className="absolute left-4 top-3.5 text-slate-500" size={18} />
              <input 
                id="new-password"
                type="password" 
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className="w-full bg-darkBg border border-darkBorder rounded-xl pl-12 pr-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-white transition-all"
              />
            </div>
          </div>

          {/* Confirmar Senha */}
          <div className="space-y-2">
            <label htmlFor="confirm-password" className="text-xs font-semibold uppercase tracking-wider text-slate-400">Confirmar Nova Palavra-passe</label>
            <div className="relative">
              <Key className="absolute left-4 top-3.5 text-slate-500" size={18} />
              <input 
                id="confirm-password"
                type="password" 
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a palavra-passe"
                className="w-full bg-darkBg border border-darkBorder rounded-xl pl-12 pr-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-white transition-all"
              />
            </div>
          </div>

          {/* Botão de gravação */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-brandBlue hover:bg-brandBlue/90 disabled:bg-brandBlue/60 text-white font-semibold rounded-xl flex items-center justify-center space-x-2 transition-all hover:shadow-lg hover:shadow-brandBlue/10 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>A redefinir...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Guardar Nova Palavra-passe</span>
              </>
            )}
          </button>
        </>
      )}

      {status.type === 'success' && (
        <a 
          href="/admin/login/"
          className="w-full py-3 bg-darkBg border border-darkBorder hover:border-brandBlue/40 text-slate-200 hover:text-white font-semibold rounded-xl flex items-center justify-center space-x-2 transition-all"
        >
          <span>Ir para Login</span>
          <ArrowRight size={16} />
        </a>
      )}
    </form>
  );
}

// Next.js obriga o uso de um invólucro <Suspense> ao utilizar o hook useSearchParams() em exportação estática
export default function ResetPasswordPage() {
  useEffect(() => {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }, []);

  return (
    <div className="min-h-screen bg-darkBg flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brandBlue/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brandPurple/5 rounded-full blur-3xl"></div>

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-8 space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center justify-center space-x-3">
            <ShieldCheck className="text-brandBlue" size={28} />
            <span className="text-gradient">Redefinição</span>
          </h1>
          <p className="text-sm text-slate-400">Configure a sua nova chave de segurança</p>
        </div>

        <Suspense fallback={
          <div className="glass-panel p-8 text-center text-slate-400">
            <div className="w-8 h-8 border-2 border-brandBlue border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <span>A carregar parâmetros...</span>
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
