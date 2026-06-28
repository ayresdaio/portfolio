<?php
/**
 * @file security_logs.php
 * @description Endpoint seguro para obter os logs de tentativas de login e segurança.
 * Apenas acessível a administradores autenticados.
 */

define('SECURE_ACCESS', true);
require_once dirname(__DIR__) . '/includes/config.php';
require_once dirname(__DIR__) . '/includes/db.php';

use Includes\Database;

header('Content-Type: application/json; charset=utf-8');

// 1. Apenas aceitar pedidos GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    header('HTTP/1.1 405 Method Not Allowed');
    echo json_encode(['success' => false, 'message' => 'Método não permitido.'], JSON_UNESCAPED_UNICODE);
    exit;
}

// 2. Verificar se o administrador está autenticado
if (!isset($_SESSION['admin_logged']) || $_SESSION['admin_logged'] !== true) {
    header('HTTP/1.1 401 Unauthorized');
    echo json_encode(['success' => false, 'message' => 'Sessão expirada ou acesso não autorizado.'], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $db = Database::getConnection();

    // Buscar os últimos 15 logs de segurança ordenados pela data mais recente
    $stmt = $db->query("SELECT `id`, `username_attempted`, `ip_address`, `country`, `city`, `status`, `created_at` FROM `security_logs` ORDER BY `created_at` DESC LIMIT 15");
    $logs = $stmt->fetchAll(\PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'logs' => $logs
    ], JSON_UNESCAPED_UNICODE);
    exit;

} catch (\Exception $e) {
    error_log("Erro ao recuperar logs de segurança: " . $e->getMessage());
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode(['success' => false, 'message' => 'Erro interno ao recuperar logs.'], JSON_UNESCAPED_UNICODE);
    exit;
}
