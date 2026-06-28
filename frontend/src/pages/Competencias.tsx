import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Code, Cpu, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

/**
 * Interface que define o modelo de dados de cada Competência (Skill) com suporte i18n completo.
 */
interface Skill {
  id: number;
  name: string;
  level: number;
  category: string;
  category_en?: string;
  subcategory?: string;
  subcategory_en?: string;
  icon?: string;
  description?: string;
  description_en?: string;
  experience_time?: string;
  experience_time_en?: string;
}

/**
 * Descodifica entidades HTML (como &eacute;) em texto simples UTF-8 limpo.
 *
 * @param {string} text Texto HTML a descodificar.
 * @returns {string} Texto limpo de entidades HTML.
 */
function decodeHTMLEntities(text: string): string {
  if (!text) return '';
  const textArea = document.createElement('textarea');
  textArea.innerHTML = text;
  return textArea.value;
}

/**
 * Remove tags HTML e descodifica as entidades de forma 100% segura.
 *
 * @param {string} html Código HTML a processar.
 * @returns {string} Texto puro sem tags.
 */
function stripHtmlAndDecode(html: string): string {
  if (!html) return '';
  const cleanHtml = html.replace(/<[^>]*>/g, '');
  return decodeHTMLEntities(cleanHtml);
}

/**
 * PÁGINA DE COMPETÊNCIAS (CompetenciasPage) - DESIGN DE ALTA FIDELIDADE
 * =====================================================================
 * Apresenta o catálogo de competências do programador, organizado por
 * Categorias Principais (Filtro por Tabs) e sub-organizado em Subcategorias
 * traduzíveis com efeitos premium de vidro fosco (glassmorphism) e glows néon.
 */
