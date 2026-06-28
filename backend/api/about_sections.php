<?php
/**
 * =====================================================================
 * ENDPOINT GESTÃO DE SECÇÕES EXTRA DO SOBRE MIM (CRUD / API PRIVADA E PÚBLICA)
 * =====================================================================
 * Rota: GET/POST/DELETE /backend/api/about_sections.php
 * Acesso:
 *   - GET (Público): Lista todas as secções ordenadas por sort_order.
 *   - POST/DELETE (Admin): CRUD restrito com sessão administrativa ativa.
 */

// 1. Inicializar configurações e ligação à base de dados
define('SECURE_ACCESS', true);
require_once dirname(__DIR__) . '/includes/config.php';
require_once dirname(__DIR__) . '/includes/db.php';

use Includes\Database;

$db = Database::getConnection();
$requestMethod = $_SERVER['REQUEST_METHOD'];

// Verificar se o administrador está devidamente autenticado
$isAdmin = isset($_SESSION['admin_logged']) && $_SESSION['admin_logged'] === true;

if ($isAdmin) {
    $timeout_duration = 7200;
    if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] > $timeout_duration)) {
        session_unset();
        session_destroy();
        $isAdmin = false;
    } else {
        $_SESSION['last_activity'] = time();
    }
}

header('Content-Type: application/json; charset=utf-8');

// =====================================================================
// OPERAÇÃO GET: Retornar lista de secções (Público)
// =====================================================================
if ($requestMethod === 'GET') {
    try {
        $stmt = $db->query('SELECT * FROM about_sections ORDER BY sort_order ASC, id ASC');
        $sections = $stmt->fetchAll();
        echo json_encode(['success' => true, 'about_sections' => $sections], JSON_UNESCAPED_UNICODE);
        exit;
    } catch (\Exception $e) {
        error_log("Erro ao obter secções do Sobre: " . $e->getMessage());
        header('HTTP/1.1 500 Internal Server Error');
        echo json_encode(['success' => false, 'message' => 'Erro interno ao carregar secções.'], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// Para POST e DELETE, barreira de acesso restrito obrigatória
if (!$isAdmin) {
    header('HTTP/1.1 401 Unauthorized');
    echo json_encode(['success' => false, 'message' => 'Acesso não autorizado.'], JSON_UNESCAPED_UNICODE);
    exit;
}

// =====================================================================
// OPERAÇÃO POST: Criar ou Editar Secção
// =====================================================================
if ($requestMethod === 'POST') {
    try {
        $id = isset($_POST['id']) && !empty($_POST['id']) ? (int)$_POST['id'] : null;
        $title = isset($_POST['title']) ? trim(strip_tags($_POST['title'])) : '';
        $title_en = isset($_POST['title_en']) ? trim(strip_tags($_POST['title_en'])) : '';
        $content = isset($_POST['content']) ? trim($_POST['content']) : ''; // Preservar a formatação caso seja introduzido texto rico
        $content_en = isset($_POST['content_en']) ? trim($_POST['content_en']) : ''; // Preservar a formatação caso seja introduzido texto rico
        $icon = isset($_POST['icon']) ? trim(strip_tags($_POST['icon'])) : 'Info';
        $sort_order = isset($_POST['sort_order']) ? (int)$_POST['sort_order'] : 0;

        // Validar dados obrigatórios
        if (empty($title) || empty($content)) {
            header('HTTP/1.1 400 Bad Request');
            echo json_encode(['success' => false, 'message' => 'O título e o conteúdo são obrigatórios.'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        if ($id) {
            // Atualizar secção existente
            $stmt = $db->prepare('UPDATE about_sections SET title = :title, title_en = :title_en, content = :content, content_en = :content_en, icon = :icon, sort_order = :sort_order WHERE id = :id');
            $stmt->execute([
                ':title' => $title,
                ':title_en' => $title_en,
                ':content' => $content,
                ':content_en' => $content_en,
                ':icon' => $icon,
                ':sort_order' => $sort_order,
                ':id' => $id
            ]);
            $msg = 'Secção do Sobre Mim atualizada com sucesso!';
        } else {
            // Criar nova secção
            $stmt = $db->prepare('INSERT INTO about_sections (title, title_en, content, content_en, icon, sort_order) VALUES (:title, :title_en, :content, :content_en, :icon, :sort_order)');
            $stmt->execute([
                ':title' => $title,
                ':title_en' => $title_en,
                ':content' => $content,
                ':content_en' => $content_en,
                ':icon' => $icon,
                ':sort_order' => $sort_order
            ]);
            $id = $db->lastInsertId();
            $msg = 'Secção do Sobre Mim criada com sucesso!';
        }

        echo json_encode([
            'success' => true,
            'message' => $msg,
            'id' => $id
        ], JSON_UNESCAPED_UNICODE);
        exit;

    } catch (\Exception $e) {
        header('HTTP/1.1 400 Bad Request');
        echo json_encode(['success' => false, 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// =====================================================================
// OPERAÇÃO DELETE: Eliminar Secção
// =====================================================================
if ($requestMethod === 'DELETE') {
    try {
        $id = isset($_GET['id']) ? (int)$_GET['id'] : null;

        if (!$id) {
            header('HTTP/1.1 400 Bad Request');
            echo json_encode(['success' => false, 'message' => 'ID da secção em falta.'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $deleteStmt = $db->prepare('DELETE FROM about_sections WHERE id = :id');
        $deleteStmt->execute([':id' => $id]);

        if ($deleteStmt->rowCount() > 0) {
            echo json_encode(['success' => true, 'message' => 'Secção eliminada com sucesso!'], JSON_UNESCAPED_UNICODE);
        } else {
            header('HTTP/1.1 404 Not Found');
            echo json_encode(['success' => false, 'message' => 'Secção não encontrada no servidor.'], JSON_UNESCAPED_UNICODE);
        }
        exit;

    } catch (\Exception $e) {
        error_log("Erro ao eliminar secção: " . $e->getMessage());
        header('HTTP/1.1 500 Internal Server Error');
        echo json_encode(['success' => false, 'message' => 'Erro interno ao eliminar secção.'], JSON_UNESCAPED_UNICODE);
        exit;
    }
}
