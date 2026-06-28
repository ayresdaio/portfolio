# Portfólio Dinâmico e Profissional

Bem-vindo ao repositório do meu Portfólio Profissional. Este projeto consiste num ecossistema digital moderno, dinâmico e seguro para a apresentação de competências, experiência, educação, projetos e artigos técnicos, dotado de um painel de administração personalizado e suporte multilingue nativo.

---

## 🚀 Visão Geral

A arquitetura do projeto assenta numa separação estrita entre o **Frontend** (Single Page Application rápida) e o **Backend** (API RESTful segura), permitindo alta performance, isolamento de responsabilidades e facilidade de manutenção.

O ecossistema é composto por:

- **Área Pública**: Interface intuitiva e com micro-animações, suporte para múltiplos idiomas (Português/Inglês), portefólio de projetos, timeline curricular, blogue com feed RSS, formulário de contacto e subscrição de newsletter.
- **Painel Administrativo (/admin)**: CMS (Content Management System) completo que permite ao proprietário gerir todos os conteúdos em tempo real (Projetos, Experiência, Blogue, Competências) e monitorizar acessos e logs de segurança sem alterar código-fonte.

---

## 🛠️ Stack Tecnológica

### Frontend

- **Framework**: React 18+ (com Hooks e Programação Declarativa)
- **Linguagem**: TypeScript (segurança de tipos)
- **Estilização**: Tailwind CSS (Utility-first e design responsivo)
- **Animações**: Framer Motion (transições e animações de scroll fluidas)
- **Build Tool / Bundler**: Vite (ambiente rápido de desenvolvimento)
- **Roteamento**: React Router DOM (navegação Client-side sem recarregamento)

### Backend

- **Linguagem**: PHP 8+ (processamento de chamadas e lógica do servidor)
- **Base de Dados**: MySQL / MariaDB (com comunicações PDO preparadas)
- **Segurança**: Algoritmo Bcrypt para encriptação, barreira PIN de BD e proteção contra força bruta
- **Automações**: Python 3 (auxiliar para análise de segurança e backups) com Fallback Nativo em PHP para compatibilidade com alojamentos partilhados
- **Integração de Emails**: Brevo SMTP (utilizando a classe personalizada `EmailSender`)
- **Servidor Web**: Apache (configurações via `.htaccess`) ou Nginx

---

## 📂 Estrutura do Projeto

```text
Portfólio/
├── backend/                  # Lógica de servidor, API e automações
│   ├── api/                  # Endpoints RESTful (login, projetos, newsletter, etc.)
│   ├── backups/              # Cópia de segurança da BD em formato JSON/ZIP
│   ├── includes/             # Ficheiros nucleares (ligação à BD, envio de emails)
│   ├── scripts/              # Scripts auxiliares de automação em Python
│   └── uploads/              # Pasta protegida para uploads de imagens e CVs
├── frontend/                 # Interface do Utilizador (SPA)
│   ├── src/
│   │   ├── components/       # Componentes React reutilizáveis
│   │   ├── pages/            # Páginas da aplicação (Home, Blog, Admin Dashboard)
│   │   ├── lib/              # Helpers e utilitários globais
│   │   └── types/            # Tipos e interfaces TypeScript
│   ├── tailwind.config.js    # Definições de design e cores
│   └── vite.config.ts        # Configurações de compilação
├── build.js                  # Script Node.js para build unificada e empacotamento
├── package.json              # Configuração de scripts da raiz
└── DOCUMENTATION.md          # Documentação exaustiva do projeto
```

---

## 🔒 Segurança e Blindagem de Dados

Este sistema adota uma filosofia de **Segurança em Profundidade** para garantir a proteção de dados confidenciais:

1. **Proteção Anti-SQL Injection**: Utilização obrigatória de *Prepared Statements* com a biblioteca PDO do PHP.
2. **Defesa Contra Força Bruta (Brute-Force)**: Bloqueio temporário (15 minutos) do IP do atacante após **3 tentativas falhadas** de login admin, com registo detalhado em `security_logs` e alertas SMTP contendo geolocalização.
3. **MIME Type Validation**: Validação rigorosa dos *magic bytes* de ficheiros enviados no upload de ficheiros (`upload.php`) para evitar vulnerabilidades de Execução Remota de Código (RCE).
4. **PIN Exclusivo para Scripts**: Execução de scripts administrativos exige um PIN criptografado específico da base de dados, prevenindo abusos do lado do servidor.
5. **Acesso Protegido por Pasta**: Bloqueio de indexação e acesso direto por web a pastas sensíveis através de diretivas de `.htaccess`.

---

## 💻 Configuração em Ambiente de Desenvolvimento

### Requisitos Prévios

- Node.js (v18+)
- PHP (v8.0+)
- MySQL ou MariaDB

### 1. Clonar e Instalar Dependências

```bash
# Instalar dependências da raiz e do frontend
npm run install-frontend
```

### 2. Configurar o Backend

1. Crie uma base de dados MySQL no seu ambiente local (ex: XAMPP, Local WP, PHP Herd).
2. Importe o esquema SQL presente em `backend/schema.sql` (ou use a migração do SQLite se aplicável).
3. Renomeie o ficheiro `backend/includes/db_credentials.php.example` para `db_credentials.php` e preencha com os dados de acesso locais:

   ```php
   define('DB_HOST', 'localhost');
   define('DB_NAME', 'nome_da_base_de_dados');
   define('DB_USER', 'utilizador');
   define('DB_PASS', 'palavra_passe');
   ```

4. Configure as chaves do fornecedor de email (Brevo) copiando e renomeando `backend/includes/brevo_config.php.example` para `brevo_config.php`.

### 3. Executar o Projeto Localmente

```bash
# Executar o servidor de desenvolvimento do Vite (porta por defeito: 5173)
npm run dev
```

*Nota: Garanta que o servidor PHP local está ativo a apontar para a pasta do projeto (ou configure o proxy no Vite para a porta do seu servidor Apache local).*

---

## 📦 Compilação e Deploy (Produção)

O projeto possui um script de build automatizado na raiz que compila o frontend, limpa ficheiros desnecessários, junta o backend numa pasta unificada e cria um pacote `.zip` pronto para carregamento no servidor de alojamento.

```bash
# Executar build consolidada
npm run build
```

**O que o comando realiza:**

1. Compila os ficheiros TypeScript e executa o bundler do Vite.
2. Copia os ficheiros otimizados do Frontend para a pasta `dist/`.
3. Copia a pasta `backend/` para `dist/backend/` (excluindo ficheiros sensíveis como `.env` e credenciais locais).
4. Gera um arquivo **`portfolio_deploy.zip`** na raiz do projeto.

### Deploy no Alojamento (cPanel / Hostinger / etc.)

1. Aceda ao gestor de ficheiros da sua conta de alojamento.
2. Carregue o ficheiro `portfolio_deploy.zip` diretamente no diretório público (`public_html` ou `htdocs`).
3. Extraia o ficheiro ZIP.
4. Ajuste as credenciais da base de dados de produção no ficheiro `backend/includes/db_credentials.php` do servidor.
5. Importe a base de dados SQL no seu painel phpMyAdmin.
6. Certifique-se de que as permissões das pastas `backend/uploads/` e `backend/backups/` estão configuradas para `755`.

---

## 📝 Licença e Manutenção

Este projeto foi construído sob regras rigorosas de desempenho e modularidade. Ao expandir o código:

- Evite *hardcoding* de strings de texto no frontend; faça uso das tabelas de tradução dinâmica do ecossistema.
- Garanta que qualquer nova rota de API em `/backend/api/` que altere dados valide a sessão ativa de administrador.
