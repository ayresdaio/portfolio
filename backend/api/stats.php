<?php
/**
 * =====================================================================
 * ENDPOINT DE ESTATÍSTICAS E TRÁFEGO (RESTRICTED TO ADMIN)
 * =====================================================================
 * Rota: GET /backend/api/stats
 * Acesso: Privado (Apenas Administrador com sessão ativa)
 * Compila e devolve todas as consultas agregadas de visitas à base
 * de dados para desenhar gráficos OLED reativos no Dashboard.
 */

// 1. Inicializar configurações globais e ligação à base de dados
define('SECURE_ACCESS', true);
require_once dirname(__DIR__) . '/includes/config.php';
require_once dirname(__DIR__) . '/includes/db.php';

use Includes\Database;

// 2. Apenas aceitar pedidos GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    header('HTTP/1.1 405 Method Not Allowed');
    echo json_encode([
        'success' => false,
        'message' => 'Método de requisição não permitido. Utilize GET.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// 3. Proteger a rota: Validar se o administrador está devidamente autenticado
if (!isset($_SESSION['admin_logged']) || $_SESSION['admin_logged'] !== true) {
    header('HTTP/1.1 401 Unauthorized');
    echo json_encode([
        'success' => false,
        'message' => 'Acesso não autorizado. Por favor, inicie sessão.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// 4. Controlo de inatividade (A sessão expira após 2 horas)
$timeout_duration = 7200;
if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] > $timeout_duration)) {
    session_unset();
    session_destroy();
    header('HTTP/1.1 401 Unauthorized');
    echo json_encode([
        'success' => false,
        'message' => 'A sua sessão expirou por inatividade. Volte a autenticar-se.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}
$_SESSION['last_activity'] = time(); // Atualizar última atividade da sessão

try {
    // Obter e validar o período solicitado (padrão 7 dias)
    $range = isset($_GET['range']) ? trim($_GET['range']) : '7';
    if (!in_array($range, ['7', '30', '90'])) {
        $range = '7';
    }
    $daysInterval = (int) $range;

    // Inicialização preventiva defensiva para silenciar queixas de linter do PHP
    $referrersData = [];

    $db = Database::getConnection();
    
    // =================================================================
    // A. OBTENÇÃO DE KPIS GLOBAIS E DO PERÍODO
    // =================================================================
    
    // 1. Visitas Totais (Acumulado histórico)
    $totalStmt = $db->query('SELECT COUNT(*) FROM `visitor_stats`');
    $totalVisits = (int) $totalStmt->fetchColumn();
    
    // 2. Visitas no Período Selecionado
    $periodStmt = $db->prepare('SELECT COUNT(*) FROM `visitor_stats` WHERE `visit_date` >= DATE_SUB(CURRENT_DATE(), INTERVAL :days DAY)');
    $periodStmt->bindValue(':days', $daysInterval - 1, \PDO::PARAM_INT);
    $periodStmt->execute();
    $periodVisits = (int) $periodStmt->fetchColumn();
    
    // 3. Visitas de Hoje
    $todayStmt = $db->query('SELECT COUNT(*) FROM `visitor_stats` WHERE `visit_date` = CURRENT_DATE()');
    $todayVisits = (int) $todayStmt->fetchColumn();
    
    // 4. Média Diária no Período Selecionado
    $dailyAverage = round($periodVisits / $daysInterval, 1);
    
    // 5. Total de Subscritores Ativos na Newsletter (Integração Brevo API v3)
    $newsletterSubscribers = 0;
    try {
        // Carrega a chave de API Brevo da variável de ambiente ou utiliza a constante SMTP_PASS como fallback
        $apiKey = getenv('BREVO_API_KEY') ?: (defined('SMTP_PASS') ? SMTP_PASS : '');
        // ID da lista da newsletter (definido no ficheiro brevo_config.php ou lido das variáveis de ambiente)
        $listId = getenv('BREVO_LIST_ID') ? (int)getenv('BREVO_LIST_ID') : (defined('BREVO_LIST_ID') ? BREVO_LIST_ID : 2);
        
        if (!empty($apiKey)) {
            // Inicializa chamada cURL segura à API v3 da Brevo para ler detalhes da lista
            $ch = curl_init("https://api.brevo.com/v3/contacts/lists/" . $listId);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 5); // Timeout defensivo curto para evitar atrasar o painel geral
            curl_setopt($ch, CURLOPT_IPRESOLVE, CURL_IPRESOLVE_V4);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'api-key: ' . $apiKey,
                'Content-Type: application/json',
                'Accept: application/json'
            ]);
            
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlError = curl_error($ch);
            
            if (!$curlError && $httpCode >= 200 && $httpCode < 300) {
                $listInfo = json_decode($response, true);
                if (isset($listInfo['uniqueSubscribers'])) {
                    // Guarda o número real de contactos únicos subscritos na lista
                    $newsletterSubscribers = (int)$listInfo['uniqueSubscribers'];
                }
            } else {
                error_log("Erro de integração Brevo no stats.php (HTTP $httpCode): " . ($curlError ?: $response));
            }
        }
    } catch (\Exception $e) {
        error_log("Exceção ao ligar à Brevo no stats.php: " . $e->getMessage());
    }
    
    // =================================================================
    // B. OBTENÇÃO DE ATIVIDADE DIÁRIA NO PERÍODO SELECIONADO
    // =================================================================
    // Preparamos uma lista estática com as datas do período com contagem 0
    // Isto garante que o gráfico no frontend renderize todos os dias sem saltos
    $activityData = [];
    for ($i = $daysInterval - 1; $i >= 0; $i--) {
        $dateStr = date('Y-m-d', strtotime("-$i days"));
        $activityData[$dateStr] = [
            'date' => date('d/m', strtotime($dateStr)),
            'visits' => 0
        ];
    }
    
    $activityStmt = $db->prepare('
        SELECT `visit_date`, COUNT(*) AS `visits` 
        FROM `visitor_stats` 
        WHERE `visit_date` >= DATE_SUB(CURRENT_DATE(), INTERVAL :days DAY) 
        GROUP BY `visit_date` 
        ORDER BY `visit_date` ASC
    ');
    $activityStmt->bindValue(':days', $daysInterval - 1, \PDO::PARAM_INT);
    $activityStmt->execute();
    
    while ($row = $activityStmt->fetch()) {
        $dateStr = $row['visit_date'];
        if (isset($activityData[$dateStr])) {
            $activityData[$dateStr]['visits'] = (int) $row['visits'];
        }
    }
    
    // =================================================================
    // C. PÁGINAS MAIS ACEDIDAS NO PERÍODO (LIMIT 10)
    // =================================================================
    $pagesStmt = $db->prepare('
        SELECT `page`, COUNT(*) AS `visits` 
        FROM `visitor_stats` 
        WHERE `visit_date` >= DATE_SUB(CURRENT_DATE(), INTERVAL :days DAY)
        GROUP BY `page` 
        ORDER BY `visits` DESC 
        LIMIT 10
    ');
    $pagesStmt->bindValue(':days', $daysInterval - 1, \PDO::PARAM_INT);
    $pagesStmt->execute();
    $pagesData = $pagesStmt->fetchAll();
    
    // =================================================================
    // D. DISTRIBUIÇÃO POR DISPOSITIVO NO PERÍODO
    // =================================================================
    $devicesStmt = $db->prepare('
        SELECT `device`, COUNT(*) AS `visits` 
        FROM `visitor_stats` 
        WHERE `visit_date` >= DATE_SUB(CURRENT_DATE(), INTERVAL :days DAY)
        GROUP BY `device` 
        ORDER BY `visits` DESC
    ');
    $devicesStmt->bindValue(':days', $daysInterval - 1, \PDO::PARAM_INT);
    $devicesStmt->execute();
    $devicesData = $devicesStmt->fetchAll();
    
    // =================================================================
    // E. DISTRIBUIÇÃO POR NAVEGADOR NO PERÍODO
    // =================================================================
    $browsersStmt = $db->prepare('
        SELECT `browser`, COUNT(*) AS `visits` 
        FROM `visitor_stats` 
        WHERE `visit_date` >= DATE_SUB(CURRENT_DATE(), INTERVAL :days DAY)
        GROUP BY `browser` 
        ORDER BY `visits` DESC
    ');
    $browsersStmt->bindValue(':days', $daysInterval - 1, \PDO::PARAM_INT);
    $browsersStmt->execute();
    $browsersData = $browsersStmt->fetchAll();
    
    // =================================================================
    // F. ORIGEM DO TRÁFEGO NO PERÍODO (LIMIT 5)
    // =================================================================
    $referrersStmt = $db->prepare('
        SELECT `referrer`, COUNT(*) AS `visits` 
        FROM `visitor_stats` 
        WHERE `visit_date` >= DATE_SUB(CURRENT_DATE(), INTERVAL :days DAY)
        GROUP BY `referrer` 
        ORDER BY `visits` DESC 
        LIMIT 5
    ');
    $referrersStmt->bindValue(':days', $daysInterval - 1, \PDO::PARAM_INT);
    $referrersStmt->execute();
    $referrersData = $referrersStmt->fetchAll();
    // =================================================================
    // G. DISTRIBUIÇÃO GEOGRÁFICA POR PAÍS NO PERÍODO
    // =================================================================
    $countriesStmt = $db->prepare('
        SELECT IFNULL(`country`, "Desconhecido") AS `country`, IFNULL(`country_code`, "UN") AS `country_code`, COUNT(*) AS `visits` 
        FROM `visitor_stats` 
        WHERE `visit_date` >= DATE_SUB(CURRENT_DATE(), INTERVAL :days DAY)
        GROUP BY `country`, `country_code` 
        ORDER BY `visits` DESC
    ');
    $countriesStmt->bindValue(':days', $daysInterval - 1, \PDO::PARAM_INT);
    $countriesStmt->execute();
    $countriesData = $countriesStmt->fetchAll();
    
    // Retornar dados estruturados com as chaves apropriadas, incluindo os subscritores da newsletter
    echo json_encode([
        'success' => true,
        'kpis' => [
            'totalVisits' => $totalVisits,
            'periodVisits' => $periodVisits,
            'todayVisits' => $todayVisits,
            'dailyAverage' => $dailyAverage,
            'newsletterSubscribers' => $newsletterSubscribers
        ],
        'activity' => array_values($activityData),
        'popularPages' => $pagesData,
        'devices' => $devicesData,
        'browsers' => $browsersData,
        'referrers' => $referrersData,
        'countries' => $countriesData
    ], JSON_UNESCAPED_UNICODE);
    exit;

} catch (\Exception $e) {
    error_log("Erro técnico crítico ao compilar estatísticas de tráfego: " . $e->getMessage());
    
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode([
        'success' => false,
        'message' => 'Ocorreu um erro interno no servidor ao tentar ler as métricas.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}
