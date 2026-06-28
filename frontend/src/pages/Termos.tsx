import { useOutletContext } from 'react-router-dom';
import { FileText, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext'; // Adicionado para controlo de idioma

/**
 * Interface que representa os dados estruturados do perfil recebidos do Layout.
 */
interface Profile {
  name: string;
  email: string;
}

/**
 * PÁGINA DE TERMOS DE USO (TermosPage)
 * =====================================================================
 * Apresenta os termos de utilização da plataforma de portfólio digital,
 * formatado em caixas de vidro OLED e desfocagem translúcida avançada.
 * Suporta tradução multilingue (PT/EN) dinamicamente.
 */
export default function TermosPage() {
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
          <FileText size={14} />
          <span>{language === 'pt' ? 'Termos e Condições' : 'Terms and Conditions'}</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-textPrimary font-display">
          {language === 'pt' ? (
            <>Termos de <span className="text-gradient">Uso</span></>
          ) : (
            <>Terms of <span className="text-gradient">Use</span></>
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
              {/* Ajuste de contraste para o Modo Claro: text-indigo-650 dark:text-indigo-400 */}
              <h3 className="text-lg font-bold text-textPrimary font-display flex items-center space-x-2">
                <Globe size={18} className="text-indigo-650 dark:text-indigo-400" />
                <span>1. Aceitação dos Termos</span>
              </h3>
              <p>
                Ao aceder e navegar por este website de portfólio pessoal de <strong>{profile?.name || 'Ayres Daio Neto'}</strong>, o utilizador concorda expressamente em cumprir e respeitar os presentes Termos de Uso, bem como todas as leis e regulamentos nacionais e internacionais aplicáveis em vigor.
              </p>
            </div>

            {/* Secção 2 - PT */}
            <div className="space-y-3">
              {/* Ajuste de contraste para o Modo Claro: bg-indigo-600 dark:bg-indigo-400 */}
              <h3 className="text-lg font-bold text-textPrimary font-display flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 inline-block"></span>
                <span>2. Propriedade Intelectual e Direitos de Autor</span>
              </h3>
              <p>
                Todo o conteúdo disponibilizado e apresentado nesta plataforma — incluindo, mas não se limitando a: textos descritivos, biografias, logótipos, designs gráficos, fotografias pessoais ou de projetos, ícones personalizados, estrutura de código-fonte frontend e backend — constitui propriedade intelectual exclusiva de <strong>{profile?.name || 'Ayres Daio Neto'}</strong> (salvo indicações explícitas em contrário ou bibliotecas de terceiros devidamente licenciadas).
              </p>
              <p>
                É estritamente proibida qualquer reprodução, modificação, cópia, distribuição, licenciamento ou exploração comercial de qualquer elemento ou conteúdo deste portfólio sem o consentimento prévio por escrito do autor.
              </p>
            </div>

            {/* Secção 3 - PT */}
            <div className="space-y-3">
              {/* Ajuste de contraste para o Modo Claro: bg-indigo-600 dark:bg-indigo-400 */}
              <h3 className="text-lg font-bold text-textPrimary font-display flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 inline-block"></span>
                <span>3. Utilização Autorizada do Website</span>
              </h3>
              <p>
                O utilizador compromete-se a fazer uma utilização responsável e lícita do website. É expressamente interdito:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm">
                <li>Utilizar o formulário de contacto para envio de spam, publicidade não solicitada (junk mail) ou assédio comercial ilegal.</li>
                <li>Praticar atos que possam comprometer, sobrecarregar, inutilizar ou danificar o servidor e base de dados (ex: tentativas de injeção SQL, XSS, negação de serviço DDoS ou rastreio intrusivo por robots sem consentimento).</li>
                <li>Aceder ou tentar forçar o acesso sem autorização prévia ao Painel de Controlo Administrativo.</li>
              </ul>
            </div>

            {/* Secção 4 - PT */}
            <div className="space-y-3">
              {/* Ajuste de contraste para o Modo Claro: bg-indigo-600 dark:bg-indigo-400 */}
              <h3 className="text-lg font-bold text-textPrimary font-display flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 inline-block"></span>
                <span>4. Limitação de Responsabilidade</span>
              </h3>
              <p>
                Este portfólio destina-se a servir como um meio de divulgação profissional e académica das competências de <strong>{profile?.name || 'Ayres Daio Neto'}</strong>. Embora nos esforcemos para manter toda a informação precisa e atualizada, não fornecemos garantias implícitas ou explícitas sobre a precisão absoluta, adequação comercial ou integridade do conteúdo para qualquer fim específico.
              </p>
              <p>
                O autor não será responsável por quaisquer danos diretos, indiretos, incidentais ou consequentes resultantes de problemas técnicos de ligação, falhas temporárias de serviço ou perda de dados.
              </p>
            </div>

            {/* Secção 5 - PT */}
            <div className="space-y-3">
              {/* Ajuste de contraste para o Modo Claro: bg-indigo-600 dark:bg-indigo-400 */}
              <h3 className="text-lg font-bold text-textPrimary font-display flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 inline-block"></span>
                <span>5. Modificação dos Termos</span>
              </h3>
              <p>
                Reservamo-nos o direito de alterar, atualizar ou remover partes dos presentes Termos de Uso a qualquer momento e sem aviso prévio. A utilização contínua do website após a publicação de quaisquer alterações constituirá aceitação implícita das mesmas.
              </p>
            </div>

            {/* Secção 6 - PT */}
            <div className="space-y-3">
              {/* Ajuste de contraste para o Modo Claro: bg-indigo-600 dark:bg-indigo-400 */}
              <h3 className="text-lg font-bold text-textPrimary font-display flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 inline-block"></span>
                <span>6. Legislação Aplicável e Foro</span>
              </h3>
              <p>
                Os presentes Termos de Uso regem-se e são interpretados em conformidade com as leis em vigor em Portugal e na União Europeia. Para dirimir qualquer litígio resultante da interpretação ou aplicação dos presentes termos, concorda-se expressamente em submeter o litígio ao foro exclusivo da comarca da residência legal do autor.
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Secção 1 - EN */}
            <div className="space-y-3">
              {/* Ajuste de contraste para o Modo Claro: text-indigo-650 dark:text-indigo-400 */}
              <h3 className="text-lg font-bold text-textPrimary font-display flex items-center space-x-2">
                <Globe size={18} className="text-indigo-650 dark:text-indigo-400" />
                <span>1. Acceptance of Terms</span>
              </h3>
              <p>
                By accessing and browsing this personal portfolio website of <strong>{profile?.name || 'Ayres Daio Neto'}</strong>, the user expressly agrees to comply with and respect these Terms of Use, as well as all applicable national and international laws and regulations in force.
              </p>
            </div>

            {/* Secção 2 - EN */}
            <div className="space-y-3">
              {/* Ajuste de contraste para o Modo Claro: bg-indigo-600 dark:bg-indigo-400 */}
              <h3 className="text-lg font-bold text-textPrimary font-display flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 inline-block"></span>
                <span>2. Intellectual Property and Copyright</span>
              </h3>
              <p>
                All content made available and presented on this platform — including, but not limited to: descriptive texts, biographies, logos, graphic designs, personal or project photographs, custom icons, frontend and backend source code structure — constitutes the exclusive intellectual property of <strong>{profile?.name || 'Ayres Daio Neto'}</strong> (unless explicitly indicated otherwise or third-party libraries duly licensed).
              </p>
              <p>
                Any reproduction, modification, copying, distribution, licensing, or commercial exploitation of any element or content of this portfolio without the prior written consent of the author is strictly prohibited.
              </p>
            </div>

            {/* Secção 3 - EN */}
            <div className="space-y-3">
              {/* Ajuste de contraste para o Modo Claro: bg-indigo-600 dark:bg-indigo-400 */}
              <h3 className="text-lg font-bold text-textPrimary font-display flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 inline-block"></span>
                <span>3. Authorized Use of the Website</span>
              </h3>
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
              {/* Ajuste de contraste para o Modo Claro: bg-indigo-600 dark:bg-indigo-400 */}
              <h3 className="text-lg font-bold text-textPrimary font-display flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 inline-block"></span>
                <span>4. Limitation of Liability</span>
              </h3>
              <p>
                This portfolio is intended to serve as a means of professional and academic dissemination of the skills of <strong>{profile?.name || 'Ayres Daio Neto'}</strong>. While we strive to keep all information accurate and up to date, we do not provide implicit or explicit warranties about the absolute accuracy, commercial suitability, or integrity of the content for any specific purpose.
              </p>
              <p>
                The author will not be liable for any direct, indirect, incidental, or consequential damages resulting from technical connection problems, temporary service failures, or data loss.
              </p>
            </div>

            {/* Secção 5 - EN */}
            <div className="space-y-3">
              {/* Ajuste de contraste para o Modo Claro: bg-indigo-600 dark:bg-indigo-400 */}
              <h3 className="text-lg font-bold text-textPrimary font-display flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 inline-block"></span>
                <span>5. Modification of Terms</span>
              </h3>
              <p>
                We reserve the right to change, update, or remove parts of these Terms of Use at any time and without prior notice. Continuous use of the website after the publication of any changes will constitute implicit acceptance thereof.
              </p>
            </div>

            {/* Secção 6 - EN */}
            <div className="space-y-3">
              {/* Ajuste de contraste para o Modo Claro: bg-indigo-600 dark:bg-indigo-400 */}
              <h3 className="text-lg font-bold text-textPrimary font-display flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 inline-block"></span>
                <span>6. Applicable Law and Jurisdiction</span>
              </h3>
              <p>
                These Terms of Use are governed by and construed in accordance with the laws in force in Portugal and the European Union. To resolve any dispute resulting from the interpretation or application of these terms, it is expressly agreed to submit the dispute to the exclusive jurisdiction of the court of the author\'s legal residence.
              </p>
            </div>
          </>
        )}

      </div>
    </section>
  );
}
