import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, Github, ExternalLink, Code, Download } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

/**
 * Interface que define as imagens adicionais associadas à galeria do projeto.
 */
interface ProjectImage {
  id: number;
  project_id?: number;
  image_url: string;
}

/**
 * Interface completa que representa a estrutura de um projeto, 
 * incluindo as imagens de suporte.
 */
interface Project {
  id: number;
  title: string;
  description: string;
  image_url?: string;
  tags: string;
  demo_url?: string;
  repo_url?: string;
  images?: ProjectImage[];
}

/**
 * Propriedades aceites pelo Modal de Detalhe de Projeto.
 */
interface ProjectDetailModalProps {
  project: Project;
  onClose: () => void;
}

/**
 * Descodifica entidades HTML (como &eacute;) em texto simples UTF-8 limpo.
 */
function decodeHTMLEntities(text: string): string {
  if (!text) return '';
  const textArea = document.createElement('textarea');
  textArea.innerHTML = text;
  return textArea.value;
}

/**
 * COMPONENTE: ProjectDetailModal
 * =====================================================================
 * Apresenta um modal imersivo e premium (OLED Glassmorphism) com todas as 
 * informações de um projeto, disponibilizando um carrossel de imagens interativo
 * para navegar pelas fotos físicas de suporte.
 */
