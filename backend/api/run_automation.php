<?php
/**
 * @file run_automation.php
 * @description Endpoint para executar scripts de automação Python e retornar o resultado.
 * Protegido para administradores.
 */

define('SECURE_ACCESS', true);
require_once dirname(__DIR__) . '/includes/config.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $scriptName = isset($input['script']) ? $input['script'] : '';
    $dbPin = isset($input['db_pin']) ? $input['db_pin'] : '';
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $scriptName = isset($_GET['script']) ? $_GET['script'] : '';
    $dbPin = isset($_GET['db_pin']) ? $_GET['db_pin'] : '';
} else {
    header('HTTP/1.1 405 Method Not Allowed');
    echo json_encode(['success' => false, 'message' => 'Método não permitido. Use GET ou POST.'], JSON_UNESCAPED_UNICODE);
    exit;
}

if (!isset($_SESSION['admin_logged']) || $_SESSION['admin_logged'] !== true) {
    header('HTTP/1.1 401 Unauthorized');
    echo json_encode(['success' => false, 'message' => 'Sessão expirada.'], JSON_UNESCAPED_UNICODE);
    exit;
}

// 1. Validar PIN de Segurança da Base de Dados
if (empty($dbPin)) {
    echo json_encode(['success' => false, 'message' => 'PIN de Base de Dados não fornecido.'], JSON_UNESCAPED_UNICODE);
    exit;
}

require_once dirname(__DIR__) . '/includes/db.php';

