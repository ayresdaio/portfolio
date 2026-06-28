<?php
/**
 * =====================================================================
 * ENDPOINT DE LOGIN DO ADMINISTRADOR
 * =====================================================================
 * Rota: POST /backend/api/login
 * Acesso: Público
 * Recebe o username/email e a password em formato JSON, valida na base
 * de dados e inicia uma sessão PHP segura com cookies HTTPOnly e Secure.
 */

// 1. Inicializar configurações globais e segurança
define('SECURE_ACCESS', true);
require_once dirname(__DIR__) . '/includes/config.php';
require_once dirname(__DIR__) . '/includes/db.php';
require_once dirname(__DIR__) . '/includes/email_sender.php';

use Includes\Database;
use Includes\EmailSender;

/**
 * Obtém o IP real do cliente, tratando proxies e cabeçalhos CDN.
 */
function getClientIp() {
    // 1. Privilegiar cabeçalhos seguros de CDN conhecidos (ex: Cloudflare)
    if (!empty($_SERVER['HTTP_CF_CONNECTING_IP'])) {
        return $_SERVER['HTTP_CF_CONNECTING_IP'];
    }
    
    // 2. Confiar no endereço de ligação físico real
    $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
    
    // 3. Fallback controlado para X-Forwarded-For apenas se o IP físico for uma rede privada/proxy local (ex: InfinityFree local proxy)
    if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) === false) {
        if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $ips = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
            $forwarded = trim(end($ips));
            if (filter_var($forwarded, FILTER_VALIDATE_IP)) {
                return $forwarded;
            }
        }
    }
    
    return $ip;
}

/**
 * Consulta a geolocalização do IP utilizando a API ip-api.com.
 */
function getIpLocation($ip) {
    if (in_array($ip, ['127.0.0.1', '::1'])) {
        return ['country' => 'Localhost', 'city' => 'Localhost'];
    }
    
    $url = "http://ip-api.com/json/" . urlencode($ip);
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 2); // 2 segundos de timeout
    $response = curl_exec($ch);
    curl_close($ch);
    
    if ($response) {
        $data = json_decode($response, true);
        if (isset($data['status']) && $data['status'] === 'success') {
            return [
                'country' => $data['country'] ?? 'Desconhecido',
                'city' => $data['city'] ?? 'Desconhecido'
            ];
        }
    }
    
    return ['country' => 'Desconhecido', 'city' => 'Desconhecido'];
}

// 2. Apenas aceitar pedidos POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('HTTP/1.1 405 Method Not Allowed');
    echo json_encode(['success' => false, 'message' => 'Método não permitido. Utilize POST.'], JSON_UNESCAPED_UNICODE);
    exit;
}

// 3. Ler e descodificar o corpo do pedido JSON
$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, true);

$usernameOrEmail = isset($input['usernameOrEmail']) ? trim($input['usernameOrEmail']) : '';
$password = isset($input['password']) ? $input['password'] : '';

