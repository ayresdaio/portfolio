# Documentação Oficial do Portfólio

Este documento detalha exaustivamente a arquitetura, a stack tecnológica, todas as funcionalidades desenvolvidas e as boas práticas aplicadas neste projeto de Portfólio. Serve como um guia completo para o ambiente de desenvolvimento, produção e manutenção contínua.

## 1. Visão Geral do Projeto

Este projeto consiste num portfólio pessoal dinâmico, moderno e multilingue (Português/Inglês), desenhado para apresentar habilidades, experiência, educação, projetos e publicações de blogue. O sistema conta com um painel de administração (`/admin`) altamente seguro e personalizado, permitindo a gestão total de conteúdos em tempo real sem qualquer necessidade de editar o código-fonte.

---

## 2. Funcionalidades do Portfólio (Frontend e Backend)

O portfólio está dividido em duas áreas principais: a área pública (acessível por qualquer visitante) e a área de administração (acessível apenas pelo proprietário do portfólio). Adicionalmente, possui funcionalidades de engagement e compliance legal.

### 2.1. Área Pública (Frontend)
- **Apresentação Profissional (Hero / Welcome):** Uma página de boas-vindas (`Welcome.tsx`) e uma secção de impacto visual imediato (`Home.tsx`) que resumem o perfil profissional, com links para redes sociais e descarregamento dinâmico de Currículo (`download_cv.php`).
- **Suporte Multilingue:** Alternância instantânea e fluida entre Português (PT) e Inglês (EN) em todo o website.
- **Secção "Sobre Mim":** Detalhes sobre a trajetória profissional geridos de forma dinâmica (secções de texto e imagens separadas).
- **Competências (Skills) e Hobbies:** Visualização através de barras de progresso dinâmicas e listagens categorizadas.
- **Experiência e Educação:** Apresentação cronológica (timeline) interativa das posições ocupadas e da formação académica.
- **Projetos:** Galeria de projetos desenvolvidos, com imagens, descrições detalhadas e links externos (ex: GitHub, Live Demo).
- **Blogue Integrado e Feed RSS:** Plataforma para partilha de conhecimentos e artigos técnicos. Conta com suporte nativo para agregação via **Feed RSS** (`rss.php`), permitindo a leitores e plataformas subscreverem as novidades automaticamente.
- **Formulário de Contacto:** Permite aos visitantes enviar mensagens diretas que são armazenadas na base de dados e enviadas de imediato para o email do administrador.
- **Newsletter:** Sistema de subscrição de Newsletter (`newsletter.php`) para captar emails de visitantes e integrá-los numa lista de contactos de mailing.
- **Páginas Legais e Compliance:** Páginas dedicadas a Políticas de Privacidade (`Politicas.tsx`), Termos de Utilização (`Termos.tsx`) e Gestão de Cookies (`Cookies.tsx`), garantindo cumprimento de regulamentos (como o RGPD).
- **Design Responsivo e Moderno:** Interface adaptável a qualquer dispositivo (mobile, tablet, desktop), com micro-animações (Framer Motion) e um esquema de cores cuidado (Tailwind CSS). Ecrã de Erro 404 personalizado (`NotFound.tsx`).

### 2.2. Área de Administração (Backend / Dashboard)
- **Autenticação Segura e Recuperação:** Login protegido. Sistema de recuperação de palavra-passe (`forgot_password.php`, `reset_password.php`) que envia tokens por email e validação adicional através de uma **Chave de Segurança** Mestra de emergência (`update_security_key.php`).
- **Gestão de Perfil:** Capacidade de alterar a palavra-passe atual e atualizar os dados do proprietário do site.
- **Gestão de Conteúdos Completa (CRUD):** Criar, Ler, Atualizar, Apagar para:
  - Projetos, Experiência, Educação, Competências, Hobbies.
  - Imagens do Sobre, Secções do Sobre.
  - Publicações do Blogue.
- **Motor de Uploads Seguro:** Upload de ficheiros multimédia (`upload.php`) com verificação rigorosa de MIME types para impedir injeção de scripts maliciosos.
- **Dicionário de Traduções:** Gestão granular de cada palavra ou frase do site (`translate.php`), permitindo afinar a internacionalização (i18n) dinamicamente.
- **Caixa de Mensagens:** Leitura e gestão das mensagens de contacto.
- **Estatísticas e Tracking:** Dashboard analítico e rotas de tracking invisíveis (`track_visit.php`, `stats.php`) que registam visitantes únicos, geolocalização e métricas de desempenho.
- **Visualização de Logs de Segurança:** Visualização da tabela de tentativas de intrusão e logins administrativos.
- **Centro de Automações Híbridas:** Execução e monitorização de tarefas automáticas com gráficos SVG dinâmicos no React e consolas de log em tempo real (Backups, Análise de Intrusão, Uptime, Tradução Gemini).

---

## 3. Tecnologias Utilizadas (A Stack Completa)

A arquitetura assenta numa separação estrita entre o Frontend (SPA) e o Backend (API RESTful), garantindo isolamento de responsabilidades, maior segurança e escalabilidade.

