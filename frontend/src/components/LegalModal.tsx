import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ShieldCheck, FileText, Info, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext'; // Adicionado para controlo de idioma

/**
 * Propriedades aceites pelo Modal Legal.
 */
interface LegalModalProps {
  type: 'privacy' | 'terms';
  onClose: () => void;
}

/**
 * COMPONENTE: LegalModal
 * =====================================================================
 * Apresenta um modal de leitura legal interativo (OLED Glassmorphism com
 * efeito desfocado) que se injeta diretamente no body global do documento
 * através de React Portals, garantindo sobreposição perfeita por cima da nav.
 * Suporta tradução multilingue (PT/EN) dinamicamente com base no contexto global.
 */
export default function LegalModal({ type, onClose }: LegalModalProps) {
  // Aceder ao idioma selecionado atualmente
  const { language } = useLanguage();
  
  // Fechar o modal ao pressionar a tecla ESC para acessibilidade
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return createPortal(
    <div 
      className="fixed inset-0 z-[10000] bg-black/85 backdrop-blur-lg flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in"
      onClick={onClose} // Fecha ao clicar fora (backdrop)
    >
      <div 
        className="glass-panel w-full max-w-4xl rounded-[2rem] sm:rounded-[2.5rem] bg-darkSurface border border-darkBorder shadow-2xl flex flex-col overflow-hidden animate-scale-up max-h-[85vh] relative"
        onClick={(e) => e.stopPropagation()} // Impede fechar ao clicar no corpo do modal
      >
        {/* Cabeçalho do Modal Fixo - Cores semânticas com suporte ao Modo Claro */}
        <div className="p-4 sm:p-6 border-b border-darkBorder flex items-center justify-between shrink-0 bg-darkBg/60 backdrop-blur-md">
          <div className="flex items-center space-x-3.5">
            {/* Ajuste de contraste para o Modo Claro: text-indigo-600 dark:text-indigo-400 */}
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 dark:border-indigo-500/25">
              {type === 'privacy' ? <ShieldCheck size={20} /> : <FileText size={20} />}
            </div>
            <div>
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-textSecondary block">
                {language === 'pt' 
                  ? (type === 'privacy' ? 'Segurança de Dados' : 'Termos e Condições')
                  : (type === 'privacy' ? 'Data Security' : 'Terms and Conditions')}
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-textPrimary font-display tracking-tight leading-none mt-0.5">
                {language === 'pt'
                  ? (type === 'privacy' ? 'Políticas de Privacidade' : 'Termos de Uso')
                  : (type === 'privacy' ? 'Privacy Policy' : 'Terms of Use')}
              </h3>
            </div>
          </div>

          {/* Botão de Fechar Rápido */}
          <button 
            onClick={onClose}
            className="p-2.5 bg-darkBg/60 hover:bg-darkSurface border border-darkBorder text-textSecondary hover:text-textPrimary rounded-full transition-all duration-300 hover:rotate-90 active:scale-95"
            aria-label={language === 'pt' ? 'Fechar Modal' : 'Close Modal'}
          >
            <X size={18} />
          </button>
        </div>

        {/* Zona de Leitura Central com Scroll Suave */}
        <div className="p-4 sm:p-6 md:p-8 overflow-y-auto space-y-8 leading-relaxed text-textSecondary text-sm md:text-base font-sans">
          {type === 'privacy' ? (
            /* CONTEÚDO: POLÍTICAS DE PRIVACIDADE */
            language === 'pt' ? (
              <>
                {/* Secção 1 */}
                <div className="space-y-3">
                  <h4 className="text-base font-bold text-textPrimary font-display flex items-center space-x-2">
                    {/* Ajuste de contraste para o Modo Claro: bg-indigo-600 dark:bg-indigo-400 */}
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 inline-block"></span>
                    <span>1. Introdução</span>
                  </h4>
                  <p>
                    A sua privacidade é extremamente importante para nós. Esta política de privacidade explica que tipos de dados pessoais recolhemos através deste website de portfólio (propriedade de <strong>Ayres Daio Neto</strong>) e de que forma os tratamos, protegemos e utilizamos.
                  </p>
                </div>

                {/* Secção 2 */}
                <div className="space-y-3">
                  <h4 className="text-base font-bold text-textPrimary font-display flex items-center space-x-2">
                    {/* Ajuste de contraste para o Modo Claro: bg-indigo-600 dark:bg-indigo-400 */}
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 inline-block"></span>
                    <span>2. Recolha de Informações</span>
                  </h4>
                  <p>
                    Recolhemos informações estritamente limitadas que nos fornece diretamente através do formulário de contacto na página correspondente:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-sm">
                    <li><strong>Identificação:</strong> Nome próprio ou nome profissional que indicar.</li>
                    <li><strong>Contacto:</strong> Endereço de correio eletrónico (e-mail) fornecido por si para fins de resposta.</li>
                    <li><strong>Mensagem:</strong> O conteúdo descritivo, assunto e dados contextuais que redigir na sua comunicação direta.</li>
                  </ul>
                </div>

                {/* Secção 3 */}
                <div className="space-y-3">
                  <h4 className="text-base font-bold text-textPrimary font-display flex items-center space-x-2">
                    {/* Ajuste de contraste para o Modo Claro: bg-indigo-600 dark:bg-indigo-400 */}
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 inline-block"></span>
                    <span>3. Finalidade e Utilização dos Dados</span>
                  </h4>
                  <p>
                    Qualquer dado pessoal fornecido através do formulário será utilizado de forma exclusiva para:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-sm">
                    <li>Responder diretamente às suas mensagens, esclarecer dúvidas ou responder a propostas de trabalho.</li>
                    <li>Estabelecer uma ligação comercial profissional direta se solicitado.</li>
                  </ul>
                  {/* Ajuste de contraste para o Modo Claro: bg-indigo-500/5 dark:bg-indigo-950/20, border-indigo-500/15 dark:border-indigo-500/30 e text-indigo-600 dark:text-indigo-300 */}
                  <p className="text-xs italic bg-indigo-500/5 dark:bg-indigo-950/20 p-3 rounded-lg border border-indigo-500/15 dark:border-indigo-500/30 flex items-start space-x-2 text-indigo-600 dark:text-indigo-300">
                    <Info size={16} className="mt-0.5 shrink-0" />
                    <span>Important Note: Your data will never be sold, rented, shared, or transferred to third parties under any pretext, except in strict compliance with court orders or legal obligations.</span>
                  </p>
                </div>

                {/* Secção 4 */}
                <div className="space-y-3">
                  <h4 className="text-base font-bold text-textPrimary font-display flex items-center space-x-2">
                    {/* Ajuste de contraste para o Modo Claro: bg-indigo-600 dark:bg-indigo-400 */}
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 inline-block"></span>
                    <span>4. Segurança do Tratamento</span>
                  </h4>
                  <p>
                    Implementamos medidas técnicas de segurança físicas e digitais adequadas para salvaguardar os seus dados pessoais contra perda, destruição, alteração acidental, ou acessos não autorizados. A comunicação no nosso formulário de contacto é efetuada sob ligações HTTPS encriptadas com protocolo TLS.
                  </p>
                </div>

                {/* Secção 5 */}
                <div className="space-y-3">
                  <h4 className="text-base font-bold text-textPrimary font-display flex items-center space-x-2">
                    {/* Ajuste de contraste para o Modo Claro: bg-indigo-600 dark:bg-indigo-400 */}
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 inline-block"></span>
                    <span>5. Cookies e Rastreamento</span>
                  </h4>
                  <p>
                    Este website utiliza cookies meramente funcionais para garantir o correto funcionamento de elementos técnicos da interface (como guardar o seu estado de tema preferido). Não utilizamos cookies intrusivos de publicidade ou rastreamento comportamental de terceiros.
                  </p>
                </div>

                {/* Secção 6 */}
                <div className="space-y-3">
                  <h4 className="text-base font-bold text-textPrimary font-display flex items-center space-x-2">
                    {/* Ajuste de contraste para o Modo Claro: bg-indigo-600 dark:bg-indigo-400 */}
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 inline-block"></span>
                    <span>6. Contactos e Direitos do Utilizador</span>
                  </h4>
                  <p>
                    Ao abrigo do Regulamento Geral sobre a Proteção de Dados (RGPD), o utilizador tem o direito de solicitar a consulta, retificação, limitação de tratamento ou eliminação definitiva de todos os seus dados recolhidos a qualquer altura.
                  </p>
                  <p>
                    Caso pretenda exercer estes direitos legais ou obter qualquer esclarecimento adicional, por favor contacte o proprietário enviando uma mensagem direta no formulário de contacto ou pelo e-mail oficial do perfil.
                  </p>
                </div>
              </>
            ) : (
              <>
                {/* Secção 1 - EN */}
                <div className="space-y-3">
                  <h4 className="text-base font-bold text-textPrimary font-display flex items-center space-x-2">
                    {/* Ajuste de contraste para o Modo Claro: bg-indigo-600 dark:bg-indigo-400 */}
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 inline-block"></span>
                    <span>1. Introduction</span>
                  </h4>
                  <p>
                    Your privacy is extremely important to us. This privacy policy explains what types of personal data we collect through this portfolio website (owned by <strong>Ayres Daio Neto</strong>) and how we process, protect, and use it.
                  </p>
                </div>

                {/* Secção 2 - EN */}
                <div className="space-y-3">
                  <h4 className="text-base font-bold text-textPrimary font-display flex items-center space-x-2">
                    {/* Ajuste de contraste para o Modo Claro: bg-indigo-600 dark:bg-indigo-400 */}
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 inline-block"></span>
                    <span>2. Information Collection</span>
                  </h4>
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
                  <h4 className="text-base font-bold text-textPrimary font-display flex items-center space-x-2">
                    {/* Ajuste de contraste para o Modo Claro: bg-indigo-600 dark:bg-indigo-400 */}
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 inline-block"></span>
                    <span>3. Purpose and Use of Data</span>
                  </h4>
                  <p>
                    Any personal data provided through the form will be used exclusively to:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-sm">
                    <li>Respond directly to your messages, clarify doubts, or reply to job proposals.</li>
                    <li>Establish a direct professional business connection if requested.</li>
                  </ul>
                  {/* Ajuste de contraste para o Modo Claro: bg-indigo-500/5 dark:bg-indigo-950/20, border-indigo-500/15 dark:border-indigo-500/30 e text-indigo-600 dark:text-indigo-300 */}
                  <p className="text-xs italic bg-indigo-500/5 dark:bg-indigo-950/20 p-3 rounded-lg border border-indigo-500/15 dark:border-indigo-500/30 flex items-start space-x-2 text-indigo-600 dark:text-indigo-300 font-medium">
                    <Info size={16} className="mt-0.5 shrink-0" />
                    <span>Important Note: Your data will never be sold, rented, shared, or transferred to third parties under any pretext, except in strict compliance with court orders or legal obligations.</span>
                  </p>
                </div>

                {/* Secção 4 - EN */}
                <div className="space-y-3">
                  <h4 className="text-base font-bold text-textPrimary font-display flex items-center space-x-2">
                    {/* Ajuste de contraste para o Modo Claro: bg-indigo-600 dark:bg-indigo-400 */}
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 inline-block"></span>
                    <span>4. Processing Security</span>
                  </h4>
                  <p>
                    We implement appropriate physical and digital technical security measures to safeguard your personal data against loss, destruction, accidental alteration, or unauthorized access. Communication in our contact form is carried out under HTTPS connections encrypted with TLS protocol.
                  </p>
                </div>

                {/* Secção 5 - EN */}
                <div className="space-y-3">
                  <h4 className="text-base font-bold text-textPrimary font-display flex items-center space-x-2">
                    {/* Ajuste de contraste para o Modo Claro: bg-indigo-600 dark:bg-indigo-400 */}
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 inline-block"></span>
                    <span>5. Cookies and Tracking</span>
                  </h4>
                  <p>
                    This website uses purely functional cookies to ensure the correct operation of technical elements of the interface (such as saving your preferred theme state). We do not use intrusive advertising or behavioral tracking cookies from third parties.
                  </p>
                </div>

                {/* Secção 6 - EN */}
                <div className="space-y-3">
                  <h4 className="text-base font-bold text-textPrimary font-display flex items-center space-x-2">
                    {/* Ajuste de contraste para o Modo Claro: bg-indigo-600 dark:bg-indigo-400 */}
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 inline-block"></span>
                    <span>6. Contacts and User Rights</span>
                  </h4>
                  <p>
                    Under the General Data Protection Regulation (GDPR), the user has the right to request consultation, rectification, limitation of processing, or permanent deletion of all their collected data at any time.
                  </p>
                  <p>
                    If you wish to exercise these legal rights or obtain any additional clarification, please contact the owner by sending a direct message in the contact form or through the official profile email.
                  </p>
                </div>
              </>
            )
          ) : (
            /* CONTEÚDO: TERMOS DE USO */
            language === 'pt' ? (
              <>
                {/* Secção 1 */}
                <div className="space-y-3">
                  <h4 className="text-base font-bold text-textPrimary font-display flex items-center space-x-2">
                    <Globe size={16} className="text-indigo-400" />
                    <span>1. Aceitação dos Termos</span>
                  </h4>
                  <p>
                    Ao aceder e navegar por este website de portfólio pessoal de <strong>Ayres Daio Neto</strong>, o utilizador concorda expressamente em cumprir e respeitar os presentes Termos de Uso, bem como todas as leis e regulamentos nacionais e internacionais aplicáveis em vigor.
                  </p>
                </div>

                {/* Secção 2 */}
                <div className="space-y-3">
                  <h4 className="text-base font-bold text-textPrimary font-display flex items-center space-x-2">
                    {/* Ajuste de contraste para o Modo Claro: bg-indigo-600 dark:bg-indigo-400 */}
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 inline-block"></span>
                    <span>2. Propriedade Intelectual e Direitos de Autor</span>
                  </h4>
                  <p>
                    Todo o conteúdo disponibilizado e apresentado nesta plataforma — incluindo, mas não se limitando a: textos descritivos, biografias, logótipos, designs gráficos, fotografias pessoais ou de projetos, ícones personalizados, estrutura de código-fonte frontend e backend — constitui propriedade intelectual exclusiva de <strong>Ayres Daio Neto</strong> (salvo indicações explícitas em contrário ou bibliotecas de terceiros devidamente licenciadas).
                  </p>
                  <p>
                    É estritamente proibida qualquer reprodução, modificação, cópia, distribuição, licenciamento ou exploração comercial de qualquer elemento ou conteúdo deste portfólio sem o consentimento prévio por escrito do autor.
                  </p>
                </div>

                {/* Secção 3 */}
                <div className="space-y-3">
                  <h4 className="text-base font-bold text-textPrimary font-display flex items-center space-x-2">
                    {/* Ajuste de contraste para o Modo Claro: bg-indigo-600 dark:bg-indigo-400 */}
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 inline-block"></span>
                    <span>3. Utilização Autorizada do Website</span>
                  </h4>
                  <p>
                    O utilizador compromete-se a fazer uma utilização responsável e lícita do website. É expressamente interdito:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-sm">
                    <li>Utilizar o formulário de contacto para envio de spam, publicidade não solicitada (junk mail) ou assédio comercial ilegal.</li>
                    <li>Praticar atos que possam comprometer, sobrecarregar, inutilizar ou danificar o servidor e base de dados (ex: tentativas de injeção SQL, XSS, negação de serviço DDoS ou rastreio intrusivo por robots sem consentimento).</li>
                    <li>Aceder ou tentar forçar o acesso sem autorização prévia ao Painel de Controlo Administrativo.</li>
                  </ul>
                </div>

                {/* Secção 4 */}
                <div className="space-y-3">
                  <h4 className="text-base font-bold text-textPrimary font-display flex items-center space-x-2">
                    {/* Ajuste de contraste para o Modo Claro: bg-indigo-600 dark:bg-indigo-400 */}
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 inline-block"></span>
                    <span>4. Limitação de Responsabilidade</span>
                  </h4>
                  <p>
                    Este portfólio destina-se a servir como um meio de divulgação profissional e académica das competências de <strong>Ayres Daio Neto</strong>. Embora nos esforcemos para manter toda a informação precisa e atualizada, não fornecemos garantias implícitas ou explícitas sobre a precisão absoluta, adequação comercial ou integridade do conteúdo para qualquer fim específico.
                  </p>
                  <p>
                    O autor não será responsável por quaisquer danos diretos, indiretos, incidentais ou consequentes resultantes de problemas técnicos de ligação, falhas temporárias de serviço ou perda de dados.
                  </p>
                </div>

                {/* Secção 5 */}
                <div className="space-y-3">
                  <h4 className="text-base font-bold text-textPrimary font-display flex items-center space-x-2">
                    {/* Ajuste de contraste para o Modo Claro: bg-indigo-600 dark:bg-indigo-400 */}
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 inline-block"></span>
                    <span>5. Modificação dos Termos</span>
                  </h4>
                  <p>
                    Reservamo-nos o direito de alterar, atualizar ou remover partes dos presentes Termos de Uso a qualquer momento e sem aviso prévio. A utilização contínua do website após a publicação de quaisquer alterações constituirá aceitação implícita das mesmas.
                  </p>
                </div>

                {/* Secção 6 */}
                <div className="space-y-3">
                  <h4 className="text-base font-bold text-textPrimary font-display flex items-center space-x-2">
                    {/* Ajuste de contraste para o Modo Claro: bg-indigo-600 dark:bg-indigo-400 */}
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 inline-block"></span>
                    <span>6. Legislação Aplicável e Foro</span>
                  </h4>
                  <p>
                    Os presentes Termos de Uso regem-se e são interpretados em conformidade com as leis em vigor em Portugal e na União Europeia. Para dirimir qualquer litígio resultante da interpretação ou aplicação dos presentes termos, concorda-se expressamente em submeter o litígio ao foro exclusivo da comarca da residência legal do autor.
                  </p>
                </div>
              </>
            ) : (
              <>
                {/* Secção 1 - EN */}
                <div className="space-y-3">
                  <h4 className="text-base font-bold text-textPrimary font-display flex items-center space-x-2">
                    <Globe size={16} className="text-indigo-400" />
                    <span>1. Acceptance of Terms</span>
                  </h4>
                  <p>
                    By accessing and browsing this personal portfolio website of <strong>Ayres Daio Neto</strong>, the user expressly agrees to comply with and respect these Terms of Use, as well as all applicable national and international laws and regulations in force.
                  </p>
                </div>

                {/* Secção 2 - EN */}
                <div className="space-y-3">
                  <h4 className="text-base font-bold text-textPrimary font-display flex items-center space-x-2">
                    {/* Ajuste de contraste para o Modo Claro: bg-indigo-600 dark:bg-indigo-400 */}
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 inline-block"></span>
                    <span>2. Intellectual Property and Copyright</span>
                  </h4>
                  <p>
                    All content made available and presented on this platform — including, but not limited to: descriptive texts, biographies, logos, graphic designs, personal or project photographs, custom icons, frontend and backend source code structure — constitutes the exclusive intellectual property of <strong>Ayres Daio Neto</strong> (unless explicitly indicated otherwise or third-party libraries duly licensed).
                  </p>
                  <p>
                    Any reproduction, modification, copying, distribution, licensing, or commercial exploitation of any element or content of this portfolio without the prior written consent of the author is strictly prohibited.
                  </p>
                </div>

                {/* Secção 3 - EN */}
                <div className="space-y-3">
                  <h4 className="text-base font-bold text-textPrimary font-display flex items-center space-x-2">
                    {/* Ajuste de contraste para o Modo Claro: bg-indigo-600 dark:bg-indigo-400 */}
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 inline-block"></span>
                    <span>3. Authorized Use of the Website</span>
                  </h4>
                  <p>
                    The user undertakes to make a responsible and lawful use of the website. It is expressly prohibited to:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-sm">
                    <li>Use the contact form to send spam, unsolicited advertising (junk mail), or unlawful commercial harassment.</li>
                    <li>Engage in acts that may compromise, overload, disable, or damage the server and database (e.g., SQL injection attempts, XSS, DDoS denial of service, or intrusive tracking by robots without consent).</li>
                    <li>Access or attempt to force access without prior authorization to the Administrative Control Panel.</li>
                  </ul>
                </div>

                {/* Secção 4 - EN */}
                <div className="space-y-3">
                  <h4 className="text-base font-bold text-textPrimary font-display flex items-center space-x-2">
                    {/* Ajuste de contraste para o Modo Claro: bg-indigo-600 dark:bg-indigo-400 */}
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 inline-block"></span>
                    <span>4. Limitation of Liability</span>
                  </h4>
                  <p>
                    This portfolio is intended to serve as a means of professional and academic dissemination of the skills of <strong>Ayres Daio Neto</strong>. While we strive to keep all information accurate and up to date, we do not provide implicit or explicit warranties about the absolute accuracy, commercial suitability, or integrity of the content for any specific purpose.
                  </p>
                  <p>
                    The author will not be liable for any direct, indirect, incidental, or consequential damages resulting from technical connection problems, temporary service failures, or data loss.
                  </p>
                </div>

                {/* Secção 5 - EN */}
                <div className="space-y-3">
                  <h4 className="text-base font-bold text-textPrimary font-display flex items-center space-x-2">
                    {/* Ajuste de contraste para o Modo Claro: bg-indigo-600 dark:bg-indigo-400 */}
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 inline-block"></span>
                    <span>5. Modification of Terms</span>
                  </h4>
                  <p>
                    We reserve the right to change, update, or remove parts of these Terms of Use at any time and without prior notice. Continuous use of the website after the publication of any changes will constitute implicit acceptance thereof.
                  </p>
                </div>

                {/* Secção 6 - EN */}
                <div className="space-y-3">
                  <h4 className="text-base font-bold text-textPrimary font-display flex items-center space-x-2">
                    {/* Ajuste de contraste para o Modo Claro: bg-indigo-600 dark:bg-indigo-400 */}
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 inline-block"></span>
                    <span>6. Applicable Law and Jurisdiction</span>
                  </h4>
                  <p>
                    These Terms of Use are governed by and construed in accordance with the laws in force in Portugal and the European Union. To resolve any dispute resulting from the interpretation or application of these terms, it is expressly agreed to submit the dispute to the exclusive jurisdiction of the court of the author\'s legal residence.
                  </p>
                </div>
              </>
            )
          )}
        </div>

        {/* Rodapé do Modal Fixo - Cores semânticas com suporte ao Modo Claro */}
        <div className="p-4 sm:p-6 border-t border-darkBorder flex justify-end shrink-0 bg-darkBg/60 backdrop-blur-md">
          <button 
            onClick={onClose}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs uppercase tracking-wider transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/15"
          >
            {language === 'pt' ? 'Fechar Leitura' : 'Close Reading'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
