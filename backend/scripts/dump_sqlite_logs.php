<?php
require_once dirname(__DIR__) . '/includes/config.php';
require_once dirname(__DIR__) . '/includes/db.php';

use Includes\Database;

try {
    $db = Database::getConnection();
    
    // Check if security_logs table exists
    $checkStmt = $db->query("SELECT count(*) FROM sqlite_master WHERE type='table' AND name='security_logs'");
    if ($checkStmt->fetchColumn() == 0) {
        echo json_encode(['error' => 'Table security_logs does not exist.']);
        exit;
    }

    $stmt = $db->query("SELECT * FROM security_logs ORDER BY created_at DESC LIMIT 50");
    $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(['success' => true, 'logs' => $logs], JSON_PRETTY_PRINT);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
