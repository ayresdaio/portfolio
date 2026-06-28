import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Code, ExternalLink, Github } from 'lucide-react';
import ProjectDetailModal from '../components/ProjectDetailModal';
import { useLanguage } from '../context/LanguageContext';

/**
 * Interface que representa as fotos físicas adicionais da galeria.
 */
interface ProjectImage {
  id: number;
  image_url: string;
}

/**
 * Interfaces para receber os dados consolidados do Layout.
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
 * Descodifica entidades HTML (como &eacute;) em texto simples UTF-8 limpo.
 */
function decodeHTMLEntities(text: string): string {
  if (!text) return '';
  const textArea = document.createElement('textarea');
  textArea.innerHTML = text;
  return textArea.value;
}

/**
 * Remove tags HTML e descodifica as entidades de forma 100% segura.
 */
function stripHtmlAndDecode(html: string): string {
  if (!html) return '';
  const cleanHtml = html.replace(/<[^>]*>/g, '');
  return decodeHTMLEntities(cleanHtml);
}

/**
 * PÁGINA DE PROJETOS (ProjetosPage)
 * =====================================================================
 * Apresenta uma galeria refinada (Bento Grid) de todos os desenvolvimentos
 * do utilizador com filtros interativos baseados nas tags de tecnologia.
 */
