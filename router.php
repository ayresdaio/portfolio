<?php
/**
 * =====================================================================
 * SCRIPT DE ROTEAMENTO PARA DESENVOLVIMENTO LOCAL (php -S)
 * =====================================================================
 * Este script emula o comportamento de URL Rewriting definido no .htaccess
 * do Apache para que o servidor integrado do PHP consiga responder a rotas
 * sem extensão (ex: /backend/api/portfolio -> /backend/api/portfolio.php).
 */

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Remover barra no final se existir e não for a raiz
if ($uri !== '/' && substr($uri, -1) === '/') {
    $uri = substr($uri, 0, -1);
}

$file = __DIR__ . $uri;

// Se for um ficheiro físico que existe no disco (como imagens, PDFs, etc.), servimos diretamente
if (file_exists($file) && !is_dir($file)) {
    return false; // Permite que o servidor integrado do PHP o sirva normalmente
}

// Se não existir o ficheiro mas existir o respetivo com extensão .php
$phpFile = $file . '.php';
if (file_exists($phpFile)) {
    // Ajustar variáveis globais para emular um pedido direto ao ficheiro php
    $_SERVER['SCRIPT_FILENAME'] = $phpFile;
    $_SERVER['SCRIPT_NAME'] = $uri . '.php';
    $_SERVER['PHP_SELF'] = $uri . '.php';
    
    // Incluir o ficheiro php correspondente
    include $phpFile;
    exit;
}

// Se a rota não existir de todo, devolvemos 404 em JSON
header("HTTP/1.1 404 Not Found");
header("Content-Type: application/json; charset=UTF-8");
echo json_encode([
    'success' => false,
    'message' => 'Rota não encontrada localmente no servidor de desenvolvimento: ' . $uri
], JSON_UNESCAPED_UNICODE);
exit;
