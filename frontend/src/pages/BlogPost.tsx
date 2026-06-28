import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, ArrowLeft, BookOpen, User, Mail, Send, CheckCircle } from 'lucide-react';
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
 * COMPONENTE PÚBLICO: Leitura de Artigo Individual (BlogPostPage)
 * =====================================================================
 * Detalha e renderiza o artigo a partir do slug dinâmico na URL.
 * Possui um parser Markdown de alto desempenho embutido para renderizar
 * a estrutura textual com estética premium néon no tema OLED.
 */
export default function BlogPostPage() {
  const { language } = useLanguage();
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados e lógicas para o Formulário de Newsletter
  const [emailInput, setEmailInput] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [newsletterMsg, setNewsletterMsg] = useState('');

  /**
   * Processa a subscrição da newsletter ligando-se ao endpoint PHP da Brevo
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
    async function fetchPost() {
      try {
        const res = await fetch(`/backend/api/blog?slug=${slug}`);
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('Artigo não encontrado.');
          }
          throw new Error('Erro na ligação ao servidor.');
        }
        
        const data = await res.json();
        if (data.success && data.post) {
          setPost(data.post);
          // Atualizar o título do documento dinamicamente para SEO de acordo com o idioma preferido
          const titleSEO = language === 'en' && data.post.title_en ? data.post.title_en : data.post.title;
          document.title = `${titleSEO} | Ayres Daio Neto - Blog`;
        } else {
          throw new Error(data.message || 'Falha ao carregar post.');
        }
      } catch (err: any) {
        setError(err.message || 'Ocorreu um erro ao processar o pedido.');
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchPost();
    }
  }, [slug]);

  // Formatar datas para Portugal (PT-PT)
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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 flex-grow flex flex-col justify-center">
      {/* Botão de Retorno */}
      <div className="mb-8 animate-fade-in select-none">
        <Link 
          to="/blog" 
          className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-textSecondary hover:text-brandBlue transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1.5 transition-transform duration-350" />
          <span>Voltar ao Blog</span>
        </Link>
      </div>

      {loading ? (
        <div className="flex-grow flex items-center justify-center py-20">
          <span className="w-8 h-8 rounded-full border-2 border-indigo-500/20 border-t-brandBlue animate-spin"></span>
        </div>
      ) : error || !post ? (
        <div className="text-center py-16 glass-panel rounded-2xl border border-rose-500/20 p-8 max-w-md mx-auto animate-fade-in">
          <span className="text-rose-500 text-3xl block mb-3">⚠️</span>
          <h3 className="text-textPrimary font-semibold text-lg">Erro no carregamento</h3>
          <p className="text-textSecondary text-xs mt-1">
            {error || 'Artigo do blog indisponível de momento.'}
          </p>
          <div className="mt-6">
            <Link to="/blog" className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-500/20 transition-all">
              Tentar novamente
            </Link>
          </div>
        </div>
      ) : (
        /* Detalhe do Post de Blog */
        <article className="space-y-8 animate-fade-in">
          {/* Capa Principal Gigante */}
          {post.image_url && (
            <div className="w-full h-64 sm:h-96 bg-darkBg rounded-3xl overflow-hidden border border-darkBorder relative">
              <img 
                src={post.image_url} 
                alt={post.title} 
                className="w-full h-full object-cover"
              />
              {/* Blur atmosférico de fundo */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent pointer-events-none"></div>
            </div>
          )}

          {/* Cabeçalho de Metadados e Título */}
          <div className="space-y-4">
            {/* Categoria/Etiqueta do Post */}
            <div className="inline-flex items-center space-x-2 bg-indigo-500/10 text-indigo-400 px-4 py-1.5 rounded-full border border-indigo-500/20 text-xs font-mono select-none">
              <BookOpen size={12} />
              <span>ARTIGO TÉCNICO</span>
            </div>

            {/* Título Principal */}
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-textPrimary leading-tight font-display">
              {decodeHTMLEntities(language === 'en' && post.title_en ? post.title_en : post.title)}
            </h1>

            {/* Linha de Info */}
            <div className="flex flex-wrap gap-6 items-center text-xs font-mono text-textSecondary select-none border-b border-darkBorder pb-6">
              <span className="flex items-center space-x-1.5">
                <User size={14} className="text-indigo-400/80" />
                <span>Ayres Daio Neto</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <Calendar size={14} className="text-indigo-400/80" />
                <span>{formatDate(post.created_at)}</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <Clock size={14} className="text-cyan-400/80" />
                <span>{calculateReadingTime(language === 'en' && post.content_en ? post.content_en : post.content)} min de leitura</span>
              </span>
            </div>
          </div>

          {/* Conteúdo do Artigo em HTML Rico */}
          <div 
            className="content-area font-sans text-textSecondary space-y-4 prose prose-invert select-text max-w-full"
            dangerouslySetInnerHTML={{ __html: language === 'en' && post.content_en ? post.content_en : post.content }}
          />

          {/* SECÇÃO NEWSLETTER PREMIUM OLED CYBERPUNK NA BASE DO ARTIGO */}
          <div className="mt-16 border-t border-darkBorder pt-12 max-w-xl mx-auto w-full select-none">
            <div className="relative cyber-card p-6 sm:p-8 rounded-3xl border border-darkBorder bg-darkSurface/40 backdrop-blur-md overflow-hidden cyber-corners-container hover:border-indigo-500/25 transition-all duration-500 shadow-2xl">
              {/* Cantoneiras Néon do Cartão de Newsletter */}
              <div className="cyber-corner cyber-corner-tl !w-3 !h-3"></div>
              <div className="cyber-corner cyber-corner-tr !w-3 !h-3"></div>
              <div className="cyber-corner cyber-corner-bl !w-3 !h-3"></div>
              <div className="cyber-corner cyber-corner-br !w-3 !h-3"></div>

              {/* Efeito Glow Atmosférico Neon */}
              <div className="absolute -right-24 -bottom-24 w-48 h-48 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none"></div>

              <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                  <Mail size={18} className="animate-pulse" />
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-base sm:text-lg font-bold text-textPrimary font-display uppercase tracking-wide">
                    Gostou deste Artigo?
                  </h3>
                  <p className="text-[11px] text-textSecondary max-w-sm leading-relaxed">
                    Subscreva a nossa newsletter técnica para receber novos tutoriais e artigos sobre desenvolvimento web e cibersegurança na sua inbox.
                  </p>
                </div>

                <form onSubmit={handleNewsletterSubscribe} className="w-full max-w-md pt-2">
                  <div className="relative flex flex-col sm:flex-row items-stretch gap-2.5">
                    <div className="relative flex-grow">
                      <input
                        type="email"
                        required
                        placeholder="Introduza o seu e-mail..."
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        disabled={newsletterStatus === 'loading'}
                        className="w-full bg-darkBg/60 border border-darkBorder hover:border-indigo-500/50 focus:border-brandBlue focus:ring-1 focus:ring-brandBlue text-textPrimary rounded-xl pl-4 pr-4 py-2.5 text-xs transition-all outline-none disabled:opacity-50 font-medium"
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={newsletterStatus === 'loading'}
                      className={`px-5 py-2.5 rounded-xl font-bold uppercase tracking-wider text-[11px] transition-all duration-300 flex items-center justify-center space-x-2 shrink-0 ${
                        newsletterStatus === 'loading'
                          ? 'bg-darkSurface text-white/50 cursor-not-allowed border border-darkBorder'
                          : 'bg-gradient-to-r from-cyan-500 via-indigo-500 to-blue-600 text-white shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/25 border border-indigo-400 hover:-translate-y-0.5'
                      }`}
                    >
                      {newsletterStatus === 'loading' ? (
                        <>
                          <span className="w-3 h-3 rounded-full border-2 border-white/20 border-t-white animate-spin"></span>
                          <span>A processar...</span>
                        </>
                      ) : (
                        <>
                          <span>Subscrever</span>
                          <Send size={11} />
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* MENSAGENS DE FEEDBACK COM CORES NÉON REATIVAS */}
                {newsletterStatus === 'success' && (
                  <div className="flex items-center space-x-1.5 text-emerald-400 text-[11px] font-mono pt-1.5 animate-fade-in">
                    <CheckCircle size={12} />
                    <span>{newsletterMsg}</span>
                  </div>
                )}

                {newsletterStatus === 'error' && (
                  <div className="text-rose-400 text-[11px] font-mono pt-1.5 animate-fade-in">
                    <span>⚠️ {newsletterMsg}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </article>
      )}
    </div>
  );
}
