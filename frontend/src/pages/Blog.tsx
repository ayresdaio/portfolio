import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, Clock, ArrowRight, BookOpen, Mail, Send, CheckCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface BlogPost {
  id: number;
  title: string;
  title_en?: string;
  slug: string;
  excerpt: string;
  excerpt_en?: string;
  content: string;
  content_en?: string;
  image_url?: string;
  created_at: string;
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
 * COMPONENTE PÚBLICO: Grelha de Artigos de Blog (BlogPage)
 * =====================================================================
 * Apresenta todos os artigos publicados do programador com campo de 
 * pesquisa dinâmico e design cyber glassmorphism.
 */
export default function BlogPage() {
  const { language } = useLanguage();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Estados e lógicas para o Formulário de Newsletter
  const [emailInput, setEmailInput] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [newsletterMsg, setNewsletterMsg] = useState('');

  /**
   * Processa a subscrição da newsletter comunicando com a API REST da Brevo
   */
  const handleNewsletterSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes('@')) {
      setNewsletterStatus('error');
      setNewsletterMsg('Por favor, introduza um e-mail válido.');
      return;
    }

    setNewsletterStatus('loading');
    try {
      const res = await fetch('/backend/api/newsletter.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput })
      });
      const data = await res.json();
      if (data.success) {
        setNewsletterStatus('success');
        setNewsletterMsg(data.message || 'Subscrição efetuada com sucesso!');
        setEmailInput('');
        // Retornar ao estado inicial após 5 segundos
        setTimeout(() => {
          setNewsletterStatus('idle');
          setNewsletterMsg('');
        }, 5000);
      } else {
        setNewsletterStatus('error');
        setNewsletterMsg(data.message || 'Incapaz de registar o e-mail.');
      }
    } catch (err) {
      console.error('Erro na subscrição:', err);
      setNewsletterStatus('error');
      setNewsletterMsg('Ocorreu um erro ao processar a subscrição. Tente mais tarde.');
    }
  };

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch('/backend/api/blog');
        const data = await res.json();
        if (data.success) {
          setPosts(data.posts || []);
        }
      } catch (err) {
        console.error('Erro ao carregar artigos do blog:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  // Formatar datas para o padrão de Portugal (PT-PT)
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  // Calcular o tempo estimado de leitura (baseado na média de 200 palavras/minuto)
  const calculateReadingTime = (text: string) => {
    if (!text) return 1;
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return Math.max(1, minutes);
  };

  // Filtragem dinâmica de posts com base na pesquisa e idioma ativo
  const filteredPosts = posts.filter(post => {
    const title = language === 'en' && post.title_en ? post.title_en : post.title;
    const excerpt = language === 'en' && post.excerpt_en ? post.excerpt_en : post.excerpt;
    return title.toLowerCase().includes(searchTerm.toLowerCase()) || 
           excerpt.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 flex-grow flex flex-col justify-center">
      {/* Cabeçalho da Secção */}
      <div className="text-center space-y-4 mb-12 animate-fade-in">
        <div className="inline-flex items-center space-x-2 bg-indigo-500/10 text-indigo-400 px-4 py-1.5 rounded-full border border-indigo-500/20 text-xs font-mono select-none">
          <BookOpen size={12} className="animate-pulse" />
          <span>CYBER JOURNAL</span>
        </div>
        <h2 className="text-4xl font-extrabold tracking-tight text-gradient font-display">
          Blog Técnico & Conhecimentos
        </h2>
        <p className="text-textSecondary max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
          Partilha de tutoriais, experiências em suporte informático, práticas de cibersegurança e novidades sobre desenvolvimento full-stack.
        </p>
      </div>

      {/* Barra de Pesquisa Néon */}
      <div className="max-w-md mx-auto w-full mb-12 animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <div className="relative">
          <input
            type="text"
            placeholder="Pesquise por artigos ou tópicos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-darkSurface border border-darkBorder hover:border-indigo-500/50 focus:border-brandBlue focus:ring-1 focus:ring-brandBlue text-textPrimary rounded-xl pl-12 pr-4 py-3.5 text-sm transition-all outline-none font-medium"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-textSecondary" size={18} />
        </div>
      </div>

      {loading ? (
        <div className="flex-grow flex items-center justify-center py-20">
          <span className="w-8 h-8 rounded-full border-2 border-indigo-500/20 border-t-brandBlue animate-spin"></span>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-16 glass-panel rounded-2xl border border-darkBorder p-8 max-w-md mx-auto animate-fade-in">
          <span className="text-textSecondary text-3xl block mb-3">🔍</span>
          <h3 className="text-textPrimary font-semibold text-lg">Nenhum artigo encontrado</h3>
          <p className="text-textSecondary text-xs mt-1">
            Experimente pesquisar por termos diferentes ou verifique se escreveu corretamente.
          </p>
        </div>
      ) : (
        /* Grelha Bento de Artigos */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          {filteredPosts.map((post) => (
            <article 
              key={post.id} 
              className="glass-panel hover-card rounded-2xl border border-darkBorder overflow-hidden flex flex-col bg-darkSurface/30"
            >
              {/* Capa do Artigo */}
              <div className="h-48 w-full relative bg-darkBg overflow-hidden border-b border-darkBorder flex items-center justify-center">
                {post.image_url ? (
                  <img 
                    src={post.image_url} 
                    alt={post.title} 
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-950/45 to-cyan-950/45 flex items-center justify-center select-none">
                    <BookOpen size={48} className="text-indigo-400/40" />
                  </div>
                )}
                {/* Overlay luminoso atmosférico */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none"></div>
              </div>

              {/* Corpo do Cartão */}
              <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  {/* Metadados: Data & Leitura */}
                  <div className="flex items-center space-x-4 text-[11px] font-mono text-textSecondary select-none">
                    <span className="flex items-center space-x-1">
                      <Calendar size={12} className="text-indigo-400/80" />
                      <span>{formatDate(post.created_at)}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock size={12} className="text-cyan-400/80" />
                      <span>{calculateReadingTime(post.content)} min leitura</span>
                    </span>
                  </div>

                  {/* Título */}
                  <h3 className="text-lg font-bold text-textPrimary leading-snug hover:text-brandBlue transition-colors font-display line-clamp-2">
                    <Link to={`/blog/${post.slug}`}>
                      {decodeHTMLEntities(language === 'en' && post.title_en ? post.title_en : post.title)}
                    </Link>
                  </h3>

                  {/* Excerto */}
                  <p className="text-textSecondary text-xs leading-relaxed line-clamp-3">
                    {language === 'en' && post.excerpt_en 
                      ? stripHtmlAndDecode(post.excerpt_en) 
                      : (post.excerpt ? stripHtmlAndDecode(post.excerpt) : (language === 'en' ? 'Discover more details in the full article.' : 'Descubra mais pormenores no artigo completo.'))}
                  </p>
                </div>

                {/* Ação: Ler Mais */}
                <div className="pt-2">
                  <Link 
                    to={`/blog/${post.slug}`} 
                    className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-brandBlue hover:text-brandBlue/80 group transition-all"
                  >
                    <span>Ler Artigo</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform duration-350" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
      {/* SECÇÃO NEWSLETTER PREMIUM OLED CYBERPUNK */}
      <div className="mt-20 max-w-xl mx-auto w-full animate-fade-in" style={{ animationDelay: '0.6s' }}>
        <div className="relative cyber-card p-8 rounded-3xl border border-darkBorder bg-darkSurface/40 backdrop-blur-md overflow-hidden cyber-corners-container hover:border-indigo-500/25 transition-all duration-500 shadow-2xl">
          {/* Cantoneiras Néon do Cartão de Newsletter */}
          <div className="cyber-corner cyber-corner-tl !w-3 !h-3"></div>
          <div className="cyber-corner cyber-corner-tr !w-3 !h-3"></div>
          <div className="cyber-corner cyber-corner-bl !w-3 !h-3"></div>
          <div className="cyber-corner cyber-corner-br !w-3 !h-3"></div>

          {/* Efeito Glow Atmosférico Neon */}
          <div className="absolute -right-24 -bottom-24 w-48 h-48 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
              <Mail size={22} className="animate-pulse" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-textPrimary font-display uppercase tracking-wide">
                Subscrever Newsletter Técnica
              </h3>
              <p className="text-xs text-textSecondary max-w-sm leading-relaxed">
                Receba insights semanais, tutoriais de engenharia de software e novidades sobre desenvolvimento full-stack diretamente na sua inbox.
              </p>
            </div>

            <form onSubmit={handleNewsletterSubscribe} className="w-full max-w-md pt-2">
              <div className="relative flex flex-col sm:flex-row items-stretch gap-3">
                <div className="relative flex-grow">
                  <input
                    type="email"
                    required
                    placeholder="Introduza o seu e-mail de subscrição..."
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    disabled={newsletterStatus === 'loading'}
                    className="w-full bg-darkBg/60 border border-darkBorder hover:border-indigo-500/50 focus:border-brandBlue focus:ring-1 focus:ring-brandBlue text-textPrimary rounded-xl pl-4 pr-4 py-3 text-xs transition-all outline-none disabled:opacity-50 font-medium"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={newsletterStatus === 'loading'}
                  className={`px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-xs transition-all duration-300 flex items-center justify-center space-x-2 shrink-0 ${
                    newsletterStatus === 'loading'
                      ? 'bg-darkSurface text-white/50 cursor-not-allowed border border-darkBorder'
                      : 'bg-gradient-to-r from-cyan-500 via-indigo-500 to-blue-600 text-white shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/25 border border-indigo-400 hover:-translate-y-0.5'
                  }`}
                >
                  {newsletterStatus === 'loading' ? (
                    <>
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-white/20 border-t-white animate-spin"></span>
                      <span>A processar...</span>
                    </>
                  ) : (
                    <>
                      <span>Subscrever</span>
                      <Send size={12} />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* MENSAGENS DE FEEDBACK COM CORES NÉON REATIVAS */}
            {newsletterStatus === 'success' && (
              <div className="flex items-center space-x-2 text-emerald-400 text-xs font-mono select-none pt-2 animate-fade-in">
                <CheckCircle size={14} />
                <span>{newsletterMsg}</span>
              </div>
            )}

            {newsletterStatus === 'error' && (
              <div className="text-rose-400 text-xs font-mono select-none pt-2 animate-fade-in">
                <span>⚠️ {newsletterMsg}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
