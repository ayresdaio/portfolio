<?php
/**
 * =====================================================================
 * INICIALIZADOR DE BASE DE DADOS SQLITE LOCAL (VERSÃO COMPLETA)
 * =====================================================================
 * Este script cria e popula a base de dados SQLite local (database.sqlite)
 * com TODAS as tabelas e colunas de tradução necessárias,
 * permitindo o funcionamento autónomo e sem erros de SQL dos testes.
 */

define('SECURE_ACCESS', true);

$sqlitePath = dirname(__DIR__) . '/database.sqlite';

echo "A inicializar a base de dados SQLite em: {$sqlitePath}...\n";

// Para garantir que a estrutura é criada do zero com todas as novas colunas
if (file_exists($sqlitePath)) {
    unlink($sqlitePath);
    echo "Ficheiro SQLite antigo apagado para garantir a criação da nova estrutura.\n";
}

try {
    $db = new PDO("sqlite:{$sqlitePath}");
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // 1. Criar as tabelas completas
    echo "A criar tabelas...\n";
    
    $db->exec("
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      security_key_hash TEXT NULL,
      login_attempts INTEGER DEFAULT 0,
      lockout_until DATETIME NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    ");

    $db->exec("
    CREATE TABLE IF NOT EXISTS password_resets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      token TEXT NOT NULL UNIQUE,
      expires_at DATETIME NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    ");

    $db->exec("
    CREATE TABLE IF NOT EXISTS profile (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      role_en TEXT NULL,
      bio TEXT NOT NULL,
      bio_en TEXT NULL,
      email TEXT NOT NULL,
      phone TEXT NULL,
      location TEXT NULL,
      location_en TEXT NULL,
      github_url TEXT NULL,
      linkedin_url TEXT NULL,
      facebook_url TEXT NULL,
      instagram_url TEXT NULL,
      avatar_url TEXT NULL,
      cv_url TEXT NULL,
      cv_url_en TEXT NULL,
      cv_url_tech TEXT NULL,
      cv_url_tech_en TEXT NULL,
      about_text TEXT NULL,
      about_text_en TEXT NULL,
      about_image_url TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    ");

    $db->exec("
    CREATE TABLE IF NOT EXISTS about_sections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      title_en TEXT NULL,
      content TEXT NOT NULL,
      content_en TEXT NULL,
      icon TEXT NULL,
      sort_order INTEGER DEFAULT 0
    );
    ");

    $db->exec("
    CREATE TABLE IF NOT EXISTS about_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      image_url TEXT NOT NULL,
      caption TEXT NULL,
      caption_en TEXT NULL,
      sort_order INTEGER DEFAULT 0
    );
    ");

    $db->exec("
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      title_en TEXT NULL,
      description TEXT NOT NULL,
      description_en TEXT NULL,
      image_url TEXT NULL,
      tags TEXT NOT NULL,
      demo_url TEXT NULL,
      repo_url TEXT NULL,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    ");

    $db->exec("
    CREATE TABLE IF NOT EXISTS project_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      image_url TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );
    ");

    $db->exec("
    CREATE TABLE IF NOT EXISTS skills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NULL,
      description_en TEXT NULL,
      level INTEGER NOT NULL,
      experience_time TEXT NULL,
      experience_time_en TEXT NULL,
      category TEXT NOT NULL,
      category_en TEXT NULL,
      subcategory TEXT NULL,
      subcategory_en TEXT NULL,
      icon TEXT NULL
    );
    ");

    $db->exec("
    CREATE TABLE IF NOT EXISTS experiences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role TEXT NOT NULL,
      role_en TEXT NULL,
      company TEXT NOT NULL,
      company_en TEXT NULL,
      duration TEXT NOT NULL,
      duration_en TEXT NULL,
      location TEXT NULL,
      location_en TEXT NULL,
      description TEXT NOT NULL,
      description_en TEXT NULL,
      image_url TEXT NULL,
      sort_order INTEGER DEFAULT 0
    );
    ");

    $db->exec("
    CREATE TABLE IF NOT EXISTS education (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      degree TEXT NOT NULL,
      degree_en TEXT NULL,
      institution TEXT NOT NULL,
      institution_en TEXT NULL,
      duration TEXT NOT NULL,
      duration_en TEXT NULL,
      location TEXT NULL,
      location_en TEXT NULL,
      education_type TEXT NULL,
      education_type_en TEXT NULL,
      description TEXT NOT NULL,
      description_en TEXT NULL,
      image_url TEXT NULL,
      link_url TEXT NULL,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    ");

    $db->exec("
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    ");

    $db->exec("
    CREATE TABLE IF NOT EXISTS visitor_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      page TEXT NOT NULL,
      device TEXT NOT NULL,
      browser TEXT NOT NULL,
      referrer TEXT NULL,
      country TEXT NULL,
      country_code TEXT NULL,
      visit_date DATE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    ");

    $db->exec("
    CREATE TABLE IF NOT EXISTS security_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username_attempted TEXT NOT NULL,
      ip_address TEXT NOT NULL,
      country TEXT NOT NULL,
      city TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    ");

    $db->exec("
    CREATE TABLE IF NOT EXISTS blog_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      title_en TEXT NULL,
      slug TEXT NOT NULL UNIQUE,
      content TEXT NOT NULL,
      content_en TEXT NULL,
      excerpt TEXT DEFAULT NULL,
      excerpt_en TEXT DEFAULT NULL,
      image_url TEXT DEFAULT NULL,
      status TEXT DEFAULT 'draft',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    ");

    $db->exec("
    CREATE TABLE IF NOT EXISTS hobbies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      name_en TEXT NULL,
      description TEXT NOT NULL,
      description_en TEXT NULL,
      icon TEXT NOT NULL,
      image_url TEXT DEFAULT NULL,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    ");

    echo "Tabelas completas criadas com sucesso.\n";
    
    // 2. Inserir dados de seed (demonstração)
    echo "A inserir dados de seed...\n";
    
    // Utilizador Admin padrão de testes
    // Email: example@gmail.com | Password: password123 | Security Key: 123456
    $passHash = password_hash("password123", PASSWORD_BCRYPT);
    $secHash = password_hash("123456", PASSWORD_BCRYPT);
    $stmt = $db->prepare('INSERT INTO users (id, username, email, password_hash, security_key_hash) VALUES (1, "admin", "example@gmail.com", :pass, :sec)');
    $stmt->execute([':pass' => $passHash, ':sec' => $secHash]);
    echo "- Utilizador 'admin' de teste criado.\n";

    // Perfil Padrão
    $db->exec("INSERT INTO profile (id, name, role, role_en, bio, bio_en, email, phone, location, location_en, github_url, linkedin_url, about_text, about_text_en) VALUES (1, 'Ayres Daio Neto', 'Desenvolvedor Full Stack', 'Full Stack Developer', 'Desenvolvedor apaixonado por criar aplicações web de alto desempenho, elegantes e extremamente seguras usando tecnologias modernas como Next.js, PHP e bases de dados relacionais.', 'Passionate developer dedicated to building high-performance, elegant, and secure web applications using modern technologies.', 'ayresdaioneto@gmail.com', '+351 900 000 000', 'Portugal', 'Portugal', 'https://github.com/ayresdaioneto', 'https://linkedin.com/in/ayresdaioneto', 'Olá! Sou o Ayres, um desenvolvedor focado no ecossistema PHP e React.', 'Hello! I am Ayres, a developer focused on the PHP and React ecosystem.')");
    echo "- Perfil padrão criado.\n";

    // Secções extras do Sobre Mim (Bento Grid)
    $db->exec("INSERT INTO about_sections (id, title, title_en, content, content_en, icon, sort_order) VALUES 
        (1, 'Filosofia de Trabalho', 'Work Philosophy', 'Priorizo a legibilidade, modularidade e performance do código acima de tudo.', 'I prioritize code readability, modularity, and performance above all.', 'Award', 1),
        (2, 'Projetos Recentes', 'Recent Projects', 'Sempre focado em trazer o máximo valor visual e de negócio para o cliente.', 'Always focused on bringing maximum visual and business value to the client.', 'Layers', 2)
    ");
    echo "- Secções extra 'Sobre Mim' criadas.\n";

    // Imagens do Sobre Mim
    $db->exec("INSERT INTO about_images (id, image_url, caption, caption_en, sort_order) VALUES 
        (1, '/uploads/about_demo1.jpg', 'Espaço de trabalho criativo', 'Creative workspace', 1)
    ");
    echo "- Imagens extra 'Sobre Mim' criadas.\n";

    // Projetos
    $db->exec("INSERT INTO projects (id, title, title_en, description, description_en, tags, demo_url, repo_url, sort_order) VALUES 
        (1, 'Portfólio Visual Segurado', 'Visual Secured Portfolio', 'Um portfólio profissional construído em React e PHP com segurança integrada e ecrãs dinâmicos.', 'A professional portfolio built in React and PHP with integrated security and dynamic views.', 'React, PHP, SQLite, TailWind', 'http://localhost:5173', 'https://github.com/ayresdaioneto/portfolio', 1),
        (2, 'Dashboard Administrativo Avançado', 'Advanced Admin Dashboard', 'Painel de gestão administrativa dinâmico com autenticação JWT e controlo completo de conteúdo.', 'Dynamic administrative dashboard with JWT authentication and full content management control.', 'React, Tailwind, JWT, PHP', 'http://localhost:5173/admin', 'https://github.com/ayresdaioneto/dashboard', 2)
    ");
    echo "- Projetos de demonstração criados.\n";

    // Artigos de Blog
    $db->exec("INSERT INTO blog_posts (id, title, title_en, slug, content, content_en, excerpt, excerpt_en, status) VALUES 
        (1, 'Como Configurar Testes Automatizados no Frontend', 'How to Configure Automated Tests in Frontend', 'como-configurar-testes-automatizados-no-frontend', 'Os testes de interface garantem que os fluxos principais da sua aplicação permanecem consistentes ao longo do desenvolvimento. Neste artigo discutimos boas práticas com ferramentas modernas.\n\nCom o Playwright e o TestSprite, conseguimos simular o comportamento de um utilizador real e verificar se o frontend responde adequadamente.\n\nA validação contínua previne regressões e garante a estabilidade de rotas críticas como o login e os formulários de contacto.', 'Interface tests ensure that the main flows of your application remain consistent throughout development. In this article, we discuss best practices with modern tools.\n\nWith Playwright and TestSprite, we can simulate the behavior of a real user and verify if the frontend responds properly.\n\nContinuous validation prevents regressions and ensures the stability of critical routes like login and contact forms.', 'Uma introdução aos testes automáticos modernos em aplicações SPA.', 'An introduction to modern automated testing in SPA applications.', 'published'),
        (2, 'Boas Práticas de Segurança em APIs com PHP', 'Best Security Practices in PHP APIs', 'boas-praticas-de-seguranca-em-apis-com-php', 'A segurança do backend é um pilar crucial em qualquer sistema de produção. Analisamos técnicas contra SQL Injection, XSS e validação de tokens JWT.', 'Backend security is a crucial pillar in any production system. We analyze techniques against SQL Injection, XSS, and JWT token validation.', 'Aprenda a proteger a sua API PHP local ou em produção de forma robusta.', 'Learn how to secure your PHP API locally or in production in a robust manner.', 'published')
    ");
    echo "- Artigos de blog criados.\n";

    // Competências (Skills)
    $db->exec("INSERT INTO skills (id, name, level, category, category_en, icon) VALUES 
        (1, 'PHP', 90, 'Backend', 'Backend', 'php'),
        (2, 'React', 85, 'Frontend', 'Frontend', 'react'),
        (3, 'SQL / SQLite', 80, 'Backend', 'Backend', 'database'),
        (4, 'Tailwind CSS', 88, 'Frontend', 'Frontend', 'tailwind')
    ");
    echo "- Competências (Skills) criadas.\n";

    // Hobbies
    $db->exec("INSERT INTO hobbies (id, name, name_en, description, description_en, icon) VALUES 
        (1, 'Programação', 'Coding', 'Desenvolver projetos open-source e explorar novas linguagens.', 'Developing open-source projects and exploring new languages.', 'code'),
        (2, 'Tecnologia e Hardware', 'Tech & Hardware', 'Montagem de computadores e testes de desempenho.', 'PC building and performance benchmarking.', 'cpu')
    ");
    echo "- Hobbies de demonstração criados.\n";

    // Experiências
    $db->exec("INSERT INTO experiences (id, role, role_en, company, company_en, duration, duration_en, location, location_en, description, description_en) VALUES 
        (1, 'Desenvolvedor Full Stack Sénior', 'Senior Full Stack Developer', 'Tecnologias Daio', 'Daio Technologies', '2024 - Presente', '2024 - Present', 'Lisboa, Portugal', 'Lisbon, Portugal', 'Responsável pelo desenvolvimento da arquitetura web em React e integrações de segurança no backend.', 'Responsible for React web architecture development and backend security integrations.')
    ");
    echo "- Experiências profissionais criadas.\n";

    // Educação
    $db->exec("INSERT INTO education (id, degree, degree_en, institution, institution_en, duration, duration_en, location, location_en, education_type, education_type_en, description, description_en) VALUES 
        (1, 'Licenciatura em Engenharia Informática', 'Bachelors in Computer Engineering', 'Universidade de Tecnologia', 'University of Technology', '2020 - 2023', '2020 - 2023', 'Portugal', 'Portugal', 'Ensino Superior', 'Higher Education', 'Foco em Engenharia de Software, Bases de Dados e Redes de Computadores.', 'Focus on Software Engineering, Databases, and Computer Networks.')
    ");
    echo "- Dados de educação criados.\n";

    echo "Base de dados SQLite inicializada e populada na totalidade com sucesso!\n";

} catch (PDOException $e) {
    echo "Erro técnico ao inicializar o SQLite: " . $e->getMessage() . "\n";
    exit(1);
}
