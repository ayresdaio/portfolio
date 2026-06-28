<?php
/**
 * @file update_security_key.php
 * @description Endpoint seguro para alteração e redefinição da Chave de Segurança.
 * 
 * Suporta dois cenários principais de alteração:
 * 1. Fluxo Autenticado (Painel Admin): O utilizador está logado, envia a palavra-passe
 *    atual e a nova chave de segurança.
 * 2. Fluxo Público (Chave Esquecida): O utilizador não está logado, envia o e-mail,
 *    a palavra-passe atual e a nova chave de segurança para redefinição.
 */

// 1. Inicializar configurações globais e segurança
define('SECURE_ACCESS', true);
require_once dirname(__DIR__) . '/includes/config.php';
require_once dirname(__DIR__) . '/includes/db.php';

use Includes\Database;

// Definir cabeçalho JSON
header('Content-Type: application/json; charset=utf-8');

// 2. Apenas aceitar pedidos POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('HTTP/1.1 405 Method Not Allowed');
    echo json_encode(['success' => false, 'message' => 'Método não permitido.'], JSON_UNESCAPED_UNICODE);
    exit;
}

// 3. Ler e descodificar o JSON do corpo do pedido
$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, true);

$password = isset($input['password']) ? $input['password'] : '';
$newSecurityKey = isset($input['newSecurityKey']) ? trim($input['newSecurityKey']) : '';
$email = isset($input['email']) ? trim($input['email']) : '';

// 4. Determinar se o utilizador está autenticado na sessão
$isAuthed = isset($_SESSION['admin_logged']) && $_SESSION['admin_logged'] === true;

// 5. Validação de campos obrigatórios com base no estado da sessão
if ($isAuthed) {
    if (empty($password) || empty($newSecurityKey)) {
        header('HTTP/1.1 400 Bad Request');
        echo json_encode(['success' => false, 'message' => 'A palavra-passe atual e a nova chave de segurança são obrigatórias.'], JSON_UNESCAPED_UNICODE);
        exit;
    }
} else {
    // Se não está autenticado, o e-mail é obrigatório para identificar o utilizador (fluxo de chave esquecida)
    if (empty($email) || empty($password) || empty($newSecurityKey)) {
        header('HTTP/1.1 400 Bad Request');
        echo json_encode(['success' => false, 'message' => 'O e-mail, a palavra-passe atual e a nova chave de segurança são obrigatórios.'], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

try {
    $db = Database::getConnection();

    // 6. Obter os dados do utilizador com base no ID da sessão ou no E-mail
    if ($isAuthed) {
        $userId = $_SESSION['admin_id'];
        $stmt = $db->prepare("SELECT id, password_hash FROM `users` WHERE `id` = :id LIMIT 1");
        $stmt->execute([':id' => $userId]);
    } else {
        $stmt = $db->prepare("SELECT id, password_hash FROM `users` WHERE `email` = :email LIMIT 1");
        $stmt->execute([':email' => $email]);
    }
    
    $user = $stmt->fetch();

    // 7. Validar se o utilizador existe e se a palavra-passe atual está correta (password_verify)
    if ($user && password_verify($password, $user['password_hash'])) {
        
        // Encriptar a nova chave de segurança usando o algoritmo seguro nativo (bcrypt)
        $newKeyHash = password_hash($newSecurityKey, PASSWORD_DEFAULT);

        // Atualizar na base de dados
        $updateStmt = $db->prepare("UPDATE `users` SET `security_key_hash` = :hash WHERE `id` = :id");
        $updateStmt->execute([
            ':hash' => $newKeyHash,
            ':id' => $user['id']
        ]);

        echo json_encode([
            'success' => true,
            'message' => 'Chave de segurança atualizada com sucesso! Pode agora utilizá-la no início de sessão.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
        
    } else {
        // Credenciais inválidas por segurança
        header('HTTP/1.1 401 Unauthorized');
        echo json_encode(['success' => false, 'message' => 'Credenciais incorretas. Acesso não autorizado.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

} catch (\Exception $e) {
    error_log("Erro ao atualizar chave de segurança na API: " . $e->getMessage());
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode(['success' => false, 'message' => 'Ocorreu um erro interno no servidor.'], JSON_UNESCAPED_UNICODE);
    exit;
}
