import { useOutletContext } from 'react-router-dom';
import { Info, Eye } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext'; // Adicionado para controlo de idioma

/**
 * Interface que representa os dados estruturados do perfil recebidos do Layout.
 */
interface Profile {
  name: string;
  email: string;
}

/**
 * PÁGINA DE POLÍTICA DE COOKIES (CookiesPage)
 * =====================================================================
 * Apresenta a política transparente de utilização de cookies e
 * armazenamento local da plataforma, em total conformidade com o RGPD
 * e a Diretiva ePrivacy.
 * Construída com efeitos de vidro OLED neon premium.
 * Suporta tradução multilingue (PT/EN) dinamicamente.
 */
export default function CookiesPage() {
  // Aceder aos dados centrais do perfil fornecidos pelo Layout
  const { profile } = useOutletContext<{ profile: Profile | null }>();
  // Aceder ao idioma selecionado atualmente
  const { language } = useLanguage();

  return (
    <section className="px-6 py-20 max-w-4xl mx-auto w-full flex-grow flex flex-col justify-center animate-fade-in relative z-10">
      

      {/* Cabeçalho de Secção com suporte a tradução */}
      <div className="mb-12 space-y-3">
        {/* Ajuste de contraste para o Modo Claro: text-indigo-600 dark:text-indigo-400 */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 rounded-full text-xs font-extrabold uppercase tracking-widest">
          <Eye size={14} />
          <span>{language === 'pt' ? 'Diretiva ePrivacy & RGPD' : 'ePrivacy Directive & GDPR'}</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-textPrimary font-display">
          {language === 'pt' ? (
            <>Política de <span className="text-gradient">Cookies</span></>
          ) : (
            <>Cookie <span className="text-gradient">Policy</span></>
          )}
        </h2>
        <div className="h-1 w-20 bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"></div>
      </div>

      {/* Painel Central com Efeito Vidro OLED - Tradução Condicional baseada na preferência de idioma */}
      <div className="glass-panel p-8 md:p-10 space-y-8 bg-darkSurface/20 border border-darkBorder shadow-2xl leading-relaxed text-textSecondary text-sm md:text-base font-sans">
        
        {language === 'pt' ? (
          <>
            {/* Secção 1 - PT */}
            <div className="space-y-3">
              {/* Ajuste de contraste para o Modo Claro: bg-indigo-600 dark:bg-indigo-400 */}
              <h3 className="text-lg font-bold text-textPrimary font-display flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 inline-block"></span>
                <span>1. O que são Cookies?</span>
              </h3>
              <p>
                Os cookies são pequenos ficheiros de texto que são guardados no seu computador, smartphone ou outro dispositivo de navegação quando acede a websites. Eles permitem que o website reconheça o seu dispositivo e guarde preferências temporárias ou definições técnicas para otimizar e facilitar a sua navegação.
              </p>
            </div>

            {/* Secção 2 - PT */}
            <div className="space-y-3">
              {/* Ajuste de contraste para o Modo Claro: bg-indigo-600 dark:bg-indigo-400 */}
              <h3 className="text-lg font-bold text-textPrimary font-display flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 inline-block"></span>
                <span>2. Como Utilizamos os Cookies e Tecnologias Locais</span>
              </h3>
              <p>
                Neste website de portfólio (propriedade de <strong>{profile?.name || 'Ayres Daio Neto'}</strong>), assumimos um compromisso de máxima transparência e respeito pela sua privacidade. Por esse motivo, a nossa utilização de cookies e tecnologias semelhantes é <strong>estritamente limitada ao mínimo necessário</strong> para o funcionamento do site:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm">
                <li><strong>Cookies Técnicos e Funcionais (Local Storage):</strong> Guardamos apenas as suas preferências de interface básicas (tais como o estado de tema preferido "escuro/claro"). Estes dados são guardados localmente no seu navegador e não são partilhados com servidores externos.</li>
                <li><strong>Estatísticas Anónimas de Tráfego:</strong> Registamos acessos básicos ao website (páginas mais visualizadas) para compreender o interesse profissional nas nossas competências. No entanto, em conformidade estrita com o Regulamento Geral sobre a Proteção de Dados (RGPD), <strong>todos os endereços IP dos visitantes são anonimizados no servidor</strong>. Isto impede a identificação singular de qualquer utilizador ou o rastreio da sua identidade.</li>
              </ul>
            </div>

            {/* Secção 3 - PT */}
            <div className="space-y-3">
              {/* Ajuste de contraste para o Modo Claro: bg-indigo-600 dark:bg-indigo-400 */}
              <h3 className="text-lg font-bold text-textPrimary font-display flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 inline-block"></span>
                <span>3. Cookies de Terceiros e Trackers</span>
              </h3>
              <p>
                Garantimos de forma categórica que este website <strong>não utiliza cookies de terceiros</strong>, trackers comerciais invasivos, nem qualquer tipo de cookies de publicidade direcionada ou marketing comportamental.
              </p>
              {/* Ajuste de contraste para o Modo Claro: bg-indigo-500/5 dark:bg-indigo-950/20, border-indigo-500/15 dark:border-indigo-500/30 e text-indigo-650 dark:text-indigo-300 */}
              <p className="text-xs italic bg-indigo-500/5 dark:bg-indigo-950/20 p-3 rounded-lg border border-indigo-500/15 dark:border-indigo-500/30 flex items-start space-x-2 text-indigo-650 dark:text-indigo-300 font-medium">
                <Info size={16} className="mt-0.5 shrink-0" />
                <span>Navegação Limpa: A sua navegação pelo nosso portfólio é perfeitamente anónima e livre de publicidade intrusiva, respeitando a integridade do seu perfil de utilizador.</span>
              </p>
            </div>

            {/* Secção 4 - PT */}
            <div className="space-y-3">
              {/* Ajuste de contraste para o Modo Claro: bg-indigo-600 dark:bg-indigo-400 */}
              <h3 className="text-lg font-bold text-textPrimary font-display flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 inline-block"></span>
                <span>4. Como Pode Controlar ou Eliminar os Cookies</span>
              </h3>
              <p>
                O utilizador tem o direito de configurar o seu navegador de internet para aceitar, recusar ou apagar cookies a qualquer momento. Para o fazer, basta aceder às definições de privacidade e segurança do seu navegador. 
              </p>
              <p>
                Abaixo encontram-se links com as instruções oficiais para a gestão e bloqueio de cookies nos navegadores mais comuns:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm font-mono">
                {/* Ajuste de contraste para o Modo Claro: text-indigo-600 dark:text-indigo-400 */}
                <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">Google Chrome</a></li>
                <li><a href="https://support.mozilla.org/pt-PT/kb/cookies-informacao-sites-guardam-no-computador" target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">Mozilla Firefox</a></li>
                <li><a href="https://support.apple.com/pt-pt/guide/safari/sfri11471/mac" target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">Apple Safari</a></li>
                <li><a href="https://support.microsoft.com/pt-pt/windows/eliminar-e-gerir-cookies-168dab11-0753-043d-7c16-ede5947fc64d" target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">Microsoft Edge</a></li>
              </ul>
            </div>

            {/* Secção 5 - PT */}
            <div className="space-y-3">
              {/* Ajuste de contraste para o Modo Claro: bg-indigo-600 dark:bg-indigo-400 */}
              <h3 className="text-lg font-bold text-textPrimary font-display flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 inline-block"></span>
                <span>5. Contacto para Dúvidas de Privacidade</span>
              </h3>
              <p>
                Se tiver qualquer dúvida relativamente a esta política de cookies ou se pretender exercer os seus direitos legais de retificação ou eliminação de dados de contacto fornecidos no formulário, poderá enviar uma mensagem de correio eletrónico oficial para o e-mail: <strong>{profile?.email || 'contato@portfolio.com'}</strong>.
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Secção 1 - EN */}
            <div className="space-y-3">
              {/* Ajuste de contraste para o Modo Claro: bg-indigo-600 dark:bg-indigo-400 */}
              <h3 className="text-lg font-bold text-textPrimary font-display flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 inline-block"></span>
                <span>1. What are Cookies?</span>
              </h3>
              <p>
                Cookies are small text files that are saved on your computer, smartphone, or other browsing device when you access websites. They allow the website to recognize your device and save temporary preferences or technical settings to optimize and facilitate your navigation.
              </p>
            </div>

            {/* Secção 2 - EN */}
            <div className="space-y-3">
              {/* Ajuste de contraste para o Modo Claro: bg-indigo-600 dark:bg-indigo-400 */}
              <h3 className="text-lg font-bold text-textPrimary font-display flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 inline-block"></span>
                <span>2. How We Use Cookies and Local Technologies</span>
              </h3>
              <p>
                On this portfolio website (owned by <strong>{profile?.name || 'Ayres Daio Neto'}</strong>), we are committed to maximum transparency and respect for your privacy. For this reason, our use of cookies and similar technologies is <strong>strictly limited to the minimum necessary</strong> for the website\'s operation:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm">
                <li><strong>Technical and Functional Cookies (Local Storage):</strong> We only store your basic interface preferences (such as the preferred theme state "dark/light"). This data is stored locally in your browser and is not shared with external servers.</li>
                <li><strong>Anonymous Traffic Statistics:</strong> We record basic visits to the website (most viewed pages) to understand professional interest in our skills. However, in strict compliance with the General Data Protection Regulation (GDPR), <strong>all visitor IP addresses are anonymized on the server</strong>. This prevents the unique identification of any user or the tracking of their identity.</li>
              </ul>
            </div>

            {/* Secção 3 - EN */}
            <div className="space-y-3">
              {/* Ajuste de contraste para o Modo Claro: bg-indigo-600 dark:bg-indigo-400 */}
              <h3 className="text-lg font-bold text-textPrimary font-display flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 inline-block"></span>
                <span>3. Third-Party Cookies and Trackers</span>
              </h3>
              <p>
                We categorically guarantee that this website <strong>does not use third-party cookies</strong>, invasive commercial trackers, or any type of targeted advertising or behavioral marketing cookies.
              </p>
              {/* Ajuste de contraste para o Modo Claro: bg-indigo-500/5 dark:bg-indigo-950/20, border-indigo-500/15 dark:border-indigo-500/30 e text-indigo-650 dark:text-indigo-300 */}
              <p className="text-xs italic bg-indigo-500/5 dark:bg-indigo-950/20 p-3 rounded-lg border border-indigo-500/15 dark:border-indigo-500/30 flex items-start space-x-2 text-indigo-650 dark:text-indigo-300 font-medium">
                <Info size={16} className="mt-0.5 shrink-0" />
                <span>Clean Navigation: Your browsing through our portfolio is perfectly anonymous and free of intrusive advertising, respecting the integrity of your user profile.</span>
              </p>
            </div>

            {/* Secção 4 - EN */}
            <div className="space-y-3">
              {/* Ajuste de contraste para o Modo Claro: bg-indigo-600 dark:bg-indigo-400 */}
              <h3 className="text-lg font-bold text-textPrimary font-display flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 inline-block"></span>
                <span>4. How You Can Control or Delete Cookies</span>
              </h3>
              <p>
                The user has the right to configure their internet browser to accept, refuse, or delete cookies at any time. To do so, simply access your browser\'s privacy and security settings.
              </p>
              <p>
                Below are links with official instructions for managing and blocking cookies in the most common browsers:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm font-mono">
                {/* Ajuste de contraste para o Modo Claro: text-indigo-600 dark:text-indigo-400 */}
                <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">Google Chrome</a></li>
                <li><a href="https://support.mozilla.org/pt-PT/kb/cookies-informacao-sites-guardam-no-computador" target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">Mozilla Firefox</a></li>
                <li><a href="https://support.apple.com/pt-pt/guide/safari/sfri11471/mac" target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">Apple Safari</a></li>
                <li><a href="https://support.microsoft.com/pt-pt/windows/eliminar-e-gerir-cookies-168dab11-0753-043d-7c16-ede5947fc64d" target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">Microsoft Edge</a></li>
              </ul>
            </div>

            {/* Secção 5 - EN */}
            <div className="space-y-3">
              {/* Ajuste de contraste para o Modo Claro: bg-indigo-600 dark:bg-indigo-400 */}
              <h3 className="text-lg font-bold text-textPrimary font-display flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 inline-block"></span>
                <span>5. Contact for Privacy Questions</span>
              </h3>
              <p>
                If you have any questions regarding this cookie policy or if you wish to exercise your legal rights to rectify or delete contact data provided in the form, you can send an official email to: <strong>{profile?.email || 'contato@portfolio.com'}</strong>.
              </p>
            </div>
          </>
        )}

      </div>
    </section>
  );
}
