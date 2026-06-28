<?php
/**
 * =====================================================================
 * ENDPOINT DE REDEFINIÇÃO DE PALAVRA-PASSE COM TOKEN SEGURO
 * =====================================================================
 * Rota: POST /backend/api/reset_password
 * Acesso: Público
 * Valida o token de recuperação, verifica se não expirou, e altera
 * a password do utilizador administrador encriptando com bcrypt.
 */

// 1. Inicializar configurações e base de dados
define('SECURE_ACCESS', true);
require_once dirname(__DIR__) . '/includes/config.php';
require_once dirname(__DIR__) . '/includes/db.php';

use Includes\Database;

// 2. Apenas aceitar pedidos POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('HTTP/1.1 405 Method Not Allowed');
    echo json_encode(['success' => false, 'message' => 'Método não permitido.'], JSON_UNESCAPED_UNICODE);
    exit;
}

// 3. Ler e descodificar o corpo do pedido JSON
$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, true);

$token = isset($input['token']) ? trim($input['token']) : '';
$newPassword = isset($input['newPassword']) ? $input['newPassword'] : '';
$confirmPassword = isset($input['confirmPassword']) ? $input['confirmPassword'] : '';

// 4. Validação básica de campos
if (empty($token) || empty($newPassword) || empty($confirmPassword)) {
    header('HTTP/1.1 400 Bad Request');
    echo json_encode(['success' => false, 'message' => 'Por favor, preencha todos os campos.'], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($newPassword !== $confirmPassword) {
    header('HTTP/1.1 400 Bad Request');
    echo json_encode(['success' => false, 'message' => 'As palavras-passe introduzidas não coincidem.'], JSON_UNESCAPED_UNICODE);
    exit;
}

if (strlen($newPassword) < 8) {
    header('HTTP/1.1 400 Bad Request');
    echo json_encode(['success' => false, 'message' => 'A nova palavra-passe deve conter pelo menos 8 caracteres.'], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $db = Database::getConnection();

    // 5. Procurar o token na base de dados e verificar se não expirou (Prepared Statement)
    $stmt = $db->prepare('SELECT email, expires_at FROM password_resets WHERE token = :token LIMIT 1');
    $stmt->execute([':token' => $token]);
    $resetRequest = $stmt->fetch();

    if (!$resetRequest) {
        header('HTTP/1.1 400 Bad Request');
        echo json_encode(['success' => false, 'message' => 'O token de recuperação é inválido.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // 6. Verificar a expiração do token (Fuso horário local)
    $expiresAt = strtotime($resetRequest['expires_at']);
    if (time() > $expiresAt) {
        // Token expirado! Eliminar o token para limpar a base de dados
        $deleteStmt = $db->prepare('DELETE FROM password_resets WHERE token = :token');
        $deleteStmt->execute([':token' => $token]);

        header('HTTP/1.1 400 Bad Request');
        echo json_encode(['success' => false, 'message' => 'Este link de recuperação expirou. Por favor, solicite um novo link.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $email = $resetRequest['email'];

    // 7. Encriptar a nova palavra-passe usando bcrypt robusto (password_hash)
    $newHash = password_hash($newPassword, PASSWORD_BCRYPT, ['cost' => 10]);

    // Iniciar transação para garantir que ambas as operações (atualizar password e limpar tokens) ocorrem juntas
    $db->beginTransaction();

    // 8. Atualizar a hash da palavra-passe na tabela de utilizadores
    $updateStmt = $db->prepare('UPDATE users SET password_hash = :hash WHERE email = :email');
    $updateStmt->execute([
        ':hash' => $newHash,
        ':email' => $email
    ]);

    // 9. Eliminar todos os tokens de redefinição pendentes para este e-mail (Prevenção de reutilização do token)
    $cleanStmt = $db->prepare('DELETE FROM password_resets WHERE email = :email');
    $cleanStmt->execute([':email' => $email]);

    $db->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Palavra-passe redefinida com sucesso! Já pode iniciar sessão com as suas novas credenciais.'
    ], JSON_UNESCAPED_UNICODE);
    exit;

} catch (\Exception $e) {
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();
    }
    error_log("Erro no reset_password da API: " . $e->getMessage());
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode(['success' => false, 'message' => 'Ocorreu um erro interno no servidor.'], JSON_UNESCAPED_UNICODE);
    exit;
}
