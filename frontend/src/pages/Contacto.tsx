import { useState, FormEvent } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Mail, Phone, MapPin, Send, AlertCircle, CheckCircle2, MessageSquare, Github, Linkedin, Facebook, Instagram } from 'lucide-react';
import LegalModal from '../components/LegalModal';
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
  about_text?: string;
  about_image_url?: string;
}

/**
 * PÁGINA DEDICADA DE CONTACTO (ContactoPage)
 * =====================================================================
 * Oferece um formulário de contacto seguro com o utilizador, ligado ao
 * endpoint PHP Brevo, além de exibir cartões elegantes e interativos 
 * com as redes sociais dinâmicas retiradas da base de dados.
 */
export default function ContactoPage() {
  const { language, t } = useLanguage();
  // Aceder aos dados centrais do perfil fornecidos pelo Layout Partilhado
  const { profile } = useOutletContext<{ profile: Profile | null }>();

  // Estados locais para controlar os campos do formulário
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formSubject, setFormSubject] = useState('');
  const [formMessage, setFormMessage] = useState('');

  // Estado para controlar a aceitação das Políticas de Privacidade e Termos de Uso (RGPD)
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  
  // Estados para gerir a submissão e o feedback visual
  const [formStatus, setFormStatus] = useState<{ type: 'success' | 'error' | null; msg: string }>({ type: null, msg: '' });
  const [formLoading, setFormLoading] = useState(false);

  // Estado local para gerir qual o modal legal (Políticas ou Termos) que está aberto
  const [legalModalType, setLegalModalType] = useState<'privacy' | 'terms' | null>(null);

  /**
   * Função auxiliar para detetar o tipo de número de telefone (móvel ou fixo em Portugal)
   * e retornar o aviso de custo obrigatório por lei (Decreto-Lei n.º 59/2021).
   */
  const getPhoneCostWarning = (phoneStr: string): string => {
    const cleanPhone = phoneStr.replace(/\s+/g, '');
    // Em Portugal, números móveis começam por 9 e fixos por 2 (considerando também o indicativo +351)
    if (cleanPhone.includes('+3519') || cleanPhone.match(/^9[1236]/)) {
      return language === 'pt' ? 'Chamada para a rede móvel nacional' : 'Call to national mobile network';
    } else if (cleanPhone.includes('+3512') || cleanPhone.match(/^2[1-9]/)) {
      return language === 'pt' ? 'Chamada para a rede fixa nacional' : 'Call to national landline network';
    }
    return language === 'pt' ? 'Chamada para a rede móvel nacional' : 'Call to national mobile network'; // Fallback padrão mais comum
  };

  /**
   * Processa a submissão do formulário enviando os dados para a API do backend.
   */
  const handleContactSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormStatus({ type: null, msg: '' });

    try {
      // Chamada HTTP para o endpoint seguro de mensagens
      const res = await fetch('/backend/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          email: formEmail,
          subject: formSubject,
          message: formMessage
        })
      });

      const data = await res.json();
      if (data.success) {
        // feedback visual de sucesso e limpeza dos campos
        setFormStatus({ type: 'success', msg: data.message || 'Mensagem enviada com sucesso!' });
        setFormName('');
        setFormEmail('');
        setFormSubject('');
        setFormMessage('');
        setAcceptedTerms(false); // Resetar aceitação de termos após submissão de sucesso
      } else {
        // Feedback visual de erro retornado pela API
        setFormStatus({ type: 'error', msg: data.message || 'Ocorreu um erro ao enviar a mensagem.' });
      }
    } catch (err) {
      console.error('Erro de submissão do contacto:', err);
      setFormStatus({ type: 'error', msg: 'Erro de ligação com o servidor. Por favor, tente novamente mais tarde.' });
    } finally {
      setFormLoading(false);
    }
  };

  // Se os dados do perfil ainda estiverem a carregar, exibe o spinner
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
      <div className="text-center md:text-left mb-12 space-y-3 max-w-2xl relative z-10">
        {/* Ajuste de contraste para o Modo Claro: text-indigo-650 dark:text-indigo-300 */}
        <span className="text-[9px] font-extrabold uppercase tracking-widest text-indigo-650 dark:text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1.5 rounded-full inline-block">
          {language === 'pt' ? 'Diga Olá' : 'Say Hello'}
        </span>
        <h2 className="text-3.5xl md:text-5xl font-black tracking-tight text-textPrimary font-display uppercase bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 drop-shadow-[0_2px_10px_rgba(34,211,238,0.12)]">
          {language === 'pt' ? (
            <>Entrar em <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">Contacto</span></>
          ) : (
            <>Get in <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">Touch</span></>
          )}
        </h2>
        <div className="section-divider-cyber"></div>
        <p className="text-textSecondary text-sm md:text-base pt-2 font-medium">
          {language === 'pt'
            ? 'Tem uma proposta, projeto ou simplesmente quer dizer olá? Envie-me uma mensagem direta ou use os canais oficiais.'
            : 'Have a proposal, project, or just want to say hello? Send me a direct message or use the official channels.'}
        </p>
      </div>

      {/* Grelha de Contactos e Formulário */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-start relative z-10">
        
        {/* Lado Esquerdo: Detalhes e Redes Sociais */}
        <div className="lg:col-span-2 space-y-6">
          <div className="cyber-card p-8 space-y-6 cyber-corners-container">
            {/* Mini cantoneiras do cartão de canais */}
            <div className="cyber-corner cyber-corner-tl"></div>
            <div className="cyber-corner cyber-corner-tr"></div>
            <div className="cyber-corner cyber-corner-bl"></div>
            <div className="cyber-corner cyber-corner-br"></div>

            <h3 className="text-lg font-extrabold text-textPrimary font-display flex items-center space-x-3 uppercase tracking-wide">
              <MessageSquare size={18} className="text-cyan-400 drop-shadow-[0_0_4px_rgba(34,211,238,0.45)]" />
              {/* Ajuste de contraste para o Modo Claro: from-cyan-650 to-indigo-600 dark:from-cyan-400 dark:to-indigo-300 */}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-650 to-indigo-600 dark:from-cyan-400 dark:to-indigo-300">{language === 'pt' ? 'Canais de Comunicação' : 'Communication Channels'}</span>
            </h3>
            
            <p className="text-xs md:text-sm text-textSecondary leading-relaxed font-medium">
              {language === 'pt'
                ? 'Estou sempre disponível para discutir novas ideias e oportunidades. Garanto uma resposta rápida em menos de 24 horas úteis.'
                : 'I am always available to discuss new ideas and opportunities. I guarantee a quick response in less than 24 business hours.'}
            </p>

            {/* Lista Física de Dados */}
            <div className="space-y-4 pt-4 border-t border-darkBorder relative z-10">
              <a 
                href={`mailto:${profile.email}`} 
                className="flex items-center space-x-4 text-sm text-textSecondary hover:text-cyan-400 transition-colors group"
              >
                {/* Ajuste de contraste para o Modo Claro: text-indigo-650 dark:text-indigo-400 */}
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-650 dark:text-indigo-400 border border-indigo-500/20 group-hover:border-cyan-400/40 group-hover:text-cyan-405 group-hover:bg-cyan-500/10 transition-all duration-300 shrink-0">
                  <Mail size={16} />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-textSecondary block">{language === 'pt' ? 'Enviar E-mail' : 'Send Email'}</span>
                  <span className="font-semibold text-textPrimary truncate block max-w-[200px]">{profile.email}</span>
                </div>
              </a>

              {profile.phone && (
                <div className="flex items-center space-x-4 text-sm text-textSecondary group">
                  {/* Ajuste de contraste para o Modo Claro: text-cyan-650 dark:text-cyan-400 */}
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-650 dark:text-cyan-400 border border-cyan-500/20 shrink-0">
                    <Phone size={16} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-textSecondary block">{language === 'pt' ? 'Telefone' : 'Phone'}</span>
                    <span className="font-semibold text-textPrimary">{profile.phone}</span>
                    {/* Aviso de custo da chamada em conformidade com o Decreto-Lei n.º 59/2021 de Portugal */}
                    <span className="text-[8px] text-textSecondary/80 block mt-1 font-mono tracking-normal leading-none select-none">
                      {getPhoneCostWarning(profile.phone)}
                    </span>
                  </div>
                </div>
              )}

              {profile.location && (
                <div className="flex items-center space-x-4 text-sm text-textSecondary">
                  {/* Ajuste de contraste para o Modo Claro: text-blue-650 dark:text-blue-400 */}
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-650 dark:text-blue-400 border border-blue-500/20 shrink-0">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-textSecondary block">{language === 'pt' ? 'Localização' : 'Location'}</span>
                    <span className="font-semibold text-textPrimary">{profile.location}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Redes Sociais Dinâmicas em Cartões 3D Hover */}
            <div className="pt-6 border-t border-darkBorder space-y-3 relative z-10">
              <span className="text-[10px] uppercase font-bold tracking-widest text-textSecondary block mb-1">{language === 'pt' ? 'Presença Digital' : 'Digital Presence'}</span>
              <div className="flex flex-wrap gap-3">
                {profile.linkedin_url && (
                  <a 
                    href={profile.linkedin_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-11 h-11 rounded-xl bg-darkSurface/40 border border-darkBorder hover:border-cyan-500/50 hover:text-cyan-400 flex items-center justify-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-500/10 text-textSecondary"
                    aria-label="LinkedIn"
                  >
                    <Linkedin size={20} />
                  </a>
                )}
                {profile.github_url && (
                  <a 
                    href={profile.github_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-11 h-11 rounded-xl bg-darkSurface/40 border border-darkBorder hover:border-cyan-500/50 hover:text-cyan-400 flex items-center justify-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-500/10 text-textSecondary"
                    aria-label="GitHub"
                  >
                    <Github size={20} />
                  </a>
                )}
                {profile.facebook_url && (
                  <a 
                    href={profile.facebook_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-11 h-11 rounded-xl bg-darkSurface/40 border border-darkBorder hover:border-cyan-500/50 hover:text-cyan-400 flex items-center justify-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-500/10 text-textSecondary"
                    aria-label="Facebook"
                  >
                    <Facebook size={20} />
                  </a>
                )}
                {profile.instagram_url && (
                  <a 
                    href={profile.instagram_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-11 h-11 rounded-xl bg-darkSurface/40 border border-darkBorder hover:border-cyan-500/50 hover:text-cyan-400 flex items-center justify-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-500/10 text-textSecondary"
                    aria-label="Instagram"
                  >
                    <Instagram size={20} />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Lado Direito: Formulário Interativo de Contacto */}
        <div className="lg:col-span-3">
          <form onSubmit={handleContactSubmit} className="cyber-card p-8 space-y-6 cyber-corners-container">
            {/* Mini cantoneiras do cartão do formulário */}
            <div className="cyber-corner cyber-corner-tl"></div>
            <div className="cyber-corner cyber-corner-tr"></div>
            <div className="cyber-corner cyber-corner-bl"></div>
            <div className="cyber-corner cyber-corner-br"></div>

            <h3 className="text-lg font-extrabold text-textPrimary font-display uppercase tracking-wide relative z-10">{language === 'pt' ? 'Enviar Mensagem' : 'Send Message'}</h3>

            {/* Caixa de Mensagens de Sucesso ou Erro */}
            {formStatus.type && (
              <div className={`p-4 rounded-xl flex items-start space-x-3 text-sm animate-fade-in relative z-10 ${
                formStatus.type === 'success' 
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                  : 'bg-rose-500/10 border border-rose-500/20 text-rose-650 dark:text-rose-305'
              }`}>
                {formStatus.type === 'success' ? (
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0 animate-bounce" />
                ) : (
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                )}
                <span>{formStatus.msg}</span>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-6 relative z-10">
              <div className="space-y-2">
                <label htmlFor="form-name" className="text-[10px] font-bold uppercase tracking-widest text-textSecondary">{t('contact_name')}</label>
                <input 
                  id="form-name"
                  type="text" 
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder={language === 'pt' ? 'Introduza o seu nome' : 'Enter your name'}
                  className="w-full bg-darkSurface/40 border border-darkBorder focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/20 rounded-xl px-4 py-3 text-sm outline-none text-textPrimary transition-all focus:bg-darkBg/80 font-sans font-medium"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="form-email" className="text-[10px] font-bold uppercase tracking-widest text-textSecondary">{t('contact_email')}</label>
                <input 
                  id="form-email"
                  type="email" 
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="exemplo@email.com"
                  className="w-full bg-darkSurface/40 border border-darkBorder focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/20 rounded-xl px-4 py-3 text-sm outline-none text-textPrimary transition-all focus:bg-darkBg/80 font-sans font-medium"
                />
              </div>
            </div>

            <div className="space-y-2 relative z-10">
              <label htmlFor="form-subject" className="text-[10px] font-bold uppercase tracking-widest text-textSecondary">{t('contact_subject')}</label>
              <input 
                id="form-subject"
                type="text" 
                required
                value={formSubject}
                onChange={(e) => setFormSubject(e.target.value)}
                placeholder={language === 'pt' ? 'Em que assunto lhe posso ajudar?' : 'How can I help you?'}
                /* Classes CSS dinâmicas baseadas nas variáveis de tema do portefólio para compatibilidade com Modo Claro */
                className="w-full bg-darkSurface/40 border border-darkBorder focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/20 rounded-xl px-4 py-3 text-sm outline-none text-textPrimary transition-all focus:bg-darkBg/80 font-sans font-medium"
              />
            </div>

            <div className="space-y-2 relative z-10">
              <label htmlFor="form-message" className="text-[10px] font-bold uppercase tracking-widest text-textSecondary">{language === 'pt' ? 'A Sua Mensagem' : 'Your Message'}</label>
              <textarea 
                id="form-message"
                required
                rows={5}
                value={formMessage}
                onChange={(e) => setFormMessage(e.target.value)}
                placeholder={t('contact_message')}
                className="w-full bg-darkSurface/40 border border-darkBorder focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/20 rounded-xl px-4 py-3 text-sm outline-none text-textPrimary transition-all focus:bg-darkBg/80 font-sans font-medium resize-none"
              ></textarea>
            </div>

            {/* Caixa de Consentimento (RGPD / GDPR) com hiperligações para as páginas legais */}
            <div className="flex items-start space-x-3 pt-2 relative z-10">
              <input 
                id="accept-privacy"
                type="checkbox"
                required
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="w-4 h-4 rounded border-darkBorder bg-darkBg/40 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-black accent-cyan-500 mt-0.5 cursor-pointer transition-all hover:border-cyan-500/30 shrink-0"
              />
              <label htmlFor="accept-privacy" className="text-xs text-textSecondary leading-normal cursor-pointer select-none font-medium">
                {language === 'pt' ? (
                  <>
                    Li e aceito as{' '}
                    {/* Ajuste de contraste para o Modo Claro: text-cyan-650 dark:text-cyan-400 */}
                    <button 
                      type="button" 
                      onClick={() => setLegalModalType('privacy')}
                      className="text-cyan-650 dark:text-cyan-400 hover:text-cyan-750 dark:hover:text-cyan-300 hover:underline transition-colors font-bold bg-transparent border-none p-0 inline cursor-pointer outline-none focus:text-cyan-300 focus:underline"
                    >
                      Políticas de Privacidade
                    </button>{' '}
                    e os{' '}
                    {/* Ajuste de contraste para o Modo Claro: text-cyan-650 dark:text-cyan-400 */}
                    <button 
                      type="button" 
                      onClick={() => setLegalModalType('terms')}
                      className="text-cyan-650 dark:text-cyan-400 hover:text-cyan-750 dark:hover:text-cyan-300 hover:underline transition-colors font-bold bg-transparent border-none p-0 inline cursor-pointer outline-none focus:text-cyan-300 focus:underline"
                    >
                      Termos de Uso
                    </button>
                    .
                  </>
                ) : (
                  <>
                    I have read and accept the{' '}
                    {/* Ajuste de contraste para o Modo Claro: text-cyan-650 dark:text-cyan-400 */}
                    <button 
                      type="button" 
                      onClick={() => setLegalModalType('privacy')}
                      className="text-cyan-650 dark:text-cyan-400 hover:text-cyan-750 dark:hover:text-cyan-300 hover:underline transition-colors font-bold bg-transparent border-none p-0 inline cursor-pointer outline-none focus:text-cyan-300 focus:underline"
                    >
                      Privacy Policy
                    </button>{' '}
                    and the{' '}
                    {/* Ajuste de contraste para o Modo Claro: text-cyan-650 dark:text-cyan-400 */}
                    <button 
                      type="button" 
                      onClick={() => setLegalModalType('terms')}
                      className="text-cyan-650 dark:text-cyan-400 hover:text-cyan-750 dark:hover:text-cyan-300 hover:underline transition-colors font-bold bg-transparent border-none p-0 inline cursor-pointer outline-none focus:text-cyan-300 focus:underline"
                    >
                      Terms of Use
                    </button>
                    .
                  </>
                )}
              </label>
            </div>

            {/* Botão de Envio animado com shimmer e glow traseiro - apenas habilitado se aceitou os termos */}
            <button 
              type="submit" 
              disabled={formLoading || !acceptedTerms}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 via-indigo-500 to-blue-600 hover:from-cyan-400 hover:via-indigo-400 hover:to-blue-500 disabled:from-darkSurface disabled:to-darkSurface/90 disabled:border disabled:border-darkBorder/40 disabled:text-textSecondary/40 disabled:cursor-not-allowed text-white font-bold rounded-xl flex items-center justify-center space-x-3 shadow-lg shadow-indigo-500/25 enabled:hover:shadow-cyan-400/40 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 enabled:shimmer-effect overflow-hidden relative"
            >
              {/* Brilho glow néon dinâmico atrás do botão no hover */}
              <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400 via-indigo-500 to-blue-550 blur-lg opacity-0 group-hover:opacity-60 transition-opacity duration-300 z-0"></span>
              
              {formLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin relative z-10"></div>
                  <span className="relative z-10">{t('contact_sending')}</span>
                </>
              ) : (
                <>
                  <Send size={16} className="relative z-10" />
                  <span className="relative z-10 tracking-widest uppercase text-xs">{language === 'pt' ? 'Enviar Mensagem Direta' : 'Send Direct Message'}</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Renderização condicional do Modal Legal com React Portals */}
      {legalModalType && (
        <LegalModal 
          type={legalModalType} 
          onClose={() => setLegalModalType(null)} 
        />
      )}
    </section>
  );
}