export default function ProjectDetailModal({ project, onClose }: ProjectDetailModalProps) {
  const { language } = useLanguage();
  // Consolidar a imagem de capa principal e as imagens adicionais da galeria
  const allImages = [
    project.image_url,
    ...(project.images ? project.images.map(img => img.image_url) : [])
  ].filter(Boolean) as string[];

  const [currentIdx, setCurrentIdx] = useState(0);

  // Fechar o modal ao pressionar a tecla ESC para melhor acessibilidade
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  /**
   * Navega para a imagem anterior no carrossel.
   */
  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIdx((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  /**
   * Navega para a imagem seguinte no carrossel.
   */
  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIdx((prev) => (prev + 1) % allImages.length);
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-lg flex items-center justify-center p-4 md:p-6 overflow-y-auto animate-fade-in"
      onClick={onClose} // Fecha ao clicar fora (backdrop)
    >
      <div 
        className="glass-panel w-full max-w-5xl rounded-3xl sm:rounded-[2.5rem] bg-darkSurface border border-darkBorder shadow-2xl flex flex-col lg:flex-row overflow-hidden animate-scale-up max-h-[90vh] lg:max-h-[85vh] relative"
        onClick={(e) => e.stopPropagation()} // Impede fechar ao clicar no corpo do modal
      >
        {/* Botão de Fechar Rápido Flutuante - Cores semânticas dinâmicas */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 z-50 p-2.5 bg-darkBg/60 hover:bg-darkSurface border border-darkBorder text-textSecondary hover:text-textPrimary rounded-full transition-all duration-300 hover:rotate-90 active:scale-95"
          aria-label="Fechar Modal"
        >
          <X size={20} />
        </button>

        {/* Lado Esquerdo: Área do Carrossel de Imagens */}
        <div className="w-full lg:w-[55%] aspect-[16/10] sm:aspect-video lg:aspect-auto lg:h-auto bg-black relative flex items-center justify-center border-b lg:border-b-0 lg:border-r border-darkBorder shrink-0 overflow-hidden">
          {/* Fundo dinâmico com blur da própria imagem (efeito de luz ambiente de luxo) */}
          {allImages.length > 0 && (
            <div 
              className="absolute inset-0 bg-cover bg-center blur-2xl opacity-20 pointer-events-none scale-110"
              style={{ backgroundImage: `url(${allImages[currentIdx]})` }}
            ></div>
          )}

          {allImages.length > 0 ? (
            <div className="w-full h-full relative z-10 group flex items-center justify-center p-6 sm:p-8">
              {/* Imagem Ativa no Carrossel - Exibida inteira (object-contain) sem cortes */}
              <img 
                src={allImages[currentIdx]} 
                alt={`${project.title} - Foto ${currentIdx + 1}`}
                className="max-w-full max-h-full w-auto h-auto object-contain rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-darkBorder transition-all duration-[600ms] ease-in-out"
                key={currentIdx} // Provoca re-render para animação de fade suave
              />

              {/* Overlay de gradiente OLED inferior sutil */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none rounded-2xl"></div>

              {/* Botões de Navegação do Carrossel (Se existirem mais de uma foto) */}
              {allImages.length > 1 && (
                <>
                  <button 
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-darkBg/60 hover:bg-indigo-650 border border-darkBorder text-textPrimary hover:text-white transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center"
                    title="Imagem Anterior"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <button 
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-darkBg/60 hover:bg-indigo-650 border border-darkBorder text-textPrimary hover:text-white transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center"
                    title="Imagem Seguinte"
                  >
                    <ChevronRight size={20} />
                  </button>

                  {/* Indicadores / Pontos de Posição da Galeria */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 bg-darkBg/60 px-3 py-1.5 rounded-full border border-darkBorder backdrop-blur-sm">
                    {allImages.map((_, idx) => (
                      <button 
                        key={idx}
                        onClick={() => setCurrentIdx(idx)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          currentIdx === idx ? 'bg-indigo-400 w-4' : 'bg-white/30 hover:bg-white/60'
                        }`}
                        title={`Ir para imagem ${idx + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Botão administrativo rápido de Download no canto inferior esquerdo */}
              <a 
                href={allImages[currentIdx]} 
                download={`projeto_${project.id}_foto_${currentIdx + 1}`}
                target="_blank"
                rel="noreferrer"
                className="absolute bottom-4 left-4 p-2 bg-darkBg/60 hover:bg-indigo-600/30 border border-darkBorder rounded-xl text-textSecondary hover:text-textPrimary transition-all duration-300"
                title="Descarregar esta imagem física"
              >
                <Download size={14} />
              </a>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-3 text-textSecondary">
              <Code size={48} className="text-zinc-700" />
              <p className="text-xs uppercase tracking-widest">{language === 'pt' ? 'Sem Imagens de Destaque' : 'No Featured Images'}</p>
            </div>
          )}
        </div>

        {/* Lado Direito: Informações Detalhadas do Projeto com proteção contra o botão X */}
        <div className="w-full lg:w-[45%] pt-14 pb-5 px-5 sm:pt-16 sm:pb-8 sm:px-8 lg:p-10 flex flex-col justify-between overflow-y-auto max-h-[50vh] lg:max-h-full">
          <div className="space-y-6">
            {/* Secção de Cabeçalho do Projeto */}
            <div className="space-y-2.5">
              {/* Ajuste de contraste para o Modo Claro: text-indigo-650 dark:text-indigo-400 com fundo dinâmico */}
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-650 dark:text-indigo-400 bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/15 px-3 py-1 rounded-full inline-block">
                {language === 'pt' ? 'Projeto Concluído' : 'Completed Project'}
              </span>
              <h3 className="text-2xl md:text-3xl font-extrabold text-textPrimary font-display tracking-tight leading-tight">
                {decodeHTMLEntities(project.title)}
              </h3>
            </div>

            {/* Cápsulas de Tecnologias Néon */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-textSecondary">{language === 'pt' ? 'Tecnologias Utilizadas' : 'Technologies Used'}</h4>
              <div className="flex flex-wrap gap-2">
                {project.tags.split(',').map((tag, idx) => (
                  /* Ajuste de contraste para o Modo Claro: text-indigo-650 dark:text-indigo-300 e fundos adequados */
                  <span 
                    key={idx} 
                    className="text-[10px] font-extrabold uppercase tracking-widest bg-indigo-500/5 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-300 border border-indigo-500/15 dark:border-indigo-500/30 px-3 py-1.5 rounded-xl"
                  >
                    {tag.trim()}
                  </span>
                ))}
              </div>
            </div>

            {/* Descrição em HTML Rico */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-textSecondary">{language === 'pt' ? 'Sobre o Projeto' : 'About the Project'}</h4>
              <div 
                className="text-sm text-textSecondary leading-relaxed font-sans max-w-full prose prose-invert select-text"
                dangerouslySetInnerHTML={{ __html: project.description }}
              />
            </div>
          </div>

          {/* Botões de Ações e Links */}
          <div className="flex items-center gap-3 pt-8 mt-8 border-t border-darkBorder shrink-0">
            {project.demo_url && (
              <a 
                href={project.demo_url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white rounded-2xl text-xs font-bold flex items-center justify-center space-x-2 shadow-lg shadow-indigo-500/15 hover:shadow-indigo-500/25 transition-all duration-300 hover:-translate-y-0.5"
              >
                <span>{language === 'pt' ? 'Visitar Demonstração' : 'Visit Live Demo'}</span>
                <ExternalLink size={14} />
              </a>
            )}
            
            {project.repo_url && (
              <a 
                href={project.repo_url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className={`py-3 bg-darkBg border border-darkBorder hover:border-darkBorder/80 text-textSecondary hover:text-textPrimary rounded-2xl text-xs font-bold flex items-center justify-center space-x-2 transition-all duration-300 hover:-translate-y-0.5 ${
                  project.demo_url ? 'px-6' : 'flex-1'
                }`}
              >
                <Github size={14} />
                <span>{language === 'pt' ? 'Ver Código' : 'View Code'}</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
