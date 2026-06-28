import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import * as LucideIcons from 'lucide-react';
import { Smile, Heart, X, ChevronRight, Activity } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

/**
 * Interface que representa os dados estruturados de um Hobby ou Passatempo pessoal.
 */
interface Hobby {
  id: number;
  name: string;
  description: string;
  icon: string; // Nome do ícone do Lucide (ex: "Cpu", "Gamepad2", "Terminal")
  image_url?: string;
  sort_order: number;
}

/**
 * Descodifica entidades HTML (como &eacute;) em texto simples UTF-8 limpo.
 * 
 * @param text Texto com potenciais entidades HTML
 * @returns Texto descodificado legível
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
 * @param html Código HTML bruto
 * @returns Texto limpo sem formatação HTML
 */
function stripHtmlAndDecode(html: string): string {
  if (!html) return '';
  const cleanHtml = html.replace(/<[^>]*>/g, '');
  return decodeHTMLEntities(cleanHtml);
}

/**
 * COMPONENTE PÚBLICO: Montra de Passatempos (HobbiesPage)
 * =====================================================================
 * Renderiza de forma interativa e visualmente deslumbrante os interesses 
 * e paixões extracurriculares do Ayres em tema OLED Glassmorphism.
 * Utiliza o mesmo sistema de cartões cibernéticos profissionais das restantes
 * páginas de sucesso do portfólio, suportando modal de expansão completo.
 */
