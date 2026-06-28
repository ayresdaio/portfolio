<?php
/**
 * =====================================================================
 * ENDPOINT GESTÃO DE EXPERIÊNCIAS (CRUD / LINHA TEMPORAL)
 * =====================================================================
 * Rota: GET/POST/DELETE /backend/api/experience
 * Acesso: Restrito a Administrador (Com sessão ativa)
 * Suporta o historial profissional e académico para renderizar na timeline.
 */

// 1. Inicializar configurações e base de dados
define('SECURE_ACCESS', true);
require_once dirname(__DIR__) . '/includes/config.php';
require_once dirname(__DIR__) . '/includes/db.php';

use Includes\Database;

// 2. Proteger rota: Validar sessão do administrador
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
// OPERAÇÃO GET: Retornar lista de experiências
// =====================================================================
if ($requestMethod === 'GET') {
    try {
        $stmt = $db->query('SELECT * FROM experiences ORDER BY sort_order ASC, id DESC');
        $experiences = $stmt->fetchAll();
        echo json_encode(['success' => true, 'experiences' => $experiences], JSON_UNESCAPED_UNICODE);
        exit;
    } catch (\Exception $e) {
        error_log("Erro ao obter experiências: " . $e->getMessage());
        header('HTTP/1.1 500 Internal Server Error');
        echo json_encode(['success' => false, 'message' => 'Erro interno ao obter historial.'], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// =====================================================================
// OPERAÇÃO POST: Criar ou Editar Experiência (Trata multipart/form-data)
// =====================================================================
if ($requestMethod === 'POST') {
    try {
        $id = isset($_POST['id']) && !empty($_POST['id']) ? (int)$_POST['id'] : null;
        $role = isset($_POST['role']) ? trim(strip_tags($_POST['role'])) : '';
        $role_en = isset($_POST['role_en']) ? trim(strip_tags($_POST['role_en'])) : '';
        $company = isset($_POST['company']) ? trim(strip_tags($_POST['company'])) : '';
        $company_en = isset($_POST['company_en']) ? trim(strip_tags($_POST['company_en'])) : '';
        $duration = isset($_POST['duration']) ? trim(strip_tags($_POST['duration'])) : '';
        $duration_en = isset($_POST['duration_en']) ? trim(strip_tags($_POST['duration_en'])) : '';
        $location = isset($_POST['location']) ? trim(strip_tags($_POST['location'])) : '';
        $location_en = isset($_POST['location_en']) ? trim(strip_tags($_POST['location_en'])) : '';
        $description = isset($_POST['description']) ? trim($_POST['description']) : ''; // Preservar as tags HTML do editor de texto rico TinyMCE
        $description_en = isset($_POST['description_en']) ? trim($_POST['description_en']) : ''; // Preservar as tags HTML do editor de texto rico TinyMCE
        $sort_order = isset($_POST['sort_order']) ? (int)$_POST['sort_order'] : 0;

        // Validar dados obrigatórios
        if (empty($role) || empty($company) || empty($duration) || empty($description)) {
            header('HTTP/1.1 400 Bad Request');
            echo json_encode(['success' => false, 'message' => 'Cargo/Título, Empresa/Instituição, Duração e Descrição são obrigatórios.'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        // Buscar imagem antiga se for edição
        $image_url = null;
        if ($id) {
            $imgStmt = $db->prepare('SELECT image_url FROM experiences WHERE id = :id LIMIT 1');
            $imgStmt->execute([':id' => $id]);
            $currentExp = $imgStmt->fetch();
            if ($currentExp) {
                $image_url = $currentExp['image_url'];
            }
        }

        // -------------------------------------------------------------
        // PROCESSAMENTO DE UPLOAD DE IMAGEM DA EMPRESA / EXPERIÊNCIA
        // -------------------------------------------------------------
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $imageFile = $_FILES['image'];

            // Validar tamanho (Máximo 5MB)
            if ($imageFile['size'] > 5 * 1024 * 1024) {
                throw new \Exception('O tamanho do logótipo da empresa não deve exceder 5MB.');
            }

            // Validar tipo Mime real
            $finfo = new \finfo(FILEINFO_MIME_TYPE);
            $mimeType = $finfo->file($imageFile['tmp_name']);
            $allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

            if (!in_array($mimeType, $allowedMimes)) {
                throw new \Exception('Formato de imagem inválido. Apenas JPG, PNG, WEBP e GIF são permitidos.');
            }

            // Gerar nome único seguro derivado do MIME
            $mimeToExt = [
                'image/jpeg' => 'jpg',
                'image/png'  => 'png',
                'image/webp' => 'webp',
                'image/gif'  => 'gif'
            ];
            $ext = $mimeToExt[$mimeType] ?? 'jpg';
            $newImageName = 'experience_' . bin2hex(random_bytes(8)) . '.' . $ext;

            $uploadDir = dirname(__DIR__) . '/uploads/experiences/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }

            $destPath = $uploadDir . $newImageName;

            // Eliminar imagem antiga se existir
            if ($image_url) {
                $oldPath = dirname(__DIR__) . str_replace('/backend', '', $image_url);
                if (file_exists($oldPath)) {
                    @unlink($oldPath);
                }
            }

            if (!move_uploaded_file($imageFile['tmp_name'], $destPath)) {
                throw new \Exception('Falha ao guardar a imagem da empresa no servidor.');
            }

            $image_url = '/backend/uploads/experiences/' . $newImageName;
        }

        if ($id) {
            // Atualizar
            $stmt = $db->prepare('UPDATE experiences SET role = :role, role_en = :role_en, company = :company, company_en = :company_en, duration = :duration, duration_en = :duration_en, location = :location, location_en = :location_en, description = :description, description_en = :description_en, image_url = :image_url, sort_order = :sort_order WHERE id = :id');
            $stmt->execute([
                ':role' => $role,
                ':role_en' => $role_en,
                ':company' => $company,
                ':company_en' => $company_en,
                ':duration' => $duration,
                ':duration_en' => $duration_en,
                ':location' => $location,
                ':location_en' => $location_en,
                ':description' => $description,
                ':description_en' => $description_en,
                ':image_url' => $image_url,
                ':sort_order' => $sort_order,
                ':id' => $id
            ]);
            $msg = 'Experiência profissional atualizada com sucesso!';
        } else {
            // Criar
            $stmt = $db->prepare('INSERT INTO experiences (role, role_en, company, company_en, duration, duration_en, location, location_en, description, description_en, image_url, sort_order) VALUES (:role, :role_en, :company, :company_en, :duration, :duration_en, :location, :location_en, :description, :description_en, :image_url, :sort_order)');
            $stmt->execute([
                ':role' => $role,
                ':role_en' => $role_en,
                ':company' => $company,
                ':company_en' => $company_en,
                ':duration' => $duration,
                ':duration_en' => $duration_en,
                ':location' => $location,
                ':location_en' => $location_en,
                ':description' => $description,
                ':description_en' => $description_en,
                ':image_url' => $image_url,
                ':sort_order' => $sort_order
            ]);
            $msg = 'Experiência profissional criada com sucesso!';
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
// OPERAÇÃO DELETE: Eliminar Experiência e respetiva imagem do disco
// =====================================================================
if ($requestMethod === 'DELETE') {
    try {
        $id = isset($_GET['id']) ? (int)$_GET['id'] : null;

        if (!$id) {
            header('HTTP/1.1 400 Bad Request');
            echo json_encode(['success' => false, 'message' => 'ID da experiência em falta.'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        // Buscar dados para obter o caminho da imagem e apagá-la do disco
        $stmt = $db->prepare('SELECT image_url FROM experiences WHERE id = :id LIMIT 1');
        $stmt->execute([':id' => $id]);
        $experience = $stmt->fetch();

        if ($experience) {
            if ($experience['image_url']) {
                $imagePath = dirname(__DIR__) . str_replace('/backend', '', $experience['image_url']);
                if (file_exists($imagePath)) {
                    @unlink($imagePath);
                }
            }

            // Eliminar o registo da base de dados
            $deleteStmt = $db->prepare('DELETE FROM experiences WHERE id = :id');
            $deleteStmt->execute([':id' => $id]);

            echo json_encode(['success' => true, 'message' => 'Experiência eliminada com sucesso!'], JSON_UNESCAPED_UNICODE);
        } else {
            header('HTTP/1.1 404 Not Found');
            echo json_encode(['success' => false, 'message' => 'Experiência não encontrada.'], JSON_UNESCAPED_UNICODE);
        }
        exit;
    } catch (\Exception $e) {
        error_log("Erro ao eliminar experiência: " . $e->getMessage());
        header('HTTP/1.1 500 Internal Server Error');
        echo json_encode(['success' => false, 'message' => 'Erro interno ao tentar eliminar experiência.'], JSON_UNESCAPED_UNICODE);
        exit;
    }
}
