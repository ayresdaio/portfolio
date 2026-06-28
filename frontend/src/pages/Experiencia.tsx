import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useOutletContext } from 'react-router-dom';
import { Briefcase, MapPin, Calendar, Activity, X, ChevronRight, Building2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

/**
 * Interface que representa a estrutura física dos dados de experiência.
 */
interface Experience {
  id: number;
  role: string;
  company: string;
  company_en?: string;
  duration: string;
  location?: string;
  description: string;
  image_url?: string;
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
 * PÁGINA DE EXPERIÊNCIA PROFISSIONAL (ExperienciaPage)
 * =====================================================================
 * Exibe o historial profissional estruturado em Cartões Profissionais
 * (Grelha de 2 ou 3 Colunas) com imagens e filtros técnicos dinâmicos.
 * Ao clicar, expande num Modal para ler mais informações.
 */
export default function ExperienciaPage() {
  const { language } = useLanguage();
  const { experiences } = useOutletContext<{ experiences: Experience[] }>();
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [selectedExp, setSelectedExp] = useState<Experience | null>(null);

  /**
   * Obtém a empresa traduzida se o idioma for inglês e a tradução existir.
   */
  const getCompany = (exp: Experience): string => {
    if (language === 'en' && exp.company_en && exp.company_en.trim() !== '') {
      return exp.company_en;
    }
    return exp.company;
  };

  /**
   * Traduz a categoria da experiência de forma reativa para o visitante.
   */
  const translateCategory = (cat: string) => {
    if (language === 'pt') return cat;
    switch (cat) {
      case 'Todos': return 'All';
      case 'Desenvolvimento': return 'Development';
      case 'Sistemas & Redes': return 'Systems & Networks';
      case 'Suporte Técnico': return 'Technical Support';
      default: return cat;
    }
  };

  /**
   * Classificação semântica automática das experiências profissionais
   * baseando-se no cargo e na descrição detalhada.
   */
  const getExperienceCategory = (exp: Experience): string => {
    const text = (exp.role + ' ' + exp.description).toLowerCase();
    if (
      text.includes('developer') || 
      text.includes('stack') || 
      text.includes('programador') || 
      text.includes('desenvolvedor') || 
      text.includes('web') || 
      text.includes('software') || 
      text.includes('php') || 
      text.includes('laravel')
    ) {
      return 'Desenvolvimento';
    }
    if (
      text.includes('redes') || 
      text.includes('sistemas') || 
      text.includes('network') || 
      text.includes('servidor') || 
      text.includes('administrador') || 
      text.includes('segurança') || 
      text.includes('ip')
    ) {
      return 'Sistemas & Redes';
    }
    return 'Suporte Técnico';
  };

  // Efeito de transição suave (fade-out) na mudança do filtro
  const handleFilterChange = (tag: string) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveFilter(tag);
      setIsTransitioning(false);
    }, 250);
  };

  // Impedir scroll no body quando o modal estiver aberto
  useEffect(() => {
    if (selectedExp) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [selectedExp]);

  // Filtrar a lista de experiências
  const filteredExperiences = activeFilter === 'Todos'
    ? experiences
    : experiences.filter(exp => getExperienceCategory(exp) === activeFilter);

  // Carregamento de dados pendente
  if (!experiences || experiences.length === 0) {
    return (
      <div className="flex-grow flex items-center justify-center bg-darkBg text-textPrimary py-24">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-brandBlue border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-textSecondary uppercase tracking-widest">{language === 'pt' ? 'A carregar historial profissional...' : 'Loading professional history...'}</p>
        </div>
      </div>
    );
  }

  // Obter as categorias ativas de forma dinâmica com base nas experiências registadas
  const filters = ['Todos', ...Array.from(new Set(experiences.map(exp => getExperienceCategory(exp)).filter(c => c && c.trim() !== '')))];

  return (
    <section className="px-4 sm:px-6 py-16 md:py-20 max-w-6xl mx-auto w-full flex-grow flex flex-col justify-center animate-fade-in relative z-10">
      
      {/* Cabeçalho da Secção Cyber */}
      <div className="text-center md:text-left mb-12 space-y-3 max-w-2xl relative z-10">
        {/* Ajuste de contraste para o Modo Claro: text-indigo-650 dark:text-indigo-300 */}
        <span className="text-[9px] font-extrabold uppercase tracking-widest text-indigo-650 dark:text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1.5 rounded-full inline-block">
          {language === 'pt' ? 'Crescimento & Percurso' : 'Growth & Career Path'}
        </span>
        <h2 className="text-3.5xl md:text-5xl font-black tracking-tight text-textPrimary font-display uppercase bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 drop-shadow-[0_2px_10px_rgba(34,211,238,0.12)]">
          {language === 'pt' ? (
            <>Percurso <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">Profissional</span></>
          ) : (
            <>Professional <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">Timeline</span></>
          )}
        </h2>
        <div className="section-divider-cyber"></div>
      </div>

      {/* Barra de Filtros de Cargos */}
      <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-12 animate-slide-up relative z-10">
        {filters.map(tag => (
          <button
            key={tag}
            onClick={() => handleFilterChange(tag)}
            className={`px-4 py-2 text-xs rounded-xl font-bold uppercase tracking-wider transition-all duration-300 border ${
              activeFilter === tag 
                ? 'bg-gradient-to-r from-cyan-500 via-indigo-500 to-blue-600 text-white shadow-lg shadow-indigo-500/20 border-indigo-400 scale-[1.03]' 
                : 'bg-darkSurface/40 border-darkBorder text-textSecondary hover:text-textPrimary hover:border-slate-800'
            }`}
          >
            {tag === 'Todos' && language === 'en' ? 'All' : translateCategory(tag)}
          </button>
        ))}
      </div>

      {/* Grelha Profissional de Cartões de Experiência (Resumo) */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10 transition-all duration-300 ease-out ${isTransitioning ? 'opacity-0 scale-[0.98] blur-sm' : 'opacity-100 scale-100 blur-none'}`}>
        {filteredExperiences.map((exp, index) => (
          <div 
            key={exp.id} 
            onClick={() => setSelectedExp(exp)}
            className="group cursor-pointer relative cyber-card p-6 flex flex-col gap-4 rounded-3xl cyber-corners-container animate-cyber-card-reveal hover:-translate-y-1 transition-all duration-300 bg-darkSurface/40 hover:bg-indigo-950/20 border border-darkBorder hover:border-cyan-500/30"
            style={{ animationDelay: `${index * 0.12}s` }}
          >
            {/* Mini cantoneiras do cartão profissional */}
            <div className="cyber-corner cyber-corner-tl !w-2.5 !h-2.5"></div>
            <div className="cyber-corner cyber-corner-tr !w-2.5 !h-2.5"></div>
            <div className="cyber-corner cyber-corner-bl !w-2.5 !h-2.5"></div>
            <div className="cyber-corner cyber-corner-br !w-2.5 !h-2.5"></div>

            {/* Imagem / Logotipo */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl flex-shrink-0 bg-darkBg/60 flex items-center justify-center border border-darkBorder group-hover:border-cyan-400/50 transition-colors overflow-hidden p-1">
                {exp.image_url ? (
                  /* Renderizar imagem completa (sem cortes) usando object-contain e padding suave */
                  <img src={exp.image_url} alt={getCompany(exp)} className="w-full h-full object-contain" />
                ) : (
                  <Building2 size={24} className="text-textSecondary/20" />
                )}
              </div>
              <div className="flex-grow">
                <h3 className="text-sm md:text-base font-bold text-textPrimary group-hover:text-cyan-400 transition-colors font-display uppercase line-clamp-2">
                  {decodeHTMLEntities(exp.role)}
                </h3>
                {/* Ajuste de contraste para o Modo Claro: from-indigo-600 to-cyan-600 dark:from-indigo-400 dark:to-cyan-300 */}
                <span className="text-xs font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-cyan-600 dark:from-indigo-400 dark:to-cyan-300">
                  {decodeHTMLEntities(getCompany(exp))}
                </span>
              </div>
            </div>

            <div className="flex-grow flex flex-col justify-end">
              <div className="flex items-center space-x-1.5 text-[10px] font-mono text-textSecondary mb-4">
                {/* Ajuste de contraste para o Modo Claro: text-indigo-650 dark:text-indigo-400 */}
                <Calendar size={12} className="text-indigo-650 dark:text-indigo-400" />
                <span>{exp.duration}</span>
              </div>
              
              {/* Ajuste de contraste para o Modo Claro: text-indigo-650 dark:text-indigo-400 group-hover:text-cyan-650 dark:group-hover:text-cyan-300 */}
              <div className="flex items-center justify-between text-xs font-bold text-indigo-650 dark:text-indigo-400 group-hover:text-cyan-650 dark:group-hover:text-cyan-305 transition-colors border-t border-darkBorder pt-3 mt-auto">
                <span>{language === 'pt' ? 'Ver detalhes' : 'View details'}</span>
                <ChevronRight size={14} className="transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Overlay para Detalhes (Mais Informações) */}
      {selectedExp && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-darkBg/80 backdrop-blur-md animate-fade-in">
          <div 
            className="absolute inset-0 cursor-pointer" 
            onClick={() => setSelectedExp(null)}
          ></div>
          
          <div className="relative w-full max-w-2xl max-h-[85vh] bg-darkSurface border border-cyan-500/30 rounded-3xl overflow-hidden flex flex-col shadow-2xl shadow-cyan-500/10 cyber-card transition-colors duration-300">
            
            {/* Decorações do Modal */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-indigo-500 to-blue-600"></div>
            
            {/* Cabeçalho do Modal */}
            <div className="flex justify-between items-start p-6 border-b border-darkBorder relative z-10 flex-shrink-0">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex-shrink-0 bg-darkBg/60 flex items-center justify-center border border-darkBorder overflow-hidden shadow-inner p-1.5">
                  {selectedExp.image_url ? (
                    /* Renderizar imagem completa (sem cortes) no modal usando object-contain e padding */
                    <img src={selectedExp.image_url} alt={getCompany(selectedExp)} className="w-full h-full object-contain" />
                  ) : (
                    <Building2 size={32} className="text-textSecondary/20" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight text-textPrimary font-display uppercase bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-400">
                    {decodeHTMLEntities(selectedExp.role)}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm font-bold text-textSecondary mt-1">
                    <span className="flex items-center space-x-1">
                      {/* Ajuste de contraste para o Modo Claro: text-indigo-650 dark:text-indigo-400 */}
                      <Briefcase size={14} className="text-indigo-650 dark:text-indigo-400" />
                      <span className="text-textSecondary">{decodeHTMLEntities(getCompany(selectedExp))}</span>
                    </span>
                    {selectedExp.location && (
                      <span className="flex items-center space-x-1">
                        <span className="text-white/10 hidden sm:inline">•</span>
                        {/* Ajuste de contraste para o Modo Claro: text-indigo-650 dark:text-indigo-400 */}
                        <MapPin size={14} className="text-indigo-650 dark:text-indigo-400" />
                        <span className="text-textSecondary">{selectedExp.location}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => setSelectedExp(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-darkSurface/25 hover:bg-darkSurface/50 text-textSecondary hover:text-textPrimary transition-colors flex-shrink-0 border border-darkBorder"
              >
                <X size={18} />
              </button>
            </div>
            
            {/* Corpo Scrollável do Modal */}
            <div className="p-6 overflow-y-auto flex-grow relative z-10" style={{ scrollbarWidth: 'thin', scrollbarColor: '#4f46e5 transparent' }}>
              
              {/* Ajuste de contraste para o Modo Claro: bg-indigo-500/10 dark:bg-indigo-500/20, border-indigo-500/20 dark:border-indigo-500/25, text-indigo-600 dark:text-indigo-300 */}
              <div className="inline-flex items-center space-x-2 bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/20 dark:border-indigo-500/25 px-3 py-1.5 rounded-lg text-xs font-mono text-indigo-600 dark:text-indigo-300 mb-6">
                {/* Ajuste de contraste para o Modo Claro: text-cyan-650 dark:text-cyan-400 */}
                <Calendar size={14} className="text-cyan-650 dark:text-cyan-400" />
                <span className="uppercase tracking-wider">{selectedExp.duration}</span>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold text-textPrimary uppercase tracking-widest border-b border-darkBorder pb-2">
                  {language === 'pt' ? 'Descrição & Responsabilidades' : 'Description & Responsibilities'}
                </h4>
                <div 
                  className="text-sm text-textSecondary leading-relaxed font-sans prose prose-invert select-text max-w-full"
                  dangerouslySetInnerHTML={{ __html: selectedExp.description.replace(/\\r\\n/g, '<br>') }}
                />
              </div>
              
            </div>
            
            {/* Rodapé do Modal */}
            <div className="p-4 border-t border-darkBorder bg-darkBg/40 flex justify-between items-center text-[10px] font-mono text-textSecondary/30 uppercase tracking-widest select-none relative z-10 flex-shrink-0">
              <span className="flex items-center gap-2">
                <Activity size={12} className="text-cyan-500/50" />
                Secure Profile Record
              </span>
              <span>{translateCategory(getExperienceCategory(selectedExp))}</span>
            </div>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
}
