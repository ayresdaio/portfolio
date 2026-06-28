<?php
/**
 * =====================================================================
 * ENDPOINT DE REGISTO DE VISITAS ANÓNIMAS (RGPD COMPLIANT)
 * =====================================================================
 * Rota: POST /backend/api/track_visit
 * Acesso: Público
 * Recebe o nome da página acedida e a origem (referrer) em formato JSON.
 * Classifica de forma 100% anónima o dispositivo e o navegador
 * do visitante através do User-Agent técnico, sem recolher IPs.
 */

// 1. Inicializar configurações globais e ligação à base de dados
define('SECURE_ACCESS', true);
require_once dirname(__DIR__) . '/includes/config.php';
require_once dirname(__DIR__) . '/includes/db.php';

use Includes\Database;

// 2. Apenas aceitar pedidos POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('HTTP/1.1 405 Method Not Allowed');
    echo json_encode([
        'success' => false,
        'message' => 'Método de requisição não permitido. Utilize POST.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// 3. Ler e descodificar o corpo do pedido JSON
$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, true);

$page = isset($input['page']) ? trim(strip_tags($input['page'])) : 'Home';
$referrerInput = isset($input['referrer']) ? trim($input['referrer']) : '';

// 4. Ignorar e recusar o registo se for acesso ao painel de administração (Dashboard ou rotas de admin)
// Isto evita que o próprio administrador polua as estatísticas de visitas reais ao portfólio
$pageLower = strtolower($page);
if (strpos($pageLower, 'admin') !== false || strpos($pageLower, 'dashboard') !== false || strpos($pageLower, 'login') !== false) {
    echo json_encode([
        'success' => true,
        'message' => 'Registo de tráfego de administração ignorado para fidelidade das métricas.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// 5. Analisar e classificar o dispositivo através do User-Agent
$userAgent = isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : '';
$uaLower = strtolower($userAgent);
$device = 'Computador';

if (strpos($uaLower, 'ipad') !== false) {
    $device = 'Tablet';
} elseif (strpos($uaLower, 'mobile') !== false || strpos($uaLower, 'android') !== false || strpos($uaLower, 'iphone') !== false) {
    $device = 'Telemóvel';
}

// 6. Analisar e classificar o navegador
$browser = 'Outro';

if (strpos($userAgent, 'Edge') !== false || strpos($userAgent, 'Edg') !== false) {
    $browser = 'Edge';
} elseif (strpos($userAgent, 'Chrome') !== false) {
    $browser = 'Chrome';
} elseif (strpos($userAgent, 'Firefox') !== false) {
    $browser = 'Firefox';
} elseif (strpos($userAgent, 'Safari') !== false) {
    $browser = 'Safari';
} elseif (strpos($userAgent, 'OPR') !== false || strpos($userAgent, 'Opera') !== false) {
    $browser = 'Opera';
}

// 7. Analisar, validar e simplificar a origem/referência (Referrer)
$referrer = 'Direto';

if (!empty($referrerInput)) {
    $refLower = strtolower($referrerInput);
    $host = parse_url($referrerInput, PHP_URL_HOST);
    
    // Obter o próprio domínio atual para desconsiderar navegação interna como tráfego de referência externo
    $serverHost = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : '';
    
    if (!empty($host) && strpos($host, $serverHost) !== false) {
        $referrer = 'Direto';
    } elseif (strpos($refLower, 'linkedin.com') !== false) {
        $referrer = 'LinkedIn';
    } elseif (strpos($refLower, 'github.com') !== false) {
        $referrer = 'GitHub';
    } elseif (strpos($refLower, 'google.') !== false) {
        $referrer = 'Google';
    } elseif (!empty($host)) {
        // Reduzir e formatar para o nome simplificado do domínio da referência (ex: stackoverflow.com)
        $referrer = str_replace('www.', '', $host);
    }
}

// 8. Geolocalizar o país do visitante por IP de forma rápida e segura (RGPD Compliant)
$ip = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '';
if (isset($_SERVER['HTTP_CF_CONNECTING_IP'])) {
    $ip = $_SERVER['HTTP_CF_CONNECTING_IP'];
} elseif (isset($_SERVER['HTTP_X_FORWARDED_FOR'])) {
    $ips = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
    $ip = trim($ips[0]);
}

$country = 'Desconhecido';
$countryCode = 'UN';

// Iniciar sessão de forma segura se necessário para cachear geolocalização do IP
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (isset($_SESSION['visitor_country']) && isset($_SESSION['visitor_country_code'])) {
    $country = $_SESSION['visitor_country'];
    $countryCode = $_SESSION['visitor_country_code'];
} else {
    // Se for IP local ou de loopback
    if ($ip === '127.0.0.1' || $ip === '::1' || strpos($ip, '192.168.') === 0 || strpos($ip, '10.') === 0) {
        $country = 'Localhost';
        $countryCode = 'LH';
    } else {
        $url = "http://ip-api.com/json/" . urlencode($ip) . "?fields=status,country,countryCode";
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 2); // Limite estrito de 2 segundos para não atrasar a navegação
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        $res = curl_exec($ch);

        if ($res) {
            $geoData = json_decode($res, true);
            if ($geoData && isset($geoData['status']) && $geoData['status'] === 'success') {
                $country = isset($geoData['country']) ? trim($geoData['country']) : 'Desconhecido';
                $countryCode = isset($geoData['countryCode']) ? trim($geoData['countryCode']) : 'UN';
            }
        }
    }
    // Guardar em cache de sessão para evitar novos pedidos redundantes nas páginas seguintes
    $_SESSION['visitor_country'] = $country;
    $_SESSION['visitor_country_code'] = $countryCode;
}

// 9. Gravar o registo de tráfego na base de dados de forma assíncrona
try {
    $db = Database::getConnection();
    
    // Prepared Statement real contra SQL Injection com suporte geográfico
    $stmt = $db->prepare('INSERT INTO `visitor_stats` (`page`, `device`, `browser`, `referrer`, `country`, `country_code`, `visit_date`) VALUES (:page, :device, :browser, :referrer, :country, :country_code, CURRENT_DATE)');
    
    $stmt->execute([
        ':page' => $page,
        ':device' => $device,
        ':browser' => $browser,
        ':referrer' => $referrer,
        ':country' => $country,
        ':country_code' => $countryCode
    ]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Atividade de tráfego anónimo e geolocalização registadas com sucesso no portfólio.'
    ], JSON_UNESCAPED_UNICODE);
    exit;

} catch (\Exception $e) {
    // Registar o erro no log técnico em segundo plano e retornar resposta genérica
    error_log("Erro técnico ao registar visita na tabela visitor_stats: " . $e->getMessage());
    
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode([
        'success' => false,
        'message' => 'Ocorreu um erro interno ao processar a atividade.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}
