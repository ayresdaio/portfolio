import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Terminal, ShieldAlert, Cpu, Activity, Network } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

/**
 * PÁGINA SPLASH DE BOAS-VINDAS INTERATIVA (WelcomePage)
 * =====================================================================
 * Esta página serve como um portal de entrada futurista de alta fidelidade
 * para o portfólio. Apresenta um canvas interativo de partículas físicas
 * que se ligam ao cursor do rato, uma consola glassmorphic suspensa,
 * digitação automática de cargos e um botão néon com efeito de portal.
 */
export default function WelcomePage() {
  const { language, setLanguage } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Estados para o efeito de digitação de comandos da consola (Typewriter)
  const [typedText, setTypedText] = useState('');
  const [cargoIndex, setCargoIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // Relação de cargos técnicos do utilizador para exibição na consola em português e inglês
  const cargos = language === 'pt' ? [
    'Desenvolvedor Full Stack',
    'Técnico de Informática',
    'Administrador de Redes e Sistemas',
    'Especialista em Base de Dados',
    'Entusiasta de Cibersegurança'
  ] : [
    'Full Stack Developer',
    'IT Technician',
    'Systems & Network Administrator',
    'Database Specialist',
    'Cybersecurity Enthusiast'
  ];

  // 1. Efeito do Canvas Interativo de Partículas (Rede Digital)
  useEffect(() => {
    // Ativar temporariamente a classe 'dark' no elemento raiz (HTML) para a página Welcome
    document.documentElement.classList.add('dark');

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particlesArray: Particle[] = [];

    // Objeto para registar a posição do rato
    const mouse = {
      x: null as number | null,
      y: null as number | null,
      radius: 120 // Raio de atração/ligação do rato
    };

    // Ajustar tamanho do canvas às dimensões reais da janela
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();

    window.addEventListener('resize', resizeCanvas);

    // Registar coordenadas do cursor em tempo real
    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
    };

    // Resetar coordenadas ao sair da janela
    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    // Definição da classe de Partícula Digital
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

      // Desenhar a partícula individual
      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
      }

      // Atualizar a física e posição da partícula
      update() {
        // Detetar colisão e inversão de direção nos limites da janela de forma segura
        if (canvas) {
          if (this.x > canvas.width || this.x < 0) {
            this.directionX = -this.directionX;
          }
          if (this.y > canvas.height || this.y < 0) {
            this.directionY = -this.directionY;
          }
        }

        // Movimento natural suave
        this.x += this.directionX;
        this.y += this.directionY;

        // Efeito de repulsão suave do rato (Magnetismo Digital)
        if (mouse.x !== null && mouse.y !== null) {
          const dx = this.x - mouse.x;
          const dy = this.y - mouse.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < mouse.radius) {
            const force = (mouse.radius - distance) / mouse.radius;
            // Empurra a partícula suavemente para longe do cursor
            this.x += (dx / distance) * force * 3;
            this.y += (dy / distance) * force * 3;
          }
        }

        this.draw();
      }
    }

    // Inicializar o conjunto de partículas (densidade proporcional ao ecrã)
    const initParticles = () => {
      particlesArray = [];
      const numberOfParticles = Math.floor((canvas.width * canvas.height) / 9000);
      
      for (let i = 0; i < Math.min(numberOfParticles, 120); i++) {
        const size = Math.random() * 2 + 1; // Diâmetro da partícula
        const x = Math.random() * (canvas.width - size * 2) + size;
        const y = Math.random() * (canvas.height - size * 2) + size;
        
        // Direção de velocidade vetorial suave
        const directionX = (Math.random() * 0.4) - 0.2;
        const directionY = (Math.random() * 0.4) - 0.2;
        
        // Cores de halo néon
        const color = i % 2 === 0 ? 'rgba(34, 211, 238, 0.45)' : 'rgba(99, 102, 241, 0.45)';

        particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
      }
    };
    initParticles();

    // Desenhar teia digital (linhas que conectam as partículas vizinhas)
    const connectParticles = () => {
      for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
          const dx = particlesArray[a].x - particlesArray[b].x;
          const dy = particlesArray[a].y - particlesArray[b].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Se a distância for curta, desenha a linha de rede
          if (distance < 110) {
            const alpha = (1 - (distance / 110)) * 0.15;
            ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
            ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
            ctx.stroke();
          }
        }

        // Conectar também as partículas diretamente ao cursor do rato
        if (mouse.x !== null && mouse.y !== null) {
          const dx = particlesArray[a].x - mouse.x;
          const dy = particlesArray[a].y - mouse.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < mouse.radius) {
            const alpha = (1 - (distance / mouse.radius)) * 0.35;
            // Linha com tom ciano do cursor
            ctx.strokeStyle = `rgba(34, 211, 238, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }
    };

    // Ciclo principal de renderização e animação (60 FPS)
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Atualizar física de cada partícula
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
      }
      
      connectParticles();
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    // Limpeza de ouvintes e animações
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // 2. Efeito Typewriter (Consola de Comandos centralizada)
  useEffect(() => {
    let timer: number;
    const currentCargo = cargos[cargoIndex];

    if (isDeleting) {
      // Apagar caracteres gradualmente
      timer = setTimeout(() => {
        setTypedText(prev => prev.slice(0, -1));
      }, 40);
    } else {
      // Digitar caracteres gradualmente
      timer = setTimeout(() => {
        setTypedText(currentCargo.slice(0, typedText.length + 1));
      }, 70);
    }

    // Se concluiu a digitação do cargo
    if (!isDeleting && typedText === currentCargo) {
      timer = setTimeout(() => setIsDeleting(true), 2000); // Pausa de 2s exibindo o texto completo
    }
    // Se concluiu a eliminação do cargo
    else if (isDeleting && typedText === '') {
      setIsDeleting(false);
      setCargoIndex(prev => (prev + 1) % cargos.length); // Passar ao cargo seguinte
    }

    return () => clearTimeout(timer);
  }, [typedText, isDeleting, cargoIndex, cargos]);

  return (
    <div className="w-full min-h-[100dvh] bg-black text-white overflow-y-auto relative flex flex-col items-center justify-between font-sans selection:bg-brandBlue/30 selection:text-white">
      
      {/* 1. Canvas Físico de Fundo */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full block z-0 pointer-events-auto cursor-none"
      />

      {/* Orbes néon decorativos de fundo para dar brilho de alta fidelidade e contraste */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-indigo-500/5 blur-[180px] pointer-events-none select-none z-0 animate-pulse"></div>
      <div className="absolute top-1/4 left-1/3 w-[300px] h-[300px] rounded-full bg-cyan-500/[0.03] blur-[120px] pointer-events-none select-none z-0"></div>

      {/* Suportes Cibernéticos Decorativos nos Cantos do Ecrã (HUD Frame) */}
      <div className="absolute top-6 left-6 w-8 h-8 border-t border-l border-indigo-500/35 pointer-events-none hidden md:block"></div>
      <div className="absolute top-6 right-6 w-8 h-8 border-t border-r border-indigo-500/35 pointer-events-none hidden md:block"></div>
      <div className="absolute bottom-6 left-6 w-8 h-8 border-b border-l border-indigo-500/35 pointer-events-none hidden md:block"></div>
      <div className="absolute bottom-6 right-6 w-8 h-8 border-b border-r border-indigo-500/35 pointer-events-none hidden md:block"></div>

      {/* Barra Técnica de Topo (HUD Digital de Rede Falsa) */}
      <header className="w-full max-w-6xl mx-auto px-6 py-5 flex items-center justify-between relative z-10 select-none">
        <div className="flex items-center space-x-2 text-[9px] font-mono text-cyan-400 bg-cyan-950/20 border border-cyan-500/20 px-3 py-1.5 rounded-full backdrop-blur-md">
          <Activity size={10} className="text-cyan-400 shrink-0 animate-pulse" />
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
          <span className="font-bold tracking-widest">{language === 'pt' ? 'ESTADO: PORTAL ATIVO' : 'STATUS: PORTAL ACTIVE'}</span>
        </div>

        {/* Comutador de Idioma Interativo Cyberpunk */}
        <div className="flex items-center space-x-1.5 text-[9px] font-mono bg-white/[0.02] border border-white/[0.06] p-1 rounded-full backdrop-blur-md relative z-20">
          <button
            onClick={() => setLanguage('pt')}
            className={`px-2.5 py-1 rounded-full transition-all duration-300 font-bold uppercase tracking-wider ${
              language === 'pt'
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-500 text-white shadow-md shadow-indigo-500/20'
                : 'text-white/40 hover:text-white hover:bg-white/5'
            }`}
            aria-label="Alterar idioma para Português"
            id="lang-selector-pt"
          >
            PT
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`px-2.5 py-1 rounded-full transition-all duration-300 font-bold uppercase tracking-wider ${
              language === 'en'
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-500 text-white shadow-md shadow-indigo-500/20'
                : 'text-white/40 hover:text-white hover:bg-white/5'
            }`}
            aria-label="Change language to English"
            id="lang-selector-en"
          >
            EN
          </button>
        </div>

        <div className="hidden sm:flex items-center space-x-2 text-[9px] font-mono text-white/35 bg-white/[0.01] border border-white/[0.04] px-4 py-1.5 rounded-full backdrop-blur-md">
          <Network size={10} className="text-indigo-400/70" />
          <span className="w-1 h-1 rounded-full bg-indigo-500"></span>
          <span>SECURE CONNECTION: SHA-256 / AES</span>
        </div>
      </header>

      {/* 2. Consola Central Glassmorphic */}
      <main className="w-full max-w-lg px-6 text-center relative z-10 flex flex-col items-center justify-center flex-grow">
        
        {/* Painel Central com Efeito Vidro Fosco Profundo e Flutuação Vertical */}
        <div className="w-full glass-panel p-5 sm:p-9 bg-zinc-950/25 border border-white/[0.06] rounded-3xl sm:rounded-[32px] shadow-[0_30px_70px_rgba(0,0,0,0.85)] backdrop-blur-3xl space-y-6 transform hover:scale-[1.02] hover:-translate-y-1 transition-all duration-500 relative overflow-hidden group animate-float cyber-corners-container">
          
          {/* Suportes Cibernéticos Decorativos nos cantos do painel (Mini Brackets) */}
          <div className="cyber-corner cyber-corner-tl"></div>
          <div className="cyber-corner cyber-corner-tr"></div>
          <div className="cyber-corner cyber-corner-bl"></div>
          <div className="cyber-corner cyber-corner-br"></div>

          {/* Brilho neon radial subtil no hover */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.04),transparent_65%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-0"></div>

          {/* Badge Decorativo Superior */}
          <div className="inline-flex items-center justify-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 rounded-full z-10 relative">
            <Sparkles size={11} className="text-indigo-300" />
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-indigo-300">
              Welcome Gateway
            </span>
          </div>

          {/* Nome com Tipografia e Gradiente Vibrante Premium */}
          <div className="space-y-1.5 relative z-10">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight select-none bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 drop-shadow-[0_2px_10px_rgba(34,211,238,0.15)] font-display uppercase">
              Ayres Daio Neto
            </h1>
            <div className="h-0.5 w-24 bg-gradient-to-r from-cyan-400 via-emerald-400 to-indigo-500 rounded-full mx-auto transform group-hover:w-36 transition-all duration-700"></div>
          </div>

          {/* Consola de Comandos Cyberpunk Estilo SO Real */}
          <div className="w-full bg-zinc-950/70 border border-white/[0.04] rounded-2xl overflow-hidden shadow-inner relative z-10 crt-monitor">
            {/* Barra de Título Superior do Terminal (Simulação de SO) */}
            <div className="bg-zinc-900/50 border-b border-white/[0.03] px-4 py-2.5 flex items-center justify-between select-none">
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500/60 border border-red-600/20"></span>
                <span className="w-2 h-2 rounded-full bg-amber-500/60 border border-amber-600/20"></span>
                <span className="w-2 h-2 rounded-full bg-emerald-500/60 border border-emerald-600/20"></span>
              </div>
              <span className="text-[9px] font-mono text-white/30 tracking-wider">sh - interactive_term</span>
              <Terminal size={10} className="text-white/20" />
            </div>

            {/* Corpo do Terminal com Texto Brilhante */}
            <div className="p-4 min-h-[50px] flex items-center justify-center font-mono text-xs text-cyan-300 drop-shadow-[0_0_5px_rgba(34,211,238,0.45)]">
              <span>{typedText}</span>
              <span className="w-1.5 h-3.5 bg-cyan-300 ml-1 inline-block animate-pulse"></span>
            </div>
          </div>

          {/* Subtítulo Inspirador */}
          <p className="text-xs text-textSecondary leading-relaxed relative z-10 max-w-sm mx-auto font-medium">
            {language === 'pt'
              ? 'Portfólio técnico focado no desenvolvimento de software de alta performance, redes seguras e interfaces fluidas.'
              : 'Technical portfolio focused on the development of high-performance software, secure networks, and fluid interfaces.'}
          </p>

          {/* 3. Botão de Portal Néon com Efeito Shimmer e Glow Traseiro ("ENTRAR NO PORTFÓLIO") */}
          <div className="pt-2 relative z-10">
            <Link 
              to="/inicio" 
              className="group/btn relative w-full py-4 px-6 bg-gradient-to-r from-cyan-500 via-indigo-500 to-blue-600 hover:from-cyan-400 hover:via-indigo-400 hover:to-blue-500 text-white rounded-2xl text-xs font-black tracking-widest uppercase transition-all duration-300 flex items-center justify-center space-x-2.5 shadow-lg shadow-indigo-500/25 hover:shadow-cyan-400/40 hover:scale-[1.02] active:scale-[0.98] cursor-none overflow-hidden shimmer-effect"
            >
              {/* Brilho glow néon dinâmico atrás do botão no hover */}
              <span className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-400 via-indigo-500 to-blue-500 blur-xl opacity-0 group-hover/btn:opacity-70 transition-opacity duration-500 z-0"></span>

              <Cpu size={14} className="text-white relative z-10 animate-spin" style={{ animationDuration: '4s' }} />
              <span className="relative z-10 font-bold tracking-widest">{language === 'pt' ? 'Entrar no Portfólio' : 'Enter Portfolio'}</span>
              <ArrowRight size={14} className="text-white relative z-10 transform group-hover/btn:translate-x-1.5 transition-transform duration-300" />
            </Link>
          </div>

        </div>
      </main>

      {/* Barra Técnica de Rodapé (HUD Informativo de Segurança) */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10 text-[9px] font-mono text-white/30 select-none">
        <div className="flex items-center space-x-2 bg-indigo-950/10 border border-indigo-500/10 px-3.5 py-1.5 rounded-full backdrop-blur-md">
          <ShieldAlert size={12} className="text-indigo-400/60" />
          <span className="font-bold tracking-wider text-indigo-300/80">{language === 'pt' ? 'PORTAL VERIFICADO E TOTALMENTE SEGURO' : 'GATEWAY VERIFIED AND FULLY SECURE'}</span>
        </div>
        <div className="bg-white/[0.01] border border-white/[0.04] px-4 py-1.5 rounded-full backdrop-blur-md">
          AYRES TECH NODE &copy; {new Date().getFullYear()}
        </div>
      </footer>

    </div>
  );
}
