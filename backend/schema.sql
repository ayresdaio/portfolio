-- =====================================================================
-- SCHEMA DE BASE DE DADOS PARA O PORTFÓLIO VISUAL E SEGURO
-- Otimizado para MySQL (Hospedagem InfinityFree)
-- Nome da Base de Dados: if0_41973639_ayres
-- =====================================================================

-- Tabela de utilizador administrador (Palavra-passe cifrada com bcrypt)
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela para gestão de tokens de recuperação de palavra-passe ("Esqueci-me da senha")
CREATE TABLE IF NOT EXISTS `password_resets` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(100) NOT NULL,
  `token` VARCHAR(64) NOT NULL UNIQUE,
  `expires_at` DATETIME NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (`token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de perfil (Dados pessoais, biografia e caminhos para foto de perfil e currículo PDF)
CREATE TABLE IF NOT EXISTS `profile` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `role` VARCHAR(100) NOT NULL,
  `bio` TEXT NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(30) NULL,
  `location` VARCHAR(100) NULL,
  `github_url` VARCHAR(255) NULL,
  `linkedin_url` VARCHAR(255) NULL,
  `facebook_url` VARCHAR(255) NULL,
  `instagram_url` VARCHAR(255) NULL,
  `avatar_url` VARCHAR(255) NULL, -- Caminho para a imagem de avatar carregada no servidor
  `cv_url` VARCHAR(255) NULL,     -- Caminho para o ficheiro PDF do currículo de Full Stack carregado no servidor
  `cv_url_en` VARCHAR(255) NULL,  -- Caminho para o ficheiro PDF do currículo de Full Stack em inglês carregado no servidor
  `cv_url_tech` VARCHAR(255) NULL, -- Caminho para o ficheiro PDF do currículo técnico carregado no servidor
  `cv_url_tech_en` VARCHAR(255) NULL, -- Caminho para o ficheiro PDF do currículo técnico em inglês carregado no servidor
  `about_text` TEXT NULL,         -- Texto longo da secção 'Sobre Mim'
  `about_image_url` VARCHAR(255) NULL, -- Imagem exclusiva da secção 'Sobre Mim'
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela para as secções adicionais da Bento Grid do Sobre Mim
CREATE TABLE IF NOT EXISTS `about_sections` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(100) NOT NULL,
  `title_en` VARCHAR(100) NULL,
  `content` TEXT NOT NULL,
  `content_en` TEXT NULL,
  `icon` VARCHAR(50) NULL,
  `sort_order` INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela para a galeria de fotos e legendas do Sobre Mim
CREATE TABLE IF NOT EXISTS `about_images` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `image_url` VARCHAR(255) NOT NULL,
  `caption` VARCHAR(255) NULL,
  `caption_en` VARCHAR(255) NULL,
  `sort_order` INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de projetos (Lista de projetos com imagem, tags e links)
CREATE TABLE IF NOT EXISTS `projects` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(100) NOT NULL,
  `description` TEXT NOT NULL,
  `image_url` VARCHAR(255) NULL,   -- Caminho para a foto do projeto carregada no servidor
  `tags` VARCHAR(255) NOT NULL,    -- Lista de tags separadas por vírgula (ex: "Next.js, PHP, SQL")
  `demo_url` VARCHAR(255) NULL,    -- Link para demonstração ao vivo
  `repo_url` VARCHAR(255) NULL,    -- Link para o repositório Github
  `sort_order` INT DEFAULT 0,      -- Ordem de exibição dos projetos
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela para a galeria de imagens adicionais dos projetos (Suporta múltiplas imagens)
CREATE TABLE IF NOT EXISTS `project_images` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `project_id` INT NOT NULL,
  `image_url` VARCHAR(255) NOT NULL,   -- Caminho ou link da foto de suporte do projeto
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de competências (Skills técnicas organizadas por categorias)
CREATE TABLE IF NOT EXISTS `skills` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL,
  `description` TEXT NULL,              -- Breve descrição da competência técnica
  `description_en` TEXT NULL,           -- Tradução em Inglês da descrição
  `level` INT NOT NULL,                 -- Nível de 1 a 100
  `experience_time` VARCHAR(100) NULL,  -- Tempo de experiência (ex: "3 anos")
  `experience_time_en` VARCHAR(100) NULL, -- Tradução em Inglês do tempo de experiência
  `category` VARCHAR(50) NOT NULL,      -- Categorias: "Frontend", "Backend", "Outros"
  `icon` TEXT NULL                      -- Identificador do ícone (Lucide React, Devicon, Link ou SVG)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de experiências profissionais ou académicas para a linha temporal (Timeline)
CREATE TABLE IF NOT EXISTS `experiences` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `role` VARCHAR(100) NOT NULL,    -- Cargo ou título da experiência
  `role_en` VARCHAR(100) NULL,     -- Tradução em inglês do cargo
  `company` VARCHAR(100) NOT NULL, -- Nome da empresa ou instituição
  `company_en` VARCHAR(100) NULL,  -- Nome da empresa traduzido em inglês
  `duration` VARCHAR(50) NOT NULL, -- Ex: "2024 - Presente", "2022 - 2023"
  `location` VARCHAR(150) NULL,    -- Localização física ou regime (ex: Remoto, Lisboa)
  `description` TEXT NOT NULL,     -- Detalhes das conquistas ou responsabilidades
  `description_en` TEXT NULL,      -- Descrição traduzida em inglês
  `image_url` VARCHAR(255) NULL,   -- Caminho da imagem da empresa ou certificado
  `sort_order` INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de formação académica e diplomas escolares para a secção de Educação
CREATE TABLE IF NOT EXISTS `education` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `degree` VARCHAR(100) NOT NULL,       -- Licenciatura, Mestrado, Curso Técnico, etc.
  `degree_en` VARCHAR(100) NULL,        -- Curso ou grau traduzido em inglês
  `institution` VARCHAR(100) NOT NULL,  -- Nome da universidade ou escola
  `institution_en` VARCHAR(100) NULL,   -- Nome da escola traduzido em inglês
  `duration` VARCHAR(50) NOT NULL,     -- Ex: "2021 - 2024", "2020"
  `location` VARCHAR(150) NULL,        -- Localização ou regime de ensino
  `education_type` VARCHAR(100) NULL,  -- Categoria/Tipo de ensino (ex: "Ensino Superior")
  `description` TEXT NOT NULL,          -- Detalhes ou conquistas escolares
  `description_en` TEXT NULL,           -- Descrição traduzida em inglês
  `image_url` VARCHAR(255) NULL,        -- Logótipo da escola ou imagem do certificado
  `sort_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de mensagens de contacto recebidas pelo formulário público do portfólio
CREATE TABLE IF NOT EXISTS `messages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `subject` VARCHAR(150) NOT NULL,
  `message` TEXT NOT NULL,
  `is_read` TINYINT(1) DEFAULT 0,  -- 0 = Não lida, 1 = Lida
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de estatísticas de visitas anónimas ao portfólio (RGPD Compliant)
CREATE TABLE IF NOT EXISTS `visitor_stats` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `page` VARCHAR(100) NOT NULL,
  `device` VARCHAR(50) NOT NULL,
  `browser` VARCHAR(50) NOT NULL,
  `referrer` VARCHAR(255) NULL,
  `visit_date` DATE NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (`visit_date`),
  INDEX (`page`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de artigos de blog interativos com suporte a Markdown
CREATE TABLE IF NOT EXISTS `blog_posts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `content` TEXT NOT NULL,                  -- Conteúdo rico formatado em Markdown
  `excerpt` TEXT DEFAULT NULL,              -- Breve resumo ou descrição resumida do artigo
  `image_url` VARCHAR(255) DEFAULT NULL,    -- Link para foto de capa do artigo
  `status` VARCHAR(20) DEFAULT 'draft',     -- Estado: 'draft' (Rascunho) ou 'published' (Publicado)
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX (`slug`),
  INDEX (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de hobbies / passatempos pessoais do programador
CREATE TABLE IF NOT EXISTS `hobbies` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,             -- Nome do passatempo (ex: Computação e Hardware)
  `description` TEXT NOT NULL,              -- Descrição detalhada do passatempo
  `icon` VARCHAR(50) NOT NULL,              -- Ícone Lucide correspondente (ex: Cpu, Heart, Gamepad2)
  `image_url` VARCHAR(255) DEFAULT NULL,    -- Link para foto do passatempo (Opcional)
  `sort_order` INT DEFAULT 0,               -- Ordem de exibição personalizada
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =====================================================================
-- INSERÇÃO DE DADOS INICIAIS (SEED DATA)
-- =====================================================================

-- Criação do utilizador padrão do administrador (Username: admin | Email: ayresdaioneto@gmail.com)
-- Password inicial: "AyresPortofolio2026!"
-- Nota: A hash abaixo corresponde à password cifrada de forma segura usando bcrypt no PHP
INSERT INTO `users` (`id`, `username`, `email`, `password_hash`) 
VALUES (1, 'admin', 'ayresdaioneto@gmail.com', '$2y$10$w09Zk.x8eMoxuUep/v2pDOKB4i.78t8Hk71zI2P69mR/f67kF.tqa')
ON DUPLICATE KEY UPDATE `id`=`id`;

-- Criação de um perfil padrão de demonstração para o portfólio
INSERT INTO `profile` (`id`, `name`, `role`, `bio`, `email`, `phone`, `location`, `github_url`, `linkedin_url`, `avatar_url`, `cv_url`) 
VALUES (1, 'Ayres Daio Neto', 'Desenvolvedor Full Stack', 'Desenvolvedor apaixonado por criar aplicações web de alto desempenho, elegantes e extremamente seguras usando tecnologias modernas como Next.js, PHP e bases de dados relacionais.', 'ayresdaioneto@gmail.com', '+351 900 000 000', 'Portugal', 'https://github.com', 'https://linkedin.com', NULL, NULL)
ON DUPLICATE KEY UPDATE `id`=`id`;
