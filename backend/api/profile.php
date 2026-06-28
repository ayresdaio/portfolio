<?php
/**
 * =====================================================================
 * ENDPOINT GESTÃO DE PERFIL (CRUD + UPLOAD AVATAR E CURRÍCULO PDF)
 * =====================================================================
 * Rota: GET/POST /backend/api/profile
 * Acesso: Restrito a Administrador (Com sessão ativa)
 * Permite ler e atualizar as informações pessoais, a foto de perfil
 * e carregar o currículo em PDF no servidor de forma 100% segura.
 */

// 1. Inicializar configurações e base de dados
define('SECURE_ACCESS', true);
require_once dirname(__DIR__) . '/includes/config.php';
require_once dirname(__DIR__) . '/includes/db.php';

use Includes\Database;

// 2. Proteger a rota: Validar se o utilizador está autenticado de forma segura
if (!isset($_SESSION['admin_logged']) || $_SESSION['admin_logged'] !== true) {
    header('HTTP/1.1 401 Unauthorized');
    echo json_encode(['success' => false, 'message' => 'Acesso não autorizado. Inicie sessão.'], JSON_UNESCAPED_UNICODE);
    exit;
}

// 3. Controlo de inatividade (Sessão expira após 2 horas)
$timeout_duration = 7200;
if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] > $timeout_duration)) {
    session_unset();
    session_destroy();
    header('HTTP/1.1 401 Unauthorized');
    echo json_encode(['success' => false, 'message' => 'A sua sessão expirou por inatividade.'], JSON_UNESCAPED_UNICODE);
    exit;
}
$_SESSION['last_activity'] = time(); // Atualizar última atividade

$db = Database::getConnection();
$requestMethod = $_SERVER['REQUEST_METHOD'];