// 4. Validação básica de campos
if (empty($usernameOrEmail) || empty($password)) {
    header('HTTP/1.1 400 Bad Request');
    echo json_encode(['success' => false, 'message' => 'Por favor, preencha todos os campos obrigatórios.'], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $db = Database::getConnection();
    
    $clientIp = getClientIp();
    $location = getIpLocation($clientIp);

    // 5. Procurar o utilizador por username ou email (Prepared Statements contra SQL Injection)
    $stmt = $db->prepare('SELECT id, username, email, password_hash, security_key_hash, login_attempts, lockout_until FROM users WHERE username = :query1 OR email = :query2 LIMIT 1');
    $stmt->execute([':query1' => $usernameOrEmail, ':query2' => $usernameOrEmail]);
    $user = $stmt->fetch();

    if ($user) {
        $userId = $user['id'];
        
        // Verificar se a conta está bloqueada temporariamente (desativado apenas em ambiente local SQLite de testes/desenvolvimento)
        $isSqlite = ($db->getAttribute(PDO::ATTR_DRIVER_NAME) === 'sqlite');
        $envMode = $_ENV['ENVIRONMENT'] ?? $_SERVER['ENVIRONMENT'] ?? getenv('ENVIRONMENT') ?? 'development';
        $isTesting = ($envMode === 'testing' || $envMode === 'development');
        if (!empty($user['lockout_until']) && !($isSqlite && $isTesting)) {
            $lockoutTime = strtotime($user['lockout_until']);
            $currentTime = time();
            
            if ($lockoutTime > $currentTime) {
                // Registar tentativa de login na conta que se encontra bloqueada
                $logStmt = $db->prepare('INSERT INTO security_logs (username_attempted, ip_address, country, city, status) VALUES (:user, :ip, :country, :city, :status)');
                $logStmt->execute([
                    ':user' => $usernameOrEmail,
                    ':ip' => $clientIp,
                    ':country' => $location['country'],
                    ':city' => $location['city'],
                    ':status' => 'blocked'
                ]);

                $timeLeft = ceil(($lockoutTime - $currentTime) / 60); // Em minutos
                header('HTTP/1.1 403 Forbidden');
                echo json_encode([
                    'success' => false, 
                    'message' => "Esta conta foi temporariamente bloqueada devido a excesso de tentativas falhadas. Por favor, aguarde mais {$timeLeft} minuto(s)."
                ], JSON_UNESCAPED_UNICODE);
                exit;
            } else {
                // O bloqueio já expirou. Repor tentativas
                $resetStmt = $db->prepare('UPDATE users SET login_attempts = 0, lockout_until = NULL WHERE id = :id');
                $resetStmt->execute([':id' => $userId]);
                $user['login_attempts'] = 0;
            }
        }

        $loginFailed = false;
        $failureReason = '';

        // 6. Verificar se a password está correta
        if (password_verify($password, $user['password_hash'])) {
            
            // Validar a chave de segurança caso a mesma esteja definida na base de dados
            if (!empty($user['security_key_hash'])) {
                $securityKey = isset($input['securityKey']) ? trim($input['securityKey']) : '';
                if (empty($securityKey) || !password_verify($securityKey, $user['security_key_hash'])) {
                    $loginFailed = true;
                    $failureReason = 'Chave de segurança incorreta ou em falta.';
                }
            }
        } else {
            $loginFailed = true;
            $failureReason = 'Credenciais de acesso incorretas. Tente novamente.';
        }

        if ($loginFailed) {
            $newAttempts = $user['login_attempts'] + 1;
            
            // Se for SQLite em ambiente local (desenvolvimento/testes), permitimos tentativas ilimitadas
            $isSqlite = ($db->getAttribute(PDO::ATTR_DRIVER_NAME) === 'sqlite');
            $envMode = $_ENV['ENVIRONMENT'] ?? $_SERVER['ENVIRONMENT'] ?? getenv('ENVIRONMENT') ?? 'development';
            $isTesting = ($envMode === 'testing' || $envMode === 'development');
            $maxAttempts = ($isSqlite && $isTesting) ? 999999 : 3;
            
            if ($newAttempts >= $maxAttempts) {
                // Bloquear por 15 minutos
                $lockoutUntil = date('Y-m-d H:i:s', time() + (15 * 60));
                $updateStmt = $db->prepare('UPDATE users SET login_attempts = :attempts, lockout_until = :lockout WHERE id = :id');
                $updateStmt->execute([
                    ':attempts' => $newAttempts,
                    ':lockout' => $lockoutUntil,
                    ':id' => $userId
                ]);
                
                // Registar lockout nos logs
                $logStmt = $db->prepare('INSERT INTO security_logs (username_attempted, ip_address, country, city, status) VALUES (:user, :ip, :country, :city, :status)');
                $logStmt->execute([
                    ':user' => $usernameOrEmail,
                    ':ip' => $clientIp,
                    ':country' => $location['country'],
                    ':city' => $location['city'],
                    ':status' => 'blocked'
                ]);
                
                header('HTTP/1.1 403 Forbidden');
                echo json_encode([
                    'success' => false,
                    'message' => 'Conta bloqueada! Foram efetuadas ' . $maxAttempts . ' tentativas falhadas. O acesso foi suspenso por 15 minutos.'
                ], JSON_UNESCAPED_UNICODE);
                exit;
            } else {
                // Atualizar tentativas
                $updateStmt = $db->prepare('UPDATE users SET login_attempts = :attempts WHERE id = :id');
                $updateStmt->execute([
                    ':attempts' => $newAttempts,
                    ':id' => $userId
                ]);
                
                // Registar falha normal nos logs
                $logStmt = $db->prepare('INSERT INTO security_logs (username_attempted, ip_address, country, city, status) VALUES (:user, :ip, :country, :city, :status)');
                $logStmt->execute([
                    ':user' => $usernameOrEmail,
                    ':ip' => $clientIp,
                    ':country' => $location['country'],
                    ':city' => $location['city'],
                    ':status' => 'failed'
                ]);
                
                // Na 2ª tentativa falhada, disparar email de alerta ao admin
                if ($newAttempts === 2) {
                    $adminEmail = $user['email'] ?: 'ayresdaioneto@gmail.com';
                    $subject = "ALERTA URGENTE: Tentativa de Login Suspeita no Portfólio";
                    
                    $dateTimeStr = date('d/m/Y H:i:s');
                    $ipStr = htmlspecialchars($clientIp, ENT_QUOTES, 'UTF-8');
                    $countryStr = htmlspecialchars($location['country'], ENT_QUOTES, 'UTF-8');
                    $cityStr = htmlspecialchars($location['city'], ENT_QUOTES, 'UTF-8');
                    
                    $htmlBody = "
                    <div style='font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0d0d12; border: 1px solid #dc2626; border-radius: 20px; padding: 35px; box-shadow: 0 10px 40px rgba(0,0,0,0.6); color: #e4e4e7;'>
                        <div style='border-bottom: 1px solid #1f1f2e; padding-bottom: 20px; margin-bottom: 25px;'>
                            <div style='font-size: 20px; font-weight: 800; color: #dc2626; text-transform: uppercase; letter-spacing: 2px;'>ALERTA DE SEGURANÇA</div>
                            <div style='font-size: 11px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px;'>Portfólio de Ayres Daio Neto • Atividade Suspeita</div>
                        </div>
                        
                        <div style='font-size: 15px; line-height: 1.6; margin-bottom: 25px;'>
                            Detetámos <strong>duas tentativas falhadas consecutivas</strong> de início de sessão na sua conta de administrador. 
                            <br><span style='color: #ef4444; font-weight: 600;'>Aviso: Se ocorrer mais uma tentativa incorreta, a conta será bloqueada durante 15 minutos.</span>
                        </div>
                        
                        <div style='background-color: #07070a; border: 1px solid #1f1f2e; border-radius: 12px; padding: 22px; margin-bottom: 25px; line-height: 1.6;'>
                            <p style='font-size: 14px; margin: 0 0 8px 0;'><strong style='color: #ffffff;'>Endereço IP:</strong> {$ipStr}</p>
                            <p style='font-size: 14px; margin: 0 0 8px 0;'><strong style='color: #ffffff;'>País:</strong> {$countryStr}</p>
                            <p style='font-size: 14px; margin: 0 0 8px 0;'><strong style='color: #ffffff;'>Cidade:</strong> {$cityStr}</p>
                            <p style='font-size: 14px; margin: 0;'><strong style='color: #ffffff;'>Data e Hora:</strong> {$dateTimeStr}</p>
                        </div>
                        
                        <div style='background-color: #1a1010; border-left: 3px solid #dc2626; border-radius: 4px 12px 12px 4px; padding: 20px; margin-bottom: 30px;'>
                            <p style='font-size: 13px; color: #fca5a5; margin: 0; line-height: 1.6;'>
                                Se esta atividade não foi iniciada por si, recomendamos que altere a sua palavra-passe e a sua chave de segurança imediatamente após recuperar o acesso.
                            </p>
                        </div>
                        
                        <hr style='border: 0; border-top: 1px solid #1f1f2e; margin: 25px 0;'>
                        
                        <div style='text-align: center; font-size: 11px; color: #71717a;'>
                            Alerta gerado automaticamente pelo servidor em {$dateTimeStr}.
                        </div>
                    </div>";
                    
                    $altBody = "ALERTA DE SEGURANÇA: 2 tentativas consecutivas falhadas de login no seu portfólio.\n\nIP: {$clientIp}\nPaís: {$location['country']}\nCidade: {$location['city']}\nHora: {$dateTimeStr}\n\nSe não reconhece esta atividade, altere as suas credenciais.";
                    
                    EmailSender::send($adminEmail, $subject, $htmlBody, $altBody);
                }
                
                $attemptsLeft = 3 - $newAttempts;
                header('HTTP/1.1 401 Unauthorized');
                echo json_encode([
                    'success' => false,
                    'message' => $failureReason . " Resta(m) {$attemptsLeft} tentativa(s) antes do bloqueio da conta."
                ], JSON_UNESCAPED_UNICODE);
                exit;
            }
        }

        // Login com sucesso: repor tentativas e lockout
        $resetStmt = $db->prepare('UPDATE users SET login_attempts = 0, lockout_until = NULL WHERE id = :id');
        $resetStmt->execute([':id' => $userId]);

        // Registar login bem-sucedido nos logs
        $logStmt = $db->prepare('INSERT INTO security_logs (username_attempted, ip_address, country, city, status) VALUES (:user, :ip, :country, :city, :status)');
        $logStmt->execute([
            ':user' => $usernameOrEmail,
            ':ip' => $clientIp,
            ':country' => $location['country'],
            ':city' => $location['city'],
            ':status' => 'success'
        ]);

        // Renovar o ID da sessão para mitigar ataques de Session Fixation
        session_regenerate_id(true);

        // Definir variáveis de sessão seguras no servidor
        $_SESSION['admin_logged'] = true;
        $_SESSION['admin_id'] = $user['id'];
        $_SESSION['admin_user'] = $user['username'];
        $_SESSION['last_activity'] = time();

        echo json_encode([
            'success' => true,
            'message' => 'Autenticação bem-sucedida! A aceder ao painel...',
            'user' => [
                'username' => $user['username'],
                'email' => $user['email']
            ]
        ], JSON_UNESCAPED_UNICODE);
        exit;
    } else {
        // Falha genérica se utilizador não existe: registar nos logs por segurança
        $logStmt = $db->prepare('INSERT INTO security_logs (username_attempted, ip_address, country, city, status) VALUES (:user, :ip, :country, :city, :status)');
        $logStmt->execute([
            ':user' => $usernameOrEmail,
            ':ip' => $clientIp,
            ':country' => $location['country'],
            ':city' => $location['city'],
            ':status' => 'failed'
        ]);

        header('HTTP/1.1 401 Unauthorized');
        echo json_encode(['success' => false, 'message' => 'Credenciais de acesso incorretas. Tente novamente.'], JSON_UNESCAPED_UNICODE);
        exit;
    }
} catch (\Exception $e) {
    error_log("Erro no login da API: " . $e->getMessage());
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode(['success' => false, 'message' => 'Ocorreu um erro interno no servidor.'], JSON_UNESCAPED_UNICODE);
    exit;
}
