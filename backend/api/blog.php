<?php
/**
 * =====================================================================
 * ENDPOINT GESTÃO DE ARTIGOS DO BLOG (CRUD / API PRIVADA E PÚBLICA)
 * =====================================================================
 * Rota: GET/POST/DELETE /backend/api/blog
 * Acesso:
 *   - GET (Público): Lista posts publicados ou detalha um artigo por slug.
 *   - GET (Admin): Lista todos os artigos (publicados e rascunhos).
 *   - POST/DELETE (Admin): CRUD restrito com sessão administrativa ativa.
 */

// 1. Inicializar configurações globais e ligação à base de dados
define('SECURE_ACCESS', true);
require_once dirname(__DIR__) . '/includes/config.php';
require_once dirname(__DIR__) . '/includes/db.php';

use Includes\Database;

$db = Database::getConnection();
$requestMethod = $_SERVER['REQUEST_METHOD'];

// Verificar se o administrador tem sessão ativa para operações protegidas
$isAdmin = isset($_SESSION['admin_logged']) && $_SESSION['admin_logged'] === true;

// Se for administrador, validar controlo de inatividade (Sessão de 2 horas)
if ($isAdmin) {
    $timeout_duration = 7200;
    if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] > $timeout_duration)) {
        session_unset();
        session_destroy();
        $isAdmin = false; // Desqualificar se a sessão expirou
    } else {
        $_SESSION['last_activity'] = time(); // Renovar atividade
    }
}

