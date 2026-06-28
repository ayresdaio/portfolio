import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Download, ExternalLink, FileText } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

/**
 * Propriedades aceites pelo Modal de Pré-visualização do Currículo.
 */
interface CVPreviewModalProps {
  /** URL do ficheiro de currículo em PDF (geralmente vindo do perfil dinâmico) */
  cvUrl: string;
  /** Função chamada para fechar o modal */
  onClose: () => void;
}

/**
 * COMPONENTE: CVPreviewModal
 * =====================================================================
 * Apresenta um modal imersivo de alta fidelidade (OLED Glassmorphism)
 * para pré-visualizar o currículo em PDF de forma integrada no navegador.
 * 
 * Inclui alternativas de navegação e compatibilidade total para dispositivos
 * móveis onde a renderização de PDFs em iframes possa ser bloqueada.
 */
export default function CVPreviewModal({ cvUrl, onClose }: CVPreviewModalProps) {
  const { language } = useLanguage();
  
  // Efeito para fechar o modal ao pressionar a tecla ESC (Melhoria de Acessibilidade/A11y)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Impede o scroll de fundo do ecrã principal enquanto o modal estiver ativo
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-lg flex items-center justify-center p-4 md:p-6 overflow-y-auto animate-fade-in"
      onClick={onClose} // Fecha ao clicar na área exterior (backdrop)
    >
      <div 
        className="glass-panel w-full max-w-4xl rounded-[2rem] sm:rounded-[2.25rem] bg-darkSurface border border-darkBorder shadow-2xl flex flex-col overflow-hidden animate-scale-up h-[85vh] relative"
        onClick={(e) => e.stopPropagation()} // Impede o fecho ao clicar dentro do corpo do modal
      >
        
        {/* Botão de Fechar Rápido Flutuante */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 z-50 p-2.5 bg-darkBg/60 hover:bg-darkSurface border border-darkBorder text-textSecondary hover:text-textPrimary rounded-full transition-all duration-300 hover:rotate-90 active:scale-95"
          aria-label="Fechar Pré-visualização"
        >
          <X size={18} />
        </button>

        {/* 1. Cabeçalho do Modal com Título Semântico */}
        <div className="p-4 sm:p-6 md:p-8 border-b border-darkBorder space-y-2 shrink-0">
          <div className="flex items-center space-x-3">
            {/* Ajuste de contraste para o Modo Claro: text-indigo-600 dark:text-indigo-400 */}
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 dark:border-indigo-500/25">
              <FileText size={16} />
            </div>
            {/* Ajuste de contraste para o Modo Claro: text-indigo-600 dark:text-indigo-400 */}
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              Visualização Online
            </span>
          </div>
          
          <h3 className="text-xl md:text-2xl font-black text-textPrimary tracking-tight font-display uppercase">
            Currículo Profissional
          </h3>
          <p className="text-xs text-textSecondary font-medium">
            Explore as competências técnicas e o percurso de carreira de Ayres Daio Neto.
          </p>
        </div>

        {/* 2. Área Central de Visualização Segura (Iframe & Mensagem de Compatibilidade) */}
        <div className="flex-grow p-3 sm:p-4 md:p-6 bg-darkBg/40 flex flex-col space-y-4 overflow-hidden relative">
          
          {/* Caixa de Notas de Compatibilidade (Mensagem de Apoio UX Mobile) */}
          <div className="p-3 bg-darkSurface border border-darkBorder rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left shrink-0">
            <div className="space-y-0.5">
              <span className="text-[10px] font-semibold text-textPrimary block">Dificuldade em visualizar o documento?</span>
              <p className="text-[9px] text-textSecondary leading-normal">
                Dispositivos móveis e certos browsers podem requerer a abertura direta ou transferência do ficheiro.
              </p>
            </div>
            
            {/* Atalhos Rápidos Alternativos */}
            <div className="flex items-center space-x-2 shrink-0">
              {/* Ajuste de contraste para o Modo Claro: text-indigo-600 dark:text-indigo-400 */}
              <a 
                href={cvUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 hover:border-indigo-500/40 rounded-xl text-[10px] font-bold flex items-center space-x-1.5 transition-all hover:-translate-y-0.5"
              >
                <span>Abrir Noutro Separador</span>
                <ExternalLink size={10} />
              </a>

              <a 
                href={`/backend/api/download_cv.php?lang=${language}`} 
                download={language === 'en' ? "Resume_Ayres_Daio_Neto.pdf" : "Curriculo_Ayres_Daio_Neto.pdf"}
                className="px-3.5 py-1.5 bg-darkBg hover:bg-darkSurface text-textSecondary hover:text-textPrimary border border-darkBorder rounded-xl text-[10px] font-bold flex items-center space-x-1.5 transition-all hover:-translate-y-0.5"
              >
                <Download size={10} />
                <span>Descarregar</span>
              </a>
            </div>
          </div>

          {/* Iframe que carrega nativamente o PDF */}
          <div className="flex-grow bg-zinc-950 rounded-2xl border border-darkBorder overflow-hidden relative">
            <iframe 
              src={`${cvUrl}#toolbar=1&navpanes=0&scrollbar=1`}
              className="w-full h-full border-none"
              title="Currículo Profissional de Ayres Daio Neto"
            />
          </div>
        </div>

        {/* 3. Rodapé do Modal com Ações Principais */}
        <div className="p-4 sm:p-6 border-t border-darkBorder flex items-center justify-between shrink-0 flex-wrap gap-4 bg-darkSurface/65">
          {/* Ajuste de contraste para o Modo Claro: text-indigo-600 dark:text-indigo-400 */}
          <span className="text-[9px] font-mono text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hidden sm:inline">
            Status: Documento Verificado
          </span>

          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            <button 
              onClick={onClose}
              className="px-5 py-2.5 bg-darkBg border border-darkBorder hover:border-darkBorder/80 text-textSecondary hover:text-textPrimary rounded-xl text-xs font-bold transition-colors"
            >
              Fechar
            </button>

            <a 
              href={`/backend/api/download_cv.php?lang=${language}`} 
              download={language === 'en' ? "Resume_Ayres_Daio_Neto.pdf" : "Curriculo_Ayres_Daio_Neto.pdf"}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-bold rounded-xl text-xs flex items-center space-x-2 transition-all hover:-translate-y-0.5 shadow-lg shadow-indigo-500/10"
            >
              <Download size={14} />
              <span>Descarregar Currículo</span>
            </a>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
}
