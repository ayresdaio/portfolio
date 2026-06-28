import { 
  User, 
  Code, 
  Sliders, 
  Briefcase, 
  BookOpen, 
  MessageSquare, 
  BarChart2,
  FileText,
  Heart,
  LogOut,
  X,
  ChevronLeft,
  ChevronRight,
  Shield,
  Terminal
} from 'lucide-react';

/**
 * Definição dos tipos aceites pelo componente AdminSidebar.
 */
interface AdminSidebarProps {
  /** A aba que está ativa no momento */
  activeTab: 'profile' | 'about' | 'projects' | 'skills' | 'experience' | 'education' | 'messages' | 'stats' | 'blog' | 'hobbies' | 'security' | 'automations';
  /** Função de callback acionada ao alterar de aba */
  onTabChange: (tab: 'profile' | 'about' | 'projects' | 'skills' | 'experience' | 'education' | 'messages' | 'stats' | 'blog' | 'hobbies' | 'security' | 'automations') => void;
  /** Quantidade de mensagens de contacto não lidas */
  unreadMessagesCount: number;
  /** Função responsável por fazer o logout e encerrar a sessão */
  handleLogout: () => Promise<void> | void;
  /** Variável de estado para informar se a barra em desktop está colapsada */
  isCollapsed: boolean;
  /** Callback para alternar o colapso da barra lateral */
  onToggleCollapse: () => void;
  /** Variável de estado para informar se a barra lateral está aberta no mobile */
  isMobileOpen: boolean;
  /** Callback para fechar a barra lateral no mobile */
  onMobileClose: () => void;
}

/**
 * COMPONENTE: Barra Lateral de Navegação Administrativa (AdminSidebar)
 * 
 * Renderiza o menu lateral do painel admin com suporte completo a colapso dinâmico (toggle)
 * e responsividade móvel de luxo.
 */
