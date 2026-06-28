<?php
/**
 * =====================================================================
 * ENDPOINT GESTÃO DE HOBBIES E PASSATEMPOS (CRUD / API PRIVADA E PÚBLICA)
 * =====================================================================
 * Rota: GET/POST/DELETE /backend/api/hobbies
 * Acesso:
 *   - GET (Público): Lista todos os hobbies ordenados por sort_order.
 *   - POST/DELETE (Admin): CRUD restrito com sessão administrativa ativa.
 */

// 1. Inicializar configurações e ligação à base de dados
define('SECURE_ACCESS', true);
require_once dirname(__DIR__) . '/includes/config.php';
require_once dirname(__DIR__) . '/includes/db.php';

use Includes\Database;

$db = Database::getConnection();
$requestMethod = $_SERVER['REQUEST_METHOD'];

// Verificar se o administrador está devidamente autenticado
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

// =====================================================================
// OPERAÇÃO GET: Retornar lista de hobbies (Público)
// =====================================================================
if ($requestMethod === 'GET') {
    try {
        $lang = isset($_GET['lang']) ? trim(strtolower($_GET['lang'])) : 'pt';
        $stmt = $db->query('SELECT * FROM hobbies ORDER BY sort_order ASC, id ASC');
        $hobbies = $stmt->fetchAll();

        // Aplicar a lógica de fusão bilingue com fallback para português
        if ($lang === 'en') {
            foreach ($hobbies as &$hobby) {
                if (isset($hobby['name_en']) && !empty($hobby['name_en'])) {
                    $hobby['name'] = $hobby['name_en'];
                }
                if (isset($hobby['description_en']) && !empty($hobby['description_en'])) {
                    $hobby['description'] = $hobby['description_en'];
                }
            }
            unset($hobby);
        }

        echo json_encode(['success' => true, 'hobbies' => $hobbies], JSON_UNESCAPED_UNICODE);
        exit;
    } catch (\Exception $e) {
        error_log("Erro ao obter hobbies: " . $e->getMessage());
        header('HTTP/1.1 500 Internal Server Error');
        echo json_encode(['success' => false, 'message' => 'Erro interno ao carregar passatempos.'], JSON_UNESCAPED_UNICODE);
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
// OPERAÇÃO POST: Criar ou Editar Hobby (Com suporte a upload de imagem)
// =====================================================================
if ($requestMethod === 'POST') {
    try {
        $id = isset($_POST['id']) && !empty($_POST['id']) ? (int)$_POST['id'] : null;
        $name = isset($_POST['name']) ? trim(strip_tags($_POST['name'])) : '';
        $name_en = isset($_POST['name_en']) ? trim(strip_tags($_POST['name_en'])) : '';
        $description = isset($_POST['description']) ? trim($_POST['description']) : ''; // Preservar a formatação caso seja introduzido texto rico
        $description_en = isset($_POST['description_en']) ? trim($_POST['description_en']) : ''; // Preservar a formatação caso seja introduzido texto rico
        $icon = isset($_POST['icon']) ? trim(strip_tags($_POST['icon'])) : 'Heart';
        $sort_order = isset($_POST['sort_order']) ? (int)$_POST['sort_order'] : 0;
        $image_url = isset($_POST['image_url']) ? trim(strip_tags($_POST['image_url'])) : null;

        // Validar dados obrigatórios
        if (empty($name) || empty($description)) {
            header('HTTP/1.1 400 Bad Request');
            echo json_encode(['success' => false, 'message' => 'O nome do passatempo e a descrição são obrigatórios.'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        // Se for edição, procurar imagem antiga
        if ($id) {
            $imgStmt = $db->prepare('SELECT image_url FROM hobbies WHERE id = :id LIMIT 1');
            $imgStmt->execute([':id' => $id]);
            $currentHobby = $imgStmt->fetch();
            if ($currentHobby && empty($image_url)) {
                $image_url = $currentHobby['image_url'];
            }
        }

        // -------------------------------------------------------------
        // PROCESSAMENTO DE UPLOAD DA IMAGEM DO HOBBY (OPCIONAL)
        // -------------------------------------------------------------
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $imageFile = $_FILES['image'];

            // Limite de 5MB
            if ($imageFile['size'] > 5 * 1024 * 1024) {
                throw new \Exception('A imagem do passatempo não deve exceder 5MB.');
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
            $newImageName = 'hobby_' . bin2hex(random_bytes(8)) . '.' . $ext;

            $uploadDir = dirname(__DIR__) . '/uploads/hobbies/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }

            $destPath = $uploadDir . $newImageName;

            // Apagar imagem antiga física se existia
            if ($image_url && strpos($image_url, '/backend/uploads/') !== false) {
                $oldPath = dirname(__DIR__) . str_replace('/backend', '', $image_url);
                if (file_exists($oldPath)) {
                    @unlink($oldPath);
                }
            }

            if (!move_uploaded_file($imageFile['tmp_name'], $destPath)) {
                throw new \Exception('Erro ao salvar a imagem do passatempo no servidor.');
            }

            $image_url = '/backend/uploads/hobbies/' . $newImageName;
        }

        if ($id) {
            // Atualizar
            $stmt = $db->prepare('UPDATE hobbies SET name = :name, name_en = :name_en, description = :description, description_en = :description_en, icon = :icon, image_url = :image_url, sort_order = :sort_order WHERE id = :id');
            $stmt->execute([
                ':name' => $name,
                ':name_en' => $name_en,
                ':description' => $description,
                ':description_en' => $description_en,
                ':icon' => $icon,
                ':image_url' => $image_url,
                ':sort_order' => $sort_order,
                ':id' => $id
            ]);
            $msg = 'Passatempo atualizado com sucesso!';
        } else {
            // Criar
            $stmt = $db->prepare('INSERT INTO hobbies (name, name_en, description, description_en, icon, image_url, sort_order) VALUES (:name, :name_en, :description, :description_en, :icon, :image_url, :sort_order)');
            $stmt->execute([
                ':name' => $name,
                ':name_en' => $name_en,
                ':description' => $description,
                ':description_en' => $description_en,
                ':icon' => $icon,
                ':image_url' => $image_url,
                ':sort_order' => $sort_order
            ]);
            $msg = 'Passatempo criado com sucesso!';
        }

        echo json_encode([
            'success' => true,
            'message' => $msg,
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
// OPERAÇÃO DELETE: Eliminar Hobby
// =====================================================================
if ($requestMethod === 'DELETE') {
    try {
        $id = isset($_GET['id']) ? (int)$_GET['id'] : null;

        if (!$id) {
            header('HTTP/1.1 400 Bad Request');
            echo json_encode(['success' => false, 'message' => 'ID do passatempo em falta.'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $stmt = $db->prepare('SELECT image_url FROM hobbies WHERE id = :id LIMIT 1');
        $stmt->execute([':id' => $id]);
        $hobby = $stmt->fetch();

        if ($hobby) {
            // Apagar imagem física se existia
            if ($hobby['image_url'] && strpos($hobby['image_url'], '/backend/uploads/') !== false) {
                $imagePath = dirname(__DIR__) . str_replace('/backend', '', $hobby['image_url']);
                if (file_exists($imagePath)) {
                    @unlink($imagePath);
                }
            }

            $deleteStmt = $db->prepare('DELETE FROM hobbies WHERE id = :id');
            $deleteStmt->execute([':id' => $id]);

            echo json_encode(['success' => true, 'message' => 'Passatempo eliminado com sucesso!'], JSON_UNESCAPED_UNICODE);
        } else {
            header('HTTP/1.1 404 Not Found');
            echo json_encode(['success' => false, 'message' => 'Passatempo não encontrado no servidor.'], JSON_UNESCAPED_UNICODE);
        }
        exit;

    } catch (\Exception $e) {
        error_log("Erro ao eliminar passatempo: " . $e->getMessage());
        header('HTTP/1.1 500 Internal Server Error');
        echo json_encode(['success' => false, 'message' => 'Erro interno ao eliminar passatempo.'], JSON_UNESCAPED_UNICODE);
        exit;
    }
}
