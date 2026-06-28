<?php
/**
 * =====================================================================
 * ENDPOINT DE UPLOAD SEGURO DE IMAGENS DO EDITOR
 * =====================================================================
 * Rota: POST /backend/api/upload.php
 * Acesso: Restrito a Administrador (Com sessão ativa no PHP)
 * Descrição: Recebe fotos enviadas programaticamente a partir do editor
 * profissional, valida extensões, tamanho e tipo Mime real usando finfo,
 * e armazena na pasta local '/backend/uploads/editor/', retornando o URL.
 * =====================================================================
 */

// 1. Definir constante para permitir acesso seguro a ficheiros incluídos
define('SECURE_ACCESS', true);
require_once dirname(__DIR__) . '/includes/config.php';
require_once dirname(__DIR__) . '/includes/db.php';

// Definir cabeçalho UTF-8 e tipo JSON para respostas consistentes
header('Content-Type: application/json; charset=utf-8');

// 2. Proteger a rota: Validar se o administrador está autenticado
if (!isset($_SESSION['admin_logged']) || $_SESSION['admin_logged'] !== true) {
    header('HTTP/1.1 401 Unauthorized');
    echo json_encode([
        'success' => false,
        'message' => 'Sessão administrativa não iniciada ou acesso não autorizado.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// 3. Controlo de inatividade (Sessão expira após 2 horas)
$timeout_duration = 7200;
if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] > $timeout_duration)) {
    session_unset();
    session_destroy();
    header('HTTP/1.1 401 Unauthorized');
    echo json_encode([
        'success' => false,
        'message' => 'A sua sessão administrativa expirou por inatividade. Por favor, inicie sessão novamente.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}
$_SESSION['last_activity'] = time();

try {
    // 4. Validar se o ficheiro foi enviado sem erros
    if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
        throw new \Exception('Nenhum ficheiro recebido ou ocorreu um erro de envio pelo navegador.');
    }

    $imageFile = $_FILES['image'];

    // 5. Validar tamanho (Máximo de 5MB para garantir excelente desempenho de rede)
    if ($imageFile['size'] > 5 * 1024 * 1024) {
        throw new \Exception('O tamanho da imagem selecionada não deve exceder os 5MB.');
    }

    // 6. Validar o tipo Mime real utilizando finfo para neutralizar extensões falsificadas
    $finfo = new \finfo(FILEINFO_MIME_TYPE);
    $mimeType = $finfo->file($imageFile['tmp_name']);
    $allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    if (!in_array($mimeType, $allowedMimes)) {
        throw new \Exception('Formato de ficheiro inválido. Apenas são permitidas fotos JPG, PNG, WEBP e GIF.');
    }

    // 7. Determinar a extensão do ficheiro segura com base no MIME real (Evita RCE)
    $mimeToExt = [
        'image/jpeg' => 'jpg',
        'image/png'  => 'png',
        'image/webp' => 'webp',
        'image/gif'  => 'gif'
    ];
    $ext = $mimeToExt[$mimeType] ?? 'jpg';
    $newImageName = 'edit_' . bin2hex(random_bytes(8)) . '.' . $ext;

    // 8. Preparar e criar a pasta de destino '/backend/uploads/editor/' se não existir
    $uploadDir = dirname(__DIR__) . '/uploads/editor/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    $destPath = $uploadDir . $newImageName;

    // 9. Mover o ficheiro temporário do sistema para a pasta definitiva no disco
    if (!move_uploaded_file($imageFile['tmp_name'], $destPath)) {
        throw new \Exception('Falha interna ao tentar guardar a imagem na pasta de uploads.');
    }

    // URL web absoluto a ser retornado para o frontend reativo do React
    $imageUrl = '/backend/uploads/editor/' . $newImageName;

    // Retornar resposta JSON de sucesso com o caminho web da foto
    echo json_encode([
        'success' => true,
        'message' => 'Imagem do dispositivo carregada com sucesso para o servidor!',
        'image_url' => $imageUrl
    ], JSON_UNESCAPED_UNICODE);
    exit;

} catch (\Exception $e) {
    header('HTTP/1.1 400 Bad Request');
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
    exit;
}
