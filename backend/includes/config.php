<?php
/**
 * =====================================================================
 * CONFIGURAÇÃO GLOBAL E DE SEGURANÇA DO PORTFÓLIO
 * =====================================================================
 * Este ficheiro inicializa o carregamento de variáveis de ambiente,
 * define configurações de exibição de erros e constantes globais de segurança.
 */

// 1. Garantir que o ficheiro não é acedido diretamente
if (!defined('SECURE_ACCESS')) {
    define('SECURE_ACCESS', true);
}

// 2. Carregar o carregador de variáveis de ambiente
require_once __DIR__ . '/env_loader.php';

// 3. Configurações de exibição de erros (Segurança em produção)
// No InfinityFree, nunca devemos mostrar erros diretamente na página para evitar fugas de caminhos ou dados
$env_db_host = $_ENV['DB_HOST'] ?? $_SERVER['DB_HOST'] ?? getenv('DB_HOST');
$is_production = ($_ENV['ENVIRONMENT'] ?? $_SERVER['ENVIRONMENT'] ?? getenv('ENVIRONMENT')) === 'production' || !in_array($env_db_host, ['localhost', '127.0.0.1']);
if ($is_production) {
    @ini_set('display_errors', 0);
    @ini_set('log_errors', 1);
    @error_reporting(E_ALL & ~E_NOTICE & ~E_DEPRECATED);
} else {
    @ini_set('display_errors', 1);
    @error_reporting(E_ALL);
}

// 4. Configurações de cookies de sessão seguros
// Aplicando as flags solicitadas para blindar os cookies contra exploits
if (session_status() === PHP_SESSION_NONE) {
    @ini_set('session.cookie_httponly', 1); // Impede acesso via JS (XSS)
    @ini_set('session.use_only_cookies', 1);
    
    // Cookie seguro só via HTTPS
    // Se estiver em produção ou correndo sob HTTPS, ativa secure
    $is_https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') 
        || (isset($_SERVER['SERVER_PORT']) && $_SERVER['SERVER_PORT'] == 443) 
        || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https');
        
    @ini_set('session.cookie_secure', $is_https ? 1 : 0);
    
    // Definir SameSite = Strict
    if (PHP_VERSION_ID >= 70300) {
        @session_set_cookie_params([
            'lifetime' => 86400, // 24 horas
            'path' => '/',
            'domain' => '',
            'secure' => $is_https,
            'httponly' => true,
            'samesite' => 'Strict'
        ]);
    } else {
        @session_set_cookie_params(86400, '/; SameSite=Strict', '', $is_https, true);
    }
    
    @session_start();
}

// 5. Definição de Constantes Globais
define('JWT_SECRET', ($_ENV['JWT_SECRET'] ?? $_SERVER['JWT_SECRET'] ?? getenv('JWT_SECRET')) ?: '');
define('FRONTEND_URL', ($_ENV['FRONTEND_URL'] ?? $_SERVER['FRONTEND_URL'] ?? getenv('FRONTEND_URL')) ?: '*');

// 6. Cabeçalhos de Segurança Adicionais para as respostas da API
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *'); // Permite pedidos de outras origens (CORS)
header('Access-Control-Allow-Methods: GET, POST, DELETE, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Cache-Control: no-cache, no-store, must-revalidate'); // Evita caches persistentes em outros navegadores
header('Pragma: no-cache');
header('Expires: 0');
header('X-Content-Type-Options: nosniff'); // Previne sniffing de MIME types
header('X-Frame-Options: DENY');           // Previne clickjacking
header('X-XSS-Protection: 1; mode=block'); // Ativa filtro anti-XSS do browser
header('Referrer-Policy: strict-origin-when-cross-origin');

// Tratar os pedidos OPTIONS (Pre-flight) do CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
