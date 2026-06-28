import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Terminal, ShieldAlert, Cpu, RefreshCw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

/**
 * COMPONENTE DE PÁGINA NÃO ENCONTRADA (NotFound)
 * =====================================================================
 * Este componente implementa uma página de erro personalizada ("LOST")
 * com estética Cyberpunk/OLED Dark. Substitui o termo genérico "404"
 * por uma consola digital de diagnóstico realista e textos em néon
 * cintilante com animação de tremeluzência (flicker).
 * 
 * Funcionalidades:
 * - Deteção do URL incorreto dinamicamente via `window.location.pathname`.
 * - Efeitos de iluminação OLED néon com cintilação via CSS customizado.
 * - Integração completa com o sistema bilingue (PT/EN) do portfólio.
 * - Modificação dinâmica dos metadados de SEO (Título do documento).
 */
export default function NotFound() {
  const { t, language } = useLanguage();
  const [currentPath, setCurrentPath] = useState('');

  // 1. Deteção do URL solicitado e atualização dos metadados de SEO
  useEffect(() => {
    // Definir o caminho atual a partir da barra de endereços do browser
    setCurrentPath(window.location.pathname);

    // Certificar que a página assume o modo escuro (Dark Mode OLED)
    document.documentElement.classList.add('dark');

    // Atualizar o título do documento para refletir o estado de erro
    document.title = `${t('lost_title')} | Ayres Daio`;
  }, [t]);

  return (
    <div className="w-full min-h-[100dvh] bg-black text-white overflow-y-auto relative flex flex-col items-center justify-between font-sans selection:bg-brandBlue/30 selection:text-white animate-page-transition">
      
      {/* Estilos CSS Inline para Animações Néon Exclusivas (Flicker & Pulsação) */}
      <style>{`
        @keyframes neon-flicker {
          0%, 18%, 22%, 25%, 53%, 57%, 100% {
            text-shadow: 
              0 0 4px rgba(255, 255, 255, 0.9),
              0 0 10px rgba(34, 211, 238, 0.95),
              0 0 20px rgba(34, 211, 238, 0.8),
              0 0 40px rgba(99, 102, 241, 0.8),
              0 0 80px rgba(99, 102, 241, 0.7);
            opacity: 1;
          }
          19%, 23%, 54%, 56% {
            text-shadow: none;
            opacity: 0.5;
          }
        }
        .animate-neon-lost {
          animation: neon-flicker 5s infinite alternate ease-in-out;
        }
        @keyframes border-glow-pulse {
          0%, 100% {
            border-color: rgba(34, 211, 238, 0.2);
            box-shadow: 0 0 15px rgba(34, 211, 238, 0.05);
          }
          50% {
            border-color: rgba(99, 102, 241, 0.4);
            box-shadow: 0 0 25px rgba(99, 102, 241, 0.15);
          }
        }
        .animate-border-pulse {
          animation: border-glow-pulse 4s infinite ease-in-out;
        }
      `}</style>

      {/* Orbes néon decorativos de fundo para dar profundidade visual */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-red-500/[0.02] blur-[180px] pointer-events-none select-none z-0"></div>
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] rounded-full bg-cyan-500/[0.03] blur-[150px] pointer-events-none select-none z-0"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-indigo-500/[0.03] blur-[150px] pointer-events-none select-none z-0"></div>

      {/* Suportes Cibernéticos Decorativos nos Cantos do Ecrã (HUD Frame) */}
      <div className="absolute top-6 left-6 w-8 h-8 border-t border-l border-red-500/20 pointer-events-none hidden md:block"></div>
      <div className="absolute top-6 right-6 w-8 h-8 border-t border-r border-red-500/20 pointer-events-none hidden md:block"></div>
      <div className="absolute bottom-6 left-6 w-8 h-8 border-b border-l border-red-500/20 pointer-events-none hidden md:block"></div>
      <div className="absolute bottom-6 right-6 w-8 h-8 border-b border-r border-red-500/20 pointer-events-none hidden md:block"></div>

      {/* Barra Técnica de Topo (HUD Digital de Rede Falsa) */}
      <header className="w-full max-w-6xl mx-auto px-6 py-5 flex items-center justify-between relative z-10 select-none">
        <div className="flex items-center space-x-2 text-[9px] font-mono text-red-400 bg-red-950/20 border border-red-500/20 px-3 py-1.5 rounded-full backdrop-blur-md">
          <ShieldAlert size={10} className="text-red-400 shrink-0 animate-pulse" />
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping"></span>
          <span className="font-bold tracking-widest">{t('lost_status')}: SYSTEM_OFFLINE</span>
        </div>
        <div className="hidden sm:flex items-center space-x-2 text-[9px] font-mono text-white/35 bg-white/[0.01] border border-white/[0.04] px-4 py-1.5 rounded-full backdrop-blur-md">
          <Cpu size={10} className="text-red-500/70" />
          <span className="w-1 h-1 rounded-full bg-red-500"></span>
          <span>CRITICAL FAULT: EXCEPTION_HANDLER</span>
        </div>
      </header>

      {/* Consola Central de Erro */}
      <main className="w-full max-w-xl px-6 text-center relative z-10 flex flex-col items-center justify-center flex-grow py-8">
        
        {/* Painel Central com Efeito Vidro Fosco Profundo e Flutuação Vertical */}
        <div className="w-full glass-panel p-6 sm:p-9 bg-zinc-950/45 border border-white/[0.06] rounded-3xl sm:rounded-[32px] shadow-[0_30px_70px_rgba(0,0,0,0.95)] backdrop-blur-3xl space-y-7 transform hover:scale-[1.01] transition-all duration-500 relative overflow-hidden group cyber-corners-container animate-border-pulse">
          
          {/* Suportes Cibernéticos Decorativos nos cantos do painel */}
          <div className="cyber-corner cyber-corner-tl !border-red-500/40"></div>
          <div className="cyber-corner cyber-corner-tr !border-red-500/40"></div>
          <div className="cyber-corner cyber-corner-bl !border-red-500/40"></div>
          <div className="cyber-corner cyber-corner-br !border-red-500/40"></div>

          {/* Nome com Tipografia Néon Cintilante */}
          <div className="space-y-1 relative z-10">
            <h1 className="text-7xl sm:text-8xl font-black tracking-widest select-none bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-cyan-400 to-indigo-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)] font-display uppercase animate-neon-lost cursor-default">
              {t('lost_title')}
            </h1>
            <p className="text-xs font-mono uppercase tracking-[0.3em] text-red-400/90 font-bold">
              {t('lost_subtitle')}
            </p>
          </div>

          {/* Consola de Diagnósticos Cyberpunk Estilo SO Real */}
          <div className="w-full bg-zinc-950/80 border border-white/[0.04] rounded-2xl overflow-hidden shadow-inner relative z-10 crt-monitor text-left">
            {/* Barra de Título Superior do Terminal */}
            <div className="bg-zinc-900/60 border-b border-white/[0.03] px-4 py-2.5 flex items-center justify-between select-none">
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500/50"></span>
                <span className="w-2 h-2 rounded-full bg-zinc-700"></span>
                <span className="w-2 h-2 rounded-full bg-zinc-700"></span>
              </div>
              <span className="text-[9px] font-mono text-white/30 tracking-wider">diagnostics_tool --abort</span>
              <Terminal size={10} className="text-red-400/50" />
            </div>

            {/* Corpo do Terminal com Informações Técnicas */}
            <div className="p-5 font-mono text-xs space-y-3.5 leading-relaxed text-zinc-300">
              <div className="flex flex-col sm:flex-row sm:items-start gap-1">
                <span className="text-red-400 font-bold shrink-0">[{t('lost_status')}]:</span>
                <span className="text-red-300 font-semibold uppercase">ROUTE_LOST</span>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-start gap-1">
                <span className="text-cyan-400 font-bold shrink-0">[{t('lost_uri')}]:</span>
                <span className="text-cyan-300/90 break-all bg-cyan-950/15 border border-cyan-950/30 px-1.5 py-0.5 rounded">
                  {currentPath || '/'}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-start gap-1">
                <span className="text-zinc-500 font-bold shrink-0">[{t('lost_details')}]:</span>
                <span>{t('lost_diagnostic')}</span>
              </div>

              <div className="border-t border-white/[0.04] pt-3 flex flex-col sm:flex-row sm:items-start gap-1 text-[11px] text-zinc-400">
                <span className="text-indigo-400 font-bold shrink-0">&gt; ACTION:</span>
                <span className="flex items-center gap-1.5">
                  {t('lost_action')}
                  <span className="w-1.5 h-3.5 bg-indigo-400 inline-block animate-pulse shrink-0"></span>
                </span>
              </div>
            </div>
          </div>

          {/* Botão de Portal Néon ("VOLTAR AO INÍCIO") */}
          <div className="pt-2 relative z-10">
            <Link 
              to="/inicio" 
              className="group/btn relative w-full py-4 px-6 bg-gradient-to-r from-red-500 via-indigo-500 to-blue-600 hover:from-red-400 hover:via-indigo-400 hover:to-blue-500 text-white rounded-2xl text-xs font-black tracking-widest uppercase transition-all duration-300 flex items-center justify-center space-x-2.5 shadow-lg shadow-indigo-500/25 hover:shadow-red-500/40 hover:scale-[1.01] active:scale-[0.99] overflow-hidden shimmer-effect"
            >
              {/* Brilho glow néon dinâmico atrás do botão no hover */}
              <span className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-500 via-indigo-500 to-blue-500 blur-xl opacity-0 group-hover/btn:opacity-60 transition-opacity duration-500 z-0"></span>

              <ArrowLeft size={14} className="text-white relative z-10 transform group-hover/btn:-translate-x-1.5 transition-transform duration-300" />
              <span className="relative z-10 font-bold tracking-widest">{t('lost_button')}</span>
              <RefreshCw size={12} className="text-white/60 relative z-10 animate-spin" style={{ animationDuration: '6s' }} />
            </Link>
          </div>

        </div>
      </main>

      {/* Barra Técnica de Rodapé (HUD Informativo de Segurança) */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10 text-[9px] font-mono text-white/30 select-none">
        <div className="flex items-center space-x-2 bg-red-950/10 border border-red-500/10 px-3.5 py-1.5 rounded-full backdrop-blur-md">
          <ShieldAlert size={12} className="text-red-400/60" />
          <span className="font-bold tracking-wider text-red-300/80">
            {language === 'pt' ? 'DIREÇÃO DE TRÁFEGO INTERROMPIDA' : 'TRAFFIC DIRECTION INTERRUPTED'}
          </span>
        </div>
        <div className="bg-white/[0.01] border border-white/[0.04] px-4 py-1.5 rounded-full backdrop-blur-md">
          AYRES ERROR DEPT &copy; {new Date().getFullYear()}
        </div>
      </footer>

    </div>
  );
}
