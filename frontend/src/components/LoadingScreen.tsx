import { Terminal, Cpu } from 'lucide-react';

/**
 * COMPONENTE DE ECRÃ DE CARREGAMENTO PREMIUM (LoadingScreen)
 * =====================================================================
 * Este componente serve como ecrã de fallback para o React Suspense.
 * Adota uma estética cyberpunk/OLED (fundo preto absoluto) com brilhos
 * néon dinâmicos, um terminal de sistema fictício em constante animação
 * e ícones técnicos rotativos, proporcionando um feedback visual de
 * altíssimo nível de fidelidade enquanto os recursos da rota são descarregados.
 */
export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 w-screen h-screen bg-darkBg flex flex-col items-center justify-center z-50 selection:bg-brandBlue/30 select-none overflow-hidden transition-colors duration-300">
      
      {/* -------------------------------------------------------------
          ORBES DE LUZ NÉON DINÂMICOS DE FUNDO (Ambient Glows)
          ------------------------------------------------------------- */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full bg-cyan-500/5 blur-[80px] pointer-events-none"></div>

      {/* Suportes Cibernéticos Decorativos nos Cantos (HUD Frame) */}
      <div className="absolute top-6 left-6 w-6 h-6 border-t border-l border-indigo-500/25 pointer-events-none"></div>
      <div className="absolute top-6 right-6 w-6 h-6 border-t border-r border-indigo-500/25 pointer-events-none"></div>
      <div className="absolute bottom-6 left-6 w-6 h-6 border-b border-l border-indigo-500/25 pointer-events-none"></div>
      <div className="absolute bottom-6 right-6 w-6 h-6 border-b border-r border-indigo-500/25 pointer-events-none"></div>

      {/* -------------------------------------------------------------
          PAINEL CENTRAL DE CARREGAMENTO (Glassmorphic HUD Card)
          ------------------------------------------------------------- */}
      {/* Painel de HUD adaptável com vidro fosco claro no modo claro e OLED escuro no modo escuro */}
      <div className="relative p-8 max-w-sm w-full mx-6 bg-darkSurface/40 border border-darkBorder/40 rounded-3xl backdrop-blur-2xl shadow-2xl flex flex-col items-center text-center space-y-6 animate-fade-in transition-all duration-300">
        
        {/* Cantos cibernéticos decorativos */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400/50 rounded-tl-xl"></div>
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400/50 rounded-tr-xl"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400/50 rounded-bl-xl"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400/50 rounded-br-xl"></div>

        {/* Círculo com animação de pulso néon e ícone rotativo */}
        {/* Anel de destaque do ícone com opacidade adaptada a cada tema */}
        <div className="relative w-16 h-16 rounded-full border border-indigo-500/20 dark:border-indigo-500/20 bg-indigo-500/10 dark:bg-indigo-950/15 flex items-center justify-center shadow-lg shadow-indigo-500/10 transition-colors duration-300">
          {/* Anel de pulso externo */}
          <span className="absolute inset-0 rounded-full border border-cyan-400/30 animate-ping opacity-75"></span>
          
          <Cpu className="w-8 h-8 text-cyan-400 animate-spin" style={{ animationDuration: '3s' }} />
        </div>

        {/* Texto do estado de processamento */}
        <div className="space-y-1">
          <h3 className="text-sm font-extrabold tracking-widest text-textPrimary uppercase font-mono">
            CARREGANDO SISTEMA
          </h3>
          <div className="flex items-center justify-center space-x-1.5 text-[9px] font-mono text-cyan-400 font-bold uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
            <span>Ayres Tech Node // INICIALIZANDO</span>
          </div>
        </div>

        {/* Mini Consola Simulada */}
        {/* Consola de terminal estaticamente escura para realismo estético cyberpunk em qualquer tema */}
        <div className="w-full bg-zinc-950/90 border border-zinc-800/40 rounded-xl p-3 text-left font-mono text-[9px] text-indigo-400/80 space-y-1.5">
          <div className="flex items-center space-x-1.5">
            <Terminal size={10} className="text-cyan-400" />
            <span className="text-white/30">sys_init:</span>
            <span className="animate-pulse">carregando_modulos...</span>
          </div>
          <div className="h-1 w-full bg-white/[0.03] rounded-full overflow-hidden relative">
            <div className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-cyan-400 to-indigo-500 w-2/3 rounded-full animate-[shimmer_1.5s_infinite] after:content-[''] after:absolute after:inset-0 after:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)] after:animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
          </div>
        </div>

      </div>
    </div>
  );
}
