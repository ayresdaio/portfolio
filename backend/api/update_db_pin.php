<?php
/**
 * =====================================================================
 * ENDPOINT PARA DEFINIR/ATUALIZAR O PIN EXCLUSIVO DE AUTOMAÇÕES/BD
 * =====================================================================
 * Rota: POST /backend/api/update_db_pin.php
 * Acesso: Privado (Requer sessão de admin)
 */

define('SECURE_ACCESS', true);
require_once dirname(__DIR__) . '/includes/config.php';
require_once dirname(__DIR__) . '/includes/db.php';

use Includes\Database;

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('HTTP/1.1 405 Method Not Allowed');
    echo json_encode(['success' => false, 'message' => 'Método não permitido.'], JSON_UNESCAPED_UNICODE);
    exit;
}

if (!isset($_SESSION['admin_logged']) || $_SESSION['admin_logged'] !== true) {
    header('HTTP/1.1 401 Unauthorized');
    echo json_encode(['success' => false, 'message' => 'Sessão expirada. Inicie sessão novamente.'], JSON_UNESCAPED_UNICODE);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$currentPassword = isset($input['currentPassword']) ? $input['currentPassword'] : '';
$newPin = isset($input['newPin']) ? trim($input['newPin']) : '';

if (empty($currentPassword) || empty($newPin)) {
    echo json_encode(['success' => false, 'message' => 'Por favor, preencha a sua palavra-passe atual e o novo PIN de Automação.'], JSON_UNESCAPED_UNICODE);
    exit;
}

if (strlen($newPin) < 4) {
    echo json_encode(['success' => false, 'message' => 'O PIN de Automação deve ter pelo menos 4 caracteres.'], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $db = Database::getConnection();
    $userId = $_SESSION['admin_id'];

    // Validar a password atual
    $stmt = $db->prepare('SELECT password_hash FROM users WHERE id = :id LIMIT 1');
    $stmt->execute([':id' => $userId]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($currentPassword, $user['password_hash'])) {
        echo json_encode(['success' => false, 'message' => 'A palavra-passe atual está incorreta.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Criar o hash para o novo PIN
    $newPinHash = password_hash($newPin, PASSWORD_DEFAULT);

    // Atualizar na base de dados
    $updateStmt = $db->prepare('UPDATE users SET db_script_pin_hash = :pin_hash WHERE id = :id');
    $success = $updateStmt->execute([
        ':pin_hash' => $newPinHash,
        ':id' => $userId
    ]);

    if ($success) {
        echo json_encode(['success' => true, 'message' => 'O PIN de Segurança para Scripts foi atualizado com sucesso!'], JSON_UNESCAPED_UNICODE);
    } else {
        echo json_encode(['success' => false, 'message' => 'Ocorreu um erro ao atualizar o PIN. Tente novamente.'], JSON_UNESCAPED_UNICODE);
    }

} catch (\PDOException $e) {
    // Caso a coluna db_script_pin_hash ainda não exista na BD
    if (strpos($e->getMessage(), 'Unknown column') !== false) {
        echo json_encode(['success' => false, 'message' => 'A coluna db_script_pin_hash não existe na base de dados. Por favor corra o script de migração SQL primeiro.'], JSON_UNESCAPED_UNICODE);
    } else {
        error_log("Erro ao atualizar DB PIN: " . $e->getMessage());
        header('HTTP/1.1 500 Internal Server Error');
        echo json_encode(['success' => false, 'message' => 'Erro interno do servidor ao ligar à base de dados.'], JSON_UNESCAPED_UNICODE);
    }
} catch (\Exception $e) {
    error_log("Erro genérico ao atualizar DB PIN: " . $e->getMessage());
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode(['success' => false, 'message' => 'Ocorreu um erro interno.'], JSON_UNESCAPED_UNICODE);
}
