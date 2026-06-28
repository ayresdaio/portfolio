import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useOutletContext } from 'react-router-dom';
import { BookOpen, MapPin, Calendar, Activity, X, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

/**
 * Interface que representa a estrutura física dos dados de formação académica.
 */
interface Education {
  id: number;
  degree: string;
  degree_en?: string;
  institution: string;
  institution_en?: string;
  duration: string;
  duration_en?: string;
  location?: string;
  location_en?: string;
  education_type?: string;
  education_type_en?: string;
  description: string;
  description_en?: string;
  image_url?: string;
  link_url?: string;
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
 * PÁGINA DE FORMAÇÃO ACADÉMICA (EducacaoPage)
 * =====================================================================
 * Exibe o historial letivo em Cartões Profissionais (Grelha de 2 ou 3 Colunas)
 * com filtros dinâmicos de categoria e transição de filtragem suave.
 * Ao clicar num cartão, expande-se num Modal centrado por React Portal.
 */
export default function EducacaoPage() {
  const { language, t } = useLanguage();
  const { education } = useOutletContext<{ education: Education[] }>();
  const [selectedEdu, setSelectedEdu] = useState<Education | null>(null);

  /**
   * Obtém o curso/grau traduzido se o idioma for inglês e a tradução existir.
   */
  const getDegree = (edu: Education): string => {
    if (language === 'en' && edu.degree_en && edu.degree_en.trim() !== '') {
      return edu.degree_en;
    }
    return edu.degree;
  };

  /**
   * Obtém a instituição de ensino traduzida se o idioma for inglês e a tradução existir.
   */
  const getInstitution = (edu: Education): string => {
    if (language === 'en' && edu.institution_en && edu.institution_en.trim() !== '') {
      return edu.institution_en;
    }
    return edu.institution;
  };

  /**
   * Obtém a duração letiva traduzida se o idioma for inglês e a tradução existir.
   */
  const getDuration = (edu: Education): string => {
    if (language === 'en' && edu.duration_en && edu.duration_en.trim() !== '') {
      return edu.duration_en;
    }
    return edu.duration;
  };

  /**
   * Obtém a localização/regime traduzida se o idioma for inglês e a tradução existir.
   */
  const getLocation = (edu: Education): string => {
    if (language === 'en' && edu.location_en && edu.location_en.trim() !== '') {
      return edu.location_en;
    }
    return edu.location || '';
  };

  /**
   * Obtém a descrição detalhada traduzida se o idioma for inglês e a tradução existir.
   */
  const getDescription = (edu: Education): string => {
    if (language === 'en' && edu.description_en && edu.description_en.trim() !== '') {
      return edu.description_en;
    }
    return edu.description;
  };

  /**
   * Classificação semântica automática das formações académicas e tradução do tipo.
   */
  const getEducationCategory = (edu: Education): string => {
    const type = (language === 'en' && edu.education_type_en && edu.education_type_en.trim() !== '')
      ? edu.education_type_en
      : (edu.education_type || '');

    if (type.trim() !== '') {
      return type;
    }

    const text = (edu.degree + ' ' + (edu.degree_en || '') + ' ' + edu.description + ' ' + (edu.description_en || '')).toLowerCase();
    if (
      text.includes('licenciatura') || 
      text.includes('universidade') || 
      text.includes('superior') || 
      text.includes('bacharelato') || 
      text.includes('faculdade') ||
      text.includes('degree') ||
      text.includes('bachelor') ||
      text.includes('university')
    ) {
      return language === 'en' ? 'Higher Education' : 'Ensino Superior';
    }
    return language === 'en' ? 'Technical Training' : 'Formação Técnica';
  };

  // Impedir scroll no body quando o modal estiver aberto
  useEffect(() => {
    if (selectedEdu) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [selectedEdu]);

  // Carregamento de dados pendente
  if (!education || education.length === 0) {
    return (
      <div className="flex-grow flex items-center justify-center bg-darkBg text-textPrimary py-24">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-brandBlue border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-textSecondary uppercase tracking-widest">{t('edu_loading')}</p>
        </div>
      </div>
    );
  }

  // Agrupar percursos académicos dinamicamente por tipo/categoria de ensino
  const groupedEducation = education.reduce((acc, edu) => {
    const category = getEducationCategory(edu);
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(edu);
    return acc;
  }, {} as { [key: string]: Education[] });

  return (
    <section className="px-4 sm:px-6 py-16 md:py-20 max-w-6xl mx-auto w-full flex-grow flex flex-col justify-center animate-fade-in relative z-10">
      
      {/* Cabeçalho da Secção com Estilo Cyber */}
      <div className="text-center md:text-left mb-12 space-y-3 max-w-2xl relative z-10">
        {/* Ajuste de contraste para o Modo Claro: text-cyan-750 dark:text-cyan-300 */}
        <span className="text-[9px] font-extrabold uppercase tracking-widest text-cyan-750 dark:text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-3.5 py-1.5 rounded-full inline-block">
          {t('edu_subtitle')}
        </span>
        <h2 className="text-3.5xl md:text-5xl font-black tracking-tight text-textPrimary font-display uppercase bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 drop-shadow-[0_2px_10px_rgba(34,211,238,0.12)]">
          {language === 'pt' ? (
            <>Formação <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">Académica</span></>
          ) : (
            <>Academic <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">Education</span></>
          )}
        </h2>
        <div className="section-divider-cyber"></div>
      </div>

      {/* Secções Verticais Consecutivas de Educação */}
      <div className="space-y-20 relative z-10">
        {Object.entries(groupedEducation).map(([category, items], secIndex) => (
          <div key={category} className="space-y-8 animate-slide-up" style={{ animationDelay: `${secIndex * 0.15}s` }}>
            
            {/* Título de Sub-Secção Premium com separador néon degradê */}
            <div className="flex items-center space-x-4">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block animate-pulse"></span>
              {/* Ajuste de contraste para o Modo Claro: from-cyan-600 to-indigo-600 dark:from-cyan-400 dark:to-indigo-300 */}
              <h3 className="text-lg md:text-xl font-bold uppercase font-display bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 to-indigo-600 dark:from-cyan-400 dark:to-indigo-300 shrink-0">
                {category}
              </h3>
              <div className="h-[1px] flex-grow bg-gradient-to-r from-darkBorder to-transparent"></div>
            </div>

            {/* Grelha de Cartões da Categoria */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((edu, index) => (
                <div 
                  key={edu.id} 
                  onClick={() => setSelectedEdu(edu)}
                  className="group cursor-pointer relative cyber-card p-6 flex flex-col gap-4 rounded-3xl cyber-corners-container animate-cyber-card-reveal hover:-translate-y-1 transition-all duration-300 bg-darkSurface/40 hover:bg-indigo-950/20 border border-darkBorder hover:border-cyan-500/30"
                  style={{ animationDelay: `${index * 0.08}s` }}
                >
                  {/* Mini cantoneiras do cartão académico */}
                  <div className="cyber-corner cyber-corner-tl !w-2.5 !h-2.5"></div>
                  <div className="cyber-corner cyber-corner-tr !w-2.5 !h-2.5"></div>
                  <div className="cyber-corner cyber-corner-bl !w-2.5 !h-2.5"></div>
                  <div className="cyber-corner cyber-corner-br !w-2.5 !h-2.5"></div>

                  {/* Imagem / Logotipo da Escola */}
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl flex-shrink-0 bg-darkBg/60 flex items-center justify-center border border-darkBorder group-hover:border-cyan-400/50 transition-colors overflow-hidden p-1">
                      {edu.image_url ? (
                        <img src={edu.image_url} alt={getInstitution(edu)} className="w-full h-full object-contain" />
                      ) : (
                        <BookOpen size={24} className="text-textSecondary/20" />
                      )}
                    </div>
                    <div className="flex-grow min-w-0">
                      <h4 className="text-sm md:text-base font-bold text-textPrimary group-hover:text-cyan-400 transition-colors font-display uppercase truncate">
                        {decodeHTMLEntities(getDegree(edu))}
                      </h4>
                      {/* Ajuste de contraste para o Modo Claro: from-indigo-600 to-cyan-600 dark:from-indigo-400 dark:to-cyan-300 */}
                      <span className="text-xs font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-cyan-600 dark:from-indigo-400 dark:to-cyan-300 block truncate">
                        {decodeHTMLEntities(getInstitution(edu))}
                      </span>
                    </div>
                  </div>

                  <div className="flex-grow flex flex-col justify-end">
                    <div className="flex items-center space-x-1.5 text-[10px] font-mono text-textSecondary mb-4">
                      {/* Ajuste de contraste para o Modo Claro: text-indigo-650 dark:text-indigo-400 */}
                      <Calendar size={12} className="text-indigo-650 dark:text-indigo-400" />
                      <span>{getDuration(edu)}</span>
                    </div>
                    
                    {/* Ajuste de contraste para o Modo Claro: text-indigo-650 dark:text-indigo-400 group-hover:text-cyan-650 dark:group-hover:text-cyan-300 */}
                    <div className="flex items-center justify-between text-xs font-bold text-indigo-650 dark:text-indigo-400 group-hover:text-cyan-650 dark:group-hover:text-cyan-300 transition-colors border-t border-darkBorder pt-3 mt-auto">
                      <span>{t('edu_view_details')}</span>
                      <ChevronRight size={14} className="transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Overlay para Detalhes Académicos (Mais Informações) */}
      {selectedEdu && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-darkBg/80 backdrop-blur-md animate-fade-in">
          <div 
            className="absolute inset-0 cursor-pointer" 
            onClick={() => setSelectedEdu(null)}
          ></div>
          
          <div className="relative w-full max-w-2xl max-h-[85vh] bg-darkSurface border border-cyan-500/30 rounded-3xl overflow-hidden flex flex-col shadow-2xl shadow-cyan-500/10 cyber-card transition-colors duration-300">
            
            {/* Decorações do Modal */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-indigo-500 to-blue-600"></div>
            
            {/* Cabeçalho do Modal */}
            <div className="flex justify-between items-start p-6 border-b border-darkBorder relative z-10 flex-shrink-0">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex-shrink-0 bg-darkBg/60 flex items-center justify-center border border-darkBorder overflow-hidden shadow-inner p-1.5">
                  {selectedEdu.image_url ? (
                    /* Renderizar imagem completa (sem cortes) no modal usando object-contain e padding */
                    <img src={selectedEdu.image_url} alt={getInstitution(selectedEdu)} className="w-full h-full object-contain" />
                  ) : (
                    <BookOpen size={32} className="text-textSecondary/20" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight text-textPrimary font-display uppercase bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-400">
                    {decodeHTMLEntities(getDegree(selectedEdu))}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm font-bold text-textSecondary mt-1">
                    <span className="flex items-center space-x-1">
                      {/* Ajuste de contraste para o Modo Claro: text-indigo-650 dark:text-indigo-400 */}
                      <BookOpen size={14} className="text-indigo-650 dark:text-indigo-400" />
                      <span className="text-textSecondary">{decodeHTMLEntities(getInstitution(selectedEdu))}</span>
                    </span>
                    {getLocation(selectedEdu) && (
                      <span className="flex items-center space-x-1">
                        <span className="text-white/10 hidden sm:inline">•</span>
                        {/* Ajuste de contraste para o Modo Claro: text-indigo-650 dark:text-indigo-400 */}
                        <MapPin size={14} className="text-indigo-650 dark:text-indigo-400" />
                        <span className="text-textSecondary">{getLocation(selectedEdu)}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => setSelectedEdu(null)}
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
                <span className="uppercase tracking-wider">{getDuration(selectedEdu)}</span>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold text-textPrimary uppercase tracking-widest border-b border-darkBorder pb-2">
                  {language === 'pt' ? 'Detalhes do Curso & Aprendizagem' : 'Course Details & Learning'}
                </h4>
                <div 
                  className="text-sm text-textSecondary leading-relaxed font-sans prose prose-invert select-text max-w-full"
                  dangerouslySetInnerHTML={{ __html: getDescription(selectedEdu).replace(/\\r\\n/g, '<br>') }}
                />
              </div>

              {selectedEdu.link_url && (
                <div className="mt-8 border-t border-darkBorder/60 pt-6 animate-fade-in">
                  <a 
                    href={selectedEdu.link_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold px-5 py-3 rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-indigo-500/10"
                  >
                    <span>{language === 'pt' ? 'Ver Certificado / Referência' : 'View Certificate / Reference'}</span>
                    <ChevronRight size={14} />
                  </a>
                </div>
              )}
              
            </div>
            
            {/* Rodapé do Modal */}
            <div className="p-4 border-t border-darkBorder bg-darkBg/40 flex justify-between items-center text-[10px] font-mono text-textSecondary/30 uppercase tracking-widest select-none relative z-10 flex-shrink-0">
              <span className="flex items-center gap-2">
                <Activity size={12} className="text-cyan-500/50" />
                {t('edu_secure_record')}
              </span>
              <span>
                {getEducationCategory(selectedEdu)}
              </span>
            </div>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
}
