import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu, X, Lock, Sun, Moon, WifiOff, RefreshCw, Activity } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

/**
 * Interface que representa os dados estruturados do perfil do utilizador.
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

interface Project {
  id: number;
  title: string;
  description: string;
  image_url?: string;
  tags: string;
  demo_url?: string;
  repo_url?: string;
}

interface Skill {
  id: number;
  name: string;
  level: number;
  category: string;
  icon?: string;
  description?: string;
  experience_time?: string;
}

interface Experience {
  id: number;
  role: string;
  company: string;
  duration: string;
  location?: string;
  description: string;
  image_url?: string;
}

interface Education {
  id: number;
  degree: string;
  institution: string;
  duration: string;
  location?: string;
  description: string;
  image_url?: string;
}

interface AboutSection {
  id: number;
  title: string;
  content: string;
  icon: string;
  sort_order: number;
}

interface AboutImage {
  id: number;
  image_url: string;
  caption?: string;
  sort_order: number;
}

/**
 * COMPONENTE DE LAYOUT PÚBLICO GLOBAL (PublicLayout)
 * =====================================================================
 * Este componente envolve todas as rotas públicas, assegurando uma
 * barra de navegação no topo e o rodapé da página consistentes em 
 * todos os ecrãs públicos do site.
 */
export default function PublicLayout() {
  const { language, setLanguage, t } = useLanguage();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [aboutSections, setAboutSections] = useState<AboutSection[]>([]);
  const [aboutImages, setAboutImages] = useState<AboutImage[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Estados de controlo para falha de rede/conexão segura com a base de dados
  const [connectionError, setConnectionError] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);

  // Estado local para gerir o tema (escuro por padrão para novos visitantes)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme === 'light' || savedTheme === 'dark') ? savedTheme : 'dark';
  });

  /**
   * Alterna o tema global do site entre claro e escuro.
   * Atualiza a classe no documento HTML e armazena a preferência no localStorage.
   */
  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Efeito para injetar a classe 'dark' no elemento raiz conforme o tema ativo
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Efeito do Canvas Interativo de Partículas (Rede Digital Global - Física Melhorada)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particlesArray: Particle[] = [];
    let shockwaves: { x: number, y: number, currentRadius: number, maxRadius: number, speed: number, force: number }[] = [];

    const mouse = {
      x: null as number | null,
      y: null as number | null,
      radius: 140 // Raio de atração/magnetismo ligeiramente ampliado
    };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();

    window.addEventListener('resize', resizeCanvas);

    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    const handleMouseDown = (event: MouseEvent) => {
      shockwaves.push({
        x: event.clientX,
        y: event.clientY,
        currentRadius: 0,
        maxRadius: 180, // Tamanho máximo da onda de choque
        speed: 5.5,     // Velocidade de expansão do anel néon
        force: 12       // Força de empurrão nas partículas
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('mousedown', handleMouseDown);

    class Particle {
      x: number;
      y: number;
      directionX: number;
      directionY: number;
      size: number;
      color: string;

      constructor(x: number, y: number, directionX: number, directionY: number, size: number, color: string) {
        this.x = x;
        this.y = y;
        this.directionX = directionX;
        this.directionY = directionY;
        this.size = size;
        this.color = color;
      }

      // Desenha a partícula com feedback néon fluorescente reativo
      draw(isNearMouse: boolean) {
        if (!ctx) return;
        ctx.beginPath();
        
        // Aumenta o tamanho se estiver perto do cursor
        const currentSize = isNearMouse ? this.size * 1.6 : this.size;
        ctx.arc(this.x, this.y, currentSize, 0, Math.PI * 2, false);
        
        if (isNearMouse) {
          ctx.shadowBlur = 8;
          ctx.shadowColor = this.color;
          ctx.fillStyle = '#ffffff'; // Acende em branco brilhante com brilho néon traseiro
        } else {
          ctx.shadowBlur = 0;
          ctx.fillStyle = this.color;
        }
        
        ctx.fill();
        ctx.shadowBlur = 0; // Resetar sombra para manter o resto do desenho limpo
      }

      update() {
        if (canvas) {
          if (this.x > canvas.width || this.x < 0) {
            this.directionX = -this.directionX;
          }
          if (this.y > canvas.height || this.y < 0) {
            this.directionY = -this.directionY;
          }
        }

        // 1. Aplicar impacto físico das ondas de choque ativas
        shockwaves.forEach(wave => {
          const dx = this.x - wave.x;
          const dy = this.y - wave.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < wave.currentRadius && distance > wave.currentRadius - 30) {
            const pushForce = (1 - (distance / wave.maxRadius)) * wave.force;
            this.directionX += (dx / distance) * pushForce * 0.12;
            this.directionY += (dy / distance) * pushForce * 0.12;
          }
        });

        // 2. Fricção de Amortecimento de Velocidade (Amortecimento fluído)
        this.directionX *= 0.96;
        this.directionY *= 0.96;

        // 3. Velocidade mínima constante para manter o movimento elegante
        const speed = Math.sqrt(this.directionX * this.directionX + this.directionY * this.directionY);
        if (speed < 0.22) {
          const angle = Math.random() * Math.PI * 2;
          this.directionX += Math.cos(angle) * 0.05;
          this.directionY += Math.sin(angle) * 0.05;
        }

        // Mover a partícula
        this.x += this.directionX;
        this.y += this.directionY;

        // 4. Magnetismo Gravitacional e Repulsão do Rato
        let isNear = false;
        if (mouse.x !== null && mouse.y !== null) {
          const dx = this.x - mouse.x;
          const dy = this.y - mouse.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < mouse.radius) {
            isNear = true;
            if (distance < 50) {
              // Repulsão se estiver demasiado colada ao cursor do rato
              const repel = (50 - distance) / 50;
              this.x += (dx / distance) * repel * 3;
              this.y += (dy / distance) * repel * 3;
            } else {
              // Atração orbital suave na zona néon
              const attract = (distance - 50) / (mouse.radius - 50);
              this.x -= (dx / distance) * (1 - attract) * 1.4;
              this.y -= (dy / distance) * (1 - attract) * 1.4;
            }
          }
        }

        this.draw(isNear);
      }
    }

    const initParticles = () => {
      particlesArray = [];
      const numberOfParticles = Math.floor((canvas.width * canvas.height) / 10000);
      
      for (let i = 0; i < Math.min(numberOfParticles, 100); i++) {
        const size = Math.random() * 2 + 1;
        const x = Math.random() * (canvas.width - size * 2) + size;
        const y = Math.random() * (canvas.height - size * 2) + size;
        
        const directionX = (Math.random() * 0.4) - 0.2;
        const directionY = (Math.random() * 0.4) - 0.2;
        
        const color = i % 2 === 0 ? 'rgba(34, 211, 238, 0.4)' : 'rgba(99, 102, 241, 0.4)';

        particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
      }
    };
    initParticles();

    const connectParticles = () => {
      for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
          const dx = particlesArray[a].x - particlesArray[b].x;
          const dy = particlesArray[a].y - particlesArray[b].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 110) {
            const alpha = (1 - (distance / 110)) * 0.12;
            ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
            ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
            ctx.stroke();
          }
        }

        if (mouse.x !== null && mouse.y !== null) {
          const dx = particlesArray[a].x - mouse.x;
          const dy = particlesArray[a].y - mouse.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < mouse.radius) {
            const alpha = (1 - (distance / mouse.radius)) * 0.28;
            ctx.strokeStyle = `rgba(34, 211, 238, ${alpha})`;
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Atualizar e Desenhar as Ondas de Choque Ativas
      shockwaves = shockwaves.filter(wave => {
        wave.currentRadius += wave.speed;
        
        ctx.strokeStyle = `rgba(34, 211, 238, ${(1 - wave.currentRadius / wave.maxRadius) * 0.16})`;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(wave.x, wave.y, wave.currentRadius, 0, Math.PI * 2);
        ctx.stroke();
        
        return wave.currentRadius < wave.maxRadius;
      });

      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
      }
      connectParticles();
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('mousedown', handleMouseDown);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // 1. Efeito para buscar a totalidade dos dados do portfólio a partir do servidor PHP
  useEffect(() => {
    async function loadPortfolioData() {
      try {
        const res = await fetch(`/backend/api/portfolio?lang=${language}`);
        if (!res.ok) {
          throw new Error(`Servidor respondeu com código de estado HTTP ${res.status}`);
        }
        
        const data = await res.json();
        if (data.success) {
          setProfile(data.profile);
          setSkills(data.skills || []);
          setProjects(data.projects || []);
          setExperiences(data.experiences || []);
          setEducation(data.education || []);
          setAboutSections(data.about_sections || []);
          setAboutImages(data.about_images || []);
          setConnectionError(false);
        } else {
          throw new Error(data.message || 'Dados inválidos recebidos da base de dados.');
        }
      } catch (err: any) {
        console.error('Erro ao carregar dados consolidados no Layout:', err);
        setConnectionError(true);
        setErrorDetails(err.message || String(err));
      } finally {
        setIsRetrying(false);
      }
    }

    loadPortfolioData();
  }, [language, retryCount]);

  // 1.2 Efeito reativo para injeção dinâmica de SEO (Metadados e Redes Sociais)
  useEffect(() => {
    if (!profile) return;

    // Mapeamento dos títulos legíveis por rota pública em função do idioma
    const routeTitles: { [key: string]: string } = language === 'pt' ? {
      '/inicio': `Ayres Daio Neto - Full Stack Developer | Técnico Informático`,
      '/sobre': `Sobre Mim | Ayres Daio Neto - Full Stack Developer | Técnico Informático`,
      '/competencias': `Competências Técnicas | Ayres Daio Neto - Full Stack Developer | Técnico Informático`,
      '/projetos': `Projetos Recentes | Ayres Daio Neto - Full Stack Developer | Técnico Informático`,
      '/experiencia': `Experiência Profissional | Ayres Daio Neto - Full Stack Developer | Técnico Informático`,
      '/educacao': `Formação Académica | Ayres Daio Neto - Full Stack Developer | Técnico Informático`,
      '/blog': `Blog Técnico | Ayres Daio Neto - Full Stack Developer | Técnico Informático`,
      '/hobbies': `Hobbies e Passatempos | Ayres Daio Neto - Full Stack Developer | Técnico Informático`,
      '/contacto': `Entrar em Contacto | Ayres Daio Neto - Full Stack Developer | Técnico Informático`,
      '/politicas-de-privacidade': `Política de Privacidade | Ayres Daio Neto - Full Stack Developer | Técnico Informático`,
      '/politica-de-cookies': `Política de Cookies | Ayres Daio Neto - Full Stack Developer | Técnico Informático`,
      '/termos-de-uso': `Termos e Condições | Ayres Daio Neto - Full Stack Developer | Técnico Informático`
    } : {
      '/inicio': `Ayres Daio Neto - Full Stack Developer | IT Technician`,
      '/sobre': `About Me | Ayres Daio Neto - Full Stack Developer | IT Technician`,
      '/competencias': `Technical Skills | Ayres Daio Neto - Full Stack Developer | IT Technician`,
      '/projetos': `Recent Projects | Ayres Daio Neto - Full Stack Developer | IT Technician`,
      '/experiencia': `Professional Experience | Ayres Daio Neto - Full Stack Developer | IT Technician`,
      '/educacao': `Academic Background | Ayres Daio Neto - Full Stack Developer | IT Technician`,
      '/blog': `Technical Blog | Ayres Daio Neto - Full Stack Developer | IT Technician`,
      '/hobbies': `Hobbies and Interests | Ayres Daio Neto - Full Stack Developer | IT Technician`,
      '/contacto': `Get in Touch | Ayres Daio Neto - Full Stack Developer | IT Technician`,
      '/politicas-de-privacidade': `Privacy Policy | Ayres Daio Neto - Full Stack Developer | IT Technician`,
      '/politica-de-cookies': `Cookie Policy | Ayres Daio Neto - Full Stack Developer | IT Technician`,
      '/termos-de-uso': `Terms and Conditions | Ayres Daio Neto - Full Stack Developer | IT Technician`
    };

    // Obter título formatado ou usar fallback elegante
    const pageTitle = routeTitles[location.pathname] || (language === 'pt' ? `Ayres Daio Neto - Full Stack Developer | Técnico Informático` : `Ayres Daio Neto - Full Stack Developer | IT Technician`);
    
    // Se for rota dinâmica do blog, o título é gerado reativamente no BlogPost
    if (!location.pathname.startsWith('/blog/')) {
      document.title = pageTitle;
    }

    // Função utilitária local para limpar tags HTML e descodificar entidades nas meta-tags
    const cleanText = (html: string) => {
      if (!html) return '';
      const cleanHtml = html.replace(/<[^>]*>/g, '');
      const txt = document.createElement('textarea');
      txt.innerHTML = cleanHtml;
      return txt.value;
    };

    // Descrições semânticas dedicadas para motores de pesquisa (SEO) em função do idioma
    const routeDescriptions: { [key: string]: string } = language === 'pt' ? {
      '/inicio': cleanText(profile.bio) || 'Portfólio profissional de desenvolvimento de software e soluções web modernas.',
      '/sobre': cleanText(profile.about_text || profile.bio) || 'História detalhada, conquistas profissionais e contacto pessoal.',
      '/competencias': `Lista completa de tecnologias, competências e ferramentas técnicas dominadas por ${profile.name}.`,
      '/projetos': `Exploração da Bento Grid de projetos desenvolvidos, contendo links de demonstração direta e repositórios.`,
      '/experiencia': `Histórico de cargos profissionais, contributos técnicos e realizações em empresas.`,
      '/educacao': `Percurso letivo, graus académicos obtidos e certificações escolares.`,
      '/blog': 'Artigos técnicos, guias de programação, infraestrutura e gestão de servidores escritos por Ayres Daio Neto.',
      '/hobbies': 'Percurso extracurricular, passatempos, montagem de hardware e gaming de Ayres Daio Neto.',
      '/contacto': `Formulário direto para propostas comerciais, contratação ou mensagens.`,
      '/politicas-de-privacidade': 'Política de privacidade de dados recolhidos através do formulário de contacto do site.',
      '/politica-de-cookies': 'Política de cookies e conformidade estrita com o Regulamento Geral sobre a Proteção de Dados (RGPD).',
      '/termos-de-uso': 'Termos e condições de utilização e regras de direitos de autor da plataforma do portfólio.'
    } : {
      '/inicio': cleanText(profile.bio) || 'Professional portfolio of software development and modern web solutions.',
      '/sobre': cleanText(profile.about_text || profile.bio) || 'Detailed history, professional achievements, and personal contact.',
      '/competencias': `Complete list of technologies, skills, and technical tools mastered by ${profile.name}.`,
      '/projetos': `Exploration of the Bento Grid of developed projects, containing direct demo links and repositories.`,
      '/experiencia': `History of professional roles, technical contributions, and achievements in companies.`,
      '/educacao': `Academic path, academic degrees obtained, and school certifications.`,
      '/blog': 'Technical articles, programming guides, infrastructure, and server management written by Ayres Daio Neto.',
      '/hobbies': 'Extracurricular path, hobbies, hardware assembly, and gaming by Ayres Daio Neto.',
      '/contacto': `Direct form for commercial proposals, hiring, or messages.`,
      '/politicas-de-privacidade': 'Privacy policy for data collected through the website contact form.',
      '/politica-de-cookies': 'Cookie policy and strict compliance with the General Data Protection Regulation (GDPR).',
      '/termos-de-uso': 'Terms and conditions of use and copyright rules of the portfolio platform.'
    };

    const pageDesc = routeDescriptions[location.pathname] || cleanText(profile.bio);

    /**
     * Atualiza ou cria dinamicamente uma meta-tag no cabeçalho do documento (head).
     */
    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let tag = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attribute, name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    // Aplicar as meta-tags padrão de SEO e Redes Sociais (Open Graph / Twitter)
    updateMetaTag('description', pageDesc);
    updateMetaTag('og:title', pageTitle, true);
    updateMetaTag('og:description', pageDesc, true);
    updateMetaTag('og:type', 'website', true);
    if (profile.avatar_url) {
      updateMetaTag('og:image', window.location.origin + profile.avatar_url, true);
    }
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', pageTitle);
    updateMetaTag('twitter:description', pageDesc);

    // Atualizar a tag link canonical dinamicamente para cada rota
    let canonicalTag = document.querySelector('link[rel="canonical"]');
    if (!canonicalTag) {
      canonicalTag = document.createElement('link');
      canonicalTag.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalTag);
    }
    canonicalTag.setAttribute('href', window.location.origin + location.pathname);
  }, [location.pathname, profile]);

  // 1.3 Efeito reativo para registar visitas anónimas de tráfego (RGPD Compliant)
  useEffect(() => {
    // Mapeamento amigável das rotas para nomes de páginas legíveis na base de dados
    const routeNames: { [key: string]: string } = {
      '/inicio': 'Início',
      '/sobre': 'Sobre',
      '/competencias': 'Competências',
      '/projetos': 'Projetos',
      '/experiencia': 'Experiência',
      '/educacao': 'Educação',
      '/blog': 'Blog',
      '/hobbies': 'Hobbies',
      '/contacto': 'Contacto',
      '/politicas-de-privacidade': 'Privacidade',
      '/politica-de-cookies': 'Cookies',
      '/termos-de-uso': 'Termos e Condições'
    };

    let pageName = routeNames[location.pathname] || 'Outra';

    // Detetar acessos dinâmicos individuais a posts
    if (location.pathname.startsWith('/blog/')) {
      pageName = 'Artigo de Blog';
    }

    // Evitar o registo se for acedida alguma rota administrativa do painel
    if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/login') || location.pathname.startsWith('/reset')) {
      return;
    }

    const trackVisit = async () => {
      try {
        await fetch('/backend/api/track_visit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            page: pageName,
            referrer: document.referrer
          })
        });
      } catch (err) {
        // Log silencioso para evitar interferir com a experiência do visitante se a rede falhar
        console.warn('Rastreador de tráfego silenciado devido a erro técnico de ligação:', err);
      }
    };

    // Executa o registo de tráfego com um pequeno atraso para estabilidade na mudança de ecrã
    const timer = setTimeout(trackVisit, 800);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  /**
   * Determina se uma determinada rota está ativa de momento na navegação.
   */
  const isActive = (path: string) => location.pathname === path;

  // Ecrã premium de falha de ligação seguro se os dados do portfólio não conseguirem ser carregados do servidor PHP
  if (connectionError && !profile) {
    return (
      <div className="min-h-screen flex flex-col bg-darkBg text-textPrimary relative overflow-hidden font-sans selection:bg-brandBlue/30 selection:text-white transition-colors duration-300">
        
        {/* Canvas de Fundo Físico (Desvanecido em Falha) */}
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 w-full h-full block z-0 pointer-events-none opacity-30"
        />

        {/* Orbes Néon Pulsantes Ambientais em Tom Vermelho HUD */}
        <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] rounded-full bg-red-900/10 blur-[150px] pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] rounded-full bg-indigo-900/10 blur-[150px] pointer-events-none animate-pulse" style={{ animationDelay: '2s' }}></div>

        {/* Molduras Cibernéticas Decorativas HUD de Segurança nos Cantos */}
        <div className="absolute top-6 left-6 w-8 h-8 border-t border-l border-red-500/25 pointer-events-none hidden md:block z-40"></div>
        <div className="absolute top-6 right-6 w-8 h-8 border-t border-r border-red-500/25 pointer-events-none hidden md:block z-40"></div>
        <div className="absolute bottom-6 left-6 w-8 h-8 border-b border-l border-red-500/25 pointer-events-none hidden md:block z-40"></div>
        <div className="absolute bottom-6 right-6 w-8 h-8 border-b border-r border-red-500/25 pointer-events-none hidden md:block z-40"></div>

        {/* Barra Superior do Ecrã de Erro */}
        <header className="w-full bg-darkBg/95 border-b border-red-500/20 px-6 py-4 flex items-center justify-between z-10 transition-colors duration-300">
          <div className="flex items-center space-x-3 text-lg font-bold font-display">
            <span className="text-red-500 font-mono text-xs sm:text-sm tracking-widest animate-pulse font-bold">[!] ERROR_NODE_DISCONNECTED</span>
          </div>

          {/* Seletores Rápidos de Idioma e Tema */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setLanguage('pt')} 
                className={`text-xs font-mono transition-all hover:text-red-400 ${language === 'pt' ? 'text-red-400 font-bold scale-110 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'text-textSecondary'}`}
              >
                PT
              </button>
              <span className="text-white/20 text-xs">|</span>
              <button 
                onClick={() => setLanguage('en')} 
                className={`text-xs font-mono transition-all hover:text-red-400 ${language === 'en' ? 'text-red-400 font-bold scale-110 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'text-textSecondary'}`}
              >
                EN
              </button>
            </div>
            
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-xl text-textSecondary hover:text-red-400 hover:bg-white/5 transition-all border border-darkBorder"
              aria-label="Alternar Tema"
            >
              {theme === 'dark' ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-indigo-400" />}
            </button>
          </div>
        </header>

        {/* Painel Central HUD de Falha */}
        <main className="flex-grow flex flex-col items-center justify-center px-4 relative z-10 py-12">
          <div className="max-w-md w-full bg-darkSurface/65 border border-red-500/20 rounded-3xl p-8 backdrop-blur-2xl shadow-2xl relative overflow-hidden transition-all duration-300">
            {/* HUD Corners */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-red-500/40 rounded-tl-xl"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-red-500/40 rounded-tr-xl"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-red-500/40 rounded-bl-xl"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-red-500/40 rounded-br-xl"></div>

            <div className="flex flex-col items-center text-center space-y-6">
              
              {/* Círculo do Ícone Néon */}
              <div className="relative w-20 h-20 rounded-full border border-red-500/25 bg-red-950/25 flex items-center justify-center shadow-lg shadow-red-500/5">
                <span className="absolute inset-0 rounded-full border border-red-500/30 animate-ping opacity-60"></span>
                <WifiOff className="w-10 h-10 text-red-500" />
              </div>

              {/* Título de Alerta do HUD */}
              <div className="space-y-2">
                <h1 className="text-base font-extrabold tracking-widest text-textPrimary uppercase font-mono">
                  {t('conn_failed_title')}
                </h1>
                <p className="text-xs text-red-400/90 font-mono uppercase font-bold flex items-center justify-center space-x-1.5">
                  <Activity size={12} className="animate-pulse shrink-0" />
                  <span>{t('conn_failed_subtitle')}</span>
                </p>
              </div>

              {/* Textos Informativos */}
              <div className="space-y-3">
                <p className="text-xs text-textSecondary leading-relaxed">
                  {t('conn_failed_diagnostic')}
                </p>
                <p className="text-xs text-textSecondary font-semibold">
                  {t('conn_failed_action')}
                </p>
              </div>

              {/* Terminal Técnico de Diagnósticos em Tempo Real */}
              <div className="w-full bg-zinc-950/90 border border-zinc-800/40 rounded-xl p-4 text-left font-mono text-[9px] text-red-400/80 space-y-2 relative">
                <div className="flex justify-between items-center border-b border-white/5 pb-1.5 mb-1">
                  <span className="text-white/40">CONSOLE DIAGNOSTIC</span>
                  <span className="text-red-500/50 uppercase font-bold">err_link_down</span>
                </div>
                <div className="space-y-1 text-white/70">
                  <div>
                    <span className="text-white/30">{t('conn_failed_target')}:</span>{' '}
                    <span className="text-white/90 select-all font-semibold">/backend/api/portfolio</span>
                  </div>
                  <div>
                    <span className="text-white/30">{t('lost_details')}:</span>{' '}
                    <span className="text-red-400 select-all break-all">{errorDetails || 'ERR_CONNECTION_REFUSED'}</span>
                  </div>
                  <div>
                    <span className="text-white/30">TIMESTAMP:</span>{' '}
                    <span className="select-all">{new Date().toISOString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-white/30">{t('conn_failed_status')}:</span>{' '}
                    <span className="bg-red-950/50 border border-red-500/35 text-red-400 px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider font-bold">
                      {t('conn_failed_offline')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Botão de Tentativa Dinâmica */}
              <button
                onClick={() => {
                  setIsRetrying(true);
                  setTimeout(() => {
                    setRetryCount(prev => prev + 1);
                  }, 800);
                }}
                disabled={isRetrying}
                className="w-full bg-gradient-to-r from-red-600/10 to-red-500/10 hover:from-red-600/20 hover:to-red-500/20 active:scale-[0.98] disabled:opacity-50 border border-red-500/45 hover:border-red-500 text-red-400 hover:text-red-300 px-6 py-3 rounded-xl font-mono text-xs uppercase font-extrabold tracking-widest transition-all duration-300 flex items-center justify-center space-x-2.5 shadow-lg shadow-red-500/5"
              >
                <RefreshCw size={14} className={`shrink-0 ${isRetrying ? 'animate-spin' : ''}`} />
                <span>{isRetrying ? t('conn_failed_diagnosing') : t('conn_failed_retry')}</span>
              </button>

            </div>
          </div>
        </main>

        {/* Rodapé Minimalista do HUD */}
        <footer className="w-full py-6 text-center border-t border-white/5 text-[9px] font-mono text-textSecondary uppercase tracking-widest z-10 transition-colors duration-300">
          <span>&copy; {new Date().getFullYear()} Ayres Daio Neto // Connection Monitor</span>
        </footer>

      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-darkBg text-textPrimary relative overflow-hidden font-sans selection:bg-brandBlue/30 selection:text-white transition-colors duration-300">
      {/* Canvas Físico de Partículas Global */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full block z-0 pointer-events-none"
      />

      {/* -------------------------------------------------------------
          ORBES DE LUZ NÉON DINÂMICOS DE FUNDO (Ambience Glows OLED)
          ------------------------------------------------------------- */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-900/15 blur-[160px] pointer-events-none animate-float-slow"></div>
      <div className="absolute bottom-[10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-cyan-900/12 blur-[180px] pointer-events-none animate-float-slow" style={{ animationDelay: '3.5s' }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-purple-950/[0.03] blur-[150px] pointer-events-none"></div>

      {/* Suportes Cibernéticos Decorativos nos Cantos do Ecrã Global (HUD Frame) */}
      <div className="absolute top-6 left-6 w-8 h-8 border-t border-l border-indigo-500/35 pointer-events-none hidden md:block z-40"></div>
      <div className="absolute top-6 right-6 w-8 h-8 border-t border-r border-indigo-500/35 pointer-events-none hidden md:block z-40"></div>
      <div className="absolute bottom-6 left-6 w-8 h-8 border-b border-l border-indigo-500/35 pointer-events-none hidden md:block z-40"></div>
      <div className="absolute bottom-6 right-6 w-8 h-8 border-b border-r border-indigo-500/35 pointer-events-none hidden md:block z-40"></div>

      {/* Barra de Diagnóstico de Redes e Sistema (Técnico Informático) */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-darkBg/90 border-b border-darkBorder text-[9px] font-mono text-indigo-400/80 px-6 py-1.5 hidden sm:flex items-center justify-between select-none transition-colors duration-300">
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block"></span>
            <span className="text-emerald-400 font-bold">SYSTEM STATUS: ONLINE</span>
          </span>
          <span className="text-white/20">|</span>
          <span>IP: 192.168.100.1</span>
          <span className="text-white/20">|</span>
          <span>PORT: 443 (HTTPS)</span>
          <span className="text-white/20">|</span>
          <span>SSL: AES-256 SECURE</span>
        </div>
        <div className="flex items-center space-x-4">
          <span>LATENCY: 12ms</span>
          <span className="text-white/20">|</span>
          <span>CPU LOAD: 0.12 (STABLE)</span>
          <span className="text-white/20">|</span>
          <span className="text-cyan-400 font-bold uppercase">Ayres Tech Node</span>
        </div>
      </div>

      {/* -------------------------------------------------------------
          1. BARRA DE NAVEGAÇÃO PREMIUM FLUTUANTE (Efeito Vidro Fixo)
          ------------------------------------------------------------- */}
      <header className="fixed top-0 sm:top-[29px] left-0 right-0 z-50 glass-panel rounded-none border-x-0 border-t-0 border-b border-darkBorder bg-darkBg/60 backdrop-blur-2xl px-4 sm:px-6 py-4 transition-colors duration-300">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* O logótipo redireciona agora para a página inicial do portfólio (/inicio) */}
          <Link to="/inicio" className="flex items-center space-x-3 text-xl font-bold tracking-tight text-gradient font-display">
            <img 
              src="/imag/icon.png" 
              alt="Logotipo" 
              className="w-8 h-8 object-contain hover:rotate-12 transition-transform duration-500" 
            />
            <span>Ayres Daio Neto</span>
          </Link>

          {/* Relação de Links para Desktop */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            {/* O link de Início aponta agora para /inicio em vez da Splash Page de boas-vindas */}
            <Link 
              to="/inicio" 
              className={`relative py-1 transition-all ${isActive('/inicio') ? 'text-brandBlue font-bold' : 'text-textSecondary hover:text-brandBlue'}`}
            >
              <span>{t('nav_home')}</span>
              {isActive('/inicio') && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"></span>}
            </Link>
            <Link 
              to="/sobre" 
              className={`relative py-1 transition-all ${isActive('/sobre') ? 'text-brandBlue font-bold' : 'text-textSecondary hover:text-brandBlue'}`}
            >
              <span>{t('nav_about')}</span>
              {isActive('/sobre') && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"></span>}
            </Link>
            <Link 
              to="/competencias" 
              className={`relative py-1 transition-all ${isActive('/competencias') ? 'text-brandBlue font-bold' : 'text-textSecondary hover:text-brandBlue'}`}
            >
              <span>{t('nav_skills')}</span>
              {isActive('/competencias') && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"></span>}
            </Link>
            <Link 
              to="/projetos" 
              className={`relative py-1 transition-all ${isActive('/projetos') ? 'text-brandBlue font-bold' : 'text-textSecondary hover:text-brandBlue'}`}
            >
              <span>{t('nav_projects')}</span>
              {isActive('/projetos') && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"></span>}
            </Link>
            <Link 
              to="/experiencia" 
              className={`relative py-1 transition-all ${isActive('/experiencia') ? 'text-brandBlue font-bold' : 'text-textSecondary hover:text-brandBlue'}`}
            >
              <span>{t('nav_experience')}</span>
              {isActive('/experiencia') && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"></span>}
            </Link>
            <Link 
              to="/educacao" 
              className={`relative py-1 transition-all ${isActive('/educacao') ? 'text-brandBlue font-bold' : 'text-textSecondary hover:text-brandBlue'}`}
            >
              <span>{t('nav_education')}</span>
              {isActive('/educacao') && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"></span>}
            </Link>
            <Link 
              to="/blog" 
              className={`relative py-1 transition-all ${isActive('/blog') || location.pathname.startsWith('/blog/') ? 'text-brandBlue font-bold' : 'text-textSecondary hover:text-brandBlue'}`}
            >
              <span>{t('nav_blog')}</span>
              {(isActive('/blog') || location.pathname.startsWith('/blog/')) && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"></span>}
            </Link>
            <Link 
              to="/hobbies" 
              className={`relative py-1 transition-all ${isActive('/hobbies') ? 'text-brandBlue font-bold' : 'text-textSecondary hover:text-brandBlue'}`}
            >
              <span>{t('nav_hobbies')}</span>
              {isActive('/hobbies') && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"></span>}
            </Link>
            <Link 
              to="/contacto" 
              className={`relative py-1 transition-all ${isActive('/contacto') ? 'text-brandBlue font-bold' : 'text-textSecondary hover:text-brandBlue'}`}
            >
              <span>{t('nav_contact')}</span>
              {isActive('/contacto') && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"></span>}
            </Link>

            {/* Seletor Bilingue Premium Néon */}
            <div className="flex items-center space-x-2 border-l border-white/10 pl-6 ml-4">
              <button 
                onClick={() => setLanguage('pt')} 
                className={`text-xs font-mono transition-all hover:text-cyan-400 ${language === 'pt' ? 'text-brandBlue font-bold scale-110 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]' : 'text-textSecondary'}`}
              >
                PT
              </button>
              <span className="text-white/20 text-xs">|</span>
              <button 
                onClick={() => setLanguage('en')} 
                className={`text-xs font-mono transition-all hover:text-cyan-400 ${language === 'en' ? 'text-brandBlue font-bold scale-110 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]' : 'text-textSecondary'}`}
              >
                EN
              </button>
            </div>

            {/* Seletor de Tema Claro/Escuro */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-textSecondary hover:text-cyan-400 hover:bg-white/5 transition-all duration-300 ml-4 flex items-center justify-center shrink-0 border border-darkBorder"
              aria-label="Alternar Tema"
              title={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
            >
              {theme === 'dark' ? <Sun size={15} className="text-amber-400 animate-pulse" /> : <Moon size={15} className="text-indigo-400" />}
            </button>
          </nav>

          {/* Seletor do Menu Mobile */}
          <button 
            className="md:hidden text-textSecondary hover:text-textPrimary transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Menu Mobile Suspenso com limitação de altura e scroll */}
        {mobileMenuOpen && (
          <div className="md:hidden glass-panel rounded-2xl mt-3 p-5 flex flex-col space-y-4 text-center bg-darkSurface/95 border border-darkBorder backdrop-blur-2xl animate-fade-in max-h-[calc(100vh-120px)] overflow-y-auto transition-colors duration-300">
            {/* Link móvel atualizado para apontar para /inicio */}
            <Link to="/inicio" onClick={() => setMobileMenuOpen(false)} className={`py-2 text-sm font-medium ${isActive('/inicio') ? 'text-brandBlue font-bold' : 'text-textSecondary'}`}>{t('nav_home')}</Link>
            <Link to="/sobre" onClick={() => setMobileMenuOpen(false)} className={`py-2 text-sm font-medium ${isActive('/sobre') ? 'text-brandBlue font-bold' : 'text-textSecondary'}`}>{t('nav_about')}</Link>
            <Link to="/competencias" onClick={() => setMobileMenuOpen(false)} className={`py-2 text-sm font-medium ${isActive('/competencias') ? 'text-brandBlue font-bold' : 'text-textSecondary'}`}>{t('nav_skills')}</Link>
            <Link to="/projetos" onClick={() => setMobileMenuOpen(false)} className={`py-2 text-sm font-medium ${isActive('/projetos') ? 'text-brandBlue font-bold' : 'text-textSecondary'}`}>{t('nav_projects')}</Link>
            <Link to="/experiencia" onClick={() => setMobileMenuOpen(false)} className={`py-2 text-sm font-medium ${isActive('/experiencia') ? 'text-brandBlue font-bold' : 'text-textSecondary'}`}>{t('nav_experience')}</Link>
            <Link to="/educacao" onClick={() => setMobileMenuOpen(false)} className={`py-2 text-sm font-medium ${isActive('/educacao') ? 'text-brandBlue font-bold' : 'text-textSecondary'}`}>{t('nav_education')}</Link>
            <Link to="/blog" onClick={() => setMobileMenuOpen(false)} className={`py-2 text-sm font-medium ${isActive('/blog') || location.pathname.startsWith('/blog/') ? 'text-brandBlue font-bold' : 'text-textSecondary'}`}>{t('nav_blog')}</Link>
            <Link to="/hobbies" onClick={() => setMobileMenuOpen(false)} className={`py-2 text-sm font-medium ${isActive('/hobbies') ? 'text-brandBlue font-bold' : 'text-textSecondary'}`}>{t('nav_hobbies')}</Link>
            <Link to="/contacto" onClick={() => setMobileMenuOpen(false)} className={`py-2 text-sm font-medium ${isActive('/contacto') ? 'text-brandBlue font-bold' : 'text-textSecondary'}`}>{t('nav_contact')}</Link>
            
            {/* Seletor Móvel de Idioma e Tema */}
            <div className="flex flex-wrap items-center justify-center gap-3 py-2 border-t border-white/5 mt-2">
              <button 
                onClick={() => { setLanguage('pt'); setMobileMenuOpen(false); }} 
                className={`px-3 py-1 rounded-full text-xs font-mono border transition-all ${language === 'pt' ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.2)]' : 'border-white/5 text-textSecondary'}`}
              >
                PT 🇵🇹
              </button>
              <button 
                onClick={() => { setLanguage('en'); setMobileMenuOpen(false); }} 
                className={`px-3 py-1 rounded-full text-xs font-mono border transition-all ${language === 'en' ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.2)]' : 'border-white/5 text-textSecondary'}`}
              >
                EN 🇬🇧
              </button>
              <button 
                onClick={() => { toggleTheme(); setMobileMenuOpen(false); }}
                className={`px-3 py-1 rounded-full text-xs border transition-all flex items-center space-x-1.5 ${theme === 'dark' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'}`}
                aria-label="Alternar Tema Telemóvel"
              >
                {theme === 'dark' ? <Sun size={12} /> : <Moon size={12} />}
                <span>{theme === 'dark' ? 'Claro' : 'Escuro'}</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* -------------------------------------------------------------
          2. ÁREA DE CONTEÚDO PRINCIPAL (COM TRANSIÇÕES DE ECRÃ)
          ------------------------------------------------------------- */}
      <main className="flex-grow flex flex-col relative z-10 pt-20 sm:pt-28">
        <div key={location.pathname} className="flex-grow flex flex-col animate-page-transition">
          <Outlet context={{ profile, skills, projects, experiences, education, about_sections: aboutSections, about_images: aboutImages }} />
        </div>
      </main>

      {/* -------------------------------------------------------------
          3. RODAPÉ GLOBAL OLED (Footer com Políticas e Termos)
          ------------------------------------------------------------- */}
      <footer className="px-4 sm:px-6 py-12 bg-darkSurface border-t border-darkBorder text-textSecondary relative z-10 transition-colors duration-300">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left space-y-1.5">
            <span className="font-bold text-textPrimary text-sm block font-display tracking-wide">
              {profile?.name || 'Ayres Daio Neto'}
            </span>
            <p className="text-xs tracking-wider">
              &copy; {new Date().getFullYear()} {t('footer_rights')}
            </p>
          </div>
          
          {/* Páginas Legais e Opcionais no Rodapé */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold uppercase tracking-wider">
            <Link to="/blog" className="hover:text-indigo-400 transition-colors">
              {t('nav_blog')}
            </Link>
            <span className="text-white/10 hidden sm:inline">|</span>
            <Link to="/hobbies" className="hover:text-indigo-400 transition-colors">
              {t('nav_hobbies')}
            </Link>
            <span className="text-white/10 hidden sm:inline">|</span>
            <Link to="/politicas-de-privacidade" className="hover:text-indigo-400 transition-colors">
              {t('footer_privacy')}
            </Link>
            <span className="text-white/10 hidden sm:inline">|</span>
            <Link to="/politica-de-cookies" className="hover:text-indigo-400 transition-colors">
              {t('footer_cookies')}
            </Link>
            <span className="text-white/10 hidden sm:inline">|</span>
            <Link to="/termos-de-uso" className="hover:text-indigo-400 transition-colors">
              {t('footer_terms')}
            </Link>
            <span className="text-white/10 hidden sm:inline">|</span>
            <a 
              href="/admin/login/" 
              className="text-textSecondary hover:text-brandBlue transition-colors flex items-center justify-center p-1 opacity-30 hover:opacity-100"
              title="Administração"
              aria-label="Admin"
            >
              <Lock size={12} className="shrink-0" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
