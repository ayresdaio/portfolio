<?php
/**
 * =====================================================================
 * ENDPOINT GESTÃO DE IMAGENS DO SOBRE MIM (CRUD / API PRIVADA E PÚBLICA)
 * =====================================================================
 * Rota: GET/POST/DELETE /backend/api/about_images.php
 * Acesso:
 *   - GET (Público): Lista todas as imagens ordenadas por sort_order.
 *   - POST/DELETE (Admin): CRUD com sessão administrativa ativa.
 */

// 1. Inicializar configurações e ligação à base de dados
define('SECURE_ACCESS', true);
require_once dirname(__DIR__) . '/includes/config.php';
require_once dirname(__DIR__) . '/includes/db.php';

use Includes\Database;

$db = Database::getConnection();
$requestMethod = $_SERVER['REQUEST_METHOD'];

// Verificar se o administrador está autenticado
$isAdmin = isset($_SESSION['admin_logged']) && $_SESSION['admin_logged'] === true;

if ($isAdmin) {
    $timeout_duration = 7200;
    if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] > $timeout_duration)) {
        session_unset();
        session_destroy();
        $isAdmin = false;
    } else {
        $_SESSION['last_activity'] = time();
    }
}

header('Content-Type: application/json; charset=utf-8');

// =====================================================================
// OPERAÇÃO GET: Retornar lista de imagens (Público)
// =====================================================================
if ($requestMethod === 'GET') {
    try {
        $stmt = $db->query('SELECT * FROM about_images ORDER BY sort_order ASC, id ASC');
        $images = $stmt->fetchAll();
        echo json_encode(['success' => true, 'about_images' => $images], JSON_UNESCAPED_UNICODE);
        exit;
    } catch (\Exception $e) {
        error_log("Erro ao obter imagens do Sobre: " . $e->getMessage());
        header('HTTP/1.1 500 Internal Server Error');
        echo json_encode(['success' => false, 'message' => 'Erro interno ao carregar a galeria.'], JSON_UNESCAPED_UNICODE);
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
// OPERAÇÃO POST: Criar ou Editar Imagem (com upload)
// =====================================================================
if ($requestMethod === 'POST') {
    try {
        $id = isset($_POST['id']) && !empty($_POST['id']) ? (int)$_POST['id'] : null;
        $caption = isset($_POST['caption']) ? trim(strip_tags($_POST['caption'])) : null;
        $caption_en = isset($_POST['caption_en']) ? trim(strip_tags($_POST['caption_en'])) : null;
        $sort_order = isset($_POST['sort_order']) ? (int)$_POST['sort_order'] : 0;

        $image_url = null;

        // Se for edição, obter a imagem atual primeiro
        if ($id) {
            $stmtSelect = $db->prepare('SELECT image_url FROM about_images WHERE id = :id');
            $stmtSelect->execute([':id' => $id]);
            $currentImage = $stmtSelect->fetch();
            if ($currentImage) {
                $image_url = $currentImage['image_url'];
            } else {
                throw new \Exception('Imagem não encontrada para atualização.');
            }
        }

        // Processar upload de imagem se fornecido
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $imageFile = $_FILES['image'];
            
            // Validar tamanho (máximo 5MB)
            if ($imageFile['size'] > 5 * 1024 * 1024) {
                throw new \Exception('O tamanho da foto não deve exceder os 5MB.');
            }

            // Validar tipo MIME
            $finfo = new \finfo(FILEINFO_MIME_TYPE);
            $mimeType = $finfo->file($imageFile['tmp_name']);
            $allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
            if (!in_array($mimeType, $allowedMimes)) {
                throw new \Exception('Formato de imagem inválido. Apenas JPG, PNG, WEBP e GIF são permitidos.');
            }

            // Gerar nome seguro único com base no MIME (Evita RCE)
            $mimeToExt = [
                'image/jpeg' => 'jpg',
                'image/png'  => 'png',
                'image/webp' => 'webp',
                'image/gif'  => 'gif'
            ];
            $ext = $mimeToExt[$mimeType] ?? 'jpg';
            $newImageName = 'about_' . bin2hex(random_bytes(8)) . '.' . $ext;
            
            $uploadDir = dirname(__DIR__) . '/uploads/about/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }
            $destPath = $uploadDir . $newImageName;

            // Eliminar imagem antiga se for edição e local
            if ($id && $image_url && strpos($image_url, '/backend/uploads/') === 0) {
                $oldPath = dirname(__DIR__) . str_replace('/backend', '', $image_url);
                if (file_exists($oldPath)) {
                    @unlink($oldPath);
                }
            }

            // Mover novo ficheiro
            if (!move_uploaded_file($imageFile['tmp_name'], $destPath)) {
                throw new \Exception('Falha ao guardar o ficheiro da imagem no servidor.');
            }
            $image_url = '/backend/uploads/about/' . $newImageName;

        } elseif (!$id) {
            // Se for inserção, o envio do ficheiro de imagem é obrigatório
            throw new \Exception('O envio de um ficheiro de imagem é obrigatório.');
        }

        if ($id) {
            // Atualizar registo na base de dados
            $stmt = $db->prepare('UPDATE about_images SET image_url = :image_url, caption = :caption, caption_en = :caption_en, sort_order = :sort_order WHERE id = :id');
            $stmt->execute([
                ':image_url' => $image_url,
                ':caption' => $caption,
                ':caption_en' => $caption_en,
                ':sort_order' => $sort_order,
                ':id' => $id
            ]);
            $msg = 'Imagem da galeria atualizada com sucesso!';
        } else {
            // Inserir novo registo na base de dados
            $stmt = $db->prepare('INSERT INTO about_images (image_url, caption, caption_en, sort_order) VALUES (:image_url, :caption, :caption_en, :sort_order)');
            $stmt->execute([
                ':image_url' => $image_url,
                ':caption' => $caption,
                ':caption_en' => $caption_en,
                ':sort_order' => $sort_order
            ]);
            $id = $db->lastInsertId();
            $msg = 'Imagem adicionada à galeria com sucesso!';
        }

        echo json_encode([
            'success' => true,
            'message' => $msg,
            'id' => $id,
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
// OPERAÇÃO DELETE: Eliminar Imagem da Galeria
// =====================================================================
if ($requestMethod === 'DELETE') {
    try {
        $id = isset($_GET['id']) ? (int)$_GET['id'] : null;

        if (!$id) {
            header('HTTP/1.1 400 Bad Request');
            echo json_encode(['success' => false, 'message' => 'ID da imagem em falta.'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        // Buscar dados da imagem para obter o caminho físico e apagar o ficheiro
        $stmtSelect = $db->prepare('SELECT image_url FROM about_images WHERE id = :id');
        $stmtSelect->execute([':id' => $id]);
        $imageRecord = $stmtSelect->fetch();

        if ($imageRecord) {
            $image_url = $imageRecord['image_url'];
            
            // Eliminar ficheiro físico local do disco
            if ($image_url && strpos($image_url, '/backend/uploads/') === 0) {
                $oldPath = dirname(__DIR__) . str_replace('/backend', '', $image_url);
                if (file_exists($oldPath)) {
                    @unlink($oldPath);
                }
            }

            // Eliminar registo na base de dados
            $deleteStmt = $db->prepare('DELETE FROM about_images WHERE id = :id');
            $deleteStmt->execute([':id' => $id]);

            echo json_encode(['success' => true, 'message' => 'Imagem eliminada da galeria com sucesso!'], JSON_UNESCAPED_UNICODE);
        } else {
            header('HTTP/1.1 404 Not Found');
            echo json_encode(['success' => false, 'message' => 'Imagem não encontrada no servidor.'], JSON_UNESCAPED_UNICODE);
        }
        exit;

    } catch (\Exception $e) {
        error_log("Erro ao eliminar imagem da galeria: " . $e->getMessage());
        header('HTTP/1.1 500 Internal Server Error');
        echo json_encode(['success' => false, 'message' => 'Erro interno ao eliminar a imagem.'], JSON_UNESCAPED_UNICODE);
        exit;
    }
}
