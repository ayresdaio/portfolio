<?php
/**
 * =====================================================================
 * ENDPOINT DE TERMINAÇÃO DE SESSÃO (LOGOUT)
 * =====================================================================
 * Rota: GET/POST /backend/api/logout
 * Acesso: Restrito (Embora limpe a sessão mesmo se chamada sem login)
 * Destrói a sessão no servidor PHP e limpa os cookies correspondentes.
 */

define('SECURE_ACCESS', true);
require_once dirname(__DIR__) . '/includes/config.php';

if (session_status() === PHP_SESSION_ACTIVE) {
    // 1. Limpar variáveis de sessão
    $_SESSION = array();

    // 2. Destruir os cookies de sessão no browser
    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(
            session_name(),
            '',
            time() - 42000,
            $params["path"],
            $params["domain"],
            $params["secure"],
            $params["httponly"]
        );
    }

    // 3. Destruir a sessão no servidor
    session_destroy();
}

// Retornar confirmação
echo json_encode([
    'success' => true,
    'message' => 'Sessão terminada com sucesso. A redirecionar...'
], JSON_UNESCAPED_UNICODE);
exit;