### Frontend
- **Framework Principal:** React 18+ (com Hooks funcionais).
- **Linguagem:** TypeScript (garantia de segurança de tipos, redução de bugs no desenvolvimento).
- **Styling e Layout:** Tailwind CSS (utility-first, design responsivo, rápido).
- **Animações:** Framer Motion (animações de entrada, scroll e hover suaves).
- **Build Tool / Bundler:** Vite (ambiente de desenvolvimento ultrarrápido e compilação otimizada para produção).
- **Ícones:** Lucide React.
- **Routing:** React Router DOM (navegação sem recarregamento da página).
- **Gráficos:** SVG gerados nativamente via React/Tailwind (para dados de cibersegurança e estatísticas).

### Backend
- **Linguagem:** PHP 8+ (processamento de pedidos, validações, gestão de sessões).
- **Base de Dados:** MySQL / MariaDB.
- **Comunicação com BD:** PDO (PHP Data Objects) utilizando Prepared Statements obrigatórios.
- **Arquitetura:** RESTful API genérica. Comunicação feita exclusivamente por JSON.
- **Scripts de Automação:** Python 3 (analítica, processamento), acoplado a um robusto sistema de Fallback nativo em PHP para ambientes restritos (como alojamentos partilhados comuns).
- **Integração de Emails:** Brevo (ex-Sendinblue) via SMTP através de uma classe personalizada (`EmailSender`).
- **Servidor Web:** Apache (configurado via `.htaccess` para roteamento, blindagem de diretórios e reescrita de URLs) ou Nginx.

---

## 4. Estrutura de Diretórios

```text
Portfólio/
├── backend/                  # Lógica do servidor, API e automações
│   ├── api/                  # 20+ Endpoints RESTful (login.php, projects.php, newsletter.php, blog.php, etc.)
│   ├── backups/              # Arquivos ZIP gerados de cópias de segurança da BD
│   ├── includes/             # Configurações nucleares (db.php, config.php, email_sender.php)
│   ├── scripts/              # Scripts Python de automação (backup_db.py, etc.)
│   └── uploads/              # Armazenamento protegido de imagens e ficheiros multimédia (CVs, thumbnails)
├── frontend/                 # Código-fonte da interface de utilizador
│   ├── public/               # Ficheiros estáticos globais (favicon, etc.)
│   ├── src/
│   │   ├── components/       # Componentes React reutilizáveis
│   │   ├── pages/            # Views (Home.tsx, Blog.tsx, Cookies.tsx, admin/Dashboard.tsx, etc.)
│   │   ├── lib/              # Funções utilitárias e helpers
│   │   ├── types/            # Definições de interfaces TypeScript
│   │   └── App.tsx           # Ponto de entrada do roteamento React
│   ├── tailwind.config.js    # Definições de design e cores
│   └── vite.config.ts        # Configurações do Vite (incluindo proxy de API para dev)
├── build.js                  # Script Node.js de build unificada e compactação para deploy
├── package.json              # Gestão de dependências NPM
└── DOCUMENTATION.md          # Este ficheiro
```

---

## 5. Fundamentos de Segurança

O portfólio aplica uma estratégia de **Segurança em Profundidade**.

1. **Autenticação, Hashes e Chave Mestra:**
   - Palavras-passe encriptadas com a função `password_hash()` (Bcrypt).
   - Validações críticas e alterações de credenciais exigem sempre a reintrodução da palavra-passe atual ou da **Chave de Segurança** Mestra.
   - O processo de recuperação de password baseia-se em tokens JWT-like descartáveis com prazo de expiração curto (via Email).

2. **Proteção Contra Força Bruta (Brute-Force) e IP Forensics:**
   - Registo em base de dados (`security_logs`) de todas as tentativas falhadas (logins, acessos a rotas admin).
   - Ao atingir **3 tentativas falhadas**, o endereço IP é **bloqueado durante 15 minutos**.
   - Notificações de alerta são enviadas por email ao administrador contendo a geolocalização do atacante (através de `ip-api.com`).

3. **Prevenção de Execução Remota de Código (RCE) em Uploads:**
   - O sistema em `upload.php` usa `finfo` (File Information) para ler os bytes mágicos do ficheiro, assegurando que o MIME Type corresponde a uma imagem legítima ou PDF. Extensões forjadas `.php` não penetram o sistema.

4. **Blindagem de Diretórios Sensíveis (`.htaccess`):**
   - Diretórios estruturais (`backups/`, `scripts/`, `includes/`) têm o acesso web vedado (`Deny from all`).
   - A pasta `uploads/` tem a execução de scripts explicitamente desativada (`php_flag engine off`).

5. **Proteção Anti-SQL Injection:**
   - Uso absoluto de PDO (Prepared Statements). Variáveis fornecidas pelo cliente jamais tocam nas queries brutas do MySQL.

