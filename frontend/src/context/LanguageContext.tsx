import React, { createContext, useContext, useState, useEffect } from 'react';

// Tipagem permitida de idiomas
export type Language = 'pt' | 'en';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

// 1. Dicionário de traduções estáticas globais de alta fidelidade
const translations = {
  pt: {
    nav_home: "Início",
    nav_about: "Sobre Mim",
    nav_education: "Educação",
    nav_skills: "Competências",
    nav_projects: "Projetos",
    nav_experience: "Experiência",
    nav_hobbies: "Hobbies",
    nav_blog: "Blog",
    nav_contact: "Contacto",
    
    hero_view_projects: "Ver Projetos",
    hero_get_in_touch: "Fale Comigo",
    hero_download_cv: "Descarregar CV",
    
    about_title: "Sobre Mim",
    about_history: "A Minha História",
    about_who_am_i: "Quem Sou Eu?",
    about_more_details: "Mais Detalhes & Filosofia",
    about_know_more: "Conheça Mais Sobre Mim",
    about_location: "Localização",
    about_email: "E-mail",
    about_phone: "Telefone",
    about_role: "Função Principal",
    
    edu_title: "Formação Académica",
    edu_subtitle: "Estudos & Diplomas",
    edu_view_details: "Ver detalhes",
    edu_close: "Fechar",
    edu_secure_record: "Registo Académico Seguro",
    edu_loading: "A carregar percurso académico...",
    
    skills_title: "Competências",
    skills_subtitle: "Tecnologias & Ferramentas",
    skills_experience: "Tempo de Experiência",
    skills_level: "Proficiência",
    
    exp_title: "Experiência",
    exp_subtitle: "Linha Temporal Profissional",
    
    hobbies_title: "Hobbies",
    hobbies_subtitle: "Passatempos & Interesses",
    
    blog_title: "Blog Técnico",
    blog_subtitle: "Artigos & Publicações",
    blog_read_more: "Ler Artigo",
    
    contact_title: "Contacto",
    contact_subtitle: "Entre em Contacto",
    contact_name: "Nome Completo",
    contact_email: "Endereço de E-mail",
    contact_subject: "Assunto da Mensagem",
    contact_message: "Escreva a sua mensagem...",
    contact_send: "Enviar Mensagem",
    contact_sending: "A enviar...",
    contact_success: "Mensagem enviada com absoluto sucesso!",
    contact_error: "Falha ao enviar a sua mensagem. Tente novamente.",
    
    footer_rights: "Todos os direitos reservados.",
    footer_cookies: "Política de Cookies",
    footer_privacy: "Política de Privacidade",
    footer_terms: "Termos e Condições",
    footer_back: "Voltar ao Portfólio",
    
    cookies_title: "Política de Cookies",
    terms_title: "Termos e Condições",
    
    // Chaves de tradução para a página de erro personalizada 'LOST'
    lost_title: "LOST",
    lost_subtitle: "Caminho Desconhecido",
    lost_diagnostic: "A rota solicitada não existe ou foi movida.",
    lost_action: "Recomenda-se o desvio seguro para o início.",
    lost_button: "Voltar ao Início",
    lost_status: "ESTADO",
    lost_uri: "URL TENTADO",
    lost_details: "DIAGNÓSTICO",
    
    // Chaves de tradução para falha de conexão
    conn_failed_title: "CONEXÃO INTERROMPIDA",
    conn_failed_subtitle: "Servidor Inacessível",
    conn_failed_diagnostic: "Falha na comunicação segura com o servidor de dados do portfólio.",
    conn_failed_action: "Verifique a ligação à internet ou tente restabelecer a comunicação abaixo.",
    conn_failed_retry: "Tentar Ligar Novamente",
    conn_failed_status: "ESTADO DE LIGAÇÃO",
    conn_failed_target: "URL DO RECURSO",
    conn_failed_offline: "OFFLINE",
    conn_failed_diagnosing: "A LIGAR AO SERVIDOR..."
  },
  en: {
    nav_home: "Home",
    nav_about: "About Me",
    nav_education: "Education",
    nav_skills: "Skills",
    nav_projects: "Projects",
    nav_experience: "Experience",
    nav_hobbies: "Hobbies",
    nav_blog: "Blog",
    nav_contact: "Contact",
    
    hero_view_projects: "View Projects",
    hero_get_in_touch: "Get in Touch",
    hero_download_cv: "Download CV",
    
    about_title: "About Me",
    about_history: "My Story",
    about_who_am_i: "Who Am I?",
    about_more_details: "More Details & Philosophy",
    about_know_more: "Learn More About Me",
    about_location: "Location",
    about_email: "Email",
    about_phone: "Phone",
    about_role: "Main Role",
    
    edu_title: "Education",
    edu_subtitle: "Studies & Diplomas",
    edu_view_details: "View details",
    edu_close: "Close",
    edu_secure_record: "Secure Academic Record",
    edu_loading: "Loading academic path...",
    
    skills_title: "Skills",
    skills_subtitle: "Technologies & Tools",
    skills_experience: "Experience Time",
    skills_level: "Proficiency",
    
    exp_title: "Experience",
    exp_subtitle: "Professional Timeline",
    
    hobbies_title: "Hobbies",
    hobbies_subtitle: "Passions & Interests",
    
    blog_title: "Technical Blog",
    blog_subtitle: "Articles & Publications",
    blog_read_more: "Read Article",
    
    contact_title: "Contact",
    contact_subtitle: "Get in Touch",
    contact_name: "Full Name",
    contact_email: "Email Address",
    contact_subject: "Message Subject",
    contact_message: "Write your message here...",
    contact_send: "Send Message",
    contact_sending: "Sending...",
    contact_success: "Message sent with absolute success!",
    contact_error: "Failed to send your message. Please try again.",
    
    footer_rights: "All rights reserved.",
    footer_cookies: "Cookie Policy",
    footer_privacy: "Privacy Policy",
    footer_terms: "Terms and Conditions",
    footer_back: "Back to Portfolio",
    
    cookies_title: "Cookie Policy",
    terms_title: "Terms and Conditions",
    
    // Translation keys for the custom 'LOST' error page
    lost_title: "LOST",
    lost_subtitle: "Unknown Path",
    lost_diagnostic: "The requested route does not exist or has been moved.",
    lost_action: "A safe detour to the home page is recommended.",
    lost_button: "Back to Home",
    lost_status: "STATUS",
    lost_uri: "REQUESTED URL",
    lost_details: "DIAGNOSTIC",
    
    // Translation keys for connection failure
    conn_failed_title: "CONNECTION INTERRUPTED",
    conn_failed_subtitle: "Server Unreachable",
    conn_failed_diagnostic: "Failed to establish a secure communication with the portfolio data server.",
    conn_failed_action: "Check your internet connection or try to re-establish the connection below.",
    conn_failed_retry: "Try Reconnecting Now",
    conn_failed_status: "CONNECTION STATUS",
    conn_failed_target: "RESOURCE URL",
    conn_failed_offline: "OFFLINE",
    conn_failed_diagnosing: "CONNECTING TO SERVER..."
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Inicialização inteligente detetando o idioma preferido do browser ou localStorage anterior
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('ayres_portfolio_lang');
    if (saved === 'pt' || saved === 'en') {
      return saved;
    }
    // Detetar idioma do browser padrão
    const browserLang = navigator.language.slice(0, 2).toLowerCase();
    return browserLang === 'pt' ? 'pt' : 'en';
  });

  // Atualizar as configurações de Cookies / localStorage sempre que o idioma é alterado
  useEffect(() => {
    localStorage.setItem('ayres_portfolio_lang', language);
    // Definir nos Cookies para o backend em PHP ler nativamente se necessário
    document.cookie = `ayres_portfolio_lang=${language}; path=/; max-age=31536000; SameSite=Lax`;
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const toggleLanguage = () => {
    setLanguageState(prev => (prev === 'pt' ? 'en' : 'pt'));
  };

  // Função auxiliar de tradução estática com fallback seguro para Português
  const t = (key: string): string => {
    return (translations[language] as any)[key] || (translations['pt'] as any)[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage deve ser utilizado dentro de um LanguageProvider');
  }
  return context;
};
