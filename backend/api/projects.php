<?php
/**
 * =====================================================================
 * ENDPOINT GESTÃO DE PROJETOS (CRUD + UPLOAD SEGURO DE IMAGENS)
 * =====================================================================
 * Rota: GET/POST/DELETE /backend/api/projects
 * Acesso: Restrito a Administrador (Com sessão ativa)
 * Suporta a criação, edição (via POST/multipart) e eliminação (DELETE)
 * de projetos de forma robusta e blindada contra injeção SQL.
 */

// 1. Inicializar configurações e base de dados
define('SECURE_ACCESS', true);
require_once dirname(__DIR__) . '/includes/config.php';
require_once dirname(__DIR__) . '/includes/db.php';

use Includes\Database;

// 2. Proteger a rota: Validar se o utilizador está autenticado
if (!isset($_SESSION['admin_logged']) || $_SESSION['admin_logged'] !== true) {
    header('HTTP/1.1 401 Unauthorized');
    echo json_encode(['success' => false, 'message' => 'Acesso não autorizado.'], JSON_UNESCAPED_UNICODE);
    exit;
}

// 3. Controlo de inatividade (Sessão expira após 2 horas)
$timeout_duration = 7200;
if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] > $timeout_duration)) {
    session_unset();
    session_destroy();
    header('HTTP/1.1 401 Unauthorized');
    echo json_encode(['success' => false, 'message' => 'A sua sessão expirou.'], JSON_UNESCAPED_UNICODE);
    exit;
}
$_SESSION['last_activity'] = time();

$db = Database::getConnection();
$requestMethod = $_SERVER['REQUEST_METHOD'];

