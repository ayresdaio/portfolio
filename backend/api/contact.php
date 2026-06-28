<?php
/**
 * =====================================================================
 * ENDPOINT DE SUBMISSÃO DO FORMULÁRIO DE CONTACTO PÚBLICO
 * =====================================================================
 * Rota: POST /backend/api/contact
 * Acesso: Público
 * Recebe a mensagem do visitante, regista-a na base de dados e envia
 * uma notificação imediata por e-mail ao administrador via Brevo.
 */

// 1. Inicializar configurações e base de dados
define('SECURE_ACCESS', true);
require_once dirname(__DIR__) . '/includes/config.php';
require_once dirname(__DIR__) . '/includes/db.php';
require_once dirname(__DIR__) . '/includes/email_sender.php';

use Includes\Database;
use Includes\EmailSender;

// 2. Apenas aceitar pedidos POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('HTTP/1.1 405 Method Not Allowed');
    echo json_encode(['success' => false, 'message' => 'Método não permitido.'], JSON_UNESCAPED_UNICODE);
    exit;
}

// 3. Ler e descodificar o corpo do pedido JSON
$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, true);

$name = isset($input['name']) ? trim(strip_tags($input['name'])) : '';
$email = isset($input['email']) ? trim($input['email']) : '';
$subject = isset($input['subject']) ? trim(strip_tags($input['subject'])) : '';
$message = isset($input['message']) ? trim(strip_tags($input['message'])) : '';

// 4. Validação rigorosa dos campos
if (empty($name) || empty($email) || empty($subject) || empty($message)) {
    header('HTTP/1.1 400 Bad Request');
    echo json_encode(['success' => false, 'message' => 'Por favor, preencha todos os campos do formulário.'], JSON_UNESCAPED_UNICODE);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    header('HTTP/1.1 400 Bad Request');
    echo json_encode(['success' => false, 'message' => 'Por favor, introduza um endereço de e-mail válido.'], JSON_UNESCAPED_UNICODE);
    exit;
}

if (strlen($name) > 100 || strlen($subject) > 150) {
    header('HTTP/1.1 400 Bad Request');
    echo json_encode(['success' => false, 'message' => 'Tamanho dos campos excede os limites permitidos.'], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $db = Database::getConnection();

    // 5. Inserir a mensagem na base de dados (Prepared Statement contra SQL Injection)
    $stmt = $db->prepare('INSERT INTO messages (name, email, subject, message) VALUES (:name, :email, :subject, :message)');
    $stmt->execute([
        ':name' => $name,
        ':email' => $email,
        ':subject' => $subject,
        ':message' => $message
    ]);

    // 6. Enviar e-mail de notificação ao administrador
    // Usar fallback ultra-seguro para o e-mail principal do administrador
    $adminEmail = getenv('ADMIN_EMAIL') ?: 'ayresdaioneto@gmail.com';
    $frontendUrl = defined('FRONTEND_URL') ? FRONTEND_URL : 'https://ayresdaioneto.pt';
    $adminUrl = $frontendUrl . '/admin/dashboard/';

    if ($adminEmail) {
        $emailSubject = "Novo Contacto no Portfólio: " . $subject;
        
        // Template HTML Premium de luxo escuro (Estética OLED Cyberpunk)
        $htmlBody = "
        <div style='font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0b0b0f; border: 1px solid #1f1f2e; border-radius: 20px; padding: 35px; box-shadow: 0 10px 40px rgba(0,0,0,0.6); color: #e4e4e7;'>
            <div style='border-bottom: 1px solid #1f1f2e; padding-bottom: 20px; margin-bottom: 25px;'>
                <div style='font-size: 20px; font-weight: 800; color: #3b82f6; text-transform: uppercase; letter-spacing: 2px;'>Ayres Daio Neto</div>
                <div style='font-size: 11px; color: #71717a; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px;'>Alerta do Portfólio • Novo Contacto Recebido</div>
            </div>
            
            <div style='font-size: 15px; line-height: 1.6; margin-bottom: 25px;'>
                Foi submetida uma nova mensagem de contacto no formulário público do seu portfólio. Abaixo encontram-se os detalhes técnicos do visitante:
            </div>
            
            <div style='background-color: #07070a; border: 1px solid #1f1f2e; border-radius: 12px; padding: 22px; margin-bottom: 25px; line-height: 1.6;'>
                <p style='font-size: 14px; margin: 0 0 8px 0;'><strong style='color: #ffffff;'>Nome do Visitante:</strong> " . htmlspecialchars($name, ENT_QUOTES, 'UTF-8') . "</p>
                <p style='font-size: 14px; margin: 0 0 8px 0;'><strong style='color: #ffffff;'>E-mail de Contacto:</strong> <a href='mailto:" . htmlspecialchars($email, ENT_QUOTES, 'UTF-8') . "' style='color: #3b82f6; text-decoration: none; font-weight: 600;'>" . htmlspecialchars($email, ENT_QUOTES, 'UTF-8') . "</a></p>
                <p style='font-size: 14px; margin: 0;'><strong style='color: #ffffff;'>Assunto:</strong> " . htmlspecialchars($subject, ENT_QUOTES, 'UTF-8') . "</p>
            </div>
            
            <div style='background-color: #07070a; border-left: 3px solid #3b82f6; border-radius: 4px 12px 12px 4px; padding: 20px; margin-bottom: 30px;'>
                <div style='font-size: 10px; font-weight: 700; color: #71717a; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;'>Mensagem do Visitante</div>
                <p style='font-size: 14px; color: #e4e4e7; margin: 0; white-space: pre-wrap; line-height: 1.6;'>" . nl2br(htmlspecialchars($message, ENT_QUOTES, 'UTF-8')) . "</p>
            </div>
            
            <div style='text-align: center; margin-bottom: 25px;'>
                <a href='" . htmlspecialchars($adminUrl, ENT_QUOTES, 'UTF-8') . "' style='display: inline-block; padding: 12px 24px; background: linear-gradient(to right, #3b82f6, #1d4ed8); color: #ffffff; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; text-decoration: none; border-radius: 12px; box-shadow: 0 4px 12px rgba(29,78,216,0.2);'>Aceder à Inbox do Painel</a>
            </div>
            
            <hr style='border: 0; border-top: 1px solid #1f1f2e; margin: 25px 0;'>
            
            <div style='text-align: center; font-size: 11px; color: #71717a;'>
                Recebido de forma segura no seu servidor em " . date('d/m/Y H:i:s') . ".<br>
                Portfólio de Ayres Daio Neto • <a href='{$frontendUrl}' style='color: #3b82f6; text-decoration: none;'>ayresdaioneto.pt</a>
            </div>
        </div>";

        $altBody = "Alerta do Portfólio: Novo Contacto Recebido!\n\nDe: {$name} ({$email})\nAssunto: {$subject}\n\nMensagem:\n{$message}\n\nAceda ao painel em: {$adminUrl}";

        // Enviar o email em segundo plano (tratando silenciosamente possíveis erros de SMTP para não impactar a experiência de submissão do visitante)
        EmailSender::send($adminEmail, $emailSubject, $htmlBody, $altBody);
    }

    echo json_encode([
        'success' => true,
        'message' => 'A sua mensagem foi enviada com sucesso! Entrarei em contacto consigo o mais brevemente possível.'
    ], JSON_UNESCAPED_UNICODE);
    exit;

} catch (\Exception $e) {
    error_log("Erro no contact da API: " . $e->getMessage());
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode(['success' => false, 'message' => 'Ocorreu um erro interno no servidor.'], JSON_UNESCAPED_UNICODE);
    exit;
}
