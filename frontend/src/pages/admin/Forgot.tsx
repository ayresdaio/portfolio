

/**
 * =====================================================================
 * FORMULÁRIO DE SOLICITAÇÃO DE RECUPERAÇÃO DE PALAVRA-PASSE
 * =====================================================================
 * Rota: /admin/forgot/
 * Acesso: Público
 * Permite ao administrador solicitar um link de redefinição de palavra-passe,
 * que é enviado de forma totalmente segura pelo Brevo SMTP sem fugas.
 */

import React, { useState, useEffect } from 'react';
import { Mail, ArrowLeft, Send, CheckCircle2, AlertCircle, ShieldAlert } from 'lucide-react';

export default function ForgotPasswordPage() {
  useEffect(() => {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }, []);

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; msg: string }>({ type: null, msg: '' });

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, msg: '' });

    try {
      const res = await fetch('/backend/api/forgot_password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      if (data.success) {
        setStatus({ type: 'success', msg: data.message });
      } else {
        setStatus({ type: 'error', msg: data.message || 'Erro ao processar o pedido.' });
      }
    } catch (err) {
      setStatus({ type: 'error', msg: 'Falha de comunicação com o servidor. Tente mais tarde.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-darkBg flex items-center justify-center px-4 relative overflow-hidden">
      {/* Elementos de decoração */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brandBlue/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brandPurple/5 rounded-full blur-3xl"></div>

      <div className="max-w-md w-full relative z-10">
        {/* Link para voltar */}
        <div className="text-center mb-8 space-y-2">
          <a href="/admin/login/" className="text-sm font-semibold tracking-wider text-slate-500 hover:text-slate-300 transition-colors flex items-center justify-center space-x-1">
            <ArrowLeft size={14} />
            <span>Voltar ao Login</span>
          </a>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center justify-center space-x-3">
            <ShieldAlert className="text-brandBlue" size={28} />
            <span className="text-gradient">Recuperação</span>
          </h1>
          <p className="text-sm text-slate-400">Esqueceu-se da sua palavra-passe?</p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleForgotSubmit} className="glass-panel p-8 space-y-6">
          <h2 className="text-lg font-bold text-white border-b border-darkBorder pb-3">Recuperar Palavra-passe</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Insira o seu e-mail de administrador configurado no servidor. O sistema gerará um token criptográfico e enviará o link para a sua caixa de entrada através do Brevo.
          </p>

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

          {/* E-mail */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-slate-400">E-mail Registado</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-slate-500" size={18} />
              <input 
                id="email"
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemplo@email.com"
                className="w-full bg-darkBg border border-darkBorder rounded-xl pl-12 pr-4 py-3 text-sm focus:border-brandBlue/60 outline-none text-white transition-all"
              />
            </div>
          </div>

          {/* Botão de envio */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-brandBlue hover:bg-brandBlue/90 disabled:bg-brandBlue/60 text-white font-semibold rounded-xl flex items-center justify-center space-x-2 transition-all hover:shadow-lg hover:shadow-brandBlue/10 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>A enviar e-mail...</span>
              </>
            ) : (
              <>
                <Send size={16} />
                <span>Solicitar Link</span>
              </>
            )}
          </button>
        </form>

        <p className="text-center mt-6 text-xs text-slate-500">
          Por motivos de segurança, o link expira após 60 minutos de inatividade.
        </p>
      </div>
    </div>
  );
}