export default function AdminSidebar({
  activeTab,
  onTabChange,
  unreadMessagesCount,
  handleLogout,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onMobileClose
}: AdminSidebarProps) {
  return (
    <>
      {/* Overlay de fundo fosco escurecido para telemóveis (corta a interação fora do menu lateral) */}
      {isMobileOpen && (
        <div 
          onClick={onMobileClose} 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-all duration-300"
        />
      )}

      {/* 
        aside adaptado dinamicamente:
        - fixed w-64 translate-x no mobile para deslizar sob o ecrã inteiro.
        - transition-all duration-300 assegura animações de recolha extremamente suaves.
      */}
      <aside className={`
        h-full bg-darkSurface flex flex-col justify-between shrink-0 z-50
        border-darkBorder transition-all duration-300
        
        /* Mobile: Painel lateral deslizante */
        fixed inset-y-0 left-0 w-64 md:relative md:translate-x-0
        ${isMobileOpen ? 'translate-x-0 border-r' : '-translate-x-full md:translate-x-0'}
        
        /* Desktop (md+): Largura dinâmica de acordo com o estado isCollapsed */
        ${isCollapsed ? 'md:w-20 md:min-w-[80px] md:border-r' : 'md:w-64 md:min-w-[260px] md:border-r'}
      `}>
        <div className="p-4 flex-grow flex flex-col overflow-y-auto">
          
          {/* Cabeçalho do Logotipo com alinhamento dinâmico */}
          <div className={`flex items-center justify-between pb-6 border-b border-darkBorder ${isCollapsed ? 'md:justify-center' : ''}`}>
            <div className={`flex items-center space-x-3 overflow-hidden transition-all duration-300 ${isCollapsed ? 'md:space-x-0' : ''}`}>
              <img src="/imag/icon.png" alt="Logotipo" className="w-8 h-8 object-contain shrink-0" />
              {!isCollapsed && (
                <h1 className="text-lg font-bold text-textPrimary tracking-wide transition-all duration-300 truncate">
                  Painel Admin
                </h1>
              )}
            </div>
            
            {/* Botão de Fechar Visível apenas no Mobile */}
            <button 
              onClick={onMobileClose}
              className="p-1 text-textSecondary hover:text-textPrimary md:hidden"
              title="Fechar Menu"
            >
              <X size={20} />
            </button>

            {/* Botão Hambúrguer / Chevron de Colapso do Menu (Visível apenas em Desktop) */}
            {!isMobileOpen && (
              <button 
                onClick={onToggleCollapse}
                className="hidden md:flex p-1.5 rounded-lg bg-darkBg/60 text-textSecondary hover:text-brandBlue hover:bg-brandBlue/10 border border-darkBorder transition-all duration-300"
                title={isCollapsed ? "Expandir Menu" : "Recolher Menu"}
              >
                {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              </button>
            )}
          </div>

          {/* Links de Navegação */}
          <div className="mt-6 space-y-1">
            {/* Perfil */}
            <button 
              onClick={() => { onTabChange('profile'); onMobileClose(); }}
              className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${isCollapsed ? 'md:justify-center md:px-0' : 'space-x-3'} ${
                activeTab === 'profile' 
                  ? 'bg-brandBlue text-textPrimary shadow-lg shadow-brandBlue/10' 
                  : 'text-textSecondary hover:text-textPrimary hover:bg-darkBg/50'
              }`}
              title={isCollapsed ? "Perfil" : ""}
            >
              <User size={18} className="shrink-0" />
              {(!isCollapsed || isMobileOpen) && <span className="truncate">Perfil</span>}
            </button>

            {/* Estatísticas */}
            <button 
              onClick={() => { onTabChange('stats'); onMobileClose(); }}
              className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${isCollapsed ? 'md:justify-center md:px-0' : 'space-x-3'} ${
                activeTab === 'stats' 
                  ? 'bg-brandBlue text-textPrimary shadow-lg shadow-brandBlue/10' 
                  : 'text-textSecondary hover:text-textPrimary hover:bg-darkBg/50'
              }`}
              title={isCollapsed ? "Estatísticas" : ""}
            >
              <BarChart2 size={18} className="shrink-0" />
              {(!isCollapsed || isMobileOpen) && <span className="truncate">Estatísticas</span>}
            </button>

            {/* Sobre */}
            <button 
              onClick={() => { onTabChange('about'); onMobileClose(); }}
              className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${isCollapsed ? 'md:justify-center md:px-0' : 'space-x-3'} ${
                activeTab === 'about' 
                  ? 'bg-brandBlue text-textPrimary shadow-lg shadow-brandBlue/10' 
                  : 'text-textSecondary hover:text-textPrimary hover:bg-darkBg/50'
              }`}
              title={isCollapsed ? "Sobre" : ""}
            >
              <User size={18} className="shrink-0" />
              {(!isCollapsed || isMobileOpen) && <span className="truncate">Sobre</span>}
            </button>

            {/* Projetos */}
            <button 
              onClick={() => { onTabChange('projects'); onMobileClose(); }}
              className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${isCollapsed ? 'md:justify-center md:px-0' : 'space-x-3'} ${
                activeTab === 'projects' 
                  ? 'bg-brandBlue text-textPrimary shadow-lg shadow-brandBlue/10' 
                  : 'text-textSecondary hover:text-textPrimary hover:bg-darkBg/50'
              }`}
              title={isCollapsed ? "Projetos" : ""}
            >
              <Code size={18} className="shrink-0" />
              {(!isCollapsed || isMobileOpen) && <span className="truncate">Projetos</span>}
            </button>

            {/* Competências */}
            <button 
              onClick={() => { onTabChange('skills'); onMobileClose(); }}
              className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${isCollapsed ? 'md:justify-center md:px-0' : 'space-x-3'} ${
                activeTab === 'skills' 
                  ? 'bg-brandBlue text-textPrimary shadow-lg shadow-brandBlue/10' 
                  : 'text-textSecondary hover:text-textPrimary hover:bg-darkBg/50'
              }`}
              title={isCollapsed ? "Competências" : ""}
            >
              <Sliders size={18} className="shrink-0" />
              {(!isCollapsed || isMobileOpen) && <span className="truncate">Competências</span>}
            </button>

            {/* Experiência */}
            <button 
              onClick={() => { onTabChange('experience'); onMobileClose(); }}
              className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${isCollapsed ? 'md:justify-center md:px-0' : 'space-x-3'} ${
                activeTab === 'experience' 
                  ? 'bg-brandBlue text-textPrimary shadow-lg shadow-brandBlue/10' 
                  : 'text-textSecondary hover:text-textPrimary hover:bg-darkBg/50'
              }`}
              title={isCollapsed ? "Experiência" : ""}
            >
              <Briefcase size={18} className="shrink-0" />
              {(!isCollapsed || isMobileOpen) && <span className="truncate">Experiência</span>}
            </button>

            {/* Educação Académica */}
            <button 
              onClick={() => { onTabChange('education'); onMobileClose(); }}
              className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${isCollapsed ? 'md:justify-center md:px-0' : 'space-x-3'} ${
                activeTab === 'education' 
                  ? 'bg-brandBlue text-textPrimary shadow-lg shadow-brandBlue/10' 
                  : 'text-textSecondary hover:text-textPrimary hover:bg-darkBg/50'
              }`}
              title={isCollapsed ? "Educação" : ""}
            >
              <BookOpen size={18} className="shrink-0" />
              {(!isCollapsed || isMobileOpen) && <span className="truncate">Educação</span>}
            </button>

            {/* Gestão do Blog Técnico */}
            <button 
              onClick={() => { onTabChange('blog'); onMobileClose(); }}
              className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${isCollapsed ? 'md:justify-center md:px-0' : 'space-x-3'} ${
                activeTab === 'blog' 
                  ? 'bg-brandBlue text-textPrimary shadow-lg shadow-brandBlue/10' 
                  : 'text-textSecondary hover:text-textPrimary hover:bg-darkBg/50'
              }`}
              title={isCollapsed ? "Gerir Blog" : ""}
            >
              <FileText size={18} className="shrink-0" />
              {(!isCollapsed || isMobileOpen) && <span className="truncate">Gerir Blog</span>}
            </button>

            {/* Gestão de Hobbies */}
            <button 
              onClick={() => { onTabChange('hobbies'); onMobileClose(); }}
              className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${isCollapsed ? 'md:justify-center md:px-0' : 'space-x-3'} ${
                activeTab === 'hobbies' 
                  ? 'bg-brandBlue text-textPrimary shadow-lg shadow-brandBlue/10' 
                  : 'text-textSecondary hover:text-textPrimary hover:bg-darkBg/50'
              }`}
              title={isCollapsed ? "Hobbies" : ""}
            >
              <Heart size={18} className="shrink-0" />
              {(!isCollapsed || isMobileOpen) && <span className="truncate">Hobbies</span>}
            </button>

            {/* Segurança */}
            <button 
              onClick={() => { onTabChange('security'); onMobileClose(); }}
              className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${isCollapsed ? 'md:justify-center md:px-0' : 'space-x-3'} ${
                activeTab === 'security' 
                  ? 'bg-brandBlue text-textPrimary shadow-lg shadow-brandBlue/10' 
                  : 'text-textSecondary hover:text-textPrimary hover:bg-darkBg/50'
              }`}
              title={isCollapsed ? "Segurança" : ""}
            >
              <Shield size={18} className="shrink-0" />
              {(!isCollapsed || isMobileOpen) && <span className="truncate">Segurança</span>}
            </button>

            {/* Automações */}
            <button 
              onClick={() => { onTabChange('automations'); onMobileClose(); }}
              className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${isCollapsed ? 'md:justify-center md:px-0' : 'space-x-3'} ${
                activeTab === 'automations' 
                  ? 'bg-brandBlue text-textPrimary shadow-lg shadow-brandBlue/10' 
                  : 'text-textSecondary hover:text-textPrimary hover:bg-darkBg/50'
              }`}
              title={isCollapsed ? "Automações" : ""}
            >
              <Terminal size={18} className="shrink-0" />
              {(!isCollapsed || isMobileOpen) && <span className="truncate">Automações</span>}
            </button>

            {/* Caixa de Entrada (Mensagens) */}
            <button 
              onClick={() => { onTabChange('messages'); onMobileClose(); }}
              className={`w-full flex items-center relative rounded-xl text-sm font-semibold transition-all duration-300 ${
                isCollapsed 
                  ? 'md:justify-center md:px-0 py-3' 
                  : 'justify-between px-4 py-3'
              } ${
                activeTab === 'messages' 
                  ? 'bg-brandBlue text-textPrimary shadow-lg shadow-brandBlue/10' 
                  : 'text-textSecondary hover:text-textPrimary hover:bg-darkBg/50'
              }`}
              title={isCollapsed ? "Mensagens" : ""}
            >
              <div className={`flex items-center ${isCollapsed ? 'md:space-x-0 justify-center' : 'space-x-3'}`}>
                <MessageSquare size={18} className="shrink-0" />
                {(!isCollapsed || isMobileOpen) && <span className="truncate">Mensagens</span>}
              </div>
              {unreadMessagesCount > 0 && (
                <span className={`bg-rose-500 text-textPrimary text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 transition-all ${
                  isCollapsed ? 'absolute top-1 right-2 md:top-1.5 md:right-1.5 scale-90' : ''
                }`}>
                  {unreadMessagesCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Rodapé da Barra Lateral: Informação de Estado e Botão de Sair com layouts reativos */}
        <div className={`p-4 border-t border-darkBorder flex items-center justify-between text-xs text-textSecondary ${isCollapsed ? 'md:flex-col md:space-y-4 md:items-center' : ''}`}>
          {(!isCollapsed || isMobileOpen) ? (
            <div className="flex items-center space-x-2 shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block"></span>
              <span className="font-semibold text-textSecondary">Ligado</span>
            </div>
          ) : (
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block shrink-0" title="Sessão Iniciada" />
          )}
          
          <button 
            onClick={handleLogout}
            className={`flex items-center hover:text-rose-400 transition-colors py-1 px-2 rounded-lg hover:bg-rose-500/10 text-textSecondary ${
              isCollapsed ? 'md:justify-center md:px-0' : 'space-x-1.5'
            }`}
            title="Sair do Painel"
          >
            <LogOut size={14} className="shrink-0" />
            {(!isCollapsed || isMobileOpen) && <span>Sair</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