export default function ProjetosPage() {
  const { language } = useLanguage();
  // Aceder à lista consolidated de projetos disponibilizada pelo Layout
  const { projects } = useOutletContext<{ projects: Project[] }>();
  
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [allTags, setAllTags] = useState<string[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Estado para controlar qual o projeto a ser visualizado em pormenor no modal premium
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Extrair todas as tags únicas de tecnologia dinamicamente
  useEffect(() => {
    if (projects && projects.length > 0) {
      const tagsSet = new Set<string>();
      projects.forEach(p => {
        if (p.tags) {
          p.tags.split(',').forEach(tag => tagsSet.add(tag.trim()));
        }
      });
      setAllTags(['Todos', ...Array.from(tagsSet)]);
    }
  }, [projects]);

  // Transição suave ao mudar o filtro ativo
  const handleFilterChange = (tag: string) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveFilter(tag);
      setIsTransitioning(false);
    }, 250); // Tempo perfeito de fade-out antes da revelação
  };

  // Filtragem de Projetos em tempo real
  const filteredProjects = activeFilter === 'Todos'
    ? projects
    : projects.filter(p => p.tags.split(',').map(t => t.trim()).includes(activeFilter));

  // Caso os dados ainda estejam a carregar
  if (!projects || projects.length === 0) {
    return (
      <div className="flex-grow flex items-center justify-center bg-darkBg text-textPrimary py-24">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-brandBlue border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-textSecondary uppercase tracking-widest">{language === 'pt' ? 'A carregar portfólio de projetos...' : 'Loading project portfolio...'}</p>
        </div>
      </div>
    );
  }

  return (
    <section className="px-4 sm:px-6 py-16 md:py-20 max-w-6xl mx-auto w-full flex-grow flex flex-col justify-center animate-fade-in relative z-10">
      
      {/* Cabeçalho da Secção com Estilo Cyber */}
      <div className="text-center md:text-left mb-12 space-y-3 max-w-2xl relative z-10">
        {/* Ajuste de contraste para o Modo Claro: text-indigo-650 dark:text-indigo-300 */}
        <span className="text-[9px] font-extrabold uppercase tracking-widest text-indigo-650 dark:text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1.5 rounded-full inline-block">
          {language === 'pt' ? 'Trabalho Prático' : 'Practical Work'}
        </span>
        <h2 className="text-3.5xl md:text-5xl font-black tracking-tight text-textPrimary font-display uppercase bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 drop-shadow-[0_2px_10px_rgba(34,211,238,0.12)]">
          {language === 'pt' ? (
            <>Projetos em <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">Destaque</span></>
          ) : (
            <>Featured <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">Projects</span></>
          )}
        </h2>
        <div className="section-divider-cyber"></div>
      </div>

      {/* Barra de Filtros Interativos (Se existirem tags suficientes) */}
      {allTags.length > 2 && (
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-12 animate-slide-up relative z-10">
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => handleFilterChange(tag)}
              className={`px-4 py-2 text-xs rounded-xl font-bold uppercase tracking-wider transition-all duration-300 border ${
                activeFilter === tag 
                  ? 'bg-gradient-to-r from-cyan-500 via-indigo-500 to-blue-600 text-white shadow-lg shadow-indigo-500/20 border-indigo-400 scale-[1.03]' 
                  : 'bg-darkSurface/40 border-darkBorder text-textSecondary hover:text-textPrimary hover:border-slate-800'
              }`}
            >
              {tag === 'Todos' && language === 'en' ? 'All' : tag}
            </button>
          ))}
        </div>
      )}

      {/* Bento Grid de Projetos de Alta Fidelidade com Transição Suave */}
      {filteredProjects.length > 0 ? (
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 relative z-10 transition-all duration-300 ease-out ${isTransitioning ? 'opacity-0 scale-[0.98] blur-sm' : 'opacity-100 scale-100 blur-none'}`}>
          {filteredProjects.map((project, index) => (
            <article 
              key={project.id} 
              onClick={() => setSelectedProject(project)}
              className="group relative cyber-card flex flex-col h-full overflow-hidden rounded-[24px] cursor-pointer cyber-corners-container animate-cyber-card-reveal"
              style={{ animationDelay: `${index * 0.12}s` }}
            >
              {/* Mini cantoneiras do cartão de projeto */}
              <div className="cyber-corner cyber-corner-tl !w-3 !h-3"></div>
              <div className="cyber-corner cyber-corner-tr !w-3 !h-3"></div>
              <div className="cyber-corner cyber-corner-bl !w-3 !h-3"></div>
              <div className="cyber-corner cyber-corner-br !w-3 !h-3"></div>

              {/* Banner do Projeto com Efeito Ken Burns Zoom Dinâmico, CRT Scanlines e Shimmer */}
              <div className="h-52 w-full bg-darkSurface relative overflow-hidden flex items-center justify-center border-b border-darkBorder shrink-0 crt-monitor shimmer-effect">
                {project.image_url ? (
                  <img 
                    src={project.image_url} 
                    alt={project.title} 
                    className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                  />
                ) : (
                  <Code size={40} className="text-zinc-700 group-hover:text-cyan-400 group-hover:scale-110 transition-all duration-500" />
                )}
                {/* Overlay de gradiente OLED no banner */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
              </div>
              
              {/* Corpo de Conteúdo */}
              <div className="p-6 flex-grow flex flex-col justify-between space-y-5 relative z-10">
                <div className="space-y-3">
                  <h3 className="text-base font-bold text-textPrimary group-hover:text-cyan-400 group-hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.35)] transition-all duration-500 font-display tracking-wide leading-tight">
                    {decodeHTMLEntities(project.title)}
                  </h3>
                  <p className="text-xs text-textSecondary leading-relaxed line-clamp-4 font-sans font-medium">
                    {stripHtmlAndDecode(project.description)}
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Cápsulas de Tecnologia com Glow no Hover do Cartão */}
                  <div className="flex flex-wrap gap-1.5">
                    {project.tags.split(',').map(tag => (
                      /* Ajuste de contraste para o Modo Claro: text-indigo-650 dark:text-indigo-300 e nos hovers */
                      <span 
                        key={tag} 
                        className="text-[8px] font-extrabold uppercase tracking-widest bg-indigo-500/5 text-indigo-650 dark:text-indigo-300 border border-indigo-500/15 px-2.5 py-1 rounded-full group-hover:border-indigo-400/30 group-hover:bg-indigo-500/10 group-hover:text-indigo-600 dark:group-hover:text-indigo-200 transition-all duration-500"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>

                  {/* Links e Ações */}
                  <div className="flex items-center space-x-3 pt-4 border-t border-darkBorder">
                    {project.demo_url && (
                      <a 
                        href={project.demo_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        onClick={(e) => e.stopPropagation()} // Impede que o clique no link ative a abertura do modal
                        className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-450 hover:to-indigo-550 text-white rounded-xl text-[10px] font-bold tracking-wider uppercase flex items-center space-x-1.5 shadow-md shadow-indigo-500/10 hover:shadow-cyan-400/20 active:scale-[0.98] transition-all duration-300 shimmer-effect overflow-hidden relative"
                      >
                        <span className="relative z-10">Demo</span>
                        <ExternalLink size={10} className="relative z-10 shrink-0" />
                      </a>
                    )}
                    {project.repo_url && (
                      <a 
                        href={project.repo_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        onClick={(e) => e.stopPropagation()} // Impede que o clique no link ative a abertura do modal
                        className="px-4 py-2 bg-darkBg/20 hover:bg-darkSurface text-textSecondary hover:text-textPrimary border border-darkBorder hover:border-darkBorder/80 rounded-xl text-[10px] font-bold tracking-wider uppercase flex items-center space-x-1.5 active:scale-[0.98] transition-all duration-300"
                      >
                        <Github size={10} className="shrink-0" />
                        <span>{language === 'pt' ? 'Código' : 'Code'}</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 cyber-card cyber-corners-container bg-darkSurface/20">
          <div className="cyber-corner cyber-corner-tl !w-2 !h-2"></div>
          <div className="cyber-corner cyber-corner-tr !w-2 !h-2"></div>
          <div className="cyber-corner cyber-corner-bl !w-2 !h-2"></div>
          <div className="cyber-corner cyber-corner-br !w-2 !h-2"></div>
          <p className="text-textSecondary text-xs font-bold uppercase tracking-wider">{language === 'pt' ? 'Nenhum projeto encontrado para a tecnologia selecionada.' : 'No projects found for the selected technology.'}</p>
        </div>
      )}

      {/* Renderização do Modal de Pormenores do Projeto */}
      {selectedProject && (
        <ProjectDetailModal 
          project={selectedProject} 
          onClose={() => setSelectedProject(null)} 
        />
      )}
    </section>
  );
}

