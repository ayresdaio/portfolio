<?php
/**
 * =====================================================================
 * ENDPOINT GESTÃO DE FORMAÇÃO ACADÉMICA (CRUD / EDUCAÇÃO)
 * =====================================================================
 * Rota: GET/POST/DELETE /backend/api/education
 * Acesso: Restrito a Administrador (Com sessão ativa)
 * Suporta o CRUD completo do historial académico para o painel admin.
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
// OPERAÇÃO GET: Retornar lista de formação académica
// =====================================================================
if ($requestMethod === 'GET') {
    try {
        $stmt = $db->query('SELECT * FROM education ORDER BY sort_order ASC, id DESC');
        $educationList = $stmt->fetchAll();
        echo json_encode(['success' => true, 'education' => $educationList], JSON_UNESCAPED_UNICODE);
        exit;
    } catch (\Exception $e) {
        error_log("Erro ao obter educação académica: " . $e->getMessage());
        header('HTTP/1.1 500 Internal Server Error');
        echo json_encode(['success' => false, 'message' => 'Erro interno ao obter historial académico.'], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// =====================================================================
// OPERAÇÃO POST: Criar ou Editar Registo Académico (Multipart FormData)
// =====================================================================
if ($requestMethod === 'POST') {
    try {
        $id = isset($_POST['id']) && !empty($_POST['id']) ? (int)$_POST['id'] : null;
        $degree = isset($_POST['degree']) ? trim(strip_tags($_POST['degree'])) : '';
        $degree_en = isset($_POST['degree_en']) ? trim(strip_tags($_POST['degree_en'])) : '';
        $institution = isset($_POST['institution']) ? trim(strip_tags($_POST['institution'])) : '';
        $institution_en = isset($_POST['institution_en']) ? trim(strip_tags($_POST['institution_en'])) : '';
        $duration = isset($_POST['duration']) ? trim(strip_tags($_POST['duration'])) : '';
        $duration_en = isset($_POST['duration_en']) ? trim(strip_tags($_POST['duration_en'])) : '';
        $location = isset($_POST['location']) ? trim(strip_tags($_POST['location'])) : '';
        $location_en = isset($_POST['location_en']) ? trim(strip_tags($_POST['location_en'])) : '';
        $education_type = isset($_POST['education_type']) ? trim(strip_tags($_POST['education_type'])) : '';
        $education_type_en = isset($_POST['education_type_en']) ? trim(strip_tags($_POST['education_type_en'])) : '';
        $link_url = isset($_POST['link_url']) ? trim(strip_tags($_POST['link_url'])) : '';
        $description = isset($_POST['description']) ? trim($_POST['description']) : ''; // Preservar as tags HTML do editor de texto rico TinyMCE
        $description_en = isset($_POST['description_en']) ? trim($_POST['description_en']) : ''; // Preservar as tags HTML do editor de texto rico TinyMCE
        $sort_order = isset($_POST['sort_order']) ? (int)$_POST['sort_order'] : 0;

        // Validar dados obrigatórios
        if (empty($degree) || empty($institution) || empty($duration) || empty($description)) {
            header('HTTP/1.1 400 Bad Request');
            echo json_encode(['success' => false, 'message' => 'Curso/Grau, Escola/Instituição, Duração e Descrição são obrigatórios.'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        // Buscar imagem antiga se for edição
        $image_url = null;
        if ($id) {
            $imgStmt = $db->prepare('SELECT image_url FROM education WHERE id = :id LIMIT 1');
            $imgStmt->execute([':id' => $id]);
            $currentEdu = $imgStmt->fetch();
            if ($currentEdu) {
                $image_url = $currentEdu['image_url'];
            }
        }

        // -------------------------------------------------------------
        // PROCESSAMENTO DE UPLOAD DE LOGÓTIPO DA ESCOLA / UNIVERSIDADE
        // -------------------------------------------------------------
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $imageFile = $_FILES['image'];

            // Validar tamanho (Máximo 5MB)
            if ($imageFile['size'] > 5 * 1024 * 1024) {
                throw new \Exception('O tamanho do logótipo ou certificado não deve exceder 5MB.');
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
            $newImageName = 'education_' . bin2hex(random_bytes(8)) . '.' . $ext;

            $uploadDir = dirname(__DIR__) . '/uploads/education/';
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
                throw new \Exception('Falha ao guardar o logótipo da escola no servidor.');
            }

            $image_url = '/backend/uploads/education/' . $newImageName;
        }

        if ($id) {
            // Atualizar registo existente
            $stmt = $db->prepare('UPDATE education SET degree = :degree, degree_en = :degree_en, institution = :institution, institution_en = :institution_en, duration = :duration, duration_en = :duration_en, location = :location, location_en = :location_en, education_type = :education_type, education_type_en = :education_type_en, description = :description, description_en = :description_en, image_url = :image_url, link_url = :link_url, sort_order = :sort_order WHERE id = :id');
            $stmt->execute([
                ':degree' => $degree,
                ':degree_en' => $degree_en,
                ':institution' => $institution,
                ':institution_en' => $institution_en,
                ':duration' => $duration,
                ':duration_en' => $duration_en,
                ':location' => $location,
                ':location_en' => $location_en,
                ':education_type' => $education_type,
                ':education_type_en' => $education_type_en,
                ':description' => $description,
                ':description_en' => $description_en,
                ':image_url' => $image_url,
                ':link_url' => $link_url,
                ':sort_order' => $sort_order,
                ':id' => $id
            ]);
            $msg = 'Formação académica atualizada com sucesso!';
        } else {
            // Criar novo registo
            $stmt = $db->prepare('INSERT INTO education (degree, degree_en, institution, institution_en, duration, duration_en, location, location_en, education_type, education_type_en, description, description_en, image_url, link_url, sort_order) VALUES (:degree, :degree_en, :institution, :institution_en, :duration, :duration_en, :location, :location_en, :education_type, :education_type_en, :description, :description_en, :image_url, :link_url, :sort_order)');
            $stmt->execute([
                ':degree' => $degree,
                ':degree_en' => $degree_en,
                ':institution' => $institution,
                ':institution_en' => $institution_en,
                ':duration' => $duration,
                ':duration_en' => $duration_en,
                ':location' => $location,
                ':location_en' => $location_en,
                ':education_type' => $education_type,
                ':education_type_en' => $education_type_en,
                ':description' => $description,
                ':description_en' => $description_en,
                ':image_url' => $image_url,
                ':link_url' => $link_url,
                ':sort_order' => $sort_order
            ]);
            $msg = 'Formação académica registada com sucesso!';
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
// OPERAÇÃO DELETE: Eliminar Formação Académica e respetiva imagem
// =====================================================================
if ($requestMethod === 'DELETE') {
    try {
        $id = isset($_GET['id']) ? (int)$_GET['id'] : null;

        if (!$id) {
            header('HTTP/1.1 400 Bad Request');
            echo json_encode(['success' => false, 'message' => 'ID de registo académico em falta.'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        // Buscar dados para obter o caminho da imagem e apagá-la do disco
        $stmt = $db->prepare('SELECT image_url FROM education WHERE id = :id LIMIT 1');
        $stmt->execute([':id' => $id]);
        $education = $stmt->fetch();

        if ($education) {
            if ($education['image_url']) {
                $imagePath = dirname(__DIR__) . str_replace('/backend', '', $education['image_url']);
                if (file_exists($imagePath)) {
                    @unlink($imagePath);
                }
            }

            // Eliminar o registo da base de dados
            $deleteStmt = $db->prepare('DELETE FROM education WHERE id = :id');
            $deleteStmt->execute([':id' => $id]);

            echo json_encode(['success' => true, 'message' => 'Formação académica eliminada com sucesso!'], JSON_UNESCAPED_UNICODE);
        } else {
            header('HTTP/1.1 404 Not Found');
            echo json_encode(['success' => false, 'message' => 'Registo académico não encontrado.'], JSON_UNESCAPED_UNICODE);
        }
        exit;
    } catch (\Exception $e) {
        error_log("Erro ao eliminar educação: " . $e->getMessage());
        header('HTTP/1.1 500 Internal Server Error');
        echo json_encode(['success' => false, 'message' => 'Erro interno ao tentar eliminar formação académica.'], JSON_UNESCAPED_UNICODE);
        exit;
    }
}
