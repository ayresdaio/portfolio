<?php
/**
 * =====================================================================
 * ENDPOINT PÚBLICO DE DADOS CONSOLIDADOS DO PORTFÓLIO
 * =====================================================================
 * Rota: GET /backend/api/portfolio
 * Acesso: Público
 * Reúne todas as informações públicas do portfólio (Perfil, Projetos, 
 * Competências e Linha Temporal de Experiência) numa única resposta célere.
 */

// 1. Inicializar configurações e base de dados
define('SECURE_ACCESS', true);
require_once dirname(__DIR__) . '/includes/config.php';
require_once dirname(__DIR__) . '/includes/db.php';

use Includes\Database;

// 2. Apenas aceitar pedidos GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    header('HTTP/1.1 405 Method Not Allowed');
    echo json_encode(['success' => false, 'message' => 'Método não permitido.'], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $db = Database::getConnection();

    $lang = isset($_GET['lang']) ? trim(strtolower($_GET['lang'])) : 'pt';

    // 3. Obter os dados do perfil do administrador (Incluindo as colunas _en)
    $profileStmt = $db->query('SELECT name, role, role_en, bio, bio_en, email, phone, location, location_en, github_url, linkedin_url, facebook_url, instagram_url, avatar_url, cv_url, cv_url_en, cv_url_tech, cv_url_tech_en, about_text, about_text_en, about_image_url FROM profile LIMIT 1');
    $profile = $profileStmt->fetch();

    if ($profile && $lang === 'en') {
        if (!empty($profile['role_en'])) $profile['role'] = $profile['role_en'];
        if (!empty($profile['bio_en'])) $profile['bio'] = $profile['bio_en'];
        if (!empty($profile['about_text_en'])) $profile['about_text'] = $profile['about_text_en'];
        if (!empty($profile['location_en'])) $profile['location'] = $profile['location_en'];
        if (!empty($profile['cv_url_en'])) $profile['cv_url'] = $profile['cv_url_en'];
        if (!empty($profile['cv_url_tech_en'])) $profile['cv_url_tech'] = $profile['cv_url_tech_en'];
    }
    if ($profile) {
        unset($profile['role_en'], $profile['bio_en'], $profile['about_text_en'], $profile['location_en'], $profile['cv_url_en'], $profile['cv_url_tech_en']);
    }

    // 3.2 Obter as secções extra do 'Sobre Mim'
    $aboutSectionsStmt = $db->query('SELECT id, title, title_en, content, content_en, icon, sort_order FROM about_sections ORDER BY sort_order ASC, id ASC');
    $aboutSections = $aboutSectionsStmt->fetchAll();

    foreach ($aboutSections as &$sec) {
        if ($lang === 'en') {
            if (!empty($sec['title_en'])) $sec['title'] = $sec['title_en'];
            if (!empty($sec['content_en'])) $sec['content'] = $sec['content_en'];
        }
        unset($sec['title_en'], $sec['content_en']);
    }
    unset($sec);

    // 3.3 Obter as imagens da galeria do 'Sobre Mim'
    $aboutImagesStmt = $db->query('SELECT id, image_url, caption, caption_en, sort_order FROM about_images ORDER BY sort_order ASC, id ASC');
    $aboutImages = $aboutImagesStmt->fetchAll();

    foreach ($aboutImages as &$img) {
        if ($lang === 'en') {
            if (!empty($img['caption_en'])) $img['caption'] = $img['caption_en'];
        }
        unset($img['caption_en']);
    }
    unset($img);

    // 4. Obter a lista de projetos ordinários com suporte a _en
    $projectsStmt = $db->query('SELECT id, title, title_en, description, description_en, image_url, tags, demo_url, repo_url, sort_order FROM projects ORDER BY sort_order ASC, id DESC');
    $projects = $projectsStmt->fetchAll();

    // Obter todas as imagens adicionais de suporte associadas aos projetos de forma unificada para otimização
    $imagesStmt = $db->query('SELECT id, project_id, image_url FROM project_images ORDER BY id ASC');
    $images = $imagesStmt->fetchAll();

    // Agrupar as imagens adicionais por ID de projeto correspondente
    $projectImages = [];
    foreach ($images as $img) {
        $projectImages[$img['project_id']][] = [
            'id' => (int)$img['id'],
            'project_id' => (int)$img['project_id'],
            'image_url' => $img['image_url']
        ];
    }

    // Injetar a galeria correspondente na estrutura de cada projeto e fundir idiomas
    foreach ($projects as &$proj) {
        $proj['images'] = isset($projectImages[$proj['id']]) ? $projectImages[$proj['id']] : [];
        if ($lang === 'en') {
            if (!empty($proj['title_en'])) $proj['title'] = $proj['title_en'];
            if (!empty($proj['description_en'])) $proj['description'] = $proj['description_en'];
        }
        unset($proj['title_en'], $proj['description_en']);
    }
    unset($proj); // Libertar a referência explícita para evitar efeitos colaterais

    // 5. Obter a lista de competências (skills)
    $skillsStmt = $db->query('SELECT id, name, description, description_en, level, experience_time, experience_time_en, category, category_en, subcategory, subcategory_en, icon FROM skills ORDER BY category ASC, level DESC');
    $skills = $skillsStmt->fetchAll();

    foreach ($skills as &$skill) {
        if ($lang === 'en') {
            if (!empty($skill['description_en'])) $skill['description'] = $skill['description_en'];
            if (!empty($skill['experience_time_en'])) $skill['experience_time'] = $skill['experience_time_en'];
            if (!empty($skill['category_en'])) $skill['category'] = $skill['category_en'];
            if (!empty($skill['subcategory_en'])) $skill['subcategory'] = $skill['subcategory_en'];
        }
        unset($skill['description_en'], $skill['experience_time_en'], $skill['category_en'], $skill['subcategory_en']);
    }
    unset($skill);

    // 6. Obter a linha temporal de experiências (Timeline)
    $experiencesStmt = $db->query('SELECT id, role, role_en, company, company_en, duration, duration_en, location, location_en, description, description_en, image_url, sort_order FROM experiences ORDER BY sort_order ASC, id DESC');
    $experiences = $experiencesStmt->fetchAll();

    foreach ($experiences as &$exp) {
        if ($lang === 'en') {
            if (!empty($exp['role_en'])) $exp['role'] = $exp['role_en'];
            if (!empty($exp['company_en'])) $exp['company'] = $exp['company_en'];
            if (!empty($exp['duration_en'])) $exp['duration'] = $exp['duration_en'];
            if (!empty($exp['location_en'])) $exp['location'] = $exp['location_en'];
            if (!empty($exp['description_en'])) $exp['description'] = $exp['description_en'];
        }
        unset($exp['role_en'], $exp['company_en'], $exp['description_en'], $exp['duration_en'], $exp['location_en']);
    }
    unset($exp);

    // 7. Obter o historial de formação académica (Educação)
    $educationStmt = $db->query('SELECT id, degree, degree_en, institution, institution_en, duration, duration_en, location, location_en, education_type, education_type_en, description, description_en, image_url, link_url, sort_order FROM education ORDER BY sort_order ASC, id DESC');
    $education = $educationStmt->fetchAll();

    foreach ($education as &$edu) {
        if ($lang === 'en') {
            if (!empty($edu['degree_en'])) $edu['degree'] = $edu['degree_en'];
            if (!empty($edu['institution_en'])) $edu['institution'] = $edu['institution_en'];
            if (!empty($edu['duration_en'])) $edu['duration'] = $edu['duration_en'];
            if (!empty($edu['location_en'])) $edu['location'] = $edu['location_en'];
            if (!empty($edu['education_type_en'])) $edu['education_type'] = $edu['education_type_en'];
            if (!empty($edu['description_en'])) $edu['description'] = $edu['description_en'];
        }
        unset($edu['degree_en'], $edu['institution_en'], $edu['description_en'], $edu['duration_en'], $edu['location_en'], $edu['education_type_en']);
    }
    unset($edu);

    // 8. Obter os artigos publicados do blog (Limitado a 6 mais recentes para leveza) com suporte bilingue
    $blogStmt = $db->query("SELECT id, title, title_en, slug, excerpt, excerpt_en, image_url, created_at FROM blog_posts WHERE status = 'published' ORDER BY created_at DESC LIMIT 6");
    $blog = $blogStmt->fetchAll();

    foreach ($blog as &$post) {
        if ($lang === 'en') {
            if (!empty($post['title_en'])) $post['title'] = $post['title_en'];
            if (!empty($post['excerpt_en'])) $post['excerpt'] = $post['excerpt_en'];
        }
        unset($post['title_en'], $post['excerpt_en']);
    }
    unset($post);

    // 9. Obter os passatempos/hobbies organizados
    $hobbiesStmt = $db->query('SELECT id, name, name_en, description, description_en, icon, image_url, sort_order FROM hobbies ORDER BY sort_order ASC, id ASC');
    $hobbies = $hobbiesStmt->fetchAll();

    foreach ($hobbies as &$hob) {
        if ($lang === 'en') {
            if (!empty($hob['name_en'])) $hob['name'] = $hob['name_en'];
            if (!empty($hob['description_en'])) $hob['description'] = $hob['description_en'];
        }
        unset($hob['name_en'], $hob['description_en']);
    }
    unset($hob);

    // 10. Retornar dados estruturados unificados em formato JSON
    echo json_encode([
        'success' => true,
        'profile' => $profile ?: [
            'name' => 'Ayres Daio Neto',
            'role' => 'Desenvolvedor Full Stack',
            'bio' => 'Perfil em atualização...',
            'email' => 'seu_email@exemplo.com'
        ],
        'about_sections' => $aboutSections, // Secções adicionais para a Bento Grid do Sobre Mim
        'about_images' => $aboutImages,     // Galeria de fotos do Sobre Mim
        'projects' => $projects,
        'skills' => $skills,
        'experiences' => $experiences,
        'education' => $education,
        'blog' => $blog,
        'hobbies' => $hobbies
    ], JSON_UNESCAPED_UNICODE);
    exit;

} catch (\Exception $e) {
    @error_log("Erro no portfolio público da API: " . $e->getMessage());
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode(['success' => false, 'message' => 'Ocorreu um erro interno no servidor.'], JSON_UNESCAPED_UNICODE);
    exit;
}
