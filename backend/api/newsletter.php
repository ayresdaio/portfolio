<?php
/**
 * =====================================================================
 * ENDPOINT PÚBLICO DO FORMULÁRIO DE NEWSLETTER (INTEGRAÇÃO BREVO API v3)
 * =====================================================================
 * Rota: POST /backend/api/newsletter
 * Acesso: Público
 * Recebe o e-mail do visitante e adiciona-o automaticamente à lista de
 * subscrição de e-mails da Brevo (ex-Sendinblue) de forma segura.
 */

// 1. Inicializar configurações globais e segurança
define('SECURE_ACCESS', true);
require_once dirname(__DIR__) . '/includes/config.php';
require_once dirname(__DIR__) . '/includes/brevo_config.php';

// Configurar cabeçalhos CORS e formato JSON em Português de Portugal
header('Content-Type: application/json; charset=utf-8');

// 2. Aceitar exclusivamente pedidos POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('HTTP/1.1 405 Method Not Allowed');
    echo json_encode(['success' => false, 'message' => 'Método não permitido.'], JSON_UNESCAPED_UNICODE);
    exit;
}

// 3. Obter e higienizar os dados do pedido (JSON)
$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);
$email = isset($data['email']) ? trim(filter_var($data['email'], FILTER_SANITIZE_EMAIL)) : '';

// 4. Validar robustamente o e-mail recebido
if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    header('HTTP/1.1 400 Bad Request');
    echo json_encode(['success' => false, 'message' => 'Por favor, introduza um endereço de e-mail válido.'], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    // 5. Configurar as credenciais da Brevo com Fallback Seguro
    // Lê preferencialmente do .env (BREVO_API_KEY) ou usa a chave SMTP do Relay (SMTP_PASS)
    $apiKey = getenv('BREVO_API_KEY') ?: (defined('SMTP_PASS') ? SMTP_PASS : '');
    
    // ID da lista da Newsletter (Lê do .env ou usa o padrão 2 configurado no brevo_config)
    $listId = getenv('BREVO_LIST_ID') ? (int)getenv('BREVO_LIST_ID') : (defined('BREVO_LIST_ID') ? BREVO_LIST_ID : 2);

    if (empty($apiKey)) {
        error_log("Erro na Newsletter: Chave da API Brevo não configurada.");
        header('HTTP/1.1 500 Internal Server Error');
        echo json_encode(['success' => false, 'message' => 'Ocorreu um erro interno de configuração do servidor.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // 6. Preparar o corpo do pedido REST para a Brevo v3 API
    // Adiciona o e-mail à lista específica e atualiza se o utilizador já existir (updateEnabled = true)
    $payload = [
        'email' => $email,
        'listIds' => [$listId],
        'updateEnabled' => true
    ];

    // Inicializar ligação cURL
    $ch = curl_init('https://api.brevo.com/v3/contacts');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_TIMEOUT, 15); // Timeout de 15 segundos para evitar bloqueios na VPS
    curl_setopt($ch, CURLOPT_IPRESOLVE, CURL_IPRESOLVE_V4); // Forçar IPv4 para evitar bloqueios de segurança da Brevo
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'api-key: ' . $apiKey,
        'Content-Type: application/json',
        'Accept: application/json'
    ]);

    // Executar pedido HTTP REST
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    // Nota: A chamada curl_close() é depreciada no PHP 8.5+ e redundante desde o PHP 8.0,
    // sendo a libertação do objeto CurlHandle efetuada de forma implícita e automática.

    // 7. Tratar potenciais falhas de rede no cURL
    if ($curlError) {
        error_log("Erro cURL na Brevo Newsletter: " . $curlError);
        header('HTTP/1.1 500 Internal Server Error');
        echo json_encode(['success' => false, 'message' => 'Não foi possível estabelecer ligação ao servidor de e-mail.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Processar resposta em JSON da API
    $resData = json_decode($response, true);

    // 8. Tratar os códigos HTTP retornados pela Brevo
    if ($httpCode >= 200 && $httpCode < 300) {
        // Sucesso absoluto (Contacto adicionado ou atualizado com êxito)
        echo json_encode([
            'success' => true,
            'message' => 'Subscrição efetuada com sucesso! Bem-vindo à nossa newsletter técnica.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    } else {
        // Ocorreu um erro vindo da Brevo
        $brevoMsg = isset($resData['message']) ? $resData['message'] : '';
        $brevoCode = isset($resData['code']) ? $resData['code'] : '';
        
        error_log("Erro na API da Brevo ($httpCode): $response");

        // Tratamento especial de contactos já existentes que possam estar bloqueados/blacklist
        if (strpos(strtolower($brevoMsg), 'blacklisted') !== false || $brevoCode === 'contact_blacklisted') {
            header('HTTP/1.1 400 Bad Request');
            echo json_encode(['success' => false, 'message' => 'Este e-mail encontra-se na lista de exclusão ou foi desativado.'], JSON_UNESCAPED_UNICODE);
        } elseif ($brevoCode === 'contact_already_exist') {
            // Caso especial se a Brevo não atualizar automaticamente (Fallback amigável)
            echo json_encode([
                'success' => true,
                'message' => 'O seu e-mail já se encontra registado na nossa newsletter!'
            ], JSON_UNESCAPED_UNICODE);
        } else {
            header('HTTP/1.1 400 Bad Request');
            echo json_encode(['success' => false, 'message' => 'Incapaz de registar a subscrição de momento. Tente mais tarde.'], JSON_UNESCAPED_UNICODE);
        }
        exit;
    }

} catch (\Exception $e) {
    error_log("Exceção na api/newsletter: " . $e->getMessage());
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode(['success' => false, 'message' => 'Ocorreu um erro interno ao processar a subscrição.'], JSON_UNESCAPED_UNICODE);
    exit;
}
