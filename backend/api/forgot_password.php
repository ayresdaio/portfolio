<?php
/**
 * =====================================================================
 * ENDPOINT DE SOLICITAÇÃO DE RECUPERAÇÃO DE PALAVRA-PASSE
 * =====================================================================
 * Rota: POST /backend/api/forgot_password
 * Acesso: Público
 * Recebe o e-mail do utilizador administrador, gera um token seguro, 
 * guarda na base de dados e dispara um e-mail via PHPMailer + Brevo.
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

$email = isset($input['email']) ? trim($input['email']) : '';

// 4. Validação básica de campo
if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    header('HTTP/1.1 400 Bad Request');
    echo json_encode(['success' => false, 'message' => 'Por favor, insira um endereço de e-mail válido.'], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $db = Database::getConnection();

    // 5. Verificar se o e-mail pertence ao administrador
    $stmt = $db->prepare('SELECT id, username FROM users WHERE email = :email LIMIT 1');
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch();

    // Mensagem de resposta genérica (Padrão de segurança estrito: evita que atacantes adivinhem e-mails registados)
    $successResponse = [
        'success' => true,
        'message' => 'Se o endereço de e-mail inserido corresponder a uma conta de administrador, receberá um link seguro para redefinir a sua palavra-passe em breves minutos.'
    ];

    if ($user) {
        // O e-mail existe na base de dados! Vamos processar a recuperação

        // 6. Eliminar tokens de recuperação anteriores deste e-mail para evitar acumulação na base de dados
        $deleteStmt = $db->prepare('DELETE FROM password_resets WHERE email = :email');
        $deleteStmt->execute([':email' => $email]);

        // 7. Gerar um token seguro criptograficamente (64 caracteres hexadecimais)
        $tokenBytes = random_bytes(32);
        $token = bin2hex($tokenBytes);

        // 8. Definir validade de 1 hora
        $expiresAt = date('Y-m-d H:i:s', strtotime('+1 hour'));

        // 9. Guardar o token na tabela password_resets
        $insertStmt = $db->prepare('INSERT INTO password_resets (email, token, expires_at) VALUES (:email, :token, :expires_at)');
        $insertStmt->execute([
            ':email' => $email,
            ':token' => $token,
            ':expires_at' => $expiresAt
        ]);

        // 10. Construir o link de redefinição com HTTPS forçado
        $protocol = 'https://';
        $host = $_SERVER['HTTP_HOST'];
        // O frontend Next.js estará hospedado na raiz, a rota de reset do admin será /admin/reset
        $resetLink = $protocol . $host . "/admin/reset?token=" . $token;

        // 11. Elaborar o corpo do e-mail com design premium (HTML)
        $subject = "Recuperação de Palavra-passe - Portfólio";
        $htmlBody = "
        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;'>
            <div style='text-align: center; border-bottom: 2px solid #3b82f6; padding-bottom: 15px;'>
                <h2 style='color: #1e3a8a; margin: 0;'>Portfólio Profissional</h2>
            </div>
            <div style='padding: 20px 0;'>
                <p style='font-size: 16px; color: #334155;'>Olá, <strong>" . htmlspecialchars($user['username']) . "</strong>,</p>
                <p style='font-size: 14px; color: #475569; line-height: 1.6;'>
                    Recebemos um pedido de recuperação de palavra-passe para a sua conta de administração do portfólio. Se não efetuou esta solicitação, pode ignorar este e-mail em total segurança.
                </p>
                <p style='font-size: 14px; color: #475569; line-height: 1.6;'>
                    Para redefinir a sua palavra-passe, clique no botão azul abaixo. Este link tem uma <strong>validade de 1 hora</strong>.
                </p>
                <div style='text-align: center; margin: 30px 0;'>
                    <a href='{$resetLink}' style='background-color: #3b82f6; color: #ffffff; padding: 12px 24px; font-weight: bold; text-decoration: none; border-radius: 6px; display: inline-block; font-size: 14px;'>Redefinir Palavra-passe</a>
                </div>
                <p style='font-size: 12px; color: #64748b;'>
                    Se tiver dificuldades com o botão, copie e cole o seguinte link no seu browser:<br>
                    <a href='{$resetLink}' style='color: #3b82f6;'>{$resetLink}</a>
                </p>
            </div>
            <div style='border-top: 1px solid #e2e8f0; padding-top: 15px; text-align: center; font-size: 12px; color: #94a3b8;'>
                <p style='margin: 0;'>© " . date('Y') . " Portfólio Ayres. Envio automático via Brevo.</p>
            </div>
        </div>";

        // Texto alternativo sem formatação HTML
        $altBody = "Olá " . $user['username'] . ",\n\nRecebemos um pedido de recuperação de palavra-passe. Para redefinir, aceda ao seguinte link:\n{$resetLink}\n\nEste link é válido por 1 hora.";

        // 12. Disparar o e-mail de forma segura
        $emailResult = EmailSender::send($email, $subject, $htmlBody, $altBody);

        if (!$emailResult['success']) {
            // Em caso de falha no envio de email no Brevo, registar o erro mas não expor chaves ao utilizador
            error_log("Erro ao enviar email de recuperação: " . $emailResult['message']);
            header('HTTP/1.1 500 Internal Server Error');
            echo json_encode(['success' => false, 'message' => 'Ocorreu um erro ao processar o envio do e-mail. Por favor, tente novamente mais tarde.'], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }

    // Retornar a resposta bem-sucedida genérica (tendo ou não enviado, para evitar enumeração de contas)
    echo json_encode($successResponse, JSON_UNESCAPED_UNICODE);
    exit;
} catch (\Exception $e) {
    error_log("Erro no forgot_password da API: " . $e->getMessage());
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode(['success' => false, 'message' => 'Ocorreu um erro interno no servidor.'], JSON_UNESCAPED_UNICODE);
    exit;
}