export default function HobbiesPage() {
  const { language } = useLanguage();
  const [hobbies, setHobbies] = useState<Hobby[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHobby, setSelectedHobby] = useState<Hobby | null>(null);

  // Carregar dados de hobbies a partir da API do backend com suporte bilingue
  useEffect(() => {
    async function fetchHobbies() {
      try {
        const res = await fetch(`/backend/api/hobbies?lang=${language}`);
        const data = await res.json();
        if (data.success) {
          setHobbies(data.hobbies || []);
        }
      } catch (err) {
        console.error('Erro ao carregar passatempos:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchHobbies();
  }, [language]);

  // Impedir scroll no body principal quando o modal de detalhes estiver ativo
  useEffect(() => {
    if (selectedHobby) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [selectedHobby]);

  /**
   * RESOLVEDOR DINÂMICO DE ÍCONES DO LUCIDE
   * ===================================================================
   * Analisa a string do ícone enviada da BD e devolve o componente real
   * do Lucide React, caindo num fallback elegante caso não exista.
   */
  const renderHobbyIcon = (iconName: string) => {
    // Resolver com segurança o componente da biblioteca LucideIcons
    const IconComponent = (LucideIcons as any)[iconName];
    if (IconComponent) {
      /* Ajuste de contraste para o Modo Claro: text-cyan-650 dark:text-cyan-400 */
      return <IconComponent size={28} className="text-cyan-650 dark:text-cyan-400 group-hover:scale-110 transition-transform duration-355" />;
    }
    // Fallback padrão se o ícone não for encontrado
    /* Ajuste de contraste para o Modo Claro: text-indigo-650 dark:text-indigo-400 */
    return <Heart size={28} className="text-indigo-650 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-355" />;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 flex-grow flex flex-col justify-center relative z-10">
      
      {/* Cabeçalho da Secção com Estilo Cyber */}
      <div className="text-center md:text-left mb-16 space-y-4 animate-fade-in">
        {/* Ajuste de contraste para o Modo Claro: text-cyan-700 dark:text-cyan-400 */}
        <div className="inline-flex items-center space-x-2 bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 px-4 py-1.5 rounded-full border border-cyan-500/20 text-xs font-mono select-none">
          <Smile size={12} className="animate-bounce" />
          <span>{language === 'pt' ? 'PERFIL INTERATIVO PESSOAL' : 'PERSONAL INTERACTIVE PROFILE'}</span>
        </div>
        <h2 className="text-4xl font-extrabold tracking-tight text-gradient font-display uppercase bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 drop-shadow-[0_2px_10px_rgba(34,211,238,0.12)]">
          {language === 'pt' ? (
            <>Hobbies & <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">Paixões Pessoais</span></>
          ) : (
            <>Hobbies & <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">Personal Passions</span></>
          )}
        </h2>
        <p className="text-textSecondary max-w-xl mx-auto md:mx-0 text-sm sm:text-base leading-relaxed text-justify md:text-left">
          {language === 'pt'
            ? 'Para além do código puro e das linhas de programação. Descubra os interesses, laboratórios práticos e passatempos que preenchem o meu dia-a-dia e enriquecem o meu percurso tecnológico.'
            : 'Beyond pure code and programming lines. Discover the interests, hands-on labs, and hobbies that fill my day-to-day and enrich my technological path.'}
        </p>
      </div>

      {loading ? (
        <div className="flex-grow flex items-center justify-center py-20">
          <span className="w-8 h-8 rounded-full border-2 border-cyan-500/20 border-t-brandBlue animate-spin"></span>
        </div>
      ) : hobbies.length === 0 ? (
        <div className="text-center py-16 glass-panel rounded-2xl border border-darkBorder p-8 max-w-md mx-auto animate-fade-in">
          <span className="text-textSecondary text-3xl block mb-3">🎮</span>
          <h3 className="text-textPrimary font-semibold text-lg">{language === 'pt' ? 'Nenhum passatempo registado' : 'No hobbies registered'}</h3>
          <p className="text-textSecondary text-xs mt-1">
            {language === 'pt'
              ? 'Os passatempos encontram-se temporariamente em atualização pelo administrador.'
              : 'Hobbies are temporarily being updated by the administrator.'}
          </p>
        </div>
      ) : (
        /* Grelha Profissional de Cartões de Hobbies (Resumo) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          {hobbies.map((hobby, index) => (
            <div 
              key={hobby.id} 
              onClick={() => setSelectedHobby(hobby)}
              className="group cursor-pointer relative cyber-card p-6 flex flex-col gap-4 rounded-3xl cyber-corners-container animate-cyber-card-reveal hover:-translate-y-1 transition-all duration-300 bg-darkSurface/40 hover:bg-indigo-950/20 border border-darkBorder hover:border-cyan-500/30 overflow-hidden"
              style={{ animationDelay: `${index * 0.12}s` }}
            >
              {/* Efeito Glow luminoso néon no canto superior direito do cartão */}
              {/* Ajuste de contraste para o Modo Claro: bg-cyan-500/10 dark:bg-cyan-500/20 */}
              <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-cyan-500/10 dark:bg-cyan-500/20 blur-2xl group-hover:bg-cyan-500/20 transition-all pointer-events-none"></div>

              {/* Cantoneiras metálicas decorativas do cartão de passatempo */}
              <div className="cyber-corner cyber-corner-tl !w-2.5 !h-2.5"></div>
              <div className="cyber-corner cyber-corner-tr !w-2.5 !h-2.5"></div>
              <div className="cyber-corner cyber-corner-bl !w-2.5 !h-2.5"></div>
              <div className="cyber-corner cyber-corner-br !w-2.5 !h-2.5"></div>

              <div className="space-y-5 relative z-10 flex-grow flex flex-col justify-between">
                <div>
                  {/* Cabeçalho do Hobby: Ícone Redondo Cyber */}
                  <div className="flex items-center gap-4">
                    {/* Ajuste de contraste para o Modo Claro: bg-cyan-500/10 dark:bg-cyan-950/20, border-cyan-500/20 dark:border-cyan-500/10 */}
                    <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 dark:bg-cyan-950/20 border border-cyan-500/20 dark:border-cyan-500/10 flex items-center justify-center shadow-lg shadow-cyan-955/20 shrink-0">
                      {renderHobbyIcon(hobby.icon)}
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-base font-bold text-textPrimary tracking-tight font-display group-hover:text-cyan-400 transition-colors uppercase line-clamp-1">
                        {decodeHTMLEntities(hobby.name)}
                      </h3>
                      <span className="text-[10px] font-mono text-textSecondary uppercase tracking-widest">
                        {language === 'pt' ? 'Ordem' : 'Order'}: #{hobby.sort_order}
                      </span>
                    </div>
                  </div>

                  {/* Resumo da Descrição */}
                  <p className="text-textSecondary text-xs leading-relaxed text-justify line-clamp-3 mt-4">
                    {stripHtmlAndDecode(hobby.description)}
                  </p>
                </div>

                {/* Rodapé interativo do cartão (HUD Line) */}
                {/* Ajuste de contraste para o Modo Claro: text-indigo-650 dark:text-indigo-400 group-hover:text-cyan-650 dark:group-hover:text-cyan-300 */}
                <div className="flex items-center justify-between text-xs font-bold text-indigo-650 dark:text-indigo-400 group-hover:text-cyan-650 dark:group-hover:text-cyan-300 transition-colors border-t border-darkBorder pt-3 mt-4">
                  <span>{language === 'pt' ? 'Ver detalhes' : 'View details'}</span>
                  <ChevronRight size={14} className="transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Overlay para Detalhes do Hobby (Mais Informações) */}
      {selectedHobby && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-darkBg/80 backdrop-blur-md animate-fade-in">
          <div 
            className="absolute inset-0 cursor-pointer" 
            onClick={() => setSelectedHobby(null)}
          ></div>
          
          <div className="relative w-full max-w-2xl max-h-[85vh] bg-darkSurface border border-cyan-500/30 rounded-3xl overflow-hidden flex flex-col shadow-2xl shadow-cyan-500/10 cyber-card animate-scale-up">
            
            {/* Decoração da Barra de Gradiente Superior */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-indigo-500 to-blue-600"></div>
            
            {/* Cabeçalho do Modal */}
            <div className="flex justify-between items-start p-6 border-b border-darkBorder relative z-10 flex-shrink-0">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex-shrink-0 bg-darkBg/60 border border-darkBorder flex items-center justify-center shadow-lg overflow-hidden p-1.5">
                  {selectedHobby.image_url ? (
                    <img src={selectedHobby.image_url} alt={selectedHobby.name} className="w-full h-full object-contain" />
                  ) : (
                    renderHobbyIcon(selectedHobby.icon)
                  )}
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight text-textPrimary font-display uppercase bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-400">
                    {decodeHTMLEntities(selectedHobby.name)}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-bold text-textSecondary mt-1">
                    <span className="flex items-center space-x-1">
                      {/* Ajuste de contraste para o Modo Claro: text-indigo-650 dark:text-indigo-400 */}
                      <Smile size={14} className="text-indigo-650 dark:text-indigo-400" />
                      <span className="text-white/80">{language === 'pt' ? 'Passatempo Ativo' : 'Active Hobby'}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <span className="text-white/10 hidden sm:inline">•</span>
                      {/* Ajuste de contraste para o Modo Claro: text-indigo-650 dark:text-indigo-400 */}
                      <span className="text-indigo-650 dark:text-indigo-400">{language === 'pt' ? 'Ordem de Exibição:' : 'Display Order:'}</span>
                      <span className="text-white/80">{selectedHobby.sort_order}</span>
                    </span>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => setSelectedHobby(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-darkBg/10 hover:bg-darkBg/20 text-textSecondary hover:text-textPrimary transition-colors flex-shrink-0 border border-darkBorder"
                title="Fechar Detalhes"
              >
                <X size={18} />
              </button>
            </div>
            
            {/* Corpo Scrollável do Modal com Informações Detalhadas */}
            <div className="p-6 overflow-y-auto flex-grow relative z-10" style={{ scrollbarWidth: 'thin', scrollbarColor: '#4f46e5 transparent' }}>
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-textPrimary uppercase tracking-widest border-b border-darkBorder pb-2">
                  {language === 'pt' ? 'História & Pormenores do Passatempo' : 'Hobby Story & Details'}
                </h4>
                
                {/* Se houver imagem ilustrativa carregada, exibi-la em destaque de alta fidelidade */}
                {selectedHobby.image_url && (
                  <div className="w-full max-h-60 rounded-2xl overflow-hidden border border-darkBorder bg-darkBg/40 p-2 mb-6">
                    <img 
                      src={selectedHobby.image_url} 
                      alt={selectedHobby.name} 
                      className="w-full h-full max-h-[220px] object-cover rounded-xl"
                    />
                  </div>
                )}

                <div 
                  className="text-sm text-textSecondary leading-relaxed font-sans prose prose-invert select-text max-w-full text-justify"
                  dangerouslySetInnerHTML={{ __html: selectedHobby.description.replace(/\\r\\n/g, '<br>') }}
                />
              </div>
            </div>
            
            {/* Rodapé do Modal com HUD Metadados */}
            <div className="p-4 border-t border-darkBorder bg-darkBg/40 flex justify-between items-center text-[10px] font-mono text-textSecondary/30 uppercase tracking-widest select-none relative z-10 flex-shrink-0">
              <span className="flex items-center gap-2">
                <Activity size={12} className="text-cyan-500/50 animate-pulse" />
                Interactive Hobby Profile
              </span>
              <span>Secure Record</span>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
