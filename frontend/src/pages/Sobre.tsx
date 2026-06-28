import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { User, MapPin, Mail, Phone, Calendar } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

// Importação completa de ícones do Lucide para resolução dinâmica na Bento Grid
import * as LucideIcons from 'lucide-react';

interface AboutImage {
  id: number;
  image_url: string;
  caption?: string;
  sort_order: number;
}

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
  about_text?: string;
  about_image_url?: string;
}

interface AboutSection {
  id: number;
  title: string;
  content: string;
  icon: string;
  sort_order: number;
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
 * PÁGINA SOBRE MIM (SobrePage)
 * =====================================================================
 * Apresenta a história pessoal, conquistas detalhadas da carreira e
 * a fotografia dedicada do utilizador num design OLED de alta fidelidade.
 */
export default function SobrePage() {
  const { t } = useLanguage();
  // Aceder aos dados centrais do perfil, secções extra e galeria de fotos do Layout
  const { profile, about_sections, about_images } = useOutletContext<{ 
    profile: Profile | null; 
    about_sections?: AboutSection[]; 
    about_images?: AboutImage[] 
  }>();

  // Estados locais para controlar o Carousel e o visualizador Lightbox
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0);

  // Efeito reativo para rodar as fotos do carousel a cada 5 segundos automaticamente
  useEffect(() => {
    if (!about_images || about_images.length <= 1) return;
    const interval = setInterval(() => {
      setActiveImageIndex(prev => (prev + 1) % about_images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [about_images]);

  // Caso os dados ainda estejam a carregar
  if (!profile) {
    return (
      <div className="flex-grow flex items-center justify-center bg-darkBg text-textPrimary py-24">
        <div className="w-10 h-10 border-2 border-brandBlue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <section className="px-4 sm:px-6 py-16 md:py-20 max-w-6xl mx-auto w-full flex-grow flex flex-col justify-center animate-fade-in relative z-10">
      
      {/* Cabeçalho da Secção com Estilo Cyber */}
      <div className="text-center md:text-left mb-16 space-y-3 max-w-2xl relative z-10">
        {/* Ajuste de contraste para o Modo Claro: text-indigo-650 dark:text-indigo-300 */}
        <span className="text-[9px] font-extrabold uppercase tracking-widest text-indigo-650 dark:text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1.5 rounded-full inline-block">
          {t('about_history')}
        </span>
        <h2 className="text-3.5xl md:text-5xl font-black tracking-tight text-textPrimary font-display uppercase bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 drop-shadow-[0_2px_10px_rgba(34,211,238,0.12)]">
          {t('about_title')}
        </h2>
        <div className="section-divider-cyber"></div>
      </div>

      {/* Grelha Assimétrica de Informações */}
      <div className="grid md:grid-cols-5 gap-12 items-start">
        
        {/* Lado Esquerdo: Fotografia Dedicada */}
        <div className="md:col-span-2 flex justify-center relative group">
          {/* Efeito Glow Neon Atrás da Imagem */}
          <div className="absolute inset-0 bg-indigo-600/10 rounded-[32px] blur-3xl group-hover:bg-indigo-600/20 transition-colors duration-500 pointer-events-none"></div>
          
          <div className="relative cyber-card p-4 w-full max-w-sm cyber-corners-container">
            {/* Mini cantoneiras do cartão */}
            <div className="cyber-corner cyber-corner-tl"></div>
            <div className="cyber-corner cyber-corner-tr"></div>
            <div className="cyber-corner cyber-corner-bl"></div>
            <div className="cyber-corner cyber-corner-br"></div>
            
            <div className="w-full aspect-[4/5] rounded-2xl overflow-hidden bg-darkSurface border border-darkBorder shadow-inner relative group/carousel">
              {about_images && about_images.length > 0 ? (
                <>
                  {/* Foto Ativa do Carousel */}
                  <div 
                    className="w-full h-full relative cursor-pointer overflow-hidden"
                    onClick={() => {
                      setLightboxImageIndex(activeImageIndex);
                      setLightboxOpen(true);
                    }}
                  >
                    <img 
                      src={about_images[activeImageIndex].image_url} 
                      alt={about_images[activeImageIndex].caption || profile.name} 
                      className="w-full h-full object-cover transition-all duration-700 hover:scale-105"
                    />
                    
                    {/* Legenda PT/EN em overlay semi-transparente */}
                    {about_images[activeImageIndex].caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-md px-4 py-2.5 border-t border-darkBorder/30 text-xs text-textSecondary font-semibold select-none text-center">
                        {about_images[activeImageIndex].caption}
                      </div>
                    )}
                  </div>

                  {/* Setas de Controlo de Carousel (Apenas se houver mais de 1 foto) */}
                  {about_images.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveImageIndex(prev => (prev - 1 + about_images.length) % about_images.length);
                        }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-darkSurface/90 border border-darkBorder/60 text-textSecondary hover:text-cyan-400 hover:scale-105 transition-all opacity-0 group-hover/carousel:opacity-100 duration-300 z-20 cursor-pointer"
                        title="Anterior"
                      >
                        <LucideIcons.ChevronLeft size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveImageIndex(prev => (prev + 1) % about_images.length);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-darkSurface/90 border border-darkBorder/60 text-textSecondary hover:text-cyan-400 hover:scale-105 transition-all opacity-0 group-hover/carousel:opacity-100 duration-300 z-20 cursor-pointer"
                        title="Seguinte"
                      >
                        <LucideIcons.ChevronRight size={16} />
                      </button>

                      {/* Pontos Indicadores (Dots) na base da imagem */}
                      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center space-x-1.5 z-20">
                        {about_images.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveImageIndex(idx);
                            }}
                            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 cursor-pointer ${idx === activeImageIndex ? 'bg-cyan-400 w-3' : 'bg-white/30 hover:bg-white/50'}`}
                            aria-label={`Slide ${idx + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : profile.about_image_url ? (
                <img 
                  src={profile.about_image_url} 
                  alt={profile.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-700">
                  <User size={80} className="text-zinc-650" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lado Direito: Biografia e Detalhes Pessoais */}
        <div className="md:col-span-3 space-y-8">
          
          <div className="cyber-card p-8 space-y-6 cyber-corners-container">
            {/* Mini cantoneiras do cartão */}
            <div className="cyber-corner cyber-corner-tl"></div>
            <div className="cyber-corner cyber-corner-tr"></div>
            <div className="cyber-corner cyber-corner-bl"></div>
            <div className="cyber-corner cyber-corner-br"></div>

            <h3 className="text-lg font-extrabold text-textPrimary font-display flex items-center space-x-2.5 uppercase tracking-wide">
              <User size={18} className="text-cyan-400 drop-shadow-[0_0_4px_rgba(34,211,238,0.45)]" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-300">{t('about_who_am_i')}</span>
            </h3>
            
            <div 
              className="text-sm text-textSecondary leading-relaxed font-sans font-medium prose prose-invert select-text max-w-full"
              dangerouslySetInnerHTML={{ __html: profile.about_text || profile.bio }}
            />
          </div>

          {/* Cartões Rápidos de Dados de Contacto */}
          <div className="grid sm:grid-cols-2 gap-4">
            
            {profile.location && (
              <div className="cyber-card p-5 flex items-center space-x-4 hover:scale-[1.02] transition-all duration-300 cyber-corners-container">
                <div className="cyber-corner cyber-corner-tl !w-2 !h-2"></div>
                <div className="cyber-corner cyber-corner-tr !w-2 !h-2"></div>
                <div className="cyber-corner cyber-corner-bl !w-2 !h-2"></div>
                <div className="cyber-corner cyber-corner-br !w-2 !h-2"></div>
                
                {/* Ajuste de contraste para o Modo Claro: text-indigo-650 dark:text-indigo-400 */}
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-650 dark:text-indigo-400 shrink-0 border border-indigo-500/20">
                  <MapPin size={18} />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-textSecondary block">{t('about_location')}</span>
                  <span className="text-sm font-semibold text-textPrimary">{profile.location}</span>
                </div>
              </div>
            )}

            <div className="cyber-card p-5 flex items-center space-x-4 hover:scale-[1.02] transition-all duration-300 cyber-corners-container">
              <div className="cyber-corner cyber-corner-tl !w-2 !h-2"></div>
              <div className="cyber-corner cyber-corner-tr !w-2 !h-2"></div>
              <div className="cyber-corner cyber-corner-bl !w-2 !h-2"></div>
              <div className="cyber-corner cyber-corner-br !w-2 !h-2"></div>
              
              {/* Ajuste de contraste para o Modo Claro: text-cyan-655 dark:text-cyan-400 */}
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-655 dark:text-cyan-400 shrink-0 border border-cyan-500/20">
                <Mail size={18} />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-textSecondary block">{t('about_email')}</span>
                <span className="text-sm font-semibold text-textPrimary truncate block max-w-[180px]">{profile.email}</span>
              </div>
            </div>

            {profile.phone && (
              <div className="cyber-card p-5 flex items-center space-x-4 hover:scale-[1.02] transition-all duration-300 cyber-corners-container">
                <div className="cyber-corner cyber-corner-tl !w-2 !h-2"></div>
                <div className="cyber-corner cyber-corner-tr !w-2 !h-2"></div>
                <div className="cyber-corner cyber-corner-bl !w-2 !h-2"></div>
                <div className="cyber-corner cyber-corner-br !w-2 !h-2"></div>
                
                {/* Ajuste de contraste para o Modo Claro: text-blue-650 dark:text-blue-400 */}
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-650 dark:text-blue-400 shrink-0 border border-blue-500/20">
                  <Phone size={18} />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-textSecondary block">{t('about_phone')}</span>
                  <span className="text-sm font-semibold text-textPrimary">{profile.phone}</span>
                </div>
              </div>
            )}

            <div className="cyber-card p-5 flex items-center space-x-4 hover:scale-[1.02] transition-all duration-300 cyber-corners-container">
              <div className="cyber-corner cyber-corner-tl !w-2 !h-2"></div>
              <div className="cyber-corner cyber-corner-tr !w-2 !h-2"></div>
              <div className="cyber-corner cyber-corner-bl !w-2 !h-2"></div>
              <div className="cyber-corner cyber-corner-br !w-2 !h-2"></div>
              
              {/* Ajuste de contraste para o Modo Claro: text-purple-650 dark:text-purple-400 */}
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-650 dark:text-purple-400 shrink-0 border border-purple-500/20">
                <Calendar size={18} />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-textSecondary block">{t('about_role')}</span>
                <span className="text-sm font-semibold text-textPrimary">{decodeHTMLEntities(profile.role)}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Bento Grid Dinâmica de Secções Adicionais do Sobre Mim */}
      {about_sections && about_sections.length > 0 && (
        <div className="mt-16 md:mt-24 space-y-8 relative z-10 animate-slide-up">
          <div className="text-center md:text-left space-y-2">
            {/* Ajuste de contraste para o Modo Claro: text-cyan-700 dark:text-cyan-300 */}
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-cyan-700 dark:text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-3.5 py-1.5 rounded-full inline-block">
              {t('about_more_details')}
            </span>
            <h3 className="text-2xl md:text-3.5xl font-black uppercase font-display bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-300">
              {t('about_know_more')}
            </h3>
            <div className="h-0.5 w-16 bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {about_sections.map((sec, index) => {
              // Resolver dinamicamente o ícone do Lucide com fallback seguro
              const IconComponent = (LucideIcons as any)[sec.icon] || (LucideIcons as any)['Info'];
              
              return (
                <div 
                  key={sec.id}
                  className="cyber-card p-6 flex flex-col gap-4 rounded-3xl cyber-corners-container hover:-translate-y-1 transition-all duration-300 bg-darkSurface/40 hover:bg-indigo-950/20 border border-darkBorder hover:border-cyan-500/30 group"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Mini cantoneiras decorativas estilo Cyberpunk */}
                  <div className="cyber-corner cyber-corner-tl !w-2.5 !h-2.5"></div>
                  <div className="cyber-corner cyber-corner-tr !w-2.5 !h-2.5"></div>
                  <div className="cyber-corner cyber-corner-bl !w-2.5 !h-2.5"></div>
                  <div className="cyber-corner cyber-corner-br !w-2.5 !h-2.5"></div>

                  <div className="flex items-center gap-3 border-b border-darkBorder pb-3">
                    {/* Ajuste de contraste para o Modo Claro: text-indigo-650 dark:text-indigo-400 com cor do ícone text-cyan-650 dark:text-cyan-400 */}
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-cyan-650 dark:text-cyan-400 border border-indigo-500/20 shrink-0 group-hover:scale-105 transition-transform duration-300">
                      <IconComponent size={18} />
                    </div>
                    <h4 className="text-sm md:text-base font-bold text-textPrimary uppercase tracking-wide font-display">
                      {sec.title}
                    </h4>
                  </div>

                  <div 
                    className="text-xs md:text-sm text-textSecondary leading-relaxed prose prose-invert font-medium select-text max-w-full"
                    dangerouslySetInnerHTML={{ __html: sec.content }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* LIGHTBOX MODAL PARA AMPLIAÇÃO DE FOTOS COM LEGENDA */}
      {lightboxOpen && about_images && about_images.length > 0 && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center animate-fade-in p-4 sm:p-10 select-none cursor-zoom-out"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Botão de Fechar */}
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-6 right-6 p-2.5 rounded-xl bg-darkSurface/60 border border-darkBorder text-textSecondary hover:text-white transition-all hover:scale-105 cursor-pointer z-50"
            title="Fechar Visualização"
          >
            <LucideIcons.X size={20} />
          </button>

          {/* Botão Anterior na Lightbox */}
          {about_images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxImageIndex(prev => (prev - 1 + about_images.length) % about_images.length);
              }}
              className="absolute left-4 sm:left-8 p-3 rounded-xl bg-darkSurface/65 border border-darkBorder text-textSecondary hover:text-cyan-400 transition-all hover:scale-105 cursor-pointer z-50"
              title="Anterior"
            >
              <LucideIcons.ChevronLeft size={24} />
            </button>
          )}

          {/* Contentor de Imagem e Legenda */}
          <div 
            className="max-w-4xl max-h-[85vh] flex flex-col items-center gap-4 relative animate-scale-up cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative rounded-2xl overflow-hidden border border-darkBorder/40 shadow-2xl">
              <img
                src={about_images[lightboxImageIndex].image_url}
                alt={about_images[lightboxImageIndex].caption || ''}
                className="max-w-full max-h-[75vh] object-contain select-text"
              />
            </div>
            {about_images[lightboxImageIndex].caption && (
              <p className="text-xs sm:text-sm font-semibold text-textSecondary bg-darkSurface/40 border border-darkBorder/40 px-6 py-2.5 rounded-full select-text text-center">
                {about_images[lightboxImageIndex].caption}
              </p>
            )}
          </div>

          {/* Botão Seguinte na Lightbox */}
          {about_images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxImageIndex(prev => (prev + 1) % about_images.length);
              }}
              className="absolute right-4 sm:right-8 p-3 rounded-xl bg-darkSurface/65 border border-darkBorder text-textSecondary hover:text-cyan-400 transition-all hover:scale-105 cursor-pointer z-50"
              title="Seguinte"
            >
              <LucideIcons.ChevronRight size={24} />
            </button>
          )}
        </div>
      )}
    </section>
  );
}