export default function CompetenciasPage() {
  const { language } = useLanguage();
  // Aceder à lista de competências disponibilizada globalmente pelo layout público
  const { skills } = useOutletContext<{ skills: Skill[] }>();

  // Estado para controlar o perfil selecionado (Full Stack Developer, Técnico Informático ou Soft Skills)
  const [selectedProfile, setSelectedProfile] = useState<'full-stack' | 'tecnico' | 'soft-skills'>('full-stack');
  const [activeSubcategory, setActiveSubcategory] = useState<string>('Todas');

  // Exibir ecrã de carregamento elegante caso os dados estejam em falta
  if (!skills || skills.length === 0) {
    return (
      <div className="flex-grow flex items-center justify-center bg-darkBg text-textPrimary py-24">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-textSecondary uppercase tracking-widest font-bold animate-pulse">
            {language === 'pt' ? 'A carregar competências...' : 'Loading skills...'}
          </p>
        </div>
      </div>
    );
  }

  /**
   * Obtém dinamicamente o nome da categoria principal ajustado ao idioma selecionado.
   */
  const getSkillCategoryName = (s: Skill) => {
    if (language === 'pt') return s.category;
    return s.category_en || s.category;
  };

  /**
   * Obtém dinamicamente o nome da subcategoria ajustado ao idioma selecionado.
   */
  const getSkillSubcategoryName = (s: Skill) => {
    if (language === 'pt') return s.subcategory || 'Outros';
    return s.subcategory_en || s.subcategory || 'Others';
  };

  // Filtrar as competências em tempo real com base no perfil profissional selecionado (Full Stack, Técnico ou Soft Skills)
  const filteredSkills = skills.filter(skill => {
    const cat = (skill.category || '').toLowerCase();
    
    // Critério específico para Soft Skills
    const isSoftSkills = cat.includes('softskills') || cat.includes('soft skills');
    
    // Critérios para Full Stack Developer
    const isFullStack = !isSoftSkills && (
                        cat.includes('full stack') || 
                        cat.includes('frontend') || 
                        cat.includes('backend') || 
                        cat.includes('developer') || 
                        cat.includes('desenvolvedor') || 
                        cat.includes('programação') || 
                        cat.includes('software') || 
                        cat.includes('web'));
                        
    // Critérios para Técnico Informático / IT
    const isTecnico = !isSoftSkills && (
                      cat.includes('tecnico') || 
                      cat.includes('técnico') || 
                      cat.includes('informatico') || 
                      cat.includes('informático') || 
                      cat.includes('it') || 
                      cat.includes('technician') || 
                      cat.includes('hardware') || 
                      cat.includes('redes') || 
                      cat.includes('network') || 
                      cat.includes('suporte') || 
                      cat.includes('support') || 
                      cat.includes('segurança') || 
                      cat.includes('security') || 
                      cat.includes('sistemas') || 
                      cat.includes('systems'));

    if (selectedProfile === 'soft-skills') {
      return isSoftSkills;
    } else if (selectedProfile === 'full-stack') {
      return isFullStack;
    } else {
      // Perfil Técnico Informático (com fallback para outras que não sejam classificadas)
      return isTecnico || (!isFullStack && !isSoftSkills);
    }
  });

  // Mapear todas as subcategorias existentes dinamicamente dentro das competências filtradas
  const subcategoriesInFiltered = Array.from(new Set(filteredSkills.map(s => getSkillSubcategoryName(s))));

  // Subcategorias disponíveis no grupo selecionado para os botões secundários
  const availableSubcategories = ['Todas', ...subcategoriesInFiltered];

  // Determinar quais subcategorias devem ser exibidas com base no filtro secundário
  const displaySubcategories = activeSubcategory === 'Todas'
    ? subcategoriesInFiltered
    : subcategoriesInFiltered.filter(s => s === activeSubcategory);



  /**
   * Retorna classes de cor néon específicas para a borda ao passar o rato (hover border glow).
   */
  const getCategoryGlow = (category: string) => {
    const cat = category.toLowerCase();
    if (cat === 'full stack developer') {
      return 'group-hover:border-indigo-500/40 hover:shadow-indigo-500/5';
    } else if (cat === 'técnico informático' || cat === 'tecnico informatico' || cat === 'it technician') {
      return 'group-hover:border-cyan-500/40 hover:shadow-cyan-500/5';
    } else if (cat === 'softskills' || cat === 'soft skills') {
      return 'group-hover:border-purple-500/40 hover:shadow-purple-500/5';
    }
    return 'group-hover:border-slate-500/40 hover:shadow-slate-500/5';
  };

  return (
    <section className="px-4 sm:px-6 py-16 md:py-24 max-w-7xl mx-auto w-full flex-grow flex flex-col justify-center animate-fade-in relative z-10 font-sans">
      
      {/* Halos de luz decorativos de fundo para ambientação premium */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-500/5 to-cyan-500/5 rounded-full blur-[120px] pointer-events-none select-none z-0"></div>

      {/* Cabeçalho da Secção com Badges Modernos e Estatísticas Rápidas */}
      <div className="text-center mb-16 space-y-4 max-w-3xl mx-auto relative z-10">
        <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-full backdrop-blur-md">
          <Sparkles size={13} className="text-indigo-400 animate-pulse" />
          {/* Ajuste de contraste para o Modo Claro: text-indigo-600 dark:text-indigo-300 */}
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-300">
            {language === 'pt' ? 'Competências e Nível de Domínio' : 'Skills and Mastery Level'}
          </span>
        </div>
        
        <h2 className="text-3xl md:text-6xl font-black tracking-tight text-textPrimary leading-tight uppercase font-display bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 drop-shadow-[0_2px_10px_rgba(34,211,238,0.12)]">
          {language === 'pt' ? (
            <>Stack <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">Tecnológica</span></>
          ) : (
            <>Technology <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">Stack</span></>
          )}
        </h2>
        
        <div className="section-divider-cyber !mx-auto !my-5"></div>
        
        <p className="text-sm md:text-base text-textSecondary max-w-xl mx-auto leading-relaxed">
          {language === 'pt' 
            ? 'Explore o catálogo dinâmico de ferramentas e linguagens que domino, perfeitamente estruturado e segmentado em subcategorias especializadas.'
            : 'Explore the dynamic catalog of tools and languages I master, perfectly structured and segmented into specialized subcategories.'}
        </p>

        {/* Estatísticas Rápidas */}
        <div className="flex items-center justify-center gap-6 pt-3 text-xs text-textSecondary font-semibold select-none">
          <div className="bg-darkSurface/30 border border-darkBorder px-3.5 py-1.5 rounded-xl">
            <span className="text-textPrimary font-bold">{skills.length}</span> {language === 'pt' ? 'Tecnologias Registadas' : 'Registered Technologies'}
          </div>
          <div className="bg-darkSurface/30 border border-darkBorder px-3.5 py-1.5 rounded-xl">
            <span className="text-textPrimary font-bold">{filteredSkills.length}</span> {language === 'pt' ? 'Tecnologias Ativas' : 'Active Technologies'}
          </div>
        </div>
      </div>

      {/* SELETOR DE PERFIL PROFISSIONAL PREMIUM */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-10 relative z-10 w-full px-4">
        
        {/* Opção Full Stack Developer */}
        <button
          onClick={() => {
            setSelectedProfile('full-stack');
            setActiveSubcategory('Todas');
          }}
          className={`group relative flex flex-col p-6 rounded-3xl border text-left transition-all duration-500 overflow-hidden backdrop-blur-md ${
            selectedProfile === 'full-stack'
              ? 'bg-indigo-500/10 border-indigo-500/40 shadow-lg shadow-indigo-500/10 scale-[1.02]'
              : 'bg-darkSurface/30 border-darkBorder text-textSecondary hover:text-textPrimary hover:bg-darkSurface/50 hover:border-darkBorder/80 hover:scale-[1.01]'
          }`}
        >
          {/* Glow Neon de fundo */}
          <div className={`absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-transparent transition-opacity duration-500 ${selectedProfile === 'full-stack' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}></div>
          
          <div className="w-full flex flex-col justify-between h-full relative z-10 space-y-5">
            {/* Linha Superior: Ícone + Badge */}
            <div className="flex items-center justify-between w-full">
              <div className={`flex items-center justify-center h-12 w-12 rounded-2xl border transition-all duration-500 ${
                selectedProfile === 'full-stack' 
                  ? 'bg-indigo-500/20 border-indigo-400 text-indigo-400' 
                  : 'bg-darkBg/60 border-darkBorder text-zinc-500 group-hover:text-indigo-400 group-hover:border-indigo-500/20'
              }`}>
                <Code size={24} />
              </div>
              
              <div className="text-[10px] font-extrabold px-2.5 py-1 rounded-md bg-darkSurface/50 border border-darkBorder/40 select-none">
                {skills.filter(s => {
                  const cat = (s.category || '').toLowerCase();
                  const isSoft = cat.includes('softskills') || cat.includes('soft skills');
                  return !isSoft && (cat.includes('full stack') || cat.includes('frontend') || cat.includes('backend') || cat.includes('developer') || cat.includes('desenvolvedor') || cat.includes('programação') || cat.includes('software') || cat.includes('web'));
                }).length} {language === 'pt' ? 'Tecnologias' : 'Technologies'}
              </div>
            </div>

            {/* Conteúdo Inferior: Título + Descrição */}
            <div>
              <h3 className={`font-bold tracking-wide font-display text-base transition-colors ${selectedProfile === 'full-stack' ? 'text-textPrimary' : 'text-textSecondary group-hover:text-textPrimary'}`}>
                Full Stack Developer
              </h3>
              <p className="text-[11px] text-textSecondary/80 mt-1.5 leading-relaxed font-sans">
                {language === 'pt' ? 'Desenvolvimento Web, APIs & Engenharia de Software' : 'Web Development, APIs & Software Engineering'}
              </p>
            </div>
          </div>
        </button>

        {/* Opção Técnico Informático */}
        <button
          onClick={() => {
            setSelectedProfile('tecnico');
            setActiveSubcategory('Todas');
          }}
          className={`group relative flex flex-col p-6 rounded-3xl border text-left transition-all duration-500 overflow-hidden backdrop-blur-md ${
            selectedProfile === 'tecnico'
              ? 'bg-cyan-500/10 border-cyan-500/40 shadow-lg shadow-cyan-500/10 scale-[1.02]'
              : 'bg-darkSurface/30 border-darkBorder text-textSecondary hover:text-textPrimary hover:bg-darkSurface/50 hover:border-darkBorder/80 hover:scale-[1.01]'
          }`}
        >
          {/* Glow Neon de fundo */}
          <div className={`absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-transparent transition-opacity duration-500 ${selectedProfile === 'tecnico' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}></div>
          
          <div className="w-full flex flex-col justify-between h-full relative z-10 space-y-5">
            {/* Linha Superior: Ícone + Badge */}
            <div className="flex items-center justify-between w-full">
              <div className={`flex items-center justify-center h-12 w-12 rounded-2xl border transition-all duration-500 ${
                selectedProfile === 'tecnico' 
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-400' 
                  : 'bg-darkBg/60 border-darkBorder text-zinc-500 group-hover:text-cyan-400 group-hover:border-cyan-500/20'
              }`}>
                <Cpu size={24} />
              </div>
              
              <div className="text-[10px] font-extrabold px-2.5 py-1 rounded-md bg-darkSurface/50 border border-darkBorder/40 select-none">
                {skills.filter(s => {
                  const cat = (s.category || '').toLowerCase();
                  const isSoft = cat.includes('softskills') || cat.includes('soft skills');
                  return !isSoft && (cat.includes('técnico') || cat.includes('tecnico') || cat.includes('it') || cat.includes('hardware') || cat.includes('redes') || cat.includes('network') || cat.includes('suporte') || cat.includes('support') || cat.includes('segurança') || cat.includes('security') || cat.includes('sistemas') || cat.includes('systems'));
                }).length} {language === 'pt' ? 'Tecnologias' : 'Technologies'}
              </div>
            </div>

            {/* Conteúdo Inferior: Título + Descrição */}
            <div>
              <h3 className={`font-bold tracking-wide font-display text-base transition-colors ${selectedProfile === 'tecnico' ? 'text-textPrimary' : 'text-textSecondary group-hover:text-textPrimary'}`}>
                {language === 'pt' ? 'Técnico Informático' : 'IT Technician'}
              </h3>
              <p className="text-[11px] text-textSecondary/80 mt-1.5 leading-relaxed font-sans">
                {language === 'pt' ? 'Hardware, Redes, Sistemas & Suporte Técnico' : 'Hardware, Networks, Systems & Tech Support'}
              </p>
            </div>
          </div>
        </button>

        {/* Opção Soft Skills */}
        <button
          onClick={() => {
            setSelectedProfile('soft-skills');
            setActiveSubcategory('Todas');
          }}
          className={`group relative flex flex-col p-6 rounded-3xl border text-left transition-all duration-500 overflow-hidden backdrop-blur-md ${
            selectedProfile === 'soft-skills'
              ? 'bg-purple-500/10 border-purple-500/40 shadow-lg shadow-purple-500/10 scale-[1.02]'
              : 'bg-darkSurface/30 border-darkBorder text-textSecondary hover:text-textPrimary hover:bg-darkSurface/50 hover:border-darkBorder/80 hover:scale-[1.01]'
          }`}
        >
          {/* Glow Neon de fundo */}
          <div className={`absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-transparent transition-opacity duration-500 ${selectedProfile === 'soft-skills' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}></div>
          
          <div className="w-full flex flex-col justify-between h-full relative z-10 space-y-5">
            {/* Linha Superior: Ícone + Badge */}
            <div className="flex items-center justify-between w-full">
              <div className={`flex items-center justify-center h-12 w-12 rounded-2xl border transition-all duration-500 ${
                selectedProfile === 'soft-skills' 
                  ? 'bg-purple-500/20 border-purple-400 text-purple-400' 
                  : 'bg-darkBg/60 border-darkBorder text-zinc-500 group-hover:text-purple-400 group-hover:border-purple-500/20'
              }`}>
                <Sparkles size={24} />
              </div>
              
              <div className="text-[10px] font-extrabold px-2.5 py-1 rounded-md bg-darkSurface/50 border border-darkBorder/40 select-none">
                {skills.filter(s => {
                  const cat = (s.category || '').toLowerCase();
                  return cat.includes('softskills') || cat.includes('soft skills');
                }).length} {language === 'pt' ? 'Habilidades' : 'Skills'}
              </div>
            </div>

            {/* Conteúdo Inferior: Título + Descrição */}
            <div>
              <h3 className={`font-bold tracking-wide font-display text-base transition-colors ${selectedProfile === 'soft-skills' ? 'text-textPrimary' : 'text-textSecondary group-hover:text-textPrimary'}`}>
                Soft Skills
              </h3>
              <p className="text-[11px] text-textSecondary/80 mt-1.5 leading-relaxed font-sans">
                {language === 'pt' ? 'Comunicação, Resolução de Problemas & Trabalho em Equipa' : 'Communication, Problem Solving & Teamwork'}
              </p>
            </div>
          </div>
        </button>

      </div>

      {/* SISTEMA DE FILTROS SECUNDÁRIOS (SUBCATEGORIAS) */}
      {availableSubcategories.length > 2 && (
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12 max-w-3xl mx-auto relative z-10 animate-fade-in">
          {availableSubcategories.map(subcat => (
            /* Ajuste de contraste para o Modo Claro: text-cyan-700 dark:text-cyan-300 */
            <button
              key={subcat}
              onClick={() => setActiveSubcategory(subcat)}
              className={`px-4 py-2 rounded-xl text-[11px] font-bold transition-all duration-300 border ${
                activeSubcategory === subcat
                  ? 'bg-darkSurface border-cyan-500/60 text-cyan-700 dark:text-cyan-300 shadow-md shadow-cyan-500/5 scale-[1.02]'
                  : 'bg-darkSurface/20 border-darkBorder/60 text-textSecondary hover:text-textPrimary hover:bg-darkSurface/40 hover:scale-[1.01]'
              }`}
            >
              <span>{subcat === 'Todas' ? (language === 'pt' ? 'Todas' : 'All') : subcat}</span>
            </button>
          ))}
        </div>
      )}

      {/* ESTRUTURA AGRUPADA POR SUBCATEGORIA COM EFEITO VIDRO E NÉON */}
      <div className="space-y-16 relative z-10">
        {displaySubcategories.map(subcat => {
          const skillsInSubcat = filteredSkills.filter(s => getSkillSubcategoryName(s) === subcat);
          
          return (
            <div key={subcat} className="space-y-6 animate-slide-up">
              
              {/* Título da Subcategoria Estilizado Premium */}
              <div className="flex items-center space-x-4 select-none">
                {/* Ajuste de contraste para o Modo Claro: from-slate-900 to-slate-600 dark:from-zinc-100 dark:to-zinc-400 */}
                <h3 className="text-sm md:text-base font-bold tracking-wider text-textPrimary uppercase font-display bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-zinc-100 dark:to-zinc-400">
                  {subcat}
                </h3>
                <div className="flex-grow h-[1px] bg-gradient-to-r from-indigo-500/20 to-transparent"></div>
                <span className="text-[9px] text-textSecondary/80 uppercase font-extrabold bg-darkSurface/30 border border-darkBorder/40 px-2.5 py-0.5 rounded-md">
                  {skillsInSubcat.length} {skillsInSubcat.length === 1 ? 'Tecnologia' : 'Tecnologias'}
                </span>
              </div>

              {/* Grelha Bento de Competências para esta Subcategoria */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {skillsInSubcat.map(skill => (
                  <div 
                    key={skill.id} 
                    className={`group relative cyber-card p-6 flex flex-col justify-between space-y-5 hover:-translate-y-1.5 transition-all duration-500 overflow-hidden rounded-3xl min-h-[170px] cyber-corners-container ${getCategoryGlow(getSkillCategoryName(skill))}`}
                  >
                    {/* Mini cantoneiras do cartão de tecnologia */}
                    <div className="cyber-corner cyber-corner-tl !w-2.5 !h-2.5"></div>
                    <div className="cyber-corner cyber-corner-tr !w-2.5 !h-2.5"></div>
                    <div className="cyber-corner cyber-corner-bl !w-2.5 !h-2.5"></div>
                    <div className="cyber-corner cyber-corner-br !w-2.5 !h-2.5"></div>

                    {/* Glow Radial Néon Invisível por Defeito - Acende no Hover */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-0"></div>

                    <div className="space-y-4 relative z-10">
                      <div className="flex items-start justify-between">
                        
                        {/* Contentor de Ícone Premium com Animação e Micro-interações */}
                        <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-darkBg/60 border border-darkBorder shadow-inner group-hover:border-indigo-500/20 transition-all duration-500 shrink-0 transform group-hover:scale-110 group-hover:rotate-3 select-none">
                          {skill.icon ? (
                            skill.icon.startsWith('devicon-') ? (
                              /* 1. Suporte a ícones Devicon */
                              <i className={`${skill.icon} colored drop-shadow-md text-3xl transition-transform duration-500`}></i>
                            ) : skill.icon.startsWith('http') || skill.icon.startsWith('/') || skill.icon.startsWith('data:image/') ? (
                              /* 2. Suporte a uploads físicos ou Base64 */
                              <img 
                                src={skill.icon} 
                                alt={skill.name}
                                className="w-9 h-9 object-contain drop-shadow-md transition-transform duration-500 select-none"
                                loading="lazy"
                              />
                            ) : skill.icon.trim().startsWith('<svg') ? (
                              /* 3. Suporte a código SVG inline direto */
                              <div 
                                className="w-9 h-9 flex items-center justify-center text-textSecondary group-hover:text-indigo-400 [&>svg]:w-full [&>svg]:h-full [&>svg]:object-contain transition-all duration-500"
                                dangerouslySetInnerHTML={{ __html: skill.icon }}
                              />
                            ) : (
                              /* 4. Fallback de ícone Lucide */
                              <Code size={24} className="text-zinc-500 group-hover:text-indigo-400 transition-all duration-500" />
                            )
                          ) : (
                            /* Fallback geral em falta */
                            <Code size={24} className="text-zinc-500 group-hover:text-indigo-400 transition-all duration-500" />
                          )}
                        </div>

                        {/* Subcategoria / Badge de Tempo de Experiência */}
                        <div className="flex flex-col items-end space-y-1.5">
                          <span className="text-[8px] font-extrabold uppercase tracking-widest text-textSecondary/60 bg-darkSurface/30 border border-darkBorder/40 px-2.5 py-0.5 rounded-md">
                            {getSkillSubcategoryName(skill)}
                          </span>
                          {/* Ajuste de contraste para o Modo Claro: text-cyan-750 dark:text-cyan-300 bg-cyan-500/10 dark:bg-cyan-950/30 border-cyan-500/20 dark:border-cyan-500/30 */}
                          {skill.experience_time && (
                            <span className="text-[8px] font-extrabold uppercase tracking-widest text-cyan-750 dark:text-cyan-300 bg-cyan-500/10 dark:bg-cyan-950/30 border border-cyan-500/20 dark:border-cyan-500/30 px-2 rounded-full select-none shrink-0">
                              {language === 'pt' ? skill.experience_time : (skill.experience_time_en || skill.experience_time)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Título e Descrição Otimizados */}
                      <div className="space-y-2">
                        <h4 className="font-bold text-textPrimary text-base tracking-wide font-display mt-2 shrink-0 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-zinc-300 transition-colors">
                          {decodeHTMLEntities(skill.name)}
                        </h4>
                        
                        {skill.description && (
                          <p className="text-xs text-textSecondary leading-relaxed opacity-75 group-hover:opacity-100 transition-opacity duration-300 font-sans line-clamp-3">
                            {language === 'pt' ? stripHtmlAndDecode(skill.description) : (stripHtmlAndDecode(skill.description_en || skill.description))}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Barra de Proficiência Premium Néon com Indicador em Hover */}
                    <div className="relative w-full h-1 bg-darkBg/40 rounded-full overflow-hidden shrink-0 mt-2 z-10">
                      <div 
                        className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 rounded-full transition-all duration-1000 group-hover:brightness-125"
                        style={{ width: `${skill.level}%` }}
                      ></div>
                      
                      {/* Percentagem Flutuante ao Hover */}
                      {/* Ajuste de contraste para o Modo Claro: text-indigo-600 dark:text-indigo-300 */}
                      <span className="absolute right-0 top-0 text-[9px] font-extrabold text-indigo-600 dark:text-indigo-300 opacity-0 group-hover:opacity-100 transition-all duration-500 bg-darkSurface px-2 py-0.5 rounded-l-md border-l border-indigo-500/30">
                        {skill.level}% {language === 'pt' ? 'Proficiente' : 'Proficient'}
                      </span>
                    </div>

                  </div>
                ))}
              </div>

            </div>
          );
        })}
      </div>

      {/* Rodapé Dinâmico Decorativo */}
      <div className="mt-16 text-center select-none relative z-10">
        <p className="text-[10px] text-textSecondary uppercase tracking-widest font-extrabold">
          {language === 'pt'
            ? '• Focado em Alto Desempenho, Arquitetura Limpa e Código Seguro •'
            : '• Focused on High Performance, Clean Architecture, and Secure Code •'}
        </p>
      </div>

    </section>
  );
}