// =====================================================================
// OPERAÇÃO GET: Retornar lista de artigos ou detalhe individual
// =====================================================================
if ($requestMethod === 'GET') {
    try {
        $slug = isset($_GET['slug']) ? trim($_GET['slug']) : null;

        if ($slug) {
            // Consulta de post individual
            $stmt = $db->prepare('SELECT * FROM blog_posts WHERE slug = :slug LIMIT 1');
            $stmt->execute([':slug' => $slug]);
            $post = $stmt->fetch();

            if ($post) {
                // Se for rascunho e utilizador não for admin, recusar o acesso
                if ($post['status'] === 'draft' && !$isAdmin) {
                    header('HTTP/1.1 401 Unauthorized');
                    echo json_encode(['success' => false, 'message' => 'Artigo não disponível para leitura pública.'], JSON_UNESCAPED_UNICODE);
                    exit;
                }
                echo json_encode(['success' => true, 'post' => $post], JSON_UNESCAPED_UNICODE);
            } else {
                header('HTTP/1.1 404 Not Found');
                echo json_encode(['success' => false, 'message' => 'Artigo do blog não encontrado.'], JSON_UNESCAPED_UNICODE);
            }
            exit;
        }

        // Listagem geral
        if ($isAdmin) {
            // Admin vê todos os posts
            $stmt = $db->query('SELECT * FROM blog_posts ORDER BY created_at DESC');
        } else {
            // Visitante vê apenas posts publicados
            $stmt = $db->query("SELECT * FROM blog_posts WHERE status = 'published' ORDER BY created_at DESC");
        }

        $posts = $stmt->fetchAll();
        echo json_encode(['success' => true, 'posts' => $posts], JSON_UNESCAPED_UNICODE);
        exit;

    } catch (\Exception $e) {
        error_log("Erro ao obter artigos do blog: " . $e->getMessage());
        header('HTTP/1.1 500 Internal Server Error');
        echo json_encode(['success' => false, 'message' => 'Erro interno ao obter artigos.'], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// Para POST e DELETE, barreira de acesso restrito obrigatória
if (!$isAdmin) {
    header('HTTP/1.1 401 Unauthorized');
    echo json_encode(['success' => false, 'message' => 'Acesso não autorizado.'], JSON_UNESCAPED_UNICODE);
    exit;
}

// =====================================================================
// OPERAÇÃO POST: Criar ou Editar Artigo do Blog (Com upload de Imagem de capa)
// =====================================================================
if ($requestMethod === 'POST') {
    try {
        $id = isset($_POST['id']) && !empty($_POST['id']) ? (int)$_POST['id'] : null;
        $title = isset($_POST['title']) ? trim(strip_tags($_POST['title'])) : '';
        // Novos campos de internacionalização para suporte bilingue (Português/Inglês)
        $title_en = isset($_POST['title_en']) ? trim(strip_tags($_POST['title_en'])) : null;
        $slug = isset($_POST['slug']) ? trim(strip_tags($_POST['slug'])) : '';
        $content = isset($_POST['content']) ? trim($_POST['content']) : ''; // Aceita Markdown, sem strip_tags
        $content_en = isset($_POST['content_en']) ? trim($_POST['content_en']) : null; // Aceita Markdown, sem strip_tags
        $excerpt = isset($_POST['excerpt']) ? trim(strip_tags($_POST['excerpt'])) : '';
        $excerpt_en = isset($_POST['excerpt_en']) ? trim(strip_tags($_POST['excerpt_en'])) : null;
        $status = isset($_POST['status']) && $_POST['status'] === 'published' ? 'published' : 'draft';
        $image_url = isset($_POST['image_url']) ? trim(strip_tags($_POST['image_url'])) : null;

        // Validar dados obrigatórios (título e conteúdo em Português continuam a ser o mínimo exigível)
        if (empty($title) || empty($content)) {
            header('HTTP/1.1 400 Bad Request');
            echo json_encode(['success' => false, 'message' => 'O título e o conteúdo do artigo são obrigatórios.'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        // Gerar slug automaticamente se vazio
        if (empty($slug)) {
            // Substituir caracteres acentuados por equivalentes simples e espaços por hífens
            $slug = strtolower($title);
            $slug = preg_replace('/[áàâãäå]/u', 'a', $slug);
            $slug = preg_replace('/[éèêë]/u', 'e', $slug);
            $slug = preg_replace('/[íìîï]/u', 'i', $slug);
            $slug = preg_replace('/[óòôõö]/u', 'o', $slug);
            $slug = preg_replace('/[úùûü]/u', 'u', $slug);
            $slug = preg_replace('/ç/u', 'c', $slug);
            $slug = preg_replace('/[^a-z0-9\s-]/', '', $slug);
            $slug = preg_replace('/[\s-]+/', '-', $slug);
            $slug = trim($slug, '-');
        }

        // Validar se o slug é único na criação
        $slugCheck = $db->prepare('SELECT id FROM blog_posts WHERE slug = :slug AND (:id IS NULL OR id != :id) LIMIT 1');
        $slugCheck->execute([':slug' => $slug, ':id' => $id]);
        if ($slugCheck->fetch()) {
            // Se o slug já existir, acrescentar um sufixo numérico aleatório
            $slug .= '-' . bin2hex(random_bytes(2));
        }

        // Processar imagem de capa antiga se for edição
        if ($id) {
            $imgStmt = $db->prepare('SELECT image_url FROM blog_posts WHERE id = :id LIMIT 1');
            $imgStmt->execute([':id' => $id]);
            $currentPost = $imgStmt->fetch();
            if ($currentPost && empty($image_url)) {
                $image_url = $currentPost['image_url'];
            }
        }

        // -------------------------------------------------------------
        // PROCESSAMENTO DE UPLOAD DA IMAGEM DE CAPA DO ARTIGO
        // -------------------------------------------------------------
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $imageFile = $_FILES['image'];

            // Limite de 5MB
            if ($imageFile['size'] > 5 * 1024 * 1024) {
                throw new \Exception('O tamanho da imagem de capa não deve exceder 5MB.');
            }

            $finfo = new \finfo(FILEINFO_MIME_TYPE);
            $mimeType = $finfo->file($imageFile['tmp_name']);
            $allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

            if (!in_array($mimeType, $allowedMimes)) {
                throw new \Exception('Formato inválido. Apenas JPG, PNG, WEBP e GIF são suportados.');
            }

            $mimeToExt = [
                'image/jpeg' => 'jpg',
                'image/png'  => 'png',
                'image/webp' => 'webp',
                'image/gif'  => 'gif'
            ];
            $ext = $mimeToExt[$mimeType] ?? 'jpg';
            $newImageName = 'blog_' . bin2hex(random_bytes(8)) . '.' . $ext;

            $uploadDir = dirname(__DIR__) . '/uploads/blog/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }

            $destPath = $uploadDir . $newImageName;

            // Apagar imagem antiga se existia
            if ($image_url && strpos($image_url, '/backend/uploads/') !== false) {
                $oldPath = dirname(__DIR__) . str_replace('/backend', '', $image_url);
                if (file_exists($oldPath)) {
                    @unlink($oldPath);
                }
            }

            if (!move_uploaded_file($imageFile['tmp_name'], $destPath)) {
                throw new \Exception('Erro ao salvar a imagem de capa do blog no servidor.');
            }

            $image_url = '/backend/uploads/blog/' . $newImageName;
        }

        if ($id) {
            // Atualizar post na base de dados (incluindo as colunas de internacionalização)
            $stmt = $db->prepare('UPDATE blog_posts SET title = :title, title_en = :title_en, slug = :slug, content = :content, content_en = :content_en, excerpt = :excerpt, excerpt_en = :excerpt_en, image_url = :image_url, status = :status WHERE id = :id');
            $stmt->execute([
                ':title' => $title,
                ':title_en' => $title_en,
                ':slug' => $slug,
                ':content' => $content,
                ':content_en' => $content_en,
                ':excerpt' => $excerpt,
                ':excerpt_en' => $excerpt_en,
                ':image_url' => $image_url,
                ':status' => $status,
                ':id' => $id
            ]);
            $msg = 'Artigo do blog atualizado com sucesso!';
        } else {
            // Criar post na base de dados (incluindo as colunas de internacionalização)
            $stmt = $db->prepare('INSERT INTO blog_posts (title, title_en, slug, content, content_en, excerpt, excerpt_en, image_url, status) VALUES (:title, :title_en, :slug, :content, :content_en, :excerpt, :excerpt_en, :image_url, :status)');
            $stmt->execute([
                ':title' => $title,
                ':title_en' => $title_en,
                ':slug' => $slug,
                ':content' => $content,
                ':content_en' => $content_en,
                ':excerpt' => $excerpt,
                ':excerpt_en' => $excerpt_en,
                ':image_url' => $image_url,
                ':status' => $status
            ]);
            $msg = 'Artigo do blog criado com sucesso!';
        }

        echo json_encode([
            'success' => true,
            'message' => $msg,
            'image_url' => $image_url,
            'slug' => $slug
        ], JSON_UNESCAPED_UNICODE);
        exit;

    } catch (\Exception $e) {
        header('HTTP/1.1 400 Bad Request');
        echo json_encode(['success' => false, 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// =====================================================================
// OPERAÇÃO DELETE: Eliminar Artigo do Blog
// =====================================================================
if ($requestMethod === 'DELETE') {
    try {
        $id = isset($_GET['id']) ? (int)$_GET['id'] : null;

        if (!$id) {
            header('HTTP/1.1 400 Bad Request');
            echo json_encode(['success' => false, 'message' => 'ID do artigo em falta.'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $stmt = $db->prepare('SELECT image_url FROM blog_posts WHERE id = :id LIMIT 1');
        $stmt->execute([':id' => $id]);
        $post = $stmt->fetch();

        if ($post) {
            // Apagar imagem física se existia
            if ($post['image_url'] && strpos($post['image_url'], '/backend/uploads/') !== false) {
                $imagePath = dirname(__DIR__) . str_replace('/backend', '', $post['image_url']);
                if (file_exists($imagePath)) {
                    @unlink($imagePath);
                }
            }

            $deleteStmt = $db->prepare('DELETE FROM blog_posts WHERE id = :id');
            $deleteStmt->execute([':id' => $id]);

            echo json_encode(['success' => true, 'message' => 'Artigo do blog eliminado com sucesso!'], JSON_UNESCAPED_UNICODE);
        } else {
            header('HTTP/1.1 404 Not Found');
            echo json_encode(['success' => false, 'message' => 'Artigo não encontrado no servidor.'], JSON_UNESCAPED_UNICODE);
        }
        exit;

    } catch (\Exception $e) {
        error_log("Erro ao eliminar artigo: " . $e->getMessage());
        header('HTTP/1.1 500 Internal Server Error');
        echo json_encode(['success' => false, 'message' => 'Erro interno ao eliminar artigo.'], JSON_UNESCAPED_UNICODE);
        exit;
    }
}
