import { useOutletContext } from 'react-router-dom';
import { ShieldCheck, Info } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext'; // Adicionado para controlo de idioma

/**
 * Interface que representa os dados estruturados do perfil recebidos do Layout.
 */
interface Profile {
  name: string;
  email: string;
}

/**
 * PÁGINA DE POLÍTICAS DE PRIVACIDADE (PoliticasPage)
 * =====================================================================
 * Apresenta o regulamento de tratamento de dados pessoais do portfólio,
 * estruturado com painéis de vidro OLED translúcidos e efeito desfocado.
 * Suporta tradução multilingue (PT/EN) dinamicamente.
 */
export default function PoliticasPage() {
  // Aceder aos dados centrais do perfil fornecidos pelo Layout
  const { profile } = useOutletContext<{ profile: Profile | null }>();
  // Aceder ao idioma selecionado atualmente através do hook de contexto
  const { language } = useLanguage();

  return (
    <section className="px-6 py-20 max-w-4xl mx-auto w-full flex-grow flex flex-col justify-center animate-fade-in relative z-10">
      

      {/* Cabeçalho de Secção com suporte a tradução */}
      <div className="mb-12 space-y-3">
        {/* Ajuste de contraste para o Modo Claro: text-indigo-600 dark:text-indigo-400 */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 rounded-full text-xs font-extrabold uppercase tracking-widest">
          <ShieldCheck size={14} />
          <span>{language === 'pt' ? 'Segurança de Dados' : 'Data Security'}</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-textPrimary font-display">
          {language === 'pt' ? (
            <>Políticas de <span className="text-gradient">Privacidade</span></>
          ) : (
            <>Privacy <span className="text-gradient">Policy</span></>
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
                <span>1. Introdução</span>
              </h3>
              <p>
                A sua privacidade é extremamente importante para nós. Esta política de privacidade explica que tipos de dados pessoais recolhemos através deste website de portfólio (propriedade de <strong>{profile?.name || 'Ayres Daio Neto'}</strong>) e de que forma os tratamos, protegemos e utilizamos.
              </p>
            </div>

            {/* Secção 2 - PT */}
            <div className="space-y-3">
              {/* Ajuste de contraste para o Modo Claro: bg-indigo-600 dark:bg-indigo-400 */}
              <h3 className="text-lg font-bold text-textPrimary font-display flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 inline-block"></span>
                <span>2. Recolha de Informações</span>
              </h3>
              <p>
                Recolhemos informações estritamente limitadas que nos fornece diretamente através do formulário de contacto na página correspondente:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm">
                <li><strong>Identificação:</strong> Nome próprio ou nome profissional que indicar.</li>
                <li><strong>Contacto:</strong> Endereço de correio eletrónico (e-mail) fornecido por si para fins de resposta.</li>
                <li><strong>Mensagem:</strong> O conteúdo descritivo, assunto e dados contextuais que redigir na sua comunicação direta.</li>
              </ul>
            </div>

            {/* Secção 3 - PT */}
            <div className="space-y-3">
              {/* Ajuste de contraste para o Modo Claro: bg-indigo-600 dark:bg-indigo-400 */}
              <h3 className="text-lg font-bold text-textPrimary font-display flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 inline-block"></span>
                <span>3. Finalidade e Utilização dos Dados</span>
              </h3>
              <p>
                Qualquer dado pessoal fornecido através do formulário será utilizado de forma exclusiva para:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm">
                <li>Responder diretamente às suas mensagens, esclarecer dúvidas ou responder a propostas de trabalho.</li>
                <li>Estabelecer uma ligação comercial profissional direta se solicitado.</li>
              </ul>
              {/* Ajuste de contraste para o Modo Claro: bg-indigo-500/5 dark:bg-indigo-950/20, border-indigo-500/15 dark:border-indigo-500/30 e text-indigo-650 dark:text-indigo-300 */}
              <p className="text-xs italic bg-indigo-500/5 dark:bg-indigo-950/20 p-3 rounded-lg border border-indigo-500/15 dark:border-indigo-500/30 flex items-start space-x-2 text-indigo-650 dark:text-indigo-300">
                <Info size={16} className="mt-0.5 shrink-0" />
                <span>Nota Importante: Os seus dados nunca serão vendidos, alugados, partilhados ou transferidos a terceiros sob qualquer pretexto, exceto em cumprimento estrito de ordens ou obrigações judiciais.</span>
              </p>
            </div>

            {/* Secção 4 - PT */}
            <div className="space-y-3">
              {/* Ajuste de contraste para o Modo Claro: bg-indigo-600 dark:bg-indigo-400 */}
              <h3 className="text-lg font-bold text-textPrimary font-display flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 inline-block"></span>
                <span>4. Segurança do Tratamento</span>
              </h3>
              <p>
                Implementamos medidas técnicas de segurança físicas e digitais adequadas para salvaguardar os seus dados pessoais contra perda, destruição, alteração acidental, ou acessos não autorizados. A comunicação no nosso formulário de contacto é efetuada sob ligações HTTPS encriptadas com protocolo TLS.
              </p>
            </div>

            {/* Secção 5 - PT */}
            <div className="space-y-3">
              {/* Ajuste de contraste para o Modo Claro: bg-indigo-600 dark:bg-indigo-400 */}
              <h3 className="text-lg font-bold text-textPrimary font-display flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 inline-block"></span>
                <span>5. Cookies e Rastreamento</span>
              </h3>
              <p>
                Este website utiliza cookies meramente funcionais para garantir o correto funcionamento de elementos técnicos da interface (como guardar o seu estado de tema preferido). Não utilizamos cookies intrusivos de publicidade ou rastreamento comportamental de terceiros.
              </p>
            </div>

            {/* Secção 6 - PT */}
            <div className="space-y-3">
              {/* Ajuste de contraste para o Modo Claro: bg-indigo-600 dark:bg-indigo-400 */}
              <h3 className="text-lg font-bold text-textPrimary font-display flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 inline-block"></span>
                <span>6. Contactos e Direitos do Utilizador</span>
              </h3>
              <p>
                Ao abrigo do Regulamento Geral sobre a Proteção de Dados (RGPD), o utilizador tem o direito de solicitar a consulta, retificação, limitação de tratamento ou eliminação definitiva de todos os seus dados recolhidos a qualquer altura. 
              </p>
              <p>
                Caso pretenda exercer estes direitos legais ou obter qualquer esclarecimento adicional, por favor contacte o proprietário enviando uma mensagem para: <strong>{profile?.email || 'contato@portfolio.com'}</strong>.
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
                <span>1. Introduction</span>
              </h3>
              <p>
                Your privacy is extremely important to us. This privacy policy explains what types of personal data we collect through this portfolio website (owned by <strong>{profile?.name || 'Ayres Daio Neto'}</strong>) and how we process, protect, and use it.
              </p>
            </div>

            {/* Secção 2 - EN */}
            <div className="space-y-3">
              {/* Ajuste de contraste para o Modo Claro: bg-indigo-600 dark:bg-indigo-400 */}
              <h3 className="text-lg font-bold text-textPrimary font-display flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 inline-block"></span>
                <span>2. Information Collection</span>
              </h3>
              <p>
                We collect strictly limited information that you provide directly through the contact form on the corresponding page:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm">
                <li><strong>Identification:</strong> First name or professional name that you indicate.</li>
                <li><strong>Contact:</strong> Email address provided by you for reply purposes.</li>
                <li><strong>Message:</strong> The descriptive content, subject, and contextual data that you write in your direct communication.</li>
              </ul>
            </div>

            {/* Secção 3 - EN */}
            <div className="space-y-3">
              {/* Ajuste de contraste para o Modo Claro: bg-indigo-600 dark:bg-indigo-400 */}
              <h3 className="text-lg font-bold text-textPrimary font-display flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 inline-block"></span>
                <span>3. Purpose and Use of Data</span>
              </h3>
              <p>
                Any personal data provided through the form will be used exclusively to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm">
                <li>Respond directly to your messages, clarify doubts, or reply to job proposals.</li>
                <li>Establish a direct professional business connection if requested.</li>
              </ul>
              {/* Ajuste de contraste para o Modo Claro: bg-indigo-500/5 dark:bg-indigo-950/20, border-indigo-500/15 dark:border-indigo-500/30 e text-indigo-650 dark:text-indigo-300 */}
              <p className="text-xs italic bg-indigo-500/5 dark:bg-indigo-950/20 p-3 rounded-lg border border-indigo-500/15 dark:border-indigo-500/30 flex items-start space-x-2 text-indigo-650 dark:text-indigo-300 font-medium">
                <Info size={16} className="mt-0.5 shrink-0" />
                <span>Important Note: Your data will never be sold, rented, shared, or transferred to third parties under any pretext, except in strict compliance with court orders or legal obligations.</span>
              </p>
            </div>

            {/* Secção 4 - EN */}
            <div className="space-y-3">
              {/* Ajuste de contraste para o Modo Claro: bg-indigo-600 dark:bg-indigo-400 */}
              <h3 className="text-lg font-bold text-textPrimary font-display flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 inline-block"></span>
                <span>4. Processing Security</span>
              </h3>
              <p>
                We implement appropriate physical and digital technical security measures to safeguard your personal data against loss, destruction, accidental alteration, or unauthorized access. Communication in our contact form is carried out under HTTPS connections encrypted with TLS protocol.
              </p>
            </div>

            {/* Secção 5 - EN */}
            <div className="space-y-3">
              {/* Ajuste de contraste para o Modo Claro: bg-indigo-600 dark:bg-indigo-400 */}
              <h3 className="text-lg font-bold text-textPrimary font-display flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 inline-block"></span>
                <span>5. Cookies and Tracking</span>
              </h3>
              <p>
                This website uses purely functional cookies to ensure the correct operation of technical elements of the interface (such as saving your preferred theme state). We do not use intrusive advertising or behavioral tracking cookies from third parties.
              </p>
            </div>

            {/* Secção 6 - EN */}
            <div className="space-y-3">
              {/* Ajuste de contraste para o Modo Claro: bg-indigo-600 dark:bg-indigo-400 */}
              <h3 className="text-lg font-bold text-textPrimary font-display flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 inline-block"></span>
                <span>6. Contacts and User Rights</span>
              </h3>
              <p>
                Under the General Data Protection Regulation (GDPR), the user has the right to request consultation, rectification, limitation of processing, or permanent deletion of all their collected data at any time.
              </p>
              <p>
                If you wish to exercise these legal rights or obtain any additional clarification, please contact the owner by sending a message to: <strong>{profile?.email || 'contato@portfolio.com'}</strong>.
              </p>
            </div>
          </>
        )}

      </div>
    </section>
  );
}