6. **Barreira de PIN Exclusivo de Base de Dados (Para Execução de Scripts):**
   - Para evitar execuções acidentais ou abusivas dos scripts do lado do servidor (como backups ou comandos de análise), o frontend aciona um Modal de Segurança rigoroso antes da execução.
   - Qualquer pedido de execução para `run_automation.php` exige um PIN criptografado exclusivo da Base de Dados (`db_script_pin_hash`), completamente separado da password da conta do administrador.
   - Se o PIN não corresponder à verificação rigorosa (Bcrypt), o script bloqueia o processamento em falha de autenticação imediata, impedindo vulnerabilidades ao nível da base de dados e garantindo a máxima segurança do MySQL.

---

## 6. Estrutura da Base de Dados

O modelo de dados suporta toda a panóplia de funcionalidades:

- **`users`**: Armazena credenciais do administrador, chave de segurança e reset tokens.
- **`translations`**: Dicionário de internacionalização (i18n).
- **`projects`, `experience`, `education`, `skills`, `hobbies`**: Entidades para o CV.
- **`about_sections`, `about_images`**: Configuração granular da secção "Sobre".
- **`blog_posts`**: Armazenamento dos artigos com título, slugs, conteúdo e datas (suporta o gerador RSS).
- **`messages`**: Caixa de entrada do formulário de contacto.
- **`newsletter_subscribers`**: Contactos (emails) que subscreveram a Newsletter na homepage/blog.
- **`visitors` / `stats` / `security_logs`**: Tabelas de telemetria, tracking invisível e auditoria de segurança.

---

## 7. Sistema Híbrido de Automações (Python + PHP Fallback)

O portfólio possui um mecanismo avançado para automações (`backend/api/run_automation.php`). Originalmente desenhado para executar scripts Python (`backend/scripts/*.py`), foi dotado de um **Fallback Híbrido em PHP Nativo**. Se um alojamento partilhado (como Hostinger ou InfinityFree) bloquear a execução via CLI (`shell_exec`) ou não tiver dependências como o `pandas`, o PHP assume nativamente a tarefa.

### Automações Presentes:
1. **Backups da Base de Dados (`backup_db`)**
   - Gera um pacote ZIP contendo a exportação completa de todas as tabelas em formato JSON de segurança. Usa `ZipArchive` no fallback.
2. **Análise de Segurança (`analyze_security`)**
   - Consome os `security_logs`, determina as geolocalizações e envia a distribuição para gráficos de intrusão.
3. **Monitorização de Uptime (`monitor_uptime`)**
   - Executa ping (cURL) no frontend. Caso note falhas, despoleta envio de alertas SMTP ao administrador.
4. **Tradução Automática (`translate_content`)**
   - Conecta-se à API Gemini do Google para preencher traduções em falta (PT-EN) diretamente na base de dados.

---

## 8. Processo de Build e Deploy (Com Geração de ZIP)

O script Node.js unificado (`build.js`) permite fazer o deploy do portfólio com um só comando, sem a necessidade de transferir milhares de ficheiros avulsos do `node_modules`.

### Passos Locais (Desenvolvimento):
1. Abrir `frontend/` no terminal.
2. `npm install`
3. `npm run dev`
4. Ligar um servidor PHP (XAMPP/Herd) à raiz do projeto.
5. Editar `/backend/includes/config.php` com as credenciais da BD local.

### Build (Preparação para Produção):
Na raiz do projeto principal, corra:
```bash
npm run build
```

**Este script faz:**
1. Apaga a `dist/` anterior.
2. Invoca o Vite (`npm run build` na sub-pasta `frontend`) compilando React, TypeScript e Tailwind num pacote estático otimizado.
3. Copia esse bundle para a `dist/` central.
4. Copia toda a pasta `backend/` (c/ a API, `.htaccess`, scripts) para `dist/backend/`.
5. Cria o **`portfolio_deploy.zip`** englobando tudo pronto a subir para o painel de alojamento.

### Deploy (Alojamento / VPS / cPanel):
1. No seu gestor de ficheiros web (ex: Hostinger), coloque o `portfolio_deploy.zip` na pasta pública (`public_html` / `htdocs`).
2. Extraia o ficheiro.
3. Atualize as variáveis do MySQL no ficheiro `backend/includes/config.php`.
4. Importe a sua base de dados.
5. Confirme permissões `755` nas pastas `/backend/uploads/` e `/backend/backups/`.

---

## 9. Boas Práticas e Regras de Manutenção

- **Uso de Componentes React (DRY):** Sempre que adicionar páginas novas, construa sobre os componentes visíveis em `src/components/` para manter coerência do design system Tailwind.
- **Conteúdo via Traduções:** Evite *hardcoding* de texto. A interface reage dinamicamente às chaves inseridas na tabela `translations`.
- **API Segura:** Qualquer novo ficheiro em `backend/api/` que manipule dados (POST, PUT, DELETE) e não seja público deve instanciar a verificação de sessão: `if (!isset($_SESSION['admin_logged'])) { exit; }`.
- **Estatística Não Invasiva:** Ao longo das páginas, é efetuado um ping ao `track_visit.php`. Não devem ser guardadas informações pessoais sem o consentimento via banner de Cookies (`Cookies.tsx`).

---
*Criado como documento base para a evolução contínua da sua presença digital e do seu ecossistema.*
