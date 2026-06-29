import { useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { 
  Github, 
  Linkedin, 
  Mail, 
  ChevronRight, 
  ChevronLeft,
  X,
  User, 
  Briefcase, 
  MapPin, 
  Code,
  ExternalLink,
  Facebook,
  Instagram,
  Terminal,
  Database,
  Eye
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

/**
 * Interface que representa os dados estruturados do perfil recebidos do Layout.
 */
interface Profile {
  name: string;
  role: string;
  bio: string;
  email: string;
  phone?: string;
  location?: string;
  github_url?: string;
  linkedin_url?: string;
  facebook_url?: string;
  instagram_url?: string;
  avatar_url?: string;
  cv_url?: string;
  cv_url_en?: string;
  cv_url_tech?: string;
  cv_url_tech_en?: string;
  about_text?: string;
  about_image_url?: string;
}

import ProjectDetailModal from '../components/ProjectDetailModal';
import CVPreviewModal from '../components/CVPreviewModal';

/**
 * Interface que representa as fotos físicas adicionais da galeria.
 */
interface ProjectImage {
  id: number;
  image_url: string;
}

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
 * PÁGINA PORTAL DE ENTRADA (HomePage)
 * =====================================================================
 * Serve como cartão de visita do utilizador. Contém uma secção Hero de alto
 * impacto visual com moldura flutuante, orbes néon de decoração, um sumário 
 * dinâmico "Sobre Mim" e uma bento grid com os 3 principais projetos ativos.
 */
export default function HomePage() {
  const { language, t } = useLanguage();
  // Aceder aos dados centrais partilhados pelo Layout público (evitando fetchs paralelos)
  const { profile, projects, about_images } = useOutletContext<{ 
    profile: Profile | null; 
    projects: Project[];
    about_images?: { id: number; image_url: string; caption?: string; sort_order: number }[];
  }>();
  const [activeCodeTab, setActiveCodeTab] = useState<'tsx' | 'sh' | 'sql'>('tsx');
  
  // Estado para controlar qual o projeto que está a ser detalhado no modal premium
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  // Estado para controlar qual o currículo que está a ser visualizado no modal
  const [cvUrlToPreview, setCvUrlToPreview] = useState<string | null>(null);
  const [cvTitleToPreview, setCvTitleToPreview] = useState('');

  // Estados para o carrossel de fotos "Sobre Mim" e o Lightbox respetivo
  const [activeAboutImageIndex, setActiveAboutImageIndex] = useState(0);
  const [lightboxAboutOpen, setLightboxAboutOpen] = useState(false);
  const [lightboxAboutImageIndex, setLightboxAboutImageIndex] = useState(0);

  // Se os dados essenciais do perfil ainda estiverem a carregar, exibe o spinner
  if (!profile) {
    return (
      <div className="flex-grow flex items-center justify-center bg-darkBg text-textPrimary py-24">
        <div className="w-10 h-10 border-2 border-brandBlue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Filtrar para exibir apenas os 3 primeiros projetos principais no portal
  const topProjects = projects.slice(0, 3);

  return (
    <div className="flex-grow flex flex-col w-full animate-fade-in relative z-10 bg-[linear-gradient(rgba(255,255,255,0.007)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.007)_1px,transparent_1px)] bg-[size:40px_40px]">
      
      {/* -------------------------------------------------------------
          1. HERO SECTION / CAPA PREMIUM (Grelha Assimétrica de Luxo)
          ------------------------------------------------------------- */}
      <section className="px-4 sm:px-6 py-16 md:py-24 flex items-center max-w-6xl mx-auto w-full flex-col-reverse md:flex-row gap-8 md:gap-12 relative z-10">
        
        {/* Lado Esquerdo: Textos de Impacto e Links Rápidos */}
        <div className="flex-1 space-y-6 text-center md:text-left">
          
          {/* Badge de Disponibilidade Neon */}
          <div className="inline-flex items-center space-x-2.5 px-3.5 py-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-xs font-bold uppercase tracking-wider animate-pulse-glow font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 inline-block relative">
              <span className="absolute inset-0 rounded-full bg-indigo-400 animate-ping opacity-75"></span>
            </span>
            <span>{language === 'pt' ? 'Disponível para Projetos' : 'Available for Projects'}</span>
          </div>

          {/* Título com Texto de Destaque Gradiente */}
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-textPrimary leading-none font-display">
            {language === 'pt' ? 'Olá, eu sou o ' : 'Hello, I am '}<span className="text-gradient block md:inline">{profile.name}</span>
          </h1>
          
          <p className="text-xl md:text-2xl font-semibold text-textSecondary tracking-tight font-display">
            {decodeHTMLEntities(profile.role)}
          </p>
          
          <div 
            className="text-base md:text-lg text-textSecondary max-w-xl leading-relaxed font-sans [&>p]:inline-block"
            dangerouslySetInnerHTML={{ __html: profile.bio || '' }}
          />

          {/* Chamadas à Ação (CTAs) em Efeito Tridimensional Físico */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-4">
            <Link 
              to="/contacto" 
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 transition-all duration-300 hover:-translate-y-0.5 flex items-center space-x-2"
            >
              <span>{language === 'pt' ? 'Trabalhar Comigo' : 'Work With Me'}</span>
              <ChevronRight size={18} />
            </Link>

            {profile.cv_url && (
              <button 
                onClick={() => {
                  setCvUrlToPreview(profile.cv_url || null);
                  setCvTitleToPreview(language === 'pt' ? 'Currículo Full Stack Developer' : 'Full Stack Developer Resume');
                }}
                className="px-6 py-3 bg-zinc-900/40 border border-white/5 hover:border-indigo-500/30 text-textPrimary hover:text-white backdrop-blur-md rounded-xl transition-all duration-300 hover:-translate-y-0.5 flex items-center space-x-2"
              >
                <Eye size={18} />
                <span>{language === 'pt' ? 'CV Full Stack' : 'Full Stack CV'}</span>
              </button>
            )}

            {profile.cv_url_tech && (
              <button 
                onClick={() => {
                  setCvUrlToPreview(profile.cv_url_tech || null);
                  setCvTitleToPreview(language === 'pt' ? 'Currículo Técnico' : 'Technical Resume');
                }}
                className="px-6 py-3 bg-zinc-900/40 border border-white/5 hover:border-indigo-500/30 text-textPrimary hover:text-white backdrop-blur-md rounded-xl transition-all duration-300 hover:-translate-y-0.5 flex items-center space-x-2"
              >
                <Eye size={18} />
                <span>{language === 'pt' ? 'CV Técnico' : 'Technical CV'}</span>
              </button>
            )}
          </div>

          {/* Atalhos Rápidos para Redes Sociais com Glow Radial */}
          <div className="flex items-center justify-center md:justify-start space-x-5 pt-6 text-textSecondary">
            {profile.linkedin_url && (
              <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition-colors" aria-label="LinkedIn">
                <Linkedin size={22} />
              </a>
            )}
            {profile.github_url && (
              <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition-colors" aria-label="GitHub">
                <Github size={22} />
              </a>
            )}
            {profile.facebook_url && (
              <a href={profile.facebook_url} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition-colors" aria-label="Facebook">
                <Facebook size={22} />
              </a>
            )}
            {profile.instagram_url && (
              <a href={profile.instagram_url} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition-colors" aria-label="Instagram">
                <Instagram size={22} />
              </a>
            )}
            <a href={`mailto:${profile.email}`} className="hover:text-indigo-400 transition-colors" aria-label="E-mail">
              <Mail size={22} />
            </a>
          </div>
        </div>

        {/* Lado Direito: Fotografia Flutuante Estilo Estúdio OLED */}
        <div className="flex-grow-0 flex items-center justify-center relative animate-float">
          {/* Orbe de luz néon traseiro com maior opacidade em modo claro para contraste dinâmico */}
          <div className="absolute inset-0 bg-indigo-500/20 dark:bg-indigo-600/10 rounded-[2rem] blur-3xl pointer-events-none scale-75 animate-pulse-glow"></div>
          {/* Efeito de moldura flutuante premium com vidro fosco e sombreado de destaque tridimensional no Modo Claro */}
          <div className="relative w-52 aspect-[3/4] sm:w-72 md:w-80 lg:w-[22rem] rounded-[2rem] border border-indigo-200/80 dark:border-darkBorder p-3 bg-white/80 dark:bg-darkSurface/20 backdrop-blur-xl shadow-2xl shadow-indigo-150/45 dark:shadow-2xl dark:shadow-black/85 hover:border-indigo-400 dark:hover:border-indigo-500/20 transition-colors duration-500">
            {/* Div interior que serve de fundo com matiz suave azul/indigo em modo claro e preto puro OLED em modo escuro */}
            <div className="w-full h-full rounded-[1.5rem] overflow-hidden bg-indigo-50/20 dark:bg-darkBg flex items-center justify-center relative border border-indigo-150/50 dark:border-darkBorder shadow-inner">
              {profile.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt={profile.name} 
                  className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700"
                />
              ) : (
                <User size={96} className="text-zinc-650" />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          2. SECÇÃO SOBRE (Resumo Rápido e Focado)
          ------------------------------------------------------------- */}
      <section className="px-4 sm:px-6 py-16 md:py-24 bg-darkSurface border-y border-darkBorder relative overflow-hidden z-10 transition-colors duration-300">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid md:grid-cols-12 gap-12 items-center">
            
            {/* Foto Retrato sobreposta / Galeria de Imagens do Sobre Mim */}
            <div className="md:col-span-5 flex justify-center">
              <div className="relative group max-w-sm w-full">
                <div className="absolute -inset-1.5 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-2xl blur opacity-20 group-hover:opacity-35 transition duration-1000"></div>
                <div className="relative glass-panel p-3 overflow-hidden rounded-[2rem] bg-darkSurface/40 border border-darkBorder group/carousel">
                  <div className="aspect-[3/4] w-full rounded-[1.5rem] overflow-hidden bg-darkSurface border border-darkBorder relative">
                    {about_images && about_images.length > 0 ? (
                      <>
                        <div 
                          className="w-full h-full relative cursor-pointer"
                          onClick={() => {
                            setLightboxAboutImageIndex(activeAboutImageIndex);
                            setLightboxAboutOpen(true);
                          }}
                        >
                          <img 
                            src={about_images[activeAboutImageIndex].image_url} 
                            alt={about_images[activeAboutImageIndex].caption || "Sobre mim"} 
                            className="w-full h-full object-cover object-top transition-transform duration-700 hover:scale-105"
                          />
                          
                          {/* Legenda PT/EN em overlay */}
                          {about_images[activeAboutImageIndex].caption && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-md px-4 py-2.5 border-t border-darkBorder/30 text-xs text-textSecondary font-semibold select-none text-center">
                              {about_images[activeAboutImageIndex].caption}
                            </div>
                          )}
                        </div>

                        {/* Setas de Controlo de Carousel (Apenas se houver mais de 1 foto) */}
                        {about_images.length > 1 && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveAboutImageIndex(prev => (prev - 1 + about_images.length) % about_images.length);
                              }}
                              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-darkSurface/90 border border-darkBorder/60 text-textSecondary hover:text-cyan-400 hover:scale-105 transition-all opacity-0 group-hover/carousel:opacity-100 duration-300 z-20 cursor-pointer"
                              title="Anterior"
                            >
                              <ChevronLeft size={16} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveAboutImageIndex(prev => (prev + 1) % about_images.length);
                              }}
                              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-darkSurface/90 border border-darkBorder/60 text-textSecondary hover:text-cyan-400 hover:scale-105 transition-all opacity-0 group-hover/carousel:opacity-100 duration-300 z-20 cursor-pointer"
                              title="Seguinte"
                            >
                              <ChevronRight size={16} />
                            </button>

                            {/* Pontos Indicadores (Dots) */}
                            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center space-x-1.5 z-20">
                              {about_images.map((_, idx) => (
                                <button
                                  key={idx}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveAboutImageIndex(idx);
                                  }}
                                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 cursor-pointer ${idx === activeAboutImageIndex ? 'bg-cyan-400 w-3' : 'bg-white/30 hover:bg-white/50'}`}
                                  aria-label={`Slide ${idx + 1}`}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </>
                    ) : profile.about_image_url || profile.avatar_url ? (
                      <img 
                        src={profile.about_image_url || profile.avatar_url} 
                        alt="Sobre mim" 
                        className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-darkSurface">
                        <User size={80} className="text-textSecondary/30" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* História Curta e Factos Rápidos */}
            <div className="md:col-span-7 space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">{language === 'pt' ? 'Uma Breve Introdução' : 'A Brief Introduction'}</span>
                <h2 className="text-3xl md:text-4xl font-extrabold text-textPrimary tracking-tight font-display">
                  {t('about_who_am_i')}
                </h2>
              </div>

              <p className="text-textSecondary leading-relaxed text-base font-sans select-text">
                {profile.about_text ? (
                  stripHtmlAndDecode(profile.about_text).substring(0, 350) + (stripHtmlAndDecode(profile.about_text).length > 350 ? "..." : "")
                ) : (
                  stripHtmlAndDecode(profile.bio)
                )}
              </p>

              {/* Informações Resumidas */}
              <div className="grid sm:grid-cols-2 gap-4 pt-4">
                  <div className="glass-panel p-4 flex items-center space-x-4 bg-darkSurface/40 border border-darkBorder">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                      <Code size={20} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-textSecondary">{t('home_code_stat_title')}</span>
                      <h4 className="text-sm font-extrabold text-textPrimary font-mono mt-0.5">300,000+</h4>
                    </div>
                  </div>
              
                <div className="glass-panel p-4 flex items-center space-x-4 bg-darkSurface/40 border border-darkBorder">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
                      <MapPin size={18} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-[10px] text-textSecondary font-semibold uppercase tracking-wider">{t('about_location')}</h4>
                      <p className="text-sm font-semibold text-textPrimary truncate">{profile.location}</p>
                    </div>
                  </div>

                  <div className="glass-panel p-4 flex items-center space-x-4 bg-darkSurface/40 border border-darkBorder">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 shrink-0">
                    <Briefcase size={18} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-[10px] text-textSecondary font-semibold uppercase tracking-wider">{language === 'pt' ? 'Cargo Atual' : 'Current Role'}</h4>
                    <p className="text-sm font-semibold text-textPrimary truncate">{decodeHTMLEntities(profile.role)}</p>
                  </div>
                </div>
              </div>

              {/* Botão de Atalho para História Completa */}
              <div className="pt-4 flex justify-center sm:justify-start">
                <Link 
                  to="/sobre" 
                  className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  <span>{language === 'pt' ? 'Ler História Completa' : 'Read Full Story'}</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          2.5 CONSOLA DE ENGENHARIA INTERATIVA (Mini VS Code OLED)
          ------------------------------------------------------------- */}
      <section className="px-4 sm:px-6 py-16 md:py-24 max-w-6xl mx-auto w-full relative z-10 border-t border-darkBorder">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 font-mono">0x02_desenvolvimento</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-textPrimary tracking-tight font-display">{language === 'pt' ? 'Consola de Engenharia' : 'Engineering Console'}</h2>
          <p className="text-textSecondary text-sm md:text-base">
            {language === 'pt' 
              ? 'Explore de forma interativa a lógica e os scripts de sistemas que utilizo no meu dia a dia como programador e técnico de infraestruturas.'
              : 'Interactively explore the system logic and scripts I use daily as a programmer and infrastructure technician.'}
          </p>
        </div>

        {/* Simulador de VS Code - Mantém o design escuro original de forma estrita para legibilidade perfeita do realce de sintaxe */}
        <div className="w-full overflow-hidden bg-zinc-950 border border-zinc-800 shadow-2xl rounded-3xl animate-slide-up relative">
          {/* Barra de Abas do Editor */}
          <div className="flex items-center justify-between bg-zinc-900/60 border-b border-zinc-800 px-4 py-2 flex-wrap gap-2">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <button 
                onClick={() => setActiveCodeTab('tsx')}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-[10px] sm:text-xs font-bold font-mono transition-all ${
                  activeCodeTab === 'tsx' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Code size={12} className="text-cyan-400" />
                <span>AyresDaio.tsx</span>
              </button>

              <button 
                onClick={() => setActiveCodeTab('sh')}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-[10px] sm:text-xs font-bold font-mono transition-all ${
                  activeCodeTab === 'sh' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Terminal size={12} className="text-emerald-400" />
                <span>diagnostico.sh</span>
              </button>

              <button 
                onClick={() => setActiveCodeTab('sql')}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-[10px] sm:text-xs font-bold font-mono transition-all ${
                  activeCodeTab === 'sql' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Database size={12} className="text-purple-400" />
                <span>portfolio.sql</span>
              </button>
            </div>
            
            {/* Círculos da Janela Mac/Linux */}
            <div className="hidden sm:flex space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/30 inline-block"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/30 inline-block"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/30 inline-block"></span>
            </div>
          </div>

          {/* Área de Visualização do Código - Utilização de cores escuras fixas para legibilidade no Modo Claro */}
          <div className="p-6 font-mono text-xs sm:text-sm text-zinc-300 leading-relaxed overflow-x-auto bg-zinc-950/40 flex">
            {/* Números das Linhas */}
            <div className="select-none text-right pr-6 border-r border-zinc-800 text-zinc-600 space-y-1">
              {Array.from({ length: activeCodeTab === 'tsx' ? 12 : activeCodeTab === 'sh' ? 14 : 9 }).map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>

            {/* Conteúdo Dinâmico do Código com Syntax Highlighting HSL */}
            <div className="pl-6 space-y-1 flex-grow min-w-[320px]">
              {activeCodeTab === 'tsx' && (
                <div className="space-y-1 animate-fade-in">
                  <p><span className="text-purple-400">import</span> &#123; <span className="text-cyan-400">{language === 'pt' ? 'Programador' : 'Developer'}</span> &#125; <span className="text-purple-400">from</span> <span className="text-emerald-400">'ayres-daio'</span>;</p>
                  <p className="text-white/20">{language === 'pt' ? '// Definição do Perfil e Stack do Engenheiro' : '// Engineer Profile & Stack Definition'}</p>
                  <p><span className="text-purple-400">export default function</span> <span className="text-blue-400">{language === 'pt' ? 'Biografia' : 'Biography'}</span>() &#123;</p>
                  <p className="pl-4"><span className="text-purple-400">return</span> (</p>
                  <p className="pl-8 text-indigo-400">&lt;<span className="text-cyan-400">{language === 'pt' ? 'Programador' : 'Developer'}</span></p>
                  <p className="pl-12 text-amber-400">nome<span className="text-purple-400">=</span><span className="text-emerald-400">"{profile.name}"</span></p>
                  <p className="pl-12 text-amber-400">cargo<span className="text-purple-400">=</span><span className="text-emerald-400">"{decodeHTMLEntities(profile.role)}"</span></p>
                  <p className="pl-12 text-amber-400">especialidade<span className="text-purple-400">=</span><span className="text-emerald-400">"{language === 'pt' ? 'Sistemas Web & Bases de Dados' : 'Web Systems & Databases'}"</span></p>
                  <p className="pl-12 text-amber-400">stack<span className="text-purple-400">=</span>&#123;[<span className="text-emerald-400">'React', 'PHP', 'MySQL', 'Linux'</span>]&#125;</p>
                  <p className="pl-12 text-amber-400">estado<span className="text-purple-400">=</span><span className="text-emerald-400">"{language === 'pt' ? 'Sempre Online para Desafios' : 'Always Online for Challenges'}"</span></p>
                  <p className="pl-8 text-indigo-400">/&gt;</p>
                  <p className="pl-4">);</p>
                  <p>&#125;</p>
                </div>
              )}

              {activeCodeTab === 'sh' && (
                <div className="space-y-1 animate-fade-in text-emerald-400/80">
                  <p><span className="text-purple-400">#!/bin/bash</span></p>
                  <p className="text-white/20">{language === 'pt' ? '# Diagnóstico Automático do Servidor Web e Redes' : '# Automatic Web Server & Network Diagnostics'}</p>
                  <p><span className="text-purple-400">echo</span> <span className="text-emerald-400">"{language === 'pt' ? 'Iniciando Diagnóstico do Sistema...' : 'Starting System Diagnostics...'}"</span></p>
                  <p><span className="text-cyan-400">uptime_status</span>=<span className="text-amber-400">$(uptime -p)</span></p>
                  <p><span className="text-purple-400">echo</span> <span className="text-emerald-400">"{language === 'pt' ? 'Uptime do Servidor: $uptime_status' : 'Server Uptime: $uptime_status'}"</span></p>
                  <p className="text-white/20">{language === 'pt' ? '# Verificação dos barramentos e portas informáticas' : '# Port & bus diagnostics'}</p>
                  <p><span className="text-cyan-400">services</span>=(<span className="text-amber-400">"apache_web" "mysql_db" "ssh_tunnel" "firewall_protect"</span>)</p>
                  <p><span className="text-purple-400">for</span> svc <span className="text-purple-400">in</span> <span className="text-emerald-400">"</span><span className="text-amber-400">$&#123;services[@]&#125;</span><span className="text-emerald-400">"</span>; <span className="text-purple-400">do</span></p>
                  <p className="pl-4"><span className="text-purple-400">echo</span> <span className="text-emerald-400">"[STATUS] Servidor $svc: </span><span className="text-cyan-400">{language === 'pt' ? '100% OPERACIONAL' : '100% OPERATIONAL'}</span><span className="text-emerald-400">"</span></p>
                  <p><span className="text-purple-400">done</span></p>
                  <p><span className="text-purple-400">echo</span> <span className="text-emerald-400">"{language === 'pt' ? 'Ligação de Redes: 1 Gbps Dedicado' : 'Network Connection: 1 Gbps Dedicated'}"</span></p>
                  <p><span className="text-purple-400">echo</span> <span className="text-emerald-400">"{language === 'pt' ? 'Segurança Física & Lógica: Sem Ameaças Detetadas' : 'Physical & Logical Security: No Threats Detected'}"</span></p>
                  <p><span className="text-purple-400">echo</span> <span className="text-emerald-400">"{language === 'pt' ? 'Uuptime global garantido.' : 'Global uptime guaranteed.'}"</span></p>
                </div>
              )}

              {activeCodeTab === 'sql' && (
                <div className="space-y-1 animate-fade-in text-cyan-400/80">
                  <p className="text-white/20">{language === 'pt' ? '-- Query Relacional Segura para Carregamento de Portfólio' : '-- Secure Relational Query for Portfolio Loading'}</p>
                  <p><span className="text-purple-400">SELECT</span></p>
                  <p className="pl-4">p.<span className="text-amber-400">name</span>, p.<span className="text-amber-400">role</span>,</p>
                  <p className="pl-4"><span className="text-purple-400">COUNT</span>(s.<span className="text-amber-400">id</span>) <span className="text-purple-400">AS</span> <span className="text-emerald-400">total_skills</span></p>
                  <p><span className="text-purple-400">FROM</span> profile p</p>
                  <p><span className="text-purple-400">LEFT JOIN</span> skills s <span className="text-purple-400">ON</span> s.<span className="text-amber-400">category</span> = <span className="text-emerald-400">'Backend'</span></p>
                  <p><span className="text-purple-400">WHERE</span> p.<span className="text-amber-400">id</span> = <span className="text-cyan-400">1</span></p>
                  <p><span className="text-purple-400">GROUP BY</span> p.<span className="text-amber-400">name</span>, p.<span className="text-amber-400">role</span>;</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          3. SECÇÃO PROJETOS (Destaque Bento Grid)
          ------------------------------------------------------------- */}
      <section className="px-4 sm:px-6 py-16 md:py-24 max-w-6xl mx-auto w-full relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">{t('nav_projects')}</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-textPrimary tracking-tight font-display">{language === 'pt' ? 'Destaques Recentes' : 'Recent Highlights'}</h2>
          <p className="text-textSecondary text-sm md:text-base">
            {language === 'pt'
              ? 'Explore uma amostra dos desenvolvimentos dinâmicos que criei, unindo funcionalidade técnica à beleza visual.'
              : 'Explore a sample of the dynamic developments I created, uniting technical functionality with visual beauty.'}
          </p>
        </div>

        {topProjects.length > 0 ? (
          <div className="space-y-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {topProjects.map(project => (
                <article 
                  key={project.id} 
                  onClick={() => setSelectedProject(project)}
                  className="glass-panel-interactive flex flex-col h-full overflow-hidden group border border-darkBorder bg-darkSurface/30 cursor-pointer"
                >
                  
                  {/* Foto de Capa do Projeto com Ken Burns */}
                  <div className="h-48 w-full bg-black/60 relative overflow-hidden flex items-center justify-center border-b border-darkBorder">
                    {project.image_url ? (
                      <img 
                        src={project.image_url} 
                        alt={project.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <Code size={48} className="text-slate-700 group-hover:text-brandBlue transition-transform duration-500" />
                    )}
                  </div>

                  {/* Informações detalhadas do cartão */}
                  <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-textPrimary group-hover:text-brandBlue transition-colors font-display">
                        {project.title}
                      </h3>
                      <p className="text-sm text-textSecondary line-clamp-3 leading-relaxed font-sans">
                        {stripHtmlAndDecode(project.description)}
                      </p>
                    </div>

                    <div className="space-y-4">
                      {/* Tags de Tecnologias */}
                      <div className="flex flex-wrap gap-1.5">
                        {project.tags.split(',').map(tag => (
                          <span key={tag} className="text-[10px] font-semibold bg-blue-950/20 text-blue-300 border border-blue-900/30 px-2.5 py-1 rounded-full">
                            {tag.trim()}
                          </span>
                        ))}
                      </div>

                      {/* Rodapé do Cartão */}
                      <div className="flex items-center space-x-3 pt-4 border-t border-darkBorder">
                        {project.demo_url && (
                          <a 
                            href={project.demo_url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            onClick={(e) => e.stopPropagation()} // Impede que o clique no link ative a abertura do modal
                            className="px-3.5 py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 hover:border-blue-400/40 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all hover:-translate-y-0.5"
                          >
                            <span>Live Demo</span>
                            <ExternalLink size={12} />
                          </a>
                        )}
                        {project.repo_url && (
                          <a 
                            href={project.repo_url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            onClick={(e) => e.stopPropagation()} // Impede que o clique no link ative a abertura do modal
                            className="px-3.5 py-2 bg-white/5 hover:bg-white/10 text-textSecondary hover:text-textPrimary border border-white/5 hover:border-white/10 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all hover:-translate-y-0.5"
                          >
                            <Github size={12} />
                            <span>{language === 'pt' ? 'Código' : 'Code'}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                </article>
              ))}
            </div>

            {/* CTA Central para ver todos os projetos */}
            <div className="flex justify-center pt-4">
              <Link 
                to="/projetos" 
                className="px-8 py-3.5 bg-zinc-900/40 border border-white/5 hover:border-indigo-500/30 text-textPrimary hover:text-white rounded-xl shadow-2xl transition-all duration-300 hover:-translate-y-0.5 flex items-center space-x-2 text-sm font-semibold"
              >
                <span>{language === 'pt' ? 'Ver Todos os Projetos' : 'View All Projects'}</span>
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center p-12 glass-panel bg-black/40 border border-white/5">
            <p className="text-textSecondary">{language === 'pt' ? 'Sem projetos registados de momento.' : 'No projects registered at the moment.'}</p>
          </div>
        )}
      </section>

      {/* Renderização do Modal Premium de Pormenores do Projeto */}
      {selectedProject && (
        <ProjectDetailModal 
          project={selectedProject} 
          onClose={() => setSelectedProject(null)} 
        />
      )}

      {/* Renderização do Modal Premium de Pré-visualização do Currículo selecionado */}
      {cvUrlToPreview && (
        <CVPreviewModal 
          cvUrl={cvUrlToPreview} 
          title={cvTitleToPreview}
          onClose={() => {
            setCvUrlToPreview(null);
            setCvTitleToPreview('');
          }} 
        />
      )}

      {/* Lightbox da Galeria de Fotos do Sobre Mim */}
      {lightboxAboutOpen && about_images && about_images.length > 0 && (
        <div 
          className="fixed inset-0 z-[10000] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setLightboxAboutOpen(false)}
        >
          {/* Botão Fechar */}
          <button 
            onClick={() => setLightboxAboutOpen(false)}
            className="absolute top-5 right-5 z-[10010] p-2.5 bg-darkBg/60 hover:bg-darkSurface border border-darkBorder text-textSecondary hover:text-textPrimary rounded-full transition-all duration-300 hover:rotate-90 active:scale-95 cursor-pointer"
            aria-label="Fechar Lightbox"
          >
            <X size={18} />
          </button>

          {/* Seta Esquerda */}
          {about_images.length > 1 && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setLightboxAboutImageIndex(prev => (prev - 1 + about_images.length) % about_images.length);
              }}
              className="absolute left-4 p-3 rounded-xl bg-darkSurface/60 border border-darkBorder text-textSecondary hover:text-cyan-400 hover:scale-105 transition-all z-[10010] cursor-pointer"
              title="Anterior"
            >
              <ChevronLeft size={20} />
            </button>
          )}

          {/* Imagem Central */}
          <div 
            className="relative max-w-6xl max-h-[90vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={about_images[lightboxAboutImageIndex].image_url} 
              alt={about_images[lightboxAboutImageIndex].caption || ''} 
              className="max-w-full max-h-[82vh] object-contain rounded-2xl border border-darkBorder/40 shadow-2xl select-none"
            />
            {about_images[lightboxAboutImageIndex].caption && (
              <p className="mt-4 text-sm text-textPrimary bg-darkSurface/90 border border-darkBorder/60 px-5 py-2.5 rounded-2xl text-center font-semibold max-w-lg shadow-xl">
                {about_images[lightboxAboutImageIndex].caption}
              </p>
            )}
          </div>

          {/* Seta Direita */}
          {about_images.length > 1 && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setLightboxAboutImageIndex(prev => (prev + 1) % about_images.length);
              }}
              className="absolute right-4 p-3 rounded-xl bg-darkSurface/60 border border-darkBorder text-textSecondary hover:text-cyan-400 hover:scale-105 transition-all z-[10010] cursor-pointer"
              title="Seguinte"
            >
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
