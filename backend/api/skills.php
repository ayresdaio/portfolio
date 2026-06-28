<?php
/**
 * =====================================================================
 * ENDPOINT GESTÃO DE COMPETÊNCIAS (CRUD)
 * =====================================================================
 * Rota: GET/POST/DELETE /backend/api/skills
 * Acesso: Restrito a Administrador (Com sessão ativa)
 * Suporta listagem, criação, edição e remoção de competências técnicas.
 */

// 1. Inicializar configurações e base de dados
define('SECURE_ACCESS', true);
require_once dirname(__DIR__) . '/includes/config.php';
require_once dirname(__DIR__) . '/includes/db.php';

use Includes\Database;

// 2. Proteger a rota: Validar autenticação
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
// OPERAÇÃO GET: Retornar lista de competências
// =====================================================================
if ($requestMethod === 'GET') {
    try {
        $stmt = $db->query('SELECT * FROM skills ORDER BY category ASC, subcategory ASC, level DESC');
        $skills = $stmt->fetchAll();
        echo json_encode(['success' => true, 'skills' => $skills], JSON_UNESCAPED_UNICODE);
        exit;
    } catch (\Exception $e) {
        error_log("Erro ao obter competências: " . $e->getMessage());
        header('HTTP/1.1 500 Internal Server Error');
        echo json_encode(['success' => false, 'message' => 'Erro interno ao obter competências.'], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// =====================================================================
// OPERAÇÃO POST: Criar ou Editar Competência (Suporta JSON e multipart/form-data)
// =====================================================================
if ($requestMethod === 'POST') {
    try {
        $id = null;
        $name = '';
        $description = null;
        $description_en = null;
        $level = 0;
        $experience_time = null;
        $experience_time_en = null;
        $category = '';
        $category_en = null;
        $subcategory = null;
        $subcategory_en = null;
        $icon = '';

        // 1. Identificar o tipo de conteúdo recebido (JSON ou multipart/form-data)
        $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
        
        if (strpos($contentType, 'multipart/form-data') !== false) {
            // Leitura de parâmetros normais via POST
            $id = isset($_POST['id']) && !empty($_POST['id']) ? (int)$_POST['id'] : null;
            $name = isset($_POST['name']) ? trim(strip_tags($_POST['name'])) : '';
            $description = isset($_POST['description']) ? trim(strip_tags($_POST['description'])) : null;
            $description_en = isset($_POST['description_en']) ? trim(strip_tags($_POST['description_en'])) : null;
            $level = isset($_POST['level']) ? (int)$_POST['level'] : 0;
            $experience_time = isset($_POST['experience_time']) ? trim(strip_tags($_POST['experience_time'])) : null;
            $experience_time_en = isset($_POST['experience_time_en']) ? trim(strip_tags($_POST['experience_time_en'])) : null;
            $category = isset($_POST['category']) ? trim(strip_tags($_POST['category'])) : '';
            $category_en = isset($_POST['category_en']) ? trim(strip_tags($_POST['category_en'])) : null;
            $subcategory = isset($_POST['subcategory']) ? trim(strip_tags($_POST['subcategory'])) : null;
            $subcategory_en = isset($_POST['subcategory_en']) ? trim(strip_tags($_POST['subcategory_en'])) : null;
            // Não aplicamos strip_tags no icon para permitir código SVG inline ou URLs longas sem quebras
            $icon = isset($_POST['icon']) ? trim($_POST['icon']) : '';
        } else {
            // Fallback: Leitura tradicional de payloads puramente JSON (retrocompatibilidade)
            $inputJSON = file_get_contents('php://input');
            $input = json_decode($inputJSON, true);

            $id = isset($input['id']) && !empty($input['id']) ? (int)$input['id'] : null;
            $name = isset($input['name']) ? trim(strip_tags($input['name'])) : '';
            $description = isset($input['description']) ? trim(strip_tags($input['description'])) : null;
            $description_en = isset($input['description_en']) ? trim(strip_tags($input['description_en'])) : null;
            $level = isset($input['level']) ? (int)$input['level'] : 0;
            $experience_time = isset($input['experience_time']) ? trim(strip_tags($input['experience_time'])) : null;
            $experience_time_en = isset($input['experience_time_en']) ? trim(strip_tags($input['experience_time_en'])) : null;
            $category = isset($input['category']) ? trim(strip_tags($input['category'])) : '';
            $category_en = isset($input['category_en']) ? trim(strip_tags($input['category_en'])) : null;
            $subcategory = isset($input['subcategory']) ? trim(strip_tags($input['subcategory'])) : null;
            $subcategory_en = isset($input['subcategory_en']) ? trim(strip_tags($input['subcategory_en'])) : null;
            $icon = isset($input['icon']) ? trim($input['icon']) : '';
        }

        // 2. Validar dados obrigatórios
        if (empty($name) || empty($category)) {
            header('HTTP/1.1 400 Bad Request');
            echo json_encode(['success' => false, 'message' => 'Nome e Categoria são obrigatórios.'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        if ($level < 1 || $level > 100) {
            header('HTTP/1.1 400 Bad Request');
            echo json_encode(['success' => false, 'message' => 'O nível de proficiência deve situar-se entre 1 e 100.'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        // 3. Obter o ícone atual se for uma atualização
        $currentIcon = null;
        if ($id) {
            $stmt = $db->prepare('SELECT icon FROM skills WHERE id = :id LIMIT 1');
            $stmt->execute([':id' => $id]);
            $currentSkill = $stmt->fetch();
            if ($currentSkill) {
                $currentIcon = $currentSkill['icon'];
                // Se o input de ícone veio vazio noutros campos, mantém o existente por defeito
                if (empty($icon)) {
                    $icon = $currentIcon;
                }
            }
        }

        // -------------------------------------------------------------
        // PROCESSAMENTO DE UPLOAD SEGURO DE ÍCONE FÍSICO (SE ENVIADO)
        // -------------------------------------------------------------
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $imageFile = $_FILES['image'];

            // A. Validar tamanho máximo do ícone (2MB para evitar abuso)
            if ($imageFile['size'] > 2 * 1024 * 1024) {
                throw new \Exception('O tamanho da imagem do ícone não deve exceder 2MB.');
            }

            // B. Validar tipo Mime real utilizando finfo para máxima segurança
            $finfo = new \finfo(FILEINFO_MIME_TYPE);
            $mimeType = $finfo->file($imageFile['tmp_name']);
            $allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

            if (!in_array($mimeType, $allowedMimes)) {
                throw new \Exception('Formato de imagem inválido. Apenas JPG, PNG, WEBP, GIF e SVG são permitidos.');
            }

            // C. Determinar a extensão segura com base no MIME (Evita RCE)
            $mimeToExt = [
                'image/jpeg' => 'jpg',
                'image/png'  => 'png',
                'image/webp' => 'webp',
                'image/gif'  => 'gif',
                'image/svg+xml' => 'svg'
            ];
            $ext = $mimeToExt[$mimeType] ?? 'png';

            // D. Gerar um nome de ficheiro único e robusto para evitar colisões
            $newImageName = 'skill_' . bin2hex(random_bytes(8)) . '.' . $ext;

            // E. Garantir a existência do diretório físico de carregamento
            $uploadDir = dirname(__DIR__) . '/uploads/skills/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }

            $destPath = $uploadDir . $newImageName;

            // F. Eliminar a imagem/ícone física antiga no disco se existia e era local
            if ($currentIcon && strpos($currentIcon, '/backend/uploads/skills/') === 0) {
                $oldPath = dirname(__DIR__) . str_replace('/backend', '', $currentIcon);
                if (file_exists($oldPath)) {
                    @unlink($oldPath);
                }
            }

            // G. Mover o ficheiro temporário para o disco
            if (!move_uploaded_file($imageFile['tmp_name'], $destPath)) {
                throw new \Exception('Falha ao guardar o ícone da competência no servidor.');
            }

            // Guardar o caminho relativo para a BD (Mais leve e rápido)
            $icon = '/backend/uploads/skills/' . $newImageName;
        }

        // 4. Executar inserção ou atualização no Banco de Dados
        if ($id) {
            // Atualizar competência existente com suporte a subcategorias e tradução
            $stmt = $db->prepare('UPDATE skills SET name = :name, description = :description, description_en = :description_en, level = :level, experience_time = :experience_time, experience_time_en = :experience_time_en, category = :category, category_en = :category_en, subcategory = :subcategory, subcategory_en = :subcategory_en, icon = :icon WHERE id = :id');
            $stmt->execute([
                ':name' => $name,
                ':description' => $description,
                ':description_en' => $description_en,
                ':level' => $level,
                ':experience_time' => $experience_time,
                ':experience_time_en' => $experience_time_en,
                ':category' => $category,
                ':category_en' => $category_en,
                ':subcategory' => $subcategory,
                ':subcategory_en' => $subcategory_en,
                ':icon' => $icon,
                ':id' => $id
            ]);
            $msg = 'Competência atualizada com sucesso!';
        } else {
            // Criar nova competência com suporte a subcategorias e tradução
            $stmt = $db->prepare('INSERT INTO skills (name, description, description_en, level, experience_time, experience_time_en, category, category_en, subcategory, subcategory_en, icon) VALUES (:name, :description, :description_en, :level, :experience_time, :experience_time_en, :category, :category_en, :subcategory, :subcategory_en, :icon)');
            $stmt->execute([
                ':name' => $name,
                ':description' => $description,
                ':description_en' => $description_en,
                ':level' => $level,
                ':experience_time' => $experience_time,
                ':experience_time_en' => $experience_time_en,
                ':category' => $category,
                ':category_en' => $category_en,
                ':subcategory' => $subcategory,
                ':subcategory_en' => $subcategory_en,
                ':icon' => $icon
            ]);
            $msg = 'Competência criada com sucesso!';
        }

        echo json_encode(['success' => true, 'message' => $msg], JSON_UNESCAPED_UNICODE);
        exit;

    } catch (\Exception $e) {
        error_log("Erro ao salvar competência: " . $e->getMessage());
        header('HTTP/1.1 500 Internal Server Error');
        echo json_encode(['success' => false, 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// =====================================================================
// OPERAÇÃO DELETE: Eliminar Competência
// =====================================================================
if ($requestMethod === 'DELETE') {
    try {
        $id = isset($_GET['id']) ? (int)$_GET['id'] : null;

        if (!$id) {
            header('HTTP/1.1 400 Bad Request');
            echo json_encode(['success' => false, 'message' => 'ID da competência em falta.'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $stmt = $db->prepare('DELETE FROM skills WHERE id = :id');
        $stmt->execute([':id' => $id]);

        echo json_encode(['success' => true, 'message' => 'Competência eliminada com sucesso!'], JSON_UNESCAPED_UNICODE);
        exit;
    } catch (\Exception $e) {
        error_log("Erro ao eliminar competência: " . $e->getMessage());
        header('HTTP/1.1 500 Internal Server Error');
        echo json_encode(['success' => false, 'message' => 'Erro interno ao tentar eliminar competência.'], JSON_UNESCAPED_UNICODE);
        exit;
    }
}