// =====================================================================
// OPERAÇÃO GET: Listar um projeto específico ou todos (Para o Admin)
// =====================================================================
if ($requestMethod === 'GET') {
    try {
        $id = isset($_GET['id']) ? (int)$_GET['id'] : null;

        if ($id) {
            $stmt = $db->prepare('SELECT * FROM projects WHERE id = :id LIMIT 1');
            $stmt->execute([':id' => $id]);
            $project = $stmt->fetch();

            // Se o projeto for encontrado, carrega as imagens da galeria associadas
            if ($project) {
                $imgStmt = $db->prepare('SELECT id, image_url FROM project_images WHERE project_id = :project_id ORDER BY id ASC');
                $imgStmt->execute([':project_id' => $project['id']]);
                $project['images'] = $imgStmt->fetchAll();
            }

            echo json_encode(['success' => true, 'project' => $project ?: null], JSON_UNESCAPED_UNICODE);
        } else {
            $stmt = $db->query('SELECT * FROM projects ORDER BY sort_order ASC, id DESC');
            $projects = $stmt->fetchAll();

            // Carrega todas as imagens de suporte para evitar queries em loop (otimização de desempenho)
            $imagesStmt = $db->query('SELECT id, project_id, image_url FROM project_images ORDER BY id ASC');
            $images = $imagesStmt->fetchAll();

            // Agrupa as imagens adicionais pelo identificador do projeto correspondente
            $projectImages = [];
            foreach ($images as $img) {
                $projectImages[$img['project_id']][] = [
                    'id' => (int)$img['id'],
                    'image_url' => $img['image_url']
                ];
            }

            // Anexa a galeria de imagens a cada projeto correspondente no array
            foreach ($projects as &$proj) {
                $proj['images'] = isset($projectImages[$proj['id']]) ? $projectImages[$proj['id']] : [];
            }
            unset($proj); // Quebra de referência explícita de segurança

            echo json_encode(['success' => true, 'projects' => $projects], JSON_UNESCAPED_UNICODE);
        }
        exit;
    } catch (\Exception $e) {
        error_log("Erro ao obter projetos: " . $e->getMessage());
        header('HTTP/1.1 500 Internal Server Error');
        echo json_encode(['success' => false, 'message' => 'Erro interno ao obter projetos.'], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// =====================================================================
// OPERAÇÃO POST: Criar ou Atualizar Projeto (Trata multipart/form-data)
// =====================================================================
if ($requestMethod === 'POST') {
    try {
        $id = isset($_POST['id']) && !empty($_POST['id']) ? (int)$_POST['id'] : null;
        $title = isset($_POST['title']) ? trim(strip_tags($_POST['title'])) : '';
        $title_en = isset($_POST['title_en']) ? trim(strip_tags($_POST['title_en'])) : '';
        $description = isset($_POST['description']) ? trim($_POST['description']) : ''; // Preservar as tags HTML do editor de texto rico TinyMCE
        $description_en = isset($_POST['description_en']) ? trim($_POST['description_en']) : ''; // Preservar as tags HTML do editor de texto rico TinyMCE
        $tags = isset($_POST['tags']) ? trim(strip_tags($_POST['tags'])) : '';
        $demo_url = isset($_POST['demo_url']) ? trim($_POST['demo_url']) : '';
        $repo_url = isset($_POST['repo_url']) ? trim($_POST['repo_url']) : '';
        $sort_order = isset($_POST['sort_order']) ? (int)$_POST['sort_order'] : 0;

        // Validar dados obrigatórios
        if (empty($title) || empty($description) || empty($tags)) {
            header('HTTP/1.1 400 Bad Request');
            echo json_encode(['success' => false, 'message' => 'Título, Descrição e Tags são obrigatórios.'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        // Buscar a imagem atual se for uma atualização
        $image_url = null;
        if ($id) {
            $imgStmt = $db->prepare('SELECT image_url FROM projects WHERE id = :id LIMIT 1');
            $imgStmt->execute([':id' => $id]);
            $currentProj = $imgStmt->fetch();
            if ($currentProj) {
                $image_url = $currentProj['image_url'];
            }
        }

        // Fallback de URL de texto se passado e não houver um novo ficheiro
        if (isset($_POST['image_url']) && !empty($_POST['image_url'])) {
            $image_url = trim($_POST['image_url']);
        }

        // -------------------------------------------------------------
        // PROCESSAMENTO DE UPLOAD SEGURO DE IMAGEM DO PROJETO
        // -------------------------------------------------------------
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $imageFile = $_FILES['image'];

            // 1. Validar tamanho (Máximo 5MB)
            if ($imageFile['size'] > 5 * 1024 * 1024) {
                throw new \Exception('O tamanho da imagem do projeto não deve exceder 5MB.');
            }

            // 2. Validar tipo Mime real usando finfo
            $finfo = new \finfo(FILEINFO_MIME_TYPE);
            $mimeType = $finfo->file($imageFile['tmp_name']);
            $allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

            if (!in_array($mimeType, $allowedMimes)) {
                throw new \Exception('Formato de imagem inválido. Apenas JPG, PNG, WEBP e GIF são permitidos.');
            }

            // 3. Determinar a extensão segura com base no MIME (Evita RCE)
            $mimeToExt = [
                'image/jpeg' => 'jpg',
                'image/png'  => 'png',
                'image/webp' => 'webp',
                'image/gif'  => 'gif'
            ];
            $ext = $mimeToExt[$mimeType] ?? 'jpg';
            $newImageName = 'project_' . bin2hex(random_bytes(8)) . '.' . $ext;

            $uploadDir = dirname(__DIR__) . '/uploads/projects/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }

            $destPath = $uploadDir . $newImageName;

            // 4. Eliminar a imagem antiga local do disco se existir
            if ($image_url && strpos($image_url, '/backend/uploads/') === 0) {
                $oldPath = dirname(__DIR__) . str_replace('/backend', '', $image_url);
                if (file_exists($oldPath)) {
                    @unlink($oldPath);
                }
            }

            // 5. Mover o ficheiro temporário para o destino final no disco
            if (!move_uploaded_file($imageFile['tmp_name'], $destPath)) {
                throw new \Exception('Falha ao guardar a imagem do projeto no servidor.');
            }

            // Guardar caminho relativo na base de dados (Leve e rápido)
            $image_url = '/backend/uploads/projects/' . $newImageName;
        }

        // -------------------------------------------------------------
        // PERSISTÊNCIA NA BASE DE DADOS (INSERIR OU ATUALIZAR)
        // -------------------------------------------------------------
        if ($id) {
            // Atualizar
            $stmt = $db->prepare('UPDATE projects SET title = :title, title_en = :title_en, description = :description, description_en = :description_en, image_url = :image_url, tags = :tags, demo_url = :demo_url, repo_url = :repo_url, sort_order = :sort_order WHERE id = :id');
            $stmt->execute([
                ':title' => $title,
                ':title_en' => $title_en,
                ':description' => $description,
                ':description_en' => $description_en,
                ':image_url' => $image_url,
                ':tags' => $tags,
                ':demo_url' => $demo_url,
                ':repo_url' => $repo_url,
                ':sort_order' => $sort_order,
                ':id' => $id
            ]);
            $message = 'Projeto atualizado com sucesso!';
        } else {
            // Criar
            $stmt = $db->prepare('INSERT INTO projects (title, title_en, description, description_en, image_url, tags, demo_url, repo_url, sort_order) VALUES (:title, :title_en, :description, :description_en, :image_url, :tags, :demo_url, :repo_url, :sort_order)');
            $stmt->execute([
                ':title' => $title,
                ':title_en' => $title_en,
                ':description' => $description,
                ':description_en' => $description_en,
                ':image_url' => $image_url,
                ':tags' => $tags,
                ':demo_url' => $demo_url,
                ':repo_url' => $repo_url,
                ':sort_order' => $sort_order
            ]);
            $message = 'Projeto criado com sucesso!';
        }

        // Determinar o identificador final do projeto (seja uma atualização ou recém-criado)
        $projectId = $id ?: $db->lastInsertId();

        // -------------------------------------------------------------
        // PROCESSAMENTO DE UPLOAD SEGURO DE IMAGENS ADICIONAIS (GALERIA)
        // -------------------------------------------------------------
        if (isset($_FILES['images'])) {
            $files = $_FILES['images'];
            // Verificar se o upload múltiplo veio estruturado como um array de ficheiros
            $numFiles = is_array($files['name']) ? count($files['name']) : 0;

            for ($i = 0; $i < $numFiles; $i++) {
                // Verificar se o ficheiro individual foi carregado com sucesso
                if ($files['error'][$i] === UPLOAD_ERR_OK) {
                    // 1. Validar tamanho individual (Máximo 5MB por imagem adicional)
                    if ($files['size'][$i] > 5 * 1024 * 1024) {
                        continue; // Ignora e passa ao ficheiro seguinte
                    }

                    // 2. Validar tipo Mime real utilizando finfo
                    $finfo = new \finfo(FILEINFO_MIME_TYPE);
                    $mimeType = $finfo->file($files['tmp_name'][$i]);
                    $allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

                    if (!in_array($mimeType, $allowedMimes)) {
                        continue; // Formato não suportado, passa à próxima
                    }

                    // 3. Determinar a extensão segura com base no MIME (Evita RCE)
                    $mimeToExt = [
                        'image/jpeg' => 'jpg',
                        'image/png'  => 'png',
                        'image/webp' => 'webp',
                        'image/gif'  => 'gif'
                    ];
                    $ext = $mimeToExt[$mimeType] ?? 'jpg';
                    $newImageName = 'project_add_' . bin2hex(random_bytes(8)) . '.' . $ext;

                    $uploadDir = dirname(__DIR__) . '/uploads/projects/';
                    if (!is_dir($uploadDir)) {
                        mkdir($uploadDir, 0755, true);
                    }

                    $destPath = $uploadDir . $newImageName;

                    // 4. Mover o ficheiro físico da pasta temporária para a pasta do portfólio
                    if (move_uploaded_file($files['tmp_name'][$i], $destPath)) {
                        $addUrl = '/backend/uploads/projects/' . $newImageName;
                        // Registar o caminho no banco de dados
                        $insImg = $db->prepare('INSERT INTO project_images (project_id, image_url) VALUES (:project_id, :image_url)');
                        $insImg->execute([
                            ':project_id' => $projectId,
                            ':image_url' => $addUrl
                        ]);
                    }
                }
            }
        }

        echo json_encode([
            'success' => true,
            'message' => $message,
            'image_url' => $image_url
        ], JSON_UNESCAPED_UNICODE);
        exit;

    } catch (\Exception $e) {
        header('HTTP/1.1 400 Bad Request');
        echo json_encode(['success' => false, 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// =====================================================================
// OPERAÇÃO DELETE: Eliminar Projeto ou imagem específica da galeria
// =====================================================================
if ($requestMethod === 'DELETE') {
    try {
        $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
        $imageId = isset($_GET['image_id']) ? (int)$_GET['image_id'] : null;

        // -------------------------------------------------------------
        // CASO DE ELIMINAÇÃO DE IMAGEM DA GALERIA DE SUPORTE
        // -------------------------------------------------------------
        if ($imageId) {
            // Obter dados da imagem para remoção física e lógica
            $stmt = $db->prepare('SELECT image_url FROM project_images WHERE id = :id LIMIT 1');
            $stmt->execute([':id' => $imageId]);
            $img = $stmt->fetch();

            if ($img) {
                // Eliminar ficheiro físico do disco no servidor
                if ($img['image_url'] && strpos($img['image_url'], '/backend/uploads/') === 0) {
                    $imagePath = dirname(__DIR__) . str_replace('/backend', '', $img['image_url']);
                    if (file_exists($imagePath)) {
                        @unlink($imagePath);
                    }
                }

                // Eliminar registo na tabela de imagens
                $deleteStmt = $db->prepare('DELETE FROM project_images WHERE id = :id');
                $deleteStmt->execute([':id' => $imageId]);

                echo json_encode(['success' => true, 'message' => 'Imagem eliminada com sucesso da galeria!'], JSON_UNESCAPED_UNICODE);
            } else {
                header('HTTP/1.1 404 Not Found');
                echo json_encode(['success' => false, 'message' => 'Imagem não encontrada na galeria.'], JSON_UNESCAPED_UNICODE);
            }
            exit;
        }

        // -------------------------------------------------------------
        // CASO DE ELIMINAÇÃO COMPLETA DO PROJETO E FOTOS ASSOCIADAS
        // -------------------------------------------------------------
        if (!$id) {
            header('HTTP/1.1 400 Bad Request');
            echo json_encode(['success' => false, 'message' => 'ID do projeto ou imagem em falta.'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        // Buscar dados do projeto para obter o caminho da imagem de capa
        $stmt = $db->prepare('SELECT image_url FROM projects WHERE id = :id LIMIT 1');
        $stmt->execute([':id' => $id]);
        $project = $stmt->fetch();

        if ($project) {
            // 1. Eliminar imagens adicionais físicas da galeria no disco
            $addImgsStmt = $db->prepare('SELECT image_url FROM project_images WHERE project_id = :project_id');
            $addImgsStmt->execute([':project_id' => $id]);
            $addImages = $addImgsStmt->fetchAll();

            foreach ($addImages as $addImg) {
                if ($addImg['image_url'] && strpos($addImg['image_url'], '/backend/uploads/') === 0) {
                    $imgPath = dirname(__DIR__) . str_replace('/backend', '', $addImg['image_url']);
                    if (file_exists($imgPath)) {
                        @unlink($imgPath);
                    }
                }
            }

            // 2. Eliminar imagem de capa física local do disco no servidor
            if ($project['image_url'] && strpos($project['image_url'], '/backend/uploads/') === 0) {
                $imagePath = dirname(__DIR__) . str_replace('/backend', '', $project['image_url']);
                if (file_exists($imagePath)) {
                    @unlink($imagePath);
                }
            }

            // 3. Eliminar o registo do projeto da base de dados (Galeria DB limpa em CASCADE)
            $deleteStmt = $db->prepare('DELETE FROM projects WHERE id = :id');
            $deleteStmt->execute([':id' => $id]);

            echo json_encode(['success' => true, 'message' => 'Projeto e todas as respetivas fotos eliminados com sucesso!'], JSON_UNESCAPED_UNICODE);
        } else {
            header('HTTP/1.1 404 Not Found');
            echo json_encode(['success' => false, 'message' => 'Projeto não encontrado.'], JSON_UNESCAPED_UNICODE);
        }
        exit;
    } catch (\Exception $e) {
        error_log("Erro ao eliminar projeto: " . $e->getMessage());
        header('HTTP/1.1 500 Internal Server Error');
        echo json_encode(['success' => false, 'message' => 'Ocorreu um erro interno ao tentar eliminar o projeto ou imagem.'], JSON_UNESCAPED_UNICODE);
        exit;
    }
}
?>
