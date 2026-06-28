<?php
/**
 * @file update_password.php
 * @description Endpoint seguro e restrito para alteração da Palavra-passe (Senha).
 * 
 * Apenas acessível a utilizadores autenticados com sessão ativa. Recebe a
 * palavra-passe atual e a nova palavra-passe pretendida, valida a atual
 * e atualiza o registo de forma segura.
 */

// 1. Inicializar configurações globais e segurança
define('SECURE_ACCESS', true);
require_once dirname(__DIR__) . '/includes/config.php';
require_once dirname(__DIR__) . '/includes/db.php';

use Includes\Database;

// Definir cabeçalho JSON
header('Content-Type: application/json; charset=utf-8');

// 2. Proteger a rota: Validar se o utilizador está autenticado de forma segura
if (!isset($_SESSION['admin_logged']) || $_SESSION['admin_logged'] !== true) {
    header('HTTP/1.1 401 Unauthorized');
    echo json_encode(['success' => false, 'message' => 'Acesso não autorizado. Inicie sessão.'], JSON_UNESCAPED_UNICODE);
    exit;
}

// 3. Apenas aceitar pedidos POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('HTTP/1.1 405 Method Not Allowed');
    echo json_encode(['success' => false, 'message' => 'Método não permitido.'], JSON_UNESCAPED_UNICODE);
    exit;
}

// 4. Ler e descodificar o JSON do corpo do pedido
$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, true);

$currentPassword = isset($input['currentPassword']) ? $input['currentPassword'] : '';
$newPassword = isset($input['newPassword']) ? $input['newPassword'] : '';

// 5. Validação básica de campos
if (empty($currentPassword) || empty($newPassword)) {
    header('HTTP/1.1 400 Bad Request');
    echo json_encode(['success' => false, 'message' => 'A palavra-passe atual e a nova palavra-passe são obrigatórias.'], JSON_UNESCAPED_UNICODE);
    exit;
}

if (strlen($newPassword) < 8) {
    header('HTTP/1.1 400 Bad Request');
    echo json_encode(['success' => false, 'message' => 'A nova palavra-passe deve ter pelo menos 8 caracteres.'], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $db = Database::getConnection();
    $userId = $_SESSION['admin_id'];

    // 6. Obter a hash de palavra-passe atual do utilizador
    $stmt = $db->prepare("SELECT id, password_hash FROM `users` WHERE `id` = :id LIMIT 1");
    $stmt->execute([':id' => $userId]);
    $user = $stmt->fetch();

    // 7. Validar a palavra-passe atual usando password_verify
    if ($user && password_verify($currentPassword, $user['password_hash'])) {
        
        // Encriptar a nova palavra-passe usando algoritmo bcrypt padrão
        $newPasswordHash = password_hash($newPassword, PASSWORD_DEFAULT);

        // Atualizar na base de dados
        $updateStmt = $db->prepare("UPDATE `users` SET `password_hash` = :hash WHERE `id` = :id");
        $updateStmt->execute([
            ':hash' => $newPasswordHash,
            ':id' => $userId
        ]);

        echo json_encode([
            'success' => true,
            'message' => 'Palavra-passe alterada com sucesso!'
        ], JSON_UNESCAPED_UNICODE);
        exit;
        
    } else {
        header('HTTP/1.1 401 Unauthorized');
        echo json_encode(['success' => false, 'message' => 'A palavra-passe atual introduzida está incorreta.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

} catch (\Exception $e) {
    error_log("Erro ao atualizar palavra-passe na API: " . $e->getMessage());
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode(['success' => false, 'message' => 'Ocorreu um erro interno no servidor.'], JSON_UNESCAPED_UNICODE);
    exit;
}