try {
    $db = \Includes\Database::getConnection();
    $userId = $_SESSION['admin_id'];
    
    $stmt = $db->prepare('SELECT db_script_pin_hash FROM users WHERE id = :id LIMIT 1');
    $stmt->execute([':id' => $userId]);
    $user = $stmt->fetch();

    if (!$user || empty($user['db_script_pin_hash'])) {
        echo json_encode(['success' => false, 'message' => 'O PIN de Scripts não foi configurado. Defina-o no seu Perfil antes de executar scripts.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if (!password_verify($dbPin, $user['db_script_pin_hash'])) {
        echo json_encode(['success' => false, 'message' => 'O PIN introduzido está incorreto. Acesso Negado.'], JSON_UNESCAPED_UNICODE);
        exit;
    }
} catch (\PDOException $e) {
    if (strpos($e->getMessage(), 'Unknown column') !== false) {
        echo json_encode(['success' => false, 'message' => 'A coluna db_script_pin_hash não existe na base de dados. Por favor corra o script de migração SQL primeiro.'], JSON_UNESCAPED_UNICODE);
    } else {
        echo json_encode(['success' => false, 'message' => 'Erro de segurança: Não foi possível validar o PIN de BD (' . $e->getMessage() . ').'], JSON_UNESCAPED_UNICODE);
    }
    exit;
}

$validScripts = [
    'backup_db' => 'backup_db.py',
    'analyze_security' => 'analyze_security.py',
    'monitor_uptime' => 'monitor_uptime.py'
];

if (!array_key_exists($scriptName, $validScripts)) {
    echo json_encode(['success' => false, 'message' => 'Script de automação inválido.'], JSON_UNESCAPED_UNICODE);
    exit;
}

$scriptsDir = dirname(__DIR__) . '/scripts';
$scriptFile = $validScripts[$scriptName];

// Mudar para a diretoria dos scripts para evitar problemas com caracteres especiais (como 'ó' em 'Portfólio') no PATH quando executado pelo Apache
chdir($scriptsDir);

// Detectar o comando Python correto consoante o sistema (Windows local vs Linux no servidor)
$pythonCmd = 'python';
if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
    // Verificar se python está no PATH do Apache
    @exec('python --version 2>&1', $out, $ret);
    if ($ret !== 0 && file_exists('C:\Program Files\Python313\python.exe')) {
        $pythonCmd = '"C:\Program Files\Python313\python.exe"';
    }
} else {
    $pythonCmd = 'python3';
}

// Executar o comando Python redirecionando o stderr para o stdout
$command = $pythonCmd . " " . escapeshellarg($scriptFile) . " 2>&1";
$output = null;

// Só tentamos rodar o shell_exec se a função estiver ativa no servidor
if (function_exists('shell_exec') && !in_array('shell_exec', explode(',', ini_get('disable_functions')))) {
    $output = @shell_exec($command);
}

// Tentar extrair o RESULT_JSON da resposta do Python
$jsonStart = $output !== null ? strpos($output, "RESULT_JSON:") : false;
$resultData = null;
$cleanOutput = $output;

if ($jsonStart !== false) {
    $jsonStr = substr($output, $jsonStart + 12);
    $resultData = json_decode(trim($jsonStr), true);
    // Limpar o RESULT_JSON do output para enviar apenas os logs à consola
    $cleanOutput = substr($output, 0, $jsonStart);
    
    // Retornar resposta de sucesso
    echo json_encode([
        'success' => true,
        'output' => $resultData,
        'raw' => trim($cleanOutput),
        'script' => $scriptName
    ], JSON_UNESCAPED_UNICODE);
    exit;
} else {
    // =========================================================================
    // FALLBACK HÍBRIDO EM PHP NATIVO
    // Se o Python falhou, não existe ou o shell_exec está desativado, o PHP resolve.
    // =========================================================================
    require_once dirname(__DIR__) . '/includes/email_sender.php';
    
    $dbHost = $_ENV['DB_HOST'] ?? $_SERVER['DB_HOST'] ?? getenv('DB_HOST') ?: 'localhost';
    $dbName = $_ENV['DB_NAME'] ?? $_SERVER['DB_NAME'] ?? getenv('DB_NAME') ?: 'portfolio';
    $adminEmail = $_ENV['ADMIN_EMAIL'] ?? $_SERVER['ADMIN_EMAIL'] ?? getenv('ADMIN_EMAIL') ?: 'admin@localhost';
    
    $fallbackRaw = "";
    $fallbackOutput = [];
    
    try {
        if ($scriptName === 'backup_db') {
            // --- Fallback do Backup de BD ---
            $fallbackRaw .= "Connecting to MySQL database $dbName at $dbHost... [NATIVE PHP FALLBACK]\n";
            $pdo = \Includes\Database::getConnection();
            
            // Obter todas as tabelas
            $stmt = $pdo->query("SHOW TABLES");
            $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
            $fallbackRaw .= "Found " . count($tables) . " tables to export.\n";
            
            $dbDump = [];
            $tableStats = [];
            
            foreach ($tables as $table) {
                // Contar registos
                $countStmt = $pdo->query("SELECT COUNT(*) as cnt FROM `$table`");
                $cnt = $countStmt->fetch(PDO::FETCH_ASSOC)['cnt'];
                $tableStats[$table] = (int)$cnt;
                
                $fallbackRaw .= " - Exporting table '$table' ($cnt records)...\n";
                
                // Exportar dados
                $dataStmt = $pdo->query("SELECT * FROM `$table`");
                $dbDump[$table] = $dataStmt->fetchAll(PDO::FETCH_ASSOC);
            }
            
            // Gerar caminhos de ficheiros
            $timestamp = date('Ymd_His');
            $jsonFilename = "backup_{$dbName}_{$timestamp}.json";
            $zipFilename = "backup_{$dbName}_{$timestamp}.zip";
            
            $backupsDir = dirname(__DIR__) . '/backups';
            if (!is_dir($backupsDir)) {
                mkdir($backupsDir, 0755, true);
            }
            
            $jsonPath = $backupsDir . '/' . $jsonFilename;
            $zipPath = $backupsDir . '/' . $zipFilename;
            
            $fallbackRaw .= "Writing database dump to temporary file: $jsonFilename...\n";
            file_put_contents($jsonPath, json_encode($dbDump, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
            
            $fileSizeKb = 0;
            if (class_exists('ZipArchive')) {
                $fallbackRaw .= "Creating ZIP archive: $zipFilename...\n";
                $zip = new \ZipArchive();
                if ($zip->open($zipPath, \ZipArchive::CREATE) === true) {
                    $zip->addFile($jsonPath, $jsonFilename);
                    $zip->close();
                    @unlink($jsonPath);
                    $fileSizeKb = round(filesize($zipPath) / 1024, 2);
                    $fallbackRaw .= "Backup completed successfully. Saved to: $zipFilename\n";
                } else {
                    $fallbackRaw .= "Aviso: Falha ao gerar o arquivo ZIP. Mantendo o ficheiro JSON de backup.\n";
                    $zipFilename = $jsonFilename;
                    $fileSizeKb = round(filesize($jsonPath) / 1024, 2);
                }
            } else {
                $fallbackRaw .= "Aviso: Extensão ZipArchive em falta. Mantendo o ficheiro JSON de backup.\n";
                $zipFilename = $jsonFilename;
                $fileSizeKb = round(filesize($jsonPath) / 1024, 2);
            }
            
            $fallbackRaw .= "Total size: $fileSizeKb KB\n";
            
            $fallbackOutput = [
                'success' => true,
                'file' => $zipFilename,
                'tables_exported' => count($tables),
                'table_stats' => $tableStats,
                'file_size_kb' => $fileSizeKb
            ];
            
        } elseif ($scriptName === 'analyze_security') {
            // --- Fallback de Análise de Segurança ---
            $fallbackRaw .= "A iniciar análise dos logs de segurança... [NATIVE PHP FALLBACK]\n";
            $fallbackRaw .= "A ligar à base de dados MySQL '$dbName' em '$dbHost'...\n";
            
            $pdo = \Includes\Database::getConnection();
            $fallbackRaw .= "Ligação estabelecida com sucesso. A ler registos da tabela 'security_logs'...\n";
            
            // Total logs
            $totalStmt = $pdo->query("SELECT COUNT(*) as cnt FROM security_logs");
            $totalLogs = $totalStmt->fetch(PDO::FETCH_ASSOC)['cnt'];
            $fallbackRaw .= "Total de registos encontrados nos logs: $totalLogs\n";
            
            // Total failed
            $failedStmt = $pdo->query("SELECT COUNT(*) as cnt FROM security_logs WHERE status = 'failed'");
            $totalFailed = (int)$failedStmt->fetch(PDO::FETCH_ASSOC)['cnt'];
            $fallbackRaw .= "Total de tentativas de login falhadas detetadas: $totalFailed\n";
            
            if ($totalFailed === 0) {
                $fallbackOutput = [
                    'success' => true,
                    'total_failed' => 0,
                    'top_ips' => [],
                    'recent_failed' => [],
                    'countries' => []
                ];
            } else {
                // Top IPs
                $topStmt = $pdo->query("SELECT ip_address as ip, country, COUNT(*) as count FROM security_logs WHERE status = 'failed' GROUP BY ip_address, country ORDER BY count DESC LIMIT 5");
                $topIps = $topStmt->fetchAll(PDO::FETCH_ASSOC);
                
                $fallbackRaw .= "\nIPs com maior volume de tentativas falhadas (Top 5):\n";
                foreach ($topIps as &$item) {
                    $item['count'] = (int)$item['count'];
                    $fallbackRaw .= " - IP: {$item['ip']} | País: {$item['country']} | Tentativas: {$item['count']}\n";
                }
                
                // Recent Failed - Mapear a coluna correta (username_attempted) para evitar o erro de coluna desconhecida (Unknown column)
                $recentStmt = $pdo->query("SELECT ip_address as ip, username_attempted as username, country, city, created_at as date FROM security_logs WHERE status = 'failed' ORDER BY created_at DESC LIMIT 5");
                $recentFailed = $recentStmt->fetchAll(PDO::FETCH_ASSOC);
                
                $fallbackRaw .= "\nTentativas de login falhadas mais recentes:\n";
                foreach ($recentFailed as $row) {
                    $fallbackRaw .= " - Data: {$row['date']} | IP: {$row['ip']} | Utilizador tentado: '{$row['username']}' | Local: {$row['city']}, {$row['country']}\n";
                }
                
                // Group by Country for dynamic graph
                $countryStmt = $pdo->query("SELECT country, COUNT(*) as count FROM security_logs WHERE status = 'failed' GROUP BY country ORDER BY count DESC");
                $countryResults = $countryStmt->fetchAll(PDO::FETCH_ASSOC);
                $countries = [];
                foreach ($countryResults as $row) {
                    $countries[$row['country']] = (int)$row['count'];
                }
                
                $fallbackRaw .= "\nA gerar dados de distribuição geográfica para o gráfico dinâmico em React...\n";
                $fallbackRaw .= "Auditoria de segurança concluída com sucesso.\n";
                
                $fallbackOutput = [
                    'success' => true,
                    'report_path' => '/backend/uploads/security_report.png',
                    'total_failed' => $totalFailed,
                    'top_ips' => $topIps,
                    'recent_failed' => $recentFailed,
                    'countries' => $countries
                ];
            }
            
        } elseif ($scriptName === 'monitor_uptime') {
            // --- Fallback de Monitor de Uptime ---
            $frontendUrl = $_ENV['FRONTEND_URL'] ?? $_SERVER['FRONTEND_URL'] ?? getenv('FRONTEND_URL') ?: 'http://localhost';
            $urlToCheck = $frontendUrl !== '*' ? $frontendUrl : 'http://localhost';
            
            $fallbackRaw .= "A iniciar teste de conectividade para a URL: $urlToCheck [NATIVE PHP FALLBACK]\n";
            
            // Fazer cURL request para verificar uptime
            $ch = curl_init($urlToCheck);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HEADER, true);
            curl_setopt($ch, CURLOPT_NOBODY, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 10);
            curl_setopt($ch, CURLOPT_USERAGENT, 'PortfolioUptimeMonitor/1.0 (PHP Fallback)');
            
            $res = curl_exec($ch);
            $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlError = curl_error($ch);
            // curl_close($ch); // Removido: Depreciado no PHP >= 8.0
            
            $fallbackRaw .= "Resposta HTTP recebida do servidor: " . ($code ?: "FALHA DE REDE") . "\n";
            
            if ($code === 200) {
                $fallbackRaw .= "Servidor está ONLINE e a responder normalmente.\n";
                $fallbackOutput = [
                    'success' => true,
                    'status' => 'online',
                    'code' => 200,
                    'url' => $urlToCheck
                ];
            } else {
                $errorMsg = $curlError ?: "HTTP Code $code";
                $fallbackRaw .= "Aviso: Servidor respondeu com código de erro ou falhou: $errorMsg.\n";
                $fallbackRaw .= "A disparar alerta de e-mail por falha de conectividade para $adminEmail...\n";
                
                $htmlBody = "<p>O seu portfólio em $urlToCheck não está a responder corretamente.</p><p>Código de estado / Erro: $errorMsg</p><p>Por favor, verifique o servidor imediatamente.</p>";
                $emailResult = \Includes\EmailSender::send(
                    $adminEmail,
                    "⚠️ ALERTA: Portfólio Offline (Fallback Status)",
                    $htmlBody
                );
                
                if ($emailResult['success']) {
                    $fallbackRaw .= "E-mail de alerta enviado com sucesso através da API Brevo.\n";
                    $emailSent = true;
                    $emailMsg = "Enviado com sucesso";
                } else {
                    $fallbackRaw .= "Erro ao enviar e-mail de alerta: " . $emailResult['message'] . "\n";
                    $emailSent = false;
                    $emailMsg = $emailResult['message'];
                }
                
                $fallbackOutput = [
                    'success' => false,
                    'status' => 'offline',
                    'code' => $code ?: 500,
                    'email_sent' => $emailSent,
                    'email_msg' => $emailMsg,
                    'url' => $urlToCheck
                ];
            }
        }
        
        // Retornar os dados simulados com sucesso do PHP Fallback
        echo json_encode([
            'success' => true,
            'output' => $fallbackOutput,
            'raw' => trim($fallbackRaw),
            'script' => $scriptName
        ], JSON_UNESCAPED_UNICODE);
        exit;
        
    } catch (\Exception $ex) {
        // Se até o fallback em PHP falhar (ex: MySQL em baixo), retornamos o erro crítico
        echo json_encode([
            'success' => false,
            'message' => 'Erro crítico no Fallback do PHP: ' . $ex->getMessage(),
            'raw' => "PHP FALLBACK CRITICAL ERROR:\n" . $ex->getMessage() . "\n" . $ex->getTraceAsString(),
            'script' => $scriptName
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
}