// =====================================================================
// OPERAÇÃO GET: Retornar todos os dados detalhados do perfil
// =====================================================================
if ($requestMethod === 'GET') {
    try {
        $stmt = $db->query('SELECT * FROM profile LIMIT 1');
        $profile = $stmt->fetch();

        echo json_encode([
            'success' => true,
            'profile' => $profile ?: []
        ], JSON_UNESCAPED_UNICODE);
        exit;
    } catch (\Exception $e) {
        error_log("Erro ao obter perfil: " . $e->getMessage());
        header('HTTP/1.1 500 Internal Server Error');
        echo json_encode(['success' => false, 'message' => 'Erro interno ao obter dados do perfil.'], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// =====================================================================
// OPERAÇÃO POST: Atualizar dados de perfil, avatar e currículo PDF
// =====================================================================
if ($requestMethod === 'POST') {
    $moveFunc = (PHP_SAPI === 'cli') ? 'copy' : 'move_uploaded_file';
    
    // Helper para obter MIME type de forma segura e compatível
    $getMimeType = function($filePath) {
        if (class_exists('\finfo')) {
            $finfo = new \finfo(FILEINFO_MIME_TYPE);
            return $finfo->file($filePath);
        }
        if (function_exists('mime_content_type')) {
            return mime_content_type($filePath);
        }
        $ext = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
        $mimeTypes = [
            'pdf'  => 'application/pdf',
            'jpg'  => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'png'  => 'image/png',
            'gif'  => 'image/gif',
            'webp' => 'image/webp'
        ];
        return $mimeTypes[$ext] ?? 'application/octet-stream';
    };

    try {
        // Obter dados de formulário normais (multipart/form-data devido a uploads de ficheiro)
        $name = isset($_POST['name']) ? trim(strip_tags($_POST['name'])) : '';
        $role = isset($_POST['role']) ? trim(strip_tags($_POST['role'])) : '';
        $bio = isset($_POST['bio']) ? trim($_POST['bio']) : ''; // Preservar as tags HTML do editor de texto rico TinyMCE
        $email = isset($_POST['email']) ? trim($_POST['email']) : '';
        $phone = isset($_POST['phone']) ? trim(strip_tags($_POST['phone'])) : '';
        $location = isset($_POST['location']) ? trim(strip_tags($_POST['location'])) : '';
        $location_en = isset($_POST['location_en']) ? trim(strip_tags($_POST['location_en'])) : '';
        $github_url = isset($_POST['github_url']) ? trim($_POST['github_url']) : '';
        $linkedin_url = isset($_POST['linkedin_url']) ? trim($_POST['linkedin_url']) : '';
        $facebook_url = isset($_POST['facebook_url']) ? trim($_POST['facebook_url']) : '';
        $instagram_url = isset($_POST['instagram_url']) ? trim($_POST['instagram_url']) : '';
        $about_text = isset($_POST['about_text']) ? trim($_POST['about_text']) : '';
        $role_en = isset($_POST['role_en']) ? trim(strip_tags($_POST['role_en'])) : '';
        $bio_en = isset($_POST['bio_en']) ? trim($_POST['bio_en']) : ''; // Preservar tags HTML se houver
        $about_text_en = isset($_POST['about_text_en']) ? trim($_POST['about_text_en']) : '';


        // Validar e-mail do perfil
        if (empty($name) || empty($role) || empty($bio) || empty($email)) {
            header('HTTP/1.1 400 Bad Request');
            echo json_encode(['success' => false, 'message' => 'Nome, Cargo, Biografia e E-mail são obrigatórios.'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            header('HTTP/1.1 400 Bad Request');
            echo json_encode(['success' => false, 'message' => 'E-mail do perfil inválido.'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        // Buscar dados atuais do perfil para verificar fotos/CV existentes e obter o ID
        $stmt = $db->query('SELECT id, avatar_url, cv_url, cv_url_en, about_image_url FROM profile LIMIT 1');
        $currentProfile = $stmt->fetch();
        
        $avatar_url = $currentProfile ? $currentProfile['avatar_url'] : null;
        $cv_url = $currentProfile ? $currentProfile['cv_url'] : null;
        $cv_url_en = $currentProfile ? $currentProfile['cv_url_en'] : null;
        $about_image_url = $currentProfile ? $currentProfile['about_image_url'] : null;

        // -------------------------------------------------------------
        // PROCESSAMENTO DE UPLOAD DE AVATAR ($_FILES['avatar'])
        // -------------------------------------------------------------
        if (isset($_FILES['avatar']) && $_FILES['avatar']['error'] === UPLOAD_ERR_OK) {
            $avatarFile = $_FILES['avatar'];
            if ($avatarFile['size'] > 5 * 1024 * 1024) {
                throw new \Exception('O tamanho da foto de perfil não deve exceder 5MB.');
            }
            $mimeType = $getMimeType($avatarFile['tmp_name']);
            $ext = strtolower(pathinfo($avatarFile['name'], PATHINFO_EXTENSION));
            $allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
            $allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
            if (!in_array($mimeType, $allowedMimes) && !in_array($ext, $allowedExts)) {
                throw new \Exception('Formato do avatar inválido. Permitido apenas JPG, PNG, WEBP e GIF.');
            }
            $mimeToExt = [
                'image/jpeg' => 'jpg',
                'image/png'  => 'png',
                'image/webp' => 'webp',
                'image/gif'  => 'gif'
            ];
            $ext = $mimeToExt[$mimeType] ?? $ext;
            // Garantir que a extensão é válida
            if (!in_array($ext, $allowedExts)) {
                $ext = 'jpg';
            }
            $newAvatarName = 'avatar_' . bin2hex(random_bytes(8)) . '.' . $ext;
            
            $uploadDir = dirname(__DIR__) . '/uploads/profile/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }
            $destPath = $uploadDir . $newAvatarName;

            // Eliminar avatar antigo se existir e for local
            if ($avatar_url && strpos($avatar_url, '/backend/uploads/') === 0) {
                $oldPath = dirname(__DIR__) . str_replace('/backend', '', $avatar_url);
                if (file_exists($oldPath)) {
                    @unlink($oldPath);
                }
            }

            if (!$moveFunc($avatarFile['tmp_name'], $destPath)) {
                throw new \Exception('Falha ao guardar a foto de perfil no servidor.');
            }
            $avatar_url = '/backend/uploads/profile/' . $newAvatarName;
        } elseif (isset($_POST['avatar_url'])) {
            $avatar_url = trim($_POST['avatar_url']);
        }

        // -------------------------------------------------------------
        // PROCESSAMENTO DE UPLOAD DE CURRÍCULO CV ($_FILES['cv'])
        // -------------------------------------------------------------
        if (isset($_FILES['cv']) && $_FILES['cv']['error'] === UPLOAD_ERR_OK) {
            $cvFile = $_FILES['cv'];
            if ($cvFile['size'] > 10 * 1024 * 1024) {
                throw new \Exception('O tamanho do currículo em PDF não deve exceder 10MB.');
            }
            $mimeType = $getMimeType($cvFile['tmp_name']);
            $ext = strtolower(pathinfo($cvFile['name'], PATHINFO_EXTENSION));
            if ($mimeType !== 'application/pdf' && $ext !== 'pdf') {
                throw new \Exception('Formato de documento inválido. Apenas PDF é permitido para o currículo.');
            }
            $ext = 'pdf';
            $newCvName = 'cv_' . bin2hex(random_bytes(8)) . '.' . $ext;
            
            $uploadDir = dirname(__DIR__) . '/uploads/profile/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }
            $destPath = $uploadDir . $newCvName;

            // Eliminar CV antigo se existir e for local
            if ($cv_url && strpos($cv_url, '/backend/uploads/') === 0) {
                $oldPath = dirname(__DIR__) . str_replace('/backend', '', $cv_url);
                if (file_exists($oldPath)) {
                    @unlink($oldPath);
                }
            }

            if (!$moveFunc($cvFile['tmp_name'], $destPath)) {
                throw new \Exception('Falha ao guardar o currículo no servidor.');
            }
            $cv_url = '/backend/uploads/profile/' . $newCvName;
        } elseif (isset($_POST['cv_url'])) {
            $cv_url = trim($_POST['cv_url']);
        }

        // -------------------------------------------------------------
        // PROCESSAMENTO DE UPLOAD DE CURRÍCULO CV EN ($_FILES['cv_en'])
        // -------------------------------------------------------------
        if (isset($_FILES['cv_en']) && $_FILES['cv_en']['error'] === UPLOAD_ERR_OK) {
            $cvEnFile = $_FILES['cv_en'];
            if ($cvEnFile['size'] > 10 * 1024 * 1024) {
                throw new \Exception('O tamanho do currículo em inglês não deve exceder 10MB.');
            }
            $mimeType = $getMimeType($cvEnFile['tmp_name']);
            $ext = strtolower(pathinfo($cvEnFile['name'], PATHINFO_EXTENSION));
            if ($mimeType !== 'application/pdf' && $ext !== 'pdf') {
                throw new \Exception('Formato de documento inválido. Apenas PDF é permitido para o currículo em inglês.');
            }
            $ext = 'pdf';
            $newCvEnName = 'cv_en_' . bin2hex(random_bytes(8)) . '.' . $ext;
            
            $uploadDir = dirname(__DIR__) . '/uploads/profile/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }
            $destPath = $uploadDir . $newCvEnName;

            // Eliminar CV antigo se existir e for local
            if ($cv_url_en && strpos($cv_url_en, '/backend/uploads/') === 0) {
                $oldPath = dirname(__DIR__) . str_replace('/backend', '', $cv_url_en);
                if (file_exists($oldPath)) {
                    @unlink($oldPath);
                }
            }

            if (!$moveFunc($cvEnFile['tmp_name'], $destPath)) {
                throw new \Exception('Falha ao guardar o currículo em inglês no servidor.');
            }
            $cv_url_en = '/backend/uploads/profile/' . $newCvEnName;
        } elseif (isset($_POST['cv_url_en'])) {
            $cv_url_en = trim($_POST['cv_url_en']);
        }

        // -------------------------------------------------------------
        // PROCESSAMENTO DE UPLOAD DE IMAGEM "SOBRE MIM" ($_FILES['about_image'])
        // -------------------------------------------------------------
        if (isset($_FILES['about_image']) && $_FILES['about_image']['error'] === UPLOAD_ERR_OK) {
            $aboutImgFile = $_FILES['about_image'];
            if ($aboutImgFile['size'] > 5 * 1024 * 1024) {
                throw new \Exception('O tamanho da foto Sobre Mim não deve exceder 5MB.');
            }
            $mimeType = $getMimeType($aboutImgFile['tmp_name']);
            $ext = strtolower(pathinfo($aboutImgFile['name'], PATHINFO_EXTENSION));
            $allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
            $allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
            if (!in_array($mimeType, $allowedMimes) && !in_array($ext, $allowedExts)) {
                throw new \Exception('Formato de imagem Sobre Mim inválido. JPG, PNG, WEBP e GIF apenas.');
            }
            $mimeToExt = [
                'image/jpeg' => 'jpg',
                'image/png'  => 'png',
                'image/webp' => 'webp',
                'image/gif'  => 'gif'
            ];
            $ext = $mimeToExt[$mimeType] ?? $ext;
            if (!in_array($ext, $allowedExts)) {
                $ext = 'jpg';
            }
            $newAboutImgName = 'about_' . bin2hex(random_bytes(8)) . '.' . $ext;
            
            $uploadDir = dirname(__DIR__) . '/uploads/profile/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }
            $destPath = $uploadDir . $newAboutImgName;

            // Eliminar imagem "Sobre Mim" antiga se existir e for local
            if ($about_image_url && strpos($about_image_url, '/backend/uploads/') === 0) {
                $oldPath = dirname(__DIR__) . str_replace('/backend', '', $about_image_url);
                if (file_exists($oldPath)) {
                    @unlink($oldPath);
                }
            }

            if (!$moveFunc($aboutImgFile['tmp_name'], $destPath)) {
                throw new \Exception('Falha ao guardar a imagem Sobre Mim no servidor.');
            }
            $about_image_url = '/backend/uploads/profile/' . $newAboutImgName;
        } elseif (isset($_POST['about_image_url'])) {
            $about_image_url = trim($_POST['about_image_url']);
        }

        // -------------------------------------------------------------
        // GRAVAR ALTERAÇÕES NA BASE DE DADOS
        // -------------------------------------------------------------
        if ($currentProfile) {
            // Atualizar perfil existente
            $updateStmt = $db->prepare('UPDATE profile SET name = :name, role = :role, role_en = :role_en, bio = :bio, bio_en = :bio_en, email = :email, phone = :phone, location = :location, location_en = :location_en, github_url = :github_url, linkedin_url = :linkedin_url, facebook_url = :facebook_url, instagram_url = :instagram_url, avatar_url = :avatar_url, cv_url = :cv_url, cv_url_en = :cv_url_en, about_text = :about_text, about_text_en = :about_text_en, about_image_url = :about_image_url WHERE id = :id');
            $updateStmt->execute([
                ':name' => $name,
                ':role' => $role,
                ':role_en' => $role_en,
                ':bio' => $bio,
                ':bio_en' => $bio_en,
                ':email' => $email,
                ':phone' => $phone,
                ':location' => $location,
                ':location_en' => $location_en,
                ':github_url' => $github_url,
                ':linkedin_url' => $linkedin_url,
                ':facebook_url' => $facebook_url,
                ':instagram_url' => $instagram_url,
                ':avatar_url' => $avatar_url,
                ':cv_url' => $cv_url,
                ':cv_url_en' => $cv_url_en,
                ':about_text' => $about_text,
                ':about_text_en' => $about_text_en,
                ':about_image_url' => $about_image_url,
                ':id' => $currentProfile['id']
            ]);
        } else {
            // Criar se não existir por alguma razão
            $insertStmt = $db->prepare('INSERT INTO profile (name, role, role_en, bio, bio_en, email, phone, location, location_en, github_url, linkedin_url, facebook_url, instagram_url, avatar_url, cv_url, cv_url_en, about_text, about_text_en, about_image_url) VALUES (:name, :role, :role_en, :bio, :bio_en, :email, :phone, :location, :location_en, :github_url, :linkedin_url, :facebook_url, :instagram_url, :avatar_url, :cv_url, :cv_url_en, :about_text, :about_text_en, :about_image_url)');
            $insertStmt->execute([
                ':name' => $name,
                ':role' => $role,
                ':role_en' => $role_en,
                ':bio' => $bio,
                ':bio_en' => $bio_en,
                ':email' => $email,
                ':phone' => $phone,
                ':location' => $location,
                ':location_en' => $location_en,
                ':github_url' => $github_url,
                ':linkedin_url' => $linkedin_url,
                ':facebook_url' => $facebook_url,
                ':instagram_url' => $instagram_url,
                ':avatar_url' => $avatar_url,
                ':cv_url' => $cv_url,
                ':cv_url_en' => $cv_url_en,
                ':about_text' => $about_text,
                ':about_text_en' => $about_text_en,
                ':about_image_url' => $about_image_url
            ]);
        }

        echo json_encode([
            'success' => true,
            'message' => 'Perfil e documentos atualizados com sucesso!',
            'avatar_url' => $avatar_url,
            'cv_url' => $cv_url,
            'cv_url_en' => $cv_url_en,
            'about_image_url' => $about_image_url
        ], JSON_UNESCAPED_UNICODE);
        exit;

    } catch (\Exception $e) {
        header('HTTP/1.1 400 Bad Request');
        echo json_encode(['success' => false, 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        exit;
    }
}
